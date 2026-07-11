import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Skeleton } from "@workspace/ui/components/skeleton";

const DEFAULT_USERNAME = "sean-brydon";

type Day = {
  date: string;
  contributionCount: number;
  contributionLevel:
    | "NONE"
    | "FIRST_QUARTILE"
    | "SECOND_QUARTILE"
    | "THIRD_QUARTILE"
    | "FOURTH_QUARTILE";
};

type Contributions = {
  contributions: Day[][];
  totalContributions: number;
};

type Profile = {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  html_url: string;
};

type GhCommit = { sha: string; message: string; url: string };

type GhEvent = {
  id: string;
  type: string;
  created_at: string;
  repo: { name: string };
  payload: {
    commits?: GhCommit[];
    ref?: string;
    ref_type?: string;
    action?: string;
    pull_request?: { title: string; number: number; html_url: string };
    issue?: { title: string; number: number; html_url: string };
  };
};

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const WEEKDAY_LABELS = ["Mon", "Wed", "Fri"];

export function CalendarsYearHeatmapShowcasePage() {
  const [input, setInput] = useState(DEFAULT_USERNAME);
  const [username, setUsername] = useState(DEFAULT_USERNAME);
  const [data, setData] = useState<Contributions | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [events, setEvents] = useState<GhEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);
    setProfile(null);
    setEvents(null);

    const u = encodeURIComponent(username);
    Promise.all([
      fetch(`https://github-contributions-api.deno.dev/${u}.json`).then(
        async (r) => {
          if (!r.ok) throw new Error(`No contributions for "${username}"`);
          return (await r.json()) as Contributions;
        },
      ),
      fetch(`https://api.github.com/users/${u}`).then(async (r) => {
        if (!r.ok) throw new Error(`User "${username}" not found`);
        return (await r.json()) as Profile;
      }),
      fetch(`https://api.github.com/users/${u}/events/public?per_page=30`)
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []) as Promise<GhEvent[]>,
    ])
      .then(([c, p, e]) => {
        if (cancelled) return;
        setData(c);
        setProfile(p);
        setEvents(e);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [username]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next = input.trim();
    if (next && next !== username) setUsername(next);
  }

  const stats = useMemo(() => (data ? deriveStats(data) : null), [data]);
  const months = useMemo(() => (data ? deriveMonths(data) : []), [data]);
  const recentCommits = useMemo(
    () => (events ? deriveRecentCommits(events) : []),
    [events],
  );

  return (
    <div className="min-h-svh bg-background px-10 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          GitHub · last 12 months
        </div>

        <form onSubmit={onSubmit} className="mt-3 flex items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <span className="-translate-y-1/2 absolute top-1/2 left-3 text-muted-foreground">
              @
            </span>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="github username"
              className="pl-7"
              spellCheck={false}
              autoComplete="off"
            />
          </div>
          <Button type="submit" variant="outline" disabled={loading}>
            {loading ? "Loading…" : "Load"}
          </Button>
        </form>

        <div className="mt-6 flex items-start gap-4">
          <Avatar className="size-14">
            {profile && (
              <AvatarImage src={profile.avatar_url} alt={profile.login} />
            )}
            <AvatarFallback>
              {username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            {profile ? (
              <>
                <h1 className="font-heading text-2xl">
                  {profile.name ?? profile.login}
                </h1>
                <a
                  href={profile.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground text-sm hover:text-foreground"
                >
                  @{profile.login}
                </a>
                {profile.bio && (
                  <p className="mt-2 text-foreground/80 text-sm">
                    {profile.bio}
                  </p>
                )}
                <div className="mt-2 flex gap-4 font-mono text-[11px] text-muted-foreground uppercase tracking-[0.2em]">
                  <span>
                    <span className="text-foreground">
                      {profile.public_repos}
                    </span>{" "}
                    repos
                  </span>
                  <span>
                    <span className="text-foreground">{profile.followers}</span>{" "}
                    followers
                  </span>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
            )}
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-destructive text-sm">
            {error}
          </div>
        ) : null}

        <div className="mt-6">
          {data ? (
            <h2 className="font-heading text-xl">
              {data.totalContributions.toLocaleString()} contributions
              {stats && (
                <span className="ml-2 font-sans text-muted-foreground text-sm">
                  · active {stats.activeDays} days · longest{" "}
                  <span className="text-foreground">
                    {stats.longestStreak} days
                  </span>{" "}
                  · current{" "}
                  <span className="text-foreground">
                    {stats.currentStreak} days
                  </span>
                </span>
              )}
            </h2>
          ) : (
            <Skeleton className="h-7 w-72" />
          )}
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-border/60 bg-background/40 p-5">
          <div className="grid grid-cols-[28px_1fr] gap-2">
            <div className="flex flex-col gap-[3px] pt-5">
              {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                <span
                  key={d}
                  className="flex h-3 items-center font-mono text-[9px] text-muted-foreground"
                >
                  {d % 2 === 0 && d <= 4 ? WEEKDAY_LABELS[d / 2] : ""}
                </span>
              ))}
            </div>

            <div>
              <div className="relative h-4">
                {data &&
                  months.map((m) => (
                    <span
                      key={`${m.label}-${m.weekIndex}`}
                      className="absolute font-mono text-[10px] text-muted-foreground"
                      style={{
                        left: `${(m.weekIndex / data.contributions.length) * 100}%`,
                      }}
                    >
                      {m.label}
                    </span>
                  ))}
              </div>

              <div className="mt-1 flex gap-[3px]">
                {data
                  ? data.contributions.map((week, wi) => (
                      <div key={wi} className="flex flex-col gap-[3px]">
                        {week.map((c) => (
                          <Cell key={c.date} day={c} />
                        ))}
                      </div>
                    ))
                  : Array.from({ length: 53 }).map((_, wi) => (
                      <div key={wi} className="flex flex-col gap-[3px]">
                        {Array.from({ length: 7 }).map((__, di) => (
                          <span
                            key={di}
                            className="size-3 animate-pulse rounded-sm bg-foreground/[0.06]"
                          />
                        ))}
                      </div>
                    ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
            <span>Hover a day to see the date</span>
            <div className="flex items-center gap-2">
              <span>Less</span>
              <div className="flex gap-[3px]">
                {(
                  [
                    "NONE",
                    "FIRST_QUARTILE",
                    "SECOND_QUARTILE",
                    "THIRD_QUARTILE",
                    "FOURTH_QUARTILE",
                  ] as const
                ).map((lvl) => (
                  <span
                    key={lvl}
                    className="size-3 rounded-sm"
                    style={{ backgroundColor: levelColor(lvl) }}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
          </div>
        </div>

        {stats && data && (
          <div className="mt-5 grid grid-cols-3 gap-3">
            <Stat
              label="Most active day"
              value={stats.mostActive ? formatShort(stats.mostActive.date) : "—"}
              sub={
                stats.mostActive
                  ? `${stats.mostActive.contributionCount} contributions`
                  : ""
              }
            />
            <Stat
              label="Avg / day"
              value={stats.avgPerDay.toFixed(1)}
              sub="across the year"
            />
            <Stat
              label="Longest break"
              value={`${stats.longestBreak.length} days`}
              sub={
                stats.longestBreak.length > 0
                  ? `${formatShort(stats.longestBreak.start)} – ${formatShort(stats.longestBreak.end)}`
                  : ""
              }
            />
          </div>
        )}

        <div className="mt-8">
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
            Recent commits
          </div>
          <div className="mt-3 divide-y divide-border/60 rounded-xl border border-border/60 bg-background/40">
            {events == null
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="px-4 py-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="mt-2 h-3 w-32" />
                  </div>
                ))
              : recentCommits.length === 0
                ? (
                    <div className="px-4 py-6 text-center text-muted-foreground text-sm">
                      No recent public commits.
                    </div>
                  )
                : recentCommits.slice(0, 8).map((c) => (
                    <a
                      key={c.sha}
                      href={`https://github.com/${c.repo}/commit/${c.sha}`}
                      target="_blank"
                      rel="noreferrer"
                      className="block px-4 py-3 transition-colors hover:bg-foreground/[0.02]"
                    >
                      <div className="truncate text-sm">{c.message}</div>
                      <div className="mt-1 flex items-center gap-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                        <span className="text-foreground">{c.repo}</span>
                        <span>·</span>
                        <span>{c.sha.slice(0, 7)}</span>
                        <span>·</span>
                        <span>{relativeTime(c.created_at)}</span>
                      </div>
                    </a>
                  ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Cell({ day }: { day: Day }) {
  const title = `${day.contributionCount} on ${formatLong(day.date)}`;
  return (
    <span
      title={title}
      className="size-3 rounded-sm"
      style={{ backgroundColor: levelColor(day.contributionLevel) }}
    />
  );
}

function levelColor(level: Day["contributionLevel"]) {
  // teal scale, matches the rest of the showcase palette
  switch (level) {
    case "NONE":
      return "rgba(127, 127, 127, 0.08)";
    case "FIRST_QUARTILE":
      return "rgba(20, 184, 166, 0.28)";
    case "SECOND_QUARTILE":
      return "rgba(20, 184, 166, 0.5)";
    case "THIRD_QUARTILE":
      return "rgba(20, 184, 166, 0.75)";
    case "FOURTH_QUARTILE":
      return "rgba(20, 184, 166, 0.96)";
  }
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
      <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
        {label}
      </div>
      <div className="mt-1 font-heading text-2xl tracking-tight">{value}</div>
      <div className="mt-0.5 text-muted-foreground text-xs">{sub}</div>
    </div>
  );
}

function deriveStats(data: Contributions) {
  const flat = data.contributions.flat();
  const sorted = [...flat].sort((a, b) => a.date.localeCompare(b.date));
  const activeDays = flat.filter((d) => d.contributionCount > 0).length;
  const total = data.totalContributions;
  const avgPerDay = sorted.length ? total / sorted.length : 0;

  let mostActive: Day | null = null;
  for (const d of flat) {
    if (!mostActive || d.contributionCount > mostActive.contributionCount) {
      mostActive = d;
    }
  }

  // Streaks (counted on calendar days, ignoring future days)
  const today = new Date().toISOString().slice(0, 10);
  const past = sorted.filter((d) => d.date <= today);

  let longestStreak = 0;
  let runStreak = 0;
  for (const d of past) {
    if (d.contributionCount > 0) {
      runStreak += 1;
      if (runStreak > longestStreak) longestStreak = runStreak;
    } else {
      runStreak = 0;
    }
  }

  let currentStreak = 0;
  for (let i = past.length - 1; i >= 0; i--) {
    const d = past[i];
    if (d.contributionCount > 0) currentStreak += 1;
    else if (i === past.length - 1) {
      // allow today to be empty without breaking the streak
      continue;
    } else break;
  }

  // Longest break (consecutive zero-days)
  let longestBreak = { length: 0, start: "", end: "" };
  let runStart = "";
  let runLen = 0;
  for (const d of past) {
    if (d.contributionCount === 0) {
      if (runLen === 0) runStart = d.date;
      runLen += 1;
      if (runLen > longestBreak.length) {
        longestBreak = { length: runLen, start: runStart, end: d.date };
      }
    } else {
      runLen = 0;
    }
  }

  return {
    activeDays,
    avgPerDay,
    longestStreak,
    currentStreak,
    longestBreak,
    mostActive,
  };
}

function deriveMonths(data: Contributions) {
  const out: { label: string; weekIndex: number }[] = [];
  let lastMonth = -1;
  data.contributions.forEach((week, wi) => {
    if (week.length === 0) return;
    const firstDate = new Date(week[0].date);
    const month = firstDate.getMonth();
    if (month !== lastMonth) {
      out.push({ label: MONTHS_SHORT[month], weekIndex: wi });
      lastMonth = month;
    }
  });
  return out;
}

type FlatCommit = {
  sha: string;
  message: string;
  repo: string;
  created_at: string;
};

function deriveRecentCommits(events: GhEvent[]): FlatCommit[] {
  const out: FlatCommit[] = [];
  for (const e of events) {
    if (e.type !== "PushEvent" || !e.payload.commits) continue;
    for (const c of e.payload.commits) {
      out.push({
        sha: c.sha,
        message: c.message.split("\n")[0],
        repo: e.repo.name,
        created_at: e.created_at,
      });
    }
  }
  return out;
}

function formatLong(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatShort(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function relativeTime(iso: string) {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const s = Math.max(1, Math.floor((now - then) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  return `${mo}mo ago`;
}
