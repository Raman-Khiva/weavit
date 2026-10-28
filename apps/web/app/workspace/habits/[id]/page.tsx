"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { HabitHeader, type HabitStatus } from "@workspace/ui/components/habit-header"
import { HabitHeatmap } from "@workspace/ui/components/habit-heatmap"
import {
  LogStream,
  type JournalEntry,
  type JournalNote,
  type NewJournalEntryInput,
} from "@workspace/ui/components/log-stream"
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
import { Link2Icon, UnlinkIcon } from "lucide-react"
import { JsonToSseTransformStream } from "ai"

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

const PERIOD_START = new Date(2026, 0, 1)
const PERIOD_END = new Date(2026, 11, 31)

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

const JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: "oct-25-done",
    ts: new Date(2026, 9, 25, 21, 40).getTime(),
    status: "done",
    quantity: "12 pages",
    entry: "Read 12 pages and finished the chapter before bed.",
    remark: "Easier once the phone was in the other room.",
  },
  {
    id: "oct-24-missed",
    ts: new Date(2026, 9, 24, 23, 10).getTime(),
    status: "missed",
    entry: "Missed the evening reading after a late night.",
  },
  {
    id: "oct-22-done",
    ts: new Date(2026, 9, 22, 8, 15).getTime(),
    status: "done",
    quantity: "20 pages",
    entry: "Read 20 pages on the train, starting from a planned 10.",
  },
  {
    id: "oct-21-done",
    ts: new Date(2026, 9, 21, 7, 30).getTime(),
    status: "done",
    quantity: "15 min",
    entry: "Read 8 pages over breakfast before leaving for work.",
    remark: "Short session, still counted.",
  },
  {
    id: "oct-19-done",
    ts: new Date(2026, 9, 19, 22, 5).getTime(),
    status: "done",
    quantity: "45 min",
    entry: "Read two chapters of the novel at the desk.",
  },
]

const JOURNAL_NOTES: JournalNote[] = [
  {
    id: "note-phone",
    ts: new Date(2026, 9, 23, 18, 5).getTime(),
    content: "Leave the phone in the other room before opening the book.",
  },
  {
    id: "note-floor",
    ts: new Date(2026, 9, 20, 21, 0).getTime(),
    content: "Ten pages is the floor. Stopping there still counts.",
  },
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
  const status: HabitStatus = habit.gap ? "behind" : "on_track"

  const [leetcodeHandle, setLeetcodeHandle] = useState<string | null>(null)
  const [draftHandle, setDraftHandle] = useState("")
  const [isConnecting, setIsConnecting] = useState(false);
  const [doneToday,setDoneToday] = useState<boolean>(false);
  const [reminder, setReminder] = useState<string | null>(
    habit.reminder === "Not set" ? null : habit.reminder
  )


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

  useEffect(()=>{

    const getTodayStatus = async ()=>{
        const res = await fetch("http://localhost:4000/leetcode/Raman_Khiva");
        
        if(res.ok){
          const result = await res.json();
          alert(`Data fetched from from backend, doneToday :  ${JSON.stringify(result.doneToday)} `);
          if(!result.errors){
             setDoneToday(result.doneToday);
          } 
        }
    }

    getTodayStatus();
  },[]);

  return (
    <SkeletonWrapper skeleton={<HabitDetailPageSkeleton />} delay={2000}>
      <main className="flex min-h-full w-full flex-col gap-10 px-10 py-16 xl:flex-row xl:justify-between">
        <div className="flex w-full flex-col gap-12 xl:max-w-[70%]">
          <HabitHeader
            title={habit.title}
            description={habit.description}
            category={habit.category}
            frequency={habit.cadence}
            currentStreak={habitData.stats.currentStreak}
            status={status}
            goalLabel={habit.goal}
            startDate={PERIOD_START}
            targetEndDate={PERIOD_END}
            reminder={reminder}
            source={leetcodeHandle ? `LeetCode · ${leetcodeHandle}` : "Manual check-in"}
            activeDays={habitData.stats.totalActiveDays}
            totalDays={habitData.stats.totalDays}
            doneToday={doneToday}
            onToggleDone={() => setDoneToday((current) => !current)}
            onSetReminder={() => setReminder("08:00 PM")}
          />

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

            <HabitHeatmap
              activeDays={habitData.stats.totalActiveDays}
              totalDays={habitData.stats.totalDays}
              currentStreak={habitData.stats.currentStreak}
              longestStreak={habitData.stats.maxStreak}
              doneToday={doneToday}
            />

            <LogStream entries={JOURNAL_ENTRIES} notes={JOURNAL_NOTES} />
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
