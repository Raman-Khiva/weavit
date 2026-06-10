"use client"

import { addDays, format } from "date-fns"
import { useState } from "react"
import {
  MiniCalendar,
  MiniCalendarDay,
  MiniCalendarDays,
  MiniCalendarNavigation,
} from "@workspace/ui/components/kibo-ui/mini-calendar/index"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@workspace/ui/components/hover-card"

export const title = "Full mini calendar"

const deadlines = [
  {
    id: 1,
    title: 'Project Proposal',
    course: 'Software Engineering',
    time: '11:59 PM',
    priority: 'high',
  },
  {
    id: 2,
    title: 'Reading Assignment',
    course: 'History 101',
    time: '5:00 PM',
    priority: 'medium',
  },
  {
    id: 3,
    title: 'Math Quiz',
    course: 'Calculus II',
    time: '2:00 PM',
    priority: 'low',
  }
]

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
          {(date) => (
            <HoverCard key={date.toISOString()} openDelay={0} closeDelay={0}>
              <HoverCardTrigger asChild>
                <div className="flex">
                  <MiniCalendarDay date={date} />
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-72" sideOffset={8}>
                <div className="space-y-4">
                  <p className="text-lg font-semibold">Deadlines for {format(date, "MMM do")}</p>
                  <ul className="space-y-3">
                    {deadlines.map(deadline => (
                      <li key={deadline.id} className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${
                          deadline.priority === 'high' ? 'bg-red-500' :
                          deadline.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                        }`} />
                        <div className="flex flex-1 flex-col">
                          <div className="text-sm font-medium">{deadline.title}</div>
                          <p className="text-muted-foreground text-xs">{deadline.course}</p>
                        </div>
                        <span className="text-muted-foreground text-sm font-medium">{deadline.time}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </HoverCardContent>
            </HoverCard>
          )}
        </MiniCalendarDays>
        <MiniCalendarNavigation direction="next" />
      </MiniCalendar>
    </div>
  )
}
