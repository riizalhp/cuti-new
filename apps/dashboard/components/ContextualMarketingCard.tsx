'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Target, Rocket, ArrowRight, X } from 'lucide-react';

export const ContextualMarketingCard: React.FC = () => {
  const router = useRouter();
  const [userIntent, setUserIntent] = useState<string | null>(null);
  const [hasCv, setHasCv] = useState<boolean>(true);
  const [isVisible, setIsVisible] = useState<boolean>(true);

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
  }, []);

  if (!isVisible) return null;

  // Case 1: User belum punya CV (Intent Buat CV or marked no CV)
  if (!hasCv || userIntent === 'buat_cv') {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white p-5 shadow-lg border border-orange-400/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0 shadow-inner">
              <FileText className="w-5 h-5" />
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
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-orange-50 text-orange-600 font-extrabold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Buat CV Gratis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="p-2 text-white/80 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: User sudah punya CV tapi intent Cari Kerja
  if (userIntent === 'cari_kerja') {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 dark:bg-slate-900 text-white p-5 shadow-lg border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <span>CV sudah siap. Sekarang cari lowongan yang cocok</span>
              </h4>
              <p className="text-xs text-slate-300 mt-0.5 max-w-lg leading-relaxed">
                Ada 18 lowongan aktif yang memiliki tingkat kesesuaian di atas 85% dengan profilmu.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={() => router.push('/scrape-jobs')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs shadow-md shadow-orange-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Cari Lowongan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="p-2 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default Case: Premium Pass Nudge
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-navy-900 to-slate-900 text-white p-5 shadow-lg border border-orange-500/20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center shrink-0">
            <Rocket className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <span>Kamu aktif mencari kerja minggu ini</span>
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 max-w-lg leading-relaxed">
              Premium Pass membantu melacak lamaran & memberikan kata kunci analisis lowongan secara otomatis.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            onClick={() => router.push('/pembayaran')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs shadow-md shadow-orange-500/25 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Coba Premium Pass</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-2 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
