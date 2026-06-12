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
import { DayTimeline } from "@workspace/ui/components/day-timeline"
export default function Page() {
  return (
    <main className="flex h-screen w-full flex-col justify-between bg-background">
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel defaultSize={"40%"}>
          <DayTimeline />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>
          <ResizablePanelGroup
            orientation="horizontal"
            className="h-full w-full"
          >
            <ResizablePanel defaultSize={"50%"}>
              <ResizablePanelGroup className="" orientation="vertical">
                <ResizablePanel
                  defaultSize={"55%"}
                  className="h-full bg-background"
                >
                  <div className="h-full bg-background">
                    <Habits />
                  </div>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel>
                  <div className="h-full overflow-hidden bg-background p-2">
                    <Todos />
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel>
              <ResizablePanelGroup orientation="vertical">
                <ResizablePanel defaultSize={"60%"}>
                  <div className="h-full overflow-hidden bg-background p-4">
                    <Projects />
                  </div>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel>
                  <div className="h-full overflow-hidden bg-background">
                    <WebActivities />
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>

      <div className="relative flex items-center p-2">
        <div className="flex flex-1 justify-center">
          <DeadlineCalender />
        </div>
        <div className="shrink-0">
          <FloatingDockDemo />
        </div>
        <div className="flex flex-1 justify-center">empty</div>
      </div>
    </main>
  )
}
