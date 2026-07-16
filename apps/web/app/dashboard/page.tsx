"use client"
import { FloatingDockDemo } from "@workspace/ui/components/mvpblocks/floating-dock-demo"
import { Habits } from "@workspace/ui/components/habits"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@workspace/ui/components/resizable"
import { Tasks } from "@workspace/ui/components/Tasks"
import { GlassWalletCard } from "@workspace/ui/components/uitripled/glass-wallet-card-shadcnui"
import WebActivities from "@workspace/ui/components/WebActivities"
import { DeadlineCalender } from "@workspace/ui/components/deadline-calender"
import HoverCardTasksDemo from "@workspace/ui/components/shadcn-studio/tooltip/tooltip-15"
import { TaskboardDemo } from "@workspace/ui/components/taskboard-demo"
import { Projects } from "@workspace/ui/components/projects"
import { Kanban, KanbanBoard } from "@workspace/ui/components/kanban"
import { Todos } from "@workspace/ui/components/todos"
import { DayTimelineHorizontal } from "@workspace/ui/components/day-timeline-horizontal"
import { RecentActivity } from "@workspace/ui/components/recent-activity"
import { Notifications } from "@workspace/ui/components/notifications"
export default function Page() {
  return (
    <main className="relative flex h-screen w-full flex-col justify-between bg-background pb-19">
      <div className="relative z-50 h-[6.7rem] border-border pt-20">
        <div className="absolute top-0 right-0 left-0">
          <DayTimelineHorizontal />
        </div>
        <div className="absolute right-0 bottom-4 flex w-full items-center justify-between">
          <div className="flex flex-1 items-center justify-center"></div>
          <div className="h-16 w-52" />
          <div className="flex flex-1 items-center justify-center">
            <h2>right</h2>
          </div>
        </div>
      </div>
      <ResizablePanelGroup orientation="vertical" className="h-full w-full">
        <ResizablePanel defaultSize={"60%"} className="">
          <ResizablePanelGroup className="" orientation="horizontal">
            <ResizablePanel defaultSize={"25%"} className="m-2 w-full">
              <div className="flex h-full w-full flex-1 justify-center overflow-hidden rounded-lg border border-border p-4">
                <Habits />
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel className="m-2 w-full" defaultSize={"25%"}>
              <div className="flex h-full flex-1 justify-center overflow-hidden rounded-lg border border-border p-4">
                <Todos />
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel className="m-2 w-full" defaultSize={"25%"}>
              <div className="flex h-full w-full flex-1 justify-center overflow-hidden rounded-lg border border-border p-4">
                <RecentActivity />
              </div>
            </ResizablePanel>

            <ResizablePanel className="m-2 w-full" defaultSize={"25%"}>
              <div className="flex h-full w-full flex-1 justify-center overflow-hidden rounded-lg border border-border p-4">
                <Notifications />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>
          <ResizablePanelGroup orientation="horizontal">
            <ResizablePanel className="m-2 w-fit" defaultSize={"60%"}>
              <div className="flex h-full w-full flex-1 justify-center overflow-hidden rounded-lg border border-border p-4">
                <Projects />
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel></ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
      <div className="absolute right-0 bottom-2 left-0 flex w-full items-center justify-between">
        <div className="flex flex-1 justify-center">
          <DeadlineCalender />
        </div>
        <div className="z-20 w-72">
          <FloatingDockDemo />
        </div>

        <div className="flex flex-1 justify-center">
          <h2>empty</h2>
        </div>
      </div>
    </main>
  )
}
