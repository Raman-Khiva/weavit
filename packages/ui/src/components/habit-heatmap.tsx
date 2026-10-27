"use client"

import { useMemo, useState } from "react"
import { cn } from "@workspace/ui/lib/utils"

export type HabitHeatmapProps = {
  activeDays: number
  totalDays: number
  currentStreak: number
  longestStreak: number
  doneToday?: boolean
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
  activeDays,
  totalDays,
  currentStreak,
  longestStreak,
  doneToday = false,
  now,
  className,
}: HabitHeatmapProps) {
  const [hover, setHover] = useState<Cell | null>(null)

  const model = useMemo(
    () =>
      buildModel({
        activeDays,
        totalDays,
        currentStreak,
        longestStreak,
        doneToday,
        now: now ?? new Date(),
      }),
    [activeDays, totalDays, currentStreak, longestStreak, doneToday, now]
  )

  return (
    <section className={cn("flex flex-col gap-3", className)} aria-labelledby="habit-activity">
      <div>
        <h2 id="habit-activity" className="text-sm font-semibold">
          Activity
        </h2>
        <p className="text-xs text-white/50">
          {model.checkins} check-ins in the last {totalDays} days · {currentStreak} day streak
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
  if (cell.count === 0) return `No submissions on ${date}`
  const noun = cell.count === 1 ? "submission" : "submissions"
  return `${cell.count} ${noun} on ${date}`
}

function buildModel({
  activeDays,
  totalDays,
  currentStreak,
  longestStreak,
  doneToday,
  now,
}: Required<Omit<HabitHeatmapProps, "className">>) {
  const today = startOfDay(now)
  const total = Math.max(totalDays, 1)
  const windowStart = addDays(today, -(total - 1))
  const flags = buildFlags({ total, activeDays, currentStreak, longestStreak, doneToday })

  const gridEnd = addDays(sundayOnOrBefore(today), 6)
  const gridStart = addDays(gridEnd, -(53 * 7 - 1))
  const weeks: Cell[][] = []
  let week: Cell[] = []

  for (let cursor = gridStart; cursor.getTime() <= gridEnd.getTime(); cursor = addDays(cursor, 1)) {
    const offset = daysBetween(windowStart, cursor)
    const tracked = offset >= 0 && offset < total && cursor.getTime() <= today.getTime()
    const active = tracked && Boolean(flags[offset])
    const count = active ? volume(cursor) : 0

    week.push({
      iso: iso(cursor),
      date: cursor,
      count,
      level: levelFromCount(count),
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
    const firstOfMonth = days.find((cell) => cell.date.getDate() === 1)
    if (!firstOfMonth) return
    months.push({ label: MONTHS[firstOfMonth.date.getMonth()] ?? "", weekIndex })
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
    (cell) => cell.active && cell.date.getMonth() === today.getMonth()
  ).length

  return {
    weeks,
    months,
    checkins,
    thisMonth,
    monthName: MONTHS[today.getMonth()],
    longestBreak,
    busiestWeek,
  }
}

function buildFlags({
  total,
  activeDays,
  currentStreak,
  longestStreak,
  doneToday,
}: {
  total: number
  activeDays: number
  currentStreak: number
  longestStreak: number
  doneToday: boolean
}) {
  const flags = Array.from({ length: total }, () => false)
  const today = total - 1
  const streakLen = Math.min(currentStreak, doneToday ? total : Math.max(0, total - 1))
  const streakEnd = doneToday ? today : today - 1
  const streakStart = streakEnd - streakLen + 1

  for (let index = Math.max(0, streakStart); index <= streakEnd; index += 1) flags[index] = true

  const gap = streakStart - 1
  if (gap >= 0) flags[gap] = false

  const longest = Math.min(longestStreak, Math.max(0, gap))
  const longestEnd = gap - 1
  const longestStart = longestEnd - longest + 1
  if (longest > 0 && longestStart >= 0) {
    for (let index = longestStart; index <= longestEnd; index += 1) flags[index] = true
  }

  const separator = longestStart - 1
  if (separator >= 0) flags[separator] = false

  let remaining = activeDays - flags.filter(Boolean).length
  let cursor = 0
  const limit = Math.max(0, separator)
  while (remaining > 0 && cursor < limit) {
    const run = Math.min(longestStreak, remaining, limit - cursor)
    for (let step = 0; step < run; step += 1) {
      flags[cursor] = true
      cursor += 1
      remaining -= 1
    }
    if (cursor < limit) {
      flags[cursor] = false
      cursor += 1
    }
  }

  flags[today] = doneToday
  return flags
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function sundayOnOrBefore(date: Date) {
  const day = startOfDay(date).getDay()
  return addDays(startOfDay(date), -day)
}

function volume(date: Date) {
  const seed = date.getFullYear() * 400 + date.getMonth() * 32 + date.getDate()
  const mix = (seed * 17) % 13
  if (mix < 4) return 1 + (mix % 2)
  if (mix < 8) return 3 + (mix % 3)
  if (mix < 11) return 6 + (mix % 4)
  return 10 + (mix % 8)
}

function levelFromCount(count: number): Cell["level"] {
  if (count <= 0) return 0
  if (count <= 2) return 1
  if (count <= 5) return 2
  if (count <= 9) return 3
  return 4
}

function daysBetween(start: Date, date: Date) {
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())
  const dateUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  return Math.round((dateUtc - startUtc) / 86_400_000)
}

function iso(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function formatLong(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

function formatShort(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date)
}
