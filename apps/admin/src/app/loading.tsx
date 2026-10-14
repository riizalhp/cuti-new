import {
  SkeletonHeader,
  SkeletonStatsGrid,
  SkeletonChart,
  Skeleton,
} from "@/components/admin/Skeleton"

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-200" aria-busy="true">
      {/* Header */}
      <SkeletonHeader />

      {/* 4 Stats Cards */}
      <SkeletonStatsGrid count={4} columns={4} />

      {/* Pipeline Chart */}
      <SkeletonChart height="h-64" />

      {/* Main Grid: Popular Templates & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SkeletonChart height="h-72" />
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <Skeleton className="h-5 w-32 rounded-md" />
            <Skeleton className="h-4 w-16 rounded-md" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-3.5 w-12 rounded-md" />
              </div>
              <Skeleton className="h-3 w-40 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
