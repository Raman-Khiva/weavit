"use client"

import { useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { HabitHeader, type HabitStatus } from "@workspace/ui/components/habit-header"
import { HabitHeatmap } from "@workspace/ui/components/habit-heatmap"
import {
  LogStream,
  type JournalEntry,
} from "@workspace/ui/components/log-stream"
import { StreakCard } from "@workspace/ui/components/streak-card"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { HabitDetailPageSkeleton } from "@workspace/ui/components/skeleton-wrapper"
import {
  useGetHabitsQuery,
  usePostHabitLogMutation,
  useToggleHabitMutation,
} from "@/features/habits/habits.api"

const PERIOD_START = new Date(2026, 0, 1)
const PERIOD_END = new Date(2026, 11, 31)

function habitIdFromParams(id: string | string[] | undefined) {
  if (Array.isArray(id)) return id[0] ?? "habit"
  return id ?? "habit"
}

function frequencyLabel(frequency?: string | null) {
  if (frequency === "WEEKLY") return "Weekly" as const
  if (frequency === "MONTHLY") return "Monthly" as const
  return "Daily" as const
}

function utcToday(): string {
  return new Date().toISOString().slice(0, 10)
}

function shiftUtcDate(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00.000Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function streakFromDates(completedDates: string[], today = utcToday()): number {
  const set = new Set(completedDates)
  let cursor = today
  if (!set.has(cursor)) {
    cursor = shiftUtcDate(today, -1)
    if (!set.has(cursor)) return 0
  }
  let streak = 0
  while (set.has(cursor)) {
    streak += 1
    cursor = shiftUtcDate(cursor, -1)
  }
  return streak
}

function bestStreakFromDates(completedDates: string[]): number {
  if (completedDates.length === 0) return 0
  const sorted = [...new Set(completedDates)].sort()
  let best = 1
  let run = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]!
    const cur = sorted[i]!
    if (shiftUtcDate(prev, 1) === cur) {
      run += 1
      best = Math.max(best, run)
    } else {
      run = 1
    }
  }
  return best
}

/** Collapse consecutive completed days into streak periods for StreakCalendar. */
function periodsFromCompletedDates(completedDates: string[]) {
  const sorted = [...new Set(completedDates)].sort()
  if (sorted.length === 0) return []

  const periods: { periodStart: string; periodEnd: string }[] = []
  let start = sorted[0]!
  let end = sorted[0]!

  for (let i = 1; i < sorted.length; i++) {
    const cur = sorted[i]!
    if (shiftUtcDate(end, 1) === cur) {
      end = cur
    } else {
      periods.push({ periodStart: start, periodEnd: end })
      start = cur
      end = cur
    }
  }
  periods.push({ periodStart: start, periodEnd: end })
  return periods
}

function Page(): JSX.Element {
  const params = useParams()
  const habitId = habitIdFromParams(params.id)
  const { isLoaded, isSignedIn } = useAuth()
  const { data: habits, isLoading, isFetching, isError } = useGetHabitsQuery(
    undefined,
    { skip: !isLoaded || !isSignedIn }
  )
  const [postHabitLog] = usePostHabitLogMutation()
  const [toggleHabit] = useToggleHabitMutation()

  const [reminder, setReminder] = useState<string | null>("Not set")

  const realHabit = habits?.find((item) => item.id === habitId)
  const habitLogs = realHabit?.logs ?? []
  const completedDates = realHabit?.completedDates ?? []

  const journalEntries = useMemo<JournalEntry[]>(() => {
    return habitLogs.map((log) => ({
      id: log.id,
      ts: new Date(log.createdAt).getTime(),
      status: "done" as const,
      entry: log.notes?.trim() || "Checked in",
    }))
  }, [habitLogs])

  const stats = useMemo(() => {
    const dayMs = 24 * 60 * 60 * 1000
    const totalActiveDays = completedDates.length
    return {
      currentStreak: realHabit?.streakCount ?? streakFromDates(completedDates),
      maxStreak: bestStreakFromDates(completedDates),
      totalActiveDays,
      totalDays: Math.max(
        1,
        Math.ceil((Date.now() - PERIOD_START.getTime()) / dayMs)
      ),
    }
  }, [completedDates, realHabit?.streakCount])

  const isDoneToday = completedDates.includes(utcToday())

  const streak = useMemo(
    () => periodsFromCompletedDates(completedDates),
    [completedDates]
  )

  if (!isLoaded || !isSignedIn || isLoading || (isFetching && !habits)) {
    return <HabitDetailPageSkeleton />
  }

  if (isError) {
    return (
      <main className="flex min-h-full items-center justify-center p-10">
        <p className="text-sm text-muted-foreground">
          Couldn&apos;t load habits. Try refreshing.
        </p>
      </main>
    )
  }

  if (!realHabit) {
    return (
      <main className="flex min-h-full items-center justify-center p-10">
        <p className="text-sm text-muted-foreground">Habit not found.</p>
      </main>
    )
  }

  const status: HabitStatus = "on_track"
  const cadence = frequencyLabel(realHabit.frequency)

  return (
    <main className="flex min-h-full w-full flex-col gap-10 px-10 py-16 xl:flex-row xl:justify-between">
      <div className="flex w-full flex-col gap-12 xl:max-w-[70%]">
        <HabitHeader
          title={realHabit.title}
          description={realHabit.description ?? ""}
          category={realHabit.category ?? "General"}
          frequency={cadence}
          currentStreak={stats.currentStreak}
          status={status}
          goalLabel="Once a day"
          startDate={PERIOD_START}
          targetEndDate={PERIOD_END}
          reminder={reminder}
          source="Manual check-in"
          activeDays={stats.totalActiveDays}
          totalDays={stats.totalDays}
          doneToday={isDoneToday}
          onToggleDone={async () => {
            await toggleHabit(habitId).unwrap()
          }}
          onSetReminder={() => setReminder("08:00 PM")}
        />

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
                  {stats.currentStreak} days
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
                <div className="text-2xl font-medium">{stats.maxStreak} days</div>
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
                  {stats.totalActiveDays}
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
                  {stats.totalDays}
                </div>
              </CardContent>
            </Card>
          </div>

          <HabitHeatmap
            completedDates={completedDates}
            currentStreak={stats.currentStreak}
          />

          <LogStream
            entries={journalEntries}
            notes={habitLogs}
            onAddEntry={async (body) => {
              await postHabitLog({ habitId, body }).unwrap()
            }}
          />
        </div>
      </div>

      <div className="flex w-full min-w-0 flex-col xl:max-w-[30%]">
        <StreakCard
          streak={streak}
          currentStreak={stats.currentStreak}
          longestStreak={stats.maxStreak}
          total={stats.totalActiveDays}
          defaultHowItWorksOpen={true}
        />
      </div>
    </main>
  )
}

export default Page
