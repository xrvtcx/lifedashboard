import { db } from '@/db';
import { notes } from '@/db/schema';
import { createNote } from './actions';
import { NotesBoard } from './notes-board';
import { Card, SectionLabel } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function NotesPage() {
  const allNotes = await db.select().from(notes);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Notes</h1>
        <p className="text-ink/60 text-sm mt-1">Jot it down before it's gone.</p>
      </div>

      <Card>
        <SectionLabel>New note</SectionLabel>
        <form action={createNote} className="space-y-3">
          <input
            name="title"
            placeholder="Title"
            className="w-full bg-transparent border border-slate rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-ledger"
          />
          <textarea
            name="content"
            placeholder="Write something…"
            rows={3}
            className="w-full bg-transparent border border-slate rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-ledger"
          />
          <button
            type="submit"
            className="bg-ink text-chalk px-4 py-2 rounded-sm text-sm font-medium hover:bg-ledgerdark transition-colors"
          >
            Save note
          </button>
        </form>
      </Card>

      <NotesBoard notes={allNotes} />
    </div>
  );
}
