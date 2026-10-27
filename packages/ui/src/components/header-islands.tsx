"use client";

import { useEffect, useState } from "react";
import { Bell, Check } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { Notifications } from "@workspace/ui/components/notifications";

/* ---------- shared island surface ---------- */

const island =
  "pointer-events-auto relative flex h-11 items-center overflow-hidden rounded-full " +
  "border border-white/10 bg-neutral-950/70 backdrop-blur-xl shadow-lg shadow-black/40";

/* ---------- types ---------- */

export type ScheduleEvent = { id: string; title: string; start: Date; end: Date };

type HeaderIslandsProps = {
  habitsDone: number;
  habitsTotal: number;
  events: ScheduleEvent[]; // the component picks the one happening now
  notificationCount: number;
};

/* ---------- helpers ---------- */

function useNow(intervalMs = 15_000) {
  // null until mounted, so server and client markup match
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

const fmtTime = (d: Date) =>
  d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

const fmtShort = (d: Date) =>
  d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

/* ---------- left: today + habit progress ---------- */

function ProgressRing({ done, total }: { done: number; total: number }) {
  const r = 11;
  const c = 2 * Math.PI * r;
  const pct = total === 0 ? 0 : done / total;
  const complete = total > 0 && done === total;

  return (
    <div
      className="relative size-7 shrink-0"
      role="img"
      aria-label={`${done} of ${total} habits done today`}
    >
      <svg viewBox="0 0 28 28" className="size-7 -rotate-90">
        <circle cx="14" cy="14" r={r} fill="none" strokeWidth="3" className="stroke-white/10" />
        <circle
          cx="14"
          cy="14"
          r={r}
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className={cn(
            "transition-[stroke-dashoffset,stroke] duration-500 ease-out",
            complete ? "stroke-emerald-400" : "stroke-emerald-400/80"
          )}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">
        {complete ? (
          <Check className="size-3.5 text-emerald-300" strokeWidth={3} />
        ) : (
          <span className="text-[10px] font-semibold tabular-nums text-white/80">{done}</span>
        )}
      </span>
    </div>
  );
}

function TodayIsland({ now, done, total }: { now: Date | null; done: number; total: number }) {
  const date = now?.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  return (
    <div className={cn(island, "gap-2.5 pl-2 pr-4")}>
      <ProgressRing done={done} total={total} />
      <div className="leading-tight">
        <p className="text-sm font-semibold text-white">Today</p>
        <p className="hidden text-[11px] text-white/45 sm:block">{date ?? "\u00A0"}</p>
      </div>
    </div>
  );
}

/* ---------- middle: time + what's on right now ---------- */

function NowIsland({ now, events }: { now: Date | null; events: ScheduleEvent[] }) {
  const current = now ? events.find((e) => e.start <= now && now < e.end) : undefined;
  const progress =
    now && current
      ? ((now.getTime() - current.start.getTime()) / (current.end.getTime() - current.start.getTime())) * 100
      : 0;

  const time = now ? fmtTime(now) : "--:-- --";
  const [hhmm, meridiem] = time.split(" ");

  return (
    <div className={cn(island, "gap-3.5 px-5")}>
      {/* time */}
      <div className="flex items-baseline gap-1 tabular-nums">
        <span className="text-[17px] font-semibold leading-none text-white">{hhmm}</span>
        <span className="text-[11px] font-medium text-white/50">{meridiem}</span>
      </div>

      <span aria-hidden className="h-5 w-px bg-white/10" />

      {/* current event only */}
      {current ? (
        <div className="flex min-w-0 items-center gap-2">
          <span aria-hidden className="relative flex size-2 shrink-0">
            <span className="absolute inset-0 rounded-full bg-emerald-400/60 motion-safe:animate-ping" />
            <span className="relative size-2 rounded-full bg-emerald-400" />
          </span>
          <span className="max-w-[200px] truncate text-sm font-medium text-white">{current.title}</span>
          <span className="shrink-0 text-xs tabular-nums text-white/45">
            until {fmtShort(current.end)}
          </span>
        </div>
      ) : (
        <span className="text-sm text-white/45">Nothing scheduled</span>
      )}

      {/* elapsed time of the current event */}
      {current && (
        <span
          aria-hidden
          className="absolute bottom-0 left-0 h-[2px] bg-emerald-400/70 transition-[width] duration-1000"
          style={{ width: `${progress}%` }}
        />
      )}
    </div>
  );
}

/* ---------- right: notifications ---------- */

function NotificationsIsland({ count }: { count: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        island,
        "h-auto flex-col items-stretch rounded-[22px] transition-[width] duration-300 ease-out",
        open ? "w-80" : "w-11"
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={count > 0 ? `${count} unread notifications` : "Notifications"}
        className="flex h-11 w-full items-center gap-2 px-3 outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      >
        <Bell className="size-[18px] shrink-0 text-white/80" strokeWidth={1.75} />
        {open && (
          <span className="truncate text-sm font-semibold text-white">Notifications</span>
        )}
        {count > 0 && !open && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-500 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-neutral-950">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="max-h-80 overflow-y-auto px-2 pb-3">
            <Notifications />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- header ---------- */

export function HeaderIslands({
  habitsDone,
  habitsTotal,
  events,
  notificationCount,
}: HeaderIslandsProps) {
  const now = useNow();

  return (
    <header className="pointer-events-none fixed inset-x-0 top-3 z-40 grid grid-cols-[1fr_auto_1fr] items-start gap-3 px-4">
      <div className="justify-self-start">
        <TodayIsland now={now} done={habitsDone} total={habitsTotal} />
      </div>
      <NowIsland now={now} events={events} />
      <div className="justify-self-end">
        <NotificationsIsland count={notificationCount} />
      </div>
    </header>
  );
}
