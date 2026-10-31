"use client"

import Link from "next/link"
import {
  BarChart2,
  CheckCircle2,
  Code,
  FileText,
  FolderOpen,
  Headphones,
  MinusCircle,
  Sliders,
} from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

const COMPARISON_ROWS = [
  {
    icon: FolderOpen,
    title: "Multi-Phase Roadmaps",
    weavit: "Structured plans with note logs",
    manual: "Flat text notes & spreadsheets",
  },
  {
    icon: Sliders,
    title: "Habit & Streak Logic",
    weavit: "Automated streak calculations",
    manual: "Manual calendar cross-offs",
  },
  {
    icon: Code,
    title: "API Access",
    weavit: "Robust developer API & OpenAPI spec",
    manual: "No API available",
  },
  {
    icon: BarChart2,
    title: "Focus Velocity Meter",
    weavit: "Real-time 75-bar vector meter",
    manual: "No focus measurement",
  },
  {
    icon: Headphones,
    title: "Instant Client Engine",
    weavit: "Sub-1ms local state response",
    manual: "Slow page loads & cloud lags",
  },
] as const

function LiveBadge({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs backdrop-blur-md">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <span>{label}</span>
    </div>
  )
}

export function ComparisonSection({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "relative z-10 bg-[#07080a] px-5 py-24 text-white sm:px-10 lg:px-16 lg:py-32",
        className
      )}
    >
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <LiveBadge label="Comparison" />
          <h2 className="mt-6 font-[family-name:var(--font-landing-display)] text-[clamp(2rem,4.2vw,3.5rem)] font-semibold leading-[1.05] tracking-tight text-white">
            See how Weavit{" "}
            <span className="font-serif font-normal italic text-white/80">
              stacks up
            </span>{" "}
            against manual workflows
          </h2>
          <p className="mt-4 max-w-sm text-sm text-white/45 sm:text-base">
            Discover why developers choose Weavit over manual tracking &amp;
            fragmented spreadsheets.
          </p>
        </div>

        <div>
          <div className="grid grid-cols-12 items-stretch">
            <div className="col-span-4 flex items-end border-b border-white/10 pb-4 pr-3">
              <span className="text-xs font-bold tracking-wider text-white/40 uppercase">
                Features
              </span>
            </div>
            <div className="relative z-10 col-span-4 flex flex-col items-center justify-center rounded-t-3xl border-b border-white/10 bg-white/[0.06] p-5 text-center shadow-2xl backdrop-blur-xl sm:p-7">
              <img
                src="/logo-weavit.png"
                alt="Weavit Logo"
                className="mb-2 h-10 w-auto object-contain"
              />
              <h3 className="text-lg font-bold text-white">Weavit</h3>
              <p className="text-[11px] text-white/45">
                Built with developer needs in mind
              </p>
            </div>
            <div className="col-span-4 flex flex-col items-center justify-center border-b border-white/10 pb-4 pl-3 text-center">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] text-white/50">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white/75">Manual Workflow</h3>
              <p className="text-[11px] text-white/40">
                Fragmented apps &amp; spreadsheets
              </p>
            </div>
          </div>

          {COMPARISON_ROWS.map((row) => {
            const RowIcon = row.icon
            return (
              <div
                key={row.title}
                className="grid min-h-[96px] grid-cols-12 items-stretch"
              >
                <div className="col-span-4 flex items-center gap-3 border-b border-white/10 py-4 pr-3">
                  <RowIcon className="h-4 w-4 shrink-0 text-white/45" />
                  <span className="text-xs font-bold text-white sm:text-sm">
                    {row.title}
                  </span>
                </div>
                <div className="relative z-10 col-span-4 flex flex-col items-center justify-center border-b border-white/10 bg-white/[0.06] p-4 text-center shadow-2xl backdrop-blur-xl">
                  <CheckCircle2 className="mb-1.5 h-5 w-5 shrink-0 text-emerald-500" />
                  <span className="text-xs font-medium text-white">
                    {row.weavit}
                  </span>
                </div>
                <div className="col-span-4 flex flex-col items-center justify-center border-b border-white/10 p-4 pl-3 text-center">
                  <MinusCircle className="mb-1.5 h-5 w-5 shrink-0 text-rose-500" />
                  <span className="text-xs font-medium text-white/45">
                    {row.manual}
                  </span>
                </div>
              </div>
            )
          })}

          <div className="grid grid-cols-12">
            <div className="col-span-4" />
            <div className="relative z-10 col-span-4 rounded-b-3xl bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-7">
              <Link
                href="/dashboard"
                className="block w-full rounded-xl bg-white py-3 text-center text-sm font-bold text-zinc-950 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Try Weavit Today
              </Link>
            </div>
            <div className="col-span-4" />
          </div>
        </div>
      </div>
    </section>
  )
}
