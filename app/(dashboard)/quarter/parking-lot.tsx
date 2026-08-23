'use client';

import { useState } from 'react';
import { createParkingLotItem, deleteParkingLotItem } from './actions';
import { Card } from '@/components/ui';

type Item = { id: number; title: string; notes: string | null; quarter: string };

export function ParkingLot({ quarter, items }: { quarter: string; items: Item[] }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  async function submit() {
    if (!title.trim()) return;
    const fd = new FormData();
    fd.set('quarter', quarter);
    fd.set('title', title.trim());
    fd.set('notes', notes);
    await createParkingLotItem(fd);
    setTitle('');
    setNotes('');
    setOpen(false);
  }

  return (
    <Card className="space-y-2">
      {items.length === 0 && <p className="text-sm text-ink/40 text-center py-4">Nothing parked yet.</p>}
      {items.map((it) => (
        <div key={it.id} className="flex items-start justify-between gap-2 py-1.5 border-b border-slate/50 last:border-0">
          <div className="min-w-0">
            <p className="text-sm">{it.title}</p>
            {it.notes && <p className="text-xs text-ink/50 mt-0.5">{it.notes}</p>}
            <p className="text-xs text-ink/30 font-mono mt-0.5">captured {it.quarter}</p>
          </div>
          <button onClick={() => deleteParkingLotItem(it.id)} className="text-xs text-ink/30 hover:text-rust shrink-0">
            ✕
          </button>
        </div>
      ))}

      {open ? (
        <div className="space-y-2 pt-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Idea"
            className="w-full bg-transparent border border-slate rounded-sm px-2 py-1.5 text-sm focus:outline-none focus:border-ledger"
          />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            rows={2}
            className="w-full bg-transparent border border-slate rounded-sm px-2 py-1.5 text-sm"
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setOpen(false)} className="text-xs text-ink/50">
              Cancel
            </button>
            <button onClick={submit} className="text-xs bg-ink text-chalk px-3 py-1.5 rounded-sm">
              Park it
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="text-xs text-ledger hover:underline">
          + Add idea
        </button>
      )}
    </Card>
  );
}
