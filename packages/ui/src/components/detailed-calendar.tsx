"use client"

import * as React from "react"
import { Calendar } from "@workspace/ui/components/calendar"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { ClockIcon, PlusIcon } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { components } from "@weavit/api-types"

type DEADLINE = components["schemas"]["Deadline"]

export type CreateDeadlineFields = {
  title: string
  time?: string
  dueDate: string
}

export interface DetailedCalendarProps {
  className?: string
  calendarClassName?: string
  cellSize?: string | number
  deadlines: DEADLINE[]
  onAdd?: (fields: CreateDeadlineFields) => void
  onToggle?: (deadline: DEADLINE) => void
}

function dayKey(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function DetailedCalendar({
  className,
  deadlines,
  calendarClassName,
  cellSize,
  onAdd,
  onToggle,
}: DetailedCalendarProps) {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [open, setOpen] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [time, setTime] = React.useState("")

  const selectedKey = date ? dayKey(date) : ""
  const dayDeadlines = deadlines.filter((d) => d.dueDate.slice(0, 10) === selectedKey)

  const formattedDate = date
    ? date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "Select a date"

  const save = () => {
    if (!title.trim() || !date || !onAdd) return
    onAdd({
      title: title.trim(),
      time: time.trim() || undefined,
      dueDate: new Date(date).toISOString(),
    })
    setTitle("")
    setTime("")
    setOpen(false)
  }

  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col gap-8 rounded-2xl p-4 text-card-foreground md:flex-row md:p-6",
        className
      )}
    >
      <div className="mx-auto border-border md:mx-0 md:border-r md:pr-8">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          captionLayout="dropdown"
          startMonth={new Date(2020, 0)}
          endMonth={new Date(2030, 11)}
          className={cn("border-0 p-0", calendarClassName)}
          style={
            cellSize
              ? ({
                  "--cell-size":
                    typeof cellSize === "number" ? `${cellSize}px` : cellSize,
                } as React.CSSProperties)
              : ({ "--cell-size": "32px" } as React.CSSProperties)
          }
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold tracking-tight">{formattedDate}</h2>
            <p className="text-sm text-muted-foreground">
              {dayDeadlines.length} deadline{dayDeadlines.length === 1 ? "" : "s"}
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-lg px-3">
                <PlusIcon className="size-4" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Deadline</DialogTitle>
                <DialogDescription>
                  Create a deadline for {formattedDate}.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Deadline title"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="time" className="text-right">
                    Time
                  </Label>
                  <Input
                    id="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="14:00"
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" onClick={save} disabled={!title.trim()}>
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div
          className="flex flex-col gap-3 overflow-y-auto pr-2"
          style={{ maxHeight: "420px" }}
        >
          {dayDeadlines.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No deadlines this day.
            </p>
          ) : (
            dayDeadlines.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => onToggle?.(event)}
                className="flex flex-col gap-3 rounded-xl border bg-card p-4 text-left transition-colors hover:bg-accent/50"
              >
                <h3 className="text-base leading-none font-semibold">{event.title}</h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-md px-2 py-0.5 font-medium before:bg-current",
                      !event.isCompleted
                        ? "border-orange-500/20 bg-orange-500/10 text-orange-500"
                        : "border-green-500/20 bg-green-500/10 text-green-600"
                    )}
                  >
                    {event.isCompleted ? "Completed" : "Pending"}
                  </Badge>
                  {event.time ? (
                    <div className="flex items-center gap-1.5">
                      <ClockIcon className="size-4" />
                      <span>{event.time}</span>
                    </div>
                  ) : null}
                  {event.course ? <span>{event.course}</span> : null}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
