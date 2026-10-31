"use client"

import { useState } from "react"
import { ArrowUpRight, Info, Lightbulb } from "lucide-react"
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

const QUEUES: { key: string; label: string; slice: QueueSlice }[] = [
  { key: "habits", label: "Habits", slice: { done: 3, missed: 1, upcoming: 2 } },
  { key: "deadlines", label: "Deadlines", slice: { done: 1, missed: 1, upcoming: 3 } },
  { key: "todos", label: "Todos", slice: { done: 2, missed: 1, upcoming: 1 } },
]

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
              : "h-6 min-w-0 flex-1 rounded-full bg-white/15"
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
    <div className="px-4 py-3.5">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-medium text-white">{label}</h3>
        <p className="text-right text-[11px] tabular-nums text-white/45">
          {slice.done} done · {slice.missed} missed · {slice.upcoming} upcoming
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div
          className="flex h-4 min-w-0 flex-1 overflow-hidden rounded-[4px]"
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
        <span className="w-6 shrink-0 text-right text-xs tabular-nums text-white/70">
          {slice.done + slice.missed + slice.upcoming}
        </span>
      </div>
    </div>
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
            <span className="grid size-16 shrink-0 place-items-center rounded-[22px] border border-white/20 text-white">
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
            <span className="font-mono text-sm leading-none text-white/70" aria-hidden>
              &gt;_
            </span>
            start now
          </button>
        </div>
      </div>
    </section>
  )
}

export function ProductivityBoard({ className }: { className?: string }) {
  const [timeframe, setTimeframe] = useState<Timeframe>("Week")
  const current = SCORES[timeframe]

  return (
    <section
      aria-label="Productivity"
      className={cn(
        "flex w-full flex-col rounded-sm border border-white/10 bg-white/[0.03]",
        className
      )}
    >
      <div className="shrink-0 px-5 pt-5 pb-4">
        <header className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg leading-none font-semibold text-white">Productivity</h2>
            <span
              className="text-white/35"
              title="From focus, finished work, and habit check-ins"
            >
              <Info className="size-4" aria-hidden />
              <span className="sr-only">From focus, finished work, and habit check-ins</span>
            </span>
          </div>
          <div className="flex items-center rounded-lg border border-white/10 p-0.5">
            {(["Day", "Week", "Month"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setTimeframe(option)}
                className={cn(
                  "rounded-md px-2 py-1 text-xs font-medium",
                  timeframe === option
                    ? "bg-white/10 text-white"
                    : "text-white/45 hover:text-white"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </header>

        <p className="text-5xl leading-none font-semibold tracking-tight text-white">
          {current.score}
          <span className="ml-2 text-2xl font-medium text-white/45">/100</span>
        </p>
        <p className="mt-3 flex items-center gap-1 text-base font-semibold text-emerald-400">
          <ArrowUpRight className="size-4" />
          {current.trend}
          <span className="font-normal text-white/45">{current.text}</span>
        </p>
        <div className="mt-4">
          <ScoreMeter score={current.score} />
        </div>
      </div>

      <div className="mx-4 h-px bg-white/10" />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5 text-[11px] text-white/50">
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

      {QUEUES.map((queue) => (
        <div key={queue.key}>
          <div className="mx-4 h-px bg-white/10" />
          <QueueBar label={queue.label} slice={queue.slice} />
        </div>
      ))}
    </section>
  )
}
