'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Compass,
  BookOpen,
  GraduationCap,
  Flame,
  X,
  Home,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAppUrl } from '@/lib/urls';

interface SidebarProps {
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
  badge?: string;
  isExternal?: boolean;
}

interface SidebarCategory {
  group: string;
  items: SidebarMenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const pathname = usePathname();

  const categories: SidebarCategory[] = [
    {
      group: 'Eksplorasi Belajar',
      items: [
        { id: 'katalog', label: 'Katalog Kursus', href: '/', icon: Compass },
        { id: 'saya', label: 'Kelas Saya', href: '/saya', icon: BookOpen, badge: '2 Aktif' },
        { id: 'sertifikat', label: 'Sertifikat Saya', href: '/saya?tab=selesai', icon: GraduationCap },
      ],
    },
    {
      group: 'Ekosistem Employr',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard Karier',
          href: getAppUrl('/beranda'),
          icon: Home,
          isExternal: true,
        },
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
          'md:sticky md:top-0 md:z-20 md:flex-shrink-0 md:h-full',
          isCollapsed ? 'md:w-20' : 'md:w-72',
          'fixed inset-y-0 left-0 w-72 shadow-2xl md:shadow-none',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Brand Logo Header (Sticky Top) */}
        <div
          className={cn(
            'relative px-4 pt-4 pb-3.5 flex items-center justify-center border-b border-slate-100 dark:border-slate-800 transition-all duration-300 ease-in-out shrink-0 min-h-[64px]',
            isCollapsed && !isMobileOpen ? 'px-2' : 'px-4'
          )}
        >
          <Link href="/" className="relative flex items-center justify-center group w-full h-8 overflow-hidden" aria-label="Beranda Employr Learning">
            {/* Full Expanded Logo */}
            <div
              className={cn(
                'transition-all duration-300 ease-in-out flex items-center justify-center gap-2',
                isCollapsed && !isMobileOpen
                  ? 'opacity-0 scale-90 pointer-events-none absolute'
                  : 'opacity-100 scale-100 relative'
              )}
            >
              <Image
                src="/logo.webp"
                alt="Employr"
                width={120}
                height={28}
                unoptimized
                className="h-7 w-auto object-contain dark:brightness-0 dark:invert"
              />
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-cobalt-500 text-white text-[9px] font-extrabold tracking-wider uppercase shadow-xs shrink-0">
                LEARNING
              </span>
            </div>

            {/* Minimized Icon Logo */}
            <div
              className={cn(
                'transition-all duration-300 ease-in-out flex items-center justify-center',
                isCollapsed && !isMobileOpen
                  ? 'opacity-100 scale-100 relative'
                  : 'opacity-0 scale-75 pointer-events-none absolute'
              )}
            >
              <Image
                src="/logo-minimize.webp"
                alt="Employr"
                width={32}
                height={32}
                unoptimized
                className="h-7 w-7 object-contain dark:brightness-0 dark:invert"
              />
            </div>
          </Link>

          {/* Mobile Close Button */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-[10px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Section (Scrollable Middle Area) */}
        <div
          className={cn(
            'flex-1 overflow-y-auto sidebar-scrollbar pr-1 pt-4 pb-5 transition-all duration-300 ease-in-out',
            isCollapsed && !isMobileOpen ? 'px-2' : 'px-3'
          )}
        >
          <nav className="space-y-4">
            {categories.map((group) => (
              <div key={group.group} className="space-y-1">
                {isExpanded && (
                  <div className="px-3 pt-3 pb-1 flex items-center gap-2 text-caption font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest shrink-0 select-none">
                    <span>{group.group}</span>
                  </div>
                )}

                {!isExpanded && (
                  <div className="w-full border-t border-slate-100 dark:border-slate-800 my-2 opacity-50" />
                )}

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      !item.isExternal &&
                      (pathname === item.href ||
                        (item.href !== '/' && pathname.startsWith(item.href)));

                    const content = (
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
                              'truncate transition-all duration-200 whitespace-nowrap',
                              !isExpanded
                                ? 'max-w-0 opacity-0 -translate-x-2 pointer-events-none'
                                : 'max-w-[170px] opacity-100 translate-x-0'
                            )}
                          >
                            {item.label}
                          </span>
                        </div>

                        {item.badge && isExpanded && (
                          <span
                            className={cn(
                              'px-2 py-0.5 text-[9px] font-bold rounded-full whitespace-nowrap',
                              isActive
                                ? 'bg-white/20 text-white backdrop-blur-xs'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            )}
                          >
                            {item.badge}
                          </span>
                        )}

                        {item.isExternal && isExpanded && (
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
                        )}
                      </>
                    );

                    const commonClass = cn(
                      'w-full flex items-center rounded-[10px] text-xs font-bold transition-all duration-200 group relative cursor-pointer',
                      !isExpanded
                        ? 'justify-center p-3'
                        : 'justify-between px-3.5 py-2.5',
                      isActive
                        ? 'bg-cobalt-500 text-white shadow-md shadow-cobalt-500/20'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                    );

                    if (item.isExternal) {
                      return (
                        <a
                          key={item.id}
                          href={item.href}
                          title={!isExpanded ? item.label : undefined}
                          className={commonClass}
                        >
                          {content}
                        </a>
                      );
                    }

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => {
                          if (onCloseMobile) onCloseMobile();
                        }}
                        title={!isExpanded ? item.label : undefined}
                        className={commonClass}
                      >
                        {content}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Study Target & Streak Bottom Card */}
        <div
          className={cn(
            'shrink-0 border-t border-slate-100 dark:border-slate-800 p-3 transition-all duration-300',
            isCollapsed && !isMobileOpen ? 'p-2' : 'p-3'
          )}
        >
          {isExpanded ? (
            <div className="p-3 rounded-[10px] bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
                  <span>5 Hari Beruntun</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-cobalt-500 dark:text-blue-400">
                  4.5 / 6 Jam
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cobalt-500 rounded-full" style={{ width: '75%' }} />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                <span>Target Belajar</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">75% Tercapai</span>
              </div>
            </div>
          ) : (
            <div
              className="w-full p-2.5 rounded-[10px] flex flex-col items-center justify-center gap-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              title="Target Belajar: 5 Hari Streak"
            >
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span className="text-[10px] font-mono font-bold text-orange-600 dark:text-orange-400 leading-none">
                5d
              </span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
