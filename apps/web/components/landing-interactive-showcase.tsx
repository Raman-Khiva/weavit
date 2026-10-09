"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  FolderOpen,
  CheckSquare,
  Clock,
  BarChart2,
  CheckCircle2,
  Circle,
  Flame,
  ArrowRight,
  Zap,
  ShieldCheck,
  Cpu,
  HelpCircle,
  Plus,
  Palette,
  Users,
  Rocket,
  Sliders,
  Megaphone,
  Code,
  Headphones,
  Boxes,
  MinusCircle,
  Grid,
  FileText
} from "lucide-react"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@workspace/ui/components/accordion"

const PERSONAS = [
  {
    id: "designers",
    label: "Designers",
    icon: Palette,
    headline: "Craft pixel-perfect systems with ease",
    cta: "See the designer toolkit",
    features: [
      {
        title: "Unified design tokens",
        description: "Sync typography, color tokens, and UI components directly with engineering workflows for zero-friction handoffs.",
      },
      {
        title: "Visual asset management",
        description: "Organize vector graphics, design specs, and interactive prototypes into high-density reference dashboards.",
      },
    ],
  },
  {
    id: "team-leads",
    label: "Team Leads",
    icon: Users,
    headline: "Streamline team velocity & alignment",
    cta: "See the lead toolkit",
    features: [
      {
        title: "Cross-functional visibility",
        description: "Keep engineering, product, and design synchronized with phase-based execution roadmaps and metric tracking.",
      },
      {
        title: "Context-aware sprint logs",
        description: "Audit task completions, note logs, and daily execution velocity without meeting overhead.",
      },
    ],
  },
  {
    id: "founders",
    label: "Founders",
    icon: Rocket,
    headline: "From first sketch to final ship",
    cta: "See the founder toolkit",
    features: [
      {
        title: "One source of truth",
        description: "Pull roadmap, revenue, and team status into a single place so every conversation starts from the same page.",
      },
      {
        title: "Move fast, stay calm",
        description: "Ship more in less time with lightweight planning that respects how small teams actually work day-to-day.",
      },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    icon: Sliders,
    headline: "Automate workflows & system execution",
    cta: "See the ops toolkit",
    features: [
      {
        title: "Deterministic process engine",
        description: "Standardize recurring operations, sprint checklists, and infrastructure milestones with zero configuration.",
      },
      {
        title: "Real-time status gauges",
        description: "Track system latency, resource allocations, and operational health metrics across all active initiatives.",
      },
    ],
  },
  {
    id: "marketers",
    label: "Marketers",
    icon: Megaphone,
    headline: "Accelerate growth & campaign execution",
    cta: "See the marketer toolkit",
    features: [
      {
        title: "Campaign roadmap alignment",
        description: "Map launch dates, content deliverables, and marketing funnels seamlessly alongside core engineering updates.",
      },
      {
        title: "High-impact messaging logs",
        description: "Document positioning, copy iterations, and performance analytics with centralized note logs.",
      },
    ],
  },
]

export function LandingInteractiveShowcase() {
  const [activePersonaId, setActivePersonaId] = useState<string>("founders")

  const currentPersona = PERSONAS.find((p) => p.id === activePersonaId) ?? PERSONAS[2]!

  return (
    <div className="w-full space-y-28 py-12">
      {/* SECTION 1: INTERACTIVE WORKFLOW SHOWCASE TABS */}
      <section className="w-full max-w-6xl mx-auto px-6">
        <div className="text-center space-y-3 mb-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-3.5 py-1.5 text-xs font-semibold text-foreground backdrop-blur-md shadow-xs mb-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span>Interactive Workspace</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-center text-foreground max-w-4xl mx-auto leading-tight">
            Built to <span className="font-serif italic font-normal text-foreground/90">power</span> <br />
            the teams behind great work
          </h2>
        </div>

        {/* 5 Persona Tabs Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-14">
          {PERSONAS.map((persona) => {
            const Icon = persona.icon
            const isActive = activePersonaId === persona.id
            return (
              <button
                key={persona.id}
                onClick={() => setActivePersonaId(persona.id)}
                className={`group relative rounded-2xl border p-6 sm:p-8 flex flex-col items-center justify-center gap-4 transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "bg-card/90 border-border/80 shadow-xl ring-1 ring-border/50 scale-[1.02]"
                    : "bg-card/30 border-border/30 hover:bg-card/60 hover:border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                <div
                  className={`h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? "bg-muted/90 text-foreground border border-border/80 shadow-xs"
                      : "bg-muted/30 text-muted-foreground/70 group-hover:bg-muted/50 group-hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                </div>
                <span
                  className={`text-xs sm:text-sm font-semibold tracking-wide transition-colors ${
                    isActive ? "text-foreground font-bold" : "text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  {persona.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Content Box with Headline, CTA Button, and 2 Feature Columns */}
        <div className="pt-10 border-t border-border/40 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Role Headline & CTA Button */}
            <div className="lg:col-span-5 space-y-6">
              <h3 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground leading-[1.2]">
                {currentPersona.headline}
              </h3>
              <div>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-5 py-2.5 text-xs sm:text-sm font-semibold text-foreground backdrop-blur-md shadow-xs transition-all hover:bg-card hover:border-foreground/40 hover:scale-[1.02]"
                >
                  <span>{currentPersona.cta}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Column: 2 Feature Bullet Points */}
            <div className="lg:col-span-7 space-y-8">
              {currentPersona.features.map((feature, idx) => (
                <div key={idx} className="space-y-2">
                  <h4 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                    {feature.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl font-normal">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: 3-STEP EXECUTION TIMELINE */}
      <section className="w-full max-w-6xl mx-auto px-6">
        <div className="text-center space-y-3 mb-16 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-3.5 py-1.5 text-xs font-semibold text-foreground backdrop-blur-md shadow-xs mb-1">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
            </span>
            <span>Workflow Architecture</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
            From Chaos to Peak Flow in 3 Steps
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            A structured execution pipeline engineered to keep you focused on what matters most.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {[
            {
              step: "01",
              title: "Define & Structure",
              description: "Build multi-phase engineering roadmaps with task categories, priorities, and deadlines.",
              icon: <FolderOpen className="h-6 w-6 text-foreground" />,
            },
            {
              step: "02",
              title: "Execute & Streak",
              description: "Perform daily habit loops, track tasks, and append note logs without context switching.",
              icon: <Zap className="h-6 w-6 text-foreground" />,
            },
            {
              step: "03",
              title: "Measure & Accelerate",
              description: "Monitor focus velocity with vector metrics, status gauges, and automated audit logs.",
              icon: <BarChart2 className="h-6 w-6 text-foreground" />,
            },
          ].map((s, idx) => (
            <div
              key={idx}
              className="relative flex flex-col rounded-3xl border border-border/60 bg-card/50 p-8 backdrop-blur-xl transition-all hover:border-border hover:bg-card/80 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-background shadow-xs">
                  {s.icon}
                </div>
                <span className="text-3xl font-extrabold font-mono text-muted-foreground/30">{s.step}</span>
              </div>
              <h3 className="text-lg font-bold text-foreground">{s.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: FEATURE MATRIX COMPARISON */}
      <section className="w-full max-w-5xl mx-auto px-6 py-8">
        <div className="text-center space-y-3 mb-16 flex flex-col items-center">
          <div className="inline-flex items-center rounded-full border border-border/80 bg-card/80 px-4 py-1 text-xs font-semibold text-foreground backdrop-blur-md shadow-xs mb-1">
            <span>Comparison</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground text-center max-w-3xl leading-tight">
            See how Weavit stacks up <br className="hidden sm:block" /> against manual workflow
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground text-center max-w-2xl mx-auto">
            Discover why developers choose Weavit over manual tracking & fragmented spreadsheets
          </p>
        </div>

        {/* Unified Row-by-Row Grid for Pixel-Perfect Alignment */}
        <div className="w-full max-w-4xl mx-auto">
          {/* Header Row */}
          <div className="grid grid-cols-12 items-stretch gap-0">
            {/* Column 1 Header */}
            <div className="col-span-4 flex items-end pb-4 border-b border-border/40 pr-4 sm:pr-6">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Features</span>
            </div>

            {/* Column 2 Header (Weavit Borderless Card Top) */}
            <div className="col-span-4 bg-card/90 rounded-t-3xl p-5 sm:p-7 flex flex-col items-center justify-center text-center relative z-10 shadow-2xl backdrop-blur-xl border-b border-border/40">
              <img
                src="/logo-weavit.png"
                alt="Weavit Logo"
                className="h-10 w-auto object-contain mb-2"
              />
              <h3 className="text-lg font-bold text-foreground">Weavit</h3>
              <p className="text-[11px] text-muted-foreground">Built with developer needs in mind</p>
            </div>

            {/* Column 3 Header (Manual Workflow Top) */}
            <div className="col-span-4 flex flex-col items-center justify-center text-center pb-4 border-b border-border/40 pl-4 sm:pl-6">
              <div className="h-9 w-9 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-center mb-2 text-muted-foreground">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground/80">Manual Workflow</h3>
              <p className="text-[11px] text-muted-foreground">Fragmented apps & spreadsheets</p>
            </div>
          </div>

          {/* Feature Rows */}
          {[
            {
              icon: Users,
              title: "Team Overview",
              badge: null,
              weavit: { status: "check", detail: "Comprehensive real-time dashboard" },
              manual: { status: "minus", detail: "Basic overview only" },
            },
            {
              icon: Sliders,
              title: "Custom Branding",
              badge: null,
              weavit: { status: "check", detail: "Full system customization" },
              manual: { status: "check", detail: "Limited options" },
            },
            {
              icon: Code,
              title: "API Access",
              badge: null,
              weavit: { status: "check", detail: "Robust developer API" },
              manual: { status: "minus", detail: "No API available" },
            },
            {
              icon: BarChart2,
              title: "Advanced Analytics",
              badge: null,
              weavit: { status: "check", detail: "Real-time focus & velocity tracking" },
              manual: { status: "minus", detail: "Static spreadsheets & charts" },
            },
            {
              icon: Headphones,
              title: "Customer Support",
              badge: null,
              weavit: { status: "check", detail: "24/7 dedicated engineering team" },
              manual: { status: "minus", detail: "Email support only" },
            },
          ].map((row, idx) => {
            const RowIcon = row.icon
            return (
              <div key={idx} className="grid grid-cols-12 items-stretch gap-0 min-h-[96px]">
                {/* Col 1 Label */}
                <div className="col-span-4 flex items-center gap-3 border-b border-border/40 pr-4 sm:pr-6 py-4">
                  <RowIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm font-bold text-foreground">{row.title}</span>
                    {row.badge && (
                      <span className="rounded-full bg-muted/80 border border-border px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        {row.badge}
                      </span>
                    )}
                  </div>
                </div>

                {/* Col 2 Weavit (Middle Borderless Elevated Card Body) */}
                <div className="col-span-4 bg-card/90 border-b border-border/40 p-4 flex flex-col items-center justify-center text-center relative z-10 shadow-2xl backdrop-blur-xl">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mb-1.5" />
                  <span className="text-xs font-medium text-foreground">{row.weavit.detail}</span>
                </div>

                {/* Col 3 Manual Workflow */}
                <div className="col-span-4 flex flex-col items-center justify-center text-center border-b border-border/40 pl-4 sm:pl-6 p-4">
                  {row.manual.status === "check" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mb-1.5" />
                  ) : (
                    <MinusCircle className="h-5 w-5 text-rose-500 shrink-0 mb-1.5" />
                  )}
                  <span className="text-xs font-medium text-muted-foreground">{row.manual.detail}</span>
                </div>
              </div>
            )
          })}

          {/* Footer Row (Weavit Card Bottom CTA Button) */}
          <div className="grid grid-cols-12 items-stretch gap-0">
            <div className="col-span-4 pr-4 sm:pr-6" />

            {/* Weavit Card Bottom */}
            <div className="col-span-4 bg-card/90 rounded-b-3xl p-5 sm:p-7 relative z-10 shadow-2xl backdrop-blur-xl">
              <Link
                href="/dashboard"
                className="w-full rounded-xl bg-foreground py-3 text-xs sm:text-sm font-bold text-background shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all text-center block"
              >
                Try Weavit today
              </Link>
            </div>

            <div className="col-span-4 pl-4 sm:pl-6" />
          </div>
        </div>
      </section>

      {/* SECTION 4: FREQUENTLY ASKED QUESTIONS */}
      <section className="w-full max-w-4xl mx-auto px-6">
        <div className="text-center space-y-3 mb-12 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-3.5 py-1.5 text-xs font-semibold text-foreground backdrop-blur-md shadow-xs mb-1">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
            </span>
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Everything you need to know about the Weavit platform and workflow engine.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-3">
          {[
            {
              q: "Is Weavit fully client-side and fast?",
              a: "Yes! Weavit operates using an instant client-side state engine powered by Redux Toolkit, providing sub-millisecond response times without lag or cloud loading states.",
            },
            {
              q: "Can I customize engineering roadmaps for interview prep or projects?",
              a: "Absolutely. You can create custom roadmaps with multi-phase modules, categories (e.g. System Design, Algorithms, UI Architecture), executable tasks, and detailed note logs.",
            },
            {
              q: "How is the Productivity Score calculated?",
              a: "The productivity score combines active focus velocity, daily habit streak completion, and task execution rates visualized through our custom 75-bar vector meter.",
            },
            {
              q: "Does Weavit support dark and light themes?",
              a: "Yes, Weavit comes equipped with a standardized design system optimized with curated OKLCH color tokens for seamless dark and light theme switching.",
            },
          ].map((item, idx) => (
            <AccordionItem
              key={idx}
              value={`item-${idx}`}
              className="rounded-2xl border border-border/60 bg-card/50 px-5 py-1 backdrop-blur-md"
            >
              <AccordionTrigger className="text-sm sm:text-base font-bold text-foreground hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1 pb-3">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  )
}
