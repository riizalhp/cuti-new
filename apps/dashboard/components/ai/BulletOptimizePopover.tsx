'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Target,
  FileCheck,
  AlignLeft,
  CheckCircle2,
  X,
  ArrowRight,
} from 'lucide-react';

export interface BulletOptimizePopoverProps {
  isOpen: boolean;
  onClose: () => void;
  bulletText: string;
  onApplyRewrite: (newText: string, feedbackMsg: string) => void;
}

export const BulletOptimizePopover: React.FC<BulletOptimizePopoverProps> = ({
  isOpen,
  onClose,
  bulletText,
  onApplyRewrite,
}) => {
  const [selectedGoal, setSelectedGoal] = useState<'impact' | 'ats' | 'metrics' | 'concise' | 'grammar'>('impact');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleRewrite = () => {
    setIsLoading(true);
    setTimeout(() => {
      let result = bulletText;
      let feedback = 'Bullet berhasil dioptimalkan.';

      if (selectedGoal === 'impact') {
        result = `Meningkatkan efisiensi tim sebesar 35% dengan mengeksekusi ${bulletText.toLowerCase().replace(/^(membuat|mengelola|melakukan)\s*/, '')}.`;
        feedback = 'Ditambahkan: hasil terukur & kata kerja berorientasi dampak.';
      } else if (selectedGoal === 'ats') {
        result = `Mengoptimalkan ${bulletText.toLowerCase()} menggunakan metodologi standar industri dan pelaporan ATS.`;
        feedback = 'Ditambahkan: kata kunci & terminologi standar ATS.';
      } else if (selectedGoal === 'metrics') {
        result = `${bulletText} dan berhasil menghemat 20+ jam kerja per bulan.`;
        feedback = 'Ditambahkan: metrik kuantitatif terukur.';
      } else if (selectedGoal === 'concise') {
        result = bulletText.split(',')[0].replace(/yang sangat|secara berkesinambungan/g, '');
        feedback = 'Diringkas: kalimat lebih tajam & tanpa kata mubazir.';
      } else {
        result = bulletText.charAt(0).toUpperCase() + bulletText.slice(1);
        feedback = 'Diperbaiki: tata bahasa & ejaan Bahasa Indonesia resmi.';
      }

      setIsLoading(false);
      onApplyRewrite(result, feedback);
      onClose();
    }, 1000);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden cursor-default space-y-4 p-5 animate-in zoom-in-95"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-extrabold text-xs">
            <Sparkles className="w-4 h-4 fill-purple-600" />
            <span>Optimalkan Bullet</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Selected Bullet Preview */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 italic truncate">
          "{bulletText || 'Poin pengalaman yang dipilih'}"
        </div>

        {/* Option Choices */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Pilih Target Perbaikan
          </label>

          <div className="grid grid-cols-1 gap-1.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => setSelectedGoal('impact')}
              className={`p-2.5 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                selectedGoal === 'impact'
                  ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-700 dark:text-purple-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-500" />
                <span>Lebih Berdampak (Impact)</span>
              </span>
              {selectedGoal === 'impact' && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
            </button>

            <button
              type="button"
              onClick={() => setSelectedGoal('ats')}
              className={`p-2.5 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                selectedGoal === 'ats'
                  ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-700 dark:text-purple-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-purple-500" />
                <span>Lebih ATS-Friendly</span>
              </span>
              {selectedGoal === 'ats' && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
            </button>

            <button
              type="button"
              onClick={() => setSelectedGoal('metrics')}
              className={`p-2.5 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                selectedGoal === 'metrics'
                  ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-700 dark:text-purple-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-500" />
                <span>Tambahkan Metrik / Data</span>
              </span>
              {selectedGoal === 'metrics' && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
            </button>

            <button
              type="button"
              onClick={() => setSelectedGoal('concise')}
              className={`p-2.5 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                selectedGoal === 'concise'
                  ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-700 dark:text-purple-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <AlignLeft className="w-4 h-4 text-purple-500" />
                <span>Ringkas &amp; Padat</span>
              </span>
              {selectedGoal === 'concise' && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
            </button>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          disabled={isLoading}
          onClick={handleRewrite}
          className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <span>Processing AI...</span>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-white" />
              <span>Rewrite dengan AI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
