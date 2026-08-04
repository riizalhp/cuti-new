'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  FileText,
  FileCheck,
  Bot,
  Mail,
  Briefcase,
  Mic,
  Target,
  Users,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Zap,
  Settings,
  Linkedin,
  GraduationCap,
  PanelLeftClose,
  PanelLeftOpen,
  Palette,
  X,
  Send,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  onOpenUpgradeModal: () => void;
  onSwitchToAdminPortal?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenUpgradeModal,
  onSwitchToAdminPortal,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const menuItems = [
    { id: 'beranda', label: 'Beranda', icon: Home, badge: null },
    { id: 'cv', label: 'CV Saya', icon: FileText, badge: null },
    { id: 'cv-screener', label: 'AI CV Screener', icon: Bot, badge: 'HRD' },
    { id: 'match-cv', label: 'Match CV & Job', icon: FileCheck, badge: 'AI' },
    { id: 'surat-lamaran', label: 'Surat Lamaran', icon: Mail, badge: null },
    { id: 'auto-apply', label: 'Auto Apply', icon: Send, badge: 'Beta' },
    { id: 'tracker', label: 'Tracker Lamaran', icon: Briefcase, badge: '4' },
    { id: 'interview', label: 'Panduan Interview', icon: Mic, badge: null },
    { id: 'latihan-soal', label: 'Latihan Soal', icon: GraduationCap, badge: 'HOT' },
    { id: 'linkedin', label: 'Analisis LinkedIn', icon: Linkedin, badge: 'AI' },
    { id: 'misi-cuan', label: 'Misi & Cuan', icon: Target, badge: 'Baru' },
    { id: 'referral', label: 'Referral', icon: Users, badge: null },
    { id: 'readiness', label: 'Career Readiness', icon: TrendingUp, badge: '78%' },
    { id: 'design-system', label: 'Panduan Desain', icon: Palette, badge: 'Aturan' },
    { id: 'pengaturan', label: 'Pengaturan Akun', icon: Settings, badge: null },
  ];

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          'glass-panel flex flex-col justify-between h-[calc(100vh-1.5rem)] transition-all duration-300 ease-in-out z-50 overflow-y-auto no-scrollbar rounded-[28px] my-3 ml-3 md:ml-4 border border-white/30 dark:border-white/10 shadow-2xl',
          // Desktop behavior
          'md:sticky md:top-3 md:z-20 md:flex-shrink-0',
          isCollapsed ? 'md:w-20' : 'md:w-64',
          // Mobile behavior: slide-over drawer
          'fixed inset-y-0 left-0 w-72 shadow-2xl md:shadow-none',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div>
          {/* Brand Logo & Collapse Toggle Header */}
          <div
            className={cn(
              'p-4 flex items-center border-b border-slate-100 dark:border-slate-800 transition-all duration-300',
              isCollapsed ? 'justify-center md:flex-col gap-2' : 'justify-between gap-3'
            )}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-violet-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-violet-500/20 shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <div className="min-w-0">
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-violet-600 to-violet-500 dark:from-violet-400 dark:to-violet-300 bg-clip-text text-transparent truncate block">
                    CUTI
                  </span>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-bold truncate">
                    Career Portal AI
                  </span>
                </div>
              )}
            </div>

            {/* Mobile Close Button */}
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                aria-label="Tutup Menu"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Desktop Toggle Collapse Button */}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="hidden md:block p-1.5 rounded-lg text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition cursor-pointer"
                title={isCollapsed ? 'Perluas Sidebar' : 'Sembunyikan Sidebar'}
                aria-label={isCollapsed ? 'Perluas Sidebar' : 'Sembunyikan Sidebar'}
              >
                {isCollapsed ? (
                  <PanelLeftOpen className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                ) : (
                  <PanelLeftClose className="w-5 h-5" />
                )}
              </button>
            )}
          </div>

          {/* Navigation Section */}
          <div className={cn('py-4', isCollapsed ? 'px-2 md:px-2' : 'px-3')}>
            {!isCollapsed || isMobileOpen ? (
              <p className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Menu Utama
              </p>
            ) : (
              <div className="w-full border-t border-slate-100 dark:border-slate-800 mb-3" />
            )}

            <nav className="space-y-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const href = item.id === 'beranda' ? '/beranda' : `/${item.id}`;
                const isActive = pathname === href || pathname.startsWith(href + '/');
                return (
                  <Link
                    key={item.id}
                    href={href}
                    onClick={() => {
                      if (onCloseMobile) onCloseMobile();
                    }}
                    title={isCollapsed ? item.label : undefined}
                    className={cn(
                      'w-full flex items-center rounded-full text-xs font-bold transition-all duration-200 group relative cursor-pointer',
                      isCollapsed && !isMobileOpen
                        ? 'justify-center p-3'
                        : 'justify-between px-4 py-2.5',
                      isActive
                        ? 'btn-neo-skeuo-accent text-white shadow-lg'
                        : 'text-slate-800 dark:text-slate-200 hover:bg-white/40 dark:hover:bg-white/10'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          'w-4 h-4 shrink-0 transition-transform group-hover:scale-110',
                          isActive ? 'text-white' : 'text-slate-600 dark:text-slate-400'
                        )}
                      />
                      {(!isCollapsed || isMobileOpen) && <span className="truncate">{item.label}</span>}
                    </div>

                    {item.badge && (
                      <span
                        className={cn(
                          'font-extrabold rounded-full transition-all',
                          isCollapsed && !isMobileOpen
                            ? 'absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 border-2 border-white dark:border-slate-900 p-0 text-[0px]'
                            : 'px-2 py-0.5 text-[10px]',
                          (!isCollapsed || isMobileOpen) && item.badge === 'Baru'
                            ? 'bg-amber-400 text-amber-950 dark:bg-amber-400 dark:text-amber-950 animate-pulse'
                            : (!isCollapsed || isMobileOpen) && isActive
                            ? 'bg-white/20 text-white backdrop-blur-md'
                            : (!isCollapsed || isMobileOpen)
                            ? 'bg-white/30 text-slate-700 dark:bg-white/10 dark:text-slate-300'
                            : ''
                        )}
                      >
                        {(!isCollapsed || isMobileOpen) && item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Section: Premium Pass */}
        <div className={cn('border-t border-white/20 dark:border-white/10 space-y-3', isCollapsed && !isMobileOpen ? 'p-2' : 'p-3.5')}>
          {/* Premium Pass Card */}
          {!isCollapsed || isMobileOpen ? (
            <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-slate-900/80 via-slate-950/90 to-violet-950/80 backdrop-blur-xl p-4 text-white shadow-xl border border-white/20">
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-20 h-20 bg-amber-400/20 rounded-full blur-xl pointer-events-none"></div>
              <div className="flex items-center gap-2 text-amber-300 mb-1.5">
                <Sparkles className="w-4 h-4" />
                <span className="text-[11px] font-black uppercase tracking-wider">
                  Premium Pass
                </span>
              </div>
              <h4 className="text-xs font-bold text-white mb-1">
                Akses Fitur Pro &amp; Auto ATS
              </h4>
              <p className="text-[11px] text-slate-300 leading-snug mb-3">
                Tingkatkan peluang interview hingga 3x lipat.
              </p>
              <button
                onClick={() => {
                  onOpenUpgradeModal();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="w-full group btn-neo-skeuo-light flex items-center justify-between py-2 px-3 text-xs font-black transition cursor-pointer"
              >
                <span>Upgrade Sekarang</span>
                <span className="w-6 h-6 rounded-full bg-slate-950 text-white flex items-center justify-center shadow-inner group-hover:scale-105 transition">
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                onOpenUpgradeModal();
                if (onCloseMobile) onCloseMobile();
              }}
              title="Upgrade Premium Pass"
              className="w-full p-2.5 btn-neo-skeuo flex items-center justify-center shadow-lg cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

