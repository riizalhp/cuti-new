'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileTextIcon, TargetIcon, CloseIcon } from '@/components/icons/CustomIcons';
import { cvApi, jobsApi } from '@/lib/api';
import { getStoredSession } from '@/lib/auth';
import { getLokerUrl } from '@/lib/urls';

export const ContextualMarketingCard: React.FC = () => {
  const router = useRouter();
  const [userIntent, setUserIntent] = useState<string | null>(null);
  const [hasCv, setHasCv] = useState<boolean>(true);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [matchingJobsCount, setMatchingJobsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = getStoredSession();
    if (session) {
      setUserIntent((session as any).intent || null);
      if (typeof (session as any).hasCv === 'boolean') {
        setHasCv((session as any).hasCv);
      }
    }

    // Fetch dynamic data
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cvs, jobs] = await Promise.all([
        cvApi.getAll(),
        jobsApi.getRecommended(50),
      ]);

      if (Array.isArray(cvs) && cvs.length > 0) {
        setHasCv(true);
      } else {
        setHasCv(false);
      }

      setMatchingJobsCount(Array.isArray(jobs) ? jobs.length : 0);
    } catch (error) {
      console.error('[ContextualMarketingCard] Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  // Case 1: User belum punya CV (Intent Buat CV or marked no CV)
  if (!hasCv || userIntent === 'buat_cv') {
    return (
      <div className="relative overflow-hidden rounded-[10px] bg-orange-700 text-white p-3 sm:p-3.5 shadow-xs border border-orange-600">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-[8px] bg-white/20 text-white flex items-center justify-center shrink-0">
              <FileTextIcon size={16} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5">
                <span>Kamu belum punya CV</span>
              </h4>
              <p className="text-caption sm:text-xs text-orange-50 mt-0.5 max-w-lg leading-relaxed">
                Banyak perusahaan dan loker membutuhkan CV standar ATS untuk proses seleksi pertama.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={() => router.push('/cv')}
              className="w-full sm:w-auto px-4 py-2 min-h-[32px] rounded-[10px] bg-white hover:bg-orange-50 text-orange-700 font-extrabold text-xs shadow-xs transition flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-orange-500 dark:text-orange-400"
            >
              <span>Buat CV Gratis</span>
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="h-8 w-8 min-h-[32px] min-w-[32px] rounded-[8px] flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Tutup Banner"
            >
              <CloseIcon size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: User sudah punya CV tapi intent Cari Kerja
  if (userIntent === 'cari_kerja') {
    return (
      <div className="relative overflow-hidden rounded-[10px] bg-slate-900 dark:bg-slate-900 text-white p-3 sm:p-3.5 shadow-xs border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <TargetIcon size={16} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5">
                <span>CV sudah siap. Sekarang cari loker yang cocok</span>
              </h4>
              <p className="text-caption sm:text-xs text-slate-300 mt-0.5 max-w-lg leading-relaxed">
                {matchingJobsCount > 0
                  ? `Ada ${matchingJobsCount} loker aktif yang sesuai dengan profilmu.`
                  : 'Jelajahi loker terbaru yang sesuai dengan profilmu.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={() => window.open(getLokerUrl(), '_blank')}
              className="w-full sm:w-auto px-4 py-2 min-h-[32px] rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 text-white font-extrabold text-xs shadow-xs transition flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <span>Cari Loker</span>
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="h-8 w-8 min-h-[32px] min-w-[32px] rounded-[8px] flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 dark:text-slate-400"
              aria-label="Tutup Banner"
            >
              <CloseIcon size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default Case: Hidden for now
  return null;
};
