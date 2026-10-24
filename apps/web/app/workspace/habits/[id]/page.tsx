"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { ActivityGraph } from "@workspace/ui/components/activity-chart"
import { StreakCard } from "@workspace/ui/components/streak-card"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { SkeletonWrapper, HabitDetailPageSkeleton } from "@workspace/ui/components/skeleton-wrapper"
import {
  CalendarDaysIcon,
  CheckCircle2Icon,
  FlameIcon,
  Link2Icon,
  TargetIcon,
  UnlinkIcon,
} from "lucide-react"

type HabitProfile = {
  title: string
  description: string
  category: string
  cadence: "Daily" | "Weekly" | "Monthly"
  goal: string
  reminder: string
  checkedInToday: boolean
  gap?: string
}

const HABIT_PROFILES: Record<string, HabitProfile> = {
  reading: {
    title: "Reading",
    description: "Read 10 pages of a physical book before the day ends.",
    category: "Learning",
    cadence: "Daily",
    goal: "10 pages",
    reminder: "9:00 PM",
    checkedInToday: false,
    gap: "3 days gap",
  },
  exercise: {
    title: "Exercise",
    description: "30 minutes of cardio or resistance, logged once it is done.",
    category: "Health",
    cadence: "Daily",
    goal: "30 minutes",
    reminder: "7:00 AM",
    checkedInToday: true,
  },
  "drink-water": {
    title: "Drink Water",
    description: "Drink 2 liters of water through the day to stay hydrated.",
    category: "Health",
    cadence: "Daily",
    goal: "2 liters",
    reminder: "Every 2 hours",
    checkedInToday: true,
  },
}

const habitData = {
  startDate: "Jan 1, 2026",
  expectedEndDate: "Dec 31, 2026",
  stats: {
    currentStreak: 12,
    maxStreak: 45,
    totalDays: 180,
    totalActiveDays: 152,
  },
}

const streak = [
  { periodStart: "2024-01-01", periodEnd: "2024-01-01" },
  { periodStart: "2024-01-02", periodEnd: "2024-01-02" },
  { periodStart: "2024-01-03", periodEnd: "2024-01-03" },
]

function habitIdFromParams(id: string | string[] | undefined) {
  if (Array.isArray(id)) return id[0] ?? "habit"
  return id ?? "habit"
}

function titleFromId(id: string) {
  const words = id.split(/[-_]+/).filter(Boolean)
  if (words.length === 0) return "Habit"
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
}

function profileFor(id: string): HabitProfile {
  const known = HABIT_PROFILES[id]
  if (known) return known
  const title = titleFromId(id)
  return {
    title,
    description: `Keep ${title.toLowerCase()} on a steady rhythm.`,
    category: "General",
    cadence: "Daily",
    goal: "Once a day",
    reminder: "Not set",
    checkedInToday: false,
  }
}

function LeetCodeMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M14.7 3.3 6.4 12l8.3 8.7-1.9 1.8L2.6 12 12.8 1.5z"
      />
      <path fill="currentColor" d="M18.2 6.4h2.4v11.2h-2.4z" />
    </svg>
  )
}

