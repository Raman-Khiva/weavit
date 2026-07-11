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
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@workspace/ui/components/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { ClockIcon, MapPinIcon, PlusIcon } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

const EVENTS = [
  {
    id: "1",
    title: "Mobile QA Handoff",
    status: "Upcoming",
    time: "Jun 10 · 2:30 pm",
    location: "Remote",
    attendees: [
      {
        name: "Alice",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
      },
      {
        name: "Bob",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
      },
      {
        name: "Charlie",
        avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d",
      },
    ],
    additionalAttendees: 1,
  },
  {
    id: "2",
    title: "Quarterly All-Hands",
    status: "Completed",
    time: "Jun 10 · 4:00 pm",
    location: "Main Hall",
    attendees: [
      {
        name: "David",
        avatar: "https://i.pravatar.cc/150?u=a04258114e29026302d",
      },
      {
        name: "Eve",
        avatar: "https://i.pravatar.cc/150?u=a04258a2462d826712d",
      },
    ],
  },
  {
    id: "3",
    title: "Marketing Campaign Review",
    status: "Pending",
    time: "Jun 10 · 10:30 am",
    location: "Google Meet",
    attendees: [
      {
        name: "Frank",
        avatar: "https://i.pravatar.cc/150?u=a048581f4e29026701d",
      },
      {
        name: "Grace",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
      },
      {
        name: "Heidi",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
      },
    ],
    additionalAttendees: 1,
  },
  {
    id: "4",
    title: "Hiring Panel · Design",
    status: "Upcoming",
    time: "Jun 10 · 11:00 am",
    location: "Zoom",
    attendees: [
      {
        name: "Ivan",
        avatar: "https://i.pravatar.cc/150?u=a04258114e29026302d",
      },
      {
        name: "Judy",
        avatar: "https://i.pravatar.cc/150?u=a04258a2462d826712d",
      },
      {
        name: "Mallory",
        avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d",
      },
    ],
    additionalAttendees: 1,
  },
]

export interface DetailedCalendarProps {
  className?: string
  calendarClassName?: string
  cellSize?: string | number
}

export function DetailedCalendar({
  className,
  calendarClassName,
  cellSize,
}: DetailedCalendarProps) {
  // June 11, 2026 (matching the image)
  const [date, setDate] = React.useState<Date | undefined>(
    new Date(2026, 5, 11)
  )

  const formattedDate = date
    ? date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "Select a date"

  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col gap-8 rounded-2xl p-4 text-card-foreground md:flex-row md:p-6",
        className
      )}
    >
      {/* Calendar Pane */}
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

      {/* Events Pane */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              {formattedDate}
            </h2>
            <p className="text-sm text-muted-foreground">
              {EVENTS.length} events
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="h-9 w-[130px]">
                <SelectValue placeholder="All events" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All events</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past</SelectItem>
              </SelectContent>
            </Select>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 rounded-lg px-3"
                >
                  <PlusIcon className="size-4" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Event</DialogTitle>
                  <DialogDescription>
                    Create a new event for this day. Click save when you're
                    done.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Title
                    </Label>
                    <Input
                      id="title"
                      placeholder="Event title"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="time" className="text-right">
                      Time
                    </Label>
                    <Input
                      id="time"
                      placeholder="2:30 pm"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="location" className="text-right">
                      Location
                    </Label>
                    <Input
                      id="location"
                      placeholder="Remote or Room Name"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">
                      Status
                    </Label>
                    <div className="col-span-3">
                      <Select defaultValue="Upcoming">
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Upcoming">Upcoming</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Save changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Event List */}
        <div
          className="flex flex-col gap-3 overflow-y-auto pr-2"
          style={{ maxHeight: "420px" }}
        >
          {EVENTS.map((event) => (
            <div
              key={event.id}
              className="flex flex-col gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-accent/50"
            >
              <h3 className="text-base leading-none font-semibold">
                {event.title}
              </h3>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <Badge
                  variant="outline"
                  className={cn(
                    "rounded-md px-2 py-0.5 font-medium before:bg-current",
                    event.status === "Pending"
                      ? "border-orange-500/20 bg-orange-500/10 text-orange-500 dark:text-orange-400"
                      : event.status === "Completed"
                        ? "border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400"
                        : "border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400"
                  )}
                >
                  {event.status}
                </Badge>

                <AvatarGroup>
                  {event.attendees.map((attendee, i) => (
                    <Avatar key={i} size="sm">
                      <AvatarImage src={attendee.avatar} alt={attendee.name} />
                      <AvatarFallback>{attendee.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  ))}
                  {event.additionalAttendees && (
                    <AvatarGroupCount className="bg-muted/50 text-[10px]">
                      +{event.additionalAttendees}
                    </AvatarGroupCount>
                  )}
                </AvatarGroup>

                <div className="flex items-center gap-1.5">
                  <ClockIcon className="size-4" />
                  <span>{event.time}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <MapPinIcon className="size-4" />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
