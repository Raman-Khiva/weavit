import { TodoCard } from "@workspace/ui/components/todo-card"
import { Info } from "lucide-react"

const tasks = [
  {
    id: "1",
    title: "Add authentication",
    priority: "high",
    assignee: "John Doe",
    dueDate: "2024-04-01",
    description: "Implement OAuth2 with Google and GitHub providers",
  },
  {
    id: "2",
    title: "Create API endpoints",
    priority: "medium",
    assignee: "Jane Smith",
    dueDate: "2024-04-05",
    description: "Set up basic CRUD operations for user profiles",
  },
  {
    id: "3",
    title: "Write documentation",
    priority: "low",
    assignee: "Bob Johnson",
    dueDate: "2024-04-10",
    description: "Draft API documentation using Swagger",
  },
]

export const Todos = () => {
  return (
    <main className="flex h-full w-full flex-col gap-4">
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-foreground">Tasks To Do</h2>
          <div className="group relative flex items-center justify-center">
            <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
            <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-6 opacity-0 group-hover:opacity-100 transition-opacity z-50 rounded-md bg-popover border border-border px-2.5 py-1 text-[10px] text-popover-foreground shadow-xl whitespace-nowrap">
              Manage action items and priority tasks assigned to you
            </div>
          </div>
        </div>
        <a
          href="/workspace/todos"
          className="text-xs font-semibold text-primary hover:underline"
        >
          View all
        </a>
      </div>
      <section className="grid h-full w-full grid-cols-1 grid-rows-3 gap-4">
        {tasks.map((task) => (
          <TodoCard
            key={task.id}
            heading={task.title}
            priority={task.priority}
            description={task.description}
            endDate={task.dueDate}
          />
        ))}
      </section>
    </main>
  )
}
