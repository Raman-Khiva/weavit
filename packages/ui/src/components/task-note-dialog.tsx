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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <Notebook className="size-5" />
            <DialogTitle className="text-lg font-bold">
              {mode === "complete_with_note"
                ? "Mark Task as Completed"
                : mode === "add_note"
                ? "Add Context Note / Record Log"
                : "Task Progress Log & Notes"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            <span className="font-semibold text-foreground">{task.title}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Previous Notes Log Timeline */}
          {task.notes && task.notes.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Clock className="size-3.5" />
                <span>Recorded Activity Log ({task.notes.length})</span>
              </div>
              <div className="max-h-40 overflow-y-auto rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                {task.notes.map((note: TaskLogNote) => (
                  <div key={note.id} className="rounded-md border border-border/60 bg-card p-2 text-xs">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                      <span>{note.timestamp}</span>
                      {note.author && <span>{note.author}</span>}
                    </div>
                    <p className="mt-1 text-foreground/90 font-medium whitespace-pre-wrap">{note.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Note Input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
              <span>{mode === "complete_with_note" ? "Optional Completion Note / Log Message" : "New Note Text"}</span>
              <span className="text-[10px] text-muted-foreground">(Practiced problems, key insights, links, etc.)</span>
            </label>
            <Textarea
              placeholder="e.g. Reviewed 5 LeetCode DP problems. Solved memoization edge cases."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="h-24 text-xs"
            />
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            {mode === "complete_with_note" ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSave(true)}
                  className="text-xs"
                >
                  Mark Done Without Note
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleSave(true)}
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                >
                  <CheckCircle2 className="size-3.5" />
                  Mark Done + Save Note
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => handleSave(false)} disabled={!noteText.trim()} className="text-xs">
                Save Note Log
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
