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

export async function fetchCalendarEvents(
  accessToken: string,
  date: string // ISO date: "2026-08-24"
): Promise<Array<{ id: string; hour: number; startTime: string; endTime: string; title: string; description?: string }>> {
  const offset = easternUtcOffset(date);
  const dayStart = `${date}T00:00:00${offset}`;
  const dayEnd = `${date}T23:59:59${offset}`;

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(dayStart)}&timeMax=${encodeURIComponent(dayEnd)}&singleEvents=true&orderBy=startTime`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!res.ok) throw new Error(`Google Calendar fetch error: ${res.statusText}`);
  const data = await res.json();

  return (data.items || []).map((item: any) => {
    const start = item.start.dateTime || item.start.date;
    const end = item.end.dateTime || item.end.date;
    const startDate = new Date(start);
    const startTime = startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'America/New_York' });
    const endTime = new Date(end).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'America/New_York' });
    return {
      id: item.id,
      hour: item.start.dateTime ? easternHour(startDate) : -1, // -1 marks all-day events
      startTime: item.start.dateTime ? startTime : 'All day',
      endTime,
      title: item.summary || '(No title)',
      description: item.description,
    };
  });
}
