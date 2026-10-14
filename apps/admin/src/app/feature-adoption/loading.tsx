import {
  SkeletonHeader,
  SkeletonStatsGrid,
  SkeletonChart,
  Skeleton,
} from "@/components/admin/Skeleton"

export default function FeatureAdoptionLoading() {
  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-200" aria-busy="true">
      <SkeletonHeader hasAction={false} />
      <SkeletonStatsGrid count={3} columns={3} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonChart height="h-72" />
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <Skeleton className="h-5 w-44 rounded-md" />
            <Skeleton className="h-3.5 w-60 rounded-md mt-1" />
          </div>
          <div className="space-y-3 pt-2">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between">
                  <Skeleton className="h-3.5 w-32 rounded-md" />
                  <Skeleton className="h-3.5 w-16 rounded-md" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
