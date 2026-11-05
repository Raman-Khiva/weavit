"use client"

import {
  Calendar,
  Check,
  CircleCheck,
  Flame,
  ListTodo,
  NotebookPen,
  Target,
  X,
} from "lucide-react"

import type { ActionItem } from "./schema.agent"
import {
  describeAgentAction,
  type AgentWorkspaceState,
} from "./actions.agent"

export function ActionCard({
  action,
  state,
  failed,
  reason,
}: {
  action: ActionItem
  state: AgentWorkspaceState
  failed?: boolean
  reason?: string
}) {
  const meta = describeAgentAction(action, state)
  const Icon = meta.kind.startsWith("habit")
    ? Flame
    : meta.kind.startsWith("todo")
      ? ListTodo
      : meta.kind.startsWith("deadline")
        ? Target
        : meta.kind.startsWith("event")
          ? Calendar
          : meta.kind.includes("log")
            ? NotebookPen
            : CircleCheck

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 ${
        failed
          ? "border-destructive/40 bg-destructive/5"
          : "border-border/70 bg-card"
      }`}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-muted-foreground">{meta.label}</p>
        <p className="truncate text-sm font-medium text-foreground">{meta.target}</p>
        <p className="truncate text-xs text-muted-foreground">
          {failed && reason ? reason : meta.detail}
        </p>
      </div>
      <span
        className={`inline-flex items-center gap-1 text-[11px] font-medium ${
          failed ? "text-destructive" : "text-emerald-500"
        }`}
      >
        {failed ? <X className="size-3.5" /> : <Check className="size-3.5" />}
        {failed ? "Failed" : "Executed"}
      </span>
    </div>
  )
}
