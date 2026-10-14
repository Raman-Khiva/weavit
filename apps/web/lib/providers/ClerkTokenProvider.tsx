"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { setGetTokenFn } from "@/services/api";

export function ClerkTokenProvider() {
    const { getToken, isLoaded, isSignedIn } = useAuth();

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            setGetTokenFn(() => getToken());
        } else {
            setGetTokenFn(async () => null);
        }

        return () => {
            setGetTokenFn(async () => null);
        };
    }, [getToken, isLoaded, isSignedIn]);

    return null;
}