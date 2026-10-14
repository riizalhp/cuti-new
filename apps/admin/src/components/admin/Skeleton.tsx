import React from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-slate-200/80 dark:bg-slate-800/80",
        className
      )}
      aria-hidden="true"
      {...props}
    />
  )
}

export function SkeletonText({
  lines = 1,
  className,
  lastLineWidth = "60%",
}: {
  lines?: number
  className?: string
  lastLineWidth?: string
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton
          key={idx}
          className="h-3.5 w-full rounded-md"
          style={
            idx === lines - 1 && lines > 1
              ? { width: lastLineWidth }
              : undefined
          }
        />
      ))}
    </div>
  )
}

export function SkeletonHeader({
  hasAction = true,
  hasSubheading = true,
  className,
}: {
  hasAction?: boolean
  hasSubheading?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5",
        className
      )}
    >
      <div className="flex items-center gap-3.5">
        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-56 sm:w-72 rounded-lg" />
          {hasSubheading && <Skeleton className="h-4 w-72 sm:w-96 rounded-md" />}
        </div>
      </div>
      {hasAction && (
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
      )}
    </div>
  )
}

export function SkeletonStatsGrid({
  count = 4,
  columns = 4,
  className,
}: {
  count?: number
  columns?: 2 | 3 | 4 | 5
  className?: string
}) {
  const colClass =
    columns === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : columns === 3
      ? "grid-cols-1 sm:grid-cols-3"
      : columns === 5
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"

  return (
    <div className={cn("grid gap-4 sm:gap-5 mb-8", colClass, className)}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
          </div>
          <div className="space-y-2 mt-1">
            <Skeleton className="h-8 w-36 rounded-lg" />
            <Skeleton className="h-3.5 w-24 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonToolbar({
  hasFilter = true,
  className,
}: {
  hasFilter?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-6 shadow-sm",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Skeleton className="h-10 w-full flex-1 rounded-xl" />
        {hasFilter && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        )}
      </div>
    </div>
  )
}

export function SkeletonTable({
  rows = 6,
  columns = 5,
  hasHeader = true,
  className,
}: {
  rows?: number
  columns?: number
  hasHeader?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {hasHeader && (
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
                {Array.from({ length: columns }).map((_, cIdx) => (
                  <th key={cIdx} className="px-6 py-4">
                    <Skeleton className="h-3.5 w-20 rounded-md" />
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {Array.from({ length: rows }).map((_, rIdx) => (
              <tr key={rIdx}>
                {Array.from({ length: columns }).map((_, cIdx) => (
                  <td key={cIdx} className="px-6 py-4">
                    {cIdx === 0 ? (
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                        <div className="space-y-1.5 flex-1">
                          <Skeleton className="h-4 w-32 rounded-md" />
                          <Skeleton className="h-3 w-20 rounded-md" />
                        </div>
                      </div>
                    ) : cIdx === columns - 1 ? (
                      <div className="flex items-center justify-end gap-2">
                        <Skeleton className="h-8 w-16 rounded-lg" />
                      </div>
                    ) : (
                      <Skeleton
                        className="h-4 rounded-md"
                        style={{ width: `${Math.floor(40 + (cIdx * 15) % 45)}%` }}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function SkeletonChart({
  height = "h-72",
  title = true,
  className,
}: {
  height?: string
  title?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between",
        className
      )}
    >
      {title && (
        <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-48 rounded-md" />
            <Skeleton className="h-3.5 w-64 rounded-md" />
          </div>
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
      )}
      <div className={cn("w-full flex items-end gap-3 pt-4 px-2", height)}>
        {Array.from({ length: 12 }).map((_, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
            <Skeleton
              className="w-full rounded-t-lg"
              style={{
                height: `${Math.max(18, Math.floor(((idx * 27 + 35) % 85) + 15))}%`,
              }}
            />
            <Skeleton className="h-3 w-6 rounded-xs" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonCardsGrid({
  count = 6,
  columns = 3,
  className,
}: {
  count?: number
  columns?: 2 | 3 | 4
  className?: string
}) {
  const colClass =
    columns === 2
      ? "grid-cols-1 md:grid-cols-2"
      : columns === 4
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

  return (
    <div className={cn("grid gap-5", colClass, className)}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-3/4 rounded-md" />
              <Skeleton className="h-3.5 w-1/2 rounded-md" />
            </div>
            <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
          </div>
          <SkeletonText lines={2} />
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonForm({
  fields = 4,
  className,
}: {
  fields?: number
  className?: string
}) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6",
        className
      )}
    >
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-5 w-44 rounded-md" />
          <Skeleton className="h-3.5 w-64 rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {Array.from({ length: fields }).map((_, idx) => (
          <div key={idx} className="space-y-2">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
        <Skeleton className="h-10 w-24 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
    </div>
  )
}
