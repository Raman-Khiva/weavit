'use client'
import {
  useGetDeadlinesQuery,
  usePostDeadlineMutation,
  usePatchDeadlineMutation,
} from "@/features/deadlines/deadlines.api"
import { useAuth } from "@clerk/nextjs"
import { DetailedCalendar } from "@workspace/ui/components/detailed-calendar"
import { SkeletonWrapper, DeadlinesPageSkeleton } from "@workspace/ui/components/skeleton-wrapper"
import type { components } from "@weavit/api-types"

type DEADLINE = components["schemas"]["Deadline"]

const DEMO_DEADLINE: DEADLINE = {
  id: "demo-deadline",
  userId: "demo-user",
  title: "Demo: Math Quiz",
  dueDate: new Date().toISOString(),
  time: "14:00",
  priority: "HIGH",
  isCompleted: false,
  course: "Demo",
}

function Page(): JSX.Element {
  const { isLoaded, isSignedIn } = useAuth()
  const { data, isLoading, isError } = useGetDeadlinesQuery(undefined, {
    skip: !isLoaded || !isSignedIn,
  })
  const [postDeadline] = usePostDeadlineMutation()
  const [patchDeadline] = usePatchDeadlineMutation()

  const deadlines = [...(data ?? []), DEMO_DEADLINE]

  return (
    <SkeletonWrapper skeleton={<DeadlinesPageSkeleton />} delay={2000}>
      <div className="flex h-full w-full flex-col gap-8 px-16 py-8">
        <header>
          <h1 className="border-b border-foreground/80 pb-3 text-4xl font-bold">
            Deadlines
          </h1>
        </header>

        {isLoading ? (
          <h2>Please wait fetching deadlines</h2>
        ) : isError ? (
          <p className="text-sm text-muted-foreground">Couldn&apos;t load deadlines.</p>
        ) : (
          <DetailedCalendar
            deadlines={deadlines}
            onAdd={(fields) => {
              void postDeadline({
                title: fields.title,
                time: fields.time,
                dueDate: fields.dueDate,
                priority: "MEDIUM",
              })
            }}
            onToggle={(deadline) => {
              if (deadline.id.startsWith("demo-")) return
              void patchDeadline({
                id: deadline.id,
                body: { isCompleted: !deadline.isCompleted },
              })
            }}
          />
        )}
      </div>
    </SkeletonWrapper>
  )
}

export default Page
