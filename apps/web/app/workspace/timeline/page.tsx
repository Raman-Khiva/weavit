import { AgendaTimeline } from "@workspace/ui/components/agenda-timeline"
import { SkeletonWrapper, TimelinePageSkeleton } from "@workspace/ui/components/skeleton-wrapper"

function Page(): JSX.Element {
  return (
    <SkeletonWrapper skeleton={<TimelinePageSkeleton />} delay={2000}>
      <div className="flex h-full w-full flex-col px-10 py-12">
        <AgendaTimeline />
      </div>
    </SkeletonWrapper>
  )
}

export default Page
