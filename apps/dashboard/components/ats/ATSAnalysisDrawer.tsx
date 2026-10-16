'use client';

import React from 'react';
import { DynamicATSResult, ATSIssue } from '@/lib/ats-score-types';
import { getScoreProgressBarClass, getScoreTextClass } from '@/lib/score-color';
import {
  X,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  FileCheck,
  ShieldAlert,
  ArrowRight,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useRouter } from 'next/navigation';

interface ATSAnalysisDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  atsResult: DynamicATSResult;
  onFixIssue?: (issue: ATSIssue) => void;
}

export const ATSAnalysisDrawer: React.FC<ATSAnalysisDrawerProps> = ({
  isOpen,
  onClose,
  atsResult,
  onFixIssue,
}) => {
  const router = useRouter();

  const { totalScore, stateLabel, stateDescription, potentialScore, engines, issues, isEmptyOrDefault } =
    atsResult;

  const getSeverityBadge = (severity: ATSIssue['severity']) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded-md text-caption font-extrabold uppercase tracking-wider bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            Critical
          </span>
        );
      case 'major':
        return (
          <span className="px-2 py-0.5 rounded-md text-caption font-extrabold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            Major
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-caption font-extrabold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            Minor
          </span>
        );
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-xl flex flex-col p-0 overflow-hidden">
        {/* Drawer Header */}
        <SheetHeader className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-row items-center justify-between shrink-0 space-y-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cobalt-500/10 text-cobalt-500">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <SheetTitle className="text-base font-black text-slate-900 dark:text-white">
                Dynamic ATS Score Analysis
              </SheetTitle>
              <p className="text-xs text-slate-500">Evaluasi kesehatan & readability CV otomatis</p>
            </div>
          </div>
        </SheetHeader>

        {/* Drawer Body Content */}
        <div className="p-5 space-y-6 overflow-y-auto flex-1">
          {/* Main Score Hero Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-navy-900 to-slate-900 text-white relative overflow-hidden shadow-lg border border-cobalt-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                ATS Health Score
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-cobalt-500 text-white">
                {stateLabel}
              </span>
            </div>

            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-4xl font-black">{totalScore}</span>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">/ 100</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{stateDescription}</p>

            {/* Potential Score Improvement Banner */}
            {potentialScore > totalScore && !isEmptyOrDefault && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
                  <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Potensi Skor Maksimal:</span>
                </div>
                <span className="text-sm font-black text-emerald-400 font-mono">
                  {potentialScore} pts (+{potentialScore - totalScore})
                </span>
              </div>
            )}
          </div>

          {/* 4 Engines Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Analisis 4 Engine ATS
            </h3>

            <div className="space-y-2.5">
              {/* Engine 1: Content Quality */}
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">
                    Content Quality (Bobot 40%)
                  </span>
                  <span className={`font-mono font-black transition-colors ${getScoreTextClass(engines.contentQuality.score)}`}>
                    {engines.contentQuality.score}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getScoreProgressBarClass(engines.contentQuality.score)}`}
                    style={{ width: `${engines.contentQuality.score}%` }}
                  />
                </div>
              </div>

              {/* Engine 2: ATS Readability */}
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">
                    ATS Readability (Bobot 25%)
                  </span>
                  <span className={`font-mono font-black transition-colors ${getScoreTextClass(engines.atsReadability.score)}`}>
                    {engines.atsReadability.score}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getScoreProgressBarClass(engines.atsReadability.score)}`}
                    style={{ width: `${engines.atsReadability.score}%` }}
                  />
                </div>
              </div>

              {/* Engine 3: Completeness */}
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">
                    Completeness (Bobot 20%)
                  </span>
                  <span className={`font-mono font-black transition-colors ${getScoreTextClass(engines.completeness.score)}`}>
                    {engines.completeness.score}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getScoreProgressBarClass(engines.completeness.score)}`}
                    style={{ width: `${engines.completeness.score}%` }}
                  />
                </div>
              </div>

              {/* Engine 4: Content Integrity */}
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">
                    Content Integrity (Bobot 15%)
                  </span>
                  <span className={`font-mono font-black transition-colors ${getScoreTextClass(engines.contentIntegrity.score)}`}>
                    {engines.contentIntegrity.score}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getScoreProgressBarClass(engines.contentIntegrity.score)}`}
                    style={{ width: `${engines.contentIntegrity.score}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actionable Issues List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Rekomendasi Perbaikan ({issues.length})
              </h3>
            </div>

            {issues.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-700 mx-auto dark:text-emerald-400" />
                <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  CV kamu sangat sempurna!
                </p>
                <p className="text-caption text-emerald-700 dark:text-emerald-400">
                  Tidak ada isu kritis atau rekomendasi tersisa.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {issues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/60 shadow-xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white leading-snug">
                        {issue.message}
                      </p>
                      {getSeverityBadge(issue.severity)}
                    </div>

                    <p className="text-caption text-slate-600 dark:text-slate-300 leading-relaxed">
                      {issue.recommendation}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/60">
                      <span className="text-caption font-bold text-emerald-700 dark:text-emerald-400">
                        +{issue.potentialGain} Poin ATS
                      </span>

                      {onFixIssue && (
                        <button
                          onClick={() => onFixIssue(issue)}
                          className="text-caption font-extrabold text-cobalt-500 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Perbaiki Sekarang</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Job Match CTA Divider & Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 border border-orange-500/20 space-y-2.5">
            <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400 font-extrabold text-xs">
              <Target className="w-4 h-4 shrink-0" />
              <span>Ingin Cek Kecocokan ke Lowongan Spesifik?</span>
            </div>

            <p className="text-caption text-slate-600 dark:text-slate-300 leading-relaxed">
              ATS Score mengevaluasi kualitas standar CV. Gunakan fitur Job Match untuk membandingkan CV kamu dengan Job Description spesifik.
            </p>

            <Button
              onClick={() => {
                onClose();
                router.push('/match-cv');
              }}
              className="w-full py-2.5 h-auto rounded-lg bg-orange-700 hover:bg-orange-700 text-white font-extrabold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>Uji Job Match CV Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
