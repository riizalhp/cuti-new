'use client';

import React from 'react';
import {
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

interface CareerReadinessCardProps {
  onBoostClick: () => void;
}

export const CareerReadinessCard: React.FC<CareerReadinessCardProps> = ({
  onBoostClick,
}) => {
  const readinessChecklist = [
    { label: 'Foto Profil Professional', status: true, detail: 'Latar polos & rapi' },
    { label: 'Pendidikan Terakhir', status: true, detail: 'IPK & Jurusan terverifikasi' },
    { label: 'Skill Teknis & Softskill', status: true, detail: '8 Skill Relevan' },
    { label: 'CV ATS Friendly', status: false, detail: 'Perlu penyesuaian kata kunci' },
  ];

  const score = 78;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Career Readiness
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kesiapan lamaran kerja kamu
              </p>
            </div>
          </div>
          {/* Score Badge */}
          <div className="text-right">
            <span className="text-2xl font-black text-violet-600 dark:text-violet-400">
              {score}%
            </span>
            <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
              Kategori Siap
            </span>
          </div>
        </div>

        {/* Progress gauge bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mb-4">
          <div
            className="bg-[#0D3BD9] h-2.5 rounded-full"
            style={{ width: `${score}%` }}
          ></div>
        </div>

        {/* Checklist */}
        <div className="space-y-2.5 mb-4">
          {readinessChecklist.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
            >
              <div className="flex items-center gap-2.5">
                {item.status ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                )}
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {item.label}
                  </span>
                  <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                    {item.detail}
                  </span>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  item.status
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {item.status ? 'Lengkap' : 'Belum Pas'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onBoostClick}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md shadow-violet-600/20 transition"
      >
        <Sparkles className="w-4 h-4 text-amber-300" />
        <span>Tingkatkan Skor Kesiapan (Target 90%+)</span>
        <ArrowUpRight className="w-4 h-4" />
      </button>
    </div>
  );
};
