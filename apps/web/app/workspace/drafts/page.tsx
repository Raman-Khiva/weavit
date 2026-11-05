"use client"

import Link from "next/link"
import {
  Bot,
  FileText,
  Lightbulb,
  NotebookPen,
  Sparkles,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

const UPCOMING = [
  {
    icon: NotebookPen,
    title: "Scratchpads",
    body: "Capture raw ideas, meeting notes, and half-formed plans without forcing structure.",
  },
  {
    icon: FileText,
    title: "Linked notes",
    body: "Attach context to roadmaps, habits, and tasks so the agent can read what you’re thinking.",
  },
  {
    icon: Bot,
    title: "Agent drafts",
    body: "Ask the agent to outline a note, then refine and pin it into your workspace.",
  },
  {
    icon: Lightbulb,
    title: "Promoted work",
    body: "Turn a draft into a roadmap phase, todo, or habit check-in in one step.",
  },
] as const

function Page(): JSX.Element {
  return (
    <div className="mx-auto flex h-full w-full max-w-5xl flex-col gap-10 p-6 md:p-10">
      <header className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/60 px-6 py-8 sm:px-8 sm:py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.12),transparent_55%)]"
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              <Sparkles className="size-3.5" />
              Coming soon
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Drafts & Notes
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
              A lightweight place for thinking out loud — scratchpads, agent-generated
              outlines, and notes that promote into real workspace actions. We’re
              building this next.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/agent">Ask the agent</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/workspace/todos">Go to tasks</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">What’s planned</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Preview of the drafts surface — not interactive yet.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {UPCOMING.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className={cn(
                "rounded-xl border border-border/80 bg-background/60 p-4",
                "opacity-90"
              )}
            >
              <div className="mb-3 flex size-9 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground">
                <Icon className="size-4" strokeWidth={1.75} />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-5 py-8 text-center">
        <FileText className="mx-auto size-8 text-muted-foreground/50" strokeWidth={1.5} />
        <p className="mt-3 text-sm font-medium text-foreground">
          No drafts yet — this section isn’t live
        </p>
        <p className="mx-auto mt-1.5 max-w-md text-xs text-muted-foreground">
          Meanwhile, capture work as tasks or ask the agent to draft a roadmap you can
          edit in Plans.
        </p>
      </section>
    </div>
  )
}

export default Page
