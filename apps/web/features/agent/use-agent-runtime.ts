"use client"

import { useMemo } from "react"
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
import {
  splitGuestLoginMarker,
  useAgent,
  type AgentChatTurn,
} from "./agent"
import {
  buildAgentStateSnapshot,
  extractAndExecuteActions,
  type AgentActionMutations,
  type AgentWorkspaceState,
} from "./actions.agent"
import { previewToCreateProjectInput } from "./plan-from-preview"
import type { ActionItem, PlanPreview } from "./schema.agent"

export type AgentRunResult = {
  message: string
  actions: ActionItem[]
  preview: PlanPreview | null
  failed: { action: ActionItem; message: string }[]
  skippedPlanSeeds: number
  /** Guest replies may ask the UI to show Sign in */
  needsLogin?: boolean
}

export function useAgentRuntime() {
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

  const [submitQuery, agentMeta] = useAgent()

  const workspaceState: AgentWorkspaceState = useMemo(
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

  const ready =
    !skip &&
    !habitsQ.isLoading &&
    !plansQ.isLoading &&
    !todosQ.isLoading &&
    !deadlinesQ.isLoading &&
    !timelineQ.isLoading

  async function run(prompt: string): Promise<AgentRunResult> {
    const result = await submitQuery(
      prompt,
      buildAgentStateSnapshot(workspaceState)
    )

    const { actions, failed, skipped } = await extractAndExecuteActions(result, {
      ...workspaceState,
      mutations,
    })

    return {
      message: result?.message ?? "Something went wrong — try again.",
      actions,
      preview: result?.preview ?? null,
      failed: failed.map((f) => ({ action: f.action, message: f.message })),
      skippedPlanSeeds: skipped.length,
    }
  }

  /** Product-only conversation for signed-out visitors — no actions / preview */
  async function runGuest(
    prompt: string,
    history: AgentChatTurn[] = []
  ): Promise<AgentRunResult> {
    const result = await submitQuery(prompt, {}, { mode: "guest", history })
    const rawMessage =
      result?.message ?? "Something went wrong — try again."
    const { text, needsLogin } = splitGuestLoginMarker(rawMessage)

    return {
      message: text,
      actions: [],
      preview: null,
      failed: [],
      skippedPlanSeeds: 0,
      needsLogin,
    }
  }

  async function savePreviewToWorkspace(preview: PlanPreview) {
    const body = previewToCreateProjectInput(preview)
    return postProject(body).unwrap()
  }

  return {
    ready,
    signedIn: Boolean(isSignedIn),
    authLoaded: isLoaded,
    workspaceState,
    run,
    runGuest,
    savePreviewToWorkspace,
    isLoading: agentMeta.isLoading,
    error: agentMeta.error,
  }
}
