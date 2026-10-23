import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import { components } from "@weavit/api-types"
import {
    ArrowRight,
    Calendar,
    Code2,
    Layers,
    Rocket,
    type LucideIcon,
} from "lucide-react"

type PROJECT = components["schemas"]["Project"]

interface ProjectCardProps {
    project: PROJECT
    className?: string
}

/* ------------------------------------------------------------------ */
/* Stats: derived from phases → tasks                                  */
/* ------------------------------------------------------------------ */

const DAY = 86_400_000

export function getProjectStats(project: PROJECT) {
    const phases = [...(project.phases ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

    // flatten, keeping the phase each task belongs to; skipped tasks don't count
    const tasks = phases.flatMap((phase, phaseIndex) =>
        (phase.tasks ?? [])
            .filter((t) => t.status !== "SKIPPED")
            .map((task) => ({ task, phase, phaseIndex }))
    )

    const total = tasks.length
    const done = tasks.filter((t) => t.task.status === "COMPLETED").length
    const next =
        tasks.find((t) => t.task.status === "IN_PROGRESS") ??
        tasks.find((t) => t.task.status === "PENDING")

    // only signal of activity in the schema: latest task note
    const noteTimes = (project.phases ?? [])
        .flatMap((p) => p.tasks ?? [])
        .flatMap((t) => t.notes ?? [])
        .map((n) => (n.createdAt ? new Date(n.createdAt).getTime() : NaN))
        .filter((n) => !isNaN(n))
    const lastActivityAt = noteTimes.length ? Math.max(...noteTimes) : null

    return { phases, tasks, total, done, next, lastActivityAt }
}

/* ------------------------------------------------------------------ */
/* Pace: tasks done vs. where you should be by today                   */
/* ------------------------------------------------------------------ */

type Pace = "complete" | "ahead" | "on-track" | "behind" | "overdue" | "draft" | "none"

const PACE_STYLE: Record<Pace, { bar: string; text: string }> = {
    complete: { bar: "bg-emerald-400", text: "text-emerald-400" },
    ahead: { bar: "bg-emerald-400", text: "text-emerald-400" },
    "on-track": { bar: "bg-sky-400", text: "text-sky-400" },
    behind: { bar: "bg-amber-400", text: "text-amber-400" },
    overdue: { bar: "bg-red-400", text: "text-red-400" },
    draft: { bar: "bg-border", text: "text-muted-foreground" },
    none: { bar: "bg-border", text: "text-muted-foreground" },
}

export function getPace(project: PROJECT, now = Date.now()): { pace: Pace; label: string } {
    const { total, done } = getProjectStats(project)
    const remaining = total - done

    if (project.status === "COMPLETED" || (total > 0 && remaining === 0)) {
        return { pace: "complete", label: "Completed" }
    }
    if (project.status === "DRAFT") return { pace: "draft", label: "Draft" }

    const start = project.startDate ? new Date(project.startDate).getTime() : NaN
    const end = project.endDate ? new Date(project.endDate).getTime() : NaN
    if (!total || isNaN(start) || isNaN(end) || end <= start) return { pace: "none", label: "" }

    if (now > end) return { pace: "overdue", label: `${remaining} left, past deadline` }

    const elapsed = Math.min(Math.max((now - start) / (end - start), 0), 1)
    const diff = done - elapsed * total
    const weeksLeft = Math.max((end - now) / (7 * DAY), 1 / 7)
    const perWeek = Math.ceil(remaining / weeksLeft)

    if (diff >= 1) return { pace: "ahead", label: `Ahead by ${Math.floor(diff)}` }
    if (diff > -1) return { pace: "on-track", label: "On track" }
    return { pace: "behind", label: `Behind · ${perWeek}/week to finish` }
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const fmtDate = (iso: string) =>
    new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(iso))

function getCountdown(endDate: string | null | undefined, complete: boolean, now = Date.now()) {
    if (complete) return "Completed"
    if (!endDate) return "No deadline"
    const left = Math.ceil((new Date(endDate).getTime() - now) / DAY)
    if (left > 0) return `${fmtDate(endDate)} · ${left}d left`
    if (left === 0) return "Ends today"
    return `Ended ${-left}d ago`
}

// `project.icon` is a free string; map the names you support, fall back by category
const ICONS: Record<string, LucideIcon> = { code: Code2, code2: Code2, rocket: Rocket, layers: Layers }

function pickIcon(icon?: string | null, category = ""): LucideIcon {
    const byName = icon ? ICONS[icon.toLowerCase()] : undefined
    if (byName) return byName
    if (category.includes("interview")) return Code2
    if (category.includes("software")) return Rocket
    return Layers
}

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

export const ProjectOverviewCard = ({ project, className }: ProjectCardProps) => {
    const { phases, tasks, total, done, next, lastActivityAt } = getProjectStats(project)
    const { pace, label: paceLabel } = getPace(project)
    const style = PACE_STYLE[pace]
    const complete = pace === "complete"

    const idle = lastActivityAt ? Math.floor((Date.now() - lastActivityAt) / DAY) : null
    const stalled = !complete && pace !== "draft" && idle !== null && idle >= 7

    const Icon = pickIcon(project.icon, project.category)
    const segmented = total > 0 && total <= 24

    const phaseLine = next
        ? `Phase ${next.phaseIndex + 1} of ${phases.length} · ${next.phase.title}`
        : complete
            ? "All phases done"
            : "No tasks yet"

    return (
        <Card
            className={cn(
                "group relative flex h-full w-full flex-col justify-between gap-3 overflow-hidden",
                "transition-colors duration-200 hover:border-primary/50",
                className
            )}
        >
            {/* pace edge bar, same language as the habit card */}
            <span aria-hidden className={cn("absolute inset-y-4 left-0 w-[3px] rounded-r-full", style.bar)} />

            <CardHeader className="pb-0">
                <div className="flex items-start gap-3">
                    <div
                        className={cn(
                            "grid size-11 shrink-0 place-items-center rounded-xl",
                            "bg-gradient-to-b from-white/[0.09] to-white/[0.02] ring-1 ring-inset ring-white/10",
                            "shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                        )}
                    >
                        <Icon className="size-5 text-neutral-300" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <Badge variant="outline" className="px-2 py-0 text-[10px] font-medium">
                            {project.category}
                        </Badge>
                        <CardTitle className="mt-1 line-clamp-1 text-base font-bold">{project.title}</CardTitle>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-3 py-0">
                {/* next action */}
                <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
                    <p className="truncate text-[11px] text-muted-foreground">{phaseLine}</p>
                    <p className="mt-0.5 line-clamp-1 text-sm font-medium text-foreground">
                        {next ? next.task.title : complete ? "Nothing left to do" : "Add your first task"}
                    </p>
                </div>

                {/* progress */}
                <div>
                    <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
                        <span className="font-semibold text-foreground">
                            {done}/{total} <span className="font-normal text-muted-foreground">tasks</span>
                        </span>
                        {paceLabel && <span className={cn("truncate font-medium", style.text)}>{paceLabel}</span>}
                    </div>

                    {segmented ? (
                        <div className="flex gap-1" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}>
                            {tasks.map(({ task }) => (
                                <span
                                    key={task.id}
                                    className={cn(
                                        "h-1.5 flex-1 rounded-full",
                                        task.status === "COMPLETED"
                                            ? "bg-foreground"
                                            : task.status === "IN_PROGRESS"
                                                ? "bg-foreground/40"
                                                : "bg-muted"
                                    )}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-foreground"
                                style={{ width: total ? `${(done / total) * 100}%` : 0 }}
                            />
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className="flex items-center justify-between gap-2 border-t border-border/40 bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
                <div className="flex min-w-0 items-center gap-1.5 font-medium">
                    <Calendar size={13} className="shrink-0" />
                    <span className="truncate text-[11px]">{getCountdown(project.endDate, complete)}</span>
                    {stalled && <span className="shrink-0 text-[11px] text-amber-400">· idle {idle}d</span>}
                </div>
                <div className="flex shrink-0 items-center gap-1 font-semibold text-primary transition-transform group-hover:translate-x-0.5">
                    <span>{complete ? "View plan" : "Continue"}</span>
                    <ArrowRight size={13} />
                </div>
            </CardFooter>
        </Card>
    )
}

/* ------------------------------------------------------------------ */
/* Usage in <Projects />: urgent plans first                           */
/* ------------------------------------------------------------------ */
/*
const displayProjects = (projects ?? [])
  .filter((p) => p.status === "ACTIVE")
  .sort((a, b) => +new Date(a.endDate ?? "9999-12-31") - +new Date(b.endDate ?? "9999-12-31"))
  .slice(0, 3)

{displayProjects.map((p) => (
  <a key={p.id} href={`/workspace/projects/${p.id}`} className="flex min-w-0 flex-1 flex-col">
    <ProjectCard project={p} />
  </a>
))}
*/