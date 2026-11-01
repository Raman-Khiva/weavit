"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { Bot, Check, CircleCheck, Flame, Loader2, NotebookPen } from "lucide-react"

import { MessageResponse } from "@workspace/ui/components/ai-elements/message"
import { Button } from "@workspace/ui/components/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import { useGetHabitsQuery } from "../habits/habits.api"
import { useGetProjectsQuery } from "../projects/projects.api"
import { useAgent } from "./agent"
import type { ActionItem } from "./schema.agent"

type ChatTurn = {
  id: string
  prompt: string
  message: string | null
  actions: ActionItem[]
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function actionMeta(action: ActionItem) {
  switch (action.actionType) {
    case "create_habit_log":
      return {
        icon: Flame,
        label: "Habit log",
        detail: action.data.notes,
        target: action.data.habitId,
      }
    case "create_task_log":
      return {
        icon: NotebookPen,
        label: "Task log",
        detail: action.data.text,
        target: action.data.taskId,
      }
    case "patch_task":
      return {
        icon: CircleCheck,
        label: "Task update",
        detail: action.data.note ?? action.data.status ?? action.data.title ?? "Updated",
        target: action.data.taskId,
      }
  }
}

function ActionCard({ action }: { action: ActionItem }) {
  const meta = actionMeta(action)
  const Icon = meta.icon

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card px-3.5 py-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-muted-foreground">{meta.label}</p>
        <p className="truncate text-sm font-medium text-foreground">{meta.target}</p>
        <p className="truncate text-xs text-muted-foreground">{meta.detail}</p>
      </div>
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-500">
        <Check className="size-3.5" />
        Executed
      </span>
    </div>
  )
}

export default function DashboardAgent() {
  const { isLoaded, isSignedIn } = useAuth()
  const skip = !isLoaded || !isSignedIn

  const { data: habits } = useGetHabitsQuery(undefined, { skip })
  const { data: plans } = useGetProjectsQuery(undefined, { skip })

  const [submitQuery, { isLoading }] = useAgent()

  const [input, setInput] = useState("")
  const [open, setOpen] = useState(false)
  const [turns, setTurns] = useState<ChatTurn[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
    })
  }, [turns])

  const flatHabits = useMemo(
    () =>
      habits?.map((h) => ({ habitId: h.id, habitTitle: h.title })) ?? [],
    [habits]
  )

  const flatPlans = useMemo(
    () =>
      plans?.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        phases:
          p.phases?.map((ph) => ({
            phaseId: ph.id,
            title: ph.title,
            tasks:
              ph.tasks?.map((t) => ({
                taskId: t.id,
                title: t.title,
                description: t.description,
                status: t.status,
              })) ?? [],
          })) ?? [],
      })) ?? [],
    [plans]
  )

  const handleSubmit = async () => {
    const prompt = input.trim()
    if (!prompt || isLoading) return

    const turnId = uid()
    setInput("")
    setOpen(true)
    setTurns((prev) => [
      ...prev,
      { id: turnId, prompt, message: null, actions: [] },
    ])

    const result = await submitQuery(prompt, flatHabits, flatPlans)

    setTurns((prev) =>
      prev.map((turn) =>
        turn.id === turnId
          ? {
              ...turn,
              message: result?.message ?? "Something went wrong.",
              actions: result?.actions ?? [],
            }
          : turn
      )
    )
  }

  return (
    <div className="mt-6 w-full max-w-xl">
      <div className="relative rounded-2xl border border-border/80 bg-card/60 focus-within:ring-1 focus-within:ring-ring/40">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              void handleSubmit()
            }
          }}
          rows={2}
          disabled={isLoading}
          placeholder="Ask the agent…"
          className="w-full resize-none bg-transparent px-4 py-3.5 pr-14 text-[15px] outline-none placeholder:text-muted-foreground disabled:opacity-50"
        />
        <Button
          type="button"
          size="icon"
          className="absolute right-3 bottom-3 size-9 rounded-xl"
          disabled={isLoading || !input.trim()}
          onClick={() => void handleSubmit()}
          aria-label="Send"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Bot className="size-4" />
          )}
        </Button>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 p-0 data-[side=right]:sm:max-w-2xl"
        >
          <SheetHeader className="border-b border-border px-8 py-3.5 pr-14 text-left">
            <SheetTitle className="text-sm font-semibold">Weavit agent</SheetTitle>
          </SheetHeader>

          <div
            ref={scrollRef}
            className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-8 py-5"
          >
            {turns.length === 0 && !isLoading ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Send a message to start.
              </p>
            ) : null}

            {turns.map((turn) => (
              <div key={turn.id} className="flex flex-col gap-5">
                <div className="ml-auto max-w-[min(100%,28rem)] rounded-2xl border border-border/80 bg-muted/40 px-4 py-2.5 text-[15px] leading-relaxed text-foreground">
                  {turn.prompt}
                </div>

                {turn.message != null ? (
                  <>
                    <div className="min-w-0 pl-1">
                      <MessageResponse className="prose prose-sm dark:prose-invert max-w-none text-foreground prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-code:text-foreground prose-ul:pl-5 prose-ol:pl-5 prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border/60">
                        {turn.message}
                      </MessageResponse>
                    </div>

                    {turn.actions.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          Actions
                        </p>
                        {turn.actions.map((action, i) => (
                          <ActionCard
                            key={`${turn.id}-${action.actionType}-${i}`}
                            action={action}
                          />
                        ))}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Thinking…
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-border px-8 py-3">
            <div className="relative rounded-xl border border-border bg-card">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    void handleSubmit()
                  }
                }}
                rows={2}
                disabled={isLoading}
                placeholder="Follow up…"
                className="w-full resize-none bg-transparent px-3.5 py-3 pr-12 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
              />
              <Button
                type="button"
                size="icon-sm"
                className="absolute right-2.5 bottom-2.5"
                disabled={isLoading || !input.trim()}
                onClick={() => void handleSubmit()}
                aria-label="Send"
              >
                {isLoading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Bot className="size-3.5" />
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
