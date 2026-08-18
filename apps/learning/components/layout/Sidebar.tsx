'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  BookOpen,
  GraduationCap,
  Bookmark,
  Sparkles,
  Flame,
  Clock,
  ChevronRight,
  X,
  Code2,
  BrainCircuit,
  Database,
  Briefcase,
  Layers,
  Palette,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const pathname = usePathname();

  const categories = [
    {
      group: 'Eksplorasi',
      items: [
        { id: 'katalog', label: 'Katalog Kursus', href: '/', icon: Compass },
        { id: 'saya', label: 'Kelas Saya', href: '/saya', icon: BookOpen, badge: '2 Aktif' },
        { id: 'sertifikat', label: 'Sertifikat Saya', href: '/saya?tab=selesai', icon: GraduationCap },
      ],
    },
    {
      group: 'Topik Pilihan',
      items: [
        { id: 'ai', label: 'Kecerdasan Buatan (AI)', href: '/?subject=Artificial+Intelligence', icon: BrainCircuit },
        { id: 'data', label: 'Data Science & SQL', href: '/?subject=Data+Science', icon: Database },
        { id: 'tech', label: 'Web & Software Eng', href: '/?subject=Computer+Science', icon: Code2 },
        { id: 'design', label: 'UI/UX & Desain Produk', href: '/?subject=UI%2FUX+Design', icon: Palette },
        { id: 'business', label: 'Bisnis & Fintech', href: '/?subject=Business+%26+Career', icon: Briefcase },
      ],
    },
  ];

  const isExpanded = !(isCollapsed && !isMobileOpen);

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden transition-opacity duration-300"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          'flex flex-col h-screen transition-all duration-300 ease-in-out z-50 overflow-hidden border-r border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-950',
          'md:sticky md:top-0 md:z-20 md:flex-shrink-0',
          isCollapsed ? 'md:w-20' : 'md:w-64',
          'fixed inset-y-0 left-0 w-72 shadow-2xl md:shadow-none',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div
          className={cn(
            'relative px-4 pt-4 pb-3.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 transition-all duration-300 shrink-0 min-h-[64px]',
            isCollapsed && !isMobileOpen ? 'px-2 justify-center' : 'px-4'
          )}
        >
          <Link href="/" className="flex items-center gap-2.5 group overflow-hidden">
            <div className="w-8 h-8 rounded-[10px] bg-[#1738D1] text-white flex items-center justify-center font-black shadow-md shadow-[#1738D1]/25 shrink-0 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-4 h-4" />
            </div>

            {isExpanded && (
              <div className="flex flex-col leading-tight overflow-hidden">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight flex items-center gap-1">
                  Employr <span className="text-[#1738D1]">Learning</span>
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  Coursera-Grade Academy
                </span>
              </div>
            )}
          </Link>

          {/* Close Mobile Button */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-[10px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <div
          className={cn(
            'flex-1 overflow-y-auto no-scrollbar pt-4 pb-5 transition-all duration-300',
            isCollapsed && !isMobileOpen ? 'px-2' : 'px-3'
          )}
        >
          <nav className="space-y-4">
            {categories.map((group) => (
              <div key={group.group} className="space-y-1">
                {isExpanded && (
                  <div className="px-3 pt-2 pb-1 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider select-none">
                    {group.group}
                  </div>
                )}

                {!isExpanded && (
                  <div className="w-full border-t border-slate-100 dark:border-slate-800 my-2 opacity-50" />
                )}

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      (item.href !== '/' && pathname.startsWith(item.href));

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => {
                          if (onCloseMobile) onCloseMobile();
                        }}
                        title={!isExpanded ? item.label : undefined}
                        className={cn(
                          'w-full flex items-center rounded-[10px] text-xs font-bold transition-all duration-200 group relative cursor-pointer',
                          !isExpanded
                            ? 'justify-center p-3'
                            : 'justify-between px-3.5 py-2.5',
                          isActive
                            ? 'bg-[#1738D1] text-white shadow-md shadow-[#1738D1]/20'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                        )}
                      >
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
                                : 'max-w-[160px] opacity-100 translate-x-0'
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
            <div className="p-3 rounded-[10px] bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
                  <span>5 Hari Beruntun</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-[#1738D1] dark:text-blue-400">
                  4.5 / 6 Jam
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-[#1738D1] rounded-full" style={{ width: '75%' }} />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                <span>Target Mingguan</span>
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
