'use client';

import React from 'react';
export type PageHeaderIcon = React.ComponentType<{ className?: string }>;

export interface HeaderStat {
  label: string;
  value: string | number;
  icon?: PageHeaderIcon;
  colorClass?: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle: React.ReactNode;
  icon: PageHeaderIcon;
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
    <div className="relative overflow-hidden bg-[#162758] border border-[#20367A] rounded-[10px] px-4 py-2.5 sm:py-3 mb-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-white">
      {/* Sisi Kiri: Icon, Label Modul & Key Metrics Data Info */}
      <div className="flex items-center gap-3 flex-wrap relative z-10">
        {/* Module Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="p-1.5 rounded-[8px] bg-white/10 text-white shrink-0">
            <Icon className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-xs sm:text-sm text-white tracking-tight uppercase">
            {badge || title}
          </span>
        </div>

        {/* Divider vertical */}
        {stats && stats.length > 0 && (
          <div className="h-4 w-[1px] bg-white/20 hidden sm:block shrink-0" />
        )}

        {/* Live Data Metrics / Stats */}
        {stats && stats.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-white/10 border border-white/15 shadow-2xs"
              >
                {stat.icon && (
                  <stat.icon className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                )}
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                  {stat.label}:
                </span>
                <span className={`text-xs font-black leading-none ${stat.colorClass || 'text-white'}`}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sisi Kanan: Actions Rata Kanan Penuh */}
      {actions && (
        <div className="shrink-0 md:ml-auto w-full md:w-auto flex items-center justify-end gap-2 relative z-10">
          {actions}
        </div>
      )}
    </div>
  );
};
