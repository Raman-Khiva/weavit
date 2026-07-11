"use client"
import { useParams } from "next/navigation"
import { CalendarIcon } from "lucide-react"
import { ProjectTasks } from "@workspace/ui/components/project-tasks"
import { ProjectPhases } from "@workspace/ui/components/project-phases"

const Page = () => {
  const { id } = useParams()
  return (
    <main className="flex h-full w-full justify-between gap-4 px-20 py-14">
      <div className="flex w-full flex-col gap-16">
        <header className="flex flex-col gap-3">
          <h1 className="border-b border-secondary-foreground/60 pb-4 text-5xl font-bold text-secondary-foreground/90 capitalize">
            {id}
          </h1>
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-secondary-foreground/80">
              <CalendarIcon className="size-4 text-foreground" />
              <span className="mt-1">Oct 12, 2026 - Nov 30, 2026</span>
            </div>
            <p className="text-lg text-muted-foreground">
              This is a comprehensive overview of the{" "}
              {id?.toString().replace(/-/g, " ")} project. It covers all phases
              from initial checkout to the final production build, ensuring code
              quality and rapid delivery.
            </p>
          </div>
        </header>
        <div>
          <ProjectPhases />
        </div>
      </div>
      <div></div>
    </main>
  )
}

export default Page
