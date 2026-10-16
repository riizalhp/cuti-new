'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  Check,
  CheckSquare,
  BellOff,
  CalendarCheck,
  Building2,
  Briefcase,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { TrackerDatePicker } from '@/components/ui/TrackerDatePicker';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { ApplicationItem } from './TrackerView';
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
import { TaskList, type Task } from '@/components/ui/TaskList';

export interface InterviewChecklistItem {
  id: string;
  label: string;
  description: string;
}

export const DEFAULT_INTERVIEW_CHECKLIST: InterviewChecklistItem[] = [
  {
    id: 'research',
    label: 'Riset Profil Perusahaan & Produk',
    description: 'Pahami visi bisnis, produk/layanan utama, serta berita dan pencapaian terkini perusahaan.',
  },
  {
    id: 'cv_portfolio',
    label: 'Kuasai CV & Portofolio Relevan',
    description: 'Siapkan penjelasan metode STAR untuk proyek terbaik dan pengalaman yang paling relevan.',
  },
  {
    id: 'device_test',
    label: 'Tes Perangkat, Audio, Kamera & Internet',
    description: 'Pastikan Zoom/Google Meet sudah dicek, baterai terisi, mikrofon jernih, dan sinyal stabil.',
  },
  {
    id: 'outfit_space',
    label: 'Pakaian Rapi & Ruangan Tenang',
    description: 'Kenakan pakaian sopan/formal dan kondisikan pencahayaan serta latar yang rapi.',
  },
  {
    id: 'qa_prep',
    label: 'Susun 2-3 Pertanyaan untuk Interviewer',
    description: 'Tanyakan mengenai dinamika tim, ekspektasi 3 bulan pertama, atau budaya kerja di perusahaan.',
  },
];

const POPULAR_TIMES = ['09:00', '10:00', '11:00', '13:30', '14:00', '15:30'];

export type IndonesianTimezone = 'WIB' | 'WITA' | 'WIT';

export const detectTimezoneFromLocation = (location?: string): IndonesianTimezone => {
  if (!location) return 'WIB';
  const loc = location.toLowerCase();
  const witKeywords = [
    'maluku', 'ambon', 'ternate', 'tidore', 'tual', 'papua', 'jayapura',
    'sorong', 'manokwari', 'merauke', 'timika', 'nabire', 'biak', 'wamena'
  ];
  if (witKeywords.some((k) => loc.includes(k))) return 'WIT';

  const witaKeywords = [
    'bali', 'denpasar', 'badung', 'gianyar', 'buleleng', 'tabanan', 'klungkung',
    'mataram', 'lombok', 'bima', 'sumbawa', 'kupang', 'flores', 'ende',
    'banjarmasin', 'banjarbaru', 'balikpapan', 'samarinda', 'bontang', 'tarakan',
    'makassar', 'gowa', 'maros', 'palopo', 'parepare', 'manado', 'bitung', 'tomohon',
    'palu', 'kendari', 'gorontalo', 'mamuju'
  ];
  if (witaKeywords.some((k) => loc.includes(k))) return 'WITA';

  return 'WIB';
};

interface InterviewScheduleModalProps {
  isOpen: boolean;
  app: ApplicationItem | null;
  onClose: () => void;
  onSave: (
    appId: string,
    data: {
      interviewDate: string;
      interviewTime: string;
      interviewTimezone: IndonesianTimezone;
      interviewChecklist: string[];
    }
  ) => void;
  onIgnore: (appId: string) => void;
  onOpenReview?: (app: ApplicationItem) => void;
}

