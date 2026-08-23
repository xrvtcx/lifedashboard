import Link from 'next/link';
import { Card, Stamp } from '@/components/ui';

type Quest = { id: number; title: string; category: string; progress: number };

const CATEGORY_TONE: Record<string, 'ledger' | 'ochre' | 'rust' | 'ink'> = {
  reading: 'ledger',
  studying: 'ochre',
  hobby: 'ink',
  certification: 'rust',
  exam: 'ochre',
  other: 'ink',
};

export function CurrentSideQuest({ quests }: { quests: Quest[] }) {
  return (
    <Card className="space-y-2">
      {quests.length === 0 && (
        <p className="text-sm text-ink/40 text-center py-2">No active side quests right now.</p>
      )}
      {quests.map((q) => (
        <div key={q.id} className="flex items-center justify-between gap-2 text-sm">
          <div className="min-w-0 flex items-center gap-2">
            <Stamp tone={CATEGORY_TONE[q.category] ?? 'ink'}>{q.category}</Stamp>
            <span className="truncate">{q.title}</span>
          </div>
          <span className="font-mono text-xs text-ink/60 shrink-0">{q.progress}%</span>
        </div>
      ))}
      <Link href="/side-quests" className="text-xs text-ledger hover:underline inline-block pt-1">
        View all side quests &rarr;
      </Link>
    </Card>
  );
}
