'use client';

import React, { useState, useMemo } from 'react';
import {
  Eye,
  Flame,
  Layers,
  Zap,
  Building2,
  Briefcase,
  Upload,
  FileText,
  RefreshCw,
  Info,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  Clock,
  Check,
  Target,
  BarChart3,
  Lightbulb,
  ChevronRight,
  ArrowRight,
  TrendingUp,
  Bot,
  Cpu,
  Globe,
  Award,
  Send,
  X,
  CornerDownRight,
  Sliders,
  Gauge,
  Users,
  CheckSquare,
  HelpCircle,
  Smile,
  Compass,
  FileCheck,
  History,
  ArrowLeft,
  Trash2,
  Bookmark,
  Plus,
} from 'lucide-react';
import {
  runFullRvePipeline,
  CvParsedData,
  RecruiterPersona,
  RveReportResult,
} from './rve/RveEnginePipeline';
import { A4HeatmapCanvas } from './rve/A4HeatmapCanvas';

const mockSavedCVs = [
  {
    id: 'cv-1',
    candidateName: 'Rizky Ramadhan, S.Kom',
    roleTitle: 'Senior Fullstack Engineer',
    email: 'rizky.dev@email.com',
    phone: '+62 812-3456-7890',
    location: 'Jakarta, Indonesia',
    summary:
      'Software Engineer dengan 3+ tahun pengalaman membangun aplikasi web performa tinggi menggunakan React.js, Next.js, & Node.js. Berhasil meningkatkan kecepatan load hingga 35%.',
    experience: [
      {
        id: 'exp-1',
        role: 'Senior Fullstack Developer',
        company: 'PT Tech Innovation Indonesia',
        period: '2023 - Sekarang',
        achievements: [
          'Mengembangkan 12+ modul web berbasis React.js & TypeScript, berhasil mempercepat render 35%.',
          'Memimpin tim 5 engineer dan memangkas bug produk hingga 40% dalam 6 bulan.',
        ],
        metricsCount: 2,
      },
    ],
    education: [
      {
        id: 'edu-1',
        degree: 'S1 Teknik Informatika',
        institution: 'Universitas Indonesia',
        period: '2017 - 2021',
        gpa: 'IPK 3.82 / 4.00 (Cumlaude)',
      },
    ],
    skills: ['React.js', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    hobbiesAndMisc: 'Bahasa Indonesia (Native), Bahasa Inggris (Professional). Hobi: Catur & Futsal.',
    updatedAt: '22 Juli 2026',
    atsScore: 88,
  },
  {
    id: 'cv-2',
    candidateName: 'Amanda Putri, S.Stat',
    roleTitle: 'Data Analyst Specialist',
    email: 'amanda.data@email.com',
    phone: '+62 813-8888-7777',
    location: 'Bandung, Indonesia',
    summary:
      'Data Analyst berdedikasi dengan keahlian Python, SQL, Tableau, & Power BI. Berhasil mengolah 2 juta+ baris data transaksi untuk menghemat biaya operasional 25%.',
    experience: [
      {
        id: 'exp-2',
        role: 'Data Analyst',
        company: 'PT Fintek Analytics Nusantara',
        period: '2022 - Sekarang',
        achievements: [
          'Membangun 15+ Interactive Dashboard Tableau & Power BI untuk jajaran Direksi.',
          'Mengoptimalkan query SQL database PostgreSQL, menghemat waktu eksekusi laporan mingguan sebesar 50%.',
        ],
        metricsCount: 2,
      },
    ],
    education: [
      {
        id: 'edu-2',
        degree: 'S1 Statistika',
        institution: 'Institut Teknologi Bandung',
        period: '2018 - 2022',
        gpa: 'IPK 3.75 / 4.00',
      },
    ],
    skills: ['Python', 'SQL', 'Tableau', 'Power BI', 'Data Modeling', 'Excel Advanced'],
    hobbiesAndMisc: 'Bahasa Indonesia (Native), Bahasa Inggris (Fluent). Hobi: Reading & Data Viz.',
    updatedAt: '18 Juli 2026',
    atsScore: 82,
  },
];

// 11 Recruiter Personas
const recruiterPersonas: RecruiterPersona[] = [
  {
    id: 'startup',
    name: 'Startup',
    badge: 'Fast-Paced & Impact',
    description: 'Fokus tinggi pada kecepatan eksekusi, portofolio proyek nyata, stack modern, dan dampak bisnis langsung.',
    focusArea: 'Kecepatan & Portofolio',
    strictness: 'Kecepatan & Impact %',
  },
  {
    id: 'unicorn',
    name: 'Unicorn',
    badge: 'High Scale & System',
    description: 'Menilai kemampuan skala sistem besar, arsitektur, kepemimpinan tim, dan efisiensi performa.',
    focusArea: 'Arsitektur & Skala',
    strictness: 'Fokus Scale System',
  },
  {
    id: 'corporate',
    name: 'Corporate',
    badge: 'Formal & Structure',
    description: 'Memperhatikan struktur formal, rekam jejak karir yang stabil, gelar pendidikan, dan kualifikasi baku.',
    focusArea: 'Kualifikasi Formal',
    strictness: 'Ketat pada Standard CV',
  },
  {
    id: 'bumn',
    name: 'BUMN',
    badge: 'Kualifikasi Standar',
    description: 'Prioritas pada kesesuaian dokumen resmi, IPK minimum, kelengkapan administrasi, dan keaslian berkas.',
    focusArea: 'Administrasi & IPK',
    strictness: 'Ketat pada Regulasi',
  },
  {
    id: 'jepang',
    name: 'Jepang',
    badge: 'Kedisiplinan & Detail',
    description: 'Sangat teliti terhadap kerapihan format, konsistensi riwayat kerja, kedisiplinan, dan motivasi jangka panjang.',
    focusArea: 'Konsistensi & Loyalitas',
    strictness: 'Format Seragam Nikkei',
  },
  {
    id: 'cina',
    name: 'Cina',
    badge: 'Target KPI & Speed',
    description: 'Sangat terfokus pada indikator kinerja kuantitatif KPI, daya tahan kerja tinggi, kecepatan eksekusi, dan hasil bisnis.',
    focusArea: 'KPI & Ketahanan Kerja',
    strictness: 'Ketat pada Target KPI',
  },
  {
    id: 'australia',
    name: 'Australia',
    badge: 'Work-Life & Autonomy',
    description: 'Menilai keterampilan praktis langsung, budaya kolaboratif terbuka, independensi, dan komunikasi profesional.',
    focusArea: 'Skill Praktis & Kolaborasi',
    strictness: 'Fokus Practical & Clear Communication',
  },
  {
    id: 'remote-us',
    name: 'Remote US',
    badge: 'Autonomy & Metric %',
    description: 'Menyukai CV ringkas berorientasi metrik %, komunikasi bahasa Inggris profesional, dan kemandirian tinggi.',
    focusArea: 'Metrik Angka & Bahasa',
    strictness: 'Strict pada Result Metrics',
  },
  {
    id: 'fresh-grad',
    name: 'Fresh Graduate',
    badge: 'Potensi & Organisasi',
    description: 'Menilai keaktifan organisasi kampus, IPK, kecepatan belajar, proyek akademik, dan sikap haus ilmu.',
    focusArea: 'Potensi & Organisasi',
    strictness: 'Fokus Potensi & Proyek',
  },
  {
    id: 'product-co',
    name: 'Product Company',
    badge: 'Product Ownership',
    description: 'Menyoroti pemahaman pengalaman pengguna, kolaborasi tim, dan bagaimana kode/fitur meningkatkan user metric.',
    focusArea: 'Product Mindset',
    strictness: 'Fokus User Impact',
  },
  {
    id: 'consulting',
    name: 'Consulting',
    badge: 'Problem Solving',
    description: 'Mencari kemampuan analisis masalah terstruktur, komunikasi tingkat direksi, dan eksekusi solusi bisnis.',
    focusArea: 'Problem Solving & Case',
    strictness: 'Struktur Analitis Ketat',
  },
];

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

interface SavedReportHistoryItem {
  id: string;
  candidateName: string;
  targetRole: string;
  personaName: string;
  consensusScore: number;
  verdictStatus: 'interview' | 'maybe' | 'reject';
  timestamp: string;
  appliedFixes: string[];
  cvSourceMode: 'saved' | 'upload' | 'text';
  selectedCvId: string;
  selectedPersonaId: string;
}

export const AiCvScreenerView: React.FC = () => {
  // Phase / View State: 'report' (Full Width Immersive Pipeline) vs 'setup' (Form Input & History List)
  const [activePhase, setActivePhase] = useState<'setup' | 'report'>('report');

  // Saved History State
  const [reportHistory, setReportHistory] = useState<SavedReportHistoryItem[]>([
    {
      id: 'hist-1',
      candidateName: 'Rizky Ramadhan, S.Kom',
      targetRole: 'Senior Fullstack Engineer',
      personaName: 'Startup',
      consensusScore: 91,
      verdictStatus: 'interview',
      timestamp: '6 Ags 2026, 20:30',
      appliedFixes: [],
      cvSourceMode: 'saved',
      selectedCvId: 'cv-1',
      selectedPersonaId: 'startup',
    },
    {
      id: 'hist-2',
      candidateName: 'Amanda Putri, S.Stat',
      targetRole: 'Data Analyst Specialist',
      personaName: 'Corporate',
      consensusScore: 82,
      verdictStatus: 'maybe',
      timestamp: '5 Ags 2026, 14:15',
      appliedFixes: [],
      cvSourceMode: 'saved',
      selectedCvId: 'cv-2',
      selectedPersonaId: 'corporate',
    },
  ]);

  // Source Mode Selection
  const [cvSourceMode, setCvSourceMode] = useState<'saved' | 'upload' | 'text'>('saved');
  const [selectedCvId, setSelectedCvId] = useState<string>('cv-1');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [rawCvText, setRawCvText] = useState('');

  // Target Job Role & Recruiter Persona
  const [targetRole, setTargetRole] = useState('Senior Fullstack Engineer');
  const [targetLevel, setTargetLevel] = useState<'Entry' | 'Mid' | 'Senior' | 'Manager'>('Mid');
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('startup');

  // Interactive Fixes State & One-Click Auto Optimization State
  const [appliedFixes, setAppliedFixes] = useState<string[]>([]);
  const [isAutoOptimizing, setIsAutoOptimizing] = useState(false);

  // Simulation & Pipeline State
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [hasRunPipeline, setHasRunPipeline] = useState(true);

  // Heatmap Overlay View Mode State
  const [showHeatmapOverlay, setShowHeatmapOverlay] = useState<boolean>(true);
  const [heatmapViewMode, setHeatmapViewMode] = useState<'heatmap' | 'f-pattern' | 'bbox' | 'ats-matrix'>('heatmap');

  // Interactive AI Recruiter Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: 'Halo! Saya AI Recruiter. Saya telah menganalisis CV Anda secara menyeluruh. Ada yang ingin Anda tanyakan tentang hasil screening atau cara meloloskan CV ini?',
      time: 'Baru saja',
    },
  ]);
  const [inputChatText, setInputChatText] = useState('');

  const selectedSavedCv = mockSavedCVs.find((c) => c.id === selectedCvId) || mockSavedCVs[0];
  const currentPersona = recruiterPersonas.find((p) => p.id === selectedPersonaId) || recruiterPersonas[0];

  // Execute RVE Pipeline based on user selections
  const rveReport = useMemo(() => {
    return runFullRvePipeline(
      cvSourceMode,
      selectedSavedCv,
      uploadedFile,
      rawCvText,
      targetRole,
      appliedFixes
    );
  }, [cvSourceMode, selectedCvId, uploadedFile, rawCvText, targetRole, appliedFixes]);

  const pipelineStepsList = [
    'STEP 1: Recruiter Vision — Memprediksi Pola Mata HRD 6 Detik...',
    'STEP 2: ATS Compatibility — Menguji Kata Kunci & Format Mesin ATS...',
    'STEP 3: AI Recruiter Screener — Menguji Evaluasi Multi-AI (GPT-5, Gemini, Claude)...',
    'STEP 4: Hiring Probability — Menghitung Skor Konsensus Peluang Panggilan Wawancara...',
    'STEP 5: Improvement Engine — Menyusun Langkah Optimasi CV Instant...',
  ];

  const handleFillDemoData = () => {
    setCvSourceMode('saved');
    setSelectedCvId('cv-1');
    setTargetRole('Senior Fullstack Engineer');
    setTargetLevel('Senior');
    setSelectedPersonaId('startup');
  };

  const handleStartRvePipeline = () => {
    if (cvSourceMode === 'upload' && !uploadedFile) {
      alert('Silakan pilih atau upload file CV Anda terlebih dahulu.');
      return;
    }
    if (cvSourceMode === 'text' && !rawCvText.trim()) {
      alert('Silakan tempelkan (paste) teks CV Anda.');
      return;
    }

    setIsProcessing(true);
    setPipelineStep(0);
    setHasRunPipeline(false);
    setActivePhase('report'); // Switch to full width report phase

    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      if (step < pipelineStepsList.length) {
        setPipelineStep(step);
      } else {
        clearInterval(interval);
        setIsProcessing(false);
        setHasRunPipeline(true);

        // Auto Save to Report History
        const newHistItem: SavedReportHistoryItem = {
          id: `hist-${Date.now()}`,
          candidateName:
            cvSourceMode === 'saved'
              ? selectedSavedCv.candidateName
              : cvSourceMode === 'upload'
              ? uploadedFile?.name || 'CV Upload'
              : 'CV Paste',
          targetRole,
          personaName: currentPersona.name,
          consensusScore: rveReport.consensusScore,
          verdictStatus: rveReport.verdictStatus,
          timestamp: new Date().toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          appliedFixes: [...appliedFixes],
          cvSourceMode,
          selectedCvId,
          selectedPersonaId,
        };

        setReportHistory((prev) => [newHistItem, ...prev.filter((h) => h.id !== newHistItem.id)]);
      }
    }, 400);
  };

  const handleLoadHistoryReport = (hist: SavedReportHistoryItem) => {
    setCvSourceMode(hist.cvSourceMode);
    if (hist.selectedCvId) setSelectedCvId(hist.selectedCvId);
    setSelectedPersonaId(hist.selectedPersonaId);
    setTargetRole(hist.targetRole);
    setAppliedFixes(hist.appliedFixes || []);
    setHasRunPipeline(true);
    setActivePhase('report'); // Switch to report view instantly
  };

  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setReportHistory((prev) => prev.filter((item) => item.id !== id));
  };

  // 10. Satu Tombol Besar: ✨ Optimalkan CV Saya (Auto Apply All Fixes)
  const handleAutoOptimizeCv = () => {
    setIsAutoOptimizing(true);
    setTimeout(() => {
      setAppliedFixes(['fix-1', 'fix-2', 'fix-3']);
      setIsAutoOptimizing(false);
      // Smooth scroll to top of verdict
      const elem = document.getElementById('verdict-summary-top');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    }, 600);
  };

  const handleApplyFix = (fixId: string) => {
    if (!appliedFixes.includes(fixId)) {
      setAppliedFixes((prev) => [...prev, fixId]);
    }
  };

  // Chat handling logic
  const handleSendChatMessage = (textToSend?: string) => {
    const query = textToSend || inputChatText;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      time: 'Baru saja',
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputChatText('');

    setTimeout(() => {
      let responseText = '';
      const lower = query.toLowerCase();

      if (lower.includes('ditolak') || lower.includes('kelemahan') || lower.includes('kurang')) {
        responseText = `Berdasarkan evaluasi konsensus ${currentPersona.name}, CV Anda berisiko tereliminasi karena seksi pengalaman kerja kedua belum memiliki metrik angka (%). Tambahkan metrik seperti "berhasil menghemat waktu 30%" agar skor naik ke 91%+!`;
      } else if (lower.includes('summary') || lower.includes('ringkasan')) {
        responseText = `Jika Anda mengubah ringkasan profil menjadi berorientasi hasil (seperti "Software Engineer 3+ tahun pengalaman dengan React & Node.js"), skor konsensus AI Recruiter akan langsung melesat menjadi 93%! Klik tombol "✨ Optimalkan CV Saya" untuk menerapkannya secara otomatis.`;
      } else if (lower.includes('100%') || lower.includes('sempurna')) {
        responseText = `Untuk mencapai 100% Sempurna, terapkan 3 rekomendasi utama: 1) Sertakan metrik %, 2) Perjelas tech stack utama di bagian atas, dan 3) Gunakan kata kerja aksi di setiap bullet point.`;
      } else {
        responseText = `Pertanyaan yang sangat baik! Hasil screening kami menunjukkan bahwa recruiter tipe ${currentPersona.name} akan langsung melihat seksi Pengalaman Kerja Anda dalam 3 detik pertama. Mengoptimalkan bagian tersebut akan memberikan dampak peningkatan paling dramatis.`;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: responseText,
        time: 'Baru saja',
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    }, 500);
  };

  return (
    <div className="space-y-6 md:space-y-8 w-full pb-16 font-sans transition-all duration-300">
      {/* Navigation Header Bar (Phase Switcher: Input & History vs Full Report View) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-500 text-white shadow-xs">
            <Sparkles className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>CUTI CV Intelligence Platform</span>
              <span className="text-[10px] font-bold text-orange-600 bg-orange-50 dark:bg-orange-950 px-2 py-0.5 rounded border border-orange-200 dark:border-orange-900">
                v2.0 Linear Pipeline
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluasi mendalam daya pikat CV terhadap HRD, ATS, dan AI Recruiter.
            </p>
          </div>
        </div>

        {/* Phase Toggle Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setActivePhase('setup')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activePhase === 'setup'
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 font-extrabold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Formulir &amp; Riwayat ({reportHistory.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePhase('report')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activePhase === 'report'
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 font-extrabold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Laporan Intelligence Full-Width</span>
          </button>
        </div>
      </div>

      {/* PHASE 1: SETUP & HISTORY LIST VIEW */}
      {activePhase === 'setup' && (
        <div className="space-y-6 w-full animate-in fade-in duration-300">
          {/* Header Banner */}
          <div className="p-6 rounded-2xl bg-[#0D3BD9] border border-blue-500/50 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 space-y-2 max-w-2xl">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950">
                Langkah 1: Konfigurasi CV &amp; Target Perusahaan
              </span>
              <h2 className="text-2xl font-black">Pilih CV &amp; Kriteria Recruiter Target Anda</h2>
              <p className="text-xs text-slate-200">
                Pilih salah satu dari 11 persona recruiter di bawah ini. Hasil evaluasi akan disimpan secara otomatis di riwayat laporan Anda.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Form: CV & Persona Selection */}
            <div className="lg:col-span-7 space-y-6">
              <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                {/* Recruiter Persona Selection (11 Tipe) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-slate-900 dark:text-white block">
                      Siapa Recruiter Anda? (11 Tipe Target Persona)
                    </label>
                    <span className="text-[10px] font-bold text-orange-600 bg-orange-50 dark:bg-orange-950 px-2 py-0.5 rounded border border-orange-200">
                      11 Tipe Persona
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {recruiterPersonas.map((persona) => {
                      const isSelected = selectedPersonaId === persona.id;
                      return (
                        <div
                          key={persona.id}
                          onClick={() => setSelectedPersonaId(persona.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 flex flex-col justify-between ${
                            isSelected
                              ? 'border-orange-500 bg-orange-50/70 dark:bg-orange-950/40 ring-2 ring-orange-500/20 shadow-xs'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                                <Users className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-orange-500' : 'text-slate-400'}`} />
                                <span>{persona.name}</span>
                              </span>
                              {isSelected ? (
                                <Check className="w-4 h-4 text-orange-500 shrink-0" />
                              ) : (
                                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded shrink-0">
                                  {persona.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                              {persona.description}
                            </p>
                          </div>

                          <div className="pt-1 flex items-center justify-between text-[9px] border-t border-slate-100 dark:border-slate-800">
                            <span className="text-slate-400 font-semibold">Strictness:</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                              {persona.strictness}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Role & Document Selection */}
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Nama Posisi Pekerjaan Target *
                      </label>
                      <input
                        type="text"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        placeholder="Contoh: Senior Fullstack Engineer"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Tingkat Senioritas
                      </label>
                      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold">
                        {(['Entry', 'Mid', 'Senior', 'Manager'] as const).map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setTargetLevel(lvl)}
                            className={`py-1.5 rounded-md transition text-center cursor-pointer ${
                              targetLevel === lvl
                                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 font-bold shadow-xs'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* CV Source Selection */}
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Pilih Berkas CV
                  </label>

                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setCvSourceMode('saved')}
                      className={`py-1.5 px-2 rounded-md transition text-center cursor-pointer ${
                        cvSourceMode === 'saved'
                          ? 'bg-white dark:bg-slate-900 text-navy-700 dark:text-white font-bold shadow-xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Tersimpan
                    </button>
                    <button
                      type="button"
                      onClick={() => setCvSourceMode('upload')}
                      className={`py-1.5 px-2 rounded-md transition text-center cursor-pointer ${
                        cvSourceMode === 'upload'
                          ? 'bg-white dark:bg-slate-900 text-navy-700 dark:text-white font-bold shadow-xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setCvSourceMode('text')}
                      className={`py-1.5 px-2 rounded-md transition text-center cursor-pointer ${
                        cvSourceMode === 'text'
                          ? 'bg-white dark:bg-slate-900 text-navy-700 dark:text-white font-bold shadow-xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Paste Teks
                    </button>
                  </div>

                  {cvSourceMode === 'saved' && (
                    <div className="space-y-2">
                      {mockSavedCVs.map((cv) => (
                        <div
                          key={cv.id}
                          onClick={() => setSelectedCvId(cv.id)}
                          className={`p-3.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                            selectedCvId === cv.id
                              ? 'border-navy-500 bg-navy-50/50 dark:bg-navy-950/40 ring-1 ring-navy-500/20 shadow-xs'
                              : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <FileText
                              className={`w-4 h-4 shrink-0 ${selectedCvId === cv.id ? 'text-navy-700 dark:text-navy-400' : 'text-slate-400'}`}
                            />
                            <div>
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{cv.candidateName}</h4>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                {cv.roleTitle} • {cv.updatedAt}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60">
                            {cv.atsScore}% ATS
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Action Button */}
                <button
                  type="button"
                  onClick={handleStartRvePipeline}
                  disabled={isProcessing}
                  className="w-full py-4 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-black text-xs shadow-md shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:-translate-y-0.5"
                >
                  <Sparkles className="w-4 h-4 fill-white" />
                  <span>Jalankan CUTI Recruiter Vision Pipeline &amp; Buka Laporan</span>
                </button>
              </div>
            </div>

            {/* Right Form: Riwayat Hasil Screening CV Saya */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-orange-500" />
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">
                        Riwayat Screening CV Saya
                      </h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Hasil evaluasi tersimpan otomatis tanpa perlu mengulang
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    {reportHistory.length} Hasil Tersimpan
                  </span>
                </div>

                {reportHistory.length === 0 ? (
                  <div className="p-8 text-center space-y-2 text-slate-400">
                    <Bookmark className="w-8 h-8 mx-auto stroke-1" />
                    <p className="text-xs font-medium">Belum ada riwayat hasil screening.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reportHistory.map((hist) => (
                      <div
                        key={hist.id}
                        onClick={() => handleLoadHistoryReport(hist)}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-orange-500/50 hover:bg-orange-50/40 dark:hover:bg-orange-950/30 transition-all cursor-pointer space-y-2 group shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-orange-600 transition">
                              {hist.candidateName}
                            </span>
                            <span className="text-[9px] font-bold bg-navy-50 text-navy-700 dark:bg-navy-950 dark:text-navy-300 px-1.5 py-0.5 rounded border border-navy-200 dark:border-navy-800">
                              {hist.personaName}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => handleDeleteHistory(hist.id, e)}
                            className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition opacity-0 group-hover:opacity-100"
                            title="Hapus riwayat ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                          {hist.targetRole}
                        </p>

                        <div className="flex items-center justify-between text-[10px] border-t border-slate-100 dark:border-slate-800/80 pt-2 text-slate-500 dark:text-slate-400">
                          <span>{hist.timestamp}</span>

                          <span className="font-black text-xs text-orange-500 flex items-center gap-1">
                            {hist.verdictStatus === 'interview' ? '🟢' : hist.verdictStatus === 'maybe' ? '🟡' : '🔴'}{' '}
                            {hist.consensusScore}% Consensus
                            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 2: IMMERSIVE FULL-WIDTH REPORT VIEW */}
      {activePhase === 'report' && (
        <div className="space-y-6 w-full animate-in fade-in duration-300">
          {/* Top Return Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <button
              type="button"
              onClick={() => setActivePhase('setup')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Formulir &amp; Riwayat</span>
            </button>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">
                Target: <strong className="text-slate-800 dark:text-slate-200">{targetRole}</strong> ({currentPersona.name})
              </span>
              <button
                type="button"
                onClick={handleStartRvePipeline}
                className="px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 font-bold border border-orange-200 dark:border-orange-900 hover:bg-orange-100 transition flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Analisis Ulang</span>
              </button>
            </div>
          </div>

          {/* Header Banner */}
          <div className="p-5 sm:p-6 md:p-8 rounded-2xl bg-[#0D3BD9] border border-blue-500/50 shadow-xl relative overflow-hidden text-white">
            <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-400 text-slate-950 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                  <span>CUTI CV Intelligence Platform</span>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                  Apakah CV Anda Akan Dipanggil Interview?
                </h1>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-200 pt-1 font-medium">
                  <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-md border border-white/15">
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Mata Recruiter (6 Detik)
                  </span>
                  <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-md border border-white/15">
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Filter Mesin ATS
                  </span>
                  <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-md border border-white/15">
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Multi-AI Recruiter (GPT-5, Gemini, Claude)
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleFillDemoData}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/15 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Isi Data Demo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Processing Animation */}
          {isProcessing && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-sm">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-orange-200 animate-ping" />
                <div className="relative w-16 h-16 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md">
                  <Sparkles className="w-8 h-8 animate-pulse text-white fill-white" />
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  CUTI Recruiter Vision Pipeline Sedang Berjalan
                </h3>
                <p className="text-xs text-orange-600 dark:text-orange-400 font-bold animate-pulse">
                  {pipelineStepsList[pipelineStep]}
                </p>
              </div>

              <div className="space-y-2 max-w-md mx-auto text-left">
                {pipelineStepsList.map((stepText, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    {idx < pipelineStep ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : idx === pipelineStep ? (
                      <RefreshCw className="w-4 h-4 text-orange-500 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-700 shrink-0" />
                    )}
                    <span
                      className={
                        idx === pipelineStep
                          ? 'font-bold text-orange-600 dark:text-orange-400'
                          : idx < pipelineStep
                          ? 'text-slate-500 dark:text-slate-400 line-through opacity-70'
                          : 'text-slate-400 dark:text-slate-500'
                      }
                    >
                      {stepText}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Master Full-Width Report Content */}
          {!isProcessing && hasRunPipeline && (
            <div className="space-y-6 w-full">
              {/* Top AI Summary Banner */}
              <div className="p-6 rounded-2xl bg-orange-500 text-white shadow-md space-y-3 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

                <div className="flex items-center justify-between border-b border-white/20 pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 fill-white text-white" />
                    <h3 className="font-extrabold text-xs uppercase tracking-wider">Ringkasan Evaluasi AI</h3>
                  </div>
                  <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded border border-white/20">
                    Estimasi Peluang: {rveReport.topAiSummary.estimatedProbability}%
                  </span>
                </div>

                <p className="text-xs font-semibold leading-relaxed">
                  {rveReport.topAiSummary.overview} Peluang panggilan interview saat ini diperkirakan{' '}
                  <strong className="underline decoration-amber-300 underline-offset-2">
                    {rveReport.topAiSummary.estimatedProbability}%
                  </strong>.
                </p>

                <div className="space-y-1.5 pt-1 text-xs">
                  <span className="text-[11px] font-bold text-amber-200 block">Poin Penyebab Peluang Belum 100%:</span>
                  <ul className="space-y-1">
                    {rveReport.topAiSummary.dropReasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-slate-100 text-[11px]">
                        <span className="text-amber-300 font-bold">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Overall Verdict & Confidence Banner + Before vs After Comparison */}
              <div
                id="verdict-summary-top"
                className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Hasil Konsensus Akhir
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-navy-50 dark:bg-navy-950 text-navy-700 dark:text-navy-300 border border-navy-200 dark:border-navy-800">
                        Target: {currentPersona.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">Overall Score</span>
                      <span className="text-3xl font-black text-orange-500">{rveReport.consensusScore}%</span>
                    </div>
                  </div>

                  {/* Verdict Status Indicator */}
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                    {rveReport.verdictStatus === 'interview' && (
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                        <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-xs" />
                        <span>🟢 Interview Recommended</span>
                      </div>
                    )}
                    {rveReport.verdictStatus === 'maybe' && (
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-extrabold text-sm">
                        <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-xs" />
                        <span>🟡 Dipertimbangkan (Maybe)</span>
                      </div>
                    )}
                    {rveReport.verdictStatus === 'reject' && (
                      <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-extrabold text-sm">
                        <span className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-xs" />
                        <span>🔴 Perlu Perbaikan (Reject)</span>
                      </div>
                    )}
                    <span className="text-[10px] font-bold text-slate-400 block border-l border-slate-200 dark:border-slate-700 pl-3">
                      Tingkat Kepercayaan: {rveReport.confidenceScore}%
                    </span>
                  </div>
                </div>

                {/* Perbandingan Sebelum & Sesudah Card */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Sebelum Optimasi</span>
                      <span className="text-base font-bold text-slate-500 line-through">
                        ATS {rveReport.beforeAfterComparison.beforeScore}%
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 block uppercase">
                        Setelah Optimasi
                      </span>
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                        {rveReport.beforeAfterComparison.afterScore}%
                      </span>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto">
                    +{rveReport.beforeAfterComparison.diff}% Peningkatan
                  </span>
                </div>

                {/* Gamification (Progress CV & Missing Checklist) */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Gauge className="w-4 h-4 text-orange-500" />
                      Progress Kesiapan CV
                    </span>
                    <span className="text-orange-500 font-extrabold">{rveReport.gamification.progress}% / 100%</span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                      style={{ width: `${rveReport.gamification.progress}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 text-[11px] pt-1">
                    {rveReport.gamification.checklist.map((item) => (
                      <span
                        key={item.id}
                        className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 font-semibold ${
                          item.isDone
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {item.isDone ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                        )}
                        <span>{item.label}</span>
                        <span className="font-bold text-[10px] opacity-80">(+{item.bonus}%)</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actionable Improvement Section High Priority Right After Verdict */}
                <div className="p-5 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-900/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-orange-500" />
                      <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                        Rekomendasi Perbaikan Prioritas Tinggi
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">
                      3 Poin Ditemukan
                    </span>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-orange-500">1.</span>
                      <span>Tambahkan metrik angka kuantitatif (%) pada pencapaian proyek di posisi kedua.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-orange-500">2.</span>
                      <span>Persingkat Executive Summary menjadi 2-3 kalimat berorientasi dampak langsung.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-orange-500">3.</span>
                      <span>Masukkan kata kunci spesifik stack (React, Node.js, TypeScript) di seksi teratas.</span>
                    </li>
                  </ul>

                  {/* Satu Tombol Besar: ✨ Optimalkan CV Saya */}
                  <button
                    type="button"
                    onClick={handleAutoOptimizeCv}
                    disabled={isAutoOptimizing}
                    className="w-full py-4 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-black text-sm shadow-md shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5 mt-2"
                  >
                    {isAutoOptimizing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Sedang Mengoptimalkan Seluruh CV...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 fill-white" />
                        <span>✨ Optimalkan CV Saya (Satu Klik Perbaiki Semua)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Timeline Stepper Navigation Bar */}
              <div className="sticky top-4 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md">
                <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar text-[11px] font-bold">
                  <a
                    href="#step-1-vision"
                    className="px-3.5 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 hover:bg-orange-100 transition shrink-0 flex items-center gap-1.5 border border-orange-200 dark:border-orange-900/60"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>STEP 1: Recruiter Vision</span>
                  </a>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  <a
                    href="#step-2-ats"
                    className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950/60 text-slate-700 dark:text-slate-300 hover:text-orange-600 transition shrink-0 flex items-center gap-1.5"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-navy-500" />
                    <span>STEP 2: ATS Matrix</span>
                  </a>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  <a
                    href="#step-3-ai-screener"
                    className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950/60 text-slate-700 dark:text-slate-300 hover:text-orange-600 transition shrink-0 flex items-center gap-1.5"
                  >
                    <Bot className="w-3.5 h-3.5 text-emerald-500" />
                    <span>STEP 3: AI Recruiter</span>
                  </a>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  <a
                    href="#step-4-prediction"
                    className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950/60 text-slate-700 dark:text-slate-300 hover:text-orange-600 transition shrink-0 flex items-center gap-1.5"
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                    <span>STEP 4: Hiring Forecast</span>
                  </a>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  <a
                    href="#step-5-improvement"
                    className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950/60 text-slate-700 dark:text-slate-300 hover:text-orange-600 transition shrink-0 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>STEP 5: Auto Improvement</span>
                  </a>
                </div>
              </div>

              {/* CONTINUOUS FULL-WIDTH PIPELINE SECTIONS */}
              <div className="space-y-8 w-full">
                {/* STEP 1: RECRUITER VISION & HEATMAP */}
                <div
                  id="step-1-vision"
                  className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 scroll-mt-20"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="space-y-1">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 inline-flex items-center gap-1">
                        <Eye className="w-3 h-3 text-rose-600" />
                        <span>STEP 1 — Human Simulation</span>
                      </span>
                      <h3 className="font-black text-xl text-slate-900 dark:text-white">
                        Recruiter Vision (Simulasi Pandangan HRD 6 Detik)
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Memprediksi lintasan mata recruiter saat pertama kali memindai kertas CV A4 Anda.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowHeatmapOverlay(!showHeatmapOverlay)}
                      className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                        showHeatmapOverlay
                          ? 'bg-orange-500 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                      <span>{showHeatmapOverlay ? 'Heatmap Overlay ON' : 'Heatmap Overlay OFF'}</span>
                    </button>
                  </div>

                  {/* Eye-Tracking Key Metrics Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Durasi Scan HRD
                      </span>
                      <div className="flex items-center gap-1.5 font-black text-base text-slate-900 dark:text-white">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span>6.4 Detik</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Durasi awal HR memindai halaman.</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Kesesuaian Pola-F (F-Pattern)
                      </span>
                      <div className="flex items-center gap-1.5 font-black text-base text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>{rveReport.fPatternScore}% Sesuai</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Lintasan mata sangat optimal.</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Hotspot Utama Eye-Tracking
                      </span>
                      <div className="flex items-center gap-1.5 font-black text-base text-rose-600 dark:text-rose-400">
                        <Flame className="w-4 h-4 text-rose-500" />
                        <span>Nama &amp; Metrik Angka</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Daya tarik utama recruiter.</p>
                    </div>
                  </div>

                  {/* View Mode Switcher */}
                  <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                    <span className="font-bold text-slate-400 mr-1">Layer Tampilan:</span>
                    {[
                      { id: 'heatmap', label: 'Gradien Heatmap Termal' },
                      { id: 'f-pattern', label: 'Lintasan Eye-Tracking Pola-F' },
                      { id: 'bbox', label: 'Bounding Box & Visual Weight' },
                      { id: 'ats-matrix', label: 'Matriks Korelasi ATS' },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setHeatmapViewMode(mode.id as any)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          heatmapViewMode === mode.id
                            ? 'bg-navy-700 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>

                  {/* Embedded Real A4 Heatmap Canvas */}
                  <div className="pt-2">
                    <A4HeatmapCanvas
                      parsedData={rveReport.parsedData}
                      boundingBoxes={rveReport.boundingBoxes}
                      fixationPoints={rveReport.fixationPoints}
                      atsCorrelations={rveReport.atsCorrelations}
                      viewMode={heatmapViewMode}
                      showOverlay={showHeatmapOverlay}
                      targetLevel={targetLevel}
                    />
                  </div>
                </div>

                {/* STEP 2: ATS COMPATIBILITY MATRIX */}
                <div
                  id="step-2-ats"
                  className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 scroll-mt-20"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="space-y-1">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 inline-flex items-center gap-1">
                        <BarChart3 className="w-3 h-3 text-blue-600" />
                        <span>STEP 2 — Machine Filter</span>
                      </span>
                      <h3 className="font-black text-xl text-slate-900 dark:text-white">
                        ATS Compatibility &amp; Keyword Density Matrix
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Memetakan visibilitas kata kunci utama terhadap filter otomatis sistem Applicant Tracking System.
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-3xl font-black text-navy-700 dark:text-navy-300">{rveReport.atsScore}%</span>
                      <span className="text-[10px] text-slate-400 block font-semibold">Skor ATS</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rveReport.atsCorrelations.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{item.keyword}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              item.quadrant === 'gold'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            }`}
                          >
                            {item.quadrant === 'gold' ? 'Area Emas' : 'Kurang ATS'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">{item.recommendation}</p>
                        <div className="flex items-center justify-between text-[10px] pt-1 text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-700/60">
                          <span>Visibilitas Mata: <strong className="text-slate-800 dark:text-slate-200">{item.visibilityScore}%</strong></span>
                          <span>Skor ATS: <strong className="text-slate-800 dark:text-slate-200">{item.atsScore}%</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* STEP 3: AI RECRUITER SIMULATION (GPT-5, Gemini, Claude Cards) */}
                <div
                  id="step-3-ai-screener"
                  className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 scroll-mt-20"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="space-y-1">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60 inline-flex items-center gap-1">
                        <Bot className="w-3 h-3 text-emerald-600" />
                        <span>STEP 3 — Primary Selling Point</span>
                      </span>
                      <h3 className="font-black text-xl text-slate-900 dark:text-white">
                        AI Recruiter Simulation (GPT-5 • Gemini • Claude)
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Perusahaan modern saat ini menyaring kandidat menggunakan prompt AI Recruiter. Kami mensimulasikannya secara bersamaan.
                      </p>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-950/80 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center shrink-0">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block uppercase">Consensus Score</span>
                      <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{rveReport.consensusScore}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {rveReport.aiEvaluations.map((ai) => (
                      <div
                        key={ai.modelName}
                        className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4 flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                            <span className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                              <Cpu className="w-4 h-4 text-orange-500" />
                              {ai.modelName}
                            </span>
                            <span className="text-sm font-black text-orange-500 bg-orange-50 dark:bg-orange-950 px-2.5 py-0.5 rounded border border-orange-200 dark:border-orange-900">
                              {ai.score}%
                            </span>
                          </div>

                          <div className="space-y-2 pt-1 text-xs">
                            <span className="text-[10px] font-bold uppercase text-slate-400 block">Kelebihan Utama:</span>
                            {ai.pros.map((p, i) => (
                              <div key={i} className="flex items-start gap-1.5 text-emerald-700 dark:text-emerald-300 text-xs leading-snug">
                                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                <span>{p}</span>
                              </div>
                            ))}
                          </div>

                          <div className="space-y-2 pt-1 text-xs">
                            <span className="text-[10px] font-bold uppercase text-slate-400 block">Catatan Evaluasi:</span>
                            {ai.cons.map((c, i) => (
                              <div key={i} className="flex items-start gap-1.5 text-amber-700 dark:text-amber-300 text-xs leading-snug">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                <span>{c}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* STEP 4: HIRING FORECAST & INTERACTIVE CHATBOT */}
                <div
                  id="step-4-prediction"
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start scroll-mt-20"
                >
                  {/* Left: Predicted Questions */}
                  <div className="lg:col-span-7 p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="space-y-1">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/60 inline-flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-purple-600" />
                          <span>STEP 4 — Interview Forecast</span>
                        </span>
                        <h3 className="font-black text-lg text-slate-900 dark:text-white">
                          Prediksi Pertanyaan Wawancara dari Hotspot CV
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs">
                      {rveReport.predictedInterviewQuestions.map((q, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 flex items-start gap-3 text-slate-800 dark:text-slate-200 hover:border-slate-300 transition-all"
                        >
                          <span className="w-5 h-5 rounded-full bg-orange-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                            {idx + 1}
                          </span>
                          <p className="font-medium leading-relaxed">{q}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Tanya Recruiter AI Interactive Panel */}
                  <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Bot className="w-5 h-5 text-orange-500" />
                        <div>
                          <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">Tanya Recruiter AI</h3>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">Interaksi &amp; Konsultasi Hasil CV</p>
                        </div>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Recruiter AI Active" />
                    </div>

                    {/* Message History */}
                    <div className="space-y-3 max-h-64 overflow-y-auto text-xs pr-1 no-scrollbar">
                      {chatMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] p-3.5 rounded-xl leading-relaxed text-xs ${
                              msg.sender === 'user'
                                ? 'bg-orange-500 text-white font-medium rounded-tr-none'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/70 dark:border-slate-700/70'
                            }`}
                          >
                            <p>{msg.text}</p>
                            <span
                              className={`text-[9px] block mt-1 text-right ${
                                msg.sender === 'user' ? 'text-orange-100' : 'text-slate-400 dark:text-slate-500'
                              }`}
                            >
                              {msg.time}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Quick Suggestion Chips */}
                    <div className="flex flex-wrap gap-1.5 text-[10px]">
                      <button
                        type="button"
                        onClick={() => handleSendChatMessage('Mengapa CV saya belum 100%?')}
                        className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950 hover:text-orange-600 dark:hover:text-orange-400 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition cursor-pointer font-medium"
                      >
                        💡 Mengapa CV belum 100%?
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendChatMessage('Bagaimana kalau saya ganti summary?')}
                        className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950 hover:text-orange-600 dark:hover:text-orange-400 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition cursor-pointer font-medium"
                      >
                        ✏️ Ganti summary?
                      </button>
                    </div>

                    {/* Input */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <input
                        type="text"
                        value={inputChatText}
                        onChange={(e) => setInputChatText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                        placeholder="Tanyakan ke Recruiter AI..."
                        className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => handleSendChatMessage()}
                        className="p-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* STEP 5: AUTO IMPROVEMENT & REWRITE FIXES */}
                <div
                  id="step-5-improvement"
                  className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 scroll-mt-20"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="space-y-1">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 inline-flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>STEP 5 — Auto Improvement</span>
                      </span>
                      <h3 className="font-black text-xl text-slate-900 dark:text-white">
                        Perbandingan Sebelum &amp; Sesudah Kalimat CV
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Klik tombol di tiap seksi untuk menerapkan perbaikan secara manual, atau gunakan tombol otomatis di atas.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {rveReport.beforeAfterFixes.map((fix) => {
                      const isApplied = appliedFixes.includes(fix.id);
                      return (
                        <div
                          key={fix.id}
                          className={`p-5 rounded-2xl border transition-all space-y-3 text-xs ${
                            isApplied
                              ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">{fix.section}</span>
                            <button
                              type="button"
                              onClick={() => handleApplyFix(fix.id)}
                              disabled={isApplied}
                              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                isApplied
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 cursor-default'
                                  : 'bg-orange-500 hover:bg-orange-600 text-white shadow-xs'
                              }`}
                            >
                              {isApplied ? '✓ Telah Diterapkan (+5% Skor)' : '+ Terapkan Perbaikan ini'}
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200">
                              <span className="font-bold text-[10px] uppercase text-rose-600 dark:text-rose-400 block">
                                Sebelum (Kurang Optimal):
                              </span>
                              <p className="mt-1 leading-snug">{fix.before}</p>
                            </div>

                            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200">
                              <span className="font-bold text-[10px] uppercase text-emerald-600 dark:text-emerald-400 block">
                                Sesudah Optimasi AI:
                              </span>
                              <p className="mt-1 leading-snug">{fix.after}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
