import { HTMLAttributes } from 'react';
import clsx from 'clsx';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'bg-paper border border-slate rounded-sm shadow-[0_1px_3px_rgba(33,24,21,0.06)] p-5',
        className
      )}
      {...props}
    />
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-ink/70">{children}</h2>
      <div className="mt-1.5 h-px w-8 bg-gold" />
    </div>
  );
}

type Tone = 'ledger' | 'ochre' | 'rust' | 'ink';

const toneClass: Record<Tone, string> = {
  ledger: 'text-ledger',
  ochre: 'text-ochre',
  rust: 'text-rust',
  ink: 'text-ink',
};

export function Stamp({ children, tone = 'ledger' }: { children: React.ReactNode; tone?: Tone }) {
  return <span className={clsx('stamp', toneClass[tone])}>{children}</span>;
}

export function Ticks({ value, max = 10 }: { value: number; max?: number }) {
  const filled = Math.round((Math.max(0, Math.min(100, value)) / 100) * max);
  return (
    <div className="flex gap-[3px]" role="img" aria-label={`${value}% complete`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={clsx('h-4 w-1.5 rounded-[1px]', i < filled ? 'bg-ochre' : 'bg-slate/60')} />
      ))}
    </div>
  );
}
