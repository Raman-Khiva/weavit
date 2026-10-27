"use client"

import { useEffect, useState } from "react"
import { CalendarWeek } from "@workspace/ui/components/calendar-week"

function localNow() {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`
}

export default function Page() {
  const [now, setNow] = useState(localNow)

  useEffect(() => {
    setNow(localNow())
  }, [])

  return (
    <div className="h-full min-h-[720px] w-full">
      <CalendarWeek className="h-full min-h-[720px]" now={now} />
    </div>
  )
}
