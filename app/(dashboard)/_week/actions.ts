'use server';

import { db } from '@/db';
import { scheduleBlocks, gymSessions, weeklyFocus, weeklyFocusGoals, reflections } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function upsertScheduleBlock(date: string, hour: number, label: string) {
  const existing = await db
    .select()
    .from(scheduleBlocks)
    .where(and(eq(scheduleBlocks.date, date), eq(scheduleBlocks.hour, hour)));

  if (existing.length) {
    await db
      .update(scheduleBlocks)
      .set({ label, updatedAt: new Date() })
      .where(and(eq(scheduleBlocks.date, date), eq(scheduleBlocks.hour, hour)));
  } else if (label.trim()) {
    await db.insert(scheduleBlocks).values({ date, hour, label });
  }
  revalidatePath('/');
}

export async function toggleGymDay(date: string, attended: boolean) {
  if (attended) {
    await db.delete(gymSessions).where(eq(gymSessions.date, date));
  } else {
    await db.insert(gymSessions).values({ date }).onConflictDoNothing();
  }
  revalidatePath('/');
  revalidatePath('/quarter');
}

export async function saveWeeklyFocusTitle(weekStart: string, title: string) {
  const [existing] = await db.select().from(weeklyFocus).where(eq(weeklyFocus.weekStart, weekStart));
  if (existing) {
    await db.update(weeklyFocus).set({ title, updatedAt: new Date() }).where(eq(weeklyFocus.weekStart, weekStart));
  } else {
    await db.insert(weeklyFocus).values({ weekStart, title });
  }
  revalidatePath('/');
}

export async function addFocusGoal(weekStart: string, title: string) {
  if (!title.trim()) return;
  const existing = await db.select().from(weeklyFocusGoals).where(eq(weeklyFocusGoals.weekStart, weekStart));
  await db.insert(weeklyFocusGoals).values({ weekStart, title: title.trim(), sortOrder: existing.length });
  revalidatePath('/');
}

export async function toggleFocusGoal(id: number, completed: boolean) {
  await db.update(weeklyFocusGoals).set({ completed: !completed }).where(eq(weeklyFocusGoals.id, id));
  revalidatePath('/');
}

export async function deleteFocusGoal(id: number) {
  await db.delete(weeklyFocusGoals).where(eq(weeklyFocusGoals.id, id));
  revalidatePath('/');
}

export async function saveReflection(weekStart: string, content: string) {
  const [existing] = await db.select().from(reflections).where(eq(reflections.weekStart, weekStart));
  if (existing) {
    await db.update(reflections).set({ content, updatedAt: new Date() }).where(eq(reflections.weekStart, weekStart));
  } else {
    await db.insert(reflections).values({ weekStart, content });
  }
  revalidatePath('/');
}

export async function fetchTodayCalendarEvents(date: string) {
  const { googleOAuthTokens, calendarEvents } = await import('@/db/schema');
  const { db } = await import('@/db');
  const { fetchCalendarEvents, refreshAccessToken } = await import('@/lib/google-calendar');
  const { eq } = await import('drizzle-orm');

  try {
    const [token] = await db.select().from(googleOAuthTokens);
    if (!token) return [];

    if (new Date() > token.expiresAt) {
      const { access_token, expires_in } = await refreshAccessToken(token.refreshToken);
      await db
        .update(googleOAuthTokens)
        .set({ accessToken: access_token, expiresAt: new Date(Date.now() + expires_in * 1000) })
        .where(eq(googleOAuthTokens.id, token.id));
    }

    const events = await fetchCalendarEvents(token.accessToken, date);
    return events;
  } catch (err) {
    console.error('Failed to fetch calendar events:', err);
    return [];
  }
}
