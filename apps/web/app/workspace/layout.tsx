"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth, useClerk, useUser } from "@clerk/nextjs"
import { AppSidebar, type SidebarProject } from "@workspace/ui/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { Button } from "@workspace/ui/components/button"
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

function isWorkspaceHome(pathname: string | null) {
  if (!pathname) return false
  return pathname === "/workspace" || pathname === "/workspace/"
}

export default function WorkspaceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname()
  const router = useRouter()
  const { isLoaded, isSignedIn } = useAuth()
  const { signOut } = useClerk()
  const { user } = useUser()
  const { data: projects } = useGetProjectsQuery(undefined, {
    skip: !isLoaded || !isSignedIn,
  })

  const onHome = isWorkspaceHome(pathname)

  // Nested workspace pages require auth; home stays public with a login CTA
  React.useEffect(() => {
    if (!isLoaded || isSignedIn || onHome) return
    router.replace("/login")
  }, [isLoaded, isSignedIn, onHome, router])

  const handleSignOut = React.useCallback(async () => {
    await signOut({ redirectUrl: "/" })
  }, [signOut])

  const sidebarUser = React.useMemo(() => {
    if (!user) return undefined
    return {
      name:
        user.fullName ||
        user.firstName ||
        user.username ||
        user.primaryEmailAddress?.emailAddress ||
        "User",
      email: user.primaryEmailAddress?.emailAddress || "",
      avatar: user.imageUrl,
    }
  }, [user])

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

  // Brief gate while redirecting away from nested pages
  if (isLoaded && !isSignedIn && !onHome) {
    return (
      <div className="flex h-svh flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <p className="text-sm text-muted-foreground">Redirecting to sign in…</p>
        <Button asChild size="sm" className="rounded-lg">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    )
  }

  return (
    <SidebarProvider className=" h-svh overflow-hidden">
      <AppSidebar
        currentPath={pathname}
        projects={sidebarProjects}
        user={sidebarUser}
        signedIn={Boolean(isSignedIn)}
        onSignOut={handleSignOut}
        variant="sidebar"
        collapsible="icon"
      />

      <SidebarInset className="min-h-0 min-w-0 overflow-hidden bg-background">
        <header className=" ml-1 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
          <SidebarTrigger className="-ml-1 mr-6 text-foreground/45 hover:text-foreground" />
          <Breadcrumb className="min-w-0 flex-1">
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
          {isLoaded && !isSignedIn ? (
            <Button asChild size="sm" className="shrink-0 rounded-lg">
              <Link href="/login">Sign in</Link>
            </Button>
          ) : null}
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
