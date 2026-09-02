'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  FileQuestion,
  Home,
  ArrowLeft,
  Sun,
  Moon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = mounted && resolvedTheme === 'dark';
  const toggleDarkMode = () => setTheme(isDarkMode ? 'light' : 'dark');

  return (
    <div className="h-screen h-[100dvh] max-h-screen overflow-hidden w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between font-sans selection:bg-[#1738D1] selection:text-white transition-colors duration-200">
      {/* Top Header Bar — Full Width Edge-to-Edge */}
      <header className="w-full px-6 sm:px-12 py-5 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 shrink-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xs">
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
        
        <div className="flex items-center gap-3">
          <Link
            href="/beranda"
            className="hidden sm:inline-flex text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#1738D1] dark:hover:text-blue-400 transition px-3 py-1.5"
          >
            Dashboard
          </Link>
          {mounted && (
            <button
              type="button"
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shadow-2xs"
              aria-label="Ganti tema"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
        </div>
      </header>

      {/* Main 404 Hero Frame — Full Width Visual Canvas */}
      <main className="w-full flex-1 flex flex-col justify-center items-center text-center px-6 sm:px-12 py-4 my-auto relative">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#1738D1]/10 dark:bg-[#1738D1]/15 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-2xl w-full flex flex-col items-center">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] text-[10px] sm:text-[11px] font-bold bg-blue-50 dark:bg-blue-950/80 text-[#1738D1] dark:text-blue-400 border border-blue-200 dark:border-blue-800 mb-3 sm:mb-4 shadow-2xs">
            <FileQuestion className="w-3.5 h-3.5" />
            <span>404 • HALAMAN TIDAK DITEMUKAN</span>
          </div>

          {/* Big Stylized 404 Typography */}
          <div className="relative mb-2 sm:mb-3 select-none w-full flex items-center justify-center">
            <span className="text-[clamp(6rem,18vw,13rem)] font-black leading-none tracking-tighter text-slate-200 dark:text-slate-800/80 select-none block opacity-80">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[clamp(4rem,12vw,8.5rem)] font-extrabold leading-none tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
                404
              </span>
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-2 mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Rute ini di luar peta kariermu
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
              Halaman yang kamu cari tidak ditemukan atau telah dipindahkan. Data CV dan progres lamaran kerjamu tetap tersimpan aman.
            </p>
          </div>

          {/* Short Action Buttons */}
          <div className="flex items-center justify-center gap-3 w-full max-w-xs mx-auto">
            <Link href="/beranda" className="flex-1">
              <Button
                variant="primary"
                size="default"
                className="w-full h-10 px-5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-bold text-xs shadow-md shadow-[#1738D1]/20 active:scale-[0.98] transition flex items-center justify-center gap-1.5"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Beranda</span>
              </Button>
            </Link>

            <button
              onClick={() => router.back()}
              className="flex-1 h-10 px-4 rounded-[10px] bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer Info — Full Width Edge-to-Edge */}
      <footer className="w-full px-6 sm:px-12 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:text-slate-600 border-t border-slate-200/80 dark:border-slate-800/80 shrink-0 bg-white/40 dark:bg-slate-900/40">
        <p>© {new Date().getFullYear()} Employr · Career Operating System</p>
        <div className="flex items-center gap-5 text-xs text-slate-500 dark:text-slate-400">
          <Link href="/beranda" className="hover:text-slate-800 dark:hover:text-slate-200 transition">
            Beranda
          </Link>
          <Link href="/pengaturan" className="hover:text-slate-800 dark:hover:text-slate-200 transition">
            Bantuan
          </Link>
        </div>
      </footer>
    </div>
  );
}
