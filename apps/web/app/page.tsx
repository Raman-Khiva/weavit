"use client"

import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google"
import { ReactLenis } from "lenis/react"
import "lenis/dist/lenis.css"
import { WeavitLanding } from "@/components/weavit-landing"
import { cn } from "@workspace/ui/lib/utils"

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-landing-display",
  weight: ["400", "500", "600", "700", "800"],
})

const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-landing-body",
  weight: ["400", "500", "600", "700"],
})

export default function Page(): React.ReactElement {
  return (
    <ReactLenis
      root
      options={{
        duration: 1.4,
        easing: (t) => 1 - Math.pow(1 - t, 4),
        wheelMultiplier: 1.2,
        smoothWheel: true,
      }}
    >
      <div
        className={cn(
          display.variable,
          body.variable,
          "font-[family-name:var(--font-landing-body)] antialiased"
        )}
      >
        <WeavitLanding />
      </div>
    </ReactLenis>
  )
}
