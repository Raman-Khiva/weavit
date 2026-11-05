"use client";

import { BookOpen, CalendarDays, ChevronRight } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

/* ---------- Section header ---------- */

export function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div className="mb-2 mt-4 flex items-center gap-2 px-1 first:mt-0">
      <h3 className="text-sm font-semibold text-foreground/80">{title}</h3>
      {count !== undefined && (
        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">
          {count}
        </span>
      )}
    </div>
  );
}

/* ---------- Task card ---------- */

type Priority = "high" | "medium" | "low";

const PRIORITY: Record<Priority, { label: string; bar: string; dot: string; badge: string }> = {
  high: {
    label: "High",
    bar: "bg-red-500",
    dot: "bg-red-500",
    badge: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
  },
  medium: {
    label: "Medium",
    bar: "bg-amber-500",
    dot: "bg-amber-500",
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  low: {
    label: "Low",
    bar: "bg-sky-500",
    dot: "bg-sky-500",
    badge: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
};

// "2024-04-01" -> { text: "Apr 1 · 3 days overdue", tone: "overdue" }
function dueInfo(date: string) {
  const [y = 0, m = 1, d = 1] = date.split("-").map(Number);
  const due = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.round((due.getTime() - today.getTime()) / 86_400_000);

  const label = due.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(due.getFullYear() !== today.getFullYear() && { year: "numeric" }),
  });

  if (diff < 0) {
    const n = Math.abs(diff);
    return { text: `${label} · ${n} ${n === 1 ? "day" : "days"} overdue`, tone: "overdue" as const };
  }
  if (diff === 0) return { text: `${label} · Due today`, tone: "today" as const };
  if (diff === 1) return { text: `${label} · Due tomorrow`, tone: "upcoming" as const };
  if (diff <= 7) return { text: `${label} · In ${diff} days`, tone: "upcoming" as const };
  return { text: label, tone: "upcoming" as const };
}

const DUE_TONE = {
  overdue: "text-red-600 dark:text-red-300",
  today: "text-amber-600 dark:text-amber-300",
  upcoming: "text-muted-foreground",
};

type TaskCardProps = {
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  priority: Priority;
  onClick?: () => void;
};

export function TaskCard({ title, description, dueDate, priority, onClick }: TaskCardProps) {
  const p = PRIORITY[priority];
  const due = dueInfo(dueDate);

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card py-3.5 pl-5 pr-3.5",
        "transition-colors duration-200 hover:bg-muted/40",
        onClick && "cursor-pointer"
      )}
    >
      {/* Priority bar: readable at a glance down the list */}
      <span aria-hidden className={cn("absolute inset-y-0 left-0 w-1", p.bar)} />

      <div className="flex items-start justify-between gap-3">
        <h4 className="text-[15px] font-semibold leading-snug text-foreground">{title}</h4>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
            p.badge
          )}
        >
          <span aria-hidden className={cn("size-1.5 rounded-full", p.dot)} />
          {p.label}
        </span>
      </div>

      {description && (
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      )}

      <div className={cn("mt-3 flex items-center gap-1.5 text-xs font-medium", DUE_TONE[due.tone])}>
        <CalendarDays className="size-3.5" strokeWidth={2} />
        {due.text}
      </div>
    </div>
  );
}

/* ---------- Plan item card ---------- */

type PlanItemCardProps = {
  title: string;
  planName: string;
  topic?: string;
  onClick?: () => void;
};

export function PlanItemCard({ title, planName, topic, onClick }: PlanItemCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-xl border border-border bg-card px-3.5 py-3",
        "transition-colors duration-200 hover:bg-muted/40",
        onClick && "cursor-pointer"
      )}
    >
      <div className="min-w-0 flex-1">
        <h4 className="text-[15px] font-semibold leading-snug text-foreground">{title}</h4>

        {/* Wraps instead of truncating so the full path stays readable */}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
          <BookOpen className="size-3.5 shrink-0" strokeWidth={2} />
          <span>{planName}</span>
          {topic && (
            <>
              <ChevronRight className="size-3 shrink-0 text-muted-foreground/60" />
              <span className="text-foreground/70">{topic}</span>
            </>
          )}
        </div>
      </div>

      <ChevronRight
        className="size-4 shrink-0 text-muted-foreground/50 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-muted-foreground"
        strokeWidth={2}
      />
    </div>
  );
}
