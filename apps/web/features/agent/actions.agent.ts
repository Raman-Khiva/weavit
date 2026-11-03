import type { components } from "@weavit/api-types"
import type { ActionItem } from "./schema.agent"

type Habit = components["schemas"]["Habit"]
type Project = components["schemas"]["Project"]
type Todo = components["schemas"]["Todo"]
type Deadline = components["schemas"]["Deadline"]
type CalendarSource = components["schemas"]["CalendarSource"]
type CalendarEvent = components["schemas"]["CalendarEvent"]

export type AgentWorkspaceState = {
  habits?: Habit[]
  plans?: Project[]
  todos?: Todo[]
  deadlines?: Deadline[]
  calendars?: CalendarSource[]
  events?: CalendarEvent[]
}

/** RTK mutation wrappers the agent uses to persist changes. */
export type AgentActionMutations = {
  // habits
  postHabit: (body: {
    title: string
    description?: string
    frequency?: "DAILY" | "WEEKLY" | "MONTHLY"
    category?: string
  }) => Promise<unknown>
  toggleHabit: (habitId: string) => Promise<unknown>
  postHabitLog: (args: {
    habitId: string
    body: { notes: string }
  }) => Promise<unknown>

  // todos
  postTodo: (body: {
    title: string
    description?: string
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
    dueDate?: string
    tags?: string[]
  }) => Promise<unknown>
  patchTodo: (args: {
    id: string
    body: Record<string, unknown>
  }) => Promise<unknown>
  deleteTodo: (id: string) => Promise<unknown>

  // deadlines
  postDeadline: (body: {
    title: string
    dueDate: string
    course?: string
    time?: string
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  }) => Promise<unknown>
  patchDeadline: (args: {
    id: string
    body: Record<string, unknown>
  }) => Promise<unknown>

  // projects / phases / tasks
  postProject: (body: {
    title: string
    description?: string
    category?: string
    icon?: string
    startDate?: string
    endDate?: string
  }) => Promise<unknown>
  patchProject: (args: {
    id: string
    body: Record<string, unknown>
  }) => Promise<unknown>
  postPhase: (args: {
    projectId: string
    body: {
      title: string
      description?: string
      category?: string
      order?: number
    }
  }) => Promise<unknown>
  postTask: (args: {
    projectId: string
    phaseId: string
    body: {
      title: string
      description?: string
      category?: string
      priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
      dueDate?: string
    }
  }) => Promise<unknown>
  patchTask: (args: {
    projectId: string
    phaseId: string
    taskId: string
    body: {
      title?: string
      status?: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED"
      note?: string
    }
  }) => Promise<unknown>
  postTaskNote: (args: {
    projectId: string
    phaseId: string
    taskId: string
    body: { text: string }
  }) => Promise<unknown>

  // timeline
  postCalendarEvent: (body: {
    title: string
    calendar: string
    date: string
    start: number
    end: number
    allDay?: boolean
    location?: string | null
    video?: boolean
  }) => Promise<unknown>
  patchCalendarEvent: (args: {
    id: string
    body: Record<string, unknown>
  }) => Promise<unknown>
  deleteCalendarEvent: (id: string) => Promise<unknown>
}

export type AgentActionDeps = AgentWorkspaceState & {
  mutations: AgentActionMutations
}

export type ActionDescription = {
  kind: string
  label: string
  target: string
  detail: string
  valid: boolean
}

function utcToday() {
  return new Date().toISOString().slice(0, 10)
}

/** Drop null / undefined / empty-string keys before POSTing to the API. */
function compact<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue
    if (typeof value === "string" && value.trim() === "") continue
    out[key] = value
  }
  return out as Partial<T>
}

