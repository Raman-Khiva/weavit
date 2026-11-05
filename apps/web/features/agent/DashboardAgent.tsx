"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { Bot, Loader2 } from "lucide-react"

import { MessageResponse } from "@workspace/ui/components/ai-elements/message"
import { Button } from "@workspace/ui/components/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import { useGetHabitsQuery } from "../habits/habits.api"
import {
  useGetProjectsQuery,
  usePatchTaskMutation,
  usePostNoteMutation,
  usePostPhaseMutation,
  usePostProjectMutation,
  usePostTaskMutation,
  usePatchProjectMutation,
} from "../projects/projects.api"
import {
  useGetTodosQuery,
  usePostTodoMutation,
  usePatchTodoMutation,
  useDeleteTodoMutation,
} from "../todos/todos.api"
import {
  useGetDeadlinesQuery,
  usePostDeadlineMutation,
  usePatchDeadlineMutation,
} from "../deadlines/deadlines.api"
import {
  useGetTimelineQuery,
  usePostCalendarEventMutation,
  usePatchCalendarEventMutation,
  useDeleteCalendarEventMutation,
} from "../timeline/timeline.api"
import {
  usePostHabitMutation,
  usePostHabitLogMutation,
  useToggleHabitMutation,
} from "../habits/habits.api"
import { useAgent } from "./agent"
import type { ActionItem } from "./schema.agent"
import {
  buildAgentStateSnapshot,
  extractAndExecuteActions,
  type AgentActionMutations,
} from "./actions.agent"
import { ActionCard } from "./ActionCard"

