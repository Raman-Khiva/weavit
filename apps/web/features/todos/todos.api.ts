import { api } from "@/services/api";
import type { components } from "@weavit/api-types";



type TODO = components["schemas"]["Todo"];
type CreateTodoInput = components["schemas"]["CreateTodoInput"];

export const todosApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getTodos: builder.query<TODO[], void>({
            query: () => "/todos",
            providesTags: ["Todos"],
        })
        ,
        postTodo: builder.mutation<TODO, CreateTodoInput>({
            query: (body) => ({
                url: "/todos",
                method: "POST",
                body
            })
            , invalidatesTags: ["Todos"]
        })
    })


})


export const { useGetTodosQuery, usePostTodoMutation } = todosApi;