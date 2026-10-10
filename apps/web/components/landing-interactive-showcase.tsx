"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  FolderOpen,
  Zap,
  Clock,
  BarChart2,
  CheckCircle2,
  ArrowRight,
  Sliders,
  Code,
  Headphones,
  FileText,
  MinusCircle,
  Calendar,
  CheckSquare,
  Sparkles
} from "lucide-react"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@workspace/ui/components/accordion"

const WORKSPACE_MODULES = [
  {
    id: "roadmaps",
    label: "Roadmaps Engine",
    icon: FolderOpen,
    headline: "Multi-Phase Goal & Sprint Execution",
    description: "Structure complex objectives into categorized phases, executable tasks, and live note logs.",
    cta: "Explore Roadmaps",
    link: "/workspace/projects",
    features: [
      {
        title: "Nested Phase Progression",
        description: "Break down multi-week goals like SDE interview prep or software MVPs into structured, executable phases.",
      },
      {
        title: "Context-Aware Task Log Notes",
        description: "Append timestamped note logs to tasks directly during execution without context switching.",
      },
    ],
    mockup: {
      title: "SDE Technical Interview Master Prep",
      phase: "Phase 1: Data Structures & Algorithms",
      tasks: [
        { title: "Arrays & Hashing: LeetCode 1, 49, 347", status: "completed", note: "Mastered hash map lookups & prefix sums." },
        { title: "Sliding Window: Trapping Rain Water", status: "completed", note: "Shrinking window contract logic verified." },
        { title: "Trees & BST: BFS, DFS, LCA", status: "in_progress", note: "Practiced Lowest Common Ancestor." }
      ]
    }
  },
  {
    id: "habits",
    label: "Habit Loop",
    icon: Zap,
    headline: "Daily Streak & Habit Management",
    description: "Build consistency with daily habit trackers, category tags, and streak counters.",
    cta: "Manage Habits",
    link: "/workspace/habits",
    features: [
      {
        title: "Category Streak Tracking",
        description: "Monitor daily habit streaks with instant completion toggles and best-streak records.",
      },
      {
        title: "Prioritized Todo Checklist",
        description: "Maintain high-priority daily tasks with tags, subtasks, and progress indicators.",
      },
    ],
    mockup: {
      title: "Daily Focus Routine",
      habits: [
        { name: "LeetCode Daily Challenge", streak: "14 Day Streak", status: "completed" },
        { name: "System Design Chapter Review", streak: "8 Day Streak", status: "completed" },
        { name: "Code Refactoring & Unit Tests", streak: "5 Day Streak", status: "pending" }
      ]
    }
  },
  {
    id: "deadlines",
    label: "Deadline HUD",
    icon: Clock,
    headline: "Mini Calendar & Count Badges",
    description: "Never miss a deadline with date-specific pending count badges and priority alerts.",
    cta: "View Deadlines",
    link: "/workspace/deadlines",
    features: [
      {
        title: "Prioritized Color Badges",
        description: "Current-day deadlines feature rose badges, while upcoming dates display amber indicator badges.",
      },
      {
        title: "Hover Context Tooltips",
        description: "Hover over calendar days to view detailed deadline titles, time slots, and course info.",
      },
    ],
    mockup: {
      title: "Upcoming Milestones",
      deadlines: [
        { title: "OS Virtual Memory Assignment", course: "CS 401", tag: "Today", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
        { title: "System Design Prototype Review", course: "Project Alpha", tag: "Tomorrow", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" }
      ]
    }
  },
  {
    id: "analytics",
    label: "Focus Velocity",
    icon: BarChart2,
    headline: "Vector Metrics & Focus Tracking",
    description: "Visualize focus score, active work sessions, and daily execution velocity.",
    cta: "View Overview",
    link: "/overview",
    features: [
      {
        title: "75-Bar Vector Meter",
        description: "Dynamic productivity score calculation combining task completions and habit velocity.",
      },
      {
        title: "Horizontal Day Timeline",
        description: "Track work sessions and system events chronologically across the dashboard top bar.",
      },
    ],
    mockup: {
      title: "Productivity Score",
      score: "92 / 100",
      stats: [
        { label: "Active Focus", val: "4.5 hrs" },
        { label: "Task Velocity", val: "94%" },
        { label: "Habit Rate", val: "100%" }
      ]
    }
  },
]

export function LandingInteractiveShowcase() {
  const [activeModuleId, setActiveModuleId] = useState<string>("roadmaps")
  const currentModule = WORKSPACE_MODULES.find((m) => m.id === activeModuleId) ?? WORKSPACE_MODULES[0]!

  return (
    <div className="w-full space-y-28 py-12">
      {/* SECTION 1: INTERACTIVE WORKSPACE PREVIEW TABS */}
      <section className="w-full max-w-6xl mx-auto px-6">
        <div className="text-center space-y-3 mb-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-3.5 py-1.5 text-xs font-semibold text-foreground backdrop-blur-md shadow-xs mb-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span>Interactive Workspace</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-center text-foreground max-w-4xl mx-auto leading-tight">
            Explore the <span className="font-serif italic font-normal text-foreground/90">modules</span> <br />
            powering your execution
          </h2>
        </div>

        {/* 4 Workspace Module Tab Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10">
          {WORKSPACE_MODULES.map((module) => {
            const Icon = module.icon
            const isActive = activeModuleId === module.id
            return (
              <button
                key={module.id}
                onClick={() => setActiveModuleId(module.id)}
                className={`group relative rounded-2xl border p-5 sm:p-6 flex flex-col items-center justify-center gap-3 transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "bg-card/90 border-border/80 shadow-xl ring-1 ring-border/50 scale-[1.02]"
                    : "bg-card/30 border-border/30 hover:bg-card/60 hover:border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                <div
                  className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? "bg-foreground text-background shadow-md"
                      : "bg-muted/40 text-muted-foreground group-hover:bg-muted/70 group-hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                </div>
                <span
                  className={`text-xs sm:text-sm font-semibold tracking-wide transition-colors ${
                    isActive ? "text-foreground font-bold" : "text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  {module.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Active Module Content Showcase & Live Mockup */}
        <div className="rounded-3xl border border-border/60 bg-card/60 p-6 sm:p-10 backdrop-blur-xl shadow-2xl space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Headline & Features */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  Featured Module
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  {currentModule.headline}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {currentModule.description}
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {currentModule.features.map((feature, idx) => (
                  <div key={idx} className="space-y-1">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>{feature.title}</span>
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  href={currentModule.link}
                  className="inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-xs sm:text-sm font-bold text-background shadow-md transition-all hover:scale-[1.02]"
                >
                  <span>{currentModule.cta}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Right Column: Mini Interactive UI Card Mockup */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-border/80 bg-background/90 p-5 sm:p-6 shadow-xl backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-mono font-bold text-foreground">
                      {currentModule.mockup.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">
                    Live Status
                  </span>
                </div>

                {/* Module-specific Mockup Content */}
                {currentModule.id === "roadmaps" && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground">
                      {currentModule.mockup.phase}
                    </p>
                    <div className="space-y-2">
                      {currentModule.mockup.tasks?.map((t, i) => (
                        <div key={i} className="p-3 rounded-xl border border-border/60 bg-card/50 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-foreground">{t.title}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              t.status === "completed" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            }`}>
                              {t.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground italic">"{t.note}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentModule.id === "habits" && (
                  <div className="space-y-2">
                    {currentModule.mockup.habits?.map((h, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-card/50 text-xs">
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className={`h-4 w-4 ${h.status === "completed" ? "text-emerald-500" : "text-muted-foreground/40"}`} />
                          <span className="font-semibold text-foreground">{h.name}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                          {h.streak}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {currentModule.id === "deadlines" && (
                  <div className="space-y-3">
                    {currentModule.mockup.deadlines?.map((d, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-card/50 text-xs">
                        <div className="space-y-0.5">
                          <p className="font-bold text-foreground">{d.title}</p>
                          <p className="text-[10px] text-muted-foreground">{d.course}</p>
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${d.color}`}>
                          {d.tag}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {currentModule.id === "analytics" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-card/50">
                      <span className="text-xs font-semibold text-muted-foreground">Focus Score</span>
                      <span className="text-xl font-extrabold font-mono text-emerald-500">{currentModule.mockup.score}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {currentModule.mockup.stats?.map((s, i) => (
                        <div key={i} className="p-2.5 rounded-xl border border-border/40 bg-card/30 text-center space-y-0.5">
                          <p className="text-[10px] font-semibold text-muted-foreground">{s.label}</p>
                          <p className="text-xs font-bold font-mono text-foreground">{s.val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: 3-STEP EXECUTION TIMELINE */}
      <section className="w-full max-w-6xl mx-auto px-6">
        <div className="text-center space-y-3 mb-16 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-3.5 py-1.5 text-xs font-semibold text-foreground backdrop-blur-md shadow-xs mb-1">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span>Workflow Architecture</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-center text-foreground max-w-4xl mx-auto leading-tight">
            From chaos to <span className="font-serif italic font-normal text-foreground/90">peak flow</span> <br />
            in 3 simple steps
          </h2>

          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            A structured execution pipeline engineered to keep you focused on what matters most.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {[
            {
              step: "01",
              title: "Define & Structure",
              description: "Build multi-phase engineering roadmaps with task categories, priorities, and deadlines.",
              icon: <FolderOpen className="h-6 w-6 text-foreground" />,
            },
            {
              step: "02",
              title: "Execute & Streak",
              description: "Perform daily habit loops, track tasks, and append note logs without context switching.",
              icon: <Zap className="h-6 w-6 text-foreground" />,
            },
            {
              step: "03",
              title: "Measure & Accelerate",
              description: "Monitor focus velocity with vector metrics, status gauges, and automated audit logs.",
              icon: <BarChart2 className="h-6 w-6 text-foreground" />,
            },
          ].map((s, idx) => (
            <div
              key={idx}
              className="relative flex flex-col rounded-3xl border border-border/60 bg-card/50 p-8 backdrop-blur-xl transition-all hover:border-border hover:bg-card/80 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-background shadow-xs">
                  {s.icon}
                </div>
                <span className="text-3xl font-extrabold font-mono text-muted-foreground/30">{s.step}</span>
              </div>
              <h3 className="text-lg font-bold text-foreground">{s.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: FEATURE MATRIX COMPARISON */}
      <section className="w-full max-w-5xl mx-auto px-6 py-8">
        <div className="text-center space-y-3 mb-16 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-3.5 py-1.5 text-xs font-semibold text-foreground backdrop-blur-md shadow-xs mb-1">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span>Comparison</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-center text-foreground max-w-4xl mx-auto leading-tight">
            See how Weavit <span className="font-serif italic font-normal text-foreground/90">stacks up</span> <br />
            against manual workflows
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground text-center max-w-2xl mx-auto">
            Discover why developers choose Weavit over manual tracking & fragmented spreadsheets.
          </p>
        </div>

        {/* Unified Row-by-Row Grid for Pixel-Perfect Alignment */}
        <div className="w-full max-w-4xl mx-auto">
          {/* Header Row */}
          <div className="grid grid-cols-12 items-stretch gap-0">
            {/* Column 1 Header */}
            <div className="col-span-4 flex items-end pb-4 border-b border-border/40 pr-4 sm:pr-6">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Features</span>
            </div>

            {/* Column 2 Header (Weavit Borderless Card Top) */}
            <div className="col-span-4 bg-card/90 rounded-t-3xl p-5 sm:p-7 flex flex-col items-center justify-center text-center relative z-10 shadow-2xl backdrop-blur-xl border-b border-border/40">
              <img
                src="/logo-weavit.png"
                alt="Weavit Logo"
                className="h-10 w-auto object-contain mb-2"
              />
              <h3 className="text-lg font-bold text-foreground">Weavit</h3>
              <p className="text-[11px] text-muted-foreground">Built with developer needs in mind</p>
            </div>

            {/* Column 3 Header (Manual Workflow Top) */}
            <div className="col-span-4 flex flex-col items-center justify-center text-center pb-4 border-b border-border/40 pl-4 sm:pl-6">
              <div className="h-9 w-9 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-center mb-2 text-muted-foreground">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground/80">Manual Workflow</h3>
              <p className="text-[11px] text-muted-foreground">Fragmented apps & spreadsheets</p>
            </div>
          </div>

          {/* Feature Rows */}
          {[
            {
              icon: FolderOpen,
              title: "Multi-Phase Roadmaps",
              weavit: { status: "check", detail: "Structured plans with note logs" },
              manual: { status: "minus", detail: "Flat text notes & spreadsheets" },
            },
            {
              icon: Sliders,
              title: "Habit & Streak Logic",
              weavit: { status: "check", detail: "Automated streak calculations" },
              manual: { status: "minus", detail: "Manual calendar cross-offs" },
            },
            {
              icon: Code,
              title: "API Access",
              weavit: { status: "check", detail: "Robust developer API & OpenAPI spec" },
              manual: { status: "minus", detail: "No API available" },
            },
            {
              icon: BarChart2,
              title: "Focus Velocity Meter",
              weavit: { status: "check", detail: "Real-time 75-bar vector meter" },
              manual: { status: "minus", detail: "No focus measurement" },
            },
            {
              icon: Headphones,
              title: "Instant Client Engine",
              weavit: { status: "check", detail: "Sub-1ms local state response" },
              manual: { status: "minus", detail: "Slow page loads & cloud lags" },
            },
          ].map((row, idx) => {
            const RowIcon = row.icon
            return (
              <div key={idx} className="grid grid-cols-12 items-stretch gap-0 min-h-[96px]">
                {/* Col 1 Label */}
                <div className="col-span-4 flex items-center gap-3 border-b border-border/40 pr-4 sm:pr-6 py-4">
                  <RowIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-xs sm:text-sm font-bold text-foreground">{row.title}</span>
                </div>

                {/* Col 2 Weavit */}
                <div className="col-span-4 bg-card/90 border-b border-border/40 p-4 flex flex-col items-center justify-center text-center relative z-10 shadow-2xl backdrop-blur-xl">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mb-1.5" />
                  <span className="text-xs font-medium text-foreground">{row.weavit.detail}</span>
                </div>

                {/* Col 3 Manual Workflow */}
                <div className="col-span-4 flex flex-col items-center justify-center text-center border-b border-border/40 pl-4 sm:pl-6 p-4">
                  <MinusCircle className="h-5 w-5 text-rose-500 shrink-0 mb-1.5" />
                  <span className="text-xs font-medium text-muted-foreground">{row.manual.detail}</span>
                </div>
              </div>
            )
          })}

          {/* Footer Row */}
          <div className="grid grid-cols-12 items-stretch gap-0">
            <div className="col-span-4 pr-4 sm:pr-6" />

            <div className="col-span-4 bg-card/90 rounded-b-3xl p-5 sm:p-7 relative z-10 shadow-2xl backdrop-blur-xl">
              <Link
                href="/dashboard"
                className="w-full rounded-xl bg-foreground py-3 text-xs sm:text-sm font-bold text-background shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all text-center block"
              >
                Try Weavit Today
              </Link>
            </div>

            <div className="col-span-4 pl-4 sm:pl-6" />
          </div>
        </div>
      </section>

      {/* SECTION 4: FREQUENTLY ASKED QUESTIONS */}
      <section className="w-full max-w-4xl mx-auto px-6">
        <div className="text-center space-y-3 mb-12 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-3.5 py-1.5 text-xs font-semibold text-foreground backdrop-blur-md shadow-xs mb-1">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span>Got Questions?</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-center text-foreground max-w-4xl mx-auto leading-tight">
            Frequently asked <span className="font-serif italic font-normal text-foreground/90">questions</span> <br />
            & system answers
          </h2>

          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            Everything you need to know about the Weavit platform and workflow engine.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-3">
          {[
            {
              q: "Is Weavit fully client-side and fast?",
              a: "Yes! Weavit operates using an instant client-side state engine, providing sub-millisecond response times without lag or cloud loading states.",
            },
            {
              q: "Can I customize engineering roadmaps for interview prep or projects?",
              a: "Absolutely. You can create custom roadmaps with multi-phase modules, categories (e.g. System Design, Algorithms, UI Architecture), executable tasks, and detailed note logs.",
            },
            {
              q: "How is the Productivity Score calculated?",
              a: "The productivity score combines active focus velocity, daily habit streak completion, and task execution rates visualized through our custom 75-bar vector meter.",
            },
            {
              q: "Does Weavit support dark and light themes?",
              a: "Yes, Weavit comes equipped with a standardized design system optimized with curated OKLCH color tokens for seamless dark and light theme switching.",
            },
          ].map((item, idx) => (
            <AccordionItem
              key={idx}
              value={`item-${idx}`}
              className="rounded-2xl border border-border/60 bg-card/50 px-5 py-1 backdrop-blur-md"
            >
              <AccordionTrigger className="text-sm sm:text-base font-bold text-foreground hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1 pb-3">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  )
}
