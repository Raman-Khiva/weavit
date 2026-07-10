"use client"
import { useParams } from "next/navigation"
const Page = () => {
  const { id } = useParams()
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold capitalize">{id}</h1>
      <p className="text-muted-foreground">
        Dynamic habit view for: <span className="font-semibold">{id}</span>
      </p>
    </div>
  )
}

export default Page
