"use client"

import Groq from "groq-sdk"
import {
  AgentInput,
  AgentRunModal,
  useAgentRun,
} from "@workspace/ui/components/agent-run"
import { useCallback, useMemo } from "react"
import { useAuth } from "@clerk/nextjs"
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
  useGetHabitsQuery,
  usePostHabitLogMutation,
  usePostHabitMutation,
  useToggleHabitMutation,
} from "../habits/habits.api"
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
import { zodToJsonSchema } from "zod-to-json-schema"
import { LlmResponseSchema, type ActionItem } from "./schema.agent"
import { parseAgentResponse } from "./agent"
import { userPrompot } from "./prompt.agent"
import {
  buildAgentStateSnapshot,
  describeAgentAction,
  executeAgentAction,
  type AgentActionMutations,
} from "./actions.agent"

const groq = new Groq({
  dangerouslyAllowBrowser: true,
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
})

const AgentContainer = () => {
  const { isLoaded, isSignedIn } = useAuth()
  const skip = !isLoaded || !isSignedIn

  const { data: habits, isLoading: loadingHabits } = useGetHabitsQuery(undefined, {
    skip,
  })
  const { data: plans, isLoading: loadingPlans } = useGetProjectsQuery(undefined, {
    skip,
  })
  const { data: todos, isLoading: loadingTodos } = useGetTodosQuery(undefined, {
    skip,
  })
  const { data: deadlines, isLoading: loadingDeadlines } = useGetDeadlinesQuery(
    undefined,
    { skip }
  )
  const { data: timeline, isLoading: loadingTimeline } = useGetTimelineQuery(
    undefined,
    { skip }
  )

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

  const workspaceState = useMemo(
    () => ({
      habits,
      plans,
      todos,
      deadlines,
      calendars: timeline?.calendars,
      events: timeline?.events,
    }),
    [habits, plans, todos, deadlines, timeline]
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

  const plan = useCallback(
    async (prompt: string) => {
      const response = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [
          userPrompot,
          {
            role: "user" as const,
            content: JSON.stringify({
              trigger: prompt,
              now: new Date().toISOString(),
              state: buildAgentStateSnapshot(workspaceState),
            }),
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "llm_response",
            schema: zodToJsonSchema(LlmResponseSchema, { $refStrategy: "none" }),
          },
        },
      })

      const raw = response?.choices?.[0]?.message.content ?? "{}"
      let planned: unknown
      try {
        planned = JSON.parse(raw)
      } catch {
        throw new SyntaxError("Agent output was not valid JSON")
      }

      const validated = parseAgentResponse(planned)
      if (!validated) {
        throw new Error("Invalid agent response structure")
      }

      return validated.actions
    },
    [workspaceState]
  )

  const describe = useCallback(
    (action: ActionItem) => {
      const meta = describeAgentAction(action, workspaceState)
      // agent-run UI only knows habit_log | task_log | task_update
      const kind =
        meta.kind === "habit_log" || meta.kind.startsWith("habit")
          ? ("habit_log" as const)
          : meta.kind === "task_log" || meta.kind.includes("log")
            ? ("task_log" as const)
            : ("task_update" as const)
      return {
        kind,
        target: meta.target,
        detail: meta.detail,
        valid: meta.valid,
      }
    },
    [workspaceState]
  )

  // useAgentRun loops planned actions and calls this once per item
  const execute = useCallback(
    async (action: ActionItem) => {
      await executeAgentAction(action, {
        ...workspaceState,
        mutations,
      })
    },
    [workspaceState, mutations]
  )

  const suggest = useCallback(() => {
    const habitTitles =
      workspaceState.habits?.map((h) => h.title).filter(Boolean) ?? []
    const todoTitles =
      workspaceState.todos
        ?.filter((t) => t.status !== "COMPLETED")
        .map((t) => t.title) ?? []
    const taskTitles =
      workspaceState.plans?.flatMap((p) =>
        (p.phases ?? []).flatMap((ph) =>
          (ph.tasks ?? [])
            .filter((t) => t.status !== "COMPLETED")
            .map((t) => t.title)
        )
      ) ?? []
    return [...habitTitles, ...todoTitles, ...taskTitles]
      .filter(Boolean)
      .slice(0, 6) as string[]
  }, [workspaceState])

  const { run, submit, undo, dismiss } = useAgentRun({
    plan,
    describe,
    execute,
    suggest,
  })

  if (loadingHabits || loadingPlans || loadingTodos || loadingDeadlines || loadingTimeline) {
    return null
  }

  return (
    <div className="mt-4">
      <AgentInput run={run} onSubmit={submit} />
      <AgentRunModal
        run={run}
        onUndo={undo}
        onDismiss={dismiss}
        onPick={(name) => submit(name)}
      />
    </div>
  )
}

export default AgentContainer
