/** Calendar day helpers for Habit.completedDates (YYYY-MM-DD, UTC). */

export function utcDateString(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10)
}

function shiftUtcDate(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00.000Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** Current streak ending today or yesterday (if today not yet done). */
export function computeStreakCount(
  completedDates: string[],
  today: string = utcDateString()
): number {
  const set = new Set(completedDates)
  let cursor = today
  if (!set.has(cursor)) {
    cursor = shiftUtcDate(today, -1)
    if (!set.has(cursor)) return 0
  }

  let streak = 0
  while (set.has(cursor)) {
    streak += 1
    cursor = shiftUtcDate(cursor, -1)
  }
  return streak
}

export function toggleCompletedDate(
  completedDates: string[],
  date: string
): string[] {
  const set = new Set(completedDates)
  if (set.has(date)) set.delete(date)
  else set.add(date)
  return Array.from(set).sort()
}
