"use client"

import { Progress } from "@workspace/ui/components/progress"
import { Badge } from "@workspace/ui/components/badge"
import { Project, calculateCategoryStats, calculateProjectProgress } from "@workspace/ui/lib/projects-store"
import { CheckCircle2, CircleDashed, PieChart, Target, Calendar } from "lucide-react"

interface CategoryProgressHeaderProps {
  project: Project
}

export function CategoryProgressHeader({ project }: CategoryProgressHeaderProps) {
  const categoryStats = calculateCategoryStats(project)
  const projectProgress = calculateProjectProgress(project)

  return (
    <div className="w-full rounded-2xl border border-border/80 bg-card/60 p-6 shadow-sm backdrop-blur-sm">
      {/* Top Header Row */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 border-primary/40 text-primary">
              {project.category}
            </Badge>
            {project.startDate && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                <Calendar className="size-3.5" />
                <span>{project.startDate} {project.endDate ? `- ${project.endDate}` : ""}</span>
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
        <div className="flex items-center gap-4 rounded-xl border border-border/80 bg-background/80 p-4 min-w-[240px] justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-muted-foreground">Overall Mastery</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-extrabold text-foreground">{projectProgress.percentage}%</span>
              <span className="text-xs text-muted-foreground font-semibold">completed</span>
            </div>
            <span className="text-[11px] text-muted-foreground mt-1">
              {projectProgress.completedTasks} of {projectProgress.totalTasks} executable tasks
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
                {projectProgress.completedTasks}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown Progress Cards */}
      {categoryStats.length > 0 && (
        <div className="mt-6 border-t border-border/60 pt-5">
          <div className="flex items-center gap-2 mb-3">
            <PieChart className="size-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Category Mastery Breakdown
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categoryStats.map((stat) => (
              <div
                key={stat.category}
                className="flex flex-col gap-2 rounded-xl border border-border/60 bg-background/60 p-3.5 transition-all hover:border-border"
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-foreground truncate max-w-[140px]">{stat.category}</span>
                  <span className="font-mono text-muted-foreground">
                    {stat.completed}/{stat.total} ({stat.percentage}%)
                  </span>
                </div>
                <Progress value={stat.percentage} className="h-2" />
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1 text-emerald-500 font-medium">
                    <CheckCircle2 className="size-3" />
                    {stat.completed} done
                  </span>
                  <span className="flex items-center gap-1 text-amber-500 font-medium">
                    <CircleDashed className="size-3" />
                    {stat.total - stat.completed} remaining
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
