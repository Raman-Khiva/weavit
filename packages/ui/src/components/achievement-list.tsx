"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Check, Trophy } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

interface Achievement {
  id: string
  name: string
  description?: string | null
  trigger: "metric" | "api" | "streak"
  badgeUrl?: string | null
  progress?: number
  rarity?: number
}

interface UserAchievement extends Achievement {
  achievedAt: string | null
}

const achievementListVariants = cva("flex flex-col", {
  variants: {
    columns: {
      2: "",
      3: "",
      4: "",
      auto: "",
    },
    gap: {
      sm: "gap-2",
      default: "gap-3",
      lg: "gap-4",
    },
  },
  defaultVariants: {
    columns: "auto",
    gap: "default",
  },
})

interface AchievementListProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof achievementListVariants> {
  achievements: UserAchievement[]
  badgeSize?: "sm" | "default" | "lg"
  lockedStyle?: "grayscale" | "silhouette" | "hidden"
  onAchievementClick?: (achievement: UserAchievement) => void
}

const badgeSizeMap = {
  sm: "h-10 w-10",
  default: "h-12 w-12",
  lg: "h-14 w-14",
} as const

const iconSizeMap = {
  sm: "h-5 w-5",
  default: "h-6 w-6",
  lg: "h-7 w-7",
} as const

const progressSizeMap = {
  sm: 42,
  default: 48,
  lg: 56,
} as const

