'use client';

import React, { useRef, useState, useEffect } from 'react';
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
  Bookmark,
} from 'lucide-react';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { DotLottiePlayer } from '@/components/DotLottiePlayer';
import { MascotEmptyState } from '@/components/ui/MascotEmptyState';
import { CitySearchInput } from '@/components/ui/CitySearchInput';
import { TrackerDatePicker, fromISODate } from '@/components/ui/TrackerDatePicker';
import { PortalSearchDropdown } from '@/components/ui/PortalSearchDropdown';
import { AutoResizeTextarea } from '@/components/ui/AutoResizeTextarea';
import { TrackerReminderHub } from '@/components/TrackerReminderHub';
import { InterviewScheduleModal } from './InterviewScheduleModal';
import { PostInterviewReviewModal } from './PostInterviewReviewModal';
import { OfferingPreparationModal } from './OfferingPreparationModal';
import { OfferingCelebrationModal } from './OfferingCelebrationModal';
import { ApplicationDetailDrawer } from './ApplicationDetailDrawer';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/Toast';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';

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
  status: 'Tersimpan' | 'Terkirim' | 'Screening' | 'Interview' | 'Offering' | 'Ditolak';
  salary: string;
  notes: string;
  portal: string;
  portalUrl?: string;
  matchScore?: number;
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
    status: 'Tersimpan',
    label: 'Tersimpan',
    colorClass: 'border-slate-500/30 bg-slate-500/5',
    badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  },
  {
    status: 'Terkirim',
    label: 'Terkirim',
    colorClass: 'border-sky-500/30 bg-sky-500/5',
    badgeBg: 'bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
  },
  {
    status: 'Screening',
    label: 'Screening',
    colorClass: 'border-cobalt-500/30 bg-cobalt-500/5',
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
    iconColor: 'text-rose-700 dark:text-rose-400',
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
    iconColor: 'text-amber-700 dark:text-amber-400',
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
    iconColor: 'text-emerald-700 dark:text-emerald-400',
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
    hoverBorder: 'hover:border-orange-400 dark:hover:border-cobalt-500',
    accentBar: 'bg-gradient-to-r from-cyan-400 to-slate-500',
    companyText: 'text-orange-700 dark:text-orange-300 font-bold',
    tagBg: 'bg-orange-100/90 dark:bg-orange-900/60',
    tagText: 'text-orange-800 dark:text-orange-200',
    iconColor: 'text-orange-700 dark:text-orange-400',
    dotBg: 'bg-cobalt-500',
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
    iconColor: 'text-teal-700 dark:text-teal-400',
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
  Tersimpan: {
    label: 'Belum ada lowongan tersimpan',
    icon: Bookmark,
    iconColor: 'text-slate-500 dark:text-slate-400',
    bgClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
  },
  Terkirim: {
    label: 'Belum ada lamaran terkirim',
    icon: Send,
    iconColor: 'text-sky-500',
    bgClass: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400',
  },
  Screening: {
    label: 'Belum ada tahap screening',
    icon: FileSearch,
    iconColor: 'text-orange-700 dark:text-orange-400',
    bgClass: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400',
  },
  Interview: {
    label: 'Belum ada jadwal interview',
    icon: CalendarCheck,
    iconColor: 'text-amber-700 dark:text-amber-400',
    bgClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400',
  },
  Offering: {
    label: 'Belum ada tawaran offering',
    icon: Sparkles,
    iconColor: 'text-emerald-700 dark:text-emerald-400',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400',
  },
  Ditolak: {
    label: 'Tidak ada lamaran ditolak',
    icon: FolderArchive,
    iconColor: 'text-rose-700 dark:text-rose-400',
    bgClass: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400',
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
  const { success, error, info } = useToast();
  const [apps, setApps] = useState<ApplicationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const addApplicationTriggerRef = React.useRef<HTMLButtonElement>(null);
  const [selectedDetailApp, setSelectedDetailApp] = useState<ApplicationItem | null>(null);
  const [isReminderHubOpen, setIsReminderHubOpen] = useState<boolean>(false);
  const [appToDelete, setAppToDelete] = useState<ApplicationItem | null>(null);
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
      } catch {}
      return updated;
    });
    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        window.dispatchEvent(new Event('employr_reminders_updated'));
      }, 0);
    }
    info('Pengingat Diselesaikan', 'Pengingat lamaran telah ditandai selesai.');
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

  const [viewedDotAppIds, setViewedDotAppIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('employr_viewed_card_dots');
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const handleOpenDetail = (app: ApplicationItem) => {
    setSelectedDetailApp(app);
    const appReminder = reminderByAppId.get(app.id);
    setViewedDotAppIds((prev) => {
      const toAdd = [app.id];
      if (appReminder) {
        toAdd.push(appReminder.id);
      }
      const filteredToAdd = toAdd.filter((item) => !prev.includes(item));
      if (filteredToAdd.length === 0) return prev;
      const updated = [...prev, ...filteredToAdd];
      try {
        localStorage.setItem('employr_viewed_card_dots', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };



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

  const fetchApplications = async (bypassCache = false) => {
    if (bypassCache) setIsRefreshing(true);
    try {
      setErrorMessage(null);
      setLoadError(null);
      const remoteApps = await trackerApi.getAll<ApplicationItem>(bypassCache);
      if (Array.isArray(remoteApps)) {
        const ignoredIds = getIgnoredInterviewAppIds();
        const mergedApps = remoteApps.map((a) => ({
          ...a,
          ignoreInterviewReminder: a.ignoreInterviewReminder ?? ignoredIds.has(a.id),
        }));
        setApps(mergedApps);

        // Validasi query parameters dari URL (deep link) terhadap data aplikasi nyata
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          const searchParam = params.get('search');
          const reminderParam = params.get('reminder');

          if (searchParam || reminderParam) {
            const matchedApp = mergedApps.find((a) => {
              const matchSearch =
                searchParam &&
                (a.company.toLowerCase().includes(searchParam.toLowerCase()) ||
                  a.position.toLowerCase().includes(searchParam.toLowerCase()) ||
                  (a.portal || '').toLowerCase().includes(searchParam.toLowerCase()));
              const matchReminder = reminderParam && (a.id === reminderParam || reminderParam.includes(a.id));
              return matchSearch || matchReminder;
            });

            if (matchedApp) {
              if (searchParam) setSearchTerm(searchParam);
              if (reminderParam) {
                handleOpenDetail(matchedApp);
              }
            } else {
              // Jika data lamaran sudah tidak ada / telah dihapus, pulihkan tampilan
              setSearchTerm('');
              info(
                'Lamaran Tidak Ditemukan',
                `Data lamaran untuk "${searchParam || 'pengingat ini'}" sudah tidak ditemukan atau telah dihapus.`
              );
              // Bersihkan query param agar tidak mengunci URL
              const cleanUrl = new URL(window.location.href);
              cleanUrl.searchParams.delete('search');
              cleanUrl.searchParams.delete('reminder');
              window.history.replaceState(
                {},
                '',
                cleanUrl.pathname + (cleanUrl.searchParams.toString() ? `?${cleanUrl.searchParams.toString()}` : '')
              );
            }
          }
        }
      }
    } catch (err: any) {
      console.error('[TrackerView] Error fetching applications:', err);
      const message = 'Gagal memuat daftar lamaran. Periksa koneksi internet Anda.';
      setLoadError(message);
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Reference to latest apps for external event handlers
  const appsRef = useRef(apps);
  useEffect(() => {
    appsRef.current = apps;
  }, [apps]);

  // Fetch real applications on mount & auto-sync when tab becomes visible or focused
  useEffect(() => {
    fetchApplications();

    const parseParams = () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab') || params.get('status');
        if (tabParam) {
          const lower = tabParam.toLowerCase();
          if (lower === 'interview') setFilterStatus('Interview');
          else if (lower === 'screening') setFilterStatus('Screening');
          else if (lower === 'terkirim') setFilterStatus('Terkirim');
          else if (lower === 'offering') setFilterStatus('Offering');
          else if (lower === 'ditolak') setFilterStatus('Ditolak');
        }

        const reminderParam = params.get('reminder');
        const searchParam = params.get('search');
        // Hanya set searchTerm langsung jika BUKAN deep-link reminder,
        // biarkan fetchApplications memverifikasi data sebelum mengunci filter
        if (searchParam && !reminderParam) {
          setSearchTerm(searchParam);
        }

        if (params.get('openReminderHub') === 'true' || params.get('hub') === 'true') {
          setIsReminderHubOpen(true);
        }
      }
    };

    parseParams();

    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchApplications(true);
      }
    };

    const handleTrackerReminder = (e: Event) => {
      const customEvent = e as CustomEvent<any>;
      const detail = customEvent?.detail;
      if (!detail) return;

      // Cari lamaran yang bersangkutan di data lokal
      const currentApps = appsRef.current;
      const matched = currentApps.find(
        (a) => a.id === detail.appId || (detail.company && a.company.toLowerCase().includes(detail.company.toLowerCase()))
      );

      if (matched) {
        if (detail.company) {
          setSearchTerm(detail.company);
        }
        if (detail.templateType === 'thank_you_interview' || detail.category === 'INTERVIEW' || detail.urgency === 'critical') {
          setFilterStatus('Interview');
        } else if (detail.urgency === 'high') {
          setFilterStatus('Screening');
        }
        handleOpenDetail(matched);
      } else {
        // Data lamaran terkait pengingat ini sudah tidak ditemukan / terhapus
        setSearchTerm('');
        info(
          'Lamaran Tidak Ditemukan',
          `Data lamaran untuk "${detail.company || 'pengingat ini'}" sudah tidak ditemukan atau telah dihapus.`
        );
        if (typeof window !== 'undefined') {
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.delete('search');
          cleanUrl.searchParams.delete('reminder');
          window.history.replaceState(
            {},
            '',
            cleanUrl.pathname + (cleanUrl.searchParams.toString() ? `?${cleanUrl.searchParams.toString()}` : '')
          );
        }
        setIsReminderHubOpen(true);
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    window.addEventListener('employr_open_tracker_reminder', handleTrackerReminder);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      window.removeEventListener('employr_open_tracker_reminder', handleTrackerReminder);
    };
  }, []);

  useEffect(() => {
    if (viewMode === 'kanban' && filterStatus !== 'Semua' && kanbanScrollContainerRef.current) {
      const targetColElem = kanbanScrollContainerRef.current.querySelector<HTMLElement>(
        `[data-column-status="${filterStatus}"]`
      );
      if (targetColElem && window.innerWidth >= 1024) {
        targetColElem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [filterStatus, viewMode]);

  // Pointer Drag and Drop State
  const [activeDragItem, setActiveDragItem] = useState<ApplicationItem | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragWidth, setDragWidth] = useState<number>(280);
  const [dragOverColumn, setDragOverColumn] = useState<ApplicationItem['status'] | null>(null);
  const justDraggedRef = useRef(false);
  const kanbanScrollContainerRef = useRef<HTMLDivElement | null>(null);
  const lastPointerPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const edgeStepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const edgeDirectionRef = useRef<-1 | 0 | 1>(0);
  const currentActiveTargetColumnRef = useRef<ApplicationItem['status'] | null>(null);

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
      success('Persiapan Offering Disimpan', 'Rincian penawaran dan checklist telaah offering berhasil diperbarui.');
    } catch (err) {
      console.error('[TrackerView] Failed to save offering preparation:', err);
      error('Gagal Menyimpan Offering', 'Periksa koneksi internet Anda.');
    }
  };

  // User explicitly dismisses or acts upon OfferingCelebrationModal


  const handlePointerDownCard = (e: React.PointerEvent<HTMLDivElement>, app: ApplicationItem) => {
    // Skip if clicking button, link or interactive element
    if ((e.target as HTMLElement).closest('button, a, input, select, [data-interactive="true"]')) return;
    if (e.button !== 0) return;

    // Bersihkan seleksi teks yang mungkin aktif
    if (typeof window !== 'undefined') {
      window.getSelection()?.removeAllRanges();
    }

    const isTouch = e.pointerType === 'touch' || e.pointerType === 'pen';
    const targetElement = e.currentTarget;
    const pointerId = e.pointerId;

    const rect = targetElement.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    const startX = e.clientX;
    const startY = e.clientY;
    let isDragging = false;
    let holdTimer: ReturnType<typeof setTimeout> | null = null;

    const startDrag = (clientX: number, clientY: number) => {
      isDragging = true;
      if (typeof window !== 'undefined') {
        window.getSelection()?.removeAllRanges();
      }
      setActiveDragItem(app);
      setDragPos({ x: clientX, y: clientY });
      setDragOffset({ x: offsetX, y: offsetY });
      setDragWidth(rect.width);
      setDragOverColumn(app.status);
      currentActiveTargetColumnRef.current = app.status;
      lastPointerPosRef.current = { x: clientX, y: clientY };

      // Reset edge direction & timer
      edgeDirectionRef.current = 0;
      if (edgeStepTimerRef.current) {
        clearTimeout(edgeStepTimerRef.current);
        edgeStepTimerRef.current = null;
      }

      // Kunci scroll vertikal kontainer halaman dashboard saat dragging
      const mainScroll = document.getElementById('main-content-scroll');
      if (mainScroll) {
        mainScroll.style.overflowY = 'hidden';
      }

      if (kanbanScrollContainerRef.current) {
        // Cegah gesture swipe native manual saat dragging kartu
        kanbanScrollContainerRef.current.style.touchAction = 'none';
      }

      if (isTouch) {
        targetElement.style.touchAction = 'none';
        try {
          targetElement.setPointerCapture(pointerId);
        } catch (_) {}
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try {
            navigator.vibrate(40);
          } catch (_) {}
        }
      }
    };

    if (isTouch) {
      // Mobile / layar sentuh: Tahan ~260ms untuk memicu mode drag (hold to drag)
      holdTimer = setTimeout(() => {
        startDrag(startX, startY);
      }, 260);
    }

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (!isDragging) {
        if (isTouch) {
          // Jika jari bergeser > 8px sebelum 260ms, user sedang scroll layar biasa.
          // Batalkan hold timer dan biarkan scroll berjalan normal.
          if (distance > 8) {
            if (holdTimer) {
              clearTimeout(holdTimer);
              holdTimer = null;
            }
            cleanup();
          }
        } else {
          // Desktop mouse: jika digeser > 5px, langsung mulai drag tanpa jeda
          if (distance > 5) {
            startDrag(moveEvent.clientX, moveEvent.clientY);
          }
        }
      } else {
        if (moveEvent.cancelable) {
          moveEvent.preventDefault();
        }

        lastPointerPosRef.current = { x: moveEvent.clientX, y: moveEvent.clientY };
        setDragPos({ x: moveEvent.clientX, y: moveEvent.clientY });

        // Update target status langsung jika kursor berpindah di atas board
        const elemBelow = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
        const colElem = elemBelow?.closest('[data-column-status]');
        if (colElem) {
          const targetStatus = colElem.getAttribute('data-column-status') as ApplicationItem['status'];
          setDragOverColumn((prev) => {
            if (prev !== targetStatus && typeof navigator !== 'undefined' && navigator.vibrate) {
              try {
                navigator.vibrate(25);
              } catch (_) {}
            }
            return targetStatus;
          });
          currentActiveTargetColumnRef.current = targetStatus;
        }

        // Pengecualian Geser Kolom: Ketika kartu diarahkan & ditahan di tepi kontainer Kanban (kiri / kanan)
        const screenW = window.innerWidth;
        const isMobileScreen = screenW < 768;
        const edgeZone = isMobileScreen ? Math.min(100, Math.max(75, screenW * 0.25)) : 80;

        const container = kanbanScrollContainerRef.current;
        const containerRect = container?.getBoundingClientRect();

        let dir: -1 | 0 | 1 = 0;
        if (container && containerRect && container.scrollWidth > container.clientWidth) {
          const leftBound = containerRect.left + edgeZone;
          const rightBound = containerRect.right - edgeZone;

          if (moveEvent.clientX >= rightBound || (isMobileScreen && dx > 60 && moveEvent.clientX > screenW * 0.55)) {
            if (container.scrollLeft + container.clientWidth < container.scrollWidth - 5) {
              dir = 1; // Geser ke kanan
            }
          } else if (moveEvent.clientX <= leftBound || (isMobileScreen && dx < -60 && moveEvent.clientX < screenW * 0.45)) {
            if (container.scrollLeft > 5) {
              dir = -1; // Geser ke kiri
            }
          }
        }

        if (dir !== edgeDirectionRef.current) {
          edgeDirectionRef.current = dir;
          if (edgeStepTimerRef.current) {
            clearTimeout(edgeStepTimerRef.current);
            edgeStepTimerRef.current = null;
          }

          if (dir !== 0 && container && container.scrollWidth > container.clientWidth) {
            const stepColumn = () => {
              if (!isDragging || edgeDirectionRef.current !== dir) return;

              const allCols = Array.from(container.querySelectorAll<HTMLElement>('[data-column-status]'));
              if (allCols.length === 0) return;

              if (isMobileScreen) {
                const screenCenterX = window.innerWidth / 2;
                let activeIdx = -1;
                let minDiff = Infinity;
                allCols.forEach((col, idx) => {
                  const r = col.getBoundingClientRect();
                  const colCenter = r.left + r.width / 2;
                  const diff = Math.abs(colCenter - screenCenterX);
                  if (diff < minDiff) {
                    minDiff = diff;
                    activeIdx = idx;
                  }
                });

                if (activeIdx === -1 && currentActiveTargetColumnRef.current) {
                  activeIdx = allCols.findIndex((c) => c.getAttribute('data-column-status') === currentActiveTargetColumnRef.current);
                }

                if (activeIdx === -1) {
                  activeIdx = allCols.findIndex((c) => c.getAttribute('data-column-status') === dragOverColumn);
                }

                const targetIdx = Math.max(0, Math.min(allCols.length - 1, (activeIdx >= 0 ? activeIdx : 0) + dir));
                if (targetIdx !== activeIdx && allCols[targetIdx]) {
                  const targetCol = allCols[targetIdx];
                  const targetStatus = targetCol.getAttribute('data-column-status') as ApplicationItem['status'];
                  const colLeft = targetCol.offsetLeft;
                  const colWidth = targetCol.offsetWidth;
                  const targetScrollLeft = colLeft - (container.clientWidth - colWidth) / 2;
                  container.scrollTo({ left: Math.max(0, targetScrollLeft), behavior: 'smooth' });

                  setDragOverColumn(targetStatus);
                  currentActiveTargetColumnRef.current = targetStatus;

                  if (typeof navigator !== 'undefined' && navigator.vibrate) {
                    try {
                      navigator.vibrate(30);
                    } catch (_) {}
                  }
                }
              } else {
                // Di desktop: geser sejauh 1 kolom (306px = 290px lebar kolom + 16px gap)
                const stepDistance = 306;
                const newScrollLeft =
                  dir === 1
                    ? Math.min(container.scrollWidth - container.clientWidth, container.scrollLeft + stepDistance)
                    : Math.max(0, container.scrollLeft - stepDistance);

                container.scrollTo({ left: newScrollLeft, behavior: 'smooth' });

                // Deteksi kolom target setelah pergeseran
                setTimeout(() => {
                  if (!isDragging) return;
                  const elemBelow = document.elementFromPoint(lastPointerPosRef.current.x, lastPointerPosRef.current.y);
                  const colElem = elemBelow?.closest('[data-column-status]');
                  if (colElem) {
                    const targetStatus = colElem.getAttribute('data-column-status') as ApplicationItem['status'];
                    setDragOverColumn(targetStatus);
                    currentActiveTargetColumnRef.current = targetStatus;
                  } else {
                    const freshCols = Array.from(container.querySelectorAll<HTMLElement>('[data-column-status]'));
                    const cRect = container.getBoundingClientRect();
                    let candidateCol: HTMLElement | null = null;
                    if (dir === -1) {
                      candidateCol = freshCols.find((c) => c.getBoundingClientRect().right > cRect.left + 30) || null;
                    } else {
                      candidateCol = [...freshCols].reverse().find((c) => c.getBoundingClientRect().left < cRect.right - 30) || null;
                    }
                    if (candidateCol) {
                      const targetStatus = candidateCol.getAttribute('data-column-status') as ApplicationItem['status'];
                      setDragOverColumn(targetStatus);
                      currentActiveTargetColumnRef.current = targetStatus;
                    }
                  }
                }, 120);

                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                  try {
                    navigator.vibrate(25);
                  } catch (_) {}
                }
              }

              // Jika user terus menahan kartu di tepi layar, ulangi geser setiap 450ms
              edgeStepTimerRef.current = setTimeout(stepColumn, 450);
            };

            // Tahan 200ms di tepi kontainer sebelum mulai geser
            edgeStepTimerRef.current = setTimeout(stepColumn, 200);
          }
        }
      }
    };

    const handleTouchMove = (touchEvent: TouchEvent) => {
      // Kunci 100% native gesture scrolling saat mode drag sedang aktif
      if (isDragging && touchEvent.cancelable) {
        touchEvent.preventDefault();
      }
    };

    const handlePreventContext = (ctxEvent: Event) => {
      ctxEvent.preventDefault();
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      if (holdTimer) {
        clearTimeout(holdTimer);
        holdTimer = null;
      }

      const wasDragging = isDragging;
      const targetColumnAtDrop = dragOverColumn;
      const activeRefAtDrop = currentActiveTargetColumnRef.current;

      cleanup();

      if (!wasDragging) {
        // Klik/tap biasa tanpa drag -> ditangani langsung oleh onClick kartu
        return;
      }

      // Tandai bahwa baru saja selesai dragging agar onClick kartu tidak membuka drawer detail
      justDraggedRef.current = true;
      setTimeout(() => {
        justDraggedRef.current = false;
      }, 250);

      // Batalkan drag jika ditarik ke atas (area header / navigasi atas)
      if (upEvent.clientY < 90) {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try {
            navigator.vibrate([20, 40, 20]);
          } catch (_) {}
        }
        setActiveDragItem(null);
        setDragOverColumn(null);
        return;
      }

      // Deteksi kolom target yang dijatuhkan:
      // 1. Elemen kolom tepat di bawah kursor pointer saat dilepas
      const elemBelow = document.elementFromPoint(upEvent.clientX, upEvent.clientY);
      const droppedColElem = elemBelow?.closest('[data-column-status]');
      const droppedStatus = droppedColElem?.getAttribute('data-column-status') as ApplicationItem['status'] | null;

      // 2. Prioritaskan kolom yang terdeteksi di bawah kursor, lalu kolom yang disorot saat dragging
      let finalTargetStatus: ApplicationItem['status'] | null =
        droppedStatus || targetColumnAtDrop || activeRefAtDrop;

      // 3. Fallback HANYA untuk layar mobile kecil (< 768px) yang memakai horizontal swipe-snap:
      // Jika kursor lepas di padding/margin luar kolom sehingga target tidak terdeteksi
      if (!finalTargetStatus && window.innerWidth < 768 && kanbanScrollContainerRef.current) {
        const cols = Array.from(
          kanbanScrollContainerRef.current.querySelectorAll<HTMLElement>('[data-column-status]')
        );
        const screenCenterX = window.innerWidth / 2;
        let minDiff = Infinity;
        let closestStatus: ApplicationItem['status'] | null = null;
        for (const col of cols) {
          const r = col.getBoundingClientRect();
          const colCenter = r.left + r.width / 2;
          const diff = Math.abs(colCenter - screenCenterX);
          if (diff < minDiff) {
            minDiff = diff;
            closestStatus = col.getAttribute('data-column-status') as ApplicationItem['status'];
          }
        }
        if (closestStatus) {
          finalTargetStatus = closestStatus;
        }
      }

      if (finalTargetStatus && finalTargetStatus !== app.status) {
        handleUpdateStatus(app.id, finalTargetStatus);

        if (finalTargetStatus === 'Interview') {
          const hasExistingInterviewData = Boolean(
            app.interviewDate || app.interviewTime || (app.interviewChecklist && app.interviewChecklist.length > 0)
          );
          const isIgnored = app.ignoreInterviewReminder || isAppInterviewIgnored(app.id);

          if (!hasExistingInterviewData && !isIgnored) {
            handleOpenInterviewModal(app);
          }
        }
      }

      // Haluskan posisi kolom target agar pas di tengah layar mobile saat dilepas
      if (window.innerWidth < 768 && kanbanScrollContainerRef.current && finalTargetStatus) {
        const targetColElem = kanbanScrollContainerRef.current.querySelector<HTMLElement>(
          `[data-column-status="${finalTargetStatus}"]`
        );
        if (targetColElem) {
          const colLeft = targetColElem.offsetLeft;
          const colWidth = targetColElem.offsetWidth;
          const targetScrollLeft =
            colLeft - (kanbanScrollContainerRef.current.clientWidth - colWidth) / 2;
          kanbanScrollContainerRef.current.scrollTo({
            left: Math.max(0, targetScrollLeft),
            behavior: 'smooth',
          });
        }
      }

      setActiveDragItem(null);
      setDragOverColumn(null);
    };

    const handlePointerCancel = () => {
      if (holdTimer) {
        clearTimeout(holdTimer);
        holdTimer = null;
      }
      cleanup();
      if (isDragging) {
        setActiveDragItem(null);
        setDragOverColumn(null);
      }
    };

    const cleanup = () => {
      if (edgeStepTimerRef.current) {
        clearTimeout(edgeStepTimerRef.current);
        edgeStepTimerRef.current = null;
      }
      edgeDirectionRef.current = 0;
      currentActiveTargetColumnRef.current = null;

      // Pulihkan scroll vertikal kontainer halaman dashboard
      const mainScroll = document.getElementById('main-content-scroll');
      if (mainScroll) {
        mainScroll.style.overflowY = 'auto';
      }

      if (kanbanScrollContainerRef.current) {
        kanbanScrollContainerRef.current.style.overflowX = '';
        kanbanScrollContainerRef.current.style.touchAction = '';
      }

      if (isTouch) {
        targetElement.style.touchAction = '';
        try {
          targetElement.releasePointerCapture(pointerId);
        } catch (_) {}
      }
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('contextmenu', handlePreventContext);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerCancel);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('contextmenu', handlePreventContext);
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
      success(
        'Jadwal Interview Tersimpan',
        `Wawancara dijadwalkan pada ${scheduleData.interviewDate} pukul ${scheduleData.interviewTime} ${scheduleData.interviewTimezone}.`
      );
    } catch (err) {
      console.error('[TrackerView] Failed to save interview schedule:', err);
      setErrorMessage('Gagal menyimpan jadwal interview. Periksa koneksi internet Anda.');
      error('Gagal Menyimpan Jadwal', 'Periksa koneksi internet Anda.');
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
      info('Pengingat Dinonaktifkan', 'Pengingat interview untuk lamaran ini telah dinonaktifkan.');
    } catch (err) {
      console.error('[TrackerView] Failed to ignore interview reminder:', err);
      setErrorMessage('Gagal memperbarui pengingat interview. Periksa koneksi internet Anda.');
      error('Gagal Memperbarui Pengingat', 'Periksa koneksi internet Anda.');
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
      success('Hasil Interview Disimpan', `Status lamaran berhasil dipindahkan ke ${newStatus}.`);
    } catch (err) {
      console.error('[TrackerView] Failed to update post interview status:', err);
      error('Gagal Menyimpan Hasil Interview', 'Periksa koneksi internet Anda.');
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
      success(
        'Interview Lanjutan Dijadwalkan',
        `Jadwal tahap berikutnya tersimpan: ${scheduleData.interviewDate} pukul ${scheduleData.interviewTime} ${scheduleData.interviewTimezone}.`
      );
    } catch (err) {
      console.error('[TrackerView] Failed to schedule next round:', err);
      error('Gagal Menjadwalkan Interview', 'Periksa koneksi internet Anda.');
      fetchApplications();
    }
  };

  const handleSaveInterviewNotesOnly = async (appId: string, interviewNotes: string) => {
    setApps((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, interviewNotes } : a))
    );

    try {
      await trackerApi.update(appId, { interviewNotes });
      success('Catatan Interview Tersimpan', 'Catatan evaluasi wawancara berhasil diperbarui.');
    } catch (err) {
      console.error('[TrackerView] Failed to save interview notes:', err);
      error('Gagal Menyimpan Catatan', 'Periksa koneksi internet Anda.');
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
      success('Lamaran Berhasil Ditambahkan', `${newApp.position} di ${newApp.company} berhasil dicatat.`);
    } catch (err) {
      console.error('[TrackerView] Failed to save application:', err);
      setErrorMessage('Gagal menambahkan lamaran baru. Periksa koneksi internet Anda.');
      error('Gagal Menambah Lamaran', 'Lamaran belum tersimpan. Periksa koneksi internet Anda.');
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
    const targetApp = apps.find((a) => a.id === id);
    setApps((prev) => prev.filter((a) => a.id !== id));
    setViewedDotAppIds((prev) => {
      const next = prev.filter((item) => item !== id && !item.includes(id));
      try {
        localStorage.setItem('employr_viewed_card_dots', JSON.stringify(next));
      } catch {}
      return next;
    });
    try {
      await trackerApi.delete(id);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('employr_reminders_updated'));
      }
      success('Lamaran Berhasil Dihapus', `${targetApp ? `${targetApp.position} di ${targetApp.company}` : 'Data lamaran'} berhasil dihapus dari tracking.`);
    } catch (err) {
      console.error('[TrackerView] Failed to delete application:', err);
      setErrorMessage('Gagal menghapus lamaran. Periksa koneksi internet Anda.');
      error('Gagal Menghapus Lamaran', 'Periksa koneksi internet Anda.');
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
      success('Status Berhasil Diperbarui', `Status lamaran ${currentApp?.company || ''} dipindahkan ke ${status}.`);
    } catch (err) {
      console.error('[TrackerView] Failed to update application status:', err);
      setErrorMessage('Gagal memperbarui status lamaran. Periksa koneksi internet Anda.');
      error('Gagal Memperbarui Status', 'Periksa koneksi internet Anda.');
      setApps(previous);
    }
  };

  const handleUpdateApplication = async (updatedApp: ApplicationItem) => {
    const previous = [...apps];
    const currentApp = apps.find((a) => a.id === updatedApp.id);
    const isMovingToOffering = updatedApp.status === 'Offering' && currentApp?.status !== 'Offering';

    setApps((prev) => prev.map((a) => (a.id === updatedApp.id ? updatedApp : a)));

    if (isMovingToOffering) {
      triggerOfferingCelebration(updatedApp);
    }

    try {
      await trackerApi.update(updatedApp.id, {
        company: updatedApp.company,
        position: updatedApp.position,
        location: updatedApp.location,
        appliedDate: updatedApp.appliedDate,
        status: updatedApp.status,
        salary: updatedApp.salary,
        notes: updatedApp.notes,
        portal: updatedApp.portal,
        portalUrl: updatedApp.portalUrl,
        interviewChecklist: updatedApp.interviewChecklist,
        offeringChecklist: updatedApp.offeringChecklist,
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('employr_reminders_updated'));
      }
      success('Perubahan Berhasil Disimpan', `Data lamaran ${updatedApp.position} di ${updatedApp.company} berhasil diperbarui.`);
    } catch (err) {
      console.error('[TrackerView] Failed to update application:', err);
      setErrorMessage('Gagal memperbarui data lamaran. Periksa koneksi internet Anda.');
      error('Gagal Menyimpan Perubahan', 'Periksa koneksi internet Anda.');
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
        'Tersimpan': 0,
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
      case 'Tersimpan':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
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
    tersimpan: apps.filter((a) => a.status === 'Tersimpan').length,
    terkirim: apps.filter((a) => a.status === 'Terkirim' || a.status === 'Screening').length,
    interview: apps.filter((a) => a.status === 'Interview').length,
    offering: apps.filter((a) => a.status === 'Offering').length,
  };
  const hasBlockingLoadError = Boolean(loadError) && apps.length === 0;

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header Standardized */}
      <PageHeader
        title="Tracker Lamaran Kerja"
        subtitle="Pantau alur dan status semua lamaran kerja kamu dari interview hingga offering letter dalam satu tempat."
        icon={Briefcase}
        badge="Job Tracker"
        stats={[
          { label: 'Total', value: isLoading || hasBlockingLoadError ? '–' : counts.total, icon: Briefcase, isPrimary: true },
          { label: 'Tersimpan', value: isLoading || hasBlockingLoadError ? '–' : counts.tersimpan, icon: Bookmark, colorClass: 'text-slate-300' },
          { label: 'Screening', value: isLoading || hasBlockingLoadError ? '–' : counts.terkirim, icon: FileText, colorClass: 'text-sky-300' },
          { label: 'Interview', value: isLoading || hasBlockingLoadError ? '–' : counts.interview, icon: Calendar, colorClass: 'text-indigo-300' },
          { label: 'Offering', value: isLoading || hasBlockingLoadError ? '–' : counts.offering, icon: Sparkles, colorClass: 'text-emerald-300' },
        ]}
        actions={
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setIsReminderHubOpen(true)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 min-h-[44px] md:min-h-[36px] rounded-[10px] bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition cursor-pointer relative shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
              title="Pusat Pengingat & Tindakan"
              aria-label={reminders.length > 0 ? `Pusat Pengingat & Tindakan (${reminders.length} aktif)` : 'Pusat Pengingat & Tindakan'}
            >
              <BellRing className={`w-3.5 h-3.5 ${reminders.length > 0 ? 'text-orange-400' : ''}`} />
              <span className="hidden sm:inline">Pengingat</span>
              {reminders.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-caption font-black bg-orange-700 text-white shadow-xs leading-none">
                  {reminders.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[44px] md:min-h-[36px] rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 active:scale-[0.98] text-white font-semibold text-xs shadow-md shadow-cobalt-500/20 transition cursor-pointer border-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Lamaran</span>
            </button>
          </div>
        }
      />

      {/* Error Message Toast / Alert */}
      {errorMessage && (
        <div
          role="alert"
          className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 px-4 py-3 rounded-[10px] text-xs flex items-center justify-between shadow-xs"
        >
          <span>{errorMessage}</span>
          <div className="flex items-center gap-2 ml-3">
            {errorMessage.includes('memuat') && (
              <button
                type="button"
                onClick={() => fetchApplications(true)}
                className="px-3 py-1.5 min-h-[30px] flex items-center rounded-[6px] bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/60 dark:hover:bg-rose-800 text-rose-800 dark:text-rose-200 font-bold cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
              >
                Coba lagi
              </button>
            )}
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-700 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-200 font-bold cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded px-2.5 py-1.5 min-h-[30px] flex items-center"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Control Bar: View Switcher (Kanban vs Table), Search, and Status Filter — hanya tampil saat sudah ada lamaran */}
      {!isLoading && apps.length > 0 && (
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 sm:gap-3 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-[10px] border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
            {/* Toggle View Mode Buttons */}
            <div className="flex items-center justify-between sm:justify-start gap-2">
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'kanban' | 'table')} className="w-full sm:w-auto">
                <TabsList variant="pill" className="w-full sm:w-auto grid grid-cols-2 sm:flex">
                  <TabsTrigger value="kanban" size="sm" className="justify-center">
                    <Kanban className="size-4" />
                    <span>Kanban</span>
                  </TabsTrigger>
                  <TabsTrigger value="table" size="sm" className="justify-center">
                    <List className="size-4" />
                    <span>Tabel</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Search Box */}
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari perusahaan atau posisi..."
                aria-label="Cari lamaran berdasarkan perusahaan atau posisi"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cobalt-500"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    if (typeof window !== 'undefined') {
                      const cleanUrl = new URL(window.location.href);
                      cleanUrl.searchParams.delete('search');
                      cleanUrl.searchParams.delete('reminder');
                      window.history.replaceState({}, '', cleanUrl.pathname + (cleanUrl.searchParams.toString() ? `?${cleanUrl.searchParams.toString()}` : ''));
                    }
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                  title="Hapus kata kunci pencarian"
                  aria-label="Hapus kata kunci pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills with Horizontal Touch-Scroll & Live Counts */}
          <div className="w-full lg:w-auto overflow-x-auto no-scrollbar -mx-1 px-1 py-0.5">
            <Tabs value={filterStatus} onValueChange={setFilterStatus} className="w-max min-w-full lg:min-w-0">
              <TabsList variant="pill" className="w-full lg:w-auto flex justify-start gap-1.5 p-1 bg-slate-100/80 dark:bg-slate-800/80">
                {[
                  { status: 'Semua', count: apps.length },
                  { status: 'Tersimpan', count: apps.filter(a => a.status === 'Tersimpan').length },
                  { status: 'Terkirim', count: apps.filter(a => a.status === 'Terkirim').length },
                  { status: 'Screening', count: apps.filter(a => a.status === 'Screening').length },
                  { status: 'Interview', count: apps.filter(a => a.status === 'Interview').length },
                  { status: 'Offering', count: apps.filter(a => a.status === 'Offering').length },
                  { status: 'Ditolak', count: apps.filter(a => a.status === 'Ditolak').length },
                ].map((item) => (
                  <TabsTrigger key={item.status} value={item.status} size="sm" className="shrink-0 text-xs gap-1.5 px-3">
                    <span>{item.status}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 ${
                      filterStatus === item.status
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {item.count}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="flex overflow-x-auto kanban-scroll gap-4 pb-4 pt-1 items-start min-h-[450px]">
          {KANBAN_COLUMNS.map((col) => (
            <div
              key={col.status}
              className="shrink-0 w-[85vw] sm:w-[280px] lg:w-[290px] min-w-[280px] lg:min-w-[290px] rounded-[10px] border border-slate-200/80 dark:border-slate-800 p-3 space-y-3 bg-white/40 dark:bg-slate-900/40 animate-pulse motion-reduce:animate-none"
            >
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-[10px] w-24 mb-3" />
              <div className="h-28 bg-slate-100 dark:bg-slate-800/60 rounded-[10px] w-full" />
              <div className="h-28 bg-slate-100 dark:bg-slate-800/60 rounded-[10px] w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State: Belum Ada Lamaran (Clean, Focused & Anti-Slop UI) */}
      {!isLoading && !hasBlockingLoadError && apps.length === 0 && (
        <div className="rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-12 text-center flex flex-col items-center gap-6 shadow-xs animate-in fade-in duration-300">
          {/* Visual Icon Mark */}
          <div className="w-14 h-14 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-cobalt-500 dark:text-blue-400 shadow-2xs">
            <Kanban className="w-7 h-7" />
          </div>

          {/* Headline & Description */}
          <div className="space-y-2 max-w-xl mx-auto">
            <span className="inline-block px-3 py-1 rounded-[10px] text-caption font-bold uppercase tracking-wider bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
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
              ref={addApplicationTriggerRef}
              onClick={() => setIsAddModalOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-cobalt-500/20 transition flex items-center justify-center gap-2 cursor-pointer border-0"
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
        Boolean(searchTerm.trim()) && filteredApps.length === 0 ? (
          <div className="rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <MascotEmptyState
              size="md"
              badge="Pencarian"
              title="Tidak Ada Lamaran yang Cocok"
              description={
                searchTerm.trim()
                  ? `Tidak ditemukan lamaran dengan kata kunci "${searchTerm}"${filterStatus !== 'Semua' ? ` pada status "${filterStatus}"` : ''}. Coba periksa ejaan atau reset filter.`
                  : `Tidak ditemukan lamaran pada status "${filterStatus}".`
              }
              action={
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('Semua');
                    if (typeof window !== 'undefined') {
                      const cleanUrl = new URL(window.location.href);
                      cleanUrl.searchParams.delete('search');
                      cleanUrl.searchParams.delete('tab');
                      cleanUrl.searchParams.delete('status');
                      cleanUrl.searchParams.delete('reminder');
                      window.history.replaceState(
                        {},
                        '',
                        cleanUrl.pathname + (cleanUrl.searchParams.toString() ? `?${cleanUrl.searchParams.toString()}` : '')
                      );
                    }
                  }}
                  className="px-4 py-2.5 rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-cobalt-500/20 transition flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 focus-visible:ring-offset-2"
                >
                  <span>Reset Pencarian & Filter</span>
                </button>
              }
            />
          </div>
        ) : (
        <div className="space-y-3">
          <div
            ref={kanbanScrollContainerRef}
            className={`flex overflow-x-auto kanban-scroll ${
              filterStatus === 'Semua'
                ? `${activeDragItem ? 'snap-none' : 'snap-x snap-mandatory lg:snap-none'}`
                : 'max-w-xl mx-auto lg:max-w-none'
            } gap-4 pb-4 pt-1 items-start min-h-[450px]`}
          >
            {KANBAN_COLUMNS.map((col) => {
              const isSelected = filterStatus === col.status;
              const isFiltered = filterStatus !== 'Semua';

              const columnApps = apps.filter((a) => {
                const matchesSearch =
                  !searchTerm.trim() ||
                  a.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  a.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (a.portal || '').toLowerCase().includes(searchTerm.toLowerCase());
                return a.status === col.status && matchesSearch;
              });

              const isOver = dragOverColumn === col.status;

              return (
                <div
                  key={col.status}
                  data-column-status={col.status}
                  className={`
                    ${isFiltered && !isSelected ? 'hidden lg:block' : 'block'}
                    ${
                      isFiltered && isSelected
                        ? 'w-full max-w-md mx-auto lg:max-w-none lg:w-[290px] lg:min-w-[290px]'
                        : 'snap-center shrink-0 w-[85vw] sm:w-[280px] lg:w-[290px] min-w-[280px] lg:min-w-[290px]'
                    }
                    rounded-[10px] border transition-all duration-200 p-3 space-y-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs
                    ${
                      isOver
                        ? 'border-cobalt-500 ring-2 ring-cobalt-500/30 bg-orange-50/50 dark:bg-orange-950/30 scale-[1.01]'
                        : isFiltered && isSelected
                        ? 'lg:ring-2 lg:ring-cobalt-500 lg:border-cobalt-500 lg:shadow-md'
                        : isFiltered
                        ? 'lg:opacity-60 lg:hover:opacity-100'
                        : ''
                    }
                    ${col.colorClass}
                  `}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-[10px] text-caption font-bold border flex items-center gap-1.5 ${col.badgeBg}`}>
                        <span>{col.label}</span>
                      </span>
                      {isFiltered && isSelected && (
                        <span className="hidden lg:inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-cobalt-500 text-white">
                          Fokus
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-[10px] border border-slate-200 dark:border-slate-700">
                      {columnApps.length}
                    </span>
                  </div>

                  {/* Cards List in Column */}
                  <div className="space-y-3 min-h-[220px] transition-all">
                    {columnApps.length === 0 ? (
                      <div
                        className={`p-6 text-center text-caption border border-dashed rounded-[10px] min-h-[160px] transition-all flex flex-col items-center justify-center gap-2 select-none ${
                          isOver
                            ? 'border-orange-400 bg-orange-50/60 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 font-bold scale-[1.01]'
                            : 'border-slate-200 dark:border-slate-800 text-slate-500'
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
                                    ? 'scale-110 bg-orange-100 dark:bg-orange-900/60 text-orange-700'
                                    : config.bgClass
                                } dark:text-orange-400`}
                              >
                                <IconComp className="w-4 h-4" />
                              </div>
                              <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
                                {isOver ? 'Lepas kartu di sini!' : config.label}
                              </span>
                              <span className="text-caption text-slate-600 dark:text-slate-400 font-medium">
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
                              role="button"
                              tabIndex={-1}
                              onContextMenu={(e) => e.preventDefault()}
                              style={{
                                userSelect: 'none',
                                WebkitUserSelect: 'none',
                                WebkitTouchCallout: 'none',
                              }}
                              onPointerDown={(e) => handlePointerDownCard(e, app)}
                              className="h-[95px] rounded-[10px] border-2 border-dashed border-orange-400/40 bg-orange-50/40 dark:bg-orange-950/20 transition-all flex items-center justify-center text-orange-700 dark:text-orange-400 text-xs font-semibold select-none"
                            >
                              Pindahkan ke kolom baru...
                            </div>
                          );
                        }

                        const palette = getCardPalette(app.id);

                        return (
                          <div
                            key={app.id}
                            role="button"
                            tabIndex={0}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            style={{
                              userSelect: 'none',
                              WebkitUserSelect: 'none',
                              WebkitTouchCallout: 'none',
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleOpenDetail(app);
                              }
                            }}
                            onClick={() => {
                              if (justDraggedRef.current) return;
                              handleOpenDetail(app);
                            }}
                            onPointerDown={(e) => handlePointerDownCard(e, app)}
                            className={`group ${palette.bg} rounded-[10px] p-3.5 border ${palette.border} ${palette.hoverBorder} shadow-2xs hover:shadow-md transition-all space-y-2 md:cursor-grab md:active:cursor-grabbing relative select-none overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 touch-manipulation`}
                          >
                            {/* Top Accent Strip */}
                            <div className={`absolute top-0 left-0 right-0 h-1 ${palette.accentBar}`} />

                            {/* Header: Posisi & Perusahaan */}
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
                                  className={`text-caption ${palette.companyText} mt-0.5 truncate whitespace-nowrap overflow-hidden text-ellipsis min-w-0`}
                                  title={app.company}
                                >
                                  {app.company}
                                </p>
                              </div>

                              {/* Bell indicator if app has active reminder and hasn't been viewed */}
                              {(() => {
                                const appReminder = reminderByAppId.get(app.id);
                                if (!appReminder || viewedDotAppIds.includes(app.id) || viewedDotAppIds.includes(appReminder.id)) return null;
                                return (
                                  <span
                                    className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0 mt-0.5 animate-pulse motion-reduce:animate-none"
                                    title={`Pengingat aktif: ${appReminder.title}`}
                                  />
                                );
                              })()}
                            </div>

                            {/* Metadata Chips: Lokasi & Gaji & Match Score */}
                            {(app.location || (app.salary && app.salary !== '-') || Boolean(app.matchScore && app.matchScore > 0)) && (
                              <div className="flex flex-wrap items-center gap-1.5 text-caption">
                                {app.matchScore && app.matchScore > 0 ? (
                                  <span
                                    className="inline-flex items-center px-1.5 py-0.5 rounded-[6px] bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-extrabold"
                                    title={`Kecocokan profil: ${app.matchScore}%`}
                                  >
                                    {app.matchScore}% Match
                                  </span>
                                ) : null}
                                {app.location && (
                                  <span
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-white/70 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800/60 font-medium truncate max-w-[120px]"
                                    title={app.location}
                                  >
                                    <MapPin className="w-2.5 h-2.5 opacity-70 shrink-0" />
                                    <span className="truncate">{app.location}</span>
                                  </span>
                                )}
                                {app.salary && app.salary !== '-' && (
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-[6px] ${palette.tagBg} ${palette.tagText} font-bold truncate max-w-[120px]`}
                                    title={app.salary}
                                  >
                                    {app.salary}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Micro-Highlight Kontekstual Tahapan */}
                            {app.status === 'Interview' && (
                              <div className="flex items-center justify-between gap-1.5 px-2 py-1 rounded-[6px] bg-amber-100/70 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 text-caption font-bold">
                                <div className="flex items-center gap-1 truncate">
                                  <CalendarCheck className="w-3 h-3 text-amber-700 shrink-0 dark:text-amber-400" />
                                  <span className="truncate">
                                    {app.interviewDate || 'Atur Jadwal'} {app.interviewTime ? `• ${app.interviewTime}` : ''}
                                  </span>
                                </div>
                                <span className="shrink-0 text-caption px-1 py-0.5 rounded bg-white/80 dark:bg-slate-900">
                                  {app.interviewChecklist?.length || 0}/5 Siap
                                </span>
                              </div>
                            )}

                            {app.status === 'Offering' && (
                              <div className="flex items-center justify-between gap-1.5 px-2 py-1 rounded-[6px] bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 text-caption font-bold">
                                <div className="flex items-center gap-1 truncate">
                                  <Sparkles className="w-3 h-3 text-emerald-700 shrink-0 dark:text-emerald-400" />
                                  <span className="truncate">
                                    {app.offerDeadline ? `Batas: ${app.offerDeadline}` : 'Offering Letter'}
                                  </span>
                                </div>
                                <span className="shrink-0 text-caption px-1 py-0.5 rounded bg-emerald-700 text-white font-bold">
                                  {app.offeringChecklist?.length || 0}/7 Siap
                                </span>
                              </div>
                            )}
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
            const getDashboardZoom = (): number => {
              if (typeof window === 'undefined') return 1;
              const docZoom = parseFloat(window.getComputedStyle(document.documentElement).zoom);
              if (!isNaN(docZoom) && docZoom > 0) return docZoom;

              const bodyZoom = parseFloat(window.getComputedStyle(document.body).zoom);
              if (!isNaN(bodyZoom) && bodyZoom > 0) return bodyZoom;

              const layout = document.getElementById('dashboard-root-layout');
              if (layout) {
                const zoomStr = window.getComputedStyle(layout).zoom;
                const parsed = parseFloat(zoomStr);
                if (!isNaN(parsed) && parsed > 0) return parsed;
              }
              return 1;
            };
            const currentZoom = getDashboardZoom();
            return (
              <div
                onContextMenu={(e) => e.preventDefault()}
                style={{
                  position: 'fixed',
                  left: (dragPos.x - dragOffset.x) / currentZoom,
                  top: (dragPos.y - dragOffset.y) / currentZoom,
                  width: dragWidth / currentZoom,
                  transformOrigin: `${dragOffset.x / currentZoom}px ${dragOffset.y / currentZoom}px`,
                  pointerEvents: 'none',
                  zIndex: 9999,
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  WebkitTouchCallout: 'none',
                }}
                className={`${dragPalette.bg} rounded-[10px] p-3.5 border-2 border-cobalt-500 shadow-2xl scale-[1.02] rotate-1 space-y-2 opacity-100 ring-4 ring-cobalt-500/20 select-none overflow-hidden`}
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
                      className={`text-caption ${dragPalette.companyText} mt-0.5 truncate whitespace-nowrap overflow-hidden text-ellipsis min-w-0`}
                      title={activeDragItem.company}
                    >
                      {activeDragItem.company}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-caption">
                  {activeDragItem.location && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-white/70 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800/60 font-medium truncate max-w-[120px]">
                      <MapPin className="w-2.5 h-2.5 opacity-70 shrink-0" />
                      <span className="truncate">{activeDragItem.location}</span>
                    </span>
                  )}
                  {activeDragItem.salary && activeDragItem.salary !== '-' && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-[6px] ${dragPalette.tagBg} ${dragPalette.tagText} font-bold truncate max-w-[120px]`}>
                      {activeDragItem.salary}
                    </span>
                  )}
                </div>
              </div>
            );
          })()}

          {/* CANCEL ZONE INDICATOR (Drag to Header) */}
          {activeDragItem && dragPos.y < 90 && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-full shadow-2xl flex items-center gap-2 animate-bounce pointer-events-none select-none">
              <X className="w-3.5 h-3.5" />
              <span>Lepas di sini untuk batalkan</span>
            </div>
          )}
        </div>
        )
      )}

      {/* VIEW 2: LIST TABEL */}
      {!isLoading && apps.length > 0 && viewMode === 'table' && (
        <div className="bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
          {/* DESKTOP TABLE VIEW */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-caption">
                  <th className="px-3.5 py-3">
                    <button
                      type="button"
                      onClick={() => handleSort('position')}
                      className={`flex items-center gap-1.5 hover:text-orange-600 dark:hover:text-orange-400 transition cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 rounded px-1 py-0.5 ${
                        sortField === 'position' || sortField === 'company' ? 'text-orange-700 dark:text-orange-400 font-black' : ''
                      }`}
                    >
                      <span>Posisi & Perusahaan</span>
                      {sortField === 'position' || sortField === 'company' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-orange-700 dark:text-orange-400 shrink-0" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-orange-700 dark:text-orange-400 shrink-0" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 opacity-50 shrink-0 dark:text-slate-400" />
                      )}
                    </button>
                  </th>
                  <th className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => handleSort('location')}
                      className={`flex items-center gap-1.5 hover:text-orange-600 dark:hover:text-orange-400 transition cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 rounded px-1 py-0.5 ${
                        sortField === 'location' ? 'text-orange-700 dark:text-orange-400 font-black' : ''
                      }`}
                    >
                      <span>Lokasi</span>
                      {sortField === 'location' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-orange-700 dark:text-orange-400 shrink-0" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-orange-700 dark:text-orange-400 shrink-0" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 opacity-50 shrink-0 dark:text-slate-400" />
                      )}
                    </button>
                  </th>
                  <th className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => handleSort('appliedDate')}
                      className={`flex items-center gap-1.5 hover:text-orange-600 dark:hover:text-orange-400 transition cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 rounded px-1 py-0.5 ${
                        sortField === 'appliedDate' ? 'text-orange-700 dark:text-orange-400 font-black' : ''
                      }`}
                    >
                      <span>Tanggal Melamar</span>
                      {sortField === 'appliedDate' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-orange-700 dark:text-orange-400 shrink-0" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-orange-700 dark:text-orange-400 shrink-0" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 opacity-50 shrink-0 dark:text-slate-400" />
                      )}
                    </button>
                  </th>
                  <th className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => handleSort('portal')}
                      className={`flex items-center gap-1.5 hover:text-orange-600 dark:hover:text-orange-400 transition cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 rounded px-1 py-0.5 ${
                        sortField === 'portal' ? 'text-orange-700 dark:text-orange-400 font-black' : ''
                      }`}
                    >
                      <span>Portal Melamar</span>
                      {sortField === 'portal' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-orange-700 dark:text-orange-400 shrink-0" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-orange-700 dark:text-orange-400 shrink-0" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 opacity-50 shrink-0 dark:text-slate-400" />
                      )}
                    </button>
                  </th>
                  <th className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => handleSort('salary')}
                      className={`flex items-center gap-1.5 hover:text-orange-600 dark:hover:text-orange-400 transition cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 rounded px-1 py-0.5 ${
                        sortField === 'salary' ? 'text-orange-700 dark:text-orange-400 font-black' : ''
                      }`}
                    >
                      <span>Ekspektasi Gaji</span>
                      {sortField === 'salary' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-orange-700 dark:text-orange-400 shrink-0" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-orange-700 dark:text-orange-400 shrink-0" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 opacity-50 shrink-0 dark:text-slate-400" />
                      )}
                    </button>
                  </th>
                  <th className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => handleSort('status')}
                      className={`flex items-center gap-1.5 hover:text-orange-600 dark:hover:text-orange-400 transition cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 rounded px-1 py-0.5 ${
                        sortField === 'status' ? 'text-orange-700 dark:text-orange-400 font-black' : ''
                      }`}
                    >
                      <span>Status Seleksi</span>
                      {sortField === 'status' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-orange-700 dark:text-orange-400 shrink-0" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-orange-700 dark:text-orange-400 shrink-0" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 opacity-50 shrink-0 dark:text-slate-400" />
                      )}
                    </button>
                  </th>
                  <th className="px-3 py-3 font-bold text-slate-600 dark:text-slate-400 text-caption">Catatan</th>
                  <th className="px-3 py-3 text-right font-bold text-slate-600 dark:text-slate-400 text-caption sticky right-0 bg-slate-50 dark:bg-slate-800/80 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.04)]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {sortedAndFilteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 sm:p-10 text-center">
                      <MascotEmptyState
                        size="md"
                        title={
                          searchTerm.trim() || filterStatus !== 'Semua'
                            ? 'Lamaran tidak ditemukan'
                            : 'Belum ada lamaran yang tercatat'
                        }
                        description={
                          searchTerm.trim() || filterStatus !== 'Semua'
                            ? 'Coba sesuaikan kata kunci pencarian atau reset filter status kamu.'
                            : 'Catat setiap lamaran kerja yang kamu kirim untuk memantau tahapan seleksi secara terpusat.'
                        }
                        action={
                          searchTerm.trim() || filterStatus !== 'Semua' ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSearchTerm('');
                                setFilterStatus('Semua');
                                if (typeof window !== 'undefined') {
                                  const cleanUrl = new URL(window.location.href);
                                  cleanUrl.searchParams.delete('search');
                                  cleanUrl.searchParams.delete('tab');
                                  cleanUrl.searchParams.delete('status');
                                  cleanUrl.searchParams.delete('reminder');
                                  window.history.replaceState(
                                    {},
                                    '',
                                    cleanUrl.pathname + (cleanUrl.searchParams.toString() ? `?${cleanUrl.searchParams.toString()}` : '')
                                  );
                                }
                              }}
                              className="px-4 py-2 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 focus-visible:ring-offset-2"
                            >
                              Reset Pencarian & Filter
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setIsAddModalOpen(true)}
                              className="px-4 py-2.5 rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-cobalt-500/20 transition flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 focus-visible:ring-offset-2"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Tambah Lamaran Pertama</span>
                            </button>
                          )
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  sortedAndFilteredApps.map((app) => (
                    <tr
                      key={app.id}
                      className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="px-3.5 py-3">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-[8px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200 shrink-0 select-none shadow-2xs mt-0.5">
                            {app.company ? app.company.replace(/^(PT|CV|Fa|Firma)\s+/i, '').trim().charAt(0).toUpperCase() : 'K'}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 dark:text-white text-xs leading-snug truncate max-w-xs">
                              {app.position}
                            </div>
                            <div className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <span className="truncate max-w-[140px]">{app.company}</span>
                              {app.matchScore && app.matchScore > 0 ? (
                                <span className="px-1.5 py-0.2 rounded-[6px] text-[10px] font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                                  {app.matchScore}% Match
                                </span>
                              ) : null}
                            </div>
                            {(() => {
                              const appReminder = reminderByAppId.get(app.id);
                              if (!appReminder) return null;
                              return (
                                <div
                                  onClick={() => setIsReminderHubOpen(true)}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[5px] bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800 text-[10px] font-bold cursor-pointer hover:bg-orange-100 transition mt-1 select-none"
                                  title={`${appReminder.title}: ${appReminder.message}`}
                                >
                                  <Clock className="w-2.5 h-2.5 text-orange-600 dark:text-orange-400 shrink-0" />
                                  <span>Pengingat Jadwal</span>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                          <span className="truncate max-w-[120px]">{app.location || '-'}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                          <span>{app.appliedDate || '-'}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5 font-medium text-xs">
                          <Globe className="w-3.5 h-3.5 text-orange-700 shrink-0 dark:text-orange-400" />
                          {app.portalUrl ? (
                            <a
                              href={app.portalUrl.startsWith('http') ? app.portalUrl : `https://${app.portalUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline flex items-center gap-1 text-orange-700 dark:text-orange-400 font-bold"
                              title={`Buka link ${app.portal}`}
                            >
                              <span className="truncate max-w-[90px]">{app.portal || '-'}</span>
                              <ExternalLink className="w-3 h-3 shrink-0 opacity-80" />
                            </a>
                          ) : (
                            <span className="truncate max-w-[90px]">{app.portal || '-'}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap font-bold text-xs text-emerald-700 dark:text-emerald-400">
                        {app.salary || '-'}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
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
                            options={['Tersimpan', 'Terkirim', 'Screening', 'Interview', 'Offering', 'Ditolak']}
                            size="sm"
                          />
                        </div>
                      </td>
                      <td className="px-3 py-3 min-w-[160px] max-w-xs text-xs">
                        {app.status === 'Interview' ? (
                          <div className="space-y-1.5">
                            {(() => {
                              const isIgnored = app.ignoreInterviewReminder || isAppInterviewIgnored(app.id);
                              if (isIgnored) {
                                return (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenInterviewModal(app)}
                                    className="inline-flex items-center gap-1 text-caption text-slate-500 hover:text-cobalt-500 dark:hover:text-blue-400 transition cursor-pointer dark:text-slate-400"
                                    title="Pengingat diabaikan. Klik untuk atur jadwal & persiapan."
                                  >
                                    <BellOff className="w-3 h-3 text-slate-500 shrink-0 dark:text-slate-400" />
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
                                        className="inline-flex items-center gap-1 px-2 py-1 rounded-[6px] text-caption font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition cursor-pointer shadow-2xs"
                                        title="Wawancara telah selesai. Klik untuk evaluasi hasil"
                                      >
                                        <CheckCircle2 className="w-3 h-3 text-amber-700 dark:text-amber-400 shrink-0" />
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
                                      className="inline-flex items-center gap-1 px-2 py-1 rounded-[6px] text-caption font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/90 dark:border-indigo-800/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition cursor-pointer shadow-2xs"
                                      title="Klik untuk ubah jadwal & checklist persiapan"
                                    >
                                      <CalendarCheck className="w-3 h-3 text-indigo-500 shrink-0" />
                                      <span>{app.interviewDate || 'Wawancara'} {app.interviewTime ? `• ${app.interviewTime} ${app.interviewTimezone || 'WIB'}` : ''}</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenPostInterviewModal(app)}
                                      className="px-2 py-1 rounded-[6px] bg-amber-50 hover:bg-amber-100 text-amber-700 dark:text-amber-300 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-caption font-bold transition cursor-pointer shadow-2xs flex items-center gap-1"
                                      title="Evaluasi hasil wawancara (Gimana hasilnya?)"
                                    >
                                      <CheckCircle2 className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                                      <span>Hasil?</span>
                                    </button>
                                  </div>
                                );
                              }
                              return (
                                <button
                                  type="button"
                                  onClick={() => handleOpenInterviewModal(app)}
                                  className="inline-flex items-center gap-1 text-caption text-amber-700 dark:text-amber-400 font-semibold hover:underline cursor-pointer"
                                >
                                  <Clock className="w-3 h-3 text-amber-700 shrink-0 dark:text-amber-400" />
                                  <span>Atur Jam &amp; Checklist</span>
                                </button>
                              );
                            })()}

                            {/* Catatan / Evaluasi Text */}
                            {(app.interviewNotes || app.notes) && (
                              <p className="text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed text-xs">
                                {app.interviewNotes ? (
                                  <span>
                                    <strong className="text-orange-700 dark:text-orange-400 mr-1">Evaluasi:</strong>
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
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-caption font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300/80 dark:border-emerald-700/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition cursor-pointer shadow-2xs"
                                title="Buka checklist & panduan telaah penawaran kerja"
                              >
                                <Sparkles className="w-3 h-3 text-emerald-700 dark:text-emerald-400 shrink-0" />
                                <span>
                                  Persiapan Offering ({app.offeringChecklist?.length ? `${app.offeringChecklist.length}/7 Siap` : 'Cek Panduan'})
                                </span>
                              </button>
                            </div>
                            {(app.offerDeadline || app.offeringStartDate) && (
                              <p className="text-caption text-slate-500 dark:text-slate-400">
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
                      <td className="px-3 py-3 text-right whitespace-nowrap sticky right-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50/80 dark:group-hover:bg-slate-800/40 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.04)]">
                        <div className="flex items-center justify-end gap-1.5">
                          <IconButton
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenDetail(app)}
                            label={`Detail lamaran ${app.position} di ${app.company}`}
                            title="Lihat Detail"
                            className="text-cobalt-500 hover:text-cobalt-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/60"
                          >
                            <FileText className="w-4 h-4" />
                          </IconButton>
                          <IconButton
                            size="sm"
                            variant="danger"
                            onClick={() => setAppToDelete(app)}
                            label={`Hapus lamaran ${app.position} di ${app.company}`}
                            title="Hapus Lamaran"
                          >
                            <Trash2 className="w-4 h-4" />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE COMPACT LIST VIEW (< 640px) */}
          <div className="sm:hidden">
            {/* Header info baris & sorting cepat mobile */}
            <div className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-caption font-bold text-slate-600 dark:text-slate-400 select-none">
              <span>{sortedAndFilteredApps.length} Lamaran Terdata</span>
              <button
                type="button"
                onClick={() => handleSort(sortField === 'appliedDate' ? 'position' : 'appliedDate')}
                className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 font-bold cursor-pointer"
                title="Ganti urutan"
              >
                <span>Urut: {sortField === 'appliedDate' ? 'Tanggal' : sortField === 'position' ? 'Posisi' : sortField === 'status' ? 'Status' : 'Default'}</span>
                <ArrowUpDown className="w-3 h-3 text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            {sortedAndFilteredApps.length === 0 ? (
              <div className="p-4 sm:p-6 text-center">
                <MascotEmptyState
                  size="sm"
                  title={
                    searchTerm.trim() || filterStatus !== 'Semua'
                      ? 'Lamaran tidak ditemukan'
                      : 'Belum ada lamaran tercatat'
                  }
                  description={
                    searchTerm.trim() || filterStatus !== 'Semua'
                      ? 'Coba sesuaikan pencarian atau reset filter status.'
                      : 'Catat lamaran pertamamu untuk memantau status seleksi.'
                  }
                  action={
                    searchTerm.trim() || filterStatus !== 'Semua' ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm('');
                          setFilterStatus('Semua');
                          if (typeof window !== 'undefined') {
                            const cleanUrl = new URL(window.location.href);
                            cleanUrl.searchParams.delete('search');
                            cleanUrl.searchParams.delete('tab');
                            cleanUrl.searchParams.delete('status');
                            cleanUrl.searchParams.delete('reminder');
                            window.history.replaceState(
                              {},
                              '',
                              cleanUrl.pathname + (cleanUrl.searchParams.toString() ? `?${cleanUrl.searchParams.toString()}` : '')
                            );
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
                      >
                        Reset Pencarian & Filter
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-3.5 py-2 rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 text-white font-bold text-xs shadow-md shadow-cobalt-500/20 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Lamaran</span>
                      </button>
                    )
                  }
                />
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {sortedAndFilteredApps.map((app) => {
                  const appReminder = reminderByAppId.get(app.id);
                  return (
                    <div
                      key={app.id}
                      onClick={() => handleOpenDetail(app)}
                      className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 active:bg-slate-100 dark:active:bg-slate-800 transition cursor-pointer flex items-center justify-between gap-3"
                    >
                      {/* Left: Info Lowongan */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-snug truncate">
                            {app.position}
                          </h4>
                        </div>

                        <div className="flex items-center gap-1.5 text-caption text-slate-600 dark:text-slate-400 truncate">
                          <Building2 className="w-3 h-3 shrink-0 text-slate-600 dark:text-slate-400" />
                          <span className="truncate">{app.company}</span>
                          {app.location && (
                            <>
                              <span className="text-slate-600 dark:text-slate-400">•</span>
                              <span className="truncate">{app.location}</span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-600 dark:text-slate-400 shrink-0" />
                            <span>{app.appliedDate}</span>
                          </span>
                          {app.salary && app.salary !== '-' && (
                            <>
                              <span className="text-slate-600 dark:text-slate-400">•</span>
                              <span className="font-semibold text-emerald-700 dark:text-emerald-400 truncate max-w-[120px]">
                                {app.salary}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Reminder Highlight jika ada */}
                        {appReminder && (
                          <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[5px] bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 text-[10px] font-bold border border-orange-200 dark:border-orange-800 mt-0.5">
                            <Clock className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate max-w-[200px]">{appReminder.title}</span>
                          </div>
                        )}
                      </div>

                      {/* Right: Badge Status & Chevron */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-2 py-0.5 rounded-[10px] text-[11px] font-bold border ${getStatusBadgeClass(app.status)}`}>
                            {app.status}
                          </span>
                          {app.matchScore && app.matchScore > 0 ? (
                            <span className="px-1.5 py-0.2 rounded-[6px] text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              {app.matchScore}% Match
                            </span>
                          ) : null}
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400 shrink-0" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sidebar Drawer Tambah Lamaran (Dari Kanan) */}
      <Sheet open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <SheetContent
          side="right"
          returnFocusRef={addApplicationTriggerRef}
          className="w-full max-w-md sm:max-w-xl p-0 flex flex-col justify-between overflow-hidden"
        >
          {/* Drawer Header */}
          <SheetHeader className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 space-y-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[10px] bg-cobalt-500 text-white flex items-center justify-center shadow-md shadow-cobalt-500/20 shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <SheetTitle className="font-bold text-base text-slate-900 dark:text-white">
                  Tambah Lamaran Kerja
                </SheetTitle>
                <SheetDescription className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Isi detail lamaran baru untuk dipantau di Kanban Board
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Drawer Content Form */}
          <form onSubmit={handleAddApplication} className="flex-1 flex flex-col justify-between overflow-hidden">
            <SheetBody className="p-6 space-y-4 flex-1">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Nama Perusahaan <span className="text-rose-700 dark:text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Contoh: PT GoTo Gojek Tokopedia"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cobalt-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Posisi Pekerjaan <span className="text-rose-700 dark:text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Senior Frontend Engineer"
                  value={newPosition}
                  onChange={(e) => setNewPosition(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cobalt-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Lokasi Kerja
                </label>
                <CitySearchInput
                  value={newLocation}
                  onChange={(val) => setNewLocation(val)}
                  placeholder="Cari Kota / Kab di Indonesia (misal: Jakarta Selatan, Surabaya)..."
                  size="md"
                  cityOnly={true}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Tanggal Melamar
                  </label>
                  <TrackerDatePicker
                    value={newAppliedDate}
                    onChange={(val) => setNewAppliedDate(val)}
                    placeholder="Pilih Tanggal Melamar"
                    align="left"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Status Tahapan
                  </label>
                  <CustomSelect
                    value={newStatus}
                    onChange={(val) => setNewStatus(val as ApplicationItem['status'])}
                    options={['Tersimpan', 'Terkirim', 'Screening', 'Interview', 'Offering', 'Ditolak']}
                    placeholder="Pilih Status"
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
                    <span className="text-slate-500 font-normal text-caption dark:text-slate-400">
                      (Opsional, misal: linkedin.com/jobs/...)
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: linkedin.com/jobs/view/123456 atau glints.com/..."
                    value={newPortalUrl}
                    onChange={(e) => setNewPortalUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cobalt-500 transition"
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={handleCrawlJobUrl}
                      disabled={isCrawling || !newPortalUrl.trim()}
                      className="flex-1 py-2 px-3 rounded-[10px] bg-cobalt-600 hover:bg-cobalt-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                    >
                      {isCrawling ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Mengekstrak data &amp; menerbitkan ke Portal...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={13} />
                          <span>Auto-Isi dari Link Portal Loker</span>
                        </>
                      )}
                    </button>
                  </div>
                  {crawlMessage && (
                    <p className={`text-caption font-medium mt-1.5 ${crawlMessage.includes('Berhasil') ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-amber-700 dark:text-amber-400'}`}>
                      {crawlMessage}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center justify-between">
                    <span>Gaji Ekspektasi</span>
                    <span className="text-slate-500 font-normal text-caption dark:text-slate-400">Opsional</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Rp 6.000.000"
                    value={newSalary}
                    onChange={(e) => setNewSalary(formatSalaryInput(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cobalt-500 transition"
                  />
                </div>
              </div>

              {/* Info Pengingat Otomatis */}
              <div className="flex items-start gap-2.5 p-3 rounded-[10px] bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-300">
                <Clock className="w-4 h-4 text-cobalt-500 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Pengingat Otomatis Aktif</span>
                  <p className="text-caption text-blue-700/90 dark:text-blue-300/80 mt-0.5 leading-relaxed">
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
                  className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cobalt-500 transition resize-none"
                />
              </div>
            </SheetBody>

            {/* Drawer Footer Actions */}
            <SheetFooter className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex sm:flex-row items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => setIsAddModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isSaving}
                className="flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Simpan Lamaran</span>
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Detail Lamaran Drawer (Slide-in Kanan) */}
      <ApplicationDetailDrawer
        isOpen={!!selectedDetailApp}
        app={selectedDetailApp}
        onClose={() => setSelectedDetailApp(null)}
        onUpdate={handleUpdateApplication}
        onDelete={(app) => {
          setSelectedDetailApp(null);
          setAppToDelete(app);
        }}
        onOpenInterviewModal={(app) => {
          setSelectedDetailApp(null);
          handleOpenInterviewModal(app);
        }}
        onOpenOfferingModal={(app) => {
          setSelectedDetailApp(null);
          handleOpenOfferingModal(app);
        }}
        onOpenPostInterviewModal={(app) => {
          setSelectedDetailApp(null);
          handleOpenPostInterviewModal(app);
        }}
      />

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
            handleOpenDetail(target);
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

      {/* Full-screen Offering Celebration - Confetti Background Layer */}
      {showOfferingCelebration && (
        <div
          key={`confetti-${celebrationKey}`}
          aria-hidden="true"
          className="fixed inset-0 z-[45] pointer-events-none overflow-hidden"
        >
          <DotLottiePlayer
            src="/animations/confetti-ribbons.json"
            autoplay={true}
            loop={false}
            className="w-full h-full pointer-events-none [&_canvas]:!w-full [&_canvas]:!h-full [&_canvas]:!object-cover"
          />
        </div>
      )}

      {/* Modal Popup Perayaan Offering dengan Maskot Employr */}
      <OfferingCelebrationModal
        isOpen={showOfferingCelebration}
        onClose={() => setShowOfferingCelebration(false)}
        app={celebratingApp}
        onOpenPreparation={(app) => {
          setShowOfferingCelebration(false);
          handleOpenOfferingModal(app);
        }}
      />

      {/* Delete Confirmation Modal (P0 Accidental Loss Prevention) */}
      <AlertDialog open={!!appToDelete} onOpenChange={(open) => !open && setAppToDelete(null)}>
        <AlertDialogContent className="max-w-sm rounded-[10px] p-5 space-y-4">
          <AlertDialogHeader className="flex flex-row items-center gap-3 space-y-0">
            <div className="w-10 h-10 rounded-[10px] bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-800">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <AlertDialogTitle className="font-bold text-sm text-slate-900 dark:text-white">
                Hapus Lamaran Ini?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>

          {appToDelete && (
            <div className="p-3 rounded-[8px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs space-y-1">
              <p className="font-bold text-slate-900 dark:text-white truncate">
                {appToDelete.position}
              </p>
              <p className="text-slate-600 dark:text-slate-300 text-caption truncate">
                {appToDelete.company} {appToDelete.location ? `• ${appToDelete.location}` : ''}
              </p>
            </div>
          )}

          <AlertDialogFooter className="flex sm:flex-row items-center justify-end gap-2 pt-1">
            <AlertDialogCancel asChild>
              <Button variant="ghost" size="sm" onClick={() => setAppToDelete(null)}>
                Batal
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  if (appToDelete) {
                    handleDeleteApp(appToDelete.id);
                    setAppToDelete(null);
                  }
                }}
                className="flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Lamaran</span>
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

