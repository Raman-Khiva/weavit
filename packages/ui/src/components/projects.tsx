import { ProjectCard } from "@workspace/ui/components/project-card"

export const Projects = () => {
  return (
    <main className="h-full w-full">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="global-heading">Ongoing Projects</h2>
        <a
          href="/workspace/projects"
          className="text-sm text-muted-foreground hover:underline"
        >
          View all
        </a>
      </div>
      <div className="flex w-full gap-3">
        <a href="/workspace/projects/project-alpha" className="block flex-1">
          <ProjectCard
            title="Project Alpha"
            description="A major initiative for Q3."
            date="Oct 24"
          />
        </a>
        <a href="/workspace/projects/project-beta" className="block flex-1">
          <ProjectCard
            title="Project Beta"
            description="Internal tools and infrastructure."
            date="Nov 12"
          />
        </a>
        <a href="/workspace/projects/project-gamma" className="block flex-1">
          <ProjectCard
            title="Project Gamma"
            description="A major initiative for Q3."
            date="Oct 24"
          />
        </a>
      </div>
    </main>
  )
}
