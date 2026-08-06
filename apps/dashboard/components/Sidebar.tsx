'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  FileText,
  Eye,
  Bot,
  Mail,
  Briefcase,
  Mic,
  Target,
  Users,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Settings,
  Linkedin,
  X,
  Send,
  Layers,
  Compass,
  Flame,
  BookOpen,
  Scale,
  Gift,
  User,
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

interface SidebarMenuItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | null;
  isReadiness?: boolean;
}

interface SidebarCategory {
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  items: SidebarMenuItem[];
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

  const categories: SidebarCategory[] = [
    {
      category: 'Dashboard',
      icon: Home,
      items: [
        { id: 'beranda', label: 'Beranda', href: '/beranda', icon: Home },
      ],
    },
    {
      category: 'Profil Karier',
      icon: User,
      items: [
        { id: 'cv', label: 'CV Saya', href: '/cv', icon: FileText },
        { id: 'cv-screener', label: 'CV Screener', href: '/cv-screener', icon: Eye },
        { id: 'linkedin', label: 'Analisis LinkedIn', href: '/linkedin', icon: Linkedin },
      ],
    },
    {
      category: 'Lowongan',
      icon: Briefcase,
      items: [
        { id: 'cari-lowongan', label: 'Cari Lowongan', href: 'https://loker.ambilcuti.id', icon: Compass },
        { id: 'match-cv', label: 'Match CV & Job', href: '/match-cv', icon: Sparkles },
        { id: 'auto-apply', label: 'Auto Apply', href: '/auto-apply', icon: Send, badge: 'Beta' },
      ],
    },
    {
      category: 'Lamaran',
      icon: FileText,
      items: [
        { id: 'surat-lamaran', label: 'Surat Lamaran', href: '/surat-lamaran', icon: Mail },
        { id: 'tracker', label: 'Tracker Lamaran', href: '/tracker', icon: Briefcase, badge: '4' },
      ],
    },
    {
      category: 'Persiapan Kerja',
      icon: Target,
      items: [
        { id: 'interview', label: 'Panduan Interview', href: '/interview', icon: Mic },
        { id: 'latihan-soal', label: 'Latihan Interview', href: '/latihan-soal', icon: Flame },
        { id: 'readiness', label: 'Career Readiness', href: '/readiness', icon: TrendingUp, isReadiness: true },
      ],
    },
    {
      category: 'Rewards',
      icon: Gift,
      items: [
        { id: 'misi-cuan', label: 'Misi & Cuan', href: '/misi-cuan', icon: Target, badge: 'Baru' },
        { id: 'referral', label: 'Referral', href: '/referral', icon: Users },
      ],
    },
    {
      category: 'Belajar',
      icon: BookOpen,
      items: [
        { id: 'panduan', label: 'Panduan', href: '/design-system', icon: BookOpen },
        { id: 'aturan', label: 'Aturan', href: '/design-system', icon: Scale },
      ],
    },
    {
      category: 'Pengaturan',
      icon: Settings,
      items: [
        { id: 'pengaturan', label: 'Pengaturan', href: '/pengaturan', icon: Settings },
      ],
    },
  ];

