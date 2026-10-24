"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Textarea } from "@workspace/ui/components/textarea"
import { Badge } from "@workspace/ui/components/badge"
import { ExecutableTask, TaskLogNote } from "@workspace/ui/lib/projects-store"
import { MessageSquarePlus, Clock, CheckCircle2, ListFilter, Notebook } from "lucide-react"

interface TaskNoteDialogProps {
  task: ExecutableTask | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaveNote: (taskId: string, text: string, toggleStatus?: boolean) => void
  mode?: "complete_with_note" | "add_note" | "view_notes"
}

export function TaskNoteDialog({
  task,
  open,
  onOpenChange,
  onSaveNote,
  mode = "complete_with_note"
}: TaskNoteDialogProps) {
  const [noteText, setNoteText] = useState("")

  if (!task) return null

  const handleSave = (toggleStatus: boolean) => {
    onSaveNote(task.id, noteText, toggleStatus)
    setNoteText("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg p-6">
        <DialogHeader className="gap-1.5 pb-2">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                {mode === "complete_with_note"
                  ? "Mark Task as Completed"
                  : mode === "add_note"
                  ? "Add Context Note / Record Log"
                  : "Task Progress Log & Notes"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {mode === "complete_with_note"
                  ? "Log your learnings or complete immediately"
                  : "Track progress, solutions, and key takeaways"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-1">
          {/* Active Target Task Card */}
          <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <span>Target Task</span>
              {task.priority && (
                <span
                  className={`px-1.5 py-0.2 rounded font-mono font-bold text-[9px] uppercase ${
                    task.priority === "HIGH" || task.priority === "URGENT"
                      ? "bg-rose-500/15 text-rose-500"
                      : task.priority === "MEDIUM"
                      ? "bg-amber-500/15 text-amber-500"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {task.priority} Priority
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold text-foreground line-clamp-1">{task.title}</span>
              {task.category && (
                <Badge variant="outline" className="text-[10px] font-semibold shrink-0 px-2 py-0 border-border bg-card">
                  {task.category}
                </Badge>
              )}
            </div>
            {task.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 pt-0.5">{task.description}</p>
            )}
          </div>

          {/* Previous Notes Log Timeline */}
          {task.notes && task.notes.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Clock className="size-3.5" />
                <span>Recorded Activity Log ({task.notes.length})</span>
              </div>
              <div className="max-h-36 overflow-y-auto rounded-xl border border-border bg-muted/20 p-2.5 space-y-2">
                {task.notes.map((note: TaskLogNote) => (
                  <div key={note.id} className="rounded-lg border border-border/60 bg-card p-2.5 text-xs shadow-2xs">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                      <span>{note.createdAt}</span>
                      {note.author && <span className="font-semibold text-foreground/80">{note.author}</span>}
                    </div>
                    <p className="mt-1 text-foreground/90 font-medium whitespace-pre-wrap">{note.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Note Input */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Notebook className="size-3.5 text-primary" />
                  <span>Completion Note / Log</span>
                  <span className="text-[10px] font-normal text-muted-foreground">(Optional)</span>
                </label>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Practiced problems, key insights, links, or learnings to record with this task.
              </p>
            </div>
            <Textarea
              placeholder="e.g. Reviewed 5 LeetCode DP problems. Solved memoization edge cases..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="min-h-[105px] text-xs resize-none rounded-xl bg-background border-border/80 focus-visible:ring-1 leading-relaxed"
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-border/50">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="text-xs text-muted-foreground hover:text-foreground w-full sm:w-auto">
            Cancel
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {mode === "complete_with_note" ? (
              noteText.trim().length > 0 ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSave(true)}
                    className="text-xs border-border/80 hover:bg-muted/50"
                  >
                    Skip Note
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSave(true)}
                    className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                  >
                    <CheckCircle2 className="size-3.5" />
                    Complete & Save Note
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={() => handleSave(true)}
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs w-full sm:w-auto"
                >
                  <CheckCircle2 className="size-3.5" />
                  Mark Task as Done
                </Button>
              )
            ) : (
              <Button size="sm" onClick={() => handleSave(false)} disabled={!noteText.trim()} className="text-xs font-semibold">
                Save Note Log
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
