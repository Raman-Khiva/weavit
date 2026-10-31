"use client"

import { useCallback, useRef, useState, type ReactNode } from "react"
import {
  AlertCircle,
  Check,
  CircleCheck,
  CornerDownLeft,
  CornerDownRight,
  Flame,
  Loader2,
  NotebookPen,
  Undo2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

/* ---------- types ---------- */

export type ItemKind = "habit_log" | "task_log" | "task_update"
type ItemState = "queued" | "running" | "done" | "failed" | "skipped"

export type RunItem = {
  id: string
  kind: ItemKind
  target: string // human name, never an id
  detail: string // what will be written
  state: ItemState
}

export type Run =
  | { status: "idle" }
  | { status: "planning"; prompt: string }
  | { status: "executing"; prompt: string; items: RunItem[] }
  | { status: "done"; prompt: string; items: RunItem[] }
  | { status: "nomatch"; prompt: string; suggestions: string[] }
  | { status: "error"; prompt: string; message: string }

/* ---------- state machine hook ---------- */

type Described = Pick<RunItem, "kind" | "target" | "detail"> & { valid: boolean }

type Deps<A> = {
  plan: (prompt: string) => Promise<A[]> // calls /api/agent, returns validated actions
  describe: (action: A) => Described // resolve ids to names, valid=false if id unknown
  execute: (action: A) => Promise<(() => Promise<void>) | void> // returns an undo fn
  suggest?: () => string[] // closest habits/tasks for the no-match state
}

export function useAgentRun<A>({ plan, describe, execute, suggest }: Deps<A>) {
  const [run, setRun] = useState<Run>({ status: "idle" })
  const undos = useRef<(() => Promise<void>)[]>([])
  const runId = useRef(0)

  const patchItem = (id: string, state: ItemState) =>
    setRun((r) =>
      r.status === "executing"
        ? { ...r, items: r.items.map((i) => (i.id === id ? { ...i, state } : i)) }
        : r
    )

  const submit = useCallback(
    async (prompt: string) => {
      const mine = ++runId.current
      undos.current = []
      setRun({ status: "planning", prompt })

      let actions: A[]
      try {
        actions = await plan(prompt)
      } catch (err) {
        console.error("agent plan failed", err)
        if (mine === runId.current)
          setRun({
            status: "error",
            prompt,
            message:
              err instanceof Error && err.message
                ? err.message
                : "Couldn’t reach the agent. Try again.",
          })
        return
      }
      if (mine !== runId.current) return

      const described = actions.map((a, i) => ({ a, d: describe(a), id: String(i) }))
      const valid = described.filter((x) => x.d.valid)

      if (valid.length === 0) {
        setRun({ status: "nomatch", prompt, suggestions: suggest?.() ?? [] })
        return
      }

      const items: RunItem[] = described.map(({ d, id }) => ({
        id,
        kind: d.kind,
        target: d.target,
        detail: d.valid ? d.detail : "Couldn’t match, skipped",
        state: d.valid ? "queued" : "skipped",
      }))
      setRun({ status: "executing", prompt, items })

      // sequential on purpose: a log must land before the status flips
      for (const { a, d, id } of described) {
        if (!d.valid) continue
        if (mine !== runId.current) return
        patchItem(id, "running")
        try {
          const undo = await execute(a)
          if (undo) undos.current.push(undo)
          patchItem(id, "done")
        } catch {
          patchItem(id, "failed")
        }
      }
      setRun((r) => (r.status === "executing" ? { ...r, status: "done" } : r))
    },
    [plan, describe, execute, suggest]
  )

  const undo = useCallback(async () => {
    for (const fn of [...undos.current].reverse()) {
      try {
        await fn()
      } catch {
        /* ignore undo failures */
      }
    }
    undos.current = []
    setRun({ status: "idle" })
  }, [])

  const dismiss = useCallback(() => {
    runId.current++
    setRun({ status: "idle" })
  }, [])

  return { run, submit, undo, dismiss }
}

/* ---------- ui ---------- */

const KIND = {
  habit_log: { icon: Flame, label: "Habit log" },
  task_log: { icon: NotebookPen, label: "Task log" },
  task_update: { icon: CircleCheck, label: "Task update" },
} as const

const EXAMPLES = [
  "Solved 2 DP problems, finished the auth route",
  "Move Math Quiz to high priority",
  "Read for 30 minutes",
]

export function AgentInput({
  run,
  onSubmit,
}: {
  run: Run
  onSubmit: (prompt: string) => void
}) {
  const [value, setValue] = useState("")
  const busy = run.status === "planning" || run.status === "executing"

  const send = () => {
    const v = value.trim()
    if (!v || busy) return
    setValue("")
    onSubmit(v)
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/15 bg-neutral-900 px-4 py-3.5">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            send()
          }
        }}
        rows={2}
        placeholder={EXAMPLES[0]}
        disabled={busy}
        className="w-full resize-none bg-transparent text-[15px] text-neutral-100 outline-none placeholder:text-neutral-600 disabled:opacity-50"
      />
      <div className="mt-1 flex items-center justify-between text-xs text-neutral-600">
        <span>{busy ? "Running…" : "Press ⌘K anywhere to focus"}</span>
        <button
          type="button"
          onClick={send}
          aria-label="Send"
          disabled={busy}
          className="rounded-md p-1 text-neutral-400 hover:bg-white/5 hover:text-neutral-100 disabled:opacity-40"
        >
          <CornerDownLeft className="size-4" />
        </button>
      </div>
      {busy && (
        <div className="absolute bottom-0 h-0.5 w-[30%] bg-emerald-400 [animation:agent-slide_1.2s_ease-in-out_infinite]" />
      )}
    </div>
  )
}

