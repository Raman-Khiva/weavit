"use client"
import { useEffect, useMemo, useState } from "react"
import { FloatingDockDemo } from "@workspace/ui/components/mvpblocks/floating-dock-demo"
import { Habits } from "@workspace/ui/components/habits"
import { Deadlines, type Deadline } from "@workspace/ui/components/deadlines"
import { PlanItemCard, TaskCard as QueueTaskCard } from "@workspace/ui/components/queue-cards"
import {
  ProductivityBoard,
  RecentActivity,
  type ActivityItem,
  type ProductivityQueue,
} from "@workspace/ui/components/productivity-board"
import { PlansOverview } from "@workspace/ui/components/plans-overview"
import { HeaderIslands, type ScheduleEvent } from "@workspace/ui/components/header-islands"
import { Bot } from "lucide-react"
import { useAuth, useUser } from "@clerk/nextjs"
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
  id: "demo-task",
  title: "Demo: Add authentication",
  description: "Sample queue card",
  dueDate: new Date().toISOString().slice(0, 10),
  priority: "high" as const,
}

function AssistantGreeting() {
  const { isSignedIn } = useAuth()
  const { user } = useUser()
  const [index, setIndex] = useState(0)

  const name = isSignedIn
    ? user?.firstName ||
      user?.username ||
      user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
      "user"
    : "user"

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
      <p className="text-[clamp(2rem,9cqw,3rem)] font-semibold leading-none tracking-tight text-foreground">
        hi, {name}.
      </p>
      <p className="mt-1.5 flex items-center gap-2 text-base text-muted-foreground">
        <Bot className="size-5 shrink-0" strokeWidth={1.75} />
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
      <PlansOverview className="min-h-0 min-w-0 flex-1" projects={projects} max={3} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-sm border border-border bg-card">
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

  const events = useMemo(() => {
    const fromDeadlines = (apiDeadlines ?? [])
      .filter((d) => d.dueDate.slice(0, 10) === today && !d.isCompleted)
      .slice(0, 3)
      .map((d, i) => {
        const hour = d.time ? Number(d.time.split(":")[0]) || 14 + i : 14 + i
        return eventToday(d.id, d.title, hour, hour + 1)
      })
    return fromDeadlines.length > 0
      ? fromDeadlines
      : [eventToday("demo-event", "Demo: Math Quiz", 14, 15)]
  }, [apiDeadlines, today])

  const fromPlans = useMemo(() => planRows(data ?? []), [data])

  const deadlines: Deadline[] = useMemo(() => {
    const mapped = (apiDeadlines ?? []).map((d) => ({
      id: d.id,
      title: d.title,
      due: d.dueDate.slice(0, 10),
      dueTime: d.time ?? undefined,
      priority: mapPriority(d.priority),
      done: d.isCompleted,
    }))
    return mapped.length > 0 ? [...mapped, DEMO_DEADLINE] : [DEMO_DEADLINE]
  }, [apiDeadlines])

  const taskCards = useMemo(() => {
    const open = (todos ?? [])
      .filter((t) => t.status !== "COMPLETED" && t.status !== "SKIPPED")
      .slice(0, 3)
      .map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description ?? t.tags?.join(", ") ?? "",
        dueDate: t.dueDate?.slice(0, 10) ?? today,
        priority: mapPriority(t.priority),
      }))
    return open.length > 0 ? [...open, DEMO_TASK].slice(0, 4) : [DEMO_TASK]
  }, [todos, today])

  const productivityQueues = useMemo<ProductivityQueue[]>(() => {
    const habitList = habits ?? []
    const habitDone = habitList.filter((h) =>
      (h.completedDates ?? []).includes(today)
    ).length
    const habitUpcoming = Math.max(habitList.length - habitDone, 0)

    const deadlineList = apiDeadlines ?? []
    const deadlineDone = deadlineList.filter((d) => d.isCompleted).length
    const deadlineMissed = deadlineList.filter((d) => {
      if (d.isCompleted) return false
      return new Date(d.dueDate).getTime() < Date.now() - 86_400_000
    }).length
    const deadlineUpcoming = Math.max(
      deadlineList.length - deadlineDone - deadlineMissed,
      0
    )

    const todoList = todos ?? []
    const todoDone = todoList.filter((t) => t.status === "COMPLETED").length
    const todoMissed = todoList.filter((t) => {
      if (t.status === "COMPLETED" || t.status === "SKIPPED") return false
      if (!t.dueDate) return false
      return new Date(t.dueDate).getTime() < Date.now() - 86_400_000
    }).length
    const todoUpcoming = Math.max(todoList.length - todoDone - todoMissed, 0)

    return [
      {
        key: "habits",
        label: "Habits",
        slice: { done: habitDone, missed: 0, upcoming: habitUpcoming },
      },
      {
        key: "deadlines",
        label: "Deadlines",
        slice: {
          done: deadlineDone,
          missed: deadlineMissed,
          upcoming: deadlineUpcoming,
        },
      },
      {
        key: "todos",
        label: "Todos",
        slice: { done: todoDone, missed: todoMissed, upcoming: todoUpcoming },
      },
    ]
  }, [habits, apiDeadlines, todos, today])

  const focusScore = useMemo(() => {
    const slices = productivityQueues.map((q) => q.slice)
    const done = slices.reduce((sum, s) => sum + s.done, 0)
    const total = slices.reduce(
      (sum, s) => sum + s.done + s.missed + s.upcoming,
      0
    )
    const score = total > 0 ? Math.round((done / total) * 100) : 0
    return {
      score,
      trend: `${done}/${total}`,
      text: "completed today",
    }
  }, [productivityQueues])

  const recentActivity = useMemo<ActivityItem[]>(() => {
    const items: ActivityItem[] = []

    for (const habit of habits ?? []) {
      if ((habit.completedDates ?? []).includes(today)) {
        items.push({
          id: `habit-${habit.id}`,
          kind: "habit",
          title: habit.title,
          detail: "Checked in today",
          timeLabel: "Today",
        })
      }
    }

    for (const deadline of apiDeadlines ?? []) {
      if (!deadline.isCompleted) continue
      items.push({
        id: `deadline-${deadline.id}`,
        kind: "deadline",
        title: deadline.title,
        detail: "Deadline cleared",
        timeLabel: deadline.dueDate.slice(0, 10) === today ? "Today" : "Done",
      })
    }

    for (const todo of todos ?? []) {
      if (todo.status !== "COMPLETED") continue
      items.push({
        id: `todo-${todo.id}`,
        kind: "todo",
        title: todo.title,
        detail: "Todo completed",
        timeLabel: "Done",
      })
    }

    for (const row of fromPlans.slice(0, 3)) {
      items.push({
        id: `plan-${row.id}`,
        kind: "plan",
        title: row.title,
        detail: `${row.planName}${row.topic ? ` · ${row.topic}` : ""}`,
        timeLabel: "Active",
      })
    }

    if (items.length === 0) {
      return [
        {
          id: "demo-habit",
          kind: "habit",
          title: "Deep work block",
          detail: "Checked in today",
          timeLabel: "Today",
        },
        {
          id: "demo-deadline",
          kind: "deadline",
          title: "Ship landing polish",
          detail: "Deadline cleared",
          timeLabel: "Today",
        },
        {
          id: "demo-todo",
          kind: "todo",
          title: "Review agent prompts",
          detail: "Todo completed",
          timeLabel: "Earlier",
        },
        {
          id: "demo-plan",
          kind: "plan",
          title: "Trees & graphs",
          detail: "Demo roadmap · Data Structures",
          timeLabel: "Active",
        },
      ]
    }

    return items.slice(0, 12)
  }, [habits, apiDeadlines, todos, fromPlans, today])

  return (
    <main className="relative flex h-screen w-full flex-col bg-background pb-19">
      <HeaderIslands events={events} />

      <div className="flex min-h-0 flex-1 items-stretch gap-1 px-1 pt-1">
        <div className="flex w-96 shrink-0 flex-col overflow-y-auto rounded-sm border border-border bg-card [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
              <QueueTaskCard
                key={task.id}
                title={task.title}
                description={task.description}
                dueDate={task.dueDate}
                priority={task.priority}
              />
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-1.5 px-1 pb-2">
            <SectionRule label="From plans" />
            {fromPlans.length > 0 ? (
              fromPlans.slice(0, 4).map((row) => (
                <PlanItemCard
                  key={row.id}
                  title={row.title}
                  planName={row.planName}
                  topic={row.topic}
                />
              ))
            ) : (
              <PlanItemCard
                title="Demo: Trees, Graphs & Traversals"
                planName="Demo roadmap"
                topic="Data Structures"
              />
            )}
          </div>
        </div>

        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pt-14">
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
          className="flex h-full min-h-0 w-96 shrink-0 flex-col gap-1"
        >
          <ProductivityBoard score={focusScore} queues={productivityQueues} />
          <RecentActivity items={recentActivity} />
        </aside>
      </div>

      <div className="absolute right-0 bottom-2 left-0 flex w-full items-center justify-between">
        <div className="flex-1" />
        <div className="z-20 w-72">
          <FloatingDockDemo habits={habits ?? []} projects={data ?? []} />
        </div>
        <div className="flex flex-1 justify-center">
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card px-3.5 py-1.5 text-xs font-semibold text-muted-foreground shadow-xs backdrop-blur-md">
            <span className="font-bold text-emerald-500">⚡ {focusScore.score}%</span>
            <span>Focus Velocity</span>
          </div>
        </div>
      </div>
    </main>
  )
}
