// apps/web/features/projects/ProjectPhasesContainer.tsx
"use client"

import { ProjectPhases } from "@workspace/ui/components/project-phases"
import { CategoryProgressHeader } from "@workspace/ui/components/category-progress-header"
import {
  useGetProjectsQuery,
  usePatchTaskMutation,
  usePostTaskMutation,
  usePostNoteMutation,
  usePostPhaseMutation,
} from "./projects.api"
import { useAuth } from "@clerk/nextjs";
import { AlertAction } from "@workspace/ui/components/alert";

export function ProjectPhasesContainer({ projectId }: { projectId: string }) : JSX.Element{
    const {isLoaded, isSignedIn} = useAuth();
  const { data: projects, isLoading } = useGetProjectsQuery()
  const project = projects?.find((p) => p.id === projectId)

  const [patchTask,{isLoading : isPatchingTask}] = usePatchTaskMutation()
  const [postTask] = usePostTaskMutation()
  const [postNote] = usePostNoteMutation()
  const [postPhase] = usePostPhaseMutation()

  if (isLoading) return <p>Loading…</p>
  if (!project) return <p>Project not found</p>



  return (
    <>
      <CategoryProgressHeader project={project} />
      <ProjectPhases
        project={project}
        handleCreateTask={({ projectId, phaseId, addTaskInput }) =>
          postTask({ projectId, phaseId, body: addTaskInput }).unwrap()
        }
        handleCreateNote={({ projectId, phaseId, taskId, addNoteInput }) =>
          postNote({ projectId, phaseId, taskId, body: addNoteInput }).unwrap()
        }
        onToggleTask={(projectId,phaseId,taskId,status)=>{
          console.warn("On task toggle called");
           void patchTask({
            projectId,phaseId,taskId,body:{status},
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
        onAddPhase={(projectId, phase) => {
          void postPhase({ projectId, body: phase })
        }}
      />
    </>
  )
}