"use client"

import { useEffect, useMemo, useState } from "react"
import { CarIcon, CoffeeIcon, MapPinIcon, VideoIcon } from "lucide-react"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { cn } from "@workspace/ui/lib/utils"

interface Slot {
  type: "event" | "gap"
  start?: string
  end?: string
  title?: string
  location?: string
  attendees?: string[]
  tone?: "indigo" | "teal" | "amber" | "rose" | "violet"
  detail?: string
  gap?: { reason: string; minutes: number; Icon: typeof CoffeeIcon }
}

const TODAY: Slot[] = [
  {
    type: "event",
    start: "08:30",
    end: "09:00",
    title: "Eng standup",
    location: "Zoom · daily",
    tone: "indigo",
    attendees: ["MO", "JL", "RP"],
  },
  {
    type: "gap",
    gap: { reason: "Coffee + inbox", minutes: 30, Icon: CoffeeIcon },
  },
  {
    type: "event",
    start: "09:30",
    end: "10:30",
    title: "1:1 with Maya",
    location: "Studio · 4F window",
    tone: "amber",
    attendees: ["MO"],
  },
  { type: "gap", gap: { reason: "Travel", minutes: 20, Icon: CarIcon } },
  {
    type: "event",
    start: "10:50",
    end: "11:50",
    title: "BigCorp customer call",
    location: "Off-site · Soho House",
    tone: "teal",
    attendees: ["JL", "SB"],
    detail: "Renewal discussion · v3.4 walkthrough",
  },
  {
    type: "event",
    start: "13:00",
    end: "14:30",
    title: "Design crit",
    location: "Zoom + Studio",
    tone: "rose",
    attendees: ["DK", "JL", "RP", "MO", "SB"],
    detail: "Onboarding particle field & inset login",
  },
  {
    type: "event",
    start: "16:00",
    end: "16:30",
    title: "Audit log review",
    location: "Workspace #design",
    tone: "violet",
    attendees: ["MO", "JL"],
  },
]

const TOMORROW: Slot[] = [
  {
    type: "event",
    start: "09:00",
    end: "10:00",
    title: "Q2 roadmap planning",
    location: "Studio",
    tone: "violet",
    attendees: ["MO", "JL", "RP", "SB"],
  },
  {
    type: "event",
    start: "11:00",
    end: "12:00",
    title: "Sales review",
    location: "Zoom",
    tone: "teal",
    attendees: ["AT"],
  },
  {
    type: "event",
    start: "15:00",
    end: "16:30",
    title: "Sprint demo",
    location: "All-hands",
    tone: "rose",
    attendees: ["MO", "JL", "RP", "DK", "SB", "AT"],
  },
]

const TONE_BG: Record<NonNullable<Slot["tone"]>, string> = {
  indigo: "bg-indigo-500",
  teal: "bg-teal-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  violet: "bg-violet-500",
}

const TONE_RING: Record<NonNullable<Slot["tone"]>, string> = {
  indigo: "ring-indigo-500/40",
  teal: "ring-teal-500/40",
  amber: "ring-amber-500/40",
  rose: "ring-rose-500/40",
  violet: "ring-violet-500/40",
}

function toMinutes(hhmm: string) {
  const [h = 0, m = 0] = hhmm.split(":").map(Number)
  return h * 60 + m
}

