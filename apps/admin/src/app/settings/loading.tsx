import {
  SkeletonHeader,
  SkeletonForm,
} from "@/components/admin/Skeleton"

export default function SettingsLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200" aria-busy="true">
      <SkeletonHeader />
      <SkeletonForm fields={3} />
      <SkeletonForm fields={2} />
      <SkeletonForm fields={2} />
    </div>
  )
}
