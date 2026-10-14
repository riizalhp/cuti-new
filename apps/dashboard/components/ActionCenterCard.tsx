'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { userApi, cvApi, trackerApi, scheduleApi, jobsApi } from '@/lib/api';
import { getStoredSession } from '@/lib/auth';
import {
  CalendarIcon,
  FileCheckIcon,
  TargetIcon,
  FileTextIcon,
  CheckCircleIcon,
  SearchIcon,
} from '@/components/icons/CustomIcons';
import { Button } from '@/components/ui/button';
import { getLokerUrl } from '@/lib/urls';

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
  const [mobileSlide, setMobileSlide] = useState(0);
  const [isSliderPaused, setIsSliderPaused] = useState(false);

  // Auto-slide 1 kartu prioritas di layar mobile setiap 4.5 detik (pause saat sentuh/hover)
  useEffect(() => {
    if (priorityItems.length <= 1 || isSliderPaused) return;
    const interval = setInterval(() => {
      setMobileSlide((prev) => (prev + 1) % priorityItems.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [priorityItems.length, isSliderPaused]);

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

    const session = getStoredSession();
    if (session) {
      if ((session as any).intent) {
        setUserIntent((session as any).intent);
      }
      if (session.name) {
        setDisplayName(session.name.split(' ')[0]);
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
            icon: CalendarIcon,
            actionText: 'Lihat Jadwal',
            href: '/tracker',
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
            badgeColor: 'bg-cobalt-500/20 text-orange-300 border-cobalt-500/30',
            icon: FileCheckIcon,
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
          icon: FileTextIcon,
          actionText: 'Buat CV',
          href: '/cv',
          urgency: 9,
        });
      }

      // 3. Job matches
      if (Array.isArray(jobs) && jobs.length > 0) {
        items.push({
          id: 'jobs-match',
          title: `${jobs.length} loker cocok dengan profilmu`,
          time: 'Berdasarkan skill & pengalaman',
          badge: 'Rekomendasi',
          badgeColor: 'bg-cobalt-500/20 text-orange-300 border-cobalt-500/30',
          icon: TargetIcon,
          actionText: 'Lihat Loker',
          href: getLokerUrl(),
          urgency: 3,
        });
      } else {
        items.push({
          id: 'jobs-explore',
          title: 'Jelajahi loker terbaru',
          time: 'Cari yang sesuai profilmu',
          badge: 'Eksplorasi',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          icon: SearchIcon,
          actionText: 'Cari Loker',
          href: getLokerUrl(),
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
            icon: CheckCircleIcon,
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
            ? `${jobMatchCount} loker yang cocok untukmu`
            : 'Temukan loker yang cocok dengan profilmu',
          primaryCtaText: 'Cari Loker',
          primaryCtaHref: getLokerUrl(),
          secondaryText: 'Lengkapi profil',
          secondaryHref: '/profil',
          badgeText: 'Cari Kerja',
          icon: SearchIcon,
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
          icon: FileTextIcon,
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
          icon: FileCheckIcon,
        };
      case 'cepat_dapat_kerja':
        return {
          title: `Siap mulai melamar, ${displayName}?`,
          subtitle: cvCount > 0
            ? 'Persiapan dasar kariermu sudah dimulai!'
            : 'Lengkapi CV dan mulai melamar',
          primaryCtaText: 'Lihat Loker Cocok',
          primaryCtaHref: getLokerUrl(),
          badgeText: 'Persiapan Kerja',
          icon: TargetIcon,
          stats: [
            { label: 'CV', val: cvCount > 0 ? 'Siap' : 'Belum' },
            { label: 'Loker Cocok', val: String(jobMatchCount) },
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
          badgeText: 'Aktivitas Utama',
          icon: TargetIcon,
        };
    }
  };

  const heroContent = getHeroContent();
  const HeroIcon = heroContent.icon;

  return (
    <div className="relative overflow-hidden rounded-[10px] bg-[#162758] border border-[#20367A] text-white p-3 sm:p-4 lg:p-4.5 shadow-xs transition-all">
      <div className="relative z-10 space-y-2 sm:space-y-3">
        {/* Header Sapaan & Subtitle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] sm:rounded-[10px] text-[10px] font-bold bg-white/10 text-blue-200 border border-white/15 uppercase tracking-wider">
                {heroContent.badgeText}
              </span>
            </div>

            <h2 className="text-sm sm:text-base md:text-lg font-extrabold tracking-tight text-white">
              {heroContent.title}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 font-medium line-clamp-1 sm:line-clamp-none">
              {heroContent.subtitle}
            </p>

            {/* Quick Stats Grid if Cepat Dapat Kerja */}
            {heroContent.stats && (
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {heroContent.stats.map((st) => (
                  <span key={st.label} className="px-2 py-0.5 rounded-[8px] bg-white/10 text-caption font-bold text-slate-200 border border-white/15 shadow-2xs flex items-center gap-1.5">
                    <span className="text-slate-500 font-normal dark:text-slate-400">{st.label}:</span>
                    <span className="text-orange-400 font-black">{st.val}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Secondary Action if any */}
          {heroContent.secondaryText && (
            <div className="flex items-center shrink-0 md:ml-auto">
              <Button
                variant="subtle"
                size="md"
                onClick={() => router.push(heroContent.secondaryHref || '/pengaturan')}
                className="w-full sm:w-auto justify-center min-h-[36px]"
              >
                {heroContent.secondaryText}
              </Button>
            </div>
          )}
        </div>

        {/* Priority Action Cards (Mobile: 1 Compact Card Auto Slider | Desktop: 3 Cards Grid) */}
        <div className="pt-0.5 sm:pt-1">
          {isLoading ? (
            <>
              {/* Mobile Skeleton (1 Compact Card) */}
              <div className="md:hidden bg-white/10 rounded-[10px] p-2.5 border border-white/15 flex items-center justify-between gap-3 animate-pulse motion-reduce:animate-none">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-[8px] bg-white/15 shrink-0" />
                  <div className="space-y-1">
                    <div className="h-3 w-28 bg-white/15 rounded-[6px]" />
                    <div className="h-2 w-16 bg-white/15 rounded-[6px]" />
                  </div>
                </div>
                <div className="w-14 h-3 bg-white/15 rounded-[6px] shrink-0" />
              </div>

              {/* Desktop Skeleton (3 Cards Grid) */}
              <div className="hidden md:grid md:grid-cols-3 gap-2.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white/10 rounded-[10px] p-2.5 sm:p-3 border border-white/15 space-y-2 animate-pulse motion-reduce:animate-none">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-[8px] bg-white/15" />
                        <div className="w-14 h-3.5 bg-white/15 rounded-[8px]" />
                      </div>
                      <div className="w-5 h-3.5 bg-white/15 rounded-[8px]" />
                    </div>
                    <div className="space-y-1">
                      <div className="h-2.5 w-full bg-white/15 rounded-[8px]" />
                      <div className="h-2.5 w-2/3 bg-white/15 rounded-[8px]" />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : priorityItems.length === 0 ? (
            // Empty state
            <div className="py-2.5 text-center">
              <CheckCircleIcon size={20} className="mx-auto text-emerald-400 mb-1" />
              <p className="text-xs font-bold text-white">Semua prioritas terselesaikan!</p>
              <p className="text-caption text-slate-300">Tidak ada prioritas mendesak saat ini</p>
            </div>
          ) : (
            <>
              {/* MOBILE: Compact 1-Row Priority Card + Mini Controls */}
              <div
                className="md:hidden space-y-1.5"
                onMouseEnter={() => setIsSliderPaused(true)}
                onMouseLeave={() => setIsSliderPaused(false)}
                onTouchStart={() => setIsSliderPaused(true)}
                onTouchEnd={() => setIsSliderPaused(false)}
              >
                {(() => {
                  const item = priorityItems[mobileSlide % priorityItems.length];
                  if (!item) return null;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (item.href.startsWith('http')) {
                          window.open(item.href, '_blank');
                        } else {
                          router.push(item.href);
                        }
                      }}
                      className="w-full group relative text-left bg-white/10 hover:bg-white/15 active:scale-[0.99] rounded-[10px] p-2.5 border border-white/15 shadow-2xs transition-all cursor-pointer flex items-center justify-between gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#162758] min-h-[46px]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-[8px] bg-white/15 text-orange-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform font-bold">
                          <Icon size={14} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-[6px] border ${item.badgeColor}`}>
                              {item.badge}
                            </span>
                            <h4 className="text-xs font-bold text-white group-hover:text-orange-300 transition-colors truncate max-w-[170px]">
                              {item.title}
                            </h4>
                          </div>
                          <p className="text-[10px] text-slate-300 mt-0.5 truncate">
                            {item.time}
                          </p>
                        </div>
                      </div>

                      <span className="text-[11px] font-extrabold text-orange-400 group-hover:text-orange-300 shrink-0 flex items-center gap-0.5">
                        {item.actionText} &rarr;
                      </span>
                    </button>
                  );
                })()}

                {/* Mobile Slider Mini Indicator */}
                {priorityItems.length > 1 && (
                  <div className="flex items-center justify-between px-1 text-[10px] text-slate-300 font-medium">
                    <span>
                      Prioritas <span className="text-white font-bold">{(mobileSlide % priorityItems.length) + 1}</span> dari {priorityItems.length}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setMobileSlide(
                            (prev) => (prev - 1 + priorityItems.length) % priorityItems.length
                          )
                        }
                        className="p-0.5 rounded-full hover:bg-white/15 text-slate-300 hover:text-white transition cursor-pointer"
                        aria-label="Prioritas sebelumnya"
                      >
                        <ChevronLeft className="size-3" />
                      </button>

                      <div className="flex items-center gap-1">
                        {priorityItems.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setMobileSlide(idx)}
                            className={`h-1 rounded-full transition-all cursor-pointer ${
                              idx === mobileSlide % priorityItems.length
                                ? 'w-3.5 bg-orange-400'
                                : 'w-1 bg-white/30 hover:bg-white/60'
                            }`}
                            aria-label={`Pindah ke prioritas ${idx + 1}`}
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setMobileSlide((prev) => (prev + 1) % priorityItems.length)
                        }
                        className="p-0.5 rounded-full hover:bg-white/15 text-slate-300 hover:text-white transition cursor-pointer"
                        aria-label="Prioritas berikutnya"
                      >
                        <ChevronRight className="size-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* DESKTOP: 3 Cards Grid */}
              <div className="hidden md:grid md:grid-cols-3 gap-2.5">
                {priorityItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (item.href.startsWith('http')) {
                          window.open(item.href, '_blank');
                        } else {
                          router.push(item.href);
                        }
                      }}
                      className="group relative text-left bg-white/10 hover:bg-white/15 rounded-[10px] p-2.5 sm:p-3 border border-white/15 shadow-2xs transition-all cursor-pointer flex flex-col justify-between space-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#162758]"
                    >
                      <div className="flex items-start justify-between gap-2 w-full">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-[8px] bg-white/15 text-orange-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform font-bold">
                            <Icon size={14} />
                          </div>
                          <span className={`text-caption font-bold px-2 py-0.5 rounded-[8px] border ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        </div>
                      </div>

                      <div className="w-full">
                        <h4 className="text-xs font-bold text-white group-hover:text-orange-300 transition-colors line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-caption text-slate-300 mt-0.5 truncate">
                          {item.time}
                        </p>
                      </div>

                      <div className="w-full pt-1.5 flex items-center justify-between border-t border-white/10 text-caption font-bold text-orange-400 group-hover:text-orange-300">
                        <span>{item.actionText}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
