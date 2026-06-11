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
  ChevronRight,
  FolderOpen,
  LeafIcon,
  LucideIcon,
  MoveRight,
} from "lucide-react"
import { Progress } from "@workspace/ui/components/progress"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"

interface ProjectCardProps {
  title: string
  description?: string
  date?: string
  icon?: LucideIcon
}

export const ProjectCard = ({
  title,
  description,
  date,
  icon: Icon = FolderOpen,
}: ProjectCardProps) => {
  return (
    <Card className="max-w-xs min-w-76 justify-between gap-1">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-md border border-border bg-card p-2">
            <Icon
              className="font-bold text-secondary-foreground"
              strokeWidth={1.6}
              size={27}
            />
          </div>
          <div>
            <Badge className="text-[9px]" variant="outline">
              Webdev
            </Badge>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      {description && (
        <CardContent>
          <CardDescription className="font-medium">
            {description}
          </CardDescription>
          <div className="py-2">
            <Progress value={80} />
          </div>
        </CardContent>
      )}
      {date && (
        <CardFooter className="flex items-center justify-between bg-background px-4 py-1.5 pt-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar
              size={16}
              className="font-bold text-primary-foreground"
              strokeWidth={2.5}
            />{" "}
            <p className="text-sm font-semibold text-primary-foreground/80">
              {date}
            </p>
          </div>
          <Button variant="link" className="hover:text-secondary-foreground/90">
            Details
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
