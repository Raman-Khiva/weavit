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
import { Sparkles, Command } from "lucide-react"

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
    <SidebarProvider>
      <AppSidebar currentPath={pathname} collapsible="icon" />

      <SidebarInset className="min-w-0 bg-background">
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border/50 bg-background/95 px-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
            <Separator
              orientation="vertical"
              className="mr-2 bg-border/60 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList className="text-xs">
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
          </div>

          <div className="hidden items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground md:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-[11px] font-medium">Sync Active</span>
          </div>
        </header>

        <div className="flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
