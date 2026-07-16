import { ProjectCard } from "@workspace/ui/components/project-card"

const ALL_PROJECTS = [
  { title: "Project Alpha", description: "A major initiative for Q3.", date: "Oct 24", id: "project-alpha" },
  { title: "Project Beta", description: "Internal tools and infrastructure.", date: "Nov 12", id: "project-beta" },
  { title: "Project Gamma", description: "Marketing campaign for new launch.", date: "Dec 05", id: "project-gamma" },
  { title: "Project Delta", description: "User research and discovery.", date: "Jan 15", id: "project-delta" },
  { title: "Project Epsilon", description: "Data analytics pipeline.", date: "Feb 28", id: "project-epsilon" },
]

const Page = () => {
  return (
    <div className="flex h-full w-full flex-col gap-6 p-8">
      <h1 className="text-3xl font-bold">All Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {ALL_PROJECTS.map((project) => (
          <a key={project.id} href={`/workspace/projects/${project.id}`} className="block">
            <ProjectCard
              title={project.title}
              description={project.description}
              date={project.date}
            />
          </a>
        ))}
      </div>
    </div>
  )
}

export default Page
