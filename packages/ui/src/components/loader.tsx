import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  progress?: number
  segments?: number
}

export function Loader({
  progress = 80,
  segments = 5,
  className,
  ...props
}: LoaderProps) {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.max(0, Math.min(100, progress))
  const filledSegments = Math.round((normalizedProgress / 100) * segments)

  return (
    <div
      className={cn("flex h-full flex-col-reverse gap-1", className)}
      {...props}
    >
      {/* Header */}

      {/* Track */}
      <div className="rounded-1 flex h-full flex-col-reverse gap-1 rounded-sm bg-secondary p-2">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-9 w-7 flex-1 rounded-md transition-colors",
              i < filledSegments
                ? "bg-zinc-600 dark:bg-secondary-foreground"
                : "bg-zinc-100 dark:bg-background/60"
            )}
          />
        ))}
      </div>

      {/* Footer Text */}
      <div className="flex justify-end">
        <span className="text-base font-semibold text-zinc-700 dark:text-zinc-300">
          {Math.round(normalizedProgress)}%
        </span>
      </div>
    </div>
  )
}
