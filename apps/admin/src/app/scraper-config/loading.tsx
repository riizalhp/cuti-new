import {
  SkeletonHeader,
  SkeletonStatsGrid,
  SkeletonChart,
  SkeletonTable,
} from "@/components/admin/Skeleton"

export default function ScraperConfigLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200" aria-busy="true">
      <SkeletonHeader />
      <SkeletonStatsGrid count={4} columns={4} />
      <SkeletonChart height="h-64" />
      <SkeletonTable rows={6} columns={7} />
    </div>
  )
}
