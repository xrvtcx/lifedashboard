'use client';

import { useState } from 'react';
import { createAchievement, deleteAchievement } from './actions';
import { Card } from '@/components/ui';

type Achievement = { id: number; title: string; description: string | null; achievedOn: string | null };

export function Achievements({ quarter, achievements }: { quarter: string; achievements: Achievement[] }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');

  async function submit() {
    if (!title.trim()) return;
    const fd = new FormData();
    fd.set('quarter', quarter);
    fd.set('title', title.trim());
    fd.set('achievedOn', date);
    await createAchievement(fd);
    setTitle('');
    setDate('');
    setOpen(false);
  }

  return (
    <Card className="space-y-2">
      {achievements.length === 0 && <p className="text-sm text-ink/40 text-center py-4">No achievements logged yet.</p>}
      {achievements.map((a) => (
        <div key={a.id} className="flex items-center justify-between gap-2 py-1.5 border-b border-slate/50 last:border-0">
          <div className="min-w-0">
            <p className="text-sm truncate">{a.title}</p>
            {a.achievedOn && (
              <p className="text-xs text-ink/50 font-mono">
                {new Date(`${a.achievedOn}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            )}
          </div>
          <button onClick={() => deleteAchievement(a.id)} className="text-xs text-ink/30 hover:text-rust shrink-0">
            ✕
          </button>
        </div>
      ))}

      {open ? (
        <div className="space-y-2 pt-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What did you achieve?"
            className="w-full bg-transparent border border-slate rounded-sm px-2 py-1.5 text-sm focus:outline-none focus:border-ledger"
          />
          <input
            value={date}
            onChange={(e) => setDate(e.target.value)}
            type="date"
            className="w-full bg-transparent border border-slate rounded-sm px-2 py-1.5 text-sm"
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setOpen(false)} className="text-xs text-ink/50">
              Cancel
            </button>
            <button onClick={submit} className="text-xs bg-ink text-chalk px-3 py-1.5 rounded-sm">
              Log it
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="text-xs text-ledger hover:underline">
          + Log achievement
        </button>
      )}
    </Card>
  );
}
