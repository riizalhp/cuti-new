'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ClockIcon,
  CalendarIcon,
  EyeIcon,
  SendIcon,
  AwardIcon,
  EditIcon,
} from '@/components/icons/CustomIcons';
import { activitiesApi } from '@/lib/api';

interface Activity {
  id: string;
  type: string;
  title: string;
  company: string;
  position: string;
  time: string;
  timestamp?: string;
}

export const RecentActivityTimeline: React.FC = () => {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    activitiesApi.getAll(4).then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setActivities(data);
      }
      setIsLoading(false);
    });
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'interview':
        return CalendarIcon;
      case 'viewed':
        return EyeIcon;
      case 'applied':
        return SendIcon;
      case 'offering':
        return AwardIcon;
      case 'cv_updated':
        return EditIcon;
      default:
        return SendIcon;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'interview':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'viewed':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border-orange-300 dark:border-orange-800';
      case 'applied':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
      case 'offering':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'cv_updated':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[10px] p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-2">
            <div className="p-1.5 rounded-[8px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0 mt-0.5">
              <ClockIcon size={15} />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                Aktivitas Terbaru
              </h3>
              <p className="text-caption text-slate-500 dark:text-slate-400">
                Riwayat jejak lamaran &amp; interaksi HR
              </p>
            </div>
          </div>
        </div>

        <div className="relative space-y-2.5 py-1">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-2.5 animate-pulse motion-reduce:animate-none">
                  <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="flex-1 p-2 rounded-[8px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5">
                    <div className="h-2.5 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-2.5 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="py-6 text-center">
              <ClockIcon size={32} className="mx-auto text-slate-300 dark:text-slate-700 mb-1.5" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Belum ada aktivitas</p>
              <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5">
                Aktivitas lamaran dan interaksi HR akan muncul di sini
              </p>
            </div>
          ) : (
            <>
              {/* Continuous vertical line running behind icons */}
              <div className="absolute left-3.5 top-3 bottom-3 w-0.5 bg-slate-200 dark:bg-slate-800 -translate-x-1/2" />

              {activities.map((act) => {
                const Icon = getIcon(act.type);
                const color = getColor(act.type);
                return (
                  <div key={act.id} className="relative flex items-start gap-2.5 group">
                    {/* Icon Circle centered on line */}
                    <div
                      className={`relative z-10 w-7 h-7 rounded-full border flex-shrink-0 flex items-center justify-center shadow-xs ${color}`}
                    >
                      <Icon size={13} />
                    </div>

                    {/* Content Box */}
                    <div className="flex-1 p-2 sm:p-2.5 rounded-[8px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition">
                      <div className="flex flex-wrap items-start justify-between gap-1.5">
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                            {act.title}
                          </h4>
                          <p className="text-caption font-semibold text-orange-700 dark:text-orange-400 mt-0.5">
                            {act.company}
                          </p>
                        </div>
                        <span className="text-caption font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded-[6px] border border-slate-200 dark:border-slate-800">
                          {act.time}
                        </span>
                      </div>
                      <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5">
                        Posisi: <span className="font-medium text-slate-700 dark:text-slate-300">{act.position}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Footer Link */}
      <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={() => router.push('/tracker')}
          className="w-full text-center py-2 px-3 min-h-[32px] flex items-center justify-center rounded-[8px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-caption transition cursor-pointer border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          Lihat Selengkapnya di Tracker
        </button>
      </div>
    </div>
  );
};
