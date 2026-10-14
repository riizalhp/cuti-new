'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  CheckCircle2,
  Trophy,
  Calendar,
  Clock,
  Clock3,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  Building2,
  Briefcase,
  FileText,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  HeartCrack,
  CalendarCheck,
  HelpCircle,
  Lightbulb,
  Banknote,
} from 'lucide-react';
import { TrackerDatePicker, fromISODate } from '@/components/ui/TrackerDatePicker';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { ApplicationItem } from './TrackerView';
import { getDayDiff, parseIndonesianDate, getReminderTemplateText } from '@/lib/trackerReminders';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface PostInterviewReviewModalProps {
  isOpen: boolean;
  app: ApplicationItem | null;
  onClose: () => void;
  onUpdateStatus: (
    appId: string,
    newStatus: ApplicationItem['status'],
    interviewNotes?: string,
    interviewResult?: 'waiting' | 'passed_next_round' | 'offering' | 'rejected'
  ) => Promise<void>;
  onScheduleNextRound: (
    appId: string,
    scheduleData: {
      interviewDate: string;
      interviewTime: string;
      interviewTimezone: 'WIB' | 'WITA' | 'WIT';
      interviewChecklist: string[];
    },
    interviewNotes?: string
  ) => Promise<void>;
  onSaveNotesOnly: (appId: string, interviewNotes: string) => Promise<void>;
  onEditSchedule?: (app: ApplicationItem) => void;
}

const POPULAR_TIMES = ['09:00', '10:00', '11:00', '13:30', '14:00', '15:30'];

