"use client"

import { ProjectCard } from "@workspace/ui/components/project-card"
import { useProjectsStore, Project } from "@workspace/ui/lib/projects-store"
import { FolderOpen, ArrowRight, Info } from "lucide-react"

export const Projects = () => {
  const { projects } = useProjectsStore()
  const displayProjects = projects.slice(0, 3)

  return (
    <main className="h-full w-full flex flex-col justify-between">
      <div className="pb-2 border-b border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen className="size-4 text-primary" />
          <h2 className="text-base font-bold text-foreground">Active Plans & Roadmaps</h2>
          <div className="group relative flex items-center justify-center">
            <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
            <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-6 opacity-0 group-hover:opacity-100 transition-opacity z-50 rounded-md bg-popover border border-border px-2.5 py-1 text-[10px] text-popover-foreground shadow-xl whitespace-nowrap">
              Active engineering roadmaps, milestone tracking & plans
            </div>
          </div>
        </div>
        <a
          href="/workspace/projects"
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          <span>View all ({projects.length})</span>
          <ArrowRight size={12} />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full flex-1">
        {displayProjects.map((project: Project) => (
          <a
            key={project.id}
            href={`/workspace/projects/${project.id}`}
            className="block h-full min-w-0"
          >
            <ProjectCard project={project} showDescription={false} />
          </a>
        ))}
        {displayProjects.length === 0 && (
          <div className="col-span-3 flex items-center justify-center rounded-xl border border-dashed p-6 text-xs text-muted-foreground">
            No active roadmaps found. Navigate to Projects to create one.
          </div>
        )}
      </div>
    </main>
  )
}
