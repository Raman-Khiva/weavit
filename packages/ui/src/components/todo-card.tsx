import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"
import { Badge } from "@workspace/ui/components/badge"

export interface TodoCardProps extends React.ComponentProps<"div"> {
  heading?: string
  description?: string
  priority?: string
  startDate?: string
  endDate?: string
}

export const TodoCard = React.forwardRef<HTMLDivElement, TodoCardProps>(
  (
    {
      className,
      heading,
      description,
      priority,
      startDate,
      endDate,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex max-w-xs flex-col gap-2 rounded-md border bg-card p-3 shadow-xs",
          className
        )}
        {...props}
      >
        {(heading || priority) && (
          <div className="flex items-start justify-between gap-2">
            {heading && (
              <span className="line-clamp-1 text-sm font-medium">
                {heading}
              </span>
            )}
            {priority && (
              <Badge
                variant={
                  priority.toLowerCase() === "high" ||
                  priority.toLowerCase() === "urgent"
                    ? "destructive"
                    : priority.toLowerCase() === "medium"
                      ? "default"
                      : "secondary"
                }
                className="pointer-events-none h-5 rounded-sm px-1.5 text-[11px] capitalize"
              >
                {priority}
              </Badge>
            )}
          </div>
        )}
        {description && (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {description}
          </p>
        )}
        {(startDate || endDate) && (
          <div className="flex items-center text-[10px] text-muted-foreground tabular-nums">
            {startDate && <time>{startDate}</time>}
            {startDate && endDate && <span className="mx-1">-</span>}
            {endDate && <time>{endDate}</time>}
          </div>
        )}
        {children}
      </div>
    )
  }
)
TodoCard.displayName = "TodoCard"
