import {
  SkeletonHeader,
  SkeletonStatsGrid,
  SkeletonToolbar,
  SkeletonTable,
} from "@/components/admin/Skeleton"

export default function LogsLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200" aria-busy="true">
      <SkeletonHeader />
      <SkeletonStatsGrid count={4} columns={4} />
      <SkeletonToolbar />
      <SkeletonTable rows={8} columns={5} />
    </div>
  )
}
