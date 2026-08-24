// Fetch events from Google Calendar and sync them locally.
// Requires GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI env vars.

export function getGoogleAuthUrl(): string {
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || '';
  const scope = encodeURIComponent('https://www.googleapis.com/auth/calendar.readonly');
  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
}

export async function exchangeCodeForToken(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      code,
      grant_type: 'authorization_code',
      redirect_uri: process.env.GOOGLE_REDIRECT_URI || '',
    }).toString(),
  });
  if (!res.ok) throw new Error(`Google OAuth error: ${res.statusText}`);
  return res.json();
}

export async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }).toString(),
  });
  if (!res.ok) throw new Error(`Google refresh error: ${res.statusText}`);
  return res.json();
}

function easternUtcOffset(dateStr: string): string {
  // Determine whether this date falls in EDT (-04:00) or EST (-05:00) —
  // hardcoding one or the other breaks for half the year.
  const probe = new Date(`${dateStr}T12:00:00Z`);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    timeZoneName: 'shortOffset',
  }).formatToParts(probe);
  const tzPart = parts.find((p) => p.type === 'timeZoneName')?.value || 'GMT-5';
  const match = tzPart.match(/GMT([+-]\d+)/);
  const hours = match ? parseInt(match[1], 10) : -5;
  const sign = hours < 0 ? '-' : '+';
  const abs = Math.abs(hours).toString().padStart(2, '0');
  return `${sign}${abs}:00`;
}

function easternHour(d: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    hour12: false,
  }).formatToParts(d);
  const hourPart = parts.find((p) => p.type === 'hour')?.value;
  return hourPart ? parseInt(hourPart, 10) % 24 : 0;
}

function easternDateString(d: Date): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d);
  const y = parts.find((p) => p.type === 'year')?.value;
  const m = parts.find((p) => p.type === 'month')?.value;
  const day = parts.find((p) => p.type === 'day')?.value;
  return `${y}-${m}-${day}`;
}

export type CalendarEvent = {
  id: string;
  date: string; // "2026-08-24", Eastern-local
  hour: number; // 0-23, or -1 for all-day
  startTime: string;
  endTime: string;
  title: string;
  description?: string;
  calendarName?: string;
};

// Every calendar the account can see: the primary one, plus any shared or
// secondary calendars (a work calendar, one someone shared with you, etc.).
export async function listCalendars(accessToken: string): Promise<Array<{ id: string; summary: string }>> {
  const res = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Google Calendar list error: ${res.statusText}`);
  const data = await res.json();
  // summaryOverride is the nickname *you* set for a shared calendar in your
  // own calendar list; summary is the name the calendar's owner gave it.
  // Your own rename always lands in summaryOverride, so prefer it.
  return (data.items || []).map((item: any) => ({
    id: item.id,
    summary: item.summaryOverride || item.summary || item.id,
  }));
}

// Fetch events from ONE calendar across a date range in a single call
// (rather than one call per day, which is much slower once you have several
// calendars).
async function fetchEventsForCalendar(
  accessToken: string,
  calendarId: string,
  startDate: string,
  endDate: string
): Promise<Array<Omit<CalendarEvent, 'calendarName'>>> {
  const timeMin = `${startDate}T00:00:00${easternUtcOffset(startDate)}`;
  const timeMax = `${endDate}T23:59:59${easternUtcOffset(endDate)}`;

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`,
    { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' }
  );
  if (!res.ok) throw new Error(`Google Calendar fetch error (${calendarId}): ${res.statusText}`);
  const data = await res.json();

  return (data.items || []).map((item: any) => {
    const isAllDay = !item.start.dateTime;
    const start = item.start.dateTime || item.start.date;
    const end = item.end.dateTime || item.end.date;
    const startDateObj = new Date(start);

    return {
      id: item.id,
      date: isAllDay ? item.start.date : easternDateString(startDateObj),
      hour: isAllDay ? -1 : easternHour(startDateObj),
      startTime: isAllDay
        ? 'All day'
        : startDateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'America/New_York' }),
      endTime: isAllDay ? 'All day' : new Date(end).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'America/New_York' }),
      title: item.summary || '(No title)',
      description: item.description,
    };
  });
}

// Fetch events across ALL calendars the account can see, for a date range,
// bucketed by day. This is what the dashboard and the morning briefing use.
export async function fetchWeekEvents(
  accessToken: string,
  startDate: string,
  endDate: string
): Promise<Record<string, CalendarEvent[]>> {
  const byDay: Record<string, CalendarEvent[]> = {};
  const calendars = await listCalendars(accessToken);

  for (const cal of calendars) {
    try {
      const events = await fetchEventsForCalendar(accessToken, cal.id, startDate, endDate);
      for (const e of events) {
        if (!byDay[e.date]) byDay[e.date] = [];
        byDay[e.date].push({ ...e, calendarName: calendars.length > 1 ? cal.summary : undefined });
      }
    } catch (err) {
      // One bad/inaccessible calendar shouldn't take down the rest.
      console.error(`Failed to fetch events for calendar "${cal.summary}":`, err);
    }
  }

  for (const day in byDay) {
    byDay[day].sort((a, b) => (a.hour === -1 ? -1 : b.hour === -1 ? 1 : a.hour - b.hour));
  }

  return byDay;
}

// Convenience wrapper for a single day (used by the morning briefing).
export async function fetchDayEvents(accessToken: string, date: string): Promise<CalendarEvent[]> {
  const byDay = await fetchWeekEvents(accessToken, date, date);
  return byDay[date] || [];
}
