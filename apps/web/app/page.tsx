import React from "react"
import Link from "next/link"
import { Zap } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { FloatingNav } from "../components/floating-nav"
import { FlickeringGrid } from "@workspace/ui/components/flicking-grid"

const Page = () => {
  return (
    <main className="relative z-20 flex min-h-screen w-full flex-col items-center px-5 py-24 pt-[20vh] text-center">
      <FlickeringGrid
        className="absolute inset-0 right-0 left-0 z-0 w-full"
        squareSize={4}
        gridGap={6}
        color="#6B7280"
        maxOpacity={0.08}
        flickerChance={0.6}
      />

      <FloatingNav />
      {/* Badge */}
      {/* <div className="mb-8 inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-medium text-gray-900 transition-colors dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100">
        ✨ Welcome to Weavit
      </div> */}
      <div className="z-20 mb-5 flex items-center gap-3 rounded-full border border-border bg-background px-4 py-1 text-sm font-medium">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-foreground"></span>
        </span>
        Welcome to Weavit<span>{process.env.NEXT_PUBLIC_VERSION || "v0"}</span>
      </div>

      {/* Tagline */}
      <h1 className="z-20 mb-6 max-w-4xl text-5xl leading-[1.1] font-extrabold tracking-wide text-foreground text-gray-900 sm:text-5xl md:text-6xl md:leading-[1.2] dark:text-foreground">
        {/* <span className="mx-2 inline-flex h-12 w-12 -translate-y-1 items-center justify-center rounded-xl bg-[#3b82f6] align-middle shadow-md ring-4 ring-white sm:h-14 sm:w-14 md:mx-3 md:h-[72px] md:w-[72px] md:-translate-y-2 md:rounded-2xl dark:ring-background">
          <Zap
            className="h-6 w-6 text-white sm:h-7 sm:w-7 md:h-10 md:w-10"
            fill="currentColor"
            strokeWidth={0}
          />
        </span> */}
        Organize Your Work <br className="hidden sm:block" />
        with Seamless{" "}
        <span className="bg-foreground text-background">Workflows</span>
      </h1>

      {/* Description */}
      <p className="text-sm:text-xl mb-10 max-w-3xl text-lg leading-relaxed tracking-wide dark:text-muted-foreground">
        Weavit helps you manage tasks, track projects, and build better habits,
        all in one centralized and beautiful workspace designed for peak
        productivity.
      </p>

      {/* CTAs */}
      <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
        <Link
          href="/dashboard"
          className="group relative inline-flex items-center justify-center overflow-hidden rounded-md border border-transparent bg-gray-900 px-8 py-3 text-sm font-medium text-white shadow-md shadow-white/40 dark:bg-foreground dark:text-background"
        >
          <span className="absolute inset-0 -translate-y-[101%] bg-black transition-transform duration-200 ease-out group-hover:translate-y-0"></span>
          <span className="relative z-10 transition-colors duration-300 group-hover:text-black dark:group-hover:text-foreground">
            Go to Dashboard
          </span>
        </Link>
        <Link
          href="/workspace"
          className="group relative inline-flex items-center justify-center overflow-hidden rounded-md border border-foreground bg-transparent px-8 py-3 text-sm font-medium text-gray-900 shadow-sm shadow-white/20 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:outline-none dark:border-border dark:bg-black dark:text-gray-100"
        >
          <span className="absolute inset-0 translate-y-[101%] bg-white transition-transform duration-200 ease-out group-hover:translate-y-0 hover:border hover:border-background"></span>
          <span className="relative z-10 transition-colors duration-300 group-hover:text-black dark:group-hover:text-black">
            Open Workspace
          </span>
        </Link>
      </div>
    </main>
  )
}

export default Page
