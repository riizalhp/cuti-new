'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { trackerApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  BriefcaseIcon,
  EyeIcon,
  UsersIcon,
  ClockIcon,
  AlertCircleIcon,
  TrendingUpIcon,
  ChevronDownIcon,
  CheckIcon,
} from '@/components/icons/CustomIcons';

type PeriodFilter = '7d' | '30d' | '90d' | 'all';

const PERIOD_OPTIONS: { value: PeriodFilter; label: string }[] = [
  { value: '7d', label: '7 Hari Terakhir' },
  { value: '30d', label: '30 Hari Terakhir' },
  { value: '90d', label: '3 Bulan Terakhir' },
  { value: 'all', label: 'Semua Waktu' },
];

interface ApplicationSummaryCardProps {
  onViewTracker?: () => void;
}

export const ApplicationSummaryCard: React.FC<ApplicationSummaryCardProps> = ({ onViewTracker }) => {
  const router = useRouter();
  const [allApps, setAllApps] = useState<any[]>([]);
  const [period, setPeriod] = useState<PeriodFilter>('30d');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    trackerApi
      .getAll()
      .then((apps) => {
        if (Array.isArray(apps)) {
          setAllApps(apps);
        }
      })
      .catch(() => {});
  }, []);

  const statsData = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    let cutoff: Date | null = null;
    if (period === '7d') {
      cutoff = new Date();
      cutoff.setDate(now.getDate() - 7);
    } else if (period === '30d') {
      cutoff = new Date();
      cutoff.setDate(now.getDate() - 30);
    } else if (period === '90d') {
      cutoff = new Date();
      cutoff.setDate(now.getDate() - 90);
    }

    const filteredApps = allApps.filter((a: any) => {
      if (!cutoff) return true;
      const rawDate = a.appliedAt || a.createdAt;
      if (!rawDate) return true;
      const appDate = new Date(rawDate);
      return !isNaN(appDate.getTime()) && appDate >= cutoff;
    });

    const totalApps = filteredApps.length;

    // Lamaran baru dalam 7 hari terakhir
    const recentAppsCount = filteredApps.filter((a: any) => {
      const rawDate = a.appliedAt || a.createdAt;
      if (!rawDate) return false;
      const appDate = new Date(rawDate);
      return !isNaN(appDate.getTime()) && appDate >= sevenDaysAgo;
    }).length;

    // Dalam Review HR (Terkirim, Screening, atau APPLIED)
    const reviewingCount = filteredApps.filter((a: any) =>
      ['Terkirim', 'Screening', 'APPLIED'].includes(a.status)
    ).length;

    // Jadwal Interview
    const interviewCount = filteredApps.filter((a: any) =>
      ['Interview', 'INTERVIEW'].includes(a.status)
    ).length;

    // Perlu Tindak Lanjut: Lamaran Terkirim/Screening yang sudah >7 hari tanpa respons
    const followUpCount = filteredApps.filter((a: any) => {
      const isPending = ['Terkirim', 'Screening', 'APPLIED'].includes(a.status);
      if (!isPending) return false;
      const rawDate = a.appliedAt || a.createdAt;
      if (!rawDate) return false;
      const appDate = new Date(rawDate);
      return !isNaN(appDate.getTime()) && appDate < sevenDaysAgo;
    }).length;

    return {
      totalApps,
      recentAppsCount,
      reviewingCount,
      interviewCount,
      followUpCount,
    };
  }, [allApps, period]);

  const handleTrackerClick = () => {
    if (onViewTracker) {
      onViewTracker();
    } else {
      router.push('/tracker');
    }
  };

  const stats = [
    {
      id: 'active',
      title: 'Lamaran Aktif',
      value: String(statsData.totalApps),
      badge: statsData.recentAppsCount > 0 ? `+${statsData.recentAppsCount} minggu ini` : null,
      subtitle:
        statsData.totalApps > 0
          ? `${statsData.totalApps} berkas di tracker`
          : allApps.length > 0
          ? 'Tidak ada di periode ini'
          : 'Mulai lamar pekerjaan impian',
      icon: BriefcaseIcon,
      color:
        'bg-orange-50 text-orange-700 dark:bg-orange-950/80 dark:text-orange-400 border border-orange-100 dark:border-orange-900/50',
      onClick: handleTrackerClick,
      ariaLabel: 'Lihat seluruh lamaran aktif di tracker',
    },
    {
      id: 'reviewing',
      title: 'Dalam Review HR',
      value: String(statsData.reviewingCount),
      badge: statsData.reviewingCount > 0 ? 'Sedang Seleksi' : 'Belum Ada',
      subtitle:
        statsData.reviewingCount > 0
          ? `${statsData.reviewingCount} berkas tahap seleksi awal`
          : 'Belum ada berkas ditinjau',
      icon: EyeIcon,
      color:
        'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50',
      onClick: handleTrackerClick,
      ariaLabel: 'Lihat lamaran yang sedang ditinjau HR di tracker',
    },
    {
      id: 'followup',
      title: 'Perlu Tindak Lanjut',
      value: String(statsData.followUpCount),
      badge: statsData.followUpCount > 0 ? `${statsData.followUpCount} Butuh Respons` : 'Terkendali',
      subtitle:
        statsData.followUpCount > 0
          ? '>7 hari tanpa kabar dari HR'
          : period === '7d'
          ? 'Lamaran baru (<7 hari)'
          : 'Semua lamaran terpantau aktif',
      icon: statsData.followUpCount > 0 ? AlertCircleIcon : ClockIcon,
      color:
        statsData.followUpCount > 0
          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
          : 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
      actionText: statsData.followUpCount > 0 ? 'Tindak Lanjut →' : undefined,
      onClick: handleTrackerClick,
      ariaLabel: 'Buka tracker untuk tindak lanjut lamaran',
    },
    {
      id: 'interview',
      title: 'Jadwal Interview',
      value: String(statsData.interviewCount),
      badge: statsData.interviewCount > 0 ? `${statsData.interviewCount} Sesi Aktif` : null,
      subtitle:
        statsData.interviewCount > 0
          ? `${statsData.interviewCount} sesi wawancara siap`
          : 'Belum ada jadwal wawancara',
      icon: UsersIcon,
      color:
        statsData.interviewCount > 0
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
          : 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
      actionText: statsData.interviewCount > 0 ? 'Lihat Jadwal →' : undefined,
      onClick:
        statsData.interviewCount > 0
          ? () => router.push('/tracker?tab=interview')
          : handleTrackerClick,
      ariaLabel: 'Lihat jadwal interview di tracker',
    },
  ];

  const currentPeriodLabel =
    PERIOD_OPTIONS.find((opt) => opt.value === period)?.label || '30 Hari Terakhir';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[10px] p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors space-y-3">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-[8px] bg-cobalt-500 text-white flex items-center justify-center shrink-0 mt-0.5">
            <TrendingUpIcon size={15} />
          </div>
          <div>
            <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
              Ringkasan Lamaran Kerja
            </h3>
            <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5">
              Pantau alur berkas, respons HR, dan jadwal wawancara harianmu
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Custom Dropdown Filter Waktu */}
          <div ref={dropdownRef} className="relative inline-block text-left">
            <button
              type="button"
              id="summary-period-button"
              aria-haspopup="listbox"
              aria-expanded={isDropdownOpen}
              aria-label="Filter periode ringkasan lamaran"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="h-[32px] px-3 rounded-[10px] bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition flex items-center gap-2 cursor-pointer text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 shadow-2xs"
            >
              <ClockIcon size={13} className="text-orange-600 dark:text-orange-400 shrink-0" />
              <span className="whitespace-nowrap">{currentPeriodLabel}</span>
              <ChevronDownIcon
                size={13}
                className={cn(
                  'text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-200',
                  isDropdownOpen && 'rotate-180 text-cobalt-600 dark:text-blue-400'
                )}
              />
            </button>

            {isDropdownOpen && (
              <div
                role="listbox"
                aria-labelledby="summary-period-button"
                className="absolute right-0 top-full mt-1.5 z-40 w-44 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl py-1 text-xs animate-in fade-in-50 zoom-in-95 duration-150"
              >
                {PERIOD_OPTIONS.map((opt) => {
                  const isSelected = period === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        setPeriod(opt.value);
                        setIsDropdownOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 text-left transition cursor-pointer',
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-cobalt-600 dark:text-blue-400 font-bold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 font-medium'
                      )}
                    >
                      <span>{opt.label}</span>
                      {isSelected && (
                        <CheckIcon size={13} className="text-cobalt-600 dark:text-blue-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {onViewTracker && (
            <button
              type="button"
              onClick={onViewTracker}
              className="h-[32px] px-3 rounded-[10px] text-xs font-bold text-orange-700 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/60 dark:hover:bg-orange-900/60 border border-orange-200/80 dark:border-orange-800/60 transition flex items-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 whitespace-nowrap shadow-2xs"
            >
              <span>Tracker Detail</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Bento Stat Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              role="button"
              tabIndex={0}
              aria-label={stat.ariaLabel}
              onClick={stat.onClick}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  stat.onClick();
                }
              }}
              className="p-2.5 sm:p-3 rounded-[10px] border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/90 dark:hover:bg-slate-800/90 hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-150 space-y-2 flex flex-col justify-between group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              <div className="flex items-center justify-between gap-2">
                <div className={`p-1.5 rounded-[8px] ${stat.color} shrink-0`}>
                  <Icon size={15} />
                </div>
                {stat.badge && (
                  <span className="text-caption font-bold px-2 py-0.5 rounded-[6px] border shadow-2xs truncate text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                    {stat.badge}
                  </span>
                )}
              </div>

              <div>
                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {stat.value}
                </p>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {stat.title}
                </p>
                <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {stat.subtitle}
                </p>
              </div>

              {stat.actionText ? (
                <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-orange-700 dark:text-orange-400 group-hover:underline flex items-center gap-1">
                    <span>{stat.actionText}</span>
                  </span>
                </div>
              ) : (
                <div className="h-1.5" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
