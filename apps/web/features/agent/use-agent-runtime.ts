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
import { useAgent } from "./agent"
import {
  buildAgentStateSnapshot,
  extractAndExecuteActions,
  type AgentActionMutations,
  type AgentWorkspaceState,
} from "./actions.agent"
import type { ActionItem, PlanPreview } from "./schema.agent"

export type AgentRunResult = {
  message: string
  actions: ActionItem[]
  preview: PlanPreview | null
  failed: { action: ActionItem; message: string }[]
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

    const { actions, failed } = await extractAndExecuteActions(result, {
      ...workspaceState,
      mutations,
    })

    return {
      message: result?.message ?? "Something went wrong — try again.",
      actions,
      preview: result?.preview ?? null,
      failed: failed.map((f) => ({ action: f.action, message: f.message })),
    }
  }

  return {
    ready,
    signedIn: Boolean(isSignedIn),
    workspaceState,
    run,
    isLoading: agentMeta.isLoading,
    error: agentMeta.error,
  }
}
