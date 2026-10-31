"use client"

import type React from "react"
import {
  ZapIcon,
  CpuIcon,
  FingerprintIcon,
  PencilIcon,
  Settings2Icon,
  SparklesIcon,
} from "lucide-react"
import { GridPattern } from "@workspace/ui/components/grid-pattern"
import { cn } from "@workspace/ui/lib/utils"

type FeatureType = {
  title: string
  icon: React.ReactNode
  description: string
}

const features: FeatureType[] = [
  {
    title: "Ask → execute",
    icon: <ZapIcon />,
    description:
      "Type what you need. The agent maps intent to allowlisted actions and updates your workspace.",
  },
  {
    title: "Phased roadmaps",
    icon: <CpuIcon />,
    description:
      "Break goals into phases and tasks. Progress rolls up so you always know where you stand.",
  },
  {
    title: "Safe by default",
    icon: <FingerprintIcon />,
    description:
      "Clerk auth, scoped requests, and an agent that only runs actions you explicitly allow.",
  },
  {
    title: "Your loops",
    icon: <PencilIcon />,
    description:
      "Habits, deadlines, and plans shaped around how you work — not a generic todo template.",
  },
  {
    title: "Full control",
    icon: <Settings2Icon />,
    description:
      "Typed OpenAPI contracts and allowlisted handlers. You see every action before it lands.",
  },
  {
    title: "Built for agents",
    icon: <SparklesIcon />,
    description:
      "JSON schemas, not chat theater — the assistant talks to your real plans and habits.",
  },
]

export function FeatureSection({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "relative w-full bg-zinc-50 pt-16 pb-16 text-zinc-950 sm:pt-24 sm:pb-24",
        className
      )}
    >
      <div className="mx-auto w-full max-w-5xl space-y-8 px-5 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-[family-name:var(--font-landing-display)] text-balance text-2xl font-semibold tracking-tight text-zinc-950 md:text-4xl lg:text-5xl">
            Power. Speed. Control.
          </h2>
          <p className="mt-4 text-balance text-sm text-zinc-500 md:text-base">
            Everything you need to plan, loop, and ship — in one high-density workspace.
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-200">
          <div className="grid grid-cols-1 gap-px sm:grid-cols-2 md:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard feature={feature} key={feature.title} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function FeatureCard({
  feature,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  feature: FeatureType
}) {
  return (
    <div
      className={cn("relative overflow-hidden bg-white p-6", className)}
      {...props}
    >
      <div className="pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 size-full [mask-image:radial-gradient(farthest-side_at_top,white,transparent)]">
        <GridPattern
          className="absolute inset-0 size-full fill-zinc-950/[0.03] stroke-zinc-950/15"
          height={40}
          width={40}
          x={20}
        />
      </div>
      <div className="[&_svg]:size-6 [&_svg]:text-zinc-700">{feature.icon}</div>
      <h3 className="mt-10 font-[family-name:var(--font-landing-display)] text-sm font-semibold tracking-tight text-zinc-950 md:text-base">
        {feature.title}
      </h3>
      <p className="relative z-20 mt-2 text-xs font-light leading-relaxed text-zinc-500">
        {feature.description}
      </p>
    </div>
  )
}
