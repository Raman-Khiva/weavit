"use client"

import React, { useEffect } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle2, Shield, Sparkles, Zap } from "lucide-react"
import { FloatingNav } from "../components/floating-nav"
import { FlickeringGrid } from "@workspace/ui/components/flicking-grid"
import { IntelligenceSimplicitySection } from "../components/intelligence-simplicity"
import { LandingInteractiveShowcase } from "../components/landing-interactive-showcase"
import { ProductivityGraphicCard } from "@workspace/ui/components/productivity-graphic-card"
import { useAuth } from "@clerk/nextjs"

const Page = () => {
  let getToken: (() => Promise<string | null>) | undefined
  try {
    const auth = useAuth()
    getToken = auth?.getToken
  } catch (err) {
    console.log("Clerk provider optional notice:", err)
  }

  useEffect(() => {
    const callGetToken = async () => {
      try {
        if (getToken) {
          const token = await getToken()
          console.warn("Token", token)
        }
      } catch (err) {
        console.log("Auth token notice:", err)
      }
    }

    callGetToken()
  }, [getToken])

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground overflow-x-hidden">
      {/* Ambient Grid Background */}
      <FlickeringGrid
        className="absolute inset-0 z-0 w-full h-full pointer-events-none opacity-40"
        squareSize={8}
        gridGap={6}
        color="#6B7280"
        maxOpacity={0.08}
        flickerChance={0.6}
      />

      {/* Floating Header Navigation */}
      <FloatingNav />

      {/* 1. HERO SECTION */}
      <main className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-5 py-20 text-center max-w-6xl mx-auto">
        {/* Version Badge */}
        <div className="mb-6 flex items-center gap-2.5 rounded-full border border-border/80 bg-card/80 px-4 py-1.5 text-xs font-semibold backdrop-blur-md shadow-xs transition-all hover:border-foreground/30">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span className="text-foreground">Welcome to Weavit</span>
          <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
            {process.env.NEXT_PUBLIC_VERSION || "v0.1"}
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="mb-6 max-w-4xl text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
          Organize Your Work <br className="hidden sm:block" />
          with Seamless{" "}
          <span className="bg-foreground text-background px-3 py-1 rounded-xl shadow-md inline-block mt-2 sm:mt-0">
            Workflows
          </span>
        </h1>

        {/* Subtitle Description */}
        <p className="mb-10 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed font-normal">
          Weavit helps you manage tasks, track projects, and build better habits—all in one centralized, high-density workspace designed for peak developer productivity.
        </p>

        {/* CTA Action Buttons */}
        <div className="flex w-full flex-col gap-3.5 sm:w-auto sm:flex-row items-center justify-center">
          <Link
            href="/overview"
            className="w-full sm:w-auto group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-foreground px-7 py-3.5 text-sm font-bold text-background shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="relative z-10 flex items-center gap-2">
              Overview & Analytics
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto group relative inline-flex items-center justify-center rounded-xl border border-border bg-card/80 px-7 py-3.5 text-sm font-semibold text-foreground backdrop-blur-md shadow-xs transition-all hover:bg-card hover:border-foreground/40"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/workspace"
            className="w-full sm:w-auto group relative inline-flex items-center justify-center rounded-xl border border-border bg-card/80 px-7 py-3.5 text-sm font-semibold text-foreground backdrop-blur-md shadow-xs transition-all hover:bg-card hover:border-foreground/40"
          >
            Open Workspace
          </Link>
        </div>
      </main>

      {/* 2. DESIGN SYSTEM FEATURE GRID */}
      <IntelligenceSimplicitySection />

      {/* 3. INTERACTIVE SHOWCASE, WORKFLOW & FAQ SECTIONS */}
      <LandingInteractiveShowcase />

      {/* 3. PERFORMANCE & SYSTEM HIGHLIGHTS */}
      <section className="w-full py-16 border-t border-b border-border/40 bg-card/30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold text-foreground font-mono">100%</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Client-Side Architecture</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold text-foreground font-mono">&lt; 1ms</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">State Sync Latency</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold text-foreground font-mono">80+</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vector Metric Bars</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold text-foreground font-mono">0 Config</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Setup Required</p>
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION BANNER */}
      <section className="w-full py-20 px-6 max-w-5xl mx-auto text-center">
        <div className="rounded-3xl border border-border/60 bg-gradient-to-b from-card/80 to-card/40 p-10 sm:p-14 backdrop-blur-xl shadow-2xl space-y-6">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Ready to elevate your personal roadmap?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Experience the productivity environment crafted with high-density components, vector graphics, and intelligent task execution.
          </p>
          <div className="pt-2 flex items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3 text-sm font-bold text-background shadow-md transition-all hover:scale-[1.02]"
            >
              Launch Dashboard Now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="w-full border-t border-border/40 py-8 px-6 text-center text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <img src="/logo-weavit.png" alt="Weavit Logo" className="h-5 w-auto" />
            <span>weavit</span>
          </div>
          <p>© {new Date().getFullYear()} Weavit Platform. Intelligence meets simplicity.</p>
          <div className="flex items-center gap-4">
            <Link href="/overview" className="hover:text-foreground transition-colors">Overview</Link>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
            <Link href="/workspace" className="hover:text-foreground transition-colors">Workspace</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Page
