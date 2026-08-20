'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { setSessionCookie, getStoredSession } from '@/lib/auth';
import { Sun, Moon, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface LoginViewProps {}

export const LoginView: React.FC<LoginViewProps> = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams?.get('redirect') || '/beranda';

  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

      setSessionCookie(userData, 30);
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
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative font-sans">
      {/* Top Bar */}
      <div className="absolute top-5 right-5 z-10">
        {mounted && (
          <button
            type="button"
            onClick={toggleDarkMode}
            className="p-2 rounded-[10px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-[420px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-[10px] shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 p-7 sm:p-9 relative z-10">
        {/* Header */}
        <div className="text-center mb-7">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.webp"
              alt="Employr Logo"
              width={160}
              height={40}
              className="h-10 w-auto object-contain dark:brightness-0 dark:invert"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Masuk ke <span className="text-navy-700 dark:text-blue-400">Employr</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Akses akun terdaftar untuk mengelola CV, lamaran, serta misimu.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-[10px] bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-300 text-sm font-medium">
            {errorMessage}
          </div>
        )}

        {/* Credential Login Form */}
        <form onSubmit={handleCredentialLogin} className="flex flex-col gap-4 mb-5">
          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="login-email-input" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Email
            </label>
            <input
              id="login-email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contoh: email@contoh.com"
              required
              className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-[10px] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-navy-700 dark:focus:border-blue-500 focus:ring-2 focus:ring-navy-700/10 dark:focus:ring-blue-500/10 transition"
            />
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <div className="flex items-center justify-between">
              <label htmlFor="login-password-input" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Kata Sandi
              </label>
              <a
                href="/forgot-password"
                className="text-xs font-medium text-navy-700 dark:text-blue-400 hover:underline underline-offset-2"
              >
                Lupa sandi?
              </a>
            </div>
            <input
              id="login-password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-[10px] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-navy-700 dark:focus:border-blue-500 focus:ring-2 focus:ring-navy-700/10 dark:focus:ring-blue-500/10 transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 mt-1 rounded-[10px] bg-navy-700 hover:bg-navy-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-md shadow-navy-700/20 dark:shadow-blue-600/20 disabled:opacity-60 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>Masuk ke Akun</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative text-center my-5">
          <div className="absolute inset-0 top-1/2 -translate-y-1/2 border-t border-slate-200 dark:border-slate-800" />
          <span className="relative bg-white/80 dark:bg-slate-900/80 px-3 text-xs font-medium text-slate-400 dark:text-slate-500">
            atau
          </span>
        </div>

        {/* Google OAuth */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
          className="w-full h-11 rounded-[10px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-60 cursor-pointer"
        >
          {isGoogleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.37 7.37 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.97 0 12s.45 3.85 1.24 5.42l4.04-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.63 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Masuk dengan Google</span>
            </>
          )}
        </button>

        {/* Footer */}
        <div className="mt-6 pt-5 text-center border-t border-slate-200/80 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Belum punya akun?{' '}
            <a
              href="/register"
              className="font-semibold text-navy-700 dark:text-blue-400 hover:underline underline-offset-2"
            >
              Daftar Akun Baru
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
