'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { Card } from '@/components/ui';
import { celebrate } from '@/lib/celebrate';

type Mode = 'focus' | 'short' | 'long';

const DURATIONS: Record<Mode, number> = {
  focus: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

const LABELS: Record<Mode, string> = {
  focus: 'Focus',
  short: 'Short break',
  long: 'Long break',
};

function format(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function Pomodoro() {
  const [mode, setMode] = useState<Mode>('focus');
  const [remaining, setRemaining] = useState(DURATIONS.focus);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(0);

  // Store the wall-clock deadline rather than decrementing a counter, so the
  // timer stays accurate even when the tab is backgrounded and setInterval
  // gets throttled by the browser.
  const deadlineRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;

    if (deadlineRef.current === null) {
      deadlineRef.current = Date.now() + remaining * 1000;
    }

    const id = setInterval(() => {
      const left = Math.max(0, Math.round((deadlineRef.current! - Date.now()) / 1000));
      setRemaining(left);

      if (left === 0) {
        setRunning(false);
        deadlineRef.current = null;
        if (mode === 'focus') {
          setCompleted((c) => c + 1);
          celebrate();
        }
      }
    }, 250);

    return () => clearInterval(id);
  }, [running, mode, remaining]);

  function switchMode(next: Mode) {
    setRunning(false);
    deadlineRef.current = null;
    setMode(next);
    setRemaining(DURATIONS[next]);
  }

  function toggle() {
    if (running) {
      // Pausing: bank the remaining time and drop the deadline.
      deadlineRef.current = null;
      setRunning(false);
    } else {
      deadlineRef.current = Date.now() + remaining * 1000;
      setRunning(true);
    }
  }

  function reset() {
    setRunning(false);
    deadlineRef.current = null;
    setRemaining(DURATIONS[mode]);
  }

  const total = DURATIONS[mode];
  const progress = ((total - remaining) / total) * 100;

  return (
    <Card className="space-y-3">
      <div className="flex gap-1">
        {(Object.keys(DURATIONS) as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={clsx(
              'flex-1 py-1 text-[10px] font-mono uppercase tracking-wider rounded-sm border transition-colors',
              mode === m
                ? 'bg-ledger text-chalk border-ledger'
                : 'border-slate text-ink/50 hover:border-ledgerlight hover:text-ledger'
            )}
          >
            {LABELS[m]}
          </button>
        ))}
      </div>

      <div className="text-center py-2">
        <p className="font-mono text-4xl text-ledger tabular-nums">{format(remaining)}</p>
      </div>

      <div className="h-1 w-full bg-slate/50 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-ledger to-gold transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className="flex-1 py-1.5 text-xs rounded-sm bg-ledger text-chalk hover:bg-ledgerdark transition-colors"
        >
          {running ? 'Pause' : remaining === total ? 'Start' : 'Resume'}
        </button>
        <button
          onClick={reset}
          className="px-3 py-1.5 text-xs rounded-sm border border-slate text-ink/60 hover:border-ledger hover:text-ledger transition-colors"
        >
          Reset
        </button>
      </div>

      {completed > 0 && (
        <p className="text-center text-[11px] text-ink/50">
          {completed} focus session{completed === 1 ? '' : 's'} today
        </p>
      )}
    </Card>
  );
}
