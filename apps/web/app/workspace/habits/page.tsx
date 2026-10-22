"use client"

import { useMemo, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import type { components } from "@weavit/api-types"
import { useGetHabitsQuery, usePostHabitMutation } from "@/features/habits/habits.api"
import {
  Bolt,
  Check,
  Circle,
  Flame,
  Plus,
  Sparkles,
  Play,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group"
import { SkeletonWrapper, HabitsPageSkeleton } from "@workspace/ui/components/skeleton-wrapper"

type CreateHabitInput = components["schemas"]["CreateHabitInput"]
type Habit = components["schemas"]["Habit"]

type Ritual = {
  id: string
  title: string
  description: string
  streak: number
  cadence: "DAILY" | "WEEKLY" | "MONTHLY"
  category: string
  done: boolean
  gap?: string
  chip?: string
}

const STATIC_RITUALS: Ritual[] = [
  {
    id: "reading",
    title: "Demo: Reading",
    description: "Read 10 pages of a physical book",
    streak: 9,
    cadence: "DAILY",
    category: "Learning",
    done: false,
    gap: "3 days gap",
  },
  {
    id: "exercise",
    title: "Demo: Exercise",
    description: "30 mins cardio or resistance",
    streak: 36,
    cadence: "DAILY",
    category: "Health",
    done: true,
    chip: "Done Today",
  },
  {
    id: "drink-water",
    title: "Demo: Drink Water",
    description: "2.5 Liters throughout the day",
    streak: 12,
    cadence: "DAILY",
    category: "Health",
    done: true,
    chip: "Done Today",
  },
]

const INITIAL_FORM: CreateHabitInput = {
  title: "",
  category: "",
  frequency: "DAILY",
}

const CADENCES = ["DAILY", "WEEKLY", "MONTHLY"] as const

function normalizeCategory(value?: string | null) {
  if (!value?.trim()) return "General"
  return value
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function mapApiHabit(habit: Habit): Ritual {
  return {
    id: habit.id,
    title: habit.title,
    description: `Keep your ${habit.title.toLowerCase()} rhythm consistent`,
    streak: habit.streakCount ?? 0,
    cadence: habit.frequency ?? "DAILY",
    category: normalizeCategory(habit.category),
    done: false,
    chip: undefined,
  }
}

function slug(text: string) {
  return text.toLowerCase().trim().replace(/\s+/g, "-")
}

function HabitCard({ ritual }: { ritual: Ritual }) {
  return (
    <a
      href={`/workspace/habits/${ritual.id || slug(ritual.title)}`}
      className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/35"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          {ritual.done ? (
            <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-success text-success-foreground">
              <Check className="size-3.5" />
            </span>
          ) : (
            <Circle className="mt-0.5 size-5 text-muted-foreground" />
          )}
          <div>
            <p className={`text-[17px] font-semibold leading-tight ${ritual.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
              {ritual.title}
            </p>
            <p className="mt-1 max-w-[24ch] text-xs text-muted-foreground">{ritual.description}</p>
          </div>
        </div>

        {ritual.gap && (
          <span className="rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
            {ritual.gap}
          </span>
        )}

        {!ritual.gap && ritual.chip && (
          <span className="rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
            {ritual.chip}
          </span>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="inline-flex items-center gap-1 text-[12px] font-semibold text-warning">
          <Flame className="size-3.5" />
          <span>{ritual.streak}D</span>
        </div>

        <div className="flex items-center gap-1.5">
          {Array.from({ length: 7 }).map((_, idx) => {
            const active = idx < Math.min(ritual.streak % 8, 7)
            return (
              <span
                key={`${ritual.id}-dot-${idx}`}
                className={`h-1.5 w-1.5 rounded-full ${active ? "bg-success" : "bg-muted"}`}
              />
            )
          })}
        </div>
      </div>
    </a>
  )
}

function CompletedRitualCard({ ritual }: { ritual: Ritual }) {
  return (
    <a
      href={`/workspace/habits/${ritual.id || slug(ritual.title)}`}
      className="group rounded-xl border border-border bg-card p-3 transition-colors hover:border-success/40"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success text-success-foreground">
            <Check className="size-3.5" />
          </span>
          <p className="text-sm font-semibold text-muted-foreground line-through">{ritual.title}</p>
        </div>
        <span className="rounded-md border border-success/25 bg-success/10 px-2 py-0.5 text-[10px] text-success">
          Done
        </span>
      </div>

      <p className="mt-1 text-xs text-muted-foreground">{ritual.description}</p>

      <div className="mt-3 flex items-center justify-between text-[12px]">
        <span className="inline-flex items-center gap-1 font-medium text-muted-foreground">
          <Flame className="size-3.5 text-warning" /> {ritual.streak}D
        </span>
        <span className="text-success">Locked in</span>
      </div>
    </a>
  )
}

function Page(): JSX.Element {
  const { isSignedIn, isLoaded } = useAuth()
  const [postHabit, { isLoading: isPostingHabit }] = usePostHabitMutation()
  const { data, isLoading, isError } = useGetHabitsQuery(undefined, {
    skip: !isSignedIn || !isLoaded,
  })

  const [isOpen, setIsOpen] = useState(false)
  const [createHabitForm, setCreateHabitForm] = useState<CreateHabitInput>(INITIAL_FORM)


  const rituals = useMemo(() => {
    const apiRituals = (data ?? []).map(mapApiHabit);

    const uniqueRituals = new Map<string, Ritual>();

    for (const ritual of [...STATIC_RITUALS, ...apiRituals]) {
      uniqueRituals.set(ritual.id, ritual);
    }

    return [...uniqueRituals.values()];
  }, [data]);

  const dailyRituals = useMemo(
    () => rituals.filter((ritual) => ritual.cadence === "DAILY"),
    [rituals]
  )

  const doneCount = dailyRituals.filter((ritual) => ritual.done).length
  const remainingRituals = dailyRituals.filter((ritual) => !ritual.done)
  const completedRituals = dailyRituals.filter((ritual) => ritual.done)
  const total = dailyRituals.length || 1
  const consistency = Math.round((doneCount / total) * 100)
  const recommended = dailyRituals.find((ritual) => !ritual.done) ?? dailyRituals[0]
  const todoCount = Math.max(total - doneCount, 0)

  const handleCreateHabit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!createHabitForm.title.trim()) return
    if (!isSignedIn || !isLoaded) return

    try {
      await postHabit({
        ...createHabitForm,
        title: createHabitForm.title.trim(),
        category: createHabitForm.category?.trim() ?? "",
      }).unwrap()

      setCreateHabitForm(INITIAL_FORM)
      setIsOpen(false)
    } catch (err) {
      console.error("Failed to create habit", err)
    }
  }

  return (
    <SkeletonWrapper skeleton={<HabitsPageSkeleton />} delay={2000}>
      <div className="min-h-full bg-background px-6 py-5 text-foreground  md:px-8 md:pl-16">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-4 flex items-center justify-end gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-warning/25 bg-warning/10 px-3 py-1 text-xs font-semibold text-warning">
              <Flame className="size-3.5" /> Overall Consistency: {consistency}%
            </span>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="h-8 rounded-md px-3 text-xs font-semibold">
                  <Plus className="mr-1 size-3.5" /> New Ritual
                </Button>
              </DialogTrigger>
              <DialogContent className="border-border bg-popover text-popover-foreground">
                <DialogHeader>
                  <DialogTitle>Add New Habit</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateHabit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="habit-title">Habit Name</Label>
                    <Input
                      id="habit-title"
                      className="border-input bg-background"
                      placeholder="e.g. Drink Water"
                      value={createHabitForm.title}
                      onChange={(event) =>
                        setCreateHabitForm((prev) => ({ ...prev, title: event.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="habit-category">Category</Label>
                    <Input
                      id="habit-category"
                      className="border-input bg-background"
                      placeholder="e.g. Health"
                      value={createHabitForm.category ?? ""}
                      onChange={(event) =>
                        setCreateHabitForm((prev) => ({ ...prev, category: event.target.value }))
                      }
                    />
                  </div>

                  <RadioGroup
                    value={createHabitForm.frequency ?? "DAILY"}
                    onValueChange={(value) =>
                      setCreateHabitForm((prev) => ({
                        ...prev,
                        frequency: value as CreateHabitInput["frequency"],
                      }))
                    }
                    className="flex gap-4"
                  >
                    {CADENCES.map((freq) => (
                      <label key={freq} htmlFor={`freq-${freq}`} className="flex items-center gap-2 text-sm">
                        <RadioGroupItem id={`freq-${freq}`} value={freq} />
                        {freq}
                      </label>
                    ))}
                  </RadioGroup>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isPostingHabit}
                  >
                    {isPostingHabit ? "Saving..." : "Add Habit"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="grid gap-4 lg:grid-cols-[1fr_290px] lg:items-start">
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-warning">
                  Wednesday, Oct 14 · Deep Focus Day
                </p>
                <h1 className="text-4xl font-bold tracking-tight">Good morning, Alex.</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  You&apos;re maintaining momentum. {todoCount} habits remaining to close today&apos;s ring.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-muted/35 p-3">
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Daily Momentum</span>
                  <span className="font-semibold text-success">
                    {doneCount} of {total} ({consistency}%)
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted">
                  <div className="h-1.5 rounded-full bg-success" style={{ width: `${consistency}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Goal: 100% daily</span>
                  <span className="text-success">Active streak intact</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-1 text-warning">To Do Today {todoCount}</span>
              <span className="px-2 text-success">Completed {doneCount}</span>
              <span className="px-2 text-muted-foreground">All Rituals {total}</span>
              <span className="px-2 text-muted-foreground">Morning Routine</span>
            </div>
          </section>

          <section className="mt-6">
            <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              <p className="flex items-center gap-2 text-warning">
                <Sparkles className="size-3.5" /> Recommended Next
              </p>
              <p>Estimated 10 mins</p>
            </div>

            {recommended ? (
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Circle className="mt-0.5 size-6 text-muted-foreground" />
                    <div>
                      <p className="text-2xl font-semibold tracking-tight">{recommended.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{recommended.description}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1 text-warning">
                          <Flame className="size-3.5" /> {recommended.streak}D Streak
                        </span>
                        <span className="rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-warning">
                          <Bolt className="mr-1 inline size-3" /> Morning Anchor
                        </span>
                        <span>Time window: 08:00 - 10:00</span>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" className="border-border bg-transparent">
                    <Play className="mr-1 size-3.5" /> Start Guided Audio
                  </Button>
                </div>
              </div>
            ) : null}
          </section>

          <section className="mt-6">
            <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              <p className="flex items-center gap-2 text-warning">
                Remaining Today
                <span className="rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[10px]">
                  {todoCount} to complete
                </span>
              </p>
              <p>Sorted by priority & risk</p>
            </div>

            {isLoading ? (
              <p className="rounded-2xl border border-border bg-card px-4 py-6 text-sm text-muted-foreground">
                Please wait.. fetching data
              </p>
            ) : isError ? (
              <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-6 text-sm text-destructive">
                Error while fetching data
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {remainingRituals.map((ritual) => (
                  <HabitCard key={ritual.id} ritual={ritual} />
                ))}
              </div>
            )}
          </section>

          <section className="mt-7 border-t border-border pt-5">
            <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              <p className="flex items-center gap-2 text-success">
                Completed Today
                <span className="rounded-full border border-success/25 bg-success/10 px-2 py-0.5 text-[10px]">
                  {doneCount} rituals locked in
                </span>
              </p>
              <p>All streaks maintained</p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              {completedRituals.map((ritual) => (
                <CompletedRitualCard key={ritual.id} ritual={ritual} />
              ))}
            </div>
          </section>
          {/*
        <section className="mt-7 border-t border-border pt-5">
          <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            <p className="flex items-center gap-2 text-success">
              From Backend
              <span className="rounded-full border border-success/25 bg-success/10 px-2 py-0.5 text-[10px]">
                {doneCount} rituals locked in
              </span>
            </p>
            <p>All streaks maintained</p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {data?.map((habit) => (
              <HabitCard key={habit.id}
                ritual={{
                  id: habit.id,
                  title: habit.title,
                  description: "description",
                  cadence: "DAILY",
                  category: "Learning",
                  gap: "2 days",
                  streak: 2,
                  done: true
                }}


              />))}

          </div>
        </section>
        */}
        </div>
      </div>
    </SkeletonWrapper>
  )
}

export default Page
