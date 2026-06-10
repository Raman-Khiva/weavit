"use client"

import { FloatingDock } from "@workspace/ui/components/ui/floating-dock"
import { Home, Layers, RefreshCw, Terminal } from "lucide-react"

export function FloatingDockDemo() {
  const links = [
    {
      title: "Home",
      icon: (
        <Home className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
    },
    {
      title: "Products",
      icon: (
        <Terminal className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
    },
    {
      title: "Components",
      icon: (
        <Layers className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
    },
    {
      title: "MVPBlocks",
      icon: (
        <img
          src="https://i.postimg.cc/j5dW4vFd/Mvpblocks.webp"
          width={20}
          height={20}
          alt="MVPBlocks Logo"
          className="rounded-full"
        />
      ),
      href: "#",
    },
    {
      title: "Changelog",
      icon: (
        <RefreshCw className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
    },
  ]
  return (
    <div className="flex w-full items-center justify-center">
      <FloatingDock mobileClassName="translate-y-20" items={links} />
    </div>
  )
}
