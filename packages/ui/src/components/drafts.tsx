import { FileText, Sparkles } from "lucide-react"

export function Drafts(): JSX.Element {
  return (
    <main className="flex h-full w-full flex-col">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="global-heading">Drafts & Notes</h2>
        <a
          href="/workspace/drafts"
          className="text-sm text-muted-foreground hover:underline"
        >
          View
        </a>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/80 bg-muted/15 px-4 py-8 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
          <Sparkles className="size-3" />
          Coming soon
        </span>
        <FileText className="size-7 text-muted-foreground/45" strokeWidth={1.5} />
        <p className="text-sm font-medium text-foreground">Scratchpads & notes</p>
        <p className="max-w-[16rem] text-xs leading-relaxed text-muted-foreground">
          Capture ideas and promote them into tasks or plans — landing soon.
        </p>
      </div>
    </main>
  )
}
