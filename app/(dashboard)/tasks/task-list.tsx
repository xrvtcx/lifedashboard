'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { updateTaskStatus, deleteTask } from './actions';
import { Card, Stamp } from '@/components/ui';

type Task = {
  id: number;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: Date | null;
};

const filters = ['all', 'todo', 'in_progress', 'done'] as const;

export function TaskList({ tasks }: { tasks: Task[] }) {
  const [filter, setFilter] = useState<(typeof filters)[number]>('all');
  const visible = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-3">
      <div className="flex gap-2 text-xs uppercase tracking-wide">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              'px-3 py-1 rounded-sm border',
              filter === f ? 'bg-ink text-chalk border-ink' : 'border-slate text-ink/60 hover:border-ink'
            )}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {visible.length === 0 && (
        <Card className="text-sm text-ink/50 text-center py-8">
          Nothing here. Add a task above to get started.
        </Card>
      )}

      <div className="space-y-2">
        {visible.map((t) => {
          const overdue = t.dueDate && new Date(t.dueDate) < today && t.status !== 'done';
          return (
            <Card key={t.id} className="flex items-center justify-between gap-4 py-3 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                <input
                  type="checkbox"
                  checked={t.status === 'done'}
                  onChange={() => updateTaskStatus(t.id, t.status === 'done' ? 'todo' : 'done')}
                  className="h-4 w-4 accent-ledger"
                />
                <div className="min-w-0">
                  <p className={clsx('text-sm truncate', t.status === 'done' && 'line-through text-ink/40')}>
                    {t.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Stamp tone={t.priority === 'high' ? 'rust' : t.priority === 'medium' ? 'ochre' : 'ink'}>
                      {t.priority}
                    </Stamp>
                    {t.dueDate && (
                      <span className={clsx('text-xs font-mono', overdue ? 'text-rust' : 'text-ink/50')}>
                        {new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {t.status !== 'done' && (
                  <select
                    value={t.status}
                    onChange={(e) => updateTaskStatus(t.id, e.target.value as 'todo' | 'in_progress' | 'done')}
                    className="text-xs bg-transparent border border-slate rounded-sm px-2 py-1"
                  >
                    <option value="todo">Todo</option>
                    <option value="in_progress">In progress</option>
                    <option value="done">Done</option>
                  </select>
                )}
                <button onClick={() => deleteTask(t.id)} className="text-xs text-ink/40 hover:text-rust">
                  Remove
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