function Page(): JSX.Element {
  const params = useParams()
  const habit = profileFor(habitIdFromParams(params.id))
  const consistency = Math.round(
    (habitData.stats.totalActiveDays / habitData.stats.totalDays) * 100
  )

  const [leetcodeHandle, setLeetcodeHandle] = useState<string | null>(null)
  const [draftHandle, setDraftHandle] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)

  const connectLeetCode = () => {
    const handle = draftHandle.trim()
    if (!handle) return
    setLeetcodeHandle(handle)
    setDraftHandle("")
    setIsConnecting(false)
  }

  const disconnectLeetCode = () => {
    setLeetcodeHandle(null)
    setDraftHandle("")
    setIsConnecting(false)
  }

  return (
    <SkeletonWrapper skeleton={<HabitDetailPageSkeleton />} delay={2000}>
      <main className="flex min-h-full w-full flex-col gap-10 px-10 py-16 xl:flex-row xl:justify-between">
        <div className="flex w-full flex-col gap-12 xl:max-w-[70%]">
          <header className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                {habit.category}
              </span>
              <span className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                {habit.cadence}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-warning/25 bg-warning/10 px-2.5 py-1 text-[11px] font-semibold text-warning">
                <FlameIcon className="size-3.5" />
                {habitData.stats.currentStreak} day streak
              </span>
              {habit.gap ? (
                <span className="rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-[11px] font-medium text-destructive">
                  {habit.gap}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success">
                  <CheckCircle2Icon className="size-3.5" />
                  {habit.checkedInToday ? "Done today" : "On track"}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2 border-b border-border pb-5">
              <h1 className="text-5xl font-bold tracking-tight">{habit.title}</h1>
              <p className="max-w-2xl text-lg text-muted-foreground">{habit.description}</p>
            </div>

            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1">
                <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <TargetIcon className="size-3.5" />
                  Goal
                </dt>
                <dd className="text-sm font-medium">{habit.goal}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <CalendarDaysIcon className="size-3.5" />
                  Started
                </dt>
                <dd className="text-sm font-medium">{habitData.startDate}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <CalendarDaysIcon className="size-3.5" />
                  Target end
                </dt>
                <dd className="text-sm font-medium">{habitData.expectedEndDate}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-medium text-muted-foreground">Reminder</dt>
                <dd className="text-sm font-medium">{habit.reminder}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-medium text-muted-foreground">Consistency</dt>
                <dd className="text-sm font-medium">
                  {consistency}% · {habitData.stats.totalActiveDays} active days
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-medium text-muted-foreground">Source</dt>
                <dd className="text-sm font-medium">
                  {leetcodeHandle ? `LeetCode · ${leetcodeHandle}` : "Manual check-in"}
                </dd>
              </div>
            </dl>
          </header>

          <section className="flex flex-col gap-3" aria-labelledby="habit-integrations">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 id="habit-integrations" className="text-sm font-semibold">
                  Integrations
                </h2>
                <p className="text-xs text-muted-foreground">
                  LeetCode is the only source that can check this habit in for you.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-warning/30 bg-warning/10 text-warning">
                    <LeetCodeMark className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">LeetCode</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      A solved problem counts as today&apos;s check-in.
                    </p>
                    {leetcodeHandle && (
                      <p className="mt-1 text-xs font-medium text-foreground">
                        Connected as {leetcodeHandle}
                      </p>
                    )}
                  </div>
                </div>

                {leetcodeHandle ? (
                  <Button variant="outline" size="sm" onClick={disconnectLeetCode}>
                    <UnlinkIcon />
                    Disconnect
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => setIsConnecting(true)} disabled={isConnecting}>
                    <Link2Icon />
                    Connect
                  </Button>
                )}
              </div>

              {isConnecting && !leetcodeHandle && (
                <form
                  className="mt-4 flex flex-col gap-2 border-t border-border pt-4 sm:flex-row"
                  onSubmit={(event) => {
                    event.preventDefault()
                    connectLeetCode()
                  }}
                >
                  <Input
                    value={draftHandle}
                    onChange={(event) => setDraftHandle(event.target.value)}
                    placeholder="LeetCode username"
                    aria-label="LeetCode username"
                    autoFocus
                    className="border-input bg-background"
                  />
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={draftHandle.trim().length === 0}>
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsConnecting(false)
                        setDraftHandle("")
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </section>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Card className="flex max-h-24 min-h-10 flex-col justify-between gap-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm text-secondary-foreground/75">
                    Current Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold text-secondary-foreground/85">
                    {habitData.stats.currentStreak} days
                  </div>
                </CardContent>
              </Card>
              <Card className="flex max-h-24 min-h-10 flex-col justify-between gap-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm text-secondary-foreground/70">
                    Max Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-medium">
                    {habitData.stats.maxStreak} days
                  </div>
                </CardContent>
              </Card>
              <Card className="flex max-h-24 min-h-10 flex-col justify-between gap-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm text-secondary-foreground/70">
                    Active Days
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary-foreground/90">
                    {habitData.stats.totalActiveDays}
                  </div>
                </CardContent>
              </Card>
              <Card className="flex max-h-24 min-h-10 flex-col justify-between gap-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm text-secondary-foreground/70">
                    Total Days
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold text-secondary-foreground/90">
                    {habitData.stats.totalDays}
                  </div>
                </CardContent>
              </Card>
            </div>

            <ActivityGraph />
          </div>
        </div>

        <div className="flex w-full flex-col xl:max-w-[30%] xl:items-end">
          <StreakCard
            streak={streak}
            currentStreak={habitData.stats.currentStreak}
            longestStreak={habitData.stats.maxStreak}
            total={habitData.stats.totalDays}
            defaultHowItWorksOpen={true}
          />
        </div>
      </main>
    </SkeletonWrapper>
  )
}

export default Page
