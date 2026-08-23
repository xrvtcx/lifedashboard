'use server';

import { db } from '@/db';
import { financeAccounts, quarterlyGoals, achievements, parkingLot } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

type AccountType = 'credit_card' | 'savings' | 'checking' | 'investment' | 'loan' | 'other';
type GoalCategory = 'finance' | 'health' | 'business' | 'personal';

// ---- finance accounts (balances) ----
export async function createFinanceAccount(formData: FormData) {
  const context = String(formData.get('context') || 'personal') as 'personal' | 'business';
  const name = String(formData.get('name') || '').trim();
  if (!name) return;
  const accountType = String(formData.get('accountType') || 'checking') as AccountType;
  const balance = String(formData.get('balance') || '0');

  await db.insert(financeAccounts).values({ context, name, accountType, balance });
  revalidatePath('/quarter');
}

export async function updateFinanceAccountBalance(id: number, balance: string) {
  await db.update(financeAccounts).set({ balance, updatedAt: new Date() }).where(eq(financeAccounts.id, id));
  revalidatePath('/quarter');
}

export async function deleteFinanceAccount(id: number) {
  await db.delete(financeAccounts).where(eq(financeAccounts.id, id));
  revalidatePath('/quarter');
}

// ---- quarterly goals ----
export async function createQuarterlyGoal(formData: FormData) {
  const quarter = String(formData.get('quarter') || '');
  const category = String(formData.get('category') || 'personal') as GoalCategory;
  const title = String(formData.get('title') || '').trim();
  if (!title || !quarter) return;
  const targetRaw = String(formData.get('targetValue') || '');
  const currentRaw = String(formData.get('currentValue') || '');

  await db.insert(quarterlyGoals).values({
    quarter,
    category,
    title,
    targetValue: targetRaw || null,
    currentValue: currentRaw || null,
  });
  revalidatePath('/quarter');
}

export async function updateQuarterlyGoalProgress(id: number, progress: number) {
  const clamped = Math.max(0, Math.min(100, progress));
  await db
    .update(quarterlyGoals)
    .set({ progress: clamped, status: clamped >= 100 ? 'completed' : 'active', updatedAt: new Date() })
    .where(eq(quarterlyGoals.id, id));
  revalidatePath('/quarter');
}

export async function updateQuarterlyGoalValue(id: number, currentValue: string) {
  await db.update(quarterlyGoals).set({ currentValue, updatedAt: new Date() }).where(eq(quarterlyGoals.id, id));
  revalidatePath('/quarter');
}

export async function deleteQuarterlyGoal(id: number) {
  await db.delete(quarterlyGoals).where(eq(quarterlyGoals.id, id));
  revalidatePath('/quarter');
}

// ---- achievements ----
export async function createAchievement(formData: FormData) {
  const quarter = String(formData.get('quarter') || '');
  const title = String(formData.get('title') || '').trim();
  if (!title || !quarter) return;
  const description = String(formData.get('description') || '');
  const achievedOn = String(formData.get('achievedOn') || '') || null;

  await db.insert(achievements).values({ quarter, title, description, achievedOn });
  revalidatePath('/quarter');
}

export async function deleteAchievement(id: number) {
  await db.delete(achievements).where(eq(achievements.id, id));
  revalidatePath('/quarter');
}

// ---- parking lot ----
export async function createParkingLotItem(formData: FormData) {
  const quarter = String(formData.get('quarter') || '');
  const title = String(formData.get('title') || '').trim();
  if (!title || !quarter) return;
  const notes = String(formData.get('notes') || '');

  await db.insert(parkingLot).values({ quarter, title, notes });
  revalidatePath('/quarter');
}

export async function deleteParkingLotItem(id: number) {
  await db.delete(parkingLot).where(eq(parkingLot.id, id));
  revalidatePath('/quarter');
}
