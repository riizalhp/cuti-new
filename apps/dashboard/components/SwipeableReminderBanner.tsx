'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { BellRing, ChevronRight, ChevronLeft, Trash2, X } from 'lucide-react';
import { TrackerReminder } from '@/lib/trackerReminders';

interface SwipeableReminderBannerProps {
  reminders: TrackerReminder[];
  onDismissReminder: (id: string) => void;
  onOpenReminderHub: () => void;
}

export const SwipeableReminderBanner: React.FC<SwipeableReminderBannerProps> = ({
  reminders,
  onDismissReminder,
  onOpenReminderHub,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isPastThreshold, setIsPastThreshold] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);

  const x = useMotionValue(0);
  const SWIPE_THRESHOLD = 80;

  // Background reveal opacity & scale based on drag distance
  const deleteOpacityLeft = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const deleteScaleLeft = useTransform(x, [0, SWIPE_THRESHOLD], [0.8, 1]);

  const deleteOpacityRight = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);
  const deleteScaleRight = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0.8]);

  // Transformasi halus untuk kartu tumpukan di bawahnya saat kartu atas digeser
  const underneathScale = useTransform(x, [-140, 0, 140], [1, 0.97, 1]);
  const underneathY = useTransform(x, [-140, 0, 140], [0, 4, 0]);
  const underneathOpacity = useTransform(x, [-140, 0, 140], [1, 0.75, 1]);

  // Validasi indeks aktif
  const totalReminders = reminders.length;
  const safeIndex = totalReminders > 0 ? (currentIndex % totalReminders + totalReminders) % totalReminders : 0;
  const activeReminder = reminders[safeIndex];

  // Kartu berikutnya di dalam tumpukan
  const nextIndex = totalReminders > 1 ? (safeIndex + 1) % totalReminders : 0;
  const nextReminder = totalReminders > 1 ? reminders[nextIndex] : null;

  // Pastikan currentIndex selalu valid jika daftar reminders berkurang
  useEffect(() => {
    if (currentIndex >= totalReminders && totalReminders > 0) {
      setCurrentIndex(totalReminders - 1);
    }
  }, [totalReminders, currentIndex]);

  // Navigasi manual ke pesan berikutnya
  const handleNext = useCallback(() => {
    if (totalReminders <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % totalReminders);
  }, [totalReminders]);

  // Navigasi manual ke pesan sebelumnya
  const handlePrev = useCallback(() => {
    if (totalReminders <= 1) return;
    setCurrentIndex((prev) => (prev === 0 ? totalReminders - 1 : prev - 1));
  }, [totalReminders]);

  // Auto-cycle animasi pergantian pesan setiap 5.5 detik
  useEffect(() => {
    if (totalReminders <= 1 || isPaused || exitDirection) return;

    const interval = setInterval(() => {
      handleNext();
    }, 5500);

    return () => clearInterval(interval);
  }, [totalReminders, isPaused, exitDirection, handleNext]);

  if (!reminders || totalReminders === 0 || !activeReminder) {
    return null;
  }

  // Hapus hanya 1 notifikasi yang sedang aktif
  const handleDismissCurrent = (id: string, dir: 'left' | 'right' = 'right') => {
    if (exitDirection) return; // Mencegah double trigger
    setExitDirection(dir);

    setTimeout(() => {
      onDismissReminder(id);
      x.set(0);
      setExitDirection(null);
      setIsPastThreshold(false);
      setIsPaused(false);
    }, 220);
  };

  return (
    <div
      className={`relative select-none ${totalReminders > 1 ? 'pb-2' : ''}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Visual Tumpukan Kartu ke-3 (jika notifikasi >= 3) */}
      {totalReminders > 2 && (
        <div className="absolute -bottom-1.5 inset-x-6 h-3 rounded-b-[10px] bg-orange-100/50 dark:bg-orange-950/20 border-x border-b border-orange-200/50 dark:border-orange-800/30 -z-20 transition-all duration-200 pointer-events-none" />
      )}

      {/* Kartu Berikutnya (Next Card) yang tetap standby di bawah kartu aktif */}
      {nextReminder && (
        <motion.div
          style={{
            scale: underneathScale,
            y: underneathY,
            opacity: underneathOpacity,
          }}
          className="absolute inset-0 z-0 bg-white/90 dark:bg-slate-900/90 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-white/90 dark:to-slate-900/90 border border-orange-200/80 dark:border-orange-800/40 rounded-[10px] p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs pointer-events-none"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-[10px] bg-orange-500/80 text-white flex items-center justify-center shrink-0 shadow-xs">
              <BellRing className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-slate-700 dark:text-slate-300 truncate max-w-[200px] sm:max-w-[320px]">
                  {nextReminder.title}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-[10px] bg-orange-100/70 dark:bg-orange-950/70 text-orange-700/80 dark:text-orange-300/80 border border-orange-200/60 dark:border-orange-800/50 shrink-0">
                  Berikutnya
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                “{nextReminder.message}”
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Draggable Active Card Container */}
      <div className="relative z-10 overflow-hidden rounded-[10px]">
        {/* Background Reveal Layer for Swipe to Delete */}
        <div
          className={`absolute inset-0 rounded-[10px] flex items-center justify-between px-6 transition-colors duration-150 ${
            isPastThreshold ? 'bg-rose-600' : 'bg-rose-500/95 dark:bg-rose-900/95'
          }`}
        >
          {/* Left Action (Swiping Right) */}
          <motion.div
            style={{ opacity: deleteOpacityLeft, scale: deleteScaleLeft }}
            className="flex items-center justify-center text-white"
          >
            <Trash2 className="w-5 h-5" />
          </motion.div>

          {/* Right Action (Swiping Left) */}
          <motion.div
            style={{ opacity: deleteOpacityRight, scale: deleteScaleRight }}
            className="flex items-center justify-center text-white ml-auto"
          >
            <Trash2 className="w-5 h-5" />
          </motion.div>
        </div>

        {/* Draggable Foreground Banner */}
        <motion.div
          drag={exitDirection ? false : 'x'}
          dragDirectionLock
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.65}
          style={{ x }}
          animate={{
            x: exitDirection === 'left' ? -650 : exitDirection === 'right' ? 650 : 0,
            opacity: exitDirection ? 0 : 1,
          }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          onDragStart={() => setIsPaused(true)}
          onDrag={(_, info) => {
            const past = Math.abs(info.offset.x) > SWIPE_THRESHOLD;
            if (past !== isPastThreshold) {
              setIsPastThreshold(past);
            }
          }}
          onDragEnd={(_, info) => {
            setIsPaused(false);
            const isSwipeDismiss =
              Math.abs(info.offset.x) > SWIPE_THRESHOLD || Math.abs(info.velocity.x) > 400;

            if (isSwipeDismiss) {
              const dir = info.offset.x < 0 || info.velocity.x < -300 ? 'left' : 'right';
              handleDismissCurrent(activeReminder.id, dir);
            } else {
              setIsPastThreshold(false);
            }
          }}
          className="relative z-10 bg-white/95 dark:bg-slate-900/95 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-white/95 dark:to-slate-900/95 border border-orange-200 dark:border-orange-800/60 rounded-[10px] p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs backdrop-blur-xs cursor-grab active:cursor-grabbing touch-pan-y"
        >
          {/* Left Content: Bell Icon & Animated Rotating Reminder Content */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-[10px] bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <BellRing className="w-4 h-4" />
            </div>

            <div className="min-w-0 flex-1 relative overflow-hidden">
              {/* Animasi Transisi Teks Berganti Pesan */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeReminder.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="min-w-0"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-[320px]">
                      {activeReminder.title}
                    </span>

                    {/* Indikator Urutan Tumpukan Notifikasi */}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-[10px] bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 shrink-0">
                      {totalReminders > 1
                        ? `${safeIndex + 1} dari ${totalReminders} Pengingat`
                        : '1 Pengingat Aktif'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate mt-0.5">
                    “{activeReminder.message}”
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Center/Controls: Pagination Dots & Arrows (hanya jika ada lebih dari 1 notifikasi) */}
          {totalReminders > 1 && (
            <div
              className="flex items-center gap-1.5 self-center shrink-0 order-3 sm:order-2"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="p-1 rounded-[6px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Pengingat sebelumnya"
                aria-label="Pengingat sebelumnya"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {/* Dots Indicator */}
              <div className="flex items-center gap-1">
                {reminders.map((r, idx) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === safeIndex
                        ? 'w-4 bg-orange-500'
                        : 'w-1.5 bg-orange-200 dark:bg-orange-900/60 hover:bg-orange-400'
                    }`}
                    title={`Lihat pengingat ke-${idx + 1}`}
                    aria-label={`Pengingat ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="p-1 rounded-[6px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Pengingat berikutnya"
                aria-label="Pengingat berikutnya"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Right Controls: Open Hub Button & Explicit Dismiss Button */}
          <div
            className="flex items-center gap-2 shrink-0 self-end sm:self-center order-2 sm:order-3"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenReminderHub();
              }}
              className="px-3.5 py-1.5 rounded-[10px] bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <span>Buka Pengingat</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDismissCurrent(activeReminder.id, 'right');
              }}
              className="p-1.5 rounded-[10px] text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-800 transition cursor-pointer"
              title="Hapus notifikasi ini"
              aria-label="Hapus notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
