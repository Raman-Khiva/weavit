'use client'
import { useGetDeadlinesQuery } from "@/features/deadlines/deadlines.api"
import { useAuth } from "@clerk/nextjs";
import { DetailedCalendar } from "@workspace/ui/components/detailed-calendar"

function Page(): JSX.Element {

  const { isLoaded, isSignedIn } = useAuth();

  const { data: deadlines, isLoading, isError } = useGetDeadlinesQuery(undefined, { skip: !isLoaded || !isSignedIn });


  return (
    <div className="flex h-full w-full flex-col gap-8 px-16 py-8">
      <header>
        <h1 className="border-b border-foreground/80 pb-3 text-4xl font-bold">
          Deadlines
        </h1>
      </header>

      {isLoading ? (<h2>Please wait fetching deadlines</h2>) : ((!isError) && (
        <div>
          <DetailedCalendar deadlines={deadlines ?? []} />
        </div>)
      )}
    </div>
  )
}

export default Page
