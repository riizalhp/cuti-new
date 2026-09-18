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

export const RegisterView: React.FC = () => {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Stepper state: Step 1 (Biodata & Password) -> Step 2 (OTP Verification)
  const [step, setStep] = useState<1 | 2>(1);

  // Form input states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP 6-digit state
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanFirstName) {
      triggerShake('Nama depan wajib diisi.');
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

    const fullName = cleanLastName ? `${cleanFirstName} ${cleanLastName}` : cleanFirstName;

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullName, email: cleanEmail }),
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
      setSuccessMessage('Kode verifikasi 6-digit telah dikirim ke email kamu.');
      setStep(2);

      // Auto-focus ke kotak OTP pertama
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 200);
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
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const fullName = cleanLastName ? `${cleanFirstName} ${cleanLastName}` : cleanFirstName;

    setIsSendingOtp(true);
    setErrorMessage('');
    setSuccessMessage('');
    setHasError(false);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullName, email: cleanEmail }),
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

      // Reset digit OTP dan fokus ke kotak pertama
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      console.error('Resend OTP error:', err);
      triggerShake('Terjadi kendala saat mengirim ulang email verifikasi.');
      setIsSendingOtp(false);
    }
  };

  // Step 2: Submit Registrasi Lengkap (Nama + Email + Password + OTP)
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const otpCode = otp.join('').trim();
    const fullName = cleanLastName ? `${cleanFirstName} ${cleanLastName}` : cleanFirstName;

    if (otpCode.length !== 6) {
      triggerShake('Masukkan 6 digit kode verifikasi yang telah dikirim ke email.');
      otpInputRefs.current[Math.min(otpCode.length, 5)]?.focus();
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setHasError(false);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email: cleanEmail,
          password,
          otp: otpCode,
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

      setSuccessMessage('Pendaftaran berhasil! Mengalihkan ke orientasi...');
      router.push('/onboarding');
    } catch (err) {
      console.error('Registration submit error:', err);
      triggerShake('Terjadi kendala saat menghubungkan ke server.');
      setIsLoading(false);
    }
  };

  // Kembali ke Step 1 untuk ubah data
  const handleBackToStep1 = () => {
    setStep(1);
    setErrorMessage('');
    setSuccessMessage('');
    setHasError(false);
  };

  // Handle kotak input OTP
  const handleOtpChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, '');
    if (!cleanVal) {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    const lastDigit = cleanVal.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = lastDigit;
    setOtp(newOtp);
    setHasError(false);
    setErrorMessage('');

    if (index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || '';
    }
    setOtp(newOtp);
    setHasError(false);
    setErrorMessage('');

    const nextIndex = Math.min(pastedData.length, 5);
    otpInputRefs.current[nextIndex]?.focus();
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

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-slate-50 dark:bg-slate-950 font-sans">
      {/* LEFT SIDE: Centered Register Card */}
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

        {/* Centered Register Card */}
        <div className="w-full max-w-[400px] mx-auto my-auto py-6">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Buat Akun Baru
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Mulai racik CV profesional dan buka akses peluang kariermu.
            </p>
          </div>

          {/* Stepper Progress Indicator */}
          <div className="flex items-center justify-between mb-4 p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70">
            <div className="flex items-center gap-2">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                  step === 1
                    ? 'bg-navy-700 dark:bg-blue-600 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {step === 2 ? <CheckCircle2 className="w-3.5 h-3.5" /> : '1'}
              </div>
              <span
                className={`text-[11px] ${
                  step === 1
                    ? 'font-bold text-slate-900 dark:text-white'
                    : 'font-medium text-slate-500 dark:text-slate-400'
                }`}
              >
                Data Akun
              </span>
            </div>

            <div className="flex-1 mx-3 h-0.5 bg-slate-200 dark:bg-slate-800 relative rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-navy-700 dark:bg-blue-600 transition-all duration-300"
                style={{ width: step === 2 ? '100%' : '0%' }}
              />
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                  step === 2
                    ? 'bg-navy-700 dark:bg-blue-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                2
              </div>
              <span
                className={`text-[11px] ${
                  step === 2
                    ? 'font-bold text-slate-900 dark:text-white'
                    : 'font-medium text-slate-500 dark:text-slate-400'
                }`}
              >
                Verifikasi OTP
              </span>
            </div>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div
              className={`mb-3.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-300 text-xs font-medium ${
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
              {/* Input: Nama Depan dan Nama Belakang (2 Kolom) */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex flex-col gap-1 text-left">
                  <label
                    htmlFor="register-firstname-input"
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Nama Depan
                  </label>
                  <input
                    id="register-firstname-input"
                    type="text"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      if (hasError) {
                        setHasError(false);
                        setErrorMessage('');
                      }
                    }}
                    placeholder="Nama depan"
                    required
                    className="w-full h-10 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-navy-700 dark:focus:border-blue-500 focus:ring-2 focus:ring-navy-700/10 dark:focus:ring-blue-500/10"
                  />
                </div>

                <div className="flex flex-col gap-1 text-left">
                  <label
                    htmlFor="register-lastname-input"
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Nama Belakang
                  </label>
                  <input
                    id="register-lastname-input"
                    type="text"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      if (hasError) {
                        setHasError(false);
                        setErrorMessage('');
                      }
                    }}
                    placeholder="Nama belakang"
                    className="w-full h-10 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-navy-700 dark:focus:border-blue-500 focus:ring-2 focus:ring-navy-700/10 dark:focus:ring-blue-500/10"
                  />
                </div>
              </div>

              {/* Input: Email */}
              <div className="flex flex-col gap-1 text-left">
                <label
                  htmlFor="register-email-input"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Email
                </label>
                <input
                  id="register-email-input"
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
                  className="w-full h-10 px-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-navy-700 dark:focus:border-blue-500 focus:ring-2 focus:ring-navy-700/10 dark:focus:ring-blue-500/10"
                />
              </div>

              {/* Input: Kata Sandi */}
              <div className="flex flex-col gap-1 text-left">
                <label
                  htmlFor="register-password-input"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    id="register-password-input"
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
                    className="w-full h-10 pl-3.5 pr-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-navy-700 dark:focus:border-blue-500 focus:ring-2 focus:ring-navy-700/10 dark:focus:ring-blue-500/10"
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

              {/* Input: Konfirmasi Kata Sandi */}
              <div className="flex flex-col gap-1 text-left">
                <label
                  htmlFor="register-confirm-password-input"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Konfirmasi Kata Sandi
                </label>
                <div className="relative">
                  <input
                    id="register-confirm-password-input"
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
                    className="w-full h-10 pl-3.5 pr-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-navy-700 dark:focus:border-blue-500 focus:ring-2 focus:ring-navy-700/10 dark:focus:ring-blue-500/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                    aria-label={showConfirmPassword ? 'Sembunyikan konfirmasi kata sandi' : 'Tampilkan konfirmasi kata sandi'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Tombol Lanjut (Mengirim OTP) */}
              <button
                type="submit"
                disabled={isSendingOtp}
                className="w-full h-11 mt-1.5 rounded-xl bg-navy-700 hover:bg-navy-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition shadow-sm shadow-navy-700/20 dark:shadow-blue-600/20 disabled:opacity-60 cursor-pointer"
              >
                {isSendingOtp ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengirim kode verifikasi...</span>
                  </>
                ) : (
                  <>
                    <span>Lanjut</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative text-center my-2">
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
            </form>
          )}

          {/* STEP 2: FORM VERIFIKASI OTP */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="flex flex-col gap-3.5">
              {/* Kartu Ringkasan Email */}
              <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/40 flex items-center justify-center text-[#1738D1] dark:text-blue-400 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
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
                  className="text-[11px] font-semibold text-[#1738D1] dark:text-blue-400 hover:underline shrink-0 cursor-pointer"
                >
                  Ubah
                </button>
              </div>

              {/* Kotak Input 6-Digit OTP */}
              <div className="p-3.5 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-800/50">
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Kode Verifikasi (6 Digit)
                  </label>
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                    Berlaku 5 menit
                  </span>
                </div>

                <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      placeholder="•"
                      className={`w-10 h-11 sm:w-11 sm:h-12 text-center text-lg font-mono font-bold bg-white dark:bg-slate-900 border rounded-xl outline-none transition ${
                        hasError
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                          : digit
                          ? 'border-navy-700 dark:border-blue-500 ring-1 ring-navy-700/20 dark:ring-blue-500/20 text-navy-700 dark:text-blue-400'
                          : 'border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-navy-700 dark:focus:border-blue-500 focus:ring-2 focus:ring-navy-700/10'
                      }`}
                    />
                  ))}
                </div>

                {/* Helper kirim ulang */}
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Tidak menerima kode?</span>
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isSendingOtp}
                      className="font-bold text-[#1738D1] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {isSendingOtp ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3 h-3" />
                      )}
                      <span>Kirim ulang kode</span>
                    </button>
                  ) : (
                    <span className="font-mono text-slate-400 dark:text-slate-500">
                      Kirim ulang ({countdown}s)
                    </span>
                  )}
                </div>
              </div>

              {/* Tombol Aksi Step 2 */}
              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-xl bg-navy-700 hover:bg-navy-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition shadow-sm shadow-navy-700/20 dark:shadow-blue-600/20 disabled:opacity-60 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mendaftarkan akun...</span>
                    </>
                  ) : (
                    <span>Daftar Akun Baru</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBackToStep1}
                  disabled={isLoading}
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-300 font-medium text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke Data Akun</span>
                </button>
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
        <div className="w-full text-center sm:text-left text-[11px] text-slate-400 dark:text-slate-600">
          © {new Date().getFullYear()} Employr
        </div>
      </div>

      {/* RIGHT SIDE: Video Background Panel */}
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

        {/* Gradient & Tint Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-[#1F3578]/50 to-slate-950/60 pointer-events-none" />

        {/* Top Tagline */}
        <div className="relative z-10 flex items-center gap-2.5 text-[10px] font-extrabold text-blue-200 uppercase tracking-[0.145em]">
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
            Akses pembuat CV lolos ATS, analisis kecocokan lowongan, latihan interview, dan pelacak lamaran terintegrasi.
          </p>
        </div>

        {/* Testimonial Review Carousel */}
        <AuthReviewsCarousel />
      </div>
    </div>
  );
};
