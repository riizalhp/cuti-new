'use client';

import React from 'react';
import { Lightbulb, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

export const TipsAndInsightCard: React.FC = () => {
  const tips = [
    {
      title: 'Waktu Terbaik Melamar Kerja',
      desc: 'Kirimkan lamaran antara jam 08:00 - 10:00 WIB pada hari Selasa atau Rabu untuk rasio dibuka 2x lebih cepat oleh HR.',
      tag: 'Strategi Kirim',
      icon: Clock,
    },
    {
      title: 'Cara Tingkatkan Peluang Dipanggil',
      desc: 'Sesuaikan 3-5 kata kunci dari deskripsi lowongan ke dalam ringkasan CV Anda sebelum mengirimkan lamaran.',
      tag: 'Optimasi ATS',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[10px] p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-[10px] bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Tips &amp; Insight Karir
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Rekomendasi taktis mempercepat panggilan kerja
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {tips.map((t, idx) => {
          const Icon = t.icon;
          return (
            <div
              key={idx}
              className="p-3.5 rounded-[10px] bg-amber-50/40 dark:bg-slate-800/40 border border-amber-100 dark:border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    {t.tag}
                  </span>
                  <Icon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white mb-1">
                  {t.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
