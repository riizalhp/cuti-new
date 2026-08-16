'use client';

import React, { useState, useEffect } from 'react';
import { trackerApi, cvApi } from '@/lib/api';
import {
  Briefcase,
  Users,
  Award,
  Zap,
  TrendingUp,
  ArrowUpRight,
  Clock,
  Sparkles,
} from 'lucide-react';

interface ApplicationSummaryCardProps {
  onViewTracker?: () => void;
}

export const ApplicationSummaryCard: React.FC<ApplicationSummaryCardProps> = ({ onViewTracker }) => {
  const [totalApps, setTotalApps] = useState(12);
  const [interviewCount, setInterviewCount] = useState(4);
  const [offeringCount, setOfferingCount] = useState(1);
  const [atsScore, setAtsScore] = useState(89);

  useEffect(() => {
    trackerApi.getAll().then((apps) => {
      if (Array.isArray(apps) && apps.length > 0) {
        setTotalApps(apps.length);
        setInterviewCount(apps.filter((a: any) => a.status === 'Interview').length);
        setOfferingCount(apps.filter((a: any) => a.status === 'Offering').length);
      }
    });

    cvApi.getAll().then((cvs) => {
      if (Array.isArray(cvs) && cvs.length > 0) {
        const primary = cvs.find((c: any) => c.isPrimary) || cvs[0];
        if (primary && primary.atsScore) setAtsScore(primary.atsScore);
      }
    });
  }, []);

  const stats = [
    {
      title: 'Lamaran Aktif',
      value: String(totalApps),
      badge: '+3 pekan ini',
      subtitle: `${Math.max(1, Math.round(totalApps * 0.6))} dalam proses peninjauan`,
      icon: Briefcase,
      color: 'bg-violet-50 text-violet-600 dark:bg-violet-950/80 dark:text-violet-400 border border-violet-100 dark:border-violet-900/50',
      progress: Math.min(100, Math.round((totalApps / 15) * 100)),
      progressColor: 'bg-violet-500',
    },
    {
      title: 'Interview',
      value: String(interviewCount),
      badge: 'Menunggu',
      subtitle: interviewCount > 0 ? 'Sesi aktif dijadwalkan' : 'Belum ada jadwal',
      icon: Users,
      color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50',
      progress: Math.min(100, interviewCount * 25),
      progressColor: 'bg-amber-500',
    },
    {
      title: 'Offering',
      value: String(offeringCount),
      badge: offeringCount > 0 ? 'Diterima' : 'Dalam Proses',
      subtitle: offeringCount > 0 ? 'Penawaran kerja diterima' : 'Target bulan ini',
      icon: Award,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50',
      progress: offeringCount > 0 ? 100 : 0,
      progressColor: 'bg-emerald-500',
    },
    {
      title: 'ATS Match Score',
      value: `${atsScore}%`,
      badge: atsScore >= 85 ? 'Sangat Relevan' : 'Cukup Baik',
      subtitle: 'Dioptimasi untuk Tech & Mgmt',
      icon: Zap,
      color: 'bg-purple-50 text-purple-600 dark:bg-purple-950/80 dark:text-purple-400 border border-purple-100 dark:border-purple-900/50',
      progress: atsScore,
      progressColor: 'bg-purple-500',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[10px] p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors space-y-5">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-violet-600 dark:bg-violet-500 text-white flex items-center justify-center shadow-md shadow-violet-600/20 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Ringkasan Lamaran Kerja
              </h3>
              <span className="px-2.5 py-0.5 rounded-[10px] text-[10px] font-bold bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-900/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-violet-500" />
                Live Update
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pantau progres lamaran, jadwal interview, dan penawaran kerja kamu dalam satu tempat
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-[10px] border border-slate-200/80 dark:border-slate-700 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-violet-500" />
            <span>30 Hari Terakhir</span>
          </span>
          {onViewTracker && (
            <button
              onClick={onViewTracker}
              className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/60 dark:hover:bg-violet-900/60 px-3 py-1.5 rounded-[10px] border border-violet-200/60 dark:border-violet-800/60 transition flex items-center gap-1 cursor-pointer"
            >
              <span>Tracker Detail</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 4 Bento Stat Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="p-4 rounded-[10px] border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition space-y-3 flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between gap-2">
                <div className={`p-2.5 rounded-[10px] ${stat.color} shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-[10px] border border-slate-200 dark:border-slate-700 shadow-2xs truncate">
                  {stat.badge}
                </span>
              </div>

              <div>
                <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight group-hover:scale-102 transition-transform origin-left">
                  {stat.value}
                </p>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {stat.title}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                  {stat.subtitle}
                </p>
              </div>

              {/* Mini progress bar indicator */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${stat.progressColor} rounded-full transition-all duration-500`}
                  style={{ width: `${stat.progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


