'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { toggleGymDay, saveWorkout } from './actions';
import { Card } from '@/components/ui';
import { celebrate } from '@/lib/celebrate';
import { dayLabel, dayNum, toISODate } from '@/lib/week';

type Session = { date: string; note: string | null; amWorkout: string | null; pmWorkout: string | null };

export function WorkoutTracker({ days, sessions }: { days: string[]; sessions: Session[] }) {
  const todayISO = toISODate(new Date());
  const attended = new Set(sessions.map((s) => s.date));
  const [activeDay, setActiveDay] = useState(days.includes(todayISO) ? todayISO : days[0]);

  const [workouts, setWorkouts] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    sessions.forEach((s) => {
      if (s.amWorkout) map[`${s.date}-am`] = s.amWorkout;
      if (s.pmWorkout) map[`${s.date}-pm`] = s.pmWorkout;
    });
    return map;
  });

  function setSlot(date: string, slot: 'am' | 'pm', value: string) {
    setWorkouts((prev) => ({ ...prev, [`${date}-${slot}`]: value }));
  }

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-mono text-lg text-ledger">{sessions.length}/7</p>
        <p className="text-xs text-ink/60">workout days this week</p>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d) => {
          const done = attended.has(d);
          const isActive = d === activeDay;
          return (
            <button
              key={d}
              onClick={() => setActiveDay(d)}
              onDoubleClick={() => {
                if (!done) celebrate();
                toggleGymDay(d, done);
              }}
              title="Click to edit, double-click to toggle"
              className={clsx(
                'flex flex-col items-center gap-1 rounded-sm border py-2 transition-colors',
                done
                  ? 'bg-ledger text-chalk border-ledger'
                  : 'border-slate text-ink/50 hover:border-ledgerlight',
                isActive && !done && 'border-ledger bg-ledgerpale',
                isActive && done && 'ring-2 ring-gold ring-offset-1'
              )}
            >
              <span className="text-[10px] uppercase">{dayLabel(d)}</span>
              <span className="text-xs font-mono">{dayNum(d)}</span>
            </button>
          );
        })}
      </div>

      <div className="pt-1 space-y-2">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-ledger">
            {dayLabel(activeDay)} {dayNum(activeDay)}
          </p>
          <button
            onClick={() => {
              const done = attended.has(activeDay);
              if (!done) celebrate();
              toggleGymDay(activeDay, done);
            }}
            className="text-[11px] text-ink/50 hover:text-ledger underline"
          >
            {attended.has(activeDay) ? 'Unmark day' : 'Mark attended'}
          </button>
        </div>

        {(['am', 'pm'] as const).map((slot) => (
          <div key={slot} className="flex items-center gap-2">
            <span className="w-8 shrink-0 font-mono text-[11px] uppercase tracking-wider text-ochre">
              {slot}
            </span>
            <input
              value={workouts[`${activeDay}-${slot}`] ?? ''}
              onChange={(e) => setSlot(activeDay, slot, e.target.value)}
              onBlur={() => saveWorkout(activeDay, slot, workouts[`${activeDay}-${slot}`] ?? '')}
              placeholder={slot === 'am' ? 'Morning workout…' : 'Evening workout…'}
              className="flex-1 bg-transparent border-b border-slate text-sm py-1 focus:outline-none focus:border-ledger"
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
