import { Pattern } from "@workspace/ui/components/kanban-board"
const Page = () => {
  return (
    <div className="flex min-h-full w-full flex-col items-center gap-10 px-16 py-15">
      <header className="w-full">
        <h1 className="border-b-2 border-border pb-4 text-4xl font-bold">
          Tasks To Do
        </h1>
      </header>
      <div className="w-full">
        <Pattern />
      </div>
    </div>
  )
}

export default Page
