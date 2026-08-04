'use client';

import React, { useState } from 'react';
import {
  FileCheck,
  Upload,
  FileText,
  Building,
  Briefcase,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Plus,
  Info,
  Zap,
  Check,
  Search,
  ChevronRight,
  Download,
  Share2,
  Copy,
  Target,
  Award,
  BookOpen,
  Cpu,
  Layers,
  BarChart2,
  FileDown,
  ExternalLink,
} from 'lucide-react';

interface SavedCV {
  id: string;
  title: string;
  updatedAt: string;
  atsScore: number;
  skills: string[];
  role: string;
  experienceYears: string;
}

const mockSavedCVs: SavedCV[] = [
  {
    id: 'cv-1',
    title: 'CV Fullstack Engineer (Utama)',
    updatedAt: '22 Juli 2026',
    atsScore: 88,
    role: 'Fullstack Developer',
    experienceYears: '3+ Tahun',
    skills: ['React.js', 'Next.js', 'TypeScript', 'Node.js', 'Tailwind CSS', 'PostgreSQL', 'Git', 'REST API'],
  },
  {
    id: 'cv-2',
    title: 'CV Data Analyst ATS',
    updatedAt: '18 Juli 2026',
    atsScore: 82,
    role: 'Data Analyst',
    experienceYears: '2 Tahun',
    skills: ['Python', 'SQL', 'Tableau', 'Excel Advanced', 'Statistics', 'Power BI', 'Data Visualization'],
  },
  {
    id: 'cv-3',
    title: 'CV Product Manager',
    updatedAt: '10 Juni 2026',
    atsScore: 79,
    role: 'Product Manager',
    experienceYears: '4 Tahun',
    skills: ['Agile / Scrum', 'Product Roadmap', 'User Research', 'Wireframing', 'JIRA', 'SQL Basics', 'A/B Testing'],
  },
];

const sampleJobPresets = [
  {
    title: 'Senior Frontend Engineer',
    company: 'PT GoTo Gojek Tokopedia',
    description: `Kami mencari Senior Frontend Engineer yang berpengalaman dalam membangun aplikasi web skala besar.
Kualifikasi Utama:
- Minimal 3 tahun pengalaman dengan React.js, Next.js, dan TypeScript.
- Memahami konsep State Management (Zustand/Redux), Responsive Design dengan Tailwind CSS.
- Pengalaman melakukan otomatisasi pengujian dengan Jest atau React Testing Library.
- Terbiasa berkolaborasi dengan metodologi Agile/Scrum, Git, CI/CD pipeline, dan GraphQL API.
- Memiliki pemahaman performa web (Web Vitals, SSR/SSG, Caching).`,
  },
  {
    title: 'Data Analyst',
    company: 'Bank Mandiri (Persero) Tbk',
    description: `Mengolah data bisnis dan menyajikan insight analitis untuk mendukung pengambilan keputusan strategis.
Kualifikasi:
- Pendidikan S1 Teknik/Statistika/Matematika/Komputer.
- Menguasai SQL query tingkat lanjut dan pemrosesan data dengan Python (Pandas, NumPy).
- Berpengalaman membuat dashboard interaktif di Tableau / Power BI.
- Memiliki kemampuan komunikasi data (data storytelling) dan analisis bisnis yang kuat.
- Terbiasa bekerja dengan database terdistribusi seperti PostgreSQL dan BigQuery.`,
  },
  {
    title: 'Associate Product Manager',
    company: 'Bukalapak',
    description: `Bertanggung jawab dalam merancang skema produk e-commerce dari ideasi hingga peluncuran.
Kualifikasi:
- Pengalaman 1-3 tahun di bidang Product Management atau Product Analysis.
- Terbiasa membuat PRD (Product Requirement Document) dan wireframe tingkat dasar.
- Memahami indikator kinerja produk (OKRs, KPIs, Retention, Conversion Rate).
- Kuat dalam User Research, A/B Testing, dan tools manajemen proyek seperti JIRA / Confluence.
- Kemampuan pemecahan masalah (problem solving) dan komunikasi lintas divisi yang sangat baik.`,
  },
];

