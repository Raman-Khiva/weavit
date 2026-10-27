"use client";

import { useEffect, useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

/* ---------- types ---------- */

export type Priority = "high" | "medium" | "low";

export type Deadline = {
  id: string;
  title: string;
  due: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm (24h). Without it the item is "any time" that day.
  priority: Priority;
  done?: boolean;
};

type DeadlinesProps = {
  deadlines: Deadline[];
  onOpen?: (deadline: Deadline) => void;
  onToggle?: (deadline: Deadline) => void;
  className?: string;
};

/* ---------- helpers ---------- */

const pad = (n: number) => String(n).padStart(2, "0");
const parse = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const daysBetween = (a: Date, b: Date) => Math.round((a.getTime() - b.getTime()) / 86_400_000);
const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const fmt12 = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return `${h % 12 || 12}:${pad(m)} ${h >= 12 ? "PM" : "AM"}`;
};
const span = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? (m ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
};
const RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
const RING: Record<Priority, string> = {
  high: "border-red-400/70",
  medium: "border-amber-400/70",
  low: "border-sky-400/70",
};

const MAX_PAST = 3; // overdue items shown above "Now"
const MAX_FUTURE = 5; // approaching items shown below "Now"
const HORIZON_DAYS = 7;

function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState<Date | null>(null); // null until mounted
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

/* ---------- checkbox circle (ring colour = priority) ---------- */

function Tick({ item, onToggle }: { item: Deadline; onToggle?: (d: Deadline) => void }) {
  const circle = (
    <span
      className={cn(
        "flex size-5 items-center justify-center rounded-full border-2 transition-colors",
        item.done
          ? "border-emerald-400 bg-emerald-400 text-emerald-950 motion-safe:animate-[check-pop_380ms_cubic-bezier(0.34,1.56,0.64,1)]"
          : cn("bg-neutral-950", RING[item.priority], onToggle && "group-hover/check:bg-white/10")
      )}
    >
      {item.done && <Check className="size-3" strokeWidth={3.5} />}
    </span>
  );
  if (!onToggle) return circle;
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={!!item.done}
      aria-label={`Mark "${item.title}" ${item.done ? "not done" : "done"}`}
      onClick={() => onToggle(item)}
      className="group/check rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/50"
    >
      {circle}
    </button>
  );
}

/* ---------- rail line (spans the row including its time-gap padding) ---------- */

function RailLine({ first, last, gap }: { first: boolean; last: boolean; gap: number }) {
  return (
    <span
      aria-hidden
      className="absolute left-[calc(4.5rem+0.625rem)] w-px -translate-x-1/2 bg-white/10"
      style={{
        top: first ? "50%" : 0,
        bottom: last ? `calc((100% - ${gap}px) / 2)` : 0,
      }}
    />
  );
}

/* ---------- model ---------- */

type Entry = {
  d: Deadline;
  key: number; // minutes from today's midnight; any-time items sort to end of their day
  dayDiff: number;
};

type Status = "done" | "overdue" | "soon" | "upcoming";

/* ---------- component ---------- */