const AchievementList = React.forwardRef<HTMLDivElement, AchievementListProps>(
  (
    {
      className,
      columns,
      gap,
      achievements,
      badgeSize = "default",
      lockedStyle = "grayscale",
      onAchievementClick,
      ...props
    },
    ref
  ) => {
    return (
      <div ref={ref} className={cn(className)} {...props}>
        <div
          role="list"
          aria-label="Achievements"
          className={achievementListVariants({ columns, gap })}
        >
          {achievements.map((achievement) => {
            const isUnlocked = achievement.achievedAt !== null
            const hasProgress =
              isUnlocked && typeof achievement.progress === "number"

            if (!isUnlocked && lockedStyle === "hidden") {
              return null
            }

            const progress = hasProgress
              ? Math.min(100, Math.max(0, achievement.progress ?? 0))
              : 0
            const progressSize = progressSizeMap[badgeSize]
            const progressStroke = 3
            const progressRadius = (progressSize - progressStroke) / 2
            const circumference = 2 * Math.PI * progressRadius
            const dashOffset = circumference - (progress / 100) * circumference

            return (
              <div
                key={achievement.id}
                role={onAchievementClick ? "button" : "listitem"}
                tabIndex={onAchievementClick ? 0 : undefined}
                onClick={() => onAchievementClick?.(achievement)}
                onKeyDown={
                  onAchievementClick
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          onAchievementClick(achievement)
                        }
                      }
                    : undefined
                }
                className={cn(
                  "bg-background flex items-center gap-4 rounded-2xl border px-4 py-3",
                  onAchievementClick && "cursor-pointer"
                )}
              >
                {achievement.badgeUrl ? (
                  <img
                    src={achievement.badgeUrl}
                    alt={achievement.name}
                    className={cn(
                      badgeSizeMap[badgeSize],
                      "shrink-0 rounded-xl object-cover",
                      !isUnlocked && lockedStyle === "grayscale" && "grayscale",
                      !isUnlocked &&
                        lockedStyle === "silhouette" &&
                        "opacity-30 brightness-0"
                    )}
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className={cn(
                      badgeSizeMap[badgeSize],
                      "flex shrink-0 items-center justify-center rounded-xl",
                      isUnlocked
                        ? "bg-muted text-muted-foreground"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    <Trophy className={iconSizeMap[badgeSize]} />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "truncate text-base font-semibold",
                      !isUnlocked && "text-muted-foreground"
                    )}
                  >
                    {achievement.name}
                  </p>
                  <p className="text-muted-foreground truncate text-sm">
                    {achievement.description ?? "Complete the required steps"}
                  </p>
                </div>

                {hasProgress ? (
                  <div
                    className="relative shrink-0"
                    style={{ width: progressSize, height: progressSize }}
                  >
                    <svg
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full"
                      viewBox={`0 0 ${progressSize} ${progressSize}`}
                    >
                      <circle
                        cx={progressSize / 2}
                        cy={progressSize / 2}
                        r={progressRadius}
                        fill="none"
                        stroke="hsl(var(--muted))"
                        strokeWidth={progressStroke}
                      />
                      <circle
                        cx={progressSize / 2}
                        cy={progressSize / 2}
                        r={progressRadius}
                        fill="none"
                        stroke="var(--primary)"
                        strokeLinecap="round"
                        strokeWidth={progressStroke}
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        transform={`rotate(-90 ${progressSize / 2} ${progressSize / 2})`}
                      />
                    </svg>
                    <div className="text-foreground absolute inset-0 grid place-items-center text-sm font-semibold">
                      {Math.round(progress)}%
                    </div>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
AchievementList.displayName = "AchievementList"

export { AchievementList, achievementListVariants }
export type { AchievementListProps, Achievement, UserAchievement }

interface SequencedAchievementItem {
  id: string
  title: string
  description: string
  details?: string[]
}

interface SequencedAchievementProgress {
  index: number
  progress: number
  settledCount: number
}

interface SequencedAchievementListProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onProgress"> {
  items: SequencedAchievementItem[]
  durationMs?: number
  onComplete?: () => void
  onItemComplete?: (index: number) => void
  onProgress?: (state: SequencedAchievementProgress) => void
}

function ProgressRing({ value }: { value: number }) {
  const size = 36
  const stroke = 2.5
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (value / 100) * circumference

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      aria-label="Card progress"
    >
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--primary)"
          strokeLinecap="round"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="text-foreground absolute inset-0 grid place-items-center text-[10px] font-semibold">
        {Math.round(value)}%
      </div>
    </div>
  )
}

function SequencedAchievementCard({
  item,
  progress,
  complete,
}: {
  item: SequencedAchievementItem
  progress: number
  complete: boolean
}) {
  const detailLine = (item.details ?? []).filter(Boolean).join(" · ")

  return (
    <article className="bg-background animate-in fade-in flex items-center gap-3 rounded-md border px-3 py-2 duration-200">
      <span
        aria-hidden="true"
        className={cn(
          "grid size-5 shrink-0 place-items-center rounded-full",
          complete
            ? "bg-foreground text-background"
            : "border border-muted-foreground/40"
        )}
      >
        {complete ? <Check className="size-3" strokeWidth={3} /> : null}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold leading-5">{item.title}</p>
        <p className="text-muted-foreground mt-px truncate text-xs leading-4">
          {item.description}
        </p>
        {complete && detailLine ? (
          <p className="text-muted-foreground/80 truncate text-xs leading-4">
            {detailLine}
          </p>
        ) : null}
      </div>

      {complete ? null : <ProgressRing value={progress} />}
    </article>
  )
}

const SequencedAchievementList = React.forwardRef<
  HTMLDivElement,
  SequencedAchievementListProps
>(({ className, items, durationMs = 3000, onComplete, onItemComplete, onProgress, ...props }, ref) => {
  const [cursor, setCursor] = React.useState(0)
  const [settledCount, setSettledCount] = React.useState(0)
  const [progress, setProgress] = React.useState(0)
  const onCompleteRef = React.useRef(onComplete)
  const onItemCompleteRef = React.useRef(onItemComplete)
  const onProgressRef = React.useRef(onProgress)
  const completedRef = React.useRef(false)

  onCompleteRef.current = onComplete
  onItemCompleteRef.current = onItemComplete
  onProgressRef.current = onProgress

  React.useEffect(() => {
    if (items.length === 0) {
      if (!completedRef.current) {
        completedRef.current = true
        onProgressRef.current?.({ index: 0, progress: 100, settledCount: 0 })
        onCompleteRef.current?.()
      }
      return
    }

    if (cursor >= items.length) {
      if (!completedRef.current) {
        completedRef.current = true
        onProgressRef.current?.({ index: items.length, progress: 100, settledCount: items.length })
        onCompleteRef.current?.()
      }
      return
    }

    let frame = 0
    let timeout = 0
    let start: number | null = null
    let cancelled = false

    const tick = (now: number) => {
      if (cancelled) return
      if (start === null) start = now
      const value = Math.min(100, ((now - start) / durationMs) * 100)
      setProgress(value)
      if (value < 100) {
        onProgressRef.current?.({ index: cursor, progress: value, settledCount: cursor })
        frame = requestAnimationFrame(tick)
        return
      }
      onProgressRef.current?.({ index: cursor, progress: 100, settledCount: cursor + 1 })
      setSettledCount((count) => Math.max(count, cursor + 1))
      onItemCompleteRef.current?.(cursor)
      timeout = window.setTimeout(() => {
        if (!cancelled) {
          setProgress(0)
          setCursor((current) => current + 1)
        }
      }, 220)
    }

    setProgress(0)
    frame = requestAnimationFrame(tick)

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      window.clearTimeout(timeout)
    }
  }, [cursor, durationMs, items.length])

  const visibleCount =
    cursor >= items.length ? items.length : Math.max(settledCount, cursor + 1)

  return (
    <div ref={ref} className={cn("w-full", className)} {...props}>
      <div
        role="list"
        aria-label="Plan steps"
        className="flex flex-col gap-2"
      >
        {items.slice(0, visibleCount).map((item, index) => (
          <div key={item.id} role="listitem">
            <SequencedAchievementCard
              item={item}
              complete={index < settledCount}
              progress={index === cursor ? progress : 0}
            />
          </div>
        ))}
      </div>
    </div>
  )
})
SequencedAchievementList.displayName = "SequencedAchievementList"

export { SequencedAchievementList }
export type { SequencedAchievementItem, SequencedAchievementListProps, SequencedAchievementProgress }
