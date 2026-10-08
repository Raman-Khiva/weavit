"use client"

import { useParams, useRouter } from "next/navigation"
import { useProjectsStore } from "@workspace/ui/lib/projects-store"
import { CategoryProgressHeader } from "@workspace/ui/components/category-progress-header"
import { ProjectPhases } from "@workspace/ui/components/project-phases"
import { Button } from "@workspace/ui/components/button"
import { ArrowLeft, Layers, AlertCircle } from "lucide-react"

const Page = () => {
  const params = useParams()
  const router = useRouter()
  const projectId = params?.id ? String(params.id) : ""

  const {
    projects,
    isLoaded,
    getProject,
    toggleTaskStatus,
    addTaskNote,
    addTaskToPhase,
    addPhaseToProject
  } = useProjectsStore()

  const project = getProject(projectId)

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

  if (!project) {
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
      <CategoryProgressHeader project={project} />

      {/* Phase & Task Timeline System */}
      <div className="w-full">
        <ProjectPhases
          project={project}
          onToggleTask={toggleTaskStatus}
          onAddNote={addTaskNote}
          onAddTask={addTaskToPhase}
          onAddPhase={addPhaseToProject}
        />
      </div>
    </main>
  )
}

export default Page
