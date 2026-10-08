"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  Zap,
  Target,
  Flame,
  Clock,
  CheckCircle2,
  Award,
  Sparkles,
  ArrowLeft,
  Activity,
  BarChart3,
  PieChart,
  Compass,
  ArrowUpRight,
  ShieldCheck,
  Sword,
  Crosshair,
  Info,
  Calendar,
  Repeat,
  AlertCircle,
} from "lucide-react"

// Helper component to render 180-Degree Semi-Circle Arc Chart
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

  // Total angle range = 180 degrees (from 180 to 0)
  const gap = 6 // 6 degrees gap between crisp flat butt segments
  const totalGaps = gap * 2
  const usableAngle = Math.max(0, 180 - totalGaps)
  
  const donePct = total > 0 ? done / total : 0
  const ongoingPct = total > 0 ? ongoing / total : 0
  const pendingPct = total > 0 ? pending / total : 0

  const doneSpan = usableAngle * donePct
  const ongoingSpan = usableAngle * ongoingPct
  const pendingSpan = usableAngle * pendingPct

  // Segment 1 (Done): 180 down to 180 - doneSpan
  const a1_start = 180
  const a1_end = 180 - doneSpan

  // Segment 2 (Ongoing): a1_end - gap down to a1_end - gap - ongoingSpan
  const a2_start = a1_end - gap
  const a2_end = a2_start - ongoingSpan

  // Segment 3 (Pending): a2_end - gap down to a2_end - gap - pendingSpan
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
      <svg viewBox="0 0 190 110" className="w-44 h-28 overflow-visible">
        {/* Track Background */}
        <path
          d={drawArc(180, 0)}
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
        />

        {/* Done Arc (Green) */}
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

        {/* Ongoing Arc (Amber) */}
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

        {/* Pending Arc (Red/Orange) */}
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

      {/* Center Text Label inside semi-circle arc */}
      <div className="absolute top-[50px] left-1/2 -translate-x-1/2 text-center">
        <span className="block text-2xl font-extrabold text-white font-mono leading-none">
          {centerLabel}
        </span>
        <span className="block text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">
          {centerSubtext}
        </span>
      </div>
    </div>
  )
}

