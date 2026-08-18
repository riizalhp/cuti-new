'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  isSidebarCollapsed,
}) => {
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 px-4 md:px-6 backdrop-blur-md transition-colors">
      {/* Left: Mobile Toggle & Brand/Search */}
      <div className="flex items-center gap-3 md:gap-4 flex-1 max-w-xl">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-[10px] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <Link href="/" className="flex items-center gap-2 md:hidden">
          <div className="w-8 h-8 rounded-[10px] bg-[#1738D1] flex items-center justify-center text-white shadow-sm">
            <GraduationCap className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
            Employr <span className="text-[#1738D1] font-bold">Learning</span>
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
            className="w-full pl-10 pr-4 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1738D1] transition"
          />
        </div>
      </div>

      {/* Right Actions: Back to Dashboard, Dark/Light, Notifications, Profile */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Back to Career Dashboard Link */}
        <a
          href="http://localhost:3000/beranda"
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
          title="Kembali ke Dashboard Karier"
        >
          <span>Dashboard Karier</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-[10px] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
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
          className="relative p-2 rounded-[10px] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
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
            <div className="w-7 h-7 rounded-[8px] bg-[#1738D1] text-white flex items-center justify-center font-bold text-xs shadow-sm">
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
                <BookOpen className="w-3.5 h-3.5 text-[#1738D1]" />
                <span>Kelas Saya</span>
              </Link>
              <Link
                href="/saya"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition font-medium"
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                <span>Sertifikat Resmi</span>
              </Link>
              <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
              <a
                href="http://localhost:3000/beranda"
                className="flex items-center justify-between px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition font-medium"
              >
                <span>Ke Portal Karier</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