type ChatTurn = {
  id: string
  prompt: string
  message: string | null
  actions: ActionItem[]
  executed: boolean
  failedIndexes: number[]
  failureReasons: Record<number, string>
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export default function DashboardAgent() {
  const { isLoaded, isSignedIn } = useAuth()
  const skip = !isLoaded || !isSignedIn

  const habitsQ = useGetHabitsQuery(undefined, { skip })
  const plansQ = useGetProjectsQuery(undefined, { skip })
  const todosQ = useGetTodosQuery(undefined, { skip })
  const deadlinesQ = useGetDeadlinesQuery(undefined, { skip })
  const timelineQ = useGetTimelineQuery(undefined, { skip })

  const [postHabit] = usePostHabitMutation()
  const [toggleHabit] = useToggleHabitMutation()
  const [postHabitLog] = usePostHabitLogMutation()
  const [postTodo] = usePostTodoMutation()
  const [patchTodo] = usePatchTodoMutation()
  const [deleteTodo] = useDeleteTodoMutation()
  const [postDeadline] = usePostDeadlineMutation()
  const [patchDeadline] = usePatchDeadlineMutation()
  const [postProject] = usePostProjectMutation()
  const [patchProject] = usePatchProjectMutation()
  const [postPhase] = usePostPhaseMutation()
  const [postTask] = usePostTaskMutation()
  const [patchTask] = usePatchTaskMutation()
  const [postTaskNote] = usePostNoteMutation()
  const [postCalendarEvent] = usePostCalendarEventMutation()
  const [patchCalendarEvent] = usePatchCalendarEventMutation()
  const [deleteCalendarEvent] = useDeleteCalendarEventMutation()

  const [submitQuery, { isLoading }] = useAgent()

  const [input, setInput] = useState("")
  const [open, setOpen] = useState(false)
  const [turns, setTurns] = useState<ChatTurn[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  const workspaceReady =
    !skip &&
    !habitsQ.isLoading &&
    !plansQ.isLoading &&
    !todosQ.isLoading &&
    !deadlinesQ.isLoading &&
    !timelineQ.isLoading

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
    })
  }, [turns])

  const workspaceState = useMemo(
    () => ({
      habits: habitsQ.data,
      plans: plansQ.data,
      todos: todosQ.data,
      deadlines: deadlinesQ.data,
      calendars: timelineQ.data?.calendars,
      events: timelineQ.data?.events,
    }),
    [
      habitsQ.data,
      plansQ.data,
      todosQ.data,
      deadlinesQ.data,
      timelineQ.data,
    ]
  )

  const mutations = useMemo<AgentActionMutations>(
    () => ({
      postHabit: (body) => postHabit(body).unwrap(),
      toggleHabit: (id) => toggleHabit(id).unwrap(),
      postHabitLog: (args) => postHabitLog(args).unwrap(),
      postTodo: (body) => postTodo(body).unwrap(),
      patchTodo: ({ id, body }) => patchTodo({ id, body }).unwrap(),
      deleteTodo: (id) => deleteTodo(id).unwrap(),
      postDeadline: (body) => postDeadline(body).unwrap(),
      patchDeadline: ({ id, body }) => patchDeadline({ id, body }).unwrap(),
      postProject: (body) => postProject(body).unwrap(),
      patchProject: ({ id, body }) => patchProject({ id, body }).unwrap(),
      postPhase: ({ projectId, body }) => postPhase({ projectId, body }).unwrap(),
      postTask: (args) => postTask(args).unwrap(),
      patchTask: (args) => patchTask(args).unwrap(),
      postTaskNote: (args) => postTaskNote(args).unwrap(),
      postCalendarEvent: (body) => postCalendarEvent(body).unwrap(),
      patchCalendarEvent: ({ id, body }) =>
        patchCalendarEvent({ id, body }).unwrap(),
      deleteCalendarEvent: (id) => deleteCalendarEvent(id).unwrap(),
    }),
    [
      postHabit,
      toggleHabit,
      postHabitLog,
      postTodo,
      patchTodo,
      deleteTodo,
      postDeadline,
      patchDeadline,
      postProject,
      patchProject,
      postPhase,
      postTask,
      patchTask,
      postTaskNote,
      postCalendarEvent,
      patchCalendarEvent,
      deleteCalendarEvent,
    ]
  )

  const handleSubmit = async () => {
    const prompt = input.trim()
    if (!prompt || isLoading || !workspaceReady) return

    const turnId = uid()
    setInput("")
    setOpen(true)
    setTurns((prev) => [
      ...prev,
      {
        id: turnId,
        prompt,
        message: null,
        actions: [],
        executed: false,
        failedIndexes: [],
        failureReasons: {},
      },
    ])

    // 1) LLM → { message, actions }
    const result = await submitQuery(
      prompt,
      buildAgentStateSnapshot(workspaceState)
    )

    // 2) Extract actions and execute each via executeAgentAction
    const { actions, failed } = await extractAndExecuteActions(result, {
      ...workspaceState,
      mutations,
    })

    const failedIndexes: number[] = []
    const failureReasons: Record<number, string> = {}
    for (const item of failed) {
      const idx = actions.indexOf(item.action)
      if (idx >= 0) {
        failedIndexes.push(idx)
        failureReasons[idx] = item.message
      }
    }

    setTurns((prev) =>
      prev.map((turn) =>
        turn.id === turnId
          ? {
              ...turn,
              message: result?.message ?? "Something went wrong — try again.",
              actions,
              executed: true,
              failedIndexes,
              failureReasons,
            }
          : turn
      )
    )
  }

  const canSend = workspaceReady && !isLoading && Boolean(input.trim())

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
          disabled={!workspaceReady || isLoading}
          placeholder={
            workspaceReady ? "Ask the agent…" : "Loading workspace…"
          }
          className="w-full resize-none bg-transparent px-4 py-3.5 pr-14 text-[15px] outline-none placeholder:text-muted-foreground disabled:opacity-50"
        />
        <Button
          type="button"
          size="icon"
          className="absolute right-3 bottom-3 size-9 rounded-xl"
          disabled={!canSend}
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
                        <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                          Actions
                          {turn.failedIndexes.length > 0
                            ? ` · ${turn.failedIndexes.length} failed`
                            : turn.executed
                              ? " · applied"
                              : ""}
                        </p>
                        {turn.actions.map((action, i) => (
                          <ActionCard
                            key={`${turn.id}-${action.actionType}-${i}`}
                            action={action}
                            state={workspaceState}
                            failed={turn.failedIndexes.includes(i)}
                            reason={turn.failureReasons[i]}
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
                disabled={!workspaceReady || isLoading}
                placeholder="Follow up…"
                className="w-full resize-none bg-transparent px-3.5 py-3 pr-12 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
              />
              <Button
                type="button"
                size="icon-sm"
                className="absolute right-2.5 bottom-2.5"
                disabled={!canSend}
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
