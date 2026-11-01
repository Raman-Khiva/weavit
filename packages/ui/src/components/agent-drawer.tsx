"use client"

import * as React from "react"
import {
  ArrowUpRight,
  Bot,
  CornerDownLeft,
  Loader2,
  PanelRightOpen,
  User,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import {
  AgentRunPanel,
  type Run,
} from "@workspace/ui/components/agent-run"
import { cn } from "@workspace/ui/lib/utils"

export type AgentChatMessage = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  createdAt?: number
}

export type AgentDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  messages: AgentChatMessage[]
  run: Run
  draft: string
  onDraftChange: (value: string) => void
  onSubmit: (prompt: string) => void
  onUndo: () => void
  onDismissRun: () => void
  onPickSuggestion?: (name: string) => void
  /** When set, shows escalate CTA to the full agent page with live preview */
  escalateHref?: string
  escalateLabel?: string
  escalateHint?: string
  title?: string
  subtitle?: string
  className?: string
}

function MessageBubble({ message }: { message: AgentChatMessage }) {
  const isUser = message.role === "user"
  const isSystem = message.role === "system"

  if (isSystem) {
    return (
      <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        {message.content}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex gap-2.5",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border",
          isUser
            ? "border-border bg-background text-foreground"
            : "border-border/80 bg-muted/40 text-muted-foreground"
        )}
      >
        {isUser ? (
          <User className="size-3.5" />
        ) : (
          <Bot className="size-3.5" />
        )}
      </span>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
          isUser
            ? "rounded-tr-md bg-primary text-primary-foreground"
            : "rounded-tl-md border border-border/70 bg-card text-foreground"
        )}
      >
        {message.content}
      </div>
    </div>
  )
}

export function AgentDrawer({
  open,
  onOpenChange,
  messages,
  run,
  draft,
  onDraftChange,
  onSubmit,
  onUndo,
  onDismissRun,
  onPickSuggestion,
  escalateHref = "/agent",
  escalateLabel = "Open full agent",
  escalateHint = "Need a roadmap preview or multi-step plan? Continue in the full agent with live workspace preview.",
  title = "Weavit agent",
  subtitle = "Quick actions & conversation",
  className,
}: AgentDrawerProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const busy = run.status === "planning" || run.status === "executing"

  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, run])

  const send = () => {
    const text = draft.trim()
    if (!text || busy) return
    onSubmit(text)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className={cn(
          "w-full gap-0 p-0 sm:max-w-md",
          className
        )}
      >
        <SheetHeader className="space-y-0 border-b border-border px-4 py-3.5 text-left">
          <div className="flex items-start justify-between gap-3 pr-8">
            <div className="min-w-0">
              <SheetTitle className="flex items-center gap-2 text-sm font-semibold">
                <PanelRightOpen className="size-4 text-muted-foreground" />
                {title}
              </SheetTitle>
              <SheetDescription className="mt-0.5 text-xs text-muted-foreground">
                {subtitle}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {escalateHref ? (
          <div className="border-b border-border/80 bg-muted/20 px-4 py-3">
            <p className="text-xs leading-relaxed text-muted-foreground">
              {escalateHint}
            </p>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="mt-2 h-8 gap-1.5 text-xs"
            >
              <a href={escalateHref}>
                {escalateLabel}
                <ArrowUpRight className="size-3.5" />
              </a>
            </Button>
          </div>
        ) : null}

        <div
          ref={scrollRef}
          className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4"
        >
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl border border-border bg-card">
                <Bot className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">
                Ask anything about today
              </p>
              <p className="max-w-[240px] text-xs text-muted-foreground">
                Log habits, update tasks, or ask what&apos;s pending — replies
                stay here so you never leave the dashboard.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}

          {run.status !== "idle" ? (
            <div className="rounded-xl border border-border/70 bg-background/60 p-3">
              <AgentRunPanel
                run={run}
                onUndo={onUndo}
                onDismiss={onDismissRun}
                onPick={onPickSuggestion}
              />
            </div>
          ) : null}
        </div>

        <div className="border-t border-border p-3">
          <div className="relative rounded-xl border border-border bg-card focus-within:ring-1 focus-within:ring-ring/40">
            <textarea
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
              rows={3}
              disabled={busy}
              placeholder="What's pending today? Log a habit, update a task…"
              className="w-full resize-none rounded-xl bg-transparent px-3.5 py-3 pr-12 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
            />
            <Button
              type="button"
              size="icon-sm"
              className="absolute right-2.5 bottom-2.5"
              onClick={send}
              disabled={busy || !draft.trim()}
              aria-label="Send"
            >
              {busy ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <CornerDownLeft className="size-3.5" />
              )}
            </Button>
          </div>
          <p className="mt-1.5 text-center text-[11px] text-muted-foreground">
            Enter to send · Shift+Enter for a new line
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export type AgentInlineComposerProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: (prompt: string) => void
  busy?: boolean
  placeholder?: string
  hints?: string[]
  onHint?: (hint: string) => void
  className?: string
}

/** Compact dashboard composer — submit opens the agent drawer. */
export function AgentInlineComposer({
  value,
  onChange,
  onSubmit,
  busy = false,
  placeholder = "Ask the agent — habits, tasks, deadlines…",
  hints,
  onHint,
  className,
}: AgentInlineComposerProps) {

  
  const send = () => {
    const text = value.trim()
    if (!text || busy) return
    onSubmit(text)
  }

  return (
    <div className={cn("w-full max-w-xl", className)}>
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/60 focus-within:ring-1 focus-within:ring-ring/40">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
          rows={2}
          disabled={busy}
          placeholder={placeholder}
          className="w-full resize-none bg-transparent px-4 py-3.5 pr-14 text-[15px] outline-none placeholder:text-muted-foreground disabled:opacity-50"
        />
        <Button
          type="button"
          size="icon"
          className="absolute right-3 bottom-3 size-9 rounded-xl"
          onClick={send}
          disabled={busy || !value.trim()}
          aria-label="Open agent drawer"
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <CornerDownLeft className="size-4" />
          )}
        </Button>
        {busy ? (
          <div className="absolute bottom-0 h-0.5 w-[30%] bg-foreground/40 [animation:agent-slide_1.2s_ease-in-out_infinite]" />
        ) : null}
      </div>

      {hints && hints.length > 0 ? (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {hints.map((hint) => (
            <button
              key={hint}
              type="button"
              onClick={() => onHint?.(hint)}
              className="rounded-full border border-border/70 bg-background/40 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              {hint}
            </button>
          ))}
        </div>
      ) : null}

      <p className="mt-2 text-xs text-muted-foreground">
        Replies open in the right drawer. For live plan preview, use{" "}
        <a
          href="/agent"
          className="font-medium text-foreground underline underline-offset-4"
        >
          full agent
        </a>
        .
      </p>
    </div>
  )
}
