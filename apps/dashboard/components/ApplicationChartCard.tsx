'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  ArrowRight,
  Send,
  Eye,
  Video,
  Award,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';

export const ApplicationChartCard: React.FC = () => {
  const router = useRouter();

  const funnelSteps = [
    {
      id: 'sent',
      label: 'Lamaran Dikirim',
      detail: '12 Dokumen terkirim ke HR',
      count: 12,
      rate: '100%',
      color: 'bg-violet-600',
      badgeColor: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
      icon: Send,
    },
    {
      id: 'screening',
      label: 'Screening HR',
      detail: '8 Berkas lolos filter awal',
      count: 8,
      rate: '66.7%',
      color: 'bg-blue-500',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
      icon: Eye,
    },
    {
      id: 'interview',
      label: 'Sesi Interview',
      detail: '4 Undangan wawancara',
      count: 4,
      rate: '33.3%',
      color: 'bg-amber-500',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
      icon: Video,
    },
    {
      id: 'offering',
      label: 'Offering Letter',
      detail: '1 Penawaran kerja resmi',
      count: 1,
      rate: '8.3%',
      color: 'bg-emerald-500',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      icon: Award,
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[10px] p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors flex flex-col justify-between h-full space-y-4">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] bg-violet-50 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-100 dark:border-violet-900/50">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>Progress &amp; Funnel Lamaran</span>
              <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-bold bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300">
                4 Tahapan
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Konversi &amp; rasio keberhasilan tiap tahap seleksi bulan ini
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push('/tracker')}
          className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Detail Tracker</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Structured Funnel Stage Cards */}
      <div className="space-y-2.5 flex-1">
        {funnelSteps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              onClick={() => router.push('/tracker')}
              className="p-3 rounded-[10px] border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition cursor-pointer flex flex-col space-y-2 group"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-[10px] bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                    <Icon className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors truncate">
                      {step.label}
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {step.detail}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {step.count}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[10px] ${step.badgeColor}`}>
                    {step.rate}
                  </span>
                </div>
              </div>

              {/* Stage Progress Bar */}
              <div className="w-full bg-slate-200/80 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${step.color} rounded-full transition-all duration-700`}
                  style={{ width: step.rate }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Insight & Action Box */}
      <div className="p-3 rounded-[10px] bg-violet-50/80 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900/60 space-y-2">
        <div className="flex items-start gap-2 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-slate-900 dark:text-white text-xs">
              Insight Konversi Seleksi:
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
              Tingkat panggilan interview kamu berada di angka <span className="font-bold text-violet-600 dark:text-violet-400">33.3%</span> (di atas rata-rata industri 25%).
            </p>
          </div>
        </div>
      </div>

      {/* Footer Action Button matching UpcomingScheduleCard */}
      <button
        onClick={() => router.push('/tracker')}
        className="w-full text-center py-2 px-3 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer border-0"
      >
        Analisis Detail Conversion Rate di Tracker →
      </button>
    </div>
  );
};
