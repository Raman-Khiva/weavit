"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@workspace/ui/lib/utils"

function Progress({
  className,
  value,
  showValue = true,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  showValue?: boolean
}) {
  return (
    <div className="flex w-full min-w-0 items-center gap-2">
      <ProgressPrimitive.Root
        data-slot="progress"
        className={cn(
          "relative h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-foreground/15",
          className
        )}
        value={value}
        {...props}
      >
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className="size-full flex-1 bg-foreground transition-all"
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </ProgressPrimitive.Root>

      {showValue ? (
        <p className="shrink-0 text-xs font-semibold tabular-nums text-foreground">
          {value ?? 0}%
        </p>
      ) : null}
    </div>
  )
}

export { Progress }
