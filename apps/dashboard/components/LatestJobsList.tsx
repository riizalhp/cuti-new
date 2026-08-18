'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Building2,
  CheckCircle2,
  Send,
  X,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { jobsApi, cvApi } from '@/lib/api';
import { calculateJobMatch } from '@/lib/job-matcher';

export const LatestJobsList: React.FC = () => {
  const router = useRouter();
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendedJobs = async () => {
      setIsLoading(true);
      try {
        // Fetch user's CV for matching
        const cvs = await cvApi.getAll();
        const primaryCv = cvs.find((c: any) => c.isPrimary) || cvs[0];

        // Fetch jobs from API
        const allJobs = await jobsApi.getRecommended(20);

        if (primaryCv && allJobs.length > 0) {
          // Calculate match scores
          const jobsWithScores = allJobs.map((job: any) => {
            const matchResult = calculateJobMatch(primaryCv, job);
            return {
              ...job,
              matchScore: matchResult.matchScore,
            };
          });

          // Sort by match score and take top 3
          const topJobs = jobsWithScores
            .sort((a: any, b: any) => b.matchScore - a.matchScore)
            .slice(0, 3)
            .map((job: any) => ({
              id: job.id,
              title: job.title || job.position,
              company: job.company,
              location: job.location,
              salary: job.salary || '-',
              type: job.type || 'Full-time',
              posted: job.postedDate || 'Baru saja',
              matchScore: `${job.matchScore}%`,
              desc: job.description || 'Deskripsi tidak tersedia',
            }));

          setJobs(topJobs);
        } else {
          // Fallback to empty state
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

  const handleApply = (jobId: string) => {
    if (!appliedJobs.includes(jobId)) {
      setAppliedJobs([...appliedJobs, jobId]);
    }
  };

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
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <span>Lowongan Paling Relevan Untukmu</span>
              {jobs.length > 0 && (
                <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-bold bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300">
                  Match &gt;85%
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Rekomendasi teratas berdasarkan kualifikasi CV dan minat kariermu
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push('/match-cv')}
          className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Cari Semua Lowongan</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="py-12 text-center">
          <Briefcase className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Belum ada lowongan tersedia</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Lowongan yang cocok dengan profilmu akan muncul di sini
          </p>
          <button
            onClick={() => router.push('/scrape-jobs')}
            className="mt-4 px-4 py-2 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-bold text-xs transition cursor-pointer border-0"
          >
            Cari Lowongan Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {jobs.map((job) => {
            const isApplied = appliedJobs.includes(job.id);
            return (
              <div
                key={job.id}
                className="p-4 rounded-[10px] border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
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
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {job.company}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 truncate">
                        {job.salary}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="flex-1 py-2 px-2 rounded-[10px] bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs transition cursor-pointer border-0"
                  >
                    Detail
                  </button>

                  <button
                    onClick={() => handleApply(job.id)}
                    disabled={isApplied}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-[10px] font-bold text-xs transition shadow-sm cursor-pointer border-0 ${
                      isApplied
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-[#1738D1] hover:bg-[#132EA8] text-white'
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Terkirim</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Lamar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg p-6 relative">
            <button
              onClick={() => setSelectedJob(null)}
              className="absolute top-4 right-4 p-1.5 rounded-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="px-2.5 py-0.5 rounded-[10px] text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Match Score {selectedJob.matchScore}
            </span>

            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-2">
              {selectedJob.title}
            </h3>
            <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-4">
              {selectedJob.company} • {selectedJob.location}
            </p>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-[10px] space-y-2 text-xs mb-4 border border-slate-100 dark:border-slate-700">
              <p className="text-slate-600 dark:text-slate-300">
                <strong className="text-slate-900 dark:text-white">Estimasi Gaji:</strong> {selectedJob.salary}
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                <strong className="text-slate-900 dark:text-white">Tipe Pekerjaan:</strong> {selectedJob.type}
              </p>
            </div>

            <div className="space-y-2 mb-6">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Deskripsi Pekerjaan:
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedJob.desc}
              </p>
            </div>

            <button
              onClick={() => {
                handleApply(selectedJob.id);
                setSelectedJob(null);
              }}
              disabled={appliedJobs.includes(selectedJob.id)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] disabled:bg-emerald-600 text-white font-bold text-xs shadow-md transition cursor-pointer border-0"
            >
              {appliedJobs.includes(selectedJob.id) ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Lamaran Telah Terkirim</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim Lamaran Dengan CV ATS</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
