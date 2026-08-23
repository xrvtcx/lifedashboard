'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { toggleHabitDay } from './actions';
import { ManageHabitsModal } from './manage-habits-modal';
import { Card, SectionLabel } from '@/components/ui';
import { HabitIcon } from '@/components/habit-icon';
import { celebrate } from '@/lib/celebrate';
import { dayLabel, dayNum } from '@/lib/week';

type Habit = {
  id: number;
  name: string;
  section: 'daily' | 'devotional';
  icon: string;
  color: string;
  weeklyGoal: number;
  sortOrder: number;
};
type Log = { habitId: number; date: string };

function doneCount(habit: Habit, logs: Log[]) {
  return logs.filter((l) => l.habitId === habit.id).length;
}

function SectionGrid({ title, habitList, logs, days }: { title: string; habitList: Habit[]; logs: Log[]; days: string[] }) {
  if (habitList.length === 0) return null;
  return (
    <div>
      <SectionLabel>{title}</SectionLabel>
      {/* Plain div (not <Card>) so we can drop padding here without fighting Card's default p-5 */}
      <div className="bg-paper border border-slate rounded-md overflow-x-auto">
        <table className="w-full text-sm border-collapse min-w-[560px]">
          <thead>
            <tr className="border-b border-slate">
              <th className="text-left font-medium text-ink/60 px-4 py-2 text-xs uppercase tracking-wide">Habit</th>
              {days.map((d) => (
                <th key={d} className="px-1.5 py-2 text-center text-xs text-ink/50 font-mono w-10">
                  <div>{dayLabel(d)}</div>
                  <div>{dayNum(d)}</div>
                </th>
              ))}
              <th className="px-3 py-2 text-center text-xs text-ink/50 w-16">Goal</th>
            </tr>
          </thead>
          <tbody>
            {habitList.map((h) => {
              const count = doneCount(h, logs);
              const checkedDates = new Set(logs.filter((l) => l.habitId === h.id).map((l) => l.date));
              return (
                <tr key={h.id} className="border-b border-slate/60 last:border-0">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-6 w-6 rounded-sm flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${h.color}22`, color: h.color }}
                      >
                        <HabitIcon name={h.icon} size={14} />
                      </span>
                      <span className="truncate">{h.name}</span>
                    </div>
                  </td>
                  {days.map((d) => {
                    const checked = checkedDates.has(d);
                    return (
                      <td key={d} className="text-center px-1.5 py-2.5">
                        <button
                          onClick={() => {
                            if (!checked) celebrate();
                            toggleHabitDay(h.id, d, checked);
                          }}
                          className={clsx(
                            'h-7 w-7 rounded-sm border transition-colors',
                            checked ? 'border-transparent' : 'border-slate hover:border-ink'
                          )}
                          style={checked ? { backgroundColor: h.color } : undefined}
                          aria-label={`${h.name} on ${d}`}
                        />
                      </td>
                    );
                  })}
                  <td className="text-center px-3 py-2.5 font-mono text-xs text-ink/60">
                    {count}/{h.weeklyGoal}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function HabitGrid({
  daily,
  devotional,
  logs,
  days,
  allHabits,
}: {
  daily: Habit[];
  devotional: Habit[];
  logs: Log[];
  days: string[];
  allHabits: Habit[];
}) {
  const [manageOpen, setManageOpen] = useState(false);

  const overallScore = allHabits.length
    ? Math.round(
        (allHabits.reduce((sum, h) => sum + Math.min(1, doneCount(h, logs) / h.weeklyGoal), 0) / allHabits.length) * 100
      )
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Card>
          <p className="font-mono text-3xl text-ledger">{overallScore}%</p>
          <p className="text-xs text-ink/60 mt-1">Overall completion this week</p>
        </Card>
        <button
          onClick={() => setManageOpen(true)}
          className="bg-ink text-chalk px-4 py-2 rounded-sm text-sm font-medium hover:bg-ledgerdark transition-colors"
        >
          Manage habits
        </button>
      </div>

      <SectionGrid title="Daily" habitList={daily} logs={logs} days={days} />
      <SectionGrid title="Devotional" habitList={devotional} logs={logs} days={days} />

      {allHabits.length === 0 && (
        <Card className="text-sm text-ink/50 text-center py-8">
          No habits yet. Click &ldquo;Manage habits&rdquo; to add your first one.
        </Card>
      )}

      {allHabits.length > 0 && (
        <div>
          <SectionLabel>Summary</SectionLabel>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {allHabits.map((h) => {
              const count = doneCount(h, logs);
              const pct = Math.round(Math.min(1, count / h.weeklyGoal) * 100);
              return (
                <Card key={h.id} style={{ borderLeftColor: h.color, borderLeftWidth: 4 }}>
                  <div className="flex items-center gap-2 mb-1">
                    <HabitIcon name={h.icon} size={14} style={{ color: h.color }} />
                    <span className="text-sm font-medium truncate">{h.name}</span>
                  </div>
                  <p className="font-mono text-lg" style={{ color: h.color }}>
                    {pct}%
                  </p>
                  <p className="text-xs text-ink/50">
                    {count}/{h.weeklyGoal} days
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {manageOpen && <ManageHabitsModal habits={allHabits} onClose={() => setManageOpen(false)} />}
    </div>
  );
}
