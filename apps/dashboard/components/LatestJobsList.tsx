'use client';

import React, { useState, useEffect } from 'react';
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
} from '@/components/icons/CustomIcons';
import { jobsApi, cvApi, trackerApi } from '@/lib/api';
import { calculateJobMatch } from '@/lib/job-matcher';
import { useToast } from '@/components/ui/Toast';
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
import { cn } from '@/lib/utils';
import { resolveJobDetails } from '@/lib/job-details-helper';

interface RecommendedJobItem {
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
  desc: string;
  responsibilities: string[];
  requirements: string[];
  externalUrl: string;
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

  // Remove redundant prefix "Lowongan Kerja " if still present
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

export const LatestJobsList: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const [selectedJob, setSelectedJob] = useState<RecommendedJobItem | null>(null);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<RecommendedJobItem[]>([]);
  const [similarJobs, setSimilarJobs] = useState<any[]>([]);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);



  useEffect(() => {
    if (!selectedJob?.id) {
      setSimilarJobs([]);
      return;
    }

    let isMounted = true;
    setIsLoadingSimilar(true);

    fetch(`/api/jobs/${selectedJob.id}/similar?limit=3`)
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json?.success && Array.isArray(json.data)) {
          setSimilarJobs(json.data);
        }
      })
      .catch(() => {
        if (isMounted) setSimilarJobs([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingSimilar(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedJob?.id]);

  useEffect(() => {
    const fetchRecommendedJobs = async () => {
      setIsLoading(true);
      try {
        // Fetch user's CV for matching - pick the most complete CV
        const cvs = await cvApi.getAll();
        const primaryCv =
          cvs.find((c: any) => c.isPrimary) ||
          cvs.find(
            (c: any) =>
              (Array.isArray(c.skills) && c.skills.length > 0) ||
              (Array.isArray(c.skillsList) && c.skillsList.length > 0) ||
              (Array.isArray(c.experience) && c.experience.length > 0)
          ) ||
          cvs[0];

        // Fetch jobs from API (now already queried intelligently from DB)
        const allJobs = await jobsApi.getRecommended(20);

        // Fetch existing applications to sync tracker state
        try {
          const existingApps = await trackerApi.getAll();
          if (Array.isArray(existingApps)) {
            const savedUrls = new Set(existingApps.map((a: any) => a.portalUrl).filter(Boolean));
            const savedCompanyPositions = new Set(
              existingApps.map((a: any) => `${(a.company || '').toLowerCase()}:::${(a.position || '').toLowerCase()}`)
            );
            const initialSaved = allJobs
              .filter((j: any) =>
                (j.externalUrl && savedUrls.has(j.externalUrl)) ||
                savedCompanyPositions.has(`${(j.company || '').toLowerCase()}:::${(j.title || j.position || '').toLowerCase()}`)
              )
              .map((j: any) => j.id);
            setSavedJobIds(initialSaved);
          }
        } catch {}

        if (allJobs.length > 0) {
          let topJobs: RecommendedJobItem[] = [];

          if (Array.isArray(cvs) && cvs.length > 0) {
            // Calculate realistic match scores across ALL user CVs (consistent with LokerExplorerView)
            const jobsWithScores = allJobs.map((job: any) => {
              let maxScore = -1;
              const jobInput = {
                ...job,
                title: job.title || job.position,
                company: job.company,
                workType: job.workType || job.type,
              };

              for (const cv of cvs) {
                try {
                  const calculated = calculateJobMatch(cv, jobInput);
                  if (calculated.matchScore > maxScore) {
                    maxScore = calculated.matchScore;
                  }
                } catch {
                  // ignore
                }
              }

              const backendScore = typeof job.matchScore === 'number' && job.matchScore > 0 ? job.matchScore : null;
              const finalScore = maxScore > 0 ? maxScore : (backendScore ?? 78);

              return {
                ...job,
                matchScoreNum: finalScore,
              };
            });

            // Prioritize higher relevance (>= 25%), but always fall back to sorted pool so list never becomes empty
            const sortedByScore = [...jobsWithScores].sort((a: any, b: any) => b.matchScoreNum - a.matchScoreNum);
            const eligibleJobs = sortedByScore.filter((j: any) => j.matchScoreNum >= 25);
            const finalPool = eligibleJobs.length > 0 ? eligibleJobs : sortedByScore;

            topJobs = finalPool
              .slice(0, 3)
              .map((job: any) => {
                const cleaned = cleanJobTitleAndCompany(job.title || job.position, job.company);
                const details = resolveJobDetails(
                  cleaned.title,
                  cleaned.company,
                  job.location,
                  job.type || 'Full-time',
                  job.description,
                  job.requirements
                );
                return {
                  id: job.id,
                  title: cleaned.title,
                  company: cleaned.company,
                  location: job.location,
                  salary: job.salary || '-',
                  type: job.type || 'Full-time',
                  posted: job.postedDate || 'Baru saja',
                  matchScore: `${job.matchScoreNum}%`,
                  matchScoreNum: job.matchScoreNum,
                  hasMatchCalculated: true,
                  desc: details.description,
                  responsibilities: details.responsibilities,
                  requirements: details.requirements,
                  externalUrl: job.externalUrl || '',
                };
              });
          } else {
            // Pengguna baru tanpa CV: tampilkan rekomendasi umum tanpa matchScore palsu
            topJobs = allJobs.slice(0, 3).map((job: any) => {
              const cleaned = cleanJobTitleAndCompany(job.title || job.position, job.company);
              const details = resolveJobDetails(
                cleaned.title,
                cleaned.company,
                job.location,
                job.type || 'Full-time',
                job.description,
                job.requirements
              );
              return {
                id: job.id,
                title: cleaned.title,
                company: cleaned.company,
                location: job.location,
                salary: job.salary || '-',
                type: job.type || 'Full-time',
                posted: job.postedDate || 'Baru saja',
                matchScore: '',
                matchScoreNum: 0,
                hasMatchCalculated: false,
                desc: details.description,
                responsibilities: details.responsibilities,
                requirements: details.requirements,
                externalUrl: job.externalUrl || '',
              };
            });
          }

          setJobs(topJobs);
        } else {
          setJobs([]);
        }
      } catch (error) {
        console.error('[LatestJobsList] Failed to fetch jobs:', error);
        setJobs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendedJobs();
  }, []);

  const handleSaveToTracker = async (job: RecommendedJobItem) => {
    if (savedJobIds.includes(job.id) || savingId === job.id) return;
    setSavingId(job.id);
    try {
      await trackerApi.create({
        company: job.company,
        position: job.title,
        location: job.location,
        salary: job.salary,
        portal: 'Portal Loker',
        portalUrl: job.externalUrl || null,
        matchScore: job.matchScoreNum,
        status: 'Tersimpan',
      });
      setSavedJobIds((prev) => [...prev, job.id]);
      toast.success('Disimpan ke Tracker', `${job.title} di ${job.company} berhasil dicatat ke Tracker.`);
    } catch (err) {
      console.error('[LatestJobsList] Failed to save to tracker:', err);
      toast.error('Gagal Menyimpan', 'Terjadi kendala saat menyimpan ke Tracker. Silakan coba lagi.');
    } finally {
      setSavingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-[10px] p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors space-y-4">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-orange-50 dark:bg-orange-950/80 text-orange-700 dark:text-orange-400 flex items-center justify-center border border-orange-100 dark:border-orange-900/50 animate-pulse motion-reduce:animate-none" />
            <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse motion-reduce:animate-none" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-[10px] border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3 animate-pulse motion-reduce:animate-none">
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[10px] p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-[8px] bg-orange-50 dark:bg-orange-950/80 text-orange-700 dark:text-orange-400 flex items-center justify-center border border-orange-100 dark:border-orange-900/50 shrink-0 mt-0.5">
            <BriefcaseIcon size={14} />
          </div>
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
              Rekomendasi Loker
            </h3>
            <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5">
              Lowongan pilihan terkurasi sesuai profil &amp; target kariermu
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push('/loker')}
          className="text-caption font-bold text-orange-700 dark:text-orange-400 px-2.5 py-1.5 min-h-[30px] hover:bg-orange-50 dark:hover:bg-orange-950/40 flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-[6px] transition"
        >
          <span>Cari Semua Loker</span>
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="py-12 text-center">
          <BriefcaseIcon size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Belum ada loker yang sesuai kriteria</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Sistem belum menemukan loker aktif yang memiliki kecocokan tinggi dengan target profesi dan domisili kamu saat ini.
          </p>
          <button
            onClick={() => router.push('/loker')}
            className="mt-4 px-4 py-2 rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 text-white font-semibold text-xs transition cursor-pointer border-0 inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          >
            <span>Jelajahi Semua Loker</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {jobs.map((job) => {
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
              <div
                key={job.id}
                className="p-4 rounded-[10px] border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition flex flex-col justify-between space-y-3"
              >
                {/* Zona Atas: Trigger Detail Loker */}
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
                  aria-label={`Buka detail lowongan ${job.title} di ${job.company}`}
                  className="group/detail cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-[8px] transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    {job.hasMatchCalculated ? (
                      <span
                        aria-label={`Tingkat kecocokan profil ${job.matchScore}`}
                        className={`px-2 py-0.5 rounded-[10px] text-caption font-extrabold border ${badgeStyle}`}
                      >
                        Match {job.matchScore}
                      </span>
                    ) : (
                      <span
                        className="px-2 py-0.5 rounded-[10px] text-caption font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      >
                        {job.type}
                      </span>
                    )}
                    <span
                      aria-label={`Dipublikasikan ${job.posted}`}
                      className="text-caption font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-[10px] border border-slate-200 dark:border-slate-800"
                    >
                      {job.posted}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover/detail:text-orange-600 dark:group-hover/detail:text-orange-400 transition-colors">
                    {job.title}
                  </h4>

                  <div className="space-y-1 my-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <BuildingIcon size={14} className="text-slate-500 dark:text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {job.company}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPinIcon size={14} className="text-slate-500 dark:text-slate-400 shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>
                  </div>
                </div>

                {/* Zona Tengah: Gaji & Simpan ke Tracker */}
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <BanknoteIcon
                      size={14}
                      className={
                        isSalaryPresent
                          ? 'text-emerald-700 dark:text-emerald-400 shrink-0'
                          : 'text-slate-500 dark:text-slate-400 shrink-0'
                      }
                    />
                    <span
                      className={`truncate text-xs ${
                        isSalaryPresent
                          ? 'font-bold text-emerald-700 dark:text-emerald-400'
                          : 'font-medium text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {isSalaryPresent ? job.salary : 'Gaji dirahasiakan'}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveToTracker(job);
                    }}
                    disabled={isSaved || isSaving}
                    title={isSaved ? 'Sudah tersimpan di Tracker' : 'Simpan ke Tracker'}
                    aria-label={
                      isSaved
                        ? `Lowongan ${job.title} sudah tersimpan di Tracker`
                        : `Simpan lowongan ${job.title} ke Tracker`
                    }
                    className={`shrink-0 flex items-center gap-1 px-3 py-1.5 min-h-[30px] rounded-[8px] text-caption font-bold transition cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                      isSaved
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900'
                    }`}
                  >
                    {isSaved ? (
                      <>
                        <BookmarkCheckIcon size={13} className="text-emerald-700 dark:text-emerald-400" />
                        <span>Tersimpan</span>
                      </>
                    ) : (
                      <>
                        <BookmarkIcon size={13} className="text-slate-500 dark:text-slate-400" />
                        <span>+ Tracker</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Zona Bawah: Tombol Lamar Full-Width */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800">
                  {job.externalUrl ? (
                    <a
                      href={job.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Lamar pekerjaan ${job.title} di ${job.company} (buka di tab baru)`}
                      className="w-full min-h-[40px] flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-[10px] font-semibold text-xs transition shadow-xs bg-cobalt-500 hover:bg-cobalt-600 active:scale-[0.98] text-white no-underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                    >
                      <span>Lamar Sekarang</span>
                      <ExternalLinkIcon size={14} className="shrink-0 text-white" />
                    </a>
                  ) : (
                    <button
                      onClick={() => router.push('/match-cv')}
                      className="w-full min-h-[40px] flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-[10px] font-bold text-xs transition shadow-xs bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 border-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                    >
                      <span>Lihat Sumber Loker</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Job Detail Slide-in Drawer per Dashboard Pilar 4 */}
      <Sheet open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
        <SheetContent side="right" className="w-full max-w-md sm:max-w-xl p-0 flex flex-col justify-between overflow-hidden">
          {selectedJob && (
            <>
              {/* Header */}
              <SheetHeader className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 space-y-0">
                {selectedJob.hasMatchCalculated ? (
                  <span className={`px-2.5 py-0.5 rounded-[10px] text-xs font-bold border ${getMatchBadgeStyle(selectedJob.matchScoreNum)}`}>
                    Match Score {selectedJob.matchScore}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-[10px] text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    Detail Lowongan
                  </span>
                )}
              </SheetHeader>

              {/* Body */}
              <SheetBody className="p-6 space-y-4 flex-1">
                <div>
                  <SheetTitle className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {selectedJob.title}
                  </SheetTitle>
                  <SheetDescription className="text-xs font-semibold text-orange-700 dark:text-orange-400 mt-1">
                    {selectedJob.company} • {selectedJob.location}
                  </SheetDescription>
                </div>

                {!selectedJob.hasMatchCalculated && (
                  <div className="p-3.5 rounded-[10px] bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Skor kecocokan belum aktif
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        Buat CV pertamamu agar sistem dapat mencocokkan profilmu dengan lowongan ini secara otomatis.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedJob(null);
                        router.push('/cv');
                      }}
                      className="shrink-0 px-3 py-1.5 rounded-[8px] bg-cobalt-600 hover:bg-cobalt-700 text-white text-xs font-bold transition shadow-2xs cursor-pointer min-h-[34px] flex items-center justify-center"
                    >
                      Buat CV
                    </button>
                  </div>
                )}

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-[10px] space-y-2 text-xs border border-slate-100 dark:border-slate-700">
                  <p className="text-slate-600 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white">Estimasi Gaji:</strong>{' '}
                    {selectedJob.salary &&
                    selectedJob.salary !== '-' &&
                    selectedJob.salary.toLowerCase() !== 'null' &&
                    selectedJob.salary.toLowerCase() !== 'undefined'
                      ? selectedJob.salary
                      : 'Gaji dirahasiakan (kompetitif)'}
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white">Tipe Pekerjaan:</strong> {selectedJob.type}
                  </p>
                </div>

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

                {/* Kualifikasi & Persyaratan */}
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

                {/* Lowongan Serupa (Cosine Similarity) */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Lowongan Serupa Terkait
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
                            const simLocation = sim.location === '[object Object]' ? 'Indonesia' : (sim.location || 'Indonesia');
                            const simType = sim.work_type || 'Full-time';
                            const details = resolveJobDetails(
                              cleaned.title,
                              cleaned.company,
                              simLocation,
                              simType,
                              sim.description,
                              sim.requirements
                            );
                            const isParentMatched = Boolean(selectedJob?.hasMatchCalculated);
                            setSelectedJob({
                              id: sim.id,
                              title: cleaned.title,
                              company: cleaned.company,
                              location: simLocation,
                              salary: sim.salary_min ? `Rp ${sim.salary_min.toLocaleString('id-ID')}` : '-',
                              type: simType,
                              posted: 'Tersedia',
                              matchScore: isParentMatched ? `${sim.similarity_score || 75}%` : '',
                              matchScoreNum: isParentMatched ? (sim.similarity_score || 75) : 0,
                              hasMatchCalculated: isParentMatched,
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
                          <span className="shrink-0 px-2 py-0.5 rounded-[10px] text-caption font-bold bg-blue-50 text-cobalt-500 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            {sim.similarity_score || 75}% Serupa
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400">Belum ada lowongan serupa lainnya.</p>
                  )}
                </div>
              </SheetBody>

              {/* Sticky Footer */}
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

                {selectedJob.externalUrl ? (
                  <a
                    href={selectedJob.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Buka portal loker ${selectedJob.company} (buka di tab baru)`}
                    className={cn(buttonVariants({ variant: 'primary', size: 'md' }), 'w-full sm:w-auto flex-1 flex items-center justify-center gap-1.5')}
                  >
                    <span>Buka Portal Loker</span>
                    <ExternalLinkIcon size={14} className="text-white" />
                  </a>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      setSelectedJob(null);
                      router.push('/match-cv');
                    }}
                    className="w-full sm:w-auto flex-1 flex items-center justify-center gap-1.5"
                  >
                    <span>Cari Portal Sumber</span>
                  </Button>
                )}
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};
