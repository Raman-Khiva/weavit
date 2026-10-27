"use client"

import React from "react"
import Link from "next/link"
import { ArrowRight, ArrowUpRight, Star, FolderOpen, Layers, FileText, BarChart2, Flame, Activity, Tags, Clock, Zap, Target, Shield, Keyboard, Database, Globe, Code2 } from "lucide-react"
import { FloatingNav } from "../components/floating-nav"
import { LandingInteractiveShowcase } from "../components/landing-interactive-showcase"
import { IntelligenceSimplicitySection } from "../components/intelligence-simplicity"
import { useAuth } from "@clerk/nextjs"
import { ReactLenis } from "lenis/react"
import "lenis/dist/lenis.css"

function Page(): JSX.Element {
  let getToken: (() => Promise<string | null>) | undefined
  try {
    const auth = useAuth()
    getToken = auth?.getToken
  } catch {}

  return (
    <ReactLenis
      root
      options={{
        duration: 1.8,
        easing: (t) => 1 - Math.pow(1 - t, 4),
        wheelMultiplier: 1.6,
        smoothWheel: true,
      }}
    >
      <div className="relative min-h-screen w-full bg-background text-foreground overflow-x-hidden font-sans">
        <FloatingNav />

        {/* ─── HERO ───────────────────────────────────────────────────────── */}
        <section className="relative flex flex-col justify-end overflow-hidden px-6 pb-16 pt-36 sm:px-12 lg:px-20">
          {/* Live badge */}
          <div className="mb-8 flex items-center gap-3">
            <span className="flex h-2 w-2 relative">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-[0.2em]">
              Weavit · Workspace Engine · v0.1
            </span>
          </div>

          {/* Oversized headline */}
          <div className="relative">
            <h1
              className="text-[clamp(2.4rem,5.5vw,4.25rem)] font-black leading-[0.95] tracking-[-0.04em] text-foreground select-none"
              style={{ fontFeatureSettings: '"ss01" 1' }}
            >
              <span className="block">Build</span>
              <span className="block text-muted-foreground/25">without</span>
              <span className="block">friction.</span>
            </h1>
          </div>

          {/* Subtitle + CTA + Ratings row */}
          <div className="mt-12 flex flex-col gap-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8">
              <p className="max-w-sm text-base text-muted-foreground leading-relaxed font-normal">
                Multi-phase roadmaps, daily habit loops, deadlines, and focus
                velocity — all in one centralized developer workspace.
              </p>
              <div className="flex items-center gap-4 shrink-0">
                <Link
                  href="/workspace"
                  className="group inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-bold text-background transition-all hover:gap-3"
                >
                  Open Workspace
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/overview"
                  className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
                >
                  Learn more
                </Link>
              </div>
            </div>

            {/* Rating badges */}
            <div className="flex items-center gap-8 flex-wrap">
              {[
                { name: "Product Hunt", rating: "4.9" },
                { name: "Dev Community", rating: "4.8" },
                { name: "GitHub", rating: "4.7" },
              ].map((badge) => (
                <div key={badge.name} className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-foreground text-foreground" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
                    {badge.rating} · {badge.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Decorative number */}
          <span
            className="pointer-events-none absolute right-[-0.05em] top-1/2 -translate-y-1/2 text-[clamp(5rem,10vw,8rem)] font-black text-muted/10 leading-none select-none hidden lg:block"
            aria-hidden
          >
            01
          </span>
        </section>

        {/* ─── TICKER STRIP ─────────────────────────────────────────────── */}
        <div className="w-full border-y border-border/50 py-3 overflow-hidden bg-card/30">
          <div className="flex animate-marquee whitespace-nowrap gap-12">
            {[
              "Roadmaps", "Daily Habits", "Deadlines", "Focus Velocity",
              "Task Execution", "Draft Notes", "Activity Logs", "Streak Tracking",
              "Roadmaps", "Daily Habits", "Deadlines", "Focus Velocity",
              "Task Execution", "Draft Notes", "Activity Logs", "Streak Tracking",
            ].map((item, i) => (
              <span key={i} className="text-xs font-mono font-semibold uppercase tracking-[0.18em] text-muted-foreground/60 shrink-0">
                {item}
                <span className="ml-12 text-border">·</span>
              </span>
            ))}
          </div>
        </div>

        <LandingInteractiveShowcase />
        <IntelligenceSimplicitySection />

        {/* ─── SECTION 02: STRUCTURED EXECUTION (left-heavy 60/40) ─────── */}
        <section className="relative w-full py-20 px-6 sm:px-12 lg:px-20 overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-start gap-16 lg:gap-0">
            {/* Left: content 60% */}
            <div className="lg:w-[60%] space-y-8">
              <p className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-muted-foreground/60">
                — 02 / Roadmaps & Plans
              </p>

              <h2 className="text-[clamp(1.85rem,3.6vw,3rem)] font-black leading-[0.9] tracking-[-0.03em] text-foreground">
                Structure any<br />
                <span className="italic font-serif font-normal text-muted-foreground/50">goal into</span><br />
                phases.
              </h2>

              <p className="max-w-md text-base text-muted-foreground leading-relaxed">
                SDE interview prep, side project, learning sprint — break it into
                phases, tasks, and logged execution notes. Progress is visible at every level.
              </p>

              <Link href="/workspace/projects" className="group inline-flex items-center gap-2 text-sm font-bold text-foreground hover:gap-3 transition-all">
                View Roadmaps <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Right: feature nav list 40% */}
            <div className="lg:w-[40%] lg:pt-24 lg:pl-8 space-y-10">
              <div className="space-y-5">
                {[
                  { icon: <FolderOpen className="h-5 w-5" />, label: "Roadmaps", active: true },
                  { icon: <Layers className="h-5 w-5" />, label: "Categories", active: false },
                  { icon: <FileText className="h-5 w-5" />, label: "Task Notes", active: false },
                  { icon: <BarChart2 className="h-5 w-5" />, label: "Progress Stats", active: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-4">
                    <span className={item.active ? "text-foreground" : "text-muted-foreground/40"}>
                      {item.icon}
                    </span>
                    <span className={`text-lg sm:text-xl font-bold tracking-tight transition-colors ${item.active ? "text-foreground" : "text-muted-foreground/30"}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                Nest plans as deep as the goal demands. Every phase tracks completion, categories, and timestamped execution logs.
              </p>
            </div>
          </div>

          <span className="pointer-events-none absolute right-[-0.05em] bottom-0 text-[clamp(4rem,8vw,7rem)] font-black text-muted/8 leading-none select-none hidden lg:block" aria-hidden>
            02
          </span>
        </section>

        {/* ─── DIVIDER ───────────────────────────────────────────────────── */}
        <div className="w-full h-px bg-border/40 mx-auto" />

        {/* ─── SECTION 03: DAILY MOMENTUM (right-heavy 40/60, flipped) ──── */}
        <section className="relative w-full py-20 px-6 sm:px-12 lg:px-20 overflow-hidden">
          <div className="flex flex-col lg:flex-row-reverse lg:items-start gap-16 lg:gap-0">
            {/* Right (visually): content 60% */}
            <div className="lg:w-[60%] lg:pl-16 space-y-8">
              <p className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-muted-foreground/60">
                — 03 / Habit Engine
              </p>

              <h2 className="text-[clamp(1.85rem,3.6vw,3rem)] font-black leading-[0.9] tracking-[-0.03em] text-foreground">
                Streaks that<br />
                <span className="italic font-serif font-normal text-amber-500/80">compound</span><br />
                daily.
              </h2>

              <p className="max-w-md text-base text-muted-foreground leading-relaxed">
                Reading, meditation, exercise, deep work. Track frequency, visualize
                streaks with 75-bar heatmaps, and maintain momentum across every discipline.
              </p>

              <Link href="/workspace/habits" className="group inline-flex items-center gap-2 text-sm font-bold text-foreground hover:gap-3 transition-all">
                Open Habits <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Left: feature nav + oversized number 40% */}
            <div className="lg:w-[40%] lg:pt-16 space-y-10">
              <p className="text-6xl font-black leading-none tracking-tighter font-mono text-amber-500/15 select-none">
                75
              </p>

              <div className="space-y-5">
                {[
                  { icon: <Flame className="h-5 w-5" />, label: "Habit Engine", active: true },
                  { icon: <Activity className="h-5 w-5" />, label: "Streak Heatmaps", active: false },
                  { icon: <Target className="h-5 w-5" />, label: "Frequency Tracking", active: false },
                  { icon: <Tags className="h-5 w-5" />, label: "Discipline Tags", active: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-4">
                    <span className={item.active ? "text-amber-500" : "text-muted-foreground/40"}>
                      {item.icon}
                    </span>
                    <span className={`text-lg sm:text-xl font-bold tracking-tight ${item.active ? "text-foreground" : "text-muted-foreground/30"}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <span className="pointer-events-none absolute left-[-0.05em] bottom-0 text-[clamp(4rem,8vw,7rem)] font-black text-muted/8 leading-none select-none hidden lg:block" aria-hidden>
            03
          </span>
        </section>

        {/* ─── DIVIDER ───────────────────────────────────────────────────── */}
        <div className="w-full h-px bg-border/40" />

        {/* ─── SECTION 04: BENTO CAPABILITY GRID ─────────────────────────── */}
        <section className="relative w-full py-20 px-6 sm:px-12 lg:px-20 overflow-hidden">
          <p className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-muted-foreground/60 mb-6">
            — 04 / Capabilities
          </p>

          <h2 className="text-[clamp(1.85rem,3.5vw,2.75rem)] font-black leading-[0.9] tracking-[-0.03em] text-foreground mb-16">
            Everything you need.<br />
            <span className="italic font-serif font-normal text-muted-foreground/40">Nothing you don&apos;t.</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Left column — 2 stacked cards (3/5 width) */}
            <div className="lg:col-span-3 space-y-5">
              {/* Card: Time Intelligence */}
              <div className="group relative rounded-2xl border border-border/40 bg-card/40 p-8 backdrop-blur-sm transition-all duration-300 hover:border-border/80 hover:bg-card/70 overflow-hidden">
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-start gap-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-background/80">
                    <Clock className="h-5 w-5 text-rose-400" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold tracking-tight text-foreground">Time Intelligence</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                      Priority-tagged milestones on a live calendar. Every completed task logged, every deadline visible. Never miss what matters.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-2">
                      {["Deadline Calendar", "Activity Timeline", "Priority Tags"].map((tag) => (
                        <span key={tag} className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground/60 border border-border/40 rounded-full px-3 py-1">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <span className="pointer-events-none absolute right-4 bottom-4 text-5xl font-black text-rose-500/5 leading-none select-none" aria-hidden>
                  TIME
                </span>
              </div>

              {/* Card: Focus Sessions */}
              <div className="group relative rounded-2xl border border-border/40 bg-card/40 p-8 backdrop-blur-sm transition-all duration-300 hover:border-border/80 hover:bg-card/70 overflow-hidden">
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-start gap-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-background/80">
                    <Zap className="h-5 w-5 text-violet-400" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold tracking-tight text-foreground">Focus Sessions</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                      Time-block your deepest work. Track velocity metrics, log draft notes mid-session, and maintain flow state without context-switching.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-2">
                      {["Deep Work Blocks", "Draft Notes", "Velocity Metrics"].map((tag) => (
                        <span key={tag} className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground/60 border border-border/40 rounded-full px-3 py-1">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <span className="pointer-events-none absolute right-4 bottom-4 text-5xl font-black text-violet-500/5 leading-none select-none" aria-hidden>
                  FLOW
                </span>
              </div>
            </div>

            {/* Right column — Testimonial block (2/5 width) */}
            <div className="lg:col-span-2">
              <div className="relative h-full rounded-2xl bg-indigo-600 p-8 sm:p-10 flex flex-col justify-between overflow-hidden min-h-[320px]">
                <div className="relative z-10 space-y-6">
                  <blockquote className="text-lg sm:text-xl font-semibold text-white leading-relaxed">
                    &ldquo;Weavit replaced my Notion boards, habit tracker app, and three different todo lists. Everything is in one place now — roadmaps, daily habits, deadlines. I actually finish what I start.&rdquo;
                  </blockquote>
                </div>
                <div className="relative z-10 flex items-center gap-4 mt-8">
                  <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                    RK
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Raman Khiva</p>
                    <p className="text-xs text-white/60">Full-Stack Developer</p>
                  </div>
                </div>
                {/* Decorative circles */}
                <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/5" aria-hidden />
                <div className="pointer-events-none absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-white/5" aria-hidden />
              </div>
            </div>
          </div>
        </section>

        {/* ─── DIVIDER ───────────────────────────────────────────────────── */}
        <div className="w-full h-px bg-border/40" />

        {/* ─── SECTION 05: BIG NUMBERS STRIP ─────────────────────────────── */}
        <section className="relative w-full py-24 px-6 sm:px-12 lg:px-20">
          <p className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-muted-foreground/60 mb-16">
            — 05 / System highlights
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-14 gap-x-8">
            {[
              { value: "100%", label: "Client-side architecture", sub: "No server round-trips for UI state" },
              { value: "<1ms", label: "State sync latency", sub: "Zustand store with instant reactivity" },
              { value: "0", label: "Config required", sub: "Open workspace and start executing" },
              { value: "∞", label: "Roadmap phases", sub: "Nest plans as deep as the goal demands" },
            ].map((stat, i) => (
              <div
                key={i}
                className="flex flex-col gap-2 border-t border-border/50 pt-6"
                style={{ paddingLeft: `${i % 2 === 1 ? "10%" : "0"}` }}
              >
                <p className="text-[clamp(2rem,4vw,2.75rem)] font-black leading-none tracking-tighter font-mono text-foreground">
                  {stat.value}
                </p>
                <p className="text-base font-bold text-foreground/80">{stat.label}</p>
                <p className="text-sm text-muted-foreground">{stat.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── DIVIDER ───────────────────────────────────────────────────── */}
        <div className="w-full h-px bg-border/40" />

        {/* ─── SECTION 06: BUILT FOR DEVELOPERS ──────────────────────────── */}
        <section className="relative w-full py-20 px-6 sm:px-12 lg:px-20 overflow-hidden">
          <p className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-muted-foreground/60 mb-6">
            — 06 / Philosophy
          </p>

          <h2 className="text-[clamp(1.85rem,4vw,3.25rem)] font-black leading-[0.88] tracking-[-0.04em] text-foreground mb-20">
            Built for devs<br />
            <span className="text-muted-foreground/25">who</span>{" "}
            <span className="italic font-serif font-normal">ship.</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {/* Column 1: Architecture */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Code2 className="h-5 w-5 text-foreground/70" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/70">Architecture</h3>
              </div>
              {[
                ["Client-side first", "All UI state lives in the browser — zero latency"],
                ["Zustand stores", "Reactive state management with surgical re-renders"],
                ["Instant feedback", "Every action reflects immediately, no spinners"],
              ].map(([title, desc]) => (
                <div key={title} className="space-y-1 border-l-2 border-border/40 pl-4">
                  <p className="text-sm font-bold text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            {/* Column 2: Workflow */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Keyboard className="h-5 w-5 text-foreground/70" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/70">Workflow</h3>
              </div>
              {[
                ["Zero config", "Open workspace and start — no onboarding walls"],
                ["Keyboard-first", "Navigate, create, and execute without lifting your hands"],
                ["Context preserved", "Draft notes and execution logs keep your train of thought"],
              ].map(([title, desc]) => (
                <div key={title} className="space-y-1 border-l-2 border-border/40 pl-4">
                  <p className="text-sm font-bold text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            {/* Column 3: Data */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Database className="h-5 w-5 text-foreground/70" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/70">Data</h3>
              </div>
              {[
                ["API-driven", "RESTful backend with OpenAPI spec and typed contracts"],
                ["Exportable", "Your data is yours — export roadmaps, habits, and logs"],
                ["Secure by default", "Clerk auth, scoped tokens, and encrypted transport"],
              ].map(([title, desc]) => (
                <div key={title} className="space-y-1 border-l-2 border-border/40 pl-4">
                  <p className="text-sm font-bold text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <span className="pointer-events-none absolute right-[-0.05em] top-1/2 -translate-y-1/2 text-[clamp(4rem,8vw,7rem)] font-black text-muted/5 leading-none select-none hidden lg:block" aria-hidden>
            DEV
          </span>
        </section>

        {/* ─── CTA ───────────────────────────────────────────────────────── */}
        <section className="relative w-full py-20 px-6 sm:px-12 lg:px-20 border-t border-border/40 overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-12">
            {/* Left: oversized stacked text */}
            <div className="lg:w-[60%]">
              <h2 className="text-[clamp(1.85rem,4vw,3.25rem)] font-black leading-[0.88] tracking-[-0.04em] text-foreground">
                Ready to<br />
                <span className="text-muted-foreground/30">stop</span><br />
                <span className="italic font-serif font-normal">planning.</span><br />
                Start executing.
              </h2>
            </div>

            {/* Right: CTA cluster */}
            <div className="lg:w-[35%] space-y-6 lg:pb-4">
              <p className="text-base text-muted-foreground leading-relaxed">
                No setup, no config, no onboarding walls. Open your workspace and hit the ground running.
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link
                  href="/workspace"
                  className="group shrink-0 inline-flex items-center gap-2.5 rounded-full bg-foreground px-8 py-4 text-base font-bold text-background transition-all hover:gap-4 hover:px-9"
                >
                  Open Workspace
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/overview"
                  className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
                >
                  See overview →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FOOTER ────────────────────────────────────────────────────── */}
        <footer className="w-full border-t border-border/40 py-10 px-6 sm:px-12 lg:px-20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-2.5 font-black text-foreground text-lg tracking-tight">
              <img src="/logo-weavit.png" alt="Weavit" className="h-5 w-auto" />
              weavit
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              © {new Date().getFullYear()} Weavit Platform · High-density workspace engine
            </p>
            <div className="flex items-center gap-6 text-xs font-semibold text-muted-foreground">
              <Link href="/overview" className="hover:text-foreground transition-colors">Overview</Link>
              <Link href="/workspace" className="hover:text-foreground transition-colors">Workspace</Link>
              <Link href="/workspace/projects" className="hover:text-foreground transition-colors">Roadmaps</Link>
            </div>
          </div>
        </footer>
      </div>
    </ReactLenis>
  )
}

export default Page
