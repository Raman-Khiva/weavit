import { ProjectCard } from "@workspace/ui/components/project-card"
import Link from "next/link"

export const Projects = () => {
  return (
    <main className="h-full w-full">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="global-heading">Ongoing Projects</h2>
        <Link
          href="/workspace/projects"
          className="text-sm text-muted-foreground hover:underline"
        >
          View all
        </Link>
      </div>
      <div className="flex w-full gap-3">
        <Link href="/workspace/projects/project-alpha" className="block flex-1">
          <ProjectCard
            title="Project Alpha"
            description="A major initiative for Q3."
            date="Oct 24"
          />
        </Link>
        <Link href="/workspace/projects/project-beta" className="block flex-1">
          <ProjectCard
            title="Project Beta"
            description="Internal tools and infrastructure."
            date="Nov 12"
          />
        </Link>
      </div>
    </main>
  )
}
