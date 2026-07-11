import { CarIcon, CoffeeIcon, MapPinIcon, VideoIcon } from "lucide-react"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"

interface Slot {
  type: "event" | "gap"
  start?: string
  end?: string
  title?: string
  location?: string
  attendees?: string[]
  tone?: "indigo" | "teal" | "amber" | "rose" | "violet"
  detail?: string
  gap?: { reason: string; minutes: number; Icon: typeof CoffeeIcon }
}

const TODAY: Slot[] = [
  {
    type: "event",
    start: "08:30",
    end: "09:00",
    title: "Eng standup",
    location: "Zoom · daily",
    tone: "indigo",
    attendees: ["MO", "JL", "RP"],
  },
  {
    type: "gap",
    gap: { reason: "Coffee + inbox", minutes: 30, Icon: CoffeeIcon },
  },
  {
    type: "event",
    start: "09:30",
    end: "10:30",
    title: "1:1 with Maya",
    location: "Studio · 4F window",
    tone: "amber",
    attendees: ["MO"],
  },
  { type: "gap", gap: { reason: "Travel", minutes: 20, Icon: CarIcon } },
  {
    type: "event",
    start: "10:50",
    end: "11:50",
    title: "BigCorp customer call",
    location: "Off-site · Soho House",
    tone: "teal",
    attendees: ["JL", "SB"],
    detail: "Renewal discussion · v3.4 walkthrough",
  },
  {
    type: "event",
    start: "13:00",
    end: "14:30",
    title: "Design crit",
    location: "Zoom + Studio",
    tone: "rose",
    attendees: ["DK", "JL", "RP", "MO", "SB"],
    detail: "Onboarding particle field & inset login",
  },
  {
    type: "event",
    start: "16:00",
    end: "16:30",
    title: "Audit log review",
    location: "Workspace #design",
    tone: "violet",
    attendees: ["MO", "JL"],
  },
]

const TOMORROW: Slot[] = [
  {
    type: "event",
    start: "09:00",
    end: "10:00",
    title: "Q2 roadmap planning",
    location: "Studio",
    tone: "violet",
    attendees: ["MO", "JL", "RP", "SB"],
  },
  {
    type: "event",
    start: "11:00",
    end: "12:00",
    title: "Sales review",
    location: "Zoom",
    tone: "teal",
    attendees: ["AT"],
  },
  {
    type: "event",
    start: "15:00",
    end: "16:30",
    title: "Sprint demo",
    location: "All-hands",
    tone: "rose",
    attendees: ["MO", "JL", "RP", "DK", "SB", "AT"],
  },
]

const TONE_BG: Record<NonNullable<Slot["tone"]>, string> = {
  indigo: "bg-indigo-500",
  teal: "bg-teal-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  violet: "bg-violet-500",
}

export function AgendaTimeline() {
  return (
    <div className="min-h-svh bg-background">
      <div className="mx-auto max-w-3xl">
        <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
          Sat, Apr 26 · agenda
        </div>
        <h1 className="mt-1 font-heading text-4xl tracking-tight">
          Today and tomorrow
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          7 events · 4h 30m booked · 3h 10m focus time.
        </p>

        <Section label="Today" date="Sat, Apr 26" slots={TODAY} />
        <Section label="Tomorrow" date="Sun, Apr 27" slots={TOMORROW} />
      </div>
    </div>
  )
}

function Section({
  label,
  date,
  slots,
}: {
  label: string
  date: string
  slots: Slot[]
}) {
  return (
    <section className="mt-8">
      <div className="mb-2 flex items-end justify-between">
        <span className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">
          {label}
        </span>
        <span className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">
          {date}
        </span>
      </div>
      <ol className="flex flex-col gap-1.5">
        {slots.map((s, i) =>
          s.type === "gap" ? (
            <li
              key={i}
              className="flex items-center gap-3 px-1 py-1.5 text-xs text-muted-foreground"
            >
              <span className="h-px flex-1 bg-border/40" />
              {s.gap ? (
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.2em] uppercase">
                  <s.gap.Icon className="size-3" />
                  {s.gap.reason} · {s.gap.minutes}m
                </span>
              ) : null}
              <span className="h-px flex-1 bg-border/40" />
            </li>
          ) : (
            <li
              key={i}
              className="grid grid-cols-[80px_1fr] gap-3 rounded-xl border border-border/60 bg-background/40 px-2 py-3 transition-colors hover:bg-background/60"
            >
              <div className="flex flex-col items-center justify-center font-mono text-sm">
                <div className="text-foreground">{s.start}</div>
                <div className="text-muted-foreground">{s.end}</div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={
                    "h-12 w-1 shrink-0 rounded-full " +
                    TONE_BG[s.tone ?? "indigo"]
                  }
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm">{s.title}</div>
                  <div className="mt-0.5 flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
                    {s.location?.startsWith("Zoom") ? (
                      <VideoIcon className="size-3" />
                    ) : (
                      <MapPinIcon className="size-3" />
                    )}
                    <span>{s.location}</span>
                  </div>
                  {s.detail ? (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {s.detail}
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center -space-x-1.5">
                  {s.attendees?.slice(0, 4).map((a) => (
                    <Avatar
                      key={a}
                      className="size-6 border-2 border-background"
                    >
                      <AvatarFallback className="text-[9px]">
                        {a}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {(s.attendees?.length ?? 0) > 4 ? (
                    <span className="grid size-6 place-items-center rounded-full border-2 border-background bg-foreground/[0.06] font-mono text-[9px]">
                      +{(s.attendees?.length ?? 0) - 4}
                    </span>
                  ) : null}
                </div>
              </div>
            </li>
          )
        )}
      </ol>
    </section>
  )
}
