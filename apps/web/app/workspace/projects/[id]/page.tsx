"use client"

import { useParams, useRouter } from "next/navigation"
import { useProjectsStore } from "@workspace/ui/lib/projects-store"
import { CategoryProgressHeader } from "@workspace/ui/components/category-progress-header"
import { ProjectPhases } from "@workspace/ui/components/project-phases"
import { Button } from "@workspace/ui/components/button"
import { ArrowLeft, Layers, AlertCircle, Search, Plus } from "lucide-react"
import { SkeletonWrapper, ProjectDetailPageSkeleton } from "@workspace/ui/components/skeleton-wrapper"
import { useGetProjectsQuery, usePostNoteMutation, usePostPhaseMutation, usePostTaskMutation } from "@/features/projects/projects.api"
import { useAuth } from "@clerk/nextjs"
import { Input } from "@workspace/ui/components/input"
import { useState } from "react"
import { CreatePhaseInput, CreateTaskInput, CreateTaskNoteInput } from "@weavit/api-types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog"
import { Label } from "@workspace/ui/components/label"
import { RadioGroup } from "@workspace/ui/components/radio-group"
import { ProjectPhasesContainer } from "@/features/projects/ProjectContainer"


type AddPhaseInput = CreatePhaseInput;




function Page(): JSX.Element {
  const params = useParams()
  const router = useRouter()
  const projectId = params?.id ? String(params.id) : ""

  const { isLoaded: loadingAuth, isSignedIn } = useAuth();

  const { data: realProjects, isLoading, isError } = useGetProjectsQuery(undefined, { skip: !loadingAuth || !isSignedIn });

  const [postPhase, { isLoading: isPostingPhase, isError: isErrorPostingPhase }] = usePostPhaseMutation();

  const [statusFilter, setStatusFilter] = useState<"all" | "in_progress" | "completed">("all")
  const [addPhaseForm, updateAddPhaseForm] = useState<AddPhaseInput>({
    title: "Test :  Phase",
    category: "Test : Phase category",
    description: "Test : Phase description",
  });

  const [isOpen, setIsOpen] = useState<boolean>(false);




  const [postTask, { isLoading: isPostingTask, isError: isErrorPostingTask }] = usePostTaskMutation();
  const [postNote, { isLoading: isPostingNote, isError: isErrorPostingNote }] = usePostNoteMutation();





  const {
    projects,
    isLoaded,
    getProject,
    toggleTaskStatus,
    addTaskNote,
    addTaskToPhase,
    addPhaseToProject
  } = useProjectsStore()







  const handleCreatePhase = async () => {


    if (!addPhaseForm.title.trim()) {
      alert("Title is reqiured");
      return;
    }

    const postedPhase = await postPhase({ body: addPhaseForm, projectId }).unwrap();
    if (!isPostingPhase && !isErrorPostingPhase) {
      alert(`Phase posted succesfully : ${JSON.stringify(postedPhase)}`);
    }

  }





  const handleCreateTask = async ({ projectId, phaseId, addTaskInput }: { projectId: string, phaseId: string, addTaskInput: CreateTaskInput }) => {


    if (!addTaskInput.title.trim()) {
      alert("Title is reqiured");
      return;
    }
    const postedTask = await postTask({ body: addTaskInput, projectId, phaseId }).unwrap();
    if (!isPostingTask && !isErrorPostingTask) {
      alert(`Task posted succesfully : ${JSON.stringify(postedTask)}`);
    }

  }





  const handleCreateNote = async ({ projectId, phaseId, taskId, addNoteInput }: { projectId: string, phaseId: string, taskId: string, addNoteInput: CreateTaskNoteInput }) => {


    if (!addNoteInput.text.trim()) {
      alert("Title is reqiured");
      return;
    }

    const postedNote = await postNote({ body: addNoteInput, projectId, phaseId, taskId }).unwrap();
    if (!isPostingNote && !isErrorPostingNote) {
      alert(`Phase posted succesfully : ${JSON.stringify(postedNote)}`);
    }

    return;

  }





  if (isLoading) {
    return (<h1>Please wait loading projects...</h1>)
  }

  const project = getProject(projectId)
  const realProject = realProjects?.find((project) => (project.id == projectId));

  if (!isLoaded) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
          <Layers className="size-5" />
          <span>Loading roadmap & plan data...</span>
        </div>
      </div>
    )
  }





  if ((!project) && (!realProject)) {
    return (
      <main className="flex h-full w-full flex-col items-center justify-center gap-4 p-12 text-center">
        <div className="rounded-full bg-amber-500/10 p-3 text-amber-500">
          <AlertCircle className="size-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Roadmap Plan Not Found</h2>
        <p className="text-xs text-muted-foreground max-w-sm">
          The requested plan ID "{projectId}" does not exist or was removed.
        </p>
        <Button onClick={() => router.push("/workspace/projects")} className="gap-2 text-xs">
          <ArrowLeft className="size-4" />
          <span>Back to All Roadmaps</span>
        </Button>
      </main>
    )
  }





  return (
    <SkeletonWrapper skeleton={<ProjectDetailPageSkeleton />} delay={2000}>
      <main className="flex h-full w-full flex-col gap-8 px-6 py-8 md:px-12 md:py-10 max-w-7xl mx-auto">
        {/* Top Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/workspace/projects")}
            className="gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            <span>Back to All Roadmaps</span>
          </Button>
        </div>

        {/* Category Mastery Progress Header */}
        {realProject &&
          <CategoryProgressHeader project={realProject} />
        }


        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border/70 bg-card/60 p-3 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search topics, executable tasks, categories..."
              className="pl-9 h-9 text-xs bg-background"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <div className="flex items-center rounded-lg border border-border bg-muted/40 p-1 text-xs">
              <button
                type="button"
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${statusFilter === "all" ? "bg-background text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                All Phases
              </button>
              <button
                type="button"
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
              className="h-9 gap-1.5 text-xs font-semibold"
              onClick={() => setIsOpen(true)}
              disabled={isPostingPhase}
            >
              <Plus className="size-4" />
              <span className="hidden sm:inline">Add Phase</span>
            </Button>
          </div>
        </div>
        {isOpen && (
          <div className="flex flex-col gap-3 rounded-2xl border border-primary/40 bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
              <Layers className="size-4" />
              <span>Create New Phase / Category Module</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                placeholder="Phase Title (e.g. Phase 4: Dynamic Programming & Graphs)"
                value={addPhaseForm.title}
                onChange={(e) => updateAddPhaseForm((state) => ({ ...state, title: e.target.value.trim() ? e.target.value : state.title }))}
                className="h-9 text-xs"
                autoFocus
              />
              <Input
                placeholder="Category Tag (e.g. DS & Algo)"
                value={addPhaseForm.category}

                onChange={(e) => updateAddPhaseForm((state) => ({ ...state, category: e.target.value }))}
                className="h-9 text-xs"
              />
            </div>
            <Input
              placeholder="Phase Description (Optional focus area...)"
              value={addPhaseForm.description}
              onChange={(e) => updateAddPhaseForm((state) => ({ ...state, description: e.target.value }))}
              className="h-9 text-xs"
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setIsOpen(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreatePhase} disabled={isPostingPhase} className="h-8 text-xs">
                Add Phase Module
              </Button>
            </div>
          </div>
        )}



        {/*       <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="h-8 rounded-md px-3 text-xs font-semibold">
              <Plus className="mr-1 size-3.5" /> New Ritual
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border bg-popover text-popover-foreground">
            <DialogHeader>
              <DialogTitle>Add New Habit</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreatePhase} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="habit-title">Habit Name</Label>
                <Input
                  id="habit-title"
                  className="border-input bg-background"
                  placeholder="e.g. Drink Water"
                  value={addPhaseForm.title}
                  onChange={(event) =>
                    updateAddPhaseForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="habit-category">Category</Label>
                <Input
                  id="habit-category"
                  className="border-input bg-background"
                  placeholder="e.g. Health"
                  value={addPhaseForm.category ?? ""}
                  onChange={(event) =>
                    updateAddPhaseForm((prev) => ({ ...prev, category: event.target.value }))
                  }
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isPostingPhase}
              >
                {isPostingPhase ? "Saving..." : "Add Phase"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        */}


        {/* Phase & Task Timeline System */}
        <div className="w-full">
          {realProject &&(
           <ProjectPhasesContainer projectId={projectId}/>
            // <ProjectPhases

            //   project={realProject}
            //   handleCreateTask={handleCreateTask}
            //   handleCreateNote={handleCreateNote}
            //   onToggleTask={toggleTaskStatus}
            //   onAddNote={addTaskNote}
            //   onAddTask={addTaskToPhase}
            //   onAddPhase={addPhaseToProject}/>
          )}
        </div>
      </main>
    </SkeletonWrapper>
  )
}

export default Page;