export const InterviewScheduleModal: React.FC<InterviewScheduleModalProps> = ({
  isOpen,
  app,
  onClose,
  onSave,
  onIgnore,
  onOpenReview,
}) => {
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('10:00');
  const [interviewTimezone, setInterviewTimezone] = useState<IndonesianTimezone>('WIB');
  const [checklist, setChecklist] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync state when modal opens or app changes
  useEffect(() => {
    if (app && isOpen) {
      setInterviewDate(app.interviewDate || '');
      setInterviewTime(app.interviewTime || '10:00');
      setInterviewTimezone(app.interviewTimezone || detectTimezoneFromLocation(app.location));
      setChecklist(app.interviewChecklist || []);
      setValidationError(null);
    }
  }, [app, isOpen]);

  if (!isOpen || !app) return null;

  const handleSave = () => {
    if (!interviewDate.trim()) {
      setValidationError('Pilih tanggal interview terlebih dahulu, atau klik "Pindahkan Tanpa Pengingat" jika jadwal belum ditentukan.');
      return;
    }

    setValidationError(null);
    onSave(app.id, {
      interviewDate: interviewDate.trim(),
      interviewTime: interviewTime.trim() || '10:00',
      interviewTimezone: interviewTimezone,
      interviewChecklist: checklist,
    });
  };

  const handleIgnore = () => {
    onIgnore(app.id);
  };

  const completedCount = checklist.length;
  const totalChecklist = DEFAULT_INTERVIEW_CHECKLIST.length;
  const progressPercent = Math.round((completedCount / totalChecklist) * 100);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="p-0 flex flex-col justify-between w-full sm:max-w-xl sm:h-full overflow-hidden">
        {/* Header Drawer */}
        <SheetHeader className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-row items-start justify-between gap-3 text-left">
          <div className="flex items-start gap-3 min-w-0 pr-8">
            <div className="size-10 rounded-[10px] bg-blue-100 dark:bg-blue-950/80 text-cobalt-500 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800 shadow-2xs">
              <CalendarCheck className="size-5" />
            </div>
            <div className="min-w-0">
              <SheetTitle className="text-sm sm:text-base leading-tight pr-0">
                Jadwal &amp; Persiapan Interview
              </SheetTitle>
              <SheetDescription className="flex items-center gap-2 mt-1 text-xs truncate">
                <span className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200 truncate">
                  <Briefcase className="size-3.5 text-orange-700 shrink-0 dark:text-orange-400" />
                  <span className="truncate">{app.position}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 truncate text-slate-600 dark:text-slate-300">
                  <Building2 className="size-3.5 text-slate-500 shrink-0 dark:text-slate-400" />
                  <span className="truncate">{app.company}</span>
                </span>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Body (Scrollable with Design System Sleek Scrollbar) */}
        <SheetBody className="p-4 sm:p-5 space-y-5 flex-1 text-xs text-slate-700 dark:text-slate-300 custom-scrollbar">
          {validationError && (
            <div className="p-3 rounded-[10px] bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5 dark:text-rose-400" />
              <p className="text-xs leading-relaxed">{validationError}</p>
            </div>
          )}

          {onOpenReview && (app.interviewDate || app.interviewTime) && (
            <div className="p-3 rounded-[10px] bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <CheckCircle2 className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-amber-900 dark:text-amber-200 truncate">
                    Wawancara sudah berlangsung?
                  </p>
                  <p className="text-caption text-amber-700 dark:text-amber-400">
                    Catat evaluasi dan perbarui status ke Offering / Ditolak sekarang.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenReview(app);
                }}
                className="px-3 py-1.5 rounded-[8px] bg-amber-700 hover:bg-amber-600 active:scale-95 text-white font-bold text-caption shrink-0 transition flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <span>Gimana Hasilnya?</span>
              </button>
            </div>
          )}

          {/* Section 1: Input Tanggal & Jam Interview */}
          <div className="space-y-3.5 bg-slate-50/50 dark:bg-slate-800/30 p-3.5 rounded-[10px] border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cobalt-500 dark:text-blue-400" />
                <span>Waktu &amp; Tanggal Interview</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="block text-caption font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Tanggal Wawancara
                </span>
                <TrackerDatePicker
                  value={interviewDate}
                  onChange={(val) => {
                    setInterviewDate(val);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="Pilih tanggal wawancara..."
                />
              </div>

              <div>
                <span className="block text-caption font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Jam &amp; Zona Waktu
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    aria-label="Jam Wawancara"
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                    className="w-28 px-3 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-cobalt-500 transition shrink-0"
                  />
                  <div className="flex-1 min-w-[140px]">
                    <CustomSelect
                      value={interviewTimezone}
                      onChange={(val) => setInterviewTimezone(val as IndonesianTimezone)}
                      options={[
                        { value: 'WIB', label: 'WIB (UTC+7)' },
                        { value: 'WITA', label: 'WITA (UTC+8)' },
                        { value: 'WIT', label: 'WIT (UTC+9)' },
                      ]}
                      size="md"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick-Pick Popular Times */}
            <div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1.5">
                Pilihan Jam Populer:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {POPULAR_TIMES.map((timePreset) => {
                  const isActive = interviewTime === timePreset;
                  return (
                    <button
                      key={timePreset}
                      type="button"
                      onClick={() => setInterviewTime(timePreset)}
                      className={`px-2.5 py-1 rounded-[6px] text-[11px] font-semibold transition cursor-pointer border ${
                        isActive
                          ? 'bg-cobalt-600 text-white border-cobalt-600 shadow-2xs font-bold'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      {timePreset}
                    </button>
                  );
                })}
              </div>
            </div>

            {interviewDate && (
              <div className="p-2.5 rounded-[8px] bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900/60 text-caption text-blue-800 dark:text-blue-300 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>
                  Pengingat interview otomatis aktif untuk <strong>{interviewDate}</strong> pukul <strong>{interviewTime || '10:00'} {interviewTimezone}</strong>.
                </span>
              </div>
            )}
          </div>

          {/* Section 2: Checklist Persiapan Interview (Microsoft Fluent Style) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Checklist Persiapan Interview</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Centang persiapan yang sudah kamu selesaikan sebelum jadwal wawancara.
                </p>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-[6px] bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
                {completedCount}/{totalChecklist} Siap
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 dark:bg-emerald-400 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Checklist Items */}
            <div className="space-y-2 pt-1">
              {DEFAULT_INTERVIEW_CHECKLIST.map((item) => {
                const isChecked = checklist.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setChecklist((prev) =>
                        prev.includes(item.id)
                          ? prev.filter((id) => id !== item.id)
                          : [...prev, item.id]
                      );
                    }}
                    className={`p-3 rounded-[8px] border transition cursor-pointer flex items-start gap-3 select-none ${
                      isChecked
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300/80 dark:border-emerald-800/80'
                        : 'bg-white dark:bg-slate-800/40 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`size-4 rounded-[4px] border shrink-0 mt-0.5 flex items-center justify-center transition ${
                        isChecked
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {isChecked && <Check className="size-3 stroke-[3]" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold leading-snug ${
                        isChecked
                          ? 'text-slate-700 dark:text-slate-300'
                          : 'text-slate-900 dark:text-white'
                      }`}>
                        {item.label}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Opsi Abaikan Pengingat untuk Lowongan Ini */}
          <div className="p-3.5 rounded-[10px] border border-amber-200/90 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20 flex items-start gap-3">
            <div className="p-2 rounded-[8px] bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 shrink-0">
              <BellOff className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                Abaikan Pengingat untuk Lowongan Ini?
              </h3>
              <p className="text-caption text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                Pindahkan ke Interview tanpa mengisi jam &amp; tanpa pengingat berulang. Kamu bebas memindahkan kartu ini keluar-masuk Interview tanpa popup lagi.
              </p>
              <button
                type="button"
                onClick={handleIgnore}
                className="mt-2.5 px-3 py-1.5 rounded-[8px] border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50 text-caption font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <BellOff className="w-3.5 h-3.5" />
                <span>Pindahkan &amp; Abaikan Pengingat</span>
              </button>
            </div>
          </div>
        </SheetBody>

        {/* Footer Sticky */}
        <SheetFooter className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={handleIgnore}
            className="text-[11px] font-semibold text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 transition flex items-center gap-1.5 cursor-pointer hover:underline underline-offset-2 shrink-0"
          >
            <BellOff className="size-3.5 shrink-0" />
            <span className="hidden sm:inline">Pindahkan Tanpa Pengingat</span>
            <span className="sm:hidden">Tanpa Pengingat</span>
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="px-3"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSave}
              className="px-4 font-bold shrink-0 whitespace-nowrap bg-cobalt-600 hover:bg-cobalt-700 shadow-cobalt-600/20"
            >
              <CalendarCheck className="size-3.5 shrink-0" />
              <span>Simpan Jadwal</span>
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
