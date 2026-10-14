'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
  Sun,
  Moon,
  Loader2,
  Mail,
  ArrowLeft,
  CheckCircle2,
  RotateCw,
} from 'lucide-react';
import Image from 'next/image';
import { Field, Input } from '@/components/ui/field';
import { Button } from '@/components/ui/button';

interface ForgotPasswordViewProps {}

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resendNotice, setResendNotice] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cooldown countdown logic for resending link
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

  // Handle Submit Email
  const handleSendResetLink = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setResendNotice('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Harap masukkan alamat email yang valid.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || 'Gagal mengirimkan tautan reset kata sandi.');
        setIsLoading(false);
        return;
      }

      setStep(2);
      setCountdown(60);
      setCanResend(false);
    } catch {
      setErrorMessage('Terjadi kendala jaringan. Silakan periksa koneksi internet kamu.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Resend Link
  const handleResend = async () => {
    if (!canResend || isLoading) return;
    setIsLoading(true);
    setErrorMessage('');
    setResendNotice('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setResendNotice('Tautan baru telah berhasil dikirim ke email kamu.');
        setCanResend(false);
        setCountdown(60);
      } else {
        setErrorMessage(data.message || 'Gagal mengirim ulang tautan.');
      }
    } catch {
      setErrorMessage('Gagal menghubungi server. Silakan coba kembali.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full flex-1 w-full flex items-center justify-center p-4 sm:p-6 relative font-sans bg-slate-50 dark:bg-slate-950">
      {/* Top Bar Theme Toggle */}
      <div className="absolute top-5 right-5 z-10">
        {mounted && (
          <button
            type="button"
            onClick={toggleDarkMode}
            className="p-2.5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shadow-xs"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Main Card */}
      <div className="w-full max-w-[440px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 p-7 sm:p-9 relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Image
              src="/logo.webp"
              alt="Employr Logo"
              width={140}
              height={36}
              className="h-8 w-auto object-contain dark:brightness-0 dark:invert inline-block"
              priority
            />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            {step === 1 ? 'Lupa Kata Sandi' : 'Periksa Email Kamu'}
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {step === 1
              ? 'Masukkan alamat email akun kamu untuk menerima tautan pengaturan ulang kata sandi.'
              : 'Tautan pemulihan kata sandi telah dikirim ke kotak masuk email kamu.'}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-[10px] bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-sm font-medium">
            {errorMessage}
          </div>
        )}

        {/* Success Notice */}
        {resendNotice && (
          <div className="mb-5 p-3.5 rounded-[10px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
            <span>{resendNotice}</span>
          </div>
        )}

        {/* STEP 1: FORM INPUT EMAIL */}
        {step === 1 && (
          <form onSubmit={handleSendResetLink} className="flex flex-col gap-4">
            <Field label="Email Terdaftar" id="reset-email-input">
              <div className="relative">
                <Input
                  id="reset-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                  autoFocus
                  className="pl-10"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none dark:text-slate-400" />
              </div>
            </Field>

            <Button
              type="submit"
              disabled={isLoading || !email}
              className="w-full h-11 mt-1"
              variant="primary"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengirim Tautan...</span>
                </>
              ) : (
                <span>Kirim Tautan Reset</span>
              )}
            </Button>
          </form>
        )}

        {/* STEP 2: EMAIL SENT CONFIRMATION STATE */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="p-4 rounded-[10px] bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 text-left space-y-2">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-full bg-cobalt-500/10 dark:bg-blue-500/20 text-cobalt-500 dark:text-blue-400 shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Tautan pemulihan dikirim ke <strong className="text-slate-900 dark:text-white font-bold">{email}</strong>.
                  Tautan berlaku selama <strong className="text-slate-900 dark:text-white font-bold">15 menit</strong>.
                </div>
              </div>
              <p className="text-caption text-slate-500 dark:text-slate-400 pt-1 border-t border-blue-200/50 dark:border-blue-900/40">
                Tips: Jika email tidak ditemukan di Kotak Masuk, periksa folder <strong>Spam</strong> atau <strong>Promosi</strong>.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-1">
              <Button
                type="button"
                onClick={handleResend}
                disabled={!canResend || isLoading}
                variant="outline"
                className="w-full h-11"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RotateCw className="w-3.5 h-3.5" />
                )}
                {canResend ? (
                  <span>Kirim Ulang Tautan</span>
                ) : (
                  <span>Kirim Ulang ({countdown} detik)</span>
                )}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setErrorMessage('');
                  setResendNotice('');
                }}
                className="w-full py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition text-center cursor-pointer"
              >
                Gunakan Alamat Email Lain
              </button>
            </div>
          </div>
        )}

        {/* Footer Navigation Back to Login */}
        <div className="mt-6 pt-5 text-center border-t border-slate-200 dark:border-slate-800">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-cobalt-500 dark:text-blue-400 hover:underline underline-offset-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Halaman Masuk</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
