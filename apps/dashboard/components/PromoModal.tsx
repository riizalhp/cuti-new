'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Gift,
  Tag,
  Clock,
  Flame,
  CheckCircle2,
  Copy,
  Check,
  X,
  Zap,
  Percent,
  BadgePercent,
  ArrowRight,
  ShieldCheck,
  Star,
  PartyPopper,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimPromo: (promoCode: string) => void;
}

export const PromoModal: React.FC<PromoModalProps> = ({
  isOpen,
  onClose,
  onClaimPromo,
}) => {
  const [copied, setCopied] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false);
  const promoCode = 'CUTIPRO70';

  // Timer countdown simulation (e.g. 04:32:15)
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 32, seconds: 15 });

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(promoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDismiss = () => {
    if (dontShowToday) {
      localStorage.setItem('promo_dismissed_until', String(Date.now() + 24 * 60 * 60 * 1000));
    }
    onClose();
  };

  const handleClaim = () => {
    onClaimPromo(promoCode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg relative overflow-hidden flex flex-col">
        {/* Top Decorative Header Banner */}
        <div className="relative bg-gradient-to-r from-violet-600 via-violet-700 to-amber-600 p-6 text-white overflow-hidden">
          {/* Background Lighting/Glow Circles */}
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-32 h-32 bg-violet-400/20 rounded-full blur-2xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-950/30 text-white hover:bg-slate-950/50 transition cursor-pointer z-10"
            aria-label="Tutup Promo"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badge & Title */}
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-400 text-slate-950 shadow-md">
              <Flame className="w-3.5 h-3.5 fill-slate-950" />
              <span>Promo Spesial Karir BUMN & Tech</span>
            </div>

            <h3 className="text-2xl font-black tracking-tight text-white leading-tight">
              Diskon 70% Paket Pro AI Career Assistant!
            </h3>

            <p className="text-xs text-violet-100 font-medium leading-relaxed">
              Tingkatkan peluang panggilan interview kerja hingga 3x lipat dengan AI Resume & Auto ATS Matcher.
            </p>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 space-y-5 bg-white dark:bg-slate-900 flex-1">
          {/* Realtime Countdown Timer */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse shrink-0" />
              <span className="text-xs font-bold">Berakhir Dalam:</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs font-black text-amber-950 dark:text-amber-200">
              <span className="px-2 py-1 rounded-lg bg-amber-200/80 dark:bg-amber-900/80 border border-amber-300 dark:border-amber-700">
                {String(timeLeft.hours).padStart(2, '0')}h
              </span>
              <span>:</span>
              <span className="px-2 py-1 rounded-lg bg-amber-200/80 dark:bg-amber-900/80 border border-amber-300 dark:border-amber-700">
                {String(timeLeft.minutes).padStart(2, '0')}m
              </span>
              <span>:</span>
              <span className="px-2 py-1 rounded-lg bg-amber-200/80 dark:bg-amber-900/80 border border-amber-300 dark:border-amber-700">
                {String(timeLeft.seconds).padStart(2, '0')}s
              </span>
            </div>
          </div>

          {/* Coupon Code Banner */}
          <div className="p-4 rounded-xl bg-violet-50/70 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800/60 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                <span>Kode Promo Eksklusif</span>
              </span>
              <p className="font-mono font-black text-base text-slate-900 dark:text-white tracking-wider">
                {promoCode}
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleCopyCode}
              className={`rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-violet-600 hover:bg-violet-700 text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Kode</span>
                </>
              )}
            </Button>
          </div>

          {/* Pricing Highlight */}
          <div className="flex items-baseline justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs text-slate-400 line-through mr-2 font-semibold">
                Rp 199.000
              </span>
              <span className="text-lg font-black text-slate-900 dark:text-white">
                Rp 49.000
              </span>
              <span className="text-[11px] text-slate-500 font-medium ml-1">
                / tahun
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <BadgePercent className="w-3 h-3 text-emerald-600" />
              <span>Hemat 75%</span>
            </span>
          </div>

          {/* Benefits Feature List */}
          <div className="space-y-2">
            <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
              Keuntungan Akses Premium Pass:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>AI CV ATS Score Unlimited</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Auto-Apply Lowongan Kerja</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Simulasi Interview AI</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Akses Kursus & Sertifikat</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <Button
              onClick={handleClaim}
              className="w-full py-3 h-auto rounded-lg bg-gradient-to-r from-violet-600 via-violet-600 to-amber-600 hover:from-violet-700 hover:to-amber-700 text-white font-extrabold text-sm shadow-lg shadow-violet-500/25 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Klaim Diskon 70% Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={dontShowToday}
                  onChange={(e) => setDontShowToday(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-violet-600 focus:ring-violet-500 w-3.5 h-3.5"
                />
                <span>Jangan tampilkan hari ini lagi</span>
              </label>

              <button
                onClick={handleDismiss}
                className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
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
