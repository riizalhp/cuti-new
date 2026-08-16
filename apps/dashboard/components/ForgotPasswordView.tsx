'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Mail,
  Lock,
  KeyRound,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw,
  HelpCircle,
  Check,
  Building2,
  LockKeyhole,
  Clock,
} from 'lucide-react';

interface ForgotPasswordViewProps {}

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = () => {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  const toggleDarkMode = () => setTheme(isDarkMode ? 'light' : 'dark');
  const onBackToLogin = () => router.push('/login');
  const onResetSuccessLogin = (email: string) => router.push('/login');

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState('andi.pratama@email.com');
  const [otpCode, setOtpCode] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

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
    }, 800);
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
    }, 800);
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
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-[#0D3BD9]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-[#0D3BD9]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-10 w-64 h-64 bg-[#0D3BD9]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header Navigation */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-[#0D3BD9] flex items-center justify-center font-black text-white text-lg shadow-lg">
            C
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white block">
              CUTI <span className="text-[#0D3BD9]">AI</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">
              Pusat Keamanan & Reset Akun
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {toggleDarkMode && (
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-[10px] bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition flex items-center gap-2"
            >
              {isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
            </button>
          )}

          <button
            onClick={onBackToLogin}
            className="px-4 py-2.5 rounded-[10px] bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 transition flex items-center gap-2 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-violet-400" />
            <span>Kembali ke Login</span>
          </button>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-slate-900/90 border border-slate-800 rounded-[10px] shadow-2xl overflow-hidden relative z-10 backdrop-blur-xl mt-16 mb-8">
        
        {/* Left Side: Security Guidance & Info */}
        <div className="lg:col-span-5 bg-gradient-to-br from-violet-950 via-slate-900 to-slate-950 p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 relative">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] text-xs font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
              <span>Verifikasi Aman 256-bit</span>
            </span>

            <h2 className="text-2xl font-black text-white leading-tight">
              Pemulihan Akses Akun CUTI AI
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed">
              Kami memprioritaskan keamanan data portofolio karir, riwayat lamaran, dan analisis CV kamu.
            </p>

            {/* Stepper Progress Indicator */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs transition-colors ${
                    step >= 1
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {step > 1 ? <Check className="w-4 h-4" /> : '1'}
                </div>
                <div>
                  <p className={`text-xs font-bold ${step >= 1 ? 'text-white' : 'text-slate-500'}`}>
                    Input Email
                  </p>
                  <p className="text-[10px] text-slate-400">Email terdaftar pada sistem</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs transition-colors ${
                    step >= 2
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {step > 2 ? <Check className="w-4 h-4" /> : '2'}
                </div>
                <div>
                  <p className={`text-xs font-bold ${step >= 2 ? 'text-white' : 'text-slate-500'}`}>
                    Verifikasi Kode OTP
                  </p>
                  <p className="text-[10px] text-slate-400">Kode 6 digit dikirim ke inbox</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs transition-colors ${
                    step >= 3
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {step > 3 ? <Check className="w-4 h-4" /> : '3'}
                </div>
                <div>
                  <p className={`text-xs font-bold ${step >= 3 ? 'text-white' : 'text-slate-500'}`}>
                    Buat Password Baru
                  </p>
                  <p className="text-[10px] text-slate-400">Minimal 8 karakter kombinasi</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs transition-colors ${
                    step === 4
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {step === 4 ? <Check className="w-4 h-4" /> : '4'}
                </div>
                <div>
                  <p className={`text-xs font-bold ${step === 4 ? 'text-emerald-400' : 'text-slate-500'}`}>
                    Selesai
                  </p>
                  <p className="text-[10px] text-slate-400">Akses akun kembali aktif</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice Footer */}
          <div className="pt-6 border-t border-slate-800/80 mt-6 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <LockKeyhole className="w-4 h-4" />
              <span>Tips Keamanan Sandi</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Jangan membagikan kode OTP atau kata sandi kamu kepada siapa pun. Tim CUTI AI tidak pernah meminta kata sandi rahasia melalui telepon atau email.
            </p>
          </div>
        </div>

        {/* Right Side: Step-by-Step Forms */}
        <div className="lg:col-span-7 p-6 sm:p-8 md:p-10 flex flex-col justify-center">
          
          {/* STEP 1: EMAIL INPUT */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <div className="w-12 h-12 rounded-[10px] bg-violet-600/20 border border-violet-500/30 text-violet-400 flex items-center justify-center mb-4">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-white">
                  Lupa Kata Sandi?
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Masukkan email akun kamu di bawah ini untuk menerima instruksi pemulihan kata sandi.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-[10px] bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSendResetCode} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">
                    Alamat Email Terdaftar *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="andi.pratama@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-[10px] border border-slate-700 bg-slate-800/80 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-[10px] bg-violet-950/50 border border-violet-800/40 text-xs text-violet-200 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    Sistem akan secara otomatis mengirimkan kode verifikasi 6-digit rahasia ke alamat email di atas.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-[10px] bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs transition shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Kirim Kode Verifikasi OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-4 border-t border-slate-800 text-center">
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="text-xs font-bold text-slate-400 hover:text-white transition inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke Halaman Login</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: VERIFY OTP CODE */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <div className="w-12 h-12 rounded-[10px] bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-white">
                  Verifikasi Kode OTP
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Kode 6-digit verifikasi telah dikirimkan ke <span className="text-amber-300 font-bold">{email}</span>.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-[10px] bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Demo Auto-Fill Shortcut */}
              <div className="p-3 rounded-[10px] bg-slate-800/80 border border-slate-700 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Ingin isi otomatis kode demo?</span>
                </div>
                <button
                  type="button"
                  onClick={handleAutoFillDemoOtp}
                  className="px-3 py-1 rounded-[10px] bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition"
                >
                  Isi (123456)
                </button>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block text-center">
                    Masukkan 6 Digit Kode OTP
                  </label>
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
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
                        className="w-10 h-12 sm:w-12 sm:h-14 text-center font-black text-lg sm:text-xl rounded-[10px] border border-slate-700 bg-slate-800/90 text-amber-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500 focus:outline-none transition"
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Tidak menerima kode?</span>
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendCode}
                      className="font-bold text-violet-400 hover:text-violet-300 hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Kirim Ulang Kode</span>
                    </button>
                  ) : (
                    <span className="font-semibold text-slate-500">
                      Kirim ulang dalam <strong className="text-slate-300">{countdown}s</strong>
                    </span>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 rounded-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition border border-slate-700"
                  >
                    Ubah Email
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-2 py-3 rounded-[10px] bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs transition shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Verifikasi Kode</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: CREATE NEW PASSWORD */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <div className="w-12 h-12 rounded-[10px] bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-white">
                  Buat Kata Sandi Baru
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Amankan akun kamu dengan kata sandi baru yang belum pernah digunakan sebelumnya.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-[10px] bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSaveNewPassword} className="space-y-4">
                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">
                    Kata Sandi Baru *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimal 8 karakter"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 text-xs rounded-[10px] border border-slate-700 bg-slate-800/80 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Strength Bar */}
                {newPassword && (
                  <div className="p-3 rounded-[10px] bg-slate-800/60 border border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">Kekuatan Kata Sandi:</span>
                      <span className={`font-bold ${
                        passwordScore <= 1
                          ? 'text-rose-400'
                          : passwordScore === 2 || passwordScore === 3
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}>
                        {passwordScore <= 1
                          ? 'Lemah'
                          : passwordScore === 2 || passwordScore === 3
                          ? 'Sedang / Cukup'
                          : 'Sangat Kuat'}
                      </span>
                    </div>

                    <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden flex gap-1">
                      <div className={`h-full flex-1 rounded-full ${passwordScore >= 1 ? 'bg-violet-500' : 'bg-slate-700'}`} />
                      <div className={`h-full flex-1 rounded-full ${passwordScore >= 2 ? 'bg-violet-500' : 'bg-slate-700'}`} />
                      <div className={`h-full flex-1 rounded-full ${passwordScore >= 3 ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                      <div className={`h-full flex-1 rounded-full ${passwordScore >= 4 ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                    </div>
                  </div>
                )}

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">
                    Konfirmasi Kata Sandi Baru *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Ulangi kata sandi baru"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 text-xs rounded-[10px] border border-slate-700 bg-slate-800/80 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-[10px] bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs transition shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 mt-4"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Simpan Kata Sandi Baru</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 4: SUCCESS CONGRATS */}
          {step === 4 && (
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">
                  Kata Sandi Berhasil Diperbarui!
                </h3>
                <p className="text-xs text-slate-300 mt-2 max-w-sm mx-auto leading-relaxed">
                  Kata sandi baru kamu telah berhasil disimpan. Sekarang kamu dapat masuk kembali menggunakan email <strong className="text-amber-300">{email}</strong> dan kata sandi baru kamu.
                </p>
              </div>

              <div className="p-4 rounded-[10px] bg-emerald-950/60 border border-emerald-800/50 text-emerald-200 text-xs flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Status Akun: Aman &amp; Terverifikasi</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (onResetSuccessLogin) {
                    onResetSuccessLogin(email);
                  } else {
                    onBackToLogin();
                  }
                }}
                className="w-full py-3.5 rounded-[10px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <span>Masuk Sekarang dengan Kata Sandi Baru</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