export const PostInterviewReviewModal: React.FC<PostInterviewReviewModalProps> = ({
  isOpen,
  app,
  onClose,
  onUpdateStatus,
  onScheduleNextRound,
  onSaveNotesOnly,
  onEditSchedule,
}) => {
  const [selectedOutcome, setSelectedOutcome] = useState<
    'offering' | 'next_round' | 'waiting' | 'rejected' | null
  >(null);
  const [interviewNotes, setInterviewNotes] = useState('');
  const [isCopiedFollowUp, setIsCopiedFollowUp] = useState(false);
  const [showFollowUpBox, setShowFollowUpBox] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editableFollowUp, setEditableFollowUp] = useState('');

  const followUpTextareaRef = useRef<HTMLTextAreaElement>(null);
  const notesTextareaRef = useRef<HTMLTextAreaElement>(null);

  // State untuk Next Round Interview
  const [nextDate, setNextDate] = useState('');
  const [nextTime, setNextTime] = useState('10:00');
  const [nextTimezone, setNextTimezone] = useState<'WIB' | 'WITA' | 'WIT'>('WIB');

  // Auto-resize logic untuk textarea follow-up dan notes
  const autoResizeFollowUp = () => {
    if (followUpTextareaRef.current) {
      const el = followUpTextareaRef.current;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight + 6}px`;
    }
  };

  const autoResizeNotes = () => {
    if (notesTextareaRef.current) {
      const el = notesTextareaRef.current;
      el.style.height = 'auto';
      el.style.height = `${Math.max(100, el.scrollHeight + 4)}px`;
    }
  };

  useEffect(() => {
    if (app && isOpen) {
      setInterviewNotes(app.interviewNotes || '');
      setSelectedOutcome(null);
      setShowFollowUpBox(false);
      setIsCopiedFollowUp(false);
      setNextDate('');
      setNextTime('10:00');
      setNextTimezone(app.interviewTimezone || 'WIB');
    }
  }, [app, isOpen]);

  // Template follow-up sopan
  const followUpTemplate = app
    ? getReminderTemplateText('follow_up_interview', app.company, app.position, 'Saya')
    : '';

  useEffect(() => {
    setEditableFollowUp(followUpTemplate);
  }, [followUpTemplate]);

  useEffect(() => {
    if (showFollowUpBox) {
      const timer = setTimeout(autoResizeFollowUp, 40);
      return () => clearTimeout(timer);
    }
  }, [showFollowUpBox, editableFollowUp]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(autoResizeNotes, 40);
      return () => clearTimeout(timer);
    }
  }, [isOpen, interviewNotes]);

  if (!isOpen || !app) return null;

  // Hitung berapa hari telah lewat sejak tanggal wawancara
  let daysAgoText = 'Beberapa hari lalu';
  let daysAgoNumber = 1;
  if (app.interviewDate) {
    const parsed = parseIndonesianDate(app.interviewDate);
    if (parsed) {
      const diff = Math.abs(getDayDiff(parsed, new Date()));
      daysAgoNumber = diff;
      if (diff === 0) daysAgoText = 'Hari ini';
      else if (diff === 1) daysAgoText = 'Kemarin';
      else if (diff < 7) daysAgoText = `${diff} hari yang lalu`;
      else if (diff < 14) daysAgoText = '1 minggu yang lalu';
      else if (diff < 30) daysAgoText = `${Math.floor(diff / 7)} minggu yang lalu`;
      else daysAgoText = `${Math.floor(diff / 30)} bulan yang lalu`;
    }
  }

  const handleCopyFollowUp = () => {
    navigator.clipboard.writeText(editableFollowUp || followUpTemplate);
    setIsCopiedFollowUp(true);
    setTimeout(() => setIsCopiedFollowUp(false), 2500);
  };

  const handleInsertSnippet = (snippet: string) => {
    setInterviewNotes((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return snippet;
      return `${trimmed}\n\n${snippet}`;
    });
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      if (selectedOutcome === 'offering') {
        await onUpdateStatus(app.id, 'Offering', interviewNotes, 'offering');
      } else if (selectedOutcome === 'rejected') {
        await onUpdateStatus(app.id, 'Ditolak', interviewNotes, 'rejected');
      } else if (selectedOutcome === 'next_round') {
        if (nextDate) {
          await onScheduleNextRound(
            app.id,
            {
              interviewDate: nextDate,
              interviewTime: nextTime,
              interviewTimezone: nextTimezone,
              interviewChecklist: [],
            },
            interviewNotes
          );
        } else {
          await onUpdateStatus(app.id, 'Interview', interviewNotes, 'passed_next_round');
        }
      } else if (selectedOutcome === 'waiting') {
        await onUpdateStatus(app.id, 'Interview', interviewNotes, 'waiting');
      } else {
        // Hanya simpan catatan evaluasi
        await onSaveNotesOnly(app.id, interviewNotes);
      }
      onClose();
    } catch (err) {
      console.error('[PostInterviewReviewModal] Error saving:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="p-0 flex flex-col justify-between h-full w-full max-w-md sm:max-w-xl overflow-hidden">
        {/* Header Drawer */}
        <SheetHeader className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-row items-start justify-between gap-3 text-left">
          <div className="flex items-start gap-3 min-w-0 pr-8">
            <div className="size-10 rounded-[10px] bg-amber-700 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0 mt-0.5">
              <CheckCircle2 className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <SheetTitle className="text-base font-extrabold text-slate-900 dark:text-white pr-0">
                  Evaluasi &amp; Hasil Wawancara
                </SheetTitle>
                <span className="px-2 py-0.5 rounded-[10px] text-caption font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 shrink-0">
                  {daysAgoText}
                </span>
              </div>
              <SheetDescription className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium truncate">
                <span className="font-bold text-slate-900 dark:text-slate-200">{app.company}</span>
                <span>•</span>
                <span className="truncate">{app.position}</span>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Drawer Body */}
        <SheetBody className="p-5 space-y-5 flex-1 overflow-y-auto">
          {/* Section 1: 1-Click Status Outcome Picker */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span>Bagaimana sesi wawancara kamu?</span>
              <span className="text-caption font-normal text-slate-500">Pilih salah satu status</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option 1: Lolos / Offering */}
              <button
                type="button"
                onClick={() => setSelectedOutcome(selectedOutcome === 'offering' ? null : 'offering')}
                className={`p-3 rounded-[10px] border text-left transition cursor-pointer flex flex-col justify-between gap-1.5 ${
                  selectedOutcome === 'offering'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800 bg-white dark:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-xs text-emerald-700 dark:text-emerald-300">
                    <Trophy className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                    <span>Lolos &amp; Dapat Offering!</span>
                  </span>
                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    selectedOutcome === 'offering' ? 'border-emerald-500 bg-emerald-700 text-white' : 'border-slate-300 dark:border-slate-700'
                  }`}>
                    {selectedOutcome === 'offering' && <Check className="w-2.5 h-2.5" />}
                  </span>
                </div>
                <p className="text-caption text-slate-600 dark:text-slate-400 leading-snug">
                  Selamat! Pindahkan kartu lamaran ini langsung ke kolom <strong>Offering</strong>.
                </p>
              </button>

              {/* Option 2: Interview Lanjutan */}
              <button
                type="button"
                onClick={() => setSelectedOutcome(selectedOutcome === 'next_round' ? null : 'next_round')}
                className={`p-3 rounded-[10px] border text-left transition cursor-pointer flex flex-col justify-between gap-1.5 ${
                  selectedOutcome === 'next_round'
                    ? 'border-cobalt-500 bg-blue-50 dark:bg-blue-950/60 ring-2 ring-cobalt-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800 bg-white dark:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-xs text-cobalt-500 dark:text-blue-400">
                    <RotateCcw className="w-3.5 h-3.5 text-cobalt-500" />
                    <span>Ada Interview Lanjutan</span>
                  </span>
                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    selectedOutcome === 'next_round' ? 'border-cobalt-500 bg-cobalt-500 text-white' : 'border-slate-300 dark:border-slate-700'
                  }`}>
                    {selectedOutcome === 'next_round' && <Check className="w-2.5 h-2.5" />}
                  </span>
                </div>
                <p className="text-caption text-slate-600 dark:text-slate-400 leading-snug">
                  Lolos ke sesi User, Technical, atau Direksi berikutnya.
                </p>
              </button>

              {/* Option 3: Menunggu Kabar HR */}
              <button
                type="button"
                onClick={() => setSelectedOutcome(selectedOutcome === 'waiting' ? null : 'waiting')}
                className={`p-3 rounded-[10px] border text-left transition cursor-pointer flex flex-col justify-between gap-1.5 ${
                  selectedOutcome === 'waiting'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/60 ring-2 ring-amber-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-800 bg-white dark:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-xs text-amber-700 dark:text-amber-300">
                    <Clock3 className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                    <span>Menunggu Kabar HRD</span>
                  </span>
                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    selectedOutcome === 'waiting' ? 'border-amber-500 bg-amber-700 text-white' : 'border-slate-300 dark:border-slate-700'
                  }`}>
                    {selectedOutcome === 'waiting' && <Check className="w-2.5 h-2.5" />}
                  </span>
                </div>
                <p className="text-caption text-slate-600 dark:text-slate-400 leading-snug">
                  Tetap di kolom Interview &amp; siapkan follow-up sopan ke recruiter.
                </p>
              </button>

              {/* Option 4: Belum Berhasil / Ditolak */}
              <button
                type="button"
                onClick={() => setSelectedOutcome(selectedOutcome === 'rejected' ? null : 'rejected')}
                className={`p-3 rounded-[10px] border text-left transition cursor-pointer flex flex-col justify-between gap-1.5 ${
                  selectedOutcome === 'rejected'
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 ring-2 ring-rose-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-800 bg-white dark:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-xs text-rose-700 dark:text-rose-300">
                    <HeartCrack className="w-3.5 h-3.5 text-rose-700 dark:text-rose-400" />
                    <span>Belum Rezeki / Ditolak</span>
                  </span>
                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    selectedOutcome === 'rejected' ? 'border-rose-500 bg-rose-600 text-white' : 'border-slate-300 dark:border-slate-700'
                  }`}>
                    {selectedOutcome === 'rejected' && <Check className="w-2.5 h-2.5" />}
                  </span>
                </div>
                <p className="text-caption text-slate-600 dark:text-slate-400 leading-snug">
                  Belum lolos kali ini. Jangan menyerah, jadikan bahan evaluasi lamaran selanjutnya!
                </p>
              </button>
            </div>
          </div>

          {/* Sub-section jika memilih "Ada Interview Lanjutan" */}
          {selectedOutcome === 'next_round' && (
            <div className="p-3.5 rounded-[10px] bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/70 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs font-bold text-cobalt-500 dark:text-blue-300">
                <CalendarCheck className="w-4 h-4" />
                <span>Atur Jadwal Interview Babak Berikutnya:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-caption font-semibold text-slate-700 dark:text-slate-300">
                    Tanggal Wawancara Lanjutan
                  </label>
                  <TrackerDatePicker
                    value={nextDate}
                    onChange={(val) => setNextDate(val)}
                    placeholder="Pilih tanggal"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-caption font-semibold text-slate-700 dark:text-slate-300">
                    Jam &amp; Zona Waktu
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={nextTime}
                      onChange={(e) => setNextTime(e.target.value)}
                      className="px-3 py-2 text-xs font-mono font-bold rounded-[8px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white w-28 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <CustomSelect
                        value={nextTimezone}
                        onChange={(val) => setNextTimezone(val as any)}
                        options={[
                          { value: 'WIB', label: 'WIB (UTC+7)' },
                          { value: 'WITA', label: 'WITA (UTC+8)' },
                          { value: 'WIT', label: 'WIT (UTC+9)' },
                        ]}
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Popular time pills */}
              <div className="flex items-center gap-1 overflow-x-auto pt-0.5">
                <span className="text-caption text-slate-500 font-medium shrink-0">Waktu umum:</span>
                {POPULAR_TIMES.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setNextTime(time)}
                    className={`px-2 py-0.5 rounded text-caption font-mono transition cursor-pointer ${
                      nextTime === time
                        ? 'bg-cobalt-500 text-white font-bold'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Catatan Evaluasi Wawancara (Interview Reflection Journal) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-orange-700 dark:text-orange-400" />
                <span>Catatan &amp; Evaluasi Wawancara</span>
              </label>
              <span className="text-caption text-slate-500 dark:text-slate-400">Arsip belajar pribadi</span>
            </div>

            <p className="text-caption text-slate-500 dark:text-slate-400 leading-snug">
              Catat pertanyaan yang sempat ditanyakan, jawaban yang perlu diperbaiki, atau kisaran gaji yang dibahas agar jadi bekal berharga untuk interview berikutnya.
            </p>

            {/* Quick Template Snippets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => handleInsertSnippet('Pertanyaan yang Ditanyakan:\n- ')}
                className="px-2.5 py-1.5 rounded-[8px] text-caption font-semibold bg-slate-100/90 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition cursor-pointer flex items-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5 text-cobalt-500 dark:text-blue-400 shrink-0" />
                <span>Pertanyaan Wawancara</span>
              </button>
              <button
                type="button"
                onClick={() => handleInsertSnippet('Evaluasi & Refleksi Diri:\n- ')}
                className="px-2.5 py-1.5 rounded-[8px] text-caption font-semibold bg-slate-100/90 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition cursor-pointer flex items-center gap-1.5"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-700 shrink-0 dark:text-amber-400" />
                <span>Refleksi Diri</span>
              </button>
              <button
                type="button"
                onClick={() => handleInsertSnippet('Pembahasan Gaji & Benefit:\n- ')}
                className="px-2.5 py-1.5 rounded-[8px] text-caption font-semibold bg-slate-100/90 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition cursor-pointer flex items-center gap-1.5"
              >
                <Banknote className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span>Gaji &amp; Benefit</span>
              </button>
            </div>

            <textarea
              ref={notesTextareaRef}
              rows={4}
              value={interviewNotes}
              onChange={(e) => {
                setInterviewNotes(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.max(100, e.target.scrollHeight + 4)}px`;
              }}
              placeholder="Tulis catatan evaluasi wawancara kamu di sini..."
              className="w-full p-3 rounded-[10px] text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-900 dark:text-white leading-relaxed focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition resize-none overflow-hidden block"
            />
          </div>

          {/* Section 3: Bantuan Template Follow-up HRD */}
          <div className="rounded-[10px] border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-800/30">
            <button
              type="button"
              onClick={() => setShowFollowUpBox(!showFollowUpBox)}
              className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-orange-700 dark:text-orange-400" />
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  Butuh draf follow-up sopan ke HRD?
                </span>
              </div>
              {showFollowUpBox ? (
                <ChevronUp className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              )}
            </button>

            {showFollowUpBox && (
              <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5 bg-white dark:bg-slate-900">
                <p className="text-caption text-slate-500 dark:text-slate-400">
                  Gunakan pesan ini jika sudah beberapa hari atau minggu belum ada kabar:
                </p>
                <textarea
                  ref={followUpTextareaRef}
                  value={editableFollowUp}
                  onChange={(e) => {
                    setEditableFollowUp(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${e.target.scrollHeight + 6}px`;
                  }}
                  className="w-full p-3 rounded-[8px] text-xs font-sans bg-slate-50/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 resize-none leading-relaxed focus:outline-none focus:ring-2 focus:ring-cobalt-500/20 focus:border-cobalt-500 overflow-hidden transition-all select-all block"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleCopyFollowUp}
                    className="px-3 py-1.5 rounded-[8px] text-xs font-bold bg-cobalt-500 hover:bg-cobalt-600 text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    {isCopiedFollowUp ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Pesan Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Draf Pesan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </SheetBody>

        {/* Footer Actions */}
        <SheetFooter className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              Batal
            </Button>
            {onEditSchedule && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  onClose();
                  onEditSchedule(app);
                }}
                className="hidden sm:inline-flex text-slate-600 dark:text-slate-300 hover:text-cobalt-500 dark:hover:text-blue-400"
                title="Buka form untuk melihat atau mengubah jadwal & checklist persiapan interview"
              >
                <CalendarCheck className="size-3.5" />
                <span>Ubah Jadwal &amp; Persiapan</span>
              </Button>
            )}
          </div>

          <Button
            type="button"
            variant="primary"
            size="sm"
            loading={isSaving}
            onClick={handleSubmit}
          >
            <Check className="size-4" />
            <span>{selectedOutcome ? 'Simpan & Perbarui Status' : 'Simpan Catatan Evaluasi'}</span>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
