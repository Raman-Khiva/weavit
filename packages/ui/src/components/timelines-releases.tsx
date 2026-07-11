import { CheckIcon, RocketIcon, TimerIcon } from "lucide-react";

type Stage = "done" | "active" | "queued";

interface Step {
  env: string;
  state: Stage;
  detail: string;
  duration?: string;
  region?: string;
}

const PIPELINE: Step[] = [
  { env: "Build", state: "done", detail: "Built 84 modules · cache hit 92%", duration: "2m 14s" },
  { env: "Tests", state: "done", detail: "1,284 tests passed · 0 failed", duration: "3m 02s" },
  { env: "Staging", state: "done", detail: "Deployed to staging.acme.dev", duration: "1m 18s", region: "iad" },
  { env: "Canary 5%", state: "active", detail: "Smoke metrics within tolerance", duration: "06:42 in", region: "iad, sfo" },
  { env: "Canary 25%", state: "queued", detail: "Promotes after canary holds 30m" },
  { env: "Production 100%", state: "queued", detail: "Auto-promote on green" },
];

export function TimelinesReleasesShowcasePage() {
  return (
    <div className="min-h-svh bg-background px-10 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
          Release · v3.4.0-rc.2
        </div>
        <h1 className="mt-1 font-heading text-2xl">Promotion timeline</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Triggered by maya@acme.dev · started 14m ago.
        </p>

        <div className="mt-6 rounded-xl border border-border/60 bg-background/40 px-6 py-5">
          <ol className="relative">
            <span
              aria-hidden
              className="absolute top-2 bottom-2 left-[15px] w-px bg-border/50"
            />
            {PIPELINE.map((s, i) => (
              <li
                key={s.env}
                className="relative grid grid-cols-[32px_1fr_auto] items-start gap-3 py-3"
              >
                <span
                  className={
                    "z-10 grid size-[32px] place-items-center rounded-full ring-4 ring-background transition-all " +
                    (s.state === "done"
                      ? "bg-emerald-500 text-white"
                      : s.state === "active"
                        ? "bg-foreground text-background"
                        : "border border-border/70 bg-background text-muted-foreground")
                  }
                >
                  {s.state === "done" ? (
                    <CheckIcon className="size-4" />
                  ) : s.state === "active" ? (
                    <span className="relative grid size-3 place-items-center">
                      <span className="absolute inset-0 animate-ping rounded-full bg-background/40" />
                      <span className="size-1.5 rounded-full bg-background" />
                    </span>
                  ) : (
                    <span className="size-2 rounded-full bg-muted-foreground/40" />
                  )}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{s.env}</span>
                    {s.region ? (
                      <span className="rounded bg-foreground/[0.06] px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground uppercase tracking-[0.2em]">
                        {s.region}
                      </span>
                    ) : null}
                    {s.state === "active" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-foreground/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-foreground/80">
                        <TimerIcon className="size-2.5" />
                        rolling
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 text-muted-foreground text-xs leading-relaxed">
                    {s.detail}
                  </div>
                  {s.state === "active" ? (
                    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-foreground"
                        style={{ width: "62%" }}
                      />
                    </div>
                  ) : null}
                </div>
                <span className="self-center font-mono text-[10px] text-muted-foreground">
                  {s.duration ?? "—"}
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-5 flex items-center justify-between border-border/60 border-t pt-4">
            <div className="flex items-center gap-2 text-xs">
              <RocketIcon className="size-3.5 opacity-60" />
              <span className="font-mono text-muted-foreground">
                f3b9a21 · feat(audit): persist 1y retention
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-md border border-border/60 px-3 py-1.5 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em] hover:text-foreground"
              >
                Pause
              </button>
              <button
                type="button"
                className="rounded-md bg-rose-500/15 px-3 py-1.5 font-mono text-[10px] text-rose-700 uppercase tracking-[0.25em] dark:text-rose-400"
              >
                Roll back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