function StatusLine({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="mx-0.5 my-3.5 flex items-center gap-2.5 text-sm text-neutral-400">
      {icon}
      <span>{text}</span>
    </div>
  )
}

function ItemRow({ item, index }: { item: RunItem; index: number }) {
  const { icon: Icon, label } = KIND[item.kind]
  return (
    <div
      style={{ animationDelay: `${index * 90}ms` }}
      className="flex animate-in fade-in slide-in-from-bottom-1 items-center gap-3.5 rounded-xl border border-white/10 bg-neutral-900 px-4 py-3.5 duration-300 fill-mode-both"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-white/5 text-neutral-400">
        <Icon className="size-[18px]" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs text-neutral-500">{label}</div>
        <div className="truncate text-[15px] font-medium text-neutral-100">
          {item.target}
        </div>
        <div className="truncate text-[13px] text-neutral-400">{item.detail}</div>
      </div>
      {item.state === "done" && <Check className="size-5 text-emerald-400" />}
      {item.state === "running" && (
        <Loader2 className="size-4 animate-spin text-neutral-200" />
      )}
      {item.state === "queued" && (
        <span className="size-4 rounded-full border border-dashed border-white/30" />
      )}
      {item.state === "failed" && <AlertCircle className="size-5 text-amber-400" />}
      {item.state === "skipped" && <AlertCircle className="size-5 text-neutral-500" />}
    </div>
  )
}

