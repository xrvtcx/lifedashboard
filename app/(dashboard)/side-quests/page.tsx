import { db } from '@/db';
import { sideQuests } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { createSideQuest } from './actions';
import { SideQuestList } from './side-quest-list';
import { Card, SectionLabel } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function SideQuestsPage() {
  const allQuests = await db.select().from(sideQuests).orderBy(desc(sideQuests.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Side Quests</h1>
        <p className="text-ink/60 text-sm mt-1">Certifications, exams, books, and everything else on the side.</p>
      </div>

      <Card>
        <SectionLabel>New side quest</SectionLabel>
        <form action={createSideQuest} className="flex flex-col sm:flex-row gap-3">
          <input
            name="title"
            placeholder="e.g. Pilates Teacher Certification"
            required
            className="flex-1 bg-transparent border border-slate rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-ledger"
          />
          <select name="category" defaultValue="hobby" className="bg-transparent border border-slate rounded-sm px-3 py-2 text-sm">
            <option value="reading">Reading</option>
            <option value="studying">Studying</option>
            <option value="hobby">Hobby</option>
            <option value="certification">Certification</option>
            <option value="exam">Exam</option>
            <option value="other">Other</option>
          </select>
          <button
            type="submit"
            className="bg-ink text-chalk px-4 py-2 rounded-sm text-sm font-medium hover:bg-ledgerdark transition-colors"
          >
            Add
          </button>
        </form>
      </Card>

      <SideQuestList quests={allQuests} />
    </div>
  );
}
