import { db } from '@/db';
import { financeAccounts, quarterlyGoals, achievements, parkingLot, gymSessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { quarterOf, adjacentQuarter, quarterLabel, quarterRange } from '@/lib/quarter';
import { startOfWeek, addWeeks, toISODate } from '@/lib/week';
import { FinanceColumns } from './finance-columns';
import { GoalCategorySection } from './goal-category-section';
import { Achievements } from './achievements';
import { ParkingLot } from './parking-lot';
import { GymConsistencyChart } from './gym-consistency-chart';
import { SectionLabel } from '@/components/ui';

export const dynamic = 'force-dynamic';

function weeksInQuarter(quarter: string): string[] {
  const { start, end } = quarterRange(quarter);
  const weeks: string[] = [];
  let cursor = startOfWeek(start);
  while (cursor <= end) {
    weeks.push(toISODate(cursor));
    cursor = addWeeks(cursor, 1);
  }
  return weeks;
}

export default async function QuarterPage({ searchParams }: { searchParams: { q?: string } }) {
  const quarter = searchParams.q || quarterOf(new Date());
  const prevQ = adjacentQuarter(quarter, -1);
  const nextQ = adjacentQuarter(quarter, 1);
  const isCurrent = quarter === quarterOf(new Date());

  const weekStarts = weeksInQuarter(quarter);

  const [accounts, goals, achievementRows, parkingLotRows, allGymSessions] = await Promise.all([
    db.select().from(financeAccounts),
    db.select().from(quarterlyGoals).where(eq(quarterlyGoals.quarter, quarter)),
    db.select().from(achievements).where(eq(achievements.quarter, quarter)),
    db.select().from(parkingLot),
    db.select().from(gymSessions),
  ]);

  const gymByWeek = weekStarts.map((ws) => {
    const weekEnd = toISODate(addWeeks(new Date(`${ws}T00:00:00`), 1));
    const count = allGymSessions.filter((g) => g.date >= ws && g.date < weekEnd).length;
    return { week: ws, count };
  });

  const categories = ['finance', 'health', 'business', 'personal'] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold">Quarter View</h1>
          <p className="text-ink/60 text-sm mt-1">
            {quarter} &middot; {quarterLabel(quarter)}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Link href={`/quarter?q=${prevQ}`} className="px-3 py-1.5 border border-slate rounded-sm hover:border-ink">
            &larr; {prevQ}
          </Link>
          {!isCurrent && (
            <Link href="/quarter" className="px-3 py-1.5 border border-slate rounded-sm hover:border-ink">
              This quarter
            </Link>
          )}
          <Link href={`/quarter?q=${nextQ}`} className="px-3 py-1.5 border border-slate rounded-sm hover:border-ink">
            {nextQ} &rarr;
          </Link>
        </div>
      </div>

      <div>
        <SectionLabel>Financials</SectionLabel>
        <FinanceColumns accounts={accounts} />
      </div>

      <div>
        <SectionLabel>Gym consistency this quarter</SectionLabel>
        <GymConsistencyChart data={gymByWeek} />
      </div>

      <div className="space-y-3">
        <SectionLabel>Goals by category</SectionLabel>
        {categories.map((cat) => (
          <GoalCategorySection key={cat} category={cat} quarter={quarter} goals={goals.filter((g) => g.category === cat)} />
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <SectionLabel>Achievements</SectionLabel>
          <Achievements quarter={quarter} achievements={achievementRows} />
        </div>
        <div>
          <SectionLabel>Parking lot</SectionLabel>
          <ParkingLot quarter={quarter} items={parkingLotRows} />
        </div>
      </div>
    </div>
  );
}
