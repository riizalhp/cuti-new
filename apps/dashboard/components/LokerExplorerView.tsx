'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  BriefcaseIcon,
  MapPinIcon,
  BanknoteIcon,
  BuildingIcon,
  BookmarkIcon,
  BookmarkCheckIcon,
  ExternalLinkIcon,
  CloseIcon,
  SearchIcon,
  ChevronRightIcon,
  RefreshCwIcon,
} from '@/components/icons/CustomIcons';
import { Sparkles, Globe, Briefcase, BookmarkCheck, Plus } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { jobsApi, cvApi, trackerApi } from '@/lib/api';
import { calculateJobMatch } from '@/lib/job-matcher';
import { useToast } from '@/components/ui/Toast';
import { MascotEmptyState } from '@/components/ui/MascotEmptyState';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button, buttonVariants } from '@/components/ui/button';
import { CustomSelect, type SelectOption } from '@/components/ui/CustomSelect';
import { CvScopeSelector } from '@/components/ui/CvScopeSelector';
import { cn } from '@/lib/utils';
import { resolveJobDetails } from '@/lib/job-details-helper';

interface JobItem {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  posted: string;
  matchScore: string;
  matchScoreNum: number;
  hasMatchCalculated: boolean;
  matchedCvTitle?: string;
  matchedCvId?: string;
  hasRoleConflict?: boolean;
  coherenceWarning?: string;
  desc: string;
  responsibilities?: string[];
  requirements: string[];
  externalUrl: string;
  rawJob?: any;
}

function cleanJobTitleAndCompany(rawTitle: string, rawCompany: string): { title: string; company: string } {
  let title = (rawTitle || '').trim();
  let company = (rawCompany || '').trim();

  // Pattern: "Lowongan Kerja [Company] Posisi [Title]"
  const lkPosisiMatch = title.match(/^Lowongan\s+Kerja\s+(.+?)\s+Posisi\s+(.+)$/i);
  if (lkPosisiMatch) {
    if (!company || company.toLowerCase() === 'perusahaan') {
      const extractedComp = lkPosisiMatch[1].trim();
      company = extractedComp.toUpperCase() === 'BRI' ? 'Bank BRI' : extractedComp;
    }
    title = lkPosisiMatch[2].trim();
  } else {
    // Pattern: "Lowongan Kerja [Company] - [Title]"
    const lkDashMatch = title.match(/^Lowongan\s+Kerja\s+(.+?)\s*[-–:]\s*(.+)$/i);
    if (lkDashMatch) {
      if (!company || company.toLowerCase() === 'perusahaan') {
        const extractedComp = lkDashMatch[1].trim();
        company = extractedComp.toUpperCase() === 'BRI' ? 'Bank BRI' : extractedComp;
      }
      title = lkDashMatch[2].trim();
    }
  }

  // Bersihkan prefiks Lowongan Kerja
  title = title.replace(/^Lowongan\s+Kerja\s+/i, '');

  if (!company || company.toLowerCase() === 'perusahaan') {
    company = 'Perusahaan Mitra';
  }

  return { title, company };
}

function getMatchBadgeStyle(score: number): string {
  if (score >= 75) {
    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
  }
  if (score >= 50) {
    return 'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800';
  }
  return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
}

function normalizeSalary(job: any): string {
  if (job.salary && job.salary !== '-' && job.salary.toLowerCase() !== 'null' && job.salary.toLowerCase() !== 'undefined') {
    return job.salary;
  }
  if (job.salary_min && job.salary_max) {
    return `Rp ${job.salary_min.toLocaleString('id-ID')} - ${job.salary_max.toLocaleString('id-ID')}`;
  }
  if (job.salary_min) {
    return `Mulai Rp ${job.salary_min.toLocaleString('id-ID')}`;
  }
  return '-';
}

const BATCH_SIZE = 24;

