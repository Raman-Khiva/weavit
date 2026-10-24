"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  ArrowUpRight,
  BarChart2,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Clock,
  Code,
  FileText,
  FolderOpen,
  Headphones,
  LayoutDashboard,
  MinusCircle,
  Sliders,
  Sparkles,
  Zap,
} from "lucide-react"
import { FloatingNav } from "../../components/floating-nav"
import { FlickeringGrid } from "@workspace/ui/components/flicking-grid"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@workspace/ui/components/accordion"
import { ReactLenis } from "lenis/react"
import "lenis/dist/lenis.css"

const CAPABILITIES = [
  {
    icon: FolderOpen,
    title: "Multi-Phase Roadmap Engine",
    description:
      "Structure engineering goals and interview prep into multi-phase plans with executable subtasks, category stats, and timestamped note logs.",
  },
  {
    icon: BarChart2,
    title: "High-Density Productivity HUD",
    description:
      "Track focus velocity and system metrics in real-time with borderless HUD panels, vector metric bars, and horizontal day timelines.",
  },
  {
    icon: Zap,
    title: "Habit & Deadline Execution Loop",
    description:
      "Maintain active habit streaks, monitor color-coded pending deadline badges in mini calendars, and manage prioritized todo checklists.",
  },
]

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
  },
]

const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Define & Structure",
    description: "Build multi-phase engineering roadmaps with task categories, priorities, and deadlines.",
    icon: FolderOpen,
  },
  {
    step: "02",
    title: "Execute & Streak",
    description: "Perform daily habit loops, track tasks, and append note logs without context switching.",
    icon: Zap,
  },
  {
    step: "03",
    title: "Measure & Accelerate",
    description: "Monitor focus velocity with vector metrics, status gauges, and automated audit logs.",
    icon: BarChart2,
  },
]

const COMPARISON_ROWS = [
  {
    icon: FolderOpen,
    title: "Multi-Phase Roadmaps",
    weavit: "Structured plans with note logs",
    manual: "Flat text notes & spreadsheets",
  },
  {
    icon: Sliders,
    title: "Habit & Streak Logic",
    weavit: "Automated streak calculations",
    manual: "Manual calendar cross-offs",
  },
  {
    icon: Code,
    title: "API Access",
    weavit: "Robust developer API & OpenAPI spec",
    manual: "No API available",
  },
  {
    icon: BarChart2,
    title: "Focus Velocity Meter",
    weavit: "Real-time 75-bar vector meter",
    manual: "No focus measurement",
  },
  {
    icon: Headphones,
    title: "Instant Client Engine",
    weavit: "Sub-1ms local state response",
    manual: "Slow page loads & cloud lags",
  },
]

const FAQS = [
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
]

function LiveBadge({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-2.5 rounded-full border border-border/80 bg-card/80 px-3.5 py-1.5 text-xs font-semibold text-foreground shadow-xs backdrop-blur-md">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <span>{label}</span>
    </div>
  )
}

