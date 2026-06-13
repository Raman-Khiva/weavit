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
import { useState } from "react"
import { CheckCircle, Flame } from "lucide-react"

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
    <Card className="w-full min-w-20 gap-0 rounded-lg bg-background px-4">
      <CardHeader className="relative px-0 pb-1">
        {gap && (
          <Badge variant="destructive" className="absolute top-0 right-0">
            {gap}
          </Badge>
        )}
        <div className="flex flex-row items-center gap-2">
          <Status done={done} />
          <CardTitle className="font-bold">{title}</CardTitle>
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
  habits?: HabitProps[]
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

export const Habits = ({ habits = DEFAULT_HABITS }: HabitsProps) => {
  return (
    <main className="flex h-full w-full max-w-sm min-w-8 flex-col gap-2 px-2">
      <h2 className="global-heading">Daily Tasks</h2>
      {habits.map((habit, index) => (
        <Habit key={index} {...habit} />
      ))}
    </main>
  )
}
