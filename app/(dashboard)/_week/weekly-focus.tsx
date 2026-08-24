'use client';

import { useState } from 'react';
import { saveWeeklyFocusTitle, addFocusGoal, toggleFocusGoal, deleteFocusGoal } from './actions';
import { Card } from '@/components/ui';
import { celebrate } from '@/lib/celebrate';

type Focus = { title: string } | undefined;
type Goal = { id: number; title: string; completed: boolean };

export function WeeklyFocus({ weekStart, focus, goals }: { weekStart: string; focus: Focus; goals: Goal[] }) {
  const [title, setTitle] = useState(focus?.title ?? '');
  const [newGoal, setNewGoal] = useState('');

  function submitGoal() {
    if (!newGoal.trim()) return;
    addFocusGoal(weekStart, newGoal.trim());
    setNewGoal('');
  }

  return (
    <Card className="space-y-3">
      <textarea
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => saveWeeklyFocusTitle(weekStart, title)}
        placeholder="What's the one thing that matters most this week?"
        rows={2}
        className="w-full bg-transparent text-sm font-medium focus:outline-none resize-none"
      />
      <div className="space-y-1.5">
        {goals.map((g) => (
          <div key={g.id} className="flex items-center gap-2 group">
            <input
              type="checkbox"
              checked={g.completed}
              onChange={() => {
                if (!g.completed) celebrate();
                toggleFocusGoal(g.id, g.completed);
              }}
              className="h-4 w-4 accent-ledger shrink-0"
            />
            <span className={`text-sm flex-1 ${g.completed ? 'line-through text-ink/40' : ''}`}>{g.title}</span>
            <button onClick={() => deleteFocusGoal(g.id)} className="text-xs text-ink/20 group-hover:text-rust shrink-0">
              ✕
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2 pt-1">
        <input
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submitGoal()}
          placeholder="Add a goal under this focus..."
          className="flex-1 bg-transparent border border-slate rounded-sm px-2 py-1.5 text-xs focus:outline-none focus:border-ledger"
        />
        <button onClick={submitGoal} className="text-xs bg-ink text-chalk px-3 py-1.5 rounded-sm">
          Add
        </button>
      </div>
    </Card>
  );
}
