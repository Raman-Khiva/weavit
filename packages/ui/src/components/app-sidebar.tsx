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
} from "@workspace/ui/components/sidebar"
import {
  TerminalSquareIcon,
  BotIcon,
  BookOpenIcon,
  Settings2Icon,
  LifeBuoyIcon,
  SendIcon,
  FrameIcon,
  PieChartIcon,
  MapIcon,
  TerminalIcon,
  CheckSquare,
  FileEdit,
  Calendar,
  Clock,
} from "lucide-react"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Daily Tasks",
      url: "/workspace/habits",
      icon: <TerminalSquareIcon />,
      isActive: true,
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
      title: "Todos",
      url: "/workspace/todos",
      icon: <CheckSquare />,
      items: [],
    },
    {
      title: "Drafts",
      url: "/workspace/drafts",
      icon: <FileEdit />,
      items: [],
    },
    {
      title: "Deadlines",
      url: "/workspace/deadlines",
      icon: <Calendar />,
      items: [],
    },
    {
      title: "Timeline",
      url: "/workspace/timeline",
      icon: <Clock />,
      items: [],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/workspace/settings",
      icon: <Settings2Icon />,
    },
  ],
  projects: [
    {
      name: "Project Alpha",
      url: "/workspace/projects/project-alpha",
      icon: <FrameIcon />,
      items: [
        {
          title: "Tasks",
          url: "/workspace/projects/project-alpha/tasks",
        },
        {
          title: "Timeline",
          url: "/workspace/projects/project-alpha/timeline",
        },
      ],
    },
    {
      name: "Project Beta",
      url: "/workspace/projects/project-beta",
      icon: <PieChartIcon />,
      items: [
        {
          title: "Tasks",
          url: "/workspace/projects/project-beta/tasks",
        },
        {
          title: "Timeline",
          url: "/workspace/projects/project-beta/timeline",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <TerminalIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Acme Inc</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
