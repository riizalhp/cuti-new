'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, BookOpen, GraduationCap, Sparkles, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    {
      id: 'katalog',
      label: 'Katalog',
      href: '/',
      icon: Compass,
    },
    {
      id: 'saya',
      label: 'Kelas Saya',
      href: '/saya',
      icon: BookOpen,
      badge: '2',
    },
    {
      id: 'sertifikat',
      label: 'Sertifikat',
      href: '/saya?tab=selesai',
      icon: GraduationCap,
    },
    {
      id: 'dashboard',
      label: 'Karier',
      href: 'http://localhost:3000/beranda',
      icon: User,
    },
  ];

  return (
    <nav
      aria-label="Navigasi Bawah Seluler"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 shadow-lg safe-area-bottom"
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-[10px] transition-all duration-200 relative group',
                isActive
                  ? 'text-[#1738D1] dark:text-blue-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    'w-5 h-5 transition-transform duration-200 group-active:scale-90',
                    isActive ? 'stroke-[2.5px]' : 'stroke-2'
                  )}
                />
                {item.badge && (
                  <span
                    className={cn(
                      'absolute -top-1.5 -right-2.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold leading-tight',
                      isActive
                        ? 'bg-[#1738D1] text-white'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 truncate">
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#1738D1] mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
