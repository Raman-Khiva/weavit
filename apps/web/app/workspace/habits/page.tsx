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

import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group"
import { Label } from "@workspace/ui/components/label"
import { useGetHabitsQuery, usePostHabitMutation } from "@/features/habits/habits.api"
import { useAuth } from "@clerk/nextjs"
import type { components } from "@weavit/api-types"



const ALL_HABITS: HabitProps[] = [
  { title: "Reading", category: "learning", gap: "3 days gap", streak: 9, description: "Read 10 pages of a book" },
  { title: "Meditation", category: "health", streak: 0, description: "10 mins of mindfulness" },
  { title: "Exercise", category: "health", streak: 36, gap: "1 day gap", description: "30 mins of cardio" },
  { title: "Drink Water", category: "health", streak: 12, description: "2 Liters a day" },
  { title: "Coding", category: "learning", streak: 5, description: "Practice LeetCode or side project" },
  { title: "Journaling", category: "mindfulness", streak: 2, description: "Write down 3 things you are grateful for" },
]


type CreateHabitInput = components["schemas"]["CreateHabitInput"];


const FREQUENCIES = ["DAILY", "WEEKLY", "MONTHLY"] as const satisfies readonly CreateHabitInput["frequency"][];

const Page = () => {
  const [habitsList, setHabitsList] = useState<HabitProps[]>(ALL_HABITS)
  const [newHabitTitle, setNewHabitTitle] = useState("")



  const { isSignedIn, isLoaded } = useAuth();
  const [postHabit, { isSuccess: isHabitPosted, isLoading: isHabitPosting, isError: isHabitPostingFailed, error: postHabitError }] = usePostHabitMutation();

  const { data, isLoading, isError, error } = useGetHabitsQuery(undefined, { skip: !isSignedIn || !isLoaded });

  const [isOpen, setIsOpen] = useState(false)

  const [createHabitForm, updateCreateHabitForm] = useState<CreateHabitInput>({ title: "", category: "", frequency: "DAILY" });

  const handleCreateHabit = async (e: React.FormEvent) => {
    try {
      e.preventDefault()





      if (!createHabitForm.title.trim()) {
        console.log("Title is required");
        return;
      }


      if (!isLoaded || !isSignedIn) { console.error("Authentication required to post habit"); return; }


      await postHabit(createHabitForm).unwrap();

      setIsOpen(false);
      updateCreateHabitForm({ title: "", category: "", frequency: "DAILY" });

      if (isHabitPosted) {
        console.log("Habit Posted successfully")
      }
    } catch (err) {
      console.error("Failed to post habit. Error : ", err)
    }





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
            <form onSubmit={handleCreateHabit} className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="habit-title">Habit Name</Label>
                  <Input
                    id="habit-title"
                    placeholder="e.g. Drink Water"
                    value={createHabitForm.title}
                    onChange={(e) => updateCreateHabitForm((state) => ({ ...state, title: e.target.value }))}
                  /></div>


                <div className="flex flex-col gap-2">
                  <Label htmlFor="habit-category">Category</Label>
                  <Input
                    id="habit-category"
                    placeholder="e.g. Learning"
                    value={createHabitForm.category}
                    onChange={(e) => updateCreateHabitForm((state) => ({ ...state, category: e.target.value }))}
                  />
                </div>
                <RadioGroup defaultValue="DAILY" className="flex gap-4">
                  {FREQUENCIES.map((freq) => (
                    <div key={freq} onClick={() => updateCreateHabitForm((state) => ({ ...state, frequency: freq }))} className="flex items-center gap-2">
                      <RadioGroupItem value={freq} id={`freq-${freq}`} />
                      <Label htmlFor={`freq-${freq}`}>{freq}</Label>
                    </div>
                  ))}
                </RadioGroup>
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

      <hr />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {
          isLoading ? (
            <h1>Please wait.. fetching data</h1>
          ) : isError ?
            (<h2>Error while fetching data</h2>)
            : (data?.map((habit, index) => (
              <Habit key={index} {...habit} streak={habit.streakCount} />
            )))


        }
      </div>
    </div >
  )
}

export default Page
