"use client";

import * as React from "react";
import {
  Bell,
  BellOff,
  CalendarRange,
  Check,
  CheckCircle2,
  Flame,
  MousePointerClick,
  Repeat,
  Target,
  TrendingUp,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

export type HabitStatus = "on_track" | "at_risk" | "behind" | "completed";

export interface HabitHeaderProps {
  title: string;
  description?: string;
  category: string;
  frequency: string;
  currentStreak: number;
  status: HabitStatus;
  goalLabel: string;
  startDate: string | Date;
  targetEndDate: string | Date;
  reminder?: string | null;
  source: string;
  activeDays: number;
  totalDays: number;
  doneToday: boolean;
  onToggleDone?: () => void;
  onSetReminder?: () => void;
  /** Injectable for tests / SSR consistency. */
  now?: Date;
}

const DAY_MS = 86_400_000;

const STATUS_STYLES: Record<
  HabitStatus,
  { label: string; className: string; dot: string }
> = {
  on_track: {
    label: "On track",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    dot: "bg-emerald-400",
  },
  at_risk: {
    label: "At risk",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    dot: "bg-amber-400",
  },
  behind: {
    label: "Behind",
    className: "border-rose-500/30 bg-rose-500/10 text-rose-400",
    dot: "bg-rose-400",
  },
  completed: {
    label: "Completed",
    className: "border-sky-500/30 bg-sky-500/10 text-sky-400",
    dot: "bg-sky-400",
  },
};

const clamp = (n: number, min = 0, max = 100) => Math.min(max, Math.max(min, n));

const toDate = (d: string | Date) => (d instanceof Date ? d : new Date(d));

const formatDate = (d: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);

function Pill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full border px-3 text-xs font-medium",
        className
      )}
    >
      {children}
    </span>
  );
}

function ProgressBar({
  value,
  label,
  className,
}: {
  value: number;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      className="h-1.5 w-full overflow-hidden rounded-full bg-white/10"
    >
      <div
        className={cn("h-full rounded-full transition-all duration-700", className)}
        style={{ width: `${clamp(value)}%` }}
      />
    </div>
  );
}

function InfoCard({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/50">
        <span className="text-white/40" aria-hidden>
          {icon}
        </span>
        {label}
      </div>
      {children}
    </div>
  );
}

export function HabitHeader({
  title,
  description,
  category,
  frequency,
  currentStreak,
  status,
  goalLabel,
  startDate,
  targetEndDate,
  reminder,
  source,
  activeDays,
  totalDays,
  doneToday,
  onToggleDone,
  onSetReminder,
  now,
}: HabitHeaderProps) {
  const statusStyle = STATUS_STYLES[status];

  const { periodPct, daysLeft, start, end } = React.useMemo(() => {
    const start = toDate(startDate);
    const end = toDate(targetEndDate);
    const today = now ?? new Date();
    const total = Math.max(end.getTime() - start.getTime(), 1);
    const elapsed = today.getTime() - start.getTime();
    return {
      start,
      end,
      periodPct: clamp((elapsed / total) * 100),
      daysLeft: Math.max(Math.ceil((end.getTime() - today.getTime()) / DAY_MS), 0),
    };
  }, [startDate, targetEndDate, now]);

  const consistencyPct = totalDays > 0 ? (activeDays / totalDays) * 100 : 0;

  return (
    <header className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <Pill className="border-white/10 bg-white/5 text-white/70">{category}</Pill>
        <Pill className="border-white/10 bg-white/5 text-white/70">
          <Repeat className="size-3" aria-hidden />
          {frequency}
        </Pill>
        {currentStreak > 0 && (
          <Pill className="border-amber-500/30 bg-amber-500/10 text-amber-400">
            <Flame className="size-3" aria-hidden />
            {currentStreak} day streak
          </Pill>
        )}
        <Pill className={statusStyle.className}>
          <span className={cn("size-1.5 rounded-full", statusStyle.dot)} aria-hidden />
          {statusStyle.label}
        </Pill>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <h1 className="truncate text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="max-w-2xl text-base text-white/60">{description}</p>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleDone}
          aria-pressed={doneToday}
          className={cn(
            "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-semibold transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60",
            doneToday
              ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20"
              : "border-white/15 bg-white text-black hover:bg-white/90"
          )}
        >
          {doneToday ? (
            <>
              <CheckCircle2 className="size-4" aria-hidden />
              Done today
            </>
          ) : (
            <>
              <Check className="size-4" aria-hidden />
              Mark as done
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <InfoCard icon={<Target className="size-4" />} label="Goal">
          <p className="text-xl font-semibold text-white">{goalLabel}</p>
          <p className="text-sm text-white/50">Check in every day to keep your streak.</p>
        </InfoCard>

        <InfoCard icon={<CalendarRange className="size-4" />} label="Schedule">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-xl font-semibold text-white">
              {daysLeft} <span className="text-sm font-normal text-white/50">days left</span>
            </p>
            <span className="text-xs tabular-nums text-white/50">
              {Math.round(periodPct)}% elapsed
            </span>
          </div>
          <ProgressBar value={periodPct} label="Time elapsed" className="bg-sky-400" />
          <div className="flex justify-between text-xs text-white/50">
            <time dateTime={start.toISOString()}>{formatDate(start)}</time>
            <time dateTime={end.toISOString()}>{formatDate(end)}</time>
          </div>
        </InfoCard>

        <InfoCard icon={<TrendingUp className="size-4" />} label="Consistency">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-xl font-semibold text-white">
              {Math.round(consistencyPct)}%
            </p>
            <span className="text-xs tabular-nums text-white/50">
              {activeDays} of {totalDays} days
            </span>
          </div>
          <ProgressBar
            value={consistencyPct}
            label="Consistency"
            className="bg-emerald-400"
          />
          <p className="text-xs text-white/50">Active days since you started.</p>
        </InfoCard>
      </div>

      <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-4 text-sm">
        <div className="flex items-center gap-2">
          <dt className="sr-only">Reminder</dt>
          {reminder ? (
            <dd className="flex items-center gap-2 text-white/80">
              <Bell className="size-4 text-white/40" aria-hidden />
              Reminder at {reminder}
            </dd>
          ) : (
            <dd className="flex items-center gap-2 text-white/50">
              <BellOff className="size-4 text-white/40" aria-hidden />
              No reminder
              {onSetReminder && (
                <button
                  type="button"
                  onClick={onSetReminder}
                  className="ml-1 rounded font-medium text-sky-400 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60"
                >
                  Set one
                </button>
              )}
            </dd>
          )}
        </div>

        <div className="flex items-center gap-2">
          <dt className="sr-only">Check-in source</dt>
          <dd className="flex items-center gap-2 text-white/80">
            <MousePointerClick className="size-4 text-white/40" aria-hidden />
            {source}
          </dd>
        </div>
      </dl>
    </header>
  );
}

export default HabitHeader;