function ModuleMockup({ id }: { id: string }) {
  if (id === "roadmaps") {
    return (
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground">Phase 1: Data Structures & Algorithms</p>
        {[
          { title: "Arrays & Hashing: LeetCode 1, 49, 347", status: "completed", note: "Mastered hash map lookups & prefix sums." },
          { title: "Sliding Window: Trapping Rain Water", status: "completed", note: "Shrinking window contract logic verified." },
          { title: "Trees & BST: BFS, DFS, LCA", status: "in_progress", note: "Practiced Lowest Common Ancestor." },
        ].map((task) => (
          <div key={task.title} className="space-y-1 rounded-xl border border-border/60 bg-card/50 p-3 text-xs">
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-foreground">{task.title}</span>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  task.status === "completed"
                    ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                    : "border border-amber-500/20 bg-amber-500/10 text-amber-500"
                }`}
              >
                {task.status}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground italic">&ldquo;{task.note}&rdquo;</p>
          </div>
        ))}
      </div>
    )
  }

  if (id === "habits") {
    return (
      <div className="space-y-2">
        {[
          { name: "LeetCode Daily Challenge", streak: "14 Day Streak", status: "completed" },
          { name: "System Design Chapter Review", streak: "8 Day Streak", status: "completed" },
          { name: "Code Refactoring & Unit Tests", streak: "5 Day Streak", status: "pending" },
        ].map((habit) => (
          <div key={habit.name} className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/50 p-3 text-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className={`h-4 w-4 ${habit.status === "completed" ? "text-emerald-500" : "text-muted-foreground/40"}`} />
              <span className="font-semibold text-foreground">{habit.name}</span>
            </div>
            <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-400">
              {habit.streak}
            </span>
          </div>
        ))}
      </div>
    )
  }

  if (id === "deadlines") {
    return (
      <div className="space-y-3">
        {[
          { title: "OS Virtual Memory Assignment", course: "CS 401", tag: "Today", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
          { title: "System Design Prototype Review", course: "Project Alpha", tag: "Tomorrow", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
        ].map((deadline) => (
          <div key={deadline.title} className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/50 p-3 text-xs">
            <div className="space-y-0.5">
              <p className="font-bold text-foreground">{deadline.title}</p>
              <p className="text-[10px] text-muted-foreground">{deadline.course}</p>
            </div>
            <span className={`rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold ${deadline.color}`}>{deadline.tag}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card/50 p-4">
        <span className="text-xs font-semibold text-muted-foreground">Focus Score</span>
        <span className="font-mono text-xl font-extrabold text-emerald-500">92 / 100</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Active Focus", val: "4.5 hrs" },
          { label: "Task Velocity", val: "94%" },
          { label: "Habit Rate", val: "100%" },
        ].map((stat) => (
          <div key={stat.label} className="space-y-0.5 rounded-xl border border-border/40 bg-card/30 p-2.5 text-center">
            <p className="text-[10px] font-semibold text-muted-foreground">{stat.label}</p>
            <p className="font-mono text-xs font-bold text-foreground">{stat.val}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function Page(): React.ReactElement {
  const [activeModuleId, setActiveModuleId] = useState("roadmaps")
  const currentModule = WORKSPACE_MODULES.find((module) => module.id === activeModuleId) ?? WORKSPACE_MODULES[0]!
  const ActiveIcon = currentModule.icon

  return (
    <ReactLenis
      root
      options={{
        duration: 1.8,
        easing: (t) => 1 - Math.pow(1 - t, 4),
        wheelMultiplier: 1.6,
        touchMultiplier: 1.5,
        smoothWheel: true,
      }}
    >
      <div className="relative min-h-screen w-full overflow-x-hidden bg-background font-sans text-foreground">
        <div className="pointer-events-none absolute top-0 right-0 left-0 z-0 h-screen max-h-[900px] overflow-hidden">
          <FlickeringGrid
            className="h-full w-full opacity-40"
            squareSize={10}
            gridGap={8}
            color="#6B7280"
            maxOpacity={0.08}
            flickerChance={0.4}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        </div>

        <FloatingNav />

        <section className="relative z-10 grid min-h-screen items-end gap-12 px-5 pb-16 pt-32 sm:px-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:items-center lg:px-16 lg:pb-20">
          <div className="max-w-3xl space-y-7">
            <div className="flex flex-wrap items-center gap-3">
              <LiveBadge label="Weavit Workspace Engine" />
              <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                {process.env.NEXT_PUBLIC_VERSION || "v0.1"}
              </span>
            </div>

            <h1 className="text-[clamp(2.6rem,5.8vw,5.25rem)] font-extrabold leading-[0.96] tracking-tight text-foreground">
              The high-density workspace for{" "}
              <span className="mt-2 inline-block rounded-2xl bg-foreground px-3 py-1 text-background shadow-lg sm:mt-0 sm:px-4">
                developer execution
              </span>
            </h1>

            <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
              Structure multi-phase roadmaps, track daily habit loops, manage deadlines, and measure focus velocity—all in one centralized, high-density developer workspace.
            </p>
          </div>

          <div className="lg:justify-self-end lg:pt-16">
            <div className="flex w-full flex-col gap-3.5 sm:flex-row lg:flex-col">
              <Link
                href="/dashboard"
                className="group inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-foreground px-7 py-3.5 text-sm font-bold text-background shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <LayoutDashboard className="h-4 w-4" />
                Explore Dashboard
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/workspace/projects"
                className="group inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card/80 px-7 py-3.5 text-sm font-semibold text-foreground shadow-xs backdrop-blur-md transition-all hover:border-foreground/40 hover:bg-card"
              >
                <FolderOpen className="h-4 w-4 text-primary" />
                Open Roadmaps
              </Link>
            </div>
            <p className="mt-5 max-w-xs text-xs leading-5 text-muted-foreground">
              No setup, no config wall. Open the workspace and start from the next unfinished phase.
            </p>
          </div>
        </section>

        <div className="relative z-10 border-y border-border/50 bg-card/30 py-3">
          <div className="flex animate-marquee gap-12 whitespace-nowrap">
            {["Roadmaps", "Daily Habits", "Deadlines", "Focus Velocity", "Task Execution", "Draft Notes", "Activity Logs", "Streak Tracking"].concat([
              "Roadmaps",
              "Daily Habits",
              "Deadlines",
              "Focus Velocity",
              "Task Execution",
              "Draft Notes",
              "Activity Logs",
              "Streak Tracking",
            ]).map((item, index) => (
              <span key={`${item}-${index}`} className="shrink-0 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
                {item}
                <span className="ml-12 text-border">·</span>
              </span>
            ))}
          </div>
        </div>

        <section id="features" className="relative z-10 px-5 py-24 sm:px-10 lg:px-16 lg:py-32">
          <div className="grid gap-14 lg:grid-cols-[0.78fr_1.22fr] lg:items-start lg:gap-20">
            <div className="lg:sticky lg:top-28">
              <LiveBadge label="Core Capabilities" />
              <h2 className="mt-6 max-w-xl text-[clamp(2rem,4.2vw,3.5rem)] font-bold leading-[1.05] tracking-tight text-foreground">
                Engineered for <span className="font-serif font-normal italic text-foreground/90">developer</span> productivity & execution
              </h2>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground md:text-base">
                High-density tools that streamline your daily workflow, habit execution, and multi-phase roadmap tracking.
              </p>
            </div>

            <div className="space-y-5">
              {CAPABILITIES.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <article
                    key={feature.title}
                    className={`group relative flex gap-5 rounded-2xl border border-border/60 bg-card/60 px-5 py-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-border hover:bg-card/90 hover:shadow-2xl sm:px-7 ${
                      index === 1 ? "lg:ml-10" : index === 2 ? "lg:ml-20" : ""
                    }`}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-background shadow-md transition-colors group-hover:border-foreground/40">
                      <Icon className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/70">0{index + 1}</p>
                      <h3 className="mt-1 text-lg font-bold tracking-tight text-foreground">{feature.title}</h3>
                      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section id="modules" className="relative z-10 border-y border-border/40 bg-card/20 px-5 py-24 sm:px-10 lg:px-16 lg:py-32">
          <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <LiveBadge label="Interactive Workspace" />
              <h2 className="mt-6 text-[clamp(2rem,4.2vw,3.5rem)] font-bold leading-[1.05] tracking-tight text-foreground">
                Explore the <span className="font-serif font-normal italic text-foreground/90">modules</span> powering your execution
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground lg:mb-1 lg:text-right">
              Four connected surfaces. Pick a module, keep the rest of the week in view.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-12">
            <div className="flex flex-col gap-3">
              {WORKSPACE_MODULES.map((module, index) => {
                const Icon = module.icon
                const isActive = module.id === activeModuleId
                return (
                  <button
                    key={module.id}
                    type="button"
                    onClick={() => setActiveModuleId(module.id)}
                    className={`flex items-center gap-4 rounded-2xl border px-4 py-4 text-left transition-all ${
                      isActive
                        ? "scale-[1.01] border-border/80 bg-card/90 shadow-xl ring-1 ring-border/50"
                        : "border-border/30 bg-card/30 text-muted-foreground hover:border-border/60 hover:bg-card/60 hover:text-foreground"
                    } ${index === 1 ? "lg:ml-6" : index === 3 ? "lg:ml-6" : ""}`}
                  >
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all ${
                        isActive ? "bg-foreground text-background shadow-md" : "bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold ${isActive ? "text-foreground" : ""}`}>{module.label}</p>
                      <p className="truncate text-xs text-muted-foreground">{module.headline}</p>
                    </div>
                    <ArrowUpRight className={`ml-auto h-4 w-4 shrink-0 ${isActive ? "text-foreground" : "text-muted-foreground/40"}`} />
                  </button>
                )
              })}
            </div>

            <div className="rounded-3xl border border-border/60 bg-card/60 p-6 shadow-2xl backdrop-blur-xl sm:p-9 lg:-mt-4">
              <div className="mb-8 flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">Featured Module</span>
                  <h3 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">{currentModule.headline}</h3>
                  <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">{currentModule.description}</p>
                </div>
                <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background sm:flex">
                  <ActiveIcon className="h-5 w-5" />
                </div>
              </div>

              <div className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-4">
                  {currentModule.features.map((feature) => (
                    <div key={feature.title} className="space-y-1">
                      <h4 className="flex items-center gap-2 text-sm font-bold text-foreground">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                        {feature.title}
                      </h4>
                      <p className="pl-6 text-xs leading-relaxed text-muted-foreground">{feature.description}</p>
                    </div>
                  ))}
                  <Link
                    href={currentModule.link}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-bold text-background shadow-md transition-all hover:scale-[1.02]"
                  >
                    {currentModule.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="rounded-2xl border border-border/80 bg-background/90 p-5 shadow-xl backdrop-blur-md sm:p-6">
                  <div className="mb-4 flex items-center justify-between border-b border-border/40 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
                      <span className="font-mono text-xs font-bold text-foreground">
                        {currentModule.id === "roadmaps" && "SDE Technical Interview Master Prep"}
                        {currentModule.id === "habits" && "Daily Focus Routine"}
                        {currentModule.id === "deadlines" && "Upcoming Milestones"}
                        {currentModule.id === "analytics" && "Productivity Score"}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground uppercase">Live Status</span>
                  </div>
                  <ModuleMockup id={currentModule.id} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10 px-5 py-24 sm:px-10 lg:px-16 lg:py-32">
          <div className="mb-16 max-w-xl lg:ml-[8%]">
            <LiveBadge label="Workflow Architecture" />
            <h2 className="mt-6 text-[clamp(2rem,4.2vw,3.5rem)] font-bold leading-[1.05] tracking-tight text-foreground">
              From chaos to <span className="font-serif font-normal italic text-foreground/90">peak flow</span> in 3 simple steps
            </h2>
            <p className="mt-4 max-w-md text-sm text-muted-foreground md:text-base">
              A structured execution pipeline engineered to keep you focused on what matters most.
            </p>
          </div>

          <div className="space-y-4">
            {WORKFLOW_STEPS.map((step, index) => {
              const Icon = step.icon
              return (
                <article
                  key={step.step}
                  className={`flex flex-col gap-5 rounded-3xl border border-border/60 bg-card/50 p-7 backdrop-blur-xl transition-all hover:border-border hover:bg-card/80 sm:flex-row sm:items-center sm:justify-between ${
                    index === 0 ? "lg:mr-[18%]" : index === 1 ? "lg:ml-[10%] lg:mr-[8%]" : "lg:ml-[22%]"
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-background shadow-xs">
                      <Icon className="h-6 w-6 text-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                      <p className="mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                  <span className="font-mono text-3xl font-extrabold text-muted-foreground/30">{step.step}</span>
                </article>
              )
            })}
          </div>
        </section>

        <section id="about" className="relative z-10 border-y border-border/40 bg-card/30 py-16 backdrop-blur-md">
          <div className="grid gap-10 px-5 sm:px-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-end lg:px-16">
            <div>
              <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">System highlights</p>
              <h2 className="text-[clamp(1.85rem,3.6vw,2.75rem)] font-bold tracking-tight text-foreground">
                Built for the way you actually work.
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4">
              {[
                { value: "100%", label: "Client-Side Architecture" },
                { value: "< 1ms", label: "State Sync Latency" },
                { value: "75-Bar", label: "Vector Focus Meter" },
                { value: "0 Config", label: "Setup Required" },
              ].map((stat, index) => (
                <div key={stat.label} className={index % 2 === 1 ? "md:pt-8" : ""}>
                  <p className="font-mono text-3xl font-extrabold text-foreground sm:text-4xl">{stat.value}</p>
                  <p className="mt-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative z-10 px-5 py-24 sm:px-10 lg:px-16 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <LiveBadge label="Comparison" />
              <h2 className="mt-6 text-[clamp(2rem,4.2vw,3.5rem)] font-bold leading-[1.05] tracking-tight text-foreground">
                See how Weavit <span className="font-serif font-normal italic text-foreground/90">stacks up</span> against manual workflows
              </h2>
              <p className="mt-4 max-w-sm text-sm text-muted-foreground sm:text-base">
                Discover why developers choose Weavit over manual tracking & fragmented spreadsheets.
              </p>
            </div>

            <div>
              <div className="grid grid-cols-12 items-stretch">
                <div className="col-span-4 flex items-end border-b border-border/40 pb-4 pr-3">
                  <span className="text-xs font-bold tracking-wider text-muted-foreground/60 uppercase">Features</span>
                </div>
                <div className="relative z-10 col-span-4 flex flex-col items-center justify-center rounded-t-3xl border-b border-border/40 bg-card/90 p-5 text-center shadow-2xl backdrop-blur-xl sm:p-7">
                  <img src="/logo-weavit.png" alt="Weavit Logo" className="mb-2 h-10 w-auto object-contain" />
                  <h3 className="text-lg font-bold text-foreground">Weavit</h3>
                  <p className="text-[11px] text-muted-foreground">Built with developer needs in mind</p>
                </div>
                <div className="col-span-4 flex flex-col items-center justify-center border-b border-border/40 pb-4 pl-3 text-center">
                  <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl border border-border/40 bg-muted/30 text-muted-foreground">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground/80">Manual Workflow</h3>
                  <p className="text-[11px] text-muted-foreground">Fragmented apps & spreadsheets</p>
                </div>
              </div>

              {COMPARISON_ROWS.map((row) => {
                const RowIcon = row.icon
                return (
                  <div key={row.title} className="grid min-h-[96px] grid-cols-12 items-stretch">
                    <div className="col-span-4 flex items-center gap-3 border-b border-border/40 py-4 pr-3">
                      <RowIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="text-xs font-bold text-foreground sm:text-sm">{row.title}</span>
                    </div>
                    <div className="relative z-10 col-span-4 flex flex-col items-center justify-center border-b border-border/40 bg-card/90 p-4 text-center shadow-2xl backdrop-blur-xl">
                      <CheckCircle2 className="mb-1.5 h-5 w-5 shrink-0 text-emerald-500" />
                      <span className="text-xs font-medium text-foreground">{row.weavit}</span>
                    </div>
                    <div className="col-span-4 flex flex-col items-center justify-center border-b border-border/40 p-4 pl-3 text-center">
                      <MinusCircle className="mb-1.5 h-5 w-5 shrink-0 text-rose-500" />
                      <span className="text-xs font-medium text-muted-foreground">{row.manual}</span>
                    </div>
                  </div>
                )
              })}

              <div className="grid grid-cols-12">
                <div className="col-span-4" />
                <div className="relative z-10 col-span-4 rounded-b-3xl bg-card/90 p-5 shadow-2xl backdrop-blur-xl sm:p-7">
                  <Link
                    href="/dashboard"
                    className="block w-full rounded-xl bg-foreground py-3 text-center text-sm font-bold text-background shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Try Weavit Today
                  </Link>
                </div>
                <div className="col-span-4" />
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10 border-t border-border/40 bg-card/15 px-5 py-24 sm:px-10 lg:px-16 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
            <div>
              <LiveBadge label="Got Questions?" />
              <h2 className="mt-6 text-[clamp(2rem,4.2vw,3.5rem)] font-bold leading-[1.05] tracking-tight text-foreground">
                Frequently asked <span className="font-serif font-normal italic text-foreground/90">questions</span> & system answers
              </h2>
              <p className="mt-4 max-w-sm text-sm text-muted-foreground md:text-base">
                Everything you need to know about the Weavit platform and workflow engine.
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-3 lg:pt-4">
              {FAQS.map((item, index) => (
                <AccordionItem
                  key={item.q}
                  value={`item-${index}`}
                  className="rounded-2xl border border-border/60 bg-card/50 px-5 py-1 backdrop-blur-md"
                >
                  <AccordionTrigger className="text-sm font-bold text-foreground hover:no-underline sm:text-base">{item.q}</AccordionTrigger>
                  <AccordionContent className="pt-1 pb-3 text-xs leading-relaxed text-muted-foreground sm:text-sm">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section id="pricing" className="relative z-10 px-5 py-20 sm:px-10 lg:px-16">
          <div className="overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card/80 via-card/50 to-card/30 p-8 shadow-2xl backdrop-blur-xl sm:p-12 lg:p-14">
            <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <div className="space-y-5">
                <div className="flex items-center gap-1 text-indigo-400">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Sparkles key={index} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <h2 className="max-w-2xl text-[clamp(2rem,4.4vw,3.75rem)] font-bold leading-[1.08] tracking-tight text-foreground">
                  Ready to elevate your <span className="font-serif font-normal italic text-foreground/90">execution velocity?</span>
                </h2>
                <p className="max-w-md text-sm text-muted-foreground sm:text-base">
                  Experience the productivity environment crafted with high-density components, multi-phase roadmaps, and intelligent task execution.
                </p>
              </div>
              <div className="lg:justify-self-end">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3.5 text-sm font-bold text-background shadow-md transition-all hover:scale-[1.02]"
                >
                  Launch Dashboard Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <div className="mt-5 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><CheckSquare className="h-3.5 w-3.5" /> Roadmaps</span>
                  <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Deadlines</span>
                  <span className="inline-flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" /> Habits</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="relative z-10 w-full border-t border-border/40 px-6 py-8 text-xs text-muted-foreground">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <img src="/logo-weavit.png" alt="Weavit Logo" className="h-5 w-auto" />
              <span>weavit</span>
            </div>
            <p>© {new Date().getFullYear()} Weavit Platform. High-Density Workspace Engine.</p>
            <div className="flex items-center gap-4">
              <Link href="/overview" className="transition-colors hover:text-foreground">Overview</Link>
              <Link href="/dashboard" className="transition-colors hover:text-foreground">Dashboard</Link>
              <Link href="/workspace" className="transition-colors hover:text-foreground">Workspace</Link>
            </div>
          </div>
        </footer>
      </div>
    </ReactLenis>
  )
}

export default Page
