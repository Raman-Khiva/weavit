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

export default function Page() {
  return (
    <main className="flex h-screen w-full flex-col justify-between bg-background">
      <ResizablePanelGroup orientation="horizontal" className="h-full w-full">
        <ResizablePanel defaultSize={"50%"}>
          <ResizablePanelGroup className="" orientation="vertical">
            <ResizablePanel
              defaultSize={"50%"}
              className="h-full bg-background"
            >
              <div className="h-full bg-background">
                <Habits />
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel>
              <div className="flex h-full flex-col justify-end overflow-hidden bg-background p-2">
                2
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>
          <ResizablePanelGroup orientation="vertical">
            <ResizablePanel defaultSize={"60%"}>
              <div className="h-full overflow-hidden bg-background">3</div>
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
