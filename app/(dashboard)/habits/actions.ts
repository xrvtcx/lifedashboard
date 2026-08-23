'use server';

import { db } from '@/db';
import { habits, habitLogs } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function toggleHabitDay(habitId: number, date: string, isChecked: boolean) {
  if (isChecked) {
    await db.delete(habitLogs).where(and(eq(habitLogs.habitId, habitId), eq(habitLogs.date, date)));
  } else {
    await db.insert(habitLogs).values({ habitId, date }).onConflictDoNothing();
  }
  revalidatePath('/habits');
  revalidatePath('/');
}

export async function createHabit(formData: FormData) {
  const name = String(formData.get('name') || '').trim();
  if (!name) return;

  const section = String(formData.get('section') || 'daily') as 'daily' | 'devotional';
  const icon = String(formData.get('icon') || 'Star');
  const color = String(formData.get('color') || '#2F5D50');
  const weeklyGoal = Math.max(1, Math.min(7, Number(formData.get('weeklyGoal')) || 7));

  const existing = await db.select().from(habits).where(eq(habits.section, section));

  await db.insert(habits).values({ name, section, icon, color, weeklyGoal, sortOrder: existing.length });
  revalidatePath('/habits');
  revalidatePath('/');
}

export async function updateHabit(
  id: number,
  data: { name: string; section: 'daily' | 'devotional'; icon: string; color: string; weeklyGoal: number }
) {
  await db
    .update(habits)
    .set({
      name: data.name,
      section: data.section,
      icon: data.icon,
      color: data.color,
      weeklyGoal: Math.max(1, Math.min(7, data.weeklyGoal)),
    })
    .where(eq(habits.id, id));
  revalidatePath('/habits');
  revalidatePath('/');
}

export async function deleteHabit(id: number) {
  await db.delete(habits).where(eq(habits.id, id));
  revalidatePath('/habits');
  revalidatePath('/');
}

export async function moveHabit(id: number, direction: 'up' | 'down') {
  const [habit] = await db.select().from(habits).where(eq(habits.id, id));
  if (!habit) return;

  const siblings = await db
    .select()
    .from(habits)
    .where(eq(habits.section, habit.section))
    .orderBy(asc(habits.sortOrder), asc(habits.id));

  const idx = siblings.findIndex((h) => h.id === id);
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (idx === -1 || swapIdx < 0 || swapIdx >= siblings.length) return;

  const other = siblings[swapIdx];
  await db.update(habits).set({ sortOrder: other.sortOrder }).where(eq(habits.id, habit.id));
  await db.update(habits).set({ sortOrder: habit.sortOrder }).where(eq(habits.id, other.id));

  revalidatePath('/habits');
}
