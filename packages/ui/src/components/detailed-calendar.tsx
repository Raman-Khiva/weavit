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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
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

const HOURS_12 = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"] as const
const MINUTES = ["00", "15", "30", "45"] as const
const MERIDIEMS = ["AM", "PM"] as const
const ANY_TIME = "any"

type Hour12 = (typeof HOURS_12)[number]
type Minute = (typeof MINUTES)[number]
type Meridiem = (typeof MERIDIEMS)[number]

function dayKey(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Stable calendar-day ISO (noon UTC) so slice(0,10) matches the picked day. */
function dueDateFromDay(yyyyMmDd: string) {
  return `${yyyyMmDd}T12:00:00.000Z`
}

function deadlineDay(dueDate: string) {
  return dueDate.slice(0, 10)
}

function to24h(hour: Hour12, minute: Minute, meridiem: Meridiem): string {
  let h = Number(hour)
  if (meridiem === "AM" && h === 12) h = 0
  if (meridiem === "PM" && h !== 12) h += 12
  return `${String(h).padStart(2, "0")}:${minute}`
}

function formatTime12(hhmm: string) {
  const [hRaw, mRaw] = hhmm.split(":")
  let h = Number(hRaw)
  const m = mRaw ?? "00"
  const mer = h >= 12 ? "PM" : "AM"
  h = h % 12 || 12
  return `${h}:${m} ${mer}`
}

function defaultClockFromNow() {
  const now = new Date()
  const rounded = Math.ceil(now.getMinutes() / 15) * 15
  const bumpHour = rounded === 60
  let h24 = now.getHours() + (bumpHour ? 1 : 0)
  if (h24 >= 24) h24 = 23
  const minute = (bumpHour ? "00" : String(rounded).padStart(2, "0")) as Minute
  const meridiem: Meridiem = h24 >= 12 ? "PM" : "AM"
  const hour = String(h24 % 12 || 12) as Hour12
  return { hour, minute, meridiem }
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
  const [formDate, setFormDate] = React.useState(dayKey(new Date()))
  const [hour, setHour] = React.useState<string>(ANY_TIME)
  const [minute, setMinute] = React.useState<Minute>("00")
  const [meridiem, setMeridiem] = React.useState<Meridiem>("PM")

  const selectedKey = date ? dayKey(date) : ""
  const dayDeadlines = deadlines.filter(
    (d) => deadlineDay(d.dueDate) === selectedKey
  )

  const formattedDate = date
    ? date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "Select a date"

  const hasClock = hour !== ANY_TIME

  const resetForm = (forDay?: Date) => {
    const day = forDay ?? date ?? new Date()
    const clock = defaultClockFromNow()
    setTitle("")
    setFormDate(dayKey(day))
    setHour(ANY_TIME)
    setMinute(clock.minute)
    setMeridiem(clock.meridiem)
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) resetForm(date)
  }

  const onHourChange = (value: string) => {
    if (value === ANY_TIME) {
      setHour(ANY_TIME)
      return
    }
    // First pick from "Any time" → seed minute/meridiem from now
    if (hour === ANY_TIME) {
      const clock = defaultClockFromNow()
      setMinute(clock.minute)
      setMeridiem(clock.meridiem)
    }
    setHour(value)
  }

  const save = () => {
    if (!title.trim() || !formDate || !onAdd) return
    const time =
      hasClock && HOURS_12.includes(hour as Hour12)
        ? to24h(hour as Hour12, minute, meridiem)
        : undefined
    onAdd({
      title: title.trim(),
      time,
      dueDate: dueDateFromDay(formDate),
    })
    const [y, m, d] = formDate.split("-").map(Number) as [number, number, number]
    setDate(new Date(y, m - 1, d))
    resetForm()
    setOpen(false)
  }

  const canSave = Boolean(title.trim() && formDate)

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
          <Dialog open={open} onOpenChange={handleOpenChange}>
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
                  Set a title, date, and optional time.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="deadline-title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="deadline-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Math quiz"
                    className="col-span-3"
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="deadline-date" className="text-right">
                    Date
                  </Label>
                  <Input
                    id="deadline-date"
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Time</Label>
                  <div className="col-span-3 flex flex-wrap items-center gap-2">
                    <Select value={hour} onValueChange={onHourChange}>
                      <SelectTrigger className="min-w-24 flex-1" aria-label="Hour">
                        <SelectValue placeholder="Any time" />
                      </SelectTrigger>
                      <SelectContent position="popper" className="max-h-64">
                        <SelectItem value={ANY_TIME}>Any time</SelectItem>
                        {HOURS_12.map((h) => (
                          <SelectItem key={h} value={h}>
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={minute}
                      onValueChange={(v) => setMinute(v as Minute)}
                      disabled={!hasClock}
                    >
                      <SelectTrigger className="w-[4.5rem]" aria-label="Minute">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {MINUTES.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={meridiem}
                      onValueChange={(v) => setMeridiem(v as Meridiem)}
                      disabled={!hasClock}
                    >
                      <SelectTrigger className="w-[4.75rem]" aria-label="AM or PM">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {MERIDIEMS.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" onClick={save} disabled={!canSave}>
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
                      <span>{formatTime12(event.time)}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <ClockIcon className="size-4" />
                      <span>Any time</span>
                    </div>
                  )}
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
