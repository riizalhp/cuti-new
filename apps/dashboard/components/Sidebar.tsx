'use client';

import React from 'react';
import { createPortal } from 'react-dom';
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
  Target,
  Users,
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
  ShieldAlert,
  Lightbulb,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { trackerApi } from '@/lib/api';
import { getLearningUrl } from '@/lib/urls';
import { handleLogout } from '@/lib/auth';

interface SidebarProps {
  onOpenUpgradeModal: () => void;
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
  isPro?: boolean;
  isAi?: boolean;
  badge?: string | null;
}

interface SidebarCategory {
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  items: SidebarMenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenUpgradeModal,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const [trackerCount, setTrackerCount] = React.useState(0);

  React.useEffect(() => {
    trackerApi.getAll().then((apps) => {
      if (Array.isArray(apps)) {
        const activeCount = apps.filter((a: any) =>
          ['Terkirim', 'Screening', 'Interview'].includes(a.status)
        ).length;
        setTrackerCount(activeCount);
      }
    }).catch(() => {});
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
      category: 'Dokumen Karier',
      icon: FileText,
      items: [
        { id: 'cv', label: 'CV Saya', href: '/cv', icon: FileText },
        { id: 'cv-screener', label: 'Screening & Evaluasi ATS', href: '/cv-screener', icon: Eye },
        { id: 'linkedin', label: 'Optimasi LinkedIn', href: '/linkedin', icon: Linkedin },
        { id: 'career-intelligence', label: 'Career Intelligence', href: '/career-intelligence', icon: Compass, badge: 'PRO' },
      ],
    },
    {
      category: 'Lamaran',
      icon: Briefcase,
      items: [
        { id: 'tracker', label: 'Tracker Lamaran', href: '/tracker', icon: Briefcase, badge: trackerCount > 0 ? String(trackerCount) : null },
        { id: 'loker', label: 'Eksplorasi Loker', href: '/loker', icon: Globe },
        { id: 'match-cv', label: 'Komparasi Lowongan', href: '/match-cv', icon: Scale },
        { id: 'email-cover-letter', label: 'Email & Cover Letter', href: '/mailer', icon: Mail },
      ],
    },
    // Di-hide sementara sesuai permintaan:
    // {
    //   category: 'Pengembangan',
    //   icon: Target,
    //   items: [
    //     { id: 'interview', label: 'Panduan Interview', href: '/interview', icon: Settings },
    //     { id: 'kursus', label: 'Kursus & Sertifikasi', href: getLearningUrl(), icon: BookOpen },
    //   ],
    // },
    {
      category: 'Lainnya',
      icon: Settings,
      items: [
        // Di-hide sementara sesuai permintaan:
        // { id: 'misi-cuan', label: 'Misi & Cuan', href: '/misi-cuan', icon: Target },
        // { id: 'referral', label: 'Referral', href: '/referral', icon: Users },
        { id: 'pengaturan', label: 'Pengaturan Akun', href: '/pengaturan', icon: Settings },
        { id: 'saran-fitur', label: 'Saran Fitur', href: '/saran-fitur', icon: Lightbulb },
        { id: 'lapor-bug', label: 'Lapor Kendala', href: '/lapor-bug', icon: ShieldAlert },
      ],
    },
  ];

  const isExpanded = !(isCollapsed && !isMobileOpen);

