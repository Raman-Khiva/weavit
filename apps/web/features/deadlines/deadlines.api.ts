import { api } from "@/services/api";
import { components } from "@weavit/api-types";


type DEADLINE = components["schemas"]["Deadline"];
type PostDeadlineInput = components["schemas"]["CreateDeadlineInput"];
type UpdateDeadlineInput = components["schemas"]["UpdateDeadlineInput"];

export const deadlinesApi = api.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        getDeadlines: builder.query<DEADLINE[], void>({
            query: () => "/deadlines",
            providesTags: ["Deadlines"]
        }),
        postDeadline: builder.mutation<DEADLINE, PostDeadlineInput>({
            query: (body) => ({
                url: "/deadlines",
                method: "POST",
                body
            }),
            invalidatesTags: ["Deadlines"]
        }),
        patchDeadline: builder.mutation<
            DEADLINE,
            { id: string; body: UpdateDeadlineInput }
        >({
            query: ({ id, body }) => ({
                url: `/deadlines/${id}`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: ["Deadlines"],
        }),
    })
})


export const {
  useGetDeadlinesQuery,
  usePostDeadlineMutation,
  usePatchDeadlineMutation,
} = deadlinesApi;
