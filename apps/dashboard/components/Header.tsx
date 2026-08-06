'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useModals } from '@/context/ModalContext';
import {
  Sun,
  Moon,
  Bell,
  ShieldCheck,
  User,
  CheckCircle2,
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  currentUser?: { name: string; email: string };
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser = { name: 'Andi Pratama', email: 'andi.pratama@email.com' },
  onToggleSidebar,
  isSidebarCollapsed = false,
}) => {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  const toggleDarkMode = () => setTheme(isDarkMode ? 'light' : 'dark');
  const { openUpgrade, openPromo } = useModals();
  const onOpenUpgradeModal = openUpgrade;
  const onOpenPromoModal = openPromo;
  const onOpenProfile = (tab?: string) => router.push('/pengaturan');
  const onLogout = () => router.push('/login');
  const onSwitchToAdminPortal = () => router.push('/admin');

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  const notifications = [
    {
      id: 1,
      title: 'Undangan Interview Baru',
      desc: 'PT Telkom Indonesia mengundang Anda untuk Interview Tahap 1 pada 24 Juli.',
      time: '10 menit lalu',
      unread: true,
    },
    {
      id: 2,
      title: 'CV Dilihat HR',
      desc: 'HR dari Tokopedia baru saja melihat profil dan CV ATS Anda.',
      time: '1 jam lalu',
      unread: true,
    },
    {
      id: 3,
      title: 'Misi Harian Selesai',
      desc: 'Anda mendapatkan +50 Poin dari misi Download CV Pertama.',
      time: '3 jam lalu',
      unread: true,
    },
    {
      id: 4,
      title: 'Tips Karir Mingguan',
      desc: 'Cek 5 kata kunci ATS paling dicari untuk posisi Admin Penjualan minggu ini.',
      time: '1 hari lalu',
      unread: false,
    },
  ];

  const handleClearUnread = () => {
    setUnreadCount(0);
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
                <PanelLeftOpen className="w-4 h-4 text-violet-600 dark:text-violet-400 hidden md:block" />
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
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 backdrop-blur-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Lifetime Pass
              </span>
            </div>
          </div>
        </div>

        {/* Right Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Promo Special Button (Soft Neo-Skeuomorphic Pill with Circular Capsule) */}
          {onOpenPromoModal && (
            <button
              onClick={onOpenPromoModal}
              className="group btn-neo-skeuo pl-3.5 pr-1.5 py-1.5 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
              title="Lihat Promo Diskon 70%"
            >
              <span className="hidden sm:inline">Diskon 70%</span>
              <span className="w-6 h-6 rounded-full bg-rose-500/90 text-white flex items-center justify-center shadow-inner group-hover:scale-105 transition">
                <Flame className="w-3.5 h-3.5 fill-white" />
              </span>
            </button>
          )}

          {/* Quick Upgrade CTA Button (Soft Neo-Skeuomorphic Pill with Circular Capsule) */}
          <button
            onClick={onOpenUpgradeModal}
            className="group hidden md:flex btn-neo-skeuo-accent pl-4 pr-1.5 py-1.5 text-xs font-extrabold items-center gap-2 transition cursor-pointer"
          >
            <span>Pass Premium</span>
            <span className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center border border-white/30 shadow-inner group-hover:scale-105 transition">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
          </button>

          {/* Dark / Light Mode Toggle Pill */}
          <button
            onClick={toggleDarkMode}
            aria-label="Toggle Mode Terang / Gelap"
            className="flex items-center gap-2 p-1.5 px-3 rounded-full text-slate-800 dark:text-slate-200 bg-white/30 dark:bg-slate-900/50 hover:bg-white/50 dark:hover:bg-slate-800/80 border border-white/40 dark:border-white/10 transition-all shadow-xs backdrop-blur-md cursor-pointer"
            title={isDarkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
          >
            {isDarkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-extrabold hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <span className="text-xs font-extrabold hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
              className={`relative p-2 rounded-full transition cursor-pointer border ${
                showNotifications
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-navy-700 dark:border-white shadow-md ring-2 ring-navy-500/30'
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
              <div className="absolute right-0 mt-3 w-[calc(100vw-2rem)] sm:w-96 max-w-sm glass-card bg-white/90 dark:bg-slate-900/90 rounded-[28px] shadow-2xl border border-white/30 dark:border-white/10 p-5 z-50 backdrop-blur-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/20 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Notifikasi
                    </h3>
                    {unreadCount > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-500/30">
                        {unreadCount} Baru
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleClearUnread}
                        className="text-xs text-violet-600 dark:text-violet-400 font-bold hover:underline"
                      >
                        Tandai dibaca
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-white/20 dark:bg-white/10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 space-y-2.5 max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 rounded-xl border text-xs transition backdrop-blur-md ${
                        n.unread
                          ? 'bg-violet-500/10 border-violet-500/30 text-slate-900 dark:text-slate-100'
                          : 'bg-white/30 dark:bg-slate-800/40 border-white/20 dark:border-white/10 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-extrabold text-slate-900 dark:text-slate-100">
                          {n.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap font-medium">
                          {n.time}
                        </span>
                      </div>
                      <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                        {n.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Badge & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              title="Lihat & Pengaturan Profil Saya"
              className={`flex items-center gap-2.5 pl-1.5 py-1 pr-2.5 rounded-full transition group cursor-pointer text-left border ${
                showProfileMenu
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-navy-700 dark:border-white shadow-lg ring-2 ring-orange-500/50'
                  : 'bg-white/30 dark:bg-slate-900/50 hover:bg-white/50 dark:hover:bg-slate-800/80 border-white/40 dark:border-white/10'
              }`}
            >
              <div className="relative">
                <Image
                  src="https://picsum.photos/seed/andi_avatar/100/100"
                  alt={currentUser.name}
                  width={36}
                  height={36}
                  referrerPolicy="no-referrer"
                  className={`w-8 h-8 rounded-full object-cover transition ${
                    showProfileMenu
                      ? 'border-2 border-orange-500 ring-2 ring-orange-500/60 scale-105 shadow-md'
                      : 'border-2 border-violet-500 group-hover:scale-105'
                  }`}
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
              </div>
              <div className="hidden xl:block text-left">
                <p className={`text-xs font-black leading-tight flex items-center gap-1 transition ${
                  showProfileMenu ? 'text-white dark:text-slate-900 font-extrabold' : 'text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400'
                }`}>
                  <span>{currentUser.name}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showProfileMenu ? 'rotate-180 text-orange-400 dark:text-orange-600 font-bold' : 'text-slate-400'}`} />
                </p>
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-60 glass-card bg-white/90 dark:bg-slate-900/90 rounded-[24px] shadow-2xl border border-white/30 dark:border-white/10 p-2.5 z-50 backdrop-blur-2xl">
                <div className="px-3.5 py-2.5 border-b border-white/20 dark:border-white/10 mb-1.5">
                  <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-medium">
                    {currentUser.email}
                  </p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-400/30">
                    Pro Member
                  </span>
                </div>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onOpenProfile) onOpenProfile('profil');
                  }}
                  className="w-full px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition"
                >
                  <User className="w-4 h-4 text-violet-500" />
                  <span>Profil Saya</span>
                </button>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onOpenProfile) onOpenProfile('pengaturan');
                  }}
                  className="w-full px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition"
                >
                  <Settings className="w-4 h-4 text-violet-500" />
                  <span>Pengaturan Akun</span>
                </button>

                {onSwitchToAdminPortal && (
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onSwitchToAdminPortal();
                    }}
                    className="w-full px-3 py-2 rounded-lg text-xs font-bold text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/50 flex items-center gap-2.5 transition"
                  >
                    <ShieldCheck className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    <span>Portal Super Admin</span>
                  </button>
                )}

                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onLogout) onLogout();
                  }}
                  className="w-full px-3 py-2 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-2.5 transition"
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
