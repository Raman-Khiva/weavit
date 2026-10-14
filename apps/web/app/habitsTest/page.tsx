"use client";

import { useAuth } from "@clerk/nextjs";
import { useGetHabitsQuery } from "@/features/habits/habits.api";

const Page = () => {
    const { getToken, isLoaded, isSignedIn } = useAuth();

    const {
        data,
        isLoading,
        isFetching,
        isError,
        error,
    } = useGetHabitsQuery(undefined, {
        skip: !isLoaded || !isSignedIn,
    });

    if (!isLoaded) {
        return <h2>Loading authentication...</h2>;
    }

    if (!isSignedIn) {
        return <h2>Please sign in to view your habits.</h2>;
    }

    if (isLoading || isFetching) {
        return <h2>Fetching habits...</h2>;
    }

    if (isError) {
        return (
            <div>
                <h2>Error while fetching habits data.</h2>
                <pre>{JSON.stringify(error, null, 2)}</pre>
            </div>
        );
    }

    return (
        <div>
            <h2>Data loaded successfully.</h2>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
};

export default Page;