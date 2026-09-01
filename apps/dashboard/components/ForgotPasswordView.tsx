'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Sun,
  Moon,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import { DotLottiePlayer } from '@/components/DotLottiePlayer';

interface ForgotPasswordViewProps {}

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = () => {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // OTP Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, countdown]);

  const isDarkMode = resolvedTheme === 'dark';
  const toggleDarkMode = () => setTheme(isDarkMode ? 'light' : 'dark');

  // Handle Step 1: Submit Email
  const handleSendResetCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !email.includes('@')) {
      setErrorMessage('Harap masukkan alamat email yang valid.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
      setCountdown(60);
      setCanResend(false);
    }, 600);
  };

  // Handle OTP Input Change
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    const updatedOtp = [...otpCode];
    updatedOtp[index] = value;
    setOtpCode(updatedOtp);

    // Auto focus to next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Auto fill demo OTP code
  const handleAutoFillDemoOtp = () => {
    setOtpCode(['1', '2', '3', '4', '5', '6']);
  };

  // Handle Step 2: Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const fullCode = otpCode.join('');
    if (fullCode.length < 6) {
      setErrorMessage('Harap masukkan 6 digit kode verifikasi.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
    }, 600);
  };

  // Handle Resend OTP
  const handleResendCode = () => {
    if (!canResend) return;
    setCanResend(false);
    setCountdown(60);
    setOtpCode(['', '', '', '', '', '']);
    setErrorMessage('');
  };

  // Password Strength Calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const passwordScore = getPasswordStrength(newPassword);

  // Handle Step 3: Save New Password
  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (newPassword.length < 8) {
      setErrorMessage('Kata sandi baru minimal harus 8 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(4);
    }, 800);
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

      {/* Main Card */}
      <div className="w-full max-w-[420px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-[10px] shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 p-7 sm:p-9 relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight flex items-center justify-center gap-2.5">
            <span>Atur Ulang</span>
            <Image
              src="/logo.webp"
              alt="Logo"
              width={140}
              height={36}
              className="h-7 sm:h-8 w-auto object-contain dark:brightness-0 dark:invert inline-block"
              priority
            />
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {step === 1 && 'Masukkan email terdaftar untuk menerima kode verifikasi pemulihan.'}
            {step === 2 && `Masukkan 6 digit kode yang dikirim ke email kamu.`}
            {step === 3 && 'Buat kata sandi baru untuk mengamankan akun kamu.'}
            {step === 4 && 'Kata sandi akun kamu telah berhasil diperbarui.'}
          </p>
        </div>

        {/* Step Indicator Bar */}
        {step < 4 && (
          <div className="flex items-center justify-center gap-1.5 mb-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-10 bg-navy-700 dark:bg-blue-500'
                    : s < step
                    ? 'w-6 bg-emerald-500'
                    : 'w-6 bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-[10px] bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-300 text-sm font-medium">
            {errorMessage}
          </div>
        )}

        {/* STEP 1: EMAIL INPUT */}
        {step === 1 && (
          <form onSubmit={handleSendResetCode} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="reset-email-input" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Email Terdaftar
              </label>
              <input
                id="reset-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contoh: email@contoh.com"
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
                <span>Kirim Kode Verifikasi</span>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: VERIFY OTP CODE */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2 text-center">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Kode verifikasi telah dikirim ke <strong className="text-slate-800 dark:text-slate-200">{email}</strong>
              </span>

              <div className="flex items-center justify-center gap-2 mt-1">
                {otpCode.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-10 sm:w-11 h-12 text-center font-bold text-lg rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:border-navy-700 dark:focus:border-blue-500 focus:ring-2 focus:ring-navy-700/10 dark:focus:ring-blue-500/10 focus:outline-none transition"
                  />
                ))}
              </div>

              {/* Demo Auto-Fill Shortcut */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={handleAutoFillDemoOtp}
                  className="text-xs text-navy-700 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Isi kode demo (123456)</span>
                </button>

                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendCode}
                      className="text-navy-700 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                    >
                      Kirim ulang
                    </button>
                  ) : (
                    <span>{countdown}s</span>
                  )}
                </span>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="h-11 px-4 rounded-[10px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm transition cursor-pointer"
              >
                Ubah Email
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 h-11 rounded-[10px] bg-navy-700 hover:bg-navy-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-md shadow-navy-700/20 dark:shadow-blue-600/20 disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Verifikasi Kode</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: CREATE NEW PASSWORD */}
        {step === 3 && (
          <form onSubmit={handleSaveNewPassword} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="reset-new-password" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Kata Sandi Baru
              </label>
              <div className="relative">
                <input
                  id="reset-new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  required
                  minLength={8}
                  className="w-full h-11 pl-4 pr-11 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-[10px] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-navy-700 dark:focus:border-blue-500 focus:ring-2 focus:ring-navy-700/10 dark:focus:ring-blue-500/10 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer rounded-md focus:outline-none focus:ring-2 focus:ring-navy-700/20 dark:focus:ring-blue-500/20"
                  aria-label={showNewPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Kekuatan Sandi:</span>
                  <span className={`font-semibold ${
                    passwordScore <= 1
                      ? 'text-rose-500 dark:text-rose-400'
                      : passwordScore === 2 || passwordScore === 3
                      ? 'text-amber-500 dark:text-amber-400'
                      : 'text-emerald-500 dark:text-emerald-400'
                  }`}>
                    {passwordScore <= 1
                      ? 'Lemah'
                      : passwordScore === 2 || passwordScore === 3
                      ? 'Sedang'
                      : 'Sangat Kuat'}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden flex gap-1">
                  <div className={`h-full flex-1 rounded-full ${passwordScore >= 1 ? 'bg-navy-700 dark:bg-blue-500' : 'bg-transparent'}`} />
                  <div className={`h-full flex-1 rounded-full ${passwordScore >= 2 ? 'bg-navy-700 dark:bg-blue-500' : 'bg-transparent'}`} />
                  <div className={`h-full flex-1 rounded-full ${passwordScore >= 3 ? 'bg-emerald-500' : 'bg-transparent'}`} />
                  <div className={`h-full flex-1 rounded-full ${passwordScore >= 4 ? 'bg-emerald-400' : 'bg-transparent'}`} />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="reset-confirm-password" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Konfirmasi Kata Sandi Baru
              </label>
              <div className="relative">
                <input
                  id="reset-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  required
                  className="w-full h-11 pl-4 pr-11 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-[10px] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-navy-700 dark:focus:border-blue-500 focus:ring-2 focus:ring-navy-700/10 dark:focus:ring-blue-500/10 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer rounded-md focus:outline-none focus:ring-2 focus:ring-navy-700/20 dark:focus:ring-blue-500/20"
                  aria-label={showConfirmPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 mt-1 rounded-[10px] bg-navy-700 hover:bg-navy-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-md shadow-navy-700/20 dark:shadow-blue-600/20 disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>Simpan Kata Sandi Baru</span>
              )}
            </button>
          </form>
        )}

        {/* STEP 4: SUCCESS CONGRATS */}
        {step === 4 && (
          <div className="text-center space-y-4 py-2">
            <div className="w-24 h-24 mx-auto flex items-center justify-center">
              <DotLottiePlayer
                src="/animations/profile-ready.json"
                autoplay={true}
                loop={false}
                className="w-24 h-24 mx-auto"
                fallback={
                  <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                }
              />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Kata Sandi Berhasil Diperbarui
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Akun kamu kini sudah aman. Silakan masuk kembali dengan kata sandi baru.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push('/login')}
              className="w-full h-11 rounded-[10px] bg-navy-700 hover:bg-navy-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-md shadow-navy-700/20 dark:shadow-blue-600/20 cursor-pointer"
            >
              <span>Masuk ke Akun Sekarang</span>
            </button>
          </div>
        )}

        {/* Footer */}
        {step !== 4 && (
          <div className="mt-6 pt-5 text-center border-t border-slate-200/80 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Ingat kata sandi kamu?{' '}
              <Link
                href="/login"
                className="font-semibold text-navy-700 dark:text-blue-400 hover:underline underline-offset-2"
              >
                Kembali ke Login
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