/** "13:00" → "1:00 PM" */
function fmt12(hhmm: string) {
  const [h = 0, m = 0] = hhmm.split(":").map(Number)
  const suffix = h >= 12 ? "PM" : "AM"
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`
}

function fmtClock(d: Date) {
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

function fmtDay(d: Date) {
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

type EventPhase = "past" | "current" | "upcoming"

function eventPhase(slot: Slot, nowMin: number): EventPhase {
  if (!slot.start || !slot.end) return "upcoming"
  const start = toMinutes(slot.start)
  const end = toMinutes(slot.end)
  if (nowMin >= end) return "past"
  if (nowMin >= start && nowMin < end) return "current"
  return "upcoming"
}

export function AgendaTimeline({ className }: { className?: string }) {
  const now = useNow()
  const today = now ?? new Date()
  const tomorrow = useMemo(() => {
    const d = new Date(today)
    d.setDate(d.getDate() + 1)
    return d
  }, [today])

  const nowMin = today.getHours() * 60 + today.getMinutes()
  const eventCount = [...TODAY, ...TOMORROW].filter((s) => s.type === "event").length

  const current = TODAY.find(
    (s) => s.type === "event" && eventPhase(s, nowMin) === "current"
  )
  const nextUp = TODAY.find(
    (s) => s.type === "event" && eventPhase(s, nowMin) === "upcoming"
  )

  return (
    <div className={cn("w-full bg-background py-2", className)}>
      <div className="w-full max-w-none">
        <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
          {fmtDay(today)} · agenda
        </div>
        <h1 className="mt-1 font-heading text-3xl tracking-tight sm:text-4xl">
          Today and tomorrow
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {eventCount} events · live clock marks where you are.
        </p>

        {/* Sticky now summary so current time is obvious at a glance */}
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.08] px-3.5 py-2.5">
          <span className="relative flex size-2.5 shrink-0">
            <span className="absolute inset-0 rounded-full bg-emerald-500/60 motion-safe:animate-ping" />
            <span className="relative size-2.5 rounded-full bg-emerald-500" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
              Now · {now ? fmtClock(now) : "—"}
            </p>
            <p className="truncate text-sm font-medium text-foreground">
              {current
                ? `In progress: ${current.title}`
                : nextUp
                  ? `Free until ${nextUp.title} (${nextUp.start ? fmt12(nextUp.start) : ""})`
                  : "No more events today"}
            </p>
          </div>
        </div>

        <Section label="Today" date={fmtDay(today)} slots={TODAY} nowMin={nowMin} showNow />
        <Section
          label="Tomorrow"
          date={fmtDay(tomorrow)}
          slots={TOMORROW}
          nowMin={null}
          showNow={false}
        />
      </div>
    </div>
  )
}

function Section({
  label,
  date,
  slots,
  nowMin,
  showNow,
}: {
  label: string
  date: string
  slots: Slot[]
  nowMin: number | null
  showNow: boolean
}) {
  const rows = useMemo(() => {
    if (!showNow || nowMin == null) {
      return slots.map((slot, index) => ({ kind: "slot" as const, slot, index }))
    }
    return buildRowsWithNow(slots, nowMin)
  }, [slots, nowMin, showNow])

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-end justify-between">
        <span className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">
          {label}
        </span>
        <span className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">
          {date}
        </span>
      </div>
      <ol className="relative flex flex-col gap-1.5">
        {rows.map((row, i) =>
          row.kind === "now" ? (
            <NowMarker key={`now-${i}`} minutes={nowMin ?? 0} />
          ) : row.slot.type === "gap" ? (
            <GapRow key={row.index} slot={row.slot} past={isGapPast(row.slot, slots, row.index, nowMin)} />
          ) : (
            <EventRow
              key={row.index}
              slot={row.slot}
              phase={nowMin == null ? "upcoming" : eventPhase(row.slot, nowMin)}
              nowMin={nowMin}
            />
          )
        )}
      </ol>
    </section>
  )
}

function buildRowsWithNow(slots: Slot[], nowMin: number): Array<
  { kind: "slot"; slot: Slot; index: number } | { kind: "now" }
> {
  const out: Array<{ kind: "slot"; slot: Slot; index: number } | { kind: "now" }> = []
  let placed = false

  for (let index = 0; index < slots.length; index++) {
    const slot = slots[index]!

    if (slot.type === "event" && slot.start && slot.end) {
      const start = toMinutes(slot.start)
      const end = toMinutes(slot.end)

      // Now sits just before the event you're in, or before the next upcoming one
      if (!placed && nowMin < end && nowMin >= start) {
        out.push({ kind: "now" })
        placed = true
      } else if (!placed && nowMin < start) {
        out.push({ kind: "now" })
        placed = true
      }

      out.push({ kind: "slot", slot, index })
      continue
    }

    // gap: if now falls in this gap, place Now here
    if (!placed && slot.type === "gap") {
      const prev = [...slots.slice(0, index)].reverse().find((s) => s.type === "event" && s.end)
      const next = slots.slice(index + 1).find((s) => s.type === "event" && s.start)
      const gapStart = prev?.end ? toMinutes(prev.end) : 0
      const gapEnd = next?.start ? toMinutes(next.start) : 24 * 60
      if (nowMin >= gapStart && nowMin < gapEnd) {
        out.push({ kind: "now" })
        placed = true
      }
    }

    out.push({ kind: "slot", slot, index })
  }

  if (!placed) {
    out.push({ kind: "now" })
  }

  return out
}

function isGapPast(
  gap: Slot,
  slots: Slot[],
  index: number,
  nowMin: number | null
) {
  if (nowMin == null) return false
  const next = slots.slice(index + 1).find((s) => s.type === "event" && s.start)
  if (!next?.start) return false
  return nowMin >= toMinutes(next.start)
}

function NowMarker({ minutes }: { minutes: number }) {
  const label = fmt12(
    `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`
  )

  return (
    <li
      aria-label={`Current time ${label}`}
      className="relative z-10 my-1 flex items-center gap-3 py-1"
    >
      <span className="w-20 shrink-0 text-right font-mono text-[11px] font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">
        {label}
      </span>
      <span className="relative flex size-3 shrink-0">
        <span className="absolute inset-0 rounded-full bg-emerald-500/50 motion-safe:animate-ping" />
        <span className="relative size-3 rounded-full border-2 border-background bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.25)]" />
      </span>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="h-0.5 flex-1 rounded-full bg-emerald-500" />
        <span className="shrink-0 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-bold tracking-[0.14em] text-white uppercase">
          Now
        </span>
        <span className="h-0.5 w-8 rounded-full bg-emerald-500/50" />
      </div>
    </li>
  )
}

function GapRow({ slot, past }: { slot: Slot; past: boolean }) {
  if (!slot.gap) return null
  return (
    <li
      className={cn(
        "flex items-center gap-3 px-1 py-1.5 text-xs",
        past ? "text-muted-foreground/50" : "text-muted-foreground"
      )}
    >
      <span className="h-px flex-1 bg-border/50" />
      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.2em] uppercase">
        <slot.gap.Icon className="size-3" />
        {slot.gap.reason} · {slot.gap.minutes}m
      </span>
      <span className="h-px flex-1 bg-border/50" />
    </li>
  )
}

function EventRow({
  slot,
  phase,
  nowMin,
}: {
  slot: Slot
  phase: EventPhase
  nowMin: number | null
}) {
  const progress =
    phase === "current" && slot.start && slot.end && nowMin != null
      ? Math.min(
          100,
          Math.max(
            0,
            ((nowMin - toMinutes(slot.start)) /
              Math.max(1, toMinutes(slot.end) - toMinutes(slot.start))) *
              100
          )
        )
      : 0

  return (
    <li
      className={cn(
        "relative grid grid-cols-[4.75rem_1fr] gap-3 overflow-hidden rounded-xl border px-2 py-3 transition-colors",
        phase === "past" &&
          "border-border/40 bg-muted/20 opacity-55",
        phase === "current" &&
          cn(
            "border-emerald-500/40 bg-emerald-500/[0.06] ring-2 ring-emerald-500/25",
            TONE_RING[slot.tone ?? "indigo"]
          ),
        phase === "upcoming" &&
          "border-border/60 bg-card hover:bg-muted/30"
      )}
    >
      {phase === "current" ? (
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-1 bg-emerald-500"
        />
      ) : null}

      <div
        className={cn(
          "flex flex-col items-center justify-center font-mono text-[11px] leading-tight",
          phase === "past" && "text-muted-foreground",
          phase === "current" && "text-emerald-700 dark:text-emerald-300",
          phase === "upcoming" && "text-foreground"
        )}
      >
        <div className="font-semibold tabular-nums">{slot.start ? fmt12(slot.start) : ""}</div>
        <div className="text-muted-foreground tabular-nums">{slot.end ? fmt12(slot.end) : ""}</div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={cn(
            "h-12 w-1 shrink-0 rounded-full",
            phase === "past" ? "bg-muted-foreground/30" : TONE_BG[slot.tone ?? "indigo"]
          )}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div
              className={cn(
                "text-sm font-semibold",
                phase === "past" ? "text-muted-foreground" : "text-foreground"
              )}
            >
              {slot.title}
            </div>
            {phase === "current" ? (
              <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
                Happening now
              </span>
            ) : null}
            {phase === "past" ? (
              <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                Done
              </span>
            ) : null}
          </div>
          <div className="mt-0.5 flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
            {slot.location?.startsWith("Zoom") ? (
              <VideoIcon className="size-3" />
            ) : (
              <MapPinIcon className="size-3" />
            )}
            <span>{slot.location}</span>
          </div>
          {slot.detail ? (
            <div className="mt-1 text-xs text-muted-foreground">{slot.detail}</div>
          ) : null}
          {phase === "current" ? (
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-emerald-500/15">
              <div
                className="h-full rounded-full bg-emerald-500 transition-[width] duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          ) : null}
        </div>
        <div className="flex items-center -space-x-1.5">
          {slot.attendees?.slice(0, 4).map((a) => (
            <Avatar key={a} className="size-6 border-2 border-background">
              <AvatarFallback className="text-[9px]">{a}</AvatarFallback>
            </Avatar>
          ))}
          {(slot.attendees?.length ?? 0) > 4 ? (
            <span className="grid size-6 place-items-center rounded-full border-2 border-background bg-muted font-mono text-[9px]">
              +{(slot.attendees?.length ?? 0) - 4}
            </span>
          ) : null}
        </div>
      </div>
    </li>
  )
}
