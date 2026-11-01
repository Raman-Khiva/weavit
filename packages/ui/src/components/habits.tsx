"use client"
import { useEffect, useState } from "react"
import { HabitCard } from "@workspace/ui/components/habit-card"
import { components } from "@weavit/api-types"

type HABIT = components["schemas"]["Habit"]

export interface HabitsProps {
  habits?: HABIT[]
  onToggle?: (habitId: string) => void
}

type HabitRow = {
  id: string
  title: string
  streak: number
  history: boolean[]
  completed: boolean
}

const DEMO_HABIT: HabitRow = {
  id: "demo-habit",
  title: "Demo: Read 10 pages",
  streak: 9,
  history: [true, true, true, true, false, true],
  completed: false,
}

function historyFromDates(dates: string[]): boolean[] {
  const set = new Set(dates)
  const out: boolean[] = []
  for (let i = 6; i >= 1; i--) {
    const d = new Date()
    d.setUTCDate(d.getUTCDate() - i)
    out.push(set.has(d.toISOString().slice(0, 10)))
  }
  return out
}

function rowsFromHabits(habits: HABIT[]): HabitRow[] {
  const today = new Date().toISOString().slice(0, 10)
  return habits.map((habit) => {
    const dates = habit.completedDates ?? []
    return {
      id: habit.id,
      title: habit.title,
      streak: habit.streakCount ?? 0,
      history: historyFromDates(dates),
      completed: dates.includes(today),
    }
  })
}

export const Habits = ({ habits, onToggle }: HabitsProps) => {
  const [rows, setRows] = useState<HabitRow[]>(() =>
    habits && habits.length > 0 ? [...rowsFromHabits(habits), DEMO_HABIT] : [DEMO_HABIT]
  )

  useEffect(() => {
    const api = habits && habits.length > 0 ? rowsFromHabits(habits) : []
    setRows([...api, DEMO_HABIT])
  }, [habits])

  return (
    <main className="flex w-full min-w-7 flex-col gap-1 px-1 py-1">
      <div className="flex flex-col gap-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {rows.slice(0, 4).map((habit) => (
          <HabitCard
            key={habit.id}
            title={habit.title}
            streak={habit.completed ? habit.streak : Math.max(habit.streak - 1, 0)}
            history={habit.history}
            completed={habit.completed}
            onToggle={() => {
              if (habit.id.startsWith("demo-")) {
                setRows((current) =>
                  current.map((item) =>
                    item.id === habit.id ? { ...item, completed: !item.completed } : item
                  )
                )
                return
              }
              onToggle?.(habit.id)
            }}
          />
        ))}
      </div>
    </main>
  )
}
