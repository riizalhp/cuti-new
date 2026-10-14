import {
  SkeletonHeader,
  SkeletonStatsGrid,
  SkeletonToolbar,
  SkeletonTable,
  Skeleton,
} from "@/components/admin/Skeleton"

export default function DataScraperLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200" aria-busy="true">
      <SkeletonHeader />
      <SkeletonStatsGrid count={4} columns={4} />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <Skeleton className="h-10 w-36 rounded-xl" />
        <Skeleton className="h-10 w-36 rounded-xl" />
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      <SkeletonToolbar />
      <SkeletonTable rows={6} columns={6} />
    </div>
  )
}
