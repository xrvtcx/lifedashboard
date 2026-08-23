'use server';

import { db } from '@/db';
import { notes } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function createNote(formData: FormData) {
  const title = String(formData.get('title') || '').trim() || 'Untitled';
  const content = String(formData.get('content') || '');

  await db.insert(notes).values({ title, content });
  revalidatePath('/notes');
  revalidatePath('/');
}

export async function updateNote(id: number, title: string, content: string) {
  await db
    .update(notes)
    .set({ title: title.trim() || 'Untitled', content, updatedAt: new Date() })
    .where(eq(notes.id, id));
  revalidatePath('/notes');
}

export async function togglePin(id: number, pinned: boolean) {
  await db.update(notes).set({ pinned: !pinned, updatedAt: new Date() }).where(eq(notes.id, id));
  revalidatePath('/notes');
  revalidatePath('/');
}

export async function deleteNote(id: number) {
  await db.delete(notes).where(eq(notes.id, id));
  revalidatePath('/notes');
  revalidatePath('/');
}
