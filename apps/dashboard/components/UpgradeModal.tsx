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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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
  // Hidden for now per user request (Free Access Mode)
  const HIDDEN = true;
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [success, setSuccess] = useState(false);

  if (HIDDEN || !isOpen) return null;

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
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent size="lg" className="p-6 max-w-xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-[10px] bg-navy-700 text-white font-black flex items-center justify-center mx-auto mb-3 shadow-lg shadow-navy-700/20">
            <Crown className="w-6 h-6 text-orange-400" />
          </div>
          <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Upgrade Ke Premium Pass
          </DialogTitle>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
            Dapatkan prioritas lamaran kerja, Evaluator Sistem tanpa batas, dan jaminan optimasi CV ramah sistem seleksi kerja.
          </p>
        </div>

        {/* Pricing toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[10px] border border-slate-200 dark:border-slate-700 flex gap-1">
            <button
              type="button"
              onClick={() => setSelectedPlan('monthly')}
              className={`px-5 py-2 rounded-[10px] text-xs font-bold transition cursor-pointer ${
                selectedPlan === 'monthly'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Bulanan (Rp 49.000)
            </button>
            <button
              type="button"
              onClick={() => setSelectedPlan('yearly')}
              className={`px-5 py-2 rounded-[10px] text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                selectedPlan === 'yearly'
                  ? 'bg-cobalt-500 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <span>Tahunan (Rp 29.000/bln)</span>
              <span className="px-2 py-0.5 rounded-[10px] bg-amber-400 text-slate-950 text-caption font-black uppercase">
                Hemat 40%
              </span>
            </button>
          </div>
        </div>

        {/* Benefits list */}
        <div className="space-y-3 mb-6 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0 dark:text-emerald-400" />
            <span className="text-slate-800 dark:text-slate-200 font-bold">
              Prioritas ranking teratas di portal rekrutmen HR mitra industri
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0 dark:text-emerald-400" />
            <span className="text-slate-800 dark:text-slate-200 font-bold">
              Akses Asisten Karir &amp; Cover Letter Builder tanpa batas
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0 dark:text-emerald-400" />
            <span className="text-slate-800 dark:text-slate-200 font-bold">
              Rekomendasi lowongan terkurasi sebelum ditayangkan ke publik
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0 dark:text-emerald-400" />
            <span className="text-slate-800 dark:text-slate-200 font-bold">
              Jaminan kualifikasi Skor ATS min 90%+
            </span>
          </div>
        </div>

        {success ? (
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-[10px] text-center font-bold text-xs flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Selamat! Akun Premium Pass Anda telah aktif!</span>
          </div>
        ) : (
          <Button
            onClick={handleActivate}
            className="w-full py-3 h-auto"
            variant="primary"
          >
            <span>Aktifkan Premium Pass Sekarang</span>
            <Sparkles className="w-4 h-4" />
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};
