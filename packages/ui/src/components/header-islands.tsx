"use client";

import { useEffect, useState } from "react";
import { cn } from "@workspace/ui/lib/utils";

/* ---------- shared island surface ---------- */

const island =
  "pointer-events-auto relative flex h-11 items-center overflow-hidden rounded-full " +
  "border border-border bg-card/90 backdrop-blur-xl shadow-lg shadow-black/10";

/* ---------- types ---------- */

export type ScheduleEvent = { id: string; title: string; start: Date; end: Date };

type HeaderIslandsProps = {
  events: ScheduleEvent[]; // the component picks the one happening now
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
      <div className="flex items-baseline gap-1 tabular-nums">
        <span className="text-[17px] font-semibold leading-none text-foreground">{hhmm}</span>
        <span className="text-[11px] font-medium text-muted-foreground">{meridiem}</span>
      </div>

      <span aria-hidden className="h-5 w-px bg-border" />

      {current ? (
        <div className="flex min-w-0 items-center gap-2">
          <span aria-hidden className="relative flex size-2 shrink-0">
            <span className="absolute inset-0 rounded-full bg-emerald-400/60 motion-safe:animate-ping" />
            <span className="relative size-2 rounded-full bg-emerald-400" />
          </span>
          <span className="max-w-[200px] truncate text-sm font-medium text-foreground">{current.title}</span>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            until {fmtShort(current.end)}
          </span>
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">Nothing scheduled</span>
      )}

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

/* ---------- header ---------- */

export function HeaderIslands({ events }: HeaderIslandsProps) {
  const now = useNow();

  return (
    <header className="pointer-events-none fixed inset-x-0 top-3 z-40 flex items-start justify-center px-4">
      <NowIsland now={now} events={events} />
    </header>
  );
}