  const isExpanded = !(isCollapsed && !isMobileOpen);

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden transition-opacity duration-300"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          'flex flex-col h-screen transition-all duration-300 ease-in-out z-50 overflow-hidden border-r border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-950',
          // Desktop behavior
          'md:sticky md:top-0 md:z-20 md:flex-shrink-0',
          isCollapsed ? 'md:w-20' : 'md:w-64',
          // Mobile behavior: slide-over drawer
          'fixed inset-y-0 left-0 w-72 shadow-2xl md:shadow-none',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Brand Logo Header (Sticky Top) */}
        <div
          className={cn(
            'p-4 flex items-center border-b border-slate-100 dark:border-slate-800 transition-all duration-300 ease-in-out shrink-0 h-16',
            isCollapsed && !isMobileOpen ? 'justify-center' : 'justify-between gap-3'
          )}
        >
          <Link href="/beranda" className="flex items-center gap-3 overflow-hidden group">
            {isCollapsed && !isMobileOpen ? (
              <span
                className="font-black text-2xl tracking-widest text-[#0D3BD9] dark:text-slate-100 uppercase select-none"
                style={{ fontFamily: "'Bodoni Moda', Georgia, serif" }}
              >
                C
              </span>
            ) : (
              <div
                className={cn(
                  'min-w-0 transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap',
                  isCollapsed && !isMobileOpen
                    ? 'max-w-0 opacity-0 transform -translate-x-2 pointer-events-none'
                    : 'max-w-[180px] opacity-100 transform translate-x-0'
                )}
              >
                <span
                  className="font-black text-2xl tracking-wider text-[#0D3BD9] dark:text-slate-100 truncate block uppercase leading-none"
                  style={{ fontFamily: "'Bodoni Moda', Georgia, serif" }}
                >
                  CUTI
                </span>
                <span className="block text-[9px] text-slate-400 uppercase tracking-widest font-bold truncate mt-1">
                  Career Portal AI
                </span>
              </div>
            )}
          </Link>

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
        </div>

        {/* Navigation Section (Scrollable Middle Area) */}
        <div className={cn('flex-1 overflow-y-auto no-scrollbar py-4 transition-all duration-300 ease-in-out', isCollapsed && !isMobileOpen ? 'px-2' : 'px-3')}>
          <nav className="space-y-4">
            {categories.map((categoryGroup) => {
              const isSingleItemCategory =
                categoryGroup.category === 'Dashboard' || categoryGroup.category === 'Pengaturan';

              return (
                <div key={categoryGroup.category} className="space-y-1">
                  {/* Category Header */}
                  {!isSingleItemCategory && isExpanded && (
                    <div className="px-3 pt-3 pb-1 flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest shrink-0 select-none">
                      {React.createElement(categoryGroup.icon, { className: 'w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0' })}
                      <span>{categoryGroup.category}</span>
                    </div>
                  )}

                  {/* Category Divider when Collapsed */}
                  {!isSingleItemCategory && !isExpanded && (
                    <div className="w-full border-t border-slate-100 dark:border-slate-800 my-2 opacity-50" />
                  )}

                  <div className="space-y-1">
                    {categoryGroup.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                      const titleAttr = !isExpanded
                        ? (item.isReadiness ? `${item.label} (78%)` : item.label)
                        : undefined;

                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          onClick={() => {
                            if (onCloseMobile) onCloseMobile();
                          }}
                          title={titleAttr}
                          className={cn(
                            'w-full flex items-center rounded-xl text-xs font-bold transition-all duration-200 group relative cursor-pointer',
                            !isExpanded
                              ? 'justify-center p-3'
                              : 'justify-between px-3.5 py-2.5',
                            isActive
                              ? 'btn-neo-skeuo-accent text-white shadow-md'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-slate-900/50'
                          )}
                        >
                          {item.isReadiness && isExpanded ? (
                            /* Career Readiness Progress Bar (Expanded) */
                            <div className="flex flex-col w-full gap-1.5 py-0.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  <Icon
                                    className={cn(
                                      'w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-105',
                                      isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                                    )}
                                  />
                                  <span className="truncate">{item.label}</span>
                                </div>
                                <span className={cn(
                                  'text-[10px] font-black',
                                  isActive ? 'text-white' : 'text-violet-600 dark:text-violet-400'
                                )}>
                                  78%
                                </span>
                              </div>
                              <div className={cn(
                                'w-full h-1.5 rounded-full overflow-hidden',
                                isActive ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-800'
                              )}>
                                <div
                                  className={cn(
                                    'h-full rounded-full transition-all duration-500',
                                    isActive ? 'bg-white' : 'bg-gradient-to-r from-violet-500 to-indigo-500'
                                  )}
                                  style={{ width: '78%' }}
                                />
                              </div>
                            </div>
                          ) : (
                            /* Standard Menu Item */
                            <>
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                <Icon
                                  className={cn(
                                    'w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-105',
                                    isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                                  )}
                                />
                                <span
                                  className={cn(
                                    'truncate transition-all duration-200 ease-in-out whitespace-nowrap',
                                    !isExpanded
                                      ? 'max-w-0 opacity-0 transform -translate-x-2 pointer-events-none'
                                      : 'max-w-[160px] opacity-100 transform translate-x-0'
                                  )}
                                >
                                  {item.label}
                                </span>
                              </div>

                              {item.badge && (
                                <span
                                  className={cn(
                                    'font-bold rounded-full transition-all duration-200 ease-in-out whitespace-nowrap',
                                    !isExpanded
                                      ? 'absolute -top-1 -right-1 w-2 h-2 bg-orange-500 border border-white dark:border-slate-900 p-0 text-[0px]'
                                      : 'px-2 py-0.5 text-[9px]',
                                    isExpanded && item.badge === 'Baru'
                                      ? 'bg-orange-500 text-white font-extrabold shadow-sm'
                                      : isExpanded && isActive
                                      ? 'bg-white/20 text-white backdrop-blur-md'
                                      : isExpanded
                                      ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                      : ''
                                  )}
                                >
                                  {isExpanded && item.badge}
                                </span>
                              )}
                            </>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Premium Pass (Sticky Bottom) */}
        <div className={cn('shrink-0 border-t border-white/20 dark:border-white/10 transition-all duration-300 ease-in-out overflow-hidden', isCollapsed && !isMobileOpen ? 'p-2' : 'p-3.5')}>
          {/* Expanded Premium Pass Card */}
          <div
            className={cn(
              'relative overflow-hidden rounded-[24px] bg-gradient-to-br from-slate-900/80 via-slate-950/90 to-violet-950/80 backdrop-blur-xl text-white shadow-xl border border-white/20 transition-all duration-300 ease-in-out',
              isCollapsed && !isMobileOpen
                ? 'max-h-0 opacity-0 p-0 border-0 pointer-events-none transform scale-95'
                : 'max-h-60 opacity-100 p-4 transform scale-100'
            )}
          >
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-20 h-20 bg-amber-400/20 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex items-center gap-2 text-amber-300 mb-1.5">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span className="text-[11px] font-black uppercase tracking-wider truncate">
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
              className="w-full group bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-between py-2 px-3.5 rounded-xl text-xs font-bold transition shadow-md shadow-orange-500/20 cursor-pointer border-0"
            >
              <span>Upgrade Sekarang</span>
              <span className="w-6 h-6 rounded-full bg-white/20 text-white flex items-center justify-center shadow-inner group-hover:translate-x-0.5 transition-transform duration-200">
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </button>
          </div>

          {/* Collapsed Premium Pass Icon Button */}
          <button
            onClick={() => {
              onOpenUpgradeModal();
              if (onCloseMobile) onCloseMobile();
            }}
            title="Upgrade Premium Pass"
            className={cn(
              'w-full p-2.5 btn-neo-skeuo flex items-center justify-center shadow-lg cursor-pointer transition-all duration-300 ease-in-out',
              isCollapsed && !isMobileOpen
                ? 'max-h-12 opacity-100 scale-100'
                : 'max-h-0 opacity-0 scale-75 p-0 overflow-hidden pointer-events-none border-0'
            )}
          >
            <Sparkles className="w-5 h-5 text-amber-300" />
          </button>
        </div>
      </aside>
    </>
  );
};


