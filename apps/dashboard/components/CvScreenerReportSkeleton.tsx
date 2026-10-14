'use client';

import React from 'react';

/**
 * CvScreenerReportSkeleton
 * High-fidelity skeleton loading state for CV Screener Evaluation Report:
 * /cv-screener/report and /cv-screener/report/[role]/[name]
 * Complies with Employr Design System: Bento Grid, rounded-[10px], slate palette, WCAG AA.
 */
export function CvScreenerReportSkeleton() {
  return (
    <div
      data-testid="cv-screener-report-skeleton"
      aria-busy="true"
      aria-label="Memuat laporan evaluasi CV ATS"
      className="w-full space-y-6 font-sans animate-pulse motion-reduce:animate-none"
    >
      {/* 1. TOP BAR NAVIGATION SKELETON */}
      <div className="relative overflow-hidden px-3.5 py-2.5 sm:px-4 sm:py-3.5 rounded-[10px] bg-[#162758] border border-[#20367A] shadow-xs flex flex-col gap-2.5 md:gap-3">
        {/* Row 1: Back Action, Title, & Right Utility Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-3">
            <div className="h-8.5 w-28 rounded-[8px] bg-white/10 shrink-0" />
            <div className="h-4 w-px bg-white/20 hidden sm:block" />
            <div className="h-6 w-48 sm:w-64 rounded-[8px] bg-white/15" />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
            <div className="h-8.5 w-32 rounded-[8px] bg-white/10" />
            <div className="h-8.5 w-28 rounded-[8px] bg-white/10" />
            <div className="h-8.5 w-32 rounded-[8px] bg-white/10" />
          </div>
        </div>

        {/* Row 2: Metadata Strip */}
        <div className="pt-2 border-t border-white/15 flex items-center gap-2">
          <div className="h-4 w-72 rounded-[6px] bg-white/10" />
        </div>
      </div>

      {/* 2. TOP AI SUMMARY BANNER SKELETON */}
      <div className="p-6 rounded-[10px] bg-slate-200/80 dark:bg-slate-800/80 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-300/60 dark:border-slate-700/60 pb-2">
          <div className="h-4 w-44 rounded-[6px] bg-slate-300 dark:bg-slate-700" />
          <div className="h-5 w-32 rounded-[10px] bg-slate-300 dark:bg-slate-700" />
        </div>
        <div className="h-4 w-full rounded-[4px] bg-slate-300/70 dark:bg-slate-700/70" />
        <div className="h-4 w-4/5 rounded-[4px] bg-slate-300/70 dark:bg-slate-700/70" />
        <div className="pt-2 space-y-1.5">
          <div className="h-3 w-40 rounded-[4px] bg-slate-300/50 dark:bg-slate-700/50" />
          <div className="h-3 w-2/3 rounded-[4px] bg-slate-300/50 dark:bg-slate-700/50" />
        </div>
      </div>

      {/* 3. OVERALL MASTER SCORE & 5 DIAGNOSTIC DIMENSIONS SKELETON */}
      <div className="p-6 md:p-8 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        {/* Score Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-5 w-32 rounded-[10px] bg-slate-100 dark:bg-slate-800" />
              <div className="h-5 w-24 rounded-[10px] bg-slate-100 dark:bg-slate-800" />
            </div>
            <div className="h-9 w-48 rounded-[8px] bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-72 rounded-[4px] bg-slate-100 dark:bg-slate-800" />
          </div>
          <div className="h-10 w-36 rounded-[10px] bg-slate-100 dark:bg-slate-800 self-start sm:self-auto" />
        </div>

        {/* 5 Dimensions Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2"
            >
              <div className="h-3 w-20 rounded-[4px] bg-slate-200 dark:bg-slate-700" />
              <div className="h-6 w-12 rounded-[6px] bg-slate-300 dark:bg-slate-600" />
              <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>

        {/* Recruiter Verdict Strip */}
        <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
            <div className="space-y-1.5">
              <div className="h-4 w-40 rounded-[4px] bg-slate-200 dark:bg-slate-700" />
              <div className="h-3 w-64 rounded-[4px] bg-slate-100 dark:bg-slate-800" />
            </div>
          </div>
          <div className="h-7 w-28 rounded-[10px] bg-slate-200 dark:bg-slate-700 shrink-0" />
        </div>
      </div>

      {/* 4. SUB-NAVIGATION TABS SKELETON */}
      <div className="p-1.5 rounded-[10px] bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="h-9 rounded-[8px] bg-white dark:bg-slate-700 shadow-xs" />
        <div className="h-9 rounded-[8px] bg-transparent" />
        <div className="h-9 rounded-[8px] bg-transparent" />
        <div className="h-9 rounded-[8px] bg-transparent" />
      </div>

      {/* 5. TAB CONTENT SKELETON (Heatmap / Detail Preview Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Simulated A4 Document Layout */}
        <div className="lg:col-span-7 p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="h-5 w-48 rounded-[6px] bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-24 rounded-[4px] bg-slate-100 dark:bg-slate-800" />
          </div>
          <div className="w-full aspect-[1/1.25] rounded-[8px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 p-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-5 w-44 rounded-[4px] bg-slate-200 dark:bg-slate-700" />
              <div className="h-3 w-60 rounded-[4px] bg-slate-200/80 dark:bg-slate-700/80" />
            </div>
            <div className="space-y-3">
              <div className="h-4 w-32 rounded-[4px] bg-slate-200 dark:bg-slate-700" />
              <div className="h-3 w-full rounded-[4px] bg-slate-200/70 dark:bg-slate-700/70" />
              <div className="h-3 w-11/12 rounded-[4px] bg-slate-200/70 dark:bg-slate-700/70" />
              <div className="h-3 w-4/5 rounded-[4px] bg-slate-200/70 dark:bg-slate-700/70" />
            </div>
            <div className="space-y-3">
              <div className="h-4 w-36 rounded-[4px] bg-slate-200 dark:bg-slate-700" />
              <div className="h-3 w-full rounded-[4px] bg-slate-200/70 dark:bg-slate-700/70" />
              <div className="h-3 w-5/6 rounded-[4px] bg-slate-200/70 dark:bg-slate-700/70" />
            </div>
            <div className="h-10 w-full rounded-[6px] bg-slate-200/50 dark:bg-slate-700/50" />
          </div>
        </div>

        {/* Right Column: Diagnostic Summary Panels */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="h-4 w-36 rounded-[6px] bg-slate-200 dark:bg-slate-700" />
            <div className="h-16 w-full rounded-[8px] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800" />
          </div>

          <div className="p-5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="h-4 w-32 rounded-[6px] bg-slate-200 dark:bg-slate-700" />
            <div className="space-y-2">
              {[1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-[6px] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                >
                  <div className="h-3 w-28 rounded-[4px] bg-slate-200 dark:bg-slate-700" />
                  <div className="h-4 w-12 rounded-[4px] bg-slate-200 dark:bg-slate-700" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
