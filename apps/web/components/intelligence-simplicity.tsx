"use client"

import React from "react"
import { Layers, Workflow, BarChart3 } from "lucide-react"

interface FeatureItem {
  icon: React.ReactNode
  title: string
  description: string
}

const features: FeatureItem[] = [
  {
    icon: <Layers className="h-5 w-5 text-foreground" />,
    title: "Modular Architecture",
    description:
      "Component-based design system that scales with your project complexity and requirements.",
  },
  {
    icon: <Workflow className="h-5 w-5 text-foreground" />,
    title: "Smart Automation",
    description:
      "Intelligent workflows that reduce manual tasks and accelerate your development process.",
  },
  {
    icon: <BarChart3 className="h-5 w-5 text-foreground" />,
    title: "Data Intelligence",
    description:
      "Advanced analytics engine providing actionable insights from your application data.",
  },
]

export function IntelligenceSimplicitySection() {
  return (
    <section className="w-full py-20 px-6 max-w-5xl mx-auto flex flex-col items-center text-center">
      {/* Header */}
      <div className="mb-14 max-w-3xl space-y-3 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-3.5 py-1.5 text-xs font-semibold text-foreground backdrop-blur-md shadow-xs mb-1">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
          </span>
          <span>System Features</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
          Intelligence meets simplicity
        </h2>
        <p className="text-sm md:text-base text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
          Smart solutions that adapt to your workflow while maintaining the simplicity you need to stay productive.
        </p>
      </div>

      {/* 3-Column Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-4xl mx-auto">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="group relative flex flex-col items-center text-center rounded-2xl border border-border/60 bg-card/60 px-5 py-8 backdrop-blur-xl transition-all duration-300 hover:border-border hover:bg-card/90 hover:shadow-2xl hover:-translate-y-1"
          >
            {/* Dot Pattern Icon Box Container */}
            <div className="relative w-full h-36 rounded-xl flex items-center justify-center overflow-hidden mb-5">
              {/* Dot Pattern SVG Background with Radial Disappearing Mask */}
              <svg
                className="absolute inset-0 h-full w-full opacity-60"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  WebkitMaskImage:
                    "radial-gradient(circle at center, rgba(0,0,0,1) 20%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0) 88%)",
                  maskImage:
                    "radial-gradient(circle at center, rgba(0,0,0,1) 20%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0) 88%)",
                }}
              >
                <defs>
                  <pattern
                    id={`dot-matrix-${idx}`}
                    x="0"
                    y="0"
                    width="16"
                    height="16"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle
                      cx="2"
                      cy="2"
                      r="1.4"
                      className="fill-foreground/50"
                    />
                  </pattern>
                  <radialGradient id={`radial-fade-${idx}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="white" stopOpacity="1" />
                    <stop offset="45%" stopColor="white" stopOpacity="0.6" />
                    <stop offset="85%" stopColor="white" stopOpacity="0" />
                  </radialGradient>
                  <mask id={`mask-dot-${idx}`}>
                    <rect width="100%" height="100%" fill={`url(#radial-fade-${idx})`} />
                  </mask>
                </defs>
                <rect
                  width="100%"
                  height="100%"
                  fill={`url(#dot-matrix-${idx})`}
                  mask={`url(#mask-dot-${idx})`}
                />
              </svg>

              {/* Ambient Glow centered behind Icon */}
              <div className="absolute h-20 w-20 rounded-full bg-foreground/5 blur-xl group-hover:bg-foreground/10 transition-colors pointer-events-none" />

              {/* Center Icon Badge */}
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl border border-border/80 bg-background shadow-md group-hover:border-foreground/40 transition-colors">
                {feature.icon}
              </div>
            </div>

            {/* Card Content */}
            <h3 className="text-base md:text-lg font-bold tracking-tight text-foreground mb-2">
              {feature.title}
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
