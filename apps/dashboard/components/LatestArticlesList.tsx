'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Clock,
  User,
  ChevronRight,
  X,
  FileText,
} from 'lucide-react';

export const LatestArticlesList: React.FC = () => {
  const [activeArticle, setActiveArticle] = useState<any | null>(null);

  const articles = [
    {
      id: 1,
      title: 'Cara Membuat CV ATS Friendly yang Lolos Screening HR',
      category: 'Optimasi CV',
      readTime: '4 min baca',
      author: 'Tim Karir AI',
      desc: 'Pelajari struktur penulisan, kata kunci penting, dan format file terbaik agar CV kamu dibaca sempurna oleh software rekrutmen ATS.',
      content:
        'Sistem ATS (Applicant Tracking System) memfilter ribuan CV berdasarkan kata kunci. Gunakan font standar seperti Arial atau Calibri, hindari grafik kompleks atau tabel bertingkat, serta cantumkan kata kunci yang tertera di syarat pekerjaan.',
    },
    {
      id: 2,
      title: '20 Pertanyaan Interview Tersering & Cara Menjawabnya',
      category: 'Persiapan Interview',
      readTime: '6 min baca',
      author: 'CutiCoach',
      desc: 'Panduan menjawab pertanyaan "Ceritakan tentang diri Anda" hingga strategi menjawab pertanyaan tentang kelemahan dengan metode STAR.',
      content:
        'Gunakan teknik STAR (Situation, Task, Action, Result). Jelaskan situasi yang pernah dialami, tugas yang diemban, tindakan nyata yang diambil, serta hasil terukur yang berhasil diraih.',
    },
    {
      id: 3,
      title: 'Panduan Lengkap Cara Melamar Kerja via Email & WA',
      category: 'Strategi Melamar',
      readTime: '3 min baca',
      author: 'Tim Karir AI',
      desc: 'Etika, penulisan subject email, serta draf kalimat pengantar yang sopan untuk menarik perhatian recruiter.',
      content:
        'Selalu gunakan alamat email profesional (nama depan + nama belakang). Gunakan subject e-mail yang jelas seperti "Lamaran Pekerjaan - [Posisi] - [Nama]".',
    },
    {
      id: 4,
      title: 'Contoh CV Fresh Graduate Tanpa Pengalaman Kerja',
      category: 'Fresh Graduate',
      readTime: '5 min baca',
      author: 'CutiCoach',
      desc: 'Cara menyoroti pengalaman organisasi, tugas akhir, serta sertifikasi online agar tetap terlihat kompeten.',
      content:
        'Bagi lulusan baru, tekankan pada achievement akademis, proyek perkuliahan, pengalaman kepanitiaan, serta skill praktis yang dikuasai.',
    },
    {
      id: 5,
      title: 'Strategi Negosiasi Gaji Untuk Karyawan Baru',
      category: 'Gaji & Benefit',
      readTime: '5 min baca',
      author: 'Tim Karir AI',
      desc: 'Riset standar gaji industri dan teknik menyampaikan ekspektasi gaji secara profesional tanpa kehilangan penawaran.',
      content:
        'Riset standar gaji regional sesuai UMR dan rata-rata industri. Tentukan rentang angka (range), bukan harga mati, dan berikan alasan logis berbasis kompetensi.',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Artikel Pengembangan Karir Terbaru
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Panduan praktis meloloskan kamu ke dunia kerja
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {articles.map((art) => (
          <div
            key={art.id}
            onClick={() => setActiveArticle(art)}
            className="p-4 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-purple-300 dark:hover:border-purple-700 transition cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                  {art.category}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {art.readTime}
                </span>
              </div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white mb-1.5 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                {art.title}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                {art.desc}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-purple-600 dark:text-purple-400">
              <span>Baca Selengkapnya</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>
        ))}
      </div>

      {/* Article Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl p-6 relative">
            <button
              onClick={() => setActiveArticle(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
              {activeArticle.category}
            </span>

            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-2">
              {activeArticle.title}
            </h3>
            <div className="flex items-center gap-3 text-xs text-slate-500 my-2">
              <span>Penulis: {activeArticle.author}</span>
              <span>•</span>
              <span>{activeArticle.readTime}</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 leading-relaxed my-4 space-y-3">
              <p className="font-semibold">{activeArticle.desc}</p>
              <p>{activeArticle.content}</p>
            </div>

            <button
              onClick={() => setActiveArticle(null)}
              className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition"
            >
              Tutup Artikel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
