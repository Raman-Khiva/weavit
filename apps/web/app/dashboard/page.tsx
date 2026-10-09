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
import { ProductivityGraphicCard } from "@workspace/ui/components/productivity-graphic-card"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import { Bell } from "lucide-react"

export default function Page() {
  return (
    <main className="relative flex h-screen w-full flex-col justify-between bg-background pb-19">
      {/* Top Right Corner Notch Button (Touching Sides) */}
      <Sheet>
        <SheetTrigger asChild>
          <button className="fixed top-0 right-0 z-50 flex items-center gap-2.5 rounded-bl-2xl border-b border-l border-border/80 bg-card/90 px-4 py-2 text-xs font-semibold text-foreground shadow-md backdrop-blur-md hover:bg-card hover:border-border transition-all cursor-pointer">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
            </span>
            <Bell className="h-3.5 w-3.5 text-indigo-400" />
            <span>3 Notifications</span>
          </button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-card/95 backdrop-blur-xl border-l border-border p-6 shadow-2xl flex flex-col gap-4 z-50"
        >
          <SheetHeader className="p-0 border-b border-border/60 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-indigo-400" />
                <SheetTitle className="text-base font-bold text-foreground">
                  Notifications
                </SheetTitle>
              </div>
              <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-bold text-indigo-400 border border-indigo-500/20">
                3 Unread
              </span>
            </div>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto pr-1">
            <Notifications />
          </div>
        </SheetContent>
      </Sheet>

      <div className="relative z-40 h-[6.7rem] border-border pt-20">
        <div className="absolute top-0 right-0 left-0">
          <DayTimelineHorizontal />
        </div>
        <div className="absolute right-0 bottom-4 flex w-full items-center justify-between px-6">
          <div className="flex flex-1 items-center justify-center"></div>
          <div className="h-16 w-52" />
          <div className="flex flex-1 items-center justify-end gap-3 pr-40">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Nominal</span>
            </div>
          </div>
        </div>
      </div>
      <ResizablePanelGroup orientation="vertical" className="h-full w-full">
        <ResizablePanel defaultSize={"60%"} className="">
          <ResizablePanelGroup className="" orientation="horizontal">
            <ResizablePanel defaultSize={"33.3%"} className="m-2 w-full">
              <div className="flex h-full w-full flex-1 justify-center overflow-hidden rounded-lg border border-border p-4">
                <Habits />
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel className="m-2 w-full" defaultSize={"33.3%"}>
              <div className="flex h-full flex-1 justify-center overflow-hidden rounded-lg border border-border p-4">
                <Todos />
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel className="m-2 w-full" defaultSize={"33.3%"}>
              <div className="flex h-full w-full flex-1 justify-center overflow-hidden rounded-lg border border-border p-4">
                <RecentActivity />
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
            <ResizablePanel className="m-2 w-full" defaultSize={"40%"}>
              <div className="flex h-full w-full flex-1 justify-center overflow-hidden rounded-lg border border-border p-4">
                <ProductivityGraphicCard />
              </div>
            </ResizablePanel>
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
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3.5 py-1.5 text-xs font-semibold text-muted-foreground backdrop-blur-md shadow-xs">
            <span className="text-emerald-500 font-bold">⚡ 96%</span>
            <span>Focus Velocity</span>
          </div>
        </div>
      </div>
    </main>
  )
}
