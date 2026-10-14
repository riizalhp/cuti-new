'use client';

import React from 'react';

/**
 * ProfileViewSkeleton
 * Skeleton loading state for http://localhost:3000/pengaturan
 * Conforms to Employr Design System: Bento Grid, rounded-[10px], navy hero, slate palette.
 */
export function ProfileViewSkeleton() {
  return (
    <div
      data-testid="profile-skeleton"
      aria-busy="true"
      aria-label="Memuat pengaturan profil"
      className="w-full space-y-6 md:space-y-8 font-sans pb-40 sm:pb-32 lg:pb-16 animate-pulse motion-reduce:animate-none"
    >
      {/* 1. HERO PROFILE CARD SKELETON */}
      <div className="relative overflow-hidden rounded-[10px] bg-[#162758] border border-[#20367A] p-5 sm:p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Left: Avatar & Identity Details */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-16 h-16 rounded-[12px] bg-white/20 shrink-0" />
            <div className="space-y-2 min-w-0 flex-1">
              <div className="h-5 sm:h-6 w-44 sm:w-56 bg-white/25 rounded-[6px]" />
              <div className="h-3.5 w-32 sm:w-40 bg-white/15 rounded-[6px]" />
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <div className="h-3 w-36 bg-white/15 rounded-[4px]" />
                <span className="text-white/20 hidden sm:inline">•</span>
                <div className="h-3 w-28 bg-white/15 rounded-[4px] hidden sm:block" />
                <span className="text-white/20 hidden sm:inline">•</span>
                <div className="h-3 w-24 bg-white/15 rounded-[4px] hidden sm:block" />
              </div>
            </div>
          </div>

          {/* Right: Readiness Box & Action Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="p-3 rounded-[10px] bg-white/10 border border-white/15 min-w-[200px] space-y-2">
              <div className="h-3 w-28 bg-white/20 rounded-[4px]" />
              <div className="flex items-center gap-2">
                <div className="h-4 w-10 bg-white/30 rounded-[4px]" />
                <div className="flex-1 h-1.5 bg-white/20 rounded-full" />
              </div>
            </div>
            <div className="h-10 w-10 rounded-[10px] bg-white/20 shrink-0 hidden sm:block" />
          </div>
        </div>
      </div>

      {/* 2. SUB-NAVIGATION TABS SKELETON */}
      <div className="w-full overflow-x-auto no-scrollbar -mx-1 px-1">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 dark:bg-slate-800/60 rounded-[10px] border border-slate-200/80 dark:border-slate-800 max-w-xl">
          <div className="h-8 flex-1 rounded-[8px] bg-white dark:bg-slate-700 shadow-xs" />
          <div className="h-8 flex-1 rounded-[8px] bg-transparent" />
          <div className="h-8 flex-1 rounded-[8px] bg-transparent" />
          <div className="h-8 flex-1 rounded-[8px] bg-transparent" />
        </div>
      </div>

      {/* 3. BENTO GRID CARDS SKELETON */}
      <div className="space-y-6">
        {/* Sub-Card 1: Identitas Diri */}
        <div className="p-4 sm:p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-[6px]" />
            </div>
            <div className="h-8 w-8 rounded-[8px] bg-slate-100 dark:bg-slate-800" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-[8px] bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 space-y-2"
              >
                <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded-[4px]" />
                <div className="h-4 w-36 bg-slate-200/80 dark:bg-slate-700/80 rounded-[4px]" />
              </div>
            ))}
          </div>
        </div>

        {/* Sub-Card 2: Kontak & Domisili */}
        <div className="p-4 sm:p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
              <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded-[6px]" />
            </div>
            <div className="h-8 w-8 rounded-[8px] bg-slate-100 dark:bg-slate-800" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {[1, 2, 3, 4].map((idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-[8px] bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 space-y-2"
              >
                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded-[4px]" />
                <div className="h-4 w-44 bg-slate-200/80 dark:bg-slate-700/80 rounded-[4px]" />
              </div>
            ))}
          </div>
        </div>

        {/* Sub-Card 3: Ringkasan Diri */}
        <div className="p-4 sm:p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
              <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded-[6px]" />
            </div>
            <div className="h-8 w-8 rounded-[8px] bg-slate-100 dark:bg-slate-800" />
          </div>

          <div className="p-4 rounded-[8px] bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 space-y-2.5">
            <div className="h-3.5 w-full bg-slate-200/80 dark:bg-slate-700/80 rounded-[4px]" />
            <div className="h-3.5 w-11/12 bg-slate-200/80 dark:bg-slate-700/80 rounded-[4px]" />
            <div className="h-3.5 w-3/4 bg-slate-200/80 dark:bg-slate-700/80 rounded-[4px]" />
          </div>
        </div>

        {/* Sub-Card 4: Tautan Profesional */}
        <div className="p-4 sm:p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
              <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded-[6px]" />
            </div>
            <div className="h-8 w-8 rounded-[8px] bg-slate-100 dark:bg-slate-800" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {[1, 2, 3, 4].map((idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-[8px] bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between"
              >
                <div className="space-y-1.5">
                  <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded-[4px]" />
                  <div className="h-3.5 w-32 bg-slate-200/80 dark:bg-slate-700/80 rounded-[4px]" />
                </div>
                <div className="w-6 h-6 rounded-[6px] bg-slate-200/60 dark:bg-slate-700/60" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
