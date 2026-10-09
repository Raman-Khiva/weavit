import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Calendar,
  FolderOpen,
  Code2,
  Rocket,
  Layers,
  CheckCircle2,
  LucideIcon,
  ChevronRight,
} from "lucide-react"
import { Progress } from "@workspace/ui/components/progress"
import { Badge } from "@workspace/ui/components/badge"
import { Project, calculateProjectProgress } from "@workspace/ui/lib/projects-store"

interface ProjectCardProps {
  project?: Project
  title?: string
  description?: string
  date?: string
  category?: string
  progress?: number
  icon?: LucideIcon
  showDescription?: boolean
}

export const ProjectCard = ({
  project,
  title: directTitle,
  description: directDescription,
  date: directDate,
  category: directCategory,
  progress: directProgress,
  icon: IconProp,
  showDescription = true,
}: ProjectCardProps) => {
  const title = project?.title || directTitle || "Untitled Plan"
  const description = project?.description || directDescription || ""
  const category = project?.category || directCategory || "Roadmap"
  const date = project?.startDate ? `${project.startDate}${project.endDate ? ` - ${project.endDate}` : ""}` : directDate || "Active Plan"

  const computedStats = project ? calculateProjectProgress(project) : null
  const progressValue = computedStats ? computedStats.percentage : (directProgress ?? 0)

  const Icon = IconProp || (project?.category?.includes("Interview") ? Code2 : project?.category?.includes("Software") ? Rocket : Layers)

  return (
    <Card className="flex flex-col justify-between gap-2 h-full transition-all duration-200 hover:border-primary/50 hover:shadow-md group">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <div className="rounded-xl border border-border bg-card p-2.5 text-primary group-hover:bg-primary/10 transition-colors">
            <Icon
              className="size-6 text-foreground group-hover:text-primary transition-colors"
              strokeWidth={1.8}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <Badge className="text-[10px] px-2 py-0 font-medium" variant="outline">
                {category}
              </Badge>
              {computedStats && (
                <span className="text-[11px] font-mono font-bold text-muted-foreground">
                  {computedStats.completedTasks}/{computedStats.totalTasks} Done
                </span>
              )}
            </div>
            <CardTitle className="mt-1 text-base font-bold line-clamp-1 group-hover:text-primary transition-colors">
              {title}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="py-2">
        {showDescription && description && (
          <CardDescription className="text-xs font-medium line-clamp-2 min-h-8">
            {description}
          </CardDescription>
        )}
        <div className={showDescription && description ? "mt-3" : "mt-1"}>
          <Progress value={progressValue} className="h-2" />
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between bg-muted/30 px-4 py-2 text-xs text-muted-foreground rounded-b-xl border-t border-border/40">
        <div className="flex items-center gap-1.5 font-medium truncate max-w-[180px]">
          <Calendar size={13} className="text-muted-foreground shrink-0" />
          <span className="truncate text-[11px]">{date}</span>
        </div>
        <div className="flex items-center gap-0.5 text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
          <span>View Plan</span>
          <ChevronRight size={14} />
        </div>
      </CardFooter>
    </Card>
  )
}