function formatJobItems(rawList: any[], userCvs: any[], selectedCvId: string): JobItem[] {
  const hasUserCvs = Array.isArray(userCvs) && userCvs.length > 0;

  return rawList.map((j: any) => {
    const cleaned = cleanJobTitleAndCompany(j.title || j.position, j.company_name || j.company);
    const salaryFormatted = normalizeSalary(j);

    let score = 0;
    let hasMatchCalculated = false;
    let matchedTitle = '';
    let matchedId = '';
    let hasRoleConflict = false;
    let coherenceWarning: string | undefined = undefined;

    if (hasUserCvs) {
      hasMatchCalculated = true;
      const jobInput = {
        ...j,
        title: cleaned.title,
        company: cleaned.company,
        workType: j.work_type || j.type,
      };

      if (selectedCvId === 'all') {
        let maxScore = -1;
        let bestCv = userCvs[0];
        let bestCalculated: any = null;

        for (const cv of userCvs) {
          try {
            const calculated = calculateJobMatch(cv, jobInput);
            if (calculated.matchScore > maxScore) {
              maxScore = calculated.matchScore;
              bestCv = cv;
              bestCalculated = calculated;
            }
          } catch {
            // fallback
          }
        }

        score = maxScore >= 0 ? maxScore : 0;
        matchedTitle = bestCv?.title || bestCv?.name || 'CV Utama';
        matchedId = bestCv?.id || '';
        hasRoleConflict = Boolean(bestCalculated?.breakdown?.hasRoleConflict);
        coherenceWarning = bestCalculated?.breakdown?.coherenceWarning;
      } else {
        const targetCv = userCvs.find((c) => c.id === selectedCvId) || userCvs[0];
        try {
          const calculated = calculateJobMatch(targetCv, jobInput);
          score = calculated.matchScore;
          hasRoleConflict = Boolean(calculated.breakdown?.hasRoleConflict);
          coherenceWarning = calculated.breakdown?.coherenceWarning;
        } catch {
          score = 0;
        }
        matchedTitle = targetCv?.title || targetCv?.name || 'CV Terpilih';
        matchedId = targetCv?.id || '';
      }
    }

    const reqs = Array.isArray(j.requirements)
      ? j.requirements
      : Array.isArray(j.tags)
      ? j.tags
      : [];

    const loc = j.location === '[object Object]' ? 'Indonesia' : (j.location || 'Indonesia');
    const wt = j.work_type || j.type || 'Full-time';
    const details = resolveJobDetails(
      cleaned.title,
      cleaned.company,
      loc,
      wt,
      j.description || j.desc,
      reqs
    );

    return {
      id: j.id,
      title: cleaned.title,
      company: cleaned.company,
      location: loc,
      salary: salaryFormatted,
      type: wt,
      posted: j.postedDate || (j.created_at ? 'Tersedia' : 'Baru saja'),
      matchScore: hasMatchCalculated ? `${score}%` : '',
      matchScoreNum: score,
      hasMatchCalculated,
      matchedCvTitle: matchedTitle,
      matchedCvId: matchedId,
      hasRoleConflict,
      coherenceWarning,
      desc: details.description,
      responsibilities: details.responsibilities,
      requirements: details.requirements,
      externalUrl: j.externalUrl || j.external_url || '',
      rawJob: j,
    };
  });
}

