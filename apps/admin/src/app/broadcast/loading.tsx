import {
  SkeletonHeader,
  SkeletonStatsGrid,
  SkeletonToolbar,
  Skeleton,
} from "@/components/admin/Skeleton"

export default function BroadcastLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200" aria-busy="true">
      <SkeletonHeader />
      <SkeletonStatsGrid count={4} columns={4} />
      <SkeletonToolbar />

      {/* Broadcast Cards List */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-20 rounded-md" />
                <Skeleton className="h-5 w-24 rounded-md" />
                <Skeleton className="h-4 w-32 rounded-md ml-auto lg:ml-0" />
              </div>
              <Skeleton className="h-5 w-64 rounded-md" />
              <Skeleton className="h-3.5 w-full max-w-xl rounded-md" />
            </div>
            <div className="flex items-center justify-between lg:justify-end gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
              <div className="space-y-1 text-right">
                <Skeleton className="h-3 w-16 rounded-md ml-auto" />
                <Skeleton className="h-5 w-20 rounded-md ml-auto" />
              </div>
              <Skeleton className="h-9 w-32 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
