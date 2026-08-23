'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { createHabit, updateHabit, deleteHabit, moveHabit } from './actions';
import { HabitIcon } from '@/components/habit-icon';
import { HABIT_ICON_KEYS } from '@/lib/habit-icons';
import { HABIT_COLORS } from '@/lib/habit-colors';

type Habit = {
  id: number;
  name: string;
  section: 'daily' | 'devotional';
  icon: string;
  color: string;
  weeklyGoal: number;
  sortOrder: number;
};

type FormValues = { name: string; section: 'daily' | 'devotional'; icon: string; color: string; weeklyGoal: number };

function HabitForm({
  initial,
  onCancel,
  onSubmit,
}: {
  initial?: Habit;
  onCancel: () => void;
  onSubmit: (data: FormValues) => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [section, setSection] = useState<'daily' | 'devotional'>(initial?.section ?? 'daily');
  const [icon, setIcon] = useState(initial?.icon ?? HABIT_ICON_KEYS[0]);
  const [color, setColor] = useState(initial?.color ?? HABIT_COLORS[0]);
  const [weeklyGoal, setWeeklyGoal] = useState(initial?.weeklyGoal ?? 7);

  return (
    <div className="border border-slate rounded-sm p-3 space-y-3 bg-chalk">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Habit name"
        autoFocus
        className="w-full bg-paper border border-slate rounded-sm px-2 py-1.5 text-sm focus:outline-none focus:border-ledger"
      />
      <div className="flex gap-2">
        <select
          value={section}
          onChange={(e) => setSection(e.target.value as 'daily' | 'devotional')}
          className="flex-1 bg-paper border border-slate rounded-sm px-2 py-1.5 text-sm"
        >
          <option value="daily">Daily</option>
          <option value="devotional">Devotional</option>
        </select>
        <input
          type="number"
          min={1}
          max={7}
          value={weeklyGoal}
          onChange={(e) => setWeeklyGoal(Number(e.target.value))}
          className="w-16 bg-paper border border-slate rounded-sm px-2 py-1.5 text-sm"
        />
        <span className="text-xs text-ink/50 self-center whitespace-nowrap">days / wk</span>
      </div>
      <div>
        <p className="text-xs text-ink/50 mb-1">Icon</p>
        <div className="flex flex-wrap gap-1.5">
          {HABIT_ICON_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setIcon(key)}
              className={clsx(
                'h-8 w-8 rounded-sm border flex items-center justify-center',
                icon === key ? 'border-ink bg-paper' : 'border-slate hover:border-ink'
              )}
            >
              <HabitIcon name={key} size={15} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs text-ink/50 mb-1">Color</p>
        <div className="flex flex-wrap gap-1.5">
          {HABIT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={clsx('h-7 w-7 rounded-sm border-2', color === c ? 'border-ink' : 'border-transparent')}
              style={{ backgroundColor: c }}
              aria-label={c}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button onClick={onCancel} className="text-xs text-ink/50 px-3 py-1.5">
          Cancel
        </button>
        <button
          onClick={() => name.trim() && onSubmit({ name: name.trim(), section, icon, color, weeklyGoal })}
          className="text-xs bg-ink text-chalk px-3 py-1.5 rounded-sm"
        >
          Save
        </button>
      </div>
    </div>
  );
}

export function ManageHabitsModal({ habits, onClose }: { habits: Habit[]; onClose: () => void }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const daily = habits.filter((h) => h.section === 'daily');
  const devotional = habits.filter((h) => h.section === 'devotional');

  function renderList(list: Habit[]) {
    if (list.length === 0) {
      return <p className="text-xs text-ink/40 py-1">None yet.</p>;
    }
    return (
      <div className="space-y-2">
        {list.map((h) =>
          editingId === h.id ? (
            <HabitForm
              key={h.id}
              initial={h}
              onCancel={() => setEditingId(null)}
              onSubmit={async (data) => {
                await updateHabit(h.id, data);
                setEditingId(null);
              }}
            />
          ) : (
            <div key={h.id} className="flex items-center justify-between gap-2 border border-slate rounded-sm px-3 py-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="h-6 w-6 rounded-sm flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${h.color}22`, color: h.color }}
                >
                  <HabitIcon name={h.icon} size={14} />
                </span>
                <span className="text-sm truncate">{h.name}</span>
                <span className="text-xs text-ink/40 font-mono shrink-0">{h.weeklyGoal}/wk</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => moveHabit(h.id, 'up')} className="w-6 h-6 text-xs border border-slate rounded-sm hover:border-ink">
                  &uarr;
                </button>
                <button onClick={() => moveHabit(h.id, 'down')} className="w-6 h-6 text-xs border border-slate rounded-sm hover:border-ink">
                  &darr;
                </button>
                <button onClick={() => setEditingId(h.id)} className="text-xs text-ink/50 hover:text-ink px-1.5">
                  Edit
                </button>
                <button onClick={() => deleteHabit(h.id)} className="text-xs text-ink/50 hover:text-rust px-1.5">
                  Remove
                </button>
              </div>
            </div>
          )
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-paper border border-slate rounded-md p-5 max-w-lg w-full max-h-[85vh] overflow-y-auto space-y-5"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Manage habits</h2>
          <button onClick={onClose} className="text-ink/50 hover:text-ink text-sm">
            Close
          </button>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/60 mb-2">Daily</p>
          {renderList(daily)}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/60 mb-2">Devotional</p>
          {renderList(devotional)}
        </div>

        {adding ? (
          <HabitForm
            onCancel={() => setAdding(false)}
            onSubmit={async (data) => {
              const fd = new FormData();
              fd.set('name', data.name);
              fd.set('section', data.section);
              fd.set('icon', data.icon);
              fd.set('color', data.color);
              fd.set('weeklyGoal', String(data.weeklyGoal));
              await createHabit(fd);
              setAdding(false);
            }}
          />
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full border border-dashed border-slate rounded-sm py-2 text-sm text-ink/60 hover:border-ink hover:text-ink"
          >
            + Add habit
          </button>
        )}
      </div>
    </div>
  );
}
