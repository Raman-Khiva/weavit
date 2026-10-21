'use client'
import { useGetTodosQuery } from "@/features/todos/todos.api"

import { useAuth } from "@clerk/nextjs"
import { Pattern } from "@workspace/ui/components/kanban-board"
import type { components } from "@weavit/api-types"


function Page(): JSX.Element {


  type TODO = components["schemas"]["Todo"];
  const { isLoaded, isSignedIn } = useAuth();
  const { data, isLoading, isError, error } = useGetTodosQuery(undefined, { skip: !isLoaded || !isSignedIn });


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
  return (
    <div className="flex min-h-full w-full flex-col items-center gap-10 px-16 py-15">
      <header className="w-full">
        <h1 className="border-b-2 border-border pb-4 text-4xl font-bold">
          Tasks To Do
        </h1>
      </header>
      <div className="w-full">
        <Pattern plannedData={plannedData} buildingData={buildingData} shippedData={shippedData} />
      </div>
    </div>
  )
}

export default Page
