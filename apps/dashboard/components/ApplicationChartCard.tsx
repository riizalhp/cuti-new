'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { trackerApi } from '@/lib/api';
import {
  TrendingUp,
  ArrowRight,
  Send,
  Eye,
  Video,
  Award,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

export const ApplicationChartCard: React.FC = () => {
  const router = useRouter();

  const [stats, setStats] = React.useState({
    sent: 0,
    screening: 0,
    interview: 0,
    offering: 0,
  });

  React.useEffect(() => {
    trackerApi.getAll().then((apps) => {
      if (Array.isArray(apps)) {
        const total = apps.length;
        const screening = apps.filter((a: any) =>
          ['Screening', 'Interview', 'Offering', 'INTERVIEW', 'OFFERING', 'ACCEPTED'].includes(a.status)
        ).length;
        const interview = apps.filter((a: any) =>
          ['Interview', 'Offering', 'INTERVIEW', 'OFFERING', 'ACCEPTED'].includes(a.status)
        ).length;
        const offering = apps.filter((a: any) =>
          ['Offering', 'OFFERING', 'ACCEPTED', 'Diterima'].includes(a.status)
        ).length;

        setStats({
          sent: total,
          screening,
          interview,
          offering,
        });
      }
    });
  }, []);

  const total = stats.sent;
  const sentRate = total > 0 ? '100%' : '0%';
  const screeningRate = total > 0 ? `${((stats.screening / total) * 100).toFixed(1)}%` : '0%';
  const interviewRate = total > 0 ? `${((stats.interview / total) * 100).toFixed(1)}%` : '0%';
  const offeringRate = total > 0 ? `${((stats.offering / total) * 100).toFixed(1)}%` : '0%';

  const interviewPct = total > 0 ? (stats.interview / total) * 100 : 0;

  const funnelSteps = [
    {
      id: 'sent',
      label: 'Lamaran Dikirim',
      detail: `${stats.sent} Dokumen terkirim ke HR`,
      count: stats.sent,
      rate: sentRate,
      color: 'bg-[#1738D1]',
      badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
      icon: Send,
    },
    {
      id: 'screening',
      label: 'Screening HR',
      detail: `${stats.screening} Berkas lolos filter awal`,
      count: stats.screening,
      rate: screeningRate,
      color: 'bg-blue-500',
      badgeColor: 'bg-blue-100 text-navy-800 dark:bg-blue-950 dark:text-blue-300',
      icon: Eye,
    },
    {
      id: 'interview',
      label: 'Sesi Interview',
      detail: `${stats.interview} Undangan wawancara`,
      count: stats.interview,
      rate: interviewRate,
      color: 'bg-amber-500',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
      icon: Video,
    },
    {
      id: 'offering',
      label: 'Offering Letter',
      detail: `${stats.offering} Penawaran kerja resmi`,
      count: stats.offering,
      rate: offeringRate,
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
          <div className="w-8 h-8 rounded-[10px] bg-orange-50 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-100 dark:border-orange-900/50">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>Progress &amp; Funnel Lamaran</span>
              <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-bold bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300">
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
          className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 cursor-pointer"
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
                    <Icon className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors truncate">
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
      <div className="p-3 rounded-[10px] bg-orange-50/80 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900/50 space-y-2">
        <div className="flex items-start gap-2 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
              <span>Insight Konversi Seleksi:</span>
              {total > 0 && (
                <span className="px-1.5 py-0.2 rounded bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-300 text-[10px] font-mono">
                  Live
                </span>
              )}
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
              {total === 0 ? (
                <span>
                  Belum ada dokumen lamaran terkirim. Tambahkan lamaran pertamamu di <strong className="text-orange-600 dark:text-orange-400 font-bold">Job Tracker</strong> untuk melihat analisis rasio konversi seleksi otomatis.
                </span>
              ) : interviewPct >= 25 ? (
                <span>
                  Tingkat panggilan interview kamu berada di angka <strong className="text-orange-600 dark:text-orange-400 font-bold">{interviewRate}</strong> (di atas rata-rata industri 25%). Performa CV dan kualifikasi lamaran kamu sangat kompetitif!
                </span>
              ) : interviewPct > 0 ? (
                <span>
                  Tingkat panggilan interview kamu berada di angka <strong className="text-orange-600 dark:text-orange-400 font-bold">{interviewRate}</strong> (rata-rata industri 25%). Optimalkan kata kunci ATS di CV kamu untuk meningkatkan rasio panggilan HR.
                </span>
              ) : (
                <span>
                  Dari <strong className="text-slate-900 dark:text-white font-bold">{total} lamaran</strong> terkirim, tingkat panggilan interview saat ini <strong className="text-orange-600 dark:text-orange-400 font-bold">0.0%</strong>. Evaluasi kecocokan CV dengan kebutuhan lowongan untuk hasil maksimal.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Action Button */}
      <button
        onClick={() => router.push('/tracker')}
        className="w-full text-center py-2 px-3 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer border-0"
      >
        Analisis Detail Conversion Rate di Tracker →
      </button>
    </div>
  );
};
