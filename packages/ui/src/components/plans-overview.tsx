"use client"

import { Map } from "lucide-react"
import { Progress } from "@workspace/ui/components/progress"
import { cn } from "@workspace/ui/lib/utils"
import { getProjectStats } from "@workspace/ui/components/project-overview-card"
import type { components } from "@weavit/api-types"

type PROJECT = components["schemas"]["Project"]

type PlansOverviewProps = {
  projects: PROJECT[]
  className?: string
  max?: number
}

export function PlansOverview({
  projects,
  className,
  max = 3,
}: PlansOverviewProps) {
  const plans = projects.slice(0, max)

  return (
    <section
      aria-label="Plans overview"
      className={cn(
        "flex h-full min-h-0 w-full flex-col overflow-hidden rounded-sm border border-border bg-card",
        className
      )}
    >
      <header className="flex shrink-0 items-center gap-2 border-b border-border px-3.5 py-2.5">
        <Map className="size-3.5 text-muted-foreground" aria-hidden />
        <h2 className="text-sm font-semibold text-foreground">Plans</h2>
        <span className="ml-auto text-[11px] tabular-nums text-muted-foreground">
          {plans.length}/{max}
        </span>
      </header>

      {plans.length === 0 ? (
        <p className="px-3.5 py-6 text-center text-xs text-muted-foreground">
          No active plans yet.
        </p>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {plans.map((project) => {
            const { total, done } = getProjectStats(project)
            const percentage = total > 0 ? Math.round((done / total) * 100) : 0

            return (
              <a
                key={project.id}
                href={`/workspace/projects/${project.id}`}
                className="flex shrink-0 flex-col gap-3 overflow-hidden rounded-xl border border-border bg-muted/30 px-3 py-2.5 transition-colors hover:border-border hover:bg-muted/50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {project.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {done} of {total} tasks
                  </p>
                </div>
                <Progress value={percentage} showValue={false} className="h-1.5" />
              </a>
            )
          })}
        </div>
      )}
    </section>
  )
}
