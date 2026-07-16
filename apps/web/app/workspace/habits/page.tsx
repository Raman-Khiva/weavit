"use client"
import { Habit, HabitProps } from "@workspace/ui/components/habits"
import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

const ALL_HABITS: HabitProps[] = [
  { title: "Reading", category: "learning", gap: "3 days gap", streak: 9, description: "Read 10 pages of a book" },
  { title: "Meditation", category: "health", streak: 0, description: "10 mins of mindfulness" },
  { title: "Exercise", category: "health", streak: 36, gap: "1 day gap", description: "30 mins of cardio" },
  { title: "Drink Water", category: "health", streak: 12, description: "2 Liters a day" },
  { title: "Coding", category: "learning", streak: 5, description: "Practice LeetCode or side project" },
  { title: "Journaling", category: "mindfulness", streak: 2, description: "Write down 3 things you are grateful for" },
]

const Page = () => {
  const [habitsList, setHabitsList] = useState<HabitProps[]>(ALL_HABITS)
  const [newHabitTitle, setNewHabitTitle] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newHabitTitle.trim()) return

    const newHabit: HabitProps = {
      title: newHabitTitle,
      category: "custom",
      streak: 0,
      description: "Custom new habit",
    }

    setHabitsList([...habitsList, newHabit])
    setNewHabitTitle("")
    setIsOpen(false)
  }

  return (
    <div className="flex h-full w-full flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">All Habits</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} /> Add Habit
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
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {habitsList.map((habit, i) => (
          <Habit key={i} {...habit} />
        ))}
      </div>
    </div>
  )
}

export default Page
