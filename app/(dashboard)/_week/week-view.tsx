import Link from 'next/link';
import { WeekChecklist } from './week-checklist';
import { DailySchedule } from './daily-schedule';
import { WorkoutTracker } from './gym-tracker';
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
type Session = { date: string; note: string | null; amWorkout: string | null; pmWorkout: string | null };
type FocusGoal = { id: number; title: string; completed: boolean };
type Quest = { id: number; title: string; category: string; progress: number };
type CalendarEvent = {
  id: string;
  hour: number;
  startTime: string;
  endTime: string;
  title: string;
  description?: string;
  calendarName?: string;
};
type CalendarStatus = { connected: boolean; eventCount: number; fetchError?: string };

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
  calendarEventsByDay = {},
  calendarStatus,
  oauthSuccess,
  oauthError,
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
  calendarEventsByDay?: Record<string, CalendarEvent[]>;
  calendarStatus?: CalendarStatus;
  oauthSuccess?: string;
  oauthError?: string;
}) {
  const weekStartISO = weekDates[0];

  return (
    <div className="space-y-6">
      {oauthSuccess && (
        <div className="bg-ledgerpale border-l-2 border-ledger text-ledger text-sm rounded-sm px-4 py-2">
          {oauthSuccess}
        </div>
      )}
      {oauthError && (
        <div className="bg-ledgerpale border-l-2 border-ledgerdeep text-ledgerdeep text-sm rounded-sm px-4 py-2">
          {oauthError}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-slate pb-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ledger">Week View</h1>
          <p className="text-ink/60 text-sm mt-1">{formatWeekRange(weekStart)}</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Link
            href={prevHref}
            className="px-3 py-1.5 border border-slate rounded-sm hover:border-ledger hover:text-ledger transition-colors"
          >
            &larr; Prev
          </Link>
          {!isCurrentWeek && (
            <Link
              href={todayHref}
              className="px-3 py-1.5 border border-ledger text-ledger rounded-sm hover:bg-ledgerpale transition-colors"
            >
              This week
            </Link>
          )}
          <Link
            href={nextHref}
            className="px-3 py-1.5 border border-slate rounded-sm hover:border-ledger hover:text-ledger transition-colors"
          >
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
            <DailySchedule blocks={blocks} days={weekDates} calendarEventsByDay={calendarEventsByDay} />
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
            <SectionLabel>Workout sessions</SectionLabel>
            <WorkoutTracker days={weekDates} sessions={sessions} />
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

      {calendarStatus && (
        <div className="pt-4 mt-2 border-t border-slate text-xs text-ink/40 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-ledger/40" />
          {calendarStatus.fetchError
            ? `Calendar error: ${calendarStatus.fetchError}`
            : calendarStatus.connected
            ? `Google Calendar connected \u00B7 ${calendarStatus.eventCount} event${
                calendarStatus.eventCount === 1 ? '' : 's'
              } this week`
            : 'Google Calendar not connected'}
        </div>
      )}
    </div>
  );
}
