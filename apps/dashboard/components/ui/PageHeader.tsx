'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface HeaderStat {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  colorClass?: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  badge?: string;
  stats?: HeaderStat[];
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  badge,
  stats,
  actions,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 md:p-6 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Left side: Icon, Title, Badge & Subtitle */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {title}
          </h1>
          {badge && (
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl sm:pl-[42px]">
          {subtitle}
        </p>
      </div>

      {/* Right side: Stats / Actions */}
      <div className="flex items-center gap-3 self-start md:self-auto flex-wrap pt-1 md:pt-0">
        {stats && stats.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800"
              >
                {stat.icon && (
                  <stat.icon className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                )}
                <div>
                  <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">
                    {stat.label}
                  </div>
                  <div className={`text-xs sm:text-sm font-semibold leading-tight ${stat.colorClass || 'text-slate-800 dark:text-slate-200'}`}>
                    {stat.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {actions && <div>{actions}</div>}
      </div>
    </div>
  );
};
