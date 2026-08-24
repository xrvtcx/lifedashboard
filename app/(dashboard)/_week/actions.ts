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

export async function saveWorkout(date: string, slot: 'am' | 'pm', text: string) {
  const value = text.trim() || null;
  const [existing] = await db.select().from(gymSessions).where(eq(gymSessions.date, date));

  if (existing) {
    await db
      .update(gymSessions)
      .set(slot === 'am' ? { amWorkout: value } : { pmWorkout: value })
      .where(eq(gymSessions.date, date));
  } else if (value) {
    // Writing a workout for an unmarked day implicitly marks it attended.
    await db
      .insert(gymSessions)
      .values(slot === 'am' ? { date, amWorkout: value } : { date, pmWorkout: value })
      .onConflictDoNothing();
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