  const [mounted, setMounted] = React.useState(false);
  const [hoveredItem, setHoveredItem] = React.useState<{
    id: string;
    label: string;
    badge?: string | null;
    rect: DOMRect;
  } | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (isExpanded) {
      setHoveredItem(null);
    }
  }, [isExpanded]);

  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setHoveredItem(null);
      }
    };
    const handleGlobalResize = () => {
      setHoveredItem(null);
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('resize', handleGlobalResize);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('resize', handleGlobalResize);
    };
  }, []);

  const handleItemHover = (
    e: React.MouseEvent<HTMLElement> | React.FocusEvent<HTMLElement>,
    id: string,
    label: string,
    badge?: string | null
  ) => {
    if (!isExpanded) {
      const rect = e.currentTarget.getBoundingClientRect();
      setHoveredItem({ id, label, badge, rect });
    }
  };

  const handleItemLeave = (id: string) => {
    setHoveredItem((prev) => (prev?.id === id ? null : prev));
  };

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
          'md:sticky md:top-0 md:z-20 md:flex-shrink-0 md:h-full',
          isCollapsed ? 'md:w-20' : 'md:w-72',
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
        <div
          onScroll={() => setHoveredItem(null)}
          className={cn('flex-1 overflow-y-auto sidebar-scrollbar pr-1 pt-4 pb-5 transition-all duration-300 ease-in-out', isCollapsed && !isMobileOpen ? 'px-2' : 'px-3')}
        >
          <nav className="space-y-4">
            {categories.map((categoryGroup) => {
              const isSingleItemCategory =
                categoryGroup.category === 'Dashboard' || categoryGroup.category === 'Pengaturan';

              return (
                <div key={categoryGroup.category} className="space-y-1">
                  {/* Category Header */}
                  {!isSingleItemCategory && isExpanded && (
                    <div className="px-3 pt-3 pb-1 flex items-center gap-2 text-caption font-bold text-slate-500 dark:text-slate-500 shrink-0 select-none">
                      {React.createElement(categoryGroup.icon, { className: 'w-3.5 h-3.5 text-slate-500 dark:text-slate-500 shrink-0' })}
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
                      const isActive =
                        pathname === item.href ||
                        pathname.startsWith(item.href + '/') ||
                        (item.id === 'email-cover-letter' && (pathname === '/surat-lamaran' || pathname.startsWith('/surat-lamaran/')));

                      const isExternal = item.href.startsWith('http://') || item.href.startsWith('https://');
                      const linkClasses = cn(
                        'w-full flex items-center rounded-[10px] text-xs font-bold transition-all duration-200 group relative cursor-pointer forced-colors:border',
                        !isExpanded
                          ? 'justify-center p-3'
                          : 'justify-between px-3.5 py-2.5',
                        isActive
                          ? 'bg-cobalt-500 text-white shadow-md shadow-cobalt-500/20 forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                      );

                      const linkContent = (
                        <>
                          <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
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
                                  : 'max-w-[200px] opacity-100 transform translate-x-0'
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
                                  ? 'absolute -top-1 -right-1 w-2 h-2 bg-cobalt-500 border border-white dark:border-slate-900 p-0 text-[0px]'
                                  : 'px-2 py-0.5 text-caption',
                                isExpanded && item.badge === 'Baru'
                                  ? 'bg-cobalt-500 text-white font-extrabold shadow-sm'
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
                      );

                      const tourId =
                        item.id === 'beranda'
                          ? 'tour-beranda'
                          : item.id === 'cv'
                          ? 'tour-cv'
                          : item.id === 'tracker'
                          ? 'tour-tracker'
                          : item.id === 'loker'
                          ? 'tour-loker'
                          : undefined;

                      if (isExternal) {
                        return (
                          <a
                            key={item.id}
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-tour={tourId}
                            aria-label={item.label}
                            onMouseEnter={(e) => handleItemHover(e, item.id, item.label, item.badge)}
                            onMouseLeave={() => handleItemLeave(item.id)}
                            onFocus={(e) => handleItemHover(e, item.id, item.label, item.badge)}
                            onBlur={() => handleItemLeave(item.id)}
                            onClick={() => {
                              setHoveredItem(null);
                              if (onCloseMobile) onCloseMobile();
                            }}
                            className={linkClasses}
                          >
                            {linkContent}
                          </a>
                        );
                      }

                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          data-tour={tourId}
                          aria-current={isActive ? 'page' : undefined}
                          aria-label={item.label}
                          onMouseEnter={(e) => handleItemHover(e, item.id, item.label, item.badge)}
                          onMouseLeave={() => handleItemLeave(item.id)}
                          onFocus={(e) => handleItemHover(e, item.id, item.label, item.badge)}
                          onBlur={() => handleItemLeave(item.id)}
                          onClick={() => {
                            setHoveredItem(null);
                            if (onCloseMobile) onCloseMobile();
                          }}
                          className={linkClasses}
                        >
                          {linkContent}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Keluar Akun (Sticky Bottom) */}
        <div className={cn('shrink-0 border-t border-slate-100 dark:border-slate-800 transition-all duration-300 ease-in-out overflow-hidden', isCollapsed && !isMobileOpen ? 'p-2' : 'p-3')}>
          {/* Logout Action Button */}
          <button
            type="button"
            aria-label="Keluar Akun"
            onMouseEnter={(e) => handleItemHover(e, 'logout', 'Keluar Akun')}
            onMouseLeave={() => handleItemLeave('logout')}
            onFocus={(e) => handleItemHover(e, 'logout', 'Keluar Akun')}
            onBlur={() => handleItemLeave('logout')}
            onClick={() => {
              setHoveredItem(null);
              if (onCloseMobile) onCloseMobile();
              handleLogout();
            }}
            className={cn(
              'w-full flex items-center rounded-[10px] text-xs font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all duration-200 group cursor-pointer border border-transparent hover:border-rose-200 dark:hover:border-rose-900/40',
              !isExpanded ? 'justify-center p-2.5' : 'justify-start px-3 py-2 gap-2'
            )}
          >
            <LogOut className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
            {isExpanded && (
              <span className="truncate">Keluar Akun</span>
            )}
          </button>
        </div>
      </aside>

      {/* Floating Tooltip Label saat Collapsed (Desktop Only) */}
      {mounted && !isExpanded && hoveredItem && createPortal(
        <div
          role="tooltip"
          className="fixed pointer-events-none z-[9999] hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold shadow-xl border border-slate-700/60 animate-in fade-in-0 zoom-in-95 duration-150 select-none"
          style={{
            left: `${Math.round(hoveredItem.rect.right + 10)}px`,
            top: `${Math.round(hoveredItem.rect.top + (hoveredItem.rect.height / 2))}px`,
            transform: 'translateY(-50%)',
          }}
        >
          <span>{hoveredItem.label}</span>
          {hoveredItem.badge && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cobalt-500 text-white leading-none">
              {hoveredItem.badge}
            </span>
          )}
        </div>,
        document.body
      )}
    </>
  );
};


