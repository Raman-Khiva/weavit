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

export const Todos = () => {
  return (
    <main className="flex w-full flex-col gap-2">
      <h2 className="global-heading">Tasks To Do</h2>
      <section className="grid w-full grid-cols-2 grid-rows-2 gap-1.5">
        {tasks.map((task) => (
          <TodoCard
            key={task.id}
            heading={task.title}
            priority={task.priority}
            description={task.description}
            endDate={task.dueDate}
          >
            {task.assignee && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <div className="size-2 rounded-full bg-primary/20" />
                <span className="line-clamp-1">{task.assignee}</span>
              </div>
            )}
          </TodoCard>
        ))}
      </section>
    </main>
  )
}
