'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { scheduleApi } from '@/lib/api';
import {
  CalendarIcon,
  ClockIcon,
  VideoIcon,
  MailIcon,
  AlertCircleIcon,
  FileTextIcon,
  CalendarCheckIcon,
  PlusIcon,
  ChevronRightIcon,
} from '@/components/icons/CustomIcons';

interface ScheduleItem {
  id: string;
  dayLabel: string;
  timeLabel: string;
  title: string;
  type: string;
  badgeColor: string;
  iconType?: string;
  href: string;
  isToday: boolean;
}

export const UpcomingScheduleCard: React.FC = () => {
  const router = useRouter();
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    scheduleApi.getAll<ScheduleItem>().then((data) => {
      if (Array.isArray(data)) {
        setSchedules(data);
      }
      setIsLoading(false);
    });
  }, []);

  const getIcon = (type?: string) => {
    switch (type) {
      case 'video':
        return VideoIcon;
      case 'mail':
        return MailIcon;
      case 'alert':
        return AlertCircleIcon;
      case 'file':
      default:
        return FileTextIcon;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[10px] p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between h-full space-y-3">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-start gap-2">
          <div className="w-7 h-7 rounded-[8px] bg-orange-50 dark:bg-orange-950/80 text-orange-700 dark:text-orange-400 flex items-center justify-center border border-orange-100 dark:border-orange-900/50 shrink-0 mt-0.5">
            <CalendarIcon size={14} />
          </div>
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Jadwal Terdekat</span>
              <span className="px-1.5 py-0.5 rounded-[6px] text-caption font-bold bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 font-mono">
                {schedules.length} Agenda
              </span>
            </h3>
            <p className="text-caption text-slate-500 dark:text-slate-400">
              Agenda interview, tes &amp; deadline
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push('/tracker')}
          className="text-caption font-bold text-orange-700 dark:text-orange-400 px-2 py-1 min-h-[30px] hover:bg-orange-50 dark:hover:bg-orange-950/40 flex items-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-[6px] transition"
        >
          <span>Semua</span>
        </button>
      </div>

      {/* Schedule Items List */}
      <div className="space-y-2 flex-1">
        {schedules.length === 0 && !isLoading ? (
          <div className="p-4 rounded-[10px] border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center justify-center text-center space-y-2 my-auto">
            <div className="w-10 h-10 rounded-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 flex items-center justify-center dark:text-slate-400">
              <CalendarCheckIcon size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Tidak ada agenda mendesak
              </p>
              <p className="text-caption text-slate-500 dark:text-slate-400 max-w-xs mt-0.5">
                Jadwal interview dan batas waktu lamaran kamu akan muncul otomatis di sini.
              </p>
            </div>
            <button
              onClick={() => router.push('/tracker')}
              className="px-3.5 py-2 min-h-[32px] rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 text-white font-semibold text-caption flex items-center gap-1.5 transition cursor-pointer border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            >
              <PlusIcon size={14} />
              <span>Buka Tracker</span>
            </button>
          </div>
        ) : (
          schedules.map((item) => {
            const Icon = getIcon(item.iconType);
            return (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => router.push(item.href)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    router.push(item.href);
                  }
                }}
                className={`p-3 rounded-[10px] border transition-all cursor-pointer flex items-start gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                  item.isToday
                    ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-800/50 hover:bg-amber-100/60 dark:hover:bg-amber-950/40'
                    : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                }`}
              >
                <div className={`p-2 rounded-[10px] ${item.badgeColor} shrink-0 mt-0.5`}>
                  <Icon size={16} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-caption font-bold px-2 py-0.5 rounded-[10px] border ${
                        item.isToday
                          ? 'bg-amber-700 text-white border-amber-600 font-extrabold'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {item.dayLabel}
                    </span>
                    <span className="text-caption font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <ClockIcon size={12} />
                      {item.timeLabel}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5 truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-caption text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {item.type}
                  </p>
                </div>

                <ChevronRightIcon size={16} className="text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-transform self-center dark:text-slate-400" />
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
