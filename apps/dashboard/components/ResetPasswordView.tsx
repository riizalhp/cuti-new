'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Sun,
  Moon,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  KeyRound,
} from 'lucide-react';
import Image from 'next/image';
import { Field, Input } from '@/components/ui/field';
import { Button } from '@/components/ui/button';

export const ResetPasswordView: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resolvedTheme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const handleToggleNewPassword = () => setShowNewPassword((prev) => !prev);
  const handleToggleConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
    const queryToken = searchParams.get('token') || '';
    const queryEmail = searchParams.get('email') || '';
    setToken(queryToken);
    setEmail(queryEmail);
  }, [searchParams]);

  const isDarkMode = resolvedTheme === 'dark';
  const toggleDarkMode = () => setTheme(isDarkMode ? 'light' : 'dark');

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const passwordScore = getPasswordStrength(newPassword);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!token || !email) {
      setErrorMessage('Tautan reset kata sandi tidak valid atau parameter tidak lengkap.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('Kata sandi baru minimal harus 8 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          token: token.trim(),
          password: newPassword,
          confirmPassword: confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || 'Gagal mengatur ulang kata sandi.');
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
    } catch {
      setErrorMessage('Terjadi kendala jaringan saat menghubungi server.');
    } finally {
      setIsLoading(false);
    }
  };

  const isTokenMissing = mounted && (!token || !email);

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
            {isSuccess ? 'Kata Sandi Diperbarui' : 'Atur Kata Sandi Baru'}
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {isSuccess
              ? 'Akun kamu kini sudah aman dan siap digunakan kembali.'
              : email
              ? `Buat kata sandi baru untuk akun ${email}.`
              : 'Buat kata sandi baru untuk mengamankan akun Employr kamu.'}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-[10px] bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-sm font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STATE 1: MISSING OR INVALID TOKEN */}
        {isTokenMissing && (
          <div className="space-y-4 text-center py-2">
            <div className="p-4 rounded-[10px] bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-left">
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
                Tautan reset tidak valid atau kedaluwarsa. Silakan ajukan tautan baru di bawah ini.
              </p>
            </div>

            <Link
              href="/forgot-password"
              className="w-full h-11 rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-cobalt-500/20 cursor-pointer"
            >
              <span>Minta Tautan Reset Baru</span>
            </Link>
          </div>
        )}

        {/* STATE 2: FORM RESET PASSWORD */}
        {!isTokenMissing && !isSuccess && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            {/* New Password Input */}
            <Field label="Kata Sandi Baru" id="reset-new-password">
              <div className="relative">
                <Input
                  id="reset-new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  required
                  minLength={8}
                  className="pr-11"
                />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleToggleNewPassword}
                  className="absolute right-0 top-0 bottom-0 w-11 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer z-20 select-none touch-manipulation [&_svg]:pointer-events-none"
                  aria-label={showNewPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  aria-pressed={showNewPassword}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4 pointer-events-none" /> : <Eye className="w-4 h-4 pointer-events-none" />}
                </button>
              </div>
            </Field>

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Kekuatan Sandi:</span>
                  <span
                    className={`font-semibold ${
                      passwordScore <= 1
                        ? 'text-rose-700 dark:text-rose-400'
                        : passwordScore === 2 || passwordScore === 3
                        ? 'text-amber-700 dark:text-amber-400'
                        : 'text-emerald-700 dark:text-emerald-400'
                    }`}
                  >
                    {passwordScore <= 1
                      ? 'Lemah'
                      : passwordScore === 2 || passwordScore === 3
                      ? 'Sedang'
                      : 'Sangat Kuat'}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden flex gap-1">
                  <div
                    className={`h-full flex-1 rounded-full ${
                      passwordScore >= 1 ? 'bg-cobalt-500 dark:bg-blue-500' : 'bg-transparent'
                    }`}
                  />
                  <div
                    className={`h-full flex-1 rounded-full ${
                      passwordScore >= 2 ? 'bg-cobalt-500 dark:bg-blue-500' : 'bg-transparent'
                    }`}
                  />
                  <div
                    className={`h-full flex-1 rounded-full ${
                      passwordScore >= 3 ? 'bg-emerald-500' : 'bg-transparent'
                    }`}
                  />
                  <div
                    className={`h-full flex-1 rounded-full ${
                      passwordScore >= 4 ? 'bg-emerald-400' : 'bg-transparent'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Confirm Password Input */}
            <Field
              label="Konfirmasi Kata Sandi Baru"
              id="reset-confirm-password"
            >
              <div className="relative">
                <Input
                  id="reset-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  required
                  className="pr-11"
                />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleToggleConfirmPassword}
                  className="absolute right-0 top-0 bottom-0 w-11 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer z-20 select-none touch-manipulation [&_svg]:pointer-events-none"
                  aria-label={showConfirmPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  aria-pressed={showConfirmPassword}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4 pointer-events-none" /> : <Eye className="w-4 h-4 pointer-events-none" />}
                </button>
              </div>
            </Field>

            <Button
              type="submit"
              disabled={isLoading || !newPassword || !confirmPassword}
              className="w-full h-11 mt-1"
              variant="primary"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Kata Sandi...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Simpan Kata Sandi Baru</span>
                </>
              )}
            </Button>
          </form>
        )}

        {/* STATE 3: SUCCESS STATE */}
        {isSuccess && (
          <div className="text-center space-y-5 py-2">
            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Kata sandi baru berhasil disimpan. Semua sesi aktif sebelumnya telah dihentikan demi keamanan. Silakan masuk kembali dengan kata sandi baru.
              </p>
            </div>

            <Button
              type="button"
              onClick={() => router.push('/login')}
              className="w-full h-11"
              variant="primary"
            >
              <span>Masuk ke Akun Sekarang</span>
            </Button>
          </div>
        )}

        {/* Footer */}
        {!isSuccess && (
          <div className="mt-6 pt-5 text-center border-t border-slate-200 dark:border-slate-800">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-cobalt-500 dark:text-blue-400 hover:underline underline-offset-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Halaman Masuk</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
