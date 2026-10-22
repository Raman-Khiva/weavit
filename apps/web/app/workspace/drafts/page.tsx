import { SkeletonWrapper, DraftsPageSkeleton } from "@workspace/ui/components/skeleton-wrapper"

function Page(): JSX.Element {
  return (
    <SkeletonWrapper skeleton={<DraftsPageSkeleton />} delay={2000}>
      <div className="flex h-full w-full items-center justify-center">
        <h1 className="text-2xl font-bold">Drafts</h1>
      </div>
    </SkeletonWrapper>
  )
}

export default Page