'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { setSessionCookie, getStoredSession } from '@/lib/auth';
import {
  Sun,
  Moon,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  RefreshCw,
  Mail,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import Image from 'next/image';
import { AuthReviewsCarousel } from '@/components/AuthReviewsCarousel';
import { OtpInput, type OtpStatus } from '@/components/ui/otp-input';
import { Field, Input } from '@/components/ui/field';
import { Button } from '@/components/ui/button';

export const RegisterView: React.FC = () => {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Stepper state: Step 1 (Biodata & Password) -> Step 2 (OTP Verification)
  const [step, setStep] = useState<1 | 2>(1);

  // Form input states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const handleTogglePassword = () => setShowPassword((prev) => !prev);
  const handleToggleConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

  // OTP state
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  // Countdown & resend timer
  const [countdown, setCountdown] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);

  // Loading & feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [hasError, setHasError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    setMounted(true);
    const existingSession = getStoredSession();
    if (existingSession && existingSession.email) {
      router.replace('/beranda');
    }
  }, [router]);

  // Countdown timer when OTP is sent
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpSent && countdown > 0) {
      setCanResend(false);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [otpSent, countdown]);

  const isDarkMode = resolvedTheme === 'dark';
  const toggleDarkMode = () => setTheme(isDarkMode ? 'light' : 'dark');
  const otpStatus: OtpStatus = isSuccess ? 'success' : hasError ? 'error' : 'idle';

  const triggerShake = (msg: string) => {
    setErrorMessage(msg);
    setSuccessMessage('');
    setHasError(true);
    setIsShaking(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsShaking(true);
      });
    });
  };

  // Step 1: Validasi data akun & Kirim OTP -> Pindah ke Step 2
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanFullName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanFullName) {
      triggerShake('Nama lengkap wajib diisi.');
      return;
    }

    if (!cleanEmail) {
      triggerShake('Alamat email wajib diisi.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      triggerShake('Format alamat email tidak valid.');
      return;
    }

    if (password.length < 6) {
      triggerShake('Kata sandi minimal 6 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      triggerShake('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsSendingOtp(true);
    setErrorMessage('');
    setSuccessMessage('');
    setHasError(false);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanFullName, email: cleanEmail }),
      });

      const result = await res.json().catch(() => null);

      if (!res.ok || !result?.success) {
        triggerShake(result?.message || `Gagal mengirim kode (${res.status}). Silakan coba lagi.`);
        setIsSendingOtp(false);
        return;
      }

      setOtpSent(true);
      setCountdown(60);
      setCanResend(false);
      setIsSendingOtp(false);
      setSuccessMessage('');
      setOtpCode('');
      setIsSuccess(false);
      setResendCount((prev) => prev + 1);
      setStep(2);
    } catch (err) {
      console.error('Send OTP error:', err);
      triggerShake('Terjadi kendala saat mengirim email verifikasi.');
      setIsSendingOtp(false);
    }
  };

  // Kirim Ulang OTP pada Step 2
  const handleResendOtp = async () => {
    if (!canResend || isSendingOtp) return;
    const cleanEmail = email.trim().toLowerCase();
    const cleanFullName = fullName.trim();

    setIsSendingOtp(true);
    setErrorMessage('');
    setSuccessMessage('');
    setHasError(false);
    setIsSuccess(false);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanFullName, email: cleanEmail }),
      });

      const result = await res.json().catch(() => null);

      if (!res.ok || !result?.success) {
        triggerShake(result?.message || `Gagal mengirim ulang kode (${res.status}).`);
        setIsSendingOtp(false);
        return;
      }

      setCountdown(60);
      setCanResend(false);
      setIsSendingOtp(false);
      setSuccessMessage('Kode verifikasi baru telah dikirim ke email kamu.');

      // Reset digit OTP
      setOtpCode('');
      setResendCount((prev) => prev + 1);
    } catch (err) {
      console.error('Resend OTP error:', err);
      triggerShake('Terjadi kendala saat mengirim ulang email verifikasi.');
      setIsSendingOtp(false);
    }
  };

  // Step 2: Submit Registrasi Lengkap (Nama + Email + Password + OTP)
  const handleStep2Submit = async (e?: React.FormEvent, customOtp?: string) => {
    if (e) e.preventDefault();

    const cleanFullName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const currentOtp = (customOtp !== undefined ? customOtp : otpCode).trim();

    if (currentOtp.length !== 6) {
      triggerShake('Masukkan 6 digit kode verifikasi yang telah dikirim ke email.');
      return;
    }

    if (isLoading) return;

    setErrorMessage('');
    setSuccessMessage('');
    setHasError(false);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanFullName,
          email: cleanEmail,
          password,
          otp: currentOtp,
        }),
      });

      const result = await res.json().catch(() => null);

      if (!res.ok || !result?.success) {
        triggerShake(result?.message || `Pendaftaran gagal (${res.status}).`);
        setIsLoading(false);
        return;
      }

      const userData = {
        id: result.data.id,
        name: result.data.name,
        email: result.data.email,
        role: result.data.role,
        onboarded: false,
      };

      setSessionCookie(userData, 30);
      localStorage.removeItem('employr_onboarding_completed');

      setIsSuccess(true);
      setSuccessMessage('Pendaftaran berhasil! Mengalihkan ke orientasi...');
      setTimeout(() => {
        router.push('/onboarding');
      }, 1000);
    } catch (err) {
      console.error('Registration submit error:', err);
      triggerShake('Terjadi kendala saat menghubungkan ke server.');
      setIsLoading(false);
    }
  };

  // Kembali ke Step 1 untuk ubah data
  const handleBackToStep1 = () => {
    setStep(1);
    setOtpCode('');
    setIsSuccess(false);
    setErrorMessage('');
    setSuccessMessage('');
    setHasError(false);
  };

  const handleGoogleRegister = () => {
    setIsGoogleLoading(true);
    window.location.href = '/api/auth/google?redirect=/onboarding';
  };

  return (
    <div className="min-h-full flex-1 w-full grid grid-cols-1 lg:grid-cols-2 bg-slate-50 dark:bg-slate-950 font-sans">
      {/* LEFT SIDE: Centered Register Card */}
      <div className="flex flex-col justify-between min-h-full p-6 sm:p-10 relative">
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

        {/* Centered Register Card */}
        <div className="w-full max-w-[400px] mx-auto my-auto py-6">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {step === 1 ? 'Buat Akun Baru' : 'Cek Email Kamu'}
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {step === 1
                ? 'Mulai racik CV profesional dan buka akses peluang kariermu.'
                : 'Masukkan 6 digit kode verifikasi yang telah kami kirimkan.'}
            </p>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div
              className={`mb-3.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs font-medium ${
                isShaking ? 'animate-bounce' : ''
              }`}
            >
              {errorMessage}
            </div>
          )}
          {successMessage && !errorMessage && (
            <div className="mb-3.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* STEP 1: FORM DATA AKUN */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="flex flex-col gap-3">
              {/* Input: Nama Lengkap */}
              <Field label="Nama Lengkap" required>
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (hasError) {
                      setHasError(false);
                      setErrorMessage('');
                    }
                  }}
                  placeholder="Contoh: Budi Santoso"
                  required
                  className="h-10 text-xs"
                />
              </Field>

              {/* Input: Email */}
              <Field label="Email" required>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (hasError) {
                      setHasError(false);
                      setErrorMessage('');
                    }
                  }}
                  placeholder="contoh: nama@email.com"
                  required
                  className="h-10 text-xs"
                />
              </Field>

              {/* Input: Kata Sandi */}
              <Field label="Kata Sandi" required>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (hasError) {
                        setHasError(false);
                        setErrorMessage('');
                      }
                    }}
                    placeholder="Minimal 6 karakter"
                    required
                    minLength={6}
                    className="h-10 pr-10 text-xs"
                  />
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleTogglePassword}
                    className="absolute right-0 top-0 bottom-0 w-11 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer z-20 select-none touch-manipulation [&_svg]:pointer-events-none"
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 pointer-events-none" /> : <Eye className="w-4 h-4 pointer-events-none" />}
                  </button>
                </div>
              </Field>

              {/* Input: Konfirmasi Kata Sandi */}
              <Field label="Konfirmasi Kata Sandi" required>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (hasError) {
                        setHasError(false);
                        setErrorMessage('');
                      }
                    }}
                    placeholder="Ulangi kata sandi"
                    required
                    minLength={6}
                    className="h-10 pr-10 text-xs"
                  />
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleToggleConfirmPassword}
                    className="absolute right-0 top-0 bottom-0 w-11 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer z-20 select-none touch-manipulation [&_svg]:pointer-events-none"
                    aria-label={showConfirmPassword ? 'Sembunyikan konfirmasi kata sandi' : 'Tampilkan konfirmasi kata sandi'}
                    aria-pressed={showConfirmPassword}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4 pointer-events-none" /> : <Eye className="w-4 h-4 pointer-events-none" />}
                  </button>
                </div>
              </Field>

              {/* Tombol Lanjut (Mengirim OTP) */}
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isSendingOtp}
                className="w-full mt-1.5 font-semibold text-xs flex items-center justify-center gap-2"
              >
                <span>Lanjut</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>

              {/* Divider */}
              <div className="relative text-center my-2">
                <div className="absolute inset-0 top-1/2 -translate-y-1/2 border-t border-slate-200 dark:border-slate-800" />
                <span className="relative bg-slate-50 dark:bg-slate-950 px-2.5 text-caption font-medium text-slate-500 dark:text-slate-500">
                  atau
                </span>
              </div>

              {/* Google OAuth Button */}
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleGoogleRegister}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-2.5 font-semibold text-xs"
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
              </Button>
            </form>
          )}

          {/* STEP 2: FORM VERIFIKASI OTP */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="flex flex-col gap-3.5">
              {/* Kartu Ringkasan Email */}
              <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/40 flex items-center justify-center text-cobalt-500 dark:text-blue-400 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-caption text-slate-500 dark:text-slate-400">
                      Kode dikirim ke:
                    </p>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {email}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleBackToStep1}
                  className="text-caption font-semibold text-cobalt-500 dark:text-blue-400 hover:underline shrink-0 cursor-pointer"
                >
                  Ubah
                </button>
              </div>

              {/* Kotak Input 6-Digit OTP */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-800/50">
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Kode Verifikasi (6 Digit)
                  </label>
                  <span className="text-caption font-mono text-slate-500 dark:text-slate-500">
                    Berlaku 5 menit
                  </span>
                </div>

                <div className="flex items-center justify-center py-2 overflow-x-auto">
                  <OtpInput
                    key={resendCount}
                    length={6}
                    value={otpCode}
                    onChange={(val) => {
                      setOtpCode(val);
                      if (hasError) {
                        setHasError(false);
                        setErrorMessage('');
                      }
                    }}
                    onComplete={(code) => {
                      handleStep2Submit(undefined, code);
                    }}
                    status={otpStatus}
                    disabled={isLoading || isSuccess}
                    autoFocus
                    size="md"
                    slotClassName="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>

                {/* Helper kirim ulang & petunjuk Spam/Junk (Opsi B) */}
                <div className="mt-3 pt-2.5 border-t border-blue-100/70 dark:border-blue-900/40 flex flex-col gap-1.5 text-caption">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>Tidak menerima kode?</span>
                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isSendingOtp || isSuccess}
                        className="font-bold text-cobalt-500 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {isSendingOtp ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3 h-3" />
                        )}
                        <span>Kirim ulang kode</span>
                      </button>
                    ) : (
                      <span className="font-mono text-slate-500 dark:text-slate-500">
                        Kirim ulang ({countdown}s)
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Cek juga folder <strong className="font-semibold text-slate-700 dark:text-slate-300">Spam</strong> atau <strong className="font-semibold text-slate-700 dark:text-slate-300">Junk</strong> jika belum masuk ke kotak masuk utama.
                  </p>
                </div>
              </div>

              {/* Tombol Aksi Step 2 */}
              <div className="flex flex-col gap-2 pt-1">
                <Button
                  type="submit"
                  disabled={isLoading || isSuccess}
                  className="w-full h-11"
                  variant="primary"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mendaftarkan akun...</span>
                    </>
                  ) : isSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Pendaftaran Berhasil!</span>
                    </>
                  ) : (
                    <>
                      <span>Verifikasi & Buat Akun</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  onClick={handleBackToStep1}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali</span>
                </Button>
              </div>
            </form>
          )}

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
        <div className="w-full text-center sm:text-left text-caption text-slate-500 dark:text-slate-600">
          © {new Date().getFullYear()} Employr
        </div>
      </div>

      {/* RIGHT SIDE: Video Background Panel */}
      <div className="hidden lg:flex flex-col justify-between min-h-full h-full p-12 xl:p-16 relative overflow-hidden bg-slate-950 text-white">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src="/video/login.webm"
        />

        {/* Gradient & Tint Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-[#1F3578]/50 to-slate-950/60 pointer-events-none" />

        {/* Top Tagline */}
        <div className="relative z-10 flex items-center gap-2.5 text-caption font-extrabold text-blue-200 uppercase tracking-[0.145em]">
          <span className="w-1.5 h-1.5 bg-blue-400 inline-block shrink-0" />
          <span>Bergabung dengan Ribuan Pencari Kerja</span>
        </div>

        {/* Large Headline */}
        <div className="relative z-10 my-auto max-w-lg">
          <h2 className="text-3xl xl:text-[2.65rem] font-semibold tracking-[-0.04em] leading-[1.08] text-white drop-shadow-sm">
            Langkah pertamamu,<br />
            <em className="font-serif italic font-normal text-white text-[1.12em] tracking-[-0.01em]">
              menuju karier impian.
            </em>
          </h2>
          <p className="mt-4 text-sm text-blue-100/90 leading-relaxed font-normal drop-shadow-sm max-w-md">
            Bikin CV standar ATS, analisis kecocokan kriteria loker, dan pantau lamaranmu dalam satu tempat.
          </p>
        </div>

        {/* Testimonial Review Carousel */}
        <AuthReviewsCarousel />
      </div>
    </div>
  );
};
