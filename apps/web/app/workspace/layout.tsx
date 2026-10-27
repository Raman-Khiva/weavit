"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { AppSidebar } from "@workspace/ui/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { Separator } from "@workspace/ui/components/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"

const ROUTE_LABELS: Record<string, string> = {
  "/workspace": "Dashboard",
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

  const currentLabel = React.useMemo(() => {
    if (!pathname) return "Workspace"
    if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname]
    if (pathname.startsWith("/workspace/projects/")) return "Roadmap Details"
    if (pathname.startsWith("/workspace/habits/")) return "Habit Details"
    return "Workspace"
  }, [pathname])

  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <AppSidebar currentPath={pathname} variant="sidebar" collapsible="icon" />

      <SidebarInset className="min-h-0 min-w-0 overflow-hidden bg-background">
        <header className="z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
          <SidebarTrigger className="-ml-1 text-foreground/45 hover:text-foreground" />
          <Separator
            orientation="vertical"
            className="mr-2 bg-border data-[orientation=vertical]:h-4"
          />
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
