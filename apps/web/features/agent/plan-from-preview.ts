import type { components } from "@weavit/api-types"
import type { PlanPreview } from "./schema.agent"

type CreateProjectInput = components["schemas"]["CreateProjectInput"]

function mapPriority(
  p: "low" | "medium" | "high" | null | undefined
): "LOW" | "MEDIUM" | "HIGH" | undefined {
  if (p === "low") return "LOW"
  if (p === "medium") return "MEDIUM"
  if (p === "high") return "HIGH"
  return undefined
}

/** Map live-panel preview → nested POST /projects body. */
export function previewToCreateProjectInput(
  preview: PlanPreview
): CreateProjectInput {
  return {
    title: preview.title.trim(),
    description: preview.description?.trim() || undefined,
    category: "General",
    startDate: new Date().toISOString(),
    phases: preview.phases.map((phase, order) => ({
      title: phase.title.trim(),
      description: phase.description?.trim() || undefined,
      category: phase.category ?? undefined,
      order,
      tasks: phase.tasks.map((task, taskOrder) => ({
        title: task.title.trim(),
        description: task.description?.trim() || undefined,
        category: task.category ?? undefined,
        priority: mapPriority(task.priority),
        order: taskOrder,
      })),
    })),
  }
}
