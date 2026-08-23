import { db } from '@/db';
import { habits, habitLogs } from '@/db/schema';
import { asc, inArray } from 'drizzle-orm';
import { HabitGrid } from './habit-grid';
import { weekDates, startOfWeek } from '@/lib/week';

export const dynamic = 'force-dynamic';

export default async function HabitsPage() {
  const allHabits = await db.select().from(habits).orderBy(asc(habits.section), asc(habits.sortOrder));
  const habitIds = allHabits.map((h) => h.id);
  const days = weekDates(startOfWeek(new Date()));

  const logs = habitIds.length
    ? await db.select().from(habitLogs).where(inArray(habitLogs.habitId, habitIds))
    : [];

  const daily = allHabits.filter((h) => h.section === 'daily');
  const devotional = allHabits.filter((h) => h.section === 'devotional');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Habit Tracker</h1>
        <p className="text-ink/60 text-sm mt-1">This week, day by day.</p>
      </div>

      <HabitGrid daily={daily} devotional={devotional} logs={logs} days={days} allHabits={allHabits} />
    </div>
  );
}
