'use client';

import { PageHeader } from '@/components/ui/PageHeader';
import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';
import { cvApi, jobsApi, trackerApi } from '@/lib/api';
import {
  FileText,
  Building,
  Briefcase,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Zap,
  Check,
  ChevronRight,
  Target,
  Award,
  BarChart2,
  ArrowRight,
  X,
  SlidersHorizontal,
  Layers,
  ArrowUpDown,
  PlusCircle,
  HelpCircle,
  CheckSquare,
  Square,
  FileCheck2,
  Star,
  Trophy,
  Filter,
  Eye,
  ExternalLink,
  Loader2,
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

interface JobMatchTarget {
  id: string;
  position: string;
  company: string;
  location?: string;
  externalUrl?: string;
  matchScore: number;
  atsScore: number;
  stars: number;
  statusBadge: string;
  statusColor: 'emerald' | 'blue' | 'amber' | 'rose';
  description: string;
  breakdown: {
    hardSkills: number;
    softSkills: number;
    experience: number;
    education: number;
  };
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  improvements: string[];
  analyzedAt: string;
}

const initialJobTargets: JobMatchTarget[] = [] as JobMatchTarget[];

const samplePresets = [
  {
    position: 'Fullstack Engineer',
    company: 'Bukalapak',
    description: 'Mencari Fullstack Engineer berpengalaman dengan React.js, Node.js, PostgreSQL, dan arsitektur Microservices.',
  },
  {
    position: 'Frontend Developer',
    company: 'Traveloka',
    description: 'Membangun antarmuka pemesanan tiket cepat. Syarat: React.js, Next.js, Redux, Performance Optimization.',
  },
  {
    position: 'Software Engineer',
    company: 'Blibli',
    description: 'Mengembangkan sistem e-commerce berskala tinggi. Membutuhkan TypeScript, REST API, Git, dan CI/CD.',
  },
];

export const CvMatchAnalysisView: React.FC = () => {
  const toast = useToast();
  // Step 1 State: Active CV — dimuat dari database (tidak ada fallback contoh)
  const [savedCVs, setSavedCVs] = useState<SavedCV[]>([]);
  const [selectedCvId, setSelectedCvId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isChangeCvModalOpen, setIsChangeCvModalOpen] = useState<boolean>(false);

  // Target Jobs State (Ranking) — dimuat dari database (tidak ada fallback contoh)
  const [jobTargets, setJobTargets] = useState<JobMatchTarget[]>(initialJobTargets);
  const [selectedJobId, setSelectedJobId] = useState<string>('');

  const buildTargetsFromJobs = (jobs: any[], cvSkills: string[]): JobMatchTarget[] => {
    const skillLower = cvSkills.map((s) => s.toLowerCase());
    return jobs.slice(0, 6).map((job) => {
      const description = (job.description || '').slice(0, 400);
      const haystack = `${job.title} ${job.company} ${job.description} ${(job.requirements || []).join(' ')}`.toLowerCase();
      const matchedKeywords = cvSkills.filter((s) => haystack.includes(s.toLowerCase()));
      const missingKeywords = (job.requirements || [])
        .filter((r: string) => !skillLower.some((s) => r.toLowerCase().includes(s)))
        .slice(0, 5)
        .map(String);

      const matchScore = Math.min(96, Math.max(45, 45 + matchedKeywords.length * 9));
      const atsScore = Math.min(98, matchScore + 4);
      const stars = matchScore >= 85 ? 5 : matchScore >= 75 ? 4 : matchScore >= 60 ? 3 : 2;

      return {
        id: job.id,
        position: job.title || job.position || 'Posisi',
        company: job.company || 'Perusahaan',
        location: job.location || 'Indonesia',
        externalUrl: job.externalUrl || '',
        matchScore,
        atsScore,
        stars,
        statusBadge: matchScore >= 85 ? 'Sangat Layak' : matchScore >= 75 ? 'Layak' : matchScore >= 60 ? 'Perlu Optimasi' : 'Kurang Cocok',
        statusColor: matchScore >= 85 ? 'emerald' : matchScore >= 75 ? 'blue' : matchScore >= 60 ? 'amber' : 'rose',
        analyzedAt: 'Baru saja',
        description: description || job.description || 'Deskripsi tidak tersedia.',
        breakdown: {
          hardSkills: Math.min(95, matchScore + 2),
          softSkills: Math.min(95, matchScore - 2),
          experience: Math.min(95, matchScore - 5),
          education: Math.min(95, Math.max(60, matchScore)),
        },
        matchedKeywords,
        missingKeywords,
        strengths: matchedKeywords.length > 0
          ? [`Skill yang kamu miliki (${matchedKeywords.slice(0, 3).join(', ')}) selaras dengan kualifikasi ${job.company}.`]
          : ['Perbanyak kata kunci relevan di CV agar cocok dengan lowongan ini.'],
        improvements: [
          'Cantumkan kata kunci spesifik dari deskripsi lowongan di CV kamu untuk menaikkan skor ATS.',
        ],
      };
    });
  };

  // Muat CV asli dari database + lowongan asli dari database
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [cvs, jobs] = await Promise.all([cvApi.getAll(), jobsApi.getAll()]);
        if (cancelled) return;

        if (Array.isArray(cvs) && cvs.length > 0) {
          const mapped: SavedCV[] = cvs.map((cv: any) => ({
            id: cv.id,
            title: cv.title || 'CV Saya',
            updatedAt: cv.updatedAt || 'Baru saja',
            atsScore: cv.atsScore || 0,
            role: cv.headline || cv.targetJob || 'Professional',
            experienceYears: '1-3 Tahun',
            skills: Array.isArray(cv.skills) ? cv.skills.map((s: any) => (typeof s === 'string' ? s : s.name || String(s))) : [],
          }));
          setSavedCVs(mapped);
          setSelectedCvId(mapped[0].id);
        } else {
          setSavedCVs([]);
          setSelectedCvId('');
        }

        if (Array.isArray(jobs) && jobs.length > 0) {
          const activeSkills =
            (cvs as any[])?.[0]?.skills ||
            (Array.isArray(cvs) ? cvs.map((c: any) => c.skills).flat().filter(Boolean) : []);
          const skillList: string[] =
            Array.isArray(activeSkills) && activeSkills.length > 0
              ? activeSkills.map((s: any) => (typeof s === 'string' ? s : s?.name || String(s)))
              : [];
          const targets = buildTargetsFromJobs(jobs, skillList);
          if (targets.length > 0) {
            setJobTargets(targets);
            setSelectedJobId(targets[0].id);
            setCompareJobIds([targets[0].id, targets[1]?.id || targets[0].id]);
          }
        } else {
          setJobTargets([]);
          setSelectedJobId('');
          setCompareJobIds([]);
        }
      } catch (error) {
        console.error('[CvMatchAnalysisView] Gagal memuat data nyata:', error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Multi-Compare State (Checkbox selection for side-by-side)
  const [compareJobIds, setCompareJobIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'detail' | 'compare'>('detail');

  // Active Tab for Detail Panel (Overview, Keywords, Gap Skill, Insights)
  const [activeTab, setActiveTab] = useState<'overview' | 'keywords' | 'gap' | 'insights'>('overview');

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isKeywordsModalOpen, setIsKeywordsModalOpen] = useState<boolean>(false);

  // Form State inside Modal
  const [newPosition, setNewPosition] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  // Dynamic Skill Addition Simulation per job
  const [addedSkillsMap, setAddedSkillsMap] = useState<Record<string, string[]>>({});

  const activeCv = savedCVs.find((c) => c.id === selectedCvId) || savedCVs[0];
  const selectedJob = jobTargets.find((j) => j.id === selectedJobId) || jobTargets[0];

  // Calculated Stats Summary Bar
  const totalAnalyzed = jobTargets.length;
  const avgMatchScore = Math.round(
    jobTargets.reduce((acc, curr) => acc + curr.matchScore, 0) / (totalAnalyzed || 1)
  );
  const bestTarget = [...jobTargets].sort((a, b) => b.matchScore - a.matchScore)[0];

  // Steps indicator text
  const analysisStepsList = [
    'Mengekstrak kualifikasi dari CV Aktif...',
    'Memetakan kata kunci utama dari Job Target...',
    'Mencocokkan Hard Skills & Soft Skills...',
    'Menghitung rasio keselarasan ATS...',
    'Menyusun peringkat & rekomendasi optimasi...',
  ];

  // Handle Add New Job Target (Modal submit)
  const handleRunAnalysis = () => {
    if (!newPosition.trim() || !newCompany.trim() || !newDescription.trim()) {
      toast.warning('Silakan isi Nama Posisi, Perusahaan, dan Teks Job Description terlebih dahulu.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep(0);

    // Extract actual missing keywords from Job Description (words in JD that are not in CV skills)
    const cvSkills = (activeCv.skills || []).map((s) => s.toLowerCase());
    const haystack = `${newPosition} ${newCompany} ${newDescription}`.toLowerCase();
    const matchedKeywords = (activeCv.skills || []).filter((s) => haystack.includes(s.toLowerCase()));

    // Simple NLP tokenization of JD to extract candidate requirement terms
    const jdWords = Array.from(
      new Set(
        newDescription
          .replace(/[^\w\s+#.-]/g, ' ')
          .split(/\s+/)
          .filter((w) => w.length >= 3 && !/^(dan|yang|untuk|dengan|dari|pada|atau|kami|anda|bisa|akan|the|and|for|with|from)$/i.test(w))
      )
    );
    const missingKeywords = jdWords
      .filter((word) => !cvSkills.some((s) => s.includes(word.toLowerCase())))
      .slice(0, 5);

    const computedScore = Math.min(96, Math.max(40, 40 + matchedKeywords.length * 10));
    const newTarget: JobMatchTarget = {
      id: `job-${Date.now()}`,
      position: newPosition,
      company: newCompany,
      matchScore: computedScore,
      atsScore: Math.min(98, computedScore + 4),
      stars: computedScore >= 85 ? 5 : computedScore >= 75 ? 4 : computedScore >= 60 ? 3 : 2,
      statusBadge: computedScore >= 85 ? 'Sangat Layak' : computedScore >= 75 ? 'Layak' : computedScore >= 60 ? 'Perlu Optimasi' : 'Kurang Cocok',
      statusColor: computedScore >= 85 ? 'emerald' : computedScore >= 75 ? 'blue' : computedScore >= 60 ? 'amber' : 'rose',
      analyzedAt: 'Baru saja',
      description: newDescription,
      breakdown: {
        hardSkills: Math.min(95, computedScore + 2),
        softSkills: Math.min(95, computedScore - 2),
        experience: Math.min(95, computedScore - 5),
        education: Math.min(95, Math.max(60, computedScore)),
      },
      matchedKeywords,
      missingKeywords,
      strengths: matchedKeywords.length > 0
        ? [
            `Skill yang kamu miliki (${matchedKeywords.slice(0, 3).join(', ')}) selaras dengan kualifikasi ${newPosition} di ${newCompany}.`,
            'Struktur pengalaman jelas dan relevan dengan posisi.',
          ]
        : ['Tidak banyak kata kunci skill kamu yang ditemukan di deskripsi lowongan ini.'],
      improvements: [
        'Tambahkan kata kunci dari deskripsi lowongan ke CV kamu untuk menaikkan skor ATS.',
      ],
    };

    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      if (step < analysisStepsList.length) {
        setAnalysisStep(step);
      } else {
        clearInterval(interval);
        setIsAnalyzing(false);

        setJobTargets((prev) => {
          const updated = [newTarget, ...prev];
          return updated.sort((a, b) => b.matchScore - a.matchScore);
        });

        setSelectedJobId(newTarget.id);
        setIsAddModalOpen(false);
        setNewPosition('');
        setNewCompany('');
        setNewDescription('');
      }
    }, 150);
  };

  // Toggle Compare Checkbox
  const toggleCompare = (jobId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCompareJobIds((prev) => {
      if (prev.includes(jobId)) {
        if (prev.length <= 1) return prev; // Keep at least 1
        return prev.filter((id) => id !== jobId);
      } else {
        if (prev.length >= 2) {
          return [prev[1], jobId]; // Keep maximum 2 for side-by-side
        }
        return [...prev, jobId];
      }
    });
  };

  const handleSimulateAddKeyword = (jobId: string, keyword: string) => {
    setAddedSkillsMap((prev) => {
      const existing = prev[jobId] || [];
      if (existing.includes(keyword)) return prev;
      return { ...prev, [jobId]: [...existing, keyword] };
    });
  };

  const handleApplyPreset = (preset: typeof samplePresets[0]) => {
    setNewPosition(preset.position);
    setNewCompany(preset.company);
    setNewDescription(preset.description);
  };

  // Sorted job targets descending by match score
  const sortedJobs = [...jobTargets].sort((a, b) => b.matchScore - a.matchScore);

  // Compare jobs data
  const compareJobsData = sortedJobs.filter((j) => compareJobIds.includes(j.id)).slice(0, 2);

  return (
    <div className="space-y-5 w-full pb-12">
      {/* 1. Header Standardized */}
      <PageHeader
        title="Perbandingan Lowongan Kerja"
        subtitle="Bandingkan kecocokan CV kamu dengan beberapa lowongan kerja sekaligus untuk menentukan prioritas terbaik."
        icon={BarChart2}
        badge="Leaderboard Hub"
        stats={[
          { label: 'Lowongan Dibandingkan', value: `${jobTargets.length} Posisi`, icon: Layers },
          { label: 'Target Utama', value: sortedJobs[0] ? sortedJobs[0].position : '-', icon: Trophy, colorClass: 'text-amber-500' },
        ]}
        actions={
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer border-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Lowongan</span>
          </button>
        }
      />

      {/* 3. ACTIVE CV SUMMARY BAR & 11. PROGRESS METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Active CV Bar (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900/80 rounded-[10px] border border-slate-200 dark:border-slate-800 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {activeCv ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[10px] bg-[#1F3578]/10 text-[#1F3578] flex items-center justify-center shrink-0">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      CV Aktif:
                    </span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {activeCv.title}
                    </span>
                    <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <Star className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                      <span>{activeCv.atsScore}% ATS</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {activeCv.role} • Terakhir dianalisis {activeCv.updatedAt}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsChangeCvModalOpen(true)}
                className="px-3 py-1.5 rounded-[10px] bg-slate-100 hover:bg-slate-200 text-[#1F3578] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Ganti CV</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3 w-full">
              <div className="w-9 h-9 rounded-[10px] bg-[#1F3578]/10 text-[#1F3578] flex items-center justify-center shrink-0">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-black text-slate-900 dark:text-white">Belum ada CV aktif</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isLoading ? 'Memuat data CV...' : 'Buat CV dulu di halaman CV, lalu kembali ke sini untuk analisis kecocokan lowongan.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 11. Dashboard Live Progress Summary (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900/80 rounded-[10px] border border-slate-200 dark:border-slate-800 p-3.5 shadow-2xs flex items-center justify-between gap-2 text-center text-xs">
          <div className="flex-1 border-r border-slate-100 pr-2">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Lowongan</span>
            <span className="font-extrabold text-slate-900 text-sm">{totalAnalyzed} Target</span>
          </div>

          <div className="flex-1 border-r border-slate-100 pr-2">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Rata-rata Match</span>
            <span className="font-extrabold text-emerald-600 text-sm">{avgMatchScore}%</span>
          </div>

          <div className="flex-1">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Target Terbaik</span>
            <span className="font-extrabold text-[#F97316] text-xs truncate flex items-center justify-center gap-1" title={bestTarget?.company}>
              <Trophy className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
              <span>{bestTarget?.company || '-'} ({bestTarget?.matchScore}%)</span>
            </span>
          </div>
        </div>
      </div>

      {/* 8. MAIN DESKTOP 2-COLUMN STICKY LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: 4. RANKING LEADERBOARD CARDS (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#F97316]" />
              <h2 className="font-extrabold text-sm text-slate-900">
                Peringkat Kecocokan Lowongan
              </h2>
            </div>

            {/* Mode Switch Button */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-[10px] text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setViewMode('detail')}
                className={`px-2.5 py-1 rounded-[10px] transition cursor-pointer ${
                  viewMode === 'detail' ? 'bg-white text-[#1F3578] shadow-2xs' : 'text-slate-500'
                }`}
              >
                Detail
              </button>
              <button
                type="button"
                onClick={() => setViewMode('compare')}
                className={`px-2.5 py-1 rounded-[10px] transition cursor-pointer flex items-center gap-1 ${
                  viewMode === 'compare' ? 'bg-white text-[#F97316] shadow-2xs' : 'text-slate-500'
                }`}
              >
                <ArrowUpDown className="w-3 h-3" />
                <span>Komparasi (2)</span>
              </button>
            </div>
          </div>

          {/* 4. LEADERBOARD CARDS LIST */}
          <div className="space-y-2.5">
            {isLoading && (
              <div className="p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-center space-y-1.5">
                <Loader2 className="w-5 h-5 text-[#3B5CC4] animate-spin mx-auto" />
                <p className="text-xs font-semibold text-slate-500">Memuat lowongan dari database...</p>
              </div>
            )}

            {!isLoading && sortedJobs.length === 0 && (
              <div className="p-6 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-center space-y-2">
                <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">Belum ada lowongan untuk dibandingkan.</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Tambahkan lowongan kerja secara manual di bawah, atau isi tabel lowongan (jobs) lewat admin agar muncul di sini.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-1 px-3.5 py-2 rounded-[10px] bg-[#F97316] hover:bg-[#132EA8] text-white font-extrabold text-xs transition inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Lowongan Pertama</span>
                </button>
              </div>
            )}

            {!isLoading && sortedJobs.map((job, idx) => {
              const isSelected = selectedJobId === job.id && viewMode === 'detail';
              const isCheckedForCompare = compareJobIds.includes(job.id);
              const rankBadge = `#${idx + 1}`;

              const statusBadgeColor =
                job.statusColor === 'emerald'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : job.statusColor === 'blue'
                  ? 'bg-blue-100 text-navy-800 border-blue-200'
                  : job.statusColor === 'amber'
                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                  : 'bg-rose-100 text-rose-800 border-rose-200';

              return (
                <div
                  key={job.id}
                  onClick={() => {
                    setSelectedJobId(job.id);
                    setViewMode('detail');
                  }}
                  className={`p-3.5 rounded-[10px] border transition cursor-pointer space-y-2.5 relative ${
                    isSelected
                      ? 'border-[#3B5CC4] bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-[#3B5CC4]/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 bg-white dark:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      {/* Checkbox for side-by-side compare */}
                      <button
                        type="button"
                        onClick={(e) => toggleCompare(job.id, e)}
                        title="Centang untuk membandingkan bar chart"
                        className="text-slate-400 hover:text-[#3B5CC4] mt-0.5 transition"
                      >
                        {isCheckedForCompare ? (
                          <CheckSquare className="w-4 h-4 text-[#3B5CC4]" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>

                      {/* Rank Badge */}
                      <span className="text-xs font-black w-6 text-slate-500 text-center shrink-0">
                        {rankBadge}
                      </span>

                      {/* Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-extrabold text-slate-900">
                            {job.company}
                          </h3>
                          <span className="px-1.5 py-0.5 rounded-[10px] text-[10px] font-semibold bg-slate-100 text-slate-600">
                            {job.position}
                          </span>
                        </div>

                        {/* Stars rating */}
                        <div className="flex items-center gap-1 mt-1">
                          {Array.from({ length: 5 }).map((_, sIdx) => (
                            <Star
                              key={sIdx}
                              className={`w-3 h-3 ${
                                sIdx < job.stars
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-200 fill-slate-100'
                              }`}
                            />
                          ))}
                          <span className={`ml-2 px-1.5 py-0.5 rounded-[10px] text-[9px] font-extrabold border ${statusBadgeColor}`}>
                            {job.statusBadge}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right match score badge */}
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block font-semibold">ATS Match</span>
                      <span className={`text-base font-black ${job.matchScore >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {job.matchScore}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Add Button underneath Leaderboard */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="w-full py-3 rounded-[10px] border-2 border-dashed border-slate-300 hover:border-[#3B5CC4] hover:bg-blue-50/50 text-[#1F3578] font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#F97316]" />
            <span>Tambah Target Lowongan Baru</span>
          </button>
        </div>

        {/* RIGHT COLUMN: 5 & 8. TABBED STICKY DETAIL ATS PANEL (7 COLS) */}
        <div className="lg:col-span-7 sticky top-6 space-y-4">
          {viewMode === 'compare' && compareJobsData.length >= 2 ? (
            /* 12. VISUAL BAR GRAPH COMPARISON MODE (GoTo vs Shopee) */
            <div className="bg-white dark:bg-slate-900/80 rounded-[10px] border border-slate-200 dark:border-slate-800 p-5 space-y-5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-extrabold text-[#F97316] uppercase tracking-wider block">
                    Visual Bar Comparison Matrix
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-900 mt-0.5">
                    {compareJobsData[0].company} vs {compareJobsData[1].company}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setViewMode('detail')}
                  className="px-2.5 py-1 rounded-[10px] border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Kembali ke Detail
                </button>
              </div>

              {/* BAR GRAPH COMPARISON LIST */}
              <div className="space-y-4 text-xs">
                {/* Match Score Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Total Match Score</span>
                    <span>
                      {compareJobsData[0].company}: <strong className="text-emerald-600">{compareJobsData[0].matchScore}%</strong> vs {compareJobsData[1].company}: <strong className="text-emerald-600">{compareJobsData[1].matchScore}%</strong>
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
                      <div className="h-full bg-[#1F3578] transition-all" style={{ width: `${compareJobsData[0].matchScore}%` }} title={`${compareJobsData[0].company}: ${compareJobsData[0].matchScore}%`} />
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
                      <div className="h-full bg-[#F97316] transition-all" style={{ width: `${compareJobsData[1].matchScore}%` }} title={`${compareJobsData[1].company}: ${compareJobsData[1].matchScore}%`} />
                    </div>
                  </div>
                </div>

                {/* Hard Skill Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Hard Skill Match</span>
                    <span>{compareJobsData[0].breakdown.hardSkills}% vs {compareJobsData[1].breakdown.hardSkills}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-[#3B5CC4]" style={{ width: `${compareJobsData[0].breakdown.hardSkills}%` }} />
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-[#F97316]" style={{ width: `${compareJobsData[1].breakdown.hardSkills}%` }} />
                    </div>
                  </div>
                </div>

                {/* Soft Skill Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Soft Skill Match</span>
                    <span>{compareJobsData[0].breakdown.softSkills}% vs {compareJobsData[1].breakdown.softSkills}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-[#3B5CC4]" style={{ width: `${compareJobsData[0].breakdown.softSkills}%` }} />
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-[#F97316]" style={{ width: `${compareJobsData[1].breakdown.softSkills}%` }} />
                    </div>
                  </div>
                </div>

                {/* Experience Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Kesesuaian Pengalaman</span>
                    <span>{compareJobsData[0].breakdown.experience}% vs {compareJobsData[1].breakdown.experience}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-[#3B5CC4]" style={{ width: `${compareJobsData[0].breakdown.experience}%` }} />
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-[#F97316]" style={{ width: `${compareJobsData[1].breakdown.experience}%` }} />
                    </div>
                  </div>
                </div>

                {/* Summary Winner Card */}
                <div className="p-3.5 rounded-[10px] bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <span className="font-extrabold text-emerald-700 uppercase tracking-wider block text-[10px]">
                    Kesimpulan Pilihan Terbaik
                  </span>
                  <p className="font-bold flex items-center gap-1.5 flex-wrap">
                    <Trophy className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Prioritaskan melamar ke <span className="underline">{compareJobsData[0].matchScore >= compareJobsData[1].matchScore ? compareJobsData[0].company : compareJobsData[1].company}</span> terlebih dahulu karena memiliki skor kecocokan kata kunci ATS paling tinggi ({Math.max(compareJobsData[0].matchScore, compareJobsData[1].matchScore)}%).</span>
                  </p>
                </div>
              </div>
            </div>
          ) : selectedJob ? (
            /* 5. TABBED DETAIL ATS PANEL FOR SELECTED JOB */
            <div className="bg-white dark:bg-slate-900/80 rounded-[10px] border border-slate-200 dark:border-slate-800 p-5 space-y-5 shadow-2xs">
              {/* Target Job Header info */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Detail Evaluasi Lowongan Terpilih
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                    {selectedJob.company} — <span className="text-[#3B5CC4]">{selectedJob.position}</span>
                  </h3>
                </div>

                <span className="px-2.5 py-1 rounded-[10px] text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {selectedJob.matchScore}% ATS
                </span>
              </div>

              {/* 5. FOUR CLEAN TABS */}
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-[10px] text-xs font-extrabold">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`py-2 text-center rounded-[10px] transition cursor-pointer ${
                    activeTab === 'overview' ? 'bg-white text-[#1F3578] shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Overview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('keywords')}
                  className={`py-2 text-center rounded-[10px] transition cursor-pointer ${
                    activeTab === 'keywords' ? 'bg-white text-[#1F3578] shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Keywords
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('gap')}
                  className={`py-2 text-center rounded-[10px] transition cursor-pointer ${
                    activeTab === 'gap' ? 'bg-white text-[#1F3578] shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Gap Skill
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('insights')}
                  className={`py-2 text-center rounded-[10px] transition cursor-pointer ${
                    activeTab === 'insights' ? 'bg-white text-[#1F3578] shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Insight
                </button>
              </div>

              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-[10px] bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 block">Hard Skill</span>
                      <span className="font-extrabold text-[#1F3578] text-sm">{selectedJob.breakdown.hardSkills}%</span>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#3B5CC4]" style={{ width: `${selectedJob.breakdown.hardSkills}%` }} />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-[10px] bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 block">Soft Skill</span>
                      <span className="font-extrabold text-[#1F3578] text-sm">{selectedJob.breakdown.softSkills}%</span>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#3B5CC4]" style={{ width: `${selectedJob.breakdown.softSkills}%` }} />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-[10px] bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 block">Pengalaman</span>
                      <span className="font-extrabold text-[#1F3578] text-sm">{selectedJob.breakdown.experience}%</span>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#3B5CC4]" style={{ width: `${selectedJob.breakdown.experience}%` }} />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-[10px] bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 block">Pendidikan</span>
                      <span className="font-extrabold text-[#1F3578] text-sm">{selectedJob.breakdown.education}%</span>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#3B5CC4]" style={{ width: `${selectedJob.breakdown.education}%` }} />
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-[10px] border border-slate-100">
                    <strong className="font-bold text-slate-900">Deskripsi Ringkas Target:</strong> {selectedJob.description}
                  </p>
                </div>
              )}

              {/* 9. TAB 2: KEYWORDS & LIHAT SEMUA TRIGGER */}
              {activeTab === 'keywords' && (
                <div className="space-y-3 text-xs">
                  <div className="space-y-2">
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Kata Kunci Cocok ({selectedJob.matchedKeywords.length + (addedSkillsMap[selectedJob.id]?.length || 0)})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.matchedKeywords
                        .concat(addedSkillsMap[selectedJob.id] || [])
                        .slice(0, 5)
                        .map((kw, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-[10px] text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{kw}</span>
                          </span>
                        ))}

                      {selectedJob.matchedKeywords.length > 5 && (
                        <button
                          type="button"
                          onClick={() => setIsKeywordsModalOpen(true)}
                          className="px-2 py-0.5 rounded-[10px] text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                        >
                          +{selectedJob.matchedKeywords.length - 5} skill lagi (Lihat Semua)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: GAP SKILL */}
              {activeTab === 'gap' && (
                <div className="space-y-3 text-xs">
                  <span className="font-bold text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Skill Belum Ditemukan di CV (Klik + untuk Simulasikan)
                  </span>

                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.missingKeywords
                      .filter((k) => !(addedSkillsMap[selectedJob.id] || []).includes(k))
                      .map((kw, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSimulateAddKeyword(selectedJob.id, kw)}
                          className="px-2.5 py-1 rounded-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3 text-amber-600" />
                          <span>{kw}</span>
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* TAB 4: INSIGHTS */}
              {activeTab === 'insights' && (
                <div className="space-y-3 text-xs">
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-900 block uppercase text-[10px] tracking-wider">Keunggulan Utama:</span>
                    <ul className="space-y-1 text-slate-600">
                      {selectedJob.strengths.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="font-bold text-slate-900 block uppercase text-[10px] tracking-wider">Panduan Optimasi:</span>
                    <ul className="space-y-1 text-slate-600">
                      {selectedJob.improvements.map((imp, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <ChevronRight className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* 10. CLEAR CTA HIERARCHY BAR */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2">
                {/* Tertiary CTA */}
                <button
                  type="button"
                  onClick={async () => {
                    const saved = await trackerApi.create({
                      company: selectedJob.company,
                      position: selectedJob.position,
                      location: selectedJob.location || 'Jakarta',
                      status: 'Terkirim',
                      portal: 'Match CV',
                      portalUrl: selectedJob.externalUrl || '',
                      notes: 'Ditambahkan dari halaman Match CV',
                    });
                    if (saved) {
                      toast.success(`Lowongan ${selectedJob.company} berhasil ditambahkan ke Tracker Lamaran!`);
                    } else {
                      toast.error('Gagal menambahkan ke Tracker. Periksa koneksi.');
                    }
                  }}
                  className="w-full sm:w-auto px-3 py-2 rounded-[10px] border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition text-center cursor-pointer"
                >
                  + Tracker Lamaran
                </button>

                {/* Primary CTA (ORANGE-500) */}
                <button
                  type="button"
                  onClick={() => toast.success(`CV berhasil dioptimalkan khusus untuk lowongan ${selectedJob.company}!`)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-[10px] bg-[#F97316] hover:bg-[#132EA8] text-white font-extrabold text-xs shadow-md transition text-center cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Optimasi CV (Rekomendasi Utama)</span>
                </button>
              </div>
            </div>
          ) : (
            /* Empty state panel — tidak ada lowongan dipilih */
            <div className="bg-white dark:bg-slate-900/80 rounded-[10px] border border-slate-200 dark:border-slate-800 p-8 text-center space-y-3 shadow-2xs">
              {isLoading ? (
                <>
                  <Loader2 className="w-8 h-8 text-[#3B5CC4] animate-spin mx-auto" />
                  <p className="text-sm font-bold text-slate-700">Memuat data...</p>
                </>
              ) : (
                <>
                  <Target className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">Belum ada lowongan untuk dianalisis</p>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                    Pilih lowongan dari daftar, atau tambahkan lowongan baru untuk melihat detail kecocokan CV kamu.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(true)}
                    className="mt-1 px-4 py-2.5 rounded-[10px] bg-[#F97316] hover:bg-[#132EA8] text-white font-extrabold text-xs transition inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Lowongan</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 6. MODAL: TAMBAH LOWONGAN TARGET */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[10px] max-w-lg w-full p-6 space-y-4 shadow-2xl relative border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-[#F97316]" />
                <span>Tambah Target Lowongan Kerja</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Presets loader inside modal */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Pilih Preset Cepat:
              </span>
              <div className="flex flex-wrap gap-1">
                {samplePresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="px-2.5 py-1 rounded-[10px] text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                  >
                    + {preset.company} ({preset.position})
                  </button>
                ))}
              </div>
            </div>

            {/* Form Inputs */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Posisi *</label>
                <input
                  type="text"
                  required
                  value={newPosition}
                  onChange={(e) => setNewPosition(e.target.value)}
                  placeholder="Contoh: Frontend Engineer"
                  className="w-full px-3 py-2 rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#3B5CC4] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Perusahaan *</label>
                <input
                  type="text"
                  required
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="Contoh: GoTo / Shopee / Tokopedia"
                  className="w-full px-3 py-2 rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#3B5CC4] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Teks Job Description *</label>
                <textarea
                  rows={5}
                  required
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Tempelkan persyaratan pekerjaan dari portal karir di sini..."
                  className="w-full p-3 rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#3B5CC4] focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Modal submit button */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-[10px] border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                className="px-5 py-2.5 rounded-[10px] bg-[#F97316] hover:bg-[#132EA8] text-white font-extrabold text-xs shadow-md transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menganalisis...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Analisis &amp; Tambah</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. MODAL: LIHAT SEMUA KEYWORDS */}
      {isKeywordsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[10px] max-w-md w-full p-6 space-y-4 shadow-2xl relative border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-[#3B5CC4]" />
                <span>Semua Kata Kunci ATS ({selectedJob.company})</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsKeywordsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 text-xs">
              <span className="font-bold text-emerald-600 block">Kata Kunci Ditemukan di CV:</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedJob.matchedKeywords
                  .concat(addedSkillsMap[selectedJob.id] || [])
                  .map((kw, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-[10px] text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{kw}</span>
                    </span>
                  ))}
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setIsKeywordsModalOpen(false)}
                className="px-4 py-1.5 rounded-[10px] bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: GANTI CV */}
      {isChangeCvModalOpen && (
        <div
          onClick={() => setIsChangeCvModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-[10px] max-w-lg w-full p-6 space-y-4 shadow-2xl relative border border-slate-200 dark:border-slate-800 cursor-default"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#3B5CC4]" />
                <span>Pilih Profil CV Aktif</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsChangeCvModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {savedCVs.length > 0 ? (
                savedCVs.map((cv) => (
                  <div
                    key={cv.id}
                    onClick={() => {
                      setSelectedCvId(cv.id);
                      setIsChangeCvModalOpen(false);
                    }}
                    className={`p-3.5 rounded-[10px] border transition cursor-pointer flex items-start justify-between gap-3 ${
                      selectedCvId === cv.id
                        ? 'border-[#3B5CC4] bg-blue-50/60 ring-2 ring-[#3B5CC4]/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{cv.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{cv.role} • Diperbarui {cv.updatedAt}</p>
                    </div>
                    {selectedCvId === cv.id && (
                      <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                        Aktif
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-6 text-center space-y-2">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-500">Belum ada CV tersimpan.</p>
                  <p className="text-[11px] text-slate-400">Buat CV dulu di halaman CV agar bisa dianalisis di sini.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
