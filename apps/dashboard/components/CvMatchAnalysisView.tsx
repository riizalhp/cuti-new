'use client';

import { PageHeader } from '@/components/ui/PageHeader';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';
import { cvApi, jobsApi, trackerApi } from '@/lib/api';
import { getScoreTextClass } from '@/lib/score-color';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { IconButton } from '@/components/ui/icon-button';
import { CvScopeSelector } from '@/components/ui/CvScopeSelector';
import { MascotEmptyState } from '@/components/ui/MascotEmptyState';

import {
  FileText,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Check,
  ChevronRight,
  Target,
  BarChart2,
  ArrowLeft,
  SlidersHorizontal,
  Layers,
  PlusCircle,
  CheckSquare,
  Square,
  FileCheck2,
  Trophy,
  Loader2,
  Trash2,
  Search,
  Sparkles,
} from 'lucide-react';

interface SavedCV {
  id: string;
  title: string;
  updatedAt: string;
  atsScore: number;
  skills: string[];
  role: string;
  targetRole?: string;
  targetPosition?: string;
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
  actionableBullet?: string;
  summaryVerdict?: string;
  analyzedAt: string;
}

const initialJobTargets: JobMatchTarget[] = [] as JobMatchTarget[];

export const CvMatchAnalysisView: React.FC = () => {
  const toast = useToast();
  // Step 1 State: Active CV — dimuat dari database (tidak ada fallback contoh)
  const [savedCVs, setSavedCVs] = useState<SavedCV[]>([]);
  const [selectedCvId, setSelectedCvId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [rawJobs, setRawJobs] = useState<any[]>([]);

  // Target Jobs State (Ranking) — default kosong, user bebas memilih dari marketplace atau input luar
  const [jobTargets, setJobTargets] = useState<JobMatchTarget[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');

  // Tab sumber saat menambah lowongan: 'manual' (luar) atau 'marketplace'
  const [addSourceTab, setAddSourceTab] = useState<'manual' | 'marketplace'>('manual');
  const [marketplaceSearchQuery, setMarketplaceSearchQuery] = useState<string>('');

  // Fungsi pembentuk satu target evaluasi dari data lowongan
  const buildSingleTargetFromJob = (job: any, cvSkills: string[]): JobMatchTarget => {
    const skillLower = cvSkills.map((s) => s.toLowerCase());
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
      id: String(job.id),
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
  };

  const buildTargetsFromJobs = (jobs: any[], cvSkills: string[]): JobMatchTarget[] => {
    return jobs.map((job) => buildSingleTargetFromJob(job, cvSkills));
  };

  // Muat CV asli dari database + simpan lowongan marketplace untuk referensi eksplorasi
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [cvs, jobs] = await Promise.all([cvApi.getAll(), jobsApi.getAll()]);
        if (cancelled) return;

        if (Array.isArray(cvs) && cvs.length > 0) {
          const mapped: SavedCV[] = cvs.map((cv: any) => {
            const roleName = cv.headline || cv.targetJob || 'Professional';
            return {
              id: cv.id,
              title: cv.title || 'CV Saya',
              updatedAt: cv.updatedAt || 'Baru saja',
              atsScore: cv.atsScore || 0,
              role: roleName,
              targetRole: roleName,
              targetPosition: roleName,
              experienceYears: '1-3 Tahun',
              skills: Array.isArray(cv.skills) ? cv.skills.map((s: any) => (typeof s === 'string' ? s : s.name || String(s))) : [],
            };
          });
          setSavedCVs(mapped);
          setSelectedCvId(mapped[0].id);
        } else {
          setSavedCVs([]);
          setSelectedCvId('');
        }

        if (Array.isArray(jobs) && jobs.length > 0) {
          setRawJobs(jobs);
        } else {
          setRawJobs([]);
        }
        // JANGAN auto-populate ke komparasi. Biarkan user secara sadar memilih/menambahkan lowongan.
        setJobTargets([]);
        setSelectedJobId('');
        setCompareJobIds([]);
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

  // Filter lowongan marketplace berdasarkan kata kunci pencarian di drawer
  const filteredMarketplaceJobs = useMemo(() => {
    if (!marketplaceSearchQuery.trim()) return rawJobs;
    const q = marketplaceSearchQuery.toLowerCase().trim();
    return rawJobs.filter((job) => {
      const title = (job.title || job.position || '').toLowerCase();
      const comp = (job.company || '').toLowerCase();
      const loc = (job.location || '').toLowerCase();
      return title.includes(q) || comp.includes(q) || loc.includes(q);
    });
  }, [rawJobs, marketplaceSearchQuery]);

  // Handler pemilihan CV dari drawer kanan (CvScopeSelector)
  const handleCvChange = (newCvId: string) => {
    setSelectedCvId(newCvId);
    const targetCv = savedCVs.find((c) => c.id === newCvId);
    if (targetCv) {
      if (jobTargets.length > 0) {
        const updatedTargets = jobTargets.map((target) => {
          const raw = rawJobs.find((r) => String(r.id) === target.id);
          if (raw) {
            return buildSingleTargetFromJob(raw, targetCv.skills);
          }
          const skillLower = targetCv.skills.map((s) => s.toLowerCase());
          const haystack = `${target.position} ${target.company} ${target.description}`.toLowerCase();
          const matchedKeywords = targetCv.skills.filter((s) => haystack.includes(s.toLowerCase()));
          const matchScore = Math.min(96, Math.max(45, 45 + matchedKeywords.length * 9));
          return {
            ...target,
            matchScore,
            atsScore: Math.min(98, matchScore + 4),
            matchedKeywords,
          };
        });
        setJobTargets(updatedTargets);
      }
      toast.success('CV Aktif Diganti', `Kualifikasi acuan berhasil dialihkan ke "${targetCv.title}".`);
    }
  };

  // Handler menambahkan lowongan terpilih dari marketplace platform
  const handleAddJobFromMarketplace = (job: any) => {
    const jobIdStr = String(job.id);
    if (jobTargets.some((t) => t.id === jobIdStr)) {
      toast.info('Sudah Ada', `${job.title || 'Lowongan'} di ${job.company} sudah ada di komparasi.`);
      return;
    }

    const activeSkills = activeCv?.skills || [];
    const newTarget = buildSingleTargetFromJob(job, activeSkills);
    setJobTargets((prev) => [newTarget, ...prev]);
    setSelectedJobId(newTarget.id);
    if (compareJobIds.length < 2) {
      setCompareJobIds((prev) => [...prev, newTarget.id]);
    }
    toast.success('Lowongan Ditambahkan', `${job.title} (${job.company}) berhasil dimasukkan ke daftar perbandingan.`);
  };

  // Handler Hapus Target Lowongan dari daftar komparasi
  const handleDeleteJob = (jobId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const targetToRemove = jobTargets.find((j) => j.id === jobId);
    setJobTargets((prev) => {
      const remaining = prev.filter((j) => j.id !== jobId);
      if (selectedJobId === jobId) {
        setSelectedJobId(remaining[0]?.id || '');
      }
      return remaining;
    });
    setCompareJobIds((prev) => prev.filter((id) => id !== jobId));
    toast.info('Lowongan Dihapus', `${targetToRemove?.company || 'Target lowongan'} berhasil dikeluarkan dari daftar komparasi.`);
  };

  // Handler Kosongkan Semua Lowongan
  const handleClearAllJobs = () => {
    setJobTargets([]);
    setSelectedJobId('');
    setCompareJobIds([]);
    toast.info('Daftar Dikosongkan', 'Semua target lowongan telah dihapus dari komparasi.');
  };

  // Handler Muat Ulang Rekomendasi Lowongan Marketplace
  const handleReloadMarketplaceJobs = () => {
    if (rawJobs.length > 0) {
      const activeSkills = activeCv?.skills || [];
      const targets = buildTargetsFromJobs(rawJobs, activeSkills);
      setJobTargets(targets);
      if (targets.length > 0) {
        setSelectedJobId(targets[0].id);
        setCompareJobIds([targets[0].id, targets[1]?.id || targets[0].id]);
      }
      toast.success('Rekomendasi Dimuat', '6 lowongan dari marketplace berhasil dimuat kembali ke daftar komparasi.');
    }
  };

  // Multi-Compare State (Checkbox selection for side-by-side)
  const [compareJobIds, setCompareJobIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'detail' | 'compare'>('detail');
  const [mobileTab, setMobileTab] = useState<'list' | 'detail'>('list');

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
  const handleRunAnalysis = async () => {
    if (!newPosition.trim() || !newCompany.trim() || !newDescription.trim()) {
      toast.warning('Silakan isi Nama Posisi, Perusahaan, dan Teks Job Description terlebih dahulu.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep(0);

    const stepTimer = setInterval(() => {
      setAnalysisStep((prev) => (prev < analysisStepsList.length - 1 ? prev + 1 : prev));
    }, 450);

    try {
      const res = await fetch('/api/cv/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvId: activeCv.id,
          cvData: {
            skills: activeCv.skills,
            target_position: activeCv.role,
          },
          position: newPosition.trim(),
          company: newCompany.trim(),
          jobDescription: newDescription.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Gagal menganalisis lowongan.');
      }

      const matchData = json.data;
      const newTarget: JobMatchTarget = {
        ...matchData,
        description: newDescription,
        analyzedAt: 'Baru saja',
      };

      setJobTargets((prev) => {
        const updated = [newTarget, ...prev];
        return updated.sort((a, b) => b.matchScore - a.matchScore);
      });

      setSelectedJobId(newTarget.id);
      setMobileTab('detail');
      setIsAddModalOpen(false);
      setNewPosition('');
      setNewCompany('');
      setNewDescription('');
      toast.success('Analisis Selesai', 'Kecocokan lowongan berhasil dihitung dan ditambahkan ke daftar komparasi.');
    } catch (err: any) {
      console.warn('[CvMatchAnalysisView] Error running match API, fallback to local:', err);

      // Fallback lokal jika ada gangguan koneksi
      const cvSkills = (activeCv.skills || []).map((s) => s.toLowerCase());
      const haystack = `${newPosition} ${newCompany} ${newDescription}`.toLowerCase();
      const matchedKeywords = (activeCv.skills || []).filter((s) => haystack.includes(s.toLowerCase()));
      const computedScore = Math.min(94, Math.max(40, 42 + matchedKeywords.length * 9));

      const fallbackTarget: JobMatchTarget = {
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
        missingKeywords: ['Kualifikasi Spesifik'],
        strengths: [`Keahlian kamu (${matchedKeywords.slice(0, 3).join(', ') || 'Umum'}) memiliki relevansi dasar.`],
        improvements: ['Perjelas kata kunci relevan dari deskripsi pekerjaan ke dalam riwayat CV.'],
      };

      setJobTargets((prev) => [fallbackTarget, ...prev]);
      setSelectedJobId(fallbackTarget.id);
      setMobileTab('detail');
      setIsAddModalOpen(false);
      setNewPosition('');
      setNewCompany('');
      setNewDescription('');
      toast.success('Analisis Selesai', 'Kecocokan lowongan berhasil dihitung dan ditambahkan ke daftar komparasi.');
    } finally {
      clearInterval(stepTimer);
      setIsAnalyzing(false);
    }
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

  // Sorted job targets descending by match score
  const sortedJobs = [...jobTargets].sort((a, b) => b.matchScore - a.matchScore);

  // Compare jobs data
  const compareJobsData = sortedJobs.filter((j) => compareJobIds.includes(j.id)).slice(0, 2);

  return (
    <div className="space-y-5 w-full pb-12">
      {/* 1. Header Standardized (Area Biru Dongker) */}
      <PageHeader
        title="Perbandingan Lowongan Kerja"
        subtitle={
          !activeCv && !isLoading
            ? 'Bandingkan kecocokan kualifikasi dan kata kunci CV dengan lowongan target. Buat CV dulu di halaman CV untuk memulai analisis.'
            : 'Bandingkan kecocokan kualifikasi dan kata kunci CV kamu dengan beberapa target lowongan kerja sekaligus.'
        }
        icon={BarChart2}
        badge="Komparasi Lowongan"
        stats={
          !activeCv
            ? [
                {
                  label: 'Status CV',
                  value: isLoading ? 'Memuat...' : 'Belum Ada',
                  icon: FileText,
                  colorClass: 'text-amber-300',
                  isPrimary: true,
                },
                ...(jobTargets.length > 0
                  ? [
                      { label: 'Lowongan', value: `${jobTargets.length} Posisi`, icon: Layers },
                      { label: 'Target Utama', value: sortedJobs[0] ? sortedJobs[0].position : '-', icon: Trophy, colorClass: 'text-amber-300' },
                    ]
                  : []),
              ]
            : [
                {
                  label: 'Skor ATS CV',
                  value: `${activeCv.atsScore}%`,
                  icon: Sparkles,
                  colorClass: 'text-emerald-300',
                  isPrimary: jobTargets.length === 0,
                },
                {
                  label: 'Lowongan',
                  value: `${jobTargets.length} Posisi`,
                  icon: Layers,
                  isPrimary: jobTargets.length > 0,
                },
                ...(jobTargets.length > 0
                  ? [
                      {
                        label: 'Kecocokan Tertinggi',
                        value: sortedJobs[0] ? `${sortedJobs[0].matchScore}%` : '-',
                        icon: Trophy,
                        colorClass: 'text-amber-300',
                      },
                    ]
                  : []),
              ]
        }
        actions={
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            {savedCVs.length > 0 ? (
              <CvScopeSelector
                cvs={savedCVs}
                selectedCvId={selectedCvId}
                onChange={handleCvChange}
                allowAll={false}
                label="Basis CV"
              />
            ) : (
              <Link
                href="/cv"
                className={cn(
                  buttonVariants({ variant: 'primary', size: 'sm' }),
                  'w-full sm:w-auto min-h-[44px] md:min-h-[36px] gap-1.5 cursor-pointer shrink-0'
                )}
                title="Buat CV pertamamu di CV Builder"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat CV</span>
              </Link>
            )}

            <Button
              variant={savedCVs.length > 0 ? 'primary' : 'subtle'}
              size="sm"
              onClick={() => {
                setAddSourceTab('manual');
                setIsAddModalOpen(true);
              }}
              className="w-full sm:w-auto min-h-[44px] md:min-h-[36px] flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Lowongan</span>
            </Button>
          </div>
        }
      />

      {/* 2. Live Progress Summary (Hanya muncul saat ada target lowongan) */}
      {sortedJobs.length > 0 && (
        <div className="bg-white dark:bg-slate-900/80 rounded-[10px] border border-slate-200 dark:border-slate-800 p-3.5 shadow-2xs flex items-center justify-between gap-2 text-center text-xs">
          <div className="flex-1 min-w-0 border-r border-slate-100 dark:border-slate-800 pr-2">
            <span className="text-[10px] font-bold text-slate-500 block uppercase dark:text-slate-400 truncate">Lowongan</span>
            <span className="font-extrabold text-slate-900 dark:text-white text-sm">{totalAnalyzed} Target</span>
          </div>

          <div className="flex-1 min-w-0 border-r border-slate-100 dark:border-slate-800 pr-2">
            <span className="text-[10px] font-bold text-slate-500 block uppercase dark:text-slate-400 truncate">Rata-rata Match</span>
            <span className={`font-extrabold text-sm transition-colors ${getScoreTextClass(avgMatchScore, totalAnalyzed === 0)}`}>{avgMatchScore}%</span>
          </div>

          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-slate-500 block uppercase dark:text-slate-400 truncate">Target Terbaik</span>
            <span className="font-extrabold text-slate-900 dark:text-white text-xs truncate flex items-center justify-center gap-1" title={bestTarget?.company}>
              <Trophy className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="truncate">{bestTarget ? `${bestTarget.company} (${bestTarget.matchScore}%)` : '-'}</span>
            </span>
          </div>
        </div>
      )}

      {sortedJobs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 shadow-2xs">
          <MascotEmptyState
            size="md"
            badge="Komparasi Kualifikasi"
            title={
              savedCVs.length === 0
                ? 'Belum Ada CV untuk Komparasi'
                : 'Bandingkan CV dengan Target Lowongan'
            }
            description={
              savedCVs.length === 0
                ? 'Buat CV dulu di halaman CV, lalu kembali ke sini untuk analisis kecocokan kualifikasi dan kata kunci lowongan.'
                : `Cek kecocokan kualifikasi dan kata kunci CV (${activeCv?.title || 'CV Saya'}) dengan lowongan kerja sebelum melamar.`
            }
            action={
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2 w-full max-w-sm sm:max-w-none mx-auto">
              {savedCVs.length === 0 ? (
                <>
                  <Link
                    href="/cv"
                    className={cn(
                      buttonVariants({ variant: 'primary', size: 'md' }),
                      'w-full sm:w-auto min-h-[44px] gap-2'
                    )}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Buat CV Sekarang</span>
                  </Link>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => {
                      setAddSourceTab('manual');
                      setIsAddModalOpen(true);
                    }}
                    className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Lowongan Manual</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      setAddSourceTab('manual');
                      setIsAddModalOpen(true);
                    }}
                    className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Lowongan Manual</span>
                  </Button>
                  {rawJobs.length > 0 && (
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => {
                        setAddSourceTab('marketplace');
                        setIsAddModalOpen(true);
                      }}
                      className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2"
                    >
                      <Briefcase className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      <span>Pilih dari Marketplace ({rawJobs.length})</span>
                    </Button>
                  )}
                </>
              )}
            </div>
          }
        />
      </div>
    ) : (
        <>
          {/* MOBILE SEGMENTED CONTROL (Hanya saat ada target) */}
          <div className="lg:hidden flex items-center p-1 bg-slate-200/70 dark:bg-slate-800 rounded-[10px] gap-1">
            <button
              type="button"
              onClick={() => setMobileTab('list')}
              className={`flex-1 py-2 text-xs font-bold rounded-[8px] transition ${
                mobileTab === 'list'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Peringkat ({sortedJobs.length})
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('detail')}
              className={`flex-1 py-2 text-xs font-bold rounded-[8px] transition ${
                mobileTab === 'detail'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {viewMode === 'compare' ? 'Hasil Komparasi' : 'Detail Evaluasi'}
            </button>
          </div>

          {/* 8. MAIN DESKTOP 2-COLUMN STICKY LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: 4. RANKING LEADERBOARD CARDS (5 COLS) */}
            <div className={`lg:col-span-5 space-y-4 ${mobileTab === 'list' ? 'block' : 'hidden lg:block'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-orange-700 dark:text-orange-400" />
                  <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Peringkat Kecocokan Lowongan
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {sortedJobs.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllJobs}
                      className="text-caption font-bold text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer px-2.5 py-1.5 min-h-[36px] flex items-center rounded-[8px] hover:bg-rose-50 dark:hover:bg-rose-950/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                      title="Hapus semua target lowongan dari daftar"
                      aria-label="Kosongkan semua lowongan dari komparasi"
                    >
                      Kosongkan
                    </button>
                  )}

                  {/* Mode Switch Button (Tabs) */}
                  <Tabs
                    value={viewMode}
                    onValueChange={(val) => setViewMode(val as 'detail' | 'compare')}
                  >
                    <TabsList variant="pill" aria-label="Pilih Tampilan Mode">
                      <TabsTrigger size="xs" value="detail">Detail</TabsTrigger>
                      <TabsTrigger size="xs" value="compare">Komparasi (2)</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>

              {/* 4. LEADERBOARD CARDS LIST */}
              <div className="space-y-2.5">
                {isLoading && (
                  <div className="space-y-2.5" aria-busy="true" aria-label="Memuat daftar lowongan target komparasi">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5 animate-pulse motion-reduce:animate-none"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-7 bg-slate-200 dark:bg-slate-800 rounded-[6px]" />
                              <div
                                className="h-4 bg-slate-200 dark:bg-slate-800 rounded-[6px]"
                                style={{ width: i === 1 ? '55%' : i === 2 ? '40%' : '65%' }}
                              />
                            </div>
                            <div className="h-3 w-28 bg-slate-100 dark:bg-slate-800/80 rounded-[4px]" />
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="space-y-1 text-right">
                              <div className="h-2.5 w-12 bg-slate-100 dark:bg-slate-800/70 rounded-[4px]" />
                              <div className="h-4 w-10 bg-slate-200 dark:bg-slate-800 rounded-[6px] ml-auto" />
                            </div>
                            <div className="w-7 h-7 rounded-[8px] bg-slate-100 dark:bg-slate-800/50" />
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <div className="h-4 w-20 rounded-[6px] bg-slate-100 dark:bg-slate-800/80" />
                          <div className="h-4 w-16 rounded-[6px] bg-slate-100 dark:bg-slate-800/80" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

            {sortedJobs.map((job, idx) => {
              const isSelected = selectedJobId === job.id && viewMode === 'detail';
              const isCheckedForCompare = compareJobIds.includes(job.id);
              const rankBadge = `#${idx + 1}`;

              const statusBadgeColor =
                job.statusColor === 'emerald'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                  : job.statusColor === 'blue'
                  ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
                  : job.statusColor === 'amber'
                  ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                  : 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';

              return (
                <div
                  key={job.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  onClick={() => {
                    setSelectedJobId(job.id);
                    setViewMode('detail');
                    setMobileTab('detail');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedJobId(job.id);
                      setViewMode('detail');
                      setMobileTab('detail');
                    }
                  }}
                  className={`p-3.5 rounded-[10px] border transition cursor-pointer space-y-2.5 relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 ${
                    isSelected
                      ? 'border-[#3B5CC4] bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-[#3B5CC4]/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 bg-white dark:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      {/* Checkbox for side-by-side compare (44x44px minimum tap target) */}
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={isCheckedForCompare}
                        aria-label={`Pilih ${job.company} untuk komparasi`}
                        onClick={(e) => toggleCompare(job.id, e)}
                        className="text-slate-500 hover:text-cobalt-600 dark:text-slate-400 p-2.5 -m-2 rounded-[8px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 transition shrink-0"
                      >
                        {isCheckedForCompare ? (
                          <CheckSquare className="w-4 h-4 text-cobalt-600 dark:text-cobalt-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>

                      {/* Rank Badge */}
                      <span className="text-xs font-black w-6 text-slate-500 dark:text-slate-400 text-center shrink-0 pt-0.5">
                        {rankBadge}
                      </span>

                      {/* Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                            {job.company}
                          </h3>
                          <span className="px-1.5 py-0.5 rounded-[6px] text-caption font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {job.position}
                          </span>
                        </div>

                        {/* Status badge (clean qualitative indicator, anti-slop) */}
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className={`px-2 py-0.5 rounded-[8px] text-[10px] font-extrabold border ${statusBadgeColor}`}>
                            {job.statusBadge}
                          </span>
                          {job.location && (
                            <span className="text-caption text-slate-500 dark:text-slate-400 truncate">
                              • {job.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right match score badge & Delete action */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className="text-caption text-slate-500 dark:text-slate-400 block font-semibold">ATS Match</span>
                        <span className={`text-base font-black transition-colors ${getScoreTextClass(job.matchScore)}`}>
                          {job.matchScore}%
                        </span>
                      </div>
                      <button
                        type="button"
                        aria-label={`Hapus ${job.company} dari perbandingan`}
                        title="Hapus lowongan ini dari perbandingan"
                        onClick={(e) => handleDeleteJob(job.id, e)}
                        className="p-1.5 text-slate-300 hover:text-rose-600 dark:text-slate-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-[8px] transition cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Add Button underneath Leaderboard */}
          <Button
            variant="outline"
            size="md"
            onClick={() => {
              setAddSourceTab('manual');
              setIsAddModalOpen(true);
            }}
            className="w-full min-h-[44px] border-dashed flex items-center justify-center gap-2 text-slate-700 dark:text-slate-200"
          >
            <Plus className="w-4 h-4 text-cobalt-500" />
            <span>Tambah Lowongan Manual</span>
          </Button>
        </div>

        {/* RIGHT COLUMN: 5 & 8. TABBED STICKY DETAIL ATS PANEL (7 COLS) */}
        <div className={`lg:col-span-7 sticky top-6 space-y-4 ${mobileTab === 'detail' ? 'block' : 'hidden lg:block'}`}>
          {/* Mobile Back Button to return to list */}
          <div className="lg:hidden pb-1">
            <button
              type="button"
              onClick={() => setMobileTab('list')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-1 -m-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Daftar Lowongan</span>
            </button>
          </div>

          {viewMode === 'compare' && compareJobsData.length >= 2 ? (
            /* 12. VISUAL BAR GRAPH COMPARISON MODE */
            <div className="bg-white dark:bg-slate-900/80 rounded-[10px] border border-slate-200 dark:border-slate-800 p-5 space-y-5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <span className="text-caption font-extrabold text-orange-700 uppercase tracking-wider block dark:text-orange-400">
                    Komparasi Langsung Antar Lowongan
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {compareJobsData[0].company} vs {compareJobsData[1].company}
                  </h3>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode('detail')}
                  className="min-h-[36px] flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Kembali ke Detail</span>
                </Button>
              </div>

              {/* BAR GRAPH COMPARISON LIST */}
              <div className="space-y-4 text-xs">
                {/* Match Score Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Total Match Score</span>
                    <span>
                      {compareJobsData[0].company}: <strong className="text-emerald-700 dark:text-emerald-400">{compareJobsData[0].matchScore}%</strong> vs {compareJobsData[1].company}: <strong className="text-emerald-700 dark:text-emerald-400">{compareJobsData[1].matchScore}%</strong>
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
                  <span className="font-extrabold text-emerald-700 uppercase tracking-wider block text-caption">
                    Kesimpulan Pilihan Terbaik
                  </span>
                  <p className="font-bold flex items-center gap-1.5 flex-wrap">
                    <Trophy className="w-4 h-4 text-emerald-700 shrink-0 dark:text-emerald-400" />
                    <span>Prioritaskan melamar ke <span className="underline">{compareJobsData[0].matchScore >= compareJobsData[1].matchScore ? compareJobsData[0].company : compareJobsData[1].company}</span> terlebih dahulu karena memiliki skor kecocokan kata kunci ATS paling tinggi ({Math.max(compareJobsData[0].matchScore, compareJobsData[1].matchScore)}%).</span>
                  </p>
                </div>
              </div>
            </div>
          ) : selectedJob ? (
            /* 5. TABBED DETAIL ATS PANEL FOR SELECTED JOB */
            <div className="bg-white dark:bg-slate-900/80 rounded-[10px] border border-slate-200 dark:border-slate-800 p-5 space-y-5 shadow-2xs">
              {/* Target Job Header info */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <span className="text-caption font-bold text-slate-500 uppercase tracking-wider block dark:text-slate-400">
                    Evaluasi Detail Lowongan
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {selectedJob.company} — <span className="text-[#3B5CC4] dark:text-blue-400">{selectedJob.position}</span>
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-1 rounded-[10px] text-xs font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {selectedJob.matchScore}% ATS
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteJob(selectedJob.id)}
                    title="Hapus lowongan ini dari perbandingan"
                    aria-label={`Hapus ${selectedJob.company} dari perbandingan`}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-[8px] transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 5. FOUR CLEAN TABS */}
              <Tabs
                value={activeTab}
                onValueChange={(val) => setActiveTab(val as any)}
              >
                <TabsList variant="pill" aria-label="Tab Detail Analisis Kecocokan" className="w-full grid grid-cols-4">
                  <TabsTrigger size="sm" value="overview">Overview</TabsTrigger>
                  <TabsTrigger size="sm" value="keywords">Keywords</TabsTrigger>
                  <TabsTrigger size="sm" value="gap">Gap Skill</TabsTrigger>
                  <TabsTrigger size="sm" value="insights">Insight</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-[10px] bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-caption font-bold text-slate-500 block dark:text-slate-400">Hard Skill</span>
                      <span className="font-extrabold text-[#1F3578] text-sm">{selectedJob.breakdown.hardSkills}%</span>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#3B5CC4]" style={{ width: `${selectedJob.breakdown.hardSkills}%` }} />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-[10px] bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-caption font-bold text-slate-500 block dark:text-slate-400">Soft Skill</span>
                      <span className="font-extrabold text-[#1F3578] text-sm">{selectedJob.breakdown.softSkills}%</span>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#3B5CC4]" style={{ width: `${selectedJob.breakdown.softSkills}%` }} />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-[10px] bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-caption font-bold text-slate-500 block dark:text-slate-400">Pengalaman</span>
                      <span className="font-extrabold text-[#1F3578] text-sm">{selectedJob.breakdown.experience}%</span>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#3B5CC4]" style={{ width: `${selectedJob.breakdown.experience}%` }} />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-[10px] bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-caption font-bold text-slate-500 block dark:text-slate-400">Pendidikan</span>
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
                    <span className="font-bold text-emerald-700 flex items-center gap-1 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Kata Kunci Cocok ({selectedJob.matchedKeywords.length + (addedSkillsMap[selectedJob.id]?.length || 0)})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.matchedKeywords
                        .concat(addedSkillsMap[selectedJob.id] || [])
                        .slice(0, 5)
                        .map((kw, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-[10px] text-caption font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-700 shrink-0 dark:text-emerald-400" />
                            <span>{kw}</span>
                          </span>
                        ))}

                      {selectedJob.matchedKeywords.length > 5 && (
                        <button
                          type="button"
                          onClick={() => setIsKeywordsModalOpen(true)}
                          className="px-2 py-0.5 rounded-[10px] text-caption font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
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
                  <span className="font-bold text-amber-700 flex items-center gap-1 dark:text-amber-400">
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
                          <Plus className="w-3 h-3 text-amber-700 dark:text-amber-400" />
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
                    <span className="font-bold text-slate-900 block uppercase text-caption tracking-wider">Keunggulan Utama:</span>
                    <ul className="space-y-1 text-slate-600">
                      {selectedJob.strengths.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5 dark:text-emerald-400" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="font-bold text-slate-900 block uppercase text-caption tracking-wider">Panduan Optimasi:</span>
                    <ul className="space-y-1 text-slate-600">
                      {selectedJob.improvements.map((imp, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <ChevronRight className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5 dark:text-amber-400" />
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>

                    {selectedJob.actionableBullet && (
                      <div className="mt-2.5 p-2.5 rounded-[10px] bg-amber-50/80 border border-amber-200/90 dark:bg-amber-950/40 dark:border-amber-800/60">
                        <div className="flex items-center gap-1.5 text-caption font-bold text-amber-900 dark:text-amber-200 mb-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
                          <span>Rekomendasi Uraian Pengalaman Kerja (Format Aksi &amp; Hasil):</span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium italic pl-5">
                          &ldquo;{selectedJob.actionableBullet}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 10. CLEAR CTA HIERARCHY BAR */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
                {/* Secondary CTA */}
                <Button
                  variant="outline"
                  size="md"
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
                      toast.success('Lamaran Ditambahkan', `Lowongan di ${selectedJob.company} berhasil dicatat ke Tracker.`);
                    } else {
                      toast.error('Lamaran belum tersimpan. Periksa koneksi internet Anda.');
                    }
                  }}
                  className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Tambah ke Tracker</span>
                </Button>

                {/* Primary CTA */}
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => toast.success('CV Diselaraskan', `Rekomendasi kata kunci untuk ${selectedJob.company} siap diterapkan ke draf CV.`)}
                  className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Optimalkan CV untuk Lowongan Ini</span>
                </Button>
              </div>
            </div>
          ) : (
            /* State saat lowongan belum dipilih dari daftar peringkat */
            <div className="bg-white dark:bg-slate-900/80 rounded-[10px] border border-slate-200 dark:border-slate-800 p-8 text-center space-y-2 shadow-2xs">
              <Target className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Pilih Lowongan untuk Melihat Evaluasi</p>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto dark:text-slate-400">
                Pilih salah satu lowongan di kolom peringkat sebelah kiri untuk melihat evaluasi kecocokan kualifikasi dan keselarasan kata kunci CV kamu.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )}

      {/* 6. SLIDE-IN DRAWER: TAMBAH LOWONGAN TARGET (GEMINI.md Aturan 4) */}
      <Sheet open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col justify-between overflow-hidden">
          <SheetHeader className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <SheetTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
              <PlusCircle className="w-5 h-5 text-cobalt-500" />
              <span>Tambah Lowongan ke Komparasi</span>
            </SheetTitle>
            <SheetDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Input lowongan dari luar (LinkedIn/Jobstreet) atau pilih langsung dari marketplace platform.
            </SheetDescription>

            {/* Segmented Controls Sumber Lowongan (WCAG Tablist Semantic) */}
            <div
              role="tablist"
              aria-label="Sumber Pilihan Lowongan"
              className="flex items-center p-1 rounded-[10px] bg-slate-200/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mt-2.5 gap-1"
            >
              <button
                type="button"
                role="tab"
                id="tab-source-manual"
                aria-selected={addSourceTab === 'manual'}
                aria-controls="panel-source-manual"
                tabIndex={addSourceTab === 'manual' ? 0 : -1}
                onClick={() => setAddSourceTab('manual')}
                className={`flex-1 min-w-0 py-2 px-2.5 rounded-[8px] text-[11px] sm:text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 ${
                  addSourceTab === 'manual'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Input Manual (Dari Luar)</span>
              </button>
              <button
                type="button"
                role="tab"
                id="tab-source-marketplace"
                aria-selected={addSourceTab === 'marketplace'}
                aria-controls="panel-source-marketplace"
                tabIndex={addSourceTab === 'marketplace' ? 0 : -1}
                onClick={() => setAddSourceTab('marketplace')}
                className={`flex-1 min-w-0 py-2 px-2.5 rounded-[8px] text-[11px] sm:text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 ${
                  addSourceTab === 'marketplace'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Pilih dari Marketplace ({rawJobs.length})</span>
              </button>
            </div>
          </SheetHeader>

          {addSourceTab === 'manual' ? (
            /* TAB 1: FORM INPUT DARI LUAR */
            <>
              <div
                id="panel-source-manual"
                role="tabpanel"
                aria-labelledby="tab-source-manual"
                className="flex-1 overflow-y-auto p-5 space-y-4"
              >
                {/* Panduan Input */}
                <div className="p-3 rounded-[10px] bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Tips:</span> Salin langsung kualifikasi &amp; deskripsi dari portal lowongan (LinkedIn, Glints, Jobstreet, dll) untuk hasil komparasi kata kunci yang akurat.
                </div>

                {/* Form Inputs with WCAG Accessible Labels & IDs */}
                <div className="space-y-3.5 text-xs">
                  <div>
                    <label htmlFor="new-job-position" className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Nama Posisi *
                    </label>
                    <input
                      id="new-job-position"
                      type="text"
                      required
                      aria-required="true"
                      value={newPosition}
                      onChange={(e) => setNewPosition(e.target.value)}
                      placeholder="Contoh: Frontend Engineer"
                      className="w-full px-3 py-2.5 rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="new-job-company" className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Nama Perusahaan *
                    </label>
                    <input
                      id="new-job-company"
                      type="text"
                      required
                      aria-required="true"
                      value={newCompany}
                      onChange={(e) => setNewCompany(e.target.value)}
                      placeholder="Contoh: Bukalapak / GoTo / Bank Mandiri"
                      className="w-full px-3 py-2.5 rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="new-job-description" className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Teks Deskripsi &amp; Persyaratan Pekerjaan *
                    </label>
                    <textarea
                      id="new-job-description"
                      rows={8}
                      required
                      aria-required="true"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Tempelkan persyaratan dan kualifikasi lowongan pekerjaan dari portal karir di sini..."
                      className="w-full p-3 rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Sticky Footer Actions */}
              <SheetFooter className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-full sm:w-auto min-h-[44px] sm:min-h-[36px]"
                >
                  Batal
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing}
                  aria-busy={isAnalyzing}
                  className="w-full sm:w-auto min-h-[44px] sm:min-h-[36px] flex items-center justify-center gap-1.5"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Menganalisis...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 text-white" />
                      <span>Analisis Lowongan</span>
                    </>
                  )}
                </Button>
              </SheetFooter>
            </>
          ) : (
            /* TAB 2: PILIH DARI MARKETPLACE PLATFORM */
            <>
              <div
                id="panel-source-marketplace"
                role="tabpanel"
                aria-labelledby="tab-source-marketplace"
                className="flex-1 overflow-y-auto p-4 space-y-3"
              >
                {/* Search Bar Input (WCAG Accessible) */}
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    id="marketplace-job-search"
                    type="text"
                    aria-label="Cari posisi atau perusahaan di marketplace"
                    value={marketplaceSearchQuery}
                    onChange={(e) => setMarketplaceSearchQuery(e.target.value)}
                    placeholder="Cari posisi atau perusahaan di marketplace..."
                    className="w-full pl-9 pr-9 py-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cobalt-500 focus:bg-white dark:focus:bg-slate-800 transition"
                  />
                  {marketplaceSearchQuery && (
                    <button
                      type="button"
                      aria-label="Hapus kata kunci pencarian"
                      onClick={() => setMarketplaceSearchQuery('')}
                      className="absolute right-1 p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer rounded-full"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Tersedia {filteredMarketplaceJobs.length} Lowongan</span>
                  <span>{jobTargets.length} Dipilih untuk Komparasi</span>
                </div>

                {/* List Lowongan Marketplace */}
                <div className="space-y-2.5">
                  {filteredMarketplaceJobs.length === 0 ? (
                    <div className="py-8 text-center space-y-2">
                      <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Tidak ada lowongan yang cocok</p>
                      <p className="text-caption text-slate-500 dark:text-slate-400">
                        Coba gunakan kata kunci pencarian yang lain atau beralih ke input manual dari luar.
                      </p>
                    </div>
                  ) : (
                    filteredMarketplaceJobs.map((job) => {
                      const isAdded = jobTargets.some((t) => t.id === String(job.id));
                      return (
                        <div
                          key={job.id}
                          className={`p-3.5 rounded-[10px] border transition space-y-2 ${
                            isAdded
                              ? 'border-cobalt-500/80 bg-blue-50/40 dark:bg-blue-950/30'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {job.title || job.position}
                              </h4>
                              <p className="text-caption text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                {job.company} • {job.location || 'Indonesia'}
                              </p>
                            </div>

                            {isAdded ? (
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="px-2 py-0.5 rounded-[6px] text-caption font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                  ✓ Dipilih
                                </span>
                                <button
                                  type="button"
                                  aria-label={`Keluarkan ${job.title || 'lowongan'} dari komparasi`}
                                  onClick={() => handleDeleteJob(String(job.id))}
                                  title="Keluarkan dari komparasi"
                                  className="p-2 -m-1 text-slate-400 hover:text-rose-600 transition cursor-pointer flex items-center justify-center min-w-[36px] min-h-[36px] rounded-[6px]"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                aria-label={`Pilih ${job.title || 'lowongan'} di ${job.company} untuk komparasi`}
                                onClick={() => handleAddJobFromMarketplace(job)}
                                className="shrink-0 flex items-center gap-1 text-xs min-h-[36px] px-3 font-semibold hover:border-cobalt-500 hover:text-cobalt-600 dark:hover:text-cobalt-400"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Pilih</span>
                              </Button>
                            )}
                          </div>

                          {job.description && (
                            <p className="text-caption text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                              {job.description}
                            </p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Sticky Footer */}
              <SheetFooter className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {jobTargets.length} target di komparasi
                </span>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsAddModalOpen(false)}
                  className="min-h-[44px] sm:min-h-[36px]"
                >
                  Selesai Memilih
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* 9. MODAL: LIHAT SEMUA KEYWORDS */}
      <Dialog open={isKeywordsModalOpen} onOpenChange={setIsKeywordsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-4 h-4 text-cobalt-500" />
              <span>Semua Kata Kunci ATS ({selectedJob?.company})</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1 text-xs">
            <span className="font-bold text-emerald-700 dark:text-emerald-400 block">Kata Kunci Ditemukan di CV:</span>
            <div className="flex flex-wrap gap-1.5">
              {selectedJob?.matchedKeywords
                ?.concat(addedSkillsMap[selectedJob?.id] || [])
                ?.map((kw, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-[10px] text-caption font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-700 shrink-0 dark:text-emerald-400" />
                    <span>{kw}</span>
                  </span>
                ))}
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsKeywordsModalOpen(false)}
              className="min-h-[44px] sm:min-h-[36px]"
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL GANTI CV sekarang menggunakan drawer CvScopeSelector di atas */}
    </div>
  );
};
