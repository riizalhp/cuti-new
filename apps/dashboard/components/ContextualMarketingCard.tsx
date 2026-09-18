'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileTextIcon, TargetIcon, CloseIcon } from '@/components/icons/CustomIcons';
import { cvApi, jobsApi } from '@/lib/api';

export const ContextualMarketingCard: React.FC = () => {
  const router = useRouter();
  const [userIntent, setUserIntent] = useState<string | null>(null);
  const [hasCv, setHasCv] = useState<boolean>(true);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [matchingJobsCount, setMatchingJobsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const sessionStr = localStorage.getItem('cuti_user_session');
        if (sessionStr) {
          const parsed = JSON.parse(sessionStr);
          setUserIntent(parsed.intent || null);
          if (typeof parsed.hasCv === 'boolean') {
            setHasCv(parsed.hasCv);
          }
        }
      } catch (e) {
        console.warn('Failed to parse cuti_user_session', e);
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
      <div className="relative overflow-hidden rounded-[10px] bg-orange-500 text-white p-5 shadow-xs border border-orange-600">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-[10px] bg-white/20 text-white flex items-center justify-center shrink-0">
              <FileTextIcon size={20} />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <span>Kamu belum punya CV</span>
              </h4>
              <p className="text-xs text-orange-50 mt-0.5 max-w-lg leading-relaxed">
                Banyak perusahaan dan lowongan membutuhkan CV standar ATS untuk proses seleksi pertama.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={() => router.push('/cv')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-[10px] bg-white hover:bg-orange-50 text-orange-600 font-extrabold text-xs shadow-xs transition flex items-center justify-center cursor-pointer"
            >
              <span>Buat CV Gratis</span>
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="p-2 text-white/80 hover:text-white transition cursor-pointer"
              aria-label="Tutup Banner"
            >
              <CloseIcon size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: User sudah punya CV tapi intent Cari Kerja
  if (userIntent === 'cari_kerja') {
    return (
      <div className="relative overflow-hidden rounded-[10px] bg-slate-900 dark:bg-slate-900 text-white p-5 shadow-xs border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <TargetIcon size={20} />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <span>CV sudah siap. Sekarang cari lowongan yang cocok</span>
              </h4>
              <p className="text-xs text-slate-300 mt-0.5 max-w-lg leading-relaxed">
                {matchingJobsCount > 0
                  ? `Ada ${matchingJobsCount} lowongan aktif yang sesuai dengan profilmu.`
                  : 'Jelajahi lowongan terbaru yang sesuai dengan profilmu.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={() => router.push('/scrape-jobs')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-[10px] bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs shadow-xs transition flex items-center justify-center cursor-pointer"
            >
              <span>Cari Lowongan</span>
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="p-2 text-slate-400 hover:text-white transition cursor-pointer"
              aria-label="Tutup Banner"
            >
              <CloseIcon size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default Case: Hidden for now
  return null;
};
