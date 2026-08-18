'use client';

import React, { useState } from 'react';
import {
  GraduationCap,
  Clock,
  Award,
  Sparkles,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

export const LatestCoursesList: React.FC = () => {
  const [enrolled, setEnrolled] = useState<number[]>([]);

  const courses = [
    {
      id: 1,
      title: 'Analisis Data Dengan SQL & Python',
      provider: 'CUTI Academy',
      level: 'Pemula (Beginner)',
      duration: '12 Jam Video',
      type: 'Gratis',
      desc: 'Kuasai query dasar SQL, manipulasi dataframe dengan pandas, dan visualisasi data bisnis.',
    },
    {
      id: 2,
      title: 'Pemrograman Web Dasar (HTML, CSS, JS)',
      provider: 'CUTI Academy',
      level: 'Pemula (Beginner)',
      duration: '15 Jam Video',
      type: 'Gratis',
      desc: 'Membangun landing page responsif dari nol untuk portofolio developer.',
    },
    {
      id: 3,
      title: 'Komunikasi Bisnis & Negosiasi Gaji',
      provider: 'Business Skills ID',
      level: 'Menengah (Intermediate)',
      duration: '6 Jam Video',
      type: 'Premium',
      desc: 'Teknik presentasi, bahasa tubuh saat interview, dan strategi negosiasi kontrak.',
    },
    {
      id: 4,
      title: 'Fullstack Web Development (React & Node.js)',
      provider: 'CUTI Academy',
      level: 'Lanjutan (Advanced)',
      duration: '35 Jam Video',
      type: 'Premium',
      desc: 'Membangun aplikasi web fullstack terintegrasi database PostgreSQL & AI SDK.',
    },
    {
      id: 5,
      title: 'Digital Marketing & Social Media Ads',
      provider: 'Growth Marketing Hub',
      level: 'Pemula (Beginner)',
      duration: '10 Jam Video',
      type: 'Gratis',
      desc: 'Pengenalan Meta Ads, TikTok Marketing, SEO dasar, dan strategi copywriting iklan.',
    },
  ];

  const handleEnroll = (id: number) => {
    if (!enrolled.includes(id)) {
      setEnrolled([...enrolled, id]);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[10px] p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-[10px] bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Kursus Online Terbaru
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tingkatkan nilai skill di CV kamu dengan kursus bersertifikat
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {courses.map((c) => {
          const isEnrolled = enrolled.includes(c.id);
          return (
            <div
              key={c.id}
              className="p-4 rounded-[10px] border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-orange-300 dark:hover:border-orange-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-2 py-0.5 rounded-[10px] text-[10px] font-bold ${
                      c.type === 'Gratis'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {c.type}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {c.duration}
                  </span>
                </div>

                <h4 className="font-bold text-xs text-slate-900 dark:text-white mb-1">
                  {c.title}
                </h4>
                <p className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 mb-2">
                  {c.provider} • {c.level}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {c.desc}
                </p>
              </div>

              <button
                onClick={() => handleEnroll(c.id)}
                disabled={isEnrolled}
                className={`mt-4 w-full flex items-center justify-center gap-1.5 py-2 rounded-[10px] font-bold text-xs transition ${
                  isEnrolled
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-[#1738D1] hover:bg-[#132EA8] text-white shadow-sm'
                }`}
              >
                {isEnrolled ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Sudah Terdaftar</span>
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Mulai Belajar</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
