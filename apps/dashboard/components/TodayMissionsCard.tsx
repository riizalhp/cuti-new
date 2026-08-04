'use client';

import React, { useState } from 'react';
import {
  Target,
  CheckCircle2,
  Clock,
  Download,
  ClipboardList,
  MessageSquare,
  Gift,
  Coins,
} from 'lucide-react';

export const TodayMissionsCard: React.FC = () => {
  const [missions, setMissions] = useState([
    {
      id: 'download_cv',
      title: 'Download CV Pertama',
      points: '+50 Cuan',
      progress: 100,
      completed: true,
      icon: Download,
    },
    {
      id: 'survey',
      title: 'Isi Survey Pengalaman',
      points: '+30 Cuan',
      progress: 50,
      completed: false,
      icon: ClipboardList,
    },
    {
      id: 'testimoni',
      title: 'Tulis Testimoni Platform',
      points: '+40 Cuan',
      progress: 0,
      completed: false,
      icon: MessageSquare,
    },
  ]);

  const handleClaim = (id: string) => {
    setMissions((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, progress: 100, completed: true } : m
      )
    );
  };

  const completedCount = missions.filter((m) => m.completed).length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Misi Hari Ini
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Selesaikan misi &amp; kumpulkan poin cuan
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            {completedCount}/{missions.length} Selesai
          </span>
        </div>

        {/* Missions list */}
        <div className="space-y-3 mb-3">
          {missions.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.id}
                className={`p-3 rounded-lg border text-xs transition ${
                  m.completed
                    ? 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                    : 'bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-900/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {m.title}
                    </span>
                  </div>
                  <span className="font-bold text-amber-600 dark:text-amber-400 text-[11px]">
                    {m.points}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${m.progress}%` }}
                    ></div>
                  </div>
                  {m.completed ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Klaim
                    </span>
                  ) : (
                    <button
                      onClick={() => handleClaim(m.id)}
                      className="px-2.5 py-0.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold transition"
                    >
                      Klaim
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          Reset misi berikutnya dalam <span className="font-semibold text-slate-700 dark:text-slate-300">14 jam 20 menit</span>
        </span>
      </div>
    </div>
  );
};
