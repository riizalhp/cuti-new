'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  X,
  Zap,
  ShieldCheck,
  Award,
  Crown,
} from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPayment?: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  onOpenPayment,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleActivate = () => {
    if (onOpenPayment) {
      onClose();
      onOpenPayment();
    } else {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card bg-white/90 dark:bg-slate-900/90 rounded-[32px] border border-white/30 dark:border-white/10 shadow-2xl w-full max-w-xl p-6 relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-white/20 dark:bg-white/10 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-[#0D3BD9] text-white font-black flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/20">
            <Crown className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Upgrade Ke Premium Pass
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
            Dapatkan prioritas lamaran kerja, AI Assistant tanpa batas, dan jaminan optimasi CV ATS friendly.
          </p>
        </div>

        {/* Pricing toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-white/40 dark:bg-slate-800/60 p-1.5 rounded-full border border-white/30 dark:border-white/10 backdrop-blur-md flex gap-1">
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={`px-5 py-2 rounded-full text-xs font-black transition cursor-pointer ${
                selectedPlan === 'monthly'
                  ? 'btn-neo-skeuo-light shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Bulanan (Rp 49.000)
            </button>
            <button
              onClick={() => setSelectedPlan('yearly')}
              className={`px-5 py-2 rounded-full text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                selectedPlan === 'yearly'
                  ? 'btn-neo-skeuo-accent text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <span>Tahunan (Rp 29.000/bln)</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black uppercase">
                Hemat 40%
              </span>
            </button>
          </div>
        </div>

        {/* Benefits list */}
        <div className="space-y-3 mb-6 bg-white/40 dark:bg-slate-800/40 p-5 rounded-[24px] border border-white/30 dark:border-white/10 text-xs backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span className="text-slate-800 dark:text-slate-200 font-bold">
              Prioritas ranking teratas di portal rekrutmen HR perusahaan BUMN
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span className="text-slate-800 dark:text-slate-200 font-bold">
              Akses Asisten Karir AI &amp; Cover Letter Builder tanpa batas
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span className="text-slate-800 dark:text-slate-200 font-bold">
              Rekomendasi lowongan rahasia sebelum ditayangkan ke publik
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span className="text-slate-800 dark:text-slate-200 font-bold">
              Jaminan lolos kualifikasi ATS Score min 90%+
            </span>
          </div>
        </div>

        {success ? (
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-full text-center font-black text-xs flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Selamat! Akun Premium Pass Anda telah aktif!</span>
          </div>
        ) : (
          <button
            onClick={handleActivate}
            className="w-full group btn-neo-skeuo py-3.5 px-6 text-sm font-black flex items-center justify-center gap-3 cursor-pointer"
          >
            <span>Aktifkan Premium Pass Sekarang</span>
            <span className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-inner group-hover:scale-110 transition">
              <Sparkles className="w-4 h-4" />
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
