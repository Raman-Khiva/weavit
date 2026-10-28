"use client"

import { useState } from "react"
import {
  CheckIcon,
  MessageSquare,
  MoreVertical,
  Plus,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { TaskNoteDialog } from "@workspace/ui/components/task-note-dialog"
import { TASK, CreateTaskInput, CreateTaskNoteInput } from "@weavit/api-types"

type TaskStatus = TASK["status"]

interface ProjectTasksProps {
  projectId: string
  handleCreateNote: (args: { projectId: string, phaseId: string, taskId: string, addNoteInput: CreateTaskNoteInput }) => void
  handleCreateTask: (args: { projectId: string, phaseId: string, addTaskInput: CreateTaskInput }) => void
  phaseId: string
  tasks: TASK[]
  onToggleTask: (projectId: string, phaseId: string, taskId: string, status: TaskStatus) => void
  onAddNote: (projectId: string, phaseId: string, taskId: string, text: string) => void
  onAddTask: (projectId: string, phaseId: string, task: { title: string; description?: string; category?: string; priority?: "low" | "medium" | "high" }) => void
}

function priorityClass(priority?: string | null) {
  if (priority === "HIGH") return "text-rose-400"
  if (priority === "MEDIUM") return "text-amber-400"
  return "text-muted-foreground/70"
}

export function ProjectTasks({
  projectId,
  handleCreateTask,
  phaseId,
  tasks,
  onToggleTask,
  onAddNote,
}: ProjectTasksProps) {
  const [activeTaskForNote, setActiveTaskForNote] = useState<{
    task: TASK
    mode: "complete_with_note" | "add_note" | "view_notes"
  } | null>(null)

  const [isAddingTask, setIsAddingTask] = useState(false)

  const [addTaskForm, updateAddTaskForm] = useState<CreateTaskInput>({
    title: "",
    category: "",
    description: "",
    priority: "LOW",
  })

  return (
    <div className="mt-3 rounded-xl border border-border/60 bg-card/30">
      <div className="flex flex-col divide-y divide-border/30">
        {tasks?.map((task) => {
          const isDone = task?.status === "COMPLETED"
          const noteCount = task.notes?.length || 0

          const statusValue =
            task.status === "COMPLETED"
              ? "COMPLETED"
              : task.status === "IN_PROGRESS"
                ? "IN_PROGRESS"
                : "PENDING"

          return (
            <div
              key={task.id}
              className={`group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/25 ${
                isDone ? "opacity-60" : ""
              }`}
            >
              <div
                aria-hidden
                title={isDone ? "Completed" : statusValue === "IN_PROGRESS" ? "In progress" : "Pending"}
                className={`grid size-6 shrink-0 place-items-center rounded-md border ${
                  isDone
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : statusValue === "IN_PROGRESS"
                      ? "border-amber-500/70 bg-amber-500/15"
                      : "border-muted-foreground/45 bg-transparent"
                }`}
              >
                {isDone && <CheckIcon className="size-4 stroke-[3]" />}
                {statusValue === "IN_PROGRESS" && (
                  <span className="size-2 rounded-full bg-amber-400" />
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex min-w-0 items-baseline gap-2.5">
                  <span
                    className={`truncate text-base font-semibold leading-snug ${
                      isDone
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                    }`}
                  >
                    {task.title}
                  </span>

                  {task.priority && (
                    <span
                      className={`shrink-0 text-xs font-mono font-semibold uppercase tracking-wide ${priorityClass(task.priority)}`}
                    >
                      {task.priority}
                    </span>
                  )}

                  {task.category && (
                    <span className="hidden shrink-0 truncate text-xs text-muted-foreground sm:inline">
                      {task.category}
                    </span>
                  )}
                </div>

                {task.description && (
                  <p className="truncate text-sm leading-snug text-muted-foreground">
                    {task.description}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1">
                {noteCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTaskForNote({ task, mode: "view_notes" })}
                    title={task.notes?.[0]?.text ?? "View notes"}
                    className="inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                  >
                    <MessageSquare className="size-4" />
                    <span>{noteCount}</span>
                  </button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="size-9 p-0 text-muted-foreground hover:text-foreground"
                      title="Task actions"
                    >
                      <MoreVertical className="size-5" />
                      <span className="sr-only">Task actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-44">
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                      Status
                    </DropdownMenuLabel>
                    <DropdownMenuRadioGroup
                      value={statusValue}
                      onValueChange={(value) => {

                        if (value === statusValue) return;
                        onToggleTask(
                          projectId,
                          phaseId,
                          task.id,
                          value as TaskStatus
                        )
                      }}
                    >
                      <DropdownMenuRadioItem value="PENDING">
                        Pending
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="IN_PROGRESS">
                        In progress
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="COMPLETED">
                        Completed
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setActiveTaskForNote({ task, mode: "add_note" })}
                    >
                      <Plus className="size-4" />
                      Add note
                    </DropdownMenuItem>
                    {noteCount > 0 && (
                      <DropdownMenuItem
                        onClick={() => setActiveTaskForNote({ task, mode: "view_notes" })}
                      >
                        <MessageSquare className="size-4" />
                        View notes
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )
        })}

        {tasks.length === 0 && (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">
            No tasks in this phase yet.
          </div>
        )}
      </div>

      <div className="border-t border-border/40 px-5 py-3">
        {isAddingTask ? (
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <Input
              placeholder="Task title (e.g. GET /health)"
              value={addTaskForm.title}
              onChange={(e) => updateAddTaskForm((state) => ({ ...state, title: e.target.value }))}
              className="h-10 flex-1 text-sm"
              autoFocus
            />
            <Input
              placeholder="Category"
              value={addTaskForm.category}
              onChange={(e) => updateAddTaskForm((state) => ({ ...state, category: e.target.value }))}
              className="h-10 w-full text-sm sm:w-44"
            />
            <div className="flex items-center justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setIsAddingTask(false)} className="h-10 text-sm">
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (addTaskForm.title.trim() && addTaskForm.priority) {
                    handleCreateTask({ projectId, phaseId, addTaskInput: addTaskForm })
                    updateAddTaskForm({
                      title: "",
                      category: "",
                      description: "",
                      priority: "LOW",
                    })
                    setIsAddingTask(false)
                  }
                }}
                disabled={!addTaskForm.title.trim()}
                className="h-10 text-sm"
              >
                Add
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingTask(true)}
            className="h-10 w-full justify-center gap-2 border-dashed text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground"
          >
            <Plus className="size-4" />
            <span>Add task</span>
          </Button>
        )}
      </div>

      {activeTaskForNote && (
        <TaskNoteDialog
          task={activeTaskForNote.task}
          open={!!activeTaskForNote}
          onOpenChange={(open) => {
            if (!open) setActiveTaskForNote(null)
          }}
          mode={activeTaskForNote.mode}
          onSaveNote={(taskId, text, toggleStatus) => {
            if (text) {
              onAddNote(projectId, phaseId, taskId, text)
            }
            if (toggleStatus) {
              onToggleTask(projectId, phaseId, taskId, "COMPLETED")
            }
            setActiveTaskForNote(null)
          }}
        />
      )}
    </div>
  )
}
