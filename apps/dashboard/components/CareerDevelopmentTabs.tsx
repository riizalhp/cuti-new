'use client';

import React, { useState } from 'react';
import { BookOpen, GraduationCap, Award, Calendar, ChevronRight, Clock, ExternalLink, X } from 'lucide-react';

export const CareerDevelopmentTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'artikel' | 'kursus' | 'sertifikasi' | 'event'>('artikel');
  const [activeModalItem, setActiveModalItem] = useState<any | null>(null);

  const articles = [
    {
      id: 'a1',
      title: 'Cara Membuat CV ATS Friendly yang Lolos Screening HR',
      category: 'Optimasi CV',
      readTime: '4 min baca',
      desc: 'Pelajari struktur penulisan, kata kunci penting, dan format file terbaik agar CV kamu dibaca sempurna oleh software rekrutmen ATS.',
      content: 'Sistem ATS memfilter ribuan CV berdasarkan kata kunci. Gunakan font standar, hindari grafik kompleks, serta cantumkan kata kunci yang tertera di syarat pekerjaan.',
    },
    {
      id: 'a2',
      title: '20 Pertanyaan Interview Tersering & Cara Menjawabnya',
      category: 'Persiapan Interview',
      readTime: '6 min baca',
      desc: 'Panduan menjawab pertanyaan "Ceritakan tentang diri Anda" hingga strategi menjawab pertanyaan tentang kelemahan dengan metode STAR.',
      content: 'Gunakan teknik STAR (Situation, Task, Action, Result). Jelaskan situasi yang pernah dialami, tugas yang diemban, serta hasil terukur.',
    },
    {
      id: 'a3',
      title: 'Panduan Lengkap Cara Melamar Kerja via Email & WA',
      category: 'Strategi Melamar',
      readTime: '3 min baca',
      desc: 'Etika, penulisan subject email, serta draf kalimat pengantar yang sopan untuk menarik perhatian recruiter.',
      content: 'Selalu gunakan email profesional. Gunakan subject yang jelas seperti "Lamaran Pekerjaan - [Posisi] - [Nama]".',
    },
  ];

  const courses = [
    {
      id: 'c1',
      title: 'Masterclass Excel & Data Analysis untuk HR/Admin',
      provider: 'RuangKerja Academy',
      level: 'Pemula s/d Menengah',
      price: 'Gratis',
      rating: 'Rating 4.9',
      desc: 'Kuasai VLOOKUP, Pivot Table, dan visualisasi data dasar untuk meningkatkan efisiensi kerja admin & HR.',
      url: 'https://loker.cuti.online',
    },
    {
      id: 'c2',
      title: 'Dasar Pemrograman Web Frontend dengan React & Next.js',
      provider: 'Dibimbing.id',
      level: 'Pemula',
      price: 'Bersertifikat',
      rating: 'Rating 4.8',
      desc: 'Belajar HTML, CSS, JavaScript Modern, dan React dari nol hingga siap membangun portfolio web.',
      url: 'https://loker.cuti.online',
    },
    {
      id: 'c3',
      title: 'Digital Marketing Essentials & Social Media Campaign',
      provider: 'RevoU Mini Course',
      level: 'Semua Tingkat',
      price: 'Gratis',
      rating: 'Rating 4.9',
      desc: 'Pahami dasar Copywriting, Meta Ads, Google Analytics, dan strategi campaign sosial media.',
      url: 'https://loker.cuti.online',
    },
  ];

  const certifications = [
    {
      id: 's1',
      title: 'Sertifikasi Nasional BNSP - Administrative Assistant',
      issuer: 'LSP Administrasi Perkantoran',
      validity: '3 Tahun',
      badge: 'Resmi BNSP',
      desc: 'Pengakuan kompetensi nasional di bidang administrasi dan pengelolaan dokumen kantor.',
      url: 'https://loker.cuti.online',
    },
    {
      id: 's2',
      title: 'Google Digital Marketing & E-Commerce Certificate',
      issuer: 'Google via Coursera',
      validity: 'Selamanya',
      badge: 'Global Credential',
      desc: 'Sertifikasi resmi Google untuk profesi digital marketer & e-commerce specialist.',
      url: 'https://loker.cuti.online',
    },
    {
      id: 's3',
      title: 'TOEIC Official English Proficiency Certificate',
      issuer: 'ETS Global',
      validity: '2 Tahun',
      badge: 'Internasional',
      desc: 'Standar pengujian kemahiran bahasa Inggris internasional untuk kebutuhan dunia kerja modern.',
      url: 'https://loker.cuti.online',
    },
  ];

  const events = [
    {
      id: 'e1',
      title: 'National Virtual Job Fair 2026 - 500+ Lowongan',
      organizer: 'Kemenaker x CUTI',
      date: '15-18 Agustus 2026',
      location: 'Online via Zoom & Portal',
      badge: 'Job Fair',
      desc: 'Pertemuan langsung fresh graduate dan profesional muda dengan 50+ BUMN & perusahaan multinasional.',
      url: 'https://loker.cuti.online',
    },
    {
      id: 'e2',
      title: 'Webinar: Rahasia Menembus Management Trainee BUMN',
      organizer: 'AmbilCUTI Career Club',
      date: 'Sabtu, 12 Agustus 2026 (19:00 WIB)',
      location: 'Live Google Meet',
      badge: 'Webinar',
      desc: 'Bedah tuntas tahapan seleksi berkas, online test, FGD, hingga interview user bersama praktisi MT.',
      url: 'https://loker.cuti.online',
    },
    {
      id: 'e3',
      title: 'Workshop Interactive CV Clinic & Mock Interview Direct Review',
      organizer: 'HR Community Indonesia',
      date: 'Minggu, 20 Agustus 2026',
      location: 'Jakarta Selatan & Online',
      badge: 'Workshop',
      desc: 'Sesi konsultasi 1-on-1 bersama HR Manager untuk memperbaiki CV dan simulasi wawancara kerja.',
      url: 'https://loker.cuti.online',
    },
  ];

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
                    ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-xs'
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
          {articles.map((art) => (
            <div
              key={art.id}
              onClick={() => setActiveModalItem(art)}
              className="p-4 rounded-[10px] border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition cursor-pointer flex flex-col justify-between group space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300">
                    {art.category}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {art.readTime}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition line-clamp-2">
                  {art.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mt-1">
                  {art.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-violet-600 dark:text-violet-400">
                <span>Baca Panduan</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'kursus' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
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
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
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
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
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
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    {ev.badge}
                  </span>
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    {ev.location}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition line-clamp-2">
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

            <span className="px-2.5 py-0.5 rounded-[10px] text-xs font-bold bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300">
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
              className="w-full py-2.5 rounded-[10px] bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition cursor-pointer border-0"
            >
              Tutup Panduan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
