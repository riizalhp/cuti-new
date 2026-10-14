'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileCheck,
  Linkedin,
  Mail,
  Compass,
  Globe,
  Settings,
  ShieldAlert,
  Lightbulb,
} from 'lucide-react';

interface QuickActionIconItem {
  id: string;
  title: string;
  href: string;
  isExternal?: boolean;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const QuickActionsGrid: React.FC = () => {
  const actions: QuickActionIconItem[] = [
    {
      id: 'cv-screener',
      title: 'ATS',
      href: '/cv-screener',
      icon: FileCheck,
    },
    {
      id: 'career-intelligence',
      title: 'Karier',
      href: '/career-intelligence',
      icon: Compass,
    },
    {
      id: 'linkedin',
      title: 'LinkedIn',
      href: '/linkedin',
      icon: Linkedin,
    },
    {
      id: 'mailer',
      title: 'Mailer',
      href: '/mailer',
      icon: Mail,
    },
    {
      id: 'loker',
      title: 'Loker',
      href: '/loker',
      icon: Globe,
    },
    {
      id: 'saran-fitur',
      title: 'Saran',
      href: '/saran-fitur',
      icon: Lightbulb,
    },
    {
      id: 'lapor-bug',
      title: 'Lapor',
      href: '/lapor-bug',
      icon: ShieldAlert,
    },
    {
      id: 'pengaturan',
      title: 'Pengaturan',
      href: '/pengaturan',
      icon: Settings,
    },
  ];

  return (
    <section
      aria-label="Layanan Karier"
      className="w-full p-3.5 sm:p-4 rounded-[12px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
    >
      <div className="flex items-center justify-between mb-3 px-0.5">
        <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Layanan &amp; Alat Karier
        </h2>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
          Pintasan cepat persiapan kerja
        </span>
      </div>

      {/* Grid 4 kolom di mobile (2 baris x 4 icon), 8 kolom di desktop */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3">
        {actions.map((item) => {
          const Icon = item.icon;
          const content = (
            <div className="flex flex-col items-center justify-start group cursor-pointer text-center p-1 rounded-[10px] hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
              <div className="relative">
                <div
                  className="size-11 sm:size-12 rounded-[12px] flex items-center justify-center transition-all duration-200 group-hover:scale-105 group-active:scale-95 shadow-2xs bg-slate-100/90 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 group-hover:bg-blue-50/70 dark:group-hover:bg-blue-950/40 group-hover:border-[#1738D1]/30 dark:group-hover:border-blue-500/30 text-slate-700 dark:text-slate-200 group-hover:text-[#1738D1] dark:group-hover:text-blue-400"
                >
                  <Icon className="size-5 sm:size-5.5" />
                </div>
                {item.badge && (
                  <span className="absolute -top-1 -right-1 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-[#1738D1] text-white shadow-2xs leading-none uppercase tracking-tight">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#1738D1] dark:group-hover:text-blue-400 mt-1.5 tracking-tight text-center leading-tight truncate w-full">
                {item.title}
              </span>
            </div>
          );

          const tourId = item.id === 'loker' ? 'tour-loker' : undefined;

          return item.isExternal ? (
            <a
              key={item.id}
              href={item.href}
              data-tour={tourId}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1738D1] rounded-[10px]"
            >
              {content}
            </a>
          ) : (
            <Link
              key={item.id}
              href={item.href}
              data-tour={tourId}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1738D1] rounded-[10px]"
            >
              {content}
            </Link>
          );
        })}
      </div>
    </section>
  );
};

