import { ProjectCard } from "@workspace/ui/components/project-card"

export const Projects = () => {
  return (
    <main className="flex gap-4 p-4 flex-wrap">
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
    </main>
  )
}
