'use client';

import React from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DotLottiePlayer } from '@/components/DotLottiePlayer';
import { ApplicationItem } from '@/components/TrackerView';
import {
  Building2,
  Briefcase,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  FileCheck,
} from 'lucide-react';

interface OfferingCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  app: ApplicationItem | null;
  onOpenPreparation: (app: ApplicationItem) => void;
}

export function OfferingCelebrationModal({
  isOpen,
  onClose,
  app,
  onOpenPreparation,
}: OfferingCelebrationModalProps) {
  if (!app) return null;

  const handleOpenPreparation = () => {
    onClose();
    onOpenPreparation(app);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="sm" className="p-5 sm:p-6 text-center overflow-hidden">
        {/* Visual Maskot Perayaan */}
        <div className="relative w-36 h-36 mx-auto -mt-2 flex items-center justify-center">
          <DotLottiePlayer
            src="/animations/mascot-celebration.json"
            autoplay={true}
            loop={true}
            className="w-full h-full"
            fallback={
              <Image
                src="/images/mascot/semangat.svg"
                alt="Maskot Employr Merayakan Offering"
                width={128}
                height={128}
                className="w-28 h-28 object-contain mx-auto"
                priority
              />
            }
          />
        </div>

        {/* Header & Judul */}
        <DialogHeader className="space-y-1.5 text-center sm:text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold mx-auto w-fit">
            <Sparkles className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Tahap Akhir Seleksi</span>
          </div>

          <DialogTitle className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
            Selamat atas Offering Kerjamu!
          </DialogTitle>

          <DialogDescription className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
            Kerja kerasmu terbayar. Penawaran kerja resmi telah kamu dapatkan.
          </DialogDescription>
        </DialogHeader>

        {/* Info Posisi & Perusahaan */}
        <div className="my-1 p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-left space-y-2">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-[8px] bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/80 dark:border-emerald-800/60">
              <Building2 className="size-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {app.company}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                <Briefcase className="size-3 shrink-0" />
                <span>{app.position}</span>
              </p>
            </div>
          </div>

          {/* Kotak Pengingat Penting (Hak Kerja / Anti Penahanan Ijazah) */}
          <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/60 flex items-start gap-2 text-rose-700 dark:text-rose-300">
            <ShieldAlert className="size-4 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Tips Kritis:</strong> Jangan serahkan ijazah asli untuk ditahan dan periksa rincian gaji (Gross vs. Nett) sebelum tanda tangan.
            </p>
          </div>
        </div>

        {/* Footer Tombol Aksi */}
        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-full sm:w-auto text-xs font-bold"
          >
            Tutup Dulu
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleOpenPreparation}
            className="w-full sm:w-auto text-xs font-bold bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 gap-1.5"
          >
            <FileCheck className="size-3.5" />
            <span>Periksa Kontrak &amp; Checklist</span>
            <ArrowRight className="size-3.5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