export function LokerExplorerView() {
  const router = useRouter();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedWorkType, setSelectedWorkType] = useState<string>('ALL');
  const [onlyHighMatch, setOnlyHighMatch] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'MATCH' | 'NEWEST' | 'SALARY'>('NEWEST');

  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  const [similarJobs, setSimilarJobs] = useState<any[]>([]);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);
  const [userCvs, setUserCvs] = useState<any[]>([]);
  const [selectedCvId, setSelectedCvId] = useState<string>('all');

  // Debounce input pencarian 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load Primary CV & Tracker State
  useEffect(() => {
    const initCvAndTracker = async () => {
      try {
        const [cvs, existingApps] = await Promise.all([
          cvApi.getAll().catch(() => []),
          trackerApi.getAll().catch(() => []),
        ]);

        if (Array.isArray(cvs) && cvs.length > 0) {
          setUserCvs(cvs);
          setSelectedCvId('all');
          setSortBy('MATCH');
        } else {
          setSortBy('NEWEST');
        }

        if (Array.isArray(existingApps)) {
          setSavedJobIds((prev) => {
            const set = new Set(prev);
            existingApps.forEach((a: any) => {
              if (a.id) set.add(a.id);
            });
            return Array.from(set);
          });
        }
      } catch (err) {
        console.error('[LokerExplorerView] Init error:', err);
      }
    };

    initCvAndTracker();
  }, []);

  // 1. Fetch batch pertama loker (reset offset)
  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setHasMore(true);
    try {
      let rawList: any[] = [];

      if (debouncedQuery.length > 0) {
        rawList = await jobsApi.search(debouncedQuery, BATCH_SIZE, 0, selectedWorkType);
      } else if (onlyHighMatch) {
        rawList = await jobsApi.getRecommended(BATCH_SIZE, 0, selectedWorkType);
      } else {
        // DEFAULT: Tampilkan SEMUA lowongan dari 18.123 database riil tanpa restriksi kecocokan CV
        rawList = await jobsApi.getAll(BATCH_SIZE, 0, selectedWorkType);
      }

      if (!Array.isArray(rawList)) {
        rawList = [];
      }

      const formatted = formatJobItems(rawList, userCvs, selectedCvId);
      setJobs(formatted);
      setHasMore(rawList.length >= BATCH_SIZE);
    } catch (err) {
      console.error('[LokerExplorerView] Fetch jobs failed:', err);
      toast.error('Gagal Memuat Loker', 'Terjadi kendala saat memuat loker. Coba sebentar lagi ya.');
      setJobs([]);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, selectedWorkType, onlyHighMatch, userCvs, selectedCvId, toast]);

  // 2. Lazy loading: Muat batch berikutnya saat user scroll mendekati bawah
  const loadMoreJobs = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    try {
      const currentOffset = jobs.length;
      let rawList: any[] = [];

      if (debouncedQuery.length > 0) {
        rawList = await jobsApi.search(debouncedQuery, BATCH_SIZE, currentOffset, selectedWorkType);
      } else if (onlyHighMatch) {
        rawList = await jobsApi.getRecommended(BATCH_SIZE, currentOffset, selectedWorkType);
      } else {
        // DEFAULT: Ambil batch lanjutan dari seluruh lowongan di database
        rawList = await jobsApi.getAll(BATCH_SIZE, currentOffset, selectedWorkType);
      }

      if (!Array.isArray(rawList) || rawList.length === 0) {
        setHasMore(false);
        return;
      }

      const formatted = formatJobItems(rawList, userCvs, selectedCvId);

      setJobs((prev) => {
        const existingIds = new Set(prev.map((j) => j.id));
        const newUnique = formatted.filter((j) => !existingIds.has(j.id));
        if (newUnique.length === 0) {
          setHasMore(false);
          return prev;
        }
        return [...prev, ...newUnique];
      });

      if (rawList.length < BATCH_SIZE) {
        setHasMore(false);
      }
    } catch (err) {
      console.error('[LokerExplorerView] Load more jobs failed:', err);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoading, isLoadingMore, hasMore, jobs.length, debouncedQuery, selectedWorkType, onlyHighMatch, userCvs, selectedCvId]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // 3. Intersection Observer untuk memicu lazy loading otomatis
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isLoading || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMoreJobs();
        }
      },
      {
        rootMargin: '250px',
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, loadMoreJobs]);

  // Load Lowongan Serupa saat SelectedJob berubah
  useEffect(() => {
    if (!selectedJob) {
      setSimilarJobs([]);
      return;
    }

    const fetchSimilar = async () => {
      setIsLoadingSimilar(true);
      try {
        const res = await fetch(`/api/jobs/${selectedJob.id}/similar?limit=3`);
        if (res.ok) {
          const data = await res.json();
          setSimilarJobs(data.data || []);
        } else {
          setSimilarJobs([]);
        }
      } catch {
        setSimilarJobs([]);
      } finally {
        setIsLoadingSimilar(false);
      }
    };

    fetchSimilar();
  }, [selectedJob]);

  // Handler Simpan ke Tracker
  const handleSaveToTracker = async (job: JobItem) => {
    if (savedJobIds.includes(job.id) || savingId === job.id) return;
    setSavingId(job.id);
    try {
      await trackerApi.create({
        company: job.company,
        position: job.title,
        location: job.location,
        salary: job.salary,
        portal: 'Eksplorasi Loker Employr',
        portalUrl: job.externalUrl || null,
        matchScore: job.matchScoreNum,
        status: 'Tersimpan',
      });
      setSavedJobIds((prev) => [...prev, job.id]);
      toast.success('Tersimpan di Tracker', `${job.title} di ${job.company} telah ditambahkan ke Tracker lamaran kamu.`);
    } catch (err) {
      console.error('[LokerExplorerView] Save to tracker failed:', err);
      toast.error('Gagal Menyimpan', 'Terjadi kendala saat menyimpan ke Tracker. Silakan coba beberapa saat lagi.');
    } finally {
      setSavingId(null);
    }
  };

  const handleToggleHighMatch = () => {
    if (!onlyHighMatch && userCvs.length === 0) {
      toast.info(
        'Belum Ada CV',
        'Buat atau lengkapi CV kamu terlebih dahulu agar sistem dapat mencocokkan loker secara otomatis.'
      );
      return;
    }
    setOnlyHighMatch((prev) => !prev);
  };

  // Filter & Sorting Logic
  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    // Filter Hanya Match Relevan jika toggle "Hanya yang cocok" diaktifkan
    if (onlyHighMatch) {
      result = result.filter((j) => j.matchScoreNum >= 50);
    }

    // Sorting
    if (sortBy === 'MATCH' && userCvs.length > 0) {
      result.sort((a, b) => b.matchScoreNum - a.matchScoreNum);
    } else if (sortBy === 'NEWEST' || (sortBy === 'MATCH' && userCvs.length === 0)) {
      result.sort((a, b) => {
        const dateA = a.rawJob?.created_at ? new Date(a.rawJob.created_at).getTime() : 0;
        const dateB = b.rawJob?.created_at ? new Date(b.rawJob.created_at).getTime() : 0;
        return dateB - dateA;
      });
    } else if (sortBy === 'SALARY') {
      const extractNum = (str: string) => {
        const match = str.replace(/[^\d]/g, '');
        return match ? parseInt(match, 10) : 0;
      };
      result.sort((a, b) => extractNum(b.salary) - extractNum(a.salary));
    }

    return result;
  }, [jobs, onlyHighMatch, sortBy, userCvs.length]);

  const workTypeFilters = [
    { id: 'ALL', label: 'Semua Tipe' },
    { id: 'REMOTE', label: 'Remote / Online' },
    { id: 'HYBRID', label: 'Hybrid' },
    { id: 'ONSITE', label: 'On-Site' },
  ];

  const sortOptions: SelectOption[] = useMemo(() => [
    ...(userCvs.length > 0 ? [{ value: 'MATCH', label: 'Paling Cocok' }] : []),
    { value: 'NEWEST', label: 'Terbaru' },
    { value: 'SALARY', label: 'Gaji Tertinggi' },
  ], [userCvs.length]);

  return (
    <div className="w-full space-y-4 pb-12">
      {/* 1. Page Header (Navy Wayfinding Banner) */}
      <PageHeader
        title="Eksplorasi Loker"
        subtitle="Cari loker terkurasi, cek kecocokan dengan profilmu, dan simpan langsung ke Tracker kamu."
        icon={Globe}
        badge="Loker Terkurasi"
        stats={[
          {
            label: 'Total Lowongan',
            value: isLoading ? '-' : `${jobs.length}${hasMore ? '+' : ''}`,
            icon: Briefcase,
            isPrimary: true,
          },
          {
            label: 'Tersimpan',
            value: savedJobIds.length,
            icon: BookmarkCheck,
            colorClass: 'text-emerald-300',
          },
        ]}
        actions={
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            {/* Standar CV Scope Selector di Kanan Atas Page Header */}
            {userCvs.length > 0 ? (
              <CvScopeSelector
                cvs={userCvs}
                selectedCvId={selectedCvId}
                onChange={(newCvId) => setSelectedCvId(newCvId)}
                allowAll
                allLabel="Semua CV (Skor Tertinggi)"
                label="Basis CV"
              />
            ) : (
              <Link
                href="/cv"
                className={cn(
                  buttonVariants({ variant: 'primary', size: 'sm' }),
                  'w-full sm:w-auto min-h-[44px] md:min-h-[34px] gap-1.5 cursor-pointer shrink-0'
                )}
                title="Buat CV pertamamu di CV Builder"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat CV</span>
              </Link>
            )}

            <button
              onClick={() => fetchJobs()}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[44px] md:min-h-[34px] rounded-[10px] text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition cursor-pointer shrink-0 active:scale-[0.98]"
              title="Perbarui daftar loker"
            >
              <RefreshCwIcon size={14} className={isLoading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => {
                const query = new URLSearchParams();
                if (selectedCvId && selectedCvId !== 'all') {
                  query.set('cvId', selectedCvId);
                }
                router.push(`/cv-screener${query.toString() ? `?${query.toString()}` : ''}`);
              }}
              className={cn(
                buttonVariants({ variant: 'primary', size: 'sm' }),
                'min-h-[44px] md:min-h-[34px] gap-1.5 cursor-pointer shrink-0 shadow-xs'
              )}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Evaluasi ATS</span>
            </button>
          </div>
        }
      />

      {/* 2. Search Bar & Controls Card */}
      <div className="bg-white dark:bg-slate-900 rounded-[10px] p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          <div className="relative flex-1">
            <SearchIcon
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari posisi kerja, skill, atau nama perusahaan (contoh: Admin, Frontend, Marketing)..."
              className="w-full pl-9 pr-9 py-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cobalt-500 focus:bg-white dark:focus:bg-slate-800 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Bersihkan pencarian"
              >
                <CloseIcon size={14} />
              </button>
            )}
          </div>

          {/* Controls: Filter Tipe Kerja & Sort Dropdown */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
            {/* Filter Tipe Kerja (Scrollable on small screens) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar max-w-full">
              {workTypeFilters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedWorkType(f.id)}
                  className={cn(
                    'px-3 py-2 rounded-[10px] text-xs font-bold transition whitespace-nowrap cursor-pointer border',
                    selectedWorkType === f.id
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Sort Dropdown Sesuai Design System */}
            <div className="w-36 sm:w-40 shrink-0">
              <CustomSelect
                value={sortBy}
                onChange={(val) => setSortBy(val as 'MATCH' | 'NEWEST' | 'SALARY')}
                options={sortOptions}
                size="sm"
                buttonClassName="py-2 font-bold text-xs"
                aria-label="Urutan loker"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Status Bar Hasil & Filter Kecocokan */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs text-slate-500 dark:text-slate-400 px-1">
        <div>
          Menampilkan <strong className="text-slate-800 dark:text-slate-200">{filteredJobs.length}</strong> lowongan
          {hasMore ? ' (gulir ke bawah untuk memuat lebih banyak)' : ''}
          {debouncedQuery ? ` untuk pencarian "${debouncedQuery}"` : ''}
        </div>

        {userCvs.length > 0 ? (
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none text-slate-700 dark:text-slate-300 font-semibold group">
              <input
                type="checkbox"
                checked={onlyHighMatch}
                onChange={handleToggleHighMatch}
                className="w-4 h-4 rounded text-cobalt-600 focus:ring-cobalt-500 border-slate-300 dark:border-slate-700 accent-cobalt-600 cursor-pointer"
              />
              <span className="flex items-center gap-1 group-hover:text-slate-900 dark:group-hover:text-white transition">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {selectedCvId === 'all'
                    ? 'Hanya yang cocok dengan CV'
                    : `Hanya yang cocok (${userCvs.find((c) => c.id === selectedCvId)?.title || 'CV Terpilih'})`}
                </span>
              </span>
            </label>
          </div>
        ) : (
          <button
            onClick={() => router.push('/cv')}
            className="text-cobalt-600 dark:text-cobalt-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Buat CV untuk aktifkan filter kecocokan</span>
          </button>
        )}
      </div>

      {/* 4. State Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3.5 animate-pulse motion-reduce:animate-none"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
              <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 shadow-2xs">
          <MascotEmptyState
            size="md"
            badge="Eksplorasi Loker"
            title="Belum ada loker yang cocok"
            description={
              onlyHighMatch
                ? 'Belum ada loker yang paling pas dengan profilmu untuk kriteria ini. Coba matikan filter atau cari kata kunci lain ya.'
                : debouncedQuery
                ? `Belum ada loker yang cocok dengan kata kunci "${debouncedQuery}". Coba gunakan kata kunci umum seperti "Admin", "Staff", atau "Marketing".`
                : 'Belum ada loker aktif di kategori ini. Coba pilih filter lain ya.'
            }
            action={
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedWorkType('ALL');
                  setOnlyHighMatch(false);
                }}
                className="px-4 py-2.5 rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 text-white font-bold text-xs shadow-md shadow-cobalt-500/20 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 focus-visible:ring-offset-2"
              >
                Reset Filter &amp; Pencarian
              </button>
            }
          />
        </div>
      ) : (
        /* 5. Job Cards Grid with In-House Upsell Card */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredJobs.map((job, index) => {
            const isSaved = savedJobIds.includes(job.id);
            const isSaving = savingId === job.id;
            const badgeStyle = getMatchBadgeStyle(job.matchScoreNum);
            const isSalaryPresent = Boolean(
              job.salary &&
              job.salary !== '-' &&
              job.salary.toLowerCase() !== 'null' &&
              job.salary.toLowerCase() !== 'undefined'
            );

            return (
              <React.Fragment key={job.id}>
                {/* Sisipan In-House Upsell Card di posisi ke-4 sebagai pengganti Ads eksternal */}
                {index === 3 && (
                  <div className="p-5 rounded-[10px] bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 text-white border border-navy-700 shadow-md flex flex-col justify-between space-y-3.5 relative overflow-hidden">
                    <div className="space-y-1.5 relative z-10">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-[8px] text-[10px] font-extrabold uppercase tracking-wider bg-orange-500 text-white shadow-sm">
                          Kesiapan Karier
                        </span>
                        <span className="text-caption text-slate-300">Tips Lolos Seleksi</span>
                      </div>
                      <h4 className="font-extrabold text-sm sm:text-base leading-snug">
                        Pastikan CV Kamu Siap Sebelum Melamar
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Sistem HR menyaring ratusan pelamar otomatis. Pastikan CV-mu memiliki format ramah ATS dan kata kunci yang relevan.
                      </p>
                    </div>

                    <div className="pt-2 flex items-center gap-2 relative z-10">
                      <button
                        onClick={() => router.push('/cv-screener')}
                        className="flex-1 min-h-[44px] sm:min-h-[36px] py-2 px-3.5 rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 active:scale-[0.98] text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Cek Skor ATS</span>
                      </button>
                      <button
                        onClick={() => router.push('/cv')}
                        className="py-2 px-3 rounded-[10px] bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition cursor-pointer"
                      >
                        Edit CV
                      </button>
                    </div>

                    {/* Latar artistik aksen */}
                    <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
                  </div>
                )}

                {/* Job Card */}
                <div className="p-4 sm:p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition flex flex-col justify-between space-y-3.5 group">
                  {/* Bagian Atas: Metadata & Match Score */}
                  <div
                    onClick={() => setSelectedJob(job)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedJob(job);
                      }
                    }}
                    aria-label={`Buka detail ${job.title} di ${job.company}`}
                    className="cursor-pointer space-y-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 rounded-[8px]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      {job.hasMatchCalculated ? (
                        job.hasRoleConflict ? (
                          <span
                            className="px-2 py-0.5 rounded-[10px] text-caption font-extrabold border bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800 flex items-center gap-1"
                            title={job.coherenceWarning}
                          >
                            <span>⚠ Inkonsisten</span>
                            <span>({job.matchScore})</span>
                          </span>
                        ) : (
                          <span className={`px-2 py-0.5 rounded-[10px] text-caption font-extrabold border ${badgeStyle}`}>
                            Match {job.matchScore}
                          </span>
                        )
                      ) : (
                        <span className="text-caption font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-[10px] border border-slate-200 dark:border-slate-700">
                          {job.posted}
                        </span>
                      )}
                      <span className="text-caption font-semibold px-2 py-0.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {job.type}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-cobalt-600 dark:group-hover:text-cobalt-400 transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 mt-1">
                        <BuildingIcon size={14} className="text-slate-400 shrink-0" />
                        <span className="font-semibold truncate">{job.company}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-caption text-slate-500 dark:text-slate-400 mt-0.5">
                        <MapPinIcon size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate">{job.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bagian Bawah: Gaji & Action Button */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <BanknoteIcon
                        size={14}
                        className={
                          isSalaryPresent
                            ? 'text-emerald-600 dark:text-emerald-400 shrink-0'
                            : 'text-slate-400 shrink-0'
                        }
                      />
                      <span
                        className={`truncate text-xs ${
                          isSalaryPresent
                            ? 'font-bold text-emerald-700 dark:text-emerald-400'
                            : 'font-medium text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {isSalaryPresent ? job.salary : 'Gaji Kompetitif'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveToTracker(job);
                        }}
                        disabled={isSaved || isSaving}
                        title={isSaved ? 'Sudah tersimpan di Tracker' : 'Simpan ke Tracker'}
                        aria-label={isSaved ? 'Sudah tersimpan' : 'Simpan ke Tracker'}
                        className={cn(
                          'p-1.5 rounded-[8px] transition cursor-pointer border',
                          isSaved
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 border-slate-200 dark:border-slate-700'
                        )}
                      >
                        {isSaved ? <BookmarkCheckIcon size={15} /> : <BookmarkIcon size={15} />}
                      </button>

                      <button
                        onClick={() => setSelectedJob(job)}
                        className="px-2.5 py-1.5 rounded-[8px] text-caption font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition cursor-pointer flex items-center gap-1"
                      >
                        <span>Detail</span>
                        <ChevronRightIcon size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}

          {/* Skeleton Cards saat Lazy Loading / Infinite Scroll */}
          {isLoadingMore && (
            <>
              {[1, 2, 3].map((i) => (
                <div
                  key={`skeleton-more-${i}`}
                  aria-hidden="true"
                  className="p-4 sm:p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3.5 animate-pulse motion-reduce:animate-none"
                >
                  <div className="flex justify-between items-center">
                    <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded-[8px]" />
                    <div className="h-5 w-16 bg-slate-100 dark:bg-slate-800/80 rounded-[8px]" />
                  </div>
                  <div className="space-y-2 pt-1">
                    <div className="h-5 w-4/5 bg-slate-200 dark:bg-slate-800 rounded-[6px]" />
                    <div className="h-3.5 w-1/2 bg-slate-100 dark:bg-slate-800/80 rounded-[6px]" />
                    <div className="h-3 w-1/3 bg-slate-100 dark:bg-slate-800/60 rounded-[6px]" />
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div className="h-4 w-28 bg-slate-100 dark:bg-slate-800/80 rounded-[6px]" />
                    <div className="flex items-center gap-1.5">
                      <div className="h-7 w-7 bg-slate-100 dark:bg-slate-800 rounded-[8px]" />
                      <div className="h-7 w-16 bg-slate-200 dark:bg-slate-800 rounded-[8px]" />
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Infinite Scroll Footer & Sentinel Element */}
          <div className="col-span-full w-full pt-4 pb-8 flex flex-col items-center justify-center gap-2">

            {!isLoadingMore && hasMore && (
              <button
                type="button"
                onClick={() => loadMoreJobs()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                <span>Muat Lebih Banyak</span>
                <span className="text-caption text-slate-400 font-normal">({jobs.length} loker termuat)</span>
              </button>
            )}

            {!hasMore && jobs.length > 0 && (
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium text-center">
                Semua lowongan aktif telah ditampilkan ({jobs.length} loker).
              </p>
            )}

            {/* Invisible Sentinel Element (triggers when user is 250px away from bottom) */}
            <div ref={sentinelRef} className="h-6 w-full pointer-events-none" aria-hidden="true" />
          </div>
        </div>
      )}

      {/* 6. Slide-in Detail Drawer */}
      <Sheet open={Boolean(selectedJob)} onOpenChange={(open) => !open && setSelectedJob(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col justify-between overflow-hidden sm:h-full">
          {selectedJob && (
            <>
              {/* Header Drawer */}
              <SheetHeader className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 space-y-0">
                {selectedJob.hasMatchCalculated ? (
                  <span className={`px-2.5 py-0.5 rounded-[10px] text-xs font-bold border ${getMatchBadgeStyle(selectedJob.matchScoreNum)}`}>
                    Tingkat Kecocokan {selectedJob.matchScore}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-[10px] text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    Detail Lowongan
                  </span>
                )}
              </SheetHeader>

              {/* Body Drawer (Scrollable) */}
              <SheetBody className="p-5 sm:p-6 space-y-5 flex-1 overflow-y-auto">
                <div>
                  <SheetTitle className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                    {selectedJob.title}
                  </SheetTitle>
                  <SheetDescription className="text-xs font-semibold text-cobalt-600 dark:text-cobalt-400 mt-1 flex items-center gap-1.5">
                    <span>{selectedJob.company}</span>
                    <span>•</span>
                    <span>{selectedJob.location}</span>
                  </SheetDescription>
                </div>

                {/* Banner edukasi jika belum memiliki CV */}
                {!selectedJob.hasMatchCalculated && (
                  <div className="p-3.5 rounded-[10px] bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-cobalt-600 dark:text-blue-400 shrink-0" />
                        <span>Skor kecocokan belum aktif</span>
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        Kamu belum memiliki draf CV. Buat CV agar sistem dapat menghitung persentase kecocokan skill dan kualifikasimu dengan lowongan ini.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedJob(null);
                        router.push('/cv');
                      }}
                      className="shrink-0 px-3.5 py-2 rounded-[8px] bg-cobalt-600 hover:bg-cobalt-700 text-white text-xs font-bold transition shadow-2xs cursor-pointer min-h-[34px] flex items-center justify-center"
                    >
                      Buat CV
                    </button>
                  </div>
                )}

                {/* Ringkasan Gaji & Tipe Kerja */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-[10px] space-y-2 text-xs border border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-500 dark:text-slate-400">Estimasi Gaji</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selectedJob.salary && selectedJob.salary !== '-' ? selectedJob.salary : 'Gaji dirahasiakan'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
                    <span className="text-slate-500 dark:text-slate-400">Tipe Kerja</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{selectedJob.type}</span>
                  </div>
                  {selectedJob.matchedCvTitle && (
                    <div className="flex justify-between items-center py-0.5 border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
                      <span className="text-slate-500 dark:text-slate-400">Rujukan Kecocokan</span>
                      <span className="font-semibold text-cobalt-600 dark:text-blue-400 truncate max-w-[200px]">
                        {selectedJob.matchedCvTitle}
                      </span>
                    </div>
                  )}
                </div>

                {/* Peringatan Inkonsistensi Dokumen jika ada */}
                {selectedJob.hasRoleConflict && (
                  <div className="p-3.5 rounded-[10px] bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                      <span>⚠ Inkonsistensi Profil Terdeteksi</span>
                    </div>
                    <p className="text-amber-700 dark:text-amber-400 text-[11px] leading-relaxed">
                      {selectedJob.coherenceWarning ||
                        'Target posisi pada CV rujukan tidak didukung oleh riwayat pekerjaan atau keahlian di dalamnya. Rekruter/ATS berisiko menganggap berkas ini tidak sinkron.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => router.push(selectedJob.matchedCvId ? `/cv?id=${selectedJob.matchedCvId}` : '/cv')}
                      className="mt-1 text-[11px] font-bold text-cobalt-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Perbaiki di CV Builder</span>
                      <ChevronRightIcon size={12} />
                    </button>
                  </div>
                )}

                {/* Deskripsi Loker */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Deskripsi Pekerjaan
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {selectedJob.desc}
                  </p>
                  {selectedJob.responsibilities && selectedJob.responsibilities.length > 0 && (
                    <div className="pt-2 space-y-1.5">
                      <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Tanggung Jawab Utama:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 dark:text-slate-300">
                        {selectedJob.responsibilities.map((resp, i) => (
                          <li key={i}>{resp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Kualifikasi & Requirements */}
                {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Kualifikasi &amp; Persyaratan
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.requirements.map((req, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-[8px] text-caption font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        >
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Loker Serupa */}
                <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Loker Serupa
                  </h4>
                  {isLoadingSimilar ? (
                    <div className="space-y-2">
                      <div className="h-14 bg-slate-100 dark:bg-slate-800/60 rounded-[10px] animate-pulse motion-reduce:animate-none" />
                      <div className="h-14 bg-slate-100 dark:bg-slate-800/60 rounded-[10px] animate-pulse motion-reduce:animate-none" />
                    </div>
                  ) : similarJobs.length > 0 ? (
                    <div className="space-y-2">
                      {similarJobs.map((sim) => (
                        <button
                          key={sim.id}
                          type="button"
                          onClick={() => {
                            const cleaned = cleanJobTitleAndCompany(sim.title, sim.company_name);
                            const simLoc = sim.location === '[object Object]' ? 'Indonesia' : (sim.location || 'Indonesia');
                            const simType = sim.work_type || 'Full-time';
                            const details = resolveJobDetails(
                              cleaned.title,
                              cleaned.company,
                              simLoc,
                              simType,
                              sim.description,
                              sim.requirements
                            );
                            const hasUserCvs = userCvs.length > 0;
                            let simScore = 0;
                            if (hasUserCvs) {
                              const targetCv = selectedCvId === 'all' ? userCvs[0] : (userCvs.find((c) => c.id === selectedCvId) || userCvs[0]);
                              try {
                                const calc = calculateJobMatch(targetCv, {
                                  id: sim.id,
                                  title: cleaned.title,
                                  company: cleaned.company,
                                  location: simLoc,
                                  workType: simType,
                                  description: details.description,
                                  requirements: details.requirements,
                                });
                                simScore = calc.matchScore;
                              } catch {
                                simScore = 0;
                              }
                            }
                            setSelectedJob({
                              id: sim.id,
                              title: cleaned.title,
                              company: cleaned.company,
                              location: simLoc,
                              salary: sim.salary_min ? `Rp ${sim.salary_min.toLocaleString('id-ID')}` : '-',
                              type: simType,
                              posted: 'Tersedia',
                              matchScore: hasUserCvs ? `${simScore}%` : '',
                              matchScoreNum: simScore,
                              hasMatchCalculated: hasUserCvs,
                              desc: details.description,
                              responsibilities: details.responsibilities,
                              requirements: details.requirements,
                              externalUrl: sim.external_url || '',
                            });
                          }}
                          className="w-full text-left p-3 rounded-[10px] border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer flex items-center justify-between gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                        >
                          <div className="min-w-0">
                            <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                              {cleanJobTitleAndCompany(sim.title, sim.company_name).title}
                            </h5>
                            <p className="text-caption text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {sim.company_name || 'Perusahaan'} • {sim.location === '[object Object]' ? 'Indonesia' : (sim.location || 'Indonesia')}
                            </p>
                          </div>
                          <span className="shrink-0 px-2 py-0.5 rounded-[10px] text-caption font-bold bg-blue-50 text-cobalt-600 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            {sim.similarity_score}% Serupa
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400">Belum ada loker serupa lainnya.</p>
                  )}
                </div>
              </SheetBody>

              {/* Sticky Footer Drawer */}
              <SheetFooter className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex flex-col sm:flex-row items-center gap-2.5">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => handleSaveToTracker(selectedJob)}
                  disabled={savedJobIds.includes(selectedJob.id) || savingId === selectedJob.id}
                  className={`w-full sm:w-auto flex-1 flex items-center justify-center gap-1.5 ${
                    savedJobIds.includes(selectedJob.id)
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : ''
                  }`}
                >
                  {savedJobIds.includes(selectedJob.id) ? (
                    <>
                      <BookmarkCheckIcon size={16} className="text-emerald-700 dark:text-emerald-400" />
                      <span>Tersimpan di Tracker</span>
                    </>
                  ) : (
                    <>
                      <BookmarkIcon size={16} />
                      <span>Simpan ke Tracker</span>
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    if (selectedJob.hasMatchCalculated) {
                      const query = new URLSearchParams();
                      query.set('role', selectedJob.title);
                      query.set('company', selectedJob.company);
                      if (selectedJob.matchedCvId) {
                        query.set('cvId', selectedJob.matchedCvId);
                      }
                      setSelectedJob(null);
                      router.push(`/cv-screener?${query.toString()}`);
                    } else {
                      setSelectedJob(null);
                      router.push('/cv');
                    }
                  }}
                  className="w-full sm:w-auto flex-1 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cobalt-500" />
                  <span>{selectedJob.hasMatchCalculated ? 'Evaluasi ATS' : 'Buat CV Saya'}</span>
                </Button>

                {selectedJob.externalUrl ? (
                  <a
                    href={selectedJob.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Buka portal sumber loker ${selectedJob.company}`}
                    className={cn(buttonVariants({ variant: 'primary', size: 'md' }), 'w-full sm:w-auto flex-1 flex items-center justify-center gap-1.5')}
                  >
                    <span>Lamar di Web Asli</span>
                    <ExternalLinkIcon size={14} className="text-white" />
                  </a>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      if (selectedJob.hasMatchCalculated) {
                        const query = new URLSearchParams();
                        query.set('role', selectedJob.title);
                        query.set('company', selectedJob.company);
                        if (selectedJob.matchedCvId) {
                          query.set('cvId', selectedJob.matchedCvId);
                        }
                        setSelectedJob(null);
                        router.push(`/cv-screener?${query.toString()}`);
                      } else {
                        setSelectedJob(null);
                        router.push('/cv');
                      }
                    }}
                    className="w-full sm:w-auto flex-1 flex items-center justify-center gap-1.5"
                  >
                    <span>{selectedJob.hasMatchCalculated ? 'Cocokkan CV' : 'Buat CV'}</span>
                  </Button>
                )}
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
