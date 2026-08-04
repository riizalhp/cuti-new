'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { BarChart2, Calendar, Filter } from 'lucide-react';

export const ApplicationChartCard: React.FC = () => {
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const weeklyData = [
    { day: 'Sen', lamaran: 4, interview: 1, offering: 0 },
    { day: 'Sel', lamaran: 6, interview: 2, offering: 0 },
    { day: 'Rab', lamaran: 3, interview: 0, offering: 1 },
    { day: 'Kam', lamaran: 8, interview: 3, offering: 0 },
    { day: 'Jum', lamaran: 5, interview: 1, offering: 0 },
    { day: 'Sab', lamaran: 2, interview: 0, offering: 0 },
    { day: 'Min', lamaran: 1, interview: 0, offering: 0 },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors h-full flex flex-col justify-between">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Grafik Lamaran Mingguan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aktivitas pengiriman lamaran (Senin - Minggu)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
            <Calendar className="w-3.5 h-3.5 text-violet-500" />
            Minggu Ini
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-[260px] w-full pt-2">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklyData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              />
              <Bar
                dataKey="lamaran"
                name="Jumlah Lamaran"
                fill="#6366f1"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="interview"
                name="Interview"
                fill="#f59e0b"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="offering"
                name="Offering"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full bg-slate-100 dark:bg-slate-800/50 rounded-lg animate-pulse"></div>
        )}
      </div>
    </div>
  );
};
