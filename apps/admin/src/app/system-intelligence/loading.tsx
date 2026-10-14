import {
  SkeletonHeader,
  SkeletonStatsGrid,
  SkeletonChart,
  SkeletonTable,
} from "@/components/admin/Skeleton"

export default function SystemIntelligenceLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200" aria-busy="true">
      <SkeletonHeader hasAction={false} />
      <SkeletonStatsGrid count={4} columns={4} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonChart height="h-72" />
        <SkeletonChart height="h-72" />
      </div>

      <SkeletonTable rows={5} columns={5} />
    </div>
  )
}
