import React from 'react';

export default function LoadingCvDetail() {
  return (
    <div className="cv-print-area-wrapper flex flex-col space-y-4 w-full no-print">
      {/* Control Toolbar Skeleton */}
      <div className="w-full bg-white dark:bg-slate-900 p-3.5 rounded-[10px] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-2xs animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-[10px]" />
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
          <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-7 w-20 bg-slate-200 dark:bg-slate-800 rounded-[10px]" />
          <div className="h-7 w-28 bg-slate-200 dark:bg-slate-800 rounded-[10px]" />
        </div>
      </div>

      {/* Main Split Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Canvas Preview Skeleton */}
        <div className="lg:col-span-7 xl:col-span-7 w-full overflow-hidden flex flex-col items-center bg-slate-200/60 dark:bg-slate-950/80 p-4 md:p-6 rounded-[10px] border border-slate-300/60 dark:border-slate-800 h-fit min-h-fit">
          <div className="w-[210mm] max-w-full aspect-[210/297] min-h-[750px] bg-white dark:bg-slate-900 rounded-[10px] shadow-sm p-8 space-y-5 animate-pulse">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-5">
              <div className="space-y-2">
                <div className="h-7 w-56 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-4 w-36 bg-slate-100 dark:bg-slate-800/60 rounded" />
              </div>
              <div className="w-16 h-20 bg-slate-100 dark:bg-slate-800/60 rounded-[6px]" />
            </div>
            <div className="space-y-2 pt-2">
              <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800/60 rounded" />
              <div className="h-3.5 w-4/5 bg-slate-100 dark:bg-slate-800/60 rounded" />
            </div>
            <div className="space-y-3 pt-4">
              <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-16 w-full bg-slate-50 dark:bg-slate-800/40 rounded-[8px] p-3 space-y-2">
                <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-3 w-1/2 bg-slate-100 dark:bg-slate-800/60 rounded" />
              </div>
              <div className="h-16 w-full bg-slate-50 dark:bg-slate-800/40 rounded-[8px] p-3 space-y-2">
                <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-3 w-1/3 bg-slate-100 dark:bg-slate-800/60 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Editor Form Skeleton */}
        <div className="lg:col-span-5 xl:col-span-5 w-full flex flex-col space-y-3">
          <div className="p-1.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 h-10 animate-pulse" />
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5 space-y-4 shadow-2xs animate-pulse">
            <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="space-y-3">
              <div className="h-9 w-full bg-slate-100 dark:bg-slate-800/60 rounded-[8px]" />
              <div className="h-9 w-full bg-slate-100 dark:bg-slate-800/60 rounded-[8px]" />
              <div className="h-20 w-full bg-slate-100 dark:bg-slate-800/60 rounded-[8px]" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5 space-y-3 shadow-2xs animate-pulse">
            <div className="h-5 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-12 w-full bg-slate-100 dark:bg-slate-800/60 rounded-[8px]" />
            <div className="h-12 w-full bg-slate-100 dark:bg-slate-800/60 rounded-[8px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
