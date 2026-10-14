'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Briefcase, User } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { trackerApi } from '@/lib/api';
import { CountBadge, useBellRing } from '@/components/ui/NotificationBell';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const [trackerCount, setTrackerCount] = useState<number>(0);
  const reduced = useReducedMotion() ?? false;
  const { swing: trackerSwing } = useBellRing(trackerCount, reduced);

  useEffect(() => {
    const fetchTrackerCount = () => {
      trackerApi
        .getAll()
        .then((apps) => {
          if (Array.isArray(apps)) {
            const activeCount = apps.filter((a: any) =>
              ['Terkirim', 'Screening', 'Interview'].includes(a.status)
            ).length;
            setTrackerCount(activeCount);
          }
        })
        .catch(() => {});
    };

    fetchTrackerCount();
    window.addEventListener('focus', fetchTrackerCount);
    window.addEventListener('employr_reminders_updated', fetchTrackerCount);
    return () => {
      window.removeEventListener('focus', fetchTrackerCount);
      window.removeEventListener('employr_reminders_updated', fetchTrackerCount);
    };
  }, []);

  const navItems = [
    {
      id: 'beranda',
      label: 'Beranda',
      href: '/beranda',
      icon: Home,
    },
    {
      id: 'cv',
      label: 'CV',
      href: '/cv',
      icon: FileText,
    },
    {
      id: 'tracker',
      label: 'Tracker',
      href: '/tracker',
      icon: Briefcase,
    },
    {
      id: 'profil',
      label: 'Profil',
      href: '/profil',
      icon: User,
    },
  ];

  return (
    <nav
      aria-label="Navigasi Bawah Seluler"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-1.5 shadow-lg safe-area-bottom"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.id === 'profil'
              ? pathname === '/profil' ||
                pathname?.startsWith('/profil/') ||
                pathname === '/pengaturan' ||
                pathname?.startsWith('/pengaturan/')
              : pathname === item.href || pathname?.startsWith(item.href + '/');
          const isTracker = item.id === 'tracker';
          const tourId =
            item.id === 'beranda'
              ? 'tour-beranda'
              : item.id === 'cv'
              ? 'tour-cv'
              : item.id === 'tracker'
              ? 'tour-tracker'
              : undefined;

          return (
            <Link
              key={item.id}
              href={item.href}
              data-tour={tourId}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-[10px] transition-all duration-200 relative group min-h-[44px]',
                isActive
                  ? 'text-orange-700 dark:text-orange-400 font-bold forced-colors:text-[Highlight]'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
              )}
            >
              <div className="relative">
                <motion.div
                  style={
                    isTracker
                      ? {
                          rotate: trackerSwing,
                          transformOrigin: '50% 15%',
                        }
                      : undefined
                  }
                >
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-transform duration-200 group-active:scale-90',
                      isActive ? 'stroke-[2.5px]' : 'stroke-2'
                    )}
                  />
                </motion.div>
                {isTracker && (
                  <CountBadge
                    total={trackerCount}
                    size={28}
                    color="red"
                    reduced={reduced}
                    style={{
                      top: -6,
                      right: -10,
                    }}
                  />
                )}
              </div>
              <span className="text-caption tracking-tight mt-0.5 truncate">
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-cobalt-500 mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

