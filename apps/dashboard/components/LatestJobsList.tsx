'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BriefcaseIcon,
  MapPinIcon,
  DollarSignIcon,
  BuildingIcon,
  BookmarkIcon,
  BookmarkCheckIcon,
  ExternalLinkIcon,
  CloseIcon,
} from '@/components/icons/CustomIcons';
import { jobsApi, cvApi, trackerApi } from '@/lib/api';
import { calculateJobMatch } from '@/lib/job-matcher';
import { FeedbackWidget } from '@/components/ui/FeedbackWidget';
import { getStoredSession } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';

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
  desc: string;
  externalUrl: string;
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
  const [userId, setUserId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<RecommendedJobItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = getStoredSession();
    if (session?.id) setUserId(session.id);
  }, []);

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

        if (primaryCv && allJobs.length > 0) {
          // Calculate realistic match scores
          const jobsWithScores = allJobs.map((job: any) => {
            const matchResult = calculateJobMatch(primaryCv, {
              ...job,
              workType: job.workType || job.type,
            });
            return {
              ...job,
              matchScore: matchResult.matchScore,
              matchScoreNum: matchResult.matchScore,
            };
          });

          // Only consider jobs with a meaningful minimum match score (>= 25%)
          // Unrelated jobs (like distant technicians) get filtered out automatically
          const eligibleJobs = jobsWithScores.filter((j: any) => j.matchScoreNum >= 25);

          // Sort by match score and take top 3
          const topJobs: RecommendedJobItem[] = eligibleJobs
            .sort((a: any, b: any) => b.matchScoreNum - a.matchScoreNum)
            .slice(0, 3)
            .map((job: any) => ({
              id: job.id,
              title: job.title || job.position,
              company: job.company,
              location: job.location,
              salary: job.salary || '-',
              type: job.type || 'Full-time',
              posted: job.postedDate || 'Baru saja',
              matchScore: `${job.matchScoreNum}%`,
              matchScoreNum: job.matchScoreNum,
              desc: job.description || 'Deskripsi tidak tersedia',
              externalUrl: job.externalUrl || '',
            }));

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
        portal: 'Portal Lowongan',
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

  const maxScore = jobs.length > 0 ? Math.max(...jobs.map((j) => j.matchScoreNum || 0)) : 0;

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-[10px] p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors space-y-4">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-orange-50 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-100 dark:border-orange-900/50 animate-pulse" />
            <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-[10px] border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3 animate-pulse">
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
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] bg-orange-50 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-100 dark:border-orange-900/50">
            <BriefcaseIcon size={16} />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <span>Lowongan Paling Relevan Untukmu</span>
              {jobs.length > 0 && (
                maxScore >= 80 ? (
                  <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Match &gt;80%
                  </span>
                ) : maxScore >= 60 ? (
                  <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    Match &gt;60%
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    Rekomendasi Profil ({maxScore}%)
                  </span>
                )
              )}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Rekomendasi teratas berdasarkan kualifikasi CV dan preferensi kariermu
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push('/match-cv')}
          className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Cari Semua Lowongan</span>
        </button>
      </div>

      {jobs.length > 0 && userId && (
        <div className="flex justify-end -mt-2 mb-1">
          <FeedbackWidget feature="job_recommendation" userId={userId} />
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="py-12 text-center">
          <BriefcaseIcon size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Belum ada lowongan yang sesuai kriteria</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Sistem belum menemukan lowongan aktif yang memiliki kecocokan tinggi dengan target profesi dan domisili kamu saat ini.
          </p>
          <button
            onClick={() => router.push('/match-cv')}
            className="mt-4 px-4 py-2 rounded-[10px] bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition cursor-pointer border-0 inline-flex items-center gap-1.5"
          >
            <span>Jelajahi Semua Lowongan</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {jobs.map((job) => {
            const isSaved = savedJobIds.includes(job.id);
            const isSaving = savingId === job.id;
            const badgeStyle = getMatchBadgeStyle(job.matchScoreNum);

            return (
              <div
                key={job.id}
                className="p-4 rounded-[10px] border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-[10px] text-[10px] font-extrabold border ${badgeStyle}`}>
                      Match {job.matchScore}
                    </span>
                    <span className="text-[10px] text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-[10px] border border-slate-200 dark:border-slate-800">
                      {job.posted}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                    {job.title}
                  </h4>

                  <div className="space-y-1 my-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <BuildingIcon size={14} className="text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {job.company}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPinIcon size={14} className="text-slate-400 shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSignIcon size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 truncate">
                        {job.salary}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="py-2 px-2.5 rounded-[10px] bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs transition cursor-pointer border-0"
                  >
                    Detail
                  </button>

                  <button
                    onClick={() => handleSaveToTracker(job)}
                    disabled={isSaved || isSaving}
                    title={isSaved ? 'Sudah tersimpan di Tracker' : 'Simpan ke Tracker'}
                    className={`py-2 px-2.5 rounded-[10px] font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer border ${
                      isSaved
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {isSaved ? (
                      <>
                        <BookmarkCheckIcon size={14} className="text-emerald-600 dark:text-emerald-400" />
                        <span className="hidden sm:inline">Tersimpan</span>
                      </>
                    ) : (
                      <>
                        <BookmarkIcon size={14} />
                        <span className="hidden sm:inline">+ Tracker</span>
                      </>
                    )}
                  </button>

                  {job.externalUrl ? (
                    <a
                      href={job.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-[10px] font-bold text-xs transition shadow-xs bg-orange-500 hover:bg-orange-600 text-white no-underline cursor-pointer"
                    >
                      <span className="truncate">Lamar</span>
                      <ExternalLinkIcon size={13} className="shrink-0" />
                    </a>
                  ) : (
                    <button
                      onClick={() => router.push('/match-cv')}
                      className="flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-[10px] font-bold text-xs transition shadow-xs bg-[#1738D1] hover:bg-[#132EA8] text-white border-0 cursor-pointer"
                    >
                      <span className="truncate">Lihat Sumber</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Job Detail Slide-in Drawer per Dashboard Pilar 4 */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end transition-opacity">
          <div className="relative z-10 w-full max-w-md sm:max-w-lg h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <span className={`px-2.5 py-0.5 rounded-[10px] text-xs font-bold border ${getMatchBadgeStyle(selectedJob.matchScoreNum)}`}>
                Match Score {selectedJob.matchScore}
              </span>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-1.5 rounded-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                aria-label="Tutup"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {selectedJob.title}
                </h3>
                <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 mt-1">
                  {selectedJob.company} • {selectedJob.location}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-[10px] space-y-2 text-xs border border-slate-100 dark:border-slate-700">
                <p className="text-slate-600 dark:text-slate-300">
                  <strong className="text-slate-900 dark:text-white">Estimasi Gaji:</strong> {selectedJob.salary}
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
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                onClick={() => handleSaveToTracker(selectedJob)}
                disabled={savedJobIds.includes(selectedJob.id) || savingId === selectedJob.id}
                className={`w-full sm:w-auto flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-[10px] font-bold text-xs transition border cursor-pointer ${
                  savedJobIds.includes(selectedJob.id)
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                }`}
              >
                {savedJobIds.includes(selectedJob.id) ? (
                  <>
                    <BookmarkCheckIcon size={16} className="text-emerald-600" />
                    <span>Tersimpan di Tracker</span>
                  </>
                ) : (
                  <>
                    <BookmarkIcon size={16} />
                    <span>Simpan ke Tracker</span>
                  </>
                )}
              </button>

              {selectedJob.externalUrl ? (
                <a
                  href={selectedJob.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-[10px] bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition no-underline cursor-pointer"
                >
                  <span>Buka Portal Lowongan</span>
                  <ExternalLinkIcon size={14} />
                </a>
              ) : (
                <button
                  onClick={() => {
                    setSelectedJob(null);
                    router.push('/match-cv');
                  }}
                  className="w-full sm:w-auto flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-[10px] bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition border-0 cursor-pointer"
                >
                  <span>Cari Portal Sumber</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
