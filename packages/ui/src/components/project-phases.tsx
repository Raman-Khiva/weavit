import { Badge } from "@workspace/ui/components/reui/badge"
import {
  Frame,
  FrameHeader,
  FramePanel,
} from "@workspace/ui/components/reui/frame"
import {
  Timeline,
  TimelineContent,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@workspace/ui/components/reui/timeline"

import { cn } from "@workspace/ui/lib/utils"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"
import { Spinner } from "@workspace/ui/components/spinner"
import {
  CheckIcon,
  ChevronRightIcon,
  CircleIcon,
  CalendarIcon,
  ListTodoIcon,
  CheckCircle2Icon,
  CircleDashedIcon,
} from "lucide-react"
import { ProjectTasks } from "@workspace/ui/components/project-tasks"
import { Progress } from "@workspace/ui/components/progress"

const pipelineSteps = [
  {
    id: 1,
    title: "Source Code Checkout",
    duration: "12s",
    status: "completed",
    description: "Successfully fetched latest changes from the main branch.",
    user: {
      name: "Alex Johnson",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=96&h=96&dpr=2&q=80",
    },
    startDate: "Oct 01, 2026",
    endDate: "Oct 02, 2026",
    stats: { total: 12, ongoing: 0, finished: 12 },
    progress: 100,
  },
  {
    id: 2,
    title: "Dependency Installation",
    duration: "1m 45s",
    status: "completed",
    description: "All npm packages installed and cached for future builds.",
    user: {
      name: "Sarah Chen",
      avatar:
        "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=96&h=96&dpr=2&q=80",
    },
    startDate: "Oct 02, 2026",
    endDate: "Oct 04, 2026",
    stats: { total: 24, ongoing: 0, finished: 24 },
    progress: 100,
  },
  {
    id: 3,
    title: "Unit & Integration Tests",
    duration: "Running",
    status: "active",
    description: "Running 142 test suites across the entire codebase...",
    user: {
      name: "Michael Rodriguez",
      avatar:
        "https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?w=96&h=96&dpr=2&q=80",
    },
    startDate: "Oct 04, 2026",
    endDate: "Oct 10, 2026",
    stats: { total: 142, ongoing: 42, finished: 100 },
    progress: 70,
  },
  {
    id: 4,
    title: "Production Build",
    duration: "Pending",
    status: "pending",
    description: "Optimizing assets and generating static site pages.",
    user: {
      name: "Emma Wilson",
      avatar:
        "https://images.unsplash.com/photo-1485893086445-ed75865251e0?w=96&h=96&dpr=2&q=80",
    },
    startDate: "Oct 10, 2026",
    endDate: "Oct 12, 2026",
    stats: { total: 5, ongoing: 0, finished: 0 },
    progress: 0,
  },
]

function StatusIcon({ status }: { status: string }) {
  if (status === "completed") return <CheckIcon className="size-3.5" />
  if (status === "active") return <Spinner className="size-3.5" />
  return <CircleIcon className="size-3.5" />
}

function StatusBadge({
  status,
  duration,
}: {
  status: string
  duration: string
}) {
  const variant =
    status === "completed"
      ? "success-light"
      : status === "active"
        ? "info-light"
        : "warning-light"

  return (
    <Badge variant={variant} size="sm">
      {duration}
    </Badge>
  )
}

export function ProjectPhases() {
  return (
    <div className="w-full">
      <Timeline defaultValue={3}>
        {pipelineSteps.map((step) => (
          <TimelineItem key={step.id} step={step.id} className="ms-10 pb-10">
            <TimelineHeader>
              <TimelineSeparator className="group-data-[orientation=vertical]/timeline:-left-7 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=vertical]/timeline:translate-y-7" />
              <div className="flex items-center gap-2">
                <TimelineTitle className="text-sm font-semibold">
                  {step.title}
                </TimelineTitle>
                <StatusBadge status={step.status} duration={step.duration} />
              </div>
              <TimelineIndicator
                className={cn(
                  "flex size-6 items-center justify-center border-none bg-muted text-muted-foreground group-data-completed/timeline-item:bg-primary group-data-completed/timeline-item:text-primary-foreground group-data-[orientation=vertical]/timeline:-left-7",
                  step.status === "active" && "ring-2 ring-primary/20"
                )}
              >
                <StatusIcon status={step.status} />
              </TimelineIndicator>
            </TimelineHeader>
            <TimelineContent className="mt-2 overflow-hidden rounded-xl border-border">
              <Frame stacked dense spacing="sm">
                <Collapsible
                  defaultOpen
                  className="group/collapsible overflow-hidden"
                >
                  <CollapsibleTrigger className="flex w-full">
                    <FrameHeader className="flex grow flex-col gap-4 px-6 py-4">
                      <div className="flex w-full items-center gap-4">
                        <div className="flex-1">
                          <Progress value={step.progress} className="h-1.5" />
                        </div>
                        <ChevronRightIcon className="size-4 shrink-0 cursor-pointer text-muted-foreground transition-transform duration-200 group-data-open/collapsible:rotate-90 hover:text-foreground" />
                      </div>

                      <div className="flex w-full flex-wrap items-center justify-between gap-4 pr-8">
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <ListTodoIcon className="size-3.5" />
                            <span>{step.stats.total} Tasks</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-amber-500">
                            <CircleDashedIcon className="size-3.5" />
                            <span>{step.stats.ongoing} Ongoing</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-emerald-500">
                            <CheckCircle2Icon className="size-3.5" />
                            <span>{step.stats.finished} Finished</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CalendarIcon className="size-3.5" />
                          <span>
                            {step.startDate} - {step.endDate}
                          </span>
                        </div>
                      </div>
                    </FrameHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                    <ProjectTasks />
                  </CollapsibleContent>
                </Collapsible>
              </Frame>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </div>
  )
}
