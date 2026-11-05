import * as React from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@workspace/ui/components/sidebar"
import { ChevronRightIcon, Plus, ArrowUpRight } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

export function NavProjects({
  projects,
  currentPath,
}: {
  projects: {
    name: string
    url: string
    icon: React.ReactNode
    badge?: string
    items?: {
      title: string
      url: string
    }[]
  }[]
  currentPath?: string
}) {
  const { isMobile } = useSidebar()

  return (
    <SidebarGroup className=" max-w-60 group-data-[collapsible=icon]:hidden">
      <div className="flex items-center justify-between px-2">
        <SidebarGroupLabel className="p-0 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
          Roadmaps & Plans
        </SidebarGroupLabel>
        <SidebarGroupAction asChild title="All Roadmaps">
          <a href="/workspace/projects" className="text-muted-foreground hover:text-foreground">
            <Plus className="size-3.5 stroke-[2.5]" />
            <span className="sr-only">Add Roadmap</span>
          </a>
        </SidebarGroupAction>
      </div>

      <SidebarMenu>
        {projects.map((item) => {
          const isItemActive = currentPath
            ? currentPath === item.url || currentPath.startsWith(item.url + "/")
            : false

          return (
            <Collapsible key={item.url} asChild defaultOpen={isItemActive}>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={item.name}
                  isActive={isItemActive}
                  className={cn(
                    "relative group/proj-item rounded-lg px-2.5 transition-all duration-150 group-data-[collapsible=icon]:justify-center",
                    isItemActive
                      ? "bg-sidebar-accent font-medium text-foreground shadow-2xs"
                      : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
                  )}
                >
                  <a
                    href={item.url}
                    className="flex w-full items-center gap-3 group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
                  >
                    {isItemActive && (
                      <span className="absolute left-0 top-1/2 h-4 w-1 -translate-y-1/2 rounded-r-full bg-primary group-data-[collapsible=icon]:hidden" />
                    )}
                    <span
                      className={cn(
                        "flex shrink-0 items-center justify-center transition-colors",
                        isItemActive
                          ? "text-foreground/55"
                          : "text-muted-foreground/70 group-hover/proj-item:text-muted-foreground"
                      )}
                    >
                      {item.icon}
                    </span>
                    <span className="flex-1 truncate text-[13px] font-medium group-data-[collapsible=icon]:hidden">
                      {item.name}
                    </span>
                    {item.badge && (
                      <span className="shrink-0 rounded-md bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] font-bold text-muted-foreground group-data-[collapsible=icon]:hidden">
                        {item.badge}
                      </span>
                    )}
                  </a>
                </SidebarMenuButton>

                {item.items?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="transition-transform duration-200 data-[state=open]:rotate-90">
                        <ChevronRightIcon className="size-3.5 stroke-[2.2]" />
                        <span className="sr-only">Toggle</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down pb-1 pt-0.5">
                      <SidebarMenuSub className="my-0 ml-[19px] flex flex-col gap-0 border-l border-sidebar-border/80 pl-3">
                        {item.items?.map((subItem) => {
                          const isSubActive = currentPath ? currentPath === subItem.url : false
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isSubActive}
                                className={cn(
                                  "h-6 rounded-md px-2 text-[12px] transition-colors",
                                  isSubActive
                                    ? "bg-sidebar-accent/80 font-semibold text-sidebar-accent-foreground"
                                    : "text-muted-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                                )}
                              >
                                <a href={subItem.url} className="flex items-center gap-2.5 w-full">
                                  <span
                                    className={cn(
                                      "size-1.5 rounded-full shrink-0 transition-all",
                                      isSubActive
                                        ? "bg-primary scale-110"
                                        : "bg-muted-foreground/40 group-hover/sub-button:bg-foreground/70"
                                    )}
                                  />
                                  <span className="truncate font-medium">{subItem.title}</span>
                                </a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          )
        })}

        <SidebarMenuItem>
          <SidebarMenuButton asChild className="text-muted-foreground hover:text-foreground">
            <a href="/workspace/projects" className="flex items-center gap-2.5">
              <ArrowUpRight className="size-4 stroke-[2]" />
              <span className="text-[13px] font-medium">Explore All Plans</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
