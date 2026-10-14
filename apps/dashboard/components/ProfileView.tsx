'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useToast } from '@/components/ui/Toast';
import { useModals } from '@/context/ModalContext';
import { UserAvatar } from './UserAvatar';
import { userApi } from '../lib/api';
import { getStoredSession, setSessionCookie } from '@/lib/auth';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
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
import { Button } from '@/components/ui/button';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { DatePicker, fromISODate } from '@/components/ui/TrackerDatePicker';
import { ProfileViewSkeleton } from '@/components/ProfileSkeleton';
import { useCareerReadiness } from '@/hooks/useCareerReadiness';

import {
  User,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
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
  Lightbulb,
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
  X,
  Compass,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { handleLogout } from '@/lib/auth';
import { isSoundEnabled, setSoundEnabled, playSuccessChime } from '@/lib/sfx';
import { cn } from '@/lib/utils';

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
  mode?: 'profil' | 'pengaturan' | 'all';
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  initialSubTab = 'profil',
  mode = 'all',
}) => {
  const router = useRouter();
  const toast = useToast();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { openUpgrade } = useModals();
  const isDarkMode = resolvedTheme === 'dark';
  const themeMode = (theme || 'system') as 'light' | 'dark' | 'system';
  const setSpecificThemeMode = (mode: 'light' | 'dark' | 'system') => setTheme(mode);
  const { score: readinessScore } = useCareerReadiness();
  const onLogout = () => handleLogout();

  const isProfileMode = mode === 'profil';
  const isPengaturanMode = mode === 'pengaturan';

  const defaultSubTab = isPengaturanMode
    ? (initialSubTab === 'pengaturan' ? 'pengaturan' : 'keamanan')
    : isProfileMode
    ? (initialSubTab === 'karir' ? 'karir' : 'profil')
    : (initialSubTab || 'profil');

  const safeInitialSubTab = (initialSubTab as string) === 'langganan' ? 'profil' : defaultSubTab;
  const [activeSubTab, setActiveSubTab] = useState<'profil' | 'karir' | 'keamanan' | 'pengaturan'>(safeInitialSubTab);
  const [prevInitialSubTab, setPrevInitialSubTab] = useState(safeInitialSubTab);

  if (safeInitialSubTab !== prevInitialSubTab) {
    setPrevInitialSubTab(safeInitialSubTab);
    setActiveSubTab(safeInitialSubTab);
  }

  // Cross-page redirection for mismatched query parameters
  useEffect(() => {
    if (isProfileMode && (initialSubTab === 'keamanan' || initialSubTab === 'pengaturan')) {
      router.replace(`/pengaturan?tab=${initialSubTab}`);
    } else if (isPengaturanMode && (initialSubTab === 'profil' || initialSubTab === 'karir')) {
      router.replace(`/profil?tab=${initialSubTab}`);
    }
  }, [isProfileMode, isPengaturanMode, initialSubTab, router]);

  // Form States for Profile - Default empty strings, user fills manual if not in onboarding
  const [isLoading, setIsLoading] = useState(true);
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

  const [isEditing, setIsEditing] = useState(false);
  const [originalProfileData, setOriginalProfileData] = useState(profileData);

  const handleStartEdit = () => {
    setOriginalProfileData({ ...profileData });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setProfileData({ ...originalProfileData });
    setIsEditing(false);
  };

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
    soundAlerts: true,
  });

  useEffect(() => {
    setNotifications((prev) => ({ ...prev, soundAlerts: isSoundEnabled() }));
  }, []);

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

  // File input ref for Android & Desktop camera/image picker
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

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
    let isMounted = true;

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

    userApi
      .getProfile()
      .then((remoteProfile) => {
        if (!isMounted) return;
        if (remoteProfile) {
          if (typeof window !== 'undefined') {
            try {
              ['cuti_onboarding_profile', 'cuti_imported_cv_data', 'employr_onboarding_profile', 'employr_imported_cv_data'].forEach((k) => localStorage.removeItem(k));
            } catch {}
          }
          const resolvedBio = remoteProfile.bio || '';

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
              if (typeof savedPrefs.notifications.soundAlerts === 'boolean') {
                setSoundEnabled(savedPrefs.notifications.soundAlerts);
              }
            }
            if (savedPrefs.language === 'id' || savedPrefs.language === 'en') setLanguage(savedPrefs.language);
            if (typeof savedPrefs.timezone === 'string') setTimezone(savedPrefs.timezone);
            if (typeof savedPrefs.currency === 'string') setCurrency(savedPrefs.currency);
            if (savedPrefs.theme === 'light' || savedPrefs.theme === 'dark' || savedPrefs.theme === 'system') {
              setTheme(savedPrefs.theme);
            }
          }
        }
      })
      .catch((err) => {
        console.warn('Failed to load profile in ProfileView', err);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Pola 2: Right-Hand Slide-in Drawer editing states
  const [activeEditDrawer, setActiveEditDrawer] = useState<
    'identitas' | 'kontak' | 'bio' | 'sosial' | 'posisi' | 'gaji' | 'format' | 'ketersediaan' | null
  >(null);
  const [drawerFormData, setDrawerFormData] = useState({ ...profileData });
  const [isSavingDrawer, setIsSavingDrawer] = useState(false);

  const openEditDrawer = (
    section: 'identitas' | 'kontak' | 'bio' | 'sosial' | 'posisi' | 'gaji' | 'format' | 'ketersediaan'
  ) => {
    setDrawerFormData({ ...profileData });
    setActiveEditDrawer(section);
  };

  const closeEditDrawer = () => {
    setActiveEditDrawer(null);
  };

  // Tutup drawer konfirmasi hapus akun atau edit profil dengan tombol Escape (A11y)
  useEffect(() => {
    if (!showDeleteAccountModal && !activeEditDrawer) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showDeleteAccountModal) {
          setShowDeleteAccountModal(false);
          setDeleteConfirmText('');
        }
        if (activeEditDrawer) {
          setActiveEditDrawer(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDeleteAccountModal, activeEditDrawer]);

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
      setOriginalProfileData(syncedProfile);
      setIsEditing(false);
      setDrawerFormData({ ...syncedProfile });

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

  const handleSaveDrawer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingDrawer(true);
    try {
      await handleSaveProfile(undefined, { profile: drawerFormData });
      closeEditDrawer();
    } catch {
      toast.error('Gagal Menyimpan', 'Terjadi kesalahan sistem.');
    } finally {
      setIsSavingDrawer(false);
    }
  };

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Berkas Tidak Valid', 'Silakan pilih berkas foto gambar (JPG, PNG, atau WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran Terlalu Besar', 'Maksimal ukuran foto adalah 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const src = loadEvent.target?.result as string;
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > maxDim) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          }
        } else {
          if (h > maxDim) {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          setAvatarUrl(compressed);
          userApi.updateProfile({ avatarUrl: compressed }).then(() => {
            toast.success('Foto Profil Diperbarui', 'Foto profil berhasil disimpan ke akun.');
          }).catch(() => {
            toast.error('Gagal Menyimpan Foto', 'Terjadi kesalahan sistem saat menyimpan foto.');
          });
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  if (isLoading) {
    return <ProfileViewSkeleton />;
  }

  return (
    <div className="w-full space-y-6 md:space-y-8 font-sans pb-40 sm:pb-32 lg:pb-16">
      {/* Hidden file input for Android Camera/Gallery & Desktop file picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
        onChange={handleAvatarFileSelect}
      />

      {/* USER PROFILE / PENGATURAN HERO CARD */}
      {isPengaturanMode ? (
        <div className="relative overflow-hidden rounded-[10px] bg-[#162758] border border-[#20367A] text-white p-3.5 sm:p-5 shadow-md">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-5">
            {/* Left: Avatar & Identity Details */}
            <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
              <UserAvatar
                name={profileData.fullName || 'Pengguna Employr'}
                photoUrl={avatarUrl}
                size={56}
                square={true}
                variant="beam"
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-[12px] border-2 border-white/30 shadow-md shrink-0"
              />
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-extrabold text-sm sm:text-lg text-white tracking-tight truncate">
                    {profileData.fullName || 'Pengguna Employr'}
                  </h2>
                  <span className="px-2 py-0.5 rounded-[6px] text-caption font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                    {membershipRef?.packageName || 'Pro Member'}
                  </span>
                </div>
                <p className="text-xs text-blue-200 font-medium truncate">
                  {profileData.email || 'Email belum diatur'}
                </p>
                <div className="flex items-center gap-2 text-caption text-slate-300 pt-0.5">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Akun Aktif &amp; Terlindungi</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Quick Link to Profil */}
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/profil"
                className="w-full sm:w-auto h-10 px-4 py-2 rounded-[10px] bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white border border-white/20 flex items-center justify-center gap-2 cursor-pointer transition text-xs font-bold"
              >
                <User className="w-4 h-4 shrink-0 text-blue-300" />
                <span>Lihat &amp; Ubah Profil Lengkap</span>
                <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-300" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* USER PROFILE OVERVIEW HERO CARD */
        <div className="relative overflow-hidden rounded-[10px] bg-[#162758] border border-[#20367A] text-white p-3.5 sm:p-5 shadow-md">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3.5 sm:gap-5">
            {/* Left: Avatar & Identity Details */}
            <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Klik untuk ubah foto profil"
                aria-label="Ubah foto profil"
                className="relative shrink-0 group cursor-pointer rounded-[12px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white text-left"
              >
                <UserAvatar
                  name={profileData.fullName || 'Pengguna Employr'}
                  photoUrl={avatarUrl}
                  size={56}
                  square={true}
                  variant="beam"
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-[12px] border-2 border-white/30 shadow-md transition"
                />
                <div className="absolute inset-0 rounded-[12px] bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-cobalt-500 border-2 border-[#162758] flex items-center justify-center text-white shadow-xs">
                  <Camera className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </div>
              </button>

              <div className="min-w-0 space-y-0.5 sm:space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-extrabold text-base sm:text-lg text-white tracking-tight truncate">
                    {profileData.fullName || 'Profil Pengguna'}
                  </h2>
                  <span className="px-2 py-0.5 rounded-[6px] text-[10px] sm:text-caption font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                    {membershipRef?.packageName || 'Free Member'}
                  </span>
                </div>
                <p className="text-xs text-blue-200 font-medium truncate">
                  {profileData.headline || 'Pencari Kerja Aktif'}
                </p>

                {/* Info kontak & domisili hanya tampil di Desktop (sm+) agar tampilan Mobile tidak redundan dengan card di bawah */}
                <div className="hidden sm:flex sm:items-center sm:gap-3 text-caption text-slate-300 pt-0.5">
                  <span className="flex items-center gap-1.5 min-w-0">
                    <Mail className="w-3 h-3 text-blue-300 shrink-0" />
                    <span className="truncate">{profileData.email || 'Email belum diatur'}</span>
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="flex items-center gap-1.5 min-w-0">
                    <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">{profileData.phone || 'Nomor HP belum diatur'}</span>
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="flex items-center gap-1.5 min-w-0">
                    <MapPin className="w-3 h-3 text-orange-400 shrink-0" />
                    <span className="truncate">{profileData.location || 'Lokasi belum diatur'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Career Readiness, Kelengkapan Profil & Quick Theme Switcher */}
            <div className="pt-2.5 sm:pt-0 border-t sm:border-t-0 border-white/10 shrink-0 flex flex-col gap-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 min-w-0 sm:min-w-[420px]">
                {/* Career Readiness Meter */}
                <Link
                  href="/readiness"
                  className="p-2 sm:p-2.5 rounded-[10px] bg-white/10 hover:bg-orange-500/20 border border-white/15 hover:border-orange-400/40 backdrop-blur-xs flex items-center gap-2.5 min-w-0 transition cursor-pointer group/readiness"
                  title="Buka evaluasi & sertifikat Career Readiness"
                >
                  <div className="w-8 h-8 rounded-[8px] bg-orange-500/20 border border-orange-400/30 flex items-center justify-center shrink-0 group-hover/readiness:scale-105 transition">
                    <TrendingUp className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] sm:text-caption font-bold uppercase tracking-wider text-slate-300 block truncate group-hover/readiness:text-orange-300 transition">
                        Career Readiness
                      </span>
                      <ChevronRight className="w-3 h-3 text-slate-400 group-hover/readiness:text-orange-300 group-hover/readiness:translate-x-0.5 transition shrink-0" />
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs sm:text-sm font-black text-orange-400 font-mono">{readinessScore}%</span>
                      <div className="flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden min-w-[50px]">
                        <div
                          className="h-full bg-orange-400 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, readinessScore))}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Kelengkapan Profil Meter */}
                <div className="p-2 sm:p-2.5 rounded-[10px] bg-white/10 border border-white/15 backdrop-blur-xs flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-[8px] bg-amber-400/20 border border-amber-400/30 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] sm:text-caption font-bold uppercase tracking-wider text-slate-300 block truncate">
                      Kelengkapan Profil
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs sm:text-sm font-black text-amber-300 font-mono">{completenessScore}%</span>
                      <div className="flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden min-w-[50px]">
                        <div
                          className="h-full bg-amber-300 rounded-full transition-all duration-500"
                          style={{ width: `${completenessScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Theme Toggle Bar */}
              <div className="flex items-center justify-between sm:justify-end gap-2 text-caption pt-0.5">
                <span className="text-slate-300 text-[10px] font-semibold uppercase tracking-wider sm:hidden">
                  Tema:
                </span>
                <div className="flex items-center p-0.5 rounded-[8px] bg-black/25 border border-white/15 backdrop-blur-xs">
                  <button
                    type="button"
                    onClick={() => setSpecificThemeMode('light')}
                    aria-label="Mode Terang"
                    title="Beralih ke Mode Terang"
                    className={cn(
                      'px-2.5 py-1 rounded-[6px] text-caption font-bold flex items-center gap-1.5 transition cursor-pointer min-h-[28px]',
                      themeMode === 'light'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-300 hover:text-white'
                    )}
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Terang</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpecificThemeMode('dark')}
                    aria-label="Mode Gelap"
                    title="Beralih ke Mode Gelap"
                    className={cn(
                      'px-2.5 py-1 rounded-[6px] text-caption font-bold flex items-center gap-1.5 transition cursor-pointer min-h-[28px]',
                      themeMode === 'dark'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-300 hover:text-white'
                    )}
                  >
                    <Moon className="w-3.5 h-3.5 text-blue-400" />
                    <span>Gelap</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpecificThemeMode('system')}
                    aria-label="Mode Sistem OS"
                    title="Ikuti Tema Sistem OS"
                    className={cn(
                      'px-2.5 py-1 rounded-[6px] text-caption font-bold flex items-center gap-1.5 transition cursor-pointer min-h-[28px]',
                      themeMode === 'system'
                        ? 'bg-white/20 text-white shadow-xs'
                        : 'text-slate-300 hover:text-white'
                    )}
                  >
                    <Laptop className="w-3.5 h-3.5" />
                    <span>Sistem</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-NAVIGATION TABS */}
      <div className="w-full overflow-x-auto no-scrollbar -mx-1 px-1">
        <Tabs value={activeSubTab} onValueChange={(value) => {
          const newTab = value as 'profil' | 'karir' | 'keamanan' | 'pengaturan';
          setActiveSubTab(newTab);
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('tab', newTab);
            window.history.replaceState(null, '', url.toString());
          }
        }}>
          <TabsList variant="pill" className="w-full flex justify-between sm:justify-start p-1 gap-1">
            {!isPengaturanMode && (
              <>
                <TabsTrigger value="profil" size="sm" className="flex-1 sm:flex-initial text-xs px-2 sm:px-3.5 gap-1 sm:gap-1.5">
                  <User className="size-3.5 sm:size-4 shrink-0" />
                  <span>Profil<span className="hidden sm:inline">&nbsp;&amp; Kontak</span></span>
                </TabsTrigger>
                <TabsTrigger value="karir" size="sm" className="flex-1 sm:flex-initial text-xs px-2 sm:px-3.5 gap-1 sm:gap-1.5">
                  <Briefcase className="size-3.5 sm:size-4 shrink-0" />
                  <span>Karir<span className="hidden sm:inline">&nbsp;Impian</span></span>
                </TabsTrigger>
              </>
            )}

            {!isProfileMode && (
              <>
                <TabsTrigger value="keamanan" size="sm" className="flex-1 sm:flex-initial text-xs px-2 sm:px-3.5 gap-1 sm:gap-1.5">
                  <Lock className="size-3.5 sm:size-4 shrink-0" />
                  <span>Keamanan<span className="hidden sm:inline">&nbsp;&amp; Akun</span></span>
                </TabsTrigger>
                <TabsTrigger value="pengaturan" size="sm" className="flex-1 sm:flex-initial text-xs px-2 sm:px-3.5 gap-1 sm:gap-1.5">
                  <Sliders className="size-3.5 sm:size-4 shrink-0" />
                  <span>Sistem<span className="hidden sm:inline">&nbsp;&amp; Tampilan</span></span>
                </TabsTrigger>
              </>
            )}
          </TabsList>
        </Tabs>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: PROFIL & KONTAK (Pola 2: Data List Bersih) */}
      {/* ========================================================================= */}
      {activeSubTab === 'profil' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Section Heading Banner */}
          <div className="flex items-center justify-between p-4 rounded-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[8px] bg-cobalt-500/10 dark:bg-blue-950 text-cobalt-500 dark:text-blue-400 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Informasi Biodata &amp; Kontak Pribadi
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Data ini digunakan sebagai basis otomatis saat menyusun CV ATS, melamar loker, dan personalisasi cover letter.
                </p>
              </div>
            </div>
          </div>

          {/* Sub-Card 1: Data Identitas Diri */}
          <div className="p-4 sm:p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  <span>Biodata Diri</span>
                </h4>
                <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5">
                  Nama lengkap dan identitas resmi untuk berkas lamaran.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openEditDrawer('identitas')}
                title="Ubah data identitas"
                aria-label="Ubah data identitas"
                className="px-3 py-1.5 min-h-[36px] sm:min-h-[32px] rounded-[8px] text-xs font-bold text-cobalt-600 hover:text-cobalt-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
              >
                Ubah
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-[8px] bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 space-y-1">
                <span className="text-caption font-semibold text-slate-500 dark:text-slate-400 block">Nama Lengkap</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white break-words">
                  {profileData.fullName || <span className="font-normal text-slate-500 italic dark:text-slate-400">Belum diisi</span>}
                </p>
              </div>

              <div className="p-3.5 rounded-[8px] bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 space-y-1">
                <span className="text-caption font-semibold text-slate-500 dark:text-slate-400 block">Headline Profesional</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white break-words">
                  {profileData.headline || <span className="font-normal text-slate-500 italic dark:text-slate-400">Belum diisi</span>}
                </p>
              </div>

              <div className="p-3.5 rounded-[8px] bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 space-y-1">
                <span className="text-caption font-semibold text-slate-500 dark:text-slate-400 block">Jenis Kelamin</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {profileData.gender || <span className="font-normal text-slate-500 italic dark:text-slate-400">Belum ditentukan</span>}
                </p>
              </div>

              <div className="p-3.5 rounded-[8px] bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 space-y-1">
                <span className="text-caption font-semibold text-slate-500 dark:text-slate-400 block">Tanggal Lahir</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {(profileData.birthDate ? fromISODate(profileData.birthDate) : '') || <span className="font-normal text-slate-500 italic dark:text-slate-400">Belum ditentukan</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Sub-Card 2: Kontak & Domisili */}
          <div className="p-4 sm:p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Kontak &amp; Domisili</span>
                </h4>
                <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5">
                  Kontak yang akan dicantumkan di header CV dan notifikasi lamaran.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openEditDrawer('kontak')}
                title="Ubah kontak & domisili"
                aria-label="Ubah kontak & domisili"
                className="px-3 py-1.5 min-h-[36px] sm:min-h-[32px] rounded-[8px] text-xs font-bold text-cobalt-600 hover:text-cobalt-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
              >
                Ubah
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-[8px] bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 space-y-1">
                <span className="text-caption font-semibold text-slate-500 dark:text-slate-400 block">Email Utama</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white break-words">
                  {profileData.email || <span className="font-normal text-slate-500 italic dark:text-slate-400">Belum diisi</span>}
                </p>
              </div>

              <div className="p-3.5 rounded-[8px] bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 space-y-1">
                <span className="text-caption font-semibold text-slate-500 dark:text-slate-400 block">Nomor WhatsApp / HP</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {profileData.phone || <span className="font-normal text-slate-500 italic dark:text-slate-400">Belum diisi</span>}
                </p>
              </div>

              <div className="p-3.5 rounded-[8px] bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 space-y-1">
                <span className="text-caption font-semibold text-slate-500 dark:text-slate-400 block">Kota &amp; Provinsi Domisili</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {profileData.location || <span className="font-normal text-slate-500 italic dark:text-slate-400">Belum diisi</span>}
                </p>
              </div>

              <div className="p-3.5 rounded-[8px] bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 space-y-1">
                <span className="text-caption font-semibold text-slate-500 dark:text-slate-400 block">Alamat Singkat</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white break-words">
                  {profileData.address || <span className="font-normal text-slate-500 italic dark:text-slate-400">Belum diisi</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Sub-Card 3: Ringkasan Diri (About Me) */}
          <div className="p-4 sm:p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Tentang Saya</span>
                </h4>
                <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5">
                  Paragraf pembuka singkat (3-5 kalimat) yang menonjolkan keunggulan utama dan target karir kamu.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openEditDrawer('bio')}
                title="Ubah ringkasan diri"
                aria-label="Ubah ringkasan diri"
                className="px-3 py-1.5 min-h-[36px] sm:min-h-[32px] rounded-[8px] text-xs font-bold text-cobalt-600 hover:text-cobalt-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
              >
                Ubah
              </button>
            </div>

            {profileData.bio ? (
              <div className="p-4 rounded-[8px] bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-line">
                  {profileData.bio}
                </p>
                <span className="text-caption text-slate-500 dark:text-slate-400 block text-right font-medium mt-2">
                  {profileData.bio.length} / 500 karakter
                </span>
              </div>
            ) : (
              <div
                onClick={() => openEditDrawer('bio')}
                className="p-6 rounded-[8px] border border-dashed border-slate-300 dark:border-slate-700 text-center hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition cursor-pointer space-y-1.5"
              >
                <FileText className="w-6 h-6 text-slate-500 mx-auto dark:text-slate-400" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Belum ada ringkasan diri</p>
                <p className="text-caption text-slate-500 dark:text-slate-400">
                  Klik di sini untuk menulis deskripsi singkat tentang latar belakang dan keahlianmu.
                </p>
              </div>
            )}
          </div>

          {/* Sub-Card 4: Tautan Portofolio & Jejaring Sosial */}
          <div className="p-4 sm:p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Portofolio &amp; Media Sosial</span>
                </h4>
                <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5">
                  Tautkan profil online agar recruiter dapat mengecek karya nyata dan rekam jejak kamu.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openEditDrawer('sosial')}
                title="Ubah tautan portofolio"
                aria-label="Ubah tautan portofolio"
                className="px-3 py-1.5 min-h-[36px] sm:min-h-[32px] rounded-[8px] text-xs font-bold text-cobalt-600 hover:text-cobalt-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
              >
                Ubah
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* LinkedIn */}
              <div className="p-3.5 rounded-[8px] bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-[6px] bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Linkedin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-caption font-semibold text-slate-500 dark:text-slate-400 block">LinkedIn</span>
                    {profileData.linkedin ? (
                      <a
                        href={profileData.linkedin.startsWith('http') ? profileData.linkedin : `https://${profileData.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline truncate block"
                      >
                        {profileData.linkedin.replace(/^https?:\/\/(www\.)?/, '')}
                      </a>
                    ) : (
                      <span className="text-xs text-slate-500 italic block dark:text-slate-400">Belum ditambahkan</span>
                    )}
                  </div>
                </div>
                {profileData.linkedin && (
                  <a
                    href={profileData.linkedin.startsWith('http') ? profileData.linkedin : `https://${profileData.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-[6px] text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 shrink-0 dark:text-slate-400"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* GitHub */}
              <div className="p-3.5 rounded-[8px] bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-[6px] bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center shrink-0">
                    <Github className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-caption font-semibold text-slate-500 dark:text-slate-400 block">GitHub / Repo</span>
                    {profileData.github ? (
                      <a
                        href={profileData.github.startsWith('http') ? profileData.github : `https://${profileData.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-slate-900 dark:text-white hover:underline truncate block"
                      >
                        {profileData.github.replace(/^https?:\/\/(www\.)?/, '')}
                      </a>
                    ) : (
                      <span className="text-xs text-slate-500 italic block dark:text-slate-400">Belum ditambahkan</span>
                    )}
                  </div>
                </div>
                {profileData.github && (
                  <a
                    href={profileData.github.startsWith('http') ? profileData.github : `https://${profileData.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-[6px] text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 shrink-0 dark:text-slate-400"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Website */}
              <div className="p-3.5 rounded-[8px] bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-[6px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-caption font-semibold text-slate-500 dark:text-slate-400 block">Website Pribadi</span>
                    {profileData.website ? (
                      <a
                        href={profileData.website.startsWith('http') ? profileData.website : `https://${profileData.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline truncate block"
                      >
                        {profileData.website.replace(/^https?:\/\/(www\.)?/, '')}
                      </a>
                    ) : (
                      <span className="text-xs text-slate-500 italic block dark:text-slate-400">Belum ditambahkan</span>
                    )}
                  </div>
                </div>
                {profileData.website && (
                  <a
                    href={profileData.website.startsWith('http') ? profileData.website : `https://${profileData.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-[6px] text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 shrink-0 dark:text-slate-400"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Portfolio */}
              <div className="p-3.5 rounded-[8px] bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-[6px] bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-caption font-semibold text-slate-500 dark:text-slate-400 block">Dribbble / Portofolio</span>
                    {profileData.portfolio ? (
                      <a
                        href={profileData.portfolio.startsWith('http') ? profileData.portfolio : `https://${profileData.portfolio}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-orange-700 dark:text-orange-400 hover:underline truncate block"
                      >
                        {profileData.portfolio.replace(/^https?:\/\/(www\.)?/, '')}
                      </a>
                    ) : (
                      <span className="text-xs text-slate-500 italic block dark:text-slate-400">Belum ditambahkan</span>
                    )}
                  </div>
                </div>
                {profileData.portfolio && (
                  <a
                    href={profileData.portfolio.startsWith('http') ? profileData.portfolio : `https://${profileData.portfolio}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-[6px] text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 shrink-0 dark:text-slate-400"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Sub-Card 5: Preferensi Tampilan Aplikasi (Akses langsung dari Profil) */}
          <div className="p-4 sm:p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Mode Tampilan Aplikasi</span>
                </h4>
                <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5">
                  Pilih tema tampilan yang paling nyaman untuk matamu saat menyusun CV dan melacak lamaran kerja.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSpecificThemeMode('light')}
                className={cn(
                  'p-3.5 rounded-[10px] border text-left flex items-center justify-between gap-3 transition cursor-pointer min-h-[48px]',
                  themeMode === 'light'
                    ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 shadow-2xs ring-2 ring-amber-500/20'
                    : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[8px] bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Mode Terang</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Latar cerah bersih</span>
                  </div>
                </div>
                {themeMode === 'light' && <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => setSpecificThemeMode('dark')}
                className={cn(
                  'p-3.5 rounded-[10px] border text-left flex items-center justify-between gap-3 transition cursor-pointer min-h-[48px]',
                  themeMode === 'dark'
                    ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800 shadow-2xs ring-2 ring-blue-500/20'
                    : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[8px] bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Mode Gelap</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Teduh di malam hari</span>
                  </div>
                </div>
                {themeMode === 'dark' && <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => setSpecificThemeMode('system')}
                className={cn(
                  'p-3.5 rounded-[10px] border text-left flex items-center justify-between gap-3 transition cursor-pointer min-h-[48px]',
                  themeMode === 'system'
                    ? 'bg-slate-100 dark:bg-slate-800 border-slate-400 dark:border-slate-600 shadow-2xs ring-2 ring-slate-500/20'
                    : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[8px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Ikuti Sistem</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Otomatis dari OS</span>
                  </div>
                </div>
                {themeMode === 'system' && <CheckCircle2 className="w-4 h-4 text-slate-600 dark:text-slate-300 shrink-0" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: PREFERENSI KARIR */}
      {/* ========================================================================= */}
      {activeSubTab === 'karir' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Section Heading Banner */}
          <div className="flex items-center justify-between p-4 rounded-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[8px] bg-orange-500/10 text-orange-700 dark:text-orange-400 flex items-center justify-center shrink-0">
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
          </div>

          {/* Sub-Card 1: Target Posisi & Industri */}
          <div className="p-4 sm:p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  <span>Posisi &amp; Pengalaman</span>
                </h4>
                <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5">
                  Target jabatan yang sedang aktif kamu cari saat ini.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openEditDrawer('posisi')}
                title="Ubah posisi & industri"
                aria-label="Ubah posisi & industri"
                className="px-3 py-1.5 min-h-[36px] sm:min-h-[32px] rounded-[8px] text-xs font-bold text-cobalt-600 hover:text-cobalt-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
              >
                Ubah
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-[8px] bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                <span className="text-caption font-semibold text-slate-500 dark:text-slate-400 block">Nama Posisi Pekerjaan Target</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  {profileData.targetRole || <span className="text-slate-500 italic font-normal dark:text-slate-400">Belum diisi</span>}
                </p>
              </div>

              <div className="p-3.5 rounded-[8px] bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                <span className="text-caption font-semibold text-slate-500 dark:text-slate-400 block">Tingkat Pengalaman Karir</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  {profileData.experienceYears || <span className="text-slate-500 italic font-normal dark:text-slate-400">Belum dipilih</span>}
                </p>
              </div>

              <div className="p-3.5 rounded-[8px] bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 sm:col-span-2">
                <span className="text-caption font-semibold text-slate-500 dark:text-slate-400 block">Industri Sasaran Utama</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  {profileData.targetIndustry || <span className="text-slate-500 italic font-normal dark:text-slate-400">Belum dipilih</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Sub-Card 2: Ekspektasi Kompensasi */}
          <div className="p-4 sm:p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Ekspektasi Gaji &amp; Benefit</span>
                </h4>
                <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5">
                  Kisaran gaji bulanan bersih (Take-Home Pay) yang diharapkan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openEditDrawer('gaji')}
                title="Ubah ekspektasi kompensasi"
                aria-label="Ubah ekspektasi kompensasi"
                className="px-3 py-1.5 min-h-[36px] sm:min-h-[32px] rounded-[8px] text-xs font-bold text-cobalt-600 hover:text-cobalt-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
              >
                Ubah
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-[8px] bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                <span className="text-caption font-semibold text-slate-500 dark:text-slate-400 block">Ekspektasi Gaji Bulanan</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {profileData.expectedSalary || <span className="text-slate-500 italic font-normal dark:text-slate-400">Belum ditentukan</span>}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-[8px] bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 flex items-center">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${profileData.negotiableSalary ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {profileData.negotiableSalary
                      ? 'Terbuka untuk negosiasi gaji sesuai penawaran benefit'
                      : 'Ekspektasi gaji tetap (tidak nego)'}
                  </span>
                </div>
              </div>

              <div className="sm:col-span-2 p-3.5 rounded-[8px] bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 space-y-2">
                <span className="text-caption font-semibold text-slate-500 dark:text-slate-400 block">
                  Tunjangan yang Diprioritaskan
                </span>
                {profileData.desiredBenefits && profileData.desiredBenefits.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profileData.desiredBenefits.map((benefit) => (
                      <span
                        key={benefit}
                        className="px-2.5 py-1 rounded-[8px] text-caption font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-1.5"
                      >
                        <Check className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                        <span>{benefit}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 italic block dark:text-slate-400">Belum ada tunjangan yang dipilih</span>
                )}
              </div>
            </div>
          </div>

          {/* Sub-Card 3: Sistem & Lokasi Kerja */}
          <div className="p-4 sm:p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Format &amp; Lokasi Kerja</span>
                </h4>
                <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5">
                  Kondisi kerja yang paling sesuai dengan gaya hidup kamu.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openEditDrawer('format')}
                title="Ubah format & penempatan kerja"
                aria-label="Ubah format & penempatan kerja"
                className="px-3 py-1.5 min-h-[36px] sm:min-h-[32px] rounded-[8px] text-xs font-bold text-cobalt-600 hover:text-cobalt-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
              >
                Ubah
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-[8px] bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                <span className="text-caption font-semibold text-slate-500 dark:text-slate-400 block">Format Kerja</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  {profileData.workPreference || <span className="text-slate-500 italic font-normal dark:text-slate-400">Belum dipilih</span>}
                </p>
              </div>

              <div className="p-3.5 rounded-[8px] bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                <span className="text-caption font-semibold text-slate-500 dark:text-slate-400 block">Kota Sasaran Kerja</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  {profileData.targetCities || <span className="text-slate-500 italic font-normal dark:text-slate-400">Belum ditentukan</span>}
                </p>
              </div>

              <div className="p-3.5 rounded-[8px] bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                <span className="text-caption font-semibold text-slate-500 dark:text-slate-400 block">Kesiapan Relokasi</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  {profileData.canRelocate ? 'Siap Relokasi ke Luar Kota' : 'Hanya Wilayah Domisili Saat Ini'}
                </p>
              </div>
            </div>
          </div>

          {/* Sub-Card 4: Status Ketersediaan */}
          <div className="p-4 sm:p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Ketersediaan Bekerja</span>
                </h4>
                <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5">
                  Memberi tahu recruiter kapan kamu bisa mulai bergabung.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openEditDrawer('ketersediaan')}
                title="Ubah status ketersediaan"
                aria-label="Ubah status ketersediaan"
                className="px-3 py-1.5 min-h-[36px] sm:min-h-[32px] rounded-[8px] text-xs font-bold text-cobalt-600 hover:text-cobalt-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
              >
                Ubah
              </button>
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
                    className={`p-3.5 rounded-[10px] border transition ${
                      isSelected
                        ? 'border-cobalt-500 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-cobalt-500/30'
                        : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/30 opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-extrabold text-xs ${isSelected ? 'text-cobalt-500 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {status.title}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-cobalt-500 dark:text-blue-400" />}
                    </div>
                    <p className="text-caption text-slate-500 dark:text-slate-400 mt-1">{status.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Guidance Info */}
          <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
            <p className="text-caption text-slate-500 dark:text-slate-400">
              Preferensi karir ini membantu menyesuaikan matriks penilaian di fitur Evaluasi CV &amp; rekomendasi lowongan kerja. Gunakan tombol Ubah pada tiap seksi untuk memperbarui.
            </p>
          </div>
        </div>
      )}



      {/* ========================================================================= */}
      {/* SECTION 4: KEAMANAN & AKUN */}
      {/* ========================================================================= */}
      {activeSubTab === 'keamanan' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Section Heading Banner */}
          <div className="flex items-center justify-between p-4 rounded-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[8px] bg-cobalt-500/10 text-cobalt-500 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center shrink-0">
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
          <div className="p-4 sm:p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-orange-700 dark:text-orange-400" />
                <span>Ubah Kata Sandi Akun</span>
              </h4>
              <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5">
                Disarankan memperbarui kata sandi secara berkala dengan minimal 8 karakter.
              </p>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                  toast.error('Gagal', 'Konfirmasi kata sandi baru tidak cocok.');
                  return;
                }
                setIsChangingPassword(true);
                try {
                  const res = await userApi.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
                  if (res && res.success) {
                    toast.success('Kata Sandi Diperbarui', res.message || 'Kata sandi akun kamu berhasil diubah.');
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  } else {
                    toast.error('Gagal Mengubah Sandi', res?.message || 'Kata sandi saat ini tidak cocok.');
                  }
                } catch (err: any) {
                  toast.error('Gagal Mengubah Sandi', err?.message || 'Terjadi kesalahan sistem.');
                } finally {
                  setIsChangingPassword(false);
                }
              }}
              className="space-y-4 max-w-lg"
            >
              <div className="space-y-1.5">
                <label htmlFor="security-currentPassword" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Kata Sandi Saat Ini *
                </label>
                <input
                  id="security-currentPassword"
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Masukkan kata sandi lama"
                  className="w-full px-3.5 py-2.5 text-base sm:text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-cobalt-500 focus:outline-none font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="security-newPassword" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Kata Sandi Baru *
                </label>
                <input
                  id="security-newPassword"
                  type="password"
                  required
                  minLength={8}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Minimal 8 karakter kombinasi"
                  className="w-full px-3.5 py-2.5 text-base sm:text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-cobalt-500 focus:outline-none font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="security-confirmPassword" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Konfirmasi Kata Sandi Baru *
                </label>
                <input
                  id="security-confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Ulangi kata sandi baru"
                  className="w-full px-3.5 py-2.5 text-base sm:text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-cobalt-500 focus:outline-none font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="px-6 py-2.5 rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 active:scale-[0.98] text-white font-bold text-xs transition shadow-md shadow-cobalt-500/20 flex items-center gap-2 cursor-pointer border-0 disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>{isChangingPassword ? 'Memperbarui...' : 'Perbarui Kata Sandi'}</span>
              </button>
            </form>
          </div>

          {/* Sub-Card 2: Autentikasi 2FA & Akun Terhubung */}
          <div className="p-4 sm:p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>Autentikasi &amp; Akun Terhubung</span>
              </h4>
              <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5">
                Metode verifikasi ganda untuk mencegah login tak dikenal.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white">Verifikasi Dua Langkah (2FA)</h5>
                  <p className="text-caption text-slate-500 dark:text-slate-400">
                    Kirimkan kode OTP ke WhatsApp / Email setiap kali login dari peramban yang tidak dikenali.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-[6px] text-caption font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 shrink-0">
                  Segera Hadir
                </span>
              </div>

              <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white">Masuk dengan Akun Google</h5>
                  <p className="text-caption text-slate-500 dark:text-slate-400">
                    {profileData.email ? `Tersedia untuk masuk cepat menggunakan ${profileData.email}.` : 'Tersedia untuk masuk instan dengan akun Google.'}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-[6px] text-caption font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                  Tersedia
                </span>
              </div>
            </div>
          </div>

          {/* Sub-Card 3: Sesi Login Aktif */}
          <div className="p-4 sm:p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Daftar Perangkat &amp; Sesi Login Aktif</span>
                </h4>
                <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5">
                  Perangkat yang sedang memiliki akses aktif ke akun kamu.
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <Laptop className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
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
                      {profileData.location ? `${profileData.location} • ` : ''}Sesi Aktif
                    </p>
                  </div>
                </div>
                <span className="text-caption font-bold text-emerald-700 dark:text-emerald-400">Online</span>
              </div>
            </div>
          </div>

          {/* Sub-Card 4: Keluar Akun (Logout) */}
          <div className="p-4 sm:p-6 rounded-[10px] bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
              <div className="w-10 h-10 rounded-[8px] bg-orange-500/10 text-orange-700 dark:text-orange-400 flex items-center justify-center shrink-0">
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
              className="px-4 py-2.5 rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 active:scale-[0.98] text-white font-semibold text-xs transition shadow-md shadow-cobalt-500/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
            </button>
          </div>

          {/* Sub-Card 1: Tema Tampilan */}
          <div className="p-4 sm:p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Sun className="w-4 h-4 text-orange-700 dark:text-orange-400" />
                <span>Pengaturan Tema Tampilan Antarmuka</span>
              </h4>
              <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5">
                Sesuaikan mode warna tampilan yang paling nyaman untuk matamu saat membaca berkas CV.
              </p>
            </div>

            <div role="radiogroup" aria-label="Pilihan Tema Tampilan Antarmuka" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                role="radio"
                aria-checked={themeMode === 'light'}
                onClick={() => {
                  setSpecificThemeMode('light');
                  userApi.updateProfile({ preferences: { theme: 'light' } }).catch(() => {});
                }}
                className={`p-4 rounded-[10px] border text-left transition flex flex-col justify-between space-y-3 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 ${
                  themeMode === 'light'
                    ? 'border-cobalt-500 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-cobalt-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-[8px] bg-amber-100 text-amber-700">
                    <Sun className="w-5 h-5" />
                  </div>
                  {themeMode === 'light' && <CheckCircle2 className="w-5 h-5 text-cobalt-500" />}
                </div>
                <div>
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white block">Mode Terang (Light)</span>
                  <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5">Latar bersih berstandar dokumen cetak.</p>
                </div>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={themeMode === 'dark'}
                onClick={() => {
                  setSpecificThemeMode('dark');
                  userApi.updateProfile({ preferences: { theme: 'dark' } }).catch(() => {});
                }}
                className={`p-4 rounded-[10px] border text-left transition flex flex-col justify-between space-y-3 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 ${
                  themeMode === 'dark'
                    ? 'border-cobalt-500 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-cobalt-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-[8px] bg-slate-900 text-slate-100">
                    <Moon className="w-5 h-5" />
                  </div>
                  {themeMode === 'dark' && <CheckCircle2 className="w-5 h-5 text-cobalt-500" />}
                </div>
                <div>
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white block">Mode Gelap (Dark)</span>
                  <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5">Kontras redup untuk penggunaan malam hari.</p>
                </div>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={themeMode === 'system'}
                onClick={() => {
                  setSpecificThemeMode('system');
                  userApi.updateProfile({ preferences: { theme: 'system' } }).catch(() => {});
                }}
                className={`p-4 rounded-[10px] border text-left transition flex flex-col justify-between space-y-3 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 ${
                  themeMode === 'system'
                    ? 'border-cobalt-500 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-cobalt-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-[8px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                    <Laptop className="w-5 h-5" />
                  </div>
                  {themeMode === 'system' && <CheckCircle2 className="w-5 h-5 text-cobalt-500" />}
                </div>
                <div>
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white block">Otomatis (Sistem)</span>
                  <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5">Mengikuti tema OS laptop/HP kamu.</p>
                </div>
              </button>
            </div>
          </div>

          {/* Sub-Card 2: Notifikasi & Pengingat */}
          <div className="p-4 sm:p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Pengaturan Notifikasi &amp; Pengingat</span>
              </h4>
              <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5">
                Kendalikan pesan yang ingin kamu terima melalui Email maupun WhatsApp.
              </p>
            </div>

            <div className="space-y-3">
              {/* Suara Notifikasi Selesai */}
              <div className="flex items-center justify-between p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 gap-3 sm:gap-4 transition hover:bg-slate-100/60 dark:hover:bg-slate-800/60">
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                  <div
                    className={cn(
                      'w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0 transition-colors',
                      notifications.soundAlerts
                        ? 'bg-blue-50 text-cobalt-600 dark:bg-blue-950/70 dark:text-blue-400'
                        : 'bg-slate-200/60 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                    )}
                  >
                    {notifications.soundAlerts ? (
                      <Volume2 className="w-4 h-4" />
                    ) : (
                      <VolumeX className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        Suara Notifikasi Selesai
                      </span>
                      {notifications.soundAlerts && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            playSuccessChime(0.12, true);
                          }}
                          className="text-[11px] font-bold text-cobalt-600 dark:text-blue-400 hover:underline cursor-pointer shrink-0"
                          title="Putar uji coba nada suara"
                        >
                          (Tes Suara)
                        </button>
                      )}
                    </div>
                    <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      Bunyikan nada lembut saat ekstraksi profil LinkedIn atau analisis CV rampung.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={notifications.soundAlerts}
                  onClick={() => {
                    const nextVal = !notifications.soundAlerts;
                    setNotifications((prev) => ({ ...prev, soundAlerts: nextVal }));
                    setSoundEnabled(nextVal);
                    if (nextVal) {
                      playSuccessChime(0.1, true);
                    }
                  }}
                  className={cn(
                    'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500',
                    notifications.soundAlerts ? 'bg-[#1738D1]' : 'bg-slate-300 dark:bg-slate-700'
                  )}
                >
                  <span className="sr-only">Aktifkan efek suara notifikasi</span>
                  <span
                    aria-hidden="true"
                    style={{ left: notifications.soundAlerts ? 'calc(100% - 22px)' : '2px' }}
                    className="pointer-events-none absolute top-0.5 block h-5 w-5 rounded-full bg-white shadow-xs transition-[left] duration-200 ease-in-out"
                  />
                </button>
              </div>
              <label className="flex items-center justify-between p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 cursor-pointer">
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">
                    Email Rekomendasi Lowongan Kerja Baru
                  </span>
                  <span className="text-caption text-slate-500 dark:text-slate-400">
                    Dapatkan kurasi loker yang 90%+ cocok dengan CV kamu setiap Senin pagi.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailJobAlerts}
                  onChange={(e) => setNotifications({ ...notifications, emailJobAlerts: e.target.checked })}
                  className="w-4 h-4 text-cobalt-500 rounded-[6px] accent-[#1738D1]"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 cursor-pointer">
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">
                    Email Pengingat Jadwal Interview (H-1)
                  </span>
                  <span className="text-caption text-slate-500 dark:text-slate-400">
                    Peringatan otomatis 1 hari sebelum jadwal interview kerja yang kamu catat di Tracker.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailInterviewReminders}
                  onChange={(e) => setNotifications({ ...notifications, emailInterviewReminders: e.target.checked })}
                  className="w-4 h-4 text-cobalt-500 rounded-[6px] accent-[#1738D1]"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 cursor-pointer">
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">
                    Pengingat WhatsApp &amp; Update Lamaran
                  </span>
                  <span className="text-caption text-slate-500 dark:text-slate-400">
                    Pemberitahuan berkala progres lamaran kerja dan agenda kariermu.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.whatsappAlerts}
                  onChange={(e) => setNotifications({ ...notifications, whatsappAlerts: e.target.checked })}
                  className="w-4 h-4 text-cobalt-500 rounded-[6px] accent-[#1738D1]"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 cursor-pointer">
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">
                    Newsletter Tips Karir &amp; Bedah CV
                  </span>
                  <span className="text-caption text-slate-500 dark:text-slate-400">
                    Wawasan karir, tren industri, dan contoh CV lolos perusahaan unicorn Indonesia.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailWeeklyTips}
                  onChange={(e) => setNotifications({ ...notifications, emailWeeklyTips: e.target.checked })}
                  className="w-4 h-4 text-cobalt-500 rounded-[6px] accent-[#1738D1]"
                />
              </label>
            </div>
          </div>

          {/* Sub-Card 3: Bahasa, Zona Waktu & Mata Uang */}
          <div className="p-4 sm:p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>Pengaturan Bahasa &amp; Regional</span>
              </h4>
              <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5">
                Standar waktu notifikasi dan penulisan mata uang gaji.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1.5">
                <label htmlFor="pref-language" className="font-bold text-slate-700 dark:text-slate-300 block">Bahasa Antarmuka</label>
                <CustomSelect
                  id="pref-language"
                  value={language}
                  onChange={(val) => {
                    const newLang = val as 'id' | 'en';
                    setLanguage(newLang);
                    handleSaveProfile(undefined, { language: newLang });
                  }}
                  options={[
                    { value: 'id', label: 'Bahasa Indonesia (ID)' },
                    { value: 'en', label: 'English (US)' },
                  ]}
                  placeholder="Pilih Bahasa"
                  aria-label="Bahasa Antarmuka"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="pref-timezone" className="font-bold text-slate-700 dark:text-slate-300 block">Zona Waktu</label>
                <CustomSelect
                  id="pref-timezone"
                  value={timezone}
                  onChange={(val) => {
                    setTimezone(val);
                    handleSaveProfile(undefined, { timezone: val });
                  }}
                  options={[
                    { value: 'Asia/Jakarta (WIB - GMT+7)', label: 'Asia/Jakarta (WIB - GMT+7)' },
                    { value: 'Asia/Makassar (WITA - GMT+8)', label: 'Asia/Makassar (WITA - GMT+8)' },
                    { value: 'Asia/Jayapura (WIT - GMT+9)', label: 'Asia/Jayapura (WIT - GMT+9)' },
                  ]}
                  placeholder="Pilih Zona Waktu"
                  aria-label="Zona Waktu"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="pref-currency" className="font-bold text-slate-700 dark:text-slate-300 block">Mata Uang Acuan</label>
                <CustomSelect
                  id="pref-currency"
                  value={currency}
                  onChange={(val) => {
                    setCurrency(val);
                    handleSaveProfile(undefined, { currency: val });
                  }}
                  options={[
                    { value: 'IDR (Rp)', label: 'IDR - Rupiah Indonesia (Rp)' },
                    { value: 'USD ($)', label: 'USD - US Dollar ($)' },
                    { value: 'SGD (S$)', label: 'SGD - Singapore Dollar (S$)' },
                  ]}
                  placeholder="Pilih Mata Uang"
                  aria-label="Mata Uang Acuan"
                />
              </div>
            </div>
          </div>

          {/* Sub-Card 3.5: Simpan Perubahan Pengaturan */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-center sm:text-left">
              <h5 className="font-bold text-xs text-slate-900 dark:text-white">Simpan Konfigurasi Pengaturan</h5>
              <p className="text-caption text-slate-500 dark:text-slate-400">
                Pastikan pengaturan notifikasi dan preferensi regional telah tersimpan dengan aman ke akun kamu.
              </p>
            </div>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveProfile()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 active:scale-[0.98] text-white font-semibold text-xs transition shadow-md shadow-cobalt-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
            </button>
          </div>

          {/* Sub-Card 4: Unduh & Ekspor Data Pribadi */}
          <div className="p-4 sm:p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-orange-700 dark:text-orange-400" />
                <span>Unduh &amp; Ekspor Data Akun Saya (Hak Portabilitas)</span>
              </h4>
              <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5">
                Dapatkan salinan terenkripsi arsip biodata profil, histori lamaran, dan dokumen CV kamu dalam berkas JSON.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div className="space-y-0.5 text-center sm:text-left">
                <h5 className="font-bold text-xs text-slate-900 dark:text-white">Arsip Portofolio Terpadu</h5>
                <p className="text-caption text-slate-500 dark:text-slate-400">
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

          {/* Sub-Card 5: Bantuan, Lapor Kendala & Saran Fitur */}
          <div className="p-4 sm:p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-cobalt-500 dark:text-blue-400" />
                <span>Bantuan, Laporan Kendala &amp; Saran Fitur</span>
              </h4>
              <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5">
                Punya kendala teknis saat menggunakan aplikasi atau ingin mengusulkan ide fitur baru? Kami siap membantumu.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Card 1: Panduan Tur */}
              <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-[6px] bg-blue-50 dark:bg-blue-950/60 text-cobalt-600 dark:text-blue-400 flex items-center justify-center">
                      <Compass className="w-4 h-4" />
                    </div>
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white">Panduan Tur Aplikasi</h5>
                  </div>
                  <p className="text-caption text-slate-500 dark:text-slate-400 leading-relaxed">
                    Ingin melihat kembali langkah-langkah eksplorasi fitur utama di dashboard? Mulai tur interaktif.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new Event('employr_start_product_tour'));
                    }
                  }}
                  className="px-3.5 py-2 rounded-[8px] bg-cobalt-500 hover:bg-cobalt-600 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs self-start"
                >
                  <Compass className="w-3 h-3" />
                  <span>Mulai Tur Interaktif</span>
                </button>
              </div>

              {/* Card 2: Lapor Bug */}
              <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-[6px] bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white">Lapor Kendala &amp; Bug</h5>
                  </div>
                  <p className="text-caption text-slate-500 dark:text-slate-400 leading-relaxed">
                    Tombol macet, error saat simpan CV, atau masalah tampilan? Buka tiket laporan langsung ke tim teknis kami.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/lapor-bug')}
                  className="px-3.5 py-2 rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs self-start"
                >
                  <span>Buka Tiket Laporan</span>
                  <ExternalLink className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                </button>
              </div>

              {/* Card 3: Saran Fitur */}
              <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-[6px] bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                      <Lightbulb className="w-4 h-4" />
                    </div>
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white">Saran &amp; Request Fitur</h5>
                  </div>
                  <p className="text-caption text-slate-500 dark:text-slate-400 leading-relaxed">
                    Punya ide fitur yang kamu impikan di Employr? Ajukan ide dan beri dukungan pada saran pengguna lain di Wishlist.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/saran-fitur')}
                  className="px-3.5 py-2 rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs self-start"
                >
                  <Lightbulb className="w-3 h-3" />
                  <span>Kirim Saran &amp; Wishlist</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sub-Card 6: Zona Bahaya (Danger Zone) */}
          <div className="p-4 sm:p-6 rounded-[10px] bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-rose-200/80 dark:border-rose-900/40 pb-3">
              <ShieldAlert className="w-5 h-5 text-rose-700 dark:text-rose-400" />
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
                <p className="text-caption text-slate-600 dark:text-slate-300 mt-0.5">
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

      {/* CROSS-NAVIGATION FOOTER BANNER */}
      {isProfileMode ? (
        <div className="p-4 sm:p-5 rounded-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[8px] bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Butuh ganti kata sandi atau kelola sesi login?</p>
              <p className="text-caption text-slate-500 dark:text-slate-400">Atur keamanan akun, preferensi notifikasi, dan tema di halaman Pengaturan.</p>
            </div>
          </div>
          <Link
            href="/pengaturan"
            className="px-3.5 py-2 rounded-[8px] text-xs font-bold text-cobalt-500 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition self-start sm:self-auto shrink-0"
          >
            <span>Buka Pengaturan Akun</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : isPengaturanMode ? (
        <div className="p-4 sm:p-5 rounded-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[8px] bg-blue-50 dark:bg-blue-950/60 text-cobalt-500 dark:text-blue-400 flex items-center justify-center shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Ingin memperbarui biodata diri atau target karir?</p>
              <p className="text-caption text-slate-500 dark:text-slate-400">Kelola informasi kontak, link portofolio, dan target gaji di halaman Profil Saya.</p>
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
      ) : null}

      {/* ========================================================================= */}
      {/* DRAWER PENGEDITAN PROFIL PER-SEKSI (Employr Right Drawer Spec) */}
      {/* ========================================================================= */}
      <Sheet open={Boolean(activeEditDrawer)} onOpenChange={(open) => { if (!open) closeEditDrawer(); }}>
        <SheetContent side="right" className="w-full max-w-md sm:max-w-xl p-0 flex flex-col justify-between overflow-hidden">
          {/* Header */}
          <SheetHeader className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 shrink-0 space-y-0 pr-12">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[8px] bg-blue-50 dark:bg-blue-950 text-cobalt-500 dark:text-blue-400 flex items-center justify-center shrink-0">
                {activeEditDrawer === 'identitas' && <User className="w-4 h-4" />}
                {activeEditDrawer === 'kontak' && <Mail className="w-4 h-4" />}
                {activeEditDrawer === 'bio' && <FileText className="w-4 h-4" />}
                {activeEditDrawer === 'sosial' && <Globe className="w-4 h-4" />}
                {activeEditDrawer === 'posisi' && <Briefcase className="w-4 h-4" />}
                {activeEditDrawer === 'gaji' && <DollarSign className="w-4 h-4" />}
                {activeEditDrawer === 'format' && <Building className="w-4 h-4" />}
                {activeEditDrawer === 'ketersediaan' && <Clock className="w-4 h-4" />}
              </div>
              <div className="text-left">
                <SheetTitle className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {activeEditDrawer === 'identitas' && 'Ubah Identitas Diri'}
                  {activeEditDrawer === 'kontak' && 'Ubah Kontak & Domisili'}
                  {activeEditDrawer === 'bio' && 'Ubah Ringkasan Diri (Bio)'}
                  {activeEditDrawer === 'sosial' && 'Ubah Tautan & Portofolio'}
                  {activeEditDrawer === 'posisi' && 'Ubah Posisi & Industri Sasaran'}
                  {activeEditDrawer === 'gaji' && 'Ubah Ekspektasi Kompensasi'}
                  {activeEditDrawer === 'format' && 'Ubah Format & Lokasi Kerja'}
                  {activeEditDrawer === 'ketersediaan' && 'Ubah Status Ketersediaan'}
                </SheetTitle>
                <p className="text-caption text-slate-500 dark:text-slate-400">
                  {activeEditDrawer === 'identitas' && 'Perbarui nama lengkap, headline, jenis kelamin, dan tanggal lahir.'}
                  {activeEditDrawer === 'kontak' && 'Perbarui nomor WhatsApp, kota domisili, dan alamat lengkap.'}
                  {activeEditDrawer === 'bio' && 'Ringkasan ini akan diselaraskan ke ringkasan profesional CV kamu.'}
                  {activeEditDrawer === 'sosial' && 'Kelola tautan akun profesional, repositori kode, dan portofolio karya.'}
                  {activeEditDrawer === 'posisi' && 'Tentukan target jabatan, tingkat pengalaman, dan industri impian.'}
                  {activeEditDrawer === 'gaji' && 'Tentukan kisaran gaji bulanan bersih dan tunjangan prioritas.'}
                  {activeEditDrawer === 'format' && 'Pilih sistem kerja yang sesuai dan kesiapan relokasi wilayah.'}
                  {activeEditDrawer === 'ketersediaan' && 'Tentukan waktu kesiapan kamu untuk mulai bergabung bekerja.'}
                </p>
              </div>
            </div>
          </SheetHeader>

            {/* Form Body */}
            <form
              id="edit-profile-drawer-form"
              onSubmit={handleSaveDrawer}
              className="p-6 pb-36 sm:pb-28 space-y-4 overflow-y-auto flex-1"
            >
              {/* Seksi: Identitas */}
              {activeEditDrawer === 'identitas' && (
                <>
                  <div className="space-y-1.5">
                    <label htmlFor="drawer-fullName" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Nama Lengkap *
                    </label>
                    <input
                      id="drawer-fullName"
                      type="text"
                      required
                      value={drawerFormData.fullName}
                      onChange={(e) => setDrawerFormData({ ...drawerFormData, fullName: e.target.value })}
                      placeholder="Nama lengkap kamu"
                      className="w-full px-3.5 py-2.5 text-base sm:text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-cobalt-500 focus:outline-none font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="drawer-headline" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Headline Profesional
                    </label>
                    <input
                      id="drawer-headline"
                      type="text"
                      value={drawerFormData.headline}
                      onChange={(e) => setDrawerFormData({ ...drawerFormData, headline: e.target.value })}
                      placeholder="Contoh: Fresh Graduate Teknik Informatika | Web Developer"
                      className="w-full px-3.5 py-2.5 text-base sm:text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-cobalt-500 focus:outline-none font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="drawer-gender" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Jenis Kelamin
                      </label>
                      <CustomSelect
                        id="drawer-gender"
                        value={drawerFormData.gender}
                        onChange={(val) => setDrawerFormData({ ...drawerFormData, gender: val })}
                        options={[
                          { value: 'Laki-laki', label: 'Laki-laki' },
                          { value: 'Perempuan', label: 'Perempuan' },
                        ]}
                        placeholder="Pilih Jenis Kelamin"
                        aria-label="Jenis Kelamin"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="drawer-birthDate" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Tanggal Lahir
                      </label>
                      <DatePicker
                        id="drawer-birthDate"
                        value={drawerFormData.birthDate}
                        onChange={(val) => setDrawerFormData({ ...drawerFormData, birthDate: val })}
                        placeholder="Pilih tanggal lahir..."
                        showPresets={false}
                        align="right"
                        maxYear={new Date().getFullYear()}
                        minYear={1950}
                        aria-label="Tanggal Lahir"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Seksi: Kontak */}
              {activeEditDrawer === 'kontak' && (
                <>
                  <div className="space-y-1.5">
                    <label htmlFor="drawer-email" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Alamat Email
                    </label>
                    <input
                      id="drawer-email"
                      type="email"
                      disabled
                      value={drawerFormData.email}
                      className="w-full px-3.5 py-2.5 text-base sm:text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/40-slate-600 font-medium cursor-not-allowed"
                    />
                    <p className="text-caption text-slate-500 dark:text-slate-400">
                      Email terikat dengan autentikasi akun utama demi keamanan.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="drawer-phone" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Nomor WhatsApp / HP *
                    </label>
                    <input
                      id="drawer-phone"
                      type="tel"
                      value={drawerFormData.phone}
                      onChange={(e) => setDrawerFormData({ ...drawerFormData, phone: e.target.value })}
                      placeholder="Contoh: 081234567890"
                      className="w-full px-3.5 py-2.5 text-base sm:text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-cobalt-500 focus:outline-none font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="drawer-location" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Kota &amp; Provinsi Domisili *
                    </label>
                    <input
                      id="drawer-location"
                      type="text"
                      value={drawerFormData.location}
                      onChange={(e) => setDrawerFormData({ ...drawerFormData, location: e.target.value })}
                      placeholder="Contoh: Jakarta Selatan, DKI Jakarta"
                      className="w-full px-3.5 py-2.5 text-base sm:text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-cobalt-500 focus:outline-none font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="drawer-address" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Alamat Lengkap Tempat Tinggal
                    </label>
                    <textarea
                      id="drawer-address"
                      rows={3}
                      value={drawerFormData.address}
                      onChange={(e) => setDrawerFormData({ ...drawerFormData, address: e.target.value })}
                      placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
                      className="w-full px-3.5 py-2.5 text-base sm:text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-cobalt-500 focus:outline-none font-medium resize-none"
                    />
                  </div>
                </>
              )}

              {/* Seksi: Bio */}
              {activeEditDrawer === 'bio' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="drawer-bio" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Ringkasan Profil (Bio)
                    </label>
                    <span className={`text-caption font-mono ${drawerFormData.bio.length > 500 ? 'text-rose-700 font-bold' : 'text-slate-500'} dark:text-slate-400`}>
                      {drawerFormData.bio.length}/500
                    </span>
                  </div>
                  <textarea
                    id="drawer-bio"
                    rows={8}
                    maxLength={500}
                    value={drawerFormData.bio}
                    onChange={(e) => setDrawerFormData({ ...drawerFormData, bio: e.target.value })}
                    placeholder="Ceritakan latar belakang pendidikan, keahlian utama, motivasi karir, atau pencapaian menarik kamu..."
                    className="w-full px-3.5 py-2.5 text-base sm:text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-cobalt-500 focus:outline-none font-medium leading-relaxed resize-none"
                  />
                  <p className="text-caption text-slate-500 dark:text-slate-400">
                    Tuliskan 2-4 kalimat ringkas yang merefleksikan kepribadian dan tujuan karir profesionalmu.
                  </p>
                </div>
              )}

              {/* Seksi: Sosial & Portofolio */}
              {activeEditDrawer === 'sosial' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="drawer-linkedin" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                      <span>LinkedIn URL</span>
                    </label>
                    <input
                      id="drawer-linkedin"
                      type="text"
                      value={drawerFormData.linkedin}
                      onChange={(e) => setDrawerFormData({ ...drawerFormData, linkedin: e.target.value })}
                      placeholder="linkedin.com/in/username"
                      className="w-full px-3.5 py-2.5 text-base sm:text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-cobalt-500 focus:outline-none font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="drawer-github" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Github className="w-3.5 h-3.5 text-slate-800 dark:text-slate-200" />
                      <span>GitHub / Repository URL</span>
                    </label>
                    <input
                      id="drawer-github"
                      type="text"
                      value={drawerFormData.github}
                      onChange={(e) => setDrawerFormData({ ...drawerFormData, github: e.target.value })}
                      placeholder="github.com/username"
                      className="w-full px-3.5 py-2.5 text-base sm:text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-cobalt-500 focus:outline-none font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="drawer-website" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                      <span>Website Pribadi URL</span>
                    </label>
                    <input
                      id="drawer-website"
                      type="text"
                      value={drawerFormData.website}
                      onChange={(e) => setDrawerFormData({ ...drawerFormData, website: e.target.value })}
                      placeholder="https://mywebsite.com"
                      className="w-full px-3.5 py-2.5 text-base sm:text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-cobalt-500 focus:outline-none font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="drawer-portfolio" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-orange-700 dark:text-orange-400" />
                      <span>Dribbble / Portofolio URL</span>
                    </label>
                    <input
                      id="drawer-portfolio"
                      type="text"
                      value={drawerFormData.portfolio}
                      onChange={(e) => setDrawerFormData({ ...drawerFormData, portfolio: e.target.value })}
                      placeholder="dribbble.com/username atau behance.net/username"
                      className="w-full px-3.5 py-2.5 text-base sm:text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-cobalt-500 focus:outline-none font-medium"
                    />
                  </div>
                </div>
              )}

              {/* Seksi: Posisi & Industri */}
              {activeEditDrawer === 'posisi' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="drawer-targetRole" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Nama Posisi Pekerjaan Target *
                    </label>
                    <input
                      id="drawer-targetRole"
                      type="text"
                      required
                      value={drawerFormData.targetRole}
                      onChange={(e) => setDrawerFormData({ ...drawerFormData, targetRole: e.target.value })}
                      placeholder="Contoh: Staff Administrasi, Front-End Developer, dll"
                      className="w-full px-3.5 py-2.5 text-base sm:text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-cobalt-500 focus:outline-none font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="drawer-experienceYears" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Tingkat Pengalaman Karir
                    </label>
                    <CustomSelect
                      id="drawer-experienceYears"
                      value={drawerFormData.experienceYears}
                      onChange={(val) => setDrawerFormData({ ...drawerFormData, experienceYears: val })}
                      options={[
                        { value: 'Fresh Graduate (0-1 Tahun)', label: 'Fresh Graduate (0-1 Tahun)' },
                        { value: 'Junior (1-3 Tahun)', label: 'Junior (1-3 Tahun)' },
                        { value: 'Mid-Level (3-5 Tahun)', label: 'Mid-Level (3-5 Tahun)' },
                        { value: 'Senior (5+ Tahun)', label: 'Senior (5+ Tahun)' },
                        { value: 'Magang / Internship', label: 'Magang / Internship Mahasiswa' },
                      ]}
                      placeholder="Pilih Tingkat Pengalaman"
                      aria-label="Tingkat Pengalaman Karir"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="drawer-targetIndustry" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Industri Sasaran Utama
                    </label>
                    <CustomSelect
                      id="drawer-targetIndustry"
                      value={drawerFormData.targetIndustry}
                      onChange={(val) => setDrawerFormData({ ...drawerFormData, targetIndustry: val })}
                      options={[
                        { value: 'Teknologi & Startup Digital', label: 'Teknologi & Startup Digital (Software, SaaS, E-Commerce)' },
                        { value: 'Perbankan & Financial Technology (Fintech)', label: 'Perbankan & Financial Technology (Fintech)' },
                        { value: 'BUMN & Perusahaan Multinasional', label: 'BUMN & Perusahaan Multinasional' },
                        { value: 'FMCG & Manufaktur', label: 'FMCG, Ritel & Manufaktur' },
                        { value: 'Konsultan & Agensi Kreatif', label: 'Konsultan Manajemen & Agensi Kreatif' },
                      ]}
                      placeholder="Pilih Industri Sasaran"
                      aria-label="Industri Sasaran Utama"
                    />
                  </div>
                </div>
              )}

              {/* Seksi: Gaji & Benefit */}
              {activeEditDrawer === 'gaji' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="drawer-expectedSalary" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Ekspektasi Gaji Bulanan
                    </label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 dark:text-slate-400" />
                      <input
                        id="drawer-expectedSalary"
                        type="text"
                        value={drawerFormData.expectedSalary}
                        onChange={(e) => setDrawerFormData({ ...drawerFormData, expectedSalary: e.target.value })}
                        placeholder="Contoh: Rp 5.000.000 - Rp 8.000.000"
                        className="w-full pl-9 pr-3.5 py-2.5 text-base sm:text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-cobalt-500 focus:outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="drawer-negotiableSalary" className="flex items-center gap-2.5 p-3 rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
                      <input
                        id="drawer-negotiableSalary"
                        type="checkbox"
                        checked={drawerFormData.negotiableSalary}
                        onChange={(e) => setDrawerFormData({ ...drawerFormData, negotiableSalary: e.target.checked })}
                        className="w-4 h-4 text-cobalt-500 rounded-[6px] accent-[#1738D1]"
                      />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Terbuka untuk negosiasi gaji sesuai penawaran benefit
                      </span>
                    </label>
                  </div>

                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Tunjangan yang Diprioritaskan:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'BPJS Kesehatan & Ketenagakerjaan',
                        'Asuransi Swasta Tambahan',
                        'Laptop Kerja / Tunjangan Device',
                        'Tunjangan Pelatihan / Sertifikasi',
                        'Bonus Tahunan & Kinerja',
                        'Tunjangan Makan & Transport',
                      ].map((benefit) => {
                        const isChecked = drawerFormData.desiredBenefits.includes(benefit);
                        return (
                          <button
                            key={benefit}
                            type="button"
                            onClick={() => {
                              const updated = isChecked
                                ? drawerFormData.desiredBenefits.filter((b) => b !== benefit)
                                : [...drawerFormData.desiredBenefits, benefit];
                              setDrawerFormData({ ...drawerFormData, desiredBenefits: updated });
                            }}
                            className={`px-3 py-1.5 rounded-[8px] text-caption font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                              isChecked
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                                : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />}
                            <span>{benefit}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Seksi: Format & Lokasi */}
              {activeEditDrawer === 'format' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="drawer-workPreference" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Format Kerja
                    </label>
                    <CustomSelect
                      id="drawer-workPreference"
                      value={drawerFormData.workPreference}
                      onChange={(val) => setDrawerFormData({ ...drawerFormData, workPreference: val })}
                      options={[
                        { value: 'Hybrid / Remote', label: 'Hybrid / Remote (Fleksibel)' },
                        { value: 'Full Remote', label: 'Full Remote (100% Dari Rumah)' },
                        { value: 'On-Site / WFO', label: 'On-Site / WFO (Kantor Fisik)' },
                      ]}
                      placeholder="Pilih Format Kerja"
                      aria-label="Format Kerja"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="drawer-targetCities" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Kota Sasaran Kerja
                    </label>
                    <input
                      id="drawer-targetCities"
                      type="text"
                      value={drawerFormData.targetCities}
                      onChange={(e) => setDrawerFormData({ ...drawerFormData, targetCities: e.target.value })}
                      placeholder="Contoh: Jakarta, Bandung, Remote"
                      className="w-full px-3.5 py-2.5 text-base sm:text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-cobalt-500 focus:outline-none font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="drawer-canRelocate" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Kesiapan Relokasi
                    </label>
                    <CustomSelect
                      id="drawer-canRelocate"
                      value={drawerFormData.canRelocate ? 'yes' : 'no'}
                      onChange={(val) => setDrawerFormData({ ...drawerFormData, canRelocate: val === 'yes' })}
                      options={[
                        { value: 'no', label: 'Hanya Wilayah Domisili Saat Ini' },
                        { value: 'yes', label: 'Siap Relokasi ke Luar Kota' },
                      ]}
                      placeholder="Pilih Kesiapan Relokasi"
                      aria-label="Kesiapan Relokasi"
                    />
                  </div>
                </div>
              )}

              {/* Seksi: Ketersediaan Bekerja */}
              {activeEditDrawer === 'ketersediaan' && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Pilih Status Ketersediaan Bekerja Saat Ini:
                  </span>
                  {[
                    { title: 'Siap Bekerja Segera', desc: 'Tidak terikat kontrak, bisa mulai hari ini.' },
                    { title: 'Notice Period (1 Bulan)', desc: 'Masih bekerja, butuh waktu transisi 1 bulan.' },
                    { title: 'Terbuka Peluang Baru', desc: 'Secara pasif melihat tawaran yang cocok.' },
                  ].map((status) => {
                    const isSelected = drawerFormData.availability === status.title;
                    return (
                      <button
                        key={status.title}
                        type="button"
                        onClick={() => setDrawerFormData({ ...drawerFormData, availability: status.title })}
                        className={`w-full p-4 rounded-[10px] border text-left transition flex items-start justify-between cursor-pointer ${
                          isSelected
                            ? 'border-cobalt-500 bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-cobalt-500/20'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                            {status.title}
                          </span>
                          <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5">{status.desc}</p>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-cobalt-500 shrink-0 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </form>

            {/* Sticky Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-end gap-2.5 shrink-0">
              <Button
                type="button"
                variant="ghost"
                onClick={closeEditDrawer}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                form="edit-profile-drawer-form"
                disabled={isSavingDrawer}
                className="flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingDrawer ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
              </Button>
            </div>
        </SheetContent>
      </Sheet>

      {/* ========================================================================= */}
      {/* MODAL KONFIRMASI HAPUS AKUN (Employr AlertDialog Spec) */}
      {/* ========================================================================= */}
      <AlertDialog
        open={showDeleteAccountModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowDeleteAccountModal(false);
            setDeleteConfirmText('');
          }
        }}
      >
        <AlertDialogContent className="max-w-md p-6 space-y-4">
          <AlertDialogHeader className="flex flex-row items-start gap-3 space-y-0 text-left">
            <div className="w-10 h-10 rounded-[10px] bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <AlertDialogTitle className="text-base font-black text-slate-900 dark:text-white">
                Konfirmasi Penghapusan Akun
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Apakah kamu yakin ingin menghapus akun <strong className="text-amber-700 font-bold dark:text-amber-400">{profileData.email}</strong>? Seluruh data profil, histori CV ATS, pelacakan lamaran di Tracker, koin misi, dan lisensi Lifetime akan dihapus permanen dari database.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>

          <div className="p-4 rounded-[10px] bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 leading-relaxed font-medium">
            Peringatan: Tindakan ini tidak dapat dipulihkan kembali. Setelah dihapus, sesi kamu akan diakhiri dan akun tidak dapat dibuka lagi.
          </div>

          <div className="space-y-1.5">
            <label htmlFor="delete-confirm-input" className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Ketik <span className="text-rose-700 dark:text-rose-400 font-mono font-black">HAPUS</span> untuk mengonfirmasi:
            </label>
            <input
              id="delete-confirm-input"
              type="text"
              placeholder="Ketik HAPUS"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full px-3.5 py-2.5 text-base sm:text-xs rounded-[10px] border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            />
          </div>

          <AlertDialogFooter className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <AlertDialogCancel
              onClick={() => {
                setShowDeleteAccountModal(false);
                setDeleteConfirmText('');
              }}
            >
              Batal
            </AlertDialogCancel>
            <Button
              type="button"
              variant="danger"
              disabled={deleteConfirmText !== 'HAPUS' || isDeletingAccount}
              onClick={async () => {
                setIsDeletingAccount(true);
                try {
                  const ok = await userApi.deleteAccount();
                  if (ok) {
                    toast.success('Akun Dihapus', 'Seluruh data portofolio kamu telah dihapus.');
                    onLogout();
                  } else {
                    toast.error('Gagal Menghapus Akun', 'Terjadi kesalahan sistem saat menghapus akun.');
                    setIsDeletingAccount(false);
                  }
                } catch {
                  toast.error('Gagal Menghapus Akun', 'Terjadi kesalahan koneksi.');
                  setIsDeletingAccount(false);
                }
              }}
              className="flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isDeletingAccount ? 'Menghapus...' : 'Hapus Akun Permanen'}</span>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
