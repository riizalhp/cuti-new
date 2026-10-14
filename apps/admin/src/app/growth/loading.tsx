import {
  SkeletonHeader,
  SkeletonStatsGrid,
  SkeletonChart,
  SkeletonForm,
  Skeleton,
} from "@/components/admin/Skeleton"

export default function GrowthLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200" aria-busy="true">
      <SkeletonHeader />
      <SkeletonStatsGrid count={4} columns={4} />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <Skeleton className="h-10 w-44 rounded-xl" />
        <Skeleton className="h-10 w-44 rounded-xl" />
        <Skeleton className="h-10 w-44 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SkeletonForm fields={4} />
        </div>
        <SkeletonChart height="h-80" />
      </div>
    </div>
  )
}
