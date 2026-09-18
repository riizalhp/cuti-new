'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FlameIcon,
  ZapIcon,
  TrendingUpIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@/components/icons/CustomIcons';
import { trackerApi } from '@/lib/api';

interface DayActivity {
  name: string;
  count: number;
  isToday: boolean;
  isPast: boolean;
}

export const WeeklyApplicationSprintCard: React.FC = () => {
  const router = useRouter();
  const [thisWeekCount, setThisWeekCount] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [weeklyTarget] = useState(10);
  const [dayActivities, setDayActivities] = useState<DayActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    trackerApi.getAll().then((apps) => {
      if (Array.isArray(apps)) {
        const now = new Date();
        now.setHours(23, 59, 59, 999);

        // Find Monday of the current week (00:00:00)
        const currentDayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday, ...
        const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
        const monday = new Date(now);
        monday.setDate(now.getDate() + distanceToMonday);
        monday.setHours(0, 0, 0, 0);

        // Calculate applications sent this week
        const weekApps = apps.filter((a: any) => {
          if (!a.createdAt && !a.appliedDate) return false;
          const d = new Date(a.createdAt || a.appliedDate);
          return d >= monday && d <= now;
        });
        setThisWeekCount(weekApps.length);

        // Build 7-day visual activity (Senin - Minggu)
        const dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
        const todayDateStr = new Date().toDateString();
        const days: DayActivity[] = dayLabels.map((name, index) => {
          const d = new Date(monday);
          d.setDate(monday.getDate() + index);
          const dateOnlyStr = d.toISOString().slice(0, 10);

          const count = apps.filter((a: any) => {
            const raw = a.createdAt || a.appliedDate || '';
            return raw.startsWith(dateOnlyStr);
          }).length;

          const isToday = d.toDateString() === todayDateStr;
          const isPast = d < new Date() && !isToday;

          return { name, count, isToday, isPast };
        });
        setDayActivities(days);

        // Calculate consecutive active days streak
        let streak = 0;
        const checkDate = new Date();
        checkDate.setHours(0, 0, 0, 0);

        for (let i = 0; i < 30; i++) {
          const dateStr = checkDate.toISOString().slice(0, 10);
          const hasApp = apps.some((a: any) => {
            const raw = a.createdAt || a.appliedDate || '';
            return raw.startsWith(dateStr);
          });

          if (hasApp) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            if (i === 0) {
              // If today has no application yet, check yesterday to preserve streak
              checkDate.setDate(checkDate.getDate() - 1);
              continue;
            }
            break;
          }
        }
        setStreakDays(streak);
      }
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  }, []);

  const progressPct = Math.min(Math.round((thisWeekCount / weeklyTarget) * 100), 100);

  const getMotivationalInsight = () => {
    if (thisWeekCount >= weeklyTarget) {
      return 'Target mingguan tercapai! Peluang dipanggil interview meningkat optimal. Pantau respon HR di Tracker.';
    }
    if (thisWeekCount >= 6) {
      return `Hebat! Sudah kirim ${thisWeekCount} lamaran. Tinggal ${weeklyTarget - thisWeekCount} lamaran lagi untuk mencapai target mingguan.`;
    }
    if (thisWeekCount > 0) {
      return `Bagus! Kamu sudah memulai dengan ${thisWeekCount} lamaran. Kirim 2 lamaran per hari untuk mengejar target mingguan.`;
    }
    return 'Kirim minimal 5-10 lamaran per minggu agar rasio panggilan wawancara meningkat hingga 3x lipat.';
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[10px] p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors h-full flex flex-col justify-between space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-[10px] bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border border-orange-200/80 dark:border-orange-800/60">
              <FlameIcon size={20} className="text-orange-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Sprint Lamaran Minggu Ini
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Target mingguan &amp; konsistensi melamar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[10px] text-[11px] font-bold bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
            <ZapIcon size={14} className="text-orange-500" />
            <span>{streakDays} Hari Streak</span>
          </div>
        </div>

        {/* Weekly Progress Bar & Numbers */}
        <div className="mt-3.5 p-3.5 rounded-[10px] bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <ClockIcon size={14} className="text-slate-400" />
              Progres Minggu Ini
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              <span className="text-orange-600 dark:text-orange-400 font-extrabold text-sm">
                {thisWeekCount}
              </span>
              <span className="text-slate-400"> / {weeklyTarget} Lamaran</span>
              <span className="ml-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                ({progressPct}%)
              </span>
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* 7-Day Visual Activity (Senin - Minggu) */}
        <div className="mt-3.5">
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Aktivitas Harian (Senin - Minggu):</span>
            <span>{thisWeekCount > 0 ? `${thisWeekCount} Terkirim` : 'Belum Ada'}</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {isLoading ? (
              [0, 1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-11 rounded-[10px] bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))
            ) : (
              dayActivities.map((day, idx) => {
                const hasApplied = day.count > 0;
                return (
                  <div
                    key={idx}
                    className={`p-1.5 rounded-[10px] flex flex-col items-center justify-between text-center transition border ${
                      hasApplied
                        ? 'bg-orange-500 text-white border-orange-600 shadow-xs'
                        : day.isToday
                        ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-300 dark:border-orange-800 text-orange-600 dark:text-orange-400 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="text-[10px] font-semibold">{day.name}</span>
                    <div className="my-0.5">
                      {hasApplied ? (
                        <CheckCircleIcon size={12} className="text-white" />
                      ) : (
                        <span className="text-[9px] opacity-60">-</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Insight Box */}
        <div className="mt-3.5 p-2.5 rounded-[10px] bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
          <TrendingUpIcon size={16} className="text-[#1738D1] dark:text-blue-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">{getMotivationalInsight()}</p>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2.5">
        <button
          type="button"
          onClick={() => router.push('/tracker')}
          className="px-3.5 py-2 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center gap-1 cursor-pointer border-0"
        >
          Lihat Tracker
        </button>

        <button
          type="button"
          onClick={() => router.push('/scrape-jobs')}
          className="px-4 py-2 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-bold text-xs shadow-md shadow-[#1738D1]/20 active:scale-[0.98] transition flex items-center gap-1.5 cursor-pointer border-0"
        >
          <span>Lamar Lowongan</span>
        </button>
      </div>
    </div>
  );
};
