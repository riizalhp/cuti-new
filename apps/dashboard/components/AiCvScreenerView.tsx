'use client';

import React, { useState, useMemo } from 'react';
import {
  Eye,
  Flame,
  Focus,
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
  Search,
  ChevronRight,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  runFullRvePipeline,
  CvParsedData,
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

const recruiterPersonas = [
  {
    id: 'tech-startup',
    name: 'Recruiter Tech Startup / Unicorn',
    description:
      'Prioritas pada kecepatan eksekusi, portofolio proyek nyata, stack teknologi modern, dan dampak bisnis langsung.',
    strictness: 'Fokus Skill & Metrik %',
    icon: Zap,
  },
  {
    id: 'corporate-bumn',
    name: 'Screening Corporate & BUMN',
    description:
      'Prioritas pada kesesuaian latar belakang pendidikan, IPK, kualifikasi formal, dan format standar tanpa celah.',
    strictness: 'Ketat pada Standard ATS',
    icon: Building2,
  },
  {
    id: 'multinational',
    name: 'Recruiter Multinational Company',
    description:
      'Prioritas pada metrik angka (pencapaian terukur %), kepemimpinan, bahasa Inggris bisnis, dan kepemimpinan proyek.',
    strictness: 'Fokus Impact & Metrik',
    icon: Briefcase,
  },
];

export const AiCvScreenerView: React.FC = () => {
  // Source Mode Selection
  const [cvSourceMode, setCvSourceMode] = useState<'saved' | 'upload' | 'text'>('saved');
  const [selectedCvId, setSelectedCvId] = useState<string>('cv-1');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [rawCvText, setRawCvText] = useState('');

  // Target Job Role & Recruiter Persona
  const [targetRole, setTargetRole] = useState('Senior Fullstack Engineer');
  const [targetLevel, setTargetLevel] = useState<'Entry' | 'Mid' | 'Senior' | 'Manager'>('Mid');
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('tech-startup');

  // Interactive Fixes State
  const [appliedFixes, setAppliedFixes] = useState<string[]>([]);

  // Simulation & Pipeline State
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [hasRunPipeline, setHasRunPipeline] = useState(true);

  // A4 Heatmap Canvas View Mode State
  const [showHeatmapOverlay, setShowHeatmapOverlay] = useState<boolean>(true);
  const [heatmapViewMode, setHeatmapViewMode] = useState<'heatmap' | 'f-pattern' | 'bbox' | 'ats-matrix'>('heatmap');

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
    '1. CV Parser Engine — Mengekstrak Struktur Dokumen...',
    '2. Layout Detection Engine — Menghitung Koordinat Seksi...',
    '3. Visual Hierarchy Engine — Menghitung Visual Weight...',
    '4. Sistem Prediksi Eye-Tracking — Memprediksi Pola-F 6 Detik...',
    '5. Heatmap Generator — Merender Kanvas Termal A4...',
    '6. ATS Correlation Engine — Memetakan Korelasi Matriks...',
    '7. Recommendations Engine — Menyusun Laporan RVE...',
  ];

  const handleFillDemoData = () => {
    setCvSourceMode('saved');
    setSelectedCvId('cv-1');
    setTargetRole('Senior Fullstack Engineer');
    setTargetLevel('Senior');
    setSelectedPersonaId('tech-startup');
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

    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      if (step < pipelineStepsList.length) {
        setPipelineStep(step);
      } else {
        clearInterval(interval);
        setIsProcessing(false);
        setHasRunPipeline(true);
      }
    }, 450);
  };

  const handleApplyFix = (fixId: string) => {
    if (!appliedFixes.includes(fixId)) {
      setAppliedFixes((prev) => [...prev, fixId]);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 w-full pb-12 font-sans transition-all duration-300">
      {/* Top Banner Header (Matches CVView.tsx 'Daftar & Pembuat CV Profesional' Header Banner Card Background) */}
      <div className="p-5 sm:p-6 md:p-8 rounded-xl md:rounded-2xl bg-[#0D3BD9] border border-blue-500/50 shadow-xl relative overflow-hidden text-white">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-20 top-0 w-32 h-32 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-400 text-slate-950 shadow-xs">
              <Eye className="w-3.5 h-3.5" />
              <span>CUTI Recruiter Vision Engine (RVE)</span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
              Recruiter Vision Engine — Heatmap &amp; Keterbacaan CV
            </h1>

            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Metode visual RVE memprediksi bagaimana mata recruiter pertama kali melihat CV Anda dalam 6–8 detik awal.
              Engine menghitung visual weight, lintasan F-Pattern, gradien termal kertas A4, serta korelasi kata kunci ATS.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleFillDemoData}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-white dark:text-slate-200 border border-white/15 dark:border-slate-700 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Isi Data Demo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start w-full">
        {/* Left Form Column (Master Input Card matching LinkedIn style with Dark Mode classes) */}
        <div className="lg:col-span-5 space-y-6 w-full">
          <div className="p-4 sm:p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 w-full">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Eye className="w-5 h-5 text-navy-700 dark:text-navy-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Formulir Vision Engine &amp; Target Recruiter
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Pilih persona recruiter dan target posisi CV kamu di bawah ini.
                </p>
              </div>
            </div>

            {/* STEP 1: Recruiter Persona Target */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                1. Tipe Recruiter &amp; Target Perusahaan
              </label>

              <div className="space-y-2">
                {recruiterPersonas.map((persona) => {
                  const IconComponent = persona.icon;
                  const isSelected = selectedPersonaId === persona.id;
                  return (
                    <div
                      key={persona.id}
                      onClick={() => setSelectedPersonaId(persona.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/30 ring-2 ring-orange-500/20 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <IconComponent
                            className={`w-4 h-4 ${isSelected ? 'text-orange-500' : 'text-slate-400 dark:text-slate-500'}`}
                          />
                          <h3 className="font-bold text-xs text-slate-900 dark:text-white">{persona.name}</h3>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-orange-500 shrink-0" />}
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{persona.description}</p>
                      <div className="pt-1 flex items-center justify-between text-[10px]">
                        <span className="font-semibold text-slate-400 dark:text-slate-500">Strictness:</span>
                        <span className="font-bold text-navy-700 dark:text-navy-300 bg-navy-50 dark:bg-navy-950/80 px-2 py-0.5 rounded border border-navy-100/80 dark:border-navy-800/60">
                          {persona.strictness}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* STEP 2: Position Target & Level */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                2. Target Posisi &amp; Senioritas
              </label>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Nama Peran Pekerjaan Target *
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" />
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="Contoh: Senior Fullstack Engineer"
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-navy-500 focus:border-navy-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Tingkat Senioritas (Level)
                  </label>
                  <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold">
                    {(['Entry', 'Mid', 'Senior', 'Manager'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setTargetLevel(lvl)}
                        className={`py-1.5 rounded-md transition text-center cursor-pointer ${
                          targetLevel === lvl
                            ? 'bg-white dark:bg-slate-900 text-navy-700 dark:text-white font-bold shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 3: CV Source Selector */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                3. Pilih Dokumen CV
              </label>

              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setCvSourceMode('saved')}
                  className={`py-1.5 px-2 rounded-md transition text-center cursor-pointer ${
                    cvSourceMode === 'saved'
                      ? 'bg-white dark:bg-slate-900 text-navy-700 dark:text-white font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Upload Baru
                </button>
                <button
                  type="button"
                  onClick={() => setCvSourceMode('text')}
                  className={`py-1.5 px-2 rounded-md transition text-center cursor-pointer ${
                    cvSourceMode === 'text'
                      ? 'bg-white dark:bg-slate-900 text-navy-700 dark:text-white font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
                      className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        selectedCvId === cv.id
                          ? 'border-navy-500 bg-navy-50/50 dark:bg-navy-950/40 ring-1 ring-navy-500/20 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText
                          className={`w-4 h-4 shrink-0 ${selectedCvId === cv.id ? 'text-navy-700 dark:text-navy-400' : 'text-slate-400 dark:text-slate-500'}`}
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

              {cvSourceMode === 'upload' && (
                <div className="p-5 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-center space-y-2">
                  <Upload className="w-6 h-6 text-navy-500 dark:text-navy-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Upload File PDF / DOCX CV Anda</p>
                  <label className="inline-block px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold cursor-pointer transition shadow-xs">
                    Pilih Berkas
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
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold block mt-1">
                      ✓ Berkas terpilih: {uploadedFile.name}
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
                  className="w-full p-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-navy-500 focus:border-navy-500 focus:outline-none transition resize-none"
                />
              )}
            </div>

            {/* Primary Action Button (Mandatory Orange-500 CTA) */}
            <button
              type="button"
              onClick={handleStartRvePipeline}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-extrabold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:-translate-y-0.5"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>RVE Engine Sedang Memproses...</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span>Jalankan CUTI Recruiter Vision Engine</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Tips Box (Matches LinkedIn Page Style with Dark Mode classes) */}
          <div className="p-5 rounded-xl bg-navy-50/60 dark:bg-navy-950/40 border border-navy-200 dark:border-navy-900/60 space-y-3">
            <div className="flex items-center gap-2 text-navy-700 dark:text-navy-300 font-bold text-xs">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Mengapa Visual Heatmap CV Sangat Penting?</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Lebih dari <strong className="text-navy-700 dark:text-navy-300">80% recruiter</strong> hanya menghabiskan 6–8 detik pertama untuk melakukan pemindaian cepat (F-Pattern scan) sebelum memutuskan apakah CV layak dibaca lebih lanjut.
            </p>
          </div>
        </div>

        {/* Right Audit & Output Column (Master Card matching LinkedIn style with Dark Mode classes) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Processing Pipeline Animation */}
          {isProcessing && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center space-y-6 shadow-sm">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-orange-200 animate-ping" />
                <div className="relative w-16 h-16 rounded-full bg-navy-700 text-white flex items-center justify-center shadow-md">
                  <Eye className="w-8 h-8 animate-pulse text-orange-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  CUTI Recruiter Vision Engine Sedang Menganalisis
                </h3>
                <p className="text-xs text-orange-600 font-bold animate-pulse">
                  {pipelineStepsList[pipelineStep]}
                </p>
              </div>

              <div className="space-y-2 max-w-sm mx-auto text-left">
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
                          ? 'font-bold text-orange-600'
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

          {/* Master RVE Output Container Card (Identical to LinkedIn Master Audit Card with Dark Mode classes) */}
          {!isProcessing && hasRunPipeline && (
            <div className="p-4 sm:p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 w-full">
              {/* Master Header & High-Level Score Summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Ringkasan Hasil Evaluasi Vision Engine
                  </span>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                    <span>{targetRole}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-navy-50 dark:bg-navy-950 text-navy-700 dark:text-navy-300 border border-navy-200 dark:border-navy-800">
                      {currentPersona.name}
                    </span>
                  </h2>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-black text-orange-500">
                      {rveReport.overallAttentionScore}<span className="text-xs text-slate-400 font-normal">/100</span>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">Skor Attention</span>
                  </div>

                  <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />

                  <div className="text-center">
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {rveReport.fPatternScore}%
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">F-Pattern</span>
                  </div>
                </div>
              </div>

              {/* 5-Column Score Breakdown Bar Items */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-center space-y-1">
                  <span className="text-[10px] text-slate-400 font-medium block truncate">Header &amp; Kontak</span>
                  <span className="font-black text-slate-900 dark:text-white block">92%</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-center space-y-1">
                  <span className="text-[10px] text-slate-400 font-medium block truncate">Visual Weight</span>
                  <span className="font-black text-slate-900 dark:text-white block">85%</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-center space-y-1">
                  <span className="text-[10px] text-slate-400 font-medium block truncate">Lintasan Pola-F</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 block">{rveReport.fPatternScore}%</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-center space-y-1">
                  <span className="text-[10px] text-slate-400 font-medium block truncate">Matriks ATS</span>
                  <span className="font-black text-navy-700 dark:text-navy-300 block">{rveReport.atsScore}%</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-center space-y-1 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 font-medium block truncate">Metrik Angka</span>
                  <span className="font-black text-rose-600 dark:text-rose-400 block">88%</span>
                </div>
              </div>

              {/* Quick Section Jump Bar (Matching LinkedIn Navigation) */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <a href="#verdict-evaluation" className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-navy-50 dark:hover:bg-navy-950/60 hover:text-navy-700 dark:hover:text-navy-300 transition shrink-0 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-navy-700 dark:text-navy-400" />
                  <span>Evaluasi HR</span>
                </a>
                <a href="#heatmap-canvas" className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-navy-50 dark:hover:bg-navy-950/60 hover:text-navy-700 dark:hover:text-navy-300 transition shrink-0 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-500" />
                  <span>Heatmap A4</span>
                </a>
                <a href="#ats-matrix" className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-navy-50 dark:hover:bg-navy-950/60 hover:text-navy-700 dark:hover:text-navy-300 transition shrink-0 flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-navy-500 dark:text-navy-400" />
                  <span>Matriks ATS</span>
                </a>
                <a href="#rewrite-fixes" className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-navy-50 dark:hover:bg-navy-950/60 hover:text-navy-700 dark:hover:text-navy-300 transition shrink-0 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                  <span>Perbaikan Kalimat</span>
                </a>
                <a href="#interview-questions" className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-navy-50 dark:hover:bg-navy-950/60 hover:text-navy-700 dark:hover:text-navy-300 transition shrink-0 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-navy-700 dark:text-navy-400" />
                  <span>Prediksi Wawancara</span>
                </a>
              </div>

              {/* STACKED SECTIONS INSIDE MASTER CARD */}
              <div className="space-y-8 pt-2">
                {/* SECTION 1: VERDICT & EVALUATION */}
                <div id="verdict-evaluation" className="space-y-4 text-xs scroll-mt-6">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-navy-700 dark:text-navy-400" />
                      <span>1. Evaluasi &amp; Catatan Tim Recruiter</span>
                    </h4>
                    <span className="text-[10px] text-slate-400 font-semibold">Verdict Vision Engine</span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-start gap-2.5 text-xs">
                      <Info className="w-4 h-4 text-navy-700 dark:text-navy-400 shrink-0 mt-0.5" />
                      <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                        {rveReport.recruiterVerdict}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-navy-50/80 dark:bg-navy-950/40 border border-navy-100/80 dark:border-navy-900/60 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-navy-700 dark:text-navy-300">
                        <Eye className="w-4 h-4 text-navy-700 dark:text-navy-300" />
                        <span>Catatan Evaluasi Vision Engine:</span>
                      </div>
                      <p className="text-xs text-navy-900 dark:text-navy-200 leading-relaxed pl-6">
                        &ldquo;{rveReport.hrdNotes}&rdquo;
                      </p>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: A4 HEATMAP CANVAS PREVIEW */}
                <div id="heatmap-canvas" className="space-y-4 text-xs scroll-mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                          <span>A4 Heatmap Engine</span>
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
                          Visual Score: {rveReport.overallAttentionScore}/100
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <Eye className="w-4 h-4 text-orange-500" />
                        <span>2. Analisis Gradien Termal Kertas A4 (6-Second Scan)</span>
                      </h4>
                    </div>

                    {/* Toggle Overlay Switch */}
                    <button
                      type="button"
                      onClick={() => setShowHeatmapOverlay(!showHeatmapOverlay)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                        showHeatmapOverlay
                          ? 'bg-orange-500 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>{showHeatmapOverlay ? 'Heatmap Overlay ON' : 'Heatmap Overlay OFF'}</span>
                    </button>
                  </div>

                  {/* View Mode Options */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mr-1">Layer Tampilan:</span>
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
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          heatmapViewMode === mode.id
                            ? 'bg-navy-700 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>

                  {/* Legend Bar */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 flex flex-wrap items-center justify-between gap-2 text-[11px]">
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
                        <span className="font-bold text-slate-700 dark:text-slate-200">Cold Zone (&lt;50%)</span>
                      </div>
                    </div>
                  </div>

                  {/* REAL A4 HEATMAP CANVAS PREVIEW */}
                  <A4HeatmapCanvas
                    parsedData={rveReport.parsedData}
                    boundingBoxes={rveReport.boundingBoxes}
                    fixationPoints={rveReport.fixationPoints}
                    atsCorrelations={rveReport.atsCorrelations}
                    viewMode={heatmapViewMode}
                    showOverlay={showHeatmapOverlay}
                    targetLevel={targetLevel}
                  />

                  {/* Eye Tracking Key Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1 hover:border-slate-300 dark:hover:border-slate-600 transition-all">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Durasi Waktu Scan
                      </span>
                      <div className="flex items-center gap-1.5 font-black text-sm text-slate-900 dark:text-white">
                        <Clock className="w-4 h-4 text-navy-700 dark:text-navy-400" />
                        <span>6.4 Detik</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Durasi awal recruiter membaca CV.</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1 hover:border-slate-300 dark:hover:border-slate-600 transition-all">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Skor Pola-F (F-Pattern)
                      </span>
                      <div className="flex items-center gap-1.5 font-black text-sm text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>{rveReport.fPatternScore}% Sesuai</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Lintasan baca mata sangat optimal.</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1 hover:border-slate-300 dark:hover:border-slate-600 transition-all">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Focal Hotspot Utama
                      </span>
                      <div className="flex items-center gap-1.5 font-black text-sm text-rose-600 dark:text-rose-400">
                        <Flame className="w-4 h-4 text-rose-500" />
                        <span>Nama &amp; Metrik 35%</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Daya pikat perhatian paling tinggi.</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1 hover:border-slate-300 dark:hover:border-slate-600 transition-all">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Skor ATS Keyword
                      </span>
                      <div className="flex items-center gap-1.5 font-black text-sm text-navy-700 dark:text-navy-300">
                        <BarChart3 className="w-4 h-4 text-navy-500 dark:text-navy-400" />
                        <span>{rveReport.atsScore}% Matriks ATS</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Kesesuaian filter sistem ATS.</p>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: ATS CORRELATION MATRIX */}
                <div id="ats-matrix" className="space-y-4 text-xs scroll-mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-navy-700 dark:text-navy-400" />
                      <span>3. ATS Correlation Engine — Matriks Visibilitas vs ATS</span>
                    </h4>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      Korelasi Kata Kunci Utama
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {rveReport.atsCorrelations.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 transition-all space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
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
                        <div className="flex items-center gap-4 text-[10px] pt-1 text-slate-500 dark:text-slate-400">
                          <span>Visibilitas Heatmap: <strong className="text-slate-800 dark:text-slate-200">{item.visibilityScore}%</strong></span>
                          <span>Skor ATS: <strong className="text-slate-800 dark:text-slate-200">{item.atsScore}%</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION 4: BEFORE VS AFTER REWRITE SUGGESTIONS */}
                <div id="rewrite-fixes" className="space-y-4 text-xs scroll-mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-orange-500" />
                      <span>4. Rekomendasi Perbaikan Kalimat Vision Engine</span>
                    </h4>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      Klik Terapkan untuk Meningkatkan Skor RVE
                    </span>
                  </div>

                  <div className="space-y-3">
                    {rveReport.beforeAfterFixes.map((fix) => {
                      const isApplied = appliedFixes.includes(fix.id);
                      return (
                        <div
                          key={fix.id}
                          className={`p-4 rounded-xl border transition-all space-y-2 ${
                            isApplied
                              ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{fix.section}</span>
                            <button
                              type="button"
                              onClick={() => handleApplyFix(fix.id)}
                              disabled={isApplied}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                isApplied
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 cursor-default font-bold'
                                  : 'bg-orange-500 hover:bg-orange-600 text-white shadow-xs'
                              }`}
                            >
                              {isApplied ? '✓ Telah Diterapkan (+4% Skor)' : '+ Terapkan Perbaikan ini'}
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200">
                              <span className="font-bold text-[10px] uppercase text-rose-600 dark:text-rose-400 block">
                                Versi Saat Ini:
                              </span>
                              <p className="mt-0.5 leading-snug">{fix.before}</p>
                            </div>

                            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200">
                              <span className="font-bold text-[10px] uppercase text-emerald-600 dark:text-emerald-400 block">
                                Saran Optimasi RVE:
                              </span>
                              <p className="mt-0.5 leading-snug">{fix.after}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SECTION 5: PREDICTED INTERVIEW QUESTIONS */}
                <div id="interview-questions" className="space-y-4 text-xs scroll-mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-navy-700 dark:text-navy-400" />
                      <span>5. Prediksi Pertanyaan Wawancara dari Hasil Vision Engine</span>
                    </h4>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      Pertanyaan Awal Recruiter
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Berdasarkan bagian CV yang paling menarik perhatian (focal hotspots), inilah pertanyaan awal yang paling mungkin ditanyakan oleh recruiter:
                  </p>

                  <div className="space-y-2">
                    {rveReport.predictedInterviewQuestions.map((q, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 flex items-start gap-3 text-xs text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                      >
                        <span className="w-5 h-5 rounded-full bg-navy-700 dark:bg-navy-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                          {idx + 1}
                        </span>
                        <p className="font-medium leading-relaxed">{q}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
