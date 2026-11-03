"use client"

import { useState } from "react"
import { Progress } from "@workspace/ui/components/progress"
import { Badge } from "@workspace/ui/components/badge"
import { calculateCategoryStats, calculateProjectProgress } from "@workspace/ui/lib/projects-store"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"
import { CheckCircle2, ChevronDown, CircleDashed, PieChart, Calendar } from "lucide-react"
import { components } from "@weavit/api-types"
import { cn } from "@workspace/ui/lib/utils"

type PROJECT = components["schemas"]["Project"];

interface CategoryProgressHeaderProps {
  project: PROJECT
}

function formatProjectDate(value?: string | null) {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function CategoryProgressHeader({ project }: CategoryProgressHeaderProps) {
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const categoryStats = calculateCategoryStats(project)
  const projectProgress = calculateProjectProgress(project)
  const startLabel = formatProjectDate(project.startDate)
  const endLabel = formatProjectDate(project.endDate)

  return (
    <div className="w-full rounded-2xl border border-border/80 bg-background p-6 shadow-sm">
      {/* Top Header Row */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 border-primary/40 text-primary">
              {project.category}
            </Badge>
            {startLabel && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                <Calendar className="size-3.5" />
                <span>
                  {startLabel}
                  {endLabel ? ` – ${endLabel}` : ""}
                </span>
              </div>
            )}
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {project.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-3xl">
            {project.description}
          </p>
        </div>

        {/* Overall Completion Metric Ring/Bar */}
        <div className="flex items-center gap-4 rounded-xl border border-border/80 bg-card p-4 min-w-[240px] justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-muted-foreground">Overall Mastery</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-extrabold text-foreground">{projectProgress.percentage}%</span>
              <span className="text-xs text-muted-foreground font-semibold">completed</span>
            </div>
            <span className="text-[11px] text-muted-foreground mt-1">
              {projectProgress.CompletedTasks} of {projectProgress.totalTasks} executable tasks
            </span>
          </div>
          <div className="size-14 relative grid place-items-center">
            <div
              className="size-12 rounded-full border-4 border-primary/20 flex items-center justify-center font-bold text-xs"
              style={{
                background: `conic-gradient(var(--primary) ${projectProgress.percentage * 3.6}deg, transparent 0deg)`
              }}
            >
              <div className="size-9 rounded-full bg-background grid place-items-center text-xs font-extrabold text-foreground">
                {projectProgress.CompletedTasks}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown Progress Cards */}
      {categoryStats.length > 0 && (
        <Collapsible
          open={categoriesOpen}
          onOpenChange={setCategoriesOpen}
          className="mt-6 border-t border-border/60 pt-5"
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 rounded-lg px-1 py-1 text-left hover:bg-muted/40">
            <div className="flex items-center gap-2">
              <PieChart className="size-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Category Mastery Breakdown
              </span>
              <span className="rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-muted-foreground">
                {categoryStats.length}
              </span>
            </div>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                categoriesOpen && "rotate-180"
              )}
            />
          </CollapsibleTrigger>

          <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {categoryStats.map((stat) => (
                <div
                  key={stat.category}
                  className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card p-3.5 transition-all hover:border-border"
                >
                  <div className="flex items-center justify-between gap-2 text-xs font-semibold">
                    <span className="text-foreground truncate min-w-0">{stat.category}</span>
                    <span className="font-mono text-muted-foreground shrink-0">
                      {stat.Completed}/{stat.total} ({stat.percentage}%)
                    </span>
                  </div>
                  <Progress value={stat.percentage} className="h-2" />
                  <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
                    <span className="flex min-w-0 items-center gap-1 text-emerald-500 font-medium">
                      <CheckCircle2 className="size-3 shrink-0" />
                      <span className="truncate">{stat.Completed} done</span>
                    </span>
                    <span className="flex min-w-0 items-center gap-1 text-amber-500 font-medium">
                      <CircleDashed className="size-3 shrink-0" />
                      <span className="truncate">{stat.total - stat.Completed} remaining</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  )
}
