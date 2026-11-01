"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useAuth, useUser } from "@clerk/nextjs"
import {
  ArrowRight,
  CalendarClock,
  ClipboardCheck,
  Flame,
  Layers,
  Target,
} from "lucide-react"

import { Progress } from "@workspace/ui/components/progress"
import { getProjectStats } from "@workspace/ui/components/project-overview-card"
import { SkeletonWrapper } from "@workspace/ui/components/skeleton-wrapper"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { cn } from "@workspace/ui/lib/utils"

import { useGetHabitsQuery } from "@/features/habits/habits.api"
import { useGetProjectsQuery } from "@/features/projects/projects.api"
import { useGetTodosQuery } from "@/features/todos/todos.api"
import { useGetDeadlinesQuery } from "@/features/deadlines/deadlines.api"

function WorkspaceHomeSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-6 md:p-10">
      <div className="space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  )
}

function formatDue(value?: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })
}

function priorityTone(priority?: string | null) {
  switch (priority) {
    case "URGENT":
    case "HIGH":
      return "text-red-400"
    case "MEDIUM":
      return "text-amber-400"
    default:
      return "text-muted-foreground"
  }
}

export default function WorkspaceHomePage() {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()
  const skip = !isLoaded || !isSignedIn

  const { data: habits = [] } = useGetHabitsQuery(undefined, { skip })
  const { data: projects = [] } = useGetProjectsQuery(undefined, { skip })
  const { data: todos = [] } = useGetTodosQuery(undefined, { skip })
  const { data: deadlines = [] } = useGetDeadlinesQuery(undefined, { skip })

  const firstName =
    user?.firstName ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "there"

  const openTodos = useMemo(
    () =>
      todos.filter(
        (todo) => todo.status !== "COMPLETED" && todo.status !== "SKIPPED"
      ),
    [todos]
  )

  const upcomingDeadlines = useMemo(() => {
    const now = Date.now()
    return [...deadlines]
      .filter((d) => !d.isCompleted)
      .sort(
        (a, b) =>
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      )
      .filter((d) => {
        const t = new Date(d.dueDate).getTime()
        return Number.isNaN(t) || t >= now - 86_400_000
      })
      .slice(0, 5)
  }, [deadlines])

  const activePlans = useMemo(() => {
    return projects
      .map((project) => {
        const stats = getProjectStats(project)
        return { project, ...stats }
      })
      .filter(({ total, done }) => total === 0 || done < total)
      .slice(0, 4)
  }, [projects])

  const nextPlanTasks = useMemo(() => {
    const rows: {
      id: string
      title: string
      planName: string
      topic?: string
    }[] = []
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
    return rows.slice(0, 5)
  }, [projects])

  const habitPreview = habits.slice(0, 6)
  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  const stats = [
    {
      label: "Habits",
      value: habits.length,
      href: "/workspace/habits",
      icon: Target,
      hint: "Daily rituals",
    },
    {
      label: "Open todos",
      value: openTodos.length,
      href: "/workspace/todos",
      icon: ClipboardCheck,
      hint: "Still in flight",
    },
    {
      label: "Active plans",
      value: activePlans.length,
      href: "/workspace/projects",
      icon: Layers,
      hint: "Roadmaps running",
    },
    {
      label: "Deadlines",
      value: upcomingDeadlines.length,
      href: "/workspace/deadlines",
      icon: CalendarClock,
      hint: "Coming up",
    },
  ]

  return (
    <SkeletonWrapper skeleton={<WorkspaceHomeSkeleton />} delay={600}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-6 md:p-10">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">
              {todayLabel}
            </div>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Welcome back, {firstName}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Your workspace home — habits, todos, roadmaps, and deadlines in one
              place. Jump into what needs attention today.
            </p>
          </div>
          <Link
            href="/workspace/timeline"
            className="inline-flex items-center gap-1.5 self-start rounded-lg border border-border/80 bg-card/60 px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-border hover:text-foreground md:self-auto"
          >
            <Flame className="size-3.5" />
            Open week timeline
            <ArrowRight className="size-3.5" />
          </Link>
        </header>

        <section
          aria-label="Workspace snapshot"
          className="grid grid-cols-2 gap-3 lg:grid-cols-4"
        >
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Link
                key={stat.label}
                href={stat.href}
                className="group flex flex-col gap-3 rounded-2xl border border-border/80 bg-card/50 p-4 transition-colors hover:border-border hover:bg-card/80"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {stat.label}
                  </span>
                  <Icon className="size-4 text-muted-foreground/70 transition-colors group-hover:text-foreground" />
                </div>
                <div>
                  <p className="text-3xl font-bold tracking-tight tabular-nums text-foreground">
                    {stat.value}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {stat.hint}
                  </p>
                </div>
              </Link>
            )
          })}
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="flex min-h-0 flex-col gap-4 rounded-2xl border border-border/80 bg-card/40 p-5 lg:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-foreground">
                  Next from plans
                </h2>
                <p className="text-xs text-muted-foreground">
                  Current tasks across your active roadmaps
                </p>
              </div>
              <Link
                href="/workspace/projects"
                className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                All plans
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            {nextPlanTasks.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border/70 px-4 py-10 text-center text-sm text-muted-foreground">
                No in-progress plan tasks yet.{" "}
                <Link
                  href="/workspace/projects"
                  className="font-medium text-foreground underline underline-offset-4"
                >
                  Open roadmaps
                </Link>
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {nextPlanTasks.map((row) => (
                  <li key={row.id}>
                    <Link
                      href="/workspace/projects"
                      className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-background/40 px-3.5 py-3 transition-colors hover:border-border hover:bg-background/70"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {row.title}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {row.planName}
                          {row.topic ? ` · ${row.topic}` : ""}
                        </p>
                      </div>
                      <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {activePlans.length > 0 && (
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {activePlans.map(({ project, total, done }) => {
                  const pct = total > 0 ? Math.round((done / total) * 100) : 0
                  return (
                    <Link
                      key={project.id}
                      href={`/workspace/projects/${project.id}`}
                      className="flex flex-col gap-2.5 rounded-xl border border-border/60 bg-background/30 px-3.5 py-3 transition-colors hover:border-border hover:bg-background/60"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {project.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {done} of {total} tasks
                        </p>
                      </div>
                      <Progress
                        value={pct}
                        showValue={false}
                        className="h-1.5"
                      />
                    </Link>
                  )
                })}
              </div>
            )}
          </section>

          <section className="flex min-h-0 flex-col gap-4 rounded-2xl border border-border/80 bg-card/40 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-foreground">
                  Upcoming deadlines
                </h2>
                <p className="text-xs text-muted-foreground">
                  Sorted by due date
                </p>
              </div>
              <Link
                href="/workspace/deadlines"
                className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                View all
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            {upcomingDeadlines.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border/70 px-4 py-10 text-center text-sm text-muted-foreground">
                No upcoming deadlines.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {upcomingDeadlines.map((deadline) => (
                  <li
                    key={deadline.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/40 px-3.5 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {deadline.title}
                      </p>
                      <p
                        className={cn(
                          "mt-0.5 text-xs font-medium",
                          priorityTone(deadline.priority)
                        )}
                      >
                        {deadline.priority ?? "MEDIUM"}
                        {deadline.course ? ` · ${deadline.course}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {formatDue(deadline.dueDate) ?? "—"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="flex min-h-0 flex-col gap-4 rounded-2xl border border-border/80 bg-card/40 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-foreground">Habits</h2>
                <p className="text-xs text-muted-foreground">
                  Rituals in your workspace
                </p>
              </div>
              <Link
                href="/workspace/habits"
                className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Open habits
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            {habitPreview.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border/70 px-4 py-10 text-center text-sm text-muted-foreground">
                No habits yet.{" "}
                <Link
                  href="/workspace/habits"
                  className="font-medium text-foreground underline underline-offset-4"
                >
                  Create one
                </Link>
              </p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {habitPreview.map((habit) => (
                  <li key={habit.id}>
                    <Link
                      href={`/workspace/habits/${habit.id}`}
                      className="flex h-full flex-col gap-1 rounded-xl border border-border/60 bg-background/40 px-3.5 py-3 transition-colors hover:border-border hover:bg-background/70"
                    >
                      <p className="truncate text-sm font-semibold text-foreground">
                        {habit.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {habit.category || habit.frequency || "Habit"}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="flex min-h-0 flex-col gap-4 rounded-2xl border border-border/80 bg-card/40 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-foreground">
                  Open todos
                </h2>
                <p className="text-xs text-muted-foreground">
                  Tasks waiting on you
                </p>
              </div>
              <Link
                href="/workspace/todos"
                className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Board
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            {openTodos.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border/70 px-4 py-10 text-center text-sm text-muted-foreground">
                Inbox zero — no open todos.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {openTodos.slice(0, 6).map((todo) => (
                  <li
                    key={todo.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/40 px-3.5 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {todo.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {todo.status?.replaceAll("_", " ") ?? "PENDING"}
                        {todo.dueDate
                          ? ` · due ${formatDue(todo.dueDate)}`
                          : ""}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 text-[11px] font-semibold uppercase tracking-wide",
                        priorityTone(todo.priority)
                      )}
                    >
                      {todo.priority ?? "MEDIUM"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </SkeletonWrapper>
  )
}
