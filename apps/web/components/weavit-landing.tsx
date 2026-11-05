"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Bot,
  CalendarDays,
  Flame,
  FolderKanban,
  Lock,
  Shield,
  Workflow,
  Zap,
} from "lucide-react"
import { ComparisonSection } from "@/components/comparison-section"
import { FeatureSection } from "@/components/feature-section"
import { FloatingNav } from "@/components/floating-nav"
import { PlatformCapabilities } from "@/components/platform-capabilities"
import { cn } from "@workspace/ui/lib/utils"

/** 3 cards clustered close to the hero prompt */
const ORBIT_CARDS = [
  {
    id: "habits",
    title: "Keep the loop",
    hint: "Agent logs today's check-in",
    prompt: "Mark my deep work habit complete for today",
    icon: Flame,
    // Behind the input; nudged up so it peeks above the box
    className: "left-6 -top-11 -rotate-6 sm:left-8 sm:-top-14",
    layer: "behind" as const,
    delay: "0s",
  },
  {
    id: "plans",
    title: "Draft a roadmap",
    hint: "Phases appear in live preview",
    prompt: "Create a 4-phase SDE interview prep roadmap",
    icon: FolderKanban,
    className: "-right-2 -top-2 rotate-3 sm:-right-5 sm:-top-3",
    layer: "front" as const,
    delay: "0.45s",
  },
  {
    id: "deadlines",
    title: "Surface what's due",
    hint: "Priorities, not another list",
    prompt: "Show my high-priority deadlines this week",
    icon: CalendarDays,
    className: "-bottom-3 left-1/2 -translate-x-1/2 rotate-1 sm:-bottom-4",
    layer: "front" as const,
    delay: "0.9s",
  },
] as const

const STACK = [
  "Next.js",
  "Clerk",
  "Prisma",
  "Express",
  "OpenAPI",
  "RTK Query",
  "Groq",
  "Vercel",
]

const TRUST = [
  {
    icon: Lock,
    title: "Auth that scopes to you",
    body: "Clerk-backed sessions. Requests stay tied to your account.",
  },
  {
    icon: Shield,
    title: "Agent stays on a leash",
    body: "Only allowlisted actions run — no free-form tool chaos.",
  },
  {
    icon: Workflow,
    title: "Typed API contracts",
    body: "OpenAPI → generated types and Zod. Client and server agree.",
  },
]

