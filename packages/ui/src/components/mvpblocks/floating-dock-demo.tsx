"use client"

import * as React from "react"
import {
  FloatingDock,
  type FloatingDockItem,
} from "@workspace/ui/components/ui/floating-dock"
import {
  Clock,
  Flame,
  FolderKanban,
  Home,
  Layers,
  RefreshCw,
  Terminal,
} from "lucide-react"
import { AgendaTimeline } from "@workspace/ui/components/agenda-timeline"
import { Habits } from "@workspace/ui/components/habits"
import { PlansOverview } from "@workspace/ui/components/plans-overview"
import { WeavitLogo } from "@workspace/ui/components/weavit-logo"
import type { components } from "@weavit/api-types"

type Habit = components["schemas"]["Habit"]
type Project = components["schemas"]["Project"]
type PreviewKey = "habits" | "plans" | "timeline"

const PREVIEW_META: Record<
  PreviewKey,
  { title: string; description: string; href: string; icon: React.ReactNode }
> = {
  habits: {
    title: "Habits",
    description: "Daily loops and streaks. Click the dock icon to open the full page.",
    href: "/workspace/habits",
    icon: <Flame className="h-5 w-5 text-orange-400" />,
  },
  plans: {
    title: "Plans",
    description: "Phased roadmaps in progress. Click the dock icon to open projects.",
    href: "/workspace/projects",
    icon: <FolderKanban className="h-5 w-5 text-emerald-400" />,
  },
  timeline: {
    title: "Timeline",
    description: "Today’s agenda. Click the dock icon to open the full timeline.",
    href: "/workspace/timeline",
    icon: <Clock className="h-5 w-5 text-indigo-500" />,
  },
}

export function FloatingDockDemo({
  habits,
  projects,
}: {
  habits?: Habit[]
  projects?: Project[]
} = {}) {
  const [preview, setPreview] = React.useState<PreviewKey | null>(null)
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearCloseTimer = React.useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }, [])

  const openPreview = React.useCallback(
    (key: PreviewKey) => {
      clearCloseTimer()
      setPreview(key)
    },
    [clearCloseTimer]
  )

  const scheduleClose = React.useCallback(() => {
    clearCloseTimer()
    closeTimer.current = setTimeout(() => setPreview(null), 180)
  }, [clearCloseTimer])

  React.useEffect(() => {
    return () => clearCloseTimer()
  }, [clearCloseTimer])

  const links = React.useMemo<FloatingDockItem[]>(
    () => [
      {
        title: "Weavit",
        icon: <WeavitLogo alt="W" className="h-full w-full rounded-full" />,
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
        title: "Habits",
        icon: (
          <Flame className="h-full w-full text-neutral-500 dark:text-neutral-300" />
        ),
        href: "/workspace/habits",
        onHoverEnter: () => openPreview("habits"),
        onHoverLeave: scheduleClose,
      },
      {
        title: "Plans",
        icon: (
          <FolderKanban className="h-full w-full text-neutral-500 dark:text-neutral-300" />
        ),
        href: "/workspace/projects",
        onHoverEnter: () => openPreview("plans"),
        onHoverLeave: scheduleClose,
      },
      {
        title: "Timeline",
        icon: (
          <Clock className="h-full w-full text-neutral-500 dark:text-neutral-300" />
        ),
        href: "/workspace/timeline",
        onHoverEnter: () => openPreview("timeline"),
        onHoverLeave: scheduleClose,
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
    ],
    [openPreview, scheduleClose]
  )

  const meta = preview ? PREVIEW_META[preview] : null

  return (
    <>
      <div className="flex w-full items-center justify-center">
        <FloatingDock mobileClassName="translate-y-20" items={links} />
      </div>

      {preview && meta ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-3 sm:px-6">
          <div
            className="pointer-events-auto flex h-[min(78vh,52rem)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-border/60 bg-background/95 shadow-2xl backdrop-blur-xl"
            onMouseEnter={clearCloseTimer}
            onMouseLeave={scheduleClose}
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border/50 px-5 py-4">
              <div className="min-w-0">
                <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                  {meta.icon}
                  {meta.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {meta.description}
                </p>
              </div>
              <a
                href={meta.href}
                className="shrink-0 rounded-lg border border-border/60 bg-muted/40 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Open page
              </a>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4 [scrollbar-width:thin]">
              {preview === "habits" ? (
                <div className="mx-auto max-w-md rounded-xl border border-border/40 bg-card/40 p-2">
                  <Habits habits={habits} />
                </div>
              ) : null}
              {preview === "plans" ? (
                <div className="mx-auto h-full min-h-[24rem] max-w-lg">
                  <PlansOverview
                    projects={projects ?? []}
                    max={6}
                    className="h-full border-border/40 bg-card/40"
                  />
                </div>
              ) : null}
              {preview === "timeline" ? (
                <div className="rounded-xl border border-border/40 bg-card/50 p-4">
                  <AgendaTimeline />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
