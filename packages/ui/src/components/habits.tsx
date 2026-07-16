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
import { CheckCircle, Flame, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

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

export const Habits = ({ habits: initialHabits = DEFAULT_HABITS }: HabitsProps) => {
  const [habitsList, setHabitsList] = useState<HabitProps[]>(initialHabits)
  const [newHabitTitle, setNewHabitTitle] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newHabitTitle.trim()) return

    const newHabit: HabitProps = {
      title: newHabitTitle,
      category: "custom",
      streak: 0,
    }

    setHabitsList([...habitsList, newHabit])
    setNewHabitTitle("")
    setIsOpen(false)
  }

  return (
    <main className="flex h-full w-full max-w-sm min-w-8 flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="global-heading">Daily Tasks</h2>
        <div className="flex items-center gap-3">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                <Plus size={14} />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Habit</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddHabit} className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="habit-title">Habit Name</Label>
                  <Input
                    id="habit-title"
                    placeholder="e.g. Drink Water"
                    value={newHabitTitle}
                    onChange={(e) => setNewHabitTitle(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Add Habit
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <a
            href="/workspace/habits"
            className="text-sm text-muted-foreground hover:underline"
          >
            View all
          </a>
        </div>
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto pb-4">
        {habitsList.map((habit, index) => (
          <Habit key={index} {...habit} />
        ))}
      </div>
    </main>
  )
}
