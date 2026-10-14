import {
  SkeletonHeader,
  SkeletonStatsGrid,
  SkeletonChart,
  SkeletonToolbar,
  SkeletonTable,
  Skeleton,
} from "@/components/admin/Skeleton"

export default function VisitorsLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200" aria-busy="true">
      <SkeletonHeader />
      <SkeletonStatsGrid count={4} columns={4} />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <Skeleton className="h-10 w-44 rounded-xl" />
        <Skeleton className="h-10 w-44 rounded-xl" />
        <Skeleton className="h-10 w-44 rounded-xl" />
        <Skeleton className="h-10 w-44 rounded-xl" />
      </div>

      <SkeletonChart height="h-72" />
      <SkeletonToolbar />
      <SkeletonTable rows={7} columns={8} />
    </div>
  )
}
