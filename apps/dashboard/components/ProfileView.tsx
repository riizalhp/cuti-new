'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useToast } from '@/components/ui/Toast';
import { useModals } from '@/context/ModalContext';
import { UserAvatar } from './UserAvatar';
import { userApi } from '../lib/api';
import { getStoredSession, setSessionCookie } from '@/lib/auth';
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
  Calendar,
  Building,
  ExternalLink,
  FileText,
  Eye,
  RefreshCw,
  Clock,
  Layers,
  CheckCircle,
  Pencil,
  X,
} from 'lucide-react';
import { handleLogout } from '@/lib/auth';

function normalizeExperienceYears(val?: string | null): string {
  if (!val) return '';
  const lower = val.toLowerCase().trim();
  if (lower.includes('fresh') || lower === '0 tahun' || lower === '0') return 'Fresh Graduate (0-1 Tahun)';
  if (
    lower.includes('junior') ||
    lower.includes('1-3') ||
    lower.includes('berpengalaman') ||
    lower === '1 tahun' ||
    lower === '2 tahun' ||
    lower === '3 tahun' ||
    lower === '1' ||
    lower === '2' ||
    lower === '3'
  )
    return 'Junior (1-3 Tahun)';
  if (lower.includes('mid') || lower.includes('3-5') || lower === '4 tahun' || lower === '5 tahun' || lower === '4')
    return 'Mid-Level (3-5 Tahun)';
  if (
    lower.includes('senior') ||
    lower.includes('5+') ||
    lower.includes('5 tahun') ||
    lower.includes('6 tahun') ||
    lower.includes('7 tahun') ||
    lower.includes('8 tahun') ||
    lower.includes('10 tahun')
  )
    return 'Senior (5+ Tahun)';
  if (lower.includes('magang') || lower.includes('intern')) return 'Magang / Internship';
  return val;
}

function normalizeWorkPreference(val?: string | null): string {
  if (!val) return '';
  const lower = val.toLowerCase().trim();
  if (lower.includes('hybrid') || (lower.includes('remote') && lower.includes('hybrid'))) return 'Hybrid / Remote';
  if (lower.includes('full remote') || lower === 'remote') return 'Full Remote';
  if (lower.includes('on-site') || lower.includes('wfo') || lower.includes('kantor') || lower.includes('onsite')) return 'On-Site / WFO';
  return val;
}

