'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCareerReadiness } from '@/hooks/useCareerReadiness';
import {
  TrendingUpIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  AlertTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@/components/icons/CustomIcons';
import { getScoreColorTokens } from '@/lib/score-color';
import { getStatusFromScore } from '@/lib/readiness';

interface CareerReadinessCardProps {
  onBoostClick?: () => void;
}

export const CareerReadinessCard: React.FC<CareerReadinessCardProps> = ({
  onBoostClick,
}) => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const { score, checklist, isLoaded, completedCount, totalItems } = useCareerReadiness();

  const totalCount = totalItems || 4;
  const pendingCount = Math.max(0, totalCount - completedCount);
  const scoreTokens = getScoreColorTokens(score, !isLoaded || score === 0);
  const statusLabel = getStatusFromScore(score);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[10px] p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between h-full space-y-3 transition-all">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-2">
            <div className={`w-7 h-7 rounded-[8px] flex items-center justify-center border transition-colors shrink-0 mt-0.5 ${scoreTokens.iconWrapper}`}>
              <TrendingUpIcon size={14} />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                Career Readiness
              </h3>
              <p className="text-caption text-slate-500 dark:text-slate-400">
                Tingkat kesiapan berkas &amp; profil kerja
              </p>
            </div>
          </div>

          <div className="text-right flex items-center gap-2">
            <span className={`text-lg font-black font-mono transition-colors ${scoreTokens.text}`}>
              {isLoaded ? `${score}%` : '...'}
            </span>
          </div>
        </div>

        {/* Score Summary Badge Box */}
        <div className={`flex items-center justify-between p-2 sm:p-2.5 rounded-[8px] border my-2.5 transition-colors ${scoreTokens.bgBox} ${scoreTokens.border}`}>
          <div className="flex items-center gap-2">
            {scoreTokens.tier === 'good' && (
              <CheckCircleIcon size={16} className="text-emerald-700 dark:text-emerald-400 shrink-0" />
            )}
            {scoreTokens.tier === 'medium' && (
              <AlertTriangleIcon size={16} className="text-amber-700 dark:text-amber-400 shrink-0" />
            )}
            {scoreTokens.tier === 'low' && (
              <AlertCircleIcon size={16} className="text-rose-700 dark:text-rose-400 shrink-0" />
            )}
            {scoreTokens.tier === 'empty' && (
              <TrendingUpIcon size={16} className="text-slate-500 dark:text-slate-500 shrink-0" />
            )}
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Status: {completedCount}/{totalCount} Pilar Memenuhi Standar
            </span>
          </div>
          <span
            className={`text-caption font-bold px-2 py-0.5 rounded-[10px] border transition-colors ${scoreTokens.badge}`}
          >
            {statusLabel}
          </span>
        </div>

        {/* Progress gauge bar */}
        <div
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Tingkat Kesiapan Karier"
          className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden my-3"
        >
          <div
            className={`h-2 rounded-full transition-all duration-500 ${scoreTokens.bar}`}
            style={{ width: `${score}%` }}
          />
        </div>

        {/* Progressive Disclosure Toggle */}
        <div className="flex items-center justify-between text-xs my-2">
          <span className="text-slate-600 dark:text-slate-400 font-medium">
            {completedCount === totalCount
              ? `${totalCount} pilar memenuhi standar, berkas siap dikirim`
              : `${completedCount} pilar siap, ${pendingCount} pilar perlu dioptimalkan`}
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-controls="career-readiness-checklist"
            className={`font-bold hover:underline flex items-center gap-0.5 cursor-pointer transition-colors px-2 py-1 min-h-[30px] hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-[6px] ${scoreTokens.text}`}
          >
            <span>{isExpanded ? 'Tutup Detail' : 'Lihat Detail'}</span>
            {isExpanded ? <ChevronUpIcon size={14} /> : <ChevronDownIcon size={14} />}
          </button>
        </div>

        {/* Expandable Checklist Section */}
        {isExpanded && (
          <div id="career-readiness-checklist" className="space-y-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-200">
            <div className="p-2.5 rounded-[8px] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-caption text-slate-500 dark:text-slate-400 leading-relaxed">
              Kesiapan dinilai dari <strong>4 pilar utama</strong>: Kualitas Berkas &amp; Skor ATS, Spesifikasi &amp; Relevansi Peran, Administrasi &amp; Kredensial, serta Momentum Pelamaran di Tracker.
            </div>

            {checklist.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2">
                  {item.status ? (
                    <CheckCircleIcon size={16} className="text-emerald-700 shrink-0 dark:text-emerald-400" />
                  ) : (
                    <AlertCircleIcon size={16} className="text-amber-700 shrink-0 dark:text-amber-400" />
                  )}
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {item.label}
                    </span>
                    <span className="block text-caption text-slate-500 dark:text-slate-400">
                      {item.detail}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-caption font-bold px-2 py-0.5 rounded-[10px] shrink-0 ml-2 ${
                    item.status
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {item.status ? 'Optimal' : 'Perlu Optimasi'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Primary CTA */}
      <button
        onClick={onBoostClick || (() => router.push('/readiness'))}
        className="w-full flex items-center justify-center py-2.5 px-4 rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 active:scale-[0.98] text-white font-bold text-xs shadow-xs transition cursor-pointer border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
      >
        <span>Lihat Analisis Lengkap</span>
      </button>
    </div>
  );
};
