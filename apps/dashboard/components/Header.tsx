'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useModals } from '@/context/ModalContext';
import { userApi, activitiesApi, trackerApi, scheduleApi, notificationsApi } from '@/lib/api';
import { calculateApplicationReminders, getReminderTemplateText } from '@/lib/trackerReminders';
import {
  Sun,
  Moon,
  Bell,
  BellRing,
  ShieldCheck,
  User,
  CheckCircle2,
  Check,
  Copy,
  X,
  Sparkles,
  ExternalLink,
  LogOut,
  ChevronDown,
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserAvatar } from './UserAvatar';

import { handleLogout, getStoredSession } from '@/lib/auth';

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
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = mounted && resolvedTheme === 'dark';
  const toggleDarkMode = () => setTheme(isDarkMode ? 'light' : 'dark');
  const { openUpgrade, openWhatsNew } = useModals();
  const onOpenUpgradeModal = openUpgrade;
  const onOpenWhatsNewModal = openWhatsNew;
  const onOpenProfile = (tab?: string) => router.push('/pengaturan');
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
  const [copiedId, setCopiedId] = useState<string | null>(null);
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

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
            return {
              id: `tracker-${r.id}`,
              rawId: r.id,
              title: r.title,
              desc: `${r.company} (${r.position}) • ${r.message}`,
              time: r.dueLabel || (r.daysDiff !== undefined ? (r.daysDiff > 0 ? `H-${r.daysDiff}` : `H+${Math.abs(r.daysDiff)}`) : 'Pengingat'),
              unread: !isRead,
              href: '/tracker',
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
            .map((s) => ({
              id: `tracker-${s.rawId}`,
              rawId: s.rawId,
              title: s.title,
              desc: s.desc,
              time: s.time,
              unread: !readReminderIds.includes(s.rawId),
              href: '/tracker',
              category: 'TRACKER',
              urgency: s.urgency,
              company: s.company,
              position: s.position,
              templateType: s.templateType,
              actionText: s.actionText,
            }));
        }

        // DB notifications
        const formattedDbNotifs = (Array.isArray(dbNotifs) ? dbNotifs : []).map((n: any) => ({
          id: n.id,
          rawId: n.id,
          title: n.title,
          desc: n.message,
          time: n.timeLabel || 'Baru saja',
          unread: !n.isRead,
          href: n.actionUrl || null,
          category: n.category || 'SYSTEM',
          urgency: (n.priority === 'CRITICAL' ? 'critical' : n.priority === 'IMPORTANT' ? 'high' : 'info') as 'critical' | 'high' | 'medium' | 'info',
        }));

        const urgentTracker = trackerNotifItems.filter(r => r.urgency === 'critical' || r.urgency === 'high');
        const otherTracker = trackerNotifItems.filter(r => r.urgency !== 'critical' && r.urgency !== 'high');

        let finalNotifs: any[] = [...urgentTracker, ...formattedDbNotifs, ...otherTracker];

        // Jika DB kosong dan notifikasi sedikit, tambahkan info jadwal / aktivitas
        if (formattedDbNotifs.length === 0 && finalNotifs.length < 5) {
          const fallbackNotifs: any[] = [];
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
              const d = new Date(s.date || s.scheduledAt || s.startTime);
              const isToday = d.toDateString() === now.toDateString();
              const timeStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) +
                ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
              fallbackNotifs.push({
                id: `schedule-${idCounter++}`,
                title: 'Jadwal Interview Mendatang',
                desc: `Interview ${s.company || s.title || 'Perusahaan'} pada ${timeStr} WIB.`,
                time: isToday ? 'Hari ini' : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
                unread: true,
                href: '/tracker',
                category: 'INTERVIEW',
                urgency: 'high' as const,
              });
            });
          }

          if (Array.isArray(activities) && activities.length > 0) {
            activities.slice(0, Math.max(0, 4 - finalNotifs.length)).forEach((act: any) => {
              fallbackNotifs.push({
                id: `activity-${idCounter++}`,
                title: act.title || act.type || 'Aktivitas Terbaru',
                desc: act.description || act.message || 'Ada aktivitas baru di dashboard kamu.',
                time: act.createdAt ? getRelativeTime(new Date(act.createdAt)) : 'Baru-baru ini',
                unread: false,
                href: null,
                category: 'ACTIVITY',
                urgency: 'info' as const,
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
    const onRemindersUpdated = () => loadNotifications();
    window.addEventListener('focus', onFocus);
    window.addEventListener('employr_reminders_updated', onRemindersUpdated);

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

  const handleNotificationClick = (n: any) => {
    if (typeof n.id === 'string' && n.id.startsWith('tracker-')) {
      const rawId = n.rawId || n.id.replace('tracker-', '');
      try {
        const existingRead = JSON.parse(localStorage.getItem('employr_read_tracker_notifications') || '[]');
        if (!existingRead.includes(rawId)) {
          existingRead.push(rawId);
          localStorage.setItem('employr_read_tracker_notifications', JSON.stringify(existingRead));
        }
      } catch {}
      setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, unread: false } : item));
      setUnreadCount(prev => Math.max(0, prev - (n.unread ? 1 : 0)));
    } else if (typeof n.id === 'string' && !n.id.startsWith('tracker-') && !n.id.startsWith('schedule-') && !n.id.startsWith('activity-')) {
      notificationsApi.markRead(n.id).catch(() => {});
      setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, unread: false } : item));
      setUnreadCount(prev => Math.max(0, prev - (n.unread ? 1 : 0)));
    }

    if (n.href) {
      setShowNotifications(false);
      router.push(n.href);
    }
  };

  const handleCopyTemplate = (e: React.MouseEvent, n: any) => {
    e.stopPropagation();
    if (!n.templateType) return;
    const text = getReminderTemplateText(
      n.templateType,
      n.company || 'Perusahaan',
      n.position || 'Posisi'
    );
    navigator.clipboard.writeText(text);
    setCopiedId(String(n.id));
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDismissItem = (e: React.MouseEvent, n: any) => {
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

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-white/30 dark:border-white/10 px-4 lg:px-6 py-3 transition-all shadow-2xl">
      <div className="flex items-center justify-between gap-4">
        {/* Left Greeting & Status */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <Button
              variant="outline"
              size="icon"
              onClick={onToggleSidebar}
              className="h-9 w-9 rounded-full border-white/30 dark:border-white/10 bg-white/20 dark:bg-slate-900/40 text-slate-700 dark:text-slate-200 hover:bg-white/40 dark:hover:bg-slate-800/60 shrink-0 backdrop-blur-md"
              title={isSidebarCollapsed ? 'Perluas Sidebar' : 'Sembunyikan Sidebar'}
              aria-label="Toggle Sidebar"
            >
              <Menu className="w-4 h-4 md:hidden text-slate-800 dark:text-slate-200" />
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-orange-500 dark:text-orange-400 hidden md:block" />
              ) : (
                <PanelLeftClose className="w-4 h-4 hidden md:block" />
              )}
            </Button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                Hi, {currentUser.name.split(' ')[0] || 'User'}
              </h1>
            </div>
          </div>
        </div>

        {/* Right Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Dark / Light Mode Toggle Pill */}
          <button
            suppressHydrationWarning
            onClick={toggleDarkMode}
            aria-label="Toggle Mode Terang / Gelap"
            className="flex items-center gap-2 p-1.5 px-3 rounded-[10px] text-slate-800 dark:text-slate-200 bg-white/30 dark:bg-slate-900/50 hover:bg-white/50 dark:hover:bg-slate-800/80 border border-white/40 dark:border-white/10 transition-all shadow-xs backdrop-blur-md cursor-pointer"
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
            <button
              suppressHydrationWarning
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
              className={`relative p-2 rounded-full transition cursor-pointer border ${
                showNotifications
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-navy-700 dark:border-white shadow-md ring-2 ring-[#1738D1]/30'
                  : 'bg-white/30 dark:bg-slate-900/50 hover:bg-white/50 dark:hover:bg-slate-800/80 border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-[calc(100vw-2rem)] sm:w-96 max-w-sm glass-card bg-white/95 dark:bg-slate-900/95 rounded-[10px] shadow-2xl border border-white/30 dark:border-white/10 p-4 z-50 backdrop-blur-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/20 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-[6px] bg-[#1738D1]/15 text-[#1738D1] dark:text-blue-300 flex items-center justify-center">
                      <BellRing className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Notifikasi & Pengingat
                    </h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-black bg-[#1738D1]/20 text-orange-700 dark:text-orange-300 border border-[#1738D1]/30">
                        {unreadCount} Baru
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleClearUnread}
                        className="text-xs text-orange-600 dark:text-orange-400 font-bold hover:underline cursor-pointer"
                      >
                        Tandai dibaca
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-white/20 dark:bg-white/10 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Filter Tabs: Semua | Pengingat Lamaran | Info Sistem */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-[8px] mt-3 mb-2 text-xs">
                  <button
                    onClick={() => setNotifTab('all')}
                    className={`flex-1 py-1 px-1.5 rounded-[6px] font-bold text-[11px] text-center transition cursor-pointer ${
                      notifTab === 'all'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    Semua ({notifications.length})
                  </button>
                  <button
                    onClick={() => setNotifTab('reminders')}
                    className={`flex-1 py-1 px-1.5 rounded-[6px] font-bold text-[11px] text-center transition flex items-center justify-center gap-1 cursor-pointer ${
                      notifTab === 'reminders'
                        ? 'bg-[#1738D1] text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Briefcase className="w-3 h-3" />
                    Pengingat ({notifications.filter(n => n.category === 'TRACKER').length})
                  </button>
                  <button
                    onClick={() => setNotifTab('system')}
                    className={`flex-1 py-1 px-1.5 rounded-[6px] font-bold text-[11px] text-center transition cursor-pointer ${
                      notifTab === 'system'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    Sistem ({notifications.filter(n => n.category !== 'TRACKER').length})
                  </button>
                </div>

                {/* List of Notifications - Hidden scrollbar cross-browser */}
                <div className="mt-2 space-y-2.5 max-h-80 overflow-y-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {notifications
                    .filter((n) => {
                      if (notifTab === 'reminders') return n.category === 'TRACKER';
                      if (notifTab === 'system') return n.category !== 'TRACKER';
                      return true;
                    })
                    .length === 0 ? (
                    <div className="py-8 px-4 text-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        {notifTab === 'reminders' ? 'Tidak Ada Pengingat' : 'Semua Beres!'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {notifTab === 'reminders'
                          ? 'Belum ada pengingat lamaran yang butuh tindakan.'
                          : 'Belum ada notifikasi baru saat ini.'}
                      </p>
                    </div>
                  ) : (
                    notifications
                      .filter((n) => {
                        if (notifTab === 'reminders') return n.category === 'TRACKER';
                        if (notifTab === 'system') return n.category !== 'TRACKER';
                        return true;
                      })
                      .map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`p-3 rounded-[10px] border text-xs transition backdrop-blur-md ${
                            n.unread
                              ? n.urgency === 'critical'
                                ? 'bg-rose-500/10 border-rose-500/30 text-slate-900 dark:text-slate-100 shadow-xs'
                                : n.urgency === 'high'
                                ? 'bg-amber-500/10 border-amber-500/30 text-slate-900 dark:text-slate-100 shadow-xs'
                                : 'bg-[#1738D1]/10 border-[#1738D1]/30 text-slate-900 dark:text-slate-100 shadow-xs'
                              : 'bg-white/30 dark:bg-slate-800/40 border-white/20 dark:border-white/10 text-slate-700 dark:text-slate-300'
                          } ${n.href ? 'cursor-pointer hover:border-[#1738D1]/50 hover:bg-white/50 dark:hover:bg-slate-800/60' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                              {n.category === 'TRACKER' && (
                                <span className="px-1.5 py-0.5 rounded-[6px] text-[9px] font-bold bg-[#1738D1]/15 text-[#1738D1] dark:text-blue-300 border border-[#1738D1]/20 inline-flex items-center gap-1 shrink-0">
                                  <Briefcase className="w-2.5 h-2.5" />
                                  Tracker
                                </span>
                              )}
                              {n.urgency === 'critical' && (
                                <span className="px-1.5 py-0.5 rounded-[6px] text-[9px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 inline-flex items-center gap-1 shrink-0">
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  Mendesak
                                </span>
                              )}
                              {n.urgency === 'high' && (
                                <span className="px-1.5 py-0.5 rounded-[6px] text-[9px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 inline-flex items-center gap-1 shrink-0">
                                  <Clock className="w-2.5 h-2.5" />
                                  Penting
                                </span>
                              )}
                              <h4 className="font-extrabold text-slate-900 dark:text-slate-100 truncate">
                                {n.title}
                              </h4>
                            </div>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap font-medium shrink-0">
                              {n.time}
                            </span>
                          </div>

                          <p className="mt-1.5 text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                            {n.desc}
                          </p>

                          {/* Quick Actions for Tracker Reminders */}
                          {n.category === 'TRACKER' && (
                            <div className="mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                {n.templateType && (
                                  <button
                                    onClick={(e) => handleCopyTemplate(e, n)}
                                    className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition flex items-center gap-1 cursor-pointer shadow-2xs"
                                    title="Salin template draf pesan follow-up"
                                  >
                                    {copiedId === String(n.id) ? (
                                      <>
                                        <Check className="w-2.5 h-2.5 text-emerald-500" />
                                        <span className="text-emerald-600 dark:text-emerald-400">Tersalin!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-2.5 h-2.5 text-slate-500" />
                                        <span>Salin Draf</span>
                                      </>
                                    )}
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowNotifications(false);
                                    router.push('/tracker');
                                  }}
                                  className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-[#1738D1]/10 text-[#1738D1] dark:text-blue-300 hover:bg-[#1738D1]/20 border border-[#1738D1]/20 transition flex items-center gap-1 cursor-pointer shadow-2xs"
                                >
                                  <span>Buka Tracker</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </button>
                              </div>

                              <button
                                onClick={(e) => handleDismissItem(e, n)}
                                className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold transition cursor-pointer px-1 py-0.5"
                                title="Tandai selesai & hilangkan pengingat ini"
                              >
                                Selesai
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Badge & Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              suppressHydrationWarning
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              title="Lihat & Pengaturan Profil Saya"
              className={`flex items-center gap-2.5 pl-1.5 py-1 pr-2.5 rounded-full transition group cursor-pointer text-left border ${
                showProfileMenu
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-navy-700 dark:border-white shadow-lg ring-2 ring-[#1738D1]/50'
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
                      ? 'border-2 border-[#1738D1] ring-2 ring-[#1738D1]/60 scale-105 shadow-md'
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
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showProfileMenu ? 'rotate-180 text-orange-400 dark:text-orange-600 font-bold' : 'text-slate-400'}`} />
                </p>
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-60 glass-card bg-white/90 dark:bg-slate-900/90 rounded-[10px] shadow-2xl border border-white/30 dark:border-white/10 p-2.5 z-50 backdrop-blur-2xl">
                <div className="px-3.5 py-2.5 border-b border-white/20 dark:border-white/10 mb-1.5">
                  <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-medium">
                    {currentUser.email}
                  </p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-[10px] text-[9px] font-black uppercase bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-400/30">
                    Pro Member
                  </span>
                </div>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onOpenProfile) onOpenProfile('profil');
                  }}
                  className="w-full px-3 py-2 rounded-[10px] text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition"
                >
                  <User className="w-4 h-4 text-orange-500" />
                  <span>Profil Saya</span>
                </button>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onOpenProfile) onOpenProfile('pengaturan');
                  }}
                  className="w-full px-3 py-2 rounded-[10px] text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition"
                >
                  <Settings className="w-4 h-4 text-orange-500" />
                  <span>Pengaturan Akun</span>
                </button>

                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onLogout) onLogout();
                  }}
                  className="w-full px-3 py-2 rounded-[10px] text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-2.5 transition"
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
