"use client"

import { useEffect, useState } from "react"
import { Check, FileText, PenLine, Settings, Sparkles } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

const STEPS: Array<{ icon: LucideIcon; label: string }> = [
  { icon: Settings, label: "Setting up your plan" },
  { icon: FileText, label: "Building your structure" },
  { icon: PenLine, label: "Adding your content" },
  { icon: Sparkles, label: "Sharpening wording" },
  { icon: Check, label: "Finishing the final polish" },
]

const STEP_MS = 1700
const ROW_GAP = 40

function GenerationStatus() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (active >= STEPS.length - 1) return
    const timeout = window.setTimeout(() => setActive(active + 1), STEP_MS)
    return () => window.clearTimeout(timeout)
  }, [active])

  return (
    <ul className="relative h-56 w-80" aria-live="polite">
      {STEPS.map((step, index) => {
        const Icon = step.icon
        const offset = index - active
        const distance = Math.abs(offset)
        const isActive = offset === 0
        const above = offset < 0
        const scale = above ? Math.max(0.55, 1 - distance * 0.12) : 1
        const opacity = isActive ? 1 : above ? Math.max(0.08, 0.5 - (distance - 1) * 0.14) : Math.max(0.2, 0.42 - (distance - 1) * 0.12)

        return (
          <li
            key={step.label}
            className={cn(
              "absolute left-1/2 top-1/2 flex items-center gap-2.5 whitespace-nowrap text-sm transition-[transform,opacity] duration-700 ease-out",
              isActive ? "font-medium text-foreground" : "text-muted-foreground"
            )}
            style={{
              transform: `translate(-50%, -50%) translateY(${offset * ROW_GAP}px) scale(${scale})`,
              opacity,
            }}
          >
            <Icon className={cn("size-4 shrink-0", isActive ? "text-orange-500" : "text-current")} strokeWidth={1.75} />
            <span>
              {step.label}
              {isActive ? "..." : ""}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

export { GenerationStatus }
