'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { setSessionCookie, getStoredSession } from '@/lib/auth';
import { Sun, Moon, Loader2, Eye, EyeOff, Sparkles } from 'lucide-react';
import Image from 'next/image';

export const RegisterView: React.FC = () => {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasError, setHasError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    setMounted(true);
    const existingSession = getStoredSession();
    if (existingSession && existingSession.email) {
      router.replace('/beranda');
    }
  }, [router]);

  const isDarkMode = resolvedTheme === 'dark';
  const toggleDarkMode = () => setTheme(isDarkMode ? 'light' : 'dark');

  const triggerShake = (msg: string) => {
    setErrorMessage(msg);
    setHasError(true);
    setIsShaking(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsShaking(true);
      });
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setHasError(false);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      let result: any = null;
      try {
        result = await res.json();
      } catch (parseErr) {
        console.error('Gagal membaca response JSON:', parseErr);
      }

      if (!res.ok || !result?.success) {
        triggerShake(result?.message || `Terjadi kendala (${res.status}). Silakan coba beberapa saat lagi.`);
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
      router.push('/onboarding');
    } catch (err) {
      console.error('Registration error:', err);
      triggerShake('Terjadi kendala saat menghubungkan ke server.');
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    setIsGoogleLoading(true);
    const googleUser = {
      name: 'Google User',
      email: 'user@gmail.com',
      role: 'USER',
      provider: 'google',
    };

    setSessionCookie(googleUser, 30);
    router.push('/onboarding');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (hasError) {
      setHasError(false);
      setErrorMessage('');
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (hasError) {
      setHasError(false);
      setErrorMessage('');
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (hasError) {
      setHasError(false);
      setErrorMessage('');
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-slate-50 dark:bg-slate-950 font-sans">
      {/* LEFT SIDE: Centered Register Card (~360px wide) */}
      <div className="flex flex-col justify-between min-h-screen p-6 sm:p-10 relative">
        {/* Top bar with logo and theme toggle */}
        <div className="flex items-center justify-between w-full">
          <a href="/" className="inline-block" aria-label="Beranda Employr">
            <Image
              src="/logo.webp"
              alt="Employr"
              width={120}
              height={32}
              className="h-7 w-auto object-contain dark:brightness-0 dark:invert"
              priority
            />
          </a>
          {mounted && (
            <button
              type="button"
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Centered Register Card (~360px) */}
        <div className="w-full max-w-[360px] mx-auto my-auto py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Buat Akun Baru
            </h1>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              Mulai racik CV profesional dan buka akses peluang kariermu.
            </p>
          </div>

          {/* Error Alert with Transitions.dev Shake */}
          <div className={`t-input-wrap ${hasError ? 'is-error' : ''}`}>
            <div className={`t-input ${hasError ? 'is-error' : ''} ${isShaking ? 'is-shaking' : ''}`}>
              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-300 text-xs font-medium">
                  {errorMessage}
                </div>
              )}
            </div>
          </div>

          {/* Register Form */}
          <form onSubmit={handleRegister} className="flex flex-col gap-3.5">
            <div className={`t-input-wrap ${hasError ? 'is-error' : ''}`}>
              <div className="flex flex-col gap-1.5 text-left">
                <label htmlFor="register-name-input" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nama Lengkap
                </label>
                <input
                  id="register-name-input"
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  placeholder="Nama Lengkap Anda"
                  required
                  onAnimationEnd={() => setIsShaking(false)}
                  className={`w-full h-10 px-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-navy-700 dark:focus:border-blue-500 focus:ring-2 focus:ring-navy-700/10 dark:focus:ring-blue-500/10 t-input ${hasError ? 'is-error' : ''} ${isShaking ? 'is-shaking' : ''}`}
                />
              </div>
            </div>

            <div className={`t-input-wrap ${hasError ? 'is-error' : ''}`}>
              <div className="flex flex-col gap-1.5 text-left">
                <label htmlFor="register-email-input" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email
                </label>
                <input
                  id="register-email-input"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="contoh: email@contoh.com"
                  required
                  onAnimationEnd={() => setIsShaking(false)}
                  className={`w-full h-10 px-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-navy-700 dark:focus:border-blue-500 focus:ring-2 focus:ring-navy-700/10 dark:focus:ring-blue-500/10 t-input ${hasError ? 'is-error' : ''} ${isShaking ? 'is-shaking' : ''}`}
                />
              </div>
            </div>

            <div className={`t-input-wrap ${hasError ? 'is-error' : ''}`}>
              <div className="flex flex-col gap-1.5 text-left">
                <label htmlFor="register-password-input" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Kata Sandi
                </label>
                <div className={`relative t-input rounded-xl ${hasError ? 'is-error' : ''} ${isShaking ? 'is-shaking' : ''}`} onAnimationEnd={() => setIsShaking(false)}>
                  <input
                    id="register-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Minimal 6 karakter"
                    required
                    minLength={6}
                    className={`w-full h-10 pl-3.5 pr-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-navy-700 dark:focus:border-blue-500 focus:ring-2 focus:ring-navy-700/10 dark:focus:ring-blue-500/10 ${hasError ? 'border-rose-500 dark:border-rose-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 mt-1 rounded-xl bg-navy-700 hover:bg-navy-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition shadow-sm shadow-navy-700/20 dark:shadow-blue-600/20 disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>Daftar Akun Baru</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative text-center my-4">
            <div className="absolute inset-0 top-1/2 -translate-y-1/2 border-t border-slate-200 dark:border-slate-800" />
            <span className="relative bg-slate-50 dark:bg-slate-950 px-2.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">
              atau
            </span>
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={isGoogleLoading}
            className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-2.5 transition disabled:opacity-60 cursor-pointer"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.37 7.37 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.97 0 12s.45 3.85 1.24 5.42l4.04-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.63 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Daftar dengan Google</span>
              </>
            )}
          </button>

          {/* Sign In Link */}
          <div className="mt-5 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sudah punya akun?{' '}
              <a
                href="/login"
                className="font-semibold text-navy-700 dark:text-blue-400 hover:underline underline-offset-2"
              >
                Masuk di sini
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full text-center sm:text-left text-[11px] text-slate-400 dark:text-slate-600">
          © {new Date().getFullYear()} Employr · Career Operating System
        </div>
      </div>

      {/* RIGHT SIDE: Video Background Panel (Hidden below lg) */}
      <div className="hidden lg:flex flex-col justify-between p-12 xl:p-16 relative overflow-hidden bg-slate-950 text-white">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src="/video/login.webm"
        />

        {/* Gradient & Tint Overlay for readability and brand aesthetics */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-[#1F3578]/50 to-slate-950/60 pointer-events-none" />

        {/* Top Tagline */}
        <div className="relative z-10 flex items-center gap-2 text-xs font-semibold text-blue-200/90 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-blue-300" />
          <span>Bergabung dengan Ribuan Pencari Kerja</span>
        </div>

        {/* Large Headline */}
        <div className="relative z-10 my-auto max-w-lg">
          <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight text-white drop-shadow-sm">
            Langkah pertamamu menuju karier impian dimulai di sini.
          </h2>
          <p className="mt-4 text-sm text-blue-100/90 leading-relaxed font-normal drop-shadow-sm">
            Akses pembuat CV lolos ATS, analisis kecocokan lowongan, latihan interview, dan pelacak lamaran terintegrasi.
          </p>
        </div>

        {/* Info Card */}
        <div className="relative z-10 p-5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/15 max-w-md shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-400 border-2 border-navy-700 flex items-center justify-center font-bold text-[10px] text-navy-950">A</div>
              <div className="w-8 h-8 rounded-full bg-orange-400 border-2 border-navy-700 flex items-center justify-center font-bold text-[10px] text-navy-950">B</div>
              <div className="w-8 h-8 rounded-full bg-emerald-400 border-2 border-navy-700 flex items-center justify-center font-bold text-[10px] text-navy-950">C</div>
            </div>
            <div>
              <p className="text-xs font-semibold text-white">10.000+ Pengguna Aktif</p>
              <p className="text-[11px] text-blue-200/90">Meningkatkan peluang kerja hingga 3x lipat</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
