'use client';

import { useState } from 'react';
import {
  createQuarterlyGoal,
  updateQuarterlyGoalProgress,
  updateQuarterlyGoalValue,
  deleteQuarterlyGoal,
} from './actions';
import { Ticks, Stamp } from '@/components/ui';

type Goal = {
  id: number;
  category: 'finance' | 'health' | 'business' | 'personal';
  title: string;
  targetValue: string | null;
  currentValue: string | null;
  progress: number;
  status: 'active' | 'completed' | 'archived';
};

const CATEGORY_LABEL: Record<Goal['category'], string> = {
  finance: 'Finance',
  health: 'Health',
  business: 'Business',
  personal: 'Personal',
};

function goalPercent(g: Goal) {
  if (g.targetValue && Number(g.targetValue) > 0) {
    return Math.max(0, Math.min(100, Math.round((Number(g.currentValue ?? 0) / Number(g.targetValue)) * 100)));
  }
  return g.progress;
}

function GoalRow({ goal }: { goal: Goal }) {
  const [current, setCurrent] = useState(goal.currentValue ?? '');
  const usesValue = !!goal.targetValue;
  const pct = goalPercent(goal);

  return (
    <div className="space-y-2 py-2.5 border-b border-slate/50 last:border-0">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm">{goal.title}</span>
        <Stamp tone={goal.status === 'completed' ? 'ledger' : 'ink'}>{goal.status}</Stamp>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <Ticks value={pct} />
        <span className="font-mono text-xs text-ink/60">{pct}%</span>

        {usesValue ? (
          <div className="flex items-center gap-1 ml-auto text-xs">
            <input
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              onBlur={() => updateQuarterlyGoalValue(goal.id, current || '0')}
              className="w-20 bg-transparent border border-slate rounded-sm px-1.5 py-1 text-right font-mono"
            />
            <span className="text-ink/40">/ {Number(goal.targetValue).toLocaleString()}</span>
            <button onClick={() => deleteQuarterlyGoal(goal.id)} className="text-ink/40 hover:text-rust ml-2">
              Remove
            </button>
          </div>
        ) : (
          <div className="flex gap-1 ml-auto">
            <button
              onClick={() => updateQuarterlyGoalProgress(goal.id, goal.progress - 10)}
              className="w-6 h-6 border border-slate rounded-sm text-xs hover:border-ink"
            >
              &minus;
            </button>
            <button
              onClick={() => updateQuarterlyGoalProgress(goal.id, goal.progress + 10)}
              className="w-6 h-6 border border-slate rounded-sm text-xs hover:border-ink"
            >
              +
            </button>
            <button onClick={() => deleteQuarterlyGoal(goal.id)} className="text-xs text-ink/40 hover:text-rust ml-2">
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AddGoalForm({ category, quarter }: { category: Goal['category']; quarter: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [useTarget, setUseTarget] = useState(category === 'finance');
  const [target, setTarget] = useState('');

  async function submit() {
    if (!title.trim()) return;
    const fd = new FormData();
    fd.set('quarter', quarter);
    fd.set('category', category);
    fd.set('title', title.trim());
    if (useTarget && target) {
      fd.set('targetValue', target);
      fd.set('currentValue', '0');
    }
    await createQuarterlyGoal(fd);
    setTitle('');
    setTarget('');
    setOpen(false);
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs text-ledger hover:underline">
        + Add {CATEGORY_LABEL[category].toLowerCase()} goal
      </button>
    );
  }

  return (
    <div className="space-y-2 pt-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Goal title"
        className="w-full bg-transparent border border-slate rounded-sm px-2 py-1.5 text-sm focus:outline-none focus:border-ledger"
      />
      <label className="flex items-center gap-2 text-xs text-ink/60">
        <input type="checkbox" checked={useTarget} onChange={(e) => setUseTarget(e.target.checked)} />
        Track with a target number (e.g. dollar amount)
      </label>
      {useTarget && (
        <input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          type="number"
          step="0.01"
          placeholder="Target value"
          className="w-full bg-transparent border border-slate rounded-sm px-2 py-1.5 text-sm"
        />
      )}
      <div className="flex justify-end gap-2">
        <button onClick={() => setOpen(false)} className="text-xs text-ink/50">
          Cancel
        </button>
        <button onClick={submit} className="text-xs bg-ink text-chalk px-3 py-1.5 rounded-sm">
          Add
        </button>
      </div>
    </div>
  );
}

export function GoalCategorySection({
  category,
  quarter,
  goals,
}: {
  category: Goal['category'];
  quarter: string;
  goals: Goal[];
}) {
  return (
    <details className="bg-paper border border-slate rounded-md" open>
      <summary className="flex items-center justify-between px-4 py-3 cursor-pointer select-none">
        <span className="font-display text-sm font-semibold">{CATEGORY_LABEL[category]}</span>
        <span className="text-xs text-ink/40 font-mono">
          {goals.length} goal{goals.length === 1 ? '' : 's'}
        </span>
      </summary>
      <div className="px-4 pb-4 space-y-1">
        {goals.length === 0 && <p className="text-sm text-ink/40 py-2">No {category} goals yet this quarter.</p>}
        {goals.map((g) => (
          <GoalRow key={g.id} goal={g} />
        ))}
        <div className="pt-2">
          <AddGoalForm category={category} quarter={quarter} />
        </div>
      </div>
    </details>
  );
}
