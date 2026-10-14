import {
  SkeletonHeader,
  SkeletonStatsGrid,
  SkeletonChart,
  Skeleton,
} from "@/components/admin/Skeleton"

export default function CVLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200" aria-busy="true">
      <SkeletonHeader />

      {/* 4 Stats Cards */}
      <SkeletonStatsGrid count={4} columns={4} />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <Skeleton className="h-10 w-44 rounded-xl" />
        <Skeleton className="h-10 w-40 rounded-xl" />
        <Skeleton className="h-10 w-44 rounded-xl" />
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SkeletonChart height="h-80" />
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <Skeleton className="h-5 w-36 rounded-md" />
            <Skeleton className="h-3.5 w-48 rounded-md mt-1" />
          </div>
          <div className="space-y-3 pt-2">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between">
                  <Skeleton className="h-3.5 w-24 rounded-md" />
                  <Skeleton className="h-3.5 w-12 rounded-md" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