interface ProfileViewProps {
  initialSubTab?: 'profil' | 'karir' | 'keamanan' | 'pengaturan';
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  initialSubTab = 'profil',
}) => {
  const router = useRouter();
  const toast = useToast();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { openUpgrade } = useModals();
  const isDarkMode = resolvedTheme === 'dark';
  const themeMode = (theme || 'system') as 'light' | 'dark' | 'system';
  const setSpecificThemeMode = (mode: 'light' | 'dark' | 'system') => setTheme(mode);
  const onLogout = () => handleLogout();

  const safeInitialSubTab = (initialSubTab as string) === 'langganan' ? 'profil' : (initialSubTab || 'profil');
  const [activeSubTab, setActiveSubTab] = useState<'profil' | 'karir' | 'keamanan' | 'pengaturan'>(safeInitialSubTab);
  const [prevInitialSubTab, setPrevInitialSubTab] = useState(safeInitialSubTab);

  if (safeInitialSubTab !== prevInitialSubTab) {
    setPrevInitialSubTab(safeInitialSubTab);
    setActiveSubTab(safeInitialSubTab);
  }

  // Form States for Profile - Default empty strings, user fills manual if not in onboarding
  const [profileData, setProfileData] = useState({
    fullName: '',
    headline: '',
    email: '',
    phone: '',
    location: '',
    address: '',
    gender: '',
    birthDate: '',
    bio: '',
    linkedin: '',
    github: '',
    website: '',
    portfolio: '',
    targetRole: '',
    targetIndustry: '',
    expectedSalary: '',
    experienceYears: '',
    workPreference: '',
    targetCities: '',
    availability: '',
    canRelocate: false,
    negotiableSalary: true,
    desiredBenefits: [] as string[],
  });

  const [avatarUrl, setAvatarUrl] = useState('');
  // Membership asli dari database (dipakai untuk ekspor data akun)
  const [membershipRef, setMembershipRef] = useState<{ tier?: string; packageName?: string; isActive?: boolean; isLifetime?: boolean } | null>(null);

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    emailJobAlerts: true,
    emailInterviewReminders: true,
    emailWeeklyTips: false,
    whatsappAlerts: true,
    whatsappMisiReminder: true,
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

  const [isSaving, setIsSaving] = useState(false);

  // Hitung kelengkapan profil secara dinamis berdasarkan data aktual yang terisi
  const completenessScore = React.useMemo(() => {
    const fieldsToEvaluate = [
      profileData.fullName,
      profileData.headline,
      profileData.email,
      profileData.phone,
      profileData.location,
      profileData.bio,
      profileData.targetRole,
      profileData.expectedSalary,
      profileData.experienceYears,
      profileData.address,
      profileData.gender,
      profileData.birthDate,
    ];
    const filled = fieldsToEvaluate.filter((v) => typeof v === 'string' && v.trim().length > 0).length;
    return Math.round((filled / fieldsToEvaluate.length) * 100);
  }, [profileData]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = getStoredSession();
        if (stored) {
          setProfileData((prev) => ({
            ...prev,
            fullName: stored.name || prev.fullName,
            email: stored.email || prev.email,
            phone: stored.phone || prev.phone,
          }));
        }
      } catch (e) {
        console.warn('Failed to parse session in ProfileView', e);
      }
    }

    userApi.getProfile().then((remoteProfile) => {
      if (remoteProfile) {
        let resolvedBio = remoteProfile.bio || '';
        if (!resolvedBio && typeof window !== 'undefined') {
          try {
            const onboardingRaw = localStorage.getItem('cuti_onboarding_profile');
            const importedRaw = localStorage.getItem('cuti_imported_cv_data');
            if (onboardingRaw) {
              const parsed = JSON.parse(onboardingRaw);
              if (parsed?.summary && typeof parsed.summary === 'string') resolvedBio = parsed.summary;
            }
            if (!resolvedBio && importedRaw) {
              const parsed = JSON.parse(importedRaw);
              if (parsed?.summary && typeof parsed.summary === 'string') resolvedBio = parsed.summary;
            }
          } catch {}
        }

        const loadedData = {
          fullName: remoteProfile.fullName || remoteProfile.name || '',
          email: remoteProfile.email || '',
          phone: remoteProfile.phone || '',
          location: remoteProfile.location || '',
          headline: remoteProfile.headline || '',
          bio: resolvedBio,
          targetRole: remoteProfile.targetRole || remoteProfile.targetJob || remoteProfile.targetPosition || '',
          expectedSalary: remoteProfile.expectedSalary || '',
          experienceYears: normalizeExperienceYears(remoteProfile.experienceYears) || '',
          address: remoteProfile.address || '',
          gender: remoteProfile.gender || '',
          birthDate: remoteProfile.birthDate || '',
          linkedin: remoteProfile.linkedin || '',
          github: remoteProfile.github || '',
          website: remoteProfile.website || '',
          portfolio: remoteProfile.portfolio || '',
          targetIndustry: remoteProfile.targetIndustry || '',
          workPreference: normalizeWorkPreference(remoteProfile.workPreference) || '',
          targetCities: remoteProfile.targetCities || '',
          availability: remoteProfile.availability || '',
          canRelocate: Boolean(remoteProfile.canRelocate),
          negotiableSalary: remoteProfile.negotiableSalary ?? true,
          desiredBenefits: Array.isArray(remoteProfile.desiredBenefits)
            ? remoteProfile.desiredBenefits
            : Array.isArray(remoteProfile.preferences?.desiredBenefits)
            ? remoteProfile.preferences.desiredBenefits
            : [],
        };

        setProfileData(loadedData);
        setOriginalProfileData(loadedData);

        if (remoteProfile.avatarUrl || remoteProfile.photoUrl || remoteProfile.photo) {
          setAvatarUrl(remoteProfile.avatarUrl || remoteProfile.photoUrl || remoteProfile.photo);
        }
        if (remoteProfile.membership) {
          setMembershipRef(remoteProfile.membership);
        }

        // Muat preferensi notifikasi & regional yang tersimpan di database
        const savedPrefs = remoteProfile.preferences;
        if (savedPrefs) {
          if (savedPrefs.notifications && typeof savedPrefs.notifications === 'object') {
            setNotifications((prev) => ({ ...prev, ...savedPrefs.notifications }));
          }
          if (savedPrefs.language === 'id' || savedPrefs.language === 'en') setLanguage(savedPrefs.language);
          if (typeof savedPrefs.timezone === 'string') setTimezone(savedPrefs.timezone);
          if (typeof savedPrefs.currency === 'string') setCurrency(savedPrefs.currency);
          if (savedPrefs.theme === 'light' || savedPrefs.theme === 'dark' || savedPrefs.theme === 'system') {
            setTheme(savedPrefs.theme);
          }
        }
      }
    });
  }, []);

  const [isEditing, setIsEditing] = useState(false);
  const [originalProfileData, setOriginalProfileData] = useState<typeof profileData | null>(null);

  const handleStartEdit = () => {
    setOriginalProfileData({ ...profileData });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (originalProfileData) {
      setProfileData({ ...originalProfileData });
    }
    setIsEditing(false);
  };

  const handleSaveProfile = async (
    e?: React.FormEvent,
    overrides?: {
      profile?: Partial<typeof profileData>;
      notifications?: typeof notifications;
      language?: 'id' | 'en';
      timezone?: string;
      currency?: string;
    }
  ) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    const mergedProfile = {
      ...profileData,
      ...(overrides?.profile || {}),
    };

    const mergedNotifications = overrides?.notifications || notifications;
    const mergedLanguage = overrides?.language || language;
    const mergedTimezone = overrides?.timezone || timezone;
    const mergedCurrency = overrides?.currency || currency;

    try {
      const res = await userApi.updateProfile({
        ...mergedProfile,
        targetRole: mergedProfile.targetRole,
        targetJob: mergedProfile.targetRole,
        targetPosition: mergedProfile.targetRole,
        preferences: {
          notifications: mergedNotifications,
          language: mergedLanguage,
          timezone: mergedTimezone,
          currency: mergedCurrency,
          theme: themeMode,
        },
      });

      if (!res) {
        toast.error('Gagal Menyimpan', 'Terjadi kesalahan sistem saat memperbarui data profil.');
        setIsSaving(false);
        return;
      }

      const updatedRole = res.targetRole || res.targetJob || mergedProfile.targetRole;
      const updatedExp = normalizeExperienceYears(res.experienceYears) || mergedProfile.experienceYears;
      const updatedWork = normalizeWorkPreference(res.workPreference) || mergedProfile.workPreference;
      const updatedBenefits = Array.isArray(res.desiredBenefits)
        ? res.desiredBenefits
        : Array.isArray(res.preferences?.desiredBenefits)
        ? res.preferences.desiredBenefits
        : mergedProfile.desiredBenefits;

      const syncedProfile = {
        ...mergedProfile,
        targetRole: updatedRole,
        expectedSalary: res.expectedSalary || mergedProfile.expectedSalary,
        experienceYears: updatedExp,
        workPreference: updatedWork,
        targetIndustry: res.targetIndustry || mergedProfile.targetIndustry,
        targetCities: res.targetCities ?? mergedProfile.targetCities,
        availability: res.availability || mergedProfile.availability,
        canRelocate: res.canRelocate !== undefined ? Boolean(res.canRelocate) : mergedProfile.canRelocate,
        negotiableSalary: res.negotiableSalary !== undefined ? Boolean(res.negotiableSalary) : mergedProfile.negotiableSalary,
        desiredBenefits: updatedBenefits,
      };

      setProfileData(syncedProfile);
      setOriginalProfileData({ ...syncedProfile });
      setIsEditing(false);

      // Sinkronkan cookie sesi dan localStorage agar refresh & header segera terupdate
      if (typeof window !== 'undefined') {
        const stored = getStoredSession();
        if (stored) {
          const updatedSession = {
            ...stored,
            name: mergedProfile.fullName || stored.name,
            phone: mergedProfile.phone || stored.phone,
          };
          setSessionCookie(updatedSession, 30);
        }
      }

      toast.success('Perubahan Berhasil Disimpan', 'Data profil dan pengaturan akun kamu telah diperbarui.');
    } catch (err) {
      toast.error('Gagal Menyimpan', 'Terjadi kesalahan sistem saat memperbarui profil.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = () => {
    setIsExportingData(true);
    setTimeout(() => {
      const exportBlob = new Blob(
        [
          JSON.stringify(
            {
              accountProfile: profileData,
              preferences: { notifications, language, timezone, currency },
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
      link.download = `employr-data-${profileData.fullName.toLowerCase().replace(/\s+/g, '-')}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setIsExportingData(false);
      toast.success('Data Berhasil Diunduh', 'Salinan lengkap data akun dan CV berhasil disimpan ke perangkat.');
    }, 1000);
  };

  return (
    <div className="w-full space-y-6 md:space-y-8 font-sans pb-16">
      {/* USER PROFILE OVERVIEW HERO CARD */}
      <div className="relative overflow-hidden rounded-[10px] bg-[#162758] border border-[#20367A] text-white p-5 sm:p-6 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Left: Avatar & Identity Details */}
          <div className="flex items-center gap-4 min-w-0">
            <div
              className={`relative shrink-0 ${isEditing ? 'group cursor-pointer' : ''}`}
              onClick={() => {
                if (isEditing) {
                  toast.info('Ubah Foto Profil', 'Silakan pilih berkas foto formal terbaik Anda.');
                }
              }}
              title={isEditing ? 'Klik untuk ubah foto profil' : undefined}
            >
              <UserAvatar
                name={profileData.fullName || 'Pengguna Employr'}
                photoUrl={avatarUrl}
                size={64}
                square={true}
                variant="beam"
                className="w-16 h-16 rounded-[12px] border-2 border-white/30 shadow-md transition"
              />
              {isEditing && (
                <div className="absolute inset-0 rounded-[12px] bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              )}
            </div>

            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-extrabold text-base sm:text-lg text-white tracking-tight truncate">
                  {profileData.fullName || 'Profil Pengguna'}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[6px] text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  <ShieldCheck className="w-3 h-3 text-blue-300" />
                  Akun Terverifikasi
                </span>
                {!isEditing ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-white/10 text-blue-200 border border-white/15">
                    <Lock className="w-2.5 h-2.5" />
                    Read Only
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-orange-500/30 text-orange-200 border border-orange-400/40 animate-pulse">
                    <Pencil className="w-2.5 h-2.5" />
                    Mode Edit
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-200 font-medium truncate">
                {profileData.headline || 'Pencari Kerja Aktif'}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-slate-300 pt-0.5 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-blue-300" />
                  {profileData.email || 'Email belum diatur'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-400" />
                  {profileData.phone || 'Nomor HP belum diatur'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-orange-400" />
                  {profileData.location || 'Lokasi belum diatur'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Profile Readiness Meter & Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="p-3 rounded-[10px] bg-white/10 border border-white/15 backdrop-blur-xs flex items-center gap-3 min-w-[200px]">
              <div className="w-10 h-10 rounded-[8px] bg-amber-400/20 border border-amber-400/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
                  Kelengkapan Profil
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-black text-amber-300">{completenessScore}%</span>
                  <div className="flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden">
                    <div
                      className="h-full bg-amber-300 rounded-full transition-all duration-500"
                      style={{ width: `${completenessScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {!isEditing ? (
              <button
                type="button"
                onClick={handleStartEdit}
                className="px-4 py-2.5 rounded-[10px] bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold text-xs transition shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Profil</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => toast.info('Ubah Foto Profil', 'Silakan pilih berkas foto profil formal kamu.')}
                  className="px-3 py-2.5 rounded-[10px] bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5 text-orange-400" />
                  <span>Foto</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3.5 py-2.5 rounded-[10px] bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Batal</span>
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSaveProfile()}
                  className="px-4 py-2.5 rounded-[10px] bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-black text-xs transition shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SUB-NAVIGATION TABS (High Contrast, Accessible & No-Scrollbar) */}
      <div className="flex items-center gap-1.5 p-1 rounded-[10px] bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 overflow-x-auto no-scrollbar text-xs font-bold">
        {[
          { id: 'profil', label: 'Profil & Kontak', icon: User, desc: 'Biodata & Identitas' },
          { id: 'karir', label: 'Preferensi Karir', icon: Briefcase, desc: 'Target & Gaji' },
          { id: 'keamanan', label: 'Keamanan & Akun', icon: Lock, desc: 'Sandi & Sesi' },
          { id: 'pengaturan', label: 'Tampilan & Sistem', icon: Sliders, desc: 'Tema & Notifikasi' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id as 'profil' | 'karir' | 'keamanan' | 'pengaturan')}
              className={`px-3.5 py-2.5 rounded-[8px] transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-[#1738D1] dark:text-blue-400 shadow-xs border border-slate-200/80 dark:border-slate-700 font-extrabold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#1738D1] dark:text-blue-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: PROFIL & KONTAK */}
      {/* ========================================================================= */}
      {activeSubTab === 'profil' && (
        <form onSubmit={handleSaveProfile} className="space-y-6 animate-in fade-in duration-200">
          {/* Section Heading Banner */}
          <div className="flex items-center justify-between p-4 rounded-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[8px] bg-[#1738D1]/10 dark:bg-blue-950 text-[#1738D1] dark:text-blue-400 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Informasi Biodata &amp; Kontak Pribadi
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Data ini digunakan sebagai basis otomatis saat menyusun CV ATS, melamar lowongan, dan personalisasi cover letter.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="px-3.5 py-1.5 rounded-[8px] bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer transition"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              ) : (
                <span className="px-2.5 py-1 rounded-[6px] text-[10px] font-black uppercase tracking-wider bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 flex items-center gap-1">
                  <Pencil className="w-3 h-3" /> Mode Edit
                </span>
              )}
            </div>
          </div>

          {/* Sub-Card 1: Identitas Diri */}
          <div className="p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span>1. Data Identitas Diri</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Pastikan nama sesuai dengan berkas resmi (KTP / Ijazah).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  disabled={!isEditing}
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                  placeholder="Masukkan nama lengkap kamu"
                  className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1738D1] focus:outline-none font-medium disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-slate-100/90 dark:disabled:bg-slate-800/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Headline Profesional *
                </label>
                <input
                  type="text"
                  required
                  disabled={!isEditing}
                  value={profileData.headline}
                  onChange={(e) => setProfileData({ ...profileData, headline: e.target.value })}
                  placeholder="Contoh: Junior Front-End Developer | Fresh Graduate"
                  className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1738D1] focus:outline-none font-medium disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-slate-100/90 dark:disabled:bg-slate-800/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Jenis Kelamin
                </label>
                <div className="relative">
                  <select
                    disabled={!isEditing}
                    value={profileData.gender}
                    onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1738D1] focus:outline-none appearance-none cursor-pointer font-medium disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-slate-100/90 dark:disabled:bg-slate-800/40"
                  >
                    <option value="">Pilih Jenis Kelamin</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                    <option value="Lainnya">Lainnya / Tidak Disebutkan</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tanggal Lahir
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    disabled={!isEditing}
                    value={profileData.birthDate}
                    onChange={(e) => setProfileData({ ...profileData, birthDate: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1738D1] focus:outline-none font-medium disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-slate-100/90 dark:disabled:bg-slate-800/40"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sub-Card 2: Kontak & Domisili */}
          <div className="p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>2. Kontak Resmi &amp; Wilayah Domisili</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Kontak yang akan dicantumkan di header CV dan notifikasi lamaran.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Email Utama *
                  </label>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Terverifikasi
                  </span>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    disabled={!isEditing}
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    placeholder="nama@email.com"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1738D1] focus:outline-none font-medium disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-slate-100/90 dark:disabled:bg-slate-800/40"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nomor WhatsApp / HP *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    disabled={!isEditing}
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="Contoh: 081234567890"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1738D1] focus:outline-none font-medium disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-slate-100/90 dark:disabled:bg-slate-800/40"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Kota &amp; Provinsi Domisili *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    disabled={!isEditing}
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    placeholder="Contoh: Jakarta Selatan, DKI Jakarta"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1738D1] focus:outline-none font-medium disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-slate-100/90 dark:disabled:bg-slate-800/40"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Alamat Singkat
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  placeholder="Masukkan alamat domisili lengkap kamu"
                  className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1738D1] focus:outline-none font-medium disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-slate-100/90 dark:disabled:bg-slate-800/40"
                />
              </div>
            </div>
          </div>

          {/* Sub-Card 3: Ringkasan Bio Profil */}
          <div className="p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>3. Ringkasan Diri (About Me)</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Paragraf pembuka singkat (3-5 kalimat) yang menonjolkan keunggulan utama dan target karir kamu.
              </p>
            </div>

            <div className="space-y-1.5">
              <textarea
                rows={4}
                disabled={!isEditing}
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                placeholder="Tuliskan ringkasan singkat tentang latar belakang, keahlian, dan tujuan karir kamu..."
                className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1738D1] focus:outline-none font-medium leading-relaxed resize-none disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-slate-100/90 dark:disabled:bg-slate-800/40"
              />
              <span className="text-[10px] text-slate-400 block text-right">
                {profileData.bio.length} / 500 karakter
              </span>
            </div>
          </div>

          {/* Sub-Card 4: Tautan Portofolio & Jejaring Sosial */}
          <div className="p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span>4. Tautan Portofolio &amp; Jejaring Profesional</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Tautkan profil online agar recruiter dapat mengecek karya nyata dan rekam jejak kamu.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                  <span>Profil LinkedIn</span>
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  disabled={!isEditing}
                  value={profileData.linkedin}
                  onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1738D1] focus:outline-none font-medium disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-slate-100/90 dark:disabled:bg-slate-800/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Github className="w-3.5 h-3.5 text-slate-800 dark:text-white" />
                  <span>GitHub / GitLab Repository</span>
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/username"
                  disabled={!isEditing}
                  value={profileData.github}
                  onChange={(e) => setProfileData({ ...profileData, github: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1738D1] focus:outline-none font-medium disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-slate-100/90 dark:disabled:bg-slate-800/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Website Portofolio Pribadi</span>
                </label>
                <input
                  type="url"
                  placeholder="https://portofolio-kamu.com"
                  disabled={!isEditing}
                  value={profileData.website}
                  onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1738D1] focus:outline-none font-medium disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-slate-100/90 dark:disabled:bg-slate-800/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                  <span>Dribbble / Behance / Linktree</span>
                </label>
                <input
                  type="url"
                  placeholder="https://dribbble.com/username atau tautan proyek"
                  disabled={!isEditing}
                  value={profileData.portfolio}
                  onChange={(e) => setProfileData({ ...profileData, portfolio: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1738D1] focus:outline-none font-medium disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-slate-100/90 dark:disabled:bg-slate-800/40"
                />
              </div>
            </div>
          </div>

          {/* Bottom Save Action */}
          <div className="flex items-center justify-between p-4 rounded-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Perubahan pada biodata akan tersinkronisasi otomatis dengan seluruh dokumen CV kamu.
            </p>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2.5 rounded-[10px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-[10px] bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-black text-xs transition shadow-md shadow-orange-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Informasi Profil'}</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleStartEdit}
                className="px-5 py-2.5 rounded-[10px] bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-black text-xs transition shadow-md shadow-orange-500/20 flex items-center gap-2 cursor-pointer"
              >
                <Pencil className="w-4 h-4" />
                <span>Edit Informasi Profil</span>
              </button>
            )}
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: PREFERENSI KARIR */}
      {/* ========================================================================= */}
      {activeSubTab === 'karir' && (
        <form onSubmit={handleSaveProfile} className="space-y-6 animate-in fade-in duration-200">
          {/* Section Heading Banner */}
          <div className="flex items-center justify-between p-4 rounded-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[8px] bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Preferensi &amp; Target Karir Impian
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tentukan posisi, ekspektasi kompensasi, dan format kerja untuk kurasi lowongan kerja serta simulasi HRD yang presisi.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="px-3.5 py-1.5 rounded-[8px] bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer transition"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              ) : (
                <span className="px-2.5 py-1 rounded-[6px] text-[10px] font-black uppercase tracking-wider bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 flex items-center gap-1">
                  <Pencil className="w-3 h-3" /> Mode Edit
                </span>
              )}
            </div>
          </div>

          {/* Sub-Card 1: Target Posisi & Industri */}
          <div className="p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span>1. Posisi Pekerjaan &amp; Tingkat Senioritas</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Target jabatan yang sedang aktif kamu cari saat ini.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nama Posisi Pekerjaan Target *
                </label>
                <input
                  type="text"
                  required
                  disabled={!isEditing}
                  value={profileData.targetRole}
                  onChange={(e) => setProfileData({ ...profileData, targetRole: e.target.value })}
                  placeholder="Contoh: Staff Administrasi, Front-End Developer, dll"
                  className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1738D1] focus:outline-none font-medium disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-slate-100/90 dark:disabled:bg-slate-800/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tingkat Pengalaman Karir
                </label>
                <div className="relative">
                  <select
                    disabled={!isEditing}
                    value={profileData.experienceYears}
                    onChange={(e) => setProfileData({ ...profileData, experienceYears: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1738D1] focus:outline-none appearance-none cursor-pointer font-medium disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-slate-100/90 dark:disabled:bg-slate-800/40"
                  >
                    <option value="">Pilih Tingkat Pengalaman</option>
                    <option value="Fresh Graduate (0-1 Tahun)">Fresh Graduate (0-1 Tahun)</option>
                    <option value="Junior (1-3 Tahun)">Junior (1-3 Tahun)</option>
                    <option value="Mid-Level (3-5 Tahun)">Mid-Level (3-5 Tahun)</option>
                    <option value="Senior (5+ Tahun)">Senior (5+ Tahun)</option>
                    <option value="Magang / Internship">Magang / Internship Mahasiswa</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Industri Sasaran Utama
                </label>
                <div className="relative">
                  <select
                    disabled={!isEditing}
                    value={profileData.targetIndustry}
                    onChange={(e) => setProfileData({ ...profileData, targetIndustry: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1738D1] focus:outline-none appearance-none cursor-pointer font-medium disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-slate-100/90 dark:disabled:bg-slate-800/40"
                  >
                    <option value="">Pilih Industri Sasaran</option>
                    <option value="Teknologi & Startup Digital">Teknologi &amp; Startup Digital (Software, SaaS, E-Commerce)</option>
                    <option value="Perbankan & Financial Technology (Fintech)">Perbankan &amp; Financial Technology (Fintech)</option>
                    <option value="BUMN & Perusahaan Multinasional">BUMN &amp; Perusahaan Multinasional</option>
                    <option value="FMCG & Manufaktur">FMCG, Ritel &amp; Manufaktur</option>
                    <option value="Konsultan & Agensi Kreatif">Konsultan Manajemen &amp; Agensi Kreatif</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Sub-Card 2: Ekspektasi Kompensasi */}
          <div className="p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>2. Ekspektasi Kompensasi &amp; Benefit</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Kisaran gaji bulanan bersih (Take-Home Pay) yang diharapkan.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Ekspektasi Gaji Bulanan
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={profileData.expectedSalary}
                    onChange={(e) => setProfileData({ ...profileData, expectedSalary: e.target.value })}
                    placeholder="Contoh: Rp 5.000.000 - Rp 8.000.000"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1738D1] focus:outline-none font-medium disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-slate-100/90 dark:disabled:bg-slate-800/40"
                  />
                </div>
              </div>

              <div className="space-y-1.5 flex flex-col justify-end">
                <label className={`flex items-center gap-2 p-2.5 rounded-[10px] border border-slate-200 dark:border-slate-700 ${isEditing ? 'bg-slate-50 dark:bg-slate-800/40 cursor-pointer' : 'bg-slate-100/70 dark:bg-slate-800/20 cursor-not-allowed opacity-75'}`}>
                  <input
                    type="checkbox"
                    disabled={!isEditing}
                    checked={profileData.negotiableSalary}
                    onChange={(e) => setProfileData({ ...profileData, negotiableSalary: e.target.checked })}
                    className="w-4 h-4 text-[#1738D1] rounded-[6px] accent-[#1738D1] disabled:cursor-not-allowed"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Terbuka untuk negosiasi gaji sesuai penawaran benefit
                  </span>
                </label>
              </div>

              <div className="sm:col-span-2 space-y-2 pt-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Tunjangan yang Diprioritaskan:
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'BPJS Kesehatan & Ketenagakerjaan',
                    'Asuransi Swasta Tambahan',
                    'Laptop Kerja / Tunjangan Device',
                    'Tunjangan Pelatihan / Sertifikasi',
                    'Bonus Tahunan & Kinerja',
                    'Tunjangan Makan & Transport',
                  ].map((benefit) => {
                    const isChecked = profileData.desiredBenefits.includes(benefit);
                    return (
                      <button
                        key={benefit}
                        type="button"
                        disabled={!isEditing}
                        onClick={() => {
                          if (!isEditing) return;
                          const updated = isChecked
                            ? profileData.desiredBenefits.filter((b) => b !== benefit)
                            : [...profileData.desiredBenefits, benefit];
                          setProfileData({ ...profileData, desiredBenefits: updated });
                        }}
                        className={`px-3 py-1.5 rounded-[8px] text-[11px] font-bold border transition flex items-center gap-1.5 ${
                          !isEditing
                            ? 'cursor-not-allowed opacity-70 bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-800'
                            : isChecked
                            ? 'cursor-pointer bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                            : 'cursor-pointer bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 text-emerald-600" />}
                        <span>{benefit}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sub-Card 3: Sistem & Lokasi Kerja */}
          <div className="p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>3. Format Kerja &amp; Kesiapan Penempatan</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Kondisi kerja yang paling sesuai dengan gaya hidup kamu.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Format Kerja
                </label>
                <div className="relative">
                  <select
                    disabled={!isEditing}
                    value={profileData.workPreference}
                    onChange={(e) => setProfileData({ ...profileData, workPreference: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1738D1] focus:outline-none appearance-none cursor-pointer font-medium disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-slate-100/90 dark:disabled:bg-slate-800/40"
                  >
                    <option value="">Pilih Format Kerja</option>
                    <option value="Hybrid / Remote">Hybrid / Remote (Fleksibel)</option>
                    <option value="Full Remote">Full Remote (100% Dari Rumah)</option>
                    <option value="On-Site / WFO">On-Site / WFO (Kantor Fisik)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Kota Sasaran Kerja
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profileData.targetCities}
                  onChange={(e) => setProfileData({ ...profileData, targetCities: e.target.value })}
                  placeholder="Contoh: Jakarta, Bandung, Remote"
                  className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1738D1] focus:outline-none font-medium disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-slate-100/90 dark:disabled:bg-slate-800/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Kesiapan Relokasi
                </label>
                <div className="relative">
                  <select
                    disabled={!isEditing}
                    value={profileData.canRelocate ? 'yes' : 'no'}
                    onChange={(e) => setProfileData({ ...profileData, canRelocate: e.target.value === 'yes' })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1738D1] focus:outline-none appearance-none cursor-pointer font-medium disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-slate-100/90 dark:disabled:bg-slate-800/40"
                  >
                    <option value="no">Hanya Wilayah Domisili Saat Ini</option>
                    <option value="yes">Siap Relokasi ke Luar Kota</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Sub-Card 4: Status Ketersediaan */}
          <div className="p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span>4. Status Ketersediaan Bekerja</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Memberi tahu recruiter kapan kamu bisa mulai bergabung.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { title: 'Siap Bekerja Segera', desc: 'Tidak terikat kontrak, bisa mulai hari ini.' },
                { title: 'Notice Period (1 Bulan)', desc: 'Masih bekerja, butuh waktu transisi 1 bulan.' },
                { title: 'Terbuka Peluang Baru', desc: 'Secara pasif melihat tawaran yang cocok.' },
              ].map((status) => {
                const isSelected = profileData.availability === status.title;
                return (
                  <div
                    key={status.title}
                    onClick={() => {
                      if (!isEditing) return;
                      setProfileData({ ...profileData, availability: status.title });
                    }}
                    className={`p-3.5 rounded-[10px] border transition ${
                      !isEditing
                        ? isSelected
                          ? 'border-blue-300 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/20 cursor-not-allowed opacity-80'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/30 cursor-not-allowed opacity-60'
                        : isSelected
                        ? 'border-[#1738D1] bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-[#1738D1]/20 cursor-pointer'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-extrabold text-xs text-slate-900 dark:text-white">{status.title}</h5>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#1738D1]" />}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{status.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Save Action */}
          <div className="flex items-center justify-between p-4 rounded-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Preferensi ini membantu menyesuaikan matriks penilaian di fitur Evaluasi CV &amp; Simulasi Screening.
            </p>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2.5 rounded-[10px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-[10px] bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-black text-xs transition shadow-md shadow-orange-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Preferensi Karir'}</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleStartEdit}
                className="px-5 py-2.5 rounded-[10px] bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-black text-xs transition shadow-md shadow-orange-500/20 flex items-center gap-2 cursor-pointer"
              >
                <Pencil className="w-4 h-4" />
                <span>Edit Preferensi Karir</span>
              </button>
            )}
          </div>
        </form>
      )}



      {/* ========================================================================= */}
      {/* SECTION 4: KEAMANAN & AKUN */}
      {/* ========================================================================= */}
      {activeSubTab === 'keamanan' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Section Heading Banner */}
          <div className="flex items-center justify-between p-4 rounded-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[8px] bg-[#1738D1]/10 text-[#1738D1] dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Keamanan Akun, Sandi &amp; Sesi Login
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pantau kredensial login, kata sandi, proteksi 2 faktor, dan sesi perangkat yang sedang aktif.
                </p>
              </div>
            </div>
          </div>

          {/* Sub-Card 1: Ubah Kata Sandi */}
          <div className="p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-orange-500" />
                <span>Ubah Kata Sandi Akun</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Disarankan memperbarui kata sandi secara berkala dengan minimal 8 karakter.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                  toast.error('Gagal', 'Konfirmasi kata sandi baru tidak cocok.');
                  return;
                }
                toast.success('Kata Sandi Diperbarui', 'Kata sandi akun kamu berhasil diubah.');
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
              }}
              className="space-y-4 max-w-lg"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Kata Sandi Saat Ini *
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Masukkan kata sandi lama"
                  className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1738D1] focus:outline-none font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Kata Sandi Baru *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Minimal 8 karakter kombinasi"
                  className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1738D1] focus:outline-none font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Konfirmasi Kata Sandi Baru *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Ulangi kata sandi baru"
                  className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1738D1] focus:outline-none font-medium"
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

          {/* Sub-Card 2: Autentikasi 2FA & Akun Terhubung */}
          <div className="p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-500" />
                <span>Autentikasi &amp; Akun Terhubung</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Metode verifikasi ganda untuk mencegah login tak dikenal.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white">Verifikasi Dua Langkah (2FA)</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Kirimkan kode OTP ke WhatsApp / Email setiap kali login dari peramban yang tidak dikenali.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-[6px] text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 shrink-0">
                  Segera Hadir
                </span>
              </div>

              <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white">Masuk dengan Akun Google</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {profileData.email ? `Tersedia untuk masuk cepat menggunakan ${profileData.email}.` : 'Tersedia untuk masuk instan dengan akun Google.'}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-[6px] text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                  Tersedia
                </span>
              </div>
            </div>
          </div>

          {/* Sub-Card 3: Sesi Login Aktif */}
          <div className="p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-blue-500" />
                  <span>Daftar Perangkat &amp; Sesi Login Aktif</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Perangkat yang sedang memiliki akses aktif ke akun kamu.
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
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
                      <span className="px-1.5 py-0.5 rounded-[4px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] font-bold">
                        Sesi Saat Ini
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {profileData.location ? `${profileData.location} • ` : ''}Sesi Aktif
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Online</span>
              </div>
            </div>
          </div>

          {/* Sub-Card 4: Keluar Akun (Logout) */}
          <div className="p-6 rounded-[10px] bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-extrabold text-sm text-rose-700 dark:text-rose-400 flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                <span>Keluar Sesi Akun</span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Keluar dari akun Employr di peramban ini. Kamu bisa masuk kembali kapan saja dengan email terdaftar.
              </p>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="px-5 py-2.5 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar / Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: TAMPILAN & PENGATURAN SISTEM */}
      {/* ========================================================================= */}
      {activeSubTab === 'pengaturan' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Section Heading Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[8px] bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Tampilan Antarmuka &amp; Preferensi Sistem
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Kustomisasi kenyamanan tema visual, jenis notifikasi email/WhatsApp, format regional, dan privasi data.
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveProfile()}
              className="px-4 py-2.5 rounded-[10px] bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-black text-xs transition shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
            </button>
          </div>

          {/* Sub-Card 1: Tema Tampilan */}
          <div className="p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Sun className="w-4 h-4 text-orange-500" />
                <span>Pengaturan Tema Tampilan Antarmuka</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Sesuaikan mode warna tampilan yang paling nyaman untuk matamu saat membaca berkas CV.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSpecificThemeMode('light');
                  userApi.updateProfile({ preferences: { theme: 'light' } }).catch(() => {});
                }}
                className={`p-4 rounded-[10px] border text-left transition flex flex-col justify-between space-y-3 cursor-pointer ${
                  themeMode === 'light'
                    ? 'border-[#1738D1] bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-[#1738D1]/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-[8px] bg-amber-100 text-amber-700">
                    <Sun className="w-5 h-5" />
                  </div>
                  {themeMode === 'light' && <CheckCircle2 className="w-5 h-5 text-[#1738D1]" />}
                </div>
                <div>
                  <h5 className="font-extrabold text-xs text-slate-900 dark:text-white">Mode Terang (Light)</h5>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Latar bersih berstandar dokumen cetak.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSpecificThemeMode('dark');
                  userApi.updateProfile({ preferences: { theme: 'dark' } }).catch(() => {});
                }}
                className={`p-4 rounded-[10px] border text-left transition flex flex-col justify-between space-y-3 cursor-pointer ${
                  themeMode === 'dark'
                    ? 'border-[#1738D1] bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-[#1738D1]/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-[8px] bg-slate-900 text-slate-100">
                    <Moon className="w-5 h-5" />
                  </div>
                  {themeMode === 'dark' && <CheckCircle2 className="w-5 h-5 text-[#1738D1]" />}
                </div>
                <div>
                  <h5 className="font-extrabold text-xs text-slate-900 dark:text-white">Mode Gelap (Dark)</h5>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Kontras redup untuk penggunaan malam hari.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSpecificThemeMode('system');
                  userApi.updateProfile({ preferences: { theme: 'system' } }).catch(() => {});
                }}
                className={`p-4 rounded-[10px] border text-left transition flex flex-col justify-between space-y-3 cursor-pointer ${
                  themeMode === 'system'
                    ? 'border-[#1738D1] bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-[#1738D1]/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-[8px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                    <Laptop className="w-5 h-5" />
                  </div>
                  {themeMode === 'system' && <CheckCircle2 className="w-5 h-5 text-[#1738D1]" />}
                </div>
                <div>
                  <h5 className="font-extrabold text-xs text-slate-900 dark:text-white">Otomatis (Sistem)</h5>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Mengikuti tema OS laptop/HP kamu.</p>
                </div>
              </button>
            </div>
          </div>

          {/* Sub-Card 2: Notifikasi & Pengingat */}
          <div className="p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-500" />
                <span>Pengaturan Notifikasi &amp; Pengingat</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Kendalikan pesan yang ingin kamu terima melalui Email maupun WhatsApp.
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 cursor-pointer">
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">
                    Email Rekomendasi Lowongan Kerja Baru
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Dapatkan kurasi loker yang 90%+ cocok dengan CV kamu setiap Senin pagi.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailJobAlerts}
                  onChange={(e) => setNotifications({ ...notifications, emailJobAlerts: e.target.checked })}
                  className="w-4 h-4 text-[#1738D1] rounded-[6px] accent-[#1738D1]"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 cursor-pointer">
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">
                    Email Pengingat Jadwal Interview (H-1)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Peringatan otomatis 1 hari sebelum jadwal interview kerja yang kamu catat di Tracker.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailInterviewReminders}
                  onChange={(e) => setNotifications({ ...notifications, emailInterviewReminders: e.target.checked })}
                  className="w-4 h-4 text-[#1738D1] rounded-[6px] accent-[#1738D1]"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 cursor-pointer">
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">
                    Pengingat WhatsApp Harian &amp; Bonus Koin
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Pemberitahuan klaim misi cuan harian dan verifikasi bukti tugas.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.whatsappAlerts}
                  onChange={(e) => setNotifications({ ...notifications, whatsappAlerts: e.target.checked })}
                  className="w-4 h-4 text-[#1738D1] rounded-[6px] accent-[#1738D1]"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 cursor-pointer">
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">
                    Newsletter Tips Karir &amp; Bedah CV
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Wawasan karir, tren industri, dan contoh CV lolos perusahaan unicorn Indonesia.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailWeeklyTips}
                  onChange={(e) => setNotifications({ ...notifications, emailWeeklyTips: e.target.checked })}
                  className="w-4 h-4 text-[#1738D1] rounded-[6px] accent-[#1738D1]"
                />
              </label>
            </div>
          </div>

          {/* Sub-Card 3: Bahasa, Zona Waktu & Mata Uang */}
          <div className="p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-emerald-500" />
                <span>Pengaturan Bahasa &amp; Regional</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Standar waktu notifikasi dan penulisan mata uang gaji.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">Bahasa Antarmuka</label>
                <div className="relative">
                  <select
                    value={language}
                    onChange={(e) => {
                      const newLang = e.target.value as 'id' | 'en';
                      setLanguage(newLang);
                      handleSaveProfile(undefined, { language: newLang });
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
                    onChange={(e) => {
                      const newTz = e.target.value;
                      setTimezone(newTz);
                      handleSaveProfile(undefined, { timezone: newTz });
                    }}
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
                <label className="font-bold text-slate-700 dark:text-slate-300 block">Mata Uang Acuan</label>
                <div className="relative">
                  <select
                    value={currency}
                    onChange={(e) => {
                      const newCurr = e.target.value;
                      setCurrency(newCurr);
                      handleSaveProfile(undefined, { currency: newCurr });
                    }}
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

          {/* Sub-Card 3.5: Simpan Perubahan Pengaturan */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-center sm:text-left">
              <h5 className="font-bold text-xs text-slate-900 dark:text-white">Simpan Konfigurasi Pengaturan</h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pastikan pengaturan notifikasi dan preferensi regional telah tersimpan dengan aman ke akun kamu.
              </p>
            </div>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveProfile()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-[10px] bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-black text-xs transition shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
            </button>
          </div>

          {/* Sub-Card 4: Unduh & Ekspor Data Pribadi */}
          <div className="p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-orange-500" />
                <span>Unduh &amp; Ekspor Data Akun Saya (Hak Portabilitas)</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Dapatkan salinan terenkripsi arsip biodata profil, histori lamaran, dan dokumen CV kamu dalam berkas JSON.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div className="space-y-0.5 text-center sm:text-left">
                <h5 className="font-bold text-xs text-slate-900 dark:text-white">Arsip Portofolio Terpadu</h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Termasuk profil biodata, target karir, konfigurasi notifikasi, dan status lisensi keanggotaan.
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

          {/* Sub-Card 5: Zona Bahaya (Danger Zone) */}
          <div className="p-6 rounded-[10px] bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-rose-200/80 dark:border-rose-900/40 pb-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <div>
                <h4 className="font-extrabold text-sm text-rose-700 dark:text-rose-300">
                  Zona Bahaya (Danger Zone)
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Tindakan berisiko tinggi terhadap keberlangsungan data profil dan keanggotaan akun kamu.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
              <div>
                <h5 className="font-bold text-xs text-slate-900 dark:text-white">Hapus Akun &amp; Seluruh Data Portofolio</h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Tindakan ini tidak dapat dibatalkan. Seluruh riwayat CV, histori lamaran, koin misi, dan lisensi Lifetime akan dihapus permanen.
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
      {/* MODAL KONFIRMASI HAPUS AKUN */}
      {/* ========================================================================= */}
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
                className="flex-1 py-2.5 rounded-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition border border-slate-700 cursor-pointer"
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
