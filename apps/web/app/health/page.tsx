
'use client'

import { useGetHealthQuery } from "@/services/health/healthApi"
import { stringify } from "querystring";



function Page(): JSX.Element {
    const {data,isLoading,isError,error} = useGetHealthQuery();

    if(isLoading){
        return (
            <div><h2>Please wait, Loading......</h2></div>
        )
    }
    else if(isError){
        console.error('Error while fetching health', error);
        return (
            <div><h2>Error while fetching health </h2></div>
        )
    }
  return (
    <div>
        <h1>Health fetched successfully. <br/> status : {data.status} <br/> health : {data.health} </h1>
    </div>
  )
}

export default Page