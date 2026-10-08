"use client"

import React, { useState } from "react"
import { ArrowUpRight, Clock, Info, Repeat, Flame } from "lucide-react"

function SemiCircleGauge({
  done,
  ongoing,
  pending,
  total,
  centerLabel,
  centerSubtext,
}: {
  done: number
  ongoing: number
  pending: number
  total: number
  centerLabel: string
  centerSubtext: string
}) {
  const cx = 95
  const cy = 90
  const r = 70
  const strokeWidth = 16

  const gap = 6
  const totalGaps = gap * 2
  const usableAngle = Math.max(0, 180 - totalGaps)

  const donePct = total > 0 ? done / total : 0
  const ongoingPct = total > 0 ? ongoing / total : 0
  const pendingPct = total > 0 ? pending / total : 0

  const doneSpan = usableAngle * donePct
  const ongoingSpan = usableAngle * ongoingPct
  const pendingSpan = usableAngle * pendingPct

  const a1_start = 180
  const a1_end = 180 - doneSpan

  const a2_start = a1_end - gap
  const a2_end = a2_start - ongoingSpan

  const a3_start = a2_end - gap
  const a3_end = Math.max(0, a3_start - pendingSpan)

  const polarToCartesian = (angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180
    return {
      x: cx + r * Math.cos(rad),
      y: cy - r * Math.sin(rad),
    }
  }

  const drawArc = (startAngle: number, endAngle: number) => {
    if (startAngle <= endAngle) return ""
    const p1 = polarToCartesian(startAngle)
    const p2 = polarToCartesian(endAngle)
    const largeArc = startAngle - endAngle > 180 ? 1 : 0
    return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${largeArc} 1 ${p2.x} ${p2.y}`
  }

  return (
    <div className="relative flex flex-col items-center justify-center shrink-0">
      <svg viewBox="0 0 190 110" className="w-36 h-24 overflow-visible">
        <path
          d={drawArc(180, 0)}
          fill="none"
          stroke="rgba(148, 163, 184, 0.15)"
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
        />

        {done > 0 && doneSpan > 0 && (
          <path
            d={drawArc(a1_start, a1_end)}
            fill="none"
            stroke="#10b981"
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
            className="transition-all duration-700"
            style={{ filter: "drop-shadow(0px 0px 5px rgba(16, 185, 129, 0.75))" }}
          />
        )}

        {ongoing > 0 && ongoingSpan > 0 && (
          <path
            d={drawArc(a2_start, a2_end)}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
            className="transition-all duration-700"
            style={{ filter: "drop-shadow(0px 0px 5px rgba(245, 158, 11, 0.75))" }}
          />
        )}

        {pending > 0 && pendingSpan > 0 && (
          <path
            d={drawArc(a3_start, a3_end)}
            fill="none"
            stroke="#ef4444"
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
            className="transition-all duration-700"
            style={{ filter: "drop-shadow(0px 0px 5px rgba(239, 68, 68, 0.75))" }}
          />
        )}
      </svg>

      <div className="absolute top-[48px] flex flex-col items-center justify-center text-center">
        <span className="font-mono text-base font-extrabold tracking-tight text-foreground">
          {centerLabel}
        </span>
        <span className="text-[10px] font-semibold text-muted-foreground">
          {centerSubtext}
        </span>
      </div>
    </div>
  )
}

export function ProductivityGraphicCard() {
  const [timeframe, setTimeframe] = useState<"Day" | "Week" | "Month">("Week")

  const scores = {
    Day: { score: 96, trend: "+4.2%", text: "today" },
    Week: { score: 92, trend: "+6.8%", text: "vs last week" },
    Month: { score: 95, trend: "+12.4%", text: "vs last month" },
  }

  const currentScore = scores[timeframe]
  const totalBars = 75

  return (
    <div className="flex h-full w-full flex-col justify-between overflow-y-auto space-y-4 rounded-xl p-1">
      {/* Productivity Score & Vector Bar Meter */}
      <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-border/40">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-foreground">
              Productivity Graphic
            </h2>
            <div className="group relative flex items-center justify-center">
              <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-emerald-500 cursor-pointer" />
              <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-6 opacity-0 group-hover:opacity-100 transition-opacity z-50 rounded-md bg-popover border border-border px-2.5 py-1 text-[10px] text-popover-foreground shadow-xl whitespace-nowrap">
                Calculated from focus hours, task velocity & habit completion
              </div>
            </div>
          </div>

          <div className="flex items-center rounded-lg bg-muted/50 p-0.5">
            {(["Day", "Week", "Month"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`rounded-md px-2 py-0.5 text-[10px] font-semibold transition-all ${
                  timeframe === t
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold tracking-tight text-foreground font-mono">
              {currentScore.score}
            </span>
            <span className="text-sm font-normal text-muted-foreground">/100</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-500">
            <ArrowUpRight className="h-3.5 w-3.5" />
            {currentScore.trend} <span className="text-muted-foreground font-normal ml-0.5">{currentScore.text}</span>
          </div>
        </div>

        {/* Vector Bar Meter */}
        <div className="pt-1 w-full">
          <svg
            viewBox="0 0 500 24"
            className="w-full h-6 overflow-visible"
            preserveAspectRatio="none"
          >
            {Array.from({ length: totalBars }).map((_, i) => {
              const activeCount = Math.round((currentScore.score / 100) * totalBars)
              const isActive = i < activeCount
              const step = 500 / totalBars
              const barWidth = 3.5
              const xPos = i * step

              return (
                <rect
                  key={i}
                  x={xPos}
                  y={0}
                  width={barWidth}
                  height={24}
                  rx={2}
                  className="transition-all duration-300"
                  fill={isActive ? "#10b981" : "rgba(148, 163, 184, 0.2)"}
                  style={
                    isActive
                      ? { filter: "drop-shadow(0px 0px 3px rgba(16, 185, 129, 0.7))" }
                      : undefined
                  }
                />
              )}
            )}
          </svg>
        </div>
      </div>

      {/* Deadlines Arc Gauge Tracker */}
      <div className="rounded-xl border border-border/60 bg-card/60 p-3.5 backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-red-500/10 text-red-500">
              <Clock className="h-3.5 w-3.5" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Deadlines Tracker
            </h3>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
            28 Active
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <SemiCircleGauge
            done={18}
            ongoing={6}
            pending={4}
            total={28}
            centerLabel="18/28"
            centerSubtext="64% Met"
          />

          <div className="flex-1 space-y-1 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-border/40">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground font-medium">Done</span>
              </div>
              <span className="font-mono font-bold text-foreground">18</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-border/40">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-muted-foreground font-medium">Ongoing</span>
              </div>
              <span className="font-mono font-bold text-foreground">6</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <span className="text-muted-foreground font-medium">Pending</span>
              </div>
              <span className="font-mono font-bold text-foreground">4</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
