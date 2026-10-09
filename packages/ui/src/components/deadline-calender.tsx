"use client"

import { addDays, format, isToday } from "date-fns"
import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { createPortal } from "react-dom"
import { cn } from "@workspace/ui/lib/utils"
import {
  MiniCalendar,
  MiniCalendarDay,
  MiniCalendarDays,
  MiniCalendarNavigation,
} from "@workspace/ui/components/kibo-ui/mini-calendar/index"

export const title = "Full mini calendar"

const deadlines = [
  {
    id: 1,
    title: "Project Proposal",
    course: "Software Engineering",
    time: "11:59 PM",
    priority: "high",
  },
  {
    id: 2,
    title: "Reading Assignment",
    course: "History 101",
    time: "5:00 PM",
    priority: "medium",
  },
  {
    id: 3,
    title: "Math Quiz",
    course: "Calculus II",
    time: "2:00 PM",
    priority: "low",
  },
]

const getDeadlineCount = (date: Date) => {
  if (isToday(date)) return 3
  const day = date.getDate()
  if (day % 3 === 0) return 2
  if (day % 4 === 0) return 1
  if (day % 2 === 1) return 1
  return 0
}

export const DeadlineCalender = () => {
  const [value, setValue] = useState(addDays(new Date(), 1))
  const [hoveredData, setHoveredData] = useState<{
    dateStr: string
    x: number
    y: number
  } | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div
      className="z-50 w-full max-w-[29rem]"
      onMouseLeave={() => setHoveredData(null)}
    >
      <MiniCalendar
        days={7}
        onValueChange={(date) => date && setValue(date)}
        value={value}
        className="z-50"
      >
        <MiniCalendarNavigation className="z-50" direction="prev" />
        <MiniCalendarDays>
          {(date) => {
            const isHovered = hoveredData?.dateStr === date.toISOString()
            const isCurrentDay = isToday(date)
            const count = getDeadlineCount(date)

            return (
              <div
                key={date.toISOString()}
                className="relative flex cursor-pointer items-center justify-center"
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  setHoveredData({
                    dateStr: date.toISOString(),
                    x: rect.left + rect.width / 2,
                    y: rect.top,
                  })
                }}
              >
                {isHovered && (
                  <motion.div
                    layoutId="day-hover-bg"
                    className="absolute inset-0 z-0 rounded-md bg-muted"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", duration: 0.6 }}
                  />
                )}
                <div className="relative z-10 flex items-center justify-center">
                  <MiniCalendarDay date={date} className="relative" />
                  {count > 0 && (
                    <span
                      className={cn(
                        "absolute top-1 right-1 z-20 flex h-3.5 min-w-[0.875rem] pointer-events-none items-center justify-center rounded-full px-1 text-[8.5px] font-extrabold shadow-xs",
                        isCurrentDay
                          ? "bg-rose-500 text-white ring-1 ring-background"
                          : "bg-amber-400 text-amber-950"
                      )}
                    >
                      {count}
                    </span>
                  )}
                </div>
              </div>
            )
          }}
        </MiniCalendarDays>
        <MiniCalendarNavigation direction="next" className="z-50" />
      </MiniCalendar>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {hoveredData && (
              <motion.div
                className="pointer-events-none fixed top-0 left-0 z-50 w-72 rounded-lg border bg-popover p-4 text-popover-foreground shadow-md ring-1 ring-foreground/10"
                initial={{
                  opacity: 0,
                  scale: 0.95,
                  x: hoveredData.x - 144,
                  y: hoveredData.y,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: hoveredData.x - 144,
                  y: hoveredData.y - 8,
                }}
                exit={{ opacity: 0, scale: 0.95, y: hoveredData.y }}
                transition={{ type: "spring", stiffness: 50, damping: 8 }}
                style={{ transformOrigin: "bottom center" }}
                transformTemplate={(_, generated) =>
                  `translateY(-100%) ${generated}`
                }
              >
                <div className="space-y-4">
                  <p className="text-lg font-semibold">
                    Deadlines for{" "}
                    {format(new Date(hoveredData.dateStr), "MMM do")}
                  </p>
                  <ul className="space-y-3">
                    {deadlines.map((deadline) => (
                      <li key={deadline.id} className="flex items-center gap-3">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            deadline.priority === "high"
                              ? "bg-red-500"
                              : deadline.priority === "medium"
                                ? "bg-amber-500"
                                : "bg-green-500"
                          }`}
                        />
                        <div className="flex flex-1 flex-col">
                          <div className="text-sm font-medium">
                            {deadline.title}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {deadline.course}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">
                          {deadline.time}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  )
}
