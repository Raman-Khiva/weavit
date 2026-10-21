import { AgendaTimeline } from "@workspace/ui/components/agenda-timeline"

function Page(): JSX.Element {
  return (
    <div className="flex h-full w-full flex-col px-10 py-12">
      <AgendaTimeline />
    </div>
  )
}

export default Page
