"use client"

import { MessageSquareText, NotebookPen, SearchIcon, XIcon } from "lucide-react"
import { type ReactNode, useMemo, useState } from "react"
import { cn } from "@workspace/ui/lib/utils"

export type JournalStatus = "done" | "missed"

export interface JournalEntry {
  id: string
  ts: number
  status: JournalStatus
  /** A time or a count, such as "45 min" or "12 pages". */
  quantity?: string
  /** One sentence describing what happened. */
  entry: string
  remark?: string
}

export interface JournalNote {
  id: string
  ts: number
  content: string
}

export interface LogStreamProps {
  entries?: JournalEntry[]
  notes?: JournalNote[]
  title?: string
  className?: string
}

const STATUSES: { id: JournalStatus; label: string; chip: string; dot: string }[] = [
  {
    id: "done",
    label: "Done",
    chip: "text-emerald-300",
    dot: "bg-emerald-400",
  },
  {
    id: "missed",
    label: "Missed",
    chip: "text-rose-300",
    dot: "bg-rose-400",
  },
]

const statusInfo = Object.fromEntries(STATUSES.map((status) => [status.id, status])) as Record<
  JournalStatus,
  (typeof STATUSES)[number]
>

function formatWhen(ts: number) {
  const date = new Date(ts)
  const day = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date)
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
  return `${day}, ${time}`
}

function Mark({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>
  const out: ReactNode[] = []
  const lower = text.toLowerCase()
  let at = 0
  let hit = lower.indexOf(query)
  while (hit !== -1) {
    out.push(text.slice(at, hit))
    out.push(
      <mark className="rounded-sm bg-white/15 px-0.5 text-inherit" key={`${hit}-${at}`}>
        {text.slice(hit, hit + query.length)}
      </mark>
    )
    at = hit + query.length
    hit = lower.indexOf(query, at)
  }
  out.push(text.slice(at))
  return <>{out}</>
}

export function LogStream({
  entries = [],
  notes = [],
  title = "Journal",
  className,
}: LogStreamProps) {
  const [tab, setTab] = useState<"entries" | "notes">("entries")
  const [statuses, setStatuses] = useState<Set<JournalStatus>>(new Set(["done", "missed"]))
  const [query, setQuery] = useState("")
  const q = query.trim().toLowerCase()

  const counts = useMemo(() => {
    const tally: Record<JournalStatus, number> = { done: 0, missed: 0 }
    for (const entry of entries) tally[entry.status] += 1
    return tally
  }, [entries])

  const visibleEntries = useMemo(() => {
    return [...entries]
      .filter((entry) => statuses.has(entry.status))
      .filter((entry) => {
        if (!q) return true
        return [entry.entry, entry.quantity, entry.remark].filter(Boolean).join(" ").toLowerCase().includes(q)
      })
      .sort((a, b) => b.ts - a.ts)
  }, [entries, statuses, q])

  const visibleNotes = useMemo(() => {
    return [...notes]
      .filter((note) => !q || note.content.toLowerCase().includes(q))
      .sort((a, b) => b.ts - a.ts)
  }, [notes, q])

  const toggleStatus = (status: JournalStatus) => {
    setStatuses((current) => {
      const next = new Set(current)
      if (next.has(status) && next.size > 1) next.delete(status)
      else next.add(status)
      return next
    })
  }

  return (
    <section
      aria-label={title}
      className={cn(
        "flex w-full min-w-0 flex-col rounded-2xl border border-white/10 bg-white/[0.03]",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-3 border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        <div role="tablist" aria-label="Journal sections" className="inline-flex rounded-lg border border-white/10 p-0.5">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "entries"}
            onClick={() => setTab("entries")}
            className={cn(
              "h-7 rounded-md px-2.5 text-xs font-medium",
              tab === "entries" ? "bg-white/10 text-white" : "text-white/50 hover:text-white"
            )}
          >
            Entries
            <span className="ml-1.5 tabular-nums text-white/45">{entries.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "notes"}
            onClick={() => setTab("notes")}
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium",
              tab === "notes" ? "bg-white/10 text-white" : "text-white/50 hover:text-white"
            )}
          >
            <NotebookPen className="size-3.5" aria-hidden />
            Notes
            <span className="tabular-nums text-white/45">{notes.length}</span>
          </button>
        </div>

        <div className="ml-auto flex min-w-[16rem] flex-1 items-center justify-end gap-2">
          {tab === "entries" && (
            <div aria-label="Status" className="flex items-center gap-1" role="group">
              {STATUSES.map((status) => {
                const on = statuses.has(status.id)
                return (
                  <button
                    key={status.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleStatus(status.id)}
                    className={cn(
                      "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium",
                      on
                        ? "border-white/25 bg-white/10 text-white"
                        : "border-white/10 text-white/40 hover:text-white"
                    )}
                  >
                    <span className={cn("size-1.5 rounded-full", status.dot, !on && "opacity-40")} />
                    {status.label}
                    <span className="tabular-nums text-white/40">{counts[status.id]}</span>
                  </button>
                )
              })}
            </div>
          )}
          <label className="relative flex h-8 w-full max-w-56 items-center rounded-lg border border-white/10 bg-black/30">
            <SearchIcon className="ms-2 size-3.5 shrink-0 text-white/40" />
            <input
              aria-label={tab === "entries" ? "Search entries" : "Search notes"}
              className="h-full min-w-0 flex-1 bg-transparent px-1.5 text-xs text-white outline-none placeholder:text-white/35"
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setQuery("")
              }}
              placeholder={tab === "entries" ? "Search entries" : "Search notes"}
              value={query}
            />
            {query && (
              <button
                aria-label="Clear search"
                className="me-1 grid size-6 place-items-center rounded-md text-white/45 hover:text-white"
                onClick={() => setQuery("")}
                type="button"
              >
                <XIcon className="size-3" />
              </button>
            )}
          </label>
        </div>
      </div>

      {tab === "entries" ? (
        visibleEntries.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-white/50">
            {q ? `Nothing matches “${query.trim()}”.` : "No entries yet."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-[11px] font-medium uppercase tracking-wide text-white/40">
                  <th className="px-4 py-2.5 font-medium">Date</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-3 py-2.5 font-medium">Quantity</th>
                  <th className="px-3 py-2.5 font-medium">Entry</th>
                  <th className="w-12 px-3 py-2.5 text-center font-medium">
                    <span className="sr-only">Remark</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleEntries.map((entry) => {
                  const status = statusInfo[entry.status]
                  return (
                    <tr key={entry.id} className="border-b border-white/10 last:border-b-0">
                      <td className="whitespace-nowrap px-4 py-3 align-middle text-white/70 tabular-nums">
                        {formatWhen(entry.ts)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 align-middle">
                        <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", status.chip)}>
                          <span className={cn("size-1.5 rounded-full", status.dot)} aria-hidden />
                          {status.label}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 align-middle text-white/70 tabular-nums">
                        {entry.quantity ?? "—"}
                      </td>
                      <td className="px-3 py-3 align-middle text-white/85">
                        <Mark query={q} text={entry.entry} />
                      </td>
                      <td className="px-3 py-3 text-center align-middle">
                        {entry.remark ? (
                          <span
                            className="inline-flex size-7 items-center justify-center rounded-md text-sky-300"
                            title={entry.remark}
                            aria-label={`Remark: ${entry.remark}`}
                          >
                            <MessageSquareText className="size-4" aria-hidden />
                          </span>
                        ) : null}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      ) : visibleNotes.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-white/50">
          {q ? `Nothing matches “${query.trim()}”.` : "No notes yet."}
        </p>
      ) : (
        <ul className="divide-y divide-white/10">
          {visibleNotes.map((note) => (
            <li key={note.id} className="flex items-start gap-4 px-4 py-3">
              <span className="w-32 shrink-0 pt-0.5 text-xs tabular-nums text-white/45">
                {formatWhen(note.ts)}
              </span>
              <p className="min-w-0 text-sm leading-relaxed text-white/80">
                <Mark query={q} text={note.content} />
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
