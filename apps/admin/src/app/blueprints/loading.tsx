import {
  SkeletonHeader,
  SkeletonStatsGrid,
  SkeletonToolbar,
  SkeletonTable,
} from "@/components/admin/Skeleton"

export default function BlueprintsLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200" aria-busy="true">
      <SkeletonHeader />
      <SkeletonStatsGrid count={3} columns={3} />
      <SkeletonToolbar />
      <SkeletonTable rows={6} columns={7} />
    </div>
  )
}
