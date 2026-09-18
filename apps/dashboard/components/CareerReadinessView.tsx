'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { cvApi, trackerApi } from '@/lib/api';
import { useCareerReadiness } from '@/hooks/useCareerReadiness';
import {
  calculateHolisticReadiness,
  getReadinessBadge,
  HolisticReadinessEvaluation,
  PillarEvaluation,
} from '@/lib/readiness';
import { getScoreColorTokens } from '@/lib/score-color';
import {
  TrendingUp,
  FileText,
  Compass,
  Mail,
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
  ArrowRight,
  AlertCircle,
  Check,
  Zap,
} from 'lucide-react';

export const CareerReadinessView: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const [activeSubTab, setActiveSubTab] = useState<'dimensi' | 'audit' | 'roadmap' | 'sertifikat'>('dimensi');
  const { score: hookScore, diagnosticScore, updateDiagnosticScore, resetDiagnosticScore, isLoaded } = useCareerReadiness();

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [holisticData, setHolisticData] = useState<HolisticReadinessEvaluation | null>(null);

  // Clean legacy overriding keys if present on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('employr_career_readiness_score') || localStorage.getItem('cuti_career_readiness_score')) {
        localStorage.removeItem('employr_career_readiness_score');
        localStorage.removeItem('cuti_career_readiness_score');
      }
    }
  }, []);

  const loadHolisticData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [cvs, apps] = await Promise.all([
        cvApi.getAll().catch(() => []),
        trackerApi.getAll().catch(() => []),
      ]);

      const evaluated = calculateHolisticReadiness(cvs, apps);
      setHolisticData(evaluated);
    } catch (error) {
      console.error('[CareerReadinessView] Gagal memuat data kesiapan:', error);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadHolisticData();
  }, [loadHolisticData]);

  // Interactive Diagnostic Test State
  const [testAnswers, setTestAnswers] = useState<Record<number, number>>({});
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);

  const diagnosticQuestions = [
    {
      id: 1,
      q: 'Seberapa spesifik dan terarah target posisi pekerjaan yang ingin Anda tuju saat ini?',
      dimension: 'Riset & Kecocokan Lowongan',
      options: [
        { text: 'Sangat spesifik: sudah riset kualifikasi industri & kata kunci peran tersebut', points: 20 },
        { text: 'Ada 2–3 pilihan posisi berbeda yang masih dieksplorasi secara umum', points: 12 },
        { text: 'Belum menentukan target posisi spesifik (mencoba posisi apa saja)', points: 5 },
      ],
    },
    {
      id: 2,
      q: 'Bagaimana status kelengkapan dan format CV ATS Anda saat melamar pekerjaan?',
      dimension: 'Kualitas Berkas & ATS',
      options: [
        { text: 'Format standar ATS dengan skor evaluasi ≥ 75 dan kata kunci relevan', points: 20 },
        { text: 'Sudah ada CV, namun belum pernah diuji format ATS dan kata kuncinya', points: 12 },
        { text: 'Masih berupa draf kasar atau belum diperbarui lebih dari 6 bulan', points: 5 },
      ],
    },
    {
      id: 3,
      q: 'Apakah Anda selalu menyertakan surat lamaran / email pengantar yang dipersonalisasi?',
      dimension: 'Administrasi & Berkas Lamaran',
      options: [
        { text: 'Ya, selalu menyusun email & surat lamaran terarah sesuai nama perusahaan', points: 20 },
        { text: 'Hanya melampirkan teks template standar yang sama untuk semua perusahaan', points: 12 },
        { text: 'Jarang atau belum pernah mengirimkan surat lamaran profesional', points: 5 },
      ],
    },
    {
      id: 4,
      q: 'Berapa banyak lamaran kerja yang Anda kirim dan pantau secara konsisten tiap minggu?',
      dimension: 'Momentum Pelamaran & Tracker',
      options: [
        { text: 'Minimal 3–5 lamaran terfokus per minggu dan dicatat rapi di Tracker', points: 20 },
        { text: '1–2 lamaran per minggu jika kebetulan menemukan lowongan di media sosial', points: 12 },
        { text: 'Melamar tidak tentu (hanya jika ada teman yang mereferensikan)', points: 5 },
      ],
    },
    {
      id: 5,
      q: 'Bagaimana kesiapan Anda terkait riset standar gaji dan negosiasi kompensasi peran?',
      dimension: 'Kesiapan Negosiasi & Administrasi',
      options: [
        { text: 'Sudah mengetahui rentang gaji pasar peran tersebut dan batas minimum yang realistis', points: 20 },
        { text: 'Mengetahui gambaran kasar UMR namun belum yakin angka realistis industri', points: 12 },
        { text: 'Belum pernah melakukan riset standar kompensasi untuk posisi yang dituju', points: 5 },
      ],
    },
  ];

  const handleSelectOption = (qId: number, points: number) => {
    setTestAnswers((prev) => ({ ...prev, [qId]: points }));
  };

  const handleCalculateTest = () => {
    const totalPoints = Object.values(testAnswers).reduce((a, b) => a + b, 0);
    updateDiagnosticScore(totalPoints);
    setIsTestSubmitted(true);
    toast.success('Diagnostik Selesai', `Skor evaluasi mandiri tersimpan: ${totalPoints}/100.`);
  };

  const handlePrintCertificate = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleCopyLinkedInBadge = () => {
    const shareText = `Saya telah menyelesaikan Career Readiness Evaluation di Employr dengan skor ${displayScore}/100. Siap berkontribusi di dunia kerja profesional! #Employr #JobReady #CareerReadiness`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      toast.success('Teks Berhasil Disalin', 'Teks pengumuman kesiapan kerja siap dipasang di LinkedIn!');
    }
  };

  // Skor tampilan utama selalu berbasis data riil objektif (Single Source of Truth)
  const displayScore = holisticData?.score ?? hookScore;
  const badgeInfo = getReadinessBadge(displayScore);

  const getDimensionIcon = (id: string) => {
    switch (id) {
      case 'cv_ats':
        return FileText;
      case 'job_match':
        return Compass;
      case 'application_kit':
        return Mail;
      case 'tracker_momentum':
      default:
        return Briefcase;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Header Banner & Master Hero Score */}
      <div className="bg-navy-700 rounded-[10px] p-6 text-white border border-navy-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              <span>Indeks Kesiapan Kerja Employr</span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
              Career Readiness Index
            </h1>
            <p className="text-xs text-slate-200 max-w-xl leading-relaxed">
              Evaluasi komprehensif mengukur kesiapan berkas lamaran, riset peran target, administrasi dokumen, dan momentum pelacakan karier Anda.
            </p>
          </div>

          {/* Master Radial Ring Card */}
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
                  className={badgeInfo.strokeColor}
                  strokeDasharray={`${displayScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-sm font-black text-white">
                {isLoaded ? `${displayScore}%` : '...'}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-300 uppercase tracking-wider block font-bold">
                  Status Kesiapan
                </span>
                <button
                  onClick={() => {
                    loadHolisticData();
                    toast.info('Data Disinkronkan', 'Kalkulasi diperbarui dengan data profil terkini.');
                  }}
                  title="Sinkronkan kalkulasi profil terbaru"
                  className="text-[10px] text-orange-300 hover:text-orange-200 underline flex items-center gap-0.5 cursor-pointer"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  <span>Sinkronkan</span>
                </button>
              </div>
              <span className={`inline-block px-2.5 py-1 rounded-[10px] text-xs font-extrabold ${badgeInfo.color}`}>
                {badgeInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* Diagnostic Highlight Cards (Superpower & Bottleneck) */}
        {holisticData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5 pt-5 border-t border-white/10 text-xs">
            <div className="p-3 rounded-[10px] bg-white/5 border border-white/10 flex items-start gap-3">
              <div className="p-2 rounded-[8px] bg-emerald-500/20 text-emerald-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">
                  Keunggulan Utama (Superpower)
                </span>
                <strong className="text-white block font-bold text-xs">{holisticData.superpower.title}</strong>
                <p className="text-slate-300 text-[11px] leading-relaxed">{holisticData.superpower.desc}</p>
              </div>
            </div>

            <div className="p-3 rounded-[10px] bg-white/5 border border-white/10 flex items-start gap-3">
              <div className="p-2 rounded-[8px] bg-amber-500/20 text-amber-400 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 flex-1">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                  Prioritas Peningkatan (Bottleneck)
                </span>
                <strong className="text-white block font-bold text-xs">{holisticData.bottleneck.title}</strong>
                <p className="text-slate-300 text-[11px] leading-relaxed">{holisticData.bottleneck.desc}</p>
                {holisticData.bottleneck.actionPath && (
                  <button
                    onClick={() => router.push(holisticData.bottleneck.actionPath!)}
                    className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-orange-400 hover:text-orange-300 underline cursor-pointer"
                  >
                    <span>{holisticData.bottleneck.actionLabel || 'Perbaiki Sekarang'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sub Navigation Bar */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-white/10 text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('dimensi')}
            className={`px-3.5 py-2 rounded-[10px] transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'dimensi'
                ? 'bg-[#1738D1] text-white font-bold shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>4 Dimensi Kesiapan</span>
          </button>

          <button
            onClick={() => setActiveSubTab('audit')}
            className={`px-3.5 py-2 rounded-[10px] transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'audit'
                ? 'bg-[#1738D1] text-white font-bold shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Asesmen Diagnostik Cepat</span>
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
            <span>Roadmap Pencapaian</span>
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
            <span>Sertifikat Kesiapan</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: 4 DIMENSI KESIAPAN (BENTO GRID 2x2) */}
      {activeSubTab === 'dimensi' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(holisticData?.dimensions || []).map((p: PillarEvaluation) => {
            const Icon = getDimensionIcon(p.id);
            const pTokens = getScoreColorTokens(p.score, p.score === 0);

            return (
              <div
                key={p.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5 space-y-4 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2.5 rounded-[10px] border transition-colors ${pTokens.iconWrapper}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">{p.title}</h3>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          Status: {p.status}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`font-black text-base transition-colors ${pTokens.text}`}>
                        {p.score} / 100
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${pTokens.bar}`}
                      style={{ width: `${p.score}%` }}
                    />
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {p.desc}
                  </p>

                  {/* Key Metrics Checklist */}
                  {Array.isArray(p.metrics) && p.metrics.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Indikator Penilaian Riil:
                      </span>
                      {p.metrics.map((m, mIdx) => (
                        <div
                          key={mIdx}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded-[8px] bg-slate-50 dark:bg-slate-800/40"
                        >
                          <span className="text-slate-600 dark:text-slate-300 text-[11px] flex items-center gap-1.5">
                            {m.passed ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            ) : (
                              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            )}
                            <span>{m.label}</span>
                          </span>
                          <span className={`text-[10px] font-bold ${m.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                            {m.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Saran Perbaikan */}
                  <div className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] space-y-0.5">
                    <strong className={`block font-bold transition-colors ${pTokens.text}`}>
                      Rekomendasi Tindakan:
                    </strong>
                    <span className="text-slate-600 dark:text-slate-300">{p.recommendation}</span>
                  </div>
                </div>

                {/* Direct Action Link */}
                <div className="pt-2">
                  <button
                    onClick={() => router.push(p.actionPath)}
                    className="w-full py-2 px-3 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{p.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUBTAB 2: ASESMEN DIAGNOSTIK CEPAT (SELF-AUDIT) */}
      {activeSubTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span>Asesmen Diagnostik Kesiapan Kerja (5 Pertanyaan Reflektif)</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Evaluasi mandiri strategi dan kesiapan pelamaran kerja Anda. Jawaban membantu Anda mendeteksi gap persiapan kerja.
              </p>
            </div>
            {diagnosticScore !== null && (
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-medium">Skor Evaluasi Mandiri</span>
                <span className="text-sm font-black text-orange-600">{diagnosticScore} / 100</span>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {diagnosticQuestions.map((q, qIndex) => (
              <div key={q.id} className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs md:text-sm text-slate-900 dark:text-white">
                    {qIndex + 1}. {q.q}
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-[6px]">
                    {q.dimension}
                  </span>
                </div>

                <div className="space-y-2">
                  {q.options.map((opt, optIndex) => {
                    const isSelected = testAnswers[q.id] === opt.points;

                    return (
                      <button
                        key={optIndex}
                        onClick={() => handleSelectOption(q.id, opt.points)}
                        className={`w-full text-left p-3.5 rounded-[10px] border text-xs transition flex items-center justify-between gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/80 dark:bg-blue-950/60 border-[#1738D1] text-blue-950 dark:text-blue-200 font-bold'
                            : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
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
                resetDiagnosticScore();
                toast.info('Hasil Direset', 'Skor evaluasi mandiri telah dihapus.');
              }}
              className="px-4 py-2.5 rounded-[10px] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Jawaban</span>
            </button>

            <button
              onClick={handleCalculateTest}
              disabled={Object.keys(testAnswers).length < diagnosticQuestions.length}
              className="px-6 py-2.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] disabled:opacity-50 text-white font-bold text-xs transition shadow-md shadow-[#1738D1]/20 flex items-center gap-2 cursor-pointer border-0"
            >
              <BarChart2 className="w-4 h-4" />
              <span>Simpan Hasil Evaluasi Mandiri</span>
            </button>
          </div>

          {isTestSubmitted && (
            <div className="p-5 rounded-[10px] bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 space-y-2 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Skor Evaluasi Mandiri: {diagnosticScore} / 100</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Hasil evaluasi mandiri telah tersimpan sebagai panduan refleksi Anda. Untuk menaikkan skor kesiapan riil di platform, lengkapi berkas CV di menu CV Builder dan perbanyak melamar melalui Tracker Lamaran.
              </p>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: DYNAMIC ACTION ROADMAP */}
      {activeSubTab === 'roadmap' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-6 space-y-6 shadow-xs">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-600" />
              <span>Roadmap Pencapaian Kesiapan Kerja (Dynamic Milestones)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pantau kemajuan konkret Anda. Setiap milestone akan tercentang otomatis saat Anda melengkapi data dan melakukan aktivitas di platform.
            </p>
          </div>

          <div className="space-y-4">
            {(holisticData?.milestones || []).map((m) => {
              const isDone = m.status === 'completed';
              const isInProgress = m.status === 'in_progress';

              return (
                <div
                  key={m.id}
                  className={`p-5 rounded-[10px] border transition-all ${
                    isDone
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                      : isInProgress
                      ? 'bg-blue-50/30 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/60'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-700/60">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : isInProgress
                            ? 'bg-[#1738D1] text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {isDone ? <Check className="w-4 h-4" /> : m.step}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white">{m.title}</h3>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-[6px] ${
                              isDone
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-300'
                                : isInProgress
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/80 dark:text-blue-300'
                                : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {isDone ? 'Selesai' : isInProgress ? `${m.progressPercent}% Tercapai` : 'Belum Dimulai'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{m.subtitle}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => router.push(m.actionPath)}
                      className={`px-3 py-1.5 rounded-[10px] text-xs font-bold transition flex items-center gap-1 cursor-pointer self-start md:self-auto border-0 ${
                        isDone
                          ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          : 'bg-[#1738D1] hover:bg-[#132EA8] text-white shadow-xs'
                      }`}
                    >
                      <span>{m.actionLabel}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 py-2.5 leading-relaxed">
                    {m.description}
                  </p>

                  {/* Task checklist */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2">
                    {m.tasks.map((task, tIdx) => (
                      <div
                        key={tIdx}
                        className={`flex items-center gap-2 p-2 rounded-[8px] text-[11px] ${
                          task.completed
                            ? 'bg-emerald-100/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 font-medium'
                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                        )}
                        <span>{task.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 4: SERTIFIKAT READINESS RESMI */}
      {activeSubTab === 'sertifikat' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-6 space-y-6 shadow-xs text-center">
          <div className="max-w-2xl mx-auto p-8 rounded-[10px] bg-navy-700 text-white border-2 border-amber-400 shadow-xl space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-center gap-2 text-amber-400">
              <ShieldCheck className="w-9 h-9" />
            </div>

            <span className="text-[10px] uppercase font-black tracking-widest text-amber-300 block">
              SERTIFIKAT KESIAPAN KERJA DIGITAL
            </span>

            <h2 className="text-xl md:text-2xl font-black text-white">
              Certificate of Career Readiness
            </h2>

            <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
              Diterbitkan secara digital oleh sistem verifikasi Employr kepada pencari kerja yang telah menyelesaikan audit profil dan mencapai skor kesiapan kerja terverifikasi.
            </p>

            <div className="py-3 border-y border-white/10 max-w-sm mx-auto flex items-center justify-around text-amber-300 font-bold text-xs">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                <span>Skor: {displayScore} / 100</span>
              </div>
              <div className="text-slate-400">|</div>
              <div className="text-[11px] text-slate-200">
                ID: EMP-CRI-2026
              </div>
            </div>

            {/* List of passed competencies */}
            <div className="max-w-md mx-auto text-left bg-white/5 rounded-[8px] p-3 border border-white/10 space-y-1.5 text-[11px] text-slate-300">
              <span className="font-bold text-amber-300 block text-[10px] uppercase tracking-wider">
                Dimensi Terverifikasi:
              </span>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Struktur Dokumen CV Sesuai Standar ATS</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Spesifikasi Relevansi Peran &amp; Keahlian Industri</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Paket Administrasi &amp; Surat Lamaran Kerja</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handlePrintCertificate}
                className="px-4 py-2.5 rounded-[10px] bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md cursor-pointer border-0"
              >
                <Download className="w-4 h-4" />
                <span>Cetak / Simpan PDF</span>
              </button>

              <button
                onClick={handleCopyLinkedInBadge}
                className="px-4 py-2.5 rounded-[10px] bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center gap-1.5 border border-white/20 cursor-pointer"
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
