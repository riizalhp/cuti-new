import { Skeleton, SkeletonText } from "@/components/admin/Skeleton"

export default function CMSEditorLoading() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200" aria-busy="true">
      {/* Top action bar */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-7 w-48 rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
      </div>

      {/* Editor Main Content */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        {/* Title input skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-28 rounded-md" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>

        {/* Form fields 2-column */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>

        {/* Rich Text Editor Mockup */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 rounded-md" />
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-7 rounded-lg" />
              ))}
            </div>
            <SkeletonText lines={6} />
          </div>
        </div>
      </div>
    </div>
  )
}
