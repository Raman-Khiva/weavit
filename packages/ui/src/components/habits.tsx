"use client"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { useEffect, useState } from "react"
import { CheckCircle, Flame } from "lucide-react"
import { HabitCard } from "@workspace/ui/components/habit-card"
import { components } from "@weavit/api-types"

type HABIT = components["schemas"]["Habit"];

export interface HabitProps {
  title: string
  category?: string
  description?: string
  gap?: string
  streak?: number
}

export const Status = ({ done }: { done: boolean }) => {
  return (
    <div>
      {done ? (
        <CheckCircle className="font-bold text-blue-500" size={23} />
      ) : (
        <div className="h-5 w-5 rounded-full border-2 border-border" />
      )}
    </div>
  )
}

export const Habit = ({
  title,
  category,
  description,
  gap,
  streak,
}: HabitProps) => {
  const [done, setDone] = useState<boolean>(false)
  return (
    <Card className="flex h-32 w-full min-w-20 justify-between gap-0 rounded-lg bg-background px-4">
      <CardHeader className="relative px-0 pb-1">
        {gap && (
          <Badge variant="destructive" className="absolute top-0 right-0">
            {gap}
          </Badge>
        )}
        <div className="flex flex-row items-center gap-2">
          <Status done={done} />
          <a
            href={`/workspace/habits/${title.toLowerCase().replace(/\s+/g, "-")}`}
            className="hover:underline"
          >
            <CardTitle className="font-bold">{title}</CardTitle>
          </a>
        </div>
      </CardHeader>
      {description && (
        <CardContent className="px-0 pb-3">
          <CardDescription className="text-secondary-foreground/90">
            {description}
          </CardDescription>
        </CardContent>
      )}
      <CardFooter className="flex justify-between bg-background px-2 py-2">
        <div>
          {(streak || streak === 0) && (
            <div className="flex items-center gap-1">
              <Flame
                size={17}
                stroke={streak ? "orange" : "gray"}
                fill={streak ? "orange" : ""}
              />
              <p className="pt-0.5 text-xs">{streak.toString()}D</p>
            </div>
          )}
        </div>
        <Button
          disabled={done}
          onClick={() => setDone(true)}
          className="border border-border/40 bg-background py-0 text-xs font-normal"
        >
          Done
        </Button>
      </CardFooter>
    </Card>
  )
}

export interface HabitsProps {
  habits?: HABIT[]
}

const DEFAULT_HABITS: HabitProps[] = [
  {
    title: "Reading",
    category: "learning",
    gap: "3 days gap",
    streak: 9,
  },
  { title: "Meditation", category: "health", streak: 0 },
  {
    title: "Exercise",
    category: "health",
    streak: 36,
    gap: "1 day gap",
  },
]



type HabitRow = {
  id: string
  title: string
  description?: string
  streak: number
  history: boolean[]
  completed: boolean
}

const PREVIEW_HABITS: HabitRow[] = [
  {
    id: "preview-leetcode",
    title: "Solve a LeetCode problem",
    streak: 14,
    history: [true, true, false, true, true, true],
    completed: false,
  },
  {
    id: "preview-reading",
    title: "Read 10 pages",
    streak: 9,
    history: [true, true, true, true, false, true],
    completed: true,
  },
]

function rowsFromHabits(habits: HABIT[]): HabitRow[] {
  return habits.map((habit) => ({
    id: habit.id,
    title: habit.title,
    streak: habit.streakCount ?? 0,
    history: [false, false, false, false, false, false],
    completed: false,
  }))
}

export const Habits = ({ habits }: HabitsProps) => {
  const [rows, setRows] = useState<HabitRow[]>(
    habits && habits.length > 0 ? rowsFromHabits(habits) : PREVIEW_HABITS
  )

  useEffect(() => {
    if (habits && habits.length > 0) setRows(rowsFromHabits(habits))
  }, [habits])

  return (
    <main className="flex w-full min-w-7 flex-col gap-1 px-1 py-1">
      <div className="flex flex-col gap-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {rows.slice(0, 4).map((habit, index) => (
          <HabitCard
            key={habit.id}
            title={habit.title}
            streak={habit.completed ? habit.streak : Math.max(habit.streak - 1, 0)}
            history={habit.history}
            completed={habit.completed}
            onToggle={() =>
              setRows((current) =>
                current.map((item, i) =>
                  i === index ? { ...item, completed: !item.completed } : item
                )
              )
            }
          />
        ))}
      </div>
    </main>
  )
}
