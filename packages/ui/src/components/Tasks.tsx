"use client"

import { Card, CardContent } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import { motion } from "framer-motion"
import { Calendar, CheckCircle2, Clock } from "lucide-react"
import { PerformanceCard } from "@workspace/ui/components/PerformanceCard"
import { Loader } from "@workspace/ui/components/loader"

interface TaskProps {
  title: string
  description: string
  startDate?: string
  endDate: string
  status?: "todo" | "in-progress" | "done"
  className?: string
  children?: React.ReactNode
}

export function Task({
  title,
  description,
  startDate = "5 June",
  endDate = "20 June",
  status = "todo",
  className,
  children,
}: TaskProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("h-full w-full", className)}
    >
      <Card className="h-full min-h-36 flex-row justify-between border border-border/90 bg-background px-4 py-2 transition-all duration-300 hover:border-white/70 hover:shadow-md">
        {/* Header: Title and Status */}
        <div className="group relative flex h-full w-full flex-col justify-between gap-2 overflow-hidden border-border/50 bg-background/50 backdrop-blur-md transition-all duration-300 hover:border-border hover:shadow-xl dark:bg-transparent">
          <CardContent className="p-0">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <h3 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
                  {status === "done" ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                  ) : (
                    <div className="h-5 w-5 shrink-0 rounded-full border-2 border-muted-foreground/30 transition-colors group-hover:border-primary/50" />
                  )}
                  {title}
                </h3>
                {/*      <p className="line-clamp-2 text-xs font-medium text-muted-foreground">
                {description}
              </p>
              */}
              </div>
            </div>

            {/* Dates */}
            <div className="mt-1 flex items-center gap-3 text-xs font-semibold text-muted-foreground">
              <div className="flex items-center gap-1.5 rounded-md bg-secondary/50 px-2.5 py-1.5 backdrop-blur-sm">
                <Calendar className="h-3.5 w-3.5" />
                <span>Start: {startDate}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-md bg-secondary/50 px-2.5 py-1.5 backdrop-blur-sm">
                <Clock className="h-3.5 w-3.5" />
                <span>End: {endDate}</span>
              </div>
            </div>
          </CardContent>

          {/* Slot for Today's progress and Streak (User provided) */}
          <div className="w-full"></div>
        </div>

        <div className="">
          <Loader />
        </div>
      </Card>
    </motion.div>
  )
}

export function Tasks() {
  return (
    <main className="grid h-full grid-cols-6 grid-rows-3 gap-4 p-4">
      <div className="relative col-span-2 row-span-1 flex flex-col items-center justify-center">
        <div className="absolute h-6 w-14 rounded-full bg-white/60 blur-2xl" />
        <h1 className="text-3xl leading-loose font-extrabold tracking-widest">
          TASKS
        </h1>
      </div>

      <Task
        title="Learn Backpropagation"
        description="Understand the math behind neural network training, why we need it, and how gradients flow backwards. Important part of deep learning foundation."
        startDate="Today"
        endDate="Nov 12"
        className="col-span-4 row-span-1 w-full"
      />

      <div className="col-span-2 row-span-2 h-full w-full">
        <PerformanceCard
          title="Learning Velocity"
          value={82}
          trend="up"
          trendValue="+12% this week"
          color="blue"
          className="h-full bg-background"
        ></PerformanceCard>
      </div>

      <Task
        title="Implement Transformer Architecture"
        description="Build a scaled-down version of Attention is All You Need from scratch using PyTorch."
        startDate="Nov 15"
        endDate="Nov 25"
        status="in-progress"
        className="col-span-4 w-full"
      />

      <Task
        title="Review Linear Algebra"
        description="Brush up on eigenvectors, matrix decomposition, and transformations for better intuition."
        startDate="Nov 26"
        endDate="Nov 30"
        className="col-span-4 w-full"
      />
    </main>
  )
}
