"use client"

import { useMemo, useState } from "react"
import { cn } from "@workspace/ui/lib/utils"

export type HabitHeatmapProps = {
  /** Source of truth: YYYY-MM-DD (UTC) check-in days */
  completedDates: string[]
  /** Optional cached streak for the subtitle; recomputed if omitted */
  currentStreak?: number
  now?: Date
  className?: string
}

type Cell = {
  iso: string
  date: Date
  count: number
  level: 0 | 1 | 2 | 3 | 4
  tracked: boolean
  active: boolean
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const WEEKDAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""]

// LeetCode's dark submission calendar: empty, then four greens.
const LEVELS = ["#2d2d2d", "#0e4429", "#006d32", "#26a641", "#39d353"]

export function HabitHeatmap({
  completedDates,
  currentStreak,
  now,
  className,
}: HabitHeatmapProps) {
  const [hover, setHover] = useState<Cell | null>(null)

  const model = useMemo(
    () =>
      buildModel({
        completedDates,
        currentStreak,
        now: now ?? new Date(),
      }),
    [completedDates, currentStreak, now]
  )

  return (
    <section className={cn("flex flex-col gap-3", className)} aria-labelledby="habit-activity">
      <div>
        <h2 id="habit-activity" className="text-sm font-semibold">
          Activity
        </h2>
        <p className="text-xs text-white/50">
          {model.checkins} check-ins in the last {model.windowDays} days · {model.streak} day streak
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <div className="overflow-x-auto">
          <div className="grid w-max grid-cols-[28px_1fr] gap-2">
            <div className="flex flex-col gap-[2px] pt-5">
              {WEEKDAY_LABELS.map((label, index) => (
                <span
                  key={index}
                  className="flex h-[11px] items-center text-[9px] text-white/40"
                >
                  {label}
                </span>
              ))}
            </div>

            <div>
              <div className="relative h-4">
                {model.months.map((month) => (
                  <span
                    key={`${month.label}-${month.weekIndex}`}
                    className="absolute text-[10px] text-white/40"
                    style={{
                      left: `${(month.weekIndex / model.weeks.length) * 100}%`,
                    }}
                  >
                    {month.label}
                  </span>
                ))}
              </div>

              <div
                className="mt-1 flex gap-[2px]"
                onMouseLeave={() => setHover(null)}
              >
                {model.weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-[2px]">
                    {week.map((cell) => (
                      <span
                        key={cell.iso}
                        title={cellLabel(cell)}
                        onMouseEnter={() => setHover(cell)}
                        className={cn(
                          "size-[11px] rounded-[2px]",
                          hover?.iso === cell.iso && "outline outline-1 outline-white/70"
                        )}
                        style={{ backgroundColor: LEVELS[cell.level] }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 text-[11px] text-white/45">
          <span>{hover ? cellLabel(hover) : "Hover a day"}</span>
          <div className="flex items-center gap-1.5">
            <span>Less</span>
            {LEVELS.map((color) => (
              <span
                key={color}
                className="size-[11px] rounded-[2px]"
                style={{ backgroundColor: color }}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label="This month" value={String(model.thisMonth)} sub={`check-ins in ${model.monthName}`} />
        <Stat
          label="Longest break"
          value={model.longestBreak.length === 1 ? "1 day" : `${model.longestBreak.length} days`}
          sub={
            model.longestBreak.length > 0
              ? `${formatShort(model.longestBreak.start)} – ${formatShort(model.longestBreak.end)}`
              : "No gaps in this window"
          }
        />
        <Stat
          label="Busiest week"
          value={model.busiestWeek.count === 1 ? "1 day" : `${model.busiestWeek.count} days`}
          sub={model.busiestWeek.start ? `week of ${formatShort(model.busiestWeek.start)}` : "No check-ins yet"}
        />
      </div>
    </section>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="text-[10px] font-medium uppercase tracking-wide text-white/45">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight text-white">{value}</div>
      <div className="mt-0.5 text-xs text-white/45">{sub}</div>
    </div>
  )
}

function cellLabel(cell: Cell) {
  const date = formatLong(cell.date)
  if (!cell.tracked) return date
  if (cell.count === 0) return `No check-in on ${date}`
  return `Checked in on ${date}`
}

function buildModel({
  completedDates,
  currentStreak,
  now,
}: {
  completedDates: string[]
  currentStreak?: number
  now: Date
}) {
  // Match Habit.completedDates (YYYY-MM-DD UTC from the API).
  const todayIso = utcIso(now)
  const today = utcDay(todayIso)
  const done = new Set(completedDates)

  const gridEnd = addDays(sundayOnOrBefore(today), 6)
  const gridStart = addDays(gridEnd, -(53 * 7 - 1))
  const windowStart = addDays(today, -364)
  const windowDays = daysBetween(windowStart, today) + 1

  const weeks: Cell[][] = []
  let week: Cell[] = []

  for (let cursor = gridStart; cursor.getTime() <= gridEnd.getTime(); cursor = addDays(cursor, 1)) {
    const key = utcIso(cursor)
    const tracked =
      cursor.getTime() >= windowStart.getTime() && cursor.getTime() <= today.getTime()
    const active = tracked && done.has(key)
    const count = active ? 1 : 0

    week.push({
      iso: key,
      date: cursor,
      count,
      level: active ? 3 : 0,
      tracked,
      active,
    })
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  }

  const months: { label: string; weekIndex: number }[] = []
  weeks.forEach((days, weekIndex) => {
    const firstOfMonth = days.find((cell) => cell.date.getUTCDate() === 1)
    if (!firstOfMonth) return
    months.push({ label: MONTHS[firstOfMonth.date.getUTCMonth()] ?? "", weekIndex })
  })

  const tracked = weeks.flat().filter((cell) => cell.tracked)
  const checkins = tracked.filter((cell) => cell.active).length

  let longestBreak = { length: 0, start: today, end: today }
  let runStart: Date | null = null
  let runLength = 0
  for (const cell of tracked) {
    if (!cell.active) {
      if (runLength === 0) runStart = cell.date
      runLength += 1
      if (runStart && runLength > longestBreak.length) {
        longestBreak = { length: runLength, start: runStart, end: cell.date }
      }
    } else {
      runLength = 0
    }
  }

  let busiestWeek = { count: 0, start: null as Date | null }
  for (const days of weeks) {
    const count = days.filter((cell) => cell.active).length
    if (count > busiestWeek.count) {
      busiestWeek = { count, start: days[0]?.date ?? null }
    }
  }

  const thisMonth = tracked.filter(
    (cell) => cell.active && cell.date.getUTCMonth() === today.getUTCMonth()
  ).length

  const streak =
    currentStreak ??
    computeStreakFromSet(done, todayIso)

  return {
    weeks,
    months,
    checkins,
    windowDays,
    thisMonth,
    monthName: MONTHS[today.getUTCMonth()],
    longestBreak,
    busiestWeek,
    streak,
  }
}

function computeStreakFromSet(done: Set<string>, todayIso: string): number {
  let cursor = todayIso
  if (!done.has(cursor)) {
    cursor = shiftIso(cursor, -1)
    if (!done.has(cursor)) return 0
  }
  let streak = 0
  while (done.has(cursor)) {
    streak += 1
    cursor = shiftIso(cursor, -1)
  }
  return streak
}

function shiftIso(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00.000Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function utcIso(date: Date) {
  return date.toISOString().slice(0, 10)
}

function utcDay(iso: string) {
  return new Date(`${iso}T00:00:00.000Z`)
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

function sundayOnOrBefore(date: Date) {
  const day = date.getUTCDay()
  return addDays(date, -day)
}

function daysBetween(start: Date, date: Date) {
  return Math.round((date.getTime() - start.getTime()) / 86_400_000)
}

function formatLong(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}

function formatShort(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date)
}
