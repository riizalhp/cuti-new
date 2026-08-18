'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  Eye,
  Send,
  Award,
  ChevronRight,
  Edit,
} from 'lucide-react';
import { activitiesApi } from '@/lib/api';

interface Activity {
  id: string;
  type: string;
  title: string;
  company: string;
  position: string;
  time: string;
  timestamp?: string;
}

export const RecentActivityTimeline: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    activitiesApi.getAll(4).then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setActivities(data);
      }
      setIsLoading(false);
    });
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'interview':
        return Calendar;
      case 'viewed':
        return Eye;
      case 'applied':
        return Send;
      case 'offering':
        return Award;
      case 'cv_updated':
        return Edit;
      default:
        return Send;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'interview':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'viewed':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border-orange-300 dark:border-orange-800';
      case 'applied':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
      case 'offering':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'cv_updated':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[10px] p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Aktivitas Terbaru
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Riwayat jejak lamaran &amp; interaksi HR
              </p>
            </div>
          </div>
        </div>

        <div className="relative space-y-4 py-1 my-2">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-3.5 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="flex-1 p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="py-8 text-center">
              <Clock className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Belum ada aktivitas</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Aktivitas lamaran dan interaksi HR akan muncul di sini
              </p>
            </div>
          ) : (
            <>
              {/* Continuous vertical line running behind icons */}
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-800 -translate-x-1/2" />

              {activities.map((act) => {
                const Icon = getIcon(act.type);
                const color = getColor(act.type);
                return (
                  <div key={act.id} className="relative flex items-start gap-3.5 group">
                    {/* Icon Circle centered on line */}
                    <div
                      className={`relative z-10 w-8 h-8 rounded-full border flex-shrink-0 flex items-center justify-center shadow-xs ${color}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Content Box */}
                    <div className="flex-1 p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                            {act.title}
                          </h4>
                          <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 mt-0.5">
                            {act.company}
                          </p>
                        </div>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap bg-white dark:bg-slate-900 px-2 py-0.5 rounded-[10px] border border-slate-200 dark:border-slate-800">
                          {act.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Posisi: <span className="font-medium text-slate-700 dark:text-slate-300">{act.position}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Footer Link */}
      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={() => window.location.href = '/tracker'}
          className="w-full text-center py-2 px-3 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer border-0"
        >
          Lihat Selengkapnya di Tracker →
        </button>
      </div>
    </div>
  );
};
