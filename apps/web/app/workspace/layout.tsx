"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { AppSidebar, type SidebarProject } from "@workspace/ui/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { useGetProjectsQuery } from "@/features/projects/projects.api"

const ROUTE_LABELS: Record<string, string> = {
  "/workspace": "Home",
  "/workspace/habits": "Daily Habits",
  "/workspace/todos": "Tasks & Todos",
  "/workspace/projects": "Roadmaps & Plans",
  "/workspace/deadlines": "Deadlines & Milestones",
  "/workspace/timeline": "Timeline & Activity",
  "/workspace/drafts": "Drafts & Notes",
  "/workspace/settings": "Settings",
}

export default function WorkspaceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname()
  const { isLoaded, isSignedIn } = useAuth()
  const { data: projects } = useGetProjectsQuery(undefined, {
    skip: !isLoaded || !isSignedIn,
  })

  const sidebarProjects = React.useMemo<SidebarProject[]>(() => {
    if (!projects?.length) return []
    return projects.map((p) => {
      const tasks = (p.phases ?? []).flatMap((ph) => ph.tasks ?? [])
      const completed = tasks.filter((t) => t.status === "COMPLETED").length
      return {
        id: p.id,
        title: p.title,
        badge: `${completed}/${tasks.length}`,
      }
    })
  }, [projects])

  const currentLabel = React.useMemo(() => {
    if (!pathname) return "Workspace"
    if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname]
    if (pathname.startsWith("/workspace/projects/")) return "Roadmap Details"
    if (pathname.startsWith("/workspace/habits/")) return "Habit Details"
    return "Workspace"
  }, [pathname])

  return (
    <SidebarProvider className=" h-svh overflow-hidden">
      <AppSidebar
        currentPath={pathname}
        projects={sidebarProjects}
        variant="sidebar"
        collapsible="icon"
      />

      <SidebarInset className="min-h-0 min-w-0 overflow-hidden bg-background">
        <header className=" ml-1 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
          <SidebarTrigger className="-ml-1 mr-6 text-foreground/45 hover:text-foreground" />
          {/* <Separator
            orientation="vertical"
            className="mr-2  bg-border data-[orientation=vertical]:h-full "
          /> */}
          <Breadcrumb>
            <BreadcrumbList className="text-sm">
              <BreadcrumbItem className="hidden sm:block">
                <BreadcrumbLink
                  href="/workspace"
                  className="font-medium text-muted-foreground hover:text-foreground"
                >
                  Workspace
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden text-muted-foreground/40 sm:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold text-foreground">
                  {currentLabel}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
