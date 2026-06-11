"use client"

import { GripVertical } from "lucide-react"
import * as React from "react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnHandle,
  KanbanItem,
  KanbanOverlay,
} from "@workspace/ui/components/kanban"

interface Task {
  id: string
  title: string
  priority: "low" | "medium" | "high"
  assignee?: string
  dueDate?: string
  description?: string
}

const COLUMN_TITLES: Record<string, string> = {
  backlog: "Backlog",
  inProgress: "In Progress",
  done: "Done",
}

export function TaskboardDemo() {
  const [columns, setColumns] = React.useState<Record<string, Task[]>>({
    backlog: [
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
    ],
    inProgress: [
      {
        id: "4",
        title: "Design system updates",
        priority: "high",
        assignee: "Alice Brown",
        dueDate: "2024-03-28",
        description: "Update typography and color tokens for consistency",
      },
      {
        id: "5",
        title: "Implement dark mode",
        priority: "medium",
        assignee: "Charlie Wilson",
        dueDate: "2024-04-02",
        description:
          "Add a theme toggle and ensure all components support dark mode",
      },
    ],
    done: [
      {
        id: "7",
        title: "Setup project",
        priority: "high",
        assignee: "Eve Davis",
        dueDate: "2024-03-25",
        description:
          "Initialize Next.js application with standard configurations",
      },
      {
        id: "8",
        title: "Initial commit",
        priority: "low",
        assignee: "Frank White",
        dueDate: "2024-03-24",
      },
    ],
  })

  return (
    <Kanban
      value={columns}
      onValueChange={setColumns}
      getItemValue={(item) => item.id}
    >
      <KanbanBoard className="grid auto-rows-fr sm:grid-cols-3">
        {Object.entries(columns).map(([columnValue, tasks]) => (
          <KanbanColumn key={columnValue} value={columnValue}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">
                  {COLUMN_TITLES[columnValue]}
                </span>
                <Badge
                  variant="secondary"
                  className="pointer-events-none rounded-sm"
                >
                  {tasks.length}
                </Badge>
              </div>
              <KanbanColumnHandle asChild>
                <Button variant="ghost" size="icon">
                  <GripVertical className="h-4 w-4" />
                </Button>
              </KanbanColumnHandle>
            </div>
            <div className="flex flex-col gap-2 p-0.5">
              {tasks.map((task) => (
                <KanbanItem
                  key={task.id}
                  value={task.id}
                  asHandle
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
                </KanbanItem>
              ))}
            </div>
          </KanbanColumn>
        ))}
      </KanbanBoard>
      <KanbanOverlay>
        <div className="size-full rounded-md bg-primary/10" />
      </KanbanOverlay>
    </Kanban>
  )
}
