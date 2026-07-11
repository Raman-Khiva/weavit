"use client"

import { useState } from "react"
import { addDays } from "date-fns"
import type { DateRange } from "react-day-picker"

import { Calendar } from "@workspace/ui/components/calendar"
import { Card, CardContent } from "@workspace/ui/components/card"

export function StreakCalender() {
  const today = new Date()
  const [date, setDate] = useState<DateRange | undefined>({
    from: today,
    to: addDays(today, 5),
  })

  return (
    <Card className="w-fit p-4">
      <CardContent className="p-0">
        <Calendar mode="range" onSelect={setDate} selected={date} />
      </CardContent>
    </Card>
  )
}
