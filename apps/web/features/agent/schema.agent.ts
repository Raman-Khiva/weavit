import zodToJsonSchema from "zod-to-json-schema"
import z from "zod/v3"

export const ActionItemSchema = z.discriminatedUnion("actionType", [
  z.object({
    actionType: z.literal("create_habit_log"),
    data: z.object({
      habitId: z.string().describe("id from state.habits"),
      notes: z.string().describe("one short sentence of what the user did"),
    }),
  }),
  z.object({
    actionType: z.literal("create_task_log"),
    data: z.object({
      taskId: z.string().describe("id from state.tasks"),
      text: z.string().describe("short log entry for the task"),
    }),
  }),
  z.object({
    actionType: z.literal("patch_task"),
    data: z.object({
      projectId: z.string(),
      phaseId: z.string(),
      taskId: z.string(),
      title: z.string().optional(),
      status: z
        .enum(["PENDING", "IN_PROGRESS", "COMPLETED", "SKIPPED"])
        .optional(),
      note: z.string().optional(),
      notes: z
        .array(
          z.object({
            text: z.string(),
          })
        )
        .optional(),
    }),
  }),
])

export const ActionsListSchema = z.object({
  actions: z
    .array(ActionItemSchema)
    .describe("all actions implied by the user message, in order; empty if none"),
})

export type ActionItem = z.infer<typeof ActionItemSchema>

export const LlmResponseSchema = z.object({
  message: z
    .string()
    .describe(
      "Rich markdown shown to the user (tables, lists, checklists, short commentary)"
    ),
  actions: z
    .array(ActionItemSchema)
    .describe("0..n allowlisted actions; empty for pure Q&A"),
})

export const LlmResponseJsonSchema = zodToJsonSchema(LlmResponseSchema, {
  $refStrategy: "none",
})
