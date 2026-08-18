'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, GraduationCap, Award, Calendar, ChevronRight, Clock, ExternalLink, X } from 'lucide-react';

export const CareerDevelopmentTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'artikel' | 'kursus' | 'sertifikasi' | 'event'>('artikel');
  const [activeModalItem, setActiveModalItem] = useState<any | null>(null);

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
          if (Array.isArray(res.data.articles)) setArticles(res.data.articles);
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
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs leading-relaxed">{desc}</p>
    </div>
  );

  const tabs = [
    { id: 'artikel', label: 'Artikel Karier', icon: BookOpen, count: articles.length },
    { id: 'kursus', label: 'Kursus & Skills', icon: GraduationCap, count: courses.length },
    { id: 'sertifikasi', label: 'Sertifikasi', icon: Award, count: certifications.length },
    { id: 'event', label: 'Event Job Fair', icon: Calendar, count: events.length },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[10px] p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors space-y-4">
      {/* Header & Tabs Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span>Pengembangan Karier & Skill</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Rekomendasi bacaan, pelatihan, sertifikasi, dan event pendukung karier
          </p>
        </div>

        {/* Tab Buttons Pill */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-[10px] overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-[10px] text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#1738D1] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Display */}
      {activeTab === 'artikel' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {articles.length === 0 && !isLoading && (
            <EmptyState
              icon={BookOpen}
              title="Belum Ada Artikel Karier"
              desc="Artikel panduan karier akan muncul di sini setelah tim Employr mempublikasikannya."
            />
          )}
          {articles.map((art) => (
            <div
              key={art.id}
              onClick={() => setActiveModalItem(art)}
              className="p-4 rounded-[10px] border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition cursor-pointer flex flex-col justify-between group space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-bold bg-orange-50 text-orange-700 dark:bg-orange-950/80 dark:text-orange-300 border border-orange-200 dark:border-orange-800/60">
                    {art.category}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {art.readTime}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-orange-500 dark:group-hover:text-orange-400 transition line-clamp-2">
                  {art.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mt-1">
                  {art.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-orange-600 dark:text-orange-400">
                <span>Baca Panduan</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'kursus' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {courses.length === 0 && !isLoading && (
            <EmptyState
              icon={GraduationCap}
              title="Belum Ada Kursus & Skills"
              desc="Rekomendasi kursus dan pelatihan akan muncul di sini setelah tim Employr menambahkannya."
            />
          )}
          {courses.map((crs) => (
            <a
              key={crs.id}
              href={crs.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-[10px] border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition cursor-pointer flex flex-col justify-between group space-y-3 no-underline"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {crs.price}
                  </span>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                    {crs.rating}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition line-clamp-2">
                  {crs.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Oleh: {crs.provider} ({crs.level})
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <span>Lihat Kursus</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </a>
          ))}
        </div>
      )}

      {activeTab === 'sertifikasi' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {certifications.length === 0 && !isLoading && (
            <EmptyState
              icon={Award}
              title="Belum Ada Sertifikasi"
              desc="Daftar sertifikasi resmi dan internasional akan muncul di sini setelah tim Employr menambahkannya."
            />
          )}
          {certifications.map((cert) => (
            <a
              key={cert.id}
              href={cert.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-[10px] border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition cursor-pointer flex flex-col justify-between group space-y-3 no-underline"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    {cert.badge}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Masa berlaku: {cert.validity}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition line-clamp-2">
                  {cert.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Penyelenggara: {cert.issuer}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-amber-600 dark:text-amber-400">
                <span>Info Sertifikasi</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </a>
          ))}
        </div>
      )}

      {activeTab === 'event' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {events.length === 0 && !isLoading && (
            <EmptyState
              icon={Calendar}
              title="Belum Ada Event & Job Fair"
              desc="Event job fair, webinar, dan workshop akan muncul di sini setelah tim Employr menjadwalkannya."
            />
          )}
          {events.map((ev) => (
            <a
              key={ev.id}
              href={ev.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-[10px] border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition cursor-pointer flex flex-col justify-between group space-y-3 no-underline"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-bold bg-blue-100 text-navy-800 dark:bg-blue-950 dark:text-blue-300">
                    {ev.badge}
                  </span>
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    {ev.location}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-blue-400 transition line-clamp-2">
                  {ev.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {ev.date}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-blue-600 dark:text-blue-400">
                <span>Daftar Event</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Modal detail for Article tab */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg p-6 relative">
            <button
              onClick={() => setActiveModalItem(null)}
              className="absolute top-4 right-4 p-1.5 rounded-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="px-2.5 py-0.5 rounded-[10px] text-xs font-bold bg-orange-50 text-orange-700 dark:bg-orange-950/80 dark:text-orange-300 border border-orange-200 dark:border-orange-800/60">
              {activeModalItem.category}
            </span>

            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-2">
              {activeModalItem.title}
            </h3>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-[10px] border border-slate-200/80 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 leading-relaxed my-4 space-y-2">
              <p className="font-semibold">{activeModalItem.desc}</p>
              <p>{activeModalItem.content}</p>
            </div>

            <button
              onClick={() => setActiveModalItem(null)}
              className="w-full py-2.5 rounded-[10px] bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer border-0"
            >
              Tutup Panduan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
