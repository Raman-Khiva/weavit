"use client"

import { useState } from "react"
import {
  CheckIcon,
  MessageSquare,
  Plus,
  Tag,
  Calendar,
  Sparkles,
  ChevronRight,
  Clock,
  CheckCircle2,
  Circle,
  FileText
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Input } from "@workspace/ui/components/input"
import { ExecutableTask } from "@workspace/ui/lib/projects-store"
import { TaskNoteDialog } from "@workspace/ui/components/task-note-dialog"

interface ProjectTasksProps {
  projectId: string
  phaseId: string
  tasks: ExecutableTask[]
  onToggleTask: (projectId: string, phaseId: string, taskId: string, noteText?: string) => void
  onAddNote: (projectId: string, phaseId: string, taskId: string, text: string) => void
  onAddTask: (projectId: string, phaseId: string, task: { title: string; description?: string; category?: string; priority?: "low" | "medium" | "high" }) => void
}

export function ProjectTasks({
  projectId,
  phaseId,
  tasks,
  onToggleTask,
  onAddNote,
  onAddTask
}: ProjectTasksProps) {
  const [activeTaskForNote, setActiveTaskForNote] = useState<{
    task: ExecutableTask
    mode: "complete_with_note" | "add_note" | "view_notes"
  } | null>(null)

  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskCategory, setNewTaskCategory] = useState("")
  const [isAddingTask, setIsAddingTask] = useState(false)

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) return
    onAddTask(projectId, phaseId, {
      title: newTaskTitle.trim(),
      category: newTaskCategory.trim() || undefined
    })
    setNewTaskTitle("")
    setNewTaskCategory("")
    setIsAddingTask(false)
  }

  return (
    <div className="mt-4 rounded-2xl border border-border/70 bg-card/40 px-5 py-4">
      {/* Task List */}
      <div className="flex flex-col divide-y divide-border/40">
        {tasks.map((task) => {
          const isDone = task.status === "completed"
          const noteCount = task.notes?.length || 0

          return (
            <div
              key={task.id}
              className={`group relative flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between transition-colors rounded-lg px-2 hover:bg-muted/30 ${
                isDone ? "opacity-75" : ""
              }`}
            >
              {/* Checkbox & Details */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {/* Single Click Toggle Checkbox */}
                <button
                  type="button"
                  onClick={() => onToggleTask(projectId, phaseId, task.id)}
                  title={isDone ? "Mark pending" : "Mark completed"}
                  className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition-all ${
                    isDone
                      ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                      : "border-muted-foreground/40 bg-background hover:border-primary"
                  }`}
                >
                  {isDone && <CheckIcon className="size-3.5 stroke-[3]" />}
                </button>

                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-sm font-semibold transition-all ${
                        isDone ? "line-through text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {task.title}
                    </span>

                    {task.category && (
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                        {task.category}
                      </Badge>
                    )}

                    {task.priority && (
                      <span
                        className={`text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded ${
                          task.priority === "high"
                            ? "bg-rose-500/15 text-rose-500"
                            : task.priority === "medium"
                            ? "bg-amber-500/15 text-amber-500"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {task.priority}
                      </span>
                    )}
                  </div>

                  {task.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                      {task.description}
                    </p>
                  )}

                  {/* Notes / Logs list preview if present */}
                  {noteCount > 0 && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTaskForNote({ task, mode: "view_notes" })}
                        className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/5 px-2 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/10 transition-colors"
                      >
                        <MessageSquare className="size-3" />
                        <span>{noteCount} Note Log{noteCount > 1 ? "s" : ""}</span>
                      </button>
                      <span className="text-[10px] text-muted-foreground truncate max-w-[280px] italic">
                        "{task.notes[0]?.text}"
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setActiveTaskForNote({ task, mode: "add_note" })}
                  className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1"
                  title="Add Note Log"
                >
                  <MessageSquare className="size-3.5" />
                  <span className="hidden sm:inline">Note</span>
                </Button>

                <Button
                  size="sm"
                  variant={isDone ? "outline" : "default"}
                  onClick={() =>
                    setActiveTaskForNote({
                      task,
                      mode: isDone ? "add_note" : "complete_with_note"
                    })
                  }
                  className={`h-7 text-[11px] font-semibold gap-1.5 ${
                    isDone
                      ? "border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {isDone ? (
                    <>
                      <CheckCircle2 className="size-3.5" />
                      <span>Completed</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon className="size-3.5" />
                      <span>Mark Done</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )
        })}

        {tasks.length === 0 && (
          <div className="py-6 text-center text-xs text-muted-foreground">
            No executable tasks in this phase yet. Add one below to start tracking.
          </div>
        )}
      </div>

      {/* Inline Add Task Form */}
      <div className="mt-4 border-t border-border/50 pt-3">
        {isAddingTask ? (
          <div className="flex flex-col sm:flex-row items-center gap-2 rounded-xl border border-primary/40 bg-background p-2.5 shadow-sm">
            <Input
              placeholder="Executable task title (e.g. Solve LeetCode 206 Reverse Linked List)"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="h-8 text-xs flex-1"
              autoFocus
            />
            <Input
              placeholder="Category (e.g. DS & Algo)"
              value={newTaskCategory}
              onChange={(e) => setNewTaskCategory(e.target.value)}
              className="h-8 text-xs w-full sm:w-40"
            />
            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
              <Button size="sm" variant="ghost" onClick={() => setIsAddingTask(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreateTask} disabled={!newTaskTitle.trim()} className="h-8 text-xs">
                Add Task
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingTask(true)}
            className="w-full border-dashed text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 gap-1.5 h-8"
          >
            <Plus className="size-3.5" />
            <span>Add Executable Task to Phase</span>
          </Button>
        )}
      </div>

      {/* Note Dialog */}
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
