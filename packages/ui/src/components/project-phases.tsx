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
  Search,
  Filter,
  Plus,
  Layers,
  Sparkles
} from "lucide-react";
import { ProjectTasks } from "@workspace/ui/components/project-tasks";
import { Progress } from "@workspace/ui/components/progress";
import { Project, ProjectPhase } from "@workspace/ui/lib/projects-store";
import { CreatePhaseInput, CreateTaskInput, CreateTaskNoteInput, PROJECT } from "@weavit/api-types";


interface ProjectPhasesProps {
  project: PROJECT
  handleCreateTask: (args: { projectId: string, phaseId: string, addTaskInput: CreateTaskInput }) => Promise<void>
  handleCreateNote: (args: { projectId: string, phaseId: string, taskId: string, addNoteInput: CreateTaskNoteInput }) => Promise<void>
  onToggleTask: (projectId: string, phaseId: string, taskId: string, noteText?: string) => void
  onAddNote: (projectId: string, phaseId: string, taskId: string, text: string) => void
  onAddTask: (projectId: string, phaseId: string, task: { title: string; description?: string; category?: string; priority?: "low" | "medium" | "high" }) => void
  onAddPhase: (projectId: string, phase: { title: string; description?: string; category?: string }) => void
}



export function ProjectPhases({
  project,
  handleCreateTask,
  handleCreateNote,
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
  const [addPhaseForm, updateAddPhaseForm] = useState<CreatePhaseInput>({
    title: "Test :  Phase",
    category: "Test : Phase category",
    description: "Test : Phase description",
  });

  //const {} = usePostPhaseMutation();

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
      {/* <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border/70 bg-card/60 p-3 shadow-sm">
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
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${statusFilter === "all" ? "bg-background text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
                }`}
            >
              All Phases
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("in_progress")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${statusFilter === "in_progress" ? "bg-background text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
                }`}
            >
              In Progress
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("completed")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${statusFilter === "completed" ? "bg-background text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
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

      // Inline Add Phase Form 

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
      )}    */}
      {/* Phase Timeline List */}
      <Timeline defaultValue={1}>
        {project?.phases?.filter((phase) => {
          if (statusFilter === "completed") return phase.status === "COMPLETED"
          if (statusFilter === "in_progress") return phase.status === "ACTIVE"
          return true
        })
          .map((phase, index) => {
            // Filter tasks inside phase by searchQuery
            const filteredTasks = phase?.tasks?.filter((t) => {
              if (!searchQuery) return true
              const q = searchQuery.toLowerCase()
              return (
                t.title.toLowerCase().includes(q) ||
                t.description?.toLowerCase().includes(q) ||
                t.category?.toLowerCase().includes(q)
              )
            })

            const totalTasks = phase?.tasks?.length ?? 0;
            const finishedTasks = phase?.tasks?.filter((t) => t.status === "COMPLETED")?.length ?? 0
            const ongoingTasks = phase.tasks?.filter((t) => t.status === "IN_PROGRESS" || t.status === "PENDING")?.length
            const progress = totalTasks > 0 ? Math.round((finishedTasks / totalTasks) * 100) : 0
            const isCompleted = finishedTasks > 0 && finishedTasks === totalTasks

            return (
              <TimelineItem key={phase.id} step={index + 1} className="ms-8 pb-10">
                <TimelineHeader>
                  <TimelineSeparator className="group-data-[orientation=vertical]/timeline:-left-6 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.75rem-0.25rem)] group-data-[orientation=vertical]/timeline:translate-y-8" />
                  <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 py-1">
                    <span className="font-mono text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-primary/15 text-primary border border-primary/25 shrink-0">
                      Phase {String(index + 1).padStart(2, "0")}
                    </span>

                    <TimelineTitle className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                      {phase.title}
                    </TimelineTitle>

                    {phase.category && (
                      <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 border-border/80 bg-card text-foreground/80 shadow-2xs">
                        {phase.category}
                      </Badge>
                    )}

                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs">
                          <CheckIcon className="size-3.5 stroke-[3]" /> Completed
                        </span>
                      ) : progress > 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-xs">
                          <span className="size-1.5 rounded-full bg-sky-400 animate-pulse" />
                          {progress}% Done
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-muted/80 text-muted-foreground border border-border">
                          0% Done
                        </span>
                      )}
                    </div>
                  </div>

                  <TimelineIndicator
                    className={cn(
                      "flex size-7 items-center justify-center border-none group-data-[orientation=vertical]/timeline:-left-6",
                      isCompleted
                        ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/25 ring-2 ring-emerald-500/30"
                        : progress > 0
                          ? "ring-4 ring-primary/20 bg-primary text-primary-foreground shadow-md"
                          : "bg-card border-2 border-border text-muted-foreground"
                    )}
                  >
                    {isCompleted ? <CheckIcon className="size-4 stroke-[3]" /> : <CircleIcon className="size-3.5 stroke-[2.5]" />}
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

                          <div className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                            <span>
                              <span className="font-semibold text-foreground">{totalTasks}</span> tasks
                            </span>
                            <span className="text-border">·</span>
                            <span className="text-amber-500/90">
                              {ongoingTasks} left
                            </span>
                            <span className="text-border">·</span>
                            <span className="text-emerald-500/90">
                              {finishedTasks} done
                            </span>
                          </div>
                        </FrameHeader>
                      </CollapsibleTrigger>

                      <CollapsibleContent className="overflow-hidden px-5 pb-5 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                        {phase.description && (
                          <p className="mt-2 px-1 text-base text-muted-foreground">
                            {phase.description}
                          </p>
                        )}
                        <ProjectTasks
                          projectId={project.id}
                          phaseId={phase.id}
                          tasks={filteredTasks ?? []}
                          handleCreateTask={handleCreateTask}
                          handleCreateNote={handleCreateNote}
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

        {project?.phases?.length === 0 && !isAddingPhase && (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            No phases yet. Add one below to get started.
          </div>
        )}
      </Timeline>

      <div className="ms-8 mt-2">
        {isAddingPhase ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-primary/40 bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Layers className="size-4" />
              <span>New phase</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                placeholder="Phase title"
                value={newPhaseTitle}
                onChange={(e) => setNewPhaseTitle(e.target.value)}
                className="h-10 text-sm"
                autoFocus
              />
              <Input
                placeholder="Category (optional)"
                value={newPhaseCategory}
                onChange={(e) => setNewPhaseCategory(e.target.value)}
                className="h-10 text-sm"
              />
            </div>
            <Input
              placeholder="Description (optional)"
              value={newPhaseDescription}
              onChange={(e) => setNewPhaseDescription(e.target.value)}
              className="h-10 text-sm"
            />
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsAddingPhase(false)
                  setNewPhaseTitle("")
                  setNewPhaseCategory("")
                  setNewPhaseDescription("")
                }}
                className="h-9 text-sm"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCreatePhase}
                disabled={!newPhaseTitle.trim()}
                className="h-9 text-sm"
              >
                Add phase
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingPhase(true)}
            className="h-14 w-full justify-center gap-2 border-dashed text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground"
          >
            <Plus className="size-4" />
            <span>Add phase</span>
          </Button>
        )}
      </div>
    </div>
  )
}
