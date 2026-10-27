"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react"
import { cn } from "@workspace/ui/lib/utils"

const SITES = [
  {
    title: "GitHub",
    href: "https://github.com",
    icon: <GitHubIcon />,
  },
  {
    title: "LeetCode",
    href: "https://leetcode.com",
    icon: <LeetCodeIcon />,
  },
  {
    title: "Drive",
    href: "https://drive.google.com",
    icon: <DriveIcon />,
  },
  {
    title: "Notion",
    href: "https://www.notion.so",
    icon: <NotionIcon />,
  },
  {
    title: "Gmail",
    href: "https://mail.google.com",
    icon: <GmailIcon />,
  },
  {
    title: "Calendar",
    href: "https://calendar.google.com",
    icon: <CalendarIcon />,
  },
  {
    title: "LinkedIn",
    href: "https://www.linkedin.com",
    icon: <LinkedInIcon />,
  },
]

export function SiteDock({ className }: { className?: string }) {
  const mouseY = useMotionValue(Infinity)
  const navRef = useRef<HTMLElement>(null)
  const [rest, setRest] = useState(36)

  useEffect(() => {
    const parent = navRef.current?.parentElement
    if (!parent) return
    const fit = () => {
      const available = parent.clientHeight - 12 - 4 * (SITES.length - 1)
      const per = Math.floor(available / SITES.length)
      setRest(Math.max(28, Math.min(40, per)))
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(parent)
    return () => observer.disconnect()
  }, [])

  return (
    <motion.nav
      ref={navRef}
      aria-label="Sites"
      onMouseMove={(event) => mouseY.set(event.clientY)}
      onMouseLeave={() => mouseY.set(Infinity)}
      className={cn(
        "flex max-h-full flex-col items-end gap-1 rounded-2xl border border-white/10 bg-neutral-950/80 p-1.5 shadow-lg backdrop-blur-md",
        className
      )}
    >
      {SITES.map((site) => (
        <SiteIcon key={site.title} mouseY={mouseY} rest={rest} {...site} />
      ))}
    </motion.nav>
  )
}

function SiteIcon({
  mouseY,
  rest,
  title,
  href,
  icon,
}: {
  mouseY: MotionValue<number>
  rest: number
  title: string
  href: string
  icon: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const distance = useTransform(mouseY, (value) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { y: 0, height: 0 }
    return value - bounds.y - bounds.height / 2
  })
  const peak = rest + 16
  const size = useSpring(useTransform(distance, [-120, 0, 120], [rest, peak, rest]), {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  })
  const iconSize = useSpring(useTransform(distance, [-120, 0, 120], [rest * 0.5, peak * 0.55, rest * 0.5]), {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  })
  const [hovered, setHovered] = useState(false)

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={title} className="relative block">
      <motion.div
        ref={ref}
        style={{ width: size, height: size }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex items-center justify-center rounded-xl hover:bg-white/10"
      >
        {hovered && (
          <span className="pointer-events-none absolute right-full mr-2 rounded-md border border-white/10 bg-neutral-950 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-white/80 shadow-md">
            {title}
          </span>
        )}
        <motion.div style={{ width: iconSize, height: iconSize }} className="flex items-center justify-center">
          {icon}
        </motion.div>
      </motion.div>
    </a>
  )
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden>
      <path
        fill="currentColor"
        className="text-white/90"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.56 9.56 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  )
}

function LeetCodeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden>
      <path
        fill="#FFA116"
        d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.338 5.338 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"
      />
    </svg>
  )
}

function DriveIcon() {
  return (
    <svg viewBox="0 0 87.3 78" className="h-full w-full" aria-hidden>
      <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L27.5 53H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
      <path d="M43.65 25 29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0-1.2 4.5h27.5z" fill="#00ac47" />
      <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.852 11.5z" fill="#ea4335" />
      <path d="M43.65 25 57.4 1.2c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" />
      <path d="M59.8 53H27.5L13.75 76.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc" />
      <path d="M73.4 26.5 60.7 4.5c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25 59.8 53h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
    </svg>
  )
}

function NotionIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden>
      <path
        fill="currentColor"
        className="text-white/90"
        d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466l1.823 1.447zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952l1.166.093s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.887.747-.933l2.222-.14zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"
      />
    </svg>
  )
}

function GmailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.545l8.073-6.052C21.69 2.28 24 3.434 24 5.457z"
      />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden>
      <rect x="3" y="4" width="18" height="17" rx="2" fill="#fff" />
      <path d="M3 8h18V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z" fill="#1a73e8" />
      <path d="M3 8h18v3H3z" fill="#ea4335" />
      <text x="12" y="18.5" textAnchor="middle" fontSize="7" fontWeight="700" fill="#1a73e8">
        31
      </text>
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden>
      <path
        fill="#0A66C2"
        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
      />
    </svg>
  )
}
