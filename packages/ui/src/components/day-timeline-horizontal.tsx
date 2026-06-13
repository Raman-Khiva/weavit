"use client"

import {
  TimelineHorizontal,
  TimelineHorizontalContent,
  TimelineHorizontalSection,
  TimelineHorizontalItem,
} from "@workspace/ui/components/unlumen-ui/timeline-horizontal"

const hours = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0")
  return {
    href: `#${hour}:00`,
    label: `${hour}`,
  }
})

export const DayTimelineHorizontal = () => {
  return (
    <TimelineHorizontal className="h-44 w-full bg-transparent">
      <TimelineHorizontalContent className="py-0">
        <TimelineHorizontalSection className="ml-0">
          {hours.map((item) => (
            <TimelineHorizontalItem
              key={item.href}
              href={item.href}
              label={item.label}
              isActive={true}
              className="w-24 text-xs text-muted-foreground"
            />
          ))}
        </TimelineHorizontalSection>
      </TimelineHorizontalContent>
    </TimelineHorizontal>
  )
}
