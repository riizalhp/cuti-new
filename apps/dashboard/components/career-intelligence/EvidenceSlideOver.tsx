'use client';

import React from 'react';
import Link from 'next/link';
import { CompetencyScoreResult } from '@/lib/career-intelligence-engine';
import { CheckCircle2, AlertCircle, FileText, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button, buttonVariants } from '@/components/ui/button';

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
  const isQualified = competency ? competency.currentScore >= competency.requiredScore : false;
  const gapDiff = competency ? competency.currentScore - competency.requiredScore : 0;

  return (
    <Sheet open={isOpen && !!competency} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full max-w-md sm:max-w-xl p-0 flex flex-col justify-between overflow-hidden">
        {competency && (
          <>
            {/* Header Drawer */}
            <SheetHeader className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 shrink-0 space-y-0">
              <div className="text-caption font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Bukti & Evaluasi Kompetensi
              </div>
              <SheetTitle className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {competency.name}
              </SheetTitle>
              <SheetDescription className="sr-only">
                Rincian bukti dan evaluasi kompetensi {competency.name} untuk posisi {targetRoleTitle}
              </SheetDescription>
            </SheetHeader>

            {/* Body Drawer (Scrollable) */}
            <SheetBody className="p-5 space-y-6 flex-1">
              {/* Nilai dan Status Header Box */}
              <div className="p-4 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Skor Saat Ini</span>
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {competency.currentScore}
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-500 ml-1">/ 100</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Standar {targetRoleTitle}</span>
                    <div className="text-2xl font-extrabold text-cobalt-500 dark:text-blue-400">
                      {competency.requiredScore}
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-500 ml-1">/ 100</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden relative">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-300',
                      isQualified ? 'bg-emerald-500' : 'bg-cobalt-500'
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
                        'px-2.5 py-0.5 rounded-[10px] text-caption font-bold border',
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
                      <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Memenuhi Standar (+{gapDiff})
                      </span>
                    ) : (
                      <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1">
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
                    <FileText className="w-4 h-4 text-cobalt-500 dark:text-blue-400" />
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
                          <span className="text-caption font-bold uppercase tracking-wider px-2 py-0.5 rounded-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
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
                      className="inline-flex items-center gap-1 text-xs font-bold text-cobalt-500 dark:text-blue-400 hover:underline"
                    >
                      Tambahkan ke CV Sekarang <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Section 2: Mengapa Kompetensi Ini Penting */}
              <div className="p-4 rounded-[10px] bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 space-y-1.5">
                <h4 className="text-xs font-bold text-cobalt-500 dark:text-blue-400 flex items-center gap-1.5">
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
            </SheetBody>

            {/* Sticky Footer Action */}
            <SheetFooter className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex sm:flex-row items-center justify-end gap-2.5 shrink-0">
              <Button variant="ghost" size="md" onClick={onClose}>
                Tutup
              </Button>
              <Link
                href="/cv"
                className={cn(buttonVariants({ variant: 'primary', size: 'md' }), 'flex items-center gap-1.5')}
              >
                <span>Sesuaikan CV</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
