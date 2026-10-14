'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useToast } from '@/components/ui/Toast';
import { UserAvatar } from '@/components/UserAvatar';
import { userApi } from '@/lib/api';
import { handleLogout } from '@/lib/auth';
import { isSoundEnabled, setSoundEnabled, playSuccessChime } from '@/lib/sfx';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import {
  Lock,
  KeyRound,
  Laptop,
  Sun,
  Moon,
  Bell,
  Volume2,
  VolumeX,
  Download,
  ShieldAlert,
  Trash2,
  Compass,
  Lightbulb,
  ExternalLink,
  CheckCircle2,
  ChevronRight,
  LogOut,
  Sliders,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProfileViewSkeleton } from '@/components/ProfileSkeleton';

export function SettingsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const { theme, setTheme } = useTheme();

  const tabParam = searchParams.get('tab');
  const initialTab =
    tabParam === 'tampilan' || tabParam === 'pengaturan'
      ? 'tampilan'
      : tabParam === 'privasi'
      ? 'privasi'
      : 'keamanan';

  const [activeTab, setActiveTab] = useState<'keamanan' | 'tampilan' | 'privasi'>(initialTab);
  const [isLoading, setIsLoading] = useState(true);

  // Profile metadata for display
  const [profileMeta, setProfileMeta] = useState({
    fullName: '',
    email: '',
    location: '',
  });
  const [membershipRef, setMembershipRef] = useState<{ packageName?: string; tier?: string } | null>(null);

  // Security States
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Notification States
  const [notifications, setNotifications] = useState({
    emailJobAlerts: true,
    emailInterviewReminders: true,
    emailWeeklyTips: false,
    whatsappAlerts: true,
    soundAlerts: true,
  });
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  // Export & Delete States
  const [isExportingData, setIsExportingData] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    setNotifications((prev) => ({ ...prev, soundAlerts: isSoundEnabled() }));
  }, []);

  useEffect(() => {
    userApi
      .getProfile()
      .then((remote) => {
        if (remote) {
          setProfileMeta({
            fullName: remote.fullName || remote.name || '',
            email: remote.email || '',
            location: remote.location || '',
          });
          if (remote.membership) {
            setMembershipRef(remote.membership);
          }
          if (remote.preferences?.notifications) {
            setNotifications((prev) => ({ ...prev, ...remote.preferences.notifications }));
            if (typeof remote.preferences.notifications.soundAlerts === 'boolean') {
              setSoundEnabled(remote.preferences.notifications.soundAlerts);
            }
          }
        }
      })
      .catch((err) => {
        console.warn('Gagal memuat profil di pengaturan', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Gagal', 'Konfirmasi kata sandi baru tidak cocok.');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('Gagal', 'Kata sandi baru minimal 8 karakter.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await userApi.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      if (res && res.success) {
        toast.success('Kata Sandi Diperbarui', res.message || 'Kata sandi akun berhasil diubah.');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error('Gagal Mengubah Sandi', res?.message || 'Kata sandi saat ini tidak cocok.');
      }
    } catch (err: any) {
      toast.error('Gagal Mengubah Sandi', err?.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSaveNotifications = async (updated?: typeof notifications) => {
    setIsSavingPrefs(true);
    const target = updated || notifications;
    try {
      await userApi.updateProfile({
        preferences: {
          notifications: target,
        },
      });
      toast.success('Pengaturan Disimpan', 'Preferensi notifikasi berhasil diperbarui.');
    } catch {
      toast.error('Gagal Menyimpan', 'Terjadi kesalahan sistem.');
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const handleExportData = () => {
    setIsExportingData(true);
    setTimeout(() => {
      const exportBlob = new Blob(
        [
          JSON.stringify(
            {
              accountProfile: profileMeta,
              preferences: { notifications },
              membership: membershipRef,
              exportedAt: new Date().toISOString(),
            },
            null,
            2
          ),
        ],
        { type: 'application/json' }
      );
      const url = URL.createObjectURL(exportBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `employr-data-${(profileMeta.fullName || 'user').toLowerCase().replace(/\s+/g, '-')}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setIsExportingData(false);
      toast.success('Data Berhasil Diunduh', 'Salinan arsip akun berhasil disimpan ke perangkat.');
    }, 1000);
  };

  const handleDeleteAccountConfirm = async () => {
    if (deleteConfirmText !== 'HAPUS AKUN SAYA') {
      toast.error('Konfirmasi Salah', 'Ketik "HAPUS AKUN SAYA" secara tepat untuk melanjutkan.');
      return;
    }

    setIsDeletingAccount(true);
    try {
      const res = await userApi.deleteAccount();
      if (res) {
        toast.success('Akun Dihapus', 'Akun kamu telah dinonaktifkan.');
        setShowDeleteAccountModal(false);
        handleLogout();
      } else {
        toast.error('Gagal Menghapus Akun', 'Terjadi kesalahan sistem.');
      }
    } catch (err: any) {
      toast.error('Gagal Menghapus Akun', err?.message || 'Terjadi kesalahan.');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  if (isLoading) {
    return <ProfileViewSkeleton />;
  }

  return (
    <div className="w-full space-y-6 md:space-y-8 font-sans pb-40 sm:pb-32 lg:pb-16 animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* 1. HERO PENGATURAN CARD */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[10px] bg-[#162758] border border-[#20367A] text-white p-4 sm:p-6 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4 min-w-0">
            <UserAvatar
              name={profileMeta.fullName || 'Pengguna Employr'}
              size={56}
              square={true}
              variant="beam"
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-[12px] border-2 border-white/30 shadow-md shrink-0"
            />
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-extrabold text-base sm:text-lg text-white tracking-tight truncate">
                  {profileMeta.fullName || 'Pengaturan Akun'}
                </h1>
                <span className="px-2 py-0.5 rounded-[6px] text-caption font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                  {membershipRef?.packageName || 'Member'}
                </span>
              </div>
              <p className="text-xs text-blue-200 font-medium truncate">
                {profileMeta.email || 'Email belum diatur'}
              </p>
              <div className="flex items-center gap-2 text-caption text-slate-300 pt-0.5">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Akun Aktif &amp; Terlindungi</span>
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/profil"
            className="px-3.5 py-2.5 rounded-[10px] bg-white/15 hover:bg-white/25 active:scale-[0.98] text-white font-bold text-xs transition border border-white/20 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs self-start md:self-auto shrink-0"
          >
            <User className="w-4 h-4" />
            <span>Buka Profil Saya</span>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUB-NAVIGATION TABS */}
      {/* ========================================================================= */}
      <div className="w-full overflow-x-auto no-scrollbar -mx-1 px-1">
        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            const nextTab = val as 'keamanan' | 'tampilan' | 'privasi';
            setActiveTab(nextTab);
            if (typeof window !== 'undefined') {
              const url = new URL(window.location.href);
              url.searchParams.set('tab', nextTab);
              window.history.replaceState(null, '', url.toString());
            }
          }}
        >
          <TabsList variant="pill" className="w-full flex justify-between sm:justify-start p-1 gap-1">
            <TabsTrigger value="keamanan" size="sm" className="flex-1 sm:flex-initial text-xs px-2.5 sm:px-4 gap-1.5">
              <Lock className="size-3.5 sm:size-4 shrink-0" />
              <span>Keamanan &amp; Sandi</span>
            </TabsTrigger>
            <TabsTrigger value="tampilan" size="sm" className="flex-1 sm:flex-initial text-xs px-2.5 sm:px-4 gap-1.5">
              <Sliders className="size-3.5 sm:size-4 shrink-0" />
              <span>Tampilan &amp; Notifikasi</span>
            </TabsTrigger>
            <TabsTrigger value="privasi" size="sm" className="flex-1 sm:flex-initial text-xs px-2.5 sm:px-4 gap-1.5">
              <ShieldAlert className="size-3.5 sm:size-4 shrink-0" />
              <span>Privasi &amp; Akun</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: KEAMANAN & SANDI */}
      {/* ========================================================================= */}
      {activeTab === 'keamanan' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Ubah Kata Sandi */}
          <div className="p-4 sm:p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-orange-500" />
                <span>Ubah Kata Sandi Akun</span>
              </h2>
              <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5">
                Gunakan minimal 8 karakter kombinasi untuk keamanan akun terbaik.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
              <div className="space-y-1.5">
                <label htmlFor="sec-currentPassword" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Kata Sandi Saat Ini *
                </label>
                <input
                  id="sec-currentPassword"
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Masukkan kata sandi lama"
                  className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-[#1738D1] focus:ring-1 focus:ring-[#1738D1] outline-none font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="sec-newPassword" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Kata Sandi Baru *
                </label>
                <input
                  id="sec-newPassword"
                  type="password"
                  required
                  minLength={8}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Minimal 8 karakter"
                  className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-[#1738D1] focus:ring-1 focus:ring-[#1738D1] outline-none font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="sec-confirmPassword" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Konfirmasi Kata Sandi Baru *
                </label>
                <input
                  id="sec-confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Ulangi kata sandi baru"
                  className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-[#1738D1] focus:ring-1 focus:ring-[#1738D1] outline-none font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="px-5 py-2.5 rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 active:scale-[0.98] text-white font-bold text-xs transition shadow-md shadow-cobalt-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>{isChangingPassword ? 'Memperbarui...' : 'Perbarui Kata Sandi'}</span>
              </button>
            </form>
          </div>

          {/* Sesi Login Aktif */}
          <div className="p-4 sm:p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Laptop className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Daftar Perangkat &amp; Sesi Login Aktif</span>
              </h2>
              <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5">
                Perangkat yang sedang memiliki akses login ke akun kamu saat ini.
              </p>
            </div>

            <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <Laptop className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {typeof window !== 'undefined'
                        ? navigator.userAgent.includes('Windows')
                          ? 'Laptop / PC Windows'
                          : navigator.userAgent.includes('Mac')
                          ? 'Macintosh'
                          : navigator.userAgent.includes('Android')
                          ? 'Android Device'
                          : navigator.userAgent.includes('iPhone')
                          ? 'iPhone / iOS Device'
                          : 'Peramban Web'
                        : 'Peramban Web'}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-[4px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-caption font-bold">
                      Sesi Saat Ini
                    </span>
                  </div>
                  <p className="text-caption text-slate-500 dark:text-slate-400">
                    {profileMeta.location ? `${profileMeta.location} • ` : ''}Sesi Aktif
                  </p>
                </div>
              </div>
              <span className="text-caption font-bold text-emerald-600 dark:text-emerald-400">Online</span>
            </div>
          </div>

          {/* Keluar Akun */}
          <div className="p-4 sm:p-6 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-xs text-slate-900 dark:text-white">Keluar dari Sesi Ini</h3>
              <p className="text-caption text-slate-500 dark:text-slate-400">
                Akhiri sesi login di perangkat ini. Kamu bisa masuk kembali kapan saja.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleLogout()}
              className="px-4 py-2.5 rounded-[10px] bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar Akun</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: TAMPILAN & NOTIFIKASI */}
      {/* ========================================================================= */}
      {activeTab === 'tampilan' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Pengaturan Tema */}
          <div className="p-4 sm:p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Sun className="w-4 h-4 text-orange-500" />
                <span>Tema Tampilan Antarmuka</span>
              </h2>
              <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5">
                Sesuaikan mode warna yang paling nyaman untuk matamu saat menyusun CV.
              </p>
            </div>

            <div role="radiogroup" aria-label="Pilihan Tema Tampilan" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                role="radio"
                aria-checked={theme === 'light'}
                onClick={() => {
                  setTheme('light');
                  userApi.updateProfile({ preferences: { theme: 'light' } }).catch(() => {});
                  toast.success('Tema Terang Aktif', 'Tampilan telah disesuaikan ke mode terang.');
                }}
                className={`p-4 rounded-[10px] border text-left transition flex flex-col justify-between space-y-3 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 ${
                  theme === 'light'
                    ? 'border-cobalt-500 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-cobalt-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-[8px] bg-amber-100 text-amber-700">
                    <Sun className="w-5 h-5" />
                  </div>
                  {theme === 'light' && <CheckCircle2 className="w-5 h-5 text-cobalt-500" />}
                </div>
                <div>
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white block">Mode Terang (Light)</span>
                  <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5">Latar bersih berstandar dokumen cetak.</p>
                </div>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={theme === 'dark'}
                onClick={() => {
                  setTheme('dark');
                  userApi.updateProfile({ preferences: { theme: 'dark' } }).catch(() => {});
                  toast.success('Tema Gelap Aktif', 'Tampilan telah disesuaikan ke mode gelap.');
                }}
                className={`p-4 rounded-[10px] border text-left transition flex flex-col justify-between space-y-3 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 ${
                  theme === 'dark'
                    ? 'border-cobalt-500 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-cobalt-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-[8px] bg-slate-900 text-slate-100">
                    <Moon className="w-5 h-5" />
                  </div>
                  {theme === 'dark' && <CheckCircle2 className="w-5 h-5 text-cobalt-500" />}
                </div>
                <div>
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white block">Mode Gelap (Dark)</span>
                  <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5">Kontras redup untuk penggunaan malam hari.</p>
                </div>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={theme === 'system'}
                onClick={() => {
                  setTheme('system');
                  userApi.updateProfile({ preferences: { theme: 'system' } }).catch(() => {});
                  toast.success('Tema Sistem Aktif', 'Tampilan mengikuti preferensi sistem perangkat kamu.');
                }}
                className={`p-4 rounded-[10px] border text-left transition flex flex-col justify-between space-y-3 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 ${
                  theme === 'system'
                    ? 'border-cobalt-500 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-cobalt-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-[8px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                    <Laptop className="w-5 h-5" />
                  </div>
                  {theme === 'system' && <CheckCircle2 className="w-5 h-5 text-cobalt-500" />}
                </div>
                <div>
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white block">Otomatis (Sistem)</span>
                  <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5">Mengikuti tema OS laptop/HP kamu.</p>
                </div>
              </button>
            </div>
          </div>

          {/* Preferensi Notifikasi */}
          <div className="p-4 sm:p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Pengaturan Notifikasi &amp; Pengingat</span>
                </h2>
                <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5">
                  Kendalikan pemberitahuan yang ingin kamu terima melalui Email maupun WhatsApp.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Suara Notifikasi */}
              <div className="flex items-center justify-between p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 gap-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0 transition-colors',
                    notifications.soundAlerts ? 'bg-blue-50 text-cobalt-600 dark:bg-blue-950/70 dark:text-blue-400' : 'bg-slate-200 text-slate-400'
                  )}>
                    {notifications.soundAlerts ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">Suara Notifikasi Selesai</span>
                      {notifications.soundAlerts && (
                        <button
                          type="button"
                          onClick={() => playSuccessChime(0.12, true)}
                          className="text-[11px] font-bold text-cobalt-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          (Tes Suara)
                        </button>
                      )}
                    </div>
                    <p className="text-caption text-slate-500 dark:text-slate-400">
                      Bunyikan nada saat analisis CV atau diagnosis ATS rampung.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={notifications.soundAlerts}
                  onClick={() => {
                    const nextVal = !notifications.soundAlerts;
                    const nextNotifs = { ...notifications, soundAlerts: nextVal };
                    setNotifications(nextNotifs);
                    setSoundEnabled(nextVal);
                    if (nextVal) playSuccessChime(0.1, true);
                    handleSaveNotifications(nextNotifs);
                  }}
                  className={cn(
                    'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none',
                    notifications.soundAlerts ? 'bg-[#1738D1]' : 'bg-slate-300 dark:bg-slate-700'
                  )}
                >
                  <span
                    style={{ left: notifications.soundAlerts ? 'calc(100% - 22px)' : '2px' }}
                    className="absolute top-0.5 block h-5 w-5 rounded-full bg-white shadow-xs transition-[left] duration-200"
                  />
                </button>
              </div>

              {/* Email Job Alerts */}
              <label className="flex items-center justify-between p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 cursor-pointer">
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">Email Rekomendasi Loker Baru</span>
                  <span className="text-caption text-slate-500 dark:text-slate-400">Kurasi loker yang cocok dengan profil kamu setiap Senin pagi.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailJobAlerts}
                  onChange={(e) => {
                    const next = { ...notifications, emailJobAlerts: e.target.checked };
                    setNotifications(next);
                    handleSaveNotifications(next);
                  }}
                  className="w-4 h-4 text-cobalt-500 rounded-[6px] accent-[#1738D1]"
                />
              </label>

              {/* Email Interview Reminder */}
              <label className="flex items-center justify-between p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 cursor-pointer">
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">Email Pengingat Jadwal Interview (H-1)</span>
                  <span className="text-caption text-slate-500 dark:text-slate-400">Peringatan otomatis sebelum agenda wawancara yang dicatat di Tracker.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailInterviewReminders}
                  onChange={(e) => {
                    const next = { ...notifications, emailInterviewReminders: e.target.checked };
                    setNotifications(next);
                    handleSaveNotifications(next);
                  }}
                  className="w-4 h-4 text-cobalt-500 rounded-[6px] accent-[#1738D1]"
                />
              </label>

              {/* WhatsApp Alerts */}
              <label className="flex items-center justify-between p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 cursor-pointer">
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">Pengingat WhatsApp &amp; Update Lamaran</span>
                  <span className="text-caption text-slate-500 dark:text-slate-400">Pemberitahuan berkala progres lamaran kerja ke nomor WhatsApp kamu.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.whatsappAlerts}
                  onChange={(e) => {
                    const next = { ...notifications, whatsappAlerts: e.target.checked };
                    setNotifications(next);
                    handleSaveNotifications(next);
                  }}
                  className="w-4 h-4 text-cobalt-500 rounded-[6px] accent-[#1738D1]"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: PRIVASI & AKUN (PORTABILITAS DATA & DANGER ZONE) */}
      {/* ========================================================================= */}
      {activeTab === 'privasi' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Ekspor Data Portofolio */}
          <div className="p-4 sm:p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-orange-500" />
                <span>Unduh &amp; Ekspor Data Akun Saya (Hak Portabilitas)</span>
              </h2>
              <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5">
                Dapatkan salinan arsip biodata profil dan konfigurasi akun kamu dalam berkas JSON (sesuai UU PDP).
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div className="space-y-0.5 text-center sm:text-left">
                <h3 className="font-bold text-xs text-slate-900 dark:text-white">Arsip Portofolio Terpadu</h3>
                <p className="text-caption text-slate-500 dark:text-slate-400">
                  Termasuk biodata profil, preferensi notifikasi, dan status keanggotaan akun.
                </p>
              </div>

              <button
                type="button"
                disabled={isExportingData}
                onClick={handleExportData}
                className="px-4 py-2.5 rounded-[10px] bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-sm flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
              >
                <Download className={`w-4 h-4 ${isExportingData ? 'animate-bounce' : ''}`} />
                <span>{isExportingData ? 'Menyiapkan Arsip...' : 'Unduh Data Saya (.JSON)'}</span>
              </button>
            </div>
          </div>

          {/* Bantuan & Dukungan */}
          <div className="p-4 sm:p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-cobalt-500" />
                <span>Bantuan &amp; Layanan Pengguna</span>
              </h2>
              <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5">
                Pusat panduan tur fitur dan saluran komunikasi resmi dengan tim sistem.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white">Lapor Kendala Teknis</h3>
                  <p className="text-caption text-slate-500 dark:text-slate-400 leading-relaxed">
                    Menemukan error saat menyusun CV atau mengelola lamaran? Kirim tiket laporan ke tim teknis.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/lapor-bug')}
                  className="px-3.5 py-2 rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs self-start"
                >
                  <span>Buka Tiket Laporan</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </button>
              </div>

              <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white">Usulkan Ide Fitur</h3>
                  <p className="text-caption text-slate-500 dark:text-slate-400 leading-relaxed">
                    Punya ide fitur baru yang bermanfaat untuk pencari kerja muda? Ajukan ide ke Wishlist.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/saran-fitur')}
                  className="px-3.5 py-2 rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs self-start"
                >
                  <Lightbulb className="w-3 h-3 text-amber-500" />
                  <span>Kirim Saran Fitur</span>
                </button>
              </div>
            </div>
          </div>

          {/* Zona Bahaya (Danger Zone) */}
          <div className="p-4 sm:p-6 rounded-[10px] bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-rose-200/80 dark:border-rose-900/40 pb-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <div>
                <h2 className="font-extrabold text-sm text-rose-700 dark:text-rose-300">
                  Zona Bahaya (Danger Zone)
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Tindakan berisiko tinggi terhadap keberlangsungan data akun kamu.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
              <div>
                <h3 className="font-bold text-xs text-slate-900 dark:text-white">Hapus Akun Permanen</h3>
                <p className="text-caption text-slate-600 dark:text-slate-300 mt-0.5">
                  Tindakan ini tidak dapat dibatalkan. Seluruh berkas CV, histori lamaran, dan lisensi akan dihapus selamanya.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteAccountModal(true)}
                className="px-4 py-2.5 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Akun Permanen</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CROSS-NAVIGATION FOOTER BANNER */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[8px] bg-blue-50 dark:bg-blue-950/60 text-cobalt-500 dark:text-blue-400 flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              Ingin memperbarui biodata diri atau target karir?
            </p>
            <p className="text-caption text-slate-500 dark:text-slate-400">
              Kelola informasi kontak, link portofolio, dan target posisi di halaman Profil Saya.
            </p>
          </div>
        </div>
        <Link
          href="/profil"
          className="px-3.5 py-2 rounded-[8px] text-xs font-bold text-cobalt-500 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition self-start sm:self-auto shrink-0"
        >
          <span>Buka Profil Saya</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* 5. MODAL KONFIRMASI HAPUS AKUN PERMANEN */}
      {/* ========================================================================= */}
      <AlertDialog open={showDeleteAccountModal} onOpenChange={setShowDeleteAccountModal}>
        <AlertDialogContent className="rounded-[10px] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-extrabold text-rose-600 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              <span>Konfirmasi Hapus Akun Permanen</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <p>
                Kamu akan menghapus akun ini secara permanen. Semua berkas CV, riwayat lamaran, dan data keanggotaan akan hilang dan tidak dapat dipulihkan.
              </p>
              <div className="p-3 rounded-[8px] bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-caption font-medium">
                Ketik kalimat di bawah untuk konfirmasi:
                <div className="font-mono font-bold select-all text-xs text-rose-900 dark:text-rose-100 mt-1">
                  HAPUS AKUN SAYA
                </div>
              </div>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Ketik HAPUS AKUN SAYA"
                className="w-full px-3 py-2 text-xs rounded-[8px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white mt-2 font-mono outline-none focus:ring-2 focus:ring-rose-500"
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              onClick={() => {
                setShowDeleteAccountModal(false);
                setDeleteConfirmText('');
              }}
              className="text-xs font-semibold rounded-[8px]"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteConfirmText !== 'HAPUS AKUN SAYA' || isDeletingAccount}
              onClick={handleDeleteAccountConfirm}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-[8px] disabled:opacity-50"
            >
              {isDeletingAccount ? 'Menghapus...' : 'Ya, Hapus Akun'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
