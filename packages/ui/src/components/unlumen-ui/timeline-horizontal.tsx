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
  HTMLMotionProps,
} from "motion/react"
import { cn } from "@workspace/ui/lib/utils"
import { Card } from "@workspace/ui/components/card"

// ─── Hover context ────────────────────────────────────────────────────────────

interface HoverRect {
  top: number
  height: number
  left: number
  width: number
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

function useScrollToActiveHorizontal(active: boolean) {
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
        elRect.left - vpRect.left - vpRect.width / 2 + elRect.width / 2
      if (Math.abs(offset) > 40)
        viewport.scrollBy({ left: offset, behavior: "smooth" })
    })
    return () => cancel(id as number)
  }, [active])

  useEffect(() => {
    if (!active) scrolled.current = false
  }, [active])

  return ref
}

// ─── AnimatedLabelHorizontal ──────────────────────────────────────────────────

function AnimatedLabelHorizontal({
  className,
  children,
  ...props
}: HTMLMotionProps<"span">) {
  const { viewportRef } = useContext(HoverContext)
  const itemRef = useRef<HTMLSpanElement>(null)
  const { scrollXProgress } = useScroll({
    container: viewportRef,
    target: itemRef,
    axis: "x",
    offset: ["start end", "end start"],
  })

  // Fade out when it approaches the center (where y shifts)
  const opacity = useTransform(
    scrollXProgress,
    [0, 0.44, 0.47, 0.5, 0.53, 0.56, 1],
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

// ─── AnimatedTickHorizontal ───────────────────────────────────────────────────

function AnimatedTickHorizontal({
  className,
  children,
  onClick,
  ...props
}: HTMLMotionProps<"div">) {
  const { viewportRef } = useContext(HoverContext)
  const itemRef = useRef<HTMLDivElement>(null)
  const { scrollXProgress } = useScroll({
    container: viewportRef,
    target: itemRef,
    axis: "x",
    offset: ["start end", "end start"],
  })

  // The item will smoothly curve DOWNWARD by 20px when it hits the horizontal center
  const y = useTransform(scrollXProgress, [0, 1], [0, 0])

  return (
    <motion.div
      ref={itemRef}
      className={cn("relative cursor-pointer", className)}
      style={{ ...props.style, y }}
      onClick={(e) => {
        if (onClick) onClick(e)
        if (itemRef.current && viewportRef.current) {
          const vpRect = viewportRef.current.getBoundingClientRect()
          const itemRect = itemRef.current.getBoundingClientRect()
          // Calculate the exact offset to put this item in the horizontal center of the viewport
          const offset =
            itemRect.left - vpRect.left - vpRect.width / 2 + itemRect.width / 2
          viewportRef.current.scrollBy({ left: offset, behavior: "smooth" })
        }
      }}
      {...props}
    >
      <div className="absolute -inset-x-2 -inset-y-2" />
      {children as React.ReactNode}
    </motion.div>
  )
}

// ─── TimeCardHorizontal ───────────────────

export interface TimeCardHorizontalProps {
  hour: string
  minute: string
  period: string
  event?: {
    type: "Deadline" | "Event" | string
    title: string
    description: string
  } | null
}

export const TimeCardHorizontal = ({
  hour,
  minute,
  period,
  event,
}: TimeCardHorizontalProps) => {
  return (
    <Card className="z-50 flex w-fit max-w-[221px] shrink flex-row items-stretch gap-0 overflow-hidden border-border bg-background/62 py-0 backdrop-blur-md">
      <div className="flex shrink-0 flex-col items-center justify-center border-r border-border/50 bg-foreground px-4 py-3 text-xl leading-[0.85] font-black tracking-wider text-muted-foreground/60">
        <span>{hour}</span>
        <span>{minute}</span>
        <span className="text-xs font-bold text-muted/30"> {period}</span>
      </div>
      <div className="flex min-w-[150px] flex-1 flex-col justify-center bg-primary/60 px-4 py-4">
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

// ─── TimelineHorizontalItem ───────────────────────────────────────────────────

export interface TimelineHorizontalItemProps {
  href: string
  label: React.ReactNode
  isActive: boolean
  className?: string
}

export const TimelineHorizontalItem = memo(function TimelineHorizontalItem({
  href,
  label,
  isActive,
  className,
}: TimelineHorizontalItemProps) {
  const itemRef = useScrollToActiveHorizontal(isActive)

  return (
    <div ref={itemRef} className={cn("relative shrink-0", className)}>
      <motion.div className="absolute top-1 -left-4 z-10 flex snap-center flex-col items-center justify-start gap-1">
        <AnimatedTickHorizontal className="h-[25px] w-[2.6px] snap-center rounded-b-full bg-foreground/90" />
        <AnimatedLabelHorizontal className="pointer-events-none snap-center whitespace-nowrap">
          {label}:00
        </AnimatedLabelHorizontal>
      </motion.div>
      <AnimatedTickHorizontal className="absolute top-1 left-1/8 z-10 h-[18px] w-[1.8px] snap-center rounded-b-full bg-foreground/70" />
      <AnimatedTickHorizontal className="absolute top-1 left-1/4 z-10 h-[18px] w-[2.0px] snap-center rounded-b-full bg-foreground/80" />
      <AnimatedTickHorizontal className="absolute top-1 left-3/8 z-10 h-[16px] w-[1.8px] snap-center rounded-b-full bg-foreground/70" />
      <AnimatedTickHorizontal className="absolute top-1 left-1/2 z-10 h-[22px] w-[2.2px] -translate-x-1/2 snap-center rounded-b-full bg-foreground/95" />
      <AnimatedTickHorizontal className="absolute top-1 left-5/8 z-10 h-[16px] w-[1.8px] snap-center rounded-b-full bg-foreground/70" />
      <AnimatedTickHorizontal className="absolute top-1 left-3/4 z-10 h-[18px] w-[2.0px] snap-center rounded-b-full bg-foreground/80" />
      <AnimatedTickHorizontal className="absolute top-1 left-7/8 z-10 h-[16px] w-[1.8px] snap-center rounded-b-full bg-foreground/70" />
    </div>
  )
})

// ─── TimelineHorizontalSection ────────────────────────────────────────────────

export function TimelineHorizontalSection({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn("flex flex-row", className)}>{children}</div>
}

// ─── TimelineHorizontalContent ────────────────────────────────────────────────

export function TimelineHorizontalContent({
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

    const xCenter = vpRect.left + vpRect.width / 2 - containerRect.left
    const hourFloat = xCenter / 96 // 96px is w-24

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

  // Sync to current time on mount
  useEffect(() => {
    const vp = viewportRef.current
    if (!vp) return

    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    
    // 96px per hour, 1.6px per minute
    const scrollAmount = hours * 96 + minutes * 1.6
    
    // Use setTimeout to ensure the DOM has painted and snapping doesn't interfere
    setTimeout(() => {
      vp.scrollTo({ left: scrollAmount, behavior: "instant" })
    }, 50)
  }, [viewportRef])

  return (
    <div className="relative flex h-full w-full flex-1 flex-col overflow-hidden">
      {/* TimeCard Area Above */}
      <div className="absolute top-4 left-1/2 z-50 flex -translate-x-[50%] flex-col items-center gap-2">
        <div className="relative rounded-xl bg-background p-1 pt-2">
          <div className="absolute top-1 left-1/2 h-0 w-0 -translate-x-[50%] border-x-[6px] border-b-10 border-x-transparent border-b-border" />
          <TimeCardHorizontal
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
      </div>

      {/* Horizontal Scroll Area Below */}
      <div
        ref={viewportRef}
        onScroll={handleScroll}
        className={cn(
          "no-scrollbar flex h-full w-full snap-x snap-mandatory items-end overflow-x-auto overflow-y-hidden px-[50vw] pb-8",
          className
        )}
        data-scroll-viewport
      >
        <div ref={containerRef} className="relative flex h-full">
          {children}
        </div>
      </div>
    </div>
  )
}

// ─── TimelineHorizontal (Main Container) ───────────────────────────────────────

export function TimelineHorizontal({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)

  return (
    <HoverProvider containerRef={containerRef} viewportRef={viewportRef}>
      <section
        className={cn("relative flex w-full flex-col bg-background", className)}
      >
        {children}
      </section>
    </HoverProvider>
  )
}
