'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import {
  Search,
  Sun,
  Moon,
  Bell,
  BookOpen,
  GraduationCap,
  Sparkles,
  ExternalLink,
  ChevronDown,
  User,
  CheckCircle2,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAppUrl } from '@/lib/urls';

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  isSidebarCollapsed = false,
}) => {
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 px-3 sm:px-4 lg:px-5 backdrop-blur-md transition-colors shrink-0">
      {/* Left: Desktop & Mobile Sidebar Toggle + Search */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-1 max-w-xl">
        {onToggleSidebar && (
          <>
            {/* Desktop Toggle */}
            <button
              onClick={onToggleSidebar}
              className="hidden md:flex items-center justify-center p-2 rounded-[10px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Toggle Sidebar"
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-5 h-5" />
              ) : (
                <PanelLeftClose className="w-5 h-5" />
              )}
            </button>

            {/* Mobile Toggle */}
            <button
              onClick={onToggleSidebar}
              className="md:hidden flex items-center justify-center p-2 rounded-[10px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Toggle Mobile Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Mobile Logo Fallback */}
        <Link href="/" className="flex items-center gap-1.5 md:hidden py-1" aria-label="Beranda Employr Learning">
          <Image
            src="/logo.webp"
            alt="Employr"
            width={90}
            height={22}
            unoptimized
            className="h-6 w-auto object-contain dark:brightness-0 dark:invert"
          />
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-cobalt-500 text-white text-[9px] font-extrabold tracking-wider uppercase shadow-xs shrink-0">
            LEARNING
          </span>
        </Link>

        {/* Global Search Bar */}
        <div className="relative w-full hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kursus, topik AI, spesialisasi, atau universitas mitra..."
            className="w-full pl-9.5 pr-4 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cobalt-500 transition"
          />
        </div>
      </div>

      {/* Right Actions: Back to Dashboard, Dark/Light, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Back to Career Dashboard Link */}
        <a
          href={getAppUrl('/beranda')}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
          title="Kembali ke Dashboard Karier"
        >
          <span>Dashboard Karier</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-[10px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          aria-label="Toggle Theme"
          title={theme === 'dark' ? 'Ganti ke Light Mode' : 'Ganti ke Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700 transition-transform duration-200 hover:-rotate-12" />
          )}
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-[10px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          aria-label="Notifikasi"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-white dark:ring-slate-950" />
        </button>

        {/* User Profile Pill */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 rounded-[10px] hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <div className="w-7 h-7 rounded-[8px] bg-cobalt-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              AK
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                Ahmad Kasyaf
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold leading-none flex items-center gap-0.5">
                <CheckCircle2 className="w-2.5 h-2.5" /> Pelajar Aktif
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white">Ahmad Kasyaf</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">ahmad.kasyaf@employr.id</p>
              </div>
              <Link
                href="/saya"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition font-medium"
              >
                <BookOpen className="w-3.5 h-3.5 text-cobalt-500" />
                <span>Kelas Saya</span>
              </Link>
              <Link
                href="/saya?tab=selesai"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition font-medium"
              >
                <GraduationCap className="w-3.5 h-3.5 text-cobalt-500" />
                <span>Sertifikat Saya</span>
              </Link>
              <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
              <a
                href={getAppUrl('/beranda')}
                className="flex items-center justify-between px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition font-medium"
              >
                <span>Dashboard Karier</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
