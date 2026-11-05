"use client"

import {
  Bot,
  CalendarDays,
  Flame,
  FolderKanban,
} from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

export function PlatformCapabilities({ className }: { className?: string }) {
  return (
    <section
      id="features"
      className={cn(
        "relative w-full bg-zinc-50 py-24 font-[family-name:var(--font-landing-body)] text-zinc-950 sm:py-32 selection:bg-zinc-950 selection:text-white dark:bg-[#07080a] dark:text-white dark:selection:bg-white dark:selection:text-black",
        className
      )}
    >
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <div className="mb-16 flex flex-col items-center text-center">
          <div className="mb-6 inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium uppercase tracking-widest text-zinc-500 dark:border-white/[0.12] dark:bg-white/[0.03] dark:text-neutral-400">
            Platform Capabilities
          </div>
          <h2 className="mb-4 max-w-3xl text-balance font-[family-name:var(--font-landing-display)] text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl md:text-6xl dark:text-white">
            Everything you need. <br className="hidden sm:block" />
            <span className="text-zinc-400 dark:text-neutral-600">
              Nothing you don&apos;t.
            </span>
          </h2>
          <p className="max-w-2xl text-balance text-base text-zinc-600 sm:text-lg dark:text-neutral-400">
            Roadmaps, habits, deadlines, and an allowlisted agent — one workspace
            for builders who ship. No bloat, no five-app shuffle.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-2">
          {/* Agent — large */}
          <div className="group flex min-h-[320px] flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-colors hover:border-zinc-300 md:col-span-2 dark:border-white/[0.08] dark:bg-[#050505] dark:hover:border-white/[0.15]">
            <div className="relative flex flex-1 items-center justify-center p-8">
              <div className="w-full max-w-md overflow-hidden rounded-lg border border-zinc-200 bg-zinc-950 font-mono text-[11px] leading-relaxed text-neutral-500 sm:text-xs dark:border-white/[0.08] dark:bg-black">
                <div className="flex border-b border-white/[0.08] px-4 py-2">
                  <div className="flex gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-white/[0.15]" />
                    <div className="h-2 w-2 rounded-full bg-white/[0.15]" />
                    <div className="h-2 w-2 rounded-full bg-white/[0.15]" />
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between gap-3">
                    <span className="text-white">ask &quot;create SDE prep roadmap&quot;</span>
                    <span className="shrink-0">[OK]</span>
                  </div>
                  <div className="mt-2 flex justify-between text-neutral-400">
                    <span>map intent → create_project</span>
                    <span>schema</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>allowlist check…</span>
                    <span>pass</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>POST /projects + phases</span>
                    <span>201</span>
                  </div>
                  <div className="mt-4 flex items-center gap-2 border-t border-white/[0.08] pt-4 text-white">
                    <span className="flex h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    Plan created · 4 phases · 16 tasks
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-zinc-100 bg-zinc-50/80 p-6 dark:border-white/[0.04] dark:bg-white/[0.01]">
              <div className="mb-2 flex items-center gap-2 text-zinc-950 dark:text-white">
                <Bot className="h-4 w-4" />
                <h3 className="text-sm font-medium">Allowlisted agent</h3>
              </div>
              <p className="text-sm text-zinc-600 dark:text-neutral-400">
                Prompt once. Intent maps to typed actions your API already understands —
                create plans, log habits, complete tasks. No free-form tool chaos.
              </p>
            </div>
          </div>

          {/* Roadmaps — small */}
          <div className="group flex min-h-[320px] flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-colors hover:border-zinc-300 dark:border-white/[0.08] dark:bg-[#050505] dark:hover:border-white/[0.15]">
            <div className="flex flex-1 items-center justify-center p-8">
              <div className="flex w-full flex-col gap-2">
                {["Foundations", "DSA Deep Dive", "System Design"].map((phase, i) => (
                  <div
                    key={phase}
                    className="flex h-9 w-full items-center justify-between rounded border border-zinc-200 bg-zinc-50 px-3 dark:border-white/[0.04] dark:bg-white/[0.02]"
                  >
                    <span className="truncate text-[11px] text-zinc-700 dark:text-neutral-300">
                      {phase}
                    </span>
                    <span className="text-[10px] tabular-nums text-zinc-500 dark:text-neutral-500">
                      {[28, 54, 12][i]}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-zinc-100 bg-zinc-50/80 p-6 dark:border-white/[0.04] dark:bg-white/[0.01]">
              <div className="mb-2 flex items-center gap-2 text-zinc-950 dark:text-white">
                <FolderKanban className="h-4 w-4" />
                <h3 className="text-sm font-medium">Phased roadmaps</h3>
              </div>
              <p className="text-sm text-zinc-600 dark:text-neutral-400">
                Break goals into phases and tasks. Progress rolls up so you always see
                where you stand.
              </p>
            </div>
          </div>

          {/* Habits — small */}
          <div className="group flex min-h-[320px] flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-colors hover:border-zinc-300 dark:border-white/[0.08] dark:bg-[#050505] dark:hover:border-white/[0.15]">
            <div className="flex flex-1 items-center justify-center p-8">
              <div className="grid w-full max-w-[200px] grid-cols-7 gap-1.5">
                {Array.from({ length: 28 }).map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "aspect-square rounded-sm",
                      i % 7 === 0
                        ? "bg-zinc-200 dark:bg-white/[0.06]"
                        : i % 3 === 0
                          ? "bg-emerald-500/80 dark:bg-emerald-400/80"
                          : "bg-emerald-500/25 dark:bg-emerald-400/25"
                    )}
                  />
                ))}
              </div>
            </div>
            <div className="border-t border-zinc-100 bg-zinc-50/80 p-6 dark:border-white/[0.04] dark:bg-white/[0.01]">
              <div className="mb-2 flex items-center gap-2 text-zinc-950 dark:text-white">
                <Flame className="h-4 w-4" />
                <h3 className="text-sm font-medium">Daily habit loops</h3>
              </div>
              <p className="text-sm text-zinc-600 dark:text-neutral-400">
                Check-ins and streaks beside your plans — momentum that compounds
                instead of resetting in another app.
              </p>
            </div>
          </div>

          {/* Deadlines — large */}
          <div className="group flex min-h-[320px] flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-colors hover:border-zinc-300 md:col-span-2 dark:border-white/[0.08] dark:bg-[#050505] dark:hover:border-white/[0.15]">
            <div className="relative flex flex-1 items-center justify-center p-8">
              <div className="flex w-full max-w-sm flex-col gap-3">
                {[
                  { title: "Math Quiz", due: "Today · 14:00", pri: "high" },
                  { title: "Auth milestone", due: "Oct 23", pri: "high" },
                  { title: "Write docs", due: "Oct 30", pri: "low" },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between gap-3 rounded border border-zinc-200 bg-zinc-50 px-3 py-2.5 dark:border-white/[0.08] dark:bg-white/[0.02]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm text-zinc-950 dark:text-white">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-neutral-500">
                        {item.due}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                        item.pri === "high"
                          ? "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300"
                          : "bg-zinc-200 text-zinc-600 dark:bg-white/[0.06] dark:text-neutral-400"
                      )}
                    >
                      {item.pri}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-zinc-100 bg-zinc-50/80 p-6 dark:border-white/[0.04] dark:bg-white/[0.01]">
              <div className="mb-2 flex items-center gap-2 text-zinc-950 dark:text-white">
                <CalendarDays className="h-4 w-4" />
                <h3 className="text-sm font-medium">Deadlines in view</h3>
              </div>
              <p className="text-sm text-zinc-600 dark:text-neutral-400">
                Priority-tagged dates next to the work that owns them. No calendar
                hopscotch — what&apos;s due stays where you execute.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
