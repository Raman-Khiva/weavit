"use client"

import {
  useGetTodosQuery,
  usePostTodoMutation,
  usePatchTodoMutation,
} from "@/features/todos/todos.api"

import { useAuth } from "@clerk/nextjs"
import Link from "next/link"
import { Pattern } from "@workspace/ui/components/kanban-board"
import type { components } from "@weavit/api-types"
import { useMemo, useState } from "react"
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
import { Button } from "@workspace/ui/components/button"
import { Bot, Plus } from "lucide-react"
import { TodosPageSkeleton } from "@workspace/ui/components/skeleton-wrapper"
import { cn } from "@workspace/ui/lib/utils"

type TODO = components["schemas"]["Todo"]
type CreateTodoInput = components["schemas"]["CreateTodoInput"]

const DEMO_TODO: TODO = {
  id: "demo-1",
  userId: "demo-user",
  title: "Demo: AI-powered search",
  status: "PENDING",
  priority: "HIGH",
  tags: ["demo"],
}

function Page(): JSX.Element {
  const { isLoaded, isSignedIn } = useAuth()
  const { data, isLoading, isError, isUninitialized } = useGetTodosQuery(
    undefined,
    { skip: !isLoaded || !isSignedIn }
  )
  const [postTodo, { isLoading: isPostingTodo }] = usePostTodoMutation()
  const [patchTodo] = usePatchTodoMutation()
  const [isOpen, setIsOpen] = useState(false)

  const waiting = !isLoaded || !isSignedIn || isUninitialized || isLoading

  const todos: TODO[] = useMemo(
    () => [...(data ?? []), DEMO_TODO],
    [data]
  )

  const plannedData = todos.filter((todo) => todo.status === "PENDING")
  const buildingData = todos.filter((todo) => todo.status === "IN_PROGRESS")
  const shippedData = todos.filter((todo) => todo.status === "COMPLETED")

  const realCount = data?.length ?? 0

  const initialFormState: CreateTodoInput = {
    title: "",
    priority: "MEDIUM",
    tags: [],
  }
  const [createTodoForm, updateCreateTodoForm] =
    useState<CreateTodoInput>(initialFormState)

  const handlePostTodo = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!createTodoForm.title.trim()) {
      alert("Title required")
      return
    }
    await postTodo(createTodoForm).unwrap()
    setIsOpen(false)
    updateCreateTodoForm(initialFormState)
  }

  if (waiting) {
    return <TodosPageSkeleton />
  }

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-7xl flex-col gap-4 p-6 md:p-8">
      <header className="shrink-0 rounded-2xl border border-border/80 bg-card/60 px-4 py-3 shadow-sm sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
              Execution board
            </p>
            <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
              Tasks & Todos
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              Drag cards Planned → Building → Shipped. Agent can add or update tasks too.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm" className="h-8 rounded-lg">
              <Link href="/agent">
                <Bot className="size-3.5" />
                Ask agent
              </Link>
            </Button>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8 rounded-lg px-3 text-xs font-semibold">
                  <Plus className="size-3.5" />
                  New todo
                </Button>
              </DialogTrigger>
              <DialogContent className="border-border bg-popover text-popover-foreground">
                <DialogHeader>
                  <DialogTitle>Add new todo</DialogTitle>
                </DialogHeader>
                <form onSubmit={handlePostTodo} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="todo-title">Title</Label>
                    <Input
                      id="todo-title"
                      className="border-input bg-background"
                      placeholder="e.g. Ship docs"
                      value={createTodoForm.title}
                      onChange={(event) =>
                        updateCreateTodoForm((prev) => ({
                          ...prev,
                          title: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="todo-tags">Tag</Label>
                    <Input
                      id="todo-tags"
                      className="border-input bg-background"
                      placeholder="e.g. Health"
                      value={createTodoForm.tags?.[0] ?? ""}
                      onChange={(event) =>
                        updateCreateTodoForm((prev) => ({
                          ...prev,
                          tags: [event.target.value],
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <RadioGroup
                      value={createTodoForm.priority ?? "MEDIUM"}
                      onValueChange={(value) =>
                        updateCreateTodoForm((prev) => ({
                          ...prev,
                          priority: value as CreateTodoInput["priority"],
                        }))
                      }
                      className="flex flex-wrap gap-3"
                    >
                      {["LOW", "MEDIUM", "HIGH", "URGENT"].map((freq) => (
                        <label
                          key={freq}
                          htmlFor={`freq-${freq}`}
                          className="flex items-center gap-2 text-sm"
                        >
                          <RadioGroupItem id={`freq-${freq}`} value={freq} />
                          {freq}
                        </label>
                      ))}
                    </RadioGroup>
                  </div>

                  <Button type="submit" className="w-full" disabled={isPostingTodo}>
                    {isPostingTodo ? "Saving…" : "Add todo"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border/60 pt-3">
          {[
            {
              label: "Total",
              value: realCount,
              hint: realCount === 0 ? "demo" : "yours",
              dot: "bg-foreground/40",
            },
            {
              label: "Planned",
              value: plannedData.length,
              hint: "ready",
              dot: "bg-blue-500",
            },
            {
              label: "Building",
              value: buildingData.length,
              hint: "active",
              dot: "bg-yellow-500",
            },
            {
              label: "Shipped",
              value: shippedData.length,
              hint: "done",
              dot: "bg-green-500",
            },
          ].map(({ label, value, hint, dot }) => (
            <div
              key={label}
              className="inline-flex items-center gap-2 rounded-lg border border-border/70 bg-background/70 px-2.5 py-1.5"
            >
              <span className={cn("size-1.5 shrink-0 rounded-full", dot)} />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
              </span>
              <span className="text-sm font-bold tabular-nums text-foreground">
                {value}
              </span>
              <span className="text-[10px] text-muted-foreground">{hint}</span>
            </div>
          ))}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col">
        {isError ? (
          <p className="text-sm text-muted-foreground">
            Couldn&apos;t load todos. Try refreshing.
          </p>
        ) : (
          <Pattern
            className="h-full min-h-0"
            plannedData={plannedData}
            buildingData={buildingData}
            shippedData={shippedData}
            onStatusChange={(id, status) => {
              void patchTodo({ id, body: { status } })
            }}
          />
        )}
      </div>
    </div>
  )
}

export default Page
