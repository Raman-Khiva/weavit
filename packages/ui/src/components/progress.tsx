"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@workspace/ui/lib/utils"

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <main className="flex items-center justify-between gap-2">
      <ProgressPrimitive.Root
        data-slot="progress"
        className={cn(
          "relative flex h-1.5 w-full items-center overflow-x-hidden rounded-full bg-muted",
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className="size-full flex-1 bg-foreground transition-all"
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </ProgressPrimitive.Root>

      <p className="font-semibold text-foreground">{value}%</p>
    </main>
  )
}

export { Progress }
