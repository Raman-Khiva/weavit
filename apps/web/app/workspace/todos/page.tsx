'use client'
import {
  useGetTodosQuery,
  usePostTodoMutation,
  usePatchTodoMutation,
} from "@/features/todos/todos.api"

import { useAuth } from "@clerk/nextjs"
import { Pattern } from "@workspace/ui/components/kanban-board"
import type { components } from "@weavit/api-types"
import { useState } from "react"
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
import { Plus } from "lucide-react"
import { SkeletonWrapper, TodosPageSkeleton } from "@workspace/ui/components/skeleton-wrapper"


type TODO = components["schemas"]["Todo"];
type CreateTodoInput = components["schemas"]["CreateTodoInput"];

const DEMO_TODO: TODO = {
  id: "demo-1",
  userId: "demo-user",
  title: "Demo: AI-powered search",
  status: "PENDING",
  priority: "HIGH",
  tags: ["demo"],
};

function Page(): JSX.Element {
  const { isLoaded, isSignedIn } = useAuth();
  const { data, isLoading, isError } = useGetTodosQuery(undefined, { skip: !isLoaded || !isSignedIn });
  const [postTodo, { isLoading: isPostingTodo }] = usePostTodoMutation();
  const [patchTodo] = usePatchTodoMutation();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const todos: TODO[] = [...(data ?? []), DEMO_TODO];

  const plannedData: TODO[] = todos.filter((todo) => todo.status == "PENDING");
  const buildingData: TODO[] = todos.filter((todo) => todo.status == "IN_PROGRESS");
  const shippedData: TODO[] = todos.filter((todo) => todo.status == "COMPLETED");
  const initialFormState: CreateTodoInput = { title: "", priority: "MEDIUM", tags: [] };
  const [createTodoForm, updateCreateTodoForm] = useState<CreateTodoInput>(initialFormState);

  const handlePostTodo = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!createTodoForm.title.trim()) {
      alert("Title required");
      return;
    }
    await postTodo(createTodoForm).unwrap();
    setIsOpen(false);
    updateCreateTodoForm(initialFormState);
  }

  return (
    <SkeletonWrapper skeleton={<TodosPageSkeleton />} delay={2000}>
      <div className="flex min-h-full w-full flex-col items-center gap-10 px-16 py-15">
      <header className="w-full flex justify-between border-b">
        <h1 className="pb-4 text-4xl font-bold">
          Tasks To Do
        </h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="h-8 rounded-md px-3 text-xs font-semibold">
              <Plus className="mr-1 size-3.5" /> New Todo
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border bg-popover text-popover-foreground">
            <DialogHeader>
              <DialogTitle>Add New Todo</DialogTitle>
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
                    updateCreateTodoForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="todo-tags">Tags</Label>
                <Input
                  id="todo-tags"
                  className="border-input bg-background"
                  placeholder="e.g. Health"
                  value={createTodoForm.tags?.[0] ?? ""}
                  onChange={(event) =>
                    updateCreateTodoForm((prev) => ({ ...prev, tags: [event.target.value] }))
                  }
                />
              </div>

              <RadioGroup
                value={createTodoForm.priority ?? "MEDIUM"}
                onValueChange={(value) =>
                  updateCreateTodoForm((prev) => ({
                    ...prev,
                    priority: value as CreateTodoInput["priority"],
                  }))
                }
                className="flex gap-4"
              >
                {["LOW", "MEDIUM", "HIGH", "URGENT"].map((freq) => (
                  <label key={freq} htmlFor={`freq-${freq}`} className="flex items-center gap-2 text-sm">
                    <RadioGroupItem id={`freq-${freq}`} value={freq} />
                    {freq}
                  </label>
                ))}
              </RadioGroup>

              <Button
                type="submit"
                className="w-full"
                disabled={isPostingTodo}
              >
                {isPostingTodo ? "Saving..." : "Add Todo"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

      </header>
      <div className="w-full">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading todos…</p>
        ) : isError ? (
          <p className="text-sm text-muted-foreground">Couldn&apos;t load todos.</p>
        ) : (
          <Pattern
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
  </SkeletonWrapper>
)
}

export default Page
