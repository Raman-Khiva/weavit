"use client";

import { useEffect, useRef, useState } from "react";
import type { SequencedAchievementProgress } from "@workspace/ui/components/achievement-list";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Progress } from "@workspace/ui/components/progress";
import { cn } from "@workspace/ui/lib/utils";
import {
  CheckIcon,
  ChevronRightIcon,
  CircleIcon,
  CalendarIcon,
  ListTodoIcon,
  CheckCircle2Icon,
  CircleDashedIcon,
  Layers,
  Sparkles,
  Clock,
  Target,
  Award,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface PlanPreviewProps {
  plan: {
    title: string;
    description: string;
    phases: Array<{
      id: string;
      title: string;
      description?: string;
      category?: string;
      status: "pending" | "active" | "completed";
      startDate?: string;
      endDate?: string;
      tasks: Array<{
        id: string;
        title: string;
        description?: string;
        category?: string;
        priority?: "low" | "medium" | "high";
        status: "pending" | "in_progress" | "completed" | "skipped";
      }>;
    }>;
  };
  isPreview: boolean;
  compact?: boolean;
  /**
   * Live assembly clock from the conversation cards.
   * Index 0 is the project header. Each later index is a phase, in order.
   */
  assembly?: SequencedAchievementProgress;
}

const PHASE_ICONS: Record<string, LucideIcon> = {
  "Foundations": Layers,
  "Trees": Target,
  "Dynamic": Sparkles,
  "Advanced": Award,
  "Default": Layers,
};

const STATUS_CONFIG = {
  completed: {
    icon: CheckIcon,
    bg: "bg-emerald-500/15",
    text: "text-emerald-500",
    border: "border-emerald-500/30",
    label: "Completed",
    ring: "ring-2 ring-emerald-500/30",
  },
  active: {
    icon: CircleIcon,
    bg: "bg-sky-500/15",
    text: "text-sky-500",
    border: "border-sky-500/30",
    label: "In Progress",
    ring: "ring-4 ring-primary/20",
  },
  pending: {
    icon: CircleIcon,
    bg: "bg-muted/80",
    text: "text-muted-foreground",
    border: "border-border",
    label: "Pending",
    ring: "",
  },
  in_progress: {
    icon: CircleIcon,
    bg: "bg-amber-500/15",
    text: "text-amber-500",
    border: "border-amber-500/30",
    label: "In Progress",
    ring: "ring-2 ring-amber-500/20",
  },
};

const PRIORITY_CONFIG = {
  high: { bg: "bg-rose-500/15", text: "text-rose-500", label: "High" },
  medium: { bg: "bg-amber-500/15", text: "text-amber-500", label: "Medium" },
  low: { bg: "bg-muted", text: "text-muted-foreground", label: "Low" },
};

const HEADER_SKELETON_UNTIL = 18;
const HEADER_COPY_UNTIL = 72;
const PHASE_SKELETON_UNTIL = 16;
const PHASE_HEADING_UNTIL = 46;
const PHASE_DETAILS_UNTIL = 62;

type HeaderReveal = { kind: "skeleton" } | { kind: "copy"; textProgress: number } | { kind: "complete" };

type PhaseReveal =
  | { kind: "skeleton" }
  | { kind: "heading"; textProgress: number }
  | { kind: "details" }
  | { kind: "tasks"; visibleTasks: number }
  | { kind: "complete" };

function windowProgress(progress: number, start: number, end: number) {
  if (progress <= start) return 0;
  if (progress >= end) return 1;
  return (progress - start) / (end - start);
}

function headerReveal(assembly: SequencedAchievementProgress | undefined): HeaderReveal {
  if (!assembly) return { kind: "complete" };
  if (assembly.settledCount > 0 || assembly.index > 0) return { kind: "complete" };
  if (assembly.progress < HEADER_SKELETON_UNTIL) return { kind: "skeleton" };
  if (assembly.progress < HEADER_COPY_UNTIL) {
    return { kind: "copy", textProgress: windowProgress(assembly.progress, HEADER_SKELETON_UNTIL, HEADER_COPY_UNTIL) };
  }
  return { kind: "complete" };
}

function phaseReveal(
  assembly: SequencedAchievementProgress | undefined,
  phaseIndex: number,
  taskCount: number
): PhaseReveal | null {
  if (!assembly) return { kind: "complete" };
  const cardIndex = phaseIndex + 1;
  if (assembly.settledCount > cardIndex || assembly.index > cardIndex) return { kind: "complete" };
  if (assembly.index < cardIndex || assembly.settledCount < cardIndex) return null;
  const progress = assembly.progress;
  if (progress < PHASE_SKELETON_UNTIL) return { kind: "skeleton" };
  if (progress < PHASE_HEADING_UNTIL) {
    return { kind: "heading", textProgress: windowProgress(progress, PHASE_SKELETON_UNTIL, PHASE_HEADING_UNTIL) };
  }
  if (progress < PHASE_DETAILS_UNTIL) return { kind: "details" };
  const revealed = Math.ceil(windowProgress(progress, PHASE_DETAILS_UNTIL, 100) * taskCount);
  return { kind: "tasks", visibleTasks: Math.min(taskCount, revealed) };
}

function GeneratedText({ text, progress, className }: { text: string; progress: number; className?: string }) {
  const parts = text.split(/(\s+)/);
  const wordCount = parts.filter((part) => part.trim().length > 0).length;
  const shown = progress >= 1 ? wordCount : progress <= 0 ? 0 : Math.min(wordCount, Math.max(1, Math.ceil(progress * wordCount)));
  let remaining = shown;
  let output = "";
  for (const part of parts) {
    if (remaining <= 0) break;
    output += part;
    if (part.trim().length > 0) remaining -= 1;
  }
  const done = shown >= wordCount;

  return (
    <span className={className}>
      {output}
      {done ? null : (
        <span className="ml-0.5 inline-block h-[0.9em] w-px translate-y-px animate-pulse bg-foreground align-middle" />
      )}
    </span>
  );
}

function TaskSkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-2 py-3">
      <Skeleton className="size-5 rounded-md" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-3 w-2/5" />
      </div>
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
  );
}

