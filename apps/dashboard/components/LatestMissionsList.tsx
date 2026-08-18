'use client';

import React, { useState } from 'react';
import {
  Target,
  CheckCircle2,
  Download,
  ClipboardList,
  MessageSquare,
  Star,
  Share2,
  Gift,
  Coins,
} from 'lucide-react';

export const LatestMissionsList: React.FC = () => {
  const [missionsList, setMissionsList] = useState([
    {
      id: 'download_cv',
      title: 'Download CV ATS Pertama',
      desc: 'Download format PDF CV ATS friendly dari sistem.',
      reward: '+50 Cuan',
      status: 'completed', // 'completed' | 'claimable' | 'pending'
      icon: Download,
    },
    {
      id: 'isi_survey',
      title: 'Isi Survey Pengalaman Pengguna',
      desc: 'Bantu kami meningkatkan kualitas platform dengan 3 pertanyaan singkat.',
      reward: '+30 Cuan',
      status: 'claimable',
      icon: ClipboardList,
    },
    {
      id: 'testimoni',
      title: 'Tulis Testimoni Positif',
      desc: 'Bagikan pengalaman kamu memakai CUTI.',
      reward: '+40 Cuan',
      status: 'pending',
      icon: MessageSquare,
    },
    {
      id: 'rating',
      title: 'Beri Rating 5 Bintang',
      desc: 'Dukung aplikasi kami di portal ulasan.',
      reward: '+25 Cuan',
      status: 'pending',
      icon: Star,
    },
    {
      id: 'tweet',
      title: 'Tweet / Bagikan Tentang Platform',
      desc: 'Posting kabar gembira mengenai lamaran kamu di media sosial.',
      reward: '+60 Cuan',
      status: 'pending',
      icon: Share2,
    },
  ]);

  const handleAction = (id: string) => {
    setMissionsList((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          return { ...m, status: 'completed' };
        }
        return m;
      })
    );
  };

  const completedCount = missionsList.filter((m) => m.status === 'completed').length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[10px] p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-[10px] bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Misi Harian Terbaru
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kumpulkan poin cuan harian untuk ditukar dengan voucher interview
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-[10px] text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Total Selesai: {completedCount}/{missionsList.length}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {missionsList.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.id}
              className="p-3.5 rounded-[10px] border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-3 hover:border-amber-200 dark:hover:border-amber-900/50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-[10px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-amber-600 dark:text-amber-400">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    {m.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {m.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
                  {m.reward}
                </span>

                {m.status === 'completed' ? (
                  <span className="px-3 py-1 rounded-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Selesai
                  </span>
                ) : m.status === 'claimable' ? (
                  <button
                    onClick={() => handleAction(m.id)}
                    className="px-3 py-1 rounded-[10px] bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-sm"
                  >
                    Klaim Reward
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction(m.id)}
                    className="px-3 py-1 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white text-xs font-bold transition shadow-sm"
                  >
                    Kerjakan
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
