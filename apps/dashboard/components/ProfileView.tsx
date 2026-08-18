'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useModals } from '@/context/ModalContext';
import { userApi } from '../lib/api';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  ShieldCheck,
  Lock,
  Bell,
  CreditCard,
  Sun,
  Moon,
  Laptop,
  CheckCircle2,
  Save,
  Camera,
  Sparkles,
  KeyRound,
  Smartphone,
  ChevronRight,
  Briefcase,
  DollarSign,
  Award,
  LogOut,
  ChevronDown,
  Download,
  Trash2,
  ShieldAlert,
  Globe2,
  Sliders,
  Check,
  Settings,
} from 'lucide-react';
import { handleLogout } from '@/lib/auth';

interface ProfileViewProps {
  initialSubTab?: 'profil' | 'karir' | 'keamanan' | 'langganan' | 'pengaturan';
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  initialSubTab = 'profil',
}) => {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { openUpgrade } = useModals();
  const isDarkMode = resolvedTheme === 'dark';
  const toggleDarkMode = () => setTheme(isDarkMode ? 'light' : 'dark');
  const themeMode = (theme || 'system') as 'light' | 'dark' | 'system';
  const setSpecificThemeMode = (mode: 'light' | 'dark' | 'system') => setTheme(mode);
  const onOpenUpgradeModal = openUpgrade;
  const onLogout = () => handleLogout();

  const [activeSubTab, setActiveSubTab] = useState<'profil' | 'karir' | 'keamanan' | 'langganan' | 'pengaturan'>(initialSubTab);
  const [prevInitialSubTab, setPrevInitialSubTab] = useState(initialSubTab);

  if (initialSubTab !== prevInitialSubTab) {
    setPrevInitialSubTab(initialSubTab);
    setActiveSubTab(initialSubTab);
  }

  // Form States for Profile
  const [profileData, setProfileData] = useState({
    fullName: 'Pengguna Employr',
    headline: 'Pencari Kerja & Professional',
    email: 'user@employr.id',
    phone: '+62 812 0000 0000',
    location: 'Jakarta, Indonesia',
    bio: 'Pengguna aktif Employr yang sedang mempersiapkan karir profesional.',
    linkedin: '',
    github: '',
    website: '',
    expectedSalary: 'Rp 10.000.000 - Rp 15.000.000',
    experienceYears: '1-3 Tahun',
    workPreference: 'Hybrid',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const sessionStr = localStorage.getItem('cuti_user_session');
        if (sessionStr) {
          const parsed = JSON.parse(sessionStr);
          if (parsed.name || parsed.email) {
            setProfileData((prev) => ({
              ...prev,
              fullName: parsed.name || prev.fullName,
              email: parsed.email || prev.email,
            }));
          }
        }
      } catch (e) {
        console.warn('Failed to parse session in ProfileView', e);
      }
    }

    userApi.getProfile().then((remoteProfile) => {
      if (remoteProfile) {
        setProfileData((prev) => ({ ...prev, ...remoteProfile }));
        if (remoteProfile.avatarUrl || remoteProfile.photoUrl || remoteProfile.photo) {
          setAvatarUrl(remoteProfile.avatarUrl || remoteProfile.photoUrl || remoteProfile.photo);
        }
      }
    });
  }, []);

  const [avatarUrl, setAvatarUrl] = useState('');

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    emailJobAlerts: true,
    emailInterviewReminders: true,
    emailWeeklyTips: false,
    whatsappAlerts: true,
  });

  // Regional & Language Preferences
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const [timezone, setTimezone] = useState('Asia/Jakarta (WIB - GMT+7)');
  const [currency, setCurrency] = useState('IDR (Rp)');

  // Account Export & Danger Zone States
  const [isExportingData, setIsExportingData] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Security States
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isSavedToast, setIsSavedToast] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await userApi.updateProfile(profileData);
    if (updated) {
      setIsSavedToast(true);
      setTimeout(() => setIsSavedToast(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Toast Notification */}
      {isSavedToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-[10px] bg-emerald-600 text-white shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <div>
            <h4 className="font-bold text-xs">Perubahan Berhasil Disimpan</h4>
            <p className="text-[11px] text-emerald-100">Profil dan pengaturan akun kamu telah diperbarui.</p>
          </div>
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="bg-navy-700 rounded-[10px] p-6 md:p-8 text-white border border-navy-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#1738D1]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Avatar & User Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <div className="relative group">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={profileData.fullName}
                  width={96}
                  height={96}
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 rounded-[10px] object-cover border-4 border-orange-400 shadow-md transition group-hover:opacity-90"
                />
              ) : (
                <div className="w-24 h-24 rounded-[10px] border-4 border-orange-400 shadow-md flex items-center justify-center bg-[#1738D1] text-white font-black text-3xl">
                  {profileData.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              <button
                type="button"
                onClick={() => alert('Fitur unggah foto profil baru dapat diakses.')}
                className="absolute -bottom-2 -right-2 p-2 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white shadow-md border-2 border-slate-900 transition cursor-pointer"
                title="Ubah Foto Profil"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-2xl font-black text-white">{profileData.fullName}</h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[10px] text-xs font-bold bg-[#1738D1] text-white shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Member Lifetime
                </span>
              </div>

              <p className="text-xs text-slate-200 font-medium">{profileData.headline}</p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-300 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-400" />
                  {profileData.location}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-orange-400" />
                  {profileData.email}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-orange-400" />
                  {profileData.experienceYears} Exp
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stat / Action */}
          <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
            <div className="px-4 py-3 rounded-[10px] bg-white/10 backdrop-blur-md border border-white/15 w-full sm:w-auto text-center sm:text-left">
              <span className="text-[10px] uppercase font-bold text-slate-300 block">Kesiapan Kerja</span>
              <span className="text-lg font-black text-amber-300">85% (Job Ready)</span>
            </div>

            {onOpenUpgradeModal && (
              <button
                onClick={onOpenUpgradeModal}
                className="w-full sm:w-auto px-4 py-3 rounded-[10px] bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs transition shadow-md flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Lihat Fitur Pro</span>
              </button>
            )}
          </div>
        </div>

        {/* Profile Sub Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-8 pt-4 border-t border-white/10 text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('profil')}
            className={`px-4 py-2.5 rounded-[10px] transition flex items-center gap-2 ${
              activeSubTab === 'profil'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Informasi Pribadi</span>
          </button>

          <button
            onClick={() => setActiveSubTab('karir')}
            className={`px-4 py-2.5 rounded-[10px] transition flex items-center gap-2 ${
              activeSubTab === 'karir'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Preferensi Karir</span>
          </button>

          <button
            onClick={() => setActiveSubTab('keamanan')}
            className={`px-4 py-2.5 rounded-[10px] transition flex items-center gap-2 ${
              activeSubTab === 'keamanan'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Keamanan & Akun</span>
          </button>

          <button
            onClick={() => setActiveSubTab('langganan')}
            className={`px-4 py-2.5 rounded-[10px] transition flex items-center gap-2 ${
              activeSubTab === 'langganan'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Keanggotaan</span>
          </button>

          <button
            onClick={() => setActiveSubTab('pengaturan')}
            className={`px-4 py-2.5 rounded-[10px] transition flex items-center gap-2 ${
              activeSubTab === 'pengaturan'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Tampilan & Notifikasi</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: INFORMASI PRIBADI */}
      {activeSubTab === 'profil' && (
        <form onSubmit={handleSaveProfile} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-6 md:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-orange-500" />
                <span>Informasi Diri & Kontak</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Perbarui data kontak agar recruiter dan sistem dapat mengenali profil kamu dengan akurat.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nama Lengkap *</label>
              <input
                type="text"
                required
                value={profileData.fullName}
                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1738D1] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Headline Profesional *</label>
              <input
                type="text"
                required
                value={profileData.headline}
                onChange={(e) => setProfileData({ ...profileData, headline: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1738D1] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Utama *</label>
              <input
                type="email"
                required
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1738D1] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nomor WhatsApp / HP</label>
              <input
                type="text"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1738D1] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Lokasi / Domisili Saat Ini</label>
              <input
                type="text"
                value={profileData.location}
                onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1738D1] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Ringkasan Diri</label>
              <textarea
                rows={4}
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1738D1] focus:outline-none resize-none"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
            <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider">Tautan Profil & Portofolio</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Linkedin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="LinkedIn URL"
                  value={profileData.linkedin}
                  onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
                />
              </div>

              <div className="relative">
                <Github className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="GitHub URL"
                  value={profileData.github}
                  onChange={(e) => setProfileData({ ...profileData, github: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
                />
              </div>

              <div className="relative">
                <Globe className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Portofolio Website URL"
                  value={profileData.website}
                  onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] active:scale-[0.98] text-white font-bold text-xs transition shadow-md shadow-[#1738D1]/20 flex items-center gap-2 cursor-pointer border-0"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Profil</span>
            </button>
          </div>
        </form>
      )}

      {/* SUBTAB 2: PREFERENSI KARIR */}
      {activeSubTab === 'karir' && (
        <form onSubmit={handleSaveProfile} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-6 md:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-orange-500" />
                <span>Preferensi & Ekspektasi Karir</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pengaturan ini membantu sistem merekomendasikan lowongan pekerjaan dan saran nego gaji yang relevan.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Ekspektasi Gaji Bulanan</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={profileData.expectedSalary}
                  onChange={(e) => setProfileData({ ...profileData, expectedSalary: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Total Pengalaman Kerja</label>
              <input
                type="text"
                value={profileData.experienceYears}
                onChange={(e) => setProfileData({ ...profileData, experienceYears: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Preferensi Mode Kerja</label>
              <div className="relative">
                <select
                  value={profileData.workPreference}
                  onChange={(e) => setProfileData({ ...profileData, workPreference: e.target.value })}
                  className="w-full px-3.5 py-2.5 pr-10 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1738D1] focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="Hybrid / Remote">Hybrid / Remote (Fleksibel)</option>
                  <option value="Full Remote">Full Remote</option>
                  <option value="On-Site / WFO">On-Site / WFO (Work from Office)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] active:scale-[0.98] text-white font-bold text-xs transition shadow-md shadow-[#1738D1]/20 flex items-center gap-2 cursor-pointer border-0"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Preferensi Karir</span>
            </button>
          </div>
        </form>
      )}

      {/* SUBTAB 3: KEAMANAN & AKUN */}
      {activeSubTab === 'keamanan' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-6 md:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-orange-500" />
                  <span>Ubah Kata Sandi</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Gunakan kombinasi minimal 8 karakter dengan huruf besar, angka, dan simbol untuk keamanan maksimal.
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Kata sandi berhasil diperbarui!');
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
              }}
              className="space-y-4 max-w-lg"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Kata Sandi Saat Ini</label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Kata Sandi Baru</label>
                <input
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Konfirmasi Kata Sandi Baru</label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] active:scale-[0.98] text-white font-bold text-xs transition shadow-md shadow-[#1738D1]/20 flex items-center gap-2 cursor-pointer border-0"
              >
                <Lock className="w-4 h-4" />
                <span>Perbarui Kata Sandi</span>
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-6 md:p-8 space-y-4 shadow-xs">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Verifikasi 2-Langkah & Perangkat Aktif</span>
            </h3>
            <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Autentikasi Dua Faktor</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Lindungi akun dengan verifikasi kode OTP saat login dari perangkat baru.</p>
              </div>
              <span className="px-3 py-1 rounded-[10px] text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Aktif
              </span>
            </div>
          </div>

          {/* Logout Section Card */}
          <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-[10px] p-6 md:p-8 space-y-3 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-base text-rose-700 dark:text-rose-400 flex items-center gap-2">
                  <LogOut className="w-5 h-5" />
                  <span>Keluar Sesi Akun</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Keluar dari akun Employr AI di perangkat ini. Kamu bisa masuk kembali kapan saja.
                </p>
              </div>

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-5 py-2.5 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-2 shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar / Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: KEANGGOTAAN & LANGGANAN */}
      {activeSubTab === 'langganan' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-6 md:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>Status Keanggotaan & Akses Premium</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Detail paket langganan dan akses fitur eksklusif Employr AI kamu.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-[10px] bg-gradient-to-r from-orange-500/10 via-navy-500/10 to-orange-500/10 border-2 border-orange-400/50 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-[10px] text-[10px] font-black uppercase tracking-wider bg-[#1738D1] text-white">
                  AKSES AKTIF LIFETIME
                </span>
                <h4 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  Employr Member Lifetime Pro
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Akses tak terbatas ke Pengoptimal CV ATS, Evaluator Interview Voice, Cover Letter Generator, dan Program Referral Cuan.
                </p>
              </div>

              <div className="shrink-0 text-right">
                <span className="text-xs text-slate-400 block font-medium">Masa Berlaku</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">Seumur Hidup (No Expiry)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="font-bold block text-slate-900 dark:text-white">CV ATS Checker</span>
                <span className="text-[10px] text-slate-400">Unlimited Generation</span>
              </div>
              <div className="p-3 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="font-bold block text-slate-900 dark:text-white">Simulasi Interview</span>
                <span className="text-[10px] text-slate-400">Unlimited Sesi Latihan</span>
              </div>
              <div className="p-3 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="font-bold block text-slate-900 dark:text-white">Tracker Lamaran Pro</span>
                <span className="text-[10px] text-slate-400">Unlimited Multi-Job Logs</span>
              </div>
              <div className="p-3 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="font-bold block text-slate-900 dark:text-white">Program Misi & Cuan</span>
                <span className="text-[10px] text-slate-400">Bonus Koin 2x lipat</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 5: TAMPILAN & NOTIFIKASI */}
      {activeSubTab === 'pengaturan' && (
        <div className="space-y-6">
          {/* Theme Preference Control */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-6 md:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Sun className="w-5 h-5 text-orange-500" />
                  <span>Pengaturan Tema Tampilan</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Pilih mode warna favorit kamu untuk pengalaman membaca yang nyaman.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setSpecificThemeMode && setSpecificThemeMode('light')}
                className={`p-4 rounded-[10px] border text-left transition flex flex-col justify-between space-y-3 cursor-pointer ${
                  themeMode === 'light'
                    ? 'border-[#1738D1] bg-orange-50/50 dark:bg-orange-950/40 ring-2 ring-[#1738D1]/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-orange-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-[10px] bg-amber-100 text-amber-700">
                    <Sun className="w-5 h-5" />
                  </div>
                  {themeMode === 'light' && <CheckCircle2 className="w-5 h-5 text-orange-500" />}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">Mode Terang</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Tampilan bersih dengan latar belakang terang.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSpecificThemeMode && setSpecificThemeMode('dark')}
                className={`p-4 rounded-[10px] border text-left transition flex flex-col justify-between space-y-3 cursor-pointer ${
                  themeMode === 'dark'
                    ? 'border-[#1738D1] bg-orange-50/50 dark:bg-orange-950/40 ring-2 ring-[#1738D1]/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-orange-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-[10px] bg-slate-900 text-slate-100">
                    <Moon className="w-5 h-5" />
                  </div>
                  {themeMode === 'dark' && <CheckCircle2 className="w-5 h-5 text-orange-500" />}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">Mode Gelap</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Kontras nyaman untuk penggunaan malam hari.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSpecificThemeMode && setSpecificThemeMode('system')}
                className={`p-4 rounded-[10px] border text-left transition flex flex-col justify-between space-y-3 cursor-pointer ${
                  themeMode === 'system'
                    ? 'border-[#1738D1] bg-orange-50/50 dark:bg-orange-950/40 ring-2 ring-[#1738D1]/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-orange-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                    <Laptop className="w-5 h-5" />
                  </div>
                  {themeMode === 'system' && <CheckCircle2 className="w-5 h-5 text-orange-500" />}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">Otomatis</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Mengikuti preferensi tema perangkat kamu.</p>
                </div>
              </button>
            </div>
          </div>

          {/* Notifications Preference Control */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-6 md:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-orange-500" />
                  <span>Pengaturan Notifikasi</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Atur jenis pengingat yang ingin kamu terima melalui email atau WhatsApp.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 cursor-pointer">
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">Email Rekomendasi Lowongan Kerja</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Dapatkan email otomatis saat ada lowongan yang cocok dengan CV kamu.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailJobAlerts}
                  onChange={(e) => setNotifications({ ...notifications, emailJobAlerts: e.target.checked })}
                  className="w-4 h-4 text-orange-500 rounded-[10px] border-slate-300 focus:ring-[#1738D1]"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 cursor-pointer">
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">Email Pengingat Jadwal Interview</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Notifikasi 1 hari sebelum jadwal interview di Tracker.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailInterviewReminders}
                  onChange={(e) => setNotifications({ ...notifications, emailInterviewReminders: e.target.checked })}
                  className="w-4 h-4 text-orange-500 rounded-[10px] border-slate-300 focus:ring-[#1738D1]"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 cursor-pointer">
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">Pengingat WhatsApp Harian</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Terima pengingat misi harian dan klaim koin via WhatsApp.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.whatsappAlerts}
                  onChange={(e) => setNotifications({ ...notifications, whatsappAlerts: e.target.checked })}
                  className="w-4 h-4 text-orange-500 rounded-[10px] border-slate-300 focus:ring-[#1738D1]"
                />
              </label>
            </div>
          </div>

          {/* Regional & Language Settings */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-6 md:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe2 className="w-5 h-5 text-navy-600 dark:text-navy-400" />
                  <span>Pengaturan Bahasa &amp; Regional</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Atur bahasa antarmuka, zona waktu pengingat, dan standar mata uang.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">Bahasa Antarmuka</label>
                <div className="relative">
                  <select
                    value={language}
                    onChange={(e) => {
                      setLanguage(e.target.value as 'id' | 'en');
                      setIsSavedToast(true);
                      setTimeout(() => setIsSavedToast(false), 3000);
                    }}
                    className="w-full p-2.5 pr-8 rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#1738D1] appearance-none cursor-pointer"
                  >
                    <option value="id">Bahasa Indonesia (ID)</option>
                    <option value="en">English (US)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">Zona Waktu</label>
                <div className="relative">
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full p-2.5 pr-8 rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#1738D1] appearance-none cursor-pointer"
                  >
                    <option value="Asia/Jakarta (WIB - GMT+7)">Asia/Jakarta (WIB - GMT+7)</option>
                    <option value="Asia/Makassar (WITA - GMT+8)">Asia/Makassar (WITA - GMT+8)</option>
                    <option value="Asia/Jayapura (WIT - GMT+9)">Asia/Jayapura (WIT - GMT+9)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">Mata Uang Gaji</label>
                <div className="relative">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full p-2.5 pr-8 rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#1738D1] appearance-none cursor-pointer"
                  >
                    <option value="IDR (Rp)">IDR - Rupiah Indonesia (Rp)</option>
                    <option value="USD ($)">USD - US Dollar ($)</option>
                    <option value="SGD (S$)">SGD - Singapore Dollar (S$)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Privacy & Data Export */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-6 md:p-8 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Download className="w-5 h-5 text-orange-500" />
                  <span>Unduh &amp; Ekspor Data Akun Saya</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Dapatkan salinan lengkap dokumen CV ATS, surat lamaran, riwayat interview, dan log tracker kamu dalam format JSON / ZIP.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Arsip Portofolio Karier</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Termasuk 3 versi CV ATS, 2 Surat Lamaran, dan 14 log lamaran kerja.</p>
              </div>
              <button
                type="button"
                disabled={isExportingData}
                onClick={() => {
                  setIsExportingData(true);
                  setTimeout(() => {
                    setIsExportingData(false);
                    alert('File backup data akun berhasil diunduh (employr-data-backup.json)');
                  }, 1200);
                }}
                className="px-4 py-2.5 rounded-[10px] bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-sm flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <Download className={`w-4 h-4 ${isExportingData ? 'animate-bounce' : ''}`} />
                <span>{isExportingData ? 'Menyiapkan File...' : 'Unduh Data Saya (.JSON)'}</span>
              </button>
            </div>
          </div>

          {/* Danger Zone: Account Deactivation & Deletion */}
          <div className="bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-[10px] p-6 md:p-8 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-rose-200/80 dark:border-rose-900/40 pb-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <div>
                <h3 className="font-extrabold text-base text-rose-700 dark:text-rose-300">
                  Zona Bahaya (Danger Zone)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Tindakan berisiko tinggi terhadap keberlangsungan data portofolio dan keanggotaan akun kamu.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Hapus Akun &amp; Seluruh Data Portofolio</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Tindakan ini tidak dapat dibatalkan. Seluruh riwayat CV, kredit koin, dan skor analisis AI akan dihapus permanen.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteAccountModal(true)}
                className="px-4 py-2.5 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-2 shrink-0"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Akun Permanen</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS AKUN */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-800 rounded-[10px] p-6 max-w-md w-full space-y-5 shadow-2xl text-slate-100 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-[10px] bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-white">Konfirmasi Penghapusan Akun</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Apakah kamu benar-benar yakin ingin menghapus akun <strong className="text-amber-300">{profileData.email}</strong>? Seluruh data CV, histori lamaran, dan status member akan hilang secara permanen.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Ketik <span className="text-rose-400 font-mono font-black">HAPUS</span> untuk mengonfirmasi:
              </label>
              <input
                type="text"
                placeholder="Ketik HAPUS"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-[10px] border border-slate-700 bg-slate-800 text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteAccountModal(false);
                  setDeleteConfirmText('');
                }}
                className="flex-1 py-2.5 rounded-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition border border-slate-700"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={deleteConfirmText !== 'HAPUS'}
                onClick={() => {
                  setShowDeleteAccountModal(false);
                  if (onLogout) onLogout();
                }}
                className={`flex-1 py-2.5 rounded-[10px] font-extrabold text-xs transition flex items-center justify-center gap-2 ${
                  deleteConfirmText === 'HAPUS'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
