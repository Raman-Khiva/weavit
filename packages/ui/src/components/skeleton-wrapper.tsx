"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { cn } from "@workspace/ui/lib/utils";

interface SkeletonWrapperProps {
  children: React.ReactNode;
  skeleton: React.ReactNode;
  delay?: number;
}

export function SkeletonWrapper({ children, skeleton, delay = 2000 }: SkeletonWrapperProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div>
      {!showContent ? skeleton : children}
    </div>
  );
}

// ============================================================================
// Page-specific Skeleton Components
// ============================================================================

export function HabitsPageSkeleton() {
  return (
    <div className="min-h-full bg-background px-6 py-5 text-foreground md:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-4 flex items-center justify-end gap-3">
          <Skeleton className="h-8 w-48 rounded-full" />
        </div>

        <Skeleton className="rounded-2xl border border-border bg-card p-6 mb-5" />
        <Skeleton className="h-8 w-3/4 rounded-md bg-muted mb-2" />
        <Skeleton className="h-12 w-1/2 rounded-md bg-muted mb-2" />
        <Skeleton className="h-4 w-2/3 rounded-md bg-muted mb-5" />
        <Skeleton className="h-4 w-full rounded-full bg-muted mb-3" />
        <Skeleton className="h-3 w-1/4 rounded-md bg-muted mb-2" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="rounded-xl border border-border bg-card p-4 h-48" />
          ))}
        </div>

        <Skeleton className="h-4 w-1/4 rounded-md bg-muted mb-2 mt-7" />
        <Skeleton className="h-4 w-1/2 rounded-md bg-muted mb-4" />
        <Skeleton className="rounded-2xl border border-border bg-card p-5 h-48 mb-6" />

        <Skeleton className="h-4 w-1/4 rounded-md bg-muted mb-3 mt-7" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="rounded-xl border border-border bg-card p-3 h-32" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TodosPageSkeleton() {
  return (
    <div className="flex min-h-full w-full flex-col items-center gap-10 px-16 py-15">
      <Skeleton className="w-full h-12 border-b mb-6" />
      <Skeleton className="w-full h-64" />
    </div>
  );
}

export function ProjectsPageSkeleton() {
  return (
    <div className="flex h-full w-full flex-col gap-8 p-6 md:p-10 max-w-7xl mx-auto">
      <Skeleton className="h-20 w-3/4" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="flex items-center gap-2 w-full h-14 rounded-2xl border border-border/80 bg-card/60 p-4 shadow-sm" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="rounded-2xl border border-border bg-card p-4 h-64" />
        ))}
      </div>
    </div>
  );
}

export function DeadlinesPageSkeleton() {
  return (
    <div className="flex h-full w-full flex-col gap-8 px-16 py-8">
      <Skeleton className="h-12 w-1/4 border-b" />
      <Skeleton className="h-96 w-full rounded-xl border border-border bg-card p-4" />
    </div>
  );
}

export function TimelinePageSkeleton() {
  return (
    <div className="flex h-full w-full flex-col px-10 py-12">
      <Skeleton className="h-96 w-full rounded-xl border border-border bg-card p-4" />
    </div>
  );
}

export function DraftsPageSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Skeleton className="h-12 w-1/4" />
    </div>
  );
}

export function HabitDetailPageSkeleton() {
  return (
    <main className="flex min-h-full w-full flex-col gap-10 px-10 py-16 xl:flex-row xl:justify-between">
      <div className="flex w-full flex-col gap-12 xl:max-w-[70%]">
        <Skeleton className="h-14 w-1/2 border-b" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="flex items-center gap-4" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="rounded-2xl border border-border bg-card p-4 h-24 min-h-10 flex-col justify-between gap-0" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
      <div className="flex w-full flex-col xl:max-w-[30%] xl:items-end">
        <Skeleton className="h-64 w-full" />
      </div>
    </main>
  );
}

export function ProjectDetailPageSkeleton() {
  return (
    <main className="flex h-full w-full flex-col gap-8 px-6 py-8 md:px-12 md:py-10 max-w-7xl mx-auto">
      <Skeleton className="h-10 w-1/4" />
      <Skeleton className="h-12 w-full rounded-xl border border-border bg-card p-4" />
      <Skeleton className="h-96 w-full" />
    </main>
  );
}