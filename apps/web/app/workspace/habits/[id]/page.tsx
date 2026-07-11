"use client"
import { ActivityGraph } from "@workspace/ui/components/activity-chart"
import { useParams } from "next/navigation"
import { StreakCalender } from "@workspace/ui/components/streak-calender"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  FlameIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  TrophyIcon,
} from "lucide-react"

const Page = () => {
  const { id } = useParams()

  // Dummy data for the habit
  const habitData = {
    description: "Drink 2 liters of water every day to stay hydrated.",
    startDate: "Jan 1, 2026",
    expectedEndDate: "Dec 31, 2026",
    stats: {
      currentStreak: 12,
      maxStreak: 45,
      totalDays: 180,
      totalActiveDays: 152,
    },
  }

  return (
    <main className="flex min-h-full w-full flex-col gap-10 px-10 py-16 xl:flex-row xl:justify-between">
      <div className="flex w-full flex-col gap-12 xl:max-w-[70%]">
        <header className="flex flex-col gap-4">
          <h1 className="border-b border-secondary-foreground/60 pb-3 text-5xl font-bold tracking-tight capitalize">
            {id}
          </h1>
          <div className="flex flex-col gap-2">
            <p className="text-lg text-muted-foreground">
              {habitData.description}
            </p>
            <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarDaysIcon className="size-4" />
                Start: {habitData.startDate}
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5">
                Expected End: {habitData.expectedEndDate}
              </span>
            </div>
          </div>
        </header>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card className="flex max-h-24 min-h-10 flex-col justify-between gap-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="foreground text-sm text-secondary-foreground/75">
                  Current Streak
                </CardTitle>
              </CardHeader>
              <CardContent className="">
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
        <StreakCalender />
      </div>
    </main>
  )
}

export default Page
