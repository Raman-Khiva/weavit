"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  TrendingUp,
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
  Edit3,
  Share2,
  Compass,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react"

export default function OverviewPage() {
  const [userStatus, setUserStatus] = useState("⚡ In Deep Work Flow • Sprint #14")

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black text-white selection:bg-indigo-500 selection:text-white">
      
      {/* 1. MAIN HERO COMPONENT: Full Screen Height Centered Portrait Image */}
      <div className="absolute inset-0 flex items-end justify-center z-0 overflow-hidden bg-black">
        {/* Full Screen Height Image maintaining ratio */}
        <img
          src="/profile-weavit.jpeg"
          alt="User Profile Main Spotlight"
          className="h-screen w-auto max-w-none object-cover object-bottom transition-all duration-700 hover:scale-[1.01]"
        />

        {/* Dark Vignette / Seamless Gradient Overlays blending into black background */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/70" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-black via-black/80 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-black via-black/80 to-transparent" />
        
        {/* Subtle Ambient Bottom Center Glow */}
        <div className="pointer-events-none absolute bottom-0 h-[350px] w-[600px] rounded-full bg-gradient-to-t from-indigo-600/30 via-purple-600/15 to-transparent blur-3xl" />
      </div>

      {/* 2. Top Header Navigation Bar */}
      <header className="relative z-30 flex items-center justify-between border-b border-white/10 bg-black/40 px-6 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition-all hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Dashboard
          </Link>
          <div className="h-4 w-[1px] bg-white/15" />
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
            <h1 className="text-xs sm:text-sm font-semibold tracking-wider text-slate-200 uppercase">
              Alex Mercer <span className="text-indigo-400 font-normal">| Productive Overview</span>
            </h1>
          </div>
        </div>

        {/* Status / Quick Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>PRO ARCHITECT • LEVEL 42</span>
          </div>

          <Link
            href="/workspace"
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:brightness-110"
          >
            <Compass className="h-3.5 w-3.5" />
            Workspace
          </Link>
        </div>
      </header>

      {/* 3. Floating Overlay Layer: 4 Widgets Revolving Around the Main Image (2 Left, 2 Right) */}
      <div className="relative z-20 h-[calc(100vh-60px)] w-full p-6 pointer-events-none flex flex-col justify-between">
        
        {/* Main Grid for Left (Top & Middle) and Right (Top & Middle) Widgets */}
        <div className="grid grid-cols-12 gap-6 h-full items-center">
          
          {/* ==================== LEFT SIDE: 2 WIDGETS (Top & Middle) ==================== */}
          <div className="col-span-12 md:col-span-4 lg:col-span-3 flex flex-col justify-center h-full py-2 space-y-6">
            
            {/* WIDGET 1 (Top Left): Focus Trend Line/Bar Graph */}
            <div className="pointer-events-auto rounded-2xl border border-white/10 bg-black/70 p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-indigo-500/40 hover:bg-black/85">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <Activity className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Focus Trend
                  </h3>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                  94.8 Score
                </span>
              </div>

              <div className="mt-4">
                <div className="flex h-28 items-end gap-2 pt-2">
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
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 text-[9px] font-bold text-indigo-300 bg-slate-900/90 px-1.5 py-0.5 rounded border border-white/10 whitespace-nowrap">
                        {item.val}
                      </div>
                      <div className="w-full bg-white/5 rounded-t-md overflow-hidden h-full flex items-end">
                        <div
                          style={{ height: `${item.h}%` }}
                          className="w-full bg-gradient-to-t from-indigo-600 via-purple-500 to-cyan-400 rounded-t-md transition-all duration-300 group-hover:brightness-125"
                        />
                      </div>
                      <span className="text-[10px] font-medium text-slate-400 group-hover:text-white">
                        {item.day}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
                <span>Avg Focus: <strong className="text-white font-mono">7.0h/day</strong></span>
                <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                  <ArrowUpRight className="h-3 w-3" /> +12.4%
                </span>
              </div>
            </div>

            {/* WIDGET 2 (Middle Left): Habit Matrix & Streak */}
            <div className="pointer-events-auto rounded-2xl border border-white/10 bg-black/70 p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-purple-500/40 hover:bg-black/85">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    <Award className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Habit Matrix
                  </h3>
                </div>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  <Flame className="h-3.5 w-3.5" /> 18 Days
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { name: "Deep Code Architect", pct: 98, color: "from-indigo-500 to-cyan-400" },
                  { name: "System Optimization", pct: 92, color: "from-purple-500 to-pink-500" },
                  { name: "Mindfulness & Health", pct: 88, color: "from-emerald-400 to-teal-500" },
                ].map((h, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">{h.name}</span>
                      <span className="font-mono text-slate-400">{h.pct}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${h.color}`}
                        style={{ width: `${h.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>


          {/* ==================== CENTER SPACE: Dedicated to Full-Height Main Image ==================== */}
          <div className="col-span-12 md:col-span-4 lg:col-span-6 flex flex-col justify-end items-center h-full pb-4">
            {/* Center Personalization Overlay Tag at Image Foot */}
            <div className="pointer-events-auto flex flex-col items-center gap-1.5 rounded-2xl border border-white/15 bg-black/80 px-6 py-3 shadow-2xl backdrop-blur-2xl text-center max-w-md">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold tracking-widest text-indigo-300 uppercase">
                  {userStatus}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 italic">
                &ldquo;Weaving high-performance architecture into focused workflows.&rdquo;
              </p>
            </div>
          </div>


          {/* ==================== RIGHT SIDE: 2 WIDGETS (Top & Middle) ==================== */}
          <div className="col-span-12 md:col-span-4 lg:col-span-3 flex flex-col justify-center h-full py-2 space-y-6">
            
            {/* WIDGET 3 (Top Right): Time Distribution Donut Chart */}
            <div className="pointer-events-auto rounded-2xl border border-white/10 bg-black/70 p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/40 hover:bg-black/85">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    <PieChart className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Time Distribution
                  </h3>
                </div>
                <span className="text-xs font-mono text-cyan-300">49.3h Total</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-white/10 bg-slate-950/80">
                  <div className="text-center">
                    <span className="text-sm font-bold text-white">45%</span>
                    <span className="block text-[8px] uppercase text-slate-400">Coding</span>
                  </div>
                </div>

                <div className="flex-1 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-indigo-500" /> Coding
                    </span>
                    <span className="font-mono text-slate-400">22.0h</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-purple-500" /> Architecture
                    </span>
                    <span className="font-mono text-slate-400">12.3h</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-cyan-400" /> Planning
                    </span>
                    <span className="font-mono text-slate-400">9.8h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* WIDGET 4 (Middle Right): Task Output & Velocity Gauge */}
            <div className="pointer-events-auto rounded-2xl border border-white/10 bg-black/70 p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-amber-500/40 hover:bg-black/85">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <BarChart3 className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Task Output
                  </h3>
                </div>
                <span className="text-xs font-bold text-emerald-400">92% Rate</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Completed This Week</span>
                  <span className="font-bold text-white font-mono">66 Tasks</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-2">
                    <span className="block text-base font-bold text-amber-400">1.2h</span>
                    <span className="text-[10px] text-slate-400">Avg / Task</span>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-2">
                    <span className="block text-base font-bold text-cyan-400">9.4</span>
                    <span className="text-[10px] text-slate-400">Tasks / Day</span>
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
