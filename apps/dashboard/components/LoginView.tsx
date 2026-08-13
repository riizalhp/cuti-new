'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

interface LoginViewProps {}

export const LoginView: React.FC<LoginViewProps> = () => {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = resolvedTheme === 'dark';
  const toggleDarkMode = () => setTheme(isDarkMode ? 'light' : 'dark');

  const handleGoogleLogin = () => {
    setIsLoading(true);
    router.push('/beranda');
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F6F2] dark:bg-[#101114] text-[#101114] dark:text-[#F5F6F2] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Top Bar / Theme Toggle */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1738D1] border-2 border-[#101114] dark:border-[#F5F6F2] flex items-center justify-center font-black text-[#F5F6F2] text-lg shadow-[2px_2px_0px_#101114] dark:shadow-[2px_2px_0px_#F5F6F2]">
            C
          </div>
          <span className="font-extrabold text-lg tracking-tight text-[#101114] dark:text-[#F5F6F2]">
            CUTI
          </span>
        </div>

        {mounted && (
          <button
            onClick={toggleDarkMode}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#1E1E22] border-2 border-[#101114] dark:border-[#3F3F46] text-xs font-bold shadow-[3px_3px_0px_#101114] dark:shadow-[3px_3px_0px_#3F3F46] hover:translate-y-[-1px] transition cursor-pointer"
          >
            {isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
          </button>
        )}
      </div>

      {/* Main Login Card - Designed like localhost:4321 Login Modal */}
      <div className="w-full max-w-[420px] bg-[#F5F6F2] dark:bg-[#18181B] border-2 border-[#101114] dark:border-[#3F3F46] shadow-[10px_10px_0px_#101114] dark:shadow-[10px_10px_0px_#27272A] rotate-[-1deg] p-8 sm:p-10 relative z-10 transition-transform hover:rotate-0 duration-300">
        
        {/* Header */}
        <div className="text-center mb-7">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-full bg-[#1738D1] border-2 border-[#101114] dark:border-[#F5F6F2] flex items-center justify-center font-black text-[#F5F6F2] text-xl shadow-[3px_3px_0px_#101114] dark:shadow-[3px_3px_0px_#F5F6F2]">
              C
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#101114] dark:text-[#F5F6F2] m-0 leading-none">
            Masuk ke <em className="font-serif font-normal italic text-[#1738D1] dark:text-[#60A5FA]">CUTI</em>
          </h1>
          <p className="mt-2.5 text-sm text-[#101114]/70 dark:text-[#F5F6F2]/70 leading-snug">
            Akses cepat dan aman untuk mengelola CV, lamaran, serta misimu.
          </p>
        </div>

        {/* Action Container */}
        <div className="flex flex-col gap-4 mb-2">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full min-h-[54px] px-6 py-3 rounded-full border-2 border-[#1738D1] bg-[#1738D1] text-[#F5F6F2] hover:bg-[#F5F6F2] hover:text-[#1738D1] dark:hover:bg-[#101114] dark:hover:text-[#60A5FA] font-semibold text-base flex items-center justify-between transition-all duration-250 hover:-translate-y-1 shadow-[4px_4px_0px_#101114] dark:shadow-[4px_4px_0px_#3F3F46] disabled:opacity-60 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className="bg-white rounded-full p-0.5 shrink-0">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.37 7.37 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.97 0 12s.45 3.85 1.24 5.42l4.04-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.63 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
              )}
              <span>{isLoading ? 'Memproses...' : 'Masuk dengan Google'}</span>
            </div>
            <span className="text-xl leading-none">↗</span>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 text-center border-t border-[#101114]/15 dark:border-[#F5F6F2]/15">
          <p className="text-xs text-[#101114]/75 dark:text-[#F5F6F2]/75 m-0">
            Belum punya akun?{' '}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="bg-transparent border-0 p-0 font-semibold text-[#1738D1] dark:text-[#60A5FA] cursor-pointer underline underline-offset-3 hover:text-[#101114] dark:hover:text-white"
            >
              Daftar dengan Google ↗
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

