'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  FileText,
  Linkedin,
  Mic,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Download,
  Share2,
  Award,
  BookOpen,
  Target,
  BarChart2,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

export const CareerReadinessView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'pilar' | 'tes' | 'roadmap' | 'sertifikat'>('pilar');

  // Overall Score State
  const [readinessScore, setReadinessScore] = useState(78);

  // Pillar Scores
  const pillars = [
    {
      id: 'cv',
      title: 'Kualitas CV & ATS Score',
      score: 85,
      status: 'Sangat Baik',
      icon: FileText,
      desc: 'CV sudah menggunakan format standar ATS dengan kata kunci industri yang tepat.',
      recommendation: 'Tambahkan kuantifikasi hasil pencapaian di bagian pengalaman kerja.',
      actionTab: 'cv',
    },
    {
      id: 'linkedin',
      title: 'Profil LinkedIn & Portofolio',
      score: 72,
      status: 'Cukup Baik',
      icon: Linkedin,
      desc: 'LinkedIn sudah memiliki headline jelas, namun perlu menambah deskripsi proyek.',
      recommendation: 'Unggah sampel proyek terbaik ke bagian Featured di profil LinkedIn.',
      actionTab: 'cv',
    },
    {
      id: 'interview',
      title: 'Keterampilan Interview',
      score: 75,
      status: 'Cukup Baik',
      icon: Mic,
      desc: 'Sudah menguasai metode STAR untuk pertanyaan umum HR.',
      recommendation: 'Latih simulasi interview AI untuk pertanyaan jebakan terkait ekspektasi gaji.',
      actionTab: 'interview',
    },
    {
      id: 'activity',
      title: 'Aktivitas Lamaran & Networking',
      score: 80,
      status: 'Sangat Baik',
      icon: Briefcase,
      desc: 'Rutin melamar 3+ pekerjaan per minggu dan mencatat di Tracker.',
      recommendation: 'Manfaatkan fitur Referral untuk terhubung langsung dengan karyawan internal.',
      actionTab: 'tracker',
    },
  ];

  // Interactive Diagnostic Test State
  const [testAnswers, setTestAnswers] = useState<Record<number, number>>({});
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);

  const testQuestions = [
    {
      id: 1,
      q: 'Seberapa sering Anda memperbarui CV dan mengecek skor ATS sebelum mengirim lamaran?',
      options: [
        { text: 'Setiap melamar ke posisi berbeda (CV disesuaikan kata kuncinya)', points: 20 },
        { text: 'Hanya sekali membuat CV umum untuk semua posisi', points: 10 },
        { text: 'Jarang atau belum pernah mengecek ATS score', points: 5 },
      ],
    },
    {
      id: 2,
      q: 'Bagaimana kelengkapan profil LinkedIn dan portofolio kerja Anda saat ini?',
      options: [
        { text: 'Lengkap dengan headline spesifik, Ringkasan, & sampel proyek beresolusi tinggi', points: 20 },
        { text: 'Ada LinkedIn tetapi belum memiliki link portofolio khusus', points: 12 },
        { text: 'Belum aktif menggunakan LinkedIn', points: 5 },
      ],
    },
    {
      id: 3,
      q: 'Seberapa siap Anda menjawab pertanyaan interview berbasis metode STAR (Situation, Task, Action, Result)?',
      options: [
        { text: 'Sangat siap dengan 3+ cerita pengalaman nyata yang sudah dilatih', points: 20 },
        { text: 'Paham teorinya tetapi belum pernah mencobanya secara spontan', points: 12 },
        { text: 'Belum pernah mendengar metode STAR sebelumnya', points: 5 },
      ],
    },
    {
      id: 4,
      q: 'Berapa banyak lamaran kerja yang Anda kirimkan secara konsisten setiap minggunya?',
      options: [
        { text: 'Lebih dari 5 lamaran terfokus per minggu dan dicatat di Tracker', points: 20 },
        { text: '1 hingga 3 lamaran per minggu jika ada lowongan yang sesuai', points: 12 },
        { text: 'Hanya melamar secara sporadis jika sedang ingat', points: 5 },
      ],
    },
    {
      id: 5,
      q: 'Apakah Anda sudah memiliki strategi nego gaji berdasarkan riset standar industri?',
      options: [
        { text: 'Ya, sudah tahu kisaran rentang angka dan teknik penyampaiannya', points: 20 },
        { text: 'Punya gambaran angka tetapi bingung cara menyampaikannya ke HR', points: 12 },
        { text: 'Belum tahu riset gaji industri untuk peran ini', points: 5 },
      ],
    },
  ];

  const handleSelectOption = (qId: number, points: number) => {
    setTestAnswers((prev) => ({ ...prev, [qId]: points }));
  };

  const handleCalculateTest = () => {
    const totalPoints = Object.values(testAnswers).reduce((a, b) => a + b, 0);
    setReadinessScore(totalPoints);
    setIsTestSubmitted(true);
  };

  const getReadinessBadge = (score: number) => {
    if (score >= 85) return { label: 'Sangat Siap Kerja (Job Ready)', color: 'bg-emerald-500 text-white' };
    if (score >= 70) return { label: 'Siap Kerja (Perlu Sedikit Optimasi)', color: 'bg-violet-600 text-white' };
    return { label: 'Perlu Pembenahan Karir', color: 'bg-amber-500 text-slate-950 font-bold' };
  };

  const currentBadge = getReadinessBadge(readinessScore);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-900 via-slate-900 to-violet-950 rounded-xl p-6 text-white border border-violet-800/40 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
              <TrendingUp className="w-4 h-4" />
              <span>Indeks Kesiapan Kerja CUTI AI</span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
              Kalkulator & Evaluasi Career Readiness
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Ukur kesiapan kerja Anda dari 4 pilar utama: Kualitas CV ATS, Portofolio, Interview, dan Aktivitas Networking.
            </p>
          </div>

          {/* Overall Score Circle Card */}
          <div className="p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/15 flex items-center gap-4 shrink-0">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-violet-600 text-amber-300 font-black text-xl border-4 border-amber-400 shadow-md">
              {readinessScore}%
            </div>
            <div>
              <span className="text-[10px] text-slate-300 uppercase tracking-wider block font-bold">Status Kesiapan</span>
              <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-extrabold mt-1 ${currentBadge.color}`}>
                {currentBadge.label}
              </span>
            </div>
          </div>
        </div>

        {/* Sub Nav Bar */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-white/10 text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('pilar')}
            className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeSubTab === 'pilar'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>4 Pilar Kesiapan</span>
          </button>

          <button
            onClick={() => setActiveSubTab('tes')}
            className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeSubTab === 'tes'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tes Diagnostik Kesiapan</span>
          </button>

          <button
            onClick={() => setActiveSubTab('roadmap')}
            className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeSubTab === 'roadmap'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Roadmap Pembenahan</span>
          </button>

          <button
            onClick={() => setActiveSubTab('sertifikat')}
            className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeSubTab === 'sertifikat'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Sertifikat Readiness</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: 4 PILAR KESIAPAN */}
      {activeSubTab === 'pilar' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pillars.map((p) => {
            const Icon = p.icon;

            return (
              <div
                key={p.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-lg bg-violet-50 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{p.title}</h4>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-base text-violet-600 dark:text-violet-400">
                        {p.score} / 100
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-violet-600 dark:bg-violet-500 transition-all duration-300"
                      style={{ width: `${p.score}%` }}
                    />
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {p.desc}
                  </p>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] space-y-0.5">
                    <strong className="text-violet-600 dark:text-violet-400 block font-bold">Saran Perbaikan:</strong>
                    <span className="text-slate-600 dark:text-slate-300">{p.recommendation}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUBTAB 2: TES DIAGNOSTIK KESIAPAN */}
      {activeSubTab === 'tes' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Tes Diagnostik Kesiapan Kerja Singkat (5 Pertanyaan)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Jawab pertanyaan berikut sesuai kondisi riil Anda saat ini untuk memperbarui skor kesiapan kerja secara instan.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {testQuestions.map((q, qIndex) => (
              <div key={q.id} className="space-y-3">
                <h4 className="font-bold text-xs md:text-sm text-slate-900 dark:text-white">
                  {qIndex + 1}. {q.q}
                </h4>

                <div className="space-y-2">
                  {q.options.map((opt, optIndex) => {
                    const isSelected = testAnswers[q.id] === opt.points;

                    return (
                      <button
                        key={optIndex}
                        onClick={() => handleSelectOption(q.id, opt.points)}
                        className={`w-full text-left p-3.5 rounded-lg border text-xs transition flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-violet-50/80 dark:bg-violet-950/60 border-violet-500 text-violet-900 dark:text-violet-200 font-bold'
                            : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-violet-300'
                        }`}
                      >
                        <span>{opt.text}</span>
                        <div
                          className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center ${
                            isSelected ? 'border-violet-600 bg-violet-600' : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              onClick={() => {
                setTestAnswers({});
                setIsTestSubmitted(false);
              }}
              className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Jawaban</span>
            </button>

            <button
              onClick={handleCalculateTest}
              disabled={Object.keys(testAnswers).length < testQuestions.length}
              className="px-6 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold text-xs transition shadow-md shadow-violet-600/20 flex items-center gap-2"
            >
              <BarChart2 className="w-4 h-4" />
              <span>Hitung Skor Kesiapan Baru</span>
            </button>
          </div>

          {isTestSubmitted && (
            <div className="p-5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 space-y-2 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Skor Kesiapan Anda Berhasil Diperbarui: {readinessScore} / 100</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Hasil evaluasi diagnostik ini mengonfirmasi bahwa Anda sudah memiliki fondasi yang solid. Pertahankan ritme melamar dan terus lakukan simulasi interview AI secara berkala!
              </p>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: ROADMAP PEMBENAHAN */}
      {activeSubTab === 'roadmap' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6 shadow-xs">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-violet-600" />
            <span>Rencana Aksi 3 Minggu Mencapai 100% Ready</span>
          </h3>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300 border border-violet-200">
                Minggu 1: Pembenahan Fondasi Dokumen
              </span>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">Optimasi CV ATS & Profil LinkedIn</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Gunakan AI CV Optimizer untuk menyesuaikan kata kunci spesifik berdasarkan deskripsi pekerjaan yang dituju. Pastikan profil LinkedIn dipasang foto profesional dan tautan portofolio.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300 border border-violet-200">
                Minggu 2: Latihan Komunikasi & Interview
              </span>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">Simulasi AI Interview & Pertanyaan Jebakan</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Lakukan minimal 3 kali simulasi interview AI di halaman Panduan Interview. Kuasai jawaban pertanyaan jebakan seputar ekspektasi gaji dan alasan pindah kerja.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300 border border-violet-200">
                Minggu 3: Eksekusi Pelamaran & Networking
              </span>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">Aktivitas Tracker & Program Referral</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Kirimkan 5+ lamaran kerja terfokus setiap minggu. Catat semua proses interview di Tracker Lamaran untuk memantau kemajuan hingga tahap Offering.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: SERTIFIKAT READINESS */}
      {activeSubTab === 'sertifikat' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6 shadow-xs text-center">
          <div className="max-w-2xl mx-auto p-8 rounded-xl bg-gradient-to-b from-slate-900 via-violet-950 to-slate-900 text-white border-2 border-amber-400 shadow-xl space-y-4">
            <div className="flex items-center justify-center gap-2 text-amber-400">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <span className="text-[10px] uppercase font-black tracking-widest text-amber-300 block">
              SERTIFIKAT KESIAPAN KERJA RESMI
            </span>

            <h3 className="text-xl md:text-2xl font-black text-white">
              Sertifikat Career Readiness CUTI AI
            </h3>

            <p className="text-xs text-slate-300 max-w-lg mx-auto">
              Diberikan kepada pengguna yang telah berhasil menyelesaikan asesmen kesiapan kerja dengan skor minimum 75/100 (Job Ready Certified).
            </p>

            <div className="py-2 border-y border-white/10 max-w-xs mx-auto flex items-center justify-center gap-2 text-amber-300 font-bold text-xs">
              <Award className="w-4 h-4" />
              <span>Skor Terverifikasi: {readinessScore} / 100</span>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => alert('Sertifikat siap diunduh dalam format PDF!')}
                className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Unduh PDF</span>
              </button>

              <button
                onClick={() => alert('Link sertifikat berhasil disalin untuk dipasang di LinkedIn!')}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center gap-1.5 border border-white/20"
              >
                <Share2 className="w-4 h-4" />
                <span>Bagikan ke LinkedIn</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
