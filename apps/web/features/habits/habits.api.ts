import { api } from "@/services/api";
import type { components } from "@weavit/api-types";

type Habit = components['schemas']['Habit'];

export const habitsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getHabits: builder.query<Habit[], void>({
            query: () => "/habits",
        })
    })
})


export const { useGetHabitsQuery } = habitsApi;