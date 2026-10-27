"use client"

import * as React from "react"
import { NavMain } from "@workspace/ui/components/nav-main"
import { NavProjects } from "@workspace/ui/components/nav-projects"
import { NavSecondary } from "@workspace/ui/components/nav-secondary"
import { NavUser } from "@workspace/ui/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar";
import {
  Flame,
  CheckSquare2,
  Layers,
  CalendarClock,
  Activity,
  FileText,
  FolderKanban,
  Settings,
  BookOpen,
  Target,
  ClipboardCheck,
} from "lucide-react";
import { useProjectsStore } from "@workspace/ui/lib/projects-store"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  currentPath?: string
  user?: {
    name: string
    email: string
    avatar?: string
  }
}

export function AppSidebar({
  currentPath: propCurrentPath,
  user: propUser,
  ...props
}: AppSidebarProps) {
  const [mountedPath, setMountedPath] = React.useState("")
  const { projects } = useProjectsStore()

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setMountedPath(window.location.pathname)
    }
  }, [])

  const currentPath = propCurrentPath || mountedPath

  const defaultUser = {
    name: "Raman Khiva",
    email: "ramandeep@weavit.dev",
  }

  const user = propUser || defaultUser

  const navIcon = (Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>) => (
    <Icon className="size-[18px] stroke-[2]" />
  )

  const navMain = React.useMemo(
    () => [
      {
        title: "Daily Habits",
        url: "/workspace/habits",
        icon: navIcon(Target),
        items: [
          {
            title: "Reading",
            url: "/workspace/habits/reading",
          },
          {
            title: "Meditation",
            url: "/workspace/habits/meditation",
          },
          {
            title: "Exercise",
            url: "/workspace/habits/exercise",
          },
        ],
      },
      {
        title: "Tasks & Todos",
        url: "/workspace/todos",
        icon: navIcon(ClipboardCheck),
      },
      {
        title: "Roadmaps & Plans",
        url: "/workspace/projects",
        icon: navIcon(Layers),
        badge: projects?.length ? String(projects.length) : undefined,
      },
      {
        title: "Deadlines",
        url: "/workspace/deadlines",
        icon: navIcon(CalendarClock),
      },
      {
        title: "Timeline & Activity",
        url: "/workspace/timeline",
        icon: navIcon(Activity),
      },
      {
        title: "Drafts & Notes",
        url: "/workspace/drafts",
        icon: navIcon(FileText),
      },
    ],
    [projects]
  )

  const navSecondary = React.useMemo(
    () => [
      {
        title: "Documentation",
        url: "/overview",
        icon: navIcon(BookOpen),
      },
      {
        title: "Settings",
        url: "/workspace/settings",
        icon: navIcon(Settings),
      },
    ],
    []
  )

  const projectItems = React.useMemo(() => {
    if (!projects || projects.length === 0) {
      return [
        {
          name: "SDE 2 Interview Prep",
          url: "/workspace/projects/sde-interview-prep",
          icon: navIcon(FolderKanban),
          badge: "1/4",
        },
        {
          name: "Distributed DB Engine",
          url: "/workspace/projects/distributed-key-value-store",
          icon: navIcon(FolderKanban),
          badge: "0/3",
        },
      ]
    }

    return projects.slice(0, 4).map((p) => {
      const allTasks = p.phases.flatMap((ph) => ph.tasks)
      const completed = allTasks.filter((t) => t.status === "COMPLETED").length
      return {
        name: p.title,
        url: `/workspace/projects/${p.id}`,
        icon: navIcon(FolderKanban),
        badge: `${completed}/${allTasks.length}`,
      }
    })
  }, [projects])

  return (

    <Sidebar variant="sidebar" {...props}>
      <SidebarHeader className="flex h-14 justify-center p-0 px-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="rounded-xl transition-all duration-150 hover:bg-sidebar-accent/60">
              <a href="/" className="flex items-center gap-3">
                <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-sidebar-primary/10 border border-sidebar-border/80 shadow-xs overflow-hidden">
                  <img src="/logo-weavit.png" alt="Weavit Logo" className="h-6 w-6 object-contain" />
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold tracking-tight text-foreground text-sm">Weavit</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-sm bg-primary/10 text-primary border border-primary/20">
                      PRO
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-medium">Workspace Engine</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-2 px-2 py-2 ">
        <NavMain items={navMain} currentPath={currentPath} />
        <NavProjects projects={projectItems} currentPath={currentPath} />
        <NavSecondary items={navSecondary} className="mt-auto pt-2 border-t border-sidebar-border/40" />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/50 pt-2">
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
