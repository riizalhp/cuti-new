'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Briefcase,
  KeyRound,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface LoginViewProps {}

export const LoginView: React.FC<LoginViewProps> = () => {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = resolvedTheme === 'dark';
  const toggleDarkMode = () => setTheme(isDarkMode ? 'light' : 'dark');

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('andi.pratama@email.com');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('');
  const [headline, setHeadline] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Harap isi email dan kata sandi kamu.');
      return;
    }

    if (mode === 'register' && !fullName) {
      setErrorMessage('Harap isi nama lengkap kamu.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      router.push('/beranda');
    }, 800);
  };

  const handleQuickDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push('/beranda');
    }, 500);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetSuccess(true);
    setTimeout(() => {
      setResetSuccess(false);
      setShowForgotModal(false);
      setResetEmail('');
    }, 2500);
  };

  // ForgotPasswordView is now at /forgot-password route

  return (
    <div className="min-h-screen w-full bg-slate-900 text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-violet-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-violet-500/25">
            C
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white block">
              CUTI <span className="text-violet-400">AI</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">
              Platform Karir & CV ATS #1 Indonesia
            </span>
          </div>
        </div>

        {mounted && (
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-300 transition flex items-center gap-2"
          >
            {isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
          </button>
        )}
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative z-10 backdrop-blur-xl mt-16 mb-8">
        {/* Left Side: Branding & Features Hero (Hidden on Mobile) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-violet-950 via-slate-900 to-slate-950 p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 relative">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Akses Semua Fitur AI</span>
            </span>

            <h2 className="text-2xl lg:text-3xl font-black text-white leading-tight">
              Akselerasi Karir Impianmu dengan AI.
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed">
              Buat CV ATS profesional, simulasikan interview kerja secara realtime, dan pantau status lamaranmu dalam satu platform terpadu.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <div className="p-1.5 rounded-lg bg-violet-500/20 text-violet-400">
                  <FileText className="w-4 h-4" />
                </div>
                <span>CV ATS Generator & AI Score Review</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-200">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                <span>Tracker Lamaran & Surat Lamaran Otomatis</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-200">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>Simulasi AI Voice & Text Interview Evaluator</span>
              </div>
            </div>
          </div>

          {/* Testimonial / Social Proof */}
          <div className="pt-8 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-violet-500 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold">AP</div>
                <div className="w-7 h-7 rounded-full bg-amber-500 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold">R</div>
                <div className="w-7 h-7 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold">S</div>
              </div>
              <span className="text-[11px] font-bold text-amber-300">50,000+ Jobseeker</span>
            </div>
            <p className="text-[11px] text-slate-400 italic">
              &quot;Lolos interview di BUMN dan Tech Unicorn setelah optimasi CV &amp; latihan AI di CUTI.&quot;
            </p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="lg:col-span-7 p-6 sm:p-8 md:p-10 flex flex-col justify-center">
          {/* Form Header Tabs */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <div>
              <h3 className="text-xl font-extrabold text-white">
                {mode === 'login' ? 'Selamat Datang Kembali' : 'Buat Akun Baru'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {mode === 'login'
                  ? 'Masuk ke akun kamu untuk melanjutkan persiapan karir'
                  : 'Daftar sekarang gratis dan dapatkan akses AI CV ATS'}
              </p>
            </div>

            <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700/80">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  mode === 'login'
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Masuk
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  mode === 'register'
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Daftar
              </button>
            </div>
          </div>

          {/* Quick Demo Access Bar */}
          <div className="mt-6 p-3.5 rounded-xl bg-violet-950/60 border border-violet-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-violet-200">
                Ingin langsung coba tanpa mengetik?
              </span>
            </div>
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition shadow-md shrink-0 flex items-center justify-center gap-1.5"
            >
              <span>Login Demo 1-Klik</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-4 p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === 'register' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">
                    Nama Lengkap *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Andi Pratama"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-lg border border-slate-700 bg-slate-800/80 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">
                    Target Posisi / Karir (Opsional)
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Contoh: Full Stack Engineer"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-lg border border-slate-700 bg-slate-800/80 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-lg border border-slate-700 bg-slate-800/80 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 block">
                  Kata Sandi *
                </label>
                {mode === 'login' && (
                  <Link
                    href="/forgot-password"
                    className="text-[11px] font-semibold text-violet-400 hover:text-violet-300 hover:underline"
                  >
                    Lupa kata sandi?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-xs rounded-lg border border-slate-700 bg-slate-800/80 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'login' && (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-violet-600 rounded border-slate-700 bg-slate-800 focus:ring-violet-500"
                  />
                  <span>Ingat Saya di perangkat ini</span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs transition shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Masuk ke Akun' : 'Daftar Sekarang'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Logins */}
          <div className="mt-6 pt-6 border-t border-slate-800 space-y-3">
            <p className="text-[11px] text-center text-slate-500 font-medium">
              Atau masuk menggunakan akun media sosial:
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="p-2.5 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700/60 text-xs font-bold text-slate-200 transition flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                  />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="p-2.5 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700/60 text-xs font-bold text-slate-200 transition flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 fill-sky-400" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
                <span>LinkedIn</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-violet-400" />
                <span>Reset Kata Sandi</span>
              </h4>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Tutup
              </button>
            </div>

            {resetSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs space-y-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <p className="font-bold text-sm">Email Reset Dikirim!</p>
                <p className="text-emerald-300">
                  Silakan periksa kotak masuk atau folder spam email kamu ({resetEmail}) untuk instruksi pembuatan kata sandi baru.
                </p>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Masukkan email yang terdaftar pada akun CUTI AI. Kami akan mengirimkan tautan untuk mengatur ulang kata sandimu.
                </p>
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition"
                >
                  Kirim Tautan Reset
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
