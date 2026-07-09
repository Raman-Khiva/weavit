import { ProjectCard } from "@workspace/ui/components/project-card"

export const Projects = () => {
  return (
    <main className="h-full w-full">
      <h2 className="global-heading mb-3">Ongoing Projects</h2>
      <div className="flex w-full gap-3">
        <ProjectCard
          title="Project Alpha"
          description="A major initiative for Q3."
          date="Oct 24"
        />
        <ProjectCard
          title="Project Beta"
          description="Internal tools and infrastructure."
          date="Nov 12"
        />
      </div>
    </main>
  )
}
