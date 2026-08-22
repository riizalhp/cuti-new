'use client';

import React from 'react';
import { DynamicATSResult } from '@/lib/ats-score-types';
import { AlertCircle, CheckCircle2, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react';

interface ATSScoreBadgeProps {
  atsResult: DynamicATSResult;
  onClick?: () => void;
}

export const ATSScoreBadge: React.FC<ATSScoreBadgeProps> = ({ atsResult, onClick }) => {
  const { totalScore, stateLabel, state, issues, potentialScore, isEmptyOrDefault } = atsResult;

  const getScoreColor = () => {
    if (isEmptyOrDefault || totalScore === 0) return 'text-slate-400 border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700';
    if (totalScore >= 90) return 'text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300';
    if (totalScore >= 75) return 'text-blue-600 border-blue-300 bg-blue-50 dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-300';
    if (totalScore >= 60) return 'text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-300';
    return 'text-rose-600 border-rose-300 bg-rose-50 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-300';
  };

  const getProgressColor = () => {
    if (totalScore >= 90) return 'bg-emerald-500';
    if (totalScore >= 75) return 'bg-[#1738D1]';
    if (totalScore >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <button
      onClick={onClick}
      className={`group relative flex items-center gap-3 p-2 px-3.5 rounded-xl border transition-all cursor-pointer shadow-xs hover:shadow-md ${getScoreColor()}`}
      title="Klik untuk melihat Analisis Detail ATS Score"
    >
      {/* Score Number Gauge */}
      <div className="flex items-baseline gap-1 font-mono">
        <span className="text-lg font-black tracking-tight">{totalScore}</span>
        <span className="text-[10px] font-bold opacity-60">/100</span>
      </div>

      {/* State & Label */}
      <div className="hidden sm:flex flex-col text-left">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-extrabold">{stateLabel}</span>
          {issues.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
              {issues.length} opsi optimasi
            </span>
          )}
        </div>
        {/* Progress Bar */}
        <div className="w-24 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden mt-1">
          <div
            className={`h-full transition-all duration-500 rounded-full ${getProgressColor()}`}
            style={{ width: `${totalScore}%` }}
          />
        </div>
      </div>

      {/* Potential Score Gain Chip */}
      {potentialScore > totalScore && !isEmptyOrDefault && (
        <div className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-500/20">
          <TrendingUp className="w-3 h-3" />
          <span>Potensi: {potentialScore}</span>
        </div>
      )}

      {/* View Details Icon */}
      <div className="p-1 rounded-lg bg-black/5 dark:bg-white/5 group-hover:scale-110 transition">
        <Sparkles className="w-3.5 h-3.5" />
      </div>
    </button>
  );
};
