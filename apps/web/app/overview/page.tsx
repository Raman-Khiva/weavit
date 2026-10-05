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

// Helper component to render 180-Degree Semi-Circle Arc Chart (Large Size & Flat Sharp Edges)
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
  const cx = 110
  const cy = 105
  const r = 82
  const strokeWidth = 18

  // Total angle range = 180 degrees (from 180 to 0)
  const gap = 6 // 6 degrees gap for clean separation with sharp flat butt caps
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
      <svg viewBox="0 0 220 125" className="w-52 h-32 overflow-visible">
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
            style={{ filter: "drop-shadow(0px 0px 6px rgba(16, 185, 129, 0.75))" }}
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
            style={{ filter: "drop-shadow(0px 0px 6px rgba(245, 158, 11, 0.75))" }}
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
            style={{ filter: "drop-shadow(0px 0px 6px rgba(239, 68, 68, 0.75))" }}
          />
        )}
      </svg>

      {/* Center Text Label inside semi-circle arc */}
      <div className="absolute top-[60px] left-1/2 -translate-x-1/2 text-center">
        <span className="block text-3xl font-extrabold text-white font-mono leading-none">
          {centerLabel}
        </span>
        <span className="block text-[11px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">
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
        <div className="pointer-events-none absolute top-0 left-1/2 h-full w-[2px] -translate-x-1/2 bg-gradient-to-b from-red-500 via-red-600/80 to-transparent shadow-[0_0_20px_#ff0033] z-10 opacity-75" />
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
        <div className="pointer-events-none absolute bottom-0 h-[380px] w-[650px] rounded-full bg-gradient-to-t from-red-600/35 via-rose-600/15 to-transparent blur-3xl z-10" />
      </div>

      {/* 2. Top Header Navigation Bar (Red Neon Accents) */}
      <header className="relative z-30 flex items-center justify-between border-b border-red-950/60 bg-black/60 px-6 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl border border-red-900/40 bg-black/60 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-red-500/60 hover:bg-red-950/40 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-red-400" />
            Dashboard
          </Link>
          <div className="h-4 w-[1px] bg-red-950" />
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_#ff0033]" />
            <h1 className="text-xs sm:text-sm font-semibold tracking-wider text-slate-200 uppercase">
              Alex Mercer <span className="text-red-500 font-normal">| Productive Command</span>
            </h1>
          </div>
        </div>

        {/* Status / Quick Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-red-500/40 bg-red-950/40 px-3.5 py-1 text-xs font-bold text-red-400 shadow-[0_0_15px_rgba(255,0,51,0.15)] backdrop-blur-md">
            <Sword className="h-3.5 w-3.5 text-red-500" />
            <span>RED BLADE ARCHITECT • LEVEL 42</span>
          </div>

          <Link
            href="/workspace"
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-rose-700 px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-red-600/30 transition-all hover:brightness-125 hover:shadow-red-600/50"
          >
            <Compass className="h-3.5 w-3.5" />
            Workspace
          </Link>
        </div>
      </header>

      {/* 3. Floating Overlay Layer: Central Productivity Score + 4 Edge Widgets */}
      <div className="relative z-20 h-[calc(100vh-60px)] w-full p-6 pointer-events-none flex flex-col justify-between">
        
        {/* Main Grid: Left Column (Deadlines & Habits Widgets), Center Column (Productivity Score), Right Column (2 Widgets) */}
        <div className="grid grid-cols-12 gap-6 h-full items-center">
          
          {/* ==================== LEFT SIDE: 2 CORE PRODUCTIVITY WIDGETS (DEADLINES & DAILY HABITS) ==================== */}
          <div className="col-span-12 md:col-span-4 lg:col-span-3 flex flex-col justify-center h-full py-2 space-y-6">
            
            {/* WIDGET 1 (Top Left): Deadlines Progress Semi-Circle Arc Chart & Minimal Clean Stats */}
            <div className="pointer-events-auto rounded-2xl border border-red-900/40 bg-black/80 p-5 shadow-2xl shadow-red-950/40 backdrop-blur-xl transition-all duration-300 hover:border-red-500/60 hover:bg-black/90 hover:shadow-red-600/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/15 text-red-500 border border-red-500/30 shadow-[0_0_10px_rgba(255,0,51,0.2)]">
                    <Clock className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Deadlines Tracker
                  </h3>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  28 Active
                </span>
              </div>

              {/* Card Body: Semi-Circle Arc Chart (Left) + Minimal Clean List Stats (Right) */}
              <div className="flex items-center gap-4">
                <SemiCircleGauge
                  done={18}
                  ongoing={6}
                  pending={4}
                  total={28}
                  centerLabel="18/28"
                  centerSubtext="64.3% Met"
                />

                {/* Right Side Minimal List Stats (Dot -> Type -> Number with Separator Lines) */}
                <div className="flex-1 py-1">
                  {/* Done */}
                  <div className="flex items-center justify-between py-1.5 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                      <span className="text-xs font-medium text-slate-300">Done</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-white">18</span>
                  </div>

                  {/* Ongoing */}
                  <div className="flex items-center justify-between py-1.5 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_6px_#f59e0b]" />
                      <span className="text-xs font-medium text-slate-300">Ongoing</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-white">6</span>
                  </div>

                  {/* Pending */}
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

            {/* WIDGET 2 (Middle Left): Daily Habits & Recurring Tasks Arc Chart & Minimal Clean Stats */}
            <div className="pointer-events-auto rounded-2xl border border-red-900/40 bg-black/80 p-5 shadow-2xl shadow-red-950/40 backdrop-blur-xl transition-all duration-300 hover:border-red-500/60 hover:bg-black/90 hover:shadow-red-600/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/15 text-red-500 border border-red-500/30 shadow-[0_0_10px_rgba(255,0,51,0.2)]">
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

              {/* Card Body: Semi-Circle Arc Chart (Left) + Minimal Clean List Stats (Right) */}
              <div className="flex items-center gap-4">
                <SemiCircleGauge
                  done={10}
                  ongoing={3}
                  pending={2}
                  total={15}
                  centerLabel="10/15"
                  centerSubtext="66.7% Done"
                />

                {/* Right Side Minimal List Stats (Dot -> Type -> Number with Separator Lines) */}
                <div className="flex-1 py-1">
                  {/* Done */}
                  <div className="flex items-center justify-between py-1.5 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                      <span className="text-xs font-medium text-slate-300">Done</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-white">10</span>
                  </div>

                  {/* Ongoing */}
                  <div className="flex items-center justify-between py-1.5 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_6px_#f59e0b]" />
                      <span className="text-xs font-medium text-slate-300">Ongoing</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-white">3</span>
                  </div>

                  {/* Pending */}
                  <div className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_6px_#ef4444]" />
                      <span className="text-xs font-medium text-slate-300">Pending</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-white">2</span>
                  </div>
                </div>
              </div>
            </div>

          </div>


          {/* ==================== CENTER COLUMN: CENTRAL PRODUCTIVITY SCORE AT BOTTOM ==================== */}
          <div className="col-span-12 md:col-span-4 lg:col-span-6 flex flex-col justify-end items-center h-full pb-4">
            
            {/* CENTRAL PRODUCTIVITY SCORE CARD (Score out of 100 format) */}
            <div className="pointer-events-auto w-full max-w-lg rounded-2xl border border-white/15 bg-black/85 p-5 shadow-[0_0_40px_rgba(0,0,0,0.9)] backdrop-blur-2xl transition-all duration-300 hover:border-emerald-500/50">
              
              {/* Header: Title + Info Icon & Timeframe Switcher (Day / Week / Month) */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold tracking-tight text-white">
                    Productivity Score
                  </h2>
                  <div className="group relative flex items-center justify-center">
                    <Info className="h-3.5 w-3.5 text-slate-400 hover:text-emerald-400 cursor-pointer" />
                    <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-6 opacity-0 group-hover:opacity-100 transition-opacity z-50 rounded-md bg-slate-900 border border-white/10 px-2.5 py-1 text-[10px] text-slate-200 shadow-xl whitespace-nowrap">
                      Calculated from focus hours, task velocity & habit completion
                    </div>
                  </div>
                </div>

                {/* Timeframe Filter Options (Day / Week / Month) */}
                <div className="flex items-center rounded-xl border border-white/10 bg-white/5 p-1">
                  {(["Day", "Week", "Month"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTimeframe(t)}
                      className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
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

              {/* Score Metric Display (Out of 100) & Trend */}
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-4xl font-extrabold tracking-tight text-white font-mono">
                  {currentScore.score}<span className="text-xl text-slate-400 font-normal font-sans ml-1">/100</span>
                </span>
                <div className="flex items-center gap-1 text-xs font-bold">
                  <span className="text-emerald-400 flex items-center">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    {currentScore.trend}
                  </span>
                  <span className="text-slate-400 font-normal">{currentScore.text}</span>
                </div>
              </div>

              {/* SVG Vector Segmented Bar Meter - Out of 100 Scale */}
              <div className="mt-4 w-full">
                <svg
                  viewBox="0 0 500 30"
                  className="w-full h-8 overflow-visible"
                  preserveAspectRatio="none"
                >
                  {Array.from({ length: totalBars }).map((_, i) => {
                    const activeCount = Math.round((currentScore.score / 100) * totalBars)
                    const isActive = i < activeCount
                    const step = 500 / totalBars // 6.25 units step
                    const barWidth = 3.5 // Sleek ultra-thin bar width
                    const xPos = i * step

                    return (
                      <rect
                        key={i}
                        x={xPos}
                        y={0}
                        width={barWidth}
                        height={30}
                        rx={1.75}
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

          </div>


          {/* ==================== RIGHT SIDE: 2 THEMATIC RED WIDGETS ==================== */}
          <div className="col-span-12 md:col-span-4 lg:col-span-3 flex flex-col justify-center h-full py-2 space-y-6">
            
            {/* WIDGET 3 (Top Right): Time Distribution Crimson Donut Chart */}
            <div className="pointer-events-auto rounded-2xl border border-red-900/40 bg-black/80 p-5 shadow-2xl shadow-red-950/40 backdrop-blur-xl transition-all duration-300 hover:border-red-500/60 hover:bg-black/90 hover:shadow-red-600/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/15 text-red-500 border border-red-500/30 shadow-[0_0_10px_rgba(255,0,51,0.2)]">
                    <PieChart className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Energy Distribution
                  </h3>
                </div>
                <span className="text-xs font-mono text-red-400 font-bold">49.3h Total</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-red-600/40 bg-black shadow-[0_0_15px_rgba(255,0,51,0.2)]">
                  <div className="text-center">
                    <span className="text-sm font-bold text-white">45%</span>
                    <span className="block text-[8px] uppercase text-red-400 font-bold">Coding</span>
                  </div>
                </div>

                <div className="flex-1 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_6px_#ff0033]" /> Coding
                    </span>
                    <span className="font-mono text-slate-400">22.0h</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-rose-600 shadow-[0_0_6px_#e60039]" /> Architecture
                    </span>
                    <span className="font-mono text-slate-400">12.3h</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-red-800" /> Planning
                    </span>
                    <span className="font-mono text-slate-400">9.8h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* WIDGET 4 (Middle Right): Strike Rate & Task Velocity */}
            <div className="pointer-events-auto rounded-2xl border border-red-900/40 bg-black/80 p-5 shadow-2xl shadow-red-950/40 backdrop-blur-xl transition-all duration-300 hover:border-red-500/60 hover:bg-black/90 hover:shadow-red-600/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/15 text-red-500 border border-red-500/30 shadow-[0_0_10px_rgba(255,0,51,0.2)]">
                    <BarChart3 className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Strike Rate
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
                  <div className="rounded-xl border border-red-900/30 bg-red-950/20 p-2">
                    <span className="block text-base font-bold text-red-400">1.2h</span>
                    <span className="text-[10px] text-slate-400">Avg / Strike</span>
                  </div>
                  <div className="rounded-xl border border-red-900/30 bg-red-950/20 p-2">
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
