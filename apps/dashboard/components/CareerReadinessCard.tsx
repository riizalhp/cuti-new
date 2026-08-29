'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCareerReadiness } from '@/hooks/useCareerReadiness';
import { TrendingUp, CheckCircle2, AlertCircle, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface CareerReadinessCardProps {
  onBoostClick?: () => void;
}

export const CareerReadinessCard: React.FC<CareerReadinessCardProps> = ({
  onBoostClick,
}) => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const { score, checklist, isLoaded, completedCount, totalItems } = useCareerReadiness();

  const totalCount = totalItems || 5;
  const pendingCount = totalCount - completedCount;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[10px] p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full space-y-4 transition-all">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-orange-50 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-100 dark:border-orange-900/50">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Career Readiness
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Tingkat kesiapan berkas &amp; profil
              </p>
            </div>
          </div>

          <div className="text-right flex items-center gap-2">
            <span className="text-xl font-black text-orange-600 dark:text-orange-400 font-mono">
              {isLoaded ? `${score}%` : '...'}
            </span>
          </div>
        </div>

        {/* Score Summary Badge Box */}
        <div className="flex items-center justify-between bg-orange-50/70 dark:bg-orange-950/30 p-3 rounded-[10px] border border-orange-100 dark:border-orange-900/40 my-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Status Berkas: {completedCount}/{totalCount} Komponen Lengkap
            </span>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-[10px] ${
              completedCount === totalCount
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : completedCount >= 3
                ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
            }`}
          >
            {completedCount === totalCount
              ? 'Sangat Siap'
              : completedCount >= 3
              ? 'Siap Melamar'
              : 'Perlu Dilengkapi'}
          </span>
        </div>

        {/* Progress gauge bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden my-3">
          <div
            className="bg-[#1738D1] h-2 rounded-full transition-all duration-500"
            style={{ width: `${score}%` }}
          />
        </div>

        {/* Progressive Disclosure Toggle */}
        <div className="flex items-center justify-between text-xs my-2">
          <span className="text-slate-600 dark:text-slate-400 font-medium">
            {completedCount === totalCount
              ? `${totalCount} komponen lengkap, semua berkas siap`
              : `${completedCount} komponen lengkap, ${pendingCount} perlu diperbaiki`}
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>{isExpanded ? 'Tutup Detail' : 'Lihat Detail'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Expandable Checklist Section */}
        {isExpanded && (
          <div className="space-y-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-200">
            {checklist.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2">
                  {item.status ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {item.label}
                    </span>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                      {item.detail}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-[10px] ${
                    item.status
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {item.status ? 'Lengkap' : 'Perlu Fix'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Primary CTA */}
      <button
        onClick={onBoostClick || (() => router.push('/readiness'))}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-bold text-xs shadow-md shadow-[#1738D1]/20 transition cursor-pointer border-0"
      >
        <Sparkles className="w-3.5 h-3.5 text-white" />
        <span>Tingkatkan Kesiapan Karier</span>
      </button>
    </div>
  );
};
