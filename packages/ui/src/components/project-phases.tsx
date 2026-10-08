"use client"

import { useState } from "react"
import { Badge } from "@workspace/ui/components/reui/badge"
import {
  Frame,
  FrameHeader,
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
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  CheckIcon,
  ChevronRightIcon,
  CircleIcon,
  CalendarIcon,
  ListTodoIcon,
  CheckCircle2Icon,
  CircleDashedIcon,
  Search,
  Filter,
  Plus,
  Layers,
  Sparkles
} from "lucide-react"
import { ProjectTasks } from "@workspace/ui/components/project-tasks"
import { Progress } from "@workspace/ui/components/progress"
import { Project, ProjectPhase } from "@workspace/ui/lib/projects-store"

interface ProjectPhasesProps {
  project: Project
  onToggleTask: (projectId: string, phaseId: string, taskId: string, noteText?: string) => void
  onAddNote: (projectId: string, phaseId: string, taskId: string, text: string) => void
  onAddTask: (projectId: string, phaseId: string, task: { title: string; description?: string; category?: string; priority?: "low" | "medium" | "high" }) => void
  onAddPhase: (projectId: string, phase: { title: string; description?: string; category?: string }) => void
}

export function ProjectPhases({
  project,
  onToggleTask,
  onAddNote,
  onAddTask,
  onAddPhase
}: ProjectPhasesProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "in_progress" | "completed">("all")
  
  const [isAddingPhase, setIsAddingPhase] = useState(false)
  const [newPhaseTitle, setNewPhaseTitle] = useState("")
  const [newPhaseCategory, setNewPhaseCategory] = useState("")
  const [newPhaseDescription, setNewPhaseDescription] = useState("")

  const handleCreatePhase = () => {
    if (!newPhaseTitle.trim()) return
    onAddPhase(project.id, {
      title: newPhaseTitle.trim(),
      category: newPhaseCategory.trim() || undefined,
      description: newPhaseDescription.trim() || undefined
    })
    setNewPhaseTitle("")
    setNewPhaseCategory("")
    setNewPhaseDescription("")
    setIsAddingPhase(false)
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border/70 bg-card/60 p-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search topics, executable tasks, categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs bg-background"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <div className="flex items-center rounded-lg border border-border bg-muted/40 p-1 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                statusFilter === "all" ? "bg-background text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Phases
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("in_progress")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                statusFilter === "in_progress" ? "bg-background text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              In Progress
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("completed")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                statusFilter === "completed" ? "bg-background text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Completed
            </button>
          </div>

          <Button
            size="sm"
            onClick={() => setIsAddingPhase(true)}
            className="h-9 gap-1.5 text-xs font-semibold"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Add Phase</span>
          </Button>
        </div>
      </div>

      {/* Inline Add Phase Form */}
      {isAddingPhase && (
        <div className="flex flex-col gap-3 rounded-2xl border border-primary/40 bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
            <Layers className="size-4" />
            <span>Create New Phase / Category Module</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              placeholder="Phase Title (e.g. Phase 4: Dynamic Programming & Graphs)"
              value={newPhaseTitle}
              onChange={(e) => setNewPhaseTitle(e.target.value)}
              className="h-9 text-xs"
              autoFocus
            />
            <Input
              placeholder="Category Tag (e.g. DS & Algo)"
              value={newPhaseCategory}
              onChange={(e) => setNewPhaseCategory(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
          <Input
            placeholder="Phase Description (Optional focus area...)"
            value={newPhaseDescription}
            onChange={(e) => setNewPhaseDescription(e.target.value)}
            className="h-9 text-xs"
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setIsAddingPhase(false)} className="h-8 text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreatePhase} disabled={!newPhaseTitle.trim()} className="h-8 text-xs">
              Add Phase Module
            </Button>
          </div>
        </div>
      )}

      {/* Phase Timeline List */}
      <Timeline defaultValue={1}>
        {project.phases
          .filter((phase) => {
            if (statusFilter === "completed") return phase.status === "completed"
            if (statusFilter === "in_progress") return phase.status === "active"
            return true
          })
          .map((phase, index) => {
            // Filter tasks inside phase by searchQuery
            const filteredTasks = phase.tasks.filter((t) => {
              if (!searchQuery) return true
              const q = searchQuery.toLowerCase()
              return (
                t.title.toLowerCase().includes(q) ||
                t.description?.toLowerCase().includes(q) ||
                t.category?.toLowerCase().includes(q)
              )
            })

            const totalTasks = phase.tasks.length
            const finishedTasks = phase.tasks.filter((t) => t.status === "completed").length
            const ongoingTasks = phase.tasks.filter((t) => t.status === "in_progress" || t.status === "pending").length
            const progress = totalTasks > 0 ? Math.round((finishedTasks / totalTasks) * 100) : 0
            const isCompleted = finishedTasks > 0 && finishedTasks === totalTasks

            return (
              <TimelineItem key={phase.id} step={index + 1} className="ms-8 pb-8">
                <TimelineHeader>
                  <TimelineSeparator className="group-data-[orientation=vertical]/timeline:-left-6 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=vertical]/timeline:translate-y-7" />
                  <div className="flex items-center gap-2">
                    <TimelineTitle className="text-base font-bold text-foreground">
                      {phase.title}
                    </TimelineTitle>
                    {phase.category && (
                      <Badge variant="outline" className="text-[10px] px-2 py-0">
                        {phase.category}
                      </Badge>
                    )}
                    <Badge
                      variant={isCompleted ? "success-light" : progress > 0 ? "info-light" : "warning-light"}
                      size="sm"
                    >
                      {isCompleted ? "Completed" : `${progress}% Done`}
                    </Badge>
                  </div>

                  <TimelineIndicator
                    className={cn(
                      "flex size-6 items-center justify-center border-none bg-muted text-muted-foreground group-data-completed/timeline-item:bg-primary group-data-completed/timeline-item:text-primary-foreground group-data-[orientation=vertical]/timeline:-left-6",
                      progress > 0 && !isCompleted && "ring-2 ring-primary/20 bg-primary/80 text-primary-foreground"
                    )}
                  >
                    {isCompleted ? <CheckIcon className="size-3.5" /> : <CircleIcon className="size-3.5" />}
                  </TimelineIndicator>
                </TimelineHeader>

                <TimelineContent className="mt-3 overflow-hidden rounded-2xl border border-border/80 shadow-sm">
                  <Frame stacked dense spacing="sm">
                    <Collapsible defaultOpen className="group/collapsible overflow-hidden">
                      <CollapsibleTrigger className="flex w-full text-left">
                        <FrameHeader className="flex grow flex-col gap-3 px-5 py-4 hover:bg-muted/20 transition-colors">
                          <div className="flex w-full items-center gap-4">
                            <div className="flex-1">
                              <Progress value={progress} className="h-2" />
                            </div>
                            <ChevronRightIcon className="size-4 shrink-0 cursor-pointer text-muted-foreground transition-transform duration-200 group-data-open/collapsible:rotate-90 hover:text-foreground" />
                          </div>

                          <div className="flex w-full flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <ListTodoIcon className="size-3.5" />
                                <span>{totalTasks} Executable Tasks</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-amber-500">
                                <CircleDashedIcon className="size-3.5" />
                                <span>{ongoingTasks} Remaining</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-emerald-500">
                                <CheckCircle2Icon className="size-3.5" />
                                <span>{finishedTasks} Finished</span>
                              </div>
                            </div>

                            {phase.startDate && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                                <CalendarIcon className="size-3.5" />
                                <span>
                                  {phase.startDate} {phase.endDate ? `- ${phase.endDate}` : ""}
                                </span>
                              </div>
                            )}
                          </div>
                        </FrameHeader>
                      </CollapsibleTrigger>

                      <CollapsibleContent className="overflow-hidden px-4 pb-4 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                        {phase.description && (
                          <p className="mt-2 px-1 text-xs text-muted-foreground italic">
                            {phase.description}
                          </p>
                        )}
                        <ProjectTasks
                          projectId={project.id}
                          phaseId={phase.id}
                          tasks={filteredTasks}
                          onToggleTask={onToggleTask}
                          onAddNote={onAddNote}
                          onAddTask={onAddTask}
                        />
                      </CollapsibleContent>
                    </Collapsible>
                  </Frame>
                </TimelineContent>
              </TimelineItem>
            )
          })}

        {project.phases.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            No phases found in this project. Click "Add Phase" above to create your first module.
          </div>
        )}
      </Timeline>
    </div>
  )
}
