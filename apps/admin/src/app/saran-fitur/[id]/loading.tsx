import { Skeleton, SkeletonText } from "@/components/admin/Skeleton"

export default function FeatureRequestDetailLoading() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200" aria-busy="true">
      {/* Back button */}
      <Skeleton className="h-6 w-48 rounded-md" />

      {/* Feature Request Card Skeleton */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-24 rounded-md" />
            <Skeleton className="h-6 w-20 rounded-md" />
          </div>
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
        <Skeleton className="h-7 w-3/4 rounded-lg" />
        <SkeletonText lines={4} />

        {/* User Info Box */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-16 rounded-md" />
              <Skeleton className="h-4 w-28 rounded-md" />
            </div>
          ))}
        </div>
      </div>

      {/* Response and Internal Notes form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <Skeleton className="h-5 w-44 rounded-md pb-3 border-b border-slate-100 dark:border-slate-800" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <div className="flex justify-end gap-2 pt-2">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-36 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
