"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Sun, Moon, Laptop, Check } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"

export interface FloatingThemeToggleProps {
  className?: string
  positionClassName?: string
}

export function FloatingThemeToggle({
  className,
  positionClassName = "fixed bottom-5 right-5 z-50",
}: FloatingThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch by rendering placeholder until client mounts
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={cn(positionClassName, className)}>
        <Button
          variant="outline"
          size="icon"
          className="h-11 w-11 rounded-full border-border/60 bg-background/80 shadow-lg backdrop-blur-md"
          aria-label="Toggle theme loading"
        >
          <span className="h-5 w-5 animate-pulse rounded-full bg-muted-foreground/20" />
        </Button>
      </div>
    )
  }

  return (
    <div className={cn(positionClassName, className)}>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="group relative h-11 w-11 rounded-full border border-border/50 bg-background/80 p-0 text-foreground shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-border hover:bg-background hover:shadow-xl hover:shadow-indigo-500/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:bg-zinc-900/80 dark:hover:bg-zinc-900"
                aria-label="Toggle theme menu"
              >
                <div className="relative flex items-center justify-center">
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0 text-amber-500" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100 text-indigo-400" />
                </div>
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="left" className="text-xs font-medium">
            Theme Options <kbd className="ml-1 rounded border border-border/60 bg-muted px-1 font-mono text-[10px]">D</kbd>
          </TooltipContent>
        </Tooltip>

        <DropdownMenuContent
          align="end"
          side="top"
          sideOffset={8}
          className="w-36 rounded-xl border-border/60 bg-background/95 p-1.5 shadow-xl backdrop-blur-md animate-in fade-in-0 zoom-in-95"
        >
          <DropdownMenuItem
            onClick={() => setTheme("light")}
            className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-colors hover:bg-accent focus:bg-accent"
          >
            <span className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-amber-500" />
              Light
            </span>
            {theme === "light" && <Check className="h-3.5 w-3.5 text-primary" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme("dark")}
            className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-colors hover:bg-accent focus:bg-accent"
          >
            <span className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-indigo-400" />
              Dark
            </span>
            {theme === "dark" && <Check className="h-3.5 w-3.5 text-primary" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme("system")}
            className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-colors hover:bg-accent focus:bg-accent"
          >
            <span className="flex items-center gap-2">
              <Laptop className="h-4 w-4 text-muted-foreground" />
              System
            </span>
            {theme === "system" && <Check className="h-3.5 w-3.5 text-primary" />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
