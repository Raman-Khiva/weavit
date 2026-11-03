import zodToJsonSchema from "zod-to-json-schema"
import z from "zod/v3"

const TaskStatus = z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "SKIPPED"])
const Priority = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"])
const HabitFrequency = z.enum(["DAILY", "WEEKLY", "MONTHLY"])
const ProjectStatus = z.enum(["DRAFT", "ACTIVE", "COMPLETED", "ARCHIVED"])

/** Optional string that also accepts null from strict JSON-schema models. */
const OptStr = z.string().nullish()
const OptPriority = Priority.nullish()

export const ActionItemSchema = z.discriminatedUnion("actionType", [
  // ── Habits ──────────────────────────────────────────────
  z.object({
    actionType: z.literal("create_habit"),
    data: z.object({
      title: z.string().describe("New habit title"),
      description: OptStr,
      frequency: HabitFrequency.nullish(),
      category: OptStr,
    }),
  }),
  z.object({
    actionType: z.literal("toggle_habit"),
    data: z.object({
      habitId: z.string().describe("id from state.habits"),
    }),
  }),
  z.object({
    actionType: z.literal("create_habit_log"),
    data: z.object({
      habitId: z.string().describe("id from state.habits"),
      notes: z.string().describe("one short sentence of what the user did"),
    }),
  }),

  // ── Todos ───────────────────────────────────────────────
  z.object({
    actionType: z.literal("create_todo"),
    data: z.object({
      title: z.string(),
      description: OptStr,
      priority: OptPriority,
      dueDate: OptStr.describe("YYYY-MM-DD preferred"),
      tags: z.array(z.string()).nullish(),
    }),
  }),
  z.object({
    actionType: z.literal("patch_todo"),
    data: z.object({
      todoId: z.string().describe("id from state.todos"),
      title: OptStr,
      description: OptStr,
      status: TaskStatus.nullish(),
      priority: OptPriority,
      dueDate: OptStr,
      tags: z.array(z.string()).nullish(),
    }),
  }),
  z.object({
    actionType: z.literal("delete_todo"),
    data: z.object({
      todoId: z.string().describe("id from state.todos"),
    }),
  }),

  // ── Deadlines ───────────────────────────────────────────
  z.object({
    actionType: z.literal("create_deadline"),
    data: z.object({
      title: z.string().describe("title only — no date or time here"),
      dueDate: z
        .string()
        .describe("YYYY-MM-DD preferred; ISO datetime also accepted"),
      course: OptStr,
      time: OptStr.describe("HH:mm 24h preferred (e.g. 14:00); 5pm also ok"),
      priority: OptPriority,
    }),
  }),
  z.object({
    actionType: z.literal("patch_deadline"),
    data: z.object({
      deadlineId: z.string().describe("id from state.deadlines"),
      title: OptStr,
      course: OptStr,
      time: OptStr.describe("HH:mm 24h, or omit"),
      dueDate: OptStr.describe("YYYY-MM-DD"),
      priority: OptPriority,
      isCompleted: z.boolean().nullish(),
    }),
  }),

  // ── Roadmaps / plans ────────────────────────────────────
  z.object({
    actionType: z.literal("create_project"),
    data: z.object({
      title: z.string(),
      description: OptStr,
      category: OptStr,
      icon: OptStr,
      startDate: OptStr,
      endDate: OptStr,
    }),
  }),
  z.object({
    actionType: z.literal("patch_project"),
    data: z.object({
      projectId: z.string().describe("projectId from state.plans"),
      title: OptStr,
      description: OptStr,
      category: OptStr,
      status: ProjectStatus.nullish(),
    }),
  }),
  z.object({
    actionType: z.literal("create_phase"),
    data: z.object({
      projectId: z.string().describe("projectId from state.plans"),
      title: z.string(),
      description: OptStr,
      category: OptStr,
      order: z.number().int().nullish(),
    }),
  }),
  z.object({
    actionType: z.literal("create_task"),
    data: z.object({
      projectId: z.string(),
      phaseId: z.string(),
      title: z.string(),
      description: OptStr,
      category: OptStr,
      priority: OptPriority,
      dueDate: OptStr,
    }),
  }),
  z.object({
    actionType: z.literal("patch_task"),
    data: z.object({
      taskId: z.string(),
      projectId: OptStr.describe("optional; resolved from state if omitted"),
      phaseId: OptStr.describe("optional; resolved from state if omitted"),
      title: OptStr,
      status: TaskStatus.nullish(),
      note: OptStr,
    }),
  }),
  z.object({
    actionType: z.literal("create_task_log"),
    data: z.object({
      taskId: z.string().describe("id from state.plans tasks"),
      text: z.string().describe("short log entry for the task"),
      projectId: OptStr.describe("optional; resolved from state if omitted"),
      phaseId: OptStr.describe("optional; resolved from state if omitted"),
    }),
  }),

  // ── Timeline / calendar ─────────────────────────────────
  z.object({
    actionType: z.literal("create_calendar_event"),
    data: z.object({
      title: z.string(),
      calendar: z.string().describe("calendarId from state.calendars"),
      date: z.string().describe("YYYY-MM-DD"),
      start: z.number().int().describe("minutes from midnight"),
      end: z.number().int().describe("minutes from midnight"),
      allDay: z.boolean().nullish(),
      location: OptStr,
      video: z.boolean().nullish(),
    }),
  }),
  z.object({
    actionType: z.literal("patch_calendar_event"),
    data: z.object({
      eventId: z.string().describe("id from state.events"),
      title: OptStr,
      calendar: OptStr,
      date: OptStr,
      start: z.number().int().nullish(),
      end: z.number().int().nullish(),
      allDay: z.boolean().nullish(),
      location: OptStr,
      video: z.boolean().nullish(),
    }),
  }),
  z.object({
    actionType: z.literal("delete_calendar_event"),
    data: z.object({
      eventId: z.string().describe("id from state.events"),
    }),
  }),
])

export const ActionsListSchema = z.object({
  actions: z
    .array(ActionItemSchema)
    .describe("all actions implied by the user message, in order; empty if none"),
})

export type ActionItem = z.infer<typeof ActionItemSchema>
export type ActionType = ActionItem["actionType"]

/** Live plan panel on /agent — UI statuses are lowercase. */
export const PlanPreviewSchema = z.object({
  title: z.string(),
  description: z.string(),
  phases: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: OptStr,
      category: OptStr,
      status: z.enum(["pending", "active", "completed"]),
      startDate: OptStr,
      endDate: OptStr,
      tasks: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          description: OptStr,
          category: OptStr,
          priority: z.enum(["low", "medium", "high"]).nullish(),
          status: z.enum(["pending", "in_progress", "completed", "skipped"]),
        })
      ),
    })
  ),
})

export type PlanPreview = z.infer<typeof PlanPreviewSchema>

export const LlmResponseSchema = z.object({
  message: z
    .string()
    .describe(
      "Rich markdown shown to the user (tables, lists, checklists, short commentary)"
    ),
  actions: z
    .array(ActionItemSchema)
    .describe("0..n allowlisted actions; empty for pure Q&A"),
  preview: PlanPreviewSchema.nullish().describe(
    "When generating a multi-phase roadmap, include a full preview for the live panel. Omit for simple Q&A or single mutations."
  ),
})

export const LlmResponseJsonSchema = zodToJsonSchema(LlmResponseSchema, {
  $refStrategy: "none",
})
