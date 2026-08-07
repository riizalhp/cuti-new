'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Calendar, FileCheck, Target, ArrowRight } from 'lucide-react';

interface ActionCenterCardProps {
  userName?: string;
  onPrimaryAction?: () => void;
}

export const ActionCenterCard: React.FC<ActionCenterCardProps> = ({
  userName = 'Andi',
  onPrimaryAction,
}) => {
  const router = useRouter();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat pagi';
    if (hour < 15) return 'Selamat siang';
    if (hour < 18) return 'Selamat sore';
    return 'Selamat malam';
  };

  const priorityItems = [
    {
      id: 'interview',
      title: 'Interview PT Telkom Indonesia',
      time: 'Hari ini 14:00 WIB',
      badge: 'Hari Ini',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: Calendar,
      actionText: 'Siapkan Sesi',
      href: '/interview',
    },
    {
      id: 'cv-ats',
      title: 'CV ATS masih perlu 2 perbaikan',
      time: 'Skor saat ini: 86%',
      badge: 'Perbaikan',
      badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
      icon: FileCheck,
      actionText: 'Optimalkan CV',
      href: '/cv',
    },
    {
      id: 'jobs-match',
      title: '3 lowongan baru match di atas 85%',
      time: 'Posisi: Frontend Developer, Tech Lead',
      badge: 'Rekomendasi',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: Target,
      actionText: 'Lihat Match',
      href: '/match-cv',
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 text-white p-5 sm:p-6 shadow-xl border border-slate-800/80 transition-all">
      {/* Subtle Background Glow Decorative Element */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-16 w-48 h-48 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Header Sapaan & Subtitle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-orange-400" />
                Action Center
              </span>
              <span className="text-xs text-slate-400">| Priority Hub</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              {getGreeting()}, <span className="text-orange-400">{userName}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Berikut 3 prioritas penting yang perlu kamu selesaikan hari ini untuk mempercepat panggilan kerja:
            </p>
          </div>

          {/* Primary CTA Button (Must be orange-500 per global rules) */}
          <button
            onClick={onPrimaryAction || (() => router.push(priorityItems[0].href))}
            className="w-full md:w-auto shrink-0 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white px-5 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer border-0"
          >
            <span>Mulai Dari Prioritas Utama</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Priority Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {priorityItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => router.push(item.href)}
                className="group relative bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/10 transition-all cursor-pointer flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white/10 text-orange-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    #0{idx + 1}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-orange-300 transition-colors line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                    {item.time}
                  </p>
                </div>

                <div className="pt-1 flex items-center justify-between border-t border-white/5 text-[11px] font-bold text-orange-400 group-hover:text-orange-300">
                  <span>{item.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
