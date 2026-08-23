'use server';

import { db } from '@/db';
import { tasks } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function createTask(formData: FormData) {
  const title = String(formData.get('title') || '').trim();
  if (!title) return;

  const priority = String(formData.get('priority') || 'medium') as 'low' | 'medium' | 'high';
  const dueDateRaw = String(formData.get('dueDate') || '');

  await db.insert(tasks).values({
    title,
    priority,
    dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
  });

  revalidatePath('/tasks');
  revalidatePath('/');
}

export async function updateTaskStatus(id: number, status: 'todo' | 'in_progress' | 'done') {
  await db.update(tasks).set({ status, updatedAt: new Date() }).where(eq(tasks.id, id));
  revalidatePath('/tasks');
  revalidatePath('/');
}

export async function deleteTask(id: number) {
  await db.delete(tasks).where(eq(tasks.id, id));
  revalidatePath('/tasks');
  revalidatePath('/');
}
