import { api } from "@/services/api";
import type { components } from "@weavit/api-types";

type Habit = components['schemas']['Habit'];
type CreateHabitInput = components['schemas']['CreateHabitInput']

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

        })
    })
})


export const { useGetHabitsQuery, usePostHabitMutation } = habitsApi;