export function AgentRunPanel({
  run,
  onUndo,
  onDismiss,
  onPick,
}: {
  run: Run
  onUndo: () => void
  onDismiss: () => void
  onPick?: (name: string) => void
}) {
  if (run.status === "idle") return null

  if (run.status === "planning")
    return (
      <>
        <StatusLine
          icon={<Loader2 className="size-4 animate-spin" />}
          text="Reading your habits and tasks…"
        />
        <div className="grid gap-2.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{ animationDelay: `${i * 90}ms` }}
              className="h-[66px] animate-in fade-in rounded-xl border border-white/10 bg-neutral-900 fill-mode-both"
            />
          ))}
        </div>
      </>
    )

  if (run.status === "nomatch")
    return (
      <>
        <StatusLine
          icon={<AlertCircle className="size-[18px] text-amber-400" />}
          text="Couldn’t match that to a habit or task"
        />
        {run.suggestions.length > 0 && (
          <>
            <div className="mx-0.5 mb-2.5 text-[13px] text-neutral-500">
              Closest matches
            </div>
            <div className="flex flex-wrap gap-2">
              {run.suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onPick?.(s)}
                  className="rounded-full border border-white/15 px-3 py-1 text-[13px] text-neutral-200 hover:bg-white/5"
                >
                  {s}
                </button>
              ))}
            </div>
          </>
        )}
        <div className="mt-3.5 flex justify-end">
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-neutral-200 hover:bg-white/5"
          >
            Dismiss
          </button>
        </div>
      </>
    )

  if (run.status === "error")
    return (
      <>
        <StatusLine
          icon={<AlertCircle className="size-[18px] text-amber-400" />}
          text={run.message}
        />
        <div className="mt-3.5 flex justify-end">
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-neutral-200 hover:bg-white/5"
          >
            Dismiss
          </button>
        </div>
      </>
    )

  const doneCount = run.items.filter((i) => i.state === "done").length
  const total = run.items.filter((i) => i.state !== "skipped").length
  const finished = run.status === "done"
  const pct = Math.round(
    (doneCount / Math.max(1, total)) * 100
  )

  return (
    <>
      <StatusLine
        icon={
          finished ? (
            <Check className="size-[18px] text-emerald-400" />
          ) : (
            <Loader2 className="size-4 animate-spin" />
          )
        }
        text={
          finished
            ? `${doneCount} of ${total} actions done`
            : `Applying action ${Math.min(doneCount + 1, total)} of ${total}…`
        }
      />
      <div className="relative mb-3 h-0.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="absolute inset-y-0 left-0 bg-emerald-400 transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="grid max-h-[50vh] gap-2.5 overflow-y-auto pr-0.5">
        {run.items.map((item, i) => (
          <ItemRow key={item.id} item={item} index={i} />
        ))}
      </div>
      {finished && (
        <div className="mt-3.5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onUndo}
            className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-sm text-neutral-200 hover:bg-white/5"
          >
            <Undo2 className="size-4" /> Undo
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-neutral-200 hover:bg-white/5"
          >
            Dismiss
          </button>
        </div>
      )}
    </>
  )
}

/** Virtual modal that hosts the full run UI — nothing renders under the input bar. */
export function AgentRunModal({
  run,
  onUndo,
  onDismiss,
  onPick,
}: {
  run: Run
  onUndo: () => void
  onDismiss: () => void
  onPick?: (name: string) => void
}) {
  const open = run.status !== "idle"
  const busy = run.status === "planning" || run.status === "executing"
  const prompt = "prompt" in run ? run.prompt : ""

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !busy) onDismiss()
      }}
    >
      <DialogContent
        showCloseButton={!busy}
        className="max-h-[min(85vh,640px)] w-full gap-0 overflow-hidden border border-white/10 bg-neutral-950 p-0 text-neutral-100 sm:max-w-lg"
        onPointerDownOutside={(e) => {
          if (busy) e.preventDefault()
        }}
        onEscapeKeyDown={(e) => {
          if (busy) e.preventDefault()
        }}
      >
        <DialogHeader className="border-b border-white/10 px-4 py-3.5">
          <DialogTitle className="sr-only">Agent run</DialogTitle>
          <DialogDescription className="sr-only">
            Progress for the current agent command
          </DialogDescription>
          <div className="flex items-center gap-2.5 pr-8 text-[15px] text-neutral-100">
            <CornerDownRight className="size-4 shrink-0 text-neutral-500" />
            <span className="truncate">{prompt}</span>
          </div>
          {run.status === "planning" && (
            <div className="relative -mx-4 mt-3 h-0.5 overflow-hidden bg-white/5">
              <div className="absolute bottom-0 h-0.5 w-[30%] bg-emerald-400 [animation:agent-slide_1.2s_ease-in-out_infinite]" />
            </div>
          )}
        </DialogHeader>
        <div className="px-4 pb-4 pt-1">
          <AgentRunPanel
            run={run}
            onUndo={onUndo}
            onDismiss={onDismiss}
            onPick={onPick}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
