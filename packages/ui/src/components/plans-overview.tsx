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
        "flex h-full min-h-0 w-full flex-col overflow-hidden rounded-sm border border-white/10 bg-white/[0.03]",
        className
      )}
    >
      <header className="flex shrink-0 items-center gap-2 border-b border-white/10 px-3.5 py-2.5">
        <Map className="size-3.5 text-white/45" aria-hidden />
        <h2 className="text-sm font-semibold text-white">Plans</h2>
        <span className="ml-auto text-[11px] tabular-nums text-white/40">
          {plans.length}/{max}
        </span>
      </header>

      {plans.length === 0 ? (
        <p className="px-3.5 py-6 text-center text-xs text-white/40">
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
                className="flex shrink-0 flex-col gap-3 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 transition-colors hover:border-white/20 hover:bg-white/[0.05]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {project.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-white/40">
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
