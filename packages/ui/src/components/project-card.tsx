import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Calendar, Code2, ChevronRight } from "lucide-react"
import { Progress } from "@workspace/ui/components/progress"
import { Badge } from "@workspace/ui/components/badge"
import { calculateProjectProgress } from "@workspace/ui/lib/projects-store"
import { components } from "@weavit/api-types"
{/* const title = project?.title || directtitle || "untitled plan"
  const description = project?.description || directdescription || ""
  const category = project?.category || directcategory || "roadmap"
  const date = project?.startdate ? `${project.startdate}${project.enddate ? ` - ${project.enddate}` : ""}` : directdate || "active plan"

  const computedstats = project ? calculateprojectprogress(project) : null
  const progressvalue = computedstats ? computedstats.percentage : (directprogress ?? 0)

  const icon = iconprop || (project?.category?.includes("interview") ? code2 : project?.category?.includes("software") ? rocket : layers)
 */}
{/*interface ProjectCardProps {
  project?: Project
  title?: string
  description?: string
  date?: string
  category?: string
  progress?: number
  icon?: LucideIcon
  showDescription?: boolean
}
  */}

interface ProjectCardProps {
  project: PROJECT
  showDescription?: boolean
}

type PROJECT = components["schemas"]["Project"]

{/*description: directDescription,
  date: directDate,
  category: directCategory,
  progress: directProgress,
  icon: IconProp,
  showDescription = true,
  */}
export const ProjectCard = (
  { project, showDescription }: ProjectCardProps

) => {

  const title = project?.title || "untitled plan"
  const description = project?.description || ""
  const category = project?.category || "roadmap"
  const formatDate = (value?: string | null) => {
    if (!value) return null
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return value
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }
  const start = formatDate(project?.startDate)
  const end = formatDate(project?.endDate)
  const date = start ? `${start}${end ? ` – ${end}` : ""}` : "Active plan"

  const computedStats = calculateProjectProgress(project)
  const progressValue = computedStats.percentage

  return (
    <Card
      size="default"
      className="group flex h-full w-full flex-col justify-between gap-2 transition-all duration-200 hover:border-primary/50 hover:shadow-md"
    >
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <div className="rounded-xl border border-border bg-card p-2.5 text-primary transition-colors group-hover:bg-primary/10">
            <Code2 />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <Badge className="px-2 py-0 text-[10px] font-medium" variant="outline">
                {category}
              </Badge>
              <span className="font-mono text-[11px] font-bold text-muted-foreground">
                {computedStats.CompletedTasks}/{computedStats.totalTasks} done
              </span>
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
          <span>view plan</span>
          <ChevronRight size={14} />
        </div>
      </CardFooter>
    </Card>
  )
}
