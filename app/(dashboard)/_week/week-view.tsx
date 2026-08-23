import Link from 'next/link';
import { WeekChecklist } from './week-checklist';
import { DailySchedule } from './daily-schedule';
import { GymTracker } from './gym-tracker';
import { WeeklyFocus } from './weekly-focus';
import { Reflections } from './reflections';
import { CurrentSideQuest } from './current-side-quest';
import { SectionLabel } from '@/components/ui';
import { formatWeekRange } from '@/lib/week';

type Task = {
  id: number;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: Date | null;
};
type Block = { date: string; hour: number; label: string };
type Session = { date: string; note: string | null };
type FocusGoal = { id: number; title: string; completed: boolean };
type Quest = { id: number; title: string; category: string; progress: number };

export function WeekView({
  weekStart,
  weekDates,
  isCurrentWeek,
  prevHref,
  nextHref,
  todayHref,
  tasks,
  blocks,
  sessions,
  focusTitle,
  focusGoals,
  reflectionContent,
  activeQuests,
}: {
  weekStart: Date;
  weekDates: string[];
  isCurrentWeek: boolean;
  prevHref: string;
  nextHref: string;
  todayHref: string;
  tasks: Task[];
  blocks: Block[];
  sessions: Session[];
  focusTitle: string;
  focusGoals: FocusGoal[];
  reflectionContent: string;
  activeQuests: Quest[];
}) {
  const weekStartISO = weekDates[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold">Week View</h1>
          <p className="text-ink/60 text-sm mt-1">{formatWeekRange(weekStart)}</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Link href={prevHref} className="px-3 py-1.5 border border-slate rounded-sm hover:border-ink">
            &larr; Prev
          </Link>
          {!isCurrentWeek && (
            <Link href={todayHref} className="px-3 py-1.5 border border-slate rounded-sm hover:border-ink">
              This week
            </Link>
          )}
          <Link href={nextHref} className="px-3 py-1.5 border border-slate rounded-sm hover:border-ink">
            Next &rarr;
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <SectionLabel>Checklist</SectionLabel>
            <WeekChecklist tasks={tasks} weekDates={weekDates} />
          </div>
          <div>
            <SectionLabel>Daily schedule</SectionLabel>
            <DailySchedule blocks={blocks} days={weekDates} />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <SectionLabel>Weekly focus</SectionLabel>
            <WeeklyFocus
              weekStart={weekStartISO}
              focus={focusTitle ? { title: focusTitle } : undefined}
              goals={focusGoals}
            />
          </div>
          <div>
            <SectionLabel>Gym sessions</SectionLabel>
            <GymTracker days={weekDates} sessions={sessions} />
          </div>
          <div>
            <SectionLabel>Current side quest</SectionLabel>
            <CurrentSideQuest quests={activeQuests} />
          </div>
          <div>
            <SectionLabel>Reflections</SectionLabel>
            <Reflections weekStart={weekStartISO} content={reflectionContent} />
          </div>
        </div>
      </div>
    </div>
  );
}
