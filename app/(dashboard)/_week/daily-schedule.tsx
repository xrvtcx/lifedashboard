'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { upsertScheduleBlock } from './actions';
import { dayLabel, dayNum, toISODate } from '@/lib/week';

type Block = { date: string; hour: number; label: string };
type CalendarEvent = {
  id: string;
  hour: number;
  startTime: string;
  endTime: string;
  title: string;
  description?: string;
  calendarName?: string;
  color?: string;
};

const HOURS = Array.from({ length: 18 }, (_, i) => i + 5); // 5am - 10pm

function formatHour(h: number) {
  const period = h < 12 ? 'AM' : 'PM';
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}${period}`;
}

export function DailySchedule({
  blocks,
  days,
  calendarEventsByDay,
}: {
  blocks: Block[];
  days: string[];
  calendarEventsByDay: Record<string, CalendarEvent[]>;
}) {
  const todayISO = toISODate(new Date());
  const [activeDay, setActiveDay] = useState(days.includes(todayISO) ? todayISO : days[0]);
  const [values, setValues] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    blocks.forEach((b) => {
      map[`${b.date}-${b.hour}`] = b.label;
    });
    return map;
  });

  function key(date: string, hour: number) {
    return `${date}-${hour}`;
  }

  async function commit(hour: number) {
    const k = key(activeDay, hour);
    await upsertScheduleBlock(activeDay, hour, values[k] ?? '');
  }

  const dayEvents = calendarEventsByDay[activeDay] || [];
  const allDayEvents = dayEvents.filter((e) => e.hour === -1);
  const eventsByHour: Record<number, CalendarEvent[]> = {};
  dayEvents.forEach((e) => {
    if (e.hour === -1) return;
    if (!eventsByHour[e.hour]) eventsByHour[e.hour] = [];
    eventsByHour[e.hour].push(e);
  });

  // Legend of calendars appearing anywhere this week, so the colors mean something.
  const legend: Array<{ name: string; color: string }> = [];
  Object.values(calendarEventsByDay)
    .flat()
    .forEach((e) => {
      if (!e.calendarName || !e.color) return;
      if (!legend.some((l) => l.name === e.calendarName)) {
        legend.push({ name: e.calendarName, color: e.color });
      }
    });

  return (
    <div className="bg-paper border border-slate rounded-md overflow-hidden">
      <div className="flex border-b border-slate overflow-x-auto">
        {days.map((d) => (
          <button
            key={d}
            onClick={() => setActiveDay(d)}
            className={clsx(
              'flex-1 min-w-[64px] px-2 py-2 text-center text-xs border-r border-slate last:border-r-0',
              activeDay === d ? 'bg-ledger text-chalk' : 'hover:bg-ledgerpale/60'
            )}
          >
            <div className="uppercase tracking-wide">{dayLabel(d)}</div>
            <div className="font-mono">{dayNum(d)}</div>
          </button>
        ))}
      </div>
      {legend.length > 1 && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 px-3 py-2 border-b border-slate/50">
          {legend.map((l) => (
            <span key={l.name} className="flex items-center gap-1.5 text-[10px] text-ink/50">
              <span
                className="h-2 w-2 rounded-[1px] shrink-0"
                style={{ backgroundColor: l.color }}
              />
              {l.name}
            </span>
          ))}
        </div>
      )}
      {allDayEvents.length > 0 && (
        <div className="px-3 py-2 border-b border-slate/50 space-y-1">
          {allDayEvents.map((e) => (
            <div
              key={e.id}
              className="text-xs px-2 py-1 rounded-sm"
              style={{
                borderLeftWidth: '3px',
                borderLeftStyle: 'solid',
                borderLeftColor: e.color || '#7A1F2B',
                backgroundColor: `${e.color || '#7A1F2B'}14`,
              }}
            >
              <span className="font-medium text-ink/80">{e.title}</span>
              <span className="text-ink/50"> — all day{e.calendarName ? ` · ${e.calendarName}` : ''}</span>
            </div>
          ))}
        </div>
      )}
      <div className="max-h-[420px] overflow-y-auto divide-y divide-slate/50">
        {HOURS.map((h) => {
          const k = key(activeDay, h);
          const events = eventsByHour[h] || [];
          return (
            <div key={h} className="flex items-start gap-3 px-3 py-2">
              <span className="w-14 shrink-0 text-xs font-mono text-ink/50 pt-1.5">{formatHour(h)}</span>
              <div className="flex-1 space-y-1">
                {events.map((e) => (
                  <div
                    key={e.id}
                    className="text-xs px-2 py-1 rounded-sm"
                    style={{
                      borderLeftWidth: '3px',
                      borderLeftStyle: 'solid',
                      borderLeftColor: e.color || '#7A1F2B',
                      backgroundColor: `${e.color || '#7A1F2B'}14`,
                    }}
                  >
                    <div className="font-medium text-ink/80">{e.title}</div>
                    <div className="text-ink/50">
                      {e.startTime}
                      {e.calendarName ? ` · ${e.calendarName}` : ''}
                    </div>
                  </div>
                ))}
                <input
                  value={values[k] ?? ''}
                  onChange={(e) => setValues((prev) => ({ ...prev, [k]: e.target.value }))}
                  onBlur={() => commit(h)}
                  placeholder="-"
                  className="w-full bg-transparent text-sm focus:outline-none focus:border-b focus:border-ledger py-0.5"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
