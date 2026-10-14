'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error internal untuk debugging di development
    console.error('[Dashboard Error Boundary]:', error);
  }, [error]);

  return (
    <div
      id="dashboard-root-layout"
      className="h-full min-h-full max-h-full w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between font-sans selection:bg-[#1738D1] selection:text-white transition-colors duration-200 overflow-hidden"
    >
      {/* Top Header Bar */}
      <header className="w-full px-6 sm:px-12 py-4 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs">
        <Link href="/beranda" className="inline-block hover:opacity-85 transition" aria-label="Beranda Employr">
          <Image
            src="/logo.webp"
            alt="Employr"
            width={130}
            height={36}
            className="h-7 sm:h-8 w-auto object-contain dark:brightness-0 dark:invert"
            priority
          />
        </Link>
        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider hidden sm:inline">
          System Recovery
        </span>
      </header>

      {/* Main Error Frame */}
      <main className="w-full flex-1 flex flex-col justify-center items-center text-center px-6 sm:px-12 py-6 my-auto relative overflow-y-auto no-scrollbar">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-rose-500/10 dark:bg-rose-500/15 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-lg w-full flex flex-col items-center">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] text-caption font-bold bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 mb-3 shadow-2xs">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>KENDALA SISTEM DASHBOARD</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
            Terjadi kesalahan saat memuat halaman
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto mb-5">
            Sistem sedang menyelaraskan data dashboard. Data CV dan progres lamaranmu tetap aman. Silakan muat ulang atau kembali ke beranda.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 w-full max-w-xs mx-auto">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.reload();
                } else {
                  reset();
                }
              }}
              className="flex-1 h-10 px-4 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-bold text-xs shadow-md shadow-[#1738D1]/20 active:scale-[0.98] transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Muat Ulang</span>
            </button>

            <Link href="/beranda" className="flex-1">
              <button
                type="button"
                className="w-full h-10 px-4 rounded-[10px] bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Beranda</span>
              </button>
            </Link>
          </div>

          {/* Development Debug Error Information */}
          {process.env.NODE_ENV !== 'production' && error?.message && (
            <div className="mt-5 p-3.5 rounded-[10px] bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-left text-xs font-mono text-rose-800 dark:text-rose-200 max-w-lg w-full overflow-x-auto space-y-1 shadow-2xs">
              <div className="font-bold text-[10px] uppercase tracking-wider text-rose-700 dark:text-rose-400">
                Pesan Kesalahan (Hanya Tampil di Mode Dev):
              </div>
              <p className="break-words font-semibold text-[11px]">{error.message}</p>
              {error.digest && (
                <p className="text-[10px] text-rose-600 dark:text-rose-400">Digest: {error.digest}</p>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Polished Bottom Footer Bar */}
      <footer className="w-full px-6 sm:px-12 py-3.5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/80 dark:border-slate-800/80 shrink-0 bg-white/70 dark:bg-slate-900/70 pl-16 sm:pl-12">
        <p className="font-medium text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} Employr • Career Operating System
        </p>
        <div className="flex items-center gap-4 text-xs font-semibold mt-2 sm:mt-0">
          <Link href="/beranda" className="hover:text-slate-900 dark:hover:text-white transition">
            Beranda
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link href="/cv" className="hover:text-slate-900 dark:hover:text-white transition">
            Daftar CV
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') window.location.reload();
              else reset();
            }}
            className="hover:text-[#1738D1] dark:hover:text-blue-400 transition cursor-pointer"
          >
            Muat Ulang
          </button>
        </div>
      </footer>
    </div>
  );
}
