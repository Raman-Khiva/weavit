"use client"

import { useMemo, useState } from "react"
import { ProjectCard } from "@workspace/ui/components/project-card"
import { CreateProjectDialog } from "@workspace/ui/components/create-project-dialog"
import { Input } from "@workspace/ui/components/input"
import { Search, FolderPlus } from "lucide-react"
import { SkeletonWrapper, ProjectsPageSkeleton } from "@workspace/ui/components/skeleton-wrapper"
import { useAuth } from "@clerk/nextjs"
import {
  useGetProjectsQuery,
  usePostProjectMutation,
} from "@/features/projects/projects.api"
import type { CreateProjectInput } from "@weavit/api-types"

function Page(): JSX.Element {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const { isLoaded, isSignedIn } = useAuth()
  const { data = [], isLoading, isError } = useGetProjectsQuery(undefined, {
    skip: !isLoaded || !isSignedIn,
  })
  const [postProject, { isLoading: isCreating }] = usePostProjectMutation()

  const categories = useMemo(
    () =>
      Array.from(
        new Set(data.map((p) => p.category).filter((c): c is string => Boolean(c)))
      ),
    [data]
  )

  const filteredProjects = useMemo(() => {
    const q = search.trim().toLowerCase()
    return data.filter((p) => {
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q) ||
        (p.category ?? "").toLowerCase().includes(q)
      const matchesCategory =
        selectedCategory === "all" || p.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [data, search, selectedCategory])

  const handleAddProject = async (input: CreateProjectInput) => {
    try {
      await postProject({
        title: input.title,
        description: input.description,
        category: input.category,
        icon: input.icon,
        startDate: input.startDate
          ? new Date(input.startDate).toISOString()
          : new Date().toISOString(),
      }).unwrap()
    } catch (err) {
      console.error("Failed to create project", err)
    }
  }

  return (
    <SkeletonWrapper skeleton={<ProjectsPageSkeleton />} delay={400}>
      <div className="mx-auto flex h-full w-full max-w-7xl flex-col gap-8 p-6 md:p-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs font-semibold tracking-wider text-primary uppercase">
              Structured Roadmap & Execution Engine
            </div>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Roadmaps & Plans
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Create multi-phase execution plans for SDE interview prep, software projects,
              and learning goals. Track topics with instant task completion and activity note
              logs.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <CreateProjectDialog onAddProject={handleAddProject} />
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card/60 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
            <Input
              placeholder="Search plans, SDE topics, software roadmaps..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                selectedCategory === "all"
                  ? "bg-primary font-bold text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              All Categories ({data.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-primary font-bold text-primary-foreground shadow-sm"
                    : "bg-muted/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading roadmaps…</p>
        ) : isError ? (
          <p className="text-sm text-destructive">Couldn&apos;t load roadmaps.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <a
                key={project.id}
                href={`/workspace/projects/${project.id}`}
                className="block h-full transition-transform hover:-translate-y-0.5"
              >
                <ProjectCard project={project} />
              </a>
            ))}
          </div>
        )}

        {!isLoading && !isError && filteredProjects.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center">
            <FolderPlus className="mb-3 size-10 text-muted-foreground/60" />
            <h3 className="text-base font-semibold text-foreground">No plans found</h3>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              {isCreating
                ? "Creating your plan…"
                : "Try adjusting your search criteria or create a new roadmap plan."}
            </p>
            <div className="mt-4">
              <CreateProjectDialog onAddProject={handleAddProject} />
            </div>
          </div>
        )}
      </div>
    </SkeletonWrapper>
  )
}

export default Page
