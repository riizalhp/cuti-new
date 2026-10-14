'use client';

import React from 'react';
export type PageHeaderIcon = React.ComponentType<{ className?: string }>;

export interface HeaderStat {
  label: string;
  value: string | number;
  icon?: PageHeaderIcon;
  colorClass?: string;
  isPrimary?: boolean;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  icon: PageHeaderIcon;
  badge?: string;
  stats?: HeaderStat[];
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  badge,
  stats,
  actions,
  className,
}) => {
  // Ambil stat paling prioritas untuk mobile Tier 1
  const primaryMobileStat = stats && stats.length > 0
    ? (stats.find((s) => s.isPrimary) || stats[0])
    : null;

  return (
    <div
      className={`relative overflow-hidden bg-[#162758] border border-[#20367A] rounded-[10px] px-3.5 py-2.5 sm:px-4 sm:py-3 mb-4 sm:mb-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-2.5 md:gap-3 text-white ${
        className || ''
      }`}
    >
      {/* TIER 1 (Mobile: Identitas Modul + 1 Pill Metrik Kunci | Desktop: Identitas + Semua Metrik Horisontal) */}
      <div className="flex items-center justify-between md:justify-start gap-2.5 sm:gap-3 w-full md:w-auto relative z-10 min-w-0">
        {/* Module Indicator */}
        <div className="flex items-center gap-2 min-w-0 shrink">
          <div className="p-1.5 rounded-[8px] bg-white/10 text-white shrink-0">
            <Icon className="w-4 h-4" />
          </div>
          <h1 className="font-extrabold text-xs sm:text-sm text-white tracking-tight truncate">
            {badge || title}
          </h1>
        </div>

        {/* Mobile Single Key Metric Pill (Kompak di kanan Tier 1) */}
        {primaryMobileStat && (
          <div className="flex items-center md:hidden shrink-0">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-[8px] bg-white/10 border border-white/15 shadow-2xs">
              {primaryMobileStat.icon && (
                <primaryMobileStat.icon className="w-3 h-3 text-slate-300 shrink-0" />
              )}
              <span className="text-[10px] font-bold text-slate-300 truncate max-w-[70px]">
                {primaryMobileStat.label}:
              </span>
              <span
                className={`text-[11px] font-black leading-none ${
                  primaryMobileStat.colorClass || 'text-white'
                }`}
              >
                {primaryMobileStat.value}
              </span>
            </div>
          </div>
        )}

        {/* Desktop Divider vertical */}
        {stats && stats.length > 0 && (
          <div className="h-4 w-[1px] bg-white/20 hidden md:block shrink-0" />
        )}

        {/* Desktop All Live Data Metrics / Stats */}
        {stats && stats.length > 0 && (
          <div className="hidden md:flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-[8px] bg-white/10 border border-white/15 shadow-2xs"
              >
                {stat.icon && (
                  <stat.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-300 shrink-0" />
                )}
                <span className="text-caption font-bold text-slate-300">
                  {stat.label}:
                </span>
                <span
                  className={`text-caption sm:text-xs font-black leading-none ${
                    stat.colorClass || 'text-white'
                  }`}
                >
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TIER 2 (Mobile: Aksi Penuh Terstruktur & Terjangkau Jempol | Desktop: Sisi Kanan Rata Kanan) */}
      {actions && (
        <div className="shrink-0 md:ml-auto w-full md:w-auto flex items-center justify-stretch md:justify-end gap-2 relative z-10 pt-1.5 md:pt-0 border-t border-white/10 md:border-t-0 [&>button]:w-full [&>button]:sm:w-auto [&>button]:min-h-[44px] md:[&>button]:min-h-[36px] [&>div]:w-full md:[&>div]:w-auto">
          {actions}
        </div>
      )}
    </div>
  );
};
