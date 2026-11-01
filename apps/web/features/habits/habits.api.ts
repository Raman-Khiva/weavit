import { api } from "@/services/api";
import { HABIT_LOG,CreateHabitLogInput } from "@weavit/api-contract";
import type { components } from "@weavit/api-types";

type Habit = components['schemas']['Habit'];
type CreateHabitInput = components['schemas']['CreateHabitInput']


interface CreateHabitLogProps{
    habitId : string,
    body : CreateHabitLogInput
}

export const habitsApi = api.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        getHabits: builder.query<Habit[], void>({
            query: () => "/habits",
            providesTags: ["Habit"],
        })
        ,
        postHabit: builder.mutation<Habit, CreateHabitInput>({
            query: (body) => ({
                url: "/habits",
                method: "POST"
                , body
            }),

            invalidatesTags: ["Habit"],

        }),
        toggleHabit: builder.mutation<Habit, string>({
            query: (habitId) => ({
                url: `/habits/${habitId}/toggle`,
                method: "POST",
            }),
            invalidatesTags: ["Habit"],
        }),
        postHabitLog : builder.mutation<HABIT_LOG, CreateHabitLogProps>({
            query : (payload)=>({
                url : `/habits/${payload.habitId}/logs`,
                method : "POST",
                body : payload.body
            })
            ,invalidatesTags : ["Habit"]
        })
    })
})


export const {
  useGetHabitsQuery,
  usePostHabitMutation,
  useToggleHabitMutation,
  usePostHabitLogMutation,
} = habitsApi;