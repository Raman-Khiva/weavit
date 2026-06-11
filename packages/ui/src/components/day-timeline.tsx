"use client"

import {
  Sidebar001,
  Sidebar001Content,
  Sidebar001Section,
  Sidebar001Item,
} from "@workspace/ui/components/unlumen-ui/sidebar-001"

const hours = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0")
  return {
    href: `#${hour}:00`,
    label: `${hour}`,
  }
})

export const DayTimeline = () => {
  return (
    <Sidebar001 className="h-full w-full!" defaultWidth={100}>
      <Sidebar001Content className="py-0">
        <Sidebar001Section className="mt-4">
          {hours.map((item) => (
            <Sidebar001Item
              key={item.href}
              href={item.href}
              label={item.label}
              isActive={true}
              className="h-32 text-xs text-muted-foreground"
            />
          ))}
        </Sidebar001Section>
      </Sidebar001Content>
    </Sidebar001>
  )
}