export default function OverviewPage() {
  const [timeframe, setTimeframe] = useState<"Day" | "Week" | "Month">("Day")

  // Score metrics corresponding to timeframes (Day / Week / Month)
  const scoreData = {
    Day: { score: 96, trend: "+6.2%", text: "vs yesterday" },
    Week: { score: 94, trend: "+4.8%", text: "vs prior week" },
    Month: { score: 91, trend: "+7.2%", text: "vs prior month" },
  }

  const currentScore = scoreData[timeframe]
  const totalBars = 80 // 80 razor-thin, perfectly spaced vector bars

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black text-white selection:bg-red-600 selection:text-white">
      
      {/* 1. CENTRAL HERO COMPONENT: Full Screen Samurai Image & Vertical Beam Grounding */}
      <div className="absolute inset-0 flex items-end justify-center z-0 overflow-hidden bg-black">
        
        {/* Vertical Crimson Beam Extension aligned with the image center */}
        <div className="pointer-events-none absolute top-0 left-1/2 h-full w-[2px] -translate-x-1/2 bg-gradient-to-b from-red-500 via-red-600/80 to-transparent z-10 opacity-75" />
        <div className="pointer-events-none absolute top-0 left-1/2 h-full w-[35px] -translate-x-1/2 bg-red-600/10 blur-md z-0" />

        {/* Full Screen Height Image maintaining ratio */}
        <img
          src="/profile-weavit.jpeg"
          alt="Samurai Ronin Profile Spotlight"
          className="h-screen w-auto max-w-none object-cover object-bottom transition-all duration-700 hover:scale-[1.01] z-10"
        />

        {/* Dark Crimson Vignette & Edge Shadows for Perfect Black Canvas Integration */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80 z-20" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-black via-black/85 to-transparent z-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-black via-black/85 to-transparent z-20" />
        
        {/* Intense Crimson Ambient Center Bottom Glow */}
        <div className="pointer-events-none absolute bottom-0 h-[380px] w-[650px] rounded-full bg-gradient-to-t from-red-600/25 via-rose-600/10 to-transparent blur-3xl z-10" />
      </div>

      {/* 2. Top Header Navigation Bar (Red Neon Accents) */}
      <header className="relative z-30 flex items-center justify-between bg-black/60 px-6 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl bg-black/60 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:bg-red-950/40 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-red-400" />
            Dashboard
          </Link>
          <div className="h-4 w-[1px] bg-red-950" />
          <div className="flex items-center gap-2.5">
            <img src="/logo-weavit.png" alt="Weavit Logo" className="h-6 w-auto object-contain" />
            <h1 className="text-xs sm:text-sm font-semibold tracking-wider text-slate-200 uppercase">
              Alex Mercer <span className="text-red-500 font-normal">| Productive Command Canvas</span>
            </h1>
          </div>
        </div>

        {/* Status / Quick Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-full bg-red-950/40 px-3.5 py-1 text-xs font-bold text-red-400 backdrop-blur-md">
            <Sword className="h-3.5 w-3.5 text-red-500" />
            <span>RED BLADE ARCHITECT • LEVEL 42</span>
          </div>

          <Link
            href="/workspace"
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-rose-700 px-4 py-1.5 text-xs font-semibold text-white transition-all hover:brightness-125"
          >
            <Compass className="h-3.5 w-3.5" />
            Workspace
          </Link>
        </div>
      </header>

      {/* 3. Floating Overlay Layer: Canvas Layout with Spacing Gaps between Rows */}
      <div className="relative z-20 h-[calc(100vh-60px)] w-full p-6 pointer-events-none">
        <div className="grid grid-cols-12 gap-8 h-full items-center">
          
          {/* ==================== LEFT CANVAS COLUMN (Score -> Deadlines -> Habits with row gaps) ==================== */}
          <div className="col-span-12 md:col-span-5 lg:col-span-4 pointer-events-auto flex flex-col justify-center space-y-4">
            
            {/* ROW 1: Central Productivity Score & Vector Bar Meter */}
            <div className="rounded-2xl bg-black/75 p-5 backdrop-blur-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Productivity Score
                  </h2>
                  <div className="group relative flex items-center justify-center">
                    <Info className="h-3.5 w-3.5 text-slate-400 hover:text-emerald-400 cursor-pointer" />
                    <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-6 opacity-0 group-hover:opacity-100 transition-opacity z-50 rounded-md bg-slate-900 px-2.5 py-1 text-[10px] text-slate-200 shadow-xl whitespace-nowrap">
                      Calculated from focus hours, task velocity & habit completion
                    </div>
                  </div>
                </div>

                {/* Timeframe Filter Buttons */}
                <div className="flex items-center rounded-xl bg-white/5 p-0.5">
                  {(["Day", "Week", "Month"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTimeframe(t)}
                      className={`rounded-lg px-2.5 py-0.5 text-[11px] font-semibold transition-all ${
                        timeframe === t
                          ? "bg-white/20 text-white shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Score Display (Out of 100) */}
              <div className="flex items-baseline justify-between pt-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold tracking-tight text-white font-mono">
                    {currentScore.score}<span className="text-lg text-slate-400 font-normal font-sans ml-1">/100</span>
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  {currentScore.trend} <span className="text-slate-400 font-normal ml-1">{currentScore.text}</span>
                </div>
              </div>

              {/* Vector Bar Meter */}
              <div className="pt-2 w-full">
                <svg
                  viewBox="0 0 500 26"
                  className="w-full h-7 overflow-visible"
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
                        height={26}
                        rx={1.5}
                        className="transition-all duration-300"
                        fill={isActive ? "#10b981" : "rgba(255, 255, 255, 0.12)"}
                        style={
                          isActive
                            ? { filter: "drop-shadow(0px 0px 4px rgba(16, 185, 129, 0.7))" }
                            : undefined
                        }
                      />
                    )
                  })}
                </svg>
              </div>
            </div>

            {/* ROW 2: Deadlines Tracker (Alternating: Graphics on LEFT, Stats on RIGHT) */}
            <div className="rounded-2xl bg-black/75 p-5 backdrop-blur-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-red-500/15 text-red-500">
                    <Clock className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Deadlines Tracker
                  </h3>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  28 Active
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* Graphics on LEFT */}
                <SemiCircleGauge
                  done={18}
                  ongoing={6}
                  pending={4}
                  total={28}
                  centerLabel="18/28"
                  centerSubtext="64.3% Met"
                />

                {/* Stats on RIGHT */}
                <div className="flex-1 py-1">
                  <div className="flex items-center justify-between py-1.5 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                      <span className="text-xs font-medium text-slate-300">Done</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-white">18</span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_6px_#f59e0b]" />
                      <span className="text-xs font-medium text-slate-300">Ongoing</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-white">6</span>
                  </div>

                  <div className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_6px_#ef4444]" />
                      <span className="text-xs font-medium text-slate-300">Pending</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-white">4</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 3: Daily Habits & Tasks (Alternating: Stats on LEFT, Graphics on RIGHT) */}
            <div className="rounded-2xl bg-black/75 p-5 backdrop-blur-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-red-500/15 text-red-500">
                    <Repeat className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Daily Habits & Tasks
                  </h3>
                </div>
                <div className="flex items-center gap-1 text-red-400 text-xs font-bold">
                  <Flame className="h-3.5 w-3.5 text-red-500" /> 18 Streak
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Stats on LEFT */}
                <div className="flex-1 py-1">
                  <div className="flex items-center justify-between py-1.5 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                      <span className="text-xs font-medium text-slate-300">Done</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-white">10</span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_6px_#f59e0b]" />
                      <span className="text-xs font-medium text-slate-300">Ongoing</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-white">3</span>
                  </div>

                  <div className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_6px_#ef4444]" />
                      <span className="text-xs font-medium text-slate-300">Pending</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-white">2</span>
                  </div>
                </div>

                {/* Graphics on RIGHT */}
                <SemiCircleGauge
                  done={10}
                  ongoing={3}
                  pending={2}
                  total={15}
                  centerLabel="10/15"
                  centerSubtext="66.7% Done"
                />
              </div>
            </div>

          </div>


          {/* ==================== CENTER HERO SPACING (Unobstructed Samurai Image) ==================== */}
          <div className="col-span-12 md:col-span-2 lg:col-span-4 pointer-events-none" />


          {/* ==================== RIGHT CANVAS COLUMN (Donut -> Velocity -> Strike Precision with row gaps) ==================== */}
          <div className="col-span-12 md:col-span-5 lg:col-span-4 pointer-events-auto flex flex-col justify-center space-y-4">
            
            {/* ROW 1: Energy Distribution Crimson Donut Chart */}
            <div className="rounded-2xl bg-black/75 p-5 backdrop-blur-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-red-500/15 text-red-500">
                    <PieChart className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Energy Distribution
                  </h3>
                </div>
                <span className="text-xs font-mono text-red-400 font-bold">49.3h Total</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-black">
                  <div className="text-center">
                    <span className="text-sm font-bold text-white">45%</span>
                    <span className="block text-[8px] uppercase text-red-400 font-bold">Coding</span>
                  </div>
                </div>

                <div className="flex-1 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-slate-300 border-b border-white/10 pb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-red-500" /> Coding
                    </span>
                    <span className="font-mono text-slate-300 font-bold">22.0h</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300 border-b border-white/10 pb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-rose-600" /> Architecture
                    </span>
                    <span className="font-mono text-slate-300 font-bold">12.3h</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300 pt-0.5">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-red-800" /> Planning
                    </span>
                    <span className="font-mono text-slate-400">9.8h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 2: Focus Velocity */}
            <div className="rounded-2xl bg-black/75 p-5 backdrop-blur-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-red-500/15 text-red-500">
                    <Activity className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Focus Velocity
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-red-400">94.8 Avg</span>
              </div>

              <div className="flex h-24 items-end gap-2 pt-2">
                {[
                  { day: "M", h: 60, val: "6.5h" },
                  { day: "T", h: 85, val: "8.2h" },
                  { day: "W", h: 75, val: "7.8h" },
                  { day: "T", h: 98, val: "9.1h" },
                  { day: "F", h: 90, val: "8.5h" },
                  { day: "S", h: 45, val: "4.2h" },
                  { day: "S", h: 55, val: "5.0h" },
                ].map((item, idx) => (
                  <div key={idx} className="group relative flex flex-1 flex-col items-center justify-end h-full gap-1">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 text-[9px] font-bold text-red-300 bg-red-950/90 px-1.5 py-0.5 rounded border border-red-500/40 whitespace-nowrap shadow-lg">
                      {item.val}
                    </div>
                    <div className="w-full bg-red-950/30 rounded-t-md overflow-hidden h-full flex items-end">
                      <div
                        style={{ height: `${item.h}%` }}
                        className="w-full bg-gradient-to-t from-red-800 via-red-600 to-rose-400 rounded-t-md transition-all duration-300 group-hover:brightness-130"
                      />
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 group-hover:text-red-400">
                      {item.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ROW 3: Strike Precision & Task Velocity */}
            <div className="rounded-2xl bg-black/75 p-5 backdrop-blur-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-red-500/15 text-red-500">
                    <BarChart3 className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Strike Precision
                  </h3>
                </div>
                <span className="text-xs font-bold text-red-400">98.2% Precision</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Completed Strikes</span>
                  <span className="font-bold text-white font-mono">66 Tasks</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="rounded-xl bg-red-950/20 p-2">
                    <span className="block text-base font-bold text-red-400">1.2h</span>
                    <span className="text-[10px] text-slate-400">Avg / Strike</span>
                  </div>
                  <div className="rounded-xl bg-red-950/20 p-2">
                    <span className="block text-base font-bold text-rose-400">9.4</span>
                    <span className="text-[10px] text-slate-400">Strikes / Day</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
