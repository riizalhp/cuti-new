'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  Zap,
  Briefcase,
  FileText,
  Crown,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';

interface ProgressOnboardingProps {
  onActionClick: (stepId: string) => void;
  onOpenUpgradeModal?: () => void;
}

export const ProgressOnboarding: React.FC<ProgressOnboardingProps> = ({
  onActionClick,
  onOpenUpgradeModal,
}) => {
  const [steps, setSteps] = useState([
    {
      id: 'cv',
      title: 'Lengkapi Pengalaman & CV ATS',
      subtitle: 'Isi riwayat kerja untuk generate CV lolos screening HRD',
      status: 'completed', // 'completed', 'in_progress', 'pending'
      icon: FileText,
      color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400',
      badge: null,
    },
    {
      id: 'premium',
      title: 'Aktifkan Premium Pass Trial',
      subtitle: 'Coba AI Unlimited, Auto-Lamar & Simulator Wawancara HRD',
      status: 'in_progress',
      icon: Crown,
      color: 'text-amber-500 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-400',
      badge: 'Coba Gratis',
    },
    {
      id: 'lamar',
      title: 'Lamar 2 Lowongan Prioritas',
      subtitle: 'Kirim lamaran kerja instan menggunakan CV ATS AI kamu',
      status: 'pending',
      icon: Briefcase,
      color: 'text-orange-500 bg-orange-100 dark:bg-orange-950/60 dark:text-orange-400',
      badge: null,
    },
  ]);

  const toggleStep = (id: string) => {
    setSteps((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextStatus =
            s.status === 'completed'
              ? 'in_progress'
              : s.status === 'in_progress'
              ? 'completed'
              : 'in_progress';
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
    onActionClick(id);
  };

  const completedCount = steps.filter((s) => s.status === 'completed').length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="bg-navy-700 rounded-[10px] p-5 md:p-6 text-white shadow-lg border border-navy-800">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Info & Steps */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-[10px] text-[11px] font-bold bg-[#1738D1]/30 text-orange-200 border border-orange-400/30 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Panduan Pengguna Baru
                </span>
                <span className="text-xs text-orange-300 font-semibold">
                  {completedCount} dari {steps.length} Selesai ({progressPercent}%)
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                <span>Langkah Cepat Meningkatkan Peluang Diterima Kerja</span>
              </h2>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-900/80 rounded-full h-2.5 overflow-hidden border border-white/10 p-0.5">
            <div
              className="bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm shadow-[#1738D1]/40"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Steps List */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <button
                  key={step.id}
                  onClick={() => toggleStep(step.id)}
                  className={`p-3 rounded-[10px] border text-left transition flex items-start gap-3 relative overflow-hidden ${
                    step.status === 'completed'
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100 hover:bg-emerald-900/50'
                      : step.status === 'in_progress'
                      ? 'bg-amber-950/40 border-amber-500/40 text-amber-100 hover:bg-amber-900/50 ring-1 ring-amber-400/30'
                      : 'bg-orange-950/30 border-orange-800/40 text-slate-300 hover:bg-orange-900/40'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0 ${step.color}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold truncate">{step.title}</span>
                      {step.badge && (
                        <span className="px-1.5 py-0.5 rounded-[10px] text-[9px] font-black bg-amber-400 text-slate-950 uppercase shrink-0">
                          {step.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug mt-0.5 line-clamp-2">
                      {step.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Motivation Banner for Premium Pass Trial */}
        <div className="lg:col-span-4 bg-gradient-to-b from-navy-900/80 to-slate-900/80 rounded-[10px] p-4 border border-amber-400/30 flex flex-col justify-between h-full space-y-3 relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-[10px] bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
                  <Crown className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider">
                    Eksklusif Member Baru
                  </h3>
                  <p className="text-[10px] text-orange-200">
                    Peluang Lolos HRD Naik +85%
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-[10px] text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Akses Ditolak HRD: 0%
              </span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              Aktifkan <strong className="text-amber-300">Premium Pass Trial</strong> untuk membuka analisis skor CV ATS unlimited, pembuatan surat lamaran otomatis AI, dan latihan wawancara HR interaktif.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onOpenUpgradeModal) {
                onOpenUpgradeModal();
              } else {
                onActionClick('premium');
              }
            }}
            className="w-full py-2.5 rounded-[10px] bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs transition shadow-md shadow-amber-400/20 flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>Coba Premium Pass Sekarang</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

