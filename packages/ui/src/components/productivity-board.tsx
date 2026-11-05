"use client"

import { useState } from "react"
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  Flame,
  FolderKanban,
  Info,
  Lightbulb,
} from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

type Timeframe = "Day" | "Week" | "Month"

type QueueSlice = {
  done: number
  missed: number
  upcoming: number
}

const SCORES: Record<Timeframe, { score: number; trend: string; text: string }> = {
  Day: { score: 96, trend: "+4.2%", text: "today" },
  Week: { score: 92, trend: "+6.8%", text: "vs last week" },
  Month: { score: 95, trend: "+12.4%", text: "vs last month" },
}

const BARS = 50

const DONE = "#34d399"
const MISSED = "#f0b429"
const UPCOMING = "#4a4a4a"

export type ProductivityQueue = {
  key: string
  label: string
  slice: QueueSlice
}

export type ProductivityScore = {
  score: number
  trend: string
  text: string
}

export type ActivityKind = "habit" | "deadline" | "todo" | "plan"

export type ActivityItem = {
  id: string
  kind: ActivityKind
  title: string
  detail: string
  timeLabel?: string
}

function duePhrase(date: string) {
  const [year = 0, month = 1, day = 1] = date.split("-").map(Number)
  const due = new Date(year, month - 1, day)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diff = Math.round((due.getTime() - today.getTime()) / 86_400_000)

  if (diff === 0) return "due today"
  if (diff === 1) return "due tomorrow"
  if (diff < 0) return "overdue"
  return due.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function ScoreMeter({ score }: { score: number }) {
  const active = Math.round((score / 100) * BARS)

  return (
    <div className="flex w-full items-end gap-[2px]" aria-hidden>
      {Array.from({ length: BARS }).map((_, index) => (
        <span
          key={index}
          className={
            index < active
              ? "h-6 min-w-0 flex-1 rounded-full bg-emerald-500"
              : "h-6 min-w-0 flex-1 rounded-full bg-muted"
          }
        />
      ))}
    </div>
  )
}

function QueueBar({ label, slice }: { label: string; slice: QueueSlice }) {
  const total = Math.max(slice.done + slice.missed + slice.upcoming, 1)
  const segments = [
    { key: "done", value: slice.done, color: DONE },
    { key: "missed", value: slice.missed, color: MISSED },
    { key: "upcoming", value: slice.upcoming, color: UPCOMING },
  ]

  return (
    <div className="px-4 py-2.5">
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-medium text-foreground">{label}</h3>
        <p className="text-right text-[11px] tabular-nums text-muted-foreground">
          {slice.done} done · {slice.missed} missed · {slice.upcoming} upcoming
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div
          className="flex h-2 min-w-0 flex-1 overflow-hidden rounded-[4px]"
          role="img"
          aria-label={`${label}: ${slice.done} done, ${slice.missed} missed, ${slice.upcoming} upcoming`}
        >
          {segments.map((segment) =>
            segment.value > 0 ? (
              <span
                key={segment.key}
                className="h-full"
                style={{
                  width: `${(segment.value / total) * 100}%`,
                  backgroundColor: segment.color,
                }}
              />
            ) : null
          )}
        </div>
        <span className="w-6 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
          {slice.done + slice.missed + slice.upcoming}
        </span>
      </div>
    </div>
  )
}

const ACTIVITY_ICON: Record<
  ActivityKind,
  React.ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  habit: Flame,
  deadline: CalendarDays,
  todo: CheckCircle2,
  plan: FolderKanban,
}

