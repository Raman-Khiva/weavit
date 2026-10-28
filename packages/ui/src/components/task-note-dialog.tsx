"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { CheckCircle2 } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

type NoteLike = {
  id: string
  text: string
  author?: string | null
  createdAt?: string
}

type TaskLike = {
  id: string
  title: string
  description?: string | null
  category?: string | null
  priority?: string | null
  notes?: NoteLike[] | null
}

interface TaskNoteDialogProps {
  task: TaskLike | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaveNote: (taskId: string, text: string, toggleStatus?: boolean) => void
  mode?: "complete_with_note" | "add_note" | "view_notes"
}

function formatNoteDay(value?: string) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date)
}

function formatNoteClock(value?: string) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

function priorityClass(priority?: string | null) {
  if (priority === "HIGH" || priority === "URGENT") return "text-rose-400"
  if (priority === "MEDIUM") return "text-amber-400"
  return "text-muted-foreground"
}

export function TaskNoteDialog({
  task,
  open,
  onOpenChange,
  onSaveNote,
  mode = "complete_with_note",
}: TaskNoteDialogProps) {
  const [noteText, setNoteText] = useState("")

  useEffect(() => {
    if (!open) setNoteText("")
  }, [open])

  if (!task) return null

  const notes = [...(task.notes ?? [])].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return bTime - aTime
  })

  const handleSave = (toggleStatus: boolean) => {
    onSaveNote(task.id, noteText, toggleStatus)
    setNoteText("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(720px,90vh)] w-[calc(100%-2rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="shrink-0 gap-1 border-b border-border/50 px-6 py-3 text-left">
          <DialogTitle className="text-sm font-medium text-muted-foreground">
            Notes
            {notes.length > 0 && (
              <span className="ml-1.5 tabular-nums text-muted-foreground/70">
                · {notes.length}
              </span>
            )}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="flex min-w-0 items-baseline gap-2">
              <span className="truncate text-base font-semibold text-foreground">
                {task.title}
              </span>
              {task.priority && (
                <span
                  className={cn(
                    "shrink-0 text-xs font-mono font-semibold uppercase tracking-wide",
                    priorityClass(task.priority)
                  )}
                >
                  {task.priority}
                </span>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto bg-background">
          {notes.length === 0 ? (
            <div className="flex h-full min-h-[240px] items-center justify-center px-6">
              <p className="text-base text-muted-foreground">No notes yet.</p>
            </div>
          ) : (
            <ul className="px-6 py-2">
              {notes.map((note, index) => (
                <li
                  key={note.id}
                  className={cn(
                    "grid grid-cols-[4.5rem_1fr] gap-4 py-5",
                    index < notes.length - 1 && "border-b border-border/35"
                  )}
                >
                  <div className="pt-0.5 text-right">
                    <div className="text-xs font-medium tabular-nums text-muted-foreground">
                      {formatNoteDay(note.createdAt)}
                    </div>
                    <div className="mt-0.5 text-[11px] tabular-nums text-muted-foreground/70">
                      {formatNoteClock(note.createdAt)}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="whitespace-pre-wrap text-base font-medium leading-7 text-foreground">
                      {note.text}
                    </p>
                    {note.author && (
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {note.author}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="shrink-0 border-t border-border/60 px-6 py-3">
          <div className="flex items-center gap-2">
            <Input
              autoFocus
              placeholder="Write a note…"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && noteText.trim()) {
                  e.preventDefault()
                  handleSave(mode === "complete_with_note")
                }
              }}
              className="h-11 flex-1 text-base"
            />

            {mode === "complete_with_note" ? (
              <Button
                size="sm"
                className="h-11 shrink-0 gap-1.5 bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700"
                onClick={() => handleSave(true)}
              >
                <CheckCircle2 className="size-4" />
                {noteText.trim() ? "Complete & save" : "Mark done"}
              </Button>
            ) : (
              <Button
                size="sm"
                className="h-11 shrink-0 px-4 text-sm font-semibold"
                disabled={!noteText.trim()}
                onClick={() => handleSave(false)}
              >
                Add note
              </Button>
            )}
          </div>
          <button
            type="button"
            className="mt-2 text-sm text-muted-foreground hover:text-foreground"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
