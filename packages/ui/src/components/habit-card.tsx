"use client";

import { Check, Flame } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

type HabitCardProps = {
  title: string;
  description?: string; // shown only when different from title
  streak: number; // current streak, counting today if completed
  history?: boolean[]; // previous 6 days, oldest -> yesterday
  completed: boolean;
  onToggle: () => void;
};

export function HabitCard({
  title,
  description,
  streak,
  history = [false, false, false, false, false, false],
  completed,
  onToggle,
}: HabitCardProps) {
  const showDescription = description && description.trim() !== title.trim();
  const week = [...history.slice(-6), completed];

  return (
    <div
      role="checkbox"
      aria-checked={completed}
      aria-label={`${title}, ${streak} day streak`}
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onToggle();
        }
      }}
      className={cn(
        "group relative isolate flex cursor-pointer items-center gap-3.5 overflow-hidden rounded-2xl border p-3.5",
        "transition-[border-color,background-color,transform] duration-300 outline-none",
        "focus-visible:ring-2 focus-visible:ring-emerald-400/60 active:scale-[0.99]",
        completed
          ? "border-emerald-400/35"
          : "border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
      )}
    >
      {/* Completion fill: sweeps across the card left to right */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 -z-10 origin-left bg-emerald-500/[0.10] transition-transform duration-500 ease-out",
          completed ? "scale-x-100" : "scale-x-0"
        )}
      />

      {/* Check: the primary control and the main status signal */}
      <div className="relative size-9 shrink-0">
        {completed && (
          <span
            aria-hidden
            className="absolute inset-0 rounded-full bg-emerald-400/20 motion-safe:animate-[ring-burst_650ms_ease-out_forwards]"
          />
        )}
        <span
          className={cn(
            "relative flex size-9 items-center justify-center rounded-full border-2 transition-colors duration-200",
            completed
              ? "border-emerald-400 bg-emerald-400 text-emerald-950 shadow-[0_0_6px_rgba(52,211,153,0.18)] motion-safe:animate-[check-pop_380ms_cubic-bezier(0.34,1.56,0.64,1)]"
              : "border-white/25 text-transparent group-hover:border-emerald-400/70 group-hover:text-emerald-400/40"
          )}
        >
          <Check className="size-5" strokeWidth={3} />
        </span>
      </div>

      {/* Title + last 7 days */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-[15px] font-semibold leading-tight",
            completed ? "text-white" : "text-white/90"
          )}
        >
          {title}
        </p>

        {showDescription && (
          <p className="mt-0.5 truncate text-xs text-white/40">{description}</p>
        )}

        <div className="mt-2 flex items-center gap-1" aria-hidden>
          {week.map((done, i) => {
            const isToday = i === week.length - 1;
            return (
              <span
                key={i}
                className={cn(
                  "h-1.5 w-5 rounded-full transition-colors duration-300",
                  done ? "bg-emerald-400/70" : "bg-white/10",
                  isToday && !done && "ring-1 ring-inset ring-white/30",
                  isToday &&
                    done &&
                    "bg-emerald-300 shadow-[0_0_3px_rgba(110,231,183,0.28)] motion-safe:animate-[check-pop_380ms_cubic-bezier(0.34,1.56,0.64,1)]"
                )}
              />
            );
          })}
        </div>
      </div>

      {/* Streak pill: dim until today is done, then it lights up */}
      <div
        className={cn(
          "flex w-8 shrink-0 flex-col items-center gap-0.5 rounded-lg border py-1 text-xs font-semibold tabular-nums leading-none transition-colors duration-300",
          completed
            ? "border-orange-400/30 bg-orange-400/10 text-orange-300"
            : "border-white/10 text-white/40"
        )}
      >
        <Flame
          className={cn(
            "size-3.5 transition-all duration-300",
            completed && "fill-orange-400 text-orange-400 drop-shadow-[0_0_2px_rgba(251,146,60,0.25)]"
          )}
          strokeWidth={2}
        />
        <span key={streak} className="motion-safe:animate-[check-pop_380ms_cubic-bezier(0.34,1.56,0.64,1)]">
          {streak}
        </span>
      </div>
    </div>
  );
}
