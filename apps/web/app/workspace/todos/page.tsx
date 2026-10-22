'use client'
import { useGetTodosQuery, usePostTodoMutation } from "@/features/todos/todos.api"

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


type TODO = components["schemas"]["Todo"];
type CreateTodoInput = components["schemas"]["CreateTodoInput"]
  ;

function Page(): JSX.Element {


  const { isLoaded, isSignedIn } = useAuth();
  const { data, isLoading, isError, error } = useGetTodosQuery(undefined, { skip: !isLoaded || !isSignedIn });
  const [postTodo, { isLoading: isPostingTodo, isError: isErrorPostingTodo }] = usePostTodoMutation();
  const [isOpen, setIsOpen] = useState<boolean>(false);


  const demoTodos: TODO[] = [
    {
      id: "demo-1",
      userId: "demo-user",
      title: "Demo: AI-powered search",
      status: "PENDING",
      priority: "HIGH",
      tags: ["demo", "AI"],
    },
    {
      id: "demo-2",
      userId: "demo-user",
      title: "Demo: Custom webhooks",
      status: "PENDING",
      priority: "MEDIUM",
      tags: ["demo", "backend"],
    },
    {
      id: "demo-3",
      userId: "demo-user",
      title: "Demo: Real-time collaboration",
      status: "IN_PROGRESS",
      priority: "URGENT",
      tags: ["demo", "realtime"],
    },
    {
      id: "demo-4",
      userId: "demo-user",
      title: "Demo: API v2 migration",
      status: "IN_PROGRESS",
      priority: "HIGH",
      tags: ["demo", "API"],
    },
    {
      id: "demo-5",
      userId: "demo-user",
      title: "Demo: Dark mode",
      status: "COMPLETED",
      priority: "LOW",
      tags: ["demo", "UI"],
    },
    {
      id: "demo-6",
      userId: "demo-user",
      title: "Demo: Export to CSV",
      status: "COMPLETED",
      priority: "MEDIUM",
      tags: ["demo", "export"],
    },
  ];

  const todos: TODO[] = [...(data ?? []), ...demoTodos];

  const plannedData: TODO[] = todos?.filter((todo) => todo.status == "PENDING") ?? [];
  const buildingData: TODO[] = todos?.filter((todo) => todo.status == "IN_PROGRESS") ?? [];
  const shippedData: TODO[] = todos?.filter((todo) => todo.status == "COMPLETED") ?? [];
  const initialFormState: CreateTodoInput = { title: "", priority: "MEDIUM", tags: [] };
  const [createTodoForm, updateCreateTodoForm] = useState<CreateTodoInput>(initialFormState);


  const handlePostTodo = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!createTodoForm.title.trim()) {
      alert("Title required");
      return;
    }

    const data = await postTodo(createTodoForm).unwrap();
    console.log("Posted successfully! data : ", data);
    setIsOpen(false);
    updateCreateTodoForm(initialFormState);

  }


  return (
    <div className="flex min-h-full w-full flex-col items-center gap-10 px-16 py-15">
      {/* ADD TODO Model*/}
      <header className="w-full flex justify-between border-b">
        <h1 className="pb-4 text-4xl font-bold">
          Tasks To Do
        </h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="h-8 rounded-md px-3 text-xs font-semibold">
              <Plus className="mr-1 size-3.5" /> New Ritual
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border bg-popover text-popover-foreground">
            <DialogHeader>
              <DialogTitle>Add New Todo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handlePostTodo} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="habit-title">Title</Label>
                <Input
                  id="habit-title"
                  className="border-input bg-background"
                  placeholder="e.g. Drink Water"
                  value={createTodoForm.title}
                  onChange={(event) =>
                    updateCreateTodoForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="habit-category">Tags</Label>
                <Input
                  id="habit-category"
                  className="border-input bg-background"
                  placeholder="e.g. Health"
                  value={createTodoForm.tags ?? []}
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
                {isPostingTodo ? "Saving..." : "Add Habit"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

      </header>
      <div className="w-full">
        <Pattern plannedData={plannedData} buildingData={buildingData} shippedData={shippedData} />
      </div>
    </div>
  )
}

export default Page
