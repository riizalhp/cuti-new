'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  X,
  ShieldCheck,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CvPromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartService: () => void;
}

export const CvPromoModal: React.FC<CvPromoModalProps> = ({
  isOpen,
  onClose,
  onStartService,
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const handleDismiss = () => {
    if (dontShowAgain) {
      localStorage.setItem('cuti_cv_promo_dismissed', 'true');
    }
    onClose();
  };

  const handleStart = () => {
    if (dontShowAgain) {
      localStorage.setItem('cuti_cv_promo_dismissed', 'true');
    }
    onStartService();
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleDismiss();
        }
      }}
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg relative overflow-hidden flex flex-col cursor-default"
      >
        {/* Decorative Top Header */}
        <div className="relative bg-navy-700 p-6 text-white overflow-hidden">
          {/* Subtle Background Lighting Glow */}
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-36 h-36 bg-[#1738D1]/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Close Button */}
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute top-4 right-4 z-30 w-9 h-9 rounded-[10px] bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer shrink-0 border border-white/20 shadow-xs"
            aria-label="Tutup Promo"
          >
            <X className="w-5 h-5 pointer-events-none" />
          </button>

          {/* Title & Badge */}
          <div className="relative z-10 space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] text-[11px] font-extrabold uppercase tracking-wider bg-[#1738D1] text-white shadow-xs">
              <Sparkles className="w-3.5 h-3.5 fill-white" />
              <span>Layanan Otomasi CV &amp; Garansi HR Review</span>
            </div>

            <h3 className="text-xl md:text-2xl font-black tracking-tight text-white leading-tight">
              Bingung Bikin CV ATS-Friendly yang Benar-Benar Lolos Screening HR?
            </h3>

            <p className="text-xs text-slate-200 font-medium leading-relaxed">
              Biarkan Sistem Pintar CUTI menyusun tata letak, mengekstrak kata kunci SEO pekerjaan, dan disempurnakan langsung oleh Tim Specialist Recruiter kami dalam waktu 15-30 menit.
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 bg-white dark:bg-slate-900 flex-1">
          {/* Features List */}
          <div className="space-y-3 p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Keunggulan Layanan CV CUTI:</span>
            </div>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">Skor ATS 95%+ Guaranteed</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">Ditinjau Praktisi HR Rekrutmen</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">Siap Pakai Melamar di Job Portal</span>
              </div>
            </div>
          </div>

          {/* Pricing Highlight Badge */}
          <div className="flex items-center justify-between p-3.5 rounded-[10px] bg-orange-50 dark:bg-amber-950/30 border border-orange-200 dark:border-amber-800/50">
            <div className="flex items-center gap-2 text-orange-950 dark:text-orange-200">
              <Clock className="w-4 h-4 text-orange-500 shrink-0" />
              <span className="text-xs font-bold">Harga Promo Terjangkau:</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs text-slate-400 line-through">Rp 50.000</span>
              <span className="text-base font-black text-orange-600 dark:text-orange-400">Rp 29.000</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-1">
            <Button
              onClick={handleStart}
              className="w-full py-3.5 h-auto rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-extrabold text-xs md:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>Mulai Buatkan CV Otomatis (Rp 29rb)</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="rounded-[10px] border-slate-300 dark:border-slate-700 text-orange-500 focus:ring-[#1738D1] w-4 h-4 cursor-pointer"
                />
                <span>Jangan tampilkan lagi</span>
              </label>

              <button
                onClick={handleDismiss}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              >
                Nanti Saja
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
