import { api } from "@/services/api";
import { components } from "@weavit/api-types";


type PROJECT = components["schemas"]["Project"];
type CreateProjectInput = components["schemas"]["CreateProjectInput"]

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
        })
    })
})


export const { useGetProjectsQuery, usePostProjectMutation } = projectsApi;