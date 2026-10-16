'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpenIcon,
  GraduationCapIcon,
  AwardIcon,
  CalendarIcon,
  ClockIcon,
  ExternalLinkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronRightIcon,
} from '@/components/icons/CustomIcons';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { getLokerUrl } from '@/lib/urls';

const PORTAL_URL = getLokerUrl();

const cleanText = (str: string = '') =>
  str
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '-')
    .replace(/&#8212;/g, '—')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&hellip;/g, '...')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const CareerDevelopmentTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'artikel' | 'kursus' | 'sertifikasi' | 'event'>('artikel');
  const [isExpandedMobile, setIsExpandedMobile] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<{
    item: any;
    type: 'artikel' | 'kursus' | 'sertifikasi' | 'event';
    url: string;
  } | null>(null);

  // Data murni dari database via /api/career — tanpa fallback hardcoded.
  const [articles, setArticles] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/career')
      .then((r) => r.json())
      .then((res) => {
        if (res?.success && res.data) {
          if (Array.isArray(res.data.articles)) {
            setArticles(
              res.data.articles.filter((a: any) => {
                const title = (a.title || '').toLowerCase();
                return (
                  !title.includes('hire employees') &&
                  !title.includes('pasang lowongan') &&
                  !title.includes('perekrut') &&
                  !title.includes('akun perusahaan') &&
                  !title.includes('rekrutmen') &&
                  !title.includes('dipahami hr') &&
                  !title.includes('employers')
                );
              })
            );
          }
          if (Array.isArray(res.data.courses)) setCourses(res.data.courses);
          if (Array.isArray(res.data.certifications)) setCertifications(res.data.certifications);
          if (Array.isArray(res.data.events)) setEvents(res.data.events);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const EmptyState = ({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) => (
    <div className="col-span-full flex flex-col items-center justify-center text-center py-12 px-6 rounded-[10px] border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/30">
      <div className="w-12 h-12 rounded-[10px] bg-[#1F3578]/10 dark:bg-blue-950 text-[#1F3578] dark:text-blue-400 flex items-center justify-center mb-3">
        <Icon size={24} />
      </div>
      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs leading-relaxed">{desc}</p>
    </div>
  );

  const tabs = [
    { id: 'artikel', label: 'Artikel Karier', icon: BookOpenIcon, count: articles.length },
    { id: 'kursus', label: 'Kursus & Skills', icon: GraduationCapIcon, count: courses.length },
    { id: 'sertifikasi', label: 'Sertifikasi', icon: AwardIcon, count: certifications.length },
    { id: 'event', label: 'Event Job Fair', icon: CalendarIcon, count: events.length },
  ];

  const MobileExpandAction = ({
    totalCount,
    itemLabel,
    portalUrl,
    accentClass,
  }: {
    totalCount: number;
    itemLabel: string;
    portalUrl: string;
    accentClass: string;
  }) => {
    if (totalCount <= 3) return null;

    return (
      <div className="pt-1 flex items-center justify-between gap-2 md:hidden">
        <button
          type="button"
          onClick={() => setIsExpandedMobile((prev) => !prev)}
          aria-expanded={isExpandedMobile}
          className="flex-1 py-2 px-3 rounded-[10px] bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 cursor-pointer"
        >
          {isExpandedMobile ? (
            <>
              <ChevronUpIcon size={14} />
              <span>Tampilkan 3 Saja</span>
            </>
          ) : (
            <>
              <ChevronDownIcon size={14} />
              <span>Tampilkan {totalCount - 3} {itemLabel} Lainnya</span>
            </>
          )}
        </button>
        <a
          href={portalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`py-2 px-3 rounded-[10px] text-xs font-bold border transition flex items-center justify-center gap-1 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 no-underline ${accentClass}`}
        >
          <span>Buka Portal</span>
          <ExternalLinkIcon size={13} />
          <span className="sr-only">(buka di tab baru)</span>
        </a>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[10px] p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors space-y-3 w-full min-w-0 overflow-hidden">
      {/* Header & Tabs Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800 min-w-0">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-[8px] bg-orange-50 dark:bg-orange-950/80 text-orange-700 dark:text-orange-400 flex items-center justify-center border border-orange-100 dark:border-orange-900/50 shrink-0 mt-0.5">
            <GraduationCapIcon size={14} />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>Pengembangan Karier &amp; Skill</span>
            </h3>
            <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5">
              Rekomendasi bacaan, pelatihan, sertifikasi, dan event pendukung karier
            </p>
          </div>
        </div>

        {/* Tab Buttons (Responsive Horizontal Scroll on Mobile, Auto-width on Desktop) */}
        <div className="w-full sm:w-auto min-w-0 overflow-x-auto no-scrollbar py-0.5">
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value as typeof activeTab);
              setIsExpandedMobile(false);
              setSelectedDetail(null);
            }}
          >
            <TabsList variant="pill" className="w-max sm:w-auto inline-flex gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger key={tab.id} value={tab.id} size="sm" className="shrink-0 px-3 py-1.5 h-8 gap-1.5 text-xs">
                    <Icon size={14} className="shrink-0" />
                    <span>{tab.label}</span>
                    <span className="ml-1 rounded-full bg-current/10 px-1.5 py-0.5 text-caption font-semibold shrink-0">{tab.count}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Tab Content Display */}
      {activeTab === 'artikel' && (
        <div className="space-y-3 min-w-0">
          <div
            role="tabpanel"
            id="tabpanel-artikel"
            aria-labelledby="tab-artikel"
            className="grid grid-cols-1 md:grid-cols-3 gap-3.5 min-w-0"
          >
            {articles.length === 0 && !isLoading && (
              <EmptyState
                icon={BookOpenIcon}
                title="Belum Ada Artikel Karier"
                desc="Artikel panduan karier akan muncul di sini setelah tim Employr mempublikasikannya."
              />
            )}
            {articles.map((art, idx) => {
              const articleUrl = art.slug
                ? `${PORTAL_URL}/career/${art.slug}`
                : art.externalUrl || `${PORTAL_URL}/career`;
              const isHiddenOnMobile = idx >= 3 && !isExpandedMobile;

              return (
                <a
                  key={art.id}
                  href={articleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (typeof window !== 'undefined' && window.innerWidth < 768) {
                      e.preventDefault();
                      setSelectedDetail({ item: art, type: 'artikel', url: articleUrl });
                    }
                  }}
                  aria-label={`Baca artikel ${art.title} (buka di tab baru)`}
                  className={`p-4 rounded-[10px] border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition cursor-pointer flex-col justify-between group space-y-3 no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 min-w-0 ${
                    isHiddenOnMobile ? 'hidden md:flex' : 'flex'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2 min-w-0">
                      <span className="px-2 py-0.5 rounded-[10px] text-caption font-bold bg-orange-50 text-orange-700 dark:bg-orange-950/80 dark:text-orange-300 border border-orange-200 dark:border-orange-800/60 truncate">
                        {art.category}
                      </span>
                      <span className="text-caption text-slate-500 dark:text-slate-400 flex items-center gap-1 shrink-0">
                        <ClockIcon size={12} />
                        {art.readTime}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-orange-500 dark:group-hover:text-orange-400 transition line-clamp-2 break-words">
                      {cleanText(art.title)}
                    </h4>
                    <p className="text-caption text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mt-1 break-words">
                      {cleanText(art.desc)}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-caption font-bold text-orange-700 dark:text-orange-400">
                    <span className="md:hidden">Lihat Detail &amp; Kriteria</span>
                    <span className="hidden md:inline">Baca Panduan</span>
                    <ExternalLinkIcon size={14} className="hidden md:inline" />
                    <ChevronRightIcon size={14} className="md:hidden" />
                    <span className="sr-only">(buka rincian)</span>
                  </div>
                </a>
              );
            })}
          </div>
          <MobileExpandAction
            totalCount={articles.length}
            itemLabel="Artikel"
            portalUrl={`${PORTAL_URL}/career`}
            accentClass="bg-orange-50 text-orange-700 dark:bg-orange-950/80 dark:text-orange-300 border-orange-200 dark:border-orange-800/60 hover:bg-orange-100"
          />
        </div>
      )}

      {activeTab === 'kursus' && (
        <div className="space-y-3 min-w-0">
          <div
            role="tabpanel"
            id="tabpanel-kursus"
            aria-labelledby="tab-kursus"
            className="grid grid-cols-1 md:grid-cols-3 gap-3.5 min-w-0"
          >
            {courses.length === 0 && !isLoading && (
              <EmptyState
                icon={GraduationCapIcon}
                title="Belum Ada Kursus & Skills"
                desc="Rekomendasi kursus dan pelatihan akan muncul di sini setelah tim Employr menambahkannya."
              />
            )}
            {courses.map((crs, idx) => {
              const isHiddenOnMobile = idx >= 3 && !isExpandedMobile;

              return (
                <a
                  key={crs.id}
                  href={crs.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (typeof window !== 'undefined' && window.innerWidth < 768) {
                      e.preventDefault();
                      setSelectedDetail({ item: crs, type: 'kursus', url: crs.url });
                    }
                  }}
                  aria-label={`Lihat kursus ${crs.title} oleh ${crs.provider} (buka di tab baru)`}
                  className={`p-4 rounded-[10px] border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition cursor-pointer flex-col justify-between group space-y-3 no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 min-w-0 ${
                    isHiddenOnMobile ? 'hidden md:flex' : 'flex'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2 min-w-0">
                      <span className="px-2 py-0.5 rounded-[10px] text-caption font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                        {crs.price}
                      </span>
                      <span className="text-caption font-bold text-amber-700 dark:text-amber-400 shrink-0">
                        {crs.rating}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition line-clamp-2 break-words">
                      {cleanText(crs.title)}
                    </h4>
                    <p className="text-caption text-slate-500 dark:text-slate-400 mt-1 truncate">
                      Oleh: {cleanText(crs.provider)} ({crs.level})
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-caption font-bold text-emerald-700 dark:text-emerald-400">
                    <span className="md:hidden">Lihat Silabus &amp; Detail</span>
                    <span className="hidden md:inline">Lihat Kursus</span>
                    <ExternalLinkIcon size={14} className="hidden md:inline" />
                    <ChevronRightIcon size={14} className="md:hidden" />
                    <span className="sr-only">(buka rincian)</span>
                  </div>
                </a>
              );
            })}
          </div>
          <MobileExpandAction
            totalCount={courses.length}
            itemLabel="Kursus"
            portalUrl={`${PORTAL_URL}/course`}
            accentClass="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100"
          />
        </div>
      )}

      {activeTab === 'sertifikasi' && (
        <div className="space-y-3 min-w-0">
          <div
            role="tabpanel"
            id="tabpanel-sertifikasi"
            aria-labelledby="tab-sertifikasi"
            className="grid grid-cols-1 md:grid-cols-3 gap-3.5 min-w-0"
          >
            {certifications.length === 0 && !isLoading && (
              <EmptyState
                icon={AwardIcon}
                title="Belum Ada Sertifikasi"
                desc="Daftar sertifikasi resmi dan internasional akan muncul di sini setelah tim Employr menambahkannya."
              />
            )}
            {certifications.map((cert, idx) => {
              const isHiddenOnMobile = idx >= 3 && !isExpandedMobile;

              return (
                <a
                  key={cert.id}
                  href={cert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (typeof window !== 'undefined' && window.innerWidth < 768) {
                      e.preventDefault();
                      setSelectedDetail({ item: cert, type: 'sertifikasi', url: cert.url });
                    }
                  }}
                  aria-label={`Info sertifikasi ${cert.title} dari ${cert.issuer} (buka di tab baru)`}
                  className={`p-4 rounded-[10px] border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition cursor-pointer flex-col justify-between group space-y-3 no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 min-w-0 ${
                    isHiddenOnMobile ? 'hidden md:flex' : 'flex'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2 min-w-0">
                      <span className="px-2 py-0.5 rounded-[10px] text-caption font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 shrink-0">
                        {cert.badge}
                      </span>
                      <span className="text-caption text-slate-500 dark:text-slate-400 truncate text-right">
                        Masa berlaku: {cert.validity}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition line-clamp-2 break-words">
                      {cleanText(cert.title)}
                    </h4>
                    <p className="text-caption text-slate-500 dark:text-slate-400 mt-1 truncate">
                      Penyelenggara: {cleanText(cert.issuer)}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-caption font-bold text-amber-700 dark:text-amber-400">
                    <span className="md:hidden">Lihat Syarat &amp; Info</span>
                    <span className="hidden md:inline">Info Sertifikasi</span>
                    <ExternalLinkIcon size={14} className="hidden md:inline" />
                    <ChevronRightIcon size={14} className="md:hidden" />
                    <span className="sr-only">(buka rincian)</span>
                  </div>
                </a>
              );
            })}
          </div>
          <MobileExpandAction
            totalCount={certifications.length}
            itemLabel="Sertifikasi"
            portalUrl={`${PORTAL_URL}/sertifikasi`}
            accentClass="bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800/60 hover:bg-amber-100"
          />
        </div>
      )}

      {activeTab === 'event' && (
        <div className="space-y-3 min-w-0">
          <div
            role="tabpanel"
            id="tabpanel-event"
            aria-labelledby="tab-event"
            className="grid grid-cols-1 md:grid-cols-3 gap-3.5 min-w-0"
          >
            {events.length === 0 && !isLoading && (
              <EmptyState
                icon={CalendarIcon}
                title="Belum Ada Event & Job Fair"
                desc="Event job fair, webinar, dan workshop akan muncul di sini setelah tim Employr menjadwalkannya."
              />
            )}
            {events.map((ev, idx) => {
              const isHiddenOnMobile = idx >= 3 && !isExpandedMobile;

              return (
                <a
                  key={ev.id}
                  href={ev.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (typeof window !== 'undefined' && window.innerWidth < 768) {
                      e.preventDefault();
                      setSelectedDetail({ item: ev, type: 'event', url: ev.url });
                    }
                  }}
                  aria-label={`Daftar event ${ev.title} di ${ev.location} (buka di tab baru)`}
                  className={`p-4 rounded-[10px] border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition cursor-pointer flex-col justify-between group space-y-3 no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 min-w-0 ${
                    isHiddenOnMobile ? 'hidden md:flex' : 'flex'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2 min-w-0">
                      <span className="px-2 py-0.5 rounded-[10px] text-caption font-bold bg-blue-100 text-navy-800 dark:bg-blue-950 dark:text-blue-300 shrink-0">
                        {ev.badge}
                      </span>
                      <span className="text-caption font-medium text-slate-500 dark:text-slate-400 truncate text-right">
                        {cleanText(ev.location)}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-blue-400 transition line-clamp-2 break-words">
                      {cleanText(ev.title)}
                    </h4>
                    <p className="text-caption text-slate-500 dark:text-slate-400 mt-1 truncate">
                      {cleanText(ev.date)}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-caption font-bold text-blue-600 dark:text-blue-400">
                    <span className="md:hidden">Lihat Jadwal &amp; Info</span>
                    <span className="hidden md:inline">Daftar Event</span>
                    <ExternalLinkIcon size={14} className="hidden md:inline" />
                    <ChevronRightIcon size={14} className="md:hidden" />
                    <span className="sr-only">(buka rincian)</span>
                  </div>
                </a>
              );
            })}
          </div>
          <MobileExpandAction
            totalCount={events.length}
            itemLabel="Event"
            portalUrl={`${PORTAL_URL}/event`}
            accentClass="bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800/60 hover:bg-blue-100"
          />
        </div>
      )}

      {/* Mobile Bottom Sheet for Detail & Kriteria */}
      <Sheet
        open={Boolean(selectedDetail)}
        onOpenChange={(open) => {
          if (!open) setSelectedDetail(null);
        }}
      >
        <SheetContent
          side="bottom"
          className="max-h-[85dvh] rounded-t-[20px] p-0 flex flex-col justify-between overflow-hidden border-t border-slate-200 dark:border-slate-800 shadow-2xl"
        >
          {/* Visual Drag Handle for Mobile */}
          <div className="w-full pt-3 pb-1 flex justify-center bg-slate-50/50 dark:bg-slate-800/30 shrink-0">
            <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
          </div>

          {selectedDetail && (
            <>
              <SheetHeader className="p-4 sm:p-5 pt-1 border-b border-slate-100 dark:border-slate-800 text-left">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  {selectedDetail.type === 'artikel' && (
                    <>
                      <span className="px-2 py-0.5 rounded-[10px] text-caption font-bold bg-orange-50 text-orange-700 dark:bg-orange-950/80 dark:text-orange-300 border border-orange-200 dark:border-orange-800/60">
                        {selectedDetail.item.category}
                      </span>
                      <span className="text-caption text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <ClockIcon size={12} />
                        {selectedDetail.item.readTime}
                      </span>
                    </>
                  )}
                  {selectedDetail.type === 'kursus' && (
                    <>
                      <span className="px-2 py-0.5 rounded-[10px] text-caption font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {selectedDetail.item.price}
                      </span>
                      <span className="text-caption font-bold text-amber-700 dark:text-amber-400">
                        {selectedDetail.item.rating}
                      </span>
                      <span className="text-caption text-slate-500 dark:text-slate-400">
                        Level: {selectedDetail.item.level}
                      </span>
                    </>
                  )}
                  {selectedDetail.type === 'sertifikasi' && (
                    <>
                      <span className="px-2 py-0.5 rounded-[10px] text-caption font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        {selectedDetail.item.badge}
                      </span>
                      <span className="text-caption text-slate-500 dark:text-slate-400">
                        Masa berlaku: {selectedDetail.item.validity}
                      </span>
                    </>
                  )}
                  {selectedDetail.type === 'event' && (
                    <>
                      <span className="px-2 py-0.5 rounded-[10px] text-caption font-bold bg-blue-100 text-navy-800 dark:bg-blue-950 dark:text-blue-300">
                        {selectedDetail.item.badge}
                      </span>
                      <span className="text-caption text-slate-500 dark:text-slate-400">
                        {selectedDetail.item.date}
                      </span>
                    </>
                  )}
                </div>
                <SheetTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug pr-6">
                  {cleanText(selectedDetail.item.title)}
                </SheetTitle>
              </SheetHeader>

              <SheetBody className="p-4 sm:p-5 space-y-4 overflow-y-auto">
                {/* Info Metrik / Penyelenggara */}
                <div className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 text-xs space-y-1.5">
                  {selectedDetail.type === 'artikel' && (
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                      <span className="text-slate-400">Penulis:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {selectedDetail.item.author || 'Tim Employr'}
                      </span>
                    </div>
                  )}
                  {selectedDetail.type === 'kursus' && (
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                      <span className="text-slate-400">Instruktur / Platform:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {selectedDetail.item.provider}
                      </span>
                    </div>
                  )}
                  {selectedDetail.type === 'sertifikasi' && (
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                      <span className="text-slate-400">Lembaga Sertifikasi:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {selectedDetail.item.issuer}
                      </span>
                    </div>
                  )}
                  {selectedDetail.type === 'event' && (
                    <>
                      <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                        <span className="text-slate-400">Penyelenggara:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {selectedDetail.item.organizer}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                        <span className="text-slate-400">Lokasi / Format:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {selectedDetail.item.location}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Ringkasan & Kriteria Pembelajaran */}
                <div className="space-y-1.5">
                  <h4 className="text-caption font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    {selectedDetail.type === 'artikel'
                      ? 'Ringkasan Panduan'
                      : selectedDetail.type === 'kursus'
                      ? 'Kriteria & Silabus Singkat'
                      : selectedDetail.type === 'sertifikasi'
                      ? 'Kriteria & Kompetensi Diuji'
                      : 'Detail Agenda & Ketentuan'}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {cleanText(selectedDetail.item.desc || selectedDetail.item.content)}
                  </p>
                </div>
              </SheetBody>

              <SheetFooter className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 flex flex-row items-center justify-end gap-2 shrink-0">
                <a
                  href={selectedDetail.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 px-4 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-bold text-xs shadow-md shadow-[#1738D1]/20 flex items-center gap-1.5 no-underline cursor-pointer active:scale-[0.98] transition"
                >
                  <span>
                    {selectedDetail.type === 'artikel'
                      ? 'Baca Artikel Lengkap'
                      : selectedDetail.type === 'kursus'
                      ? 'Buka Kelas Kursus'
                      : selectedDetail.type === 'sertifikasi'
                      ? 'Info Pendaftaran'
                      : 'Daftar Event'}
                  </span>
                  <ExternalLinkIcon size={13} />
                </a>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};
