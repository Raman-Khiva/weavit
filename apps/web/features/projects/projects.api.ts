import { api } from "@/services/api";
import { CreatePhaseInput, CreateProjectInput, CreateTaskInput, PHASE, PROJECT, TASK, TASK_LOG_NOTE } from "@weavit/api-types";



interface CreatePhaseProps {
    body?: CreatePhaseInput
    projectId?: string
}
interface CreateTaskProps {
    body?: CreateTaskInput
    projectId?: string
    phaseId?: string
}
interface CreateNoteProps {
    body?: CreateNoteProps
    projectId?: string
    phaseId?: string
    taskId?: string
}

export const projectsApi = api.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        getProjects: builder.query<PROJECT[], void>({
            query: () => "/projects",
            providesTags: ["Projects"]
        }),
        postProject: builder.mutation<PROJECT, CreateProjectInput>({
            query: (body) => ({
                url: "/projects",
                method: "POST",
                body
            }),
            invalidatesTags: ["Projects"]
        }),


        postPhase: builder.mutation<PHASE, CreatePhaseProps>({
            query: ({ body, projectId }) => ({
                url: `projects/${projectId}/phases`,
                method: "POST",
                body
            }),

            invalidatesTags: ["Projects"]
        })
        ,
        postTask: builder.mutation<TASK, CreateTaskProps>({
            query: (payload) => ({
                url: `/projects/${payload.projectId}/phases/${payload.phaseId}/tasks`,
                method: "POST",
                body: payload.body,
            }
            )
        }),

        postNote: builder.mutation<TASK_LOG_NOTE, CreateNoteProps>({
            query: (payload) => ({
                url: `/projects/${payload.projectId}/phases/${payload.phaseId}/tasks/${payload.taskId}/notes`,
                method: "POST",
                body: payload.body,
            }
            )
        })
    })
})


export const { useGetProjectsQuery, usePostProjectMutation, usePostPhaseMutation, usePostTaskMutation, usePostNoteMutation } = projectsApi;