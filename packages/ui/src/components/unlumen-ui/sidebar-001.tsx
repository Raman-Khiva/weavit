"use client"

import * as React from "react"
import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  HTMLMotionProps,
} from "motion/react"
import { ChevronRight } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { MonthCaption } from "react-day-picker"
import { Card } from "@workspace/ui/components/card"

const MotionChevron = motion.create(ChevronRight)

const EFFECTS_KEY = "sidebar-001-effects"

const EffectsContext = createContext<{ enabled: boolean; toggle: () => void }>({
  enabled: true,
  toggle: () => {},
})

function EffectsProvider({
  children,
  defaultEnabled = true,
}: {
  children: React.ReactNode
  defaultEnabled?: boolean
}) {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === "undefined") return defaultEnabled
    const stored = localStorage.getItem(EFFECTS_KEY)
    return stored !== null ? stored === "true" : defaultEnabled
  })

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev
      localStorage.setItem(EFFECTS_KEY, String(next))
      return next
    })
  }, [])

  const value = useMemo(() => ({ enabled, toggle }), [enabled, toggle])
  return (
    <EffectsContext.Provider value={value}>{children}</EffectsContext.Provider>
  )
}

export function useSidebar001Effects() {
  return useContext(EffectsContext)
}

// ─── Hover context ────────────────────────────────────────────────────────────

interface HoverRect {
  top: number
  height: number
  left: number
}

const HoverContext = createContext<{
  hovered: string | null
  hoverRect: HoverRect | null
  containerRef: React.RefObject<HTMLDivElement | null>
  viewportRef: React.RefObject<HTMLDivElement | null>
  setHovered: (id: string | null, rect?: HoverRect | null) => void
}>({
  hovered: null,
  hoverRect: null,
  containerRef: { current: null },
  viewportRef: { current: null },
  setHovered: () => {},
})

function HoverProvider({
  children,
  containerRef,
  viewportRef,
}: {
  children: React.ReactNode
  containerRef: React.RefObject<HTMLDivElement | null>
  viewportRef: React.RefObject<HTMLDivElement | null>
}) {
  const [hovered, setHoveredId] = useState<string | null>(null)
  const [hoverRect, setHoverRect] = useState<HoverRect | null>(null)

  const setHovered = useCallback(
    (id: string | null, rect?: HoverRect | null) => {
      setHoveredId(id)
      setHoverRect(rect ?? null)
    },
    []
  )

  const value = useMemo(
    () => ({ hovered, hoverRect, containerRef, viewportRef, setHovered }),
    [hovered, hoverRect, containerRef, viewportRef, setHovered]
  )

  return <HoverContext.Provider value={value}>{children}</HoverContext.Provider>
}

// ─── Scroll to active ─────────────────────────────────────────────────────────

function useScrollToActive(active: boolean) {
  const ref = useRef<HTMLDivElement>(null)
  const scrolled = useRef(false)

  useEffect(() => {
    if (!active || scrolled.current || !ref.current) return
    scrolled.current = true
    const el = ref.current
    const schedule =
      typeof requestIdleCallback !== "undefined"
        ? (cb: () => void) => requestIdleCallback(cb)
        : (cb: () => void) => setTimeout(cb, 100)
    const cancel =
      typeof cancelIdleCallback !== "undefined"
        ? cancelIdleCallback
        : clearTimeout
    const id = schedule(() => {
      const viewport = el.closest("[data-scroll-viewport]")
      if (!(viewport instanceof HTMLElement)) return
      const vpRect = viewport.getBoundingClientRect()
      const elRect = el.getBoundingClientRect()
      const offset =
        elRect.top - vpRect.top - vpRect.height / 2 + elRect.height / 2
      if (Math.abs(offset) > 40)
        viewport.scrollBy({ top: offset, behavior: "smooth" })
    })
    return () => cancel(id as number)
  }, [active])

  useEffect(() => {
    if (!active) scrolled.current = false
  }, [active])

  return ref
}

