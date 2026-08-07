'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, CheckCircle2, AlertCircle, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface CareerReadinessCardProps {
  onBoostClick?: () => void;
}

export const CareerReadinessCard: React.FC<CareerReadinessCardProps> = ({
  onBoostClick,
}) => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  const readinessChecklist = [
    { label: 'Foto Profil Professional', status: true, detail: 'Latar polos & rapi' },
    { label: 'Pendidikan Terakhir', status: true, detail: 'IPK & Jurusan terverifikasi' },
    { label: 'Skill Teknis & Softskill', status: true, detail: '8 Skill Relevan' },
    { label: 'CV ATS Friendly', status: false, detail: 'Perlu penyesuaian kata kunci' },
  ];

  const score = 78;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full space-y-4 transition-all">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-100 dark:border-violet-900/50">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Career Readiness
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Tingkat kesiapan berkas &amp; profil
              </p>
            </div>
          </div>

          <div className="text-right flex items-center gap-2">
            <span className="text-xl font-black text-violet-600 dark:text-violet-400">
              {score}%
            </span>
          </div>
        </div>

        {/* Score Summary Badge Box matching CV ATS Score */}
        <div className="flex items-center justify-between bg-violet-50/70 dark:bg-violet-950/30 p-3 rounded-xl border border-violet-100 dark:border-violet-900/40 my-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Status Berkas: 3/4 Komponen Lengkap
            </span>
          </div>
          <span className="text-[10px] font-bold text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-950 px-2 py-0.5 rounded-md">
            Siap Melamar
          </span>
        </div>

        {/* Progress gauge bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden my-3">
          <div
            className="bg-violet-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${score}%` }}
          />
        </div>

        {/* Progressive Disclosure Toggle */}
        <div className="flex items-center justify-between text-xs my-2">
          <span className="text-slate-600 dark:text-slate-400 font-medium">
            3 komponen lengkap, 1 perlu diperbaiki
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>{isExpanded ? 'Tutup Detail' : 'Lihat Detail'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Expandable Checklist Section */}
        {isExpanded && (
          <div className="space-y-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-200">
            {readinessChecklist.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2">
                  {item.status ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
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
                  {item.status ? 'Lengkap' : 'Perlu Fix'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Primary CTA (orange-500 per global guidelines) */}
      <button
        onClick={onBoostClick || (() => router.push('/readiness'))}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition cursor-pointer border-0"
      >
        <Sparkles className="w-3.5 h-3.5 text-white" />
        <span>Tingkatkan Kesiapan Karier</span>
      </button>
    </div>
  );
};
