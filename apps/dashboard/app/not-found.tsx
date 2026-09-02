'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileQuestion,
  Home,
  ArrowLeft,
  Compass,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="h-screen h-[100dvh] max-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-200 selection:bg-[#1738D1] selection:text-white">
      {/* Top Header Bar */}
      <header className="w-full max-w-3xl mx-auto flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <Link href="/beranda" className="flex items-center gap-2.5 hover:opacity-85 transition" aria-label="Employr Dashboard">
          <div className="h-8 w-8 rounded-[10px] bg-[#1738D1] flex items-center justify-center text-white shadow-xs">
            <Compass className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white">
            Employr<span className="text-[#1738D1]">.</span>
          </span>
        </Link>

        <Link
          href="/beranda"
          className="px-3 py-1.5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition flex items-center gap-1.5 shadow-2xs"
        >
          <Home className="w-3.5 h-3.5 text-[#1738D1]" />
          <span>Beranda</span>
        </Link>
      </header>

      {/* Main 404 Bento Section (Centered, No Scroll) */}
      <main className="w-full max-w-xl mx-auto my-auto flex flex-col items-center justify-center text-center py-4">
        {/* Main Bento Card */}
        <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-6 sm:p-8 shadow-sm relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-36 bg-[#1738D1]/10 dark:bg-[#1738D1]/15 blur-3xl rounded-full pointer-events-none" />

          {/* Status Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[10px] text-[10px] font-bold bg-blue-50 dark:bg-blue-950/80 text-[#1738D1] dark:text-blue-400 border border-blue-200 dark:border-blue-800 mb-4">
            <FileQuestion className="w-3.5 h-3.5" />
            <span>404 • HALAMAN TIDAK DITEMUKAN</span>
          </div>

          {/* Icon Box */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-[10px] bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200/80 dark:border-slate-700/80 shadow-inner">
            <FileQuestion className="w-7 h-7 sm:w-8 sm:h-8 text-[#1738D1] dark:text-blue-400" />
          </div>

          {/* Title & Description */}
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
            Rute ini di luar peta kariermu
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed mb-6">
            Halaman yang kamu cari tidak ditemukan atau telah dipindahkan. Data CV dan progres lamaranmu tetap tersimpan aman.
          </p>

          {/* Primary & Secondary Action Buttons (Shortened) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 max-w-xs mx-auto">
            <Link href="/beranda" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="default"
                className="w-full sm:w-auto px-5 py-2 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-bold text-xs shadow-md shadow-[#1738D1]/20 active:scale-[0.98] transition flex items-center justify-center gap-1.5"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Beranda</span>
              </Button>
            </Link>

            <button
              onClick={() => router.back()}
              className="w-full sm:w-auto px-4 py-2 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer border border-transparent dark:border-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Footer (One Liner) */}
      <footer className="w-full max-w-3xl mx-auto pt-3 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 dark:text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
        <p>© {new Date().getFullYear()} Employr — Career Operating System.</p>
        <div className="flex items-center gap-4">
          <Link href="/beranda" className="hover:text-slate-700 dark:hover:text-slate-300 transition">
            Beranda
          </Link>
          <Link href="/pengaturan" className="hover:text-slate-700 dark:hover:text-slate-300 transition">
            Bantuan
          </Link>
        </div>
      </footer>
    </div>
  );
}
