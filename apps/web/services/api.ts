import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


let getTokenFn: (() => Promise<string | null>) | null = null

export const setGetTokenFn = (clerkGetter: () => Promise<string | null>) => {

    getTokenFn = clerkGetter;
    return;
}

export const getToken = () => {
    return getTokenFn ? getTokenFn() : null;
}




export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:4000",
        prepareHeaders: async (headers) => {

            if (getTokenFn) {

                try {
                    const token = await getTokenFn();
                    if (token) {
                        headers.set('Authorization', `Bearer ${token}`);
                    }
                } catch (error) {
                    console.error('Failed to retrieve Clerk token:', error);
                }
            }

            return headers;
        }

    }),
    tagTypes: ["Habit", "Todos"],
    endpoints: () => ({})

})