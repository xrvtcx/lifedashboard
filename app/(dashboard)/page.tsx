import { db } from '@/db';
import { tasks, scheduleBlocks, gymSessions, weeklyFocus, weeklyFocusGoals, reflections, sideQuests } from '@/db/schema';
import { and, eq, gte, lte, inArray } from 'drizzle-orm';
import { startOfWeek, addWeeks, weekDates as computeWeekDates, toISODate } from '@/lib/week';
import { WeekView } from './_week/week-view';

export const dynamic = 'force-dynamic';

export default async function HomePage({ searchParams }: { searchParams: { week?: string } }) {
  const requestedStart = searchParams.week ? new Date(`${searchParams.week}T00:00:00`) : new Date();
  const weekStart = startOfWeek(requestedStart);
  const weekStartISO = toISODate(weekStart);
  const days = computeWeekDates(weekStart);
  const rangeStart = new Date(`${days[0]}T00:00:00`);
  const rangeEnd = new Date(`${days[6]}T23:59:59`);

  const [weekTasks, blocks, sessions, focusRows, focusGoalRows, reflectionRows, activeQuests] = await Promise.all([
    db.select().from(tasks).where(and(gte(tasks.dueDate, rangeStart), lte(tasks.dueDate, rangeEnd))),
    db.select().from(scheduleBlocks).where(inArray(scheduleBlocks.date, days)),
    db.select().from(gymSessions).where(inArray(gymSessions.date, days)),
    db.select().from(weeklyFocus).where(eq(weeklyFocus.weekStart, weekStartISO)),
    db.select().from(weeklyFocusGoals).where(eq(weeklyFocusGoals.weekStart, weekStartISO)),
    db.select().from(reflections).where(eq(reflections.weekStart, weekStartISO)),
    db.select().from(sideQuests).where(eq(sideQuests.status, 'active')),
  ]);

  const prevWeekISO = toISODate(addWeeks(weekStart, -1));
  const nextWeekISO = toISODate(addWeeks(weekStart, 1));
  const isCurrentWeek = weekStartISO === toISODate(startOfWeek(new Date()));

  return (
    <WeekView
      weekStart={weekStart}
      weekDates={days}
      isCurrentWeek={isCurrentWeek}
      prevHref={`/?week=${prevWeekISO}`}
      nextHref={`/?week=${nextWeekISO}`}
      todayHref="/"
      tasks={weekTasks}
      blocks={blocks}
      sessions={sessions}
      focusTitle={focusRows[0]?.title ?? ''}
      focusGoals={focusGoalRows}
      reflectionContent={reflectionRows[0]?.content ?? ''}
      activeQuests={activeQuests}
    />
  );
}
