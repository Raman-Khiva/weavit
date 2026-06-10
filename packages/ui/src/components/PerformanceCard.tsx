import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@workspace/ui/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

export interface PerformanceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: number // 0-100
  description?: string
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  color?: "primary" | "emerald" | "rose" | "blue" | "amber"
}

export function PerformanceCard({
  title,
  value,
  description,
  trend,
  trendValue,
  color = "primary",
  className,
  children,
  ...props
}: PerformanceCardProps) {
  // SVG properties
  const radius = 38
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (value / 100) * circumference

  // Statically define classes to avoid Tailwind purge issues
  const colorStyles = {
    primary: {
      stroke: "stroke-primary",
      glow: "hover:shadow-primary/20",
      gradient: "from-primary/20 via-primary/0 to-transparent",
    },
    emerald: {
      stroke: "stroke-emerald-500",
      glow: "hover:shadow-emerald-500/20",
      gradient: "from-emerald-500/20 via-emerald-500/0 to-transparent",
    },
    rose: {
      stroke: "stroke-rose-500",
      glow: "hover:shadow-rose-500/20",
      gradient: "from-rose-500/20 via-rose-500/0 to-transparent",
    },
    blue: {
      stroke: "stroke-blue-500",
      glow: "hover:shadow-blue-500/20",
      gradient: "from-blue-500/20 via-blue-500/0 to-transparent",
    },
    amber: {
      stroke: "stroke-amber-500",
      glow: "hover:shadow-amber-500/20",
      gradient: "from-amber-500/20 via-amber-500/0 to-transparent",
    },
  }

  const selectedColor = colorStyles[color]

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-border/50 bg-background p-6 transition-all duration-500 hover:border-white/70 hover:shadow-xl",
        className
      )}
      {...props}
    >
      {/* Background ambient gradient */}
      {/*
      <div
        className={cn(
          "absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          "bg-gradient-to-br",
          selectedColor.gradient
        )}
      />*/}

      <div className="relative z-10 flex flex-col items-center justify-center gap-6 text-center">
        <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">
          <svg
            className="h-full w-full -rotate-90 transform drop-shadow-sm"
            viewBox="0 0 100 100"
          >
            {/* Background track */}
            <circle
              className="stroke-muted/30"
              strokeWidth="8"
              fill="transparent"
              r={radius}
              cx="50"
              cy="50"
            />
            {/* Progress indicator */}
            <motion.circle
              className={cn(selectedColor.stroke, "drop-shadow-md")}
              strokeWidth="8"
              strokeLinecap="round"
              fill="transparent"
              r={radius}
              cx="50"
              cy="50"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{
                duration: 1.5,
                ease: [0.2, 0.8, 0.2, 1],
                delay: 0.1,
              }}
              style={{
                strokeDasharray: circumference,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
              className="flex items-baseline"
            >
              <span className="text-3xl font-bold tracking-tighter text-foreground">
                {value}
              </span>
              <span className="ml-0.5 text-sm font-semibold text-muted-foreground">
                %
              </span>
            </motion.div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="space-y-1.5">
            <h3 className="text-lg font-semibold tracking-tight text-foreground">
              {title}
            </h3>
            {description && (
              <p className="text-sm font-medium text-muted-foreground/80">
                {description}
              </p>
            )}
          </div>
          {trend && trendValue && (
            <div className="mt-1">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
                  trend === "up"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : trend === "down"
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      : "bg-slate-500/10 text-slate-600 dark:text-slate-400"
                )}
              >
                {trend === "up" && <TrendingUp className="h-3.5 w-3.5" />}
                {trend === "down" && <TrendingDown className="h-3.5 w-3.5" />}
                {trend === "neutral" && <Minus className="h-3.5 w-3.5" />}
                {trendValue}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
