'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, ArrowUpRight, Video, Mail, AlertCircle, FileText, ChevronRight } from 'lucide-react';

export const UpcomingScheduleCard: React.FC = () => {
  const router = useRouter();

  const schedules = [
    {
      id: '1',
      dayLabel: 'Hari ini',
      timeLabel: '14:00 WIB',
      title: 'Interview PT Telkom Indonesia',
      type: 'Interview Sesi 1',
      badgeColor: 'bg-amber-50 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      icon: Video,
      href: '/interview',
      isToday: true,
    },
    {
      id: '2',
      dayLabel: 'Besok',
      timeLabel: '10:00 WIB',
      title: 'Follow-up HR Tokopedia',
      type: 'Status Tahap 2',
      badgeColor: 'bg-blue-50 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      icon: Mail,
      href: '/tracker',
      isToday: false,
    },
    {
      id: '3',
      dayLabel: '3 hari lagi',
      timeLabel: '23:59 WIB',
      title: 'Batas Konfirmasi PT Astra',
      type: 'Offering Letter',
      badgeColor: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      icon: AlertCircle,
      href: '/tracker',
      isToday: false,
    },
    {
      id: '4',
      dayLabel: '5 hari lagi',
      timeLabel: '16:00 WIB',
      title: 'Psikotes Online Bank BCA',
      type: 'Tes Potensi Akademik',
      badgeColor: 'bg-violet-50 text-violet-600 dark:bg-violet-950/80 dark:text-violet-400 border-violet-200 dark:border-violet-800',
      icon: FileText,
      href: '/latihan-soal',
      isToday: false,
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full space-y-4">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-100 dark:border-violet-900/50">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>Jadwal Terdekat</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300">
                4 Agenda
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Agenda interview, tes &amp; deadline
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push('/tracker')}
          className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-0.5 cursor-pointer"
        >
          <span>Semua</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Schedule Items List */}
      <div className="space-y-2.5 flex-1">
        {schedules.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => router.push(item.href)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 group ${
                item.isToday
                  ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-800/50 hover:bg-amber-100/60 dark:hover:bg-amber-950/40'
                  : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
              }`}
            >
              <div className={`p-2 rounded-lg ${item.badgeColor} shrink-0 mt-0.5`}>
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    item.isToday
                      ? 'bg-amber-500 text-white border-amber-600 font-extrabold'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                  }`}>
                    {item.dayLabel}
                  </span>
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.timeLabel}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5 truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {item.type}
                </p>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-transform self-center" />
            </div>
          );
        })}
      </div>

      {/* Quick Action Footer */}
      <button
        onClick={() => router.push('/interview')}
        className="w-full text-center py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer border-0"
      >
        Panduan &amp; Simulator Interview →
      </button>
    </div>
  );
};
