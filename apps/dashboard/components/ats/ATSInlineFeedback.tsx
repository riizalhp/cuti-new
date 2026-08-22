'use client';

import React from 'react';
import { ATSIssue } from '@/lib/ats-score-types';
import { AlertCircle, CheckCircle2, Sparkles, TrendingUp } from 'lucide-react';

interface ATSInlineFeedbackProps {
  issues?: ATSIssue[];
  suggestedAction?: string;
  hasMetric?: boolean;
}

export const ATSInlineFeedback: React.FC<ATSInlineFeedbackProps> = ({
  issues = [],
  suggestedAction,
  hasMetric,
}) => {
  if (issues.length === 0 && !hasMetric && !suggestedAction) return null;

  const topIssue = issues[0];

  if (topIssue) {
    return (
      <div className="mt-1.5 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between text-[11px] text-amber-900 dark:text-amber-200 animate-in fade-in">
        <div className="flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="font-semibold">{topIssue.message}</span>
        </div>
        <span className="font-extrabold text-[10px] text-amber-700 dark:text-amber-300 shrink-0">
          +{topIssue.potentialGain} pts
        </span>
      </div>
    );
  }

  if (hasMetric) {
    return (
      <div className="mt-1.5 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 animate-in fade-in">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span>Pencapaian terukur terdeteksi (Metric &amp; Action Verb yang kuat).</span>
      </div>
    );
  }

  return null;
};
