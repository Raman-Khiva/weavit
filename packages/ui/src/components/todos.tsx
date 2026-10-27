import { TodoCard } from "@workspace/ui/components/todo-card"

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

export function Todos(): JSX.Element {
  return (
    <main className="flex w-full flex-col gap-1 px-1 py-1">
      <section className="flex w-full flex-col gap-1">
        {tasks.map((task) => (
          <TodoCard
            key={task.id}
            heading={task.title}
            priority={task.priority}
            description={task.description}
            endDate={task.dueDate}
            className="h-auto min-w-0 max-w-none w-full rounded-sm bg-white/[0.035] px-2 py-1.5 shadow-none"
          />
        ))}
      </section>
    </main>
  )
}
