import { api } from "@/services/api";
import type { components } from "@weavit/api-types";



type TODO = components["schemas"]["Todo"];
type CreateTodoInput = components["schemas"]["CreateTodoInput"];
type UpdateTodoInput = components["schemas"]["UpdateTodoInput"];

export const todosApi = api.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        getTodos: builder.query<TODO[], void>({
            query: () => "/todos",
            providesTags: ["Todos"],
        }),
        postTodo: builder.mutation<TODO, CreateTodoInput>({
            query: (body) => ({
                url: "/todos",
                method: "POST",
                body
            }),
            invalidatesTags: ["Todos"]
        }),
        patchTodo: builder.mutation<TODO, { id: string; body: UpdateTodoInput }>({
            query: ({ id, body }) => ({
                url: `/todos/${id}`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: ["Todos"],
        }),
        deleteTodo: builder.mutation<void, string>({
            query: (id) => ({
                url: `/todos/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Todos"],
        }),
    })
})


export const {
  useGetTodosQuery,
  usePostTodoMutation,
  usePatchTodoMutation,
  useDeleteTodoMutation,
} = todosApi;
