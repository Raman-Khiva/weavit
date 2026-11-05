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
  LogIn,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils"
import { WeavitLogo } from "@workspace/ui/components/weavit-logo"

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
  /** When false, footer shows Sign in instead of the user menu */
  signedIn?: boolean
  onSignOut?: () => void | Promise<void>
}

export function AppSidebar({
  currentPath: propCurrentPath,
  projects: propProjects = [],
  user: propUser,
  signedIn = true,
  onSignOut,
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
      <SidebarHeader className="flex h-14 justify-center">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              tooltip="Weavit"
              className="rounded-xl transition-all duration-150 hover:bg-sidebar-accent/60 group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center"
            >
              <a
                href="/"
                className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
              >
                <div className="flex aspect-square size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-sidebar-border/80 bg-sidebar-primary/10 shadow-xs">
                  <WeavitLogo className="h-6 w-6" />
                </div>
                <div className="grid min-w-0 flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-extrabold tracking-tight text-foreground">
                      Weavit
                    </span>
                    <span className="rounded-sm border border-primary/20 bg-primary/10 px-1.5 py-0.2 font-mono text-[9px] font-bold text-primary">
                      PRO
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    Workspace Engine
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-3 px-2 py-2 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:overflow-hidden group-data-[collapsible=icon]:px-1.5">
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
                      "relative rounded-lg px-2.5 transition-all duration-150 group-data-[collapsible=icon]:justify-center",
                      isActive
                        ? "bg-sidebar-accent font-medium text-foreground shadow-2xs"
                        : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
                    )}
                  >
                    <a
                      href={item.url}
                      className="flex w-full items-center gap-3 group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
                    >
                      {isActive && (
                        <span className="absolute top-1/2 left-0 h-4 w-1 -translate-y-1/2 rounded-r-full bg-primary group-data-[collapsible=icon]:hidden" />
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
                      <span className="flex-1 truncate text-[13px] font-medium group-data-[collapsible=icon]:hidden">
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
        <NavProjects projects={projectItems} currentPath={currentPath} />
        <NavSecondary
          items={navSecondary}
          className="mt-auto border-t border-sidebar-border/40 pt-2"
        />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/50 pt-2">
        {signedIn ? (
          <NavUser user={user} onSignOut={onSignOut} />
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                asChild
                tooltip="Sign in"
                className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center"
              >
                <a
                  href="/login"
                  className="flex w-full items-center gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15">
                    <LogIn className="size-4" />
                  </span>
                  <span className="grid min-w-0 flex-1 text-left text-xs leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate text-[13px] font-semibold">
                      Sign in
                    </span>
                    <span className="truncate text-[11px] opacity-80">
                      Unlock your workspace
                    </span>
                  </span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
