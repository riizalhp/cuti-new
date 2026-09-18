'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { trackerApi } from '../lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  Briefcase,
  Plus,
  Search,
  Building2,
  Calendar,
  Trash2,
  MapPin,
  Kanban,
  List,
  ChevronRight,
  ArrowRight,
  X,
  FileText,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  Globe,
  ExternalLink,
  RefreshCw,
  Loader2,
  Sparkles,
  BellRing,
  BellOff,
  Send,
  FileSearch,
  CalendarCheck,
  FolderArchive,
  Clock,
  CheckCircle2,
  FilePlus,
} from 'lucide-react';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { DotLottiePlayer } from '@/components/DotLottiePlayer';
import { CitySearchInput } from '@/components/ui/CitySearchInput';
import { TrackerDatePicker, fromISODate } from '@/components/ui/TrackerDatePicker';
import { PortalSearchDropdown } from '@/components/ui/PortalSearchDropdown';
import { AutoResizeTextarea } from '@/components/ui/AutoResizeTextarea';
import { TrackerReminderHub } from '@/components/TrackerReminderHub';
import { SwipeableReminderBanner } from '@/components/SwipeableReminderBanner';
import { InterviewScheduleModal } from './InterviewScheduleModal';
import { PostInterviewReviewModal } from './PostInterviewReviewModal';
import { OfferingPreparationModal } from './OfferingPreparationModal';
import {
  calculateApplicationReminders,
  isAppInterviewIgnored,
  TrackerReminder,
  parseIndonesianDate,
  getDayDiff,
} from '@/lib/trackerReminders';

export interface ApplicationItem {
  id: string;
  company: string;
  position: string;
  location: string;
  appliedDate: string;
  status: 'Terkirim' | 'Screening' | 'Interview' | 'Offering' | 'Ditolak';
  salary: string;
  notes: string;
  portal: string;
  portalUrl?: string;
  interviewDate?: string;
  interviewTime?: string;
  interviewTimezone?: 'WIB' | 'WITA' | 'WIT';
  interviewChecklist?: string[];
  ignoreInterviewReminder?: boolean;
  interviewNotes?: string;
  interviewResult?: 'waiting' | 'passed_next_round' | 'offering' | 'rejected';
  deadlineDate?: string;
  offerDeadline?: string;
  offeringChecklist?: string[];
  offeringStartDate?: string;
  hasAssessment?: boolean;
  assessmentDeadline?: string;
  hasTask?: boolean;
}

