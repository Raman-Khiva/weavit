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

  const title = project?.title || "untitled plan";
  const description = project?.description || "";
  const category = project?.category || "roadmap";
  const date = project?.startDate ? `${project.startDate}${project.endDate ? ` - ${project.endDate}` : ""}` : project.startDate || "active plan"

  const computedstats = null;
  const progressvalue = 40;

  const icon = Code2;

  return (
    <Card size=
      {"default"} className="flex w-full  flex-col justify-between gap-2 h-full transition-all duration-200 hover:border-primary/50 hover:shadow-md group">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <div className="rounded-xl border border-border bg-Card p-2.5 text-primary group-hover:bg-primary/10 transition-colors">
            <Code2 />
            {/*<icon
              className="size-6 text-foreground group-hover:text-primary transition-colors"
              strokewidth={1.8}
            />*/}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <Badge className="text-[10px] px-2 py-0 font-medium" variant="outline">
                {category}
              </Badge>
              {computedstats && (
                <span className="text-[11px] font-mono font-bold text-muted-foreground">
                  {4}/{10} done
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
          <Progress value={progressvalue} className="h-2" />
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
