'use server';

import { db } from '@/db';
import { sideQuests } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

type Category = 'reading' | 'studying' | 'hobby' | 'certification' | 'exam' | 'other';

export async function createSideQuest(formData: FormData) {
  const title = String(formData.get('title') || '').trim();
  if (!title) return;
  const category = String(formData.get('category') || 'other') as Category;

  await db.insert(sideQuests).values({ title, category });
  revalidatePath('/side-quests');
  revalidatePath('/');
}

export async function updateSideQuestProgress(id: number, progress: number) {
  const clamped = Math.max(0, Math.min(100, progress));
  await db
    .update(sideQuests)
    .set({ progress: clamped, status: clamped >= 100 ? 'completed' : 'active', updatedAt: new Date() })
    .where(eq(sideQuests.id, id));
  revalidatePath('/side-quests');
  revalidatePath('/');
}

export async function toggleSideQuestStatus(id: number, status: 'active' | 'completed') {
  await db
    .update(sideQuests)
    .set({ status: status === 'active' ? 'completed' : 'active', updatedAt: new Date() })
    .where(eq(sideQuests.id, id));
  revalidatePath('/side-quests');
  revalidatePath('/');
}

export async function deleteSideQuest(id: number) {
  await db.delete(sideQuests).where(eq(sideQuests.id, id));
  revalidatePath('/side-quests');
  revalidatePath('/');
}
