'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';
import { UserAvatar } from '@/components/UserAvatar';
import { userApi } from '@/lib/api';
import { getStoredSession, setSessionCookie } from '@/lib/auth';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { CitySearchInput } from '@/components/ui/CitySearchInput';
import { DatePicker, fromISODate, toISODate } from '@/components/ui/TrackerDatePicker';
import { ProfileViewSkeleton } from '@/components/ProfileSkeleton';
import { useCareerReadiness } from '@/hooks/useCareerReadiness';
import {
  Camera,
  Linkedin,
  Globe,
  ChevronRight,
  Sliders,
} from 'lucide-react';

interface ProfileData {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  address: string;
  gender: string;
  birthDate: string;
  bio: string;
  targetRole: string;
  targetIndustry: string;
  expectedSalary: string;
  experienceYears: string;
  workPreference: string;
  linkedin: string;
  portfolio: string;
  github: string;
}

const INITIAL_PROFILE: ProfileData = {
  fullName: '',
  headline: '',
  email: '',
  phone: '',
  location: '',
  address: '',
  gender: '',
  birthDate: '',
  bio: '',
  targetRole: '',
  targetIndustry: '',
  expectedSalary: '',
  experienceYears: '',
  workPreference: '',
  linkedin: '',
  portfolio: '',
  github: '',
};

function stripPhonePrefix(val?: string | null): string {
  if (!val) return '';
  let digits = String(val).replace(/\D/g, '');
  if (digits.startsWith('62')) {
    digits = digits.slice(2);
  } else if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits;
}

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

