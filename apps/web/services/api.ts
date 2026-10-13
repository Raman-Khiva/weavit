import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";



export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:4000",
        prepareHeaders: async (headers) => {
            const token = await window.Clerk?.session?.getToken();
            if (token) headers.set('Authorization', `Bearer ${token}`);
            return headers;
        }

    }),
    endpoints: () => ({})

})