/** Human message from RTK unwrap errors / Error / unknown. */
export function formatAgentError(error: unknown): string {
  if (error instanceof Error && error.message) return error.message
  if (error && typeof error === "object") {
    const e = error as {
      status?: number | string
      data?: {
        message?: string
        error?: unknown
      }
      error?: string
      message?: string
    }
    if (typeof e.data?.message === "string" && e.data.message) {
      const detail = e.data.error
      if (detail && typeof detail === "object") {
        const flat = detail as {
          fieldErrors?: Record<string, string[]>
          formErrors?: string[]
        }
        const fields = flat.fieldErrors
          ? Object.entries(flat.fieldErrors)
              .map(([k, v]) => `${k}: ${(v ?? []).join(", ")}`)
              .join("; ")
          : ""
        if (fields) return `${e.data.message} (${fields})`
      }
      if (typeof detail === "string" && detail) {
        return `${e.data.message}: ${detail}`
      }
      return e.data.message
    }
    if (typeof e.error === "string" && e.error) return e.error
    if (typeof e.message === "string" && e.message) return e.message
    if (e.status != null) return `Request failed (${e.status})`
  }
  return "Unknown error"
}

/** Accept YYYY-MM-DD or ISO datetime → YYYY-MM-DD. */
function normalizeDeadlineDay(raw: string | undefined | null): string | null {
  if (!raw) return null
  const trimmed = raw.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
  if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) return trimmed.slice(0, 10)
  // Last resort: Date parse
  const ms = Date.parse(trimmed)
  if (!Number.isNaN(ms)) return new Date(ms).toISOString().slice(0, 10)
  return null
}

/** Accept HH:mm or common 12h strings → HH:mm. */
function normalizeDeadlineTime(
  raw: string | undefined | null
): string | undefined {
  if (raw == null || !String(raw).trim()) return undefined
  const s = String(raw).trim().toLowerCase().replace(/\./g, "")
  if (/^([01]\d|2[0-3]):[0-5]\d$/.test(s)) return s

  const match = s.match(/^(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?$/)
  if (!match) return undefined
  let hour = Number(match[1])
  const minute = Number(match[2] ?? "0")
  const meridiem = match[3]?.replace(/\./g, "") ?? ""
  if (minute > 59 || hour > 24) return undefined
  if (meridiem.startsWith("p") && hour < 12) hour += 12
  if (meridiem.startsWith("a") && hour === 12) hour = 0
  if (!meridiem && hour === 24) hour = 0
  if (hour > 23) return undefined
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}

function findHabit(state: AgentWorkspaceState, habitId: string) {
  return state.habits?.find((h) => h.id === habitId)
}

function findTodo(state: AgentWorkspaceState, todoId: string) {
  return state.todos?.find((t) => t.id === todoId)
}

function findDeadline(state: AgentWorkspaceState, deadlineId: string) {
  return state.deadlines?.find((d) => d.id === deadlineId)
}

function findProject(state: AgentWorkspaceState, projectId: string) {
  return state.plans?.find((p) => p.id === projectId)
}

function findTaskPath(state: AgentWorkspaceState, taskId: string) {
  for (const plan of state.plans ?? []) {
    for (const phase of plan.phases ?? []) {
      const task = phase.tasks?.find((t) => t.id === taskId)
      if (task) {
        return {
          projectId: plan.id,
          phaseId: phase.id,
          projectTitle: plan.title,
          phaseTitle: phase.title,
          task,
        }
      }
    }
  }
  return null
}

function findEvent(state: AgentWorkspaceState, eventId: string) {
  return state.events?.find((e) => e.id === eventId)
}

function findCalendar(state: AgentWorkspaceState, calendarId: string) {
  return state.calendars?.find((c) => c.id === calendarId)
}

/** Human-readable card for UI before/after execute. */
export function describeAgentAction(
  action: ActionItem,
  state: AgentWorkspaceState = {}
): ActionDescription {
  switch (action.actionType) {
    case "create_habit":
      return {
        kind: "habit_create",
        label: "Create habit",
        target: action.data.title,
        detail: action.data.frequency ?? action.data.category ?? "New habit",
        valid: Boolean(action.data.title.trim()),
      }
    case "toggle_habit": {
      const habit = findHabit(state, action.data.habitId)
      return {
        kind: "habit_toggle",
        label: "Toggle habit",
        target: habit?.title ?? action.data.habitId,
        detail: "Check in / undo today",
        valid: Boolean(habit),
      }
    }
    case "create_habit_log": {
      const habit = findHabit(state, action.data.habitId)
      return {
        kind: "habit_log",
        label: "Habit log",
        target: habit?.title ?? action.data.habitId,
        detail: action.data.notes,
        valid: Boolean(habit),
      }
    }
    case "create_todo":
      return {
        kind: "todo_create",
        label: "Create todo",
        target: action.data.title,
        detail: action.data.priority ?? action.data.dueDate ?? "New todo",
        valid: Boolean(action.data.title.trim()),
      }
    case "patch_todo": {
      const todo = findTodo(state, action.data.todoId)
      return {
        kind: "todo_update",
        label: "Update todo",
        target: todo?.title ?? action.data.todoId,
        detail:
          action.data.status ??
          action.data.title ??
          action.data.priority ??
          "Update",
        valid: Boolean(todo),
      }
    }
    case "delete_todo": {
      const todo = findTodo(state, action.data.todoId)
      return {
        kind: "todo_delete",
        label: "Delete todo",
        target: todo?.title ?? action.data.todoId,
        detail: "Remove from board",
        valid: Boolean(todo),
      }
    }
    case "create_deadline":
      return {
        kind: "deadline_create",
        label: "Create deadline",
        target: action.data.title,
        detail: `${action.data.dueDate}${action.data.time ? ` ${action.data.time}` : ""}`,
        valid: Boolean(action.data.title.trim() && action.data.dueDate),
      }
    case "patch_deadline": {
      const deadline = findDeadline(state, action.data.deadlineId)
      return {
        kind: "deadline_update",
        label: "Update deadline",
        target: deadline?.title ?? action.data.deadlineId,
        detail:
          action.data.isCompleted === true
            ? "Mark completed"
            : action.data.isCompleted === false
              ? "Mark open"
              : (action.data.title ?? action.data.dueDate ?? "Update"),
        valid: Boolean(deadline),
      }
    }
    case "create_project":
      return {
        kind: "project_create",
        label: "Create roadmap",
        target: action.data.title,
        detail: action.data.category ?? "New plan",
        valid: Boolean(action.data.title.trim()),
      }
    case "patch_project": {
      const project = findProject(state, action.data.projectId)
      return {
        kind: "project_update",
        label: "Update roadmap",
        target: project?.title ?? action.data.projectId,
        detail: action.data.status ?? action.data.title ?? "Update",
        valid: Boolean(project),
      }
    }
    case "create_phase": {
      const project = findProject(state, action.data.projectId)
      return {
        kind: "phase_create",
        label: "Create phase",
        target: action.data.title,
        detail: project ? `In ${project.title}` : action.data.projectId,
        valid: Boolean(project && action.data.title.trim()),
      }
    }
    case "create_task": {
      const project = findProject(state, action.data.projectId)
      return {
        kind: "task_create",
        label: "Create task",
        target: action.data.title,
        detail: project ? `In ${project.title}` : action.data.projectId,
        valid: Boolean(project && action.data.title.trim()),
      }
    }
    case "patch_task": {
      const path = findTaskPath(state, action.data.taskId)
      return {
        kind: "task_update",
        label: "Update task",
        target: path?.task.title ?? action.data.taskId,
        detail: [
          action.data.status ? `→ ${action.data.status}` : null,
          action.data.note,
          action.data.title,
        ]
          .filter(Boolean)
          .join(" · ") || "Update",
        valid: Boolean(path),
      }
    }
    case "create_task_log": {
      const path = findTaskPath(state, action.data.taskId)
      return {
        kind: "task_log",
        label: "Task log",
        target: path?.task.title ?? action.data.taskId,
        detail: action.data.text,
        valid: Boolean(path),
      }
    }
    case "create_calendar_event": {
      const cal = findCalendar(state, action.data.calendar)
      return {
        kind: "event_create",
        label: "Create event",
        target: action.data.title,
        detail: `${action.data.date} · ${cal?.name ?? action.data.calendar}`,
        valid: Boolean(action.data.title.trim() && action.data.calendar),
      }
    }
    case "patch_calendar_event": {
      const event = findEvent(state, action.data.eventId)
      return {
        kind: "event_update",
        label: "Update event",
        target: event?.title ?? action.data.eventId,
        detail: action.data.title ?? action.data.date ?? "Update",
        valid: Boolean(event),
      }
    }
    case "delete_calendar_event": {
      const event = findEvent(state, action.data.eventId)
      return {
        kind: "event_delete",
        label: "Delete event",
        target: event?.title ?? action.data.eventId,
        detail: "Remove from timeline",
        valid: Boolean(event),
      }
    }
  }
}

/** Persist one planned action via RTK mutations. Throws on hard failure. */
export async function executeAgentAction(
  action: ActionItem,
  deps: AgentActionDeps
): Promise<void> {
  const { mutations, ...state } = deps

  switch (action.actionType) {
    case "create_habit":
      await mutations.postHabit(
        compact({
          title: action.data.title.trim(),
          description: action.data.description ?? undefined,
          frequency: action.data.frequency ?? undefined,
          category: action.data.category ?? undefined,
        }) as {
          title: string
          description?: string
          frequency?: "DAILY" | "WEEKLY" | "MONTHLY"
          category?: string
        }
      )
      return

    case "toggle_habit":
      if (!findHabit(state, action.data.habitId)) {
        throw new Error(`Habit not found: ${action.data.habitId}`)
      }
      await mutations.toggleHabit(action.data.habitId)
      return

    case "create_habit_log": {
      const habit = findHabit(state, action.data.habitId)
      if (!habit) throw new Error(`Habit not found: ${action.data.habitId}`)
      const today = utcToday()
      if (!habit.completedDates?.includes(today)) {
        await mutations.toggleHabit(action.data.habitId)
      }
      if (action.data.notes.trim()) {
        await mutations.postHabitLog({
          habitId: action.data.habitId,
          body: { notes: action.data.notes.trim() },
        })
      }
      return
    }

    case "create_todo":
      await mutations.postTodo(
        compact({
          title: action.data.title.trim(),
          description: action.data.description ?? undefined,
          priority: action.data.priority ?? undefined,
          dueDate: action.data.dueDate ?? undefined,
          tags: action.data.tags ?? undefined,
        }) as {
          title: string
          description?: string
          priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
          dueDate?: string
          tags?: string[]
        }
      )
      return

    case "patch_todo": {
      if (!findTodo(state, action.data.todoId)) {
        throw new Error(`Todo not found: ${action.data.todoId}`)
      }
      const { todoId, ...rest } = action.data
      await mutations.patchTodo({ id: todoId, body: compact(rest) })
      return
    }

    case "delete_todo":
      if (!findTodo(state, action.data.todoId)) {
        throw new Error(`Todo not found: ${action.data.todoId}`)
      }
      await mutations.deleteTodo(action.data.todoId)
      return

    case "create_deadline": {
      const day = normalizeDeadlineDay(action.data.dueDate)
      if (!day) {
        throw new Error(
          `Invalid dueDate "${action.data.dueDate}" — need YYYY-MM-DD`
        )
      }
      const time = normalizeDeadlineTime(action.data.time ?? undefined)
      await mutations.postDeadline(
        compact({
          title: action.data.title.trim(),
          dueDate: `${day}T12:00:00.000Z`,
          course: action.data.course ?? undefined,
          time,
          priority: action.data.priority ?? "MEDIUM",
        }) as {
          title: string
          dueDate: string
          course?: string
          time?: string
          priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
        }
      )
      return
    }

    case "patch_deadline": {
      if (!findDeadline(state, action.data.deadlineId)) {
        throw new Error(`Deadline not found: ${action.data.deadlineId}`)
      }
      const { deadlineId, dueDate, time, ...rest } = action.data
      const body = compact({
        ...rest,
        ...(dueDate
          ? (() => {
              const day = normalizeDeadlineDay(dueDate)
              if (!day) throw new Error(`Invalid dueDate: ${dueDate}`)
              return { dueDate: `${day}T12:00:00.000Z` }
            })()
          : {}),
        ...(time != null && String(time).trim()
          ? { time: normalizeDeadlineTime(time) }
          : {}),
      })
      await mutations.patchDeadline({ id: deadlineId, body })
      return
    }

    case "create_project":
      await mutations.postProject(
        compact({
          title: action.data.title.trim(),
          description: action.data.description ?? undefined,
          category: action.data.category ?? undefined,
          icon: action.data.icon ?? undefined,
          startDate: action.data.startDate ?? new Date().toISOString(),
          endDate: action.data.endDate ?? undefined,
        }) as {
          title: string
          description?: string
          category?: string
          icon?: string
          startDate?: string
          endDate?: string
        }
      )
      return

    case "patch_project": {
      if (!findProject(state, action.data.projectId)) {
        throw new Error(`Project not found: ${action.data.projectId}`)
      }
      const { projectId, ...rest } = action.data
      await mutations.patchProject({ id: projectId, body: compact(rest) })
      return
    }

    case "create_phase": {
      if (!findProject(state, action.data.projectId)) {
        throw new Error(`Project not found: ${action.data.projectId}`)
      }
      await mutations.postPhase({
        projectId: action.data.projectId,
        body: {
          title: action.data.title.trim(),
          ...(action.data.description
            ? { description: action.data.description }
            : {}),
          ...(action.data.category ? { category: action.data.category } : {}),
          ...(action.data.order != null ? { order: action.data.order } : {}),
        },
      })
      return
    }

    case "create_task": {
      if (!findProject(state, action.data.projectId)) {
        throw new Error(`Project not found: ${action.data.projectId}`)
      }
      await mutations.postTask({
        projectId: action.data.projectId,
        phaseId: action.data.phaseId,
        body: {
          title: action.data.title.trim(),
          ...(action.data.description
            ? { description: action.data.description }
            : {}),
          ...(action.data.category ? { category: action.data.category } : {}),
          ...(action.data.priority ? { priority: action.data.priority } : {}),
          ...(action.data.dueDate ? { dueDate: action.data.dueDate } : {}),
        },
      })
      return
    }

    case "patch_task": {
      const path = findTaskPath(state, action.data.taskId)
      const projectId = action.data.projectId || path?.projectId
      const phaseId = action.data.phaseId || path?.phaseId
      if (!projectId || !phaseId) {
        throw new Error(`Task path not found: ${action.data.taskId}`)
      }
      await mutations.patchTask({
        projectId,
        phaseId,
        taskId: action.data.taskId,
        body: compact({
          title: action.data.title ?? undefined,
          status: action.data.status ?? undefined,
          note: action.data.note ?? undefined,
        }),
      })
      return
    }

    case "create_task_log": {
      const path = findTaskPath(state, action.data.taskId)
      const projectId = action.data.projectId || path?.projectId
      const phaseId = action.data.phaseId || path?.phaseId
      if (!projectId || !phaseId) {
        throw new Error(`Task path not found: ${action.data.taskId}`)
      }
      await mutations.postTaskNote({
        projectId,
        phaseId,
        taskId: action.data.taskId,
        body: { text: action.data.text.trim() },
      })
      return
    }

    case "create_calendar_event": {
      let calendarId = action.data.calendar
      if (
        !calendarId ||
        calendarId.startsWith("demo-") ||
        !findCalendar(state, calendarId)
      ) {
        calendarId =
          state.calendars?.find((c) => !c.id.startsWith("demo-"))?.id ?? ""
      }
      if (!calendarId) {
        throw new Error("No calendar available — create one in Timeline first")
      }
      const date = normalizeDeadlineDay(action.data.date) ?? action.data.date
      await mutations.postCalendarEvent(
        compact({
          title: action.data.title.trim() || "Busy",
          calendar: calendarId,
          date,
          start: action.data.start,
          end: action.data.end,
          allDay: action.data.allDay ?? undefined,
          location: action.data.location ?? undefined,
          video: action.data.video ?? undefined,
        }) as {
          title: string
          calendar: string
          date: string
          start: number
          end: number
          allDay?: boolean
          location?: string
          video?: boolean
        }
      )
      return
    }

    case "patch_calendar_event": {
      if (!findEvent(state, action.data.eventId)) {
        throw new Error(`Event not found: ${action.data.eventId}`)
      }
      const { eventId, ...rest } = action.data
      await mutations.patchCalendarEvent({
        id: eventId,
        body: compact(rest),
      })
      return
    }

    case "delete_calendar_event": {
      if (!findEvent(state, action.data.eventId)) {
        throw new Error(`Event not found: ${action.data.eventId}`)
      }
      await mutations.deleteCalendarEvent(action.data.eventId)
      return
    }
  }
}

/**
 * Core runtime loop:
 * 1. Extract `actions` from the LLM response
 * 2. For each action, call `executeAgentAction`
 *
 * Continues after individual failures so one bad action doesn't block the rest.
 */
export async function extractAndExecuteActions(
  response: { actions?: ActionItem[] } | null | undefined,
  deps: AgentActionDeps
): Promise<{
  actions: ActionItem[]
  ok: ActionItem[]
  failed: { action: ActionItem; error: unknown; message: string }[]
}> {
  const actions = response?.actions ?? []
  const ok: ActionItem[] = []
  const failed: { action: ActionItem; error: unknown; message: string }[] = []

  for (const action of actions) {
    try {
      await executeAgentAction(action, deps)
      ok.push(action)
    } catch (error) {
      const message = formatAgentError(error)
      console.warn(`[agent] ${action.actionType} failed: ${message}`)
      failed.push({ action, error, message })
    }
  }

  return { actions, ok, failed }
}

/** @deprecated Prefer extractAndExecuteActions(response, deps) */
export async function executeAgentActions(
  actions: ActionItem[],
  deps: AgentActionDeps
): Promise<{ ok: ActionItem[]; failed: { action: ActionItem; error: unknown }[] }> {
  const result = await extractAndExecuteActions({ actions }, deps)
  return { ok: result.ok, failed: result.failed }
}

function isRealId(id: string | undefined | null) {
  return Boolean(id && !id.startsWith("demo-"))
}

/**
 * Compact workspace snapshot sent with every LLM request.
 * Always includes all slices (habits, plans, todos, deadlines, calendars, events).
 * Demo-* rows are omitted so the model only sees real ids.
 */
export function buildAgentStateSnapshot(state: AgentWorkspaceState) {
  const today = utcToday()

  return {
    habits: (state.habits ?? [])
      .filter((h) => isRealId(h.id))
      .map((h) => ({
        habitId: h.id,
        title: h.title,
        description: h.description ?? undefined,
        streak: h.streakCount,
        frequency: h.frequency,
        category: h.category,
        doneToday: (h.completedDates ?? []).includes(today),
        completedDates: h.completedDates ?? [],
      })),
    plans: (state.plans ?? [])
      .filter((p) => isRealId(p.id))
      .map((p) => ({
        projectId: p.id,
        title: p.title,
        description: p.description ?? undefined,
        category: p.category,
        status: p.status,
        icon: p.icon ?? undefined,
        startDate: p.startDate ?? undefined,
        endDate: p.endDate ?? undefined,
        phases: (p.phases ?? []).map((ph) => ({
          phaseId: ph.id,
          title: ph.title,
          description: ph.description ?? undefined,
          category: ph.category,
          status: ph.status,
          order: ph.order,
          tasks: (ph.tasks ?? []).map((t) => ({
            taskId: t.id,
            title: t.title,
            description: t.description ?? undefined,
            category: t.category,
            status: t.status,
            priority: t.priority,
            dueDate: t.dueDate ?? undefined,
          })),
        })),
      })),
    todos: (state.todos ?? [])
      .filter((t) => isRealId(t.id))
      .map((t) => ({
        todoId: t.id,
        title: t.title,
        description: t.description ?? undefined,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate ?? undefined,
        tags: t.tags ?? [],
      })),
    deadlines: (state.deadlines ?? [])
      .filter((d) => isRealId(d.id))
      .map((d) => ({
        deadlineId: d.id,
        title: d.title,
        dueDate: d.dueDate.slice(0, 10),
        time: d.time ?? undefined,
        priority: d.priority,
        isCompleted: d.isCompleted,
        course: d.course ?? undefined,
      })),
    calendars: (state.calendars ?? [])
      .filter((c) => isRealId(c.id))
      .map((c) => ({
        calendarId: c.id,
        name: c.name,
        tone: c.tone,
        visible: c.visible,
      })),
    events: (state.events ?? [])
      .filter((e) => isRealId(e.id))
      .map((e) => ({
        eventId: e.id,
        title: e.title,
        calendarId: e.calendar,
        date: e.date,
        start: e.start,
        end: e.end,
        allDay: e.allDay,
        days: e.days ?? undefined,
        location: e.location ?? undefined,
        video: e.video ?? undefined,
      })),
  }
}
