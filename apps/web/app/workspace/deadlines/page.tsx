import { DetailedCalendar } from "@workspace/ui/components/detailed-calendar"

const Page = () => {
  return (
    <div className="flex h-full w-full flex-col gap-8 px-16 py-8">
      <header>
        <h1 className="border-b border-foreground/80 pb-3 text-4xl font-bold">
          Deadlines
        </h1>
      </header>
      <div>
        <DetailedCalendar />
      </div>
    </div>
  )
}

export default Page
