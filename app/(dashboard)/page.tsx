import { db } from '@/db';
import { tasks, scheduleBlocks, gymSessions, weeklyFocus, weeklyFocusGoals, reflections, sideQuests, googleOAuthTokens } from '@/db/schema';
import { and, eq, gte, lte, inArray } from 'drizzle-orm';
import { startOfWeek, addWeeks, weekDates as computeWeekDates, toISODate } from '@/lib/week';
import { fetchWeekEvents, refreshAccessToken } from '@/lib/google-calendar';
import { WeekView } from './_week/week-view';

export const dynamic = 'force-dynamic';

export default async function HomePage({
  searchParams,
}: {
  searchParams: { week?: string; success?: string; error?: string };
}) {
  const requestedStart = searchParams.week ? new Date(`${searchParams.week}T00:00:00`) : new Date();
  const weekStart = startOfWeek(requestedStart);
  const weekStartISO = toISODate(weekStart);
  const days = computeWeekDates(weekStart);
  const rangeStart = new Date(`${days[0]}T00:00:00`);
  const rangeEnd = new Date(`${days[6]}T23:59:59`);

  const [weekTasks, blocks, sessions, focusRows, focusGoalRows, reflectionRows, activeQuests, [token]] = await Promise.all([
    db.select().from(tasks).where(and(gte(tasks.dueDate, rangeStart), lte(tasks.dueDate, rangeEnd))),
    db.select().from(scheduleBlocks).where(inArray(scheduleBlocks.date, days)),
    db.select().from(gymSessions).where(inArray(gymSessions.date, days)),
    db.select().from(weeklyFocus).where(eq(weeklyFocus.weekStart, weekStartISO)),
    db.select().from(weeklyFocusGoals).where(eq(weeklyFocusGoals.weekStart, weekStartISO)),
    db.select().from(reflections).where(eq(reflections.weekStart, weekStartISO)),
    db.select().from(sideQuests).where(eq(sideQuests.status, 'active')),
    db.select().from(googleOAuthTokens),
  ]);

  // Fetch calendar events across every calendar the account can see (not
  // just the primary one — shared/secondary calendars included), tracking
  // status so failures are visible on the page instead of only in logs.
  let calendarEventsByDay: Record<string, Array<{ id: string; hour: number; startTime: string; endTime: string; title: string; description?: string; calendarName?: string; color?: string }>> = {};
  let calendarStatus: { connected: boolean; eventCount: number; fetchError?: string } = {
    connected: !!token,
    eventCount: 0,
  };

  if (token) {
    try {
      let accessToken = token.accessToken;
      if (new Date() > token.expiresAt) {
        const { access_token, expires_in } = await refreshAccessToken(token.refreshToken);
        accessToken = access_token;
        await db
          .update(googleOAuthTokens)
          .set({ accessToken: access_token, expiresAt: new Date(Date.now() + expires_in * 1000) });
      }

      calendarEventsByDay = await fetchWeekEvents(accessToken, days[0], days[6]);
      calendarStatus.eventCount = Object.values(calendarEventsByDay).reduce((sum, evts) => sum + evts.length, 0);
    } catch (err) {
      console.error('Calendar fetch error:', err);
      calendarStatus.fetchError = err instanceof Error ? err.message : 'Unknown error';
    }
  }

  const prevWeekISO = toISODate(addWeeks(weekStart, -1));
  const nextWeekISO = toISODate(addWeeks(weekStart, 1));
  const isCurrentWeek = weekStartISO === toISODate(startOfWeek(new Date()));

  return (
    <WeekView
      weekStart={weekStart}
      weekDates={days}
      isCurrentWeek={isCurrentWeek}
      prevHref={`/?week=${prevWeekISO}`}
      nextHref={`/?week=${nextWeekISO}`}
      todayHref="/"
      tasks={weekTasks}
      blocks={blocks}
      sessions={sessions}
      focusTitle={focusRows[0]?.title ?? ''}
      focusGoals={focusGoalRows}
      reflectionContent={reflectionRows[0]?.content ?? ''}
      activeQuests={activeQuests}
      calendarEventsByDay={calendarEventsByDay}
      calendarStatus={calendarStatus}
      oauthSuccess={searchParams.success}
      oauthError={searchParams.error}
    />
  );
}