export function Deadlines({ deadlines, onOpen, onToggle, className }: DeadlinesProps) {
  const now = useNow();
  const [hover, setHover] = useState<string | null>(null);

  const shell = cn(
    "w-full max-w-lg rounded-2xl border p-4 transition-colors duration-500",
    className
  );

  // until mounted, render only the header so server and client markup match
  if (!now) {
    return (
      <section aria-label="Deadlines" aria-busy className={cn(shell, "border-white/[0.08] bg-white/[0.02]")}>
        <h3 className="text-sm font-semibold text-white/85">Deadlines</h3>
      </section>
    );
  }

  const today = startOfDay(now);
  const nowKey = now.getHours() * 60 + now.getMinutes();

  const entries: Entry[] = deadlines
    .map((d) => {
      const dayDiff = daysBetween(parse(d.due), today);
      return { d, dayDiff, key: dayDiff * 1440 + (d.dueTime ? toMin(d.dueTime) : 1439) };
    })
    .sort((a, b) => a.key - b.key || RANK[a.d.priority] - RANK[b.d.priority]);

  const pastPending = entries.filter((e) => !e.d.done && e.key < nowKey);
  const doneToday = entries.filter((e) => e.d.done && e.dayDiff === 0);
  const futurePending = entries.filter(
    (e) => !e.d.done && e.key >= nowKey && e.dayDiff <= HORIZON_DAYS
  );

  const shownPast = pastPending.slice(0, MAX_PAST);
  const soon = futurePending.filter(
    (e) => e.dayDiff === 0 && !!e.d.dueTime && e.key - nowKey <= 60
  );
  const upcoming = futurePending.filter((e) => !soon.includes(e));
  const shownUpcoming = upcoming.slice(0, MAX_FUTURE);
  const hiddenOverdue = pastPending.length - shownPast.length;
  const hiddenLater = upcoming.length - shownUpcoming.length;

  const pathEntries = [...doneToday, ...soon].sort((a, b) => a.key - b.key);

  /* status per entry drives colour in both the line and the timeline */
  const statusOf = (e: Entry): Status => {
    if (e.d.done) return "done";
    if (e.key < nowKey) return "overdue";
    if (e.dayDiff === 0 && e.d.dueTime && e.key - nowKey <= 60) return "soon";
    return "upcoming";
  };

  const statusText = (e: Entry): { text: string; tone: string } => {
    const s = statusOf(e);
    if (s === "done") return { text: "Done", tone: "text-emerald-300/80" };
    if (s === "overdue") {
      return e.dayDiff < 0
        ? { text: `${Math.abs(e.dayDiff)} ${Math.abs(e.dayDiff) === 1 ? "day" : "days"} overdue`, tone: "text-red-300" }
        : { text: `${span(nowKey - e.key)} late`, tone: "text-red-300" };
    }
    if (!e.d.dueTime) {
      return e.dayDiff === 0
        ? { text: "due today", tone: "text-amber-300" }
        : { text: e.dayDiff === 1 ? "tomorrow" : `in ${e.dayDiff} days`, tone: "text-white/45" };
    }
    const diff = e.key - nowKey;
    if (diff <= 60) return { text: `in ${span(diff)}`, tone: "text-amber-300" };
    if (diff < 48 * 60) return { text: `in ${span(diff)}`, tone: "text-white/55" };
    return { text: `in ${e.dayDiff} days`, tone: "text-white/45" };
  };

  const SEG: Record<Status, string> = {
    done: "bg-emerald-400",
    overdue: "bg-red-400",
    soon: "bg-amber-400",
    upcoming: "bg-white/20",
  };

  const counts = {
    overdue: pastPending.length,
    upcoming: upcoming.length,
    done: doneToday.length,
  };
  const allDone = pendingCount(entries) === 0 && entries.some((e) => e.d.done);

  /* path is only today: done items, anything due within the hour, and Now */
  type Node = { kind: "now"; key: number } | { kind: "item"; e: Entry; key: number };
  const nodes: Node[] = [];
  let markerPlaced = false;
  for (const e of pathEntries) {
    if (!markerPlaced && e.key >= nowKey) {
      nodes.push({ kind: "now", key: nowKey });
      markerPlaced = true;
    }
    nodes.push({ kind: "item", e, key: e.key });
  }
  if (!markerPlaced) nodes.push({ kind: "now", key: nowKey });

  const nextUp = shownUpcoming.find((e) => e.d.dueTime && e.key - nowKey < 48 * 60);

  return (
    <section
      aria-label="Deadlines"
      className={cn(
        shell,
        allDone ? "border-emerald-400/30 bg-emerald-500/[0.05]" : "border-white/[0.08] bg-white/[0.02]"
      )}
    >
      {/* header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white/85">Deadlines</h3>
        {allDone && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-300">
            <Check className="size-3.5" strokeWidth={3} />
            All done
          </span>
        )}
      </div>

      {entries.length === 0 ? (
        <p className="mt-3 text-sm text-white/45">Nothing due.</p>
      ) : (
        <>
          {shownPast.length > 0 && (
            <div className="mt-3 overflow-hidden rounded-xl border border-red-400/30 bg-red-400/[0.06]">
              <p className="px-3 pt-2 text-[11px] font-medium text-red-300">
                Overdue · {counts.overdue}
              </p>
              <ul>
                {shownPast.map((e) => (
                  <SpecialRow
                    key={e.d.id}
                    entry={e}
                    label={statusText(e).text}
                    tone={statusText(e).tone}
                    hover={hover === e.d.id}
                    onHover={setHover}
                    onOpen={onOpen}
                    onToggle={onToggle}
                  />
                ))}
              </ul>
              {hiddenOverdue > 0 && (
                <p className="px-3 pb-2 text-xs text-red-300/80">+{hiddenOverdue} more overdue</p>
              )}
            </div>
          )}

          {pathEntries.length > 0 && (
            <div className="mt-3 flex gap-1" role="img" aria-label={`${counts.done} done`}>
              {pathEntries.map((e) => (
                <span
                  key={e.d.id}
                  title={e.d.title}
                  onMouseEnter={() => setHover(e.d.id)}
                  onMouseLeave={() => setHover(null)}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-all duration-200",
                    SEG[statusOf(e)],
                    hover === e.d.id && "h-2"
                  )}
                />
              ))}
            </div>
          )}

          <ol className="mt-3">
            {nodes.map((n, i) => {
              const first = i === 0;
              const last = i === nodes.length - 1;

              if (n.kind === "now") {
                return (
                  <li
                    key="now"
                    aria-label="Current time"
                    className="relative grid grid-cols-[4.5rem_1.25rem_1fr] items-center"
                  >
                    <RailLine first={first} last={last} gap={0} />
                    <span className="pr-2 text-right text-[11px] font-medium tabular-nums text-emerald-300">
                      {fmt12(`${pad(now.getHours())}:${pad(now.getMinutes())}`)}
                    </span>
                    <span className="relative z-10 flex size-2.5 justify-self-center">
                      <span className="absolute inset-0 rounded-full bg-emerald-400/60 motion-safe:animate-ping" />
                      <span className="relative size-2.5 rounded-full bg-emerald-400" />
                    </span>
                    <div className="flex items-center gap-2 px-2 py-1" aria-hidden>
                      <span className="text-[11px] font-medium text-emerald-300">Now</span>
                      <span className="h-px flex-1 bg-emerald-400/40" />
                      {nextUp && (
                        <span className="text-[11px] tabular-nums text-white/45">
                          next in {span(nextUp.key - nowKey)}
                        </span>
                      )}
                    </div>
                  </li>
                );
              }

              const { e } = n;
              const st = statusText(e);

              return (
                <li
                  key={e.d.id}
                  className="relative grid grid-cols-[4.5rem_1.25rem_1fr] items-center"
                  onMouseEnter={() => setHover(e.d.id)}
                  onMouseLeave={() => setHover(null)}
                >
                  <RailLine first={first} last={last} gap={0} />
                  <span className="pr-2 text-right text-[11px] tabular-nums text-white/55">
                    {e.d.dueTime ? fmt12(e.d.dueTime) : "Any time"}
                  </span>
                  <span className="relative z-10 flex justify-center">
                    <Tick item={e.d} onToggle={onToggle} />
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpen?.(e.d)}
                    className={cn(
                      "group flex min-w-0 items-center gap-2 rounded-lg px-2 py-1 text-left outline-none transition-colors",
                      "focus-visible:ring-2 focus-visible:ring-white/40",
                      hover === e.d.id ? "bg-white/[0.06]" : "hover:bg-white/[0.05]"
                    )}
                  >
                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate text-sm font-medium",
                        e.d.done ? "text-white/45" : "text-white"
                      )}
                    >
                      {e.d.title}
                    </span>
                    <span className={cn("shrink-0 text-xs tabular-nums", st.tone)}>{st.text}</span>
                    <ChevronRight className="size-3.5 shrink-0 text-white/20 transition-colors group-hover:text-white/60" />
                  </button>
                </li>
              );
            })}
          </ol>

          {shownUpcoming.length > 0 && (
            <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
              <p className="px-3 pt-2 text-[11px] font-medium text-white/45">
                Upcoming · {counts.upcoming}
              </p>
              <ul>
                {shownUpcoming.map((e) => (
                  <SpecialRow
                    key={e.d.id}
                    entry={e}
                    label={upcomingLabel(e, nowKey)}
                    tone="text-white/45"
                    hover={hover === e.d.id}
                    onHover={setHover}
                    onOpen={onOpen}
                    onToggle={onToggle}
                  />
                ))}
              </ul>
              {hiddenLater > 0 && (
                <p className="px-3 pb-2 text-xs text-white/40">+{hiddenLater} later</p>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}

function pendingCount(entries: Entry[]) {
  return entries.filter((e) => !e.d.done).length;
}

function untilLabel(mins: number) {
  if (mins < 60) {
    const n = Math.max(mins, 1);
    return `in ${n} ${n === 1 ? "min" : "mins"}`;
  }
  const hours = Math.round(mins / 60);
  return `in ${hours} ${hours === 1 ? "hr" : "hrs"}`;
}

function upcomingLabel(entry: Entry, nowKey: number) {
  return `${whenLabel(entry)} · ${untilLabel(Math.max(0, entry.key - nowKey))}`;
}

function whenLabel(entry: Entry) {
  if (entry.dayDiff === 0) return entry.d.dueTime ? fmt12(entry.d.dueTime) : "any time";
  if (entry.dayDiff === 1) return entry.d.dueTime ? `Tomorrow · ${fmt12(entry.d.dueTime)}` : "Tomorrow";
  const date = parse(entry.d.due).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return entry.d.dueTime ? `${date} · ${fmt12(entry.d.dueTime)}` : date;
}

function SpecialRow({
  entry,
  label,
  tone,
  hover,
  onHover,
  onOpen,
  onToggle,
}: {
  entry: Entry;
  label: string;
  tone: string;
  hover: boolean;
  onHover: (id: string | null) => void;
  onOpen?: (deadline: Deadline) => void;
  onToggle?: (deadline: Deadline) => void;
}) {
  return (
    <li
      className="flex items-center gap-2 px-2.5 py-1.5"
      onMouseEnter={() => onHover(entry.d.id)}
      onMouseLeave={() => onHover(null)}
    >
      <Tick item={entry.d} onToggle={onToggle} />
      <button
        type="button"
        onClick={() => onOpen?.(entry.d)}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-0.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-white/40",
          hover && "bg-white/[0.04]"
        )}
      >
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">{entry.d.title}</span>
        <span className={cn("shrink-0 text-xs tabular-nums", tone)}>{label}</span>
      </button>
    </li>
  );
}
