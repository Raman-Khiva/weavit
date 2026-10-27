"use client"
import { useEffect, useMemo, useState } from "react"
import { FloatingDockDemo } from "@workspace/ui/components/mvpblocks/floating-dock-demo"
import { Habits } from "@workspace/ui/components/habits"
import { Deadlines, type Deadline } from "@workspace/ui/components/deadlines"
import { PlanItemCard, TaskCard as QueueTaskCard } from "@workspace/ui/components/queue-cards"
import { NextUp, ProductivityBoard } from "@workspace/ui/components/productivity-board"
import { HeaderIslands, type ScheduleEvent } from "@workspace/ui/components/header-islands"
import { Bot } from "lucide-react"
import { useAuth } from "@clerk/nextjs"
import { useGetProjectsQuery } from "@/features/projects/projects.api"
import { useGetHabitsQuery } from "@/features/habits/habits.api"
import type { PROJECT } from "@weavit/api-types"

function eventToday(id: string, title: string, startHour: number, endHour: number): ScheduleEvent {
  const start = new Date()
  start.setHours(startHour, 0, 0, 0)
  const end = new Date()
  end.setHours(endHour, 0, 0, 0)
  return { id, title, start, end }
}

const ASSISTANT_MESSAGES = [
  "how may i help you?",
  "should we complete this task?",
  "want me to take the next one?",
  "what's left for today?",
]

const DEADLINES: Deadline[] = [
  { id: "auth", title: "Add authentication", due: "2026-10-23", priority: "high" },
  { id: "api", title: "Create API endpoints", due: "2026-10-26", priority: "medium" },
  { id: "quiz", title: "Math Quiz", due: "2026-10-26", dueTime: "14:00", priority: "high" },
  { id: "reading", title: "Reading Assignment", due: "2026-10-26", dueTime: "17:00", priority: "low" },
  { id: "docs", title: "Write documentation", due: "2026-10-30", priority: "low" },
]

function AssistantGreeting({ nextTitle, nextDue }: { nextTitle: string; nextDue: string }) {
  const [index, setIndex] = useState(0)
  const [done, setDone] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % ASSISTANT_MESSAGES.length)
    }, 4000)
    return () => clearInterval(id)
  }, [])

  return (
    <section aria-label="Assistant" className="@container flex min-h-0 flex-1 flex-col overflow-y-auto px-8 pt-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <p className="text-[clamp(2.5rem,14cqw,4.5rem)] font-semibold leading-none tracking-tight text-foreground">hi, raman.</p>
      <p className="mt-1 flex items-center gap-2 text-lg text-muted-foreground">
        <Bot className="size-6 shrink-0" strokeWidth={1.75} />
        <span>{ASSISTANT_MESSAGES[index]}</span>
      </p>
      <NextUp title={nextTitle} due={nextDue} />
      <Deadlines
        className="mt-auto pt-6"
        deadlines={DEADLINES.map((item) => ({ ...item, done: done[item.id] }))}
        onToggle={(item) =>
          setDone((current) => ({ ...current, [item.id]: !current[item.id] }))
        }
      />
    </section>
  )
}

const TASKS = [
  {
    title: "Add authentication",
    description: "Implement OAuth2 with Google and GitHub providers",
    dueDate: "2026-10-23",
    priority: "high" as const,
  },
  {
    title: "Create API endpoints",
    description: "Set up basic CRUD operations for user profiles",
    dueDate: "2026-10-26",
    priority: "medium" as const,
  },
  {
    title: "Write documentation",
    description: "Draft API documentation using Swagger",
    dueDate: "2026-10-28",
    priority: "low" as const,
  },
]

const FALLBACK_PLANS = [
  {
    id: "preview-trees",
    title: "Trees, Graphs & Traversals",
    planName: "SDE Interview Preparation",
    topic: "Data Structures & Algorithms",
  },
  {
    id: "preview-recruiter",
    title: "Reply to the recruiter",
    planName: "Job search",
    topic: "Outreach",
  },
]

function SectionRule({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-1.5">
      <span className="h-px min-w-4 flex-1 bg-border" />
      <span className="shrink-0 text-xs font-medium text-muted-foreground">{label}</span>
      <span className="h-px min-w-4 flex-1 bg-border" />
    </div>
  )
}

function planRows(projects: PROJECT[]) {
  const rows: { id: string; title: string; planName: string; topic?: string }[] = []
  for (const project of projects) {
    for (const phase of project.phases ?? []) {
      if (phase.status === "COMPLETED") continue
      const tasks = phase.tasks ?? []
      const current =
        tasks.find((task) => task.status === "IN_PROGRESS") ??
        tasks.find((task) => task.status === "PENDING")
      if (!current) continue
      rows.push({
        id: current.id,
        title: current.title,
        planName: project.title,
        topic: phase.title,
      })
    }
  }
  return rows
}

export default function Page(): React.ReactElement {
  const { isLoaded, isSignedIn } = useAuth()
  const { data } = useGetProjectsQuery(undefined, { skip: !isLoaded || !isSignedIn })
  const { data: habits } = useGetHabitsQuery(undefined, { skip: !isLoaded || !isSignedIn })
  const events = useMemo(
    () => [eventToday("quiz", "Math Quiz", 14, 15), eventToday("reading", "Reading Assignment", 17, 18)],
    []
  )
  const fromPlans = useMemo(() => {
    const rows = planRows(data ?? [])
    return rows.length > 0 ? rows : FALLBACK_PLANS
  }, [data])

  return (
    <main className="relative flex h-screen w-full flex-col bg-background pt-16 pb-19">
      <HeaderIslands
        habitsDone={1}
        habitsTotal={Math.min(habits?.length || 2, 4)}
        events={events}
        notificationCount={3}
      />

      <div className="flex min-h-0 flex-1 gap-1 px-1 pt-1">
        <div className="flex w-96 shrink-0 flex-col overflow-y-auto rounded-sm border border-white/10 bg-white/[0.03] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <SectionRule label="Habits" />
          <Habits habits={habits ?? []} />
          <div className="mt-3 flex flex-col gap-1.5 px-1">
            <SectionRule label="Tasks" />
            {TASKS.map((task) => (
              <QueueTaskCard key={task.title} {...task} />
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-1.5 px-1 pb-2">
            <SectionRule label="From plans" />
            {fromPlans.slice(0, 4).map((row) => (
              <PlanItemCard
                key={row.id}
                title={row.title}
                planName={row.planName}
                topic={row.topic}
              />
            ))}
          </div>
          {/* Projects panel removed from this column
          <Projects projects={data ?? []} />
          */}
        </div>

        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <AssistantGreeting nextTitle={TASKS[1].title} nextDue={TASKS[1].dueDate} />
        </div>

        <ProductivityBoard className="self-stretch" />
      </div>

      <div className="absolute right-0 bottom-2 left-0 flex w-full items-center justify-between">
        <div className="flex-1" />
        <div className="z-20 w-72">
          <FloatingDockDemo />
        </div>
        <div className="flex flex-1 justify-center">
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-white/[0.03] px-3.5 py-1.5 text-xs font-semibold text-muted-foreground shadow-xs backdrop-blur-md">
            <span className="font-bold text-emerald-500">⚡ 96%</span>
            <span>Focus Velocity</span>
          </div>
        </div>
      </div>
    </main>
  )
}
