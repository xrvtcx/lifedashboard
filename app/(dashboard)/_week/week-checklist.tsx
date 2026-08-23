'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { createTask, updateTaskStatus, deleteTask } from '../tasks/actions';
import { Card, Stamp } from '@/components/ui';
import { celebrate } from '@/lib/celebrate';

type Task = {
  id: number;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: Date | null;
};

function AddItem({ defaultDate }: { defaultDate: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');

  async function submit() {
    if (!title.trim()) return;
    const fd = new FormData();
    fd.set('title', title.trim());
    fd.set('priority', 'medium');
    fd.set('dueDate', defaultDate);
    await createTask(fd);
    setTitle('');
    setOpen(false);
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs text-ledger hover:underline pt-1">
        + Add item
      </button>
    );
  }

  return (
    <div className="flex gap-2 pt-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        autoFocus
        placeholder="Add to this week\u2026"
        className="flex-1 bg-transparent border border-slate rounded-sm px-2 py-1.5 text-sm focus:outline-none focus:border-ledger"
      />
      <button onClick={submit} className="text-xs bg-ink text-chalk px-3 py-1.5 rounded-sm">
        Add
      </button>
      <button onClick={() => setOpen(false)} className="text-xs text-ink/50">
        Cancel
      </button>
    </div>
  );
}

export function WeekChecklist({ tasks, weekDates }: { tasks: Task[]; weekDates: string[] }) {
  const sorted = [...tasks].sort((a, b) => {
    if (a.status === 'done' && b.status !== 'done') return 1;
    if (b.status === 'done' && a.status !== 'done') return -1;
    const aTime = a.dueDate ? +new Date(a.dueDate) : Infinity;
    const bTime = b.dueDate ? +new Date(b.dueDate) : Infinity;
    return aTime - bTime;
  });

  return (
    <Card className="space-y-1">
      {sorted.length === 0 && (
        <p className="text-sm text-ink/40 text-center py-4">Nothing on the checklist this week yet.</p>
      )}
      {sorted.map((t) => (
        <div key={t.id} className="flex items-center gap-3 py-1.5 border-b border-slate/50 last:border-0">
          <input
            type="checkbox"
            checked={t.status === 'done'}
            onChange={() => {
              if (t.status !== 'done') celebrate();
              updateTaskStatus(t.id, t.status === 'done' ? 'todo' : 'done');
            }}
            className="h-4 w-4 accent-[#2F5D50] shrink-0"
          />
          <span className={clsx('text-sm flex-1 min-w-0 truncate', t.status === 'done' && 'line-through text-ink/40')}>
            {t.title}
          </span>
          <Stamp tone={t.priority === 'high' ? 'rust' : t.priority === 'medium' ? 'ochre' : 'ink'}>{t.priority}</Stamp>
          {t.dueDate && (
            <span className="text-xs font-mono text-ink/50 shrink-0">
              {new Date(t.dueDate).toLocaleDateString('en-US', { weekday: 'short' })}
            </span>
          )}
          <button onClick={() => deleteTask(t.id)} className="text-xs text-ink/30 hover:text-rust shrink-0">
            ✕
          </button>
        </div>
      ))}
      <AddItem defaultDate={weekDates[0]} />
    </Card>
  );
}
