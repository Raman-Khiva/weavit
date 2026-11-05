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
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar";
import {
  Home,
  LayoutDashboard,
  Bot,
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
import { cn } from "@workspace/ui/lib/utils"

export type SidebarProject = {
  id: string
  title: string
  /** e.g. "2/8" completed/total tasks */
  badge?: string
}

const DEMO_PROJECT: SidebarProject = {
  id: "demo-roadmap",
  title: "Demo: Sample Roadmap",
  badge: "0/4",
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  currentPath?: string
  /** Real roadmaps from the API — sidebar shows demo + up to 2 of these (max 3). */
  projects?: SidebarProject[]
  user?: {
    name: string
    email: string
    avatar?: string
  }
}

export function AppSidebar({
  currentPath: propCurrentPath,
  projects: propProjects = [],
  user: propUser,
  ...props
}: AppSidebarProps) {
  const [mountedPath, setMountedPath] = React.useState("")

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

  const navApps = React.useMemo(
    () => [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: navIcon(LayoutDashboard),
      },
      {
        title: "Agent",
        url: "/agent",
        icon: navIcon(Bot),
      },
    ],
    []
  )

  const navMain = React.useMemo(
    () => [
      {
        title: "Home",
        url: "/workspace",
        icon: navIcon(Home),
      },
      {
        title: "Daily Habits",
        url: "/workspace/habits",
        icon: navIcon(Target),
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
        badge: propProjects.length ? String(propProjects.length) : undefined,
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
    [propProjects.length]
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
    const seen = new Set<string>([DEMO_PROJECT.id])
    const real = propProjects
      .filter((p) => {
        if (!p.id || seen.has(p.id)) return false
        seen.add(p.id)
        return true
      })
      .slice(0, 2)
      .map((p) => ({
        name: p.title,
        url: `/workspace/projects/${p.id}`,
        icon: navIcon(FolderKanban),
        badge: p.badge,
      }))

    return [
      {
        name: DEMO_PROJECT.title,
        url: `/workspace/projects/${DEMO_PROJECT.id}`,
        icon: navIcon(FolderKanban),
        badge: DEMO_PROJECT.badge,
      },
      ...real,
    ]
  }, [propProjects])

  return (

    <Sidebar variant="sidebar" className="" {...props}>
      <SidebarHeader className="flex h-14 justify-center p-0 px-2">
        <SidebarMenu className="min-w-56">
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

      <SidebarContent className="gap-3 px-2 py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
            Apps
          </SidebarGroupLabel>
          <SidebarMenu>
            {navApps.map((item) => {
              const isActive =
                currentPath === item.url ||
                currentPath.startsWith(`${item.url}/`)
              return (
                <SidebarMenuItem key={item.title} className="relative">
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isActive}
                    className={cn(
                      "relative rounded-lg px-2.5 transition-all duration-150",
                      isActive
                        ? "bg-sidebar-accent font-medium text-foreground shadow-2xs"
                        : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
                    )}
                  >
                    <a href={item.url} className="flex w-full items-center gap-3">
                      {isActive && (
                        <span className="absolute top-1/2 left-0 h-4 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                      )}
                      <span
                        className={cn(
                          "flex shrink-0 items-center justify-center transition-colors",
                          isActive
                            ? "text-foreground/55"
                            : "text-muted-foreground/70"
                        )}
                      >
                        {item.icon}
                      </span>
                      <span className="flex-1 truncate text-[13px] font-medium">
                        {item.title}
                      </span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        <NavMain items={navMain} currentPath={currentPath} />
        <NavProjects projects={projectItems}  currentPath={currentPath} />
        <NavSecondary items={navSecondary} className="mt-auto pt-2 border-t border-sidebar-border/40" />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/50 pt-2">
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
