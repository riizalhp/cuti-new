'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Target,
  FileCheck2,
  Coins,
  ChevronRight,
  X,
  Rocket,
  CheckCircle2,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface WhatsNewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreFeature?: (featureKey: string) => void;
}

interface FeatureItem {
  id: string;
  tag: 'BARU' | 'PENINGKATAN' | 'UPDATE';
  tagColor: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}

const NEW_FEATURES: FeatureItem[] = [
  {
    id: 'cv-ats',
    tag: 'BARU',
    tagColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    title: 'Simulasi Screening & Skor ATS 2.0',
    description: 'Analisis struktur CV secara mendalam, deteksi kata kunci industri relevan, dan rekomendasi perbaikan instan.',
    icon: FileCheck2,
    iconBg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
    iconColor: 'text-cobalt-500 dark:text-blue-400',
  },
  {
    id: 'job-tracker',
    tag: 'PENINGKATAN',
    tagColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    title: 'Smart Tracker & Papan Kanban',
    description: 'Kelola alur lamaran kerja mulai dari Terkirim, Screening, hingga Offering dengan pengingat jadwal otomatis.',
    icon: Target,
    iconBg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
    iconColor: 'text-amber-700 dark:text-amber-400',
  },
  {
    id: 'misi-reward',
    tag: 'UPDATE',
    tagColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    title: 'Misi Karir & Cuan Tambahan',
    description: 'Selesaikan misi persiapan karir harian untuk mengumpulkan reward saldo yang dapat dicairkan.',
    icon: Coins,
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
    iconColor: 'text-emerald-700 dark:text-emerald-400',
  },
];

export const WhatsNewModal: React.FC<WhatsNewModalProps> = ({
  isOpen,
  onClose,
  onExploreFeature,
}) => {
  const [dontShowToday, setDontShowToday] = useState(false);

  if (!isOpen) return null;

  const handleDismiss = () => {
    const expireTime = dontShowToday
      ? Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
      : Date.now() + 24 * 60 * 60 * 1000; // 1 day
    localStorage.setItem('whats_new_dismissed_until', String(expireTime));
    onClose();
  };

  const handlePrimaryAction = () => {
    handleDismiss();
    if (onExploreFeature) {
      onExploreFeature('cv-ats');
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleDismiss();
      }}
    >
      <DialogContent hideCloseButton size="md" className="p-0 overflow-hidden max-h-[90vh] flex flex-col max-w-xl">
        {/* Top Decorative Header Banner */}
        <div className="relative bg-navy-700 p-6 text-white overflow-hidden shrink-0">
          {/* Subtle Glow Backdrop */}
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 bg-cobalt-500/30 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-40 h-40 bg-orange-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-slate-950/40 text-white hover:bg-slate-950/70 hover:scale-105 active:scale-95 flex items-center justify-center transition cursor-pointer z-30 shrink-0"
            aria-label="Tutup Pembaruan"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Header Title & Version Badge */}
          <DialogHeader className="relative z-10 space-y-2 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] text-caption font-extrabold uppercase tracking-wider bg-orange-700 text-white shadow-md w-fit">
              <Rocket className="w-3.5 h-3.5" />
              <span>What&apos;s New in Employr</span>
            </div>

            <DialogTitle className="text-2xl font-black tracking-tight text-white leading-tight">
              Pembaruan &amp; Fitur Terbaru
            </DialogTitle>

            <p className="text-xs text-slate-100 font-medium leading-relaxed max-w-md">
              Jelajahi deretan fitur baru untuk mempercepat persiapan karir dan melipatgandakan peluang panggilan kerjamu.
            </p>
          </DialogHeader>
        </div>

        {/* Modal Scrollable Feature List */}
        <div className="p-6 space-y-3.5 bg-white dark:bg-slate-900 flex-1 overflow-y-auto">
          {NEW_FEATURES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 hover:border-cobalt-500/40 transition-colors flex items-start gap-3.5"
              >
                <div
                  className={`w-10 h-10 rounded-[10px] border ${item.iconBg} flex items-center justify-center shrink-0 mt-0.5`}
                >
                  <Icon className={`w-5 h-5 ${item.iconColor}`} />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded-[10px] text-caption font-black uppercase tracking-wider border ${item.tagColor}`}
                    >
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Sticky Footer Actions */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 shrink-0 space-y-3">
          <Button
            onClick={handlePrimaryAction}
            className="w-full py-2.5 h-auto"
            variant="primary"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Mulai Jelajahi Fitur</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center gap-2 text-caption text-slate-500 dark:text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dontShowToday}
                onChange={(e) => setDontShowToday(e.target.checked)}
                className="rounded-[10px] border-slate-300 dark:border-slate-700 text-cobalt-500 focus:ring-cobalt-500 w-3.5 h-3.5"
              />
              <span>Jangan tampilkan selama 7 hari</span>
            </label>

            <button
              onClick={handleDismiss}
              className="text-caption font-semibold text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer dark:text-slate-400"
            >
              Tutup
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
