"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import {
  CalendarWeek,
  type CalendarEvent,
  type CalendarSource,
} from "@workspace/ui/components/calendar-week"
import {
  useGetTimelineQuery,
  usePostCalendarMutation,
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

function isDemoId(id: string) {
  return id.startsWith("demo-")
}

function toEventBody(ev: Partial<CalendarEvent> & Pick<CalendarEvent, "title" | "calendar" | "date" | "start" | "end">) {
  return {
    title: ev.title.trim() || "Busy",
    calendar: ev.calendar,
    date: ev.date,
    start: ev.start,
    end: ev.end,
    allDay: ev.allDay ?? false,
    days: ev.days ?? undefined,
    location: ev.location ?? undefined,
    video: ev.video ?? false,
    people: ev.people ?? [],
  }
}

export default function Page() {
  const [now, setNow] = useState(localNow)
  const seededCalendar = useRef(false)
  const { isLoaded, isSignedIn } = useAuth()
  const { data, isLoading, isError, isFetching } = useGetTimelineQuery(undefined, {
    skip: !isLoaded || !isSignedIn,
  })
  const [postCalendar] = usePostCalendarMutation()
  const [postEvent] = usePostCalendarEventMutation()
  const [patchEvent] = usePatchCalendarEventMutation()
  const [deleteEvent] = useDeleteCalendarEventMutation()
  const [patchCalendar] = usePatchCalendarMutation()

  useEffect(() => {
    setNow(localNow())
  }, [])

  // Ensure every signed-in user has at least one real calendar for creates.
  useEffect(() => {
    if (!isLoaded || !isSignedIn || isLoading || isFetching || isError) return
    if (!data || data.calendars.length > 0 || seededCalendar.current) return
    seededCalendar.current = true
    void postCalendar({ name: "Personal", tone: "teal", visible: true })
      .unwrap()
      .catch(() => {
        seededCalendar.current = false
      })
  }, [isLoaded, isSignedIn, isLoading, isFetching, isError, data, postCalendar])

  const realCalendars = data?.calendars ?? []

  const calendars = useMemo(
    () => [...realCalendars, DEMO_CALENDAR],
    [realCalendars]
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

  const resolveCalendarId = useCallback(
    async (preferred: string) => {
      if (!isDemoId(preferred) && realCalendars.some((c) => c.id === preferred)) {
        return preferred
      }
      if (realCalendars[0]?.id) return realCalendars[0].id
      const created = await postCalendar({
        name: "Personal",
        tone: "teal",
        visible: true,
      }).unwrap()
      return created.id
    },
    [realCalendars, postCalendar]
  )

  const handleCreateEvent = useCallback(
    async (ev: CalendarEvent) => {
      const calendar = await resolveCalendarId(ev.calendar)
      const created = await postEvent(toEventBody({ ...ev, calendar })).unwrap()
      return {
        ...created,
        days: created.days ?? undefined,
        location: created.location ?? undefined,
      } satisfies CalendarEvent
    },
    [postEvent, resolveCalendarId]
  )

  const handleUpdateEvent = useCallback(
    async (id: string, patch: Partial<CalendarEvent>) => {
      if (isDemoId(id)) return
      try {
        let calendar = patch.calendar
        if (calendar && isDemoId(calendar)) {
          calendar = await resolveCalendarId(calendar)
        }
        await patchEvent({
          id,
          body: {
            ...(patch.title !== undefined
              ? { title: patch.title.trim() || "Busy" }
              : {}),
            ...(calendar !== undefined ? { calendar } : {}),
            ...(patch.date !== undefined ? { date: patch.date } : {}),
            ...(patch.start !== undefined ? { start: patch.start } : {}),
            ...(patch.end !== undefined ? { end: patch.end } : {}),
            ...(patch.allDay !== undefined ? { allDay: patch.allDay } : {}),
            ...(patch.days !== undefined ? { days: patch.days } : {}),
            ...(patch.location !== undefined ? { location: patch.location } : {}),
            ...(patch.video !== undefined ? { video: patch.video } : {}),
            ...(patch.people !== undefined ? { people: patch.people } : {}),
          },
        }).unwrap()
      } catch (err) {
        console.error("Failed to update calendar event", err)
      }
    },
    [patchEvent, resolveCalendarId]
  )

  const handleDeleteEvent = useCallback(
    async (id: string) => {
      if (isDemoId(id)) return
      try {
        await deleteEvent(id).unwrap()
      } catch (err) {
        console.error("Failed to delete calendar event", err)
      }
    },
    [deleteEvent]
  )

  const handleUpdateCalendar = useCallback(
    async (id: string, body: Partial<CalendarSource>) => {
      if (isDemoId(id)) return
      try {
        await patchCalendar({
          id,
          body: {
            ...(body.name !== undefined ? { name: body.name } : {}),
            ...(body.tone !== undefined ? { tone: body.tone } : {}),
            ...(body.visible !== undefined ? { visible: body.visible } : {}),
          },
        }).unwrap()
      } catch (err) {
        console.error("Failed to update calendar", err)
      }
    },
    [patchCalendar]
  )

  if (!isLoaded || !isSignedIn || (isLoading && !data)) {
    return (
      <div className="flex h-full min-h-[720px] w-full items-center justify-center text-sm text-muted-foreground">
        Loading timeline…
      </div>
    )
  }

  if (isError && !data) {
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
        onCreateEvent={handleCreateEvent}
        onUpdateEvent={handleUpdateEvent}
        onDeleteEvent={handleDeleteEvent}
        onUpdateCalendar={handleUpdateCalendar}
      />
    </div>
  )
}
