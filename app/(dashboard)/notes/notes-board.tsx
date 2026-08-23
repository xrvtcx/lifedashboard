'use client';

import { useState } from 'react';
import { updateNote, togglePin, deleteNote } from './actions';
import { Card, Stamp } from '@/components/ui';

type Note = { id: number; title: string; content: string; pinned: boolean; updatedAt: Date };

function NoteCard({ note }: { note: Note }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  if (editing) {
    return (
      <Card className="space-y-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-transparent border-b border-slate text-sm font-medium focus:outline-none pb-1"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          className="w-full bg-transparent border border-slate rounded-sm p-2 text-sm focus:outline-none focus:border-ledger"
        />
        <div className="flex gap-2 justify-end">
          <button onClick={() => setEditing(false)} className="text-xs text-ink/50">
            Cancel
          </button>
          <button
            onClick={async () => {
              await updateNote(note.id, title, content);
              setEditing(false);
            }}
            className="text-xs bg-ink text-chalk px-3 py-1 rounded-sm"
          >
            Save
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium">{note.title}</p>
        {note.pinned && <Stamp tone="ochre">pinned</Stamp>}
      </div>
      <p className="text-sm text-ink/70 whitespace-pre-wrap line-clamp-6">{note.content}</p>
      <div className="flex gap-3 text-xs text-ink/40 pt-1">
        <button onClick={() => setEditing(true)} className="hover:text-ink">
          Edit
        </button>
        <button onClick={() => togglePin(note.id, note.pinned)} className="hover:text-ochre">
          {note.pinned ? 'Unpin' : 'Pin'}
        </button>
        <button onClick={() => deleteNote(note.id)} className="hover:text-rust ml-auto">
          Remove
        </button>
      </div>
    </Card>
  );
}

export function NotesBoard({ notes }: { notes: Note[] }) {
  const sorted = [...notes].sort(
    (a, b) => Number(b.pinned) - Number(a.pinned) || +new Date(b.updatedAt) - +new Date(a.updatedAt)
  );

  if (sorted.length === 0) {
    return <Card className="text-sm text-ink/50 text-center py-8">No notes yet. Write one above.</Card>;
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {sorted.map((n) => (
        <NoteCard key={n.id} note={n} />
      ))}
    </div>
  );
}