function HeroOrbitCard({
  title,
  hint,
  icon: Icon,
  className,
  delay,
  layer = "front",
  active,
  onSelect,
}: {
  title: string
  hint: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  className: string
  delay: string
  layer?: "front" | "behind"
  active: boolean
  onSelect: () => void
}) {
  return (
    <div
      className={cn(
        "absolute",
        layer === "behind" ? "z-[5]" : "z-20",
        className
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        style={{ animationDelay: delay }}
        className={cn(
          "group w-[9.25rem] rounded-2xl border bg-white p-3 text-left shadow-[0_12px_32px_-14px_rgba(0,0,0,0.22)] backdrop-blur-md transition-colors sm:w-[10rem] dark:bg-[#0c0e12]/95 dark:shadow-[0_12px_40px_-18px_rgba(0,0,0,0.85)]",
          "animate-[weavit-float_7s_ease-in-out_infinite]",
          active
            ? "border-emerald-500/60 bg-emerald-50 dark:border-emerald-400/50 dark:bg-emerald-400/10"
            : "border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50 dark:border-white/12 dark:hover:border-white/25 dark:hover:bg-white/[0.06]"
        )}
      >
        <span
          className={cn(
            "mb-2 inline-flex size-8 items-center justify-center rounded-xl border",
            active
              ? "border-emerald-500/40 bg-emerald-100 text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-400/15 dark:text-emerald-300"
              : "border-zinc-200 bg-zinc-50 text-zinc-600 group-hover:text-zinc-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70 dark:group-hover:text-white"
          )}
        >
          <Icon className="size-4" strokeWidth={1.75} />
        </span>
        <p className="font-[family-name:var(--font-landing-display)] text-[13px] font-semibold tracking-tight text-zinc-950 dark:text-white">
          {title}
        </p>
        <p className="mt-0.5 text-[11px] leading-snug text-zinc-500 dark:text-white/40">{hint}</p>
      </button>
    </div>
  )
}

const HERO_DEFAULT_PROMPT = "What is Weavit?"

function HeroPromptStage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState(HERO_DEFAULT_PROMPT)
  const [activeCard, setActiveCard] = useState<string | null>(null)

  function fillFromCard(id: string, sample: string) {
    setActiveCard(id)
    setPrompt(sample)
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const q = prompt.trim() || HERO_DEFAULT_PROMPT
    router.push(`/agent?prompt=${encodeURIComponent(q)}&autosend=1`)
  }

  return (
    <div className="relative w-full max-w-lg lg:max-w-none lg:justify-self-end">
      <style>{`
        @keyframes weavit-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>

      <div className="relative px-3 pb-10 pt-8 sm:px-6 sm:pb-12 sm:pt-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.14),transparent_70%)]" />

        {ORBIT_CARDS.map((card) => (
          <HeroOrbitCard
            key={card.id}
            title={card.title}
            hint={card.hint}
            icon={card.icon}
            className={cn("hidden sm:block", card.className)}
            delay={card.delay}
            layer={card.layer}
            active={activeCard === card.id}
            onSelect={() => fillFromCard(card.id, card.prompt)}
          />
        ))}

        <form
          onSubmit={onSubmit}
          className="relative z-10 rounded-2xl border border-zinc-300 bg-white p-3 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.28),0_0_0_1px_rgba(0,0,0,0.04)] backdrop-blur-xl sm:p-3.5 dark:border-white/15 dark:bg-[#0c0e12]/95 dark:shadow-[0_30px_80px_-28px_rgba(16,185,129,0.4)]"
        >
          <label htmlFor="hero-prompt" className="sr-only">
            Ask Weavit
          </label>
          <div className="flex min-h-[7.25rem] flex-col rounded-xl bg-zinc-100/70 p-3 sm:min-h-[8.25rem] dark:bg-white/[0.03]">
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-zinc-500 dark:text-white/35">
              <Bot className="size-3.5 text-emerald-600 dark:text-emerald-400/80" />
              Talk to the agent — it runs allowlisted workspace actions
            </p>
            <textarea
              id="hero-prompt"
              rows={3}
              value={prompt}
              onChange={(event) => {
                setPrompt(event.target.value)
                setActiveCard(null)
              }}
              placeholder="Build a roadmap, log a check-in, or ask what’s due…"
              className="min-h-0 w-full flex-1 resize-none bg-transparent text-base font-semibold leading-relaxed text-zinc-950 outline-none placeholder:text-zinc-400 sm:text-lg dark:text-white dark:placeholder:text-white/30"
            />
            <div className="mt-2 flex items-center justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-zinc-950 transition-colors hover:bg-emerald-400 dark:bg-emerald-400 dark:hover:bg-emerald-300"
              >
                Open
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </form>

        <div className="relative z-10 mt-4 flex gap-2 overflow-x-auto pb-1 sm:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {ORBIT_CARDS.map((card) => {
            const Icon = card.icon
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => fillFromCard(card.id, card.prompt)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium",
                  activeCard === card.id
                    ? "border-emerald-500/40 bg-emerald-50 text-emerald-800 dark:border-emerald-400/40 dark:bg-emerald-400/10 dark:text-emerald-200"
                    : "border-zinc-200 bg-white text-zinc-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70"
                )}
              >
                <Icon className="size-3.5" />
                {card.title}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function WeavitLanding() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-zinc-50 text-zinc-950 dark:bg-[#07080a] dark:text-white">
      <FloatingNav />

      {/* Hero — vertically centered in the viewport */}
      <section className="relative flex min-h-[100svh] items-center overflow-x-clip py-24 lg:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 h-[120%] w-screen max-w-none -translate-x-1/2 -translate-y-1/2 opacity-70 dark:opacity-100"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 72% 48%, rgba(16,185,129,0.16) 0%, rgba(16,185,129,0.07) 32%, rgba(16,185,129,0.02) 55%, transparent 72%)",
          }}
        />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-5 sm:px-10 lg:grid-cols-2 lg:gap-6 lg:px-10 xl:gap-4 xl:px-12">
          <div className="relative flex max-w-xl flex-col justify-center lg:ml-auto lg:mr-2 lg:max-w-md xl:mr-6 xl:max-w-lg">
            <p className="mb-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-white/45">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
              </span>
              Agent-driven workspace · early access
            </p>

            <h1 className="font-[family-name:var(--font-landing-display)] text-[clamp(2.35rem,5.2vw,4rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-zinc-950 dark:text-white">
              Ask once. Your workspace moves.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-zinc-600 sm:text-[1.05rem] sm:leading-relaxed dark:text-white/50">
              An AI workspace for builders — draft phased roadmaps with a live
              preview, keep daily loops honest, and surface what&apos;s due, all
              through one agent that updates the real workspace for you.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 rounded-full bg-zinc-950 px-6 py-3 text-sm font-bold text-white transition-all hover:gap-3 dark:bg-white dark:text-zinc-950"
              >
                Open Workspace
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href={`/agent?prompt=${encodeURIComponent(
                  "What is Weavit, and how should I start using the agent in my workspace?"
                )}&autosend=1`}
                className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:border-zinc-400 hover:text-zinc-950 dark:border-white/20 dark:text-white/75 dark:hover:border-white/40 dark:hover:text-white"
              >
                What is Weavit?
              </Link>
            </div>
          </div>

          <div className="relative w-full lg:pl-4">
            <HeroPromptStage />
          </div>
        </div>
      </section>

      {/* Built-with strip → soft fade into feature section */}
      <div className="border-t border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-[#07080a]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-6 py-6 sm:justify-between">
          <p className="w-full text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 sm:w-auto sm:text-left dark:text-white/35">
            Built with
          </p>
          {STACK.slice(0, 6).map((name) => (
            <span
              key={name}
              className="text-sm font-semibold tracking-tight text-zinc-500 dark:text-white/40"
            >
              {name}
            </span>
          ))}
        </div>
      </div>

      <div
        aria-hidden
        className="h-16 w-full bg-gradient-to-b from-zinc-50 to-zinc-50 sm:h-24 dark:from-[#07080a] dark:via-[#3f3f46] dark:to-[#fafafa]"
      />

      <FeatureSection />

      <div
        aria-hidden
        className="h-16 w-full bg-gradient-to-b from-zinc-50 to-zinc-50 sm:h-24 dark:from-[#fafafa] dark:via-[#3f3f46] dark:to-[#07080a]"
      />

      <PlatformCapabilities />

      {/* Trust */}
      <section className="border-y border-zinc-200 bg-white dark:border-white/10 dark:bg-[#0b0d10]">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400 dark:text-white/35">
              Trust
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-landing-display)] text-[clamp(1.75rem,3.2vw,2.5rem)] font-semibold tracking-tight text-zinc-950 dark:text-white">
              Built like production software — even in early access.
            </h2>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {TRUST.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="space-y-3 border-t border-zinc-200 pt-6 dark:border-white/10"
              >
                <Icon
                  className="size-5 text-emerald-600 dark:text-emerald-400"
                  strokeWidth={1.75}
                />
                <h3 className="font-[family-name:var(--font-landing-display)] text-lg font-semibold text-zinc-950 dark:text-white">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-white/45">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ComparisonSection />

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-zinc-50 px-6 py-24 sm:px-10 dark:bg-[#07080a]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(16,185,129,0.12),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(16,185,129,0.16),transparent_50%)]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <Zap className="mx-auto size-8 text-emerald-600 dark:text-emerald-400" />
          <h2 className="mt-6 font-[family-name:var(--font-landing-display)] text-[clamp(2rem,4.5vw,3.5rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-zinc-950 dark:text-white">
            Stop planning in five tabs.
            <br />
            Start executing in one.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-base text-zinc-600 dark:text-white/50">
            Open the workspace. Load a roadmap. Check a habit. Ask the agent.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-full bg-emerald-500 px-8 py-3.5 text-sm font-bold text-zinc-950 transition-all hover:gap-3 hover:bg-emerald-400 dark:bg-emerald-400 dark:hover:bg-emerald-300"
            >
              Open Workspace
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/overview"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-6 py-3.5 text-sm font-semibold text-zinc-700 hover:text-zinc-950 dark:border-white/20 dark:text-white/75 dark:hover:text-white"
            >
              Learn more
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white px-6 py-14 sm:px-10 dark:border-white/10 dark:bg-black">
        <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2">
              <img src="/logo-weavit.png" alt="" className="h-7 w-auto" />
              <span className="font-[family-name:var(--font-landing-display)] text-lg font-semibold tracking-tight text-zinc-950 dark:text-white">
                weavit
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-zinc-500 dark:text-white/40">
              High-density workspace engine for builders who ship.
            </p>
          </div>
          {[
            {
              title: "Product",
              links: [
                { href: "/dashboard", label: "Dashboard" },
                { href: "/workspace", label: "Workspace" },
                { href: "/workspace/projects", label: "Roadmaps" },
                { href: "/workspace/habits", label: "Habits" },
              ],
            },
            {
              title: "Company",
              links: [
                { href: "/overview", label: "Overview" },
                { href: "#features", label: "Features" },
                { href: "#about", label: "About" },
              ],
            },
            {
              title: "Resources",
              links: [
                {
                  href: `/agent?prompt=${encodeURIComponent(
                    "What is Weavit, and how should I start using the agent in my workspace?"
                  )}&autosend=1`,
                  label: "What is Weavit?",
                },
                { href: "/login", label: "Sign in" },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-white/35">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-600 transition-colors hover:text-zinc-950 dark:text-white/60 dark:hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div
          id="about"
          className="mx-auto mt-12 flex max-w-6xl flex-col gap-3 border-t border-zinc-200 pt-8 text-xs text-zinc-400 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:text-white/35"
        >
          <p>© {new Date().getFullYear()} Weavit · Workspace Engine</p>
          <p className="font-mono">Plans · Habits · Deadlines · Agent</p>
        </div>
      </footer>
    </div>
  )
}
