"use client"

import * as React from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@workspace/ui/components/sidebar"
import { ChevronRightIcon } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

export function NavMain({
  items,
  currentPath,
}: {
  items: {
    title: string
    url: string
    icon: React.ReactNode
    isActive?: boolean
    badge?: string | number
    items?: {
      title: string
      url: string
    }[]
  }[]
  currentPath?: string
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 px-2 py-1">
        Workspace
      </SidebarGroupLabel>
      <SidebarMenu className="gap-1">
        {items.map((item) => {
          const isItemActive = currentPath
            ? item.url === "/workspace"
              ? currentPath === "/workspace"
              : currentPath.startsWith(item.url)
            : !!item.isActive

          return (
            <Collapsible key={item.title} asChild defaultOpen={isItemActive || item.isActive}>
              <SidebarMenuItem className="relative">
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isItemActive}
                  className={cn(
                    "relative group/nav-item rounded-lg px-2.5 py-2 transition-all duration-150",
                    isItemActive
                      ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground shadow-2xs"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                  )}
                >
                  <a href={item.url} className="flex items-center gap-2.5 w-full">
                    {/* Active accent bar on the left */}
                    {isItemActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-1 rounded-r-full bg-primary" />
                    )}
                    <span
                      className={cn(
                        "flex items-center justify-center shrink-0 transition-colors",
                        isItemActive
                          ? "text-primary"
                          : "text-muted-foreground group-hover/nav-item:text-sidebar-foreground"
                      )}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate flex-1 text-[13.5px] font-semibold">{item.title}</span>
                    {item.badge && (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-muted/60 text-muted-foreground shrink-0">
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
                    <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down pb-2.5 mb-1 pt-1">
                      <SidebarMenuSub className="ml-[19px] pl-3 border-l border-sidebar-border/80 flex flex-col gap-1 my-0.5">
                        {item.items?.map((subItem) => {
                          const isSubActive = currentPath ? currentPath === subItem.url : false
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isSubActive}
                                className={cn(
                                  "h-7 rounded-md text-[12px] px-2 transition-colors",
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
      </SidebarMenu>
    </SidebarGroup>
  )
}
