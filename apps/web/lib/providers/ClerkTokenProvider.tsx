"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { setGetTokenFn } from "@/services/api";

export function ClerkTokenProvider() {
    const { getToken, isLoaded, isSignedIn } = useAuth();

    useEffect(() => {

        const syncUser = async () =>{
           try{
             const token = await getToken();

            const response = await fetch('https://api.weavit.tech/syncUser',{
                method : 'POST',
                headers:{
                'Content-Type' : 'application/json',
                'Authorization' : `Bearer ${token}`
                }
            })


            //  if(!response.ok){
            //     alert("Login failed");
            // }else{
            //     alert("Logged In successfully");
            // }
           }catch(error){
               alert("Login Failed")
           }
        }

        if (isLoaded && isSignedIn) {
            setGetTokenFn(() => getToken());

            syncUser();
            

        } else {
            setGetTokenFn(async () => null);
        }

        return () => {
            setGetTokenFn(async () => null);
        };
    }, [getToken, isLoaded, isSignedIn]);

    return null;
}