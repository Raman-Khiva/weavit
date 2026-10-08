"use client"

import { useState } from "react"
import { ProjectCard } from "@workspace/ui/components/project-card"
import { CreateProjectDialog } from "@workspace/ui/components/create-project-dialog"
import { useProjectsStore } from "@workspace/ui/lib/projects-store"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Search, Sparkles, RefreshCw, FolderPlus } from "lucide-react"

const Page = () => {
  const { projects, addProject, resetToDefault } = useProjectsStore()
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const categories = Array.from(new Set(projects.map((p) => p.category)))

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="flex h-full w-full flex-col gap-8 p-6 md:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="size-4" />
            <span>Structured Roadmap & Execution Engine</span>
          </div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Roadmaps & Plans
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Create multi-phase execution plans for SDE interview prep, software projects, and learning goals. Track topics with instant task completion and activity note logs.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefault}
            title="Reset to default templates"
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="size-3.5" />
            <span>Reset Templates</span>
          </Button>

          <CreateProjectDialog onAddProject={addProject} />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border/80 bg-card/60 p-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search plans, SDE topics, software roadmaps..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              selectedCategory === "all"
                ? "bg-primary text-primary-foreground font-bold shadow-sm"
                : "bg-muted/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            All Categories ({projects.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {filteredProjects.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center">
          <FolderPlus className="size-10 text-muted-foreground/60 mb-3" />
          <h3 className="text-base font-semibold text-foreground">No plans found</h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm">
            Try adjusting your search criteria or create a new roadmap plan using the templates above.
          </p>
          <div className="mt-4">
            <CreateProjectDialog onAddProject={addProject} />
          </div>
        </div>
      )}
    </div>
  )
}

export default Page
