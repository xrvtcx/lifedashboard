'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { updateSideQuestProgress, toggleSideQuestStatus, deleteSideQuest } from './actions';
import { Card, Ticks, Stamp } from '@/components/ui';

type Quest = {
  id: number;
  title: string;
  category: 'reading' | 'studying' | 'hobby' | 'certification' | 'exam' | 'other';
  progress: number;
  status: 'active' | 'completed';
  notes: string | null;
};

const CATEGORIES = ['all', 'reading', 'studying', 'hobby', 'certification', 'exam', 'other'] as const;
const CATEGORY_TONE: Record<Quest['category'], 'ledger' | 'ochre' | 'rust' | 'ink'> = {
  reading: 'ledger',
  studying: 'ochre',
  hobby: 'ink',
  certification: 'rust',
  exam: 'ochre',
  other: 'ink',
};

export function SideQuestList({ quests }: { quests: Quest[] }) {
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]>('all');
  const visible = filter === 'all' ? quests : quests.filter((q) => q.category === filter);

  return (
    <div className="space-y-3">
      <div className="flex gap-2 text-xs uppercase tracking-wide flex-wrap">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={clsx(
              'px-3 py-1 rounded-sm border',
              filter === c ? 'bg-ink text-chalk border-ink' : 'border-slate text-ink/60 hover:border-ink'
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {visible.length === 0 && <Card className="text-sm text-ink/50 text-center py-8">Nothing here yet.</Card>}

      <div className="space-y-2">
        {visible.map((q) => (
          <Card key={q.id} className="space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 min-w-0">
                <Stamp tone={CATEGORY_TONE[q.category]}>{q.category}</Stamp>
                <span className={clsx('text-sm truncate', q.status === 'completed' && 'line-through text-ink/40')}>
                  {q.title}
                </span>
              </div>
              <Stamp tone={q.status === 'completed' ? 'ledger' : 'ink'}>{q.status}</Stamp>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Ticks value={q.progress} />
              <span className="font-mono text-xs text-ink/60">{q.progress}%</span>
              <div className="flex gap-1 ml-auto">
                <button
                  onClick={() => updateSideQuestProgress(q.id, q.progress - 10)}
                  className="w-6 h-6 border border-slate rounded-sm text-xs hover:border-ink"
                >
                  &minus;
                </button>
                <button
                  onClick={() => updateSideQuestProgress(q.id, q.progress + 10)}
                  className="w-6 h-6 border border-slate rounded-sm text-xs hover:border-ink"
                >
                  +
                </button>
                <button
                  onClick={() => toggleSideQuestStatus(q.id, q.status)}
                  className="text-xs text-ink/50 hover:text-ledger px-2"
                >
                  Mark {q.status === 'active' ? 'complete' : 'active'}
                </button>
                <button onClick={() => deleteSideQuest(q.id)} className="text-xs text-ink/40 hover:text-rust">
                  Remove
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
