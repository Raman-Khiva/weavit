"use client"
import { useEffect, useMemo, useState } from "react"
import { FloatingDockDemo } from "@workspace/ui/components/mvpblocks/floating-dock-demo"
import { Habits } from "@workspace/ui/components/habits"
import { Deadlines, type Deadline } from "@workspace/ui/components/deadlines"
import { PlanItemCard, TaskCard as QueueTaskCard } from "@workspace/ui/components/queue-cards"
import { ProductivityBoard } from "@workspace/ui/components/productivity-board"
import { PlansOverview } from "@workspace/ui/components/plans-overview"
import { HeaderIslands, type ScheduleEvent } from "@workspace/ui/components/header-islands"
import { Bot } from "lucide-react"
import { useAuth } from "@clerk/nextjs"
import { useGetProjectsQuery } from "@/features/projects/projects.api"
import { useGetHabitsQuery, useToggleHabitMutation } from "@/features/habits/habits.api"
import { useGetDeadlinesQuery, usePatchDeadlineMutation } from "@/features/deadlines/deadlines.api"
import { useGetTodosQuery } from "@/features/todos/todos.api"
import type { PROJECT } from "@weavit/api-types"
import DashboardAgent from "@/features/agent/DashboardAgent"

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

const DEMO_DEADLINE: Deadline = {
  id: "demo-deadline",
  title: "Demo: Math Quiz",
  due: new Date().toISOString().slice(0, 10),
  dueTime: "14:00",
  priority: "high",
  done: false,
}

const DEMO_TASK = {
  title: "Demo: Add authentication",
  description: "Sample queue card",
  dueDate: new Date().toISOString().slice(0, 10),
  priority: "high" as const,
}

const FALLBACK_PLANS = [
  {
    id: "demo-plan-row",
    title: "Demo: Trees, Graphs & Traversals",
    planName: "SDE Interview Preparation",
    topic: "Data Structures & Algorithms",
  },
]

function AssistantGreeting() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % ASSISTANT_MESSAGES.length)
    }, 4000)
    return () => clearInterval(id)
  }, [])

  return (
    <section
      aria-label="Assistant"
      className="@container flex min-h-0 flex-1 flex-col overflow-y-auto px-8 pt-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <p className="text-[clamp(2.5rem,14cqw,4.5rem)] font-semibold leading-none tracking-tight text-foreground">
        hi, raman.
      </p>
      <p className="mt-1 flex items-center gap-2 text-lg text-muted-foreground">
        <Bot className="size-6 shrink-0" strokeWidth={1.75} />
        <span>{ASSISTANT_MESSAGES[index]}</span>
      </p>
      <DashboardAgent />
    </section>
  )
}

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

function mapPriority(p?: string): Deadline["priority"] {
  if (p === "HIGH" || p === "URGENT") return "high"
  if (p === "LOW") return "low"
  return "medium"
}

function CenterBottomRail({
  projects,
  deadlines,
  onToggleDeadline,
}: {
  projects: PROJECT[]
  deadlines: Deadline[]
  onToggleDeadline: (item: Deadline) => void
}) {
  return (
    <div
      aria-label="Plans and deadlines"
      className="flex h-80 shrink-0 gap-1 overflow-hidden px-1 pb-1"
    >
      <PlansOverview
        className="min-h-0 min-w-0 flex-1"
        projects={projects}
        max={3}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-sm border border-white/10 bg-white/[0.03]">
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Deadlines
            className="max-w-none border-0 bg-transparent p-0"
            deadlines={deadlines}
            onToggle={onToggleDeadline}
          />
        </div>
      </div>
    </div>
  )
}

export default function Page(): React.ReactElement {
  const { isLoaded, isSignedIn } = useAuth()
  const skip = !isLoaded || !isSignedIn
  const { data } = useGetProjectsQuery(undefined, { skip })
  const { data: habits } = useGetHabitsQuery(undefined, { skip })
  const { data: apiDeadlines } = useGetDeadlinesQuery(undefined, { skip })
  const { data: todos } = useGetTodosQuery(undefined, { skip })
  const [toggleHabit] = useToggleHabitMutation()
  const [patchDeadline] = usePatchDeadlineMutation()

  const today = new Date().toISOString().slice(0, 10)
  const habitsDone = (habits ?? []).filter((h) =>
    (h.completedDates ?? []).includes(today)
  ).length
  const habitsTotal = Math.max((habits ?? []).length, 1)

  const events = useMemo(() => {
    const fromDeadlines = (apiDeadlines ?? [])
      .filter((d) => d.dueDate.slice(0, 10) === today && !d.isCompleted)
      .slice(0, 2)
      .map((d, i) => {
        const hour = d.time ? Number(d.time.split(":")[0]) || 14 + i : 14 + i
        return eventToday(d.id, d.title, hour, hour + 1)
      })
    return fromDeadlines.length > 0
      ? fromDeadlines
      : [eventToday("demo-event", "Demo: Math Quiz", 14, 15)]
  }, [apiDeadlines, today])

  const fromPlans = useMemo(() => {
    const rows = planRows(data ?? [])
    return rows.length > 0 ? rows : FALLBACK_PLANS
  }, [data])

  const deadlines: Deadline[] = useMemo(() => {
    const mapped = (apiDeadlines ?? []).map((d) => ({
      id: d.id,
      title: d.title,
      due: d.dueDate.slice(0, 10),
      dueTime: d.time ?? undefined,
      priority: mapPriority(d.priority),
      done: d.isCompleted,
    }))
    return [...mapped, DEMO_DEADLINE]
  }, [apiDeadlines])

  const taskCards = useMemo(() => {
    const open = (todos ?? [])
      .filter((t) => t.status !== "COMPLETED" && t.status !== "SKIPPED")
      .slice(0, 3)
      .map((t) => ({
        title: t.title,
        description: t.description ?? t.tags?.join(", ") ?? "",
        dueDate: t.dueDate?.slice(0, 10) ?? today,
        priority: mapPriority(t.priority),
      }))
    return open.length > 0 ? [...open, DEMO_TASK].slice(0, 4) : [DEMO_TASK]
  }, [todos, today])

  return (
    <main className="relative flex h-screen w-full flex-col bg-background pt-16 pb-19">
      <HeaderIslands
        habitsDone={habitsDone}
        habitsTotal={habitsTotal}
        events={events}
        notificationCount={3}
      />

      <div className="flex min-h-0 flex-1 gap-1 px-1 pt-1">
        <div className="flex w-96 shrink-0 flex-col overflow-y-auto rounded-sm border border-white/10 bg-white/[0.03] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <SectionRule label="Habits" />
          <Habits
            habits={habits ?? []}
            onToggle={(habitId) => {
              void toggleHabit(habitId)
            }}
          />
          <div className="mt-3 flex flex-col gap-1.5 px-1">
            <SectionRule label="Tasks" />
            {taskCards.map((task) => (
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
        </div>

        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <AssistantGreeting />
          </div>
          <CenterBottomRail
            projects={data ?? []}
            deadlines={deadlines}
            onToggleDeadline={(item) => {
              if (item.id.startsWith("demo-")) return
              void patchDeadline({
                id: item.id,
                body: { isCompleted: !item.done },
              })
            }}
          />
        </div>

        <aside
          aria-label="Stats"
          className="h-full min-h-0 w-96 shrink-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <ProductivityBoard />
        </aside>
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