export const CvMatchAnalysisView: React.FC = () => {
  // Mode selection
  const [cvSourceMode, setCvSourceMode] = useState<'saved' | 'upload' | 'text'>('saved');
  const [selectedCvId, setSelectedCvId] = useState<string>('cv-1');

  // File Upload State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Raw Text State
  const [rawCvText, setRawCvText] = useState('');

  // Job Description Input State
  const [jobTitle, setJobTitle] = useState('Senior Frontend Engineer');
  const [companyName, setCompanyName] = useState('PT GoTo Gojek Tokopedia');
  const [jobDescription, setJobDescription] = useState(sampleJobPresets[0].description);

  // Analysis Processing State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [hasAnalyzed, setHasAnalyzed] = useState(true); // Default to showing sample result for immediate visual delight

  // Dynamic Keyword Add State
  const [addedSkills, setAddedSkills] = useState<string[]>([]);

  // Sample Analysis Result Data
  const analysisResult = {
    matchScore: 86 + (addedSkills.length * 3), // Increases score dynamically when skills added
    statusBadge: 'Sangat Cocok untuk Dilamar',
    statusColor: 'emerald',
    breakdown: {
      hardSkills: 88,
      softSkills: 85,
      experience: 82,
      education: 95,
    },
    matchedKeywords: [
      'React.js',
      'Next.js',
      'TypeScript',
      'Tailwind CSS',
      'Git',
      'REST API',
      'Node.js',
      'Agile / Scrum',
      ...addedSkills,
    ],
    missingKeywords: [
      'GraphQL',
      'Jest / Unit Testing',
      'CI/CD Pipeline',
      'Web Vitals / Caching',
    ].filter((k) => !addedSkills.includes(k)),
    strengths: [
      'Pengalaman dengan React.js & TypeScript sesuai dengan kualifikasi utama lowongan.',
      'Memiliki portofolio pembuatan aplikasi Next.js dengan arsitektur modern.',
      'Riwayat kerja selama 3+ tahun selaras dengan standar seniority pekerjaan.',
    ],
    improvements: [
      'Belum mencantumkan pengujian otomatis (Jest/Testing Library) pada CV.',
      'Sebutkan pengalaman terkait GraphQL API dan optimasi Web Vitals untuk menaikkan skor match hingga 95%+.',
      'Tambahkan pencapaian kuantitatif (misal: "Meningkatkan kecepatan load sebesar 35%").',
    ],
  };

  const analysisStepsList = [
    'Mengekstrak konten & struktur CV...',
    'Menganalisis kata kunci utama pada Job Description...',
    'Mencocokkan Hard Skills & Soft Skills...',
    'Menghitung keselarasan tingkat pengalaman & kualifikasi...',
    'Menyusun skor match ATS & rekomendasi optimasi...',
  ];

  const handleStartAnalysis = () => {
    if (cvSourceMode === 'upload' && !uploadedFile) {
      alert('Silakan pilih atau upload file CV Anda terlebih dahulu.');
      return;
    }
    if (cvSourceMode === 'text' && !rawCvText.trim()) {
      alert('Silakan tempelkan (paste) teks CV Anda.');
      return;
    }
    if (!jobDescription.trim()) {
      alert('Silakan masukkan teks Job Description.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep(0);
    setHasAnalyzed(false);

    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      if (step < analysisStepsList.length) {
        setAnalysisStep(step);
      } else {
        clearInterval(interval);
        setIsAnalyzing(false);
        setHasAnalyzed(true);
      }
    }, 600);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleApplyPreset = (preset: typeof sampleJobPresets[0]) => {
    setJobTitle(preset.title);
    setCompanyName(preset.company);
    setJobDescription(preset.description);
  };

  const handleAddMissingKeyword = (keyword: string) => {
    if (!addedSkills.includes(keyword)) {
      setAddedSkills((prev) => [...prev, keyword]);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 w-full">
      {/* Top Banner / Header */}
      <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-linear-to-r from-violet-900 via-violet-800 to-slate-900 text-white p-5 sm:p-6 md:p-8 shadow-xl">
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" /> ATS Match Analyzer AI
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white backdrop-blur-xs border border-white/10">
              Akurasi 98%
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-snug">
            Analisis Match CV &amp; Job Description
          </h1>
          <p className="text-xs md:text-sm text-violet-100/90 max-w-3xl leading-relaxed">
            Uji sejauh mana CV kamu sesuai dengan syarat pekerjaan impian secara instan. Dapatkan analisa kata kunci ATS yang hilang, skor kecocokan, dan panduan optimasi presisi tinggi.
          </p>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-20 top-0 w-32 h-32 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />
      </div>

      {/* Main Grid: Input Form vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: CV & JD Input Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* STEP 1: Pilih Sumber CV */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold text-xs shrink-0">
                1
              </div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                Pilih atau Upload CV Kamu
              </h2>
            </div>

            {/* Source Toggle Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setCvSourceMode('saved')}
                className={`py-2 px-2 rounded-lg transition text-center cursor-pointer ${
                  cvSourceMode === 'saved'
                    ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                CV Tersimpan
              </button>

              <button
                type="button"
                onClick={() => setCvSourceMode('upload')}
                className={`py-2 px-2 rounded-lg transition text-center cursor-pointer ${
                  cvSourceMode === 'upload'
                    ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Upload File Baru
              </button>

              <button
                type="button"
                onClick={() => setCvSourceMode('text')}
                className={`py-2 px-2 rounded-lg transition text-center cursor-pointer ${
                  cvSourceMode === 'text'
                    ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Paste Teks CV
              </button>
            </div>

            {/* Mode 1: Saved CV Selection */}
            {cvSourceMode === 'saved' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Pilih dari Profil CV yang Ada:
                </label>
                <div className="space-y-2">
                  {mockSavedCVs.map((cv) => (
                    <div
                      key={cv.id}
                      onClick={() => setSelectedCvId(cv.id)}
                      className={`p-3.5 rounded-lg border transition cursor-pointer flex items-start justify-between gap-3 ${
                        selectedCvId === cv.id
                          ? 'border-violet-600 bg-violet-50/60 dark:bg-violet-950/40 ring-2 ring-violet-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <FileText className={`w-5 h-5 mt-0.5 shrink-0 ${selectedCvId === cv.id ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400'}`} />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {cv.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {cv.role} • Diperbarui {cv.updatedAt}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {cv.skills.slice(0, 4).map((s, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                              >
                                {s}
                              </span>
                            ))}
                            {cv.skills.length > 4 && (
                              <span className="text-[9px] text-slate-400 font-semibold self-center">
                                +{cv.skills.length - 4} skill
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
                        Skor {cv.atsScore}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mode 2: File Upload */}
            {cvSourceMode === 'upload' && (
              <div className="space-y-3">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  className={`p-6 rounded-xl border-2 border-dashed text-center transition cursor-pointer flex flex-col items-center justify-center space-y-2 ${
                    isDragging
                      ? 'border-violet-600 bg-violet-50 dark:bg-violet-950/50'
                      : 'border-slate-200 dark:border-slate-800 hover:border-violet-400 bg-slate-50/50 dark:bg-slate-800/30'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Tarik &amp; Lepaskan File CV di sini
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Format terdukung: PDF, DOCX, DOC (Maks. 10MB)
                    </p>
                  </div>

                  <label className="mt-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold cursor-pointer transition shadow-xs">
                    Pilih File Komputer
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc,.txt"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setUploadedFile(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                </div>

                {uploadedFile && (
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div>
                        <p className="font-bold text-emerald-900 dark:text-emerald-200">
                          {uploadedFile.name}
                        </p>
                        <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • Siap dianalisis
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadedFile(null)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      Batal
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mode 3: Raw Text */}
            {cvSourceMode === 'text' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Tempelkan Teks Isi CV Anda:
                </label>
                <textarea
                  rows={6}
                  value={rawCvText}
                  onChange={(e) => setRawCvText(e.target.value)}
                  placeholder="Contoh: Nama: Rizky Febrian, Role: Fullstack Engineer, Pengalaman: 3 tahun membuat aplikasi React & Node.js..."
                  className="w-full p-3 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 text-right">
                  {rawCvText.trim().split(/\s+/).filter(Boolean).length} Kata
                </p>
              </div>
            )}
          </div>

          {/* STEP 2: Input Job Description */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </div>
                <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                  Target Job Description Lowongan
                </h2>
              </div>
            </div>

            {/* Preset Samples Loader */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                Gunakan Contoh Preset Cepat:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {sampleJobPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                  >
                    + {preset.title} ({preset.company.split(' ')[1] || preset.company})
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nama Posisi Pekerjaan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Contoh: Frontend Engineer"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nama Perusahaan / Perusahaan Impian
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Contoh: Tokopedia"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Teks Lengkap Job Description / Requirement <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={8}
                  required
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Tempelkan persyaratan pekerjaan dari LinkedIn, JobStreet, atau portal karir di sini..."
                  className="w-full p-3 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none leading-relaxed"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleStartAnalysis}
              disabled={isAnalyzing}
              className="w-full py-3 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menganalisis Kualifikasi AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Mulai Analisis Kecocokan AI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Results & Analytics (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Loading Animation Box */}
          {isAnalyzing && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-6 shadow-sm">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-violet-200 dark:border-violet-900 animate-ping" />
                <div className="relative w-16 h-16 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-lg">
                  <Cpu className="w-8 h-8 animate-pulse text-amber-300" />
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Sistem AI Sedang Memproses Analisis Match
                </h3>
                <p className="text-xs text-violet-600 dark:text-violet-400 font-bold animate-pulse">
                  {analysisStepsList[analysisStep]}
                </p>
              </div>

              {/* Step Indicators */}
              <div className="space-y-2 max-w-sm mx-auto text-left">
                {analysisStepsList.map((stepText, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    {idx < analysisStep ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : idx === analysisStep ? (
                      <RefreshCw className="w-4 h-4 text-violet-600 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-700 shrink-0" />
                    )}
                    <span
                      className={
                        idx === analysisStep
                          ? 'font-bold text-violet-600 dark:text-violet-400'
                          : idx < analysisStep
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

          {/* Results Output */}
          {!isAnalyzing && hasAnalyzed && (
            <div className="space-y-6">
              {/* Overall Match Score Card */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Hasil Analisis Match Lowongan
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                      {jobTitle}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Building className="w-3.5 h-3.5" />
                      <span>{companyName}</span>
                    </p>
                  </div>

                  {/* Score Gauge Widget */}
                  <div className="flex items-center gap-3.5 bg-slate-50/80 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shrink-0">
                    <div className="relative w-16 h-16 flex items-center justify-center font-black text-lg text-emerald-600 dark:text-emerald-400 shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="26"
                          stroke="currentColor"
                          strokeWidth="5"
                          className="text-slate-200 dark:text-slate-700/80"
                          fill="transparent"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="26"
                          stroke="currentColor"
                          strokeWidth="5"
                          className="text-emerald-500"
                          strokeDasharray="163.3"
                          strokeDashoffset={163.3 - (163.3 * Math.min(100, analysisResult.matchScore)) / 100}
                          strokeLinecap="round"
                          fill="transparent"
                        />
                      </svg>
                      <span className="absolute font-extrabold text-sm tracking-tighter text-slate-900 dark:text-white">
                        {analysisResult.matchScore}%
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
                        <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{analysisResult.statusBadge}</span>
                      </span>
                      <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 max-w-[170px] leading-snug">
                        Peluang lolos screening ATS sangat tinggi!
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4 Core Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 block">Hard Skills</span>
                    <span className="text-base font-extrabold text-violet-600 dark:text-violet-400">
                      {analysisResult.breakdown.hardSkills}%
                    </span>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full bg-violet-600" style={{ width: `${analysisResult.breakdown.hardSkills}%` }} />
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 block">Soft Skills</span>
                    <span className="text-base font-extrabold text-violet-600 dark:text-violet-400">
                      {analysisResult.breakdown.softSkills}%
                    </span>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full bg-violet-600" style={{ width: `${analysisResult.breakdown.softSkills}%` }} />
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 block">Pengalaman</span>
                    <span className="text-base font-extrabold text-violet-600 dark:text-violet-400">
                      {analysisResult.breakdown.experience}%
                    </span>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full bg-violet-600" style={{ width: `${analysisResult.breakdown.experience}%` }} />
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 block">Pendidikan</span>
                    <span className="text-base font-extrabold text-violet-600 dark:text-violet-400">
                      {analysisResult.breakdown.education}%
                    </span>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full bg-violet-600" style={{ width: `${analysisResult.breakdown.education}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Matched vs Missing Keywords ATS Breakdown */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-violet-600" />
                  <span>Analisis Kata Kunci ATS (Hard &amp; Soft Skills)</span>
                </h3>

                {/* Found Keywords */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Kata Kunci Ditemukan di CV ({analysisResult.matchedKeywords.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.matchedKeywords.map((kw, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1"
                      >
                        <Check className="w-3 h-3 text-emerald-500" />
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Keywords */}
                <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Kata Kunci Belum Ada di CV ({analysisResult.missingKeywords.length})</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Klik + untuk simulasikan penambahan ke CV</span>
                  </div>

                  {analysisResult.missingKeywords.length === 0 ? (
                    <p className="text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      Selamat! Semua kata kunci penting dari Job Description telah ditemukan di CV Anda!
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.missingKeywords.map((kw, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAddMissingKeyword(kw)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          title="Klik untuk mensimulasikan penambahan kata kunci ke CV"
                        >
                          <Plus className="w-3.5 h-3.5 text-amber-600" />
                          <span>{kw}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Strengths & AI Action Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Keunggulan */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 shadow-xs">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-500" />
                    <span>Keunggulan CV Kamu</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    {analysisResult.strengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Area Perbaikan */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 shadow-xs">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>Panduan Optimasi AI</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    {analysisResult.improvements.map((imp, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-4 rounded-xl bg-violet-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm">
                      Ingin Langsung Mengoptimalkan CV Ini?
                    </h4>
                    <p className="text-[11px] text-violet-200">
                      AI CUTI siap menyisipkan kata kunci di atas secara alami ke dalam CV kamu.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => alert('CV Anda berhasil diperbarui dengan penyesuaian kata kunci ATS!')}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition shadow-xs cursor-pointer text-center"
                  >
                    Auto-Optimasi CV AI
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
