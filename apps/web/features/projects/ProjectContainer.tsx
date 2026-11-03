"use client"

import { ProjectPhases } from "@workspace/ui/components/project-phases"
import {
  useGetProjectQuery,
  usePatchTaskMutation,
  usePostTaskMutation,
  usePostNoteMutation,
  usePostPhaseMutation,
} from "./projects.api"
import { useAuth } from "@clerk/nextjs"

export function ProjectPhasesContainer({
  projectId,
}: {
  projectId: string
}): JSX.Element {
  const { isLoaded, isSignedIn } = useAuth()
  const { data: project, isLoading } = useGetProjectQuery(projectId, {
    skip: !isLoaded || !isSignedIn || !projectId,
  })

  const [patchTask] = usePatchTaskMutation()
  const [postTask] = usePostTaskMutation()
  const [postNote] = usePostNoteMutation()
  const [postPhase] = usePostPhaseMutation()

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading phases…</p>
  if (!project) return <p className="text-sm text-muted-foreground">Project not found</p>

  return (
    <ProjectPhases
      project={project}
      handleCreateTask={({ projectId, phaseId, addTaskInput }) =>
        postTask({ projectId, phaseId, body: addTaskInput }).unwrap()
      }
      handleCreateNote={({ projectId, phaseId, taskId, addNoteInput }) =>
        postNote({ projectId, phaseId, taskId, body: addNoteInput }).unwrap()
      }
      onToggleTask={(projectId, phaseId, taskId, status) => {
        void patchTask({
          projectId,
          phaseId,
          taskId,
          body: { status },
        })
      }}
      onAddNote={(projectId, phaseId, taskId, text) => {
        void postNote({
          projectId,
          phaseId,
          taskId,
          body: { text },
        })
      }}
      onAddTask={() => {}}
      onAddPhase={(id, phase) => {
        void postPhase({ projectId: id, body: phase })
      }}
    />
  )
}
