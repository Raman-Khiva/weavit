import { api } from "@/services/api";
import { components } from "@weavit/api-types";


type DEADLINE = components["schemas"]["Deadline"];
type PostDeadlineInput = components["schemas"]["CreateDeadlineInput"];

export const deadlinesApi = api.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        getDeadlines: builder.query({
            query: () => "/deadlines",
            providesTags: ["Deadlines"]
        }),
        postDeadline: builder.mutation({
            query: (body) => ({
                url: "/deadlines",
                method: "POST",
                body
            }),
            invalidatesTags: ["Deadlines"]
        })
    })
})


export const { useGetDeadlinesQuery, usePostDeadlineMutation } = deadlinesApi;