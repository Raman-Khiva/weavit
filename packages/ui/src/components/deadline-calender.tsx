"use client"

import { addDays } from "date-fns"
import { useState } from "react"
import {
  MiniCalendar,
  MiniCalendarDay,
  MiniCalendarDays,
  MiniCalendarNavigation,
} from "@workspace/ui/components/kibo-ui/mini-calendar/index"

export const title = "Full mini calendar"

export const DeadlineCalender = () => {
  const [value, setValue] = useState(addDays(new Date(), 1))

  return (
    <div className="w-full max-w-md">
      <MiniCalendar
        days={7}
        onValueChange={(date) => date && setValue(date)}
        value={value}
      >
        <MiniCalendarNavigation direction="prev" />
        <MiniCalendarDays>
          {(date) => <MiniCalendarDay date={date} key={date.toISOString()} />}
        </MiniCalendarDays>
        <MiniCalendarNavigation direction="next" />
      </MiniCalendar>
    </div>
  )
}
