'use client';

import React, { useState, useMemo } from 'react';
import {
  Bot,
  UserCheck,
  UserX,
  FileSearch,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  Sparkles,
  Upload,
  FileText,
  RefreshCw,
  Sliders,
  Building2,
  Briefcase,
  ChevronRight,
  Info,
  Target,
  MessageSquare,
  HelpCircle,
  Zap,
  Check,
  ArrowRight,
  SlidersHorizontal,
  BarChart3,
  Search,
  Eye,
  Flame,
  Focus,
  Layers,
  Activity,
  TrendingUp,
  Maximize2,
  Clock,
} from 'lucide-react';

interface SavedCvItem {
  id: string;
  title: string;
  role: string;
  candidateName: string;
  email: string;
  location: string;
  updatedAt: string;
  atsScore: number;
  summary: string;
  company: string;
  period: string;
  achievements: string[];
  metricsHighlight: string[];
  skills: string[];
  education: string;
  hobbies: string;
}

const mockSavedCVs: SavedCvItem[] = [
  {
    id: 'cv-1',
    title: 'CV Utama - Fullstack Software Engineer',
    role: 'Fullstack Developer',
    candidateName: 'Rizky Ramadhan, S.Kom',
    email: 'rizky.dev@email.com',
    location: 'Jakarta, Indonesia',
    updatedAt: '22 Juli 2026',
    atsScore: 88,
    summary: 'Software Engineer dengan 3+ tahun pengalaman membangun aplikasi web performa tinggi menggunakan React.js, Next.js, & Node.js. Berhasil meningkatkan kecepatan load hingga 35%.',
    company: 'PT Tech Innovation Indonesia',
    period: '2023 - Sekarang',
    achievements: [
      'Mengembangkan 12+ modul web berbasis React.js & TypeScript, berhasil mempercepat render 35%.',
      'Memimpin tim yang terdiri dari 5 developer dan memangkas bug produk hingga 40% dalam 6 bulan.',
    ],
    metricsHighlight: ['35%', '40%', '12+'],
    skills: ['React.js', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    education: 'S1 Teknik Informatika — Universitas Indonesia (IPK 3.82)',
    hobbies: 'Bahasa Indonesia (Native), Bahasa Inggris (Professional), Hobi: Futsal & Catur.',
  },
  {
    id: 'cv-2',
    title: 'CV Data Analyst & Business Intelligence',
    role: 'Data Analyst',
    candidateName: 'Amanda Putri, S.Stat',
    email: 'amanda.data@email.com',
    location: 'Bandung, Indonesia',
    updatedAt: '18 Juli 2026',
    atsScore: 82,
    summary: 'Data Analyst berdedikasi dengan keahlian Python, SQL, Tableau, & Power BI. Berhasil mengolah 2 juta+ baris data transaksi untuk menghemat biaya operasional 25%.',
    company: 'PT Fintek Analytics Nusantara',
    period: '2022 - Sekarang',
    achievements: [
      'Membangun 15+ Interactive Dashboard Tableau & Power BI untuk jajaran Direksi.',
      'Mengoptimalkan query SQL database PostgreSQL, menghemat waktu eksekusi laporan mingguan sebesar 50%.',
    ],
    metricsHighlight: ['2 juta+', '25%', '50%'],
    skills: ['Python', 'SQL', 'Tableau', 'Power BI', 'Data Modeling', 'Excel Advanced'],
    education: 'S1 Statistika — Institut Teknologi Bandung (IPK 3.75)',
    hobbies: 'Bahasa Indonesia (Native), Bahasa Inggris (Fluent), Hobi: Reading & Data Visualization.',
  },
  {
    id: 'cv-3',
    title: 'CV Product Manager & Strategy',
    role: 'Product Manager',
    candidateName: 'Budi Pratama, S.T.',
    email: 'budi.pm@email.com',
    location: 'Surabaya, Indonesia',
    updatedAt: '10 Juni 2026',
    atsScore: 79,
    summary: 'Product Manager berpengalaman memimpin tim cross-functional 10+ member. Mengembangkan roadmap produk B2B SaaS dengan retensi pengguna meningkat 45%.',
    company: 'PT Solusi Digital SaaS',
    period: '2021 - Sekarang',
    achievements: [
      'Memimpin pengiriman 8 fitur utama di JIRA & Figma, menaikkan Monthly Active Users (MAU) sebesar 60%.',
      'Merancang strategi Onboarding pengguna baru, menekan Churn Rate sebesar 18%.',
    ],
    metricsHighlight: ['45%', '60%', '18%'],
    skills: ['Agile / Scrum', 'Product Roadmap', 'Wireframing', 'JIRA', 'User Research'],
    education: 'S1 Teknik Industri — Universitas Gadjah Mada (IPK 3.68)',
    hobbies: 'Bahasa Indonesia (Native), Bahasa Inggris (Professional), Hobi: Basket & Podcasting.',
  },
];

const hrdPersonas = [
  {
    id: 'tech-startup',
    name: 'AI Recruiter Tech Startup / Unicorn',
    description: 'Prioritas pada kecepatan eksekusi, portofolio proyek nyata, stack teknologi modern, dan dampak bisnis langsung.',
    strictness: 'Sedang - Berfokus pada Skill Praktis',
    icon: Zap,
  },
  {
    id: 'corporate-bumn',
    name: 'AI Screening Corporate & BUMN',
    description: 'Prioritas pada kesesuaian latar belakang pendidikan, IPK, kualifikasi formal, dan format standar tanpa celah.',
    strictness: 'Tinggi - Sangat Ketat pada Aturan ATS',
    icon: Building2,
  },
  {
    id: 'multinational',
    name: 'AI Recruiter Multinational Company',
    description: 'Prioritas pada metrics angka (pencapaian terukur %), kepemimpinan, bahasa Inggris bisnis, dan kepemimpinan proyek.',
    strictness: 'Tinggi - Berfokus pada Impact & Numbers',
    icon: Briefcase,
  },
];

export const AiCvScreenerView: React.FC = () => {
  // Source Mode Selection
  const [cvSourceMode, setCvSourceMode] = useState<'saved' | 'upload' | 'text'>('saved');
  const [selectedCvId, setSelectedCvId] = useState<string>('cv-1');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [rawCvText, setRawCvText] = useState('');

  // Target Job Role & HRD Persona
  const [targetRole, setTargetRole] = useState('Senior Fullstack Engineer');
  const [targetLevel, setTargetLevel] = useState<'Entry' | 'Mid' | 'Senior' | 'Manager'>('Mid');
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('tech-startup');

  // Screening Simulation State
  const [isScreening, setIsScreening] = useState(false);
  const [screeningStep, setScreeningStep] = useState(0);
  const [hasScreened, setHasScreened] = useState(true); // Default to showing results for immediate preview

  // Added Custom Fix State
  const [appliedFixes, setAppliedFixes] = useState<string[]>([]);

  // Heatmap Analysis State
  const [showHeatmapOverlay, setShowHeatmapOverlay] = useState<boolean>(true);
  const [heatmapFilter, setHeatmapFilter] = useState<'all' | 'f-pattern' | 'keywords' | 'metrics'>('all');

  // Active CV Data calculation based on user selection / upload / text input
  const activeCvData = useMemo(() => {
    if (cvSourceMode === 'saved') {
      const found = mockSavedCVs.find((c) => c.id === selectedCvId);
      return found || mockSavedCVs[0];
    }

    if (cvSourceMode === 'upload') {
      const fileName = uploadedFile ? uploadedFile.name : 'Dokumen_CV_Uploaded.pdf';
      const nameFromFileName = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      return {
        id: 'uploaded-cv',
        title: fileName,
        role: targetRole || 'Professional Candidate',
        candidateName: nameFromFileName ? nameFromFileName.toUpperCase() : 'KANDIDAT CV UPLOAD',
        email: 'kandidat.upload@email.com',
        location: 'Indonesia',
        updatedAt: 'Baru Saja',
        atsScore: 85,
        summary: `Hasil ekstraksi dokumen ${fileName}. Memiliki kualifikasi dan pengalaman yang relevan untuk target peran ${targetRole} (${targetLevel} Level) dengan keterbacaan parser AI.`,
        company: `Pengalaman Utama / Proyek (${targetRole})`,
        period: '2023 - Sekarang',
        achievements: [
          `Pengalaman diekstrak dari dokumen ${fileName}, selaras dengan kebutuhan peran ${targetRole}.`,
          `Pencapaian operasional terukur yang sesuai standar kualifikasi ${targetLevel} Level.`,
        ],
        metricsHighlight: ['100%', targetLevel, 'ATS Parsed'],
        skills: [targetRole, 'PDF/Word Parsed', 'ATS Compliant', 'Skill Extraction'],
        education: 'Sertifikasi / Ringkasan Pendidikan Terlampir dalam File',
        hobbies: `Dokumen Sumber: ${fileName}`,
      };
    }

    // cvSourceMode === 'text'
    const trimmedText = rawCvText.trim();
    const textLines = trimmedText ? trimmedText.split('\n').filter((l) => l.trim().length > 0) : [];
    const candidateName = textLines[0] || 'KANDIDAT TEKS PASTE';
    const summaryText = textLines.length > 1 ? textLines.slice(1, 3).join(' ') : 'Teks CV telah ditempel dan diproses secara dinamis oleh mesin heatmap AI.';

    return {
      id: 'text-cv',
      title: 'CV Teks Tempel (Direct Paste)',
      role: targetRole || 'Job Candidate',
      candidateName: candidateName,
      email: 'kandidat.text@email.com',
      location: 'Indonesia',
      updatedAt: 'Baru Saja',
      atsScore: 80,
      summary: summaryText,
      company: `Pengalaman Kerja (${targetRole})`,
      period: '2021 - Sekarang',
      achievements: textLines.length > 3 ? textLines.slice(3, 6) : ['Mengimplementasikan proyek utama dan mencapai kualifikasi yang dipersyaratkan.'],
      metricsHighlight: ['80%', 'Direct Paste'],
      skills: [targetRole, 'Direct Paste Text', 'Extracted Keywords'],
      education: 'Data Pendidikan dalam Teks',
      hobbies: 'Informasi Tambahan Teks',
    };
  }, [cvSourceMode, selectedCvId, uploadedFile, rawCvText, targetRole, targetLevel]);

  // Simulation Results Data
  const currentPersona = hrdPersonas.find((p) => p.id === selectedPersonaId) || hrdPersonas[0];

  const screeningStepsList = [
    'Parsing dokumen CV dengan Algoritma HRD AI...',
    'Memeriksa Kepatuhan Format ATS & Keterbacaan Struktur...',
    'Mengekstrak Kata Kunci & Density Skill Kualifikasi...',
    'Menguji Impact Metrik & Pencapaian Kuantitatif...',
    'Mendeteksi Red Flags (Gap Karir, Typo, Klise)...',
    'Menerbitkan Keputusan Pre-Screening Recruiter...',
  ];

  // Calculated Results
  const basePassedScore = 84 + (appliedFixes.length * 4);
  const decisionStatus = basePassedScore >= 85 ? 'SHORTLISTED' : basePassedScore >= 70 ? 'WAITLISTED' : 'REJECTED';

  const screeningResults = {
    overallScore: basePassedScore,
    status: decisionStatus,
    recruiterVerdict:
      decisionStatus === 'SHORTLISTED'
        ? 'Lolos Pre-Screening AI! Kandidat direkomendasikan masuk ke tahap Interview Pertama HRD.'
        : decisionStatus === 'WAITLISTED'
        ? 'Masuk Daftar Pertimbangan (Waitlisted). CV memenuhi syarat dasar tetapi membutuhkan beberapa bukti impact yang lebih kuat.'
        : 'Gagal Screening AI. CV kurang memiliki kata kunci spesifik dan metrik pencapaian yang disyaratkan.',
    hrdAiNotes:
      selectedPersonaId === 'tech-startup'
        ? 'CV menunjukkan portofolio yang sangat relevan dengan React & Next.js. AI mencatat pengalaman 3 tahun aktif dalam pengembangan sistem skala besar. Penulisan clean dan siap dipanggil wawancara.'
        : selectedPersonaId === 'corporate-bumn'
        ? 'Latar belakang pendidikan selaras. Format CV bersih tanpa elemen grafis yang membingungkan parser ATS. Direkomendasikan untuk panggilan tes tahap berikutnya.'
        : 'Pencapaian kinerja dijabarkan dengan cukup jelas. Rekomendasi panggilan wawancara untuk mendalami kepemimpinan teknis kandidat.',
    parameters: [
      { name: 'Keterbacaan Parser AI (Parseability)', score: 92, status: 'Sangat Baik' },
      { name: 'Kepadatan Kata Kunci (Keyword Match)', score: 86 + (appliedFixes.length * 3), status: 'Sesuai Target' },
      { name: 'Kuantifikasi Pencapaian (Impact %)', score: 78 + (appliedFixes.length * 5), status: 'Perlu Ditingkatkan' },
      { name: 'Kejelasan Karir & Bebas Red Flag', score: 95, status: 'Bebas Masalah' },
    ],
    redFlagsDetected: [
      {
        type: 'Minor',
        title: 'Kurang Pencapaian Berbasis Angka pada Pengalaman Terbaru',
        detail: 'AI Recruiter mencari angka % atau nominal (misal: "Meningkatkan kecepatan load 30%").',
      },
      {
        type: 'Info',
        title: 'Kata Kunci Pengujian Otomatis Belum Terdeteksi',
        detail: 'Lowongan biasanya mengutamakan kandidat yang menuliskan Testing (Jest/Cypress).',
      },
    ],
    beforeAfterFixes: [
      {
        id: 'fix-1',
        section: 'Pengalaman Kerja (Software Engineer)',
        before: 'Mengembangkan dan memelihara aplikasi web perusahaan menggunakan React.js.',
        after: 'Mengembangkan 12+ modul web berbasis React.js & TypeScript, berhasil mempercepat waktu render sebesar 35%.',
      },
      {
        id: 'fix-2',
        section: 'Ringkasan Profil (Summary)',
        before: 'Saya adalah developer yang bersemangat dan pekerja keras dalam tim.',
        after: 'Software Engineer dengan 3+ tahun pengalaman membangun aplikasi web skala tinggi menggunakan Next.js dan Node.js.',
      },
    ],
    predictedHrdQuestions: [
      'Bisa ceritakan pengalaman tersulit kamu saat mengoptimalkan performa aplikasi Next.js?',
      'Bagaimana cara kamu memastikan kualitas kode saat bekerja dalam ritme pengiriman yang cepat?',
      'Apa metodologi utama yang kamu gunakan saat berkolaborasi dengan tim Product dan Designer?',
    ],
  };

  const handleStartScreening = () => {
    if (cvSourceMode === 'upload' && !uploadedFile) {
      alert('Silakan pilih atau upload file CV Anda terlebih dahulu.');
      return;
    }
    if (cvSourceMode === 'text' && !rawCvText.trim()) {
      alert('Silakan tempelkan (paste) teks CV Anda.');
      return;
    }

    setIsScreening(true);
    setScreeningStep(0);
    setHasScreened(false);

    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      if (step < screeningStepsList.length) {
        setScreeningStep(step);
      } else {
        clearInterval(interval);
        setIsScreening(false);
        setHasScreened(true);
      }
    }, 600);
  };

  const handleApplyFix = (fixId: string) => {
    if (!appliedFixes.includes(fixId)) {
      setAppliedFixes((prev) => [...prev, fixId]);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 w-full">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-linear-to-r from-slate-900 via-violet-950 to-slate-900 text-white p-5 sm:p-6 md:p-8 shadow-xl border border-slate-800">
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 flex items-center gap-1 shadow-sm">
              <Bot className="w-3.5 h-3.5" /> HRD AI Pre-Screening Simulator
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30">
              Uji Kelolosan CV Sebelum Dilamar
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-snug">
            Tes Screening CV dengan AI Recruiter
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Perusahaan modern menggunakan AI untuk menyeleksi ratusan CV secara otomatis. Uji sejauh mana CV kamu dapat lolos filter algoritma HRD AI sebelum mendaftar!
          </p>
        </div>

        {/* Ambient Glow */}
        <div className="absolute right-0 top-0 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Config Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* STEP 1: Choose Persona Recruiter */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold text-xs shrink-0">
                1
              </div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                Pilih Tipe AI Recruiter / Company Target
              </h2>
            </div>

            <div className="space-y-2.5">
              {hrdPersonas.map((persona) => {
                const IconComponent = persona.icon;
                const isSelected = selectedPersonaId === persona.id;
                return (
                  <div
                    key={persona.id}
                    onClick={() => setSelectedPersonaId(persona.id)}
                    className={`p-3.5 rounded-lg border transition cursor-pointer space-y-1.5 ${
                      isSelected
                        ? 'border-violet-600 bg-violet-50/70 dark:bg-violet-950/50 ring-2 ring-violet-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className={`w-4 h-4 ${isSelected ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400'}`} />
                        <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                          {persona.name}
                        </h3>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />}
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      {persona.description}
                    </p>

                    <div className="pt-1 flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-slate-400">Filter Strictness:</span>
                      <span className="font-bold text-violet-600 dark:text-violet-400">{persona.strictness}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Target Position & Level */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold text-xs shrink-0">
                2
              </div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                Posisi &amp; Tingkat Senioritas
              </h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nama Posisi Pekerjaan yang Dites
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="Contoh: Frontend Developer / Data Analyst"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Tingkat Senioritas (Level)
                </label>
                <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-lg text-xs font-semibold">
                  {(['Entry', 'Mid', 'Senior', 'Manager'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setTargetLevel(lvl)}
                      className={`py-1.5 rounded-lg transition text-center cursor-pointer ${
                        targetLevel === lvl
                          ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 font-bold shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: Choose CV Source */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold text-xs shrink-0">
                3
              </div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                Pilih Dokumen CV
              </h2>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setCvSourceMode('saved')}
                className={`py-1.5 px-2 rounded-lg transition text-center cursor-pointer ${
                  cvSourceMode === 'saved'
                    ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Tersimpan
              </button>

              <button
                type="button"
                onClick={() => setCvSourceMode('upload')}
                className={`py-1.5 px-2 rounded-lg transition text-center cursor-pointer ${
                  cvSourceMode === 'upload'
                    ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Upload Baru
              </button>

              <button
                type="button"
                onClick={() => setCvSourceMode('text')}
                className={`py-1.5 px-2 rounded-lg transition text-center cursor-pointer ${
                  cvSourceMode === 'text'
                    ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 font-bold shadow-xs'
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
                    className={`p-3 rounded-lg border transition cursor-pointer flex items-center justify-between gap-2 ${
                      selectedCvId === cv.id
                        ? 'border-violet-600 bg-violet-50/60 dark:bg-violet-950/40 ring-1 ring-violet-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className={`w-4 h-4 shrink-0 ${selectedCvId === cv.id ? 'text-violet-600' : 'text-slate-400'}`} />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {cv.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          {cv.role} • Diperbarui {cv.updatedAt}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      {cv.atsScore}% ATS
                    </span>
                  </div>
                ))}
              </div>
            )}

            {cvSourceMode === 'upload' && (
              <div className="p-5 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-center space-y-2">
                <Upload className="w-6 h-6 text-violet-500 mx-auto" />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Upload PDF / Word CV Kamu
                </p>
                <label className="inline-block px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-bold cursor-pointer hover:bg-violet-700 transition">
                  Pilih File
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadedFile(e.target.files[0]);
                      }
                    }}
                  />
                </label>
                {uploadedFile && (
                  <p className="text-xs text-emerald-600 font-bold block mt-1">
                    ✓ File terpilih: {uploadedFile.name}
                  </p>
                )}
              </div>
            )}

            {cvSourceMode === 'text' && (
              <textarea
                rows={5}
                value={rawCvText}
                onChange={(e) => setRawCvText(e.target.value)}
                placeholder="Tempelkan isi teks CV Anda di sini..."
                className="w-full p-3 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
              />
            )}

            {/* Test Action Button */}
            <button
              type="button"
              onClick={handleStartScreening}
              disabled={isScreening}
              className="w-full py-3 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isScreening ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>HRD AI Sedang Memeriksa CV...</span>
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4 text-amber-300" />
                  <span>Jalankan Tes Screening HRD AI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Screening Results (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Loading Animation Box */}
          {isScreening && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-6 shadow-sm">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-violet-200 dark:border-violet-900 animate-ping" />
                <div className="relative w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg border border-slate-800">
                  <Bot className="w-8 h-8 animate-bounce text-amber-300" />
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Simulasi Recruiter AI Sedang Memeriksa CV Anda
                </h3>
                <p className="text-xs text-violet-600 dark:text-violet-400 font-bold animate-pulse">
                  {screeningStepsList[screeningStep]}
                </p>
              </div>

              {/* Steps Progress */}
              <div className="space-y-2 max-w-sm mx-auto text-left">
                {screeningStepsList.map((stepText, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    {idx < screeningStep ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : idx === screeningStep ? (
                      <RefreshCw className="w-4 h-4 text-violet-600 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-700 shrink-0" />
                    )}
                    <span
                      className={
                        idx === screeningStep
                          ? 'font-bold text-violet-600 dark:text-violet-400'
                          : idx < screeningStep
                          ? 'text-slate-600 dark:text-slate-300 line-through opacity-70'
                          : 'text-slate-400'
                      }
                    >
                      {stepText}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Screening Output Display */}
          {!isScreening && hasScreened && (
            <div className="space-y-6">
              {/* Verdict Header Card */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold tracking-wide uppercase bg-violet-50 text-violet-700 dark:bg-violet-950/80 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/60">
                        {currentPersona.name}
                      </span>
                    </div>
                    <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                      Target: {targetRole}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Level Senioritas: <span className="font-bold text-slate-700 dark:text-slate-200">{targetLevel} Level</span>
                    </p>
                  </div>

                  {/* Status Badge & Score Box */}
                  <div className="flex items-center gap-3 bg-slate-50/80 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shrink-0">
                    <div className="w-14 h-14 rounded-lg bg-emerald-500 text-white flex flex-col items-center justify-center font-black text-lg shrink-0 shadow-xs">
                      <span>{screeningResults.overallScore}%</span>
                      <span className="text-[9px] font-bold text-emerald-100 uppercase -mt-1">Skor</span>
                    </div>

                    <div className="space-y-1">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                        screeningResults.status === 'SHORTLISTED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                      }`}>
                        {screeningResults.status === 'SHORTLISTED' ? (
                          <>
                            <UserCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>SHORTLISTED</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                            <span>WAITLISTED</span>
                          </>
                        )}
                      </span>
                      <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 max-w-[180px] leading-tight">
                        {screeningResults.status === 'SHORTLISTED' ? 'Lolos Pre-Screening AI' : 'Membutuhkan Pertimbangan'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Verdict Message Box */}
                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5 text-xs">
                  <Info className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
                  <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {screeningResults.recruiterVerdict}
                  </p>
                </div>

                {/* Recruiter Note Box */}
                <div className="p-4 rounded-lg bg-violet-50/70 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900/60 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-violet-700 dark:text-violet-300">
                    <Bot className="w-4 h-4 text-violet-600" />
                    <span>Catatan Evaluasi Internal Recruiter AI:</span>
                  </div>
                  <p className="text-xs text-violet-900/80 dark:text-violet-200/80 leading-relaxed pl-6">
                    &ldquo;{screeningResults.hrdAiNotes}&rdquo;
                  </p>
                </div>

                {/* 4 Core Parameter Meters */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Parameter Penilaian AI Recruiter
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {screeningResults.parameters.map((param, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5"
                      >
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {param.name}
                          </span>
                          <span className="font-black text-violet-600 dark:text-violet-400">
                            {param.score}%
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full bg-violet-600 transition-all duration-300"
                            style={{ width: `${param.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* HEATMAP ANALYSIS FEATURE */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold tracking-wide uppercase bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                        <span>Eye-Tracking Simulation</span>
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                        Eye-Catching: 88/100
                      </span>
                    </div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <Eye className="w-5 h-5 text-rose-500" />
                      <span>Analisis Heatmap Focus HRD (6-Second Scan)</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Simulasi bagian CV Anda yang paling pertama dilihat &amp; menarik perhatian mata recruiter dalam 6 detik pertama.
                    </p>
                  </div>

                  {/* Toggle Switch Overlay */}
                  <button
                    type="button"
                    onClick={() => setShowHeatmapOverlay(!showHeatmapOverlay)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                      showHeatmapOverlay
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{showHeatmapOverlay ? 'Heatmap Overlay ON' : 'Heatmap Overlay OFF'}</span>
                  </button>
                </div>

                {/* Filter Chips */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-400 mr-1">Filter Fokus:</span>
                  {[
                    { id: 'all', label: 'Semua Hotspots' },
                    { id: 'f-pattern', label: 'Pola-F Scan' },
                    { id: 'keywords', label: 'Kata Kunci (Tech Stack)' },
                    { id: 'metrics', label: 'Metrik & Impact (%)' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setHeatmapFilter(f.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        heatmapFilter === f.id
                          ? 'bg-slate-900 text-white dark:bg-violet-600'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Legend Bar */}
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <span className="font-bold text-slate-600 dark:text-slate-300">Intensitas Perhatian Mata Recruiter:</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-rose-500 shadow-xs" />
                      <span className="font-bold text-slate-700 dark:text-slate-200">Sangat Tinggi (80-100%)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-amber-400 shadow-xs" />
                      <span className="font-bold text-slate-700 dark:text-slate-200">Sedang (50-79%)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-sky-400 shadow-xs" />
                      <span className="font-bold text-slate-700 dark:text-slate-200">Rendah / Cold Zone (&lt;50%)</span>
                    </div>
                  </div>
                </div>

                {/* VISUAL CV HEATMAP PREVIEW CANVAS */}
                <div className="relative rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-5 md:p-6 shadow-inner space-y-4 font-sans text-slate-900 dark:text-slate-100 overflow-hidden">
                  {/* Section 1: Header / Name & Position Title */}
                  <div className="relative p-3 rounded-lg transition-all">
                    {showHeatmapOverlay && (heatmapFilter === 'all' || heatmapFilter === 'f-pattern') && (
                      <div className="absolute inset-0 bg-gradient-to-r from-rose-500/25 via-amber-500/20 to-transparent rounded-lg pointer-events-none border border-rose-500/30 animate-pulse" />
                    )}
                    <div className="flex items-start justify-between relative z-10">
                      <div>
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                          {activeCvData.candidateName}
                        </h4>
                        <p className="text-xs font-bold text-violet-600 dark:text-violet-400">
                          {activeCvData.role} • {targetLevel} Level
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {activeCvData.location} • {activeCvData.email}
                        </p>
                      </div>
                      {showHeatmapOverlay && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-600 text-white shadow-xs">
                          96% Hotspot #1
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Section 2: Executive Summary */}
                  <div className="relative p-3 rounded-lg transition-all border-t border-slate-100 dark:border-slate-800">
                    {showHeatmapOverlay && (heatmapFilter === 'all' || heatmapFilter === 'f-pattern' || heatmapFilter === 'keywords') && (
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-amber-400/15 to-transparent rounded-lg pointer-events-none border border-amber-500/20" />
                    )}
                    <div className="relative z-10 space-y-1">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                          Ringkasan Profil (Professional Summary)
                        </h5>
                        {showHeatmapOverlay && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-slate-950">
                            82% Focus
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {activeCvData.summary}
                      </p>
                    </div>
                  </div>

                  {/* Section 3: Work Experience (High Attention Zone for Metrics & Numbers) */}
                  <div className="relative p-3 rounded-lg transition-all border-t border-slate-100 dark:border-slate-800 space-y-2">
                    {showHeatmapOverlay && (heatmapFilter === 'all' || heatmapFilter === 'metrics' || heatmapFilter === 'f-pattern') && (
                      <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 via-amber-500/15 to-transparent rounded-lg pointer-events-none border border-rose-500/20" />
                    )}
                    <div className="relative z-10 space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                          Pengalaman Kerja
                        </h5>
                        {showHeatmapOverlay && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-600 text-white shadow-xs">
                            90% Focal Hotspot
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                          <span>{activeCvData.role} — {activeCvData.company}</span>
                          <span className="text-slate-500 text-[11px]">{activeCvData.period}</span>
                        </div>
                        <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-1 pl-1">
                          {activeCvData.achievements.map((ach, idx) => (
                            <li key={idx} className="leading-relaxed">
                              {ach}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Skills & Tech Stack */}
                  <div className="relative p-3 rounded-lg transition-all border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                    {showHeatmapOverlay && (heatmapFilter === 'all' || heatmapFilter === 'keywords') && (
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 via-sky-400/10 to-transparent rounded-lg pointer-events-none border border-amber-400/20" />
                    )}
                    <div className="relative z-10 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                          Keterampilan &amp; Tech Stack
                        </h5>
                        {showHeatmapOverlay && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-slate-950">
                            78% Keyword Scan
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 text-[11px]">
                        {activeCvData.skills.map((sk) => (
                          <span key={sk} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Section 5: Cold Zone Example (Hobbies/Generic Text) */}
                  <div className="relative p-3 rounded-lg transition-all border-t border-slate-100 dark:border-slate-800 space-y-1">
                    {showHeatmapOverlay && (
                      <div className="absolute inset-0 bg-sky-500/10 rounded-lg pointer-events-none border border-sky-400/20" />
                    )}
                    <div className="relative z-10 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-500 dark:text-slate-400">Pendidikan &amp; Informasi Tambahan:</span>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                          {activeCvData.education} • {activeCvData.hobbies}
                        </p>
                      </div>
                      {showHeatmapOverlay && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-500 text-white shrink-0 ml-2">
                          22% Cold Zone
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Eye Tracking Analytics Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                  <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Total Waktu Scan HRD
                    </span>
                    <div className="flex items-center gap-1.5 font-black text-sm text-slate-900 dark:text-white">
                      <Clock className="w-4 h-4 text-violet-500" />
                      <span>6.2 Detik</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Rata-rata durasi peninjauan awal HRD.</p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Skor Pola-F (F-Pattern)
                    </span>
                    <div className="flex items-center gap-1.5 font-black text-sm text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>92% Sesuai</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Alur baca mata sangat sistematis.</p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Focal Point Utama
                    </span>
                    <div className="flex items-center gap-1.5 font-black text-sm text-rose-600 dark:text-rose-400">
                      <Flame className="w-4 h-4 text-rose-500" />
                      <span>Judul &amp; 3 Metrik</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Daya tarik perhatian paling tinggi.</p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Zona Terabaikan
                    </span>
                    <div className="flex items-center gap-1.5 font-black text-sm text-sky-600 dark:text-sky-400">
                      <Info className="w-4 h-4 text-sky-500" />
                      <span>Hobi &amp; Teks Paragraf</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Kurangi kalimat narasi tanpa angka.</p>
                  </div>
                </div>
              </div>

              {/* Red Flags & Risk Check */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <span>Temuan Catatan / Potensi Red Flags oleh AI</span>
                </h3>

                <div className="space-y-2">
                  {screeningResults.redFlagsDetected.map((rf, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 flex items-start gap-3"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                            {rf.title}
                          </h4>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-200/80 dark:bg-amber-900 text-amber-800 dark:text-amber-300">
                            {rf.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-snug mt-0.5">
                          {rf.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Before vs After Rewriting Suggestions */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-600" />
                    <span>Rekomendasi Perbaikan Kalimat Standar AI</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    Klik Terapkan untuk Meningkatkan Skor
                  </span>
                </div>

                <div className="space-y-3">
                  {screeningResults.beforeAfterFixes.map((fix) => {
                    const isApplied = appliedFixes.includes(fix.id);
                    return (
                      <div
                        key={fix.id}
                        className={`p-4 rounded-lg border transition space-y-2 ${
                          isApplied
                            ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {fix.section}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleApplyFix(fix.id)}
                            disabled={isApplied}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                              isApplied
                                ? 'bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 cursor-default'
                                : 'bg-violet-600 hover:bg-violet-700 text-white shadow-xs'
                            }`}
                          >
                            {isApplied ? '✓ Telah Diterapkan' : '+ Terapkan Perbaikan ini'}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                          <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-900 dark:text-rose-200">
                            <span className="font-bold text-[10px] uppercase text-rose-600 dark:text-rose-400 block">Versi Saat Ini:</span>
                            <p className="mt-0.5 leading-snug">{fix.before}</p>
                          </div>

                          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200">
                            <span className="font-bold text-[10px] uppercase text-emerald-600 dark:text-emerald-400 block">Saran AI HRD:</span>
                            <p className="mt-0.5 leading-snug">{fix.after}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Predicted Interview Questions */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-violet-600" />
                  <span>Prediksi Pertanyaan Interview dari HRD AI</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Berdasarkan isi CV yang Anda upload, inilah pertanyaan awal yang paling mungkin ditanyakan oleh HRD saat wawancara:
                </p>

                <div className="space-y-2">
                  {screeningResults.predictedHrdQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-800 dark:text-slate-200"
                    >
                      <span className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="font-medium leading-relaxed">{q}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