export function ProfileInlineForm() {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { score: readinessScore } = useCareerReadiness();

  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData>(INITIAL_PROFILE);
  const [lastSavedData, setLastSavedData] = useState<ProfileData>(INITIAL_PROFILE);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [membershipRef, setMembershipRef] = useState<{ packageName?: string; tier?: string } | null>(null);

  // Dynamic profile completeness
  const completenessScore = useMemo(() => {
    const fieldsToEvaluate = [
      profileData.fullName,
      profileData.headline,
      profileData.phone,
      profileData.location,
      profileData.targetRole,
      profileData.experienceYears,
      profileData.workPreference,
      profileData.bio,
      profileData.linkedin,
    ];
    const filled = fieldsToEvaluate.filter((v) => typeof v === 'string' && v.trim().length > 0).length;
    return Math.round((filled / fieldsToEvaluate.length) * 100);
  }, [profileData]);

  // Load profile on mount
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
            phone: stripPhonePrefix(stored.phone || prev.phone),
          }));
        }
      } catch (e) {
        console.warn('Failed to parse session in ProfileInlineForm', e);
      }
    }

    userApi
      .getProfile()
      .then((remote) => {
        if (!isMounted) return;
        if (remote) {
          const loaded: ProfileData = {
            fullName: remote.fullName || remote.name || '',
            headline: remote.headline || '',
            email: remote.email || '',
            phone: stripPhonePrefix(remote.phone || ''),
            location: remote.location || '',
            address: remote.address || '',
            gender: remote.gender || '',
            birthDate: remote.birthDate || '',
            bio: remote.bio || '',
            targetRole: remote.targetRole || remote.targetJob || remote.targetPosition || '',
            targetIndustry: remote.targetIndustry || '',
            expectedSalary: remote.expectedSalary || '',
            experienceYears: normalizeExperienceYears(remote.experienceYears),
            workPreference: normalizeWorkPreference(remote.workPreference),
            linkedin: remote.linkedin || '',
            portfolio: remote.portfolio || '',
            github: remote.github || '',
          };

          setProfileData(loaded);
          setLastSavedData(loaded);

          if (remote.avatarUrl || remote.photoUrl || remote.photo) {
            setAvatarUrl(remote.avatarUrl || remote.photoUrl || remote.photo);
          }
          if (remote.membership) {
            setMembershipRef(remote.membership);
          }
        }
      })
      .catch((err) => {
        console.warn('Gagal memuat profil', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle local state edit
  const handleChange = (field: keyof ProfileData, val: string) => {
    setProfileData((prev) => ({ ...prev, [field]: val }));
  };

  // Handle phone changes: strips prefix, user enters 8xxxx only
  const handlePhoneChange = (val: string) => {
    const cleanDigits = stripPhonePrefix(val);
    setProfileData((prev) => ({ ...prev, phone: cleanDigits }));
  };

  // Auto-save logic (triggered on onBlur or dropdown change)
  const handleAutoSave = async (field: keyof ProfileData, forcedValue?: string) => {
    const valueToSave = forcedValue !== undefined ? forcedValue : profileData[field];
    const prevSaved = lastSavedData[field];

    // If unchanged, do nothing
    if (valueToSave === prevSaved) {
      return;
    }

    // Validation for mandatory fields
    if (field === 'fullName' && (!valueToSave || !valueToSave.trim())) {
      toast.error('Nama Lengkap Wajib Diisi', 'Nama lengkap tidak boleh dibiarkan kosong.');
      setProfileData((prev) => ({ ...prev, fullName: prevSaved }));
      return;
    }

    try {
      const fullPhoneNumber =
        field === 'phone'
          ? (valueToSave ? `+62${stripPhonePrefix(valueToSave)}` : '')
          : (profileData.phone ? `+62${stripPhonePrefix(profileData.phone)}` : '');

      const payload = {
        ...profileData,
        [field]: valueToSave,
        phone: fullPhoneNumber,
        targetRole: field === 'targetRole' ? valueToSave : profileData.targetRole,
        targetJob: field === 'targetRole' ? valueToSave : profileData.targetRole,
        targetPosition: field === 'targetRole' ? valueToSave : profileData.targetRole,
      };

      const res = await userApi.updateProfile(payload);

      if (res) {
        setLastSavedData((prev) => ({ ...prev, [field]: valueToSave }));

        // Update Better Auth session cookie if fullName or phone changed
        if (typeof window !== 'undefined' && (field === 'fullName' || field === 'phone')) {
          const stored = getStoredSession();
          if (stored) {
            setSessionCookie(
              {
                ...stored,
                name: field === 'fullName' ? valueToSave : stored.name,
                phone: field === 'phone' ? fullPhoneNumber : stored.phone,
              },
              30
            );
          }
        }

        toast.success('Perubahan Tersimpan', 'Informasi profil berhasil diperbarui.');
      } else {
        throw new Error('Gagal menyimpan');
      }
    } catch {
      toast.error('Gagal Menyimpan', 'Terjadi kendala saat menyimpan. Memulihkan nilai semula.');
      setProfileData((prev) => ({ ...prev, [field]: prevSaved }));
    }
  };

  // Avatar upload
  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Berkas Tidak Valid', 'Silakan pilih berkas gambar (JPG, PNG, atau WebP).');
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
          userApi
            .updateProfile({ avatarUrl: compressed })
            .then(() => {
              toast.success('Foto Profil Diperbarui', 'Foto profil berhasil disimpan ke akun.');
            })
            .catch(() => {
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
    <div className="w-full space-y-6 md:space-y-8 font-sans pb-40 sm:pb-32 lg:pb-16 animate-in fade-in duration-200">
      {/* Hidden file input for photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
        onChange={handleAvatarFileSelect}
      />

      {/* ========================================================================= */}
      {/* 1. HERO PROFILE CARD */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[10px] bg-[#162758] border border-[#20367A] text-white p-4 sm:p-6 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Left: Avatar with Camera + Name & Membership */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative group shrink-0">
              <UserAvatar
                name={profileData.fullName || 'Pengguna Employr'}
                photoUrl={avatarUrl}
                size={64}
                square={true}
                variant="beam"
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-[12px] border-2 border-white/30 shadow-md"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Ganti foto profil"
                aria-label="Ganti foto profil"
                className="absolute inset-0 bg-black/45 rounded-[12px] flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity cursor-pointer text-white"
              >
                <Camera className="w-5 h-5 drop-shadow-md" />
              </button>
            </div>

            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-extrabold text-base sm:text-xl text-white tracking-tight truncate">
                  Halo, {profileData.fullName || 'Kandidat'}!
                </h1>
                <span className="px-2 py-0.5 rounded-[6px] text-caption font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                  {membershipRef?.packageName || 'Member'}
                </span>
              </div>
              <p className="text-xs text-blue-200 font-medium">
                Berikut informasi profil kamu di seluruh layanan Employr.
              </p>
            </div>
          </div>

          {/* Right: Progress & Shortcut to Settings */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {/* Completeness Card */}
            <div className="p-3 rounded-[10px] bg-white/10 border border-white/15 min-w-[190px] space-y-1.5">
              <div className="flex items-center justify-between text-caption font-bold text-white/90">
                <span>Kelengkapan Profil</span>
                <span className="text-amber-300">{completenessScore}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${completenessScore}%` }}
                />
              </div>
              <p className="text-[10px] text-blue-200/80">
                {completenessScore >= 80 ? 'Profil sangat siap untuk melamar' : 'Lengkapi agar CV lebih optimal'}
              </p>
            </div>

            {/* Link to Pengaturan */}
            <Link
              href="/pengaturan"
              className="px-3.5 py-2.5 rounded-[10px] bg-white/15 hover:bg-white/25 active:scale-[0.98] text-white font-bold text-xs transition border border-white/20 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shrink-0"
              title="Buka Pengaturan Akun & Keamanan"
            >
              <Sliders className="w-4 h-4" />
              <span className="hidden sm:inline">Pengaturan Akun</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FORMULIR LANGSUNG (INLINE EDITABLE BENTO GRID) */}
      {/* ========================================================================= */}

      {/* MODUL 1: BIODATA DIRI & KONTAK */}
      <div className="p-4 sm:p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span>Biodata &amp; Kontak</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Nama Lengkap */}
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="field-fullName" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <span>Nama Lengkap</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              id="field-fullName"
              type="text"
              required
              value={profileData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              onBlur={() => handleAutoSave('fullName')}
              placeholder="Contoh: Rizal Hanifa Pratama"
              className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-[#1738D1] focus:ring-1 focus:ring-[#1738D1] transition outline-none font-medium"
            />
          </div>

          {/* Tanggal Lahir */}
          <div className="space-y-1.5">
            <label htmlFor="field-birthDate" className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Tanggal Lahir (Opsional)
            </label>
            <DatePicker
              id="field-birthDate"
              value={profileData.birthDate ? fromISODate(profileData.birthDate) : ''}
              onChange={(formattedStr) => {
                const iso = toISODate(formattedStr);
                handleChange('birthDate', iso);
                handleAutoSave('birthDate', iso);
              }}
              placeholder="Pilih Tanggal Lahir"
              className="w-full"
              aria-label="Tanggal Lahir"
            />
          </div>

          {/* Jenis Kelamin */}
          <div className="space-y-1.5">
            <label htmlFor="field-gender" className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Jenis Kelamin (Opsional)
            </label>
            <CustomSelect
              id="field-gender"
              value={profileData.gender}
              onChange={(val) => {
                handleChange('gender', val);
                handleAutoSave('gender', val);
              }}
              options={[
                { value: '', label: 'Belum ditentukan' },
                { value: 'Laki-laki', label: 'Laki-laki' },
                { value: 'Perempuan', label: 'Perempuan' },
              ]}
              placeholder="Pilih Jenis Kelamin"
              aria-label="Jenis Kelamin"
            />
          </div>

          {/* Nomor WhatsApp / HP (Paksa prefix +62) */}
          <div className="space-y-1.5">
            <label htmlFor="field-phone" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <span>Nomor WhatsApp / HP</span>
              <span className="text-rose-500">*</span>
            </label>
            <div className="flex rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:border-[#1738D1] focus-within:ring-1 focus-within:ring-[#1738D1] overflow-hidden transition">
              <span className="inline-flex items-center px-3.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 border-r border-slate-200 dark:border-slate-700 select-none shrink-0">
                +62
              </span>
              <input
                id="field-phone"
                type="tel"
                inputMode="numeric"
                value={profileData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                onBlur={() => handleAutoSave('phone')}
                placeholder="81234567890"
                className="w-full px-3 py-2.5 text-xs bg-transparent text-slate-900 dark:text-white outline-none font-medium"
              />
            </div>
          </div>

          {/* Kota & Domisili (Dropdown CitySearchInput seperti Onboarding) */}
          <div className="space-y-1.5">
            <label htmlFor="field-location" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <span>Kota &amp; Provinsi Domisili</span>
              <span className="text-rose-500">*</span>
            </label>
            <CitySearchInput
              value={profileData.location}
              onChange={(val) => {
                handleChange('location', val);
                handleAutoSave('location', val);
              }}
              placeholder="Cari Kota / Kabupaten domisilimu..."
              size="sm"
            />
          </div>

          {/* Alamat Lengkap */}
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="field-address" className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Alamat Tempat Tinggal (Opsional)
            </label>
            <input
              id="field-address"
              type="text"
              value={profileData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              onBlur={() => handleAutoSave('address')}
              placeholder="Contoh: Jl. Pemuda No. 45, RT 02/RW 04"
              className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-[#1738D1] focus:ring-1 focus:ring-[#1738D1] transition outline-none font-medium"
            />
          </div>

          {/* Email Akun (Read-only) */}
          <div className="space-y-1.5 sm:col-span-2">
            <div className="flex items-center justify-between">
              <label htmlFor="field-email" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Email Akun Utama (Terkunci)
              </label>
              <span className="text-[11px] text-slate-400">Terkait otentikasi login</span>
            </div>
            <input
              id="field-email"
              type="email"
              disabled
              value={profileData.email}
              className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 cursor-not-allowed font-medium"
            />
          </div>
        </div>
      </div>

      {/* MODUL 2: TARGET KARIR & PREFERENSI KERJA */}
      <div className="p-4 sm:p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Target Karir &amp; Pekerjaan</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Target Posisi / Profesi */}
          <div className="space-y-1.5">
            <label htmlFor="field-targetRole" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <span>Target Posisi / Profesi</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              id="field-targetRole"
              type="text"
              value={profileData.targetRole}
              onChange={(e) => handleChange('targetRole', e.target.value)}
              onBlur={() => handleAutoSave('targetRole')}
              placeholder="Contoh: Front End Developer"
              className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-[#1738D1] focus:ring-1 focus:ring-[#1738D1] transition outline-none font-medium"
            />
          </div>

          {/* Headline Profesional */}
          <div className="space-y-1.5">
            <label htmlFor="field-headline" className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Headline Profesional di CV
            </label>
            <input
              id="field-headline"
              type="text"
              value={profileData.headline}
              onChange={(e) => handleChange('headline', e.target.value)}
              onBlur={() => handleAutoSave('headline')}
              placeholder="Contoh: Junior Web Developer | React & Next.js"
              className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-[#1738D1] focus:ring-1 focus:ring-[#1738D1] transition outline-none font-medium"
            />
          </div>

          {/* Tingkat Pengalaman */}
          <div className="space-y-1.5">
            <label htmlFor="field-experienceYears" className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Tingkat Pengalaman Karir
            </label>
            <CustomSelect
              id="field-experienceYears"
              value={profileData.experienceYears}
              onChange={(val) => {
                handleChange('experienceYears', val);
                handleAutoSave('experienceYears', val);
              }}
              options={[
                { value: '', label: 'Pilih Pengalaman' },
                { value: 'Fresh Graduate (0-1 Tahun)', label: 'Fresh Graduate (0-1 Tahun)' },
                { value: 'Junior (1-3 Tahun)', label: 'Junior (1-3 Tahun)' },
                { value: 'Mid-Level (3-5 Tahun)', label: 'Mid-Level (3-5 Tahun)' },
                { value: 'Senior (5+ Tahun)', label: 'Senior (5+ Tahun)' },
                { value: 'Magang / Internship', label: 'Magang / Internship' },
              ]}
              placeholder="Pilih Pengalaman"
              aria-label="Tingkat Pengalaman"
            />
          </div>

          {/* Format Kerja */}
          <div className="space-y-1.5">
            <label htmlFor="field-workPreference" className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Preferensi Format Kerja
            </label>
            <CustomSelect
              id="field-workPreference"
              value={profileData.workPreference}
              onChange={(val) => {
                handleChange('workPreference', val);
                handleAutoSave('workPreference', val);
              }}
              options={[
                { value: '', label: 'Pilih Format Kerja' },
                { value: 'Full Remote', label: 'Full Remote (Kerja dari Mana Saja)' },
                { value: 'Hybrid / Remote', label: 'Hybrid / Sebagian Remote' },
                { value: 'On-Site / WFO', label: 'On-Site / Di Kantor (WFO)' },
              ]}
              placeholder="Pilih Format Kerja"
              aria-label="Format Kerja"
            />
          </div>

          {/* Target Gaji Bulanan (Opsional) */}
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="field-expectedSalary" className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Target Gaji Bulanan (Opsional)
            </label>
            <input
              id="field-expectedSalary"
              type="text"
              value={profileData.expectedSalary}
              onChange={(e) => handleChange('expectedSalary', e.target.value)}
              onBlur={() => handleAutoSave('expectedSalary')}
              placeholder="Contoh: Rp4.000.000"
              className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-[#1738D1] focus:ring-1 focus:ring-[#1738D1] transition outline-none font-medium"
            />
          </div>
        </div>
      </div>

      {/* MODUL 3: TENTANG SAYA (RINGKASAN DIRI / BIO) */}
      <div className="p-4 sm:p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
          <h2 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Tentang Saya</span>
          </h2>
          <span className="text-[11px] font-semibold text-slate-400">
            {profileData.bio.length} / 500
          </span>
        </div>

        <div className="space-y-1.5">
          <textarea
            id="field-bio"
            rows={4}
            maxLength={500}
            value={profileData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            onBlur={() => handleAutoSave('bio')}
            placeholder="Tulis ringkasan singkat tentang latar belakang, keahlian utama, dan target karirmu untuk CV ATS..."
            className="w-full p-3.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-[#1738D1] focus:ring-1 focus:ring-[#1738D1] transition outline-none font-medium leading-relaxed resize-none"
          />
        </div>
      </div>

      {/* MODUL 4: TAUTAN PORTOFOLIO & RESUME ONLINE */}
      <div className="p-4 sm:p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span>Portofolio &amp; Tautan Online</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* LinkedIn */}
          <div className="space-y-1.5">
            <label htmlFor="field-linkedin" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Linkedin className="w-3.5 h-3.5 text-blue-600" />
              <span>Tautan Profil LinkedIn</span>
            </label>
            <input
              id="field-linkedin"
              type="url"
              value={profileData.linkedin}
              onChange={(e) => handleChange('linkedin', e.target.value)}
              onBlur={() => handleAutoSave('linkedin')}
              placeholder="https://www.linkedin.com/in/username"
              className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-[#1738D1] focus:ring-1 focus:ring-[#1738D1] transition outline-none font-medium"
            />
          </div>

          {/* Portofolio / GitHub */}
          <div className="space-y-1.5">
            <label htmlFor="field-portfolio" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>Website Portofolio / GitHub</span>
            </label>
            <input
              id="field-portfolio"
              type="url"
              value={profileData.portfolio}
              onChange={(e) => handleChange('portfolio', e.target.value)}
              onBlur={() => handleAutoSave('portfolio')}
              placeholder="https://myportfolio.com atau https://github.com/username"
              className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-[#1738D1] focus:ring-1 focus:ring-[#1738D1] transition outline-none font-medium"
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CROSS-NAVIGATION FOOTER BANNER */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[8px] bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
            <Sliders className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              Butuh ubah kata sandi, tema tampilan, atau kelola notifikasi?
            </p>
            <p className="text-caption text-slate-500 dark:text-slate-400">
              Atur keamanan akun, preferensi notifikasi, dan sesi perangkat di Pengaturan Akun.
            </p>
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
    </div>
  );
}