function PhaseSection({ phase, phaseIndex, plan, isCompleted, phaseStatus, phaseCompleted, phaseTotal, phaseProgress, statusCfg, PhaseIcon, reveal = { kind: "complete" }, sectionRef }: {
  phase: PlanPreviewProps["plan"]["phases"][0];
  phaseIndex: number;
  plan: PlanPreviewProps["plan"];
  isCompleted: boolean;
  phaseStatus: string;
  phaseCompleted: number;
  phaseTotal: number;
  phaseProgress: number;
  statusCfg: typeof STATUS_CONFIG.completed;
  PhaseIcon: LucideIcon;
  reveal?: PhaseReveal;
  sectionRef?: React.Ref<HTMLDivElement>;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const showCopy = reveal.kind !== "skeleton";
  const showDetails = reveal.kind === "details" || reveal.kind === "tasks" || reveal.kind === "complete";
  const textProgress = reveal.kind === "heading" ? reveal.textProgress : 1;
  const visibleTasks = reveal.kind === "complete" ? phase.tasks.length : reveal.kind === "tasks" ? reveal.visibleTasks : 0;
  const expanded = reveal.kind === "complete" ? isOpen : true;

  return (
    <Card ref={sectionRef} key={phase.id} data-assembly={reveal.kind} className="group w-full overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
      <CardHeader className="px-5 py-4">
        <div className="w-full">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex w-full items-start gap-4 cursor-pointer hover:bg-muted/30 rounded-xl p-2 -mx-2 -my-2 transition-colors"
            aria-expanded={expanded}
          >
            {/* Phase Indicator */}
            <div className="relative flex-shrink-0">
              {showCopy ? (
              <div
                className={cn(
                  "size-10 rounded-xl flex items-center justify-center border-2 transition-all duration-300",
                  isCompleted
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/25"
                    : phaseStatus === "active"
                    ? "bg-primary border-primary text-primary-foreground shadow-md ring-4 ring-primary/20"
                    : "bg-card border-2 border-border text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <CheckIcon className="size-5 stroke-[3]" />
                ) : (
                  <span className="font-mono text-lg font-black">
                    {String(phaseIndex + 1).padStart(2, "0")}
                  </span>
                )}
              </div>
              ) : (
                <Skeleton className="size-10 rounded-xl" />
              )}
              {phaseIndex < plan.phases.length - 1 && (
                <div
                  className={cn(
                    "absolute left-1/2 top-10 bottom-0 w-px -translate-x-1/2",
                    isCompleted ? "bg-emerald-500" : "bg-border"
                  )}
                />
              )}
            </div>

            {/* Phase Content */}
            <div className="flex-1 min-w-0">
              {showCopy ? (
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <PhaseIcon className="size-3.5 text-primary" strokeWidth={1.8} />
                    <span className="font-mono text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-primary/15 text-primary border border-primary/25">
                      Phase {String(phaseIndex + 1).padStart(2, "0")}
                    </span>
                  </div>
                  {phase.category && (
                    <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5 border-border/80 bg-card text-foreground/80 shadow-2xs">
                      {phase.category}
                    </Badge>
                  )}
                </div>
              ) : (
                <div className="mb-2 flex items-center gap-2">
                  <Skeleton className="h-5 w-24 rounded-md" />
                  <Skeleton className="h-5 w-16 rounded-md" />
                </div>
              )}

              {showCopy ? (
                <h3 className="mb-1 text-lg font-black tracking-tight text-foreground sm:text-xl">
                  <GeneratedText text={phase.title} progress={textProgress} />
                </h3>
              ) : (
                <Skeleton className="mb-2 h-6 w-4/5" />
              )}

              {showDetails && phase.description ? (
                <p className="mb-3 animate-in fade-in text-sm italic text-muted-foreground duration-300">{phase.description}</p>
              ) : null}
              {!showDetails && phase.description ? <Skeleton className="mb-3 h-4 w-2/3" /> : null}

              {showDetails ? (
              <div className="flex flex-wrap items-center gap-4 animate-in fade-in duration-300">
                <div className="flex-1 min-w-[150px]">
                  <Progress value={phaseProgress} className="h-2" />
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <ListTodoIcon className="size-3.5" />
                    <span>{phaseTotal} Tasks</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-500">
                    <CircleDashedIcon className="size-3.5" />
                    <span>{phaseTotal - phaseCompleted} Remaining</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-500">
                    <CheckCircle2Icon className="size-3.5" />
                    <span>{phaseCompleted} Done</span>
                  </div>
                </div>
                {phase.startDate && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono shrink-0">
                    <CalendarIcon className="size-3.5" />
                    <span>
                      {phase.startDate} {phase.endDate ? `– ${phase.endDate}` : ""}
                    </span>
                  </div>
                )}
              </div>
              ) : (
                <div className="flex flex-wrap items-center gap-4">
                  <Skeleton className="h-2 min-w-[150px] flex-1" />
                  <Skeleton className="h-4 w-40" />
                </div>
              )}
            </div>

            {/* Phase Status Badge */}
            <div className="flex items-center gap-2 shrink-0">
              {showDetails ? (
              <div
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border shadow-xs animate-in fade-in duration-300",
                  statusCfg.bg,
                  statusCfg.text,
                  statusCfg.border
                )}
              >
                {phaseStatus === "active" && <span className="size-1.5 rounded-full bg-sky-400 animate-pulse" />}
                {isCompleted && <CheckIcon className="size-3.5 stroke-[3]" />}
                {statusCfg.label}
              </div>
              ) : (
                <Skeleton className="h-7 w-24 rounded-full" />
              )}
              <ChevronRightIcon
                className={cn(
                  "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                  expanded && "rotate-90"
                )}
                aria-hidden="true"
              />
            </div>
          </button>

          {/* Tasks List - Collapsible Content */}
          <div
            className={cn(
              "overflow-hidden transition-all duration-300",
              expanded ? "max-h-[2000px] opacity-100 mt-4" : "max-h-0 opacity-0 mt-0"
            )}
            style={{ willChange: "max-height, opacity, margin-top" }}
          >
            <div className="rounded-2xl border border-border/70 bg-card/40 px-5 py-4">
              <div className="flex flex-col divide-y divide-border/40">
                {phase.tasks.map((task, taskIndex) => {
                  if (taskIndex >= visibleTasks) {
                    return <TaskSkeletonRow key={`skeleton-${task.id}`} />;
                  }
                  const isDone = task.status === "completed";
                  const taskStatusCfg = STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                  const priorityCfg = PRIORITY_CONFIG[task.priority || "medium"];

                  return (
                    <div
                      key={task.id}
                      className={`group relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3 transition-colors rounded-lg px-2 hover:bg-muted/30 animate-in fade-in duration-300 ${
                        isDone ? "opacity-70" : ""
                      }`}
                    >
                      {/* Checkbox & Details */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Status Indicator */}
                        <div
                          className={cn(
                            "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition-all",
                            isDone
                              ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                              : task.status === "in_progress"
                              ? "border-sky-500 bg-sky-500/15 text-sky-500 animate-pulse"
                              : "border-muted-foreground/40 bg-background"
                          )}
                        >
                          {isDone && <CheckIcon className="size-3.5 stroke-[3]" />}
                          {task.status === "in_progress" && (
                            <span className="size-1.5 rounded-full bg-sky-400 animate-pulse" />
                          )}
                        </div>

                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={cn(
                                "text-sm font-semibold transition-all",
                                isDone ? "line-through text-muted-foreground" : "text-foreground"
                              )}
                            >
                              {task.title}
                            </span>

                            {task.category && (
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                                {task.category}
                              </Badge>
                            )}

                            {task.priority && (
                              <Badge
                                variant="secondary"
                                className={cn("text-[9px] px-1.5 py-0 gap-1", priorityCfg.bg, priorityCfg.text)}
                              >
                                {priorityCfg.label}
                              </Badge>
                            )}
                          </div>

                          {task.description && (
                            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <div
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border",
                            taskStatusCfg.bg,
                            taskStatusCfg.text,
                            taskStatusCfg.border
                          )}
                        >
                          {task.status === "in_progress" && (
                            <span className="size-1.5 rounded-full bg-sky-400 animate-pulse" />
                          )}
                          {taskStatusCfg.label}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {phase.tasks.length === 0 && (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    No tasks in this phase yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

export function PlanPreview({ plan, isPreview, compact = false, assembly }: PlanPreviewProps): JSX.Element {
  const staged = isPreview ? assembly : undefined;
  const header = headerReveal(staged);
  const showHeaderCopy = header.kind !== "skeleton";
  const showHeaderDetails = header.kind === "complete";
  const headerTextProgress = header.kind === "copy" ? header.textProgress : 1;
  const activeSectionRef = useRef<HTMLDivElement | null>(null);
  const totalTasks = plan.phases.reduce((acc, phase) => acc + phase.tasks.length, 0);
  const completedTasks = plan.phases.reduce(
    (acc, phase) => acc + phase.tasks.filter((t) => t.status === "completed").length,
    0
  );
  const inProgressTasks = plan.phases.reduce(
    (acc, phase) => acc + phase.tasks.filter((t) => t.status === "in_progress").length,
    0
  );
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const assemblyFinished = !staged || staged.settledCount >= plan.phases.length + 1;

  useEffect(() => {
    activeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [staged?.index]);

  const getPhaseIcon = (title: string): LucideIcon => {
    const key = Object.keys(PHASE_ICONS).find((k) => title.includes(k));
    return (key ? PHASE_ICONS[key] : PHASE_ICONS.Default) as LucideIcon;
  };

  if (compact) {
    return (
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] px-2 py-0 font-medium">
              {plan.phases.length} Phases
            </Badge>
            <Badge variant="outline" className="text-[10px] px-2 py-0 font-medium">
              {totalTasks} Tasks
            </Badge>
            <div className="flex-1" />
            <Progress value={overallProgress} className="h-1.5 w-32" />
          </div>
          <CardTitle className="mt-2 text-sm font-bold line-clamp-1">{plan.title}</CardTitle>
          <CardDescription className="text-xs line-clamp-1">{plan.description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="space-y-2 max-h-64 overflow-auto">
            {plan.phases.slice(0, 3).map((phase, index) => {
              const phaseCompleted = phase.tasks.filter((t) => t.status === "completed").length;
              const phaseTotal = phase.tasks.length;
              const phaseProgress = phaseTotal > 0 ? Math.round((phaseCompleted / phaseTotal) * 100) : 0;
              const phaseStatus = phase.status;
              const statusCfg = STATUS_CONFIG[phaseStatus as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
              const PhaseIcon = getPhaseIcon(phase.title);

              return (
                <div key={phase.id} className="group relative overflow-hidden rounded-xl border border-border/70 bg-card/40 p-3 transition-colors hover:border-primary/50">
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-lg border border-primary/20 bg-primary/5 flex items-center justify-center shrink-0">
                      <PhaseIcon className="size-3.5 text-primary" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/25 shrink-0">
                          Phase {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="font-medium text-sm truncate">{phase.title}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={phaseProgress} className="h-1.5 flex-1 max-w-[120px]" />
                        <span className={cn("text-[10px] font-mono font-bold", statusCfg.text)}>
                          {phaseProgress}%
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Mini task indicators */}
                  <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1">
                    {phase.tasks.slice(0, 8).map((task) => {
                      const taskStatus = task.status;
                      const taskStatusCfg = STATUS_CONFIG[taskStatus as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                      return (
                        <div
                          key={task.id}
                          className={cn(
                            "size-2 rounded-full shrink-0 transition-all",
                            taskStatus === "completed" && "bg-emerald-500",
                            taskStatus === "in_progress" && "bg-sky-500 animate-pulse",
                            taskStatus === "pending" && "bg-muted-foreground/30"
                          )}
                          title={task.title}
                        />
                      );
                    })}
                    {phase.tasks.length > 8 && (
                      <span className="text-[9px] text-muted-foreground px-1">
                        +{phase.tasks.length - 8}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {plan.phases.length > 3 && (
              <div className="text-center text-xs text-muted-foreground py-2">
                +{plan.phases.length - 3} more phases
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-4">
      <Card
        ref={staged?.index === 0 ? activeSectionRef : undefined}
        data-assembly={header.kind}
        className="w-full overflow-hidden border-border/50 bg-gradient-to-br from-card via-card to-muted/30"
      >
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            {showHeaderDetails ? (
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 animate-in fade-in duration-300">
                <Sparkles className="size-6 text-primary-foreground" />
              </div>
            ) : (
              <Skeleton className="size-12 shrink-0 rounded-2xl" />
            )}
            <div className="min-w-0 flex-1">
              {showHeaderDetails ? (
                <div className="mb-2 flex flex-wrap items-center gap-2 animate-in fade-in duration-300">
                  <Badge variant="outline" className="px-2.5 py-0.5 text-xs font-medium">
                    {plan.phases.length} Phases
                  </Badge>
                  <Badge variant="outline" className="px-2.5 py-0.5 text-xs font-medium">
                    {totalTasks} Tasks
                  </Badge>
                  <Badge variant="outline" className="px-2.5 py-0.5 text-xs font-medium">
                    {Math.ceil(totalTasks / 8)} Weeks
                  </Badge>
                </div>
              ) : (
                <div className="mb-2 flex items-center gap-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              )}
              {showHeaderCopy ? (
                <CardTitle className="text-2xl font-black tracking-tight text-foreground">
                  <GeneratedText text={plan.title} progress={headerTextProgress} />
                </CardTitle>
              ) : (
                <Skeleton className="h-8 w-3/4" />
              )}
              {showHeaderCopy ? (
                <CardDescription className="mt-2 max-w-none text-base text-balance">
                  <GeneratedText text={plan.description} progress={headerTextProgress} />
                </CardDescription>
              ) : (
                <Skeleton className="mt-3 h-4 w-full" />
              )}
            </div>
            {showHeaderDetails ? (
              <div className="shrink-0 animate-in fade-in text-right duration-300">
                <div className="text-3xl font-black text-foreground">{overallProgress}%</div>
                <div className="text-xs text-muted-foreground">Overall Progress</div>
              </div>
            ) : (
              <Skeleton className="h-10 w-16 shrink-0" />
            )}
          </div>
          {showHeaderDetails ? (
            <>
              <Progress value={overallProgress} className="mt-2 h-2 animate-in fade-in duration-300" />
              <div className="mt-3 flex animate-in items-center justify-between text-xs text-muted-foreground fade-in duration-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2Icon className="size-3.5 text-emerald-500" />
                  <span>{completedTasks} Completed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CircleDashedIcon className="size-3.5 text-amber-500" />
                  <span>{inProgressTasks} In Progress</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CircleIcon className="size-3.5 text-muted-foreground" />
                  <span>{totalTasks - completedTasks - inProgressTasks} Remaining</span>
                </div>
              </div>
            </>
          ) : (
            <div className="mt-4 space-y-3">
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Phases Timeline */}
      <div className="space-y-4">
        {plan.phases.map((phase, phaseIndex) => {
          const phaseCompleted = phase.tasks.filter((t) => t.status === "completed").length;
          const phaseTotal = phase.tasks.length;
          const phaseProgress = phaseTotal > 0 ? Math.round((phaseCompleted / phaseTotal) * 100) : 0;
          const isCompleted = phaseCompleted > 0 && phaseCompleted === phaseTotal;
          const phaseStatus = phase.status;
          const statusCfg = STATUS_CONFIG[phaseStatus as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
          const PhaseIcon = getPhaseIcon(phase.title);

          const reveal = phaseReveal(staged, phaseIndex, phaseTotal);
          if (!reveal) return null;

          return (
            <PhaseSection
              key={phase.id}
              phase={phase}
              phaseIndex={phaseIndex}
              plan={plan}
              isCompleted={isCompleted}
              phaseStatus={phaseStatus}
              phaseCompleted={phaseCompleted}
              phaseTotal={phaseTotal}
              phaseProgress={phaseProgress}
              statusCfg={statusCfg}
              PhaseIcon={PhaseIcon}
              reveal={reveal}
              sectionRef={staged?.index === phaseIndex + 1 ? activeSectionRef : undefined}
            />
          );
        })}
      </div>

      {assemblyFinished ? (
      <Card className="w-full animate-in border-border/50 bg-muted/30 fade-in duration-300">
        <CardContent className="pt-4 pb-6">
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-full bg-emerald-500" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-full bg-sky-500 animate-pulse" />
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-full bg-muted-foreground/30" />
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-1.5 border-l border-border pl-4 ml-2">
              <Badge variant="secondary" className="bg-rose-500/15 text-rose-500">
                High Priority
              </Badge>
              <Badge variant="secondary" className="bg-amber-500/15 text-amber-500">
                Medium
              </Badge>
              <Badge variant="secondary" className="bg-muted text-muted-foreground">
                Low
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      ) : null}
    </div>
  );
}