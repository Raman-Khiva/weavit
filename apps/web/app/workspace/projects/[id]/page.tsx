"use client"

import { useParams, useRouter } from "next/navigation"
import { CategoryProgressHeader } from "@workspace/ui/components/category-progress-header"
import { Button } from "@workspace/ui/components/button"
import { ArrowLeft, Layers, AlertCircle } from "lucide-react"
import { SkeletonWrapper, ProjectDetailPageSkeleton } from "@workspace/ui/components/skeleton-wrapper"
import { useGetProjectQuery } from "@/features/projects/projects.api"
import { useAuth } from "@clerk/nextjs"
import { ProjectPhasesContainer } from "@/features/projects/ProjectContainer"

function Page(): JSX.Element {
  const params = useParams()
  const router = useRouter()
  const projectId = params?.id ? String(params.id) : ""

  const { isLoaded: loadingAuth, isSignedIn } = useAuth()

  const { data: realProject, isLoading, isError, isFetching } = useGetProjectQuery(
    projectId,
    {
      skip: !loadingAuth || !isSignedIn || !projectId || projectId.startsWith("demo-"),
    }
  )

  if (!loadingAuth || (isLoading && !realProject)) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <div className="flex animate-pulse items-center gap-2 text-sm text-muted-foreground">
          <Layers className="size-5" />
          <span>Loading roadmap & plan data...</span>
        </div>
      </div>
    )
  }

  if (projectId.startsWith("demo-") || isError || (!realProject && !isFetching)) {
    return (
      <main className="flex h-full w-full flex-col items-center justify-center gap-4 p-12 text-center">
        <div className="rounded-full bg-amber-500/10 p-3 text-amber-500">
          <AlertCircle className="size-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Roadmap Plan Not Found</h2>
        <p className="max-w-sm text-xs text-muted-foreground">
          The requested plan ID &quot;{projectId}&quot; does not exist or was removed.
        </p>
        <Button
          onClick={() => router.push("/workspace/projects")}
          className="gap-2 text-xs"
        >
          <ArrowLeft className="size-4" />
          <span>Back to All Roadmaps</span>
        </Button>
      </main>
    )
  }

  if (!realProject) {
    return <ProjectDetailPageSkeleton />
  }

  return (
    <SkeletonWrapper skeleton={<ProjectDetailPageSkeleton />} delay={400}>
      <main className="mx-auto flex h-full w-full max-w-7xl flex-col gap-8 px-6 py-8 md:px-12 md:py-10">
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

        <CategoryProgressHeader project={realProject} />

        <div className="w-full">
          <ProjectPhasesContainer projectId={projectId} />
        </div>
      </main>
    </SkeletonWrapper>
  )
}

export default Page
