"use client"

import * as React from "react"
import { FloatingDock } from "@workspace/ui/components/ui/floating-dock"
import { Home, Layers, RefreshCw, Terminal, Clock } from "lucide-react"
import { AgendaTimeline } from "@workspace/ui/components/agenda-timeline"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"

export function FloatingDockDemo() {
  const [timelineOpen, setTimelineOpen] = React.useState(false)

  const links = [
    {
      title: "Weavit",
      icon: (
        <img
          src="/logo-weavit.png"
          alt="W"
          className="h-full w-full object-contain rounded-full"
        />
      ),
      href: "/",
    },
    {
      title: "Dashboard",
      icon: (
        <Home className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/dashboard",
    },
    {
      title: "Workspace",
      icon: (
        <Terminal className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/workspace",
    },
    {
      title: "Timeline",
      icon: (
        <Clock className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
      onClick: () => setTimelineOpen(true),
    },
    {
      title: "Overview",
      icon: (
        <Layers className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/overview",
    },
    {
      title: "Changelog",
      icon: (
        <RefreshCw className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
    },
  ]

  return (
    <>
      <div className="flex w-full items-center justify-center">
        <FloatingDock mobileClassName="translate-y-20" items={links} />
      </div>

      <Dialog open={timelineOpen} onOpenChange={setTimelineOpen}>
        <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-[95vw] h-[90vh] max-h-[90vh] overflow-y-auto p-6 border-border/60 bg-background/95 backdrop-blur-xl shadow-2xl rounded-2xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-500" />
              Timeline & Schedule Agenda
            </DialogTitle>
            <DialogDescription>
              Interactive timeline agenda view of your daily tasks, meetings, and events.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-border/40 bg-card/50 p-4">
            <AgendaTimeline />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
