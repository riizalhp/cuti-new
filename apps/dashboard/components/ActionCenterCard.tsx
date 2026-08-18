'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { userApi, cvApi, trackerApi, scheduleApi, jobsApi } from '@/lib/api';
import { Sparkles, Calendar, FileCheck, Target, ArrowRight, FileText, CheckCircle2, Rocket, Search } from 'lucide-react';

interface ActionCenterCardProps {
  userName?: string;
  onPrimaryAction?: () => void;
}

interface PriorityItem {
  id: string;
  title: string;
  time: string;
  badge: string;
  badgeColor: string;
  icon: any;
  actionText: string;
  href: string;
  urgency: number;
}

export const ActionCenterCard: React.FC<ActionCenterCardProps> = ({
  userName: propUserName,
  onPrimaryAction,
}) => {
  const router = useRouter();
  const [greeting, setGreeting] = useState('Selamat datang');
  const [displayName, setDisplayName] = useState(propUserName || 'Pengguna');
  const [userIntent, setUserIntent] = useState<string | null>(null);
  const [priorityItems, setPriorityItems] = useState<PriorityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic data for hero content
  const [cvCount, setCvCount] = useState(0);
  const [avgAtsScore, setAvgAtsScore] = useState(0);
  const [appCount, setAppCount] = useState(0);
  const [jobMatchCount, setJobMatchCount] = useState(0);
  const [cvCompleteness, setCvCompleteness] = useState(0);

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

    // Fetch all dynamic data
    loadDynamicData();
  }, []);

  const loadDynamicData = async () => {
    setIsLoading(true);
    try {
      const [cvs, apps, schedules, jobs] = await Promise.all([
        cvApi.getAll(),
        trackerApi.getAll(),
        scheduleApi.getAll(),
        jobsApi.getRecommended(50),
      ]);

      // CV data
      setCvCount(Array.isArray(cvs) ? cvs.length : 0);

      // Calculate average ATS score
      if (Array.isArray(cvs) && cvs.length > 0) {
        const totalAts = cvs.reduce((sum: number, cv: any) => sum + (cv.atsScore || 0), 0);
        setAvgAtsScore(Math.round(totalAts / cvs.length));

        // Calculate completeness based on primary/first CV
        const primaryCv = cvs[0];
        let filledSections = 0;
        const totalSections = 6;
        if (primaryCv.summary && primaryCv.summary.trim().length > 0) filledSections++;
        if (primaryCv.skills && primaryCv.skills.length > 0) filledSections++;
        if (primaryCv.experience && primaryCv.experience.length > 0) filledSections++;
        if (primaryCv.education && primaryCv.education.length > 0) filledSections++;
        if (primaryCv.projects && primaryCv.projects.length > 0) filledSections++;
        if (primaryCv.contactInfo && (primaryCv.contactInfo.email || primaryCv.contactInfo.phone)) filledSections++;
        setCvCompleteness(Math.round((filledSections / totalSections) * 100));
      }

      // Applications data
      setAppCount(Array.isArray(apps) ? apps.length : 0);

      // Job matches count (jobs with decent match)
      setJobMatchCount(Array.isArray(jobs) ? jobs.length : 0);

      // Build dynamic priority items
      const items: PriorityItem[] = [];

      // 1. Upcoming interviews from schedules
      if (Array.isArray(schedules) && schedules.length > 0) {
        const now = new Date();
        const upcomingSchedules = schedules
          .filter((s: any) => {
            const schedDate = new Date(s.date || s.scheduledAt || s.startTime);
            return schedDate >= now && (s.type === 'interview' || s.type === 'Interview');
          })
          .sort((a: any, b: any) => {
            const dateA = new Date(a.date || a.scheduledAt || a.startTime);
            const dateB = new Date(b.date || b.scheduledAt || b.startTime);
            return dateA.getTime() - dateB.getTime();
          });

        upcomingSchedules.slice(0, 1).forEach((schedule: any) => {
          const schedDate = new Date(schedule.date || schedule.scheduledAt || schedule.startTime);
          const isToday = schedDate.toDateString() === now.toDateString();
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const isTomorrow = schedDate.toDateString() === tomorrow.toDateString();

          const timeStr = schedDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
          let dateLabel = schedDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
          if (isToday) dateLabel = 'Hari ini';
          if (isTomorrow) dateLabel = 'Besok';

          items.push({
            id: 'interview-upcoming',
            title: `Interview ${schedule.company || schedule.title || 'Perusahaan'}`,
            time: `${dateLabel} ${timeStr} WIB`,
            badge: isToday ? 'Hari Ini' : isTomorrow ? 'Besok' : 'Mendatang',
            badgeColor: isToday
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'bg-blue-500/20 text-blue-300 border-blue-500/30',
            icon: Calendar,
            actionText: 'Siapkan Sesi',
            href: '/interview',
            urgency: isToday ? 10 : isTomorrow ? 8 : 5,
          });
        });
      }

      // 2. CV ATS optimization suggestion
      if (Array.isArray(cvs) && cvs.length > 0) {
        const avgScore = cvs.reduce((sum: number, cv: any) => sum + (cv.atsScore || 0), 0) / cvs.length;
        if (avgScore < 85) {
          const improvements = [];
          const primaryCv = cvs[0];
          if (!primaryCv.summary || primaryCv.summary.trim().length < 20) improvements.push('ringkasan');
          if (!primaryCv.skills || primaryCv.skills.length < 5) improvements.push('skill');
          if (!primaryCv.experience || primaryCv.experience.length === 0) improvements.push('pengalaman');

          items.push({
            id: 'cv-ats',
            title: improvements.length > 0
              ? `CV perlu ${improvements.length} perbaikan`
              : 'Optimalkan skor ATS CV kamu',
            time: `Skor saat ini: ${Math.round(avgScore)}%`,
            badge: 'Perbaikan',
            badgeColor: 'bg-[#1738D1]/20 text-orange-300 border-[#1738D1]/30',
            icon: FileCheck,
            actionText: 'Optimalkan CV',
            href: '/cv',
            urgency: avgScore < 60 ? 7 : 4,
          });
        }
      } else {
        // No CV at all
        items.push({
          id: 'cv-create',
          title: 'Buat CV pertamamu',
          time: 'Belum ada CV',
          badge: 'Penting',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          icon: FileText,
          actionText: 'Buat CV',
          href: '/cv',
          urgency: 9,
        });
      }

      // 3. Job matches
      if (Array.isArray(jobs) && jobs.length > 0) {
        items.push({
          id: 'jobs-match',
          title: `${jobs.length} lowongan cocok dengan profilmu`,
          time: 'Berdasarkan skill & pengalaman',
          badge: 'Rekomendasi',
          badgeColor: 'bg-[#1738D1]/20 text-orange-300 border-[#1738D1]/30',
          icon: Target,
          actionText: 'Lihat Lowongan',
          href: '/scrape-jobs',
          urgency: 3,
        });
      } else {
        items.push({
          id: 'jobs-explore',
          title: 'Jelajahi lowongan kerja terbaru',
          time: 'Cari yang sesuai profilmu',
          badge: 'Eksplorasi',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          icon: Search,
          actionText: 'Cari Lowongan',
          href: '/scrape-jobs',
          urgency: 2,
        });
      }

      // 4. Application tracking
      if (Array.isArray(apps) && apps.length > 0) {
        const pendingApps = apps.filter((a: any) =>
          ['Terkirim', 'Screening'].includes(a.status)
        );
        if (pendingApps.length > 0) {
          items.push({
            id: 'apps-pending',
            title: `${pendingApps.length} lamaran menunggu respon`,
            time: 'Status: Terkirim / Screening',
            badge: 'Tracking',
            badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
            icon: CheckCircle2,
            actionText: 'Lihat Status',
            href: '/tracker',
            urgency: 3,
          });
        }
      }

      // Sort by urgency and take top 3
      items.sort((a, b) => b.urgency - a.urgency);
      setPriorityItems(items.slice(0, 3));
    } catch (error) {
      console.error('[ActionCenterCard] Failed to load data:', error);
      // Fallback: empty items, let UI show gracefully
      setPriorityItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Intent Specific Hero Data - now with dynamic values
  const getHeroContent = () => {
    switch (userIntent) {
      case 'cari_kerja':
        return {
          title: `Selamat datang, ${displayName}`,
          subtitle: jobMatchCount > 0
            ? `${jobMatchCount} lowongan yang cocok untukmu`
            : 'Temukan lowongan yang cocok dengan profilmu',
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
          subtitle: cvCount > 0
            ? `Progres kelengkapan draf CV saat ini: ${cvCompleteness}%`
            : 'Mulai buat CV pertamamu sekarang',
          primaryCtaText: cvCount > 0 ? 'Lanjutkan CV' : 'Buat CV',
          primaryCtaHref: '/cv',
          badgeText: 'Buat CV',
          icon: FileText,
          progress: cvCount > 0 ? `${cvCompleteness}%` : '0%',
        };
      case 'perbaiki_cv':
        return {
          title: `CV kamu punya beberapa bagian yang bisa diperkuat, ${displayName}.`,
          subtitle: avgAtsScore > 0
            ? `Skor kesiapan ATS awal: ${avgAtsScore}/100`
            : 'Upload CV untuk analisis ATS otomatis',
          primaryCtaText: 'Lihat Hasil Analisis',
          primaryCtaHref: '/cv',
          badgeText: 'Perbaiki CV',
          icon: Sparkles,
        };
      case 'cepat_dapat_kerja':
        return {
          title: `Siap mulai melamar, ${displayName}?`,
          subtitle: cvCount > 0
            ? 'Persiapan dasar kariermu sudah dimulai!'
            : 'Lengkapi CV dan mulai melamar',
          primaryCtaText: 'Lihat Lowongan Cocok',
          primaryCtaHref: '/scrape-jobs',
          badgeText: 'Career Setup',
          icon: Rocket,
          stats: [
            { label: 'CV', val: cvCount > 0 ? 'Siap' : 'Belum' },
            { label: 'Job Match', val: String(jobMatchCount) },
            { label: 'Lamaran', val: String(appCount) },
            { label: 'ATS Score', val: avgAtsScore > 0 ? `${avgAtsScore}%` : '-' },
          ],
        };
      default:
        return {
          title: `${greeting}, ${displayName}`,
          subtitle: priorityItems.length > 0
            ? `Berikut ${priorityItems.length} prioritas penting yang perlu kamu selesaikan:`
            : 'Dashboard kariermu siap digunakan',
          primaryCtaText: priorityItems.length > 0 ? 'Mulai Dari Prioritas Utama' : 'Jelajahi Fitur',
          primaryCtaHref: priorityItems.length > 0 ? priorityItems[0]?.href || '/cv' : '/cv',
          badgeText: 'Action Center',
          icon: Sparkles,
        };
    }
  };

  const heroContent = getHeroContent();

  return (
    <div className="relative overflow-hidden rounded-[10px] bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 text-white p-5 sm:p-6 shadow-xl border border-slate-800/80 transition-all">
      {/* Subtle Background Glow Decorative Element */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#1738D1]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-16 w-48 h-48 bg-[#1738D1]/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Header Sapaan & Subtitle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[10px] text-[10px] font-bold bg-[#1738D1]/20 text-orange-400 border border-[#1738D1]/30 uppercase tracking-wider">
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
                  <span key={st.label} className="px-2.5 py-1 rounded-[10px] bg-white/10 text-xs font-bold text-slate-200 border border-white/10 flex items-center gap-1.5">
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
              className="w-full sm:w-auto shrink-0 bg-[#1738D1] hover:bg-[#132EA8] active:scale-[0.98] text-white px-5 py-3 rounded-[10px] font-bold text-xs sm:text-sm shadow-lg shadow-[#1738D1]/25 transition-all flex items-center justify-center gap-2 cursor-pointer border-0"
            >
              <span>{heroContent.primaryCtaText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {heroContent.secondaryText && (
              <button
                onClick={() => router.push(heroContent.secondaryHref || '/pengaturan')}
                className="w-full sm:w-auto px-4 py-3 rounded-[10px] bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition cursor-pointer text-center"
              >
                {heroContent.secondaryText}
              </button>
            )}
          </div>
        </div>

        {/* Priority Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {isLoading ? (
            // Loading skeleton
            [1, 2, 3].map((i) => (
              <div key={i} className="bg-white/5 rounded-[10px] p-3.5 border border-white/10 space-y-3 animate-pulse">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-[10px] bg-white/10" />
                    <div className="w-16 h-4 bg-white/10 rounded-full" />
                  </div>
                  <div className="w-6 h-4 bg-white/10 rounded" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 w-full bg-white/10 rounded" />
                  <div className="h-3 w-2/3 bg-white/10 rounded" />
                </div>
              </div>
            ))
          ) : priorityItems.length === 0 ? (
            // Empty state
            <div className="col-span-3 py-6 text-center">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
              <p className="text-xs font-bold text-white">Semua terlihat baik!</p>
              <p className="text-[11px] text-slate-400 mt-1">Tidak ada prioritas mendesak saat ini</p>
            </div>
          ) : (
            priorityItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => router.push(item.href)}
                  className="group relative bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-[10px] p-3.5 border border-white/10 transition-all cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-[10px] bg-white/10 text-orange-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
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
            })
          )}
        </div>
      </div>
    </div>
  );
};
