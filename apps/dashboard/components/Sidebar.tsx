'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { cvApi, trackerApi } from '@/lib/api';

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
  const [readinessScore, setReadinessScore] = React.useState(0);
  const [trackerCount, setTrackerCount] = React.useState(0);

  React.useEffect(() => {
    cvApi.getAll().then((cvs) => {
      if (Array.isArray(cvs) && cvs.length > 0) {
        const primary = cvs.find((c: any) => c.isPrimary) || cvs[0];
        const hasContact = Boolean(primary.fullName && primary.email && primary.phone);
        const hasSummary = Boolean(primary.summary && primary.summary.trim().length >= 20);
        const hasEdu =
          Array.isArray(primary.education) &&
          primary.education.length > 0 &&
          Boolean(primary.education[0]?.institution || primary.education[0]?.degree);
        const hasExperience =
          (primary.experience?.length || 0) > 0 ||
          (primary.projects?.length || 0) > 0 ||
          (primary.internships?.length || 0) > 0;
        const hasSkills = Array.isArray(primary.skills) && primary.skills.length >= 4;
        const atsScore = primary.atsScore ?? 0;
        const isAtsOptimal = atsScore >= 80;

        let completed = 0;
        if (hasContact && hasSummary) completed++;
        if (hasEdu) completed++;
        if (hasExperience) completed++;
        if (hasSkills) completed++;
        if (isAtsOptimal) completed++;

        const dynamicScore = Math.round((completed / 5) * 60 + (atsScore / 100) * 40);
        setReadinessScore(dynamicScore);
      }
    });

    trackerApi.getAll().then((apps) => {
      if (Array.isArray(apps)) {
        const activeCount = apps.filter((a: any) =>
          ['Terkirim', 'Screening', 'Interview'].includes(a.status)
        ).length;
        setTrackerCount(activeCount);
      }
    });
  }, []);

  const categories: SidebarCategory[] = [
    {
      category: 'Beranda',
      icon: Home,
      items: [
        { id: 'beranda', label: 'Beranda', href: '/beranda', icon: Home },
      ],
    },
    {
      category: 'Profil & Dokumen',
      icon: User,
      items: [
        { id: 'cv', label: 'CV Saya', href: '/cv', icon: FileText },
        { id: 'cv-screener', label: 'Evaluasi CV', href: '/cv-screener', icon: Eye },
        { id: 'linkedin', label: 'Optimasi LinkedIn', href: '/linkedin', icon: Linkedin },
      ],
    },
    {
      category: 'Lamaran',
      icon: Briefcase,
      items: [
        { id: 'tracker', label: 'Tracker Lamaran', href: '/tracker', icon: Briefcase, badge: trackerCount > 0 ? String(trackerCount) : null },
        { id: 'scrape-jobs', label: 'Scraper Lowongan', href: '/scrape-jobs', icon: Globe, badge: 'Baru' },
        { id: 'cari-lowongan', label: 'Cari Lowongan', href: 'https://loker.employr.id', icon: Compass },
        { id: 'match-cv', label: 'Kecocokan Lowongan', href: '/match-cv', icon: Sparkles },
        { id: 'surat-lamaran', label: 'Surat Lamaran', href: '/surat-lamaran', icon: Mail },
      ],
    },
    {
      category: 'Pengembangan',
      icon: Target,
      items: [
        { id: 'interview', label: 'Panduan Interview', href: '/interview', icon: Mic },
        { id: 'kursus', label: 'Kursus & Sertifikasi', href: 'http://localhost:3004', icon: BookOpen, badge: 'Baru' },
      ],
    },
    {
      category: 'Lainnya',
      icon: Gift,
      items: [
        { id: 'misi-cuan', label: 'Misi & Cuan', href: '/misi-cuan', icon: Target, badge: 'Baru' },
        { id: 'referral', label: 'Referral', href: '/referral', icon: Users },
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
            'relative px-4 pt-4 pb-3.5 flex items-center justify-center border-b border-slate-100 dark:border-slate-800 transition-all duration-300 ease-in-out shrink-0 min-h-[64px]',
            isCollapsed && !isMobileOpen ? 'px-2' : 'px-4'
          )}
        >
          <Link href="/beranda" className="relative flex items-center justify-center group w-full h-8 overflow-hidden">
            {/* Full Expanded Logo */}
            <div
              className={cn(
                'transition-all duration-300 ease-in-out flex items-center justify-center',
                isCollapsed && !isMobileOpen
                  ? 'opacity-0 scale-90 pointer-events-none absolute'
                  : 'opacity-100 scale-100 relative'
              )}
            >
              <Image
                src="/logo.webp"
                alt="Employr"
                width={140}
                height={32}
                unoptimized
                className="h-7 w-auto max-w-[120px] object-contain dark:brightness-0 dark:invert"
              />
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
              className="md:hidden absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-[10px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Section (Scrollable Middle Area) */}
        <div className={cn('flex-1 overflow-y-auto no-scrollbar pt-4 pb-5 transition-all duration-300 ease-in-out', isCollapsed && !isMobileOpen ? 'px-2' : 'px-3')}>
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
                      const titleAttr = !isExpanded ? item.label : undefined;

                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          onClick={() => {
                            if (onCloseMobile) onCloseMobile();
                          }}
                          title={titleAttr}
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
                                  ? 'absolute -top-1 -right-1 w-2 h-2 bg-[#1738D1] border border-white dark:border-slate-900 p-0 text-[0px]'
                                  : 'px-2 py-0.5 text-[9px]',
                                isExpanded && item.badge === 'Baru'
                                  ? 'bg-[#1738D1] text-white font-extrabold shadow-sm'
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
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Career Readiness (Sticky Bottom) */}
        <div className={cn('shrink-0 border-t border-slate-100 dark:border-slate-800 transition-all duration-300 ease-in-out overflow-hidden', isCollapsed && !isMobileOpen ? 'p-2' : 'p-3')}>
          {/* Expanded Career Readiness Card */}
          <div
            className={cn(
              'transition-all duration-300 ease-in-out',
              isCollapsed && !isMobileOpen
                ? 'max-h-0 opacity-0 p-0 border-0 pointer-events-none transform scale-95'
                : 'max-h-60 opacity-100 transform scale-100'
            )}
          >
            <Link
              href="/readiness"
              onClick={() => {
                if (onCloseMobile) onCloseMobile();
              }}
              className={cn(
                'group block p-3.5 rounded-[10px] border transition-all duration-200 cursor-pointer',
                pathname === '/readiness' || pathname.startsWith('/readiness/')
                  ? 'bg-orange-50/80 dark:bg-orange-950/30 border-orange-300 dark:border-orange-900/50 shadow-sm'
                  : 'bg-slate-50/90 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800 hover:border-orange-300 dark:hover:border-orange-700/60 hover:bg-white dark:hover:bg-slate-900 shadow-xs'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-[8px] bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-200/60 dark:border-orange-900/40 shrink-0">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    Career Readiness
                  </span>
                </div>
                <span className="text-[11px] font-black text-orange-600 dark:text-orange-400 bg-orange-100/80 dark:bg-orange-950/60 px-2 py-0.5 rounded-[6px] border border-orange-200/50 dark:border-orange-900/30 font-mono">
                  {readinessScore}%
                </span>
              </div>

              {/* Horizontal Progress Bar */}
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-[#1738D1] rounded-full transition-all duration-500"
                  style={{ width: `${readinessScore}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                <span>Tingkatkan Kesiapan</span>
                <ChevronRight className="w-3.5 h-3.5 text-orange-500 group-hover:translate-x-0.5 transition-transform duration-200" />
              </div>
            </Link>
          </div>

          {/* Collapsed Career Readiness Icon Button */}
          <Link
            href="/readiness"
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
            }}
            title={`Career Readiness (${readinessScore}%)`}
            className={cn(
              'w-full p-2.5 rounded-[10px] flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-300 ease-in-out border',
              pathname === '/readiness' || pathname.startsWith('/readiness/')
                ? 'bg-[#1738D1] text-white border-orange-600 shadow-md shadow-[#1738D1]/20'
                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
              isCollapsed && !isMobileOpen
                ? 'max-h-16 opacity-100 scale-100'
                : 'max-h-0 opacity-0 scale-75 p-0 overflow-hidden pointer-events-none border-0'
            )}
          >
            <TrendingUp className="w-4 h-4 text-orange-500 dark:text-orange-400" />
            <span className="text-[10px] font-black text-orange-600 dark:text-orange-400 leading-none font-mono">
              {readinessScore}%
            </span>
          </Link>
        </div>
      </aside>
    </>
  );
};


