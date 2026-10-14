'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useModals } from '@/context/ModalContext';
import { userApi, activitiesApi, trackerApi, scheduleApi, notificationsApi } from '@/lib/api';
import { calculateApplicationReminders } from '@/lib/trackerReminders';
import {
  Sun,
  Moon,
  BellRing,
  ShieldCheck,
  User,
  CheckCircle2,
  Check,
  Trash2,
  Copy,
  X,
  Sparkles,
  ExternalLink,
  LogOut,
  ChevronDown,
  ChevronRight,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  Flame,
  Gift,
  Loader2,
  Rocket,
  Briefcase,
  Clock,
  AlertTriangle,
  ShieldAlert,
  Lightbulb,
  TrendingUp,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { UserAvatar } from './UserAvatar';
import { NotificationBell } from '@/components/ui/NotificationBell';
import { cn } from '@/lib/utils';
import { useCareerReadiness } from '@/hooks/useCareerReadiness';

import { handleLogout, getStoredSession } from '@/lib/auth';
import { deslugify, isUUID } from '@/lib/slug';
import { parseCvScreenerSlug } from '@/lib/cv-screener-slug';

const ROUTE_LABELS: Record<string, string> = {
  '/beranda': 'Beranda',
  '/profil': 'Profil Saya',
  '/readiness': 'Career Readiness',
  '/cv': 'CV Saya',
  '/cv-screener': 'CV Screener',
  '/cv-screener/report': 'Laporan Evaluasi',
  '/linkedin': 'Optimasi LinkedIn',
  '/career-intelligence': 'Career Intelligence',
  '/match-cv': 'Komparasi Lowongan',
  '/tracker': 'Tracker Lamaran',
  '/mailer': 'Email & Cover Letter',
  '/misi-cuan': 'Cuan Tambahan',
  '/referral': 'Program Referral',
  '/pengaturan': 'Pengaturan Akun',
  '/saran-fitur': 'Saran Fitur',
  '/lapor-bug': 'Lapor Kendala',
};

function getBreadcrumbs(pathname: string | null, activeCvTitle?: string): { label: string; href?: string }[] {
  if (!pathname || pathname === '/' || pathname === '/beranda') {
    return [
      { label: 'Dashboard', href: '/beranda' },
      { label: 'Beranda' },
    ];
  }

  const matched = ROUTE_LABELS[pathname];
  if (matched) {
    return [
      { label: 'Dashboard', href: '/beranda' },
      { label: matched },
    ];
  }

  const segments = pathname.split('/').filter(Boolean);
  const crumbs: { label: string; href?: string }[] = [{ label: 'Dashboard', href: '/beranda' }];

  // Khusus rute CV Screener Report (/cv-screener/report/[role]/[name])
  if (segments[0] === 'cv-screener' && segments[1] === 'report' && segments.length > 2) {
    crumbs.push({ label: 'CV Screener', href: '/cv-screener' });
    crumbs.push({ label: 'Laporan Evaluasi', href: '/cv-screener/report' });
    const roleSeg = segments[2];
    const nameSeg = segments[3];
    if (roleSeg) {
      crumbs.push({
        label: deslugify(roleSeg),
        href: nameSeg ? `/cv-screener/report/${roleSeg}/${nameSeg}` : undefined,
      });
    }
    if (nameSeg) {
      const { cleanName } = parseCvScreenerSlug(nameSeg);
      crumbs.push({
        label: deslugify(cleanName),
      });
    }
    return crumbs;
  }

  // Khusus rute CV Editor / Detail (/cv/[id-atau-slug])
  if (segments[0] === 'cv' && segments.length > 1) {
    crumbs.push({ label: 'CV Saya', href: '/cv' });
    const sub = segments[1];
    let label = '';
    if (activeCvTitle && activeCvTitle.trim().length > 0) {
      label = activeCvTitle;
    } else if (isUUID(sub)) {
      label = 'Editor CV ATS';
    } else {
      label = deslugify(sub);
    }
    crumbs.push({ label });
    return crumbs;
  }

  let currentPath = '';
  segments.forEach((seg, idx) => {
    currentPath += `/${seg}`;
    const isLast = idx === segments.length - 1;
    const label = ROUTE_LABELS[currentPath] || (isUUID(seg) ? 'Dokumen' : seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '));
    crumbs.push({
      label,
      href: isLast ? undefined : currentPath,
    });
  });

  return crumbs;
}

interface HeaderProps {
  currentUser?: { name: string; email: string };
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser: propUser,
  onToggleSidebar,
  isSidebarCollapsed = false,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeCvTitle, setActiveCvTitle] = useState<string>('');
  const breadcrumbs = getBreadcrumbs(pathname, activeCvTitle);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { score: readinessScore } = useCareerReadiness();

  const isRootTab = !pathname || ['/', '/beranda', '/cv', '/tracker', '/profil'].includes(pathname);
  const isHome = !pathname || pathname === '/' || pathname === '/beranda';

  const handleBack = () => {
    if (
      typeof window !== 'undefined' &&
      typeof window.history.state === 'object' &&
      window.history.state !== null &&
      typeof (window.history.state as any).idx === 'number' &&
      (window.history.state as any).idx > 0
    ) {
      router.back();
    } else {
      const parentCrumb = breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2]?.href : '/beranda';
      router.push(parentCrumb || '/beranda');
    }
  };

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('employr_active_cv_title');
      if (stored) setActiveCvTitle(stored);
    }

    const handleCvTitle = (e: Event) => {
      const customEvent = e as CustomEvent<{ title?: string }>;
      if (customEvent.detail && typeof customEvent.detail.title === 'string') {
        setActiveCvTitle(customEvent.detail.title);
      }
    };

    window.addEventListener('employr:cv-title-change', handleCvTitle);
    return () => {
      window.removeEventListener('employr:cv-title-change', handleCvTitle);
    };
  }, []);

  const isDarkMode = mounted && resolvedTheme === 'dark';
  const toggleDarkMode = () => setTheme(isDarkMode ? 'light' : 'dark');

  const { openUpgrade, openWhatsNew } = useModals();
  const onOpenUpgradeModal = openUpgrade;
  const onOpenWhatsNewModal = openWhatsNew;
  const onOpenProfile = (tab?: string) => {
    if (tab === 'pengaturan' || tab === 'keamanan') {
      router.push('/pengaturan' + (tab === 'keamanan' ? '?tab=keamanan' : ''));
    } else {
      router.push('/profil' + (tab === 'karir' ? '?tab=karir' : ''));
    }
  };
  const onLogout = handleLogout;

  const [currentUser, setCurrentUser] = useState(
    propUser || { name: 'Pengguna Employr', email: 'user@employr.id' }
  );

  useEffect(() => {
    const session = getStoredSession();
    if (session && session.name) {
      setCurrentUser({
        name: session.name,
        email: session.email || 'user@employr.id',
      });
    }

    userApi.getProfile().then((profile) => {
      if (profile && profile.fullName) {
        setCurrentUser({
          name: profile.fullName,
          email: profile.email || 'user@employr.id',
        });
      }
    });
  }, []);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifTab, setNotifTab] = useState<'all' | 'reminders' | 'system'>('all');
  const [notifications, setNotifications] = useState<Array<{
    id: number | string;
    rawId?: string;
    title: string;
    desc: string;
    time: string;
    unread: boolean;
    href?: string | null;
    category?: string;
    urgency?: 'critical' | 'high' | 'medium' | 'info';
    company?: string;
    position?: string;
    templateType?: 'follow_up_apply' | 'follow_up_final' | 'thank_you_interview' | 'follow_up_interview' | 'inquiry_offer';
    actionText?: string;
  }>>([]);
  const [isLoadingNotifs, setIsLoadingNotifs] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isDeletingRead, setIsDeletingRead] = useState(false);

  // Prefetch route notifikasi di background agar saat diklik navigasi terjadi secara instan
  useEffect(() => {
    if (showNotifications && notifications.length > 0) {
      notifications.forEach((n) => {
        if (n.href && typeof n.href === 'string' && n.href.startsWith('/')) {
          router.prefetch(n.href);
        }
      });
    }
  }, [showNotifications, notifications, router]);

  // Refs for click outside to close dropdowns
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowNotifications(false);
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Ergonomi Mobile: Intercept tombol Back bawaan HP / swipe gesture back agar menutup drawer alih-alih keluar halaman
  useEffect(() => {
    if (!showNotifications) return;

    const stateKey = 'employr_drawer_notifications';
    if (typeof window !== 'undefined' && !window.history.state?.[stateKey]) {
      window.history.pushState({ [stateKey]: true }, '');
    }

    const handlePopState = () => {
      // Tombol Back bawaan HP atau gesture swipe back ditekan -> tutup drawer
      setShowNotifications(false);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      // Jika drawer ditutup lewat UI (tombol X atau klik backdrop), pulihkan stack browser
      if (typeof window !== 'undefined' && window.history.state?.[stateKey]) {
        window.history.back();
      }
    };
  }, [showNotifications]);

  // Helper: relative time label
  function getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  }

  // Load notifications: DB-backed + Smart Tracker Reminders + fallbacks
  useEffect(() => {
    const loadNotifications = async () => {
      setIsLoadingNotifs(true);
      try {
        const [dbNotifs, apps, activities, schedules] = await Promise.all([
          notificationsApi.getAll().catch(() => []),
          trackerApi.getAll().catch(() => []),
          activitiesApi.getAll(10).catch(() => []),
          scheduleApi.getAll().catch(() => []),
        ]);

        let dismissedReminderIds: string[] = [];
        let readReminderIds: string[] = [];
        if (typeof window !== 'undefined') {
          try {
            const dis = localStorage.getItem('employr_dismissed_reminders');
            if (dis) dismissedReminderIds = JSON.parse(dis);
            const read = localStorage.getItem('employr_read_tracker_notifications');
            if (read) readReminderIds = JSON.parse(read);
          } catch {}
        }

        // Kalkulasi Smart Reminders dari data Tracker
        let trackerNotifItems: Array<{
          id: string;
          rawId: string;
          title: string;
          desc: string;
          time: string;
          unread: boolean;
          href: string;
          category: string;
          urgency: 'critical' | 'high' | 'medium' | 'info';
          company?: string;
          position?: string;
          templateType?: any;
          actionText?: string;
        }> = [];

        if (Array.isArray(apps) && apps.length > 0) {
          const rawReminders = calculateApplicationReminders(apps);
          const activeReminders = rawReminders.filter(
            (r) => !dismissedReminderIds.includes(r.id) && r.id !== 'rem-no-apps'
          );

          trackerNotifItems = activeReminders.map((r) => {
            const isRead = readReminderIds.includes(r.id);
            const isInterview = r.templateType === 'thank_you_interview' || r.category === 'interview';
            const companyParam = r.company ? encodeURIComponent(r.company) : '';
            return {
              id: `tracker-${r.id}`,
              rawId: r.id,
              appId: r.appId,
              title: r.title,
              desc: `${r.company} (${r.position}) • ${r.message}`,
              time: r.dueLabel || (r.daysDiff !== undefined ? (r.daysDiff > 0 ? `H-${r.daysDiff}` : `H+${Math.abs(r.daysDiff)}`) : 'Pengingat'),
              unread: !isRead,
              href: `/tracker?search=${companyParam}${isInterview ? '&tab=interview' : ''}&reminder=${r.id}`,
              category: 'TRACKER',
              urgency: r.urgency,
              company: r.company,
              position: r.position,
              templateType: r.templateType,
              actionText: r.actionText || 'Buka Tracker',
            };
          });
        }

        // Jika belum ada reminder aktif dari database (misal data baru / kosong),
        // sediakan starter smart reminders sesuai skenario pengingat agar user langsung bisa melihat fungsinya di Header
        if (trackerNotifItems.length === 0) {
          const sampleReminders = [
            {
              rawId: 'demo-rem-apply-3d',
              company: 'PT Fintek Nusantara',
              position: 'Junior Frontend Engineer',
              title: 'Sudah 3 Hari Sejak Melamar',
              desc: 'PT Fintek Nusantara (Junior Frontend Engineer) • Sudah 3 hari sejak kamu melamar. Belum ada update dari perusahaan.',
              time: 'H+3 Apply',
              urgency: 'medium' as const,
              templateType: 'follow_up_apply' as const,
              actionText: 'Salin Draf Follow-up',
            },
            {
              rawId: 'demo-rem-followup-5d',
              company: 'PT Digital Kreatif',
              position: 'UI/UX Designer',
              title: 'Saatnya Follow-up Lamaran',
              desc: 'PT Digital Kreatif (UI/UX Designer) • Saatnya follow-up lamaran ini ke HRD untuk memastikan berkas telah ditinjau.',
              time: 'H+5 Apply',
              urgency: 'high' as const,
              templateType: 'follow_up_apply' as const,
              actionText: 'Salin Draf Follow-up',
            },
            {
              rawId: 'demo-rem-interview-h1',
              company: 'GoTo Indonesia',
              position: 'Product Specialist',
              title: 'Jadwal Interview Besok!',
              desc: 'GoTo Indonesia (Product Specialist) • Besok kamu punya jadwal interview pukul 10:00 WIB. Cek link meeting & pakaian.',
              time: 'Besok (H-1)',
              urgency: 'critical' as const,
              templateType: 'thank_you_interview' as const,
              actionText: 'Siapkan Jawaban',
            },
          ];

          trackerNotifItems = sampleReminders
            .filter((s) => !dismissedReminderIds.includes(s.rawId))
            .map((s) => {
              const isInterview = s.urgency === 'critical' || (s.templateType as string) === 'thank_you_interview';
              const companyParam = s.company ? encodeURIComponent(s.company) : '';
              return {
                id: `tracker-${s.rawId}`,
                rawId: s.rawId,
                title: s.title,
                desc: s.desc,
                time: s.time,
                unread: !readReminderIds.includes(s.rawId),
                href: `/tracker?search=${companyParam}${isInterview ? '&tab=interview' : ''}&reminder=${s.rawId}`,
                category: 'TRACKER',
                urgency: s.urgency,
                company: s.company,
                position: s.position,
                templateType: s.templateType,
                actionText: s.actionText,
              };
            });
        }

        // DB notifications
        const formattedDbNotifs = (Array.isArray(dbNotifs) ? dbNotifs : []).map((n: any) => {
          let derivedHref = n.actionUrl;
          if (!derivedHref) {
            const cat = (n.category || '').toUpperCase();
            const text = ((n.title || '') + ' ' + (n.message || '')).toLowerCase();
            if (cat === 'TRACKER' || text.includes('lamaran') || text.includes('interview')) {
              derivedHref = '/tracker';
            } else if (cat === 'CAREER' || cat === 'OPPORTUNITY' || text.includes('loker') || text.includes('lowongan')) {
              derivedHref = '/loker';
            } else if (cat === 'DRAFT' || text.includes('cv') || text.includes('ats')) {
              derivedHref = '/cv';
            } else if (cat === 'ORDER' || cat === 'MEMBERSHIP') {
              derivedHref = '/profil';
            } else {
              derivedHref = '/beranda';
            }
          }

          return {
            id: n.id,
            rawId: n.id,
            title: n.title,
            desc: n.message,
            time: n.timeLabel || 'Baru saja',
            unread: !n.isRead,
            href: derivedHref,
            category: n.category || 'SYSTEM',
            urgency: (n.priority === 'CRITICAL' ? 'critical' : n.priority === 'IMPORTANT' ? 'high' : 'info') as 'critical' | 'high' | 'medium' | 'info',
            actionText: 'Buka Halaman',
          };
        });

        const urgentTracker = trackerNotifItems.filter(r => r.urgency === 'critical' || r.urgency === 'high');
        const otherTracker = trackerNotifItems.filter(r => r.urgency !== 'critical' && r.urgency !== 'high');

        let finalNotifs: any[] = [...urgentTracker, ...formattedDbNotifs, ...otherTracker];

        // Jika DB kosong dan notifikasi sedikit, tambahkan info jadwal / aktivitas
        if (formattedDbNotifs.length === 0 && finalNotifs.length < 5) {
          const fallbackNotifs: any[] = [];
          let dismissedFallbackIds: string[] = [];
          if (typeof window !== 'undefined') {
            try {
              const rawFallback = localStorage.getItem('employr_dismissed_fallback_notifications');
              if (rawFallback) dismissedFallbackIds = JSON.parse(rawFallback);
            } catch {}
          }
          let idCounter = 1000;

          if (Array.isArray(schedules) && schedules.length > 0) {
            const now = new Date();
            const upcomingInterviews = schedules
              .filter((s: any) => {
                const d = new Date(s.date || s.scheduledAt || s.startTime);
                return d >= now && (s.type === 'interview' || s.type === 'Interview');
              })
              .slice(0, 2);

            upcomingInterviews.forEach((s: any) => {
              const notifId = `schedule-${idCounter++}`;
              if (dismissedFallbackIds.includes(notifId)) return;

              const d = new Date(s.date || s.scheduledAt || s.startTime);
              const isToday = d.toDateString() === now.toDateString();
              const timeStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) +
                ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
              const companyName = s.company || s.title || '';
              fallbackNotifs.push({
                id: notifId,
                title: 'Jadwal Interview Mendatang',
                desc: `Interview ${companyName || 'Perusahaan'} pada ${timeStr} WIB.`,
                time: isToday ? 'Hari ini' : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
                unread: true,
                href: `/tracker?tab=interview&search=${encodeURIComponent(companyName)}`,
                category: 'INTERVIEW',
                urgency: 'high' as const,
                company: companyName,
                actionText: 'Lihat Jadwal',
              });
            });
          }

          if (Array.isArray(activities) && activities.length > 0) {
            activities.slice(0, Math.max(0, 4 - finalNotifs.length)).forEach((act: any) => {
              const notifId = `activity-${idCounter++}`;
              if (dismissedFallbackIds.includes(notifId)) return;

              let actHref = '/beranda';
              const text = (act.title || act.type || act.description || act.message || '').toLowerCase();
              if (text.includes('cv') || text.includes('resume')) actHref = '/cv';
              else if (text.includes('lamaran') || text.includes('apply') || text.includes('interview')) actHref = '/tracker';
              else if (text.includes('loker') || text.includes('job')) actHref = '/loker';

              fallbackNotifs.push({
                id: notifId,
                title: act.title || act.type || 'Aktivitas Terbaru',
                desc: act.description || act.message || 'Ada aktivitas baru di dashboard kamu.',
                time: act.createdAt ? getRelativeTime(new Date(act.createdAt)) : 'Baru-baru ini',
                unread: false,
                href: actHref,
                category: 'ACTIVITY',
                urgency: 'info' as const,
                actionText: 'Lihat Aktivitas',
              });
            });
          }

          finalNotifs = [...finalNotifs, ...fallbackNotifs];
        }

        // Urutkan unread terlebih dahulu
        finalNotifs.sort((a, b) => (b.unread === a.unread ? 0 : b.unread ? 1 : -1));

        setNotifications(finalNotifs.slice(0, 20));
        setUnreadCount(finalNotifs.filter(n => n.unread).length);
      } catch (error) {
        console.error('[Header] Failed to load notifications:', error);
        setNotifications([]);
        setUnreadCount(0);
      } finally {
        setIsLoadingNotifs(false);
      }
    };

    loadNotifications();

    // Auto-refresh: poll tiap 60 detik & saat window focus atau event pembaruan reminder
    const intervalId = setInterval(loadNotifications, 60_000);
    const onFocus = () => loadNotifications();
    const onRemindersUpdated = () => {
      setTimeout(loadNotifications, 0);
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('employr_reminders_updated', onRemindersUpdated);
    window.addEventListener('notification:refresh', onRemindersUpdated);

    // Also load avatar
    userApi.getProfile().then((profile: any) => {
      if (profile && profile.photoUrl) {
        setAvatarUrl(profile.photoUrl);
      }
    });

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('employr_reminders_updated', onRemindersUpdated);
      window.removeEventListener('notification:refresh', onRemindersUpdated);
    };
  }, []);

  const handleClearUnread = () => {
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    notificationsApi.markAllRead().catch(() => {});
    try {
      const allTrackerIds = notifications
        .filter(n => typeof n.id === 'string' && n.id.startsWith('tracker-'))
        .map(n => (n as any).rawId || (typeof n.id === 'string' ? n.id.replace('tracker-', '') : ''))
        .filter(Boolean);
      const existingRead = JSON.parse(localStorage.getItem('employr_read_tracker_notifications') || '[]');
      const mergedRead = Array.from(new Set([...existingRead, ...allTrackerIds]));
      localStorage.setItem('employr_read_tracker_notifications', JSON.stringify(mergedRead));
    } catch {}
  };

  const handleNotificationClick = (e: React.MouseEvent | null, n: any) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // 1. Update status dibaca seketika di state lokal
    if (n.unread) {
      setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, unread: false } : item));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    // 2. Tandai dibaca di storage / database di background
    if (typeof n.id === 'string' && n.id.startsWith('tracker-')) {
      const rawId = n.rawId || n.id.replace('tracker-', '');
      try {
        const existingRead = JSON.parse(localStorage.getItem('employr_read_tracker_notifications') || '[]');
        if (!existingRead.includes(rawId)) {
          existingRead.push(rawId);
          localStorage.setItem('employr_read_tracker_notifications', JSON.stringify(existingRead));
        }
      } catch {}
    } else if (typeof n.id === 'string' && !n.id.startsWith('tracker-') && !n.id.startsWith('schedule-') && !n.id.startsWith('activity-')) {
      notificationsApi.markRead(n.id).catch(() => {});
    }

    // 3. Tutup dropdown seketika agar UI langsung responsif
    setShowNotifications(false);

    // 4. Tentukan target URL secara akurat
    let targetHref = n.href;
    if (!targetHref) {
      if (n.category === 'TRACKER' || n.category === 'INTERVIEW') {
        const companyParam = n.company ? encodeURIComponent(n.company) : '';
        targetHref = `/tracker?search=${companyParam}`;
      } else if (n.category === 'CV' || n.category === 'DRAFT') {
        targetHref = '/cv';
      } else if (n.category === 'CAREER' || n.category === 'OPPORTUNITY') {
        targetHref = '/loker';
      } else {
        targetHref = '/beranda';
      }
    }

    // 5. Broadcast custom event agar halaman aktif langsung membuka detail
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('employr_open_tracker_reminder', { detail: n }));
      window.dispatchEvent(new CustomEvent('employr_open_notification', { detail: n }));

      const currentPath = window.location.pathname;
      const targetPath = targetHref.split('?')[0];

      if (currentPath === targetPath) {
        // Jika sudah di halaman tujuan, update search params & scroll halus
        router.replace(targetHref);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setTimeout(() => {
          router.push(targetHref);
        }, 50);
      }
    }
  };

  const handleDismissItem = (e: React.MouseEvent, n: any) => {
    e.preventDefault();
    e.stopPropagation();
    const rawId = n.rawId || (typeof n.id === 'string' ? n.id.replace('tracker-', '') : String(n.id));
    try {
      const dis = JSON.parse(localStorage.getItem('employr_dismissed_reminders') || '[]');
      if (!dis.includes(rawId)) {
        dis.push(rawId);
        localStorage.setItem('employr_dismissed_reminders', JSON.stringify(dis));
        window.dispatchEvent(new Event('employr_reminders_updated'));
      }
    } catch {}
    setNotifications((prev) => prev.filter((item) => item.id !== n.id));
    setUnreadCount((prev) => Math.max(0, prev - (n.unread ? 1 : 0)));
  };

  const handleDeleteNotification = (e: React.MouseEvent, n: any) => {
    e.preventDefault();
    e.stopPropagation();

    const rawId = n.rawId || (typeof n.id === 'string' ? n.id.replace('tracker-', '') : String(n.id));

    // 1. Hapus dari database jika notifikasi sistem / DB
    if (typeof n.id === 'string' && !n.id.startsWith('tracker-') && !n.id.startsWith('schedule-') && !n.id.startsWith('activity-')) {
      notificationsApi.delete(n.id).catch(() => {});
    }

    // 2. Simpan ke dismissed agar tidak muncul lagi
    if (typeof n.id === 'string' && n.id.startsWith('tracker-')) {
      try {
        const dis = JSON.parse(localStorage.getItem('employr_dismissed_reminders') || '[]');
        if (!dis.includes(rawId)) {
          dis.push(rawId);
          localStorage.setItem('employr_dismissed_reminders', JSON.stringify(dis));
          window.dispatchEvent(new Event('employr_reminders_updated'));
        }
      } catch {}
    } else {
      try {
        const dis = JSON.parse(localStorage.getItem('employr_dismissed_fallback_notifications') || '[]');
        if (!dis.includes(String(n.id))) {
          dis.push(String(n.id));
          localStorage.setItem('employr_dismissed_fallback_notifications', JSON.stringify(dis));
        }
      } catch {}
    }

    // 3. Update state lokal seketika
    setNotifications((prev) => prev.filter((item) => item.id !== n.id));
    if (n.unread) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const handleClearReadNotifications = async () => {
    setIsDeletingRead(true);
    try {
      // 1. Hapus notifikasi yang sudah dibaca dari database
      await notificationsApi.clearRead().catch(() => {});

      // 2. Untuk pengingat tracker yang sudah dibaca, tandai dismissed di localStorage
      const readTrackerIds = notifications
        .filter((n) => !n.unread && typeof n.id === 'string' && n.id.startsWith('tracker-'))
        .map((n) => (n as any).rawId || (typeof n.id === 'string' ? n.id.replace('tracker-', '') : ''))
        .filter(Boolean);

      if (readTrackerIds.length > 0) {
        try {
          const existingDis = JSON.parse(localStorage.getItem('employr_dismissed_reminders') || '[]');
          const mergedDis = Array.from(new Set([...existingDis, ...readTrackerIds]));
          localStorage.setItem('employr_dismissed_reminders', JSON.stringify(mergedDis));
          window.dispatchEvent(new Event('employr_reminders_updated'));
        } catch {}
      }

      // 3. Dismiss notifikasi fallback lainnya yang sudah dibaca
      const readOtherIds = notifications
        .filter((n) => !n.unread && typeof n.id === 'string' && (n.id.startsWith('schedule-') || n.id.startsWith('activity-')))
        .map((n) => String(n.id));

      if (readOtherIds.length > 0) {
        try {
          const existingDisOther = JSON.parse(localStorage.getItem('employr_dismissed_fallback_notifications') || '[]');
          const mergedDisOther = Array.from(new Set([...existingDisOther, ...readOtherIds]));
          localStorage.setItem('employr_dismissed_fallback_notifications', JSON.stringify(mergedDisOther));
        } catch {}
      }

      // 4. Update state: hanya sisakan yang belum dibaca (unread)
      setNotifications((prev) => prev.filter((n) => n.unread));
    } catch (err) {
      console.error('[Header] Failed to clear read notifications:', err);
    } finally {
      setIsDeletingRead(false);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (notifTab === 'reminders') return n.category === 'TRACKER';
    if (notifTab === 'system') return n.category !== 'TRACKER';
    return true;
  });

  const renderNotificationContent = () => (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Panel Header */}
      <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-8 rounded-[10px] bg-blue-50 dark:bg-blue-950/60 text-[#1738D1] dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-900/40 shrink-0 shadow-2xs">
            <BellRing className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                Notifikasi
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-[10px] text-caption font-bold bg-blue-50 text-[#1738D1] dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 shrink-0">
                  {unreadCount} baru
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleClearUnread}
              className="text-caption font-bold text-[#1738D1] dark:text-blue-400 hover:underline px-2 py-1 rounded-[6px] min-h-[32px] inline-flex items-center transition cursor-pointer"
            >
              Tandai dibaca
            </button>
          )}
          <button
            type="button"
            aria-label="Tutup notifikasi"
            onClick={() => setShowNotifications(false)}
            className="size-8 rounded-[8px] flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="p-3 pb-2 shrink-0">
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-[8px] text-xs">
          <button
            type="button"
            onClick={() => setNotifTab('all')}
            className={cn(
              'min-h-[34px] py-1 px-1.5 rounded-[6px] font-bold text-caption text-center inline-flex items-center justify-center transition cursor-pointer truncate',
              notifTab === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            )}
          >
            Semua ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setNotifTab('reminders')}
            className={cn(
              'min-h-[34px] py-1 px-1.5 rounded-[6px] font-bold text-caption text-center inline-flex items-center justify-center transition cursor-pointer truncate',
              notifTab === 'reminders'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            )}
          >
            Pengingat ({notifications.filter((n) => n.category === 'TRACKER').length})
          </button>
          <button
            type="button"
            onClick={() => setNotifTab('system')}
            className={cn(
              'min-h-[34px] py-1 px-1.5 rounded-[6px] font-bold text-caption text-center inline-flex items-center justify-center transition cursor-pointer truncate',
              notifTab === 'system'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            )}
          >
            Sistem ({notifications.filter((n) => n.category !== 'TRACKER').length})
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="flex-1 overflow-y-auto px-3.5 sm:px-4 py-1 space-y-2.5 custom-scrollbar min-h-0">
        {filteredNotifications.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="size-11 rounded-[10px] bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="size-5" />
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {notifTab === 'reminders' ? 'Tidak Ada Pengingat' : 'Semua Sudah Beres'}
            </p>
            <p className="text-caption text-slate-500 dark:text-slate-400 mt-1 max-w-[240px] mx-auto leading-relaxed">
              {notifTab === 'reminders'
                ? 'Belum ada jadwal atau follow-up lamaran yang butuh tindakan.'
                : 'Belum ada notifikasi baru saat ini.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((n) => {
            return (
              <div
                key={n.id}
                onClick={(e) => handleNotificationClick(e, n)}
                className={cn(
                  'relative group select-none cursor-pointer rounded-[10px] border transition-all p-3 sm:p-3.5 text-xs',
                  n.unread
                    ? 'bg-blue-50/30 dark:bg-blue-950/20 border-blue-200/80 dark:border-blue-900/50 hover:bg-blue-50/60 dark:hover:bg-blue-950/40 hover:border-blue-300 dark:hover:border-blue-800 shadow-2xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700'
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Category Icon */}
                  <div
                    className={cn(
                      'size-9 rounded-[10px] flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-105',
                      n.urgency === 'critical'
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-900/40'
                        : n.urgency === 'high'
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-900/40'
                        : n.category === 'TRACKER'
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-[#1738D1] dark:text-blue-400 border-blue-200/60 dark:border-blue-900/40'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-slate-700/60'
                    )}
                  >
                    {n.urgency === 'critical' ? (
                      <AlertTriangle className="size-4" />
                    ) : n.urgency === 'high' ? (
                      <Clock className="size-4" />
                    ) : n.category === 'TRACKER' ? (
                      <Briefcase className="size-4" />
                    ) : (
                      <Sparkles className="size-4" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Context Header */}
                    <div className="flex items-center justify-between gap-1.5 mb-1">
                      <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                        <span className="text-caption font-bold text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                          {n.company || (n.category === 'TRACKER' ? 'Tracker Lamaran' : 'Sistem Employr')}
                        </span>
                        {n.urgency === 'critical' && (
                          <span className="px-1.5 py-0.5 rounded-[6px] text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                            Mendesak
                          </span>
                        )}
                        {n.urgency === 'high' && (
                          <span className="px-1.5 py-0.5 rounded-[6px] text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            Penting
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-caption text-slate-400 dark:text-slate-500 font-medium">
                          {n.time}
                        </span>
                        {n.unread && (
                          <span className="size-2 rounded-full bg-[#1738D1] dark:bg-blue-400 shrink-0" title="Belum dibaca" />
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 group-hover:text-[#1738D1] dark:group-hover:text-blue-400 leading-snug transition-colors block w-full">
                      {n.title}
                    </div>

                    {/* Description */}
                    <p className="mt-1 text-caption text-slate-600 dark:text-slate-300 leading-relaxed">
                      {n.desc}
                    </p>

                    {/* Action Footer */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="inline-flex items-center gap-1 text-caption font-bold text-[#1738D1] dark:text-blue-400 group-hover:underline min-h-[30px] py-0.5">
                        <span>{n.actionText || 'Buka Halaman'}</span>
                        <ChevronRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                      </div>

                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        {n.category === 'TRACKER' && (
                          <button
                            type="button"
                            title="Tandai selesai & arsipkan"
                            aria-label="Tandai selesai"
                            onClick={(e) => handleDismissItem(e, n)}
                            className="min-h-[30px] px-2 py-1 rounded-[6px] text-caption font-medium text-slate-500 dark:text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 flex items-center gap-1 transition cursor-pointer"
                          >
                            <Check className="size-3.5" />
                            <span className="text-[11px]">Selesai</span>
                          </button>
                        )}
                        <button
                          type="button"
                          title="Hapus notifikasi"
                          aria-label="Hapus notifikasi"
                          onClick={(e) => handleDeleteNotification(e, n)}
                          className="min-h-[30px] size-7 rounded-[6px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 dark:hover:text-rose-400 flex items-center justify-center transition cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Panel Footer */}
      {notifications.some((n) => !n.unread) && (
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/30 flex items-center justify-between text-xs shrink-0">
          <span className="text-caption text-slate-500 font-medium dark:text-slate-400">
            {notifications.filter((n) => !n.unread).length} dibaca
          </span>
          <button
            type="button"
            onClick={handleClearReadNotifications}
            disabled={isDeletingRead}
            className="text-caption text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-bold hover:underline cursor-pointer flex items-center gap-1.5 disabled:opacity-50 transition min-h-[32px] px-2 py-1"
          >
            {isDeletingRead ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Trash2 className="size-3" />
            )}
            <span>Hapus yang sudah dibaca</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <header className={cn("sticky top-0 w-full glass-panel border-b border-white/30 dark:border-white/10 px-4 lg:px-5 py-2 sm:py-2.5 transition-all shadow-2xl", showNotifications ? "z-50" : "z-30")}>
      <div className="flex items-center justify-between gap-4">
        {/* Left Greeting & Status */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {onToggleSidebar && (
            <IconButton
              label={isSidebarCollapsed ? 'Perluas Sidebar' : 'Sembunyikan Sidebar'}
              variant="outline"
              size="sm"
              onClick={onToggleSidebar}
              className="size-9 rounded-full border-white/30 dark:border-white/10 bg-white/20 dark:bg-slate-900/40 text-slate-700 dark:text-slate-200 hover:bg-white/40 dark:hover:bg-slate-800/60 shrink-0 backdrop-blur-md hidden md:inline-flex"
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="size-4 text-orange-700 dark:text-orange-400" />
              ) : (
                <PanelLeftClose className="size-4" />
              )}
            </IconButton>
          )}

          {/* Brand Logo di mobile khusus saat di Beranda (Anti-Slop R-06 & HIG: hindari redundansi nama tab 'Beranda' dengan bottom nav) */}
          {isHome && (
            <Link
              href="/beranda"
              className="md:hidden flex items-center shrink-0 py-0.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#1738D1] rounded-[8px]"
              aria-label="Employr Beranda"
            >
              <Image
                src="/logo.webp"
                alt="Employr"
                width={120}
                height={28}
                unoptimized
                priority
                className="h-6.5 w-auto max-w-[110px] object-contain dark:brightness-0 dark:invert"
              />
            </Link>
          )}

          {!isRootTab && (
            <IconButton
              label="Kembali"
              title="Kembali ke halaman sebelumnya"
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="size-8.5 sm:size-8 rounded-[10px] border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 hover:text-orange-600 dark:hover:text-orange-400 shrink-0 shadow-2xs transition active:scale-95 relative touch-manipulation after:absolute after:-inset-2 after:content-['']"
            >
              <ArrowLeft className="size-4" />
            </IconButton>
          )}

          {/* Breadcrumb Navigasi Otomatis (disembunyikan di mobile saat di Beranda karena digantikan oleh Logo brand) */}
          <nav
            aria-label="Breadcrumb"
            className={cn(
              'items-center gap-1.5 text-xs min-w-0',
              isHome ? 'hidden md:flex' : 'flex'
            )}
          >
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              const isFirst = idx === 0;
              return (
                <React.Fragment key={idx}>
                  {idx > 0 && (
                    <ChevronRight
                      aria-hidden="true"
                      className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0 hidden sm:inline-block"
                    />
                  )}
                  {crumb.href && !isLast ? (
                    <Link
                      href={crumb.href}
                      className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition font-medium truncate max-w-[140px] md:max-w-[200px] lg:max-w-none hidden sm:inline-flex items-center min-h-[30px] py-1 px-0.5 rounded-[6px]"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      className="font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-[320px] lg:max-w-none inline-flex items-center min-h-[30px] py-1"
                      aria-current={isLast ? 'page' : undefined}
                    >
                      {crumb.label}
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        </div>

        {/* Right Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Career Readiness Status Pill (Desktop only - di mobile dipindahkan ke menu profil) */}
          <Link
            href="/readiness"
            aria-label={`Skor Kesiapan Karier: ${readinessScore}%`}
            title={`Kesiapan Karier: ${readinessScore}% (Klik untuk evaluasi & peningkatan)`}
            className={cn(
              'hidden md:flex items-center gap-2 py-1.5 px-2.5 sm:px-3 min-h-[28px] sm:min-h-[32px] rounded-[10px] transition-all cursor-pointer border backdrop-blur-md shadow-xs',
              pathname === '/readiness' || pathname.startsWith('/readiness/')
                ? 'bg-orange-50/90 dark:bg-orange-950/40 border-orange-300 dark:border-orange-800 text-orange-700 dark:text-orange-300 ring-2 ring-orange-500/20'
                : 'bg-white/30 dark:bg-slate-900/50 hover:bg-white/50 dark:hover:bg-slate-800/80 border-white/40 dark:border-white/10 text-slate-800 dark:text-slate-200'
            )}
          >
            <div className="w-5 h-5 rounded-[6px] bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-400 flex items-center justify-center border border-orange-200/60 dark:border-orange-900/40 shrink-0">
              <TrendingUp className="w-3 h-3" />
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-caption font-bold text-slate-500 dark:text-slate-400 hidden xl:inline">
                Kesiapan
              </span>
              <span className="text-xs font-black text-orange-700 dark:text-orange-400 font-mono">
                {readinessScore}%
              </span>
              <div className="w-8 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden hidden sm:block">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, readinessScore))}%` }}
                />
              </div>
            </div>
          </Link>

          {/* Dark / Light Mode Toggle Pill (Desktop only - di mobile dipindahkan ke menu profil) */}
          <button
            suppressHydrationWarning
            onClick={toggleDarkMode}
            aria-label="Toggle Mode Terang / Gelap"
            className="hidden md:flex items-center gap-2 py-1.5 px-3 min-h-[28px] sm:min-h-[32px] rounded-[10px] text-slate-800 dark:text-slate-200 bg-white/30 dark:bg-slate-900/50 hover:bg-white/50 dark:hover:bg-slate-800/80 border border-white/40 dark:border-white/10 transition-all shadow-xs backdrop-blur-md cursor-pointer"
            title={isDarkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
          >
            {isDarkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-extrabold hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-navy-700 dark:text-orange-400" />
                <span className="text-xs font-extrabold hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          {/* Notifications Button */}
          <div className="relative" ref={notifRef}>
            <NotificationBell
              count={unreadCount}
              size={36}
              color="red"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifikasi & Pengingat"
              aria-expanded={showNotifications}
              aria-haspopup="dialog"
              className={`transition cursor-pointer border ${
                showNotifications
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-navy-700 dark:border-white shadow-md ring-2 ring-cobalt-500/30'
                  : 'bg-white/30 dark:bg-slate-900/50 hover:bg-white/50 dark:hover:bg-slate-800/80 border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-300'
              }`}
            />

            {/* Notifications Dropdown (Desktop) & Slide-in Drawer (Mobile) */}
            {showNotifications && (
              <>
                {/* Mobile Slide-in Drawer (screen < sm) */}
                <div
                  className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end sm:hidden animate-in fade-in duration-200"
                  onClick={() => setShowNotifications(false)}
                  aria-hidden="true"
                >
                  <div
                    role="dialog"
                    aria-label="Panel Notifikasi & Pengingat"
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-[360px] h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-250"
                  >
                    {renderNotificationContent()}
                  </div>
                </div>

                {/* Desktop Popover Dropdown (screen >= sm) */}
                <div
                  role="dialog"
                  aria-label="Panel Notifikasi & Pengingat"
                  className="hidden sm:flex flex-col absolute right-0 top-full mt-2 w-[420px] max-h-[82vh] bg-white dark:bg-slate-900 rounded-[10px] shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150"
                >
                  {renderNotificationContent()}
                </div>
              </>
            )}
          </div>

          {/* Profile Badge & Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              suppressHydrationWarning
              onClick={() => {
                if (typeof window !== 'undefined' && window.innerWidth < 768) {
                  router.push('/profil');
                } else {
                  setShowProfileMenu(!showProfileMenu);
                }
              }}
              title="Lihat & Pengaturan Profil Saya"
              aria-label="Menu Profil Pengguna"
              aria-expanded={showProfileMenu}
              aria-haspopup="menu"
              className={`flex items-center gap-2.5 pl-1.5 py-1 pr-2.5 rounded-full transition group cursor-pointer text-left border ${
                showProfileMenu
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-navy-700 dark:border-white shadow-lg ring-2 ring-cobalt-500/50'
                  : 'bg-white/30 dark:bg-slate-900/50 hover:bg-white/50 dark:hover:bg-slate-800/80 border-white/40 dark:border-white/10'
              }`}
            >
              <div className="relative">
                <UserAvatar
                  name={currentUser.name}
                  photoUrl={avatarUrl}
                  size={32}
                  variant="beam"
                  className={`w-8 h-8 rounded-full transition ${
                    showProfileMenu
                      ? 'border-2 border-cobalt-500 ring-2 ring-cobalt-500/60 scale-105 shadow-md'
                      : 'border-2 border-orange-400 group-hover:scale-105'
                  }`}
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
              </div>
              <div className="hidden xl:block text-left">
                <p className={`text-xs font-black leading-tight flex items-center gap-1 transition ${
                  showProfileMenu ? 'text-white dark:text-slate-900 font-extrabold' : 'text-slate-900 dark:text-white group-hover:text-orange-500 dark:group-hover:text-orange-400'
                }`}>
                  <span>{currentUser.name}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showProfileMenu ? 'rotate-180 text-orange-400 dark:text-orange-600 font-bold' : 'text-slate-500'}`} />
                </p>
              </div>
            </button>

            {/* Profile Dropdown Menu (Desktop only - di mobile langsung navigasi ke /profil) */}
            {showProfileMenu && (
              <div className="hidden md:block absolute right-0 mt-3 w-64 glass-card bg-white/95 dark:bg-slate-900/95 rounded-[10px] shadow-2xl border border-white/30 dark:border-white/10 p-2.5 z-50 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {currentUser.name}
                      </p>
                      <span className="inline-block px-2 py-0.5 rounded-[10px] text-[10px] font-bold bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-400/30 shrink-0">
                        Pro Member
                      </span>
                    </div>
                    <p className="text-caption text-slate-500 dark:text-slate-400 truncate font-medium">
                      {currentUser.email}
                    </p>

                    {/* Career Readiness Status Card inside Profile Dropdown */}
                    <Link
                      href="/readiness"
                      onClick={() => setShowProfileMenu(false)}
                      className="mt-2.5 p-2 rounded-[8px] bg-slate-50 dark:bg-slate-800/70 hover:bg-orange-50/70 dark:hover:bg-orange-950/30 border border-slate-200/80 dark:border-slate-700/80 hover:border-orange-200 dark:hover:border-orange-800/50 transition flex flex-col gap-1.5 group/readiness cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-caption font-bold">
                        <span className="text-slate-600 dark:text-slate-300 group-hover/readiness:text-orange-700 dark:group-hover/readiness:text-orange-300 flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                          Career Readiness
                        </span>
                        <span className="font-mono text-orange-700 dark:text-orange-400 font-extrabold">
                          {readinessScore}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, readinessScore))}%` }}
                        />
                      </div>
                    </Link>
                  </div>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      if (onOpenProfile) onOpenProfile('profil');
                    }}
                    className="w-full px-3 py-2 rounded-[10px] text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <User className="w-4 h-4 text-orange-700 dark:text-orange-400" />
                    <span>Profil Saya</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      if (onOpenProfile) onOpenProfile('pengaturan');
                    }}
                    className="w-full px-3 py-2 rounded-[10px] text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-orange-700 dark:text-orange-400" />
                    <span>Pengaturan Akun</span>
                  </button>

                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                  {/* Dark / Light Mode Toggle inside Dropdown */}
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() => {
                      toggleDarkMode();
                    }}
                    className="w-full px-3 py-2 rounded-[10px] text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      {isDarkMode ? (
                        <Sun className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Moon className="w-4 h-4 text-navy-700 dark:text-orange-400" />
                      )}
                      <span>Mode Tampilan</span>
                    </div>
                    <span className="text-caption font-bold px-2 py-0.5 rounded-[6px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                      {isDarkMode ? 'Gelap' : 'Terang'}
                    </span>
                  </button>

                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      router.push('/lapor-bug');
                    }}
                    className="w-full px-3 py-2 rounded-[10px] text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <ShieldAlert className="w-4 h-4 text-cobalt-500 dark:text-blue-400" />
                    <span>Lapor Kendala</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      router.push('/saran-fitur');
                    }}
                    className="w-full px-3 py-2 rounded-[10px] text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <Lightbulb className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                    <span>Saran Fitur</span>
                  </button>

                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      if (onLogout) onLogout();
                    }}
                    className="w-full px-3 py-2 rounded-[10px] text-xs font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar / Logout</span>
                  </button>
                </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