// ─── HoverHighlight ───────────────────────────────────────────────────────────

function HoverHighlight() {
  const { hoverRect, hovered } = useContext(HoverContext)
  const { enabled } = useContext(EffectsContext)

  return (
    <AnimatePresence>
      {enabled && hovered && hoverRect && (
        <motion.div
          key="sb001-hover-bg"
          className="pointer-events-none absolute z-0 rounded-md bg-accent/50"
          style={{ right: 0 }}
          initial={false}
          animate={{
            top: hoverRect.top + 2,
            height: hoverRect.height - 4,
            left: hoverRect.left,
            opacity: 1,
          }}
          exit={{ opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </AnimatePresence>
  )
}

// ─── AnimatedLabel ────────────────────────────────────────────────────────────

function AnimatedLabel({
  className,
  children,
  ...props
}: HTMLMotionProps<"span">) {
  const { viewportRef } = useContext(HoverContext)
  const itemRef = useRef<HTMLSpanElement>(null)
  const { scrollYProgress } = useScroll({
    container: viewportRef,
    target: itemRef,
    offset: ["start end", "end start"],
  })

  // Fade out when it approaches the center (where x > 0)
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.44, 0.45, 0.5, 0.55, 0.56, 1],
    [1, 1, 0, 0, 0, 1, 1]
  )

  return (
    <motion.span
      ref={itemRef}
      className={className}
      style={{ ...props.style, opacity }}
      {...props}
    >
      {children}
    </motion.span>
  )
}

// ─── AnimatedTick ─────────────────────────────────────────────────────────────

function AnimatedTick({
  className,
  children,
  ...props
}: HTMLMotionProps<"div">) {
  const { viewportRef } = useContext(HoverContext)
  const itemRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    container: viewportRef,
    target: itemRef,
    offset: ["start end", "end start"],
  })

  // The item will smoothly curve to the right by 30px when it hits the vertical center
  const x = useTransform(
    scrollYProgress,
    [0, 0.44, 0.45, 0.5, 0.55, 0.56, 1],
    [0, 0, 8, 30, 8, 0, 0]
  )

  return (
    <motion.div
      ref={itemRef}
      className={className}
      style={{ ...props.style, x }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ─── TimeCard ───────────────────

export interface TimeCardProps {
  hour: string
  minute: string
  period: string
  event?: {
    type: "Deadline" | "Event" | string
    title: string
    description: string
  } | null
}

export const TimeCard = ({ hour, minute, period, event }: TimeCardProps) => {
  return (
    <Card className="flex w-full flex-row items-stretch gap-0 overflow-hidden border-border bg-background/62 py-0 backdrop-blur-md">
      <div className="flex shrink-0 flex-col items-center justify-center gap-0 border-r border-border/50 bg-foreground px-4 py-3 text-3xl leading-[0.85] font-black tracking-tighter text-muted-foreground/60">
        <span>{hour}</span>
        <span>{minute}</span>
        <span className="mt-1.5 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
          {period}
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-center bg-primary/60 px-4 py-4">
        {event ? (
          <>
            <div className="mb-1 flex items-center gap-2">
              <div
                className={cn(
                  "flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[8px] font-bold tracking-wider uppercase",
                  event.type.toLowerCase() === "deadline"
                    ? "bg-red-500/10 text-red-500"
                    : "bg-blue-500/10 text-blue-500"
                )}
              >
                <span
                  className={cn(
                    "h-1 w-1 rounded-full",
                    event.type.toLowerCase() === "deadline"
                      ? "bg-red-500"
                      : "bg-blue-500"
                  )}
                />
                {event.type}
              </div>
            </div>
            <h4 className="text-xs leading-tight font-bold text-foreground">
              {event.title}
            </h4>
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
              {event.description}
            </p>
          </>
        ) : (
          <p className="text-xs font-medium text-muted-foreground">
            No events scheduled
          </p>
        )}
      </div>
    </Card>
  )
}

// ─── Sidebar001Item ───────────────────────────────────────────────────────────

export interface Sidebar001ItemProps {
  href: string
  label: React.ReactNode
  isActive: boolean
  isNew?: boolean
  className?: string
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
}

export const Sidebar001Item = memo(function Sidebar001Item({
  href,
  label,
  isActive,
  isNew,
  className,
  onClick,
}: Sidebar001ItemProps) {
  const { hovered, setHovered, containerRef, viewportRef } =
    useContext(HoverContext)
  const isHovered = hovered === href
  const itemRef = useScrollToActive(isActive)

  return (
    <div ref={itemRef} className={cn("relative", className)}>
      {/* <motion.div
        ref={itemRef}
        animate={{ opacity, x }}
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        style={{ transformOrigin: "left center" }}
        className="border-2 border-red-300"
      >
        <a
          href={href}
          onClick={onClick}
          onMouseEnter={() => {
            const el = itemRef.current
            const container = containerRef.current
            if (el && container) {
              const elRect = el.getBoundingClientRect()
              const containerRect = container.getBoundingClientRect()
              setHovered(href, {
                top: elRect.top - containerRect.top,
                height: elRect.height,
                left: 25,
              })
            } else {
              setHovered(href)
            }
          }}
          onMouseLeave={() => setHovered(null)}
          className={cn(
            "relative ml-2 flex items-center gap-2 py-1.5 pl-4 text-sm select-none",
            className
          )}
        >
          <span className="relative z-1 truncate">{label}</span>
          {isNew && (
            <span className="size-1.5 shrink-0 rounded-r-full bg-primary" />
          )}
        </a>
      </motion.div>
*/}
      {/* <motion.div className="pointer-events-none absolute -top-2 -left-3 flex snap-center items-center justify-end">
        <motion.span>{label}</motion.span>
        <AnimatedTick className="h-[2.6px] w-[30px] rounded-r-full bg-foreground" />
      </motion.div> */}
      <motion.div className="pointer-events-none absolute -top-2 left-1 flex snap-center items-center justify-end gap-1">
        <AnimatedTick className="pointer-events-none h-[2.6px] w-[35px] snap-center rounded-r-full bg-foreground/90" />
        <AnimatedLabel className="pointer-events-none snap-center">
          {label}:00
        </AnimatedLabel>
      </motion.div>
      <AnimatedTick className="pointer-events-none absolute top-1/8 left-1 h-[1.8px] w-[28px] snap-center rounded-r-full bg-foreground/70" />
      <AnimatedTick className="pointer-events-none absolute top-1/4 left-1 h-[2.0px] w-[28px] snap-center rounded-r-full bg-foreground/80" />
      <AnimatedTick className="pointer-events-none absolute top-3/8 left-1 h-[1.8px] w-[26px] snap-center rounded-r-full bg-foreground/70" />
      <AnimatedTick className="pointer-events-none absolute top-1/2 left-1 h-[2.2px] w-[32px] -translate-y-1/2 snap-center rounded-r-full bg-foreground/95" />
      <AnimatedTick className="pointer-events-none absolute top-5/8 left-1 h-[1.8px] w-[26px] snap-center rounded-r-full bg-foreground/70" />
      <AnimatedTick className="pointer-events-none absolute top-3/4 left-1 h-[2.0px] w-[28px] snap-center rounded-r-full bg-foreground/80" />
      <AnimatedTick className="pointer-events-none absolute top-7/8 left-1 h-[1.8px] w-[26px] snap-center rounded-r-full bg-foreground/70" />
    </div>
  )
})

// ─── Sidebar001Separator ──────────────────────────────────────────────────────

export function Sidebar001Separator({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "mt-2 px-0 py-3.5 text-sm font-medium text-foreground/40",
        className
      )}
    >
      {children}
    </div>
  )
}

// ─── Sidebar001Group ──────────────────────────────────────────────────────────

export interface Sidebar001GroupProps {
  label: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  icon?: React.ReactNode
  className?: string
}

export function Sidebar001Group({
  label,
  children,
  defaultOpen = false,
  icon,
  className,
}: Sidebar001GroupProps) {
  const [isOpen, setIsOpen] = useState(false)
  const id = useId()
  const { setHovered, containerRef } = useContext(HoverContext)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setIsOpen(defaultOpen)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleMouseEnter = useCallback(() => {
    const el = buttonRef.current
    const container = containerRef.current
    if (el && container) {
      const elRect = el.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      setHovered(id, {
        top: elRect.top - containerRect.top,
        height: elRect.height,
        left: 0,
      })
    } else {
      setHovered(id)
    }
  }, [id, setHovered, containerRef])

  const handleMouseLeave = useCallback(() => {
    setHovered(null)
  }, [setHovered])

  return (
    <div className={cn("flex flex-col", className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="group relative z-1 flex w-full items-center gap-1.5 py-1.5 pr-2 text-left select-none"
      >
        {icon ? (
          <>
            <span className="shrink-0 text-foreground/35 [&_svg]:size-3.5">
              {icon}
            </span>
            <span className="flex-1 text-sm text-foreground/45 transition-colors duration-150 group-hover:text-foreground/70">
              {label}
            </span>
            <MotionChevron
              size={14}
              strokeWidth={2.5}
              className="mr-1 shrink-0 text-foreground/25"
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </>
        ) : (
          <>
            <MotionChevron
              size={11}
              strokeWidth={2.5}
              className="shrink-0 text-foreground/35"
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
            <span className="text-sm text-foreground/45 transition-colors duration-150 group-hover:text-foreground/70">
              {label}
            </span>
          </>
        )}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            style={{ overflow: "hidden" }}
          >
            <div className="flex flex-col pl-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Sidebar001Section ────────────────────────────────────────────────────────

export function Sidebar001Section({
  label,
  children,
  className,
}: {
  label?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      {label && <Sidebar001Separator>{label}</Sidebar001Separator>}
      {children}
    </div>
  )
}

// ─── Sidebar001Content ────────────────────────────────────────────────────────

export function Sidebar001Content({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const { containerRef, viewportRef } = useContext(HoverContext)
  const [time, setTime] = useState({ hour: "12", minute: "00", period: "AM" })

  const handleScroll = useCallback(() => {
    const vp = viewportRef.current
    const container = containerRef.current
    if (!vp || !container) return

    const vpRect = vp.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()

    const yCenter = vpRect.top + vpRect.height / 2 - containerRect.top
    const hourFloat = yCenter / 96 // 96px is h-24

    let totalMinutes = Math.round(hourFloat * 60)
    totalMinutes = Math.max(0, Math.min(23 * 60 + 59, totalMinutes))

    let hr = Math.floor(totalMinutes / 60)
    const min = totalMinutes % 60

    const period = hr >= 12 ? "PM" : "AM"
    let displayHr = hr % 12
    if (displayHr === 0) displayHr = 12

    const hrStr = displayHr.toString().padStart(2, "0")
    const minStr = min.toString().padStart(2, "0")

    setTime((prev) =>
      prev.hour === hrStr && prev.minute === minStr && prev.period === period
        ? prev
        : { hour: hrStr, minute: minStr, period }
    )
  }, [viewportRef, containerRef])

  useEffect(() => {
    handleScroll()
  }, [handleScroll])

  return (
    <div className="relative flex-1 overflow-hidden">
      {/* Central static pointer */}
      {/* <div className="pointer-events-none absolute top-1/2 left-4 z-50 flex -translate-y-1/2 items-center overflow-hidden"> */}
      {/* <div className="h-0 w-0 border-y-[6px] border-l-10 border-y-transparent border-l-foreground" /> */}
      {/* <div className="pointer-events-none z-50 flex h-10 w-10 -translate-x-[60%] items-center rounded-r-full" /> */}
      {/* </div> */}
      <div className="absolute top-1/2 left-19 z-50 flex w-60 -translate-y-[50%] items-center gap-1">
        <div className="h-0 w-0 border-y-[6px] border-r-10 border-y-transparent border-r-foreground" />
        <TimeCard
          hour={time.hour}
          minute={time.minute}
          period={time.period}
          event={
            time.hour === "04" &&
            (time.minute === "30" || time.minute === "38") &&
            time.period === "PM"
              ? {
                  type: "Deadline",
                  title: "Launch Timeline Feature",
                  description: "Final review and deployment",
                }
              : time.hour === "09" &&
                  time.minute === "00" &&
                  time.period === "AM"
                ? {
                    type: "Event",
                    title: "Daily Standup",
                    description: "Sync with the engineering team",
                  }
              : time.hour === "05" &&
                  time.minute === "00" &&
                  time.period === "PM"
                ? {
                    type: "Event",
                    title: "Design Review",
                    description: "Review latest UI mockups with the team",
                  }
              : time.hour === "07" &&
                  (time.minute === "30" || time.minute === "38") &&
                  time.period === "PM"
                ? {
                    type: "Deadline",
                    title: "Code Freeze",
                    description: "All PRs must be merged for the sprint",
                  }
                : null
          }
        />
      </div>

      <div
        ref={viewportRef}
        onScroll={handleScroll}
        className={cn(
          "no-scrollbar h-full w-full snap-y snap-mandatory overflow-y-auto py-[40vh]",
          className
        )}
        data-scroll-viewport
      >
        <div ref={containerRef} className="relative px-1">
          <HoverHighlight />
          {children}
        </div>
      </div>
    </div>
  )
}

// ─── Sidebar001 (with resize) ─────────────────────────────────────────────────

export interface Sidebar001Props {
  children: React.ReactNode
  className?: string
  defaultEffectsEnabled?: boolean
  /** Initial width in px. Default: 240 */
  defaultWidth?: number
  /** Min resize width in px. Default: 160 */
  minWidth?: number
  /** Max resize width in px. Default: 400 */
  maxWidth?: number
}

export function Sidebar001({
  children,
  className,
  defaultEffectsEnabled = true,
  defaultWidth = 240,
  minWidth = 80,
  maxWidth = 400,
}: Sidebar001Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(defaultWidth)
  const dragging = useRef(false)
  const startX = useRef(0)
  const startW = useRef(0)

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      dragging.current = true
      startX.current = e.clientX
      startW.current = width
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [width]
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return
      const next = Math.min(
        maxWidth,
        Math.max(minWidth, startW.current + e.clientX - startX.current)
      )
      setWidth(next)
    },
    [minWidth, maxWidth]
  )

  const onPointerUp = useCallback(() => {
    dragging.current = false
  }, [])

  return (
    <EffectsProvider defaultEnabled={defaultEffectsEnabled}>
      <HoverProvider containerRef={containerRef} viewportRef={viewportRef}>
        <aside
          className={cn(
            "relative flex h-full shrink-0 flex-col pl-3",
            className
          )}
          style={{ width }}
        >
          {children}

          {/* Resize handle */}
        </aside>
      </HoverProvider>
    </EffectsProvider>
  )
}

// ─── Sidebar001Header ─────────────────────────────────────────────────────────

export function Sidebar001Header({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("shrink-0 px-3 pt-4 pb-2", className)}>{children}</div>
  )
}

// ─── Sidebar001Footer ─────────────────────────────────────────────────────────

export function Sidebar001Footer({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "shrink-0 border-t border-border/50 px-3 pt-2 pb-4",
        className
      )}
    >
      {children}
    </div>
  )
}
