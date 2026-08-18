'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { setSessionCookie, getStoredSession } from '@/lib/auth';

interface LoginViewProps {}

export const LoginView: React.FC<LoginViewProps> = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams?.get('redirect') || '/beranda';

  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-login check on mount: If valid session exists in cookies or localStorage, redirect immediately
  useEffect(() => {
    setMounted(true);
    const existingSession = getStoredSession();
    if (existingSession && existingSession.email) {
      router.replace(redirectTarget);
    }
  }, [router, redirectTarget]);

  const isDarkMode = resolvedTheme === 'dark';
  const toggleDarkMode = () => setTheme(isDarkMode ? 'light' : 'dark');

  const handleCredentialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        setErrorMessage(result.message || 'Email atau kata sandi tidak valid.');
        setIsLoading(false);
        return;
      }

      const userData = {
        id: result.data.id,
        name: result.data.name,
        email: result.data.email,
        role: result.data.role,
      };

      // Set cookie for 30 days if rememberMe is true, otherwise 1 day
      setSessionCookie(userData, rememberMe ? 30 : 1);

      router.push(redirectTarget);
    } catch (err) {
      console.error('Login error:', err);
      setErrorMessage('Terjadi kendala saat menghubungkan ke database server.');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    const googleUser = {
      name: 'Google User',
      email: 'user@gmail.com',
      role: 'USER',
      provider: 'google',
    };

    setSessionCookie(googleUser, 30);
    router.push(redirectTarget);
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F6F2] dark:bg-[#101114] text-[#101114] dark:text-[#F5F6F2] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Top Bar / Theme Toggle */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-navy-700 border-2 border-[#101114] dark:border-[#F5F6F2] flex items-center justify-center font-black text-[#F5F6F2] text-lg shadow-[2px_2px_0px_#101114] dark:shadow-[2px_2px_0px_#F5F6F2]">
            C
          </div>
          <span className="font-extrabold text-lg tracking-tight text-[#101114] dark:text-[#F5F6F2]">
            CUTI
          </span>
        </div>

        {mounted && (
          <button
            type="button"
            onClick={toggleDarkMode}
            className="px-3.5 py-2 rounded-[10px] bg-white dark:bg-[#1E1E22] border-2 border-[#101114] dark:border-[#3F3F46] text-xs font-bold shadow-[3px_3px_0px_#101114] dark:shadow-[3px_3px_0px_#3F3F46] hover:translate-y-[-1px] transition cursor-pointer"
          >
            {isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
          </button>
        )}
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-[420px] bg-[#F5F6F2] dark:bg-[#18181B] border-2 border-[#101114] dark:border-[#3F3F46] shadow-[10px_10px_0px_#101114] dark:shadow-[10px_10px_0px_#27272A] rotate-[-1deg] p-8 sm:p-10 relative z-10 transition-transform hover:rotate-0 duration-300">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-full bg-navy-700 border-2 border-[#101114] dark:border-[#F5F6F2] flex items-center justify-center font-black text-[#F5F6F2] text-xl shadow-[3px_3px_0px_#101114] dark:shadow-[3px_3px_0px_#F5F6F2]">
              C
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#101114] dark:text-[#F5F6F2] m-0 leading-none">
            Masuk ke <em className="font-serif font-normal italic text-navy-700 dark:text-[#60A5FA]">CUTI</em>
          </h1>
          <p className="mt-2.5 text-sm text-[#101114]/70 dark:text-[#F5F6F2]/70 leading-snug">
            Akses akun terdaftar untuk mengelola CV, lamaran, serta misimu.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-[10px] bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        {/* Credential Login Form */}
        <form onSubmit={handleCredentialLogin} className="flex flex-col gap-3.5 mb-4">
          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="login-email-input" className="text-[11px] font-bold uppercase tracking-wider text-[#101114] dark:text-[#F5F6F2]/80">
              Email
            </label>
            <input
              id="login-email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contoh: email@contoh.com"
              required
              className="w-full h-11 px-3.5 bg-white dark:bg-[#1E1E22] border-2 border-[#101114] dark:border-[#3F3F46] rounded-[10px] text-sm font-medium text-[#101114] dark:text-[#F5F6F2] outline-none focus:border-navy-700 focus:shadow-[2px_2px_0px_#101114] transition"
            />
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <div className="flex items-center justify-between">
              <label htmlFor="login-password-input" className="text-[11px] font-bold uppercase tracking-wider text-[#101114] dark:text-[#F5F6F2]/80">
                Kata Sandi
              </label>
            </div>
            <input
              id="login-password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full h-11 px-3.5 bg-white dark:bg-[#1E1E22] border-2 border-[#101114] dark:border-[#3F3F46] rounded-[10px] text-sm font-medium text-[#101114] dark:text-[#F5F6F2] outline-none focus:border-navy-700 focus:shadow-[2px_2px_0px_#101114] transition"
            />
          </div>

          {/* Remember Me / Auto Login Checkbox */}
          <div className="flex items-center justify-between py-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[#101114]/80 dark:text-[#F5F6F2]/80 font-medium">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-navy-700 border-[#101114] dark:border-[#3F3F46] focus:ring-navy-700 cursor-pointer"
              />
              <span>Ingat saya (Auto Login 30 hari)</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 mt-1 px-5 rounded-[10px] bg-[#101114] dark:bg-[#F5F6F2] text-[#F5F6F2] dark:text-[#101114] hover:bg-navy-700 dark:hover:bg-navy-700 dark:hover:text-white font-bold text-sm flex items-center justify-between transition-all duration-200 shadow-[3px_3px_0px_#101114] dark:shadow-[3px_3px_0px_#3F3F46] disabled:opacity-60 cursor-pointer"
          >
            <span>{isLoading ? 'Memeriksa Data...' : 'Masuk ke Akun'}</span>
            <span className="text-lg leading-none">↗</span>
          </button>
        </form>

        {/* Divider */}
        <div className="relative text-center my-3 text-xs font-semibold text-[#101114]/50 dark:text-[#F5F6F2]/50">
          <span className="bg-[#F5F6F2] dark:bg-[#18181B] px-3 relative z-10">atau</span>
          <div className="absolute inset-0 top-1/2 -translate-y-1/2 border-t border-[#101114]/15 dark:border-[#F5F6F2]/15" />
        </div>

        {/* Google OAuth Action */}
        <div className="flex flex-col gap-4 mb-2">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full min-h-[48px] px-5 py-2.5 rounded-[10px] border-2 border-navy-700 bg-navy-700 text-[#F5F6F2] hover:bg-[#F5F6F2] hover:text-navy-700 dark:hover:bg-[#101114] dark:hover:text-[#60A5FA] font-semibold text-sm flex items-center justify-between transition-all duration-250 hover:-translate-y-0.5 shadow-[3px_3px_0px_#101114] dark:shadow-[3px_3px_0px_#3F3F46] disabled:opacity-60 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              {isGoogleLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="bg-white rounded-full p-0.5 shrink-0">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.37 7.37 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.97 0 12s.45 3.85 1.24 5.42l4.04-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.63 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
              )}
              <span>{isGoogleLoading ? 'Memproses...' : 'Masuk dengan Google'}</span>
            </div>
            <span className="text-lg leading-none">↗</span>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3.5 text-center border-t border-[#101114]/15 dark:border-[#F5F6F2]/15">
          <p className="text-xs text-[#101114]/75 dark:text-[#F5F6F2]/75 m-0">
            Belum punya akun?{' '}
            <a
              href="http://localhost:4321/register"
              className="bg-transparent border-0 p-0 font-semibold text-navy-700 dark:text-[#60A5FA] cursor-pointer underline underline-offset-3 hover:text-[#101114] dark:hover:text-white"
            >
              Daftar Akun Baru ↗
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
