import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import {
  googleOAuthTokens,
  tasks,
  weeklyFocus,
  weeklyFocusGoals,
  smsBriefingMappings,
} from '@/db/schema';
import { and, eq, gte, lte } from 'drizzle-orm';
import { fetchDayEvents, refreshAccessToken } from '@/lib/google-calendar';
import { sendSMS } from '@/lib/twilio';
import { getWeatherBrief } from '@/lib/weather';
import { toISODate, startOfWeek } from '@/lib/week';

export async function POST(req: NextRequest) {
  // Simple auth: expect a header with a secret
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.BRIEFING_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const today = toISODate(new Date());
    const toNumber = process.env.TWILIO_TO_PHONE_NUMBER || '';

    // Fetch Google Calendar events
    let calendarEventLines = '';
    const [token] = await db.select().from(googleOAuthTokens);
    if (token) {
      try {
        if (new Date() > token.expiresAt) {
          const { access_token, expires_in } = await refreshAccessToken(token.refreshToken);
          await db.update(googleOAuthTokens).set({ accessToken: access_token, expiresAt: new Date(Date.now() + expires_in * 1000) });
        }
        const events = await fetchDayEvents(token.accessToken, today);
        if (events.length > 0) {
          calendarEventLines = events.map((e) => `${e.startTime} - ${e.title}`).join('\n');
        }
      } catch (err) {
        console.error('Calendar fetch error:', err);
      }
    }

    // Fetch today's open tasks
    const todayStart = new Date(today);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const todayTasks = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.status, 'todo'), gte(tasks.dueDate, todayStart), lte(tasks.dueDate, todayEnd)));

    // Build task number mapping for SMS replies
    const taskMap: Record<string, number> = {};
    const taskLines = todayTasks.map((t, i) => {
      const num = (i + 1).toString();
      taskMap[num] = t.id;
      return `${num}. ${t.title} (${t.priority})`;
    });

    // Fetch this week's focus
    const weekStart = startOfWeek(new Date());
    const weekStartISO = toISODate(weekStart);
    const [focus] = await db.select().from(weeklyFocus).where(eq(weeklyFocus.weekStart, weekStartISO));
    const focusGoals = await db.select().from(weeklyFocusGoals).where(eq(weeklyFocusGoals.weekStart, weekStartISO));

    // Format the briefing
    let briefing = `Good morning! Here's your brief for ${today}\n\n`;

    if (focus?.title) {
      briefing += `FOCUS: ${focus.title}\n`;
      focusGoals.forEach((g) => {
        briefing += `  ${g.completed ? '✓' : '→'} ${g.title}\n`;
      });
      briefing += '\n';
    }

    if (taskLines.length > 0) {
      briefing += `TASKS:\n${taskLines.join('\n')}\n\n`;
    }

    if (calendarEventLines) {
      briefing += `TODAY:\n${calendarEventLines}\n\n`;
    }

    const weather = await getWeatherBrief();
    briefing += `WEATHER: ${weather}\n\n`;
    briefing += `Reply with task numbers to check off (e.g., "1" or "1,3")`;

    // Save the mapping for SMS replies
    await db.delete(smsBriefingMappings).where(eq(smsBriefingMappings.date, today));
    await db.insert(smsBriefingMappings).values({ date: today, taskMappings: JSON.stringify(taskMap) });

    // Send the SMS
    await sendSMS(toNumber, briefing);

    return NextResponse.json({ success: true, message: 'Briefing sent' });
  } catch (err) {
    console.error('Briefing error:', err);
    return NextResponse.json({ error: 'Failed to send briefing' }, { status: 500 });
  }
}
