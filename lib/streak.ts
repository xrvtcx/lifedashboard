export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function lastNDays(n: number): string[] {
  const days: string[] = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    days.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() - 1);
  }
  return days.reverse();
}

// Current streak of consecutive completed days, counting backward from
// today. If today isn't checked in yet, we still count an ongoing streak
// that ended yesterday (so the counter doesn't drop to zero at 12:01am).
export function computeStreak(dates: Set<string>): number {
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  if (!dates.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (true) {
    const iso = cursor.toISOString().slice(0, 10);
    if (dates.has(iso)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}
