"use client"

import { useState } from "react"
import {
  CheckIcon,
  MessageSquare,
  Plus,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { ExecutableTask } from "@workspace/ui/lib/projects-store"
import { TaskNoteDialog } from "@workspace/ui/components/task-note-dialog"
import { TASK, CreateTaskInput, CreateTaskNoteInput } from "@weavit/api-types"

interface ProjectTasksProps {
  projectId: string
  handleCreateNote: (args: { projectId: string, phaseId: string, taskId: string, addNoteInput: CreateTaskNoteInput }) => Promise<void>
  handleCreateTask: (args: { projectId: string, phaseId: string, addTaskInput: CreateTaskInput }) => Promise<void>
  phaseId: string
  tasks: TASK[]
  onToggleTask: (projectId: string, phaseId: string, taskId: string, noteText?: string) => void
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
    task: ExecutableTask
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

          return (
            <div
              key={task.id}
              className={`group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/25 ${
                isDone ? "opacity-60" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => onToggleTask(projectId, phaseId, task.id)}
                title={isDone ? "Mark pending" : "Mark completed"}
                className={`grid size-6 shrink-0 place-items-center rounded-md border transition-all ${
                  isDone
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-muted-foreground/45 bg-transparent hover:border-primary"
                }`}
              >
                {isDone && <CheckIcon className="size-4 stroke-[3]" />}
              </button>

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

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setActiveTaskForNote({ task, mode: "add_note" })}
                  className="size-9 p-0 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100 focus-visible:opacity-100"
                  title="Add note"
                >
                  <Plus className="size-5" />
                  <span className="sr-only">Add note</span>
                </Button>
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
            if (toggleStatus) {
              onToggleTask(projectId, phaseId, taskId, text)
            } else if (text) {
              onAddNote(projectId, phaseId, taskId, text)
            }
            setActiveTaskForNote(null)
          }}
        />
      )}
    </div>
  )
}
