"use client"

import { ArrowUpRight } from "lucide-react"

const SCORE = { score: 92, trend: "+6.8%" }
const BARS = 25

function duePhrase(date: string) {
  const [year = 0, month = 1, day = 1] = date.split("-").map(Number)
  const due = new Date(year, month - 1, day)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diff = Math.round((due.getTime() - today.getTime()) / 86_400_000)

  if (diff === 0) return "due today"
  if (diff === 1) return "due tomorrow"
  if (diff < 0) return "overdue"
  return due.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function ScoreMeter({ score }: { score: number }) {
  const active = Math.round((score / 100) * BARS)

  return (
    <div className="flex items-center gap-[3px]" aria-hidden>
      {Array.from({ length: BARS }).map((_, index) => (
        <span
          key={index}
          className={
            index < active
              ? "h-6 w-[3px] rounded-full bg-emerald-500"
              : "h-6 w-[3px] rounded-full bg-white/15"
          }
        />
      ))}
    </div>
  )
}

export function ProductivityBrief({
  nextTitle,
  nextDue,
}: {
  nextTitle: string
  nextDue: string
}) {
  return (
    <div className="mt-6 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <p className="flex items-baseline gap-1 font-mono tracking-tight text-foreground">
          <span className="text-2xl font-semibold">{SCORE.score}</span>
          <span className="text-sm text-muted-foreground">/100</span>
        </p>
        <p className="flex items-center gap-0.5 text-sm font-semibold text-emerald-500">
          <ArrowUpRight className="size-3.5" />
          {SCORE.trend}
        </p>
        <ScoreMeter score={SCORE.score} />
      </div>
      <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span>Next up:</span>
        <span className="text-foreground">{nextTitle}</span>
        <span>· {duePhrase(nextDue)}</span>
        <button
          type="button"
          className="rounded-md border border-white/15 bg-white/[0.04] px-2 py-0.5 text-xs font-medium text-foreground"
        >
          Start
        </button>
      </p>
    </div>
  )
}
