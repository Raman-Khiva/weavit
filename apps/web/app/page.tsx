"use client"

import React, { useEffect } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle2, Sparkles, Zap, LayoutDashboard, FolderOpen } from "lucide-react"
import { FloatingNav } from "../components/floating-nav"
import { FlickeringGrid } from "@workspace/ui/components/flicking-grid"
import { IntelligenceSimplicitySection } from "../components/intelligence-simplicity"
import { LandingInteractiveShowcase } from "../components/landing-interactive-showcase"
import { ProductivityGraphicCard } from "@workspace/ui/components/productivity-graphic-card"
import { useAuth } from "@clerk/nextjs"
import { ReactLenis } from "lenis/react"
import "lenis/dist/lenis.css"

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
    <ReactLenis
      root
      options={{
        duration: 1.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        wheelMultiplier: 2.2,
        touchMultiplier: 2.0,
        smoothWheel: true,
      }}
    >
      <div className="relative min-h-screen w-full bg-background text-foreground overflow-x-hidden">
        {/* Ambient Grid Background - Hero viewport only for high FPS scrolling */}
        <div className="absolute top-0 left-0 right-0 h-screen max-h-[900px] pointer-events-none overflow-hidden z-0">
          <FlickeringGrid
            className="w-full h-full opacity-40"
            squareSize={10}
            gridGap={8}
            color="#6B7280"
            maxOpacity={0.08}
            flickerChance={0.4}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        </div>

      {/* Floating Header Navigation */}
      <FloatingNav />

      {/* 1. HERO SECTION */}
      <main className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-5 py-20 text-center max-w-6xl mx-auto">
        <div className="space-y-6 flex flex-col items-center max-w-4xl">
          {/* Version Badge */}
          <div className="flex items-center gap-2.5 rounded-full border border-border/80 bg-card/80 px-4 py-1.5 text-xs font-semibold backdrop-blur-md shadow-xs transition-all hover:border-foreground/30">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="text-foreground font-mono">Weavit Workspace Engine</span>
            <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
              {process.env.NEXT_PUBLIC_VERSION || "v0.1"}
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            The High-Density Workspace for <br className="hidden sm:block" />
            <span className="bg-foreground text-background px-4 py-1 rounded-2xl shadow-lg inline-block mt-2 sm:mt-0">
              Developer Execution
            </span>
          </h1>

          {/* Subtitle Description */}
          <p className="max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed font-normal">
            Structure multi-phase roadmaps, track daily habit loops, manage deadlines, and measure focus velocity—all in one centralized, high-density developer workspace.
          </p>

          {/* CTA Action Buttons */}
          <div className="flex w-full flex-col gap-3.5 sm:w-auto sm:flex-row items-center justify-center pt-2">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-foreground px-8 py-3.5 text-sm font-bold text-background shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="relative z-10 flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Explore Dashboard
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
            <Link
              href="/workspace/projects"
              className="w-full sm:w-auto group relative inline-flex items-center justify-center rounded-xl border border-border bg-card/80 px-8 py-3.5 text-sm font-semibold text-foreground backdrop-blur-md shadow-xs transition-all hover:bg-card hover:border-foreground/40"
            >
              <span className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-primary" />
                Open Roadmaps
              </span>
            </Link>
          </div>
        </div>
      </main>

      {/* 2. CORE CAPABILITIES GRID */}
      <div id="features">
        <IntelligenceSimplicitySection />
      </div>

      {/* 3. INTERACTIVE WORKSPACE SHOWCASE & FAQ */}
      <LandingInteractiveShowcase />

      {/* 4. PERFORMANCE & SYSTEM HIGHLIGHTS */}
      <section id="about" className="w-full py-16 border-t border-b border-border/40 bg-card/30 backdrop-blur-md">
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
            <p className="text-3xl sm:text-4xl font-extrabold text-foreground font-mono">75-Bar</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vector Focus Meter</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold text-foreground font-mono">0 Config</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Setup Required</p>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION BANNER */}
      <section id="pricing" className="w-full py-20 px-6 max-w-5xl mx-auto text-center">
        <div className="rounded-3xl border border-border/60 bg-gradient-to-b from-card/80 to-card/40 p-10 sm:p-14 backdrop-blur-xl shadow-2xl space-y-6">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight">
            Ready to elevate your <br className="hidden sm:block" />
            <span className="font-serif italic font-normal text-foreground/90">execution velocity?</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Experience the productivity environment crafted with high-density components, multi-phase roadmaps, and intelligent task execution.
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

      {/* 6. FOOTER */}
      <footer className="w-full border-t border-border/40 py-8 px-6 text-center text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <img src="/logo-weavit.png" alt="Weavit Logo" className="h-5 w-auto" />
            <span>weavit</span>
          </div>
          <p>© {new Date().getFullYear()} Weavit Platform. High-Density Workspace Engine.</p>
          <div className="flex items-center gap-4">
            <Link href="/overview" className="hover:text-foreground transition-colors">Overview</Link>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
            <Link href="/workspace" className="hover:text-foreground transition-colors">Workspace</Link>
          </div>
        </div>
      </footer>
    </div>
    </ReactLenis>
  )
}

export default Page
