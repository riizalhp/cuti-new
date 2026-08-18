'use client';

import React, { useState, useEffect } from 'react';
import {
  Target,
  CheckCircle2,
  Clock,
  Download,
  Send,
  Sparkles,
  Gift,
  Coins,
} from 'lucide-react';
import { cvApi, trackerApi } from '@/lib/api';

interface Mission {
  id: string;
  title: string;
  points: string;
  progress: number;
  completed: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

export const TodayMissionsCard: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([
    {
      id: 'create_cv',
      title: 'Buat CV Pertamamu',
      points: '+50 Cuan',
      progress: 0,
      completed: false,
      icon: Download,
    },
    {
      id: 'send_application',
      title: 'Kirim Lamaran Pertama',
      points: '+30 Cuan',
      progress: 0,
      completed: false,
      icon: Send,
    },
    {
      id: 'optimize_ats',
      title: 'Raih ATS Score ≥ 80',
      points: '+40 Cuan',
      progress: 0,
      completed: false,
      icon: Sparkles,
    },
  ]);

  const [resetTimer, setResetTimer] = useState('');

  useEffect(() => {
    const loadMissions = async () => {
      try {
        const [cvs, apps] = await Promise.all([
          cvApi.getAll(),
          trackerApi.getAll(),
        ]);

        const updated: Mission[] = [];

        // Mission 1: Buat CV
        const hasCv = Array.isArray(cvs) && cvs.length > 0;
        updated.push({
          id: 'create_cv',
          title: 'Buat CV Pertamamu',
          points: '+50 Cuan',
          progress: hasCv ? 100 : 0,
          completed: hasCv,
          icon: Download,
        });

        // Mission 2: Kirim Lamaran
        const hasApps = Array.isArray(apps) && apps.length > 0;
        updated.push({
          id: 'send_application',
          title: 'Kirim Lamaran Pertama',
          points: '+30 Cuan',
          progress: hasApps ? 100 : 0,
          completed: hasApps,
          icon: Send,
        });

        // Mission 3: ATS Score ≥ 80
        let atsScore = 0;
        if (hasCv) {
          const primary = cvs.find((c: any) => c.isPrimary) || cvs[0];
          atsScore = primary.atsScore ?? 0;
        }
        const atsAchieved = atsScore >= 80;
        updated.push({
          id: 'optimize_ats',
          title: 'Raih ATS Score ≥ 80',
          points: '+40 Cuan',
          progress: atsAchieved ? 100 : Math.min(99, Math.round((atsScore / 80) * 100)),
          completed: atsAchieved,
          icon: Sparkles,
        });

        setMissions(updated);
      } catch (error) {
        console.error('[TodayMissionsCard] Failed to load missions:', error);
      }
    };

    loadMissions();
  }, []);

  // Dynamic countdown timer to midnight
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setResetTimer(`${hours} jam ${minutes} menit`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // update every minute
    return () => clearInterval(interval);
  }, []);

  const handleClaim = (id: string) => {
    setMissions((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, progress: 100, completed: true } : m
      )
    );
  };

  const completedCount = missions.filter((m) => m.completed).length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[10px] p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-[10px] bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
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
          <span className="px-2 py-0.5 rounded-[10px] text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1">
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
                className={`p-3 rounded-[10px] border text-xs transition ${
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
                      className="px-2.5 py-0.5 rounded-[10px] bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold transition"
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
          Reset misi berikutnya dalam <span className="font-semibold text-slate-700 dark:text-slate-300">{resetTimer || '...'}</span>
        </span>
      </div>
    </div>
  );
};