export function RecentActivity({
  items,
  className,
}: {
  items: ActivityItem[]
  className?: string
}) {
  return (
    <section
      aria-label="Recent activity"
      className={cn(
        "flex min-h-0 flex-1 flex-col rounded-sm border border-border bg-card",
        className
      )}
    >
      <div className="flex shrink-0 items-center justify-between gap-2 px-4 pt-3.5 pb-2">
        <h3 className="text-sm font-semibold text-foreground">Recent activity</h3>
        <CircleDot className="size-3.5 text-muted-foreground" aria-hidden />
      </div>

      {items.length === 0 ? (
        <p className="px-4 pb-4 text-xs text-muted-foreground">
          Check-ins, completions, and plan moves will show up here.
        </p>
      ) : (
        <ol className="min-h-0 flex-1 space-y-0 overflow-y-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item, index) => {
            const Icon = ACTIVITY_ICON[item.kind]
            const isLast = index === items.length - 1
            return (
              <li key={item.id} className="relative flex gap-2.5">
                <div className="relative flex w-5 shrink-0 flex-col items-center">
                  <span className="relative z-10 mt-0.5 flex size-5 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
                    <Icon className="size-2.5" strokeWidth={2} />
                  </span>
                  {!isLast ? (
                    <span aria-hidden className="mt-0.5 w-px flex-1 bg-muted" />
                  ) : null}
                </div>
                <div className={cn("min-w-0 flex-1 pb-3", isLast && "pb-1")}>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-xs font-medium text-foreground">
                      {item.title}
                    </p>
                    {item.timeLabel ? (
                      <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                        {item.timeLabel}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}

export function NextUp({ title, due }: { title: string; due: string }) {
  return (
    <section className="mt-10 flex flex-col gap-3" aria-labelledby="next-up">
      <div>
        <h2 id="next-up" className="text-sm font-semibold text-foreground">
          Next up
        </h2>
        <p className="text-xs text-muted-foreground">
          The next piece of work waiting on you.
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-4 @min-[28rem]:flex-row @min-[28rem]:items-center @min-[28rem]:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid size-16 shrink-0 place-items-center rounded-[22px] border border-border text-foreground">
              <Lightbulb className="size-7" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{duePhrase(due)}</p>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-2 self-start text-sm font-medium text-foreground @min-[28rem]:self-center"
          >
            <span className="font-mono text-sm leading-none text-muted-foreground" aria-hidden>
              &gt;_
            </span>
            start now
          </button>
        </div>
      </div>
    </section>
  )
}

export function ProductivityBoard({
  className,
  score,
  queues,
}: {
  className?: string
  /** When provided, replaces the static score meter */
  score?: ProductivityScore
  /** When provided, replaces the static habit/deadline/todo bars */
  queues?: ProductivityQueue[]
}) {
  const [timeframe, setTimeframe] = useState<Timeframe>("Week")
  const current = score ?? SCORES[timeframe]
  const queueRows =
    queues ??
    ([
      { key: "habits", label: "Habits", slice: { done: 0, missed: 0, upcoming: 0 } },
      { key: "deadlines", label: "Deadlines", slice: { done: 0, missed: 0, upcoming: 0 } },
      { key: "todos", label: "Todos", slice: { done: 0, missed: 0, upcoming: 0 } },
    ] satisfies ProductivityQueue[])

  return (
    <section
      aria-label="Productivity"
      className={cn(
        "flex w-full shrink-0 flex-col rounded-sm border border-border bg-card",
        className
      )}
    >
      <div className="shrink-0 px-5 pt-5 pb-4">
        <header className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-5xl leading-none font-semibold tracking-tight text-foreground">
              {current.score}
              <span className="ml-2 text-2xl font-medium text-muted-foreground">/100</span>
            </p>
            <p className="mt-3 flex items-center gap-1 text-base font-semibold text-emerald-400">
              <ArrowUpRight className="size-4" />
              {current.trend}
              <span className="font-normal text-muted-foreground">{current.text}</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 pt-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg leading-none font-semibold text-foreground">Productivity</h2>
              <span
                className="text-muted-foreground"
                title="From habits, deadlines, and todos"
              >
                <Info className="size-4" aria-hidden />
                <span className="sr-only">From habits, deadlines, and todos</span>
              </span>
            </div>
            {!score && (
              <div className="flex items-center rounded-lg border border-border p-0.5">
                {(["Day", "Week", "Month"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setTimeframe(option)}
                    className={cn(
                      "rounded-md px-2 py-1 text-xs font-medium",
                      timeframe === option
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        <div className="mt-4">
          <ScoreMeter score={current.score} />
        </div>
      </div>

      <div className="mx-4 h-px bg-muted" />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ backgroundColor: DONE }} />
          Done
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ backgroundColor: MISSED }} />
          Missed
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ backgroundColor: UPCOMING }} />
          Upcoming
        </span>
      </div>

      {queueRows.map((queue) => (
        <div key={queue.key}>
          <div className="mx-4 h-px bg-muted" />
          <QueueBar label={queue.label} slice={queue.slice} />
        </div>
      ))}
    </section>
  )
}
