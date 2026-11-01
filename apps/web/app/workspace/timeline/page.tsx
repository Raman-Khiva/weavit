"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import {
  CalendarWeek,
  type CalendarEvent,
  type CalendarSource,
} from "@workspace/ui/components/calendar-week"
import {
  useGetTimelineQuery,
  usePostCalendarEventMutation,
  usePatchCalendarEventMutation,
  useDeleteCalendarEventMutation,
  usePatchCalendarMutation,
} from "@/features/timeline/timeline.api"

const DEMO_CALENDAR: CalendarSource = {
  id: "demo-cal",
  name: "Demo: Personal",
  tone: "teal",
  visible: true,
}

const DEMO_EVENT: CalendarEvent = {
  id: "demo-event",
  title: "Demo: Focus block",
  calendar: "demo-cal",
  date: new Date().toISOString().slice(0, 10),
  start: 10 * 60,
  end: 11 * 60,
  allDay: false,
  video: false,
  people: [],
}

function localNow() {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`
}

export default function Page() {
  const [now, setNow] = useState(localNow)
  const { isLoaded, isSignedIn } = useAuth()
  const { data, isLoading, isError } = useGetTimelineQuery(undefined, {
    skip: !isLoaded || !isSignedIn,
  })
  const [postEvent] = usePostCalendarEventMutation()
  const [patchEvent] = usePatchCalendarEventMutation()
  const [deleteEvent] = useDeleteCalendarEventMutation()
  const [patchCalendar] = usePatchCalendarMutation()

  useEffect(() => {
    setNow(localNow())
  }, [])

  const calendars = useMemo(
    () => [...(data?.calendars ?? []), DEMO_CALENDAR],
    [data?.calendars]
  )

  const events = useMemo(() => {
    const api =
      data?.events.map((ev) => ({
        ...ev,
        days: ev.days ?? undefined,
        location: ev.location ?? undefined,
      })) ?? []
    return [...api, DEMO_EVENT]
  }, [data?.events])

  if (!isLoaded || !isSignedIn || isLoading) {
    return (
      <div className="flex h-full min-h-[720px] w-full items-center justify-center text-sm text-muted-foreground">
        Loading timeline…
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-full min-h-[720px] w-full items-center justify-center text-sm text-muted-foreground">
        Couldn&apos;t load timeline. Try refreshing.
      </div>
    )
  }

  return (
    <div className="h-full min-h-[720px] w-full">
      <CalendarWeek
        className="h-full min-h-[720px]"
        now={now}
        calendars={calendars}
        events={events}
        onCreateEvent={(ev) => {
          if (ev.calendar.startsWith("demo-")) return
          void postEvent({
            title: ev.title || "Busy",
            calendar: ev.calendar,
            date: ev.date,
            start: ev.start,
            end: ev.end,
            allDay: ev.allDay,
            days: ev.days,
            location: ev.location,
            video: ev.video,
            people: ev.people,
          })
        }}
        onUpdateEvent={(id, body) => {
          if (id.startsWith("demo-")) return
          void patchEvent({ id, body })
        }}
        onDeleteEvent={(id) => {
          if (id.startsWith("demo-")) return
          void deleteEvent(id)
        }}
        onUpdateCalendar={(id, body) => {
          if (id.startsWith("demo-")) return
          void patchCalendar({ id, body })
        }}
      />
    </div>
  )
}
