import {
  SkeletonHeader,
  Skeleton,
  SkeletonText,
} from "@/components/admin/Skeleton"

export default function DataQualityLoading() {
  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-200" aria-busy="true">
      <SkeletonHeader hasAction={false} />

      {/* Pending Suggestions Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <Skeleton className="h-5 w-64 rounded-md" />
          <Skeleton className="h-5 w-20 rounded-[10px]" />
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="px-5 py-4 flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-32 rounded" />
                  <Skeleton className="h-4 w-16 rounded-[10px]" />
                </div>
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-3 w-40 rounded-md" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-20 rounded-[8px]" />
                <Skeleton className="h-8 w-16 rounded-[8px]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Anomalies Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <Skeleton className="h-5 w-56 rounded-md" />
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="px-5 py-4 flex items-center justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-44 rounded-md" />
                <Skeleton className="h-3 w-28 rounded-md" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
