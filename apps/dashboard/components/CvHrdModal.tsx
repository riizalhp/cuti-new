'use client';

import React from 'react';
import {
  Briefcase,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CvHrdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectService?: () => void;
}

export const CvHrdModal: React.FC<CvHrdModalProps> = ({
  isOpen,
  onClose,
  onSelectService,
}) => {
  // Hidden for now per user request
  const HIDDEN = true;

  if (HIDDEN || !isOpen) return null;

  const handlePrimaryClick = () => {
    if (onSelectService) {
      onSelectService();
    }
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md relative overflow-hidden flex flex-col cursor-default"
      >
        {/* Top Decorative Header */}
        <div className="relative bg-[#1F3578] p-6 text-white overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-[#1738D1]/20 rounded-full blur-xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-28 h-28 bg-blue-500/20 rounded-full blur-xl pointer-events-none" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-[10px] bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer shrink-0 border border-white/20"
            aria-label="Tutup Modal"
          >
            <X className="w-4 h-4 pointer-events-none" />
          </button>

          {/* Badge & Title */}
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] text-[10px] font-extrabold uppercase tracking-wider bg-[#1738D1] text-white shadow-xs">
              <Sparkles className="w-3.5 h-3.5 fill-white" />
              <span>Layanan HR Professional</span>
            </div>

            <h3 className="text-xl md:text-2xl font-black tracking-tight text-white leading-tight flex items-center gap-2">
              <span>👨‍💼 CV Dibuatkan oleh HRD</span>
            </h3>

            <p className="text-xs text-slate-200 font-medium leading-relaxed">
              Serahkan CV kamu kepada HR profesional dan dapatkan CV yang siap digunakan untuk melamar kerja.
            </p>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 space-y-5 bg-white dark:bg-slate-900 flex-1">
          {/* Features List */}
          <div className="space-y-2.5 p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 pb-1 border-b border-slate-200/60 dark:border-slate-700/60">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Fasilitas Penulisan CV:</span>
            </div>
            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 pt-1">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-semibold">Optimasi ATS</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-semibold">Disesuaikan dengan posisi target</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-semibold">Review HRD</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-semibold">Revisi 1–2x</span>
              </div>
            </div>
          </div>

          {/* Pricing Info */}
          <div className="flex items-center justify-between p-3.5 rounded-[10px] bg-orange-50 dark:bg-amber-950/40 border border-orange-200/80 dark:border-amber-800/50">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <Briefcase className="w-4 h-4 text-orange-500 shrink-0" />
              <span className="text-xs font-bold">Investasi Layanan:</span>
            </div>
            <span className="text-base font-black text-orange-600 dark:text-orange-400">
              Mulai Rp79.000
            </span>
          </div>

          {/* Actions */}
          <div className="space-y-2.5 pt-1">
            <Button
              onClick={handlePrimaryClick}
              className="w-full py-3.5 h-auto rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-extrabold text-xs md:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Buatkan CV Saya</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer text-center"
            >
              Tidak sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
