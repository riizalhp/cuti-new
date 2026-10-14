import {
  SkeletonHeader,
  SkeletonToolbar,
  SkeletonTable,
} from "@/components/admin/Skeleton"

export default function UsersLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200" aria-busy="true">
      <SkeletonHeader />
      <SkeletonToolbar />
      <SkeletonTable rows={7} columns={5} />
    </div>
  )
}
