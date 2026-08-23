'use client';

import clsx from 'clsx';
import { toggleGymDay } from './actions';
import { Card } from '@/components/ui';
import { celebrate } from '@/lib/celebrate';
import { dayLabel, dayNum } from '@/lib/week';

type Session = { date: string; note: string | null };

export function GymTracker({ days, sessions }: { days: string[]; sessions: Session[] }) {
  const attended = new Set(sessions.map((s) => s.date));

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-mono text-lg text-ledger">{sessions.length}/7</p>
        <p className="text-xs text-ink/60">gym days this week</p>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d) => {
          const done = attended.has(d);
          return (
            <button
              key={d}
              onClick={() => {
                if (!done) celebrate();
                toggleGymDay(d, done);
              }}
              className={clsx(
                'flex flex-col items-center gap-1 rounded-sm border py-2 transition-colors',
                done ? 'bg-ledger text-chalk border-ledger' : 'border-slate text-ink/50 hover:border-ink'
              )}
            >
              <span className="text-[10px] uppercase">{dayLabel(d)}</span>
              <span className="text-xs font-mono">{dayNum(d)}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
