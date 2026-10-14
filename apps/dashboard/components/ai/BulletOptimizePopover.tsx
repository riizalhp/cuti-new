'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Target,
  FileCheck,
  AlignLeft,
  CheckCircle2,
  ArrowRight,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cleanBulletLine } from '@/lib/cv-bullets';

export interface BulletOptimizePopoverProps {
  isOpen: boolean;
  onClose: () => void;
  bulletText: string;
  onApplyRewrite: (newText: string, feedbackMsg: string) => void;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

export const BulletOptimizePopover: React.FC<BulletOptimizePopoverProps> = ({
  isOpen,
  onClose,
  bulletText,
  onApplyRewrite,
  returnFocusRef,
}) => {
  const [selectedGoal, setSelectedGoal] = useState<'impact' | 'ats' | 'metrics' | 'concise' | 'grammar'>('impact');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRewrite = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const goalPrompts: Record<string, { system: string; user: string; feedback: string }> = {
        impact: {
          system: 'Ubah poin pengalaman CV ini menjadi berorientasi dampak (Impact-driven) dengan kata kerja aksi yang kuat dan angka kuantitatif.',
          user: `Tulis ulang poin pengalaman ini agar lebih berdampak tinggi:\n"${bulletText}"`,
          feedback: 'Ditambahkan: hasil terukur & kata kerja berorientasi dampak.',
        },
        ats: {
          system: 'Ubah poin pengalaman CV ini agar kaya kata kunci (ATS-friendly) dan terminologi standar industri.',
          user: `Tulis ulang poin pengalaman ini agar ramah sistem ATS:\n"${bulletText}"`,
          feedback: 'Ditambahkan: kata kunci & terminologi standar ATS.',
        },
        metrics: {
          system: 'Tambahkan estimasi metrik kuantitatif terukur (persentase, jumlah, atau skala) pada poin pengalaman CV ini.',
          user: `Tambahkan metrik/data kuantitatif pada poin ini:\n"${bulletText}"`,
          feedback: 'Ditambahkan: metrik kuantitatif terukur.',
        },
        concise: {
          system: 'Ringkas poin pengalaman CV ini agar lebih padat, tajam, profesional, dan tanpa kata mubazir.',
          user: `Ringkas poin ini secara tajam:\n"${bulletText}"`,
          feedback: 'Diringkas: kalimat lebih tajam & tanpa kata mubazir.',
        },
        grammar: {
          system: 'Perbaiki tata bahasa, ejaan, dan kejelasan poin pengalaman CV ini sesuai Bahasa Indonesia baku.',
          user: `Perbaiki tata bahasa poin ini:\n"${bulletText}"`,
          feedback: 'Diperbaiki: tata bahasa & ejaan Bahasa Indonesia resmi.',
        },
      };

      const selected = goalPrompts[selectedGoal] || goalPrompts.impact;

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: selected.user,
          systemInstruction: `Anda adalah pakar penulisan CV profesional. ${selected.system} Berikan LANGSUNG 1 kalimat poin hasil perbaikan tanpa tanda kutip, tanpa markdown, dan tanpa penjelasan tambahan.`,
          promptName: `Bullet Optimize (${selectedGoal})`,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Gagal menghubungi server.');
      }

      let resultText = (data.text || '').trim();
      // Strip outer quotes if returned
      if (resultText.startsWith('"') && resultText.endsWith('"')) {
        resultText = resultText.slice(1, -1);
      }
      resultText = cleanBulletLine(resultText);

      if (!resultText) {
        throw new Error('Respon hasil kosong.');
      }

      setIsLoading(false);
      onApplyRewrite(resultText, selected.feedback);
      onClose();
    } catch (err: unknown) {
      const error = err as Error;
      console.error('[Bullet Optimize Popover] Error:', error);
      setErrorMessage(error.message || 'Gagal menghubungi server.');
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent size="sm" returnFocusRef={returnFocusRef} className="space-y-4 p-5">
        {/* Header */}
        <DialogHeader className="border-b border-slate-100 dark:border-slate-800 pb-3 pr-8">
          <DialogTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400 font-extrabold text-xs">
            <Sparkles className="w-4 h-4 fill-orange-500" />
            <span>Optimalkan Poin Pengalaman</span>
          </DialogTitle>
        </DialogHeader>

        {/* Selected Bullet Preview */}
        <div className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 italic truncate">
          &quot;{bulletText || 'Poin pengalaman yang dipilih'}&quot;
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-[10px] bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Option Choices */}
        <div className="space-y-1.5">
          <label className="text-caption font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Pilih Target Perbaikan
          </label>

          <div className="grid grid-cols-1 gap-1.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => setSelectedGoal('impact')}
              className={`p-2.5 rounded-[10px] border flex items-center justify-between transition cursor-pointer ${
                selectedGoal === 'impact'
                  ? 'bg-orange-50 dark:bg-orange-950/60 border-cobalt-500 text-orange-700 dark:text-orange-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Target className="w-4 h-4 text-orange-700 dark:text-orange-400" />
                <span>Lebih Berdampak (Impact)</span>
              </span>
              {selectedGoal === 'impact' && <CheckCircle2 className="w-4 h-4 text-orange-700 dark:text-orange-400" />}
            </button>

            <button
              type="button"
              onClick={() => setSelectedGoal('ats')}
              className={`p-2.5 rounded-[10px] border flex items-center justify-between transition cursor-pointer ${
                selectedGoal === 'ats'
                  ? 'bg-orange-50 dark:bg-orange-950/60 border-cobalt-500 text-orange-700 dark:text-orange-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-orange-700 dark:text-orange-400" />
                <span>Lebih ATS-Friendly</span>
              </span>
              {selectedGoal === 'ats' && <CheckCircle2 className="w-4 h-4 text-orange-700 dark:text-orange-400" />}
            </button>

            <button
              type="button"
              onClick={() => setSelectedGoal('metrics')}
              className={`p-2.5 rounded-[10px] border flex items-center justify-between transition cursor-pointer ${
                selectedGoal === 'metrics'
                  ? 'bg-orange-50 dark:bg-orange-950/60 border-cobalt-500 text-orange-700 dark:text-orange-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-700 dark:text-orange-400" />
                <span>Tambahkan Metrik / Data</span>
              </span>
              {selectedGoal === 'metrics' && <CheckCircle2 className="w-4 h-4 text-orange-700 dark:text-orange-400" />}
            </button>

            <button
              type="button"
              onClick={() => setSelectedGoal('concise')}
              className={`p-2.5 rounded-[10px] border flex items-center justify-between transition cursor-pointer ${
                selectedGoal === 'concise'
                  ? 'bg-orange-50 dark:bg-orange-950/60 border-cobalt-500 text-orange-700 dark:text-orange-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <AlignLeft className="w-4 h-4 text-orange-700 dark:text-orange-400" />
                <span>Ringkas &amp; Padat</span>
              </span>
              {selectedGoal === 'concise' && <CheckCircle2 className="w-4 h-4 text-orange-700 dark:text-orange-400" />}
            </button>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          disabled={isLoading || !bulletText.trim()}
          onClick={handleRewrite}
          className="w-full py-2.5 px-4 rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 text-white font-extrabold text-xs shadow-md shadow-cobalt-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Menyusun Kalimat Otomatis...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-white" />
              <span>Optimalkan Kalimat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </DialogContent>
    </Dialog>
  );
};
