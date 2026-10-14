import {
  SkeletonHeader,
  SkeletonStatsGrid,
  SkeletonCardsGrid,
} from "@/components/admin/Skeleton"

export default function CampaignsLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200" aria-busy="true">
      <SkeletonHeader />
      <SkeletonStatsGrid count={3} columns={3} />
      <SkeletonCardsGrid count={4} columns={2} />
    </div>
  )
}
