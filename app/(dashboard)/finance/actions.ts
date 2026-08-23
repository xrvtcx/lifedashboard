'use server';

import { db } from '@/db';
import { transactions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function createTransaction(formData: FormData) {
  const context = String(formData.get('context') || 'personal') as 'personal' | 'business';
  const type = String(formData.get('type') || 'expense') as 'income' | 'expense';
  const amount = String(formData.get('amount') || '0');
  const category = String(formData.get('category') || '').trim() || 'General';
  const description = String(formData.get('description') || '');
  const date = String(formData.get('date') || new Date().toISOString().slice(0, 10));

  if (!amount || Number(amount) <= 0) return;

  await db.insert(transactions).values({ context, type, amount, category, description, date });
  revalidatePath('/finance');
  revalidatePath('/');
}

export async function deleteTransaction(id: number) {
  await db.delete(transactions).where(eq(transactions.id, id));
  revalidatePath('/finance');
  revalidatePath('/');
}
