'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { CompetencyScoreResult } from '@/lib/career-intelligence-engine';
import { X, CheckCircle2, AlertCircle, FileText, ArrowRight, ShieldCheck, Sparkles, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EvidenceSlideOverProps {
  isOpen: boolean;
  competency: CompetencyScoreResult | null;
  onClose: () => void;
  targetRoleTitle: string;
}

export const EvidenceSlideOver: React.FC<EvidenceSlideOverProps> = ({
  isOpen,
  competency,
  onClose,
  targetRoleTitle,
}) => {
  // Tutup dengan tombol Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !competency) return null;

  const isQualified = competency.currentScore >= competency.requiredScore;
  const gapDiff = competency.currentScore - competency.requiredScore;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end transition-opacity"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="evidence-slideover-title"
    >
      <div
        className="relative z-10 w-full max-w-md sm:max-w-lg h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Drawer */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 shrink-0">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Bukti & Evaluasi Kompetensi
            </div>
            <h2 id="evidence-slideover-title" className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {competency.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1738D1]"
            aria-label="Tutup panel bukti"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Drawer (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Nilai dan Status Header Box */}
          <div className="p-4 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400">Skor Saat Ini</span>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {competency.currentScore}
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 ml-1">/ 100</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 dark:text-slate-400">Standar {targetRoleTitle}</span>
                <div className="text-2xl font-extrabold text-[#1738D1] dark:text-blue-400">
                  {competency.requiredScore}
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 ml-1">/ 100</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden relative">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-300',
                  isQualified ? 'bg-emerald-500' : 'bg-[#1738D1]'
                )}
                style={{ width: `${Math.min(100, competency.currentScore)}%` }}
              />
            </div>

            {/* Meta Tags: Status & Confidence */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 dark:text-slate-400">Tingkat Bukti:</span>
                <span
                  className={cn(
                    'px-2.5 py-0.5 rounded-[10px] text-[10.5px] font-bold border',
                    competency.confidence === 'Tinggi'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : competency.confidence === 'Sedang'
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  )}
                >
                  Keyakinan {competency.confidence}
                </span>
              </div>

              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {isQualified ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Memenuhi Standar (+{gapDiff})
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Defisit {Math.abs(gapDiff)} Poin
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section 1: Bukti Pendukung dari CV & Profil */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#1738D1] dark:text-blue-400" />
                Bukti Pendukung dari Profil Anda
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {competency.evidence.length} Sumber Bukti
              </span>
            </div>

            {competency.evidence.length > 0 ? (
              <div className="space-y-2.5">
                {competency.evidence.map((item, idx) => (
                  <div
                    key={`ev-${idx}`}
                    className="p-3.5 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 shadow-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {item.title}
                      </h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {item.source === 'cv_experience'
                          ? 'Pengalaman Kerja'
                          : item.source === 'cv_project'
                          ? 'Proyek CV'
                          : item.source === 'cv_skill'
                          ? 'Daftar Skill'
                          : item.source === 'cv_education'
                          ? 'Pendidikan'
                          : 'Profil Akun'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-[10px] border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20 text-center space-y-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Belum ditemukan kata kunci atau dokumen kerja spesifik untuk kompetensi ini pada CV Anda.
                </p>
                <Link
                  href="/cv"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#1738D1] dark:text-blue-400 hover:underline"
                >
                  Tambahkan ke CV Sekarang <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Section 2: Mengapa Kompetensi Ini Penting */}
          <div className="p-4 rounded-[10px] bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 space-y-1.5">
            <h4 className="text-xs font-bold text-[#1738D1] dark:text-blue-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Mengapa Kompetensi Ini Penting?
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {competency.whyItMatters}
            </p>
          </div>

          {/* Section 3: Rekomendasi Langkah Konkret */}
          <div className="p-4 rounded-[10px] bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 space-y-1.5">
            <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Langkah yang Disarankan
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {competency.suggestedAction}
            </p>
          </div>
        </div>

        {/* Sticky Footer Action */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-end gap-2.5 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
          >
            Tutup
          </button>
          <Link
            href="/cv"
            className="px-4 py-2.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-bold text-xs shadow-md shadow-[#1738D1]/20 active:scale-[0.98] transition flex items-center gap-1.5 cursor-pointer"
          >
            Sesuaikan CV <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
