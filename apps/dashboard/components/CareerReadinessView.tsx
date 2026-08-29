'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';
import { cvApi, trackerApi } from '@/lib/api';
import { useCareerReadiness } from '@/hooks/useCareerReadiness';
import {
  calculatePillars,
  getReadinessBadge,
  PillarEvaluation,
} from '@/lib/readiness';
import {
  TrendingUp,
  FileText,
  Linkedin,
  Mic,
  Briefcase,
  CheckCircle2,
  Sparkles,
  Download,
  Share2,
  Award,
  Target,
  BarChart2,
  ShieldCheck,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';

export const CareerReadinessView: React.FC = () => {
  const toast = useToast();
  const [activeSubTab, setActiveSubTab] = useState<'pilar' | 'tes' | 'roadmap' | 'sertifikat'>('pilar');
  const { score: readinessScore, updateScore, resetScore, isDiagnosticStored, isLoaded } = useCareerReadiness();

  const [pillars, setPillars] = useState<PillarEvaluation[]>([
    {
      id: 'cv',
      title: 'Kualitas CV & ATS Score',
      score: 0,
      status: 'Memuat...',
      icon: 'FileText' as any,
      desc: 'Memuat data CV...',
      recommendation: 'Memuat...',
      actionTab: 'cv',
    },
    {
      id: 'linkedin',
      title: 'Profil LinkedIn & Portofolio',
      score: 0,
      status: 'Memuat...',
      icon: 'Linkedin' as any,
      desc: 'Memuat data profil...',
      recommendation: 'Memuat...',
      actionTab: 'cv',
    },
    {
      id: 'interview',
      title: 'Keterampilan Interview',
      score: 0,
      status: 'Memuat...',
      icon: 'Mic' as any,
      desc: 'Memuat data interview...',
      recommendation: 'Memuat...',
      actionTab: 'interview',
    },
    {
      id: 'activity',
      title: 'Aktivitas Lamaran & Networking',
      score: 0,
      status: 'Memuat...',
      icon: 'Briefcase' as any,
      desc: 'Memuat data aktivitas...',
      recommendation: 'Memuat...',
      actionTab: 'tracker',
    },
  ]);

  useEffect(() => {
    const loadPillars = async () => {
      try {
        const [cvs, apps] = await Promise.all([
          cvApi.getAll().catch(() => []),
          trackerApi.getAll().catch(() => []),
        ]);

        const evaluatedPillars = calculatePillars(cvs, apps);
        setPillars(evaluatedPillars);
      } catch (error) {
        console.error('[CareerReadinessView] Failed to load pillar data:', error);
      }
    };

    loadPillars();
  }, []);

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
    updateScore(totalPoints);
    setIsTestSubmitted(true);
  };

  const currentBadge = getReadinessBadge(readinessScore);

  const getPillarIcon = (id: string) => {
    switch (id) {
      case 'cv':
        return FileText;
      case 'linkedin':
        return Linkedin;
      case 'interview':
        return Mic;
      case 'activity':
      default:
        return Briefcase;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-navy-700 rounded-[10px] p-6 text-white border border-navy-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              <span>Indeks Kesiapan Kerja Employr</span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
              Kalkulator &amp; Evaluasi Career Readiness
            </h2>
            <p className="text-xs text-slate-200 max-w-xl leading-relaxed">
              Ukur kesiapan kerja Anda dari 4 pilar utama: Kualitas CV ATS, Portofolio, Interview, dan Aktivitas Networking.
            </p>
          </div>

          {/* Overall Score Master Radial Ring Card */}
          <div className="p-4 bg-white/10 backdrop-blur-md rounded-[10px] border border-white/15 flex items-center gap-4 shrink-0">
            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/20"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-orange-400"
                  strokeDasharray={`${readinessScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-sm font-black text-white">
                {isLoaded ? `${readinessScore}%` : '...'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-300 uppercase tracking-wider block font-bold">
                  Status Kesiapan
                </span>
                {isDiagnosticStored && (
                  <button
                    onClick={resetScore}
                    title="Kembalikan ke kalkulasi profil otomatis"
                    className="text-[10px] text-orange-300 hover:text-orange-200 underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
              <span className={`inline-block px-2.5 py-1 rounded-[10px] text-xs font-extrabold mt-1 ${currentBadge.color}`}>
                {currentBadge.label}
              </span>
            </div>
          </div>
        </div>

        {/* Sub Nav Bar */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-white/10 text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('pilar')}
            className={`px-3.5 py-2 rounded-[10px] transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'pilar'
                ? 'bg-[#1738D1] text-white font-bold shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>4 Pilar Kesiapan</span>
          </button>

          <button
            onClick={() => setActiveSubTab('tes')}
            className={`px-3.5 py-2 rounded-[10px] transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'tes'
                ? 'bg-[#1738D1] text-white font-bold shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tes Diagnostik Kesiapan</span>
          </button>

          <button
            onClick={() => setActiveSubTab('roadmap')}
            className={`px-3.5 py-2 rounded-[10px] transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'roadmap'
                ? 'bg-[#1738D1] text-white font-bold shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Roadmap Pembenahan</span>
          </button>

          <button
            onClick={() => setActiveSubTab('sertifikat')}
            className={`px-3.5 py-2 rounded-[10px] transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'sertifikat'
                ? 'bg-[#1738D1] text-white font-bold shadow-xs'
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
            const Icon = getPillarIcon(p.id);

            return (
              <div
                key={p.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5 space-y-4 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-[10px] bg-orange-50 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{p.title}</h4>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-base text-orange-600 dark:text-orange-400">
                        {p.score} / 100
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-[#1738D1] dark:bg-[#1738D1] transition-all duration-300"
                      style={{ width: `${p.score}%` }}
                    />
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {p.desc}
                  </p>

                  <div className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] space-y-0.5">
                    <strong className="text-orange-600 dark:text-orange-400 block font-bold">Saran Perbaikan:</strong>
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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Tes Diagnostik Kesiapan Kerja Singkat (5 Pertanyaan)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Jawab pertanyaan berikut sesuai kondisi riil Anda saat ini untuk memperbarui skor kesiapan kerja secara instan di seluruh sistem.
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
                        className={`w-full text-left p-3.5 rounded-[10px] border text-xs transition flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-orange-50/80 dark:bg-orange-950/60 border-[#1738D1] text-orange-900 dark:text-orange-200 font-bold'
                            : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-orange-300'
                        }`}
                      >
                        <span>{opt.text}</span>
                        <div
                          className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center ${
                            isSelected ? 'border-[#1738D1] bg-[#1738D1]' : 'border-slate-300 dark:border-slate-600'
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
                resetScore();
              }}
              className="px-4 py-2.5 rounded-[10px] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Hasil &amp; Jawaban</span>
            </button>

            <button
              onClick={handleCalculateTest}
              disabled={Object.keys(testAnswers).length < testQuestions.length}
              className="px-6 py-2.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] disabled:opacity-50 text-white font-bold text-xs transition shadow-md shadow-[#1738D1]/20 flex items-center gap-2 cursor-pointer border-0"
            >
              <BarChart2 className="w-4 h-4" />
              <span>Hitung &amp; Sinkronkan Skor Baru</span>
            </button>
          </div>

          {isTestSubmitted && (
            <div className="p-5 rounded-[10px] bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 space-y-2 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Skor Kesiapan Anda Berhasil Diperbarui: {readinessScore} / 100</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Hasil evaluasi diagnostik ini telah disinkronkan ke seluruh sistem dashboard dan sidebar. Pertahankan ritme melamar dan terus lakukan simulasi interview secara berkala!
              </p>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: ROADMAP PEMBENAHAN */}
      {activeSubTab === 'roadmap' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-6 space-y-6 shadow-xs">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-600" />
            <span>Rencana Aksi 3 Minggu Mencapai 100% Ready</span>
          </h3>

          <div className="space-y-4">
            <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="px-2.5 py-0.5 rounded-[10px] text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border border-orange-200">
                Minggu 1: Pembenahan Fondasi Dokumen
              </span>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">Optimasi CV ATS &amp; Profil LinkedIn</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Sesuaikan kata kunci spesifik berdasarkan deskripsi lowongan yang dituju. Pastikan profil LinkedIn dilengkapi deskripsi profesional dan tautan portofolio.
              </p>
            </div>

            <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="px-2.5 py-0.5 rounded-[10px] text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border border-orange-200">
                Minggu 2: Latihan Komunikasi &amp; Interview
              </span>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">Simulasi Interview &amp; Pertanyaan Kunci</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Lakukan simulasi di halaman Panduan Interview. Kuasai jawaban pertanyaan seputar ekspektasi gaji dan alasan melamar kerja dengan metode STAR.
              </p>
            </div>

            <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="px-2.5 py-0.5 rounded-[10px] text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border border-orange-200">
                Minggu 3: Eksekusi Pelamaran &amp; Networking
              </span>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">Aktivitas Tracker &amp; Program Referral</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Kirimkan 5+ lamaran kerja terfokus setiap minggu. Catat semua proses interview di Tracker Lamaran untuk memantau kemajuan hingga tahap Offering.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: SERTIFIKAT READINESS */}
      {activeSubTab === 'sertifikat' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-6 space-y-6 shadow-xs text-center">
          <div className="max-w-2xl mx-auto p-8 rounded-[10px] bg-navy-700 text-white border-2 border-amber-400 shadow-xl space-y-4">
            <div className="flex items-center justify-center gap-2 text-amber-400">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <span className="text-[10px] uppercase font-black tracking-widest text-amber-300 block">
              SERTIFIKAT KESIAPAN KERJA RESMI
            </span>

            <h3 className="text-xl md:text-2xl font-black text-white">
              Sertifikat Career Readiness Employr
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
                onClick={() => toast.success('Sertifikat Siap', 'Sertifikat siap diunduh dalam format PDF!')}
                className="px-4 py-2 rounded-[10px] bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md cursor-pointer border-0"
              >
                <Download className="w-4 h-4" />
                <span>Unduh PDF</span>
              </button>

              <button
                onClick={() => toast.success('Tautan Tersalin', 'Link sertifikat berhasil disalin untuk dipasang di LinkedIn!')}
                className="px-4 py-2 rounded-[10px] bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center gap-1.5 border border-white/20 cursor-pointer"
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
