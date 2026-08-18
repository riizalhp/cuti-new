'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { scheduleApi } from '@/lib/api';
import {
  Calendar,
  Clock,
  ArrowUpRight,
  Video,
  Mail,
  AlertCircle,
  FileText,
  ChevronRight,
  CalendarCheck,
  Plus,
} from 'lucide-react';

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
        return Video;
      case 'mail':
        return Mail;
      case 'alert':
        return AlertCircle;
      case 'file':
      default:
        return FileText;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[10px] p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full space-y-4">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] bg-orange-50 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-100 dark:border-orange-900/50">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>Jadwal Terdekat</span>
              <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-bold bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 font-mono">
                {schedules.length} Agenda
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Agenda interview, tes &amp; deadline
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push('/tracker')}
          className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-0.5 cursor-pointer"
        >
          <span>Semua</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Schedule Items List */}
      <div className="space-y-2.5 flex-1">
        {schedules.length === 0 && !isLoading ? (
          <div className="p-6 rounded-[10px] border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center justify-center text-center space-y-2.5 my-auto">
            <div className="w-10 h-10 rounded-[10px] bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Tidak ada agenda mendesak
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mt-0.5">
                Jadwal interview dan batas waktu lamaran kamu akan muncul otomatis di sini.
              </p>
            </div>
            <button
              onClick={() => router.push('/tracker')}
              className="px-3 py-1.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-bold text-[11px] flex items-center gap-1 transition cursor-pointer border-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buka Job Tracker</span>
            </button>
          </div>
        ) : (
          schedules.map((item) => {
            const Icon = getIcon(item.iconType);
            return (
              <div
                key={item.id}
                onClick={() => router.push(item.href)}
                className={`p-3 rounded-[10px] border transition-all cursor-pointer flex items-start gap-3 group ${
                  item.isToday
                    ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-800/50 hover:bg-amber-100/60 dark:hover:bg-amber-950/40'
                    : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                }`}
              >
                <div className={`p-2 rounded-[10px] ${item.badgeColor} shrink-0 mt-0.5`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-[10px] border ${
                        item.isToday
                          ? 'bg-amber-500 text-white border-amber-600 font-extrabold'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {item.dayLabel}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.timeLabel}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5 truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {item.type}
                  </p>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-transform self-center" />
              </div>
            );
          })
        )}
      </div>

      {/* Quick Action Footer */}
      <button
        onClick={() => router.push('/interview')}
        className="w-full text-center py-2 px-3 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer border-0"
      >
        Panduan &amp; Simulator Interview →
      </button>
    </div>
  );
};