const KANBAN_COLUMNS: Array<{
  status: ApplicationItem['status'];
  label: string;
  colorClass: string;
  badgeBg: string;
}> = [
  {
    status: 'Terkirim',
    label: 'Terkirim',
    colorClass: 'border-sky-500/30 bg-sky-500/5',
    badgeBg: 'bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
  },
  {
    status: 'Screening',
    label: 'Screening',
    colorClass: 'border-[#1738D1]/30 bg-[#1738D1]/5',
    badgeBg: 'bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  },
  {
    status: 'Interview',
    label: 'Interview',
    colorClass: 'border-amber-500/30 bg-amber-500/5',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
  {
    status: 'Offering',
    label: 'Offering',
    colorClass: 'border-emerald-500/30 bg-emerald-500/5',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
  {
    status: 'Ditolak',
    label: 'Ditolak',
    colorClass: 'border-rose-500/30 bg-rose-500/5',
    badgeBg: 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  },
];

export interface CardColorPalette {
  bg: string;
  border: string;
  hoverBorder: string;
  accentBar: string;
  companyText: string;
  tagBg: string;
  tagText: string;
  iconColor: string;
  dotBg: string;
}

const CARD_PALETTES: CardColorPalette[] = [
  // 1. Vibrant Rose / Coral
  {
    bg: 'bg-rose-50/90 dark:bg-rose-950/40',
    border: 'border-rose-200/90 dark:border-rose-800/60',
    hoverBorder: 'hover:border-rose-400 dark:hover:border-rose-500',
    accentBar: 'bg-gradient-to-r from-rose-400 to-pink-500',
    companyText: 'text-rose-700 dark:text-rose-300 font-bold',
    tagBg: 'bg-rose-100/90 dark:bg-rose-900/60',
    tagText: 'text-rose-800 dark:text-rose-200',
    iconColor: 'text-rose-500',
    dotBg: 'bg-rose-500',
  },
  // 2. Bright Amber / Peach
  {
    bg: 'bg-amber-50/90 dark:bg-amber-950/40',
    border: 'border-amber-200/90 dark:border-amber-800/60',
    hoverBorder: 'hover:border-amber-400 dark:hover:border-amber-500',
    accentBar: 'bg-gradient-to-r from-amber-400 to-orange-500',
    companyText: 'text-amber-700 dark:text-amber-300 font-bold',
    tagBg: 'bg-amber-100/90 dark:bg-amber-900/60',
    tagText: 'text-amber-800 dark:text-amber-200',
    iconColor: 'text-amber-500',
    dotBg: 'bg-amber-500',
  },
  // 3. Fresh Emerald / Mint
  {
    bg: 'bg-emerald-50/90 dark:bg-emerald-950/40',
    border: 'border-emerald-200/90 dark:border-emerald-800/60',
    hoverBorder: 'hover:border-emerald-400 dark:hover:border-emerald-500',
    accentBar: 'bg-gradient-to-r from-emerald-400 to-teal-500',
    companyText: 'text-emerald-700 dark:text-emerald-300 font-bold',
    tagBg: 'bg-emerald-100/90 dark:bg-emerald-900/60',
    tagText: 'text-emerald-800 dark:text-emerald-200',
    iconColor: 'text-emerald-500',
    dotBg: 'bg-emerald-500',
  },
  // 4. Vibrant Sky / Cyan
  {
    bg: 'bg-sky-50/90 dark:bg-sky-950/40',
    border: 'border-sky-200/90 dark:border-sky-800/60',
    hoverBorder: 'hover:border-sky-400 dark:hover:border-sky-500',
    accentBar: 'bg-gradient-to-r from-sky-400 to-blue-500',
    companyText: 'text-sky-700 dark:text-sky-300 font-bold',
    tagBg: 'bg-sky-100/90 dark:bg-sky-900/60',
    tagText: 'text-sky-800 dark:text-sky-200',
    iconColor: 'text-sky-500',
    dotBg: 'bg-sky-500',
  },
  // 5. Cyan / Teal
  {
    bg: 'bg-orange-50/90 dark:bg-orange-950/40',
    border: 'border-orange-200/90 dark:border-orange-800/50',
    hoverBorder: 'hover:border-orange-400 dark:hover:border-[#1738D1]',
    accentBar: 'bg-gradient-to-r from-cyan-400 to-slate-500',
    companyText: 'text-orange-700 dark:text-orange-300 font-bold',
    tagBg: 'bg-orange-100/90 dark:bg-orange-900/60',
    tagText: 'text-orange-800 dark:text-orange-200',
    iconColor: 'text-orange-500',
    dotBg: 'bg-[#1738D1]',
  },
  // 6. Royal Navy / Blue
  {
    bg: 'bg-slate-50/90 dark:bg-slate-900/40',
    border: 'border-slate-200/90 dark:border-slate-800/60',
    hoverBorder: 'hover:border-blue-400 dark:hover:border-navy-500',
    accentBar: 'bg-gradient-to-r from-navy-400 to-blue-600',
    companyText: 'text-navy-700 dark:text-navy-300 font-bold',
    tagBg: 'bg-navy-100/90 dark:bg-navy-900/60',
    tagText: 'text-navy-800 dark:text-navy-200',
    iconColor: 'text-navy-500',
    dotBg: 'bg-navy-600',
  },
  // 7. Bright Teal / Turquoise
  {
    bg: 'bg-teal-50/90 dark:bg-teal-950/40',
    border: 'border-teal-200/90 dark:border-teal-800/60',
    hoverBorder: 'hover:border-teal-400 dark:hover:border-teal-500',
    accentBar: 'bg-gradient-to-r from-teal-400 to-cyan-500',
    companyText: 'text-teal-700 dark:text-teal-300 font-bold',
    tagBg: 'bg-teal-100/90 dark:bg-teal-900/60',
    tagText: 'text-teal-800 dark:text-teal-200',
    iconColor: 'text-teal-500',
    dotBg: 'bg-teal-500',
  },
  // 8. Hot Fuchsia / Pink
  {
    bg: 'bg-fuchsia-50/90 dark:bg-fuchsia-950/40',
    border: 'border-fuchsia-200/90 dark:border-fuchsia-800/60',
    hoverBorder: 'hover:border-fuchsia-400 dark:hover:border-fuchsia-500',
    accentBar: 'bg-gradient-to-r from-fuchsia-400 to-pink-600',
    companyText: 'text-fuchsia-700 dark:text-fuchsia-300 font-bold',
    tagBg: 'bg-fuchsia-100/90 dark:bg-fuchsia-900/60',
    tagText: 'text-fuchsia-800 dark:text-fuchsia-200',
    iconColor: 'text-fuchsia-500',
    dotBg: 'bg-fuchsia-500',
  },
];

const getCardPalette = (id: string): CardColorPalette => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % CARD_PALETTES.length;
  return CARD_PALETTES[index];
};

export const COLUMN_EMPTY_STATES: Record<
  ApplicationItem['status'],
  { label: string; icon: any; iconColor: string; bgClass: string }
> = {
  Terkirim: {
    label: 'Belum ada lamaran terkirim',
    icon: Send,
    iconColor: 'text-sky-500',
    bgClass: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400',
  },
  Screening: {
    label: 'Belum ada tahap screening',
    icon: FileSearch,
    iconColor: 'text-orange-500',
    bgClass: 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400',
  },
  Interview: {
    label: 'Belum ada jadwal interview',
    icon: CalendarCheck,
    iconColor: 'text-amber-500',
    bgClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
  },
  Offering: {
    label: 'Belum ada tawaran offering',
    icon: Sparkles,
    iconColor: 'text-emerald-500',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
  },
  Ditolak: {
    label: 'Tidak ada lamaran ditolak',
    icon: FolderArchive,
    iconColor: 'text-rose-500',
    bgClass: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
  },
};

// Helper formatter input gaji "000.000.000" dengan pemisah ribuan titik
export const formatSalaryInput = (raw: string): string => {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  const num = parseInt(digits, 10);
  return `Rp ${num.toLocaleString('id-ID')}`;
};

export const getTodayFormatted = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return fromISODate(`${year}-${month}-${day}`);
};


export const TrackerView: React.FC = () => {
  const [apps, setApps] = useState<ApplicationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isReminderHubOpen, setIsReminderHubOpen] = useState<boolean>(false);
  const [dismissedReminderIds, setDismissedReminderIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('employr_dismissed_reminders');
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const handleDismissReminder = (id: string) => {
    setDismissedReminderIds((prev) => {
      const updated = [...prev, id];
      try {
        localStorage.setItem('employr_dismissed_reminders', JSON.stringify(updated));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('employr_reminders_updated'));
        }
      } catch {}
      return updated;
    });
  };

  const reminders = React.useMemo(() => {
    const all = calculateApplicationReminders(apps);
    return all.filter((r) => !dismissedReminderIds.includes(r.id));
  }, [apps, dismissedReminderIds]);

  const reminderByAppId = React.useMemo(() => {
    const map = new Map<string, TrackerReminder>();
    reminders.forEach((r) => {
      if (r.appId && !map.has(r.appId)) {
        map.set(r.appId, r);
      }
    });
    return map;
  }, [reminders]);


  const getIgnoredInterviewAppIds = (): Set<string> => {
    if (typeof window === 'undefined') return new Set();
    try {
      const raw = localStorage.getItem('employr_ignored_interview_reminders');
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  };

  const setAppInterviewIgnored = (appId: string, ignored: boolean) => {
    if (typeof window === 'undefined') return;
    try {
      const current = getIgnoredInterviewAppIds();
      if (ignored) {
        current.add(appId);
      } else {
        current.delete(appId);
      }
      localStorage.setItem('employr_ignored_interview_reminders', JSON.stringify(Array.from(current)));
    } catch {
      // ignore
    }
  };

  const fetchApplications = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    try {
      setErrorMessage(null);
      const remoteApps = await trackerApi.getAll<ApplicationItem>();
      if (Array.isArray(remoteApps)) {
        const ignoredIds = getIgnoredInterviewAppIds();
        const mergedApps = remoteApps.map((a) => ({
          ...a,
          ignoreInterviewReminder: a.ignoreInterviewReminder ?? ignoredIds.has(a.id),
        }));
        setApps(mergedApps);
      }
    } catch (err: any) {
      console.error('[TrackerView] Error fetching applications:', err);
      setErrorMessage('Lamaran belum tersimpan. Periksa koneksi internet Anda.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch real applications from API on mount
  useEffect(() => {
    fetchApplications();
  }, []);


  // Pointer Drag and Drop State
  const [activeDragItem, setActiveDragItem] = useState<ApplicationItem | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragWidth, setDragWidth] = useState<number>(280);
  const [dragOverColumn, setDragOverColumn] = useState<ApplicationItem['status'] | null>(null);

  // Fullscreen Offering Celebration state & Offering Preparation Modal state
  const [showOfferingCelebration, setShowOfferingCelebration] = useState(false);
  const [celebrationKey, setCelebrationKey] = useState(0);
  const [celebratingApp, setCelebratingApp] = useState<ApplicationItem | null>(null);

  const [isOfferingModalOpen, setIsOfferingModalOpen] = useState(false);
  const [offeringModalApp, setOfferingModalApp] = useState<ApplicationItem | null>(null);

  const triggerOfferingCelebration = (app?: ApplicationItem) => {
    if (app) setCelebratingApp(app);
    setCelebrationKey((prev) => prev + 1);
    setShowOfferingCelebration(true);
  };

  const handleOpenOfferingModal = (app: ApplicationItem) => {
    setOfferingModalApp(app);
    setIsOfferingModalOpen(true);
  };

  const handleSaveOfferingPreparation = async (
    appId: string,
    data: {
      offeringSalary?: string;
      offeringDeadline?: string;
      offeringStartDate?: string;
      offeringNotes?: string;
      offeringChecklist?: string[];
    }
  ) => {
    setApps((prev) =>
      prev.map((a) =>
        a.id === appId
          ? {
              ...a,
              salary: data.offeringSalary || a.salary,
              offerDeadline: data.offeringDeadline,
              deadlineDate: data.offeringDeadline || a.deadlineDate,
              notes: data.offeringNotes !== undefined ? data.offeringNotes : a.notes,
              offeringChecklist: data.offeringChecklist,
              offeringStartDate: data.offeringStartDate,
            }
          : a
      )
    );

    try {
      await trackerApi.update(appId, {
        salary: data.offeringSalary,
        offerDeadline: data.offeringDeadline,
        deadlineDate: data.offeringDeadline,
        notes: data.offeringNotes,
        offeringChecklist: data.offeringChecklist,
        offeringStartDate: data.offeringStartDate,
      });
    } catch (err) {
      console.error('[TrackerView] Failed to save offering preparation:', err);
    }
  };

  useEffect(() => {
    if (!showOfferingCelebration) return;
    const timer = setTimeout(() => {
      setShowOfferingCelebration(false);
    }, 5500);
    return () => clearTimeout(timer);
  }, [showOfferingCelebration, celebrationKey]);

  const handlePointerDownCard = (e: React.PointerEvent<HTMLDivElement>, app: ApplicationItem) => {
    // Skip if clicking delete button
    if ((e.target as HTMLElement).closest('button')) return;
    if (e.button !== 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    setActiveDragItem(app);
    setDragPos({ x: e.clientX, y: e.clientY });
    setDragOffset({ x: offsetX, y: offsetY });
    setDragWidth(rect.width);
    setDragOverColumn(app.status);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      setDragPos({ x: moveEvent.clientX, y: moveEvent.clientY });

      const elemBelow = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
      const colElem = elemBelow?.closest('[data-column-status]');
      if (colElem) {
        const targetStatus = colElem.getAttribute('data-column-status') as ApplicationItem['status'];
        setDragOverColumn(targetStatus);
      } else {
        setDragOverColumn(null);
      }
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);

      const elemBelow = document.elementFromPoint(upEvent.clientX, upEvent.clientY);
      const colElem = elemBelow?.closest('[data-column-status]');
      if (colElem) {
        const targetStatus = colElem.getAttribute('data-column-status') as ApplicationItem['status'];
        if (targetStatus && targetStatus !== app.status) {
          if (targetStatus === 'Interview') {
            const hasExistingInterviewData = Boolean(
              app.interviewDate || app.interviewTime || (app.interviewChecklist && app.interviewChecklist.length > 0)
            );
            const isIgnored = app.ignoreInterviewReminder || isAppInterviewIgnored(app.id);

            // Jika kartu sudah memiliki jadwal & persiapan (misal dari Offering / Ditolak dikembalikan ke Interview),
            // langsung gunakan data yang sama tanpa perlu memaksa pengguna mengisi ulang dari awal!
            if (hasExistingInterviewData || isIgnored) {
              handleUpdateStatus(app.id, 'Interview');
            } else {
              handleOpenInterviewModal(app);
            }
          } else {
            handleUpdateStatus(app.id, targetStatus);
          }
        }
      }

      setActiveDragItem(null);
      setDragOverColumn(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
  };

  // Interview Schedule & Preparation Modal State
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [interviewModalApp, setInterviewModalApp] = useState<ApplicationItem | null>(null);

  const handleOpenInterviewModal = (app: ApplicationItem) => {
    setInterviewModalApp(app);
    setIsInterviewModalOpen(true);
  };

  const handleSaveInterviewSchedule = async (
    appId: string,
    scheduleData: {
      interviewDate: string;
      interviewTime: string;
      interviewTimezone: 'WIB' | 'WITA' | 'WIT';
      interviewChecklist: string[];
    }
  ) => {
    setIsInterviewModalOpen(false);
    setInterviewModalApp(null);

    setApps((prev) =>
      prev.map((a) =>
        a.id === appId
          ? {
              ...a,
              status: 'Interview',
              interviewDate: scheduleData.interviewDate,
              interviewTime: scheduleData.interviewTime,
              interviewTimezone: scheduleData.interviewTimezone,
              interviewChecklist: scheduleData.interviewChecklist,
              ignoreInterviewReminder: false,
            }
          : a
      )
    );
    setAppInterviewIgnored(appId, false);

    try {
      await trackerApi.update(appId, {
        status: 'Interview',
        interviewDate: scheduleData.interviewDate,
        interviewTime: scheduleData.interviewTime,
        interviewTimezone: scheduleData.interviewTimezone,
        interviewChecklist: scheduleData.interviewChecklist,
        ignoreInterviewReminder: false,
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('employr_reminders_updated'));
      }
    } catch (err) {
      console.error('[TrackerView] Failed to save interview schedule:', err);
      setErrorMessage('Lamaran belum tersimpan. Periksa koneksi internet Anda.');
    }
  };

  const handleIgnoreInterviewReminder = async (appId: string) => {
    setIsInterviewModalOpen(false);
    setInterviewModalApp(null);

    setApps((prev) =>
      prev.map((a) =>
        a.id === appId
          ? {
              ...a,
              status: 'Interview',
              ignoreInterviewReminder: true,
            }
          : a
      )
    );
    setAppInterviewIgnored(appId, true);

    try {
      await trackerApi.update(appId, {
        status: 'Interview',
        ignoreInterviewReminder: true,
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('employr_reminders_updated'));
      }
    } catch (err) {
      console.error('[TrackerView] Failed to ignore interview reminder:', err);
      setErrorMessage('Lamaran belum tersimpan. Periksa koneksi internet Anda.');
    }
  };

  // Post-Interview Review Modal State & Handlers
  const [postInterviewApp, setPostInterviewApp] = useState<ApplicationItem | null>(null);

  const handleOpenPostInterviewModal = (app: ApplicationItem) => {
    setPostInterviewApp(app);
  };

  const handleUpdatePostInterviewStatus = async (
    appId: string,
    newStatus: ApplicationItem['status'],
    interviewNotes?: string,
    interviewResult?: 'waiting' | 'passed_next_round' | 'offering' | 'rejected'
  ) => {
    setApps((prev) =>
      prev.map((a) =>
        a.id === appId
          ? {
              ...a,
              status: newStatus,
              ...(interviewNotes !== undefined ? { interviewNotes } : {}),
              ...(interviewResult !== undefined ? { interviewResult } : {}),
            }
          : a
      )
    );

    if (newStatus === 'Offering') {
      const target = apps.find((a) => a.id === appId);
      triggerOfferingCelebration(target || undefined);
    }

    try {
      await trackerApi.update(appId, {
        status: newStatus,
        interviewNotes,
        interviewResult,
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('employr_reminders_updated'));
      }
    } catch (err) {
      console.error('[TrackerView] Failed to update post interview status:', err);
      fetchApplications();
    }
  };

  const handleScheduleNextRound = async (
    appId: string,
    scheduleData: {
      interviewDate: string;
      interviewTime: string;
      interviewTimezone: 'WIB' | 'WITA' | 'WIT';
      interviewChecklist: string[];
    },
    interviewNotes?: string
  ) => {
    setApps((prev) =>
      prev.map((a) =>
        a.id === appId
          ? {
              ...a,
              status: 'Interview',
              interviewDate: scheduleData.interviewDate,
              interviewTime: scheduleData.interviewTime,
              interviewTimezone: scheduleData.interviewTimezone,
              interviewChecklist: scheduleData.interviewChecklist,
              interviewResult: 'passed_next_round',
              ignoreInterviewReminder: false,
              ...(interviewNotes !== undefined ? { interviewNotes } : {}),
            }
          : a
      )
    );

    try {
      await trackerApi.update(appId, {
        status: 'Interview',
        interviewDate: scheduleData.interviewDate,
        interviewTime: scheduleData.interviewTime,
        interviewTimezone: scheduleData.interviewTimezone,
        interviewChecklist: scheduleData.interviewChecklist,
        interviewResult: 'passed_next_round',
        interviewNotes,
        ignoreInterviewReminder: false,
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('employr_reminders_updated'));
      }
    } catch (err) {
      console.error('[TrackerView] Failed to schedule next round:', err);
      fetchApplications();
    }
  };

  const handleSaveInterviewNotesOnly = async (appId: string, interviewNotes: string) => {
    setApps((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, interviewNotes } : a))
    );

    try {
      await trackerApi.update(appId, { interviewNotes });
    } catch (err) {
      console.error('[TrackerView] Failed to save interview notes:', err);
      fetchApplications();
    }
  };

  // New Application Form State
  const [newCompany, setNewCompany] = useState('');
  const [newPosition, setNewPosition] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newAppliedDate, setNewAppliedDate] = useState('');
  const [newStatus, setNewStatus] = useState<ApplicationItem['status']>('Terkirim');
  const [newSalary, setNewSalary] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newPortal, setNewPortal] = useState('');
  const [newPortalUrl, setNewPortalUrl] = useState('');
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlMessage, setCrawlMessage] = useState<string | null>(null);

  const handleCrawlJobUrl = async () => {
    if (!newPortalUrl.trim() || isCrawling) return;
    setIsCrawling(true);
    setCrawlMessage(null);
    try {
      const res = await fetch('/api/crawl-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newPortalUrl.trim() }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        if (data.data.company) setNewCompany(data.data.company);
        if (data.data.title) setNewPosition(data.data.title);
        if (data.data.location && data.data.location !== 'Indonesia') setNewLocation(data.data.location);
        if (data.data.salary) setNewSalary(data.data.salary);
        if (data.data.portal) setNewPortal(data.data.portal);
        if (data.data.description && !newNotes) setNewNotes(data.data.description);
        setCrawlMessage('✨ Berhasil diekstrak & otomatis diterbitkan ke Portal Loker 3003!');
      } else {
        setCrawlMessage(data.message || 'Gagal mengekstrak tautan.');
      }
    } catch {
      setCrawlMessage('Kendala koneksi saat mengekstrak tautan.');
    } finally {
      setIsCrawling(false);
    }
  };

  const handleAddApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany || !newPosition || isSaving) return;

    setIsSaving(true);
    setErrorMessage(null);
    const finalPortal = newPortal.trim() || 'Custom Portal';

    let formattedPortalUrl = newPortalUrl.trim();
    if (formattedPortalUrl) {
      if (!/^https?:\/\//i.test(formattedPortalUrl)) {
        formattedPortalUrl = `https://${formattedPortalUrl}`;
      }
    }

    const tempId = `app-temp-${Date.now()}`;
    const newApp: ApplicationItem = {
      id: tempId,
      company: newCompany.trim(),
      position: newPosition.trim(),
      location: newLocation.trim() || 'Jakarta',
      appliedDate: newAppliedDate.trim() || getTodayFormatted(),
      status: newStatus,
      salary: newSalary.trim() || '-',
      notes: newNotes.trim(),
      portal: finalPortal,
      portalUrl: formattedPortalUrl,
    };

    // Optimistic UI update
    setApps((prev) => [newApp, ...prev]);
    setIsAddModalOpen(false);
    resetForm();

    if (newStatus === 'Offering') {
      triggerOfferingCelebration(newApp);
    }

    try {
      const created = await trackerApi.create(newApp);
      if (created && (created as any).id) {
        setApps((prev) =>
          prev.map((item) => (item.id === tempId ? { ...item, id: (created as any).id } : item))
        );
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('employr_reminders_updated'));
      }
    } catch (err) {
      console.error('[TrackerView] Failed to save application:', err);
      setErrorMessage('Lamaran belum tersimpan. Periksa koneksi internet Anda.');
      fetchApplications();
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setNewCompany('');
    setNewPosition('');
    setNewLocation('');
    setNewAppliedDate('');
    setNewStatus('Terkirim');
    setNewSalary('');
    setNewNotes('');
    setNewPortal('');
    setNewPortalUrl('');
  };


  const handleDeleteApp = async (id: string) => {
    const previous = [...apps];
    setApps((prev) => prev.filter((a) => a.id !== id));
    try {
      await trackerApi.delete(id);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('employr_reminders_updated'));
      }
    } catch (err) {
      console.error('[TrackerView] Failed to delete application:', err);
      setErrorMessage('Lamaran belum tersimpan. Periksa koneksi internet Anda.');
      setApps(previous);
    }
  };

  const handleUpdateStatus = async (id: string, status: ApplicationItem['status']) => {
    const previous = [...apps];
    const currentApp = apps.find((a) => a.id === id);
    const isReturningToInterview = status === 'Interview' && currentApp?.status !== 'Interview';
    const isMovingToOffering = status === 'Offering' && currentApp?.status !== 'Offering';
    const isMovingToDitolak = status === 'Ditolak' && currentApp?.status !== 'Ditolak';

    const resultUpdate: { interviewResult?: 'waiting' | 'offering' | 'rejected' } = {};
    if (isReturningToInterview) {
      resultUpdate.interviewResult = 'waiting';
    } else if (isMovingToOffering) {
      resultUpdate.interviewResult = 'offering';
    } else if (isMovingToDitolak) {
      resultUpdate.interviewResult = 'rejected';
    }

    setApps((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status, ...resultUpdate } : a))
    );

    if (isMovingToOffering) {
      triggerOfferingCelebration(currentApp || undefined);
    }
    try {
      if (Object.keys(resultUpdate).length > 0) {
        await trackerApi.update(id, { status, ...resultUpdate });
      } else {
        await trackerApi.updateStatus(id, status);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('employr_reminders_updated'));
      }
    } catch (err) {
      console.error('[TrackerView] Failed to update application status:', err);
      setErrorMessage('Lamaran belum tersimpan. Periksa koneksi internet Anda.');
      setApps(previous);
    }
  };

  const filteredApps = apps.filter((a) => {
    const matchesFilter = filterStatus === 'Semua' || a.status === filterStatus;
    const matchesSearch =
      a.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.portal || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Table Sorting State
  type SortField = 'company' | 'position' | 'location' | 'appliedDate' | 'salary' | 'status' | 'portal';
  type SortDirection = 'asc' | 'desc';

  const [sortField, setSortField] = useState<SortField | null>('appliedDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedAndFilteredApps = [...filteredApps].sort((a, b) => {
    if (!sortField) return 0;

    let valA: string | number = '';
    let valB: string | number = '';

    if (sortField === 'company') {
      valA = a.company.toLowerCase();
      valB = b.company.toLowerCase();
    } else if (sortField === 'position') {
      valA = a.position.toLowerCase();
      valB = b.position.toLowerCase();
    } else if (sortField === 'location') {
      valA = a.location.toLowerCase();
      valB = b.location.toLowerCase();
    } else if (sortField === 'appliedDate') {
      valA = a.appliedDate.toLowerCase();
      valB = b.appliedDate.toLowerCase();
    } else if (sortField === 'salary') {
      valA = a.salary.toLowerCase();
      valB = b.salary.toLowerCase();
    } else if (sortField === 'portal') {
      valA = (a.portal || '').toLowerCase();
      valB = (b.portal || '').toLowerCase();
    } else if (sortField === 'status') {
      const statusOrder: Record<string, number> = {
        'Terkirim': 1,
        'Screening': 2,
        'Interview': 3,
        'Offering': 4,
        'Ditolak': 5,
      };
      valA = statusOrder[a.status] || 99;
      valB = statusOrder[b.status] || 99;
    }

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const getStatusBadgeClass = (status: ApplicationItem['status']) => {
    switch (status) {
      case 'Offering':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50';
      case 'Interview':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400 border-amber-200 dark:border-amber-800/50';
      case 'Screening':
        return 'bg-orange-50 text-orange-700 dark:bg-orange-950/80 dark:text-orange-400 border-orange-200 dark:border-orange-800/50';
      case 'Terkirim':
        return 'bg-sky-50 text-sky-700 dark:bg-sky-950/80 dark:text-sky-400 border-sky-200 dark:border-sky-800/50';
      case 'Ditolak':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400 border-rose-200 dark:border-rose-800/50';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const counts = {
    total: apps.length,
    terkirim: apps.filter((a) => a.status === 'Terkirim' || a.status === 'Screening').length,
    interview: apps.filter((a) => a.status === 'Interview').length,
    offering: apps.filter((a) => a.status === 'Offering').length,
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header Standardized */}
      <PageHeader
        title="Tracker Lamaran Kerja"
        subtitle="Pantau alur dan status semua lamaran kerja kamu dari interview hingga offering letter dalam satu tempat."
        icon={Briefcase}
        badge="Job Tracker"
        stats={[
          { label: 'Total', value: counts.total, icon: Briefcase },
          { label: 'Screening', value: counts.terkirim, icon: FileText, colorClass: 'text-sky-600 dark:text-sky-400' },
          { label: 'Interview', value: counts.interview, icon: Calendar, colorClass: 'text-indigo-600 dark:text-indigo-400' },
          { label: 'Offering', value: counts.offering, icon: Sparkles, colorClass: 'text-emerald-600 dark:text-emerald-400' },
        ]}
        actions={
          <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsReminderHubOpen(true)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-[10px] bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition cursor-pointer relative"
              title="Pusat Pengingat & Tindakan"
            >
              <BellRing className={`w-3.5 h-3.5 ${reminders.length > 0 ? 'text-orange-400' : ''}`} />
              <span className="hidden sm:inline">Pengingat</span>
              {reminders.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-orange-500 text-white shadow-xs leading-none">
                  {reminders.length}
                </span>
              )}
            </button>
            <button
              onClick={() => fetchApplications(true)}
              disabled={isRefreshing || isLoading}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-[10px] bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition cursor-pointer disabled:opacity-50"
              title="Sinkronkan dengan Database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sinkronisasi</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-black text-xs shadow-md shadow-orange-500/30 transition shrink-0 cursor-pointer border-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Lamaran</span>
            </button>
          </div>
        }
      />

      {/* Smart Reminder Alert Banner with Swipe to Dismiss */}
      <SwipeableReminderBanner
        reminders={reminders}
        onDismissReminder={handleDismissReminder}
        onOpenReminderHub={() => setIsReminderHubOpen(true)}
      />

      {/* Error Message Toast / Alert */}
      {errorMessage && (
        <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 px-4 py-3 rounded-[10px] text-xs flex items-center justify-between shadow-xs">
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-700 font-bold ml-3 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Control Bar: View Switcher (Kanban vs Table), Search, and Status Filter — hanya tampil saat sudah ada lamaran */}
      {!isLoading && apps.length > 0 && (
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-[10px] border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Toggle View Mode Buttons */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-[10px] border border-slate-200 dark:border-slate-700 shrink-0">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-bold transition cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-[#1738D1] text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-bold transition cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#1738D1] text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Tabel</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari perusahaan atau posisi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1738D1]"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {['Semua', 'Terkirim', 'Screening', 'Interview', 'Offering', 'Ditolak'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 rounded-[10px] text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === status
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="flex lg:grid lg:grid-cols-5 gap-4 overflow-x-auto pb-4 pt-1 items-start min-h-[450px]">
          {KANBAN_COLUMNS.map((col) => (
            <div
              key={col.status}
              className="shrink-0 w-[85vw] sm:w-[320px] lg:w-auto rounded-[10px] border border-slate-200/80 dark:border-slate-800 p-3 space-y-3 bg-white/40 dark:bg-slate-900/40 animate-pulse"
            >
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-[10px] w-24 mb-3" />
              <div className="h-28 bg-slate-100 dark:bg-slate-800/60 rounded-[10px] w-full" />
              <div className="h-28 bg-slate-100 dark:bg-slate-800/60 rounded-[10px] w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State: Belum Ada Lamaran (Clean, Focused & Anti-Slop UI) */}
      {!isLoading && apps.length === 0 && (
        <div className="rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-12 text-center flex flex-col items-center gap-6 shadow-xs animate-in fade-in duration-300">
          {/* Visual Icon Mark */}
          <div className="w-14 h-14 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[#1738D1] dark:text-blue-400 shadow-2xs">
            <Kanban className="w-7 h-7" />
          </div>

          {/* Headline & Description */}
          <div className="space-y-2 max-w-xl mx-auto">
            <span className="inline-block px-3 py-1 rounded-[10px] text-[10px] font-bold uppercase tracking-wider bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
              Mulai dari Sini
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Belum Ada Lamaran, Yuk Mulai!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Catat setiap lamaran kerja yang kamu kirim dan pantau progresnya — dari Terkirim, Screening, Interview, hingga Offering Letter — semua terpusat di satu dashboard.
            </p>
          </div>


          {/* CTA Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1 w-full sm:w-auto">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-[#1738D1]/20 transition flex items-center justify-center gap-2 cursor-pointer border-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Lamaran Pertama</span>
            </button>
            <Link
              href="/match-cv"
              className="w-full sm:w-auto px-5 py-2.5 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Cari Lowongan</span>
            </Link>
          </div>
        </div>
      )}

      {/* VIEW 1: KANBAN BOARD */}
      {!isLoading && apps.length > 0 && viewMode === 'kanban' && (
        <div className="space-y-3">
          <div className="flex lg:grid lg:grid-cols-5 gap-4 overflow-x-auto snap-x snap-mandatory pb-4 pt-1 items-start min-h-[450px]">
            {KANBAN_COLUMNS.map((col) => {
              const columnApps = filteredApps.filter((a) => a.status === col.status);
              const isOver = dragOverColumn === col.status;

              return (
                <div
                  key={col.status}
                  data-column-status={col.status}
                  className={`snap-center shrink-0 w-[85vw] sm:w-[320px] lg:w-auto rounded-[10px] border transition-all duration-200 p-3 space-y-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs ${
                    isOver
                      ? 'border-[#1738D1] ring-2 ring-[#1738D1]/30 bg-orange-50/50 dark:bg-orange-950/30 scale-[1.01]'
                      : `${col.colorClass}`
                  }`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-[10px] text-[11px] font-bold border flex items-center gap-1.5 ${col.badgeBg}`}>
                        {col.status === 'Offering' && columnApps.length > 0 && (
                          <DotLottiePlayer
                            src="/animations/offering-celebration.json"
                            autoplay={true}
                            loop={true}
                            className="w-4 h-4"
                          />
                        )}
                        <span>{col.label}</span>
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-[10px] border border-slate-200 dark:border-slate-700">
                      {columnApps.length}
                    </span>
                  </div>

                  {/* Cards List in Column */}
                  <div className="space-y-3 min-h-[220px] transition-all">
                    {columnApps.length === 0 ? (
                      <div
                        className={`p-6 text-center text-[11px] border border-dashed rounded-[10px] min-h-[160px] transition-all flex flex-col items-center justify-center gap-2 select-none ${
                          isOver
                            ? 'border-orange-400 bg-orange-50/60 dark:bg-orange-950/30 text-orange-600 dark:text-orange-300 font-bold scale-[1.01]'
                            : 'border-slate-200 dark:border-slate-800 text-slate-400'
                        }`}
                      >
                        {(() => {
                          const config = COLUMN_EMPTY_STATES[col.status];
                          const IconComp = config.icon;
                          return (
                            <>
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform ${
                                  isOver
                                    ? 'scale-110 bg-orange-100 dark:bg-orange-900/60 text-orange-600'
                                    : config.bgClass
                                }`}
                              >
                                <IconComp className="w-4 h-4" />
                              </div>
                              <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
                                {isOver ? 'Lepas kartu di sini!' : config.label}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {isOver ? 'Pindahkan ke kolom ini' : 'Tarik kartu ke sini'}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    ) : (
                      columnApps.map((app) => {
                        const isDragging = activeDragItem?.id === app.id;

                        if (isDragging) {
                          return (
                            <div
                              key={app.id}
                              className="h-[95px] rounded-[10px] border-2 border-dashed border-orange-400/30 bg-orange-50/40 dark:bg-orange-950/20 transition-all flex items-center justify-center text-orange-500 dark:text-orange-400 text-xs font-semibold select-none"
                            >
                              Pindahkan ke kolom baru...
                            </div>
                          );
                        }

                        const palette = getCardPalette(app.id);

                        return (
                          <div
                            key={app.id}
                            onPointerDown={(e) => handlePointerDownCard(e, app)}
                            className={`group ${palette.bg} rounded-[10px] p-3.5 border ${palette.border} ${palette.hoverBorder} shadow-2xs hover:shadow-md transition-all space-y-2.5 cursor-grab active:cursor-grabbing relative select-none touch-none overflow-hidden`}
                          >
                            {/* Top Accent Strip */}
                            <div className={`absolute top-0 left-0 right-0 h-1 ${palette.accentBar}`} />

                            <div className="flex items-start justify-between gap-2 pt-0.5">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className={`w-2 h-2 rounded-full ${palette.dotBg} shrink-0`} />
                                  <h4
                                    className="font-bold text-xs text-slate-900 dark:text-white leading-snug truncate whitespace-nowrap overflow-hidden text-ellipsis min-w-0"
                                    title={app.position}
                                  >
                                    {app.position}
                                  </h4>
                                </div>
                                <p
                                  className={`text-[11px] ${palette.companyText} mt-1 truncate whitespace-nowrap overflow-hidden text-ellipsis min-w-0`}
                                  title={app.company}
                                >
                                  {app.company}
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteApp(app.id);
                                }}
                                className="text-slate-400 hover:text-rose-600 transition p-1 shrink-0 cursor-pointer"
                                title="Hapus"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <MapPin className={`w-3.5 h-3.5 ${palette.iconColor} shrink-0`} />
                                <span className="truncate whitespace-nowrap overflow-hidden text-ellipsis min-w-0" title={app.location}>
                                  {app.location}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 min-w-0">
                                <Calendar className={`w-3.5 h-3.5 ${palette.iconColor} shrink-0`} />
                                <span className="truncate whitespace-nowrap overflow-hidden text-ellipsis min-w-0" title={app.appliedDate}>
                                  {app.appliedDate}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 min-w-0">
                                <Globe className={`w-3.5 h-3.5 ${palette.iconColor} shrink-0`} />
                                {app.portalUrl ? (
                                  <a
                                    href={app.portalUrl.startsWith('http') ? app.portalUrl : `https://${app.portalUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    onPointerDown={(e) => e.stopPropagation()}
                                    className="truncate whitespace-nowrap overflow-hidden text-ellipsis min-w-0 font-bold hover:underline flex items-center gap-1 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 cursor-pointer"
                                    title={`Buka portal ${app.portal} (${app.portalUrl})`}
                                  >
                                    <span>{app.portal || 'Direct'}</span>
                                    <ExternalLink className="w-3 h-3 shrink-0 opacity-80" />
                                  </a>
                                ) : (
                                  <span className="truncate whitespace-nowrap overflow-hidden text-ellipsis min-w-0 font-medium" title={app.portal || 'Direct'}>
                                    {app.portal || 'Direct'}
                                  </span>
                                )}
                              </div>
                              {app.salary !== '-' && (
                                <div className={`flex items-center gap-1.5 font-bold px-2 py-0.5 rounded-[10px] ${palette.tagBg} ${palette.tagText} max-w-full min-w-0 mt-1`}>
                                  <span className="truncate whitespace-nowrap overflow-hidden text-ellipsis min-w-0" title={app.salary}>
                                    {app.salary}
                                  </span>
                                </div>
                              )}

                              {/* Interview Specific Info Badge / Button */}
                              {app.status === 'Interview' && (() => {
                                const isIgnored = app.ignoreInterviewReminder || isAppInterviewIgnored(app.id);
                                if (isIgnored) {
                                  return (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenInterviewModal(app);
                                      }}
                                      onPointerDown={(e) => e.stopPropagation()}
                                      className="w-full flex items-center justify-between gap-1.5 px-2 py-1 rounded-[8px] bg-slate-100/90 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-[#1738D1] dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 text-[10px] font-medium transition cursor-pointer mt-1"
                                      title="Pengingat dinonaktifkan. Klik untuk atur jadwal & checklist."
                                    >
                                      <div className="flex items-center gap-1">
                                        <BellOff className="w-3 h-3 text-slate-400 shrink-0" />
                                        <span>Bebas Pengingat</span>
                                      </div>
                                      <span className="text-[9px] text-slate-400 underline">Atur</span>
                                    </button>
                                  );
                                }

                                if (app.interviewDate || app.interviewTime) {
                                  const parsedDate = app.interviewDate ? parseIndonesianDate(app.interviewDate) : null;
                                  const diffDays = parsedDate ? getDayDiff(parsedDate, new Date()) : null;
                                  const isPastInterview = diffDays !== null && diffDays < 0;

                                  if (isPastInterview) {
                                    const absDays = Math.abs(diffDays);
                                    const tagText = absDays === 1 ? 'Kemarin' : absDays < 7 ? `H+${absDays}` : absDays < 14 ? '1 mg lalu' : `${Math.floor(absDays / 7)} mg lalu`;

                                    return (
                                      <div className="space-y-1 mt-1">
                                        <div className="flex items-center gap-1">
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleOpenPostInterviewModal(app);
                                            }}
                                            onPointerDown={(e) => e.stopPropagation()}
                                            className="flex-1 flex items-center justify-between gap-1 px-2.5 py-1.5 rounded-[8px] bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 text-amber-900 dark:text-amber-200 border border-amber-300/80 dark:border-amber-700/60 text-[10px] font-bold transition hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-100/60 cursor-pointer shadow-2xs min-w-0"
                                            title="Wawancara telah selesai. Klik untuk evaluasi hasil, catat pertanyaan, atau perbarui status"
                                          >
                                            <div className="flex items-center gap-1.5 truncate min-w-0">
                                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                                              <span className="truncate">
                                                {app.interviewNotes ? 'Evaluasi Ada • Cek Hasil' : 'Selesai • Gimana hasilnya?'}
                                              </span>
                                            </div>
                                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 shrink-0 font-extrabold">
                                              {tagText}
                                            </span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleOpenInterviewModal(app);
                                            }}
                                            onPointerDown={(e) => e.stopPropagation()}
                                            className="p-1.5 rounded-[8px] border border-amber-200 dark:border-amber-800 bg-amber-50/70 hover:bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 transition cursor-pointer shrink-0"
                                            title="Buka / ubah jadwal interview & checklist persiapan"
                                          >
                                            <CalendarCheck className="w-3.5 h-3.5" />
                                          </button>
                                        </div>

                                        {app.interviewNotes && (
                                          <div
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleOpenPostInterviewModal(app);
                                            }}
                                            onPointerDown={(e) => e.stopPropagation()}
                                            className="text-[10px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/70 p-1.5 rounded-[6px] border border-slate-200/80 dark:border-slate-700/60 line-clamp-2 cursor-pointer hover:border-amber-300 transition leading-snug"
                                            title="Klik untuk lihat/edit catatan evaluasi lengkap"
                                          >
                                            <span className="font-semibold text-orange-600 dark:text-orange-400 mr-1">Evaluasi:</span>
                                            {app.interviewNotes}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  }

                                  const checklistCount = app.interviewChecklist?.length || 0;
                                  return (
                                    <div className="space-y-1 mt-1">
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenInterviewModal(app);
                                          }}
                                          onPointerDown={(e) => e.stopPropagation()}
                                          className="flex-1 flex items-center justify-between gap-1 px-2 py-1 rounded-[8px] bg-indigo-50/90 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/90 dark:border-indigo-800/80 text-[10px] font-bold transition hover:bg-indigo-100 dark:hover:bg-indigo-900/60 cursor-pointer min-w-0"
                                          title="Klik untuk ubah jadwal atau cek persiapan interview"
                                        >
                                          <div className="flex items-center gap-1 truncate min-w-0">
                                            <CalendarCheck className="w-3 h-3 text-[#1738D1] dark:text-blue-400 shrink-0" />
                                            <span className="truncate">
                                              {app.interviewDate || 'Wawancara'} {app.interviewTime ? `• ${app.interviewTime} ${app.interviewTimezone || 'WIB'}` : ''}
                                            </span>
                                          </div>
                                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shrink-0 font-bold">
                                            {checklistCount}/5 Siap
                                          </span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenPostInterviewModal(app);
                                          }}
                                          onPointerDown={(e) => e.stopPropagation()}
                                          className="px-2 py-1 rounded-[8px] border border-amber-300 dark:border-amber-700/80 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 text-[10px] font-bold transition cursor-pointer flex items-center gap-1 shrink-0 shadow-2xs"
                                          title="Klik untuk evaluasi hasil wawancara (Gimana hasilnya?)"
                                        >
                                          <CheckCircle2 className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                          <span>Hasil?</span>
                                        </button>
                                      </div>
                                    </div>
                                  );
                                }

                                return (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenInterviewModal(app);
                                    }}
                                    onPointerDown={(e) => e.stopPropagation()}
                                    className="w-full flex items-center justify-between gap-1.5 px-2 py-1 rounded-[8px] bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/90 dark:border-amber-800 text-[10px] font-bold hover:bg-amber-100 transition cursor-pointer mt-1"
                                    title="Klik untuk input jam wawancara dan checklist persiapan"
                                  >
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                                      <span>Input Jam &amp; Checklist</span>
                                    </div>
                                    <span className="text-[9px] underline">Isi</span>
                                  </button>
                                );
                              })()}

                              {/* Offering Specific Preparation Badge / Button */}
                              {app.status === 'Offering' && (() => {
                                const checklistCount = app.offeringChecklist?.length || 0;
                                const isAllDone = checklistCount >= 7;

                                return (
                                  <div className="space-y-1.5 mt-1">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenOfferingModal(app);
                                      }}
                                      onPointerDown={(e) => e.stopPropagation()}
                                      className="w-full flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-[8px] bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-teal-500/10 hover:from-emerald-500/25 hover:to-teal-500/20 text-emerald-900 dark:text-emerald-200 border border-emerald-300/90 dark:border-emerald-700/70 text-[10px] font-bold transition cursor-pointer shadow-2xs group/offering"
                                      title="Klik untuk buka panduan & checklist persiapan offering (Gaji Gross vs Nett, denda, probation, dokumen)"
                                    >
                                      <div className="flex items-center gap-1.5 truncate min-w-0">
                                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 animate-pulse" />
                                        <span className="truncate">Persiapan Offering</span>
                                      </div>
                                      <span className={`text-[9px] px-1.5 py-0.2 rounded border shrink-0 font-extrabold ${
                                        isAllDone
                                          ? 'bg-emerald-600 text-white border-emerald-600'
                                          : checklistCount > 0
                                          ? 'bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
                                          : 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                      }`}>
                                        {checklistCount > 0 ? `${checklistCount}/7 Siap` : 'Cek Panduan'}
                                      </span>
                                    </button>

                                    {(app.offerDeadline || app.offeringStartDate) && (
                                      <div className="flex items-center gap-1.5 text-[9.5px] text-slate-500 dark:text-slate-400 px-1 truncate">
                                        {app.offerDeadline && (
                                          <span className="truncate" title={`Batas konfirmasi: ${app.offerDeadline}`}>
                                            Batas: {app.offerDeadline}
                                          </span>
                                        )}
                                        {app.offerDeadline && app.offeringStartDate && <span>•</span>}
                                        {app.offeringStartDate && (
                                          <span className="truncate" title={`Mulai kerja: ${app.offeringStartDate}`}>
                                            Mulai: {app.offeringStartDate}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}

                              {(() => {
                                const appReminder = reminderByAppId.get(app.id);
                                if (!appReminder) return null;
                                return (
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setIsReminderHubOpen(true);
                                    }}
                                    onPointerDown={(e) => e.stopPropagation()}
                                    className="flex items-center gap-1.5 px-2 py-1 rounded-[8px] bg-orange-100/90 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 border border-orange-200/90 dark:border-orange-800 text-[10px] font-bold cursor-pointer hover:bg-orange-200/90 dark:hover:bg-orange-900/90 transition shadow-2xs mt-1"
                                    title={appReminder.message}
                                  >
                                    <Clock className="w-3 h-3 shrink-0 text-orange-500" />
                                    <span className="truncate">{appReminder.title}</span>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floating Card Overlay Saat Ditarik (100% Solid Card Tanpa Bayangan Transparan) */}
          {activeDragItem && (() => {
            const dragPalette = getCardPalette(activeDragItem.id);
            return (
              <div
                style={{
                  position: 'fixed',
                  left: dragPos.x - dragOffset.x,
                  top: dragPos.y - dragOffset.y,
                  width: dragWidth,
                  pointerEvents: 'none',
                  zIndex: 9999,
                }}
                className={`${dragPalette.bg} rounded-[10px] p-3.5 border-2 border-[#1738D1] shadow-2xl scale-[1.03] rotate-1 space-y-2.5 opacity-100 ring-4 ring-[#1738D1]/20 select-none overflow-hidden`}
              >
                {/* Top Accent Strip */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${dragPalette.accentBar}`} />

                <div className="flex items-start justify-between gap-2 pt-0.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`w-2 h-2 rounded-full ${dragPalette.dotBg} shrink-0`} />
                      <h4
                        className="font-bold text-xs text-slate-900 dark:text-white leading-snug truncate whitespace-nowrap overflow-hidden text-ellipsis min-w-0"
                        title={activeDragItem.position}
                      >
                        {activeDragItem.position}
                      </h4>
                    </div>
                    <p
                      className={`text-[11px] ${dragPalette.companyText} mt-1 truncate whitespace-nowrap overflow-hidden text-ellipsis min-w-0`}
                      title={activeDragItem.company}
                    >
                      {activeDragItem.company}
                    </p>
                  </div>
                  <div className="text-slate-400 p-1 shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <MapPin className={`w-3.5 h-3.5 ${dragPalette.iconColor} shrink-0`} />
                    <span className="truncate whitespace-nowrap overflow-hidden text-ellipsis min-w-0" title={activeDragItem.location}>
                      {activeDragItem.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Calendar className={`w-3.5 h-3.5 ${dragPalette.iconColor} shrink-0`} />
                    <span className="truncate whitespace-nowrap overflow-hidden text-ellipsis min-w-0" title={activeDragItem.appliedDate}>
                      {activeDragItem.appliedDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Globe className={`w-3.5 h-3.5 ${dragPalette.iconColor} shrink-0`} />
                    {activeDragItem.portalUrl ? (
                      <span className="truncate whitespace-nowrap overflow-hidden text-ellipsis min-w-0 font-bold flex items-center gap-1 text-orange-600 dark:text-orange-400">
                        <span>{activeDragItem.portal || 'Direct'}</span>
                        <ExternalLink className="w-3 h-3 shrink-0 opacity-80" />
                      </span>
                    ) : (
                      <span className="truncate whitespace-nowrap overflow-hidden text-ellipsis min-w-0 font-medium" title={activeDragItem.portal || 'Direct'}>
                        {activeDragItem.portal || 'Direct'}
                      </span>
                    )}
                  </div>
                  {activeDragItem.salary !== '-' && (
                    <div className={`flex items-center gap-1.5 font-bold px-2 py-0.5 rounded-[10px] ${dragPalette.tagBg} ${dragPalette.tagText} max-w-full min-w-0 mt-1`}>
                      <span className="truncate whitespace-nowrap overflow-hidden text-ellipsis min-w-0" title={activeDragItem.salary}>
                        {activeDragItem.salary}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* VIEW 2: LIST TABEL */}
      {!isLoading && apps.length > 0 && viewMode === 'table' && (
        <div className="bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">
                    <button
                      onClick={() => handleSort('position')}
                      className={`flex items-center gap-1.5 hover:text-orange-600 dark:hover:text-orange-400 transition cursor-pointer select-none ${
                        sortField === 'position' || sortField === 'company' ? 'text-orange-600 dark:text-orange-400 font-black' : ''
                      }`}
                    >
                      <span>Perusahaan & Posisi</span>
                      {sortField === 'position' || sortField === 'company' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-50 shrink-0" />
                      )}
                    </button>
                  </th>
                  <th className="p-4">
                    <button
                      onClick={() => handleSort('location')}
                      className={`flex items-center gap-1.5 hover:text-orange-600 dark:hover:text-orange-400 transition cursor-pointer select-none ${
                        sortField === 'location' ? 'text-orange-600 dark:text-orange-400 font-black' : ''
                      }`}
                    >
                      <span>Lokasi</span>
                      {sortField === 'location' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-50 shrink-0" />
                      )}
                    </button>
                  </th>
                  <th className="p-4">
                    <button
                      onClick={() => handleSort('appliedDate')}
                      className={`flex items-center gap-1.5 hover:text-orange-600 dark:hover:text-orange-400 transition cursor-pointer select-none ${
                        sortField === 'appliedDate' ? 'text-orange-600 dark:text-orange-400 font-black' : ''
                      }`}
                    >
                      <span>Tanggal Melamar</span>
                      {sortField === 'appliedDate' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-50 shrink-0" />
                      )}
                    </button>
                  </th>
                  <th className="p-4">
                    <button
                      onClick={() => handleSort('portal')}
                      className={`flex items-center gap-1.5 hover:text-orange-600 dark:hover:text-orange-400 transition cursor-pointer select-none ${
                        sortField === 'portal' ? 'text-orange-600 dark:text-orange-400 font-black' : ''
                      }`}
                    >
                      <span>Portal Melamar</span>
                      {sortField === 'portal' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-50 shrink-0" />
                      )}
                    </button>
                  </th>
                  <th className="p-4">
                    <button
                      onClick={() => handleSort('salary')}
                      className={`flex items-center gap-1.5 hover:text-orange-600 dark:hover:text-orange-400 transition cursor-pointer select-none ${
                        sortField === 'salary' ? 'text-orange-600 dark:text-orange-400 font-black' : ''
                      }`}
                    >
                      <span>Ekspektasi Gaji</span>
                      {sortField === 'salary' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-50 shrink-0" />
                      )}
                    </button>
                  </th>
                  <th className="p-4">
                    <button
                      onClick={() => handleSort('status')}
                      className={`flex items-center gap-1.5 hover:text-orange-600 dark:hover:text-orange-400 transition cursor-pointer select-none ${
                        sortField === 'status' ? 'text-orange-600 dark:text-orange-400 font-black' : ''
                      }`}
                    >
                      <span>Status Seleksi</span>
                      {sortField === 'status' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-50 shrink-0" />
                      )}
                    </button>
                  </th>
                  <th className="p-4">Catatan</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {sortedAndFilteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-slate-400">
                      <DotLottiePlayer
                        src="/animations/empty-tracker.json"
                        autoplay={true}
                        loop={true}
                        className="w-20 h-20 mx-auto mb-2"
                        fallback={<Briefcase className="w-10 h-10 mx-auto text-slate-300 mb-2" />}
                      />
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Tidak ada lamaran ditemukan</p>
                      <p className="text-xs text-slate-400 mt-0.5">Coba sesuaikan kata kunci pencarian atau filter status kamu</p>
                    </td>
                  </tr>
                ) : (
                  sortedAndFilteredApps.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">
                          {app.position}
                        </div>
                        <div className="text-xs font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1.5 mt-0.5">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{app.company}</span>
                        </div>
                        {(() => {
                          const appReminder = reminderByAppId.get(app.id);
                          if (!appReminder) return null;
                          return (
                            <div
                              onClick={() => setIsReminderHubOpen(true)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 text-[10px] font-bold cursor-pointer hover:bg-orange-200 transition mt-1"
                              title={appReminder.message}
                            >
                              <Clock className="w-3 h-3 text-orange-500" />
                              <span>{appReminder.title}</span>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="p-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{app.location}</span>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{app.appliedDate}</span>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Globe className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                          {app.portalUrl ? (
                            <a
                              href={app.portalUrl.startsWith('http') ? app.portalUrl : `https://${app.portalUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline flex items-center gap-1 text-orange-600 dark:text-orange-400 font-bold"
                              title={`Buka link ${app.portal}`}
                            >
                              <span>{app.portal || '-'}</span>
                              <ExternalLink className="w-3 h-3 shrink-0 opacity-80" />
                            </a>
                          ) : (
                            <span>{app.portal || '-'}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap font-medium text-emerald-600 dark:text-emerald-400">
                        {app.salary}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="w-32">
                          <CustomSelect
                            value={app.status}
                            onChange={(val) => {
                              const newStatus = val as ApplicationItem['status'];
                              if (newStatus === app.status) return;
                              if (newStatus === 'Interview') {
                                const hasExistingInterviewData = Boolean(
                                  app.interviewDate || app.interviewTime || (app.interviewChecklist && app.interviewChecklist.length > 0)
                                );
                                const isIgnored = app.ignoreInterviewReminder || isAppInterviewIgnored(app.id);
                                if (hasExistingInterviewData || isIgnored) {
                                  handleUpdateStatus(app.id, 'Interview');
                                } else {
                                  handleOpenInterviewModal(app);
                                }
                              } else {
                                handleUpdateStatus(app.id, newStatus);
                              }
                            }}
                            options={['Terkirim', 'Screening', 'Interview', 'Offering', 'Ditolak']}
                            size="sm"
                          />
                        </div>
                      </td>
                      <td className="p-4 min-w-[200px] max-w-sm text-xs">
                        {app.status === 'Interview' ? (
                          <div className="space-y-1.5">
                            {(() => {
                              const isIgnored = app.ignoreInterviewReminder || isAppInterviewIgnored(app.id);
                              if (isIgnored) {
                                return (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenInterviewModal(app)}
                                    className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-[#1738D1] dark:hover:text-blue-400 transition cursor-pointer"
                                    title="Pengingat diabaikan. Klik untuk atur jadwal & persiapan."
                                  >
                                    <BellOff className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span>Bebas Pengingat</span>
                                  </button>
                                );
                              }
                              if (app.interviewDate || app.interviewTime) {
                                const parsedDate = app.interviewDate ? parseIndonesianDate(app.interviewDate) : null;
                                const diffDays = parsedDate ? getDayDiff(parsedDate, new Date()) : null;
                                const isPastInterview = diffDays !== null && diffDays < 0;

                                if (isPastInterview) {
                                  const absDays = Math.abs(diffDays);
                                  const tagText = absDays === 1 ? 'Kemarin' : absDays < 7 ? `H+${absDays}` : absDays < 14 ? '1 mg lalu' : `${Math.floor(absDays / 7)} mg lalu`;
                                  return (
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <button
                                        type="button"
                                        onClick={() => handleOpenPostInterviewModal(app)}
                                        className="inline-flex items-center gap-1 px-2 py-1 rounded-[6px] text-[10px] font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition cursor-pointer shadow-2xs"
                                        title="Wawancara telah selesai. Klik untuk evaluasi hasil"
                                      >
                                        <CheckCircle2 className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                                        <span>Selesai ({tagText}) • Cek Hasil</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleOpenInterviewModal(app)}
                                        className="p-1 rounded-[6px] border border-amber-200 dark:border-amber-800 bg-amber-50/50 hover:bg-amber-100 text-amber-700 dark:text-amber-300 transition cursor-pointer"
                                        title="Ubah jadwal & persiapan"
                                      >
                                        <CalendarCheck className="w-3 h-3" />
                                      </button>
                                    </div>
                                  );
                                }

                                return (
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenInterviewModal(app)}
                                      className="inline-flex items-center gap-1 px-2 py-1 rounded-[6px] text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/90 dark:border-indigo-800/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition cursor-pointer shadow-2xs"
                                      title="Klik untuk ubah jadwal & checklist persiapan"
                                    >
                                      <CalendarCheck className="w-3 h-3 text-indigo-500 shrink-0" />
                                      <span>{app.interviewDate || 'Wawancara'} {app.interviewTime ? `• ${app.interviewTime} ${app.interviewTimezone || 'WIB'}` : ''}</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenPostInterviewModal(app)}
                                      className="px-2 py-1 rounded-[6px] bg-amber-50 hover:bg-amber-100 text-amber-700 dark:text-amber-300 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[10px] font-bold transition cursor-pointer shadow-2xs flex items-center gap-1"
                                      title="Evaluasi hasil wawancara (Gimana hasilnya?)"
                                    >
                                      <CheckCircle2 className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                      <span>Hasil?</span>
                                    </button>
                                  </div>
                                );
                              }
                              return (
                                <button
                                  type="button"
                                  onClick={() => handleOpenInterviewModal(app)}
                                  className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-semibold hover:underline cursor-pointer"
                                >
                                  <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                                  <span>Atur Jam &amp; Checklist</span>
                                </button>
                              );
                            })()}

                            {/* Catatan / Evaluasi Text */}
                            {(app.interviewNotes || app.notes) && (
                              <p className="text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed text-xs">
                                {app.interviewNotes ? (
                                  <span>
                                    <strong className="text-orange-600 dark:text-orange-400 mr-1">Evaluasi:</strong>
                                    {app.interviewNotes}
                                  </span>
                                ) : (
                                  app.notes
                                )}
                              </p>
                            )}
                          </div>
                        ) : app.status === 'Offering' ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                type="button"
                                onClick={() => handleOpenOfferingModal(app)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300/80 dark:border-emerald-700/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition cursor-pointer shadow-2xs"
                                title="Buka checklist & panduan telaah penawaran kerja"
                              >
                                <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span>
                                  Persiapan Offering ({app.offeringChecklist?.length ? `${app.offeringChecklist.length}/7 Siap` : 'Cek Panduan'})
                                </span>
                              </button>
                            </div>
                            {(app.offerDeadline || app.offeringStartDate) && (
                              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                {app.offerDeadline ? `Batas: ${app.offerDeadline}` : ''}
                                {app.offerDeadline && app.offeringStartDate ? ' • ' : ''}
                                {app.offeringStartDate ? `Mulai: ${app.offeringStartDate}` : ''}
                              </p>
                            )}
                            {app.notes && (
                              <p className="text-slate-500 dark:text-slate-400 line-clamp-1 leading-relaxed text-xs">
                                {app.notes}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400 truncate block">
                            {app.notes || '-'}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteApp(app.id)}
                          className="p-1.5 rounded-[10px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sidebar Drawer Tambah Lamaran (Dari Kanan) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end transition-opacity">
          {/* Backdrop click listener */}
          <div
            className="absolute inset-0"
            onClick={() => setIsAddModalOpen(false)}
          />

          {/* Drawer Container */}
          <div className="relative z-10 w-full max-w-md sm:max-w-lg h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[10px] bg-[#1738D1] dark:bg-[#1738D1] text-white flex items-center justify-center shadow-md shadow-[#1738D1]/20 shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Tambah Lamaran Kerja
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Isi detail lamaran baru untuk dipantau di Kanban Board
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Tutup Sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content Form */}
            <form onSubmit={handleAddApplication} className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Nama Perusahaan <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Contoh: PT GoTo Gojek Tokopedia"
                      value={newCompany}
                      onChange={(e) => setNewCompany(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1738D1] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Posisi Pekerjaan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Senior Frontend Engineer"
                    value={newPosition}
                    onChange={(e) => setNewPosition(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1738D1] transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Lokasi Kerja
                    </label>
                    <CitySearchInput
                      value={newLocation}
                      onChange={(val) => setNewLocation(val)}
                      placeholder="Cari Kota / Kab di Indonesia..."
                      size="sm"
                      cityOnly={true}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Tanggal Melamar
                    </label>
                    <TrackerDatePicker
                      value={newAppliedDate}
                      onChange={(val) => setNewAppliedDate(val)}
                      placeholder="Pilih Tanggal Melamar"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Lamar Melalui Portal
                    </label>
                    <PortalSearchDropdown
                      value={newPortal}
                      onChange={(portalName, defaultUrl) => {
                        setNewPortal(portalName);
                        if (defaultUrl && !newPortalUrl) {
                          setNewPortalUrl(defaultUrl);
                        }
                      }}
                      placeholder="Pilih atau cari portal loker..."
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Link / URL Lowongan Portal{' '}
                      <span className="text-slate-400 font-normal text-[11px]">
                        (Opsional, misal: linkedin.com/jobs/...)
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: linkedin.com/jobs/view/123456 atau glints.com/..."
                      value={newPortalUrl}
                      onChange={(e) => setNewPortalUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1738D1] transition"
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={handleCrawlJobUrl}
                        disabled={isCrawling || !newPortalUrl.trim()}
                        className="flex-1 py-2 px-3 rounded-[10px] bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                      >
                        {isCrawling ? (
                          <>
                            <Loader2 size={13} className="animate-spin" />
                            <span>Mengekstrak data & menerbitkan ke Portal...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={13} />
                            <span>⚡ Auto-Isi dari Link & Publikasikan ke Portal Loker</span>
                          </>
                        )}
                      </button>
                    </div>
                    {crawlMessage && (
                      <p className={`text-[11px] font-medium mt-1.5 ${crawlMessage.includes('Berhasil') ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-amber-600 dark:text-amber-400'}`}>
                        {crawlMessage}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Status Tahapan
                    </label>
                    <CustomSelect
                      value={newStatus}
                      onChange={(val) => setNewStatus(val as ApplicationItem['status'])}
                      options={['Terkirim', 'Screening', 'Interview', 'Offering', 'Ditolak']}
                      placeholder="Pilih Status"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center justify-between">
                      <span>Gaji Ekspektasi</span>
                      <span className="text-slate-400 font-normal text-[10px]">Opsional</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Rp 000.000.000"
                      value={newSalary}
                      onChange={(e) => setNewSalary(formatSalaryInput(e.target.value))}
                      className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1738D1] transition"
                    />
                  </div>
                </div>

                {/* Info Pengingat Otomatis */}
                <div className="flex items-start gap-2.5 p-3 rounded-[10px] bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-300">
                  <Clock className="w-4 h-4 text-[#1738D1] dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Pengingat Otomatis Aktif</span>
                    <p className="text-[11px] text-blue-700/90 dark:text-blue-300/80 mt-0.5 leading-relaxed">
                      Sistem otomatis memantau jadwal follow-up (H+3, H+5, H+10) berdasarkan tanggal melamar. Jam wawancara &amp; checklist persiapan akan otomatis diminta saat lamaran dipindahkan ke kolom Interview.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Catatan Tambahan
                  </label>
                  <AutoResizeTextarea
                    minHeight={72}
                    maxHeight={280}
                    rows={3}
                    placeholder="Catatan interview, kontak HRD/Recruiter, link lowongan, dsb..."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1738D1] transition resize-none"
                  />
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-[10px] text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-[10px] text-xs font-bold bg-[#1738D1] hover:bg-[#132EA8] text-white shadow-md shadow-[#1738D1]/20 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Simpan Lamaran</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tracker Reminder Hub Drawer */}
      <TrackerReminderHub
        isOpen={isReminderHubOpen}
        onClose={() => setIsReminderHubOpen(false)}
        reminders={reminders}
        onDismissReminder={handleDismissReminder}
        onSelectApp={(appId) => {
          const target = apps.find((a) => a.id === appId);
          if (target) {
            setSearchTerm(target.company);
          }
        }}
      />

      {/* Modal Dialog Jadwal & Persiapan Interview */}
      <InterviewScheduleModal
        isOpen={isInterviewModalOpen}
        app={interviewModalApp}
        onClose={() => {
          setIsInterviewModalOpen(false);
          setInterviewModalApp(null);
        }}
        onSave={handleSaveInterviewSchedule}
        onIgnore={handleIgnoreInterviewReminder}
        onOpenReview={handleOpenPostInterviewModal}
      />

      {/* Modal Dialog Evaluasi & Hasil Wawancara (Post-Interview Review) */}
      <PostInterviewReviewModal
        isOpen={!!postInterviewApp}
        app={postInterviewApp}
        onClose={() => setPostInterviewApp(null)}
        onUpdateStatus={handleUpdatePostInterviewStatus}
        onScheduleNextRound={handleScheduleNextRound}
        onSaveNotesOnly={handleSaveInterviewNotesOnly}
        onEditSchedule={handleOpenInterviewModal}
      />

      {/* Modal Dialog Panduan & Persiapan Offering */}
      <OfferingPreparationModal
        isOpen={isOfferingModalOpen}
        app={offeringModalApp}
        onClose={() => {
          setIsOfferingModalOpen(false);
          setOfferingModalApp(null);
        }}
        onSave={handleSaveOfferingPreparation}
      />

      {/* Full-screen Offering Celebration - Pita-pita Confetti Lottie Jatuh Memenuhi Layar */}
      {showOfferingCelebration && (
        <div
          key={celebrationKey}
          aria-hidden="true"
          className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center overflow-hidden"
        >
          {/* Banner Ucapan Selamat Mengambang */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 px-5 py-2.5 rounded-[12px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-emerald-500/30 shadow-2xl flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-9 h-9 rounded-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-xs shrink-0">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-slate-900 dark:text-white">
                Selamat atas Offering Lamaranmu!
              </p>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Pencapaian luar biasa menuju karier impian.
              </p>
            </div>
            {celebratingApp && (
              <button
                type="button"
                onClick={() => {
                  setShowOfferingCelebration(false);
                  handleOpenOfferingModal(celebratingApp);
                }}
                className="pointer-events-auto ml-1.5 px-3 py-1.5 rounded-[8px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm active:scale-95 transition flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>Cek Persiapan</span>
              </button>
            )}
          </div>

          {/* Animasi Pita-Pita & Confetti Lottie Jatuh Memenuhi Layar */}
          <div className="w-full h-full">
            <DotLottiePlayer
              src="/animations/confetti-ribbons.json"
              autoplay={true}
              loop={false}
              className="w-full h-full pointer-events-none [&_canvas]:!w-full [&_canvas]:!h-full [&_canvas]:!object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
};

