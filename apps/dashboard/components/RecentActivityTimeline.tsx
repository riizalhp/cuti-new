'use client';

import React from 'react';
import {
  Clock,
  Calendar,
  Eye,
  Send,
  Award,
  ChevronRight,
} from 'lucide-react';

export const RecentActivityTimeline: React.FC = () => {
  const activities = [
    {
      id: 1,
      type: 'interview',
      title: 'Jadwal Interview Tahap 1',
      company: 'PT Telkom Indonesia (Persero) Tbk',
      position: 'Front End Developer',
      time: 'Hari ini, 14:00 WIB',
      icon: Calendar,
      color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    },
    {
      id: 2,
      type: 'viewed',
      title: 'CV Dilihat HR',
      company: 'Tokopedia / GoTo Group',
      position: 'UI/UX Designer',
      time: '2 jam yang lalu',
      icon: Eye,
      color: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300 border-violet-300 dark:border-violet-800',
    },
    {
      id: 3,
      type: 'applied',
      title: 'Mengirim Lamaran',
      company: 'Bank Central Asia (BCA)',
      position: 'IT Trainee Program',
      time: 'Kemarin, 16:30 WIB',
      icon: Send,
      color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
    },
    {
      id: 4,
      type: 'offering',
      title: 'Mendapat Offering Letter',
      company: 'PT Astra International Tbk',
      position: 'Software Engineer',
      time: '3 hari yang lalu',
      icon: Award,
      color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Aktivitas Terbaru
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Riwayat jejak lamaran &amp; interaksi HR
              </p>
            </div>
          </div>
        </div>

        <div className="relative space-y-4 py-1 my-2">
          {/* Continuous vertical line running behind icons */}
          <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-800 -translate-x-1/2" />

          {activities.map((act) => {
            const Icon = act.icon;
            return (
              <div key={act.id} className="relative flex items-start gap-3.5 group">
                {/* Icon Circle centered on line */}
                <div
                  className={`relative z-10 w-8 h-8 rounded-full border flex-shrink-0 flex items-center justify-center shadow-xs ${act.color}`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Content Box */}
                <div className="flex-1 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                        {act.title}
                      </h4>
                      <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 mt-0.5">
                        {act.company}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                      {act.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Posisi: <span className="font-medium text-slate-700 dark:text-slate-300">{act.position}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
    </div>
  </div>
);
};
