'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { userApi } from '@/lib/api';
import { Sparkles, Calendar, FileCheck, Target, ArrowRight, FileText, CheckCircle2, Rocket, Search } from 'lucide-react';

interface ActionCenterCardProps {
  userName?: string;
  onPrimaryAction?: () => void;
}

export const ActionCenterCard: React.FC<ActionCenterCardProps> = ({
  userName: propUserName,
  onPrimaryAction,
}) => {
  const router = useRouter();
  const [greeting, setGreeting] = useState('Selamat datang');
  const [displayName, setDisplayName] = useState(propUserName || 'Pengguna');
  const [userIntent, setUserIntent] = useState<string | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 11) setGreeting('Selamat pagi');
    else if (hour < 15) setGreeting('Selamat siang');
    else if (hour < 18) setGreeting('Selamat sore');
    else setGreeting('Selamat malam');

    userApi.getProfile().then((profile) => {
      if (profile && profile.fullName) {
        setDisplayName(profile.fullName.split(' ')[0]);
      }
    });

    if (typeof window !== 'undefined') {
      try {
        const sessionStr = localStorage.getItem('cuti_user_session');
        if (sessionStr) {
          const parsed = JSON.parse(sessionStr);
          if (parsed.intent) {
            setUserIntent(parsed.intent);
          }
          if (parsed.name) {
            setDisplayName(parsed.name.split(' ')[0]);
          }
        }
      } catch (e) {
        console.warn('Failed to parse session', e);
      }
    }
  }, []);

  // Intent Specific Hero Data
  const getHeroContent = () => {
    switch (userIntent) {
      case 'cari_kerja':
        return {
          title: `Selamat datang, ${displayName}`,
          subtitle: '18 lowongan yang cocok untukmu',
          primaryCtaText: 'Cari Lowongan',
          primaryCtaHref: '/scrape-jobs',
          secondaryText: 'Lengkapi profil',
          secondaryHref: '/pengaturan',
          badgeText: 'Cari Kerja',
          icon: Search,
        };
      case 'buat_cv':
        return {
          title: `Yuk selesaikan CV-mu, ${displayName}.`,
          subtitle: 'Progres kelengkapan draf CV saat ini: 75%',
          primaryCtaText: 'Lanjutkan CV',
          primaryCtaHref: '/cv',
          badgeText: 'Buat CV',
          icon: FileText,
          progress: '75%',
        };
      case 'perbaiki_cv':
        return {
          title: `CV kamu punya beberapa bagian yang bisa diperkuat, ${displayName}.`,
          subtitle: 'Skor kesiapan ATS awal: 72/100 dengan 3 catatan perbaikan',
          primaryCtaText: 'Lihat Hasil Analisis',
          primaryCtaHref: '/cv',
          badgeText: 'Perbaiki CV',
          icon: Sparkles,
        };
      case 'cepat_dapat_kerja':
        return {
          title: `Siap mulai melamar, ${displayName}?`,
          subtitle: 'Seluruh persiapan dasar kariermu sudah lengkap!',
          primaryCtaText: 'Lihat Lowongan Cocok',
          primaryCtaHref: '/scrape-jobs',
          badgeText: 'Career Setup',
          icon: Rocket,
          stats: [
            { label: 'CV', val: 'Siap' },
            { label: 'Job Match', val: '24' },
            { label: 'Lamaran', val: '0' },
            { label: 'Profil', val: '85%' },
          ],
        };
      default:
        return {
          title: `${greeting}, ${displayName}`,
          subtitle: 'Berikut 3 prioritas penting yang perlu kamu selesaikan hari ini:',
          primaryCtaText: 'Mulai Dari Prioritas Utama',
          primaryCtaHref: '/interview',
          badgeText: 'Action Center',
          icon: Sparkles,
        };
    }
  };

  const heroContent = getHeroContent();

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
      time: 'Posisi: Frontend Developer, Admin Staff',
      badge: 'Rekomendasi',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: Target,
      actionText: 'Lihat Match',
      href: '/scrape-jobs',
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
                {heroContent.badgeText}
              </span>
              <span className="text-xs text-slate-400">| Personalized Dashboard</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              {heroContent.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5 font-medium">
              {heroContent.subtitle}
            </p>

            {/* Quick Stats Grid if Cepat Dapat Kerja */}
            {heroContent.stats && (
              <div className="flex flex-wrap gap-2 pt-2">
                {heroContent.stats.map((st) => (
                  <span key={st.label} className="px-2.5 py-1 rounded-lg bg-white/10 text-xs font-bold text-slate-200 border border-white/10 flex items-center gap-1.5">
                    <span className="text-slate-400 font-normal">{st.label}:</span>
                    <span className="text-orange-400">{st.val}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Primary CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <button
              onClick={onPrimaryAction || (() => router.push(heroContent.primaryCtaHref))}
              className="w-full sm:w-auto shrink-0 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white px-5 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer border-0"
            >
              <span>{heroContent.primaryCtaText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {heroContent.secondaryText && (
              <button
                onClick={() => router.push(heroContent.secondaryHref || '/pengaturan')}
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition cursor-pointer text-center"
              >
                {heroContent.secondaryText}
              </button>
            )}
          </div>
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
