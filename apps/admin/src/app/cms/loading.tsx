import {
  SkeletonHeader,
  SkeletonToolbar,
  SkeletonTable,
  Skeleton,
} from "@/components/admin/Skeleton"

export default function CMSLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200" aria-busy="true">
      <SkeletonHeader />

      {/* 5 Tab Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="w-8 h-8 rounded-xl" />
              <Skeleton className="h-4 w-8 rounded-md" />
            </div>
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-3 w-28 rounded-md" />
          </div>
        ))}
      </div>

      <SkeletonToolbar />
      <SkeletonTable rows={6} columns={5} />
    </div>
  )
}
