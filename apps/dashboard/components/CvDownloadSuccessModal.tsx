'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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
import { Briefcase, CheckCircle2, ArrowRight } from 'lucide-react';

interface CvDownloadSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvTitle?: string;
  onNavigateToTracker?: () => void;
}

export function CvDownloadSuccessModal({
  isOpen,
  onClose,
  cvTitle = 'CV Lamaran Kerja',
  onNavigateToTracker,
}: CvDownloadSuccessModalProps) {
  const router = useRouter();

  const handleGoToTracker = () => {
    onClose();
    if (onNavigateToTracker) {
      onNavigateToTracker();
    } else {
      router.push('/tracker');
    }
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
                src="/images/mascot/bahagia.svg"
                alt="Maskot Employr Merayakan Unduh CV"
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
            <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Dokumen Siap Lamar</span>
          </div>

          <DialogTitle className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
            CV Berhasil Diunduh!
          </DialogTitle>

          <DialogDescription className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
            Berkas format ATS untuk <strong className="text-slate-800 dark:text-slate-200">{cvTitle}</strong> telah disiapkan ke perangkatmu.
          </DialogDescription>
        </DialogHeader>

        {/* Kotak Rekomendasi Langkah Selanjutnya */}
        <div className="my-1 p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-left flex items-start gap-2.5">
          <div className="size-8 rounded-[8px] bg-blue-50 dark:bg-blue-950/60 text-[#1738D1] dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/80 dark:border-blue-800/60">
            <Briefcase className="size-4" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              Pantau Proses Lamaran
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Sudah mengirim berkas ini ke perusahaan? Catat di Job Tracker agar jadwal wawancara tidak terlewat.
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
            Nanti Saja
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleGoToTracker}
            className="w-full sm:w-auto text-xs font-bold bg-[#1738D1] hover:bg-[#132EA8] shadow-md shadow-[#1738D1]/20 gap-1.5"
          >
            <span>Buka Job Tracker</span>
            <ArrowRight className="size-3.5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
