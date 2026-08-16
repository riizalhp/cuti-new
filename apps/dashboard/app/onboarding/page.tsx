'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { userApi } from '@/lib/api';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { CustomDatePicker } from '@/components/ui/CustomDatePicker';
import { CitySearchInput } from '@/components/ui/CitySearchInput';
import { MajorSearchInput } from '@/components/ui/MajorSearchInput';
import { SchoolSearchInput } from '@/components/ui/SchoolSearchInput';
import { PositionSearchInput } from '@/components/ui/PositionSearchInput';
import { DotLottiePlayer } from '@/components/DotLottiePlayer';
import {
  User,
  GraduationCap,
  Briefcase,
  Target,
  Compass,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  X,
  Lock,
  Search,
  Building2,
  DollarSign,
  MapPin,
  Clock,
  Heart,
  TrendingUp,
  FileText,
  Award,
  Zap,
  ShoppingBag,
  Utensils,
  Megaphone,
  Factory,
  BookOpen,
  Laptop,
  Home,
  Activity,
  Rocket,
  Upload,
  FileCheck,
  Crown,
  ShieldCheck,
  CheckSquare,
  Globe,
  Users,
  School,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';

export type IntentType = 'cari_kerja' | 'buat_cv' | 'perbaiki_cv' | 'cepat_dapat_kerja';

export default function AdaptiveOnboardingPage() {
  const router = useRouter();

  // Single Select Intent State
  const [selectedIntent, setSelectedIntent] = useState<IntentType | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0); // 0 = Screen 0 (Intent Selection)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValueMoment, setShowValueMoment] = useState(false);
  const [showMarketingOffer, setShowMarketingOffer] = useState(false);

  // Form State (No hardcoded mock data)
  const [formData, setFormData] = useState({
    // Step 1: Identitas
    fullName: '',
    location: '',
    contactInfo: '',
    targetPositions: [] as string[],
    positionSearchInput: '',
    showPositionCombobox: false,

    // Step 2: Pendidikan
    educationLevel: '',
    major: '',
    institutionName: '',
    graduationYear: '',
    isStillStudying: false,

    // Step 3: Pengalaman
    hasWorkExperience: null as boolean | null,
    nonWorkExperiences: [] as string[],
    experienceTitle: '',
    experienceCompany: '',
    experienceStartDate: '',
    experienceEndDate: '',
    experienceIsCurrent: false,
    experienceDesc: '',

    // Step 4: Skills (Buat CV)
    skills: [] as string[],
    customSkillInput: '',

    // Target Pekerjaan & Preferensi
    targetIndustries: [] as string[],
    targetLocations: [] as string[],
    workPreference: [] as string[],
    jobTypes: [] as string[],
    expectedSalary: '',
    willingToRelocate: '',
    availabilityToStart: '',
    careerPriorities: [] as string[],

    // Perbaiki CV / Cepat Dapat Kerja
    hasCvAlready: null as boolean | null,
    uploadedCvName: '',
  });

  // Fetch real user profile on mount if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const sessionStr = localStorage.getItem('cuti_user_session');
        if (sessionStr) {
          const parsed = JSON.parse(sessionStr);
          if (parsed.name || parsed.email) {
            setFormData((prev) => ({
              ...prev,
              fullName: parsed.name || prev.fullName,
              contactInfo: parsed.email || prev.contactInfo,
            }));
          }
        }
      } catch (e) {
        console.warn('Failed to parse session in Onboarding', e);
      }
    }

    userApi.getProfile().then((profile) => {
      if (profile) {
        setFormData((prev) => ({
          ...prev,
          fullName: profile.fullName || prev.fullName,
          location: profile.location || prev.location,
          contactInfo: profile.email || profile.phone || prev.contactInfo,
          targetPositions: profile.targetPosition ? [profile.targetPosition] : prev.targetPositions,
          expectedSalary: profile.expectedSalary || prev.expectedSalary,
        }));
      }
    }).catch(() => {
      // Ignore API errors gracefully
    });
  }, []);

  // Options Constants
  const EDUCATION_LEVELS = ['SMA', 'SMK', 'D3', 'D4', 'S1', 'S2', 'Lainnya'];

  const GRADUATION_YEAR_OPTIONS = [
    '2026 (Mendatang)',
    '2025',
    '2024',
    '2023',
    '2022',
    '2021 atau Sebelumnya',
  ];

  const SALARY_OPTIONS = [
    'Rp 2 Juta - 4 Juta',
    'Rp 4 Juta - 7 Juta',
    'Rp 7 Juta - 10 Juta',
    '> Rp 10 Juta',
  ];

  const AVAILABILITY_OPTIONS = [
    'Segera (ASAP)',
    '< 1 bulan lagi',
    '1 - 3 bulan lagi',
    '> 3 bulan lagi',
  ];

  const POPULAR_POSITIONS = [
    'Admin Staff',
    'Customer Service',
    'Staff Operasional',
    'UI/UX Designer',
    'Graphic Designer',
    'Frontend Developer',
    'Digital Marketer',
    'Social Media Specialist',
    'Content Writer',
    'Sales Representative',
  ];

  const SKILL_SUGGESTIONS = [
    'Microsoft Office',
    'Excel & Spreadsheet',
    'Customer Service',
    'Figma',
    'Photoshop',
    'Communication',
    'Social Media Management',
    'Data Entry',
    'Bahasa Inggris',
    'Time Management',
  ];

  const INDUSTRY_ITEMS = [
    { id: 'Teknologi', label: 'Teknologi', icon: Laptop },
    { id: 'Keuangan', label: 'Keuangan & Perbankan', icon: DollarSign },
    { id: 'Retail & FMCG', label: 'Retail & FMCG', icon: ShoppingBag },
    { id: 'F&B & Kuliner', label: 'F&B & Kuliner', icon: Utensils },
    { id: 'Hospitality & Pariwisata', label: 'Hospitality & Pariwisata', icon: Building2 },
    { id: 'Pemasaran & Media', label: 'Pemasaran & Media', icon: Megaphone },
    { id: 'Manufaktur & Logistik', label: 'Manufaktur & Logistik', icon: Factory },
    { id: 'Kesehatan & Farmasi', label: 'Kesehatan & Farmasi', icon: Activity },
    { id: 'Pendidikan & Edukasi', label: 'Pendidikan & Edukasi', icon: BookOpen },
  ];

  // Define steps per Intent Journey
  const getJourneySteps = () => {
    switch (selectedIntent) {
      case 'cari_kerja':
        return [
          { id: 1, label: 'Tentang Kamu', icon: User },
          { id: 2, label: 'Pengalaman', icon: Briefcase },
          { id: 3, label: 'Target Kerja', icon: Target },
          { id: 4, label: 'Preferensi', icon: Compass },
        ];
      case 'buat_cv':
        return [
          { id: 1, label: 'Tentang Kamu', icon: User },
          { id: 2, label: 'Pendidikan', icon: GraduationCap },
          { id: 3, label: 'Pengalaman', icon: Briefcase },
          { id: 4, label: 'Skill', icon: Award },
          { id: 5, label: 'Target Posisi', icon: Target },
        ];
      case 'perbaiki_cv':
        return [
          { id: 1, label: 'Upload CV', icon: Upload },
          { id: 2, label: 'Target Pekerjaan', icon: Target },
          { id: 3, label: 'Preferensi', icon: Compass },
        ];
      case 'cepat_dapat_kerja':
        return [
          { id: 1, label: 'Tentang Kamu', icon: User },
          { id: 2, label: 'Pengalaman', icon: Briefcase },
          { id: 3, label: 'Target', icon: Target },
          { id: 4, label: 'Preferensi', icon: Compass },
          { id: 5, label: 'Dokumen CV', icon: FileText },
        ];
      default:
        return [];
    }
  };

  const journeySteps = getJourneySteps();
  const totalJourneySteps = journeySteps.length;

  // Single Select Intent Selection Handler
  const handleSelectIntent = (intent: IntentType) => {
    setSelectedIntent(intent);
    setCurrentStepIndex(1);
    setShowValueMoment(false);
    setShowMarketingOffer(false);
  };

  // Helper Handlers
  const handleAddPosition = (pos: string) => {
    const trimmed = pos.trim();
    if (trimmed && !formData.targetPositions.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        targetPositions: [...prev.targetPositions, trimmed],
        positionSearchInput: '',
        showPositionCombobox: false,
      }));
    }
  };

  const handleRemovePosition = (pos: string) => {
    setFormData((prev) => ({
      ...prev,
      targetPositions: prev.targetPositions.filter((p) => p !== pos),
    }));
  };

  const toggleSkill = (skill: string) => {
    setFormData((prev) => {
      const exists = prev.skills.includes(skill);
      if (exists) {
        return { ...prev, skills: prev.skills.filter((s) => s !== skill) };
      }
      return { ...prev, skills: [...prev.skills, skill] };
    });
  };

  const handleAddCustomSkill = () => {
    const trimmed = formData.customSkillInput.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, trimmed],
        customSkillInput: '',
      }));
    }
  };

  const toggleArrayItem = <K extends keyof typeof formData>(
    key: K,
    item: string,
    maxLimit?: number
  ) => {
    setFormData((prev) => {
      const currentList = (prev[key] as unknown as string[]) || [];
      const exists = currentList.includes(item);
      if (exists) {
        return {
          ...prev,
          [key]: currentList.filter((i) => i !== item),
        };
      }
      if (maxLimit && currentList.length >= maxLimit) {
        return prev;
      }
      return {
        ...prev,
        [key]: [...currentList, item],
      };
    });
  };

  const handleNextStep = () => {
    if (currentStepIndex < totalJourneySteps) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setShowValueMoment(true);
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (showMarketingOffer) {
      setShowMarketingOffer(false);
      setShowValueMoment(true);
    } else if (showValueMoment) {
      setShowValueMoment(false);
    } else if (currentStepIndex > 1) {
      setCurrentStepIndex((prev) => prev - 1);
    } else {
      setCurrentStepIndex(0);
      setSelectedIntent(null);
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFinishAndNavigateToDashboard = async () => {
    setIsSubmitting(true);
    try {
      await userApi.updateProfile({
        fullName: formData.fullName || 'Pengguna AmbilCUTI',
        location: formData.location,
        headline: `${formData.targetPositions.join(', ') || 'Talenta'} | ${formData.educationLevel}`,
        targetPosition: formData.targetPositions.join(', ') || 'Talenta',
        targetIndustry: formData.targetIndustries.join(', '),
        experienceYears: formData.hasWorkExperience ? 'Berpengalaman' : 'Fresh Graduate',
        expectedSalary: formData.expectedSalary,
        workPreference: formData.workPreference.join(', '),
      });
    } catch (err) {
      console.warn('Backend update skipped:', err);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.setItem('cuti_onboarding_completed', 'true');
        localStorage.setItem(
          'cuti_user_session',
          JSON.stringify({
            name: formData.fullName || 'Pengguna AmbilCUTI',
            intent: selectedIntent,
            targetPositions: formData.targetPositions,
            hasCv: formData.hasCvAlready || selectedIntent === 'buat_cv',
            completedAt: new Date().toISOString(),
          })
        );
      }
      setIsSubmitting(false);
      router.push('/beranda');
    }
  };

  const displayFirstName = formData.fullName.trim() ? formData.fullName.split(' ')[0] : 'Kamu';
  const primaryTargetPos = formData.targetPositions.length > 0 ? formData.targetPositions[0] : 'Pekerjaan Impian';
  const primaryLocation = formData.location || 'Kota Tujuan';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans p-4 sm:p-6 md:p-8 flex flex-col justify-between">
      
      {/* Top Header Bar */}
      <header className="max-w-2xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] bg-orange-500 text-white font-extrabold flex items-center justify-center text-xs shadow-md shadow-orange-500/20">
            CUTI
          </div>
          <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            AmbilCUTI
          </span>
        </div>

        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-[10px] border border-slate-200 dark:border-slate-800 shadow-2xs">
          {currentStepIndex === 0 && 'Tujuan Kamu'}
          {currentStepIndex > 0 && !showValueMoment && !showMarketingOffer && `Langkah ${currentStepIndex} dari ${totalJourneySteps}`}
          {showValueMoment && 'Pencapaian'}
          {showMarketingOffer && 'Langkah Selanjutnya'}
        </div>
      </header>

      {/* Main Centered Container */}
      <main className="max-w-2xl w-full mx-auto my-auto py-4 space-y-6">
        
        {/* Horizontal Progress Stepper Bar (Only when in adaptive form steps 1..N) */}
        {currentStepIndex > 0 && !showValueMoment && !showMarketingOffer && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-4 shadow-2xs">
            <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
              {journeySteps.map((st) => {
                const isActive = currentStepIndex === st.id;
                const isCompleted = currentStepIndex > st.id;
                const IconComponent = st.icon;

                return (
                  <div key={st.id} className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setCurrentStepIndex(st.id)}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-[10px] transition cursor-pointer ${
                        isActive
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                          : isCompleted
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {isCompleted ? (
                        <Check size={14} className="stroke-[3]" />
                      ) : (
                        <IconComponent size={14} />
                      )}
                      <span>{st.label}</span>
                    </button>
                    {st.id < totalJourneySteps && (
                      <span className="text-slate-300 dark:text-slate-700 font-bold text-xs">
                        →
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Card Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-6 sm:p-10 shadow-sm space-y-6">
          
          {/* ====================================================================== */}
          {/* STEP 0: SINGLE SELECT INTENT SCREEN */}
          {/* ====================================================================== */}
          {currentStepIndex === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-[10px] text-[10px] font-bold uppercase tracking-wider bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 inline-flex items-center gap-1">
                  <User size={12} />
                  Pengalaman Adaptif
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                  <UserCheck className="w-6 h-6 text-orange-500" />
                  <span>Kamu lagi butuh apa?</span>
                </h2>
                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                  Pilih yang paling sesuai dengan kebutuhanmu saat ini.
                </p>
              </div>

              {/* Single Select Intent Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {[
                  {
                    id: 'cari_kerja' as IntentType,
                    title: 'Cari kerja',
                    desc: 'Temukan lowongan yang cocok dengan profilmu.',
                    icon: Search,
                  },
                  {
                    id: 'buat_cv' as IntentType,
                    title: 'Buat CV',
                    desc: 'Buat CV yang siap digunakan untuk melamar.',
                    icon: FileText,
                  },
                  {
                    id: 'perbaiki_cv' as IntentType,
                    title: 'Perbaiki CV',
                    desc: 'Optimalkan CV yang sudah kamu punya.',
                    icon: Sparkles,
                  },
                  {
                    id: 'cepat_dapat_kerja' as IntentType,
                    title: 'Mau cepat dapat kerja',
                    desc: 'Bantu saya mempersiapkan semuanya agar bisa segera melamar.',
                    icon: Rocket,
                  },
                ].map((card) => {
                  const IconComp = card.icon;

                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => handleSelectIntent(card.id)}
                      className="p-5 rounded-[10px] border text-left transition flex items-start gap-3.5 cursor-pointer relative overflow-hidden bg-slate-50/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-orange-950/30 group shadow-2xs"
                    >
                      <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 bg-white dark:bg-slate-700 text-orange-500 border border-slate-200 dark:border-slate-600 group-hover:bg-orange-500 group-hover:text-white transition shadow-2xs">
                        <IconComp size={20} />
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition flex items-center gap-1.5">
                            <span>{card.title}</span>
                          </h3>
                          <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-1 group-hover:text-orange-500 transition-all shrink-0" />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {card.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ====================================================================== */}
          {/* VALUE MOMENT SCREEN (TRIGGERED AFTER STEP N) */}
          {/* ====================================================================== */}
          {showValueMoment && !showMarketingOffer && (
            <motion.div
              key="valueMoment"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* VALUE MOMENT: JOURNEY 1 — CARI KERJA */}
              {selectedIntent === 'cari_kerja' && (
                <div className="space-y-6 text-center">
                  <div className="flex justify-center -mb-2">
                    <DotLottiePlayer
                      src="/animations/profile-ready.json"
                      autoplay={true}
                      loop={false}
                      className="w-28 h-28 mx-auto"
                      fallback={
                        <div className="w-16 h-16 rounded-[10px] bg-orange-50 dark:bg-orange-950/80 text-orange-500 flex items-center justify-center border border-orange-200 dark:border-orange-800 mx-auto shadow-md">
                          <Search size={32} />
                        </div>
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-50 flex items-center justify-center gap-2">
                      <span>Profilmu siap, {displayFirstName}!</span>
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 inline" />
                    </h2>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                      Kami menemukan <strong>18 lowongan</strong> yang sesuai dengan preferensimu.
                    </p>
                  </div>

                  {/* Dynamic Job Matches List based on user selections */}
                  <div className="space-y-3 text-left pt-2">
                    {[
                      { match: '97% cocok', title: primaryTargetPos, location: primaryLocation, company: 'Perusahaan Terverifikasi' },
                      { match: '92% cocok', title: `Staff ${primaryTargetPos}`, location: primaryLocation, company: 'Mitra Industri AmbilCUTI' },
                      { match: '89% cocok', title: 'Operasional & Admin', location: primaryLocation, company: 'Perusahaan Mitra' },
                    ].map((job, idx) => (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 rounded-[10px] flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            {job.match}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1">{job.title}</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{job.company} — {job.location}</p>
                        </div>
                        <span className="text-xs font-bold text-orange-500 flex items-center gap-1">
                          Detail <ArrowRight size={12} />
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleFinishAndNavigateToDashboard}
                    className="w-full py-3.5 rounded-[10px] bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Lanjutkan</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {/* VALUE MOMENT: JOURNEY 2 — BUAT CV */}
              {selectedIntent === 'buat_cv' && (
                <div className="space-y-6 text-center">
                  <div className="flex justify-center -mb-2">
                    <DotLottiePlayer
                      src="/animations/cv-ready.json"
                      autoplay={true}
                      loop={false}
                      className="w-28 h-28 mx-auto"
                      fallback={
                        <div className="w-16 h-16 rounded-[10px] bg-orange-50 dark:bg-orange-950/80 text-orange-500 flex items-center justify-center border border-orange-200 dark:border-orange-800 mx-auto shadow-md">
                          <FileText size={32} />
                        </div>
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-50 flex items-center justify-center gap-2">
                      <span>Data CV kamu sudah lengkap!</span>
                      <FileCheck className="w-6 h-6 text-emerald-500 inline" />
                    </h2>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                      Berikut preview ringkasan CV profesional yang telah disiapkan.
                    </p>
                  </div>

                  {/* Dynamic CV Preview Box */}
                  <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-5 rounded-[10px] text-left space-y-3 shadow-inner">
                    <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 uppercase">{formData.fullName || 'Nama Lengkap'}</h3>
                      <p className="text-xs font-bold text-orange-600 dark:text-orange-400">{formData.targetPositions.join(', ') || 'Target Posisi'}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{formData.location || 'Domisili'} {formData.contactInfo ? `• ${formData.contactInfo}` : ''}</p>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <strong className="text-slate-700 dark:text-slate-300 block text-[11px] font-bold uppercase">Pengalaman</strong>
                        <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                          {formData.experienceTitle ? `${formData.experienceTitle} ${formData.experienceCompany ? `— ${formData.experienceCompany}` : ''}` : 'Belum pernah kerja (PKL/Organisasi/Proyek)'}
                        </p>
                      </div>
                      <div>
                        <strong className="text-slate-700 dark:text-slate-300 block text-[11px] font-bold uppercase">Pendidikan</strong>
                        <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                          {formData.educationLevel || 'Pendidikan'} {formData.major ? `Jurusan ${formData.major}` : ''} {formData.institutionName ? `(${formData.institutionName})` : ''}
                        </p>
                      </div>
                      {formData.skills.length > 0 && (
                        <div>
                          <strong className="text-slate-700 dark:text-slate-300 block text-[11px] font-bold uppercase">Skill</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {formData.skills.map((sk) => (
                              <span key={sk} className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowMarketingOffer(true)}
                    className="w-full py-3.5 rounded-[10px] bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Lanjutkan</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {/* VALUE MOMENT: JOURNEY 3 — PERBAIKI CV */}
              {selectedIntent === 'perbaiki_cv' && (
                <div className="space-y-6">
                  <div className="text-center space-y-1">
                    <div className="flex justify-center -mb-2">
                      <DotLottiePlayer
                        src="/animations/ats-optimize.json"
                        autoplay={true}
                        loop={true}
                        className="w-28 h-28 mx-auto"
                        fallback={
                          <div className="w-16 h-16 rounded-[10px] bg-orange-50 dark:bg-orange-950/80 text-orange-500 flex items-center justify-center border border-orange-200 dark:border-orange-800 mx-auto shadow-md">
                            <Sparkles size={32} />
                          </div>
                        }
                      />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-50 flex items-center justify-center gap-2">
                      <span>CV kamu sudah dianalisis</span>
                      <Sparkles className="w-5 h-5 text-orange-500 inline" />
                    </h2>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                      Berikut hasil peninjauan awal standar ATS untuk target posisi {formData.targetPositions.join(', ') || 'Pekerjaan Target'}.
                    </p>
                  </div>

                  {/* ATS Score Meter Card */}
                  <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-5 rounded-[10px] space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Skor Kesiapan ATS</span>
                      <span className="text-lg font-extrabold text-amber-500">72 / 100</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="space-y-1">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 size={14} /> Yang sudah bagus
                        </span>
                        <ul className="text-slate-600 dark:text-slate-300 text-[11px] pl-5 space-y-0.5 list-disc">
                          <li>Struktur tata letak jelas & konsisten</li>
                          <li>Informasi kontak lengkap & valid</li>
                        </ul>
                      </div>

                      <div className="space-y-1 pt-2">
                        <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                          <AlertTriangle size={14} /> Yang bisa diperbaiki
                        </span>
                        <ul className="text-slate-600 dark:text-slate-300 text-[11px] pl-5 space-y-0.5 list-disc">
                          <li>Pengalaman belum menggunakan pencapaian terukur</li>
                          <li>Skill belum sepenuhnya relevan dengan posisi target</li>
                          <li>Deskripsi tugas terlalu umum</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowMarketingOffer(true)}
                    className="w-full py-3.5 rounded-[10px] bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Lanjutkan</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {/* VALUE MOMENT: JOURNEY 4 — MAU CEPAT DAPAT KERJA */}
              {selectedIntent === 'cepat_dapat_kerja' && (
                <div className="space-y-6 text-center">
                  <div className="flex justify-center -mb-2">
                    <DotLottiePlayer
                      src="/animations/fast-track.json"
                      autoplay={true}
                      loop={true}
                      className="w-28 h-28 mx-auto"
                      fallback={
                        <div className="w-16 h-16 rounded-[10px] bg-orange-50 dark:bg-orange-950/80 text-orange-500 flex items-center justify-center border border-orange-200 dark:border-orange-800 mx-auto shadow-md">
                          <Rocket size={32} />
                        </div>
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-50 flex items-center justify-center gap-2">
                      <span>Kamu sudah siap mulai melamar!</span>
                      <Rocket className="w-6 h-6 text-orange-500 inline" />
                    </h2>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                      Seluruh persiapan dasar kariermu telah kami selesaikan.
                    </p>
                  </div>


                  {/* Readiness Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-[10px] border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Kelengkapan Profil</span>
                      <p className="text-lg font-extrabold text-orange-500 mt-0.5">85% Lengkap</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-[10px] border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Status CV</span>
                      <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">Siap digunakan</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-[10px] border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Job Match</span>
                      <p className="text-lg font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">24 Lowongan</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-[10px] border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Lamaran Aktif</span>
                      <p className="text-lg font-extrabold text-slate-600 dark:text-slate-300 mt-0.5">Belum ada</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleFinishAndNavigateToDashboard}
                    className="w-full py-3.5 rounded-[10px] bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Lanjutkan</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer flex items-center justify-center gap-1 mx-auto"
                >
                  <ArrowLeft size={12} />
                  <span>Kembali ke formulir</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* ====================================================================== */}
          {/* MARKETING OFFER SCREEN (PRICING COMPARISON CARDS) */}
          {/* ====================================================================== */}
          {showMarketingOffer && (
            <motion.div
              key="marketingOffer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* MARKETING: BUAT CV & PERBAIKI CV -> PRICING COMPARISON CARDS */}
              {(selectedIntent === 'buat_cv' || selectedIntent === 'perbaiki_cv') && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-orange-500" />
                      <span>
                        {selectedIntent === 'buat_cv'
                          ? 'Ingin CV yang lebih profesional?'
                          : 'Mau kami bantu memperbaikinya?'}
                      </span>
                    </h2>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                      Pilih paket pembuatan & optimasi CV yang paling sesuai untukmu (Sekali bayar, selamanya):
                    </p>
                  </div>

                  {/* Pricing Comparison Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
                    
                    {/* Card 1: CV Siap Lamar (Rp 19.000) */}
                    <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[10px] p-4 flex flex-col justify-between space-y-4 hover:border-slate-400 transition relative">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                            Starter
                          </span>
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">CV Siap Lamar</h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Buat CV ATS standar mandiri</p>
                        </div>
                        <div className="pt-1 border-t border-slate-200 dark:border-slate-700">
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Rp 19.000</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">Sekali Bayar • Lifetime</span>
                        </div>
                        <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-700">
                          <li className="flex items-start gap-1.5 text-[11px]">
                            <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                            <span>CV Builder Interaktif ATS</span>
                          </li>
                          <li className="flex items-start gap-1.5 text-[11px]">
                            <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                            <span>Template ATS Teruji HR</span>
                          </li>
                          <li className="flex items-start gap-1.5 text-[11px]">
                            <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                            <span>Download PDF Unlimited</span>
                          </li>
                        </ul>
                      </div>
                      <button
                        type="button"
                        onClick={() => router.push('/pembayaran?plan=siap_lamar')}
                        className="w-full py-2.5 rounded-[10px] bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold text-xs transition cursor-pointer text-center"
                      >
                        Pilih Rp 19rb
                      </button>
                    </div>

                    {/* Card 2: CV Profesional (Rp 59.000) — PALING POPULER */}
                    <div className="bg-orange-50/80 dark:bg-orange-950/40 border-2 border-orange-500 rounded-[10px] p-4 flex flex-col justify-between space-y-4 transition relative shadow-md shadow-orange-500/10">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-[10px] bg-orange-500 text-white uppercase tracking-wider shadow-2xs">
                            🔥 Paling Populer
                          </span>
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">CV Profesional</h3>
                          <p className="text-[11px] text-orange-700 dark:text-orange-300 mt-0.5">Dibuatkan & Disusun Tim HR</p>
                        </div>
                        <div className="pt-1 border-t border-orange-200 dark:border-orange-800">
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl font-extrabold text-orange-600 dark:text-orange-400">Rp 59.000</span>
                          </div>
                          <span className="text-[10px] font-bold text-orange-600/80 dark:text-orange-400/80">Sekali Bayar • Best Value</span>
                        </div>
                        <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-200 pt-2 border-t border-orange-200 dark:border-orange-800">
                          <li className="flex items-start gap-1.5 text-[11px] font-semibold">
                            <CheckCircle2 size={14} className="text-orange-500 shrink-0 mt-0.5" />
                            <span>Semua Fitur CV Siap Lamar</span>
                          </li>
                          <li className="flex items-start gap-1.5 text-[11px]">
                            <CheckCircle2 size={14} className="text-orange-500 shrink-0 mt-0.5" />
                            <span>Dibuatkan Khusus Tim HR</span>
                          </li>
                          <li className="flex items-start gap-1.5 text-[11px]">
                            <CheckCircle2 size={14} className="text-orange-500 shrink-0 mt-0.5" />
                            <span>Optimasi Action Verbs & ATS</span>
                          </li>
                          <li className="flex items-start gap-1.5 text-[11px]">
                            <CheckCircle2 size={14} className="text-orange-500 shrink-0 mt-0.5" />
                            <span>Garansi Revisi 3x</span>
                          </li>
                        </ul>
                      </div>
                      <button
                        type="button"
                        onClick={() => router.push('/pembayaran?plan=profesional')}
                        className="w-full py-2.5 rounded-[10px] bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition cursor-pointer text-center flex items-center justify-center gap-1"
                      >
                        <span>Pilih Rp 59rb</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>

                    {/* Card 3: Paket Siap Kerja (Rp 99.000) */}
                    <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[10px] p-4 flex flex-col justify-between space-y-4 hover:border-slate-400 transition relative">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                            All-In-One
                          </span>
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Paket Siap Kerja</h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">CV + Cover Letter + Mentor</p>
                        </div>
                        <div className="pt-1 border-t border-slate-200 dark:border-slate-700">
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Rp 99.000</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">Sekali Bayar • Complete</span>
                        </div>
                        <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-700">
                          <li className="flex items-start gap-1.5 text-[11px] font-semibold">
                            <CheckCircle2 size={14} className="text-blue-500 shrink-0 mt-0.5" />
                            <span>Semua Fitur CV Profesional</span>
                          </li>
                          <li className="flex items-start gap-1.5 text-[11px]">
                            <CheckCircle2 size={14} className="text-blue-500 shrink-0 mt-0.5" />
                            <span>Surat Lamaran (Cover Letter)</span>
                          </li>
                          <li className="flex items-start gap-1.5 text-[11px]">
                            <CheckCircle2 size={14} className="text-blue-500 shrink-0 mt-0.5" />
                            <span>Review Karier 1-on-1 Mentor</span>
                          </li>
                        </ul>
                      </div>
                      <button
                        type="button"
                        onClick={() => router.push('/pembayaran?plan=siap_kerja')}
                        className="w-full py-2.5 rounded-[10px] bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs transition cursor-pointer text-center"
                      >
                        Pilih Rp 99rb
                      </button>
                    </div>

                  </div>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={handleFinishAndNavigateToDashboard}
                      className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition cursor-pointer flex items-center justify-center gap-1 mx-auto"
                    >
                      <span>Lanjut dengan versi gratis (CV Builder Mandiri)</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ====================================================================== */}
          {/* ADAPTIVE FORM STEPS (1..N) */}
          {/* ====================================================================== */}
          {currentStepIndex > 0 && !showValueMoment && !showMarketingOffer && (
            <AnimatePresence mode="wait">
              
              {/* ------------------------------------------------------------- */}
              {/* STEP: TENTANG KAMU (Nama, Domisili, Pendidikan / Kontak) */}
              {/* ------------------------------------------------------------- */}
              {journeySteps[currentStepIndex - 1]?.label === 'Tentang Kamu' && (
                <motion.div
                  key="stepTentangKamu"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                      <User className="w-6 h-6 text-orange-500" />
                      <span>Kenalan dulu</span>
                    </h2>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                      Biar kami bisa mencarikan informasi yang lebih relevan untukmu.
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Nama lengkap
                      </label>
                      <input
                        type="text"
                        placeholder="Ketik nama lengkapmu..."
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[10px] text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition placeholder:text-slate-400"
                      />
                    </div>

                    {selectedIntent === 'buat_cv' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Kontak (No. HP / Email)
                        </label>
                        <input
                          type="text"
                          placeholder="Nomor HP atau Email..."
                          value={formData.contactInfo}
                          onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[10px] text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition placeholder:text-slate-400"
                        />
                      </div>
                    )}

                    {/* Domisili tempat tinggal (Menggunakan CitySearchInput dari data github cahyadsn/wilayah) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Domisili tempat tinggal
                      </label>
                      <CitySearchInput
                        value={formData.location}
                        onChange={(val) => setFormData({ ...formData, location: val })}
                        placeholder="Cari Kota / Kabupaten di Indonesia (misal: Semarang, Jakarta, Surabaya)..."
                      />
                    </div>

                    {selectedIntent !== 'buat_cv' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                            Pendidikan terakhir
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {EDUCATION_LEVELS.map((lvl) => (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => setFormData({ ...formData, educationLevel: lvl })}
                                className={`px-4 py-2 rounded-[10px] text-xs font-bold transition cursor-pointer ${
                                  formData.educationLevel === lvl
                                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                                }`}
                              >
                                {lvl}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Kolom Dinamis Nama Sekolah/Almamater & Jurusan Sesuai Pilihan */}
                        {formData.educationLevel && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-3 pt-2"
                          >
                            <div>
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                                <span>
                                  {formData.educationLevel === 'SMA' || formData.educationLevel === 'SMK'
                                    ? `Nama Sekolah (${formData.educationLevel})`
                                    : formData.educationLevel === 'Lainnya'
                                    ? 'Nama Institusi / Lembaga Pendidikan'
                                    : `Nama Universitas / Kampus (${formData.educationLevel})`}
                                </span>
                              </label>
                              <SchoolSearchInput
                                value={formData.institutionName}
                                onChange={(val) => setFormData({ ...formData, institutionName: val })}
                                educationLevel={formData.educationLevel}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                {formData.educationLevel === 'SMA' || formData.educationLevel === 'SMK'
                                  ? 'Jurusan / Peminatan'
                                  : 'Jurusan / Program Studi'}
                              </label>
                              <MajorSearchInput
                                value={formData.major}
                                onChange={(val) => setFormData({ ...formData, major: val })}
                                educationLevel={formData.educationLevel}
                              />
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* STEP: PENDIDIKAN (BUAT CV) */}
              {/* ------------------------------------------------------------- */}
              {journeySteps[currentStepIndex - 1]?.label === 'Pendidikan' && (
                <motion.div
                  key="stepPendidikan"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                      <GraduationCap className="w-6 h-6 text-orange-500" />
                      <span>Latar belakang pendidikan</span>
                    </h2>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                      Informasi pendidikan penting untuk dicantumkan di CV.
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Pendidikan
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {EDUCATION_LEVELS.map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setFormData({ ...formData, educationLevel: lvl })}
                            className={`px-4 py-2 rounded-[10px] text-xs font-bold transition cursor-pointer ${
                              formData.educationLevel === lvl
                                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          {formData.educationLevel === 'SMA' || formData.educationLevel === 'SMK'
                            ? `Nama Sekolah (${formData.educationLevel})`
                            : formData.educationLevel === 'Lainnya'
                            ? 'Nama Institusi / Lembaga'
                            : `Nama Universitas / Kampus (${formData.educationLevel || 'Kampus'})`}
                        </label>
                        <SchoolSearchInput
                          value={formData.institutionName}
                          onChange={(val) => setFormData({ ...formData, institutionName: val })}
                          educationLevel={formData.educationLevel}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Jurusan / Program Studi
                        </label>
                        <MajorSearchInput
                          value={formData.major}
                          onChange={(val) => setFormData({ ...formData, major: val })}
                          educationLevel={formData.educationLevel}
                        />
                      </div>
                    </div>

                    <div className="w-full sm:w-56">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Tahun Lulus
                      </label>
                      <CustomSelect
                        value={formData.graduationYear}
                        onChange={(val) => setFormData({ ...formData, graduationYear: val })}
                        options={GRADUATION_YEAR_OPTIONS}
                        placeholder="Pilih tahun lulus..."
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* STEP: PENGALAMAN (Cari Kerja / Buat CV / Cepat Dapat Kerja) */}
              {/* ------------------------------------------------------------- */}
              {journeySteps[currentStepIndex - 1]?.label === 'Pengalaman' && (
                <motion.div
                  key="stepPengalaman"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                      <Briefcase className="w-6 h-6 text-orange-500" />
                      <span>Sudah punya pengalaman kerja?</span>
                    </h2>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                      Pengalaman PKL, organisasi, freelance, atau proyek juga sangat berguna.
                    </p>
                  </div>

                  <div className="space-y-5 pt-2">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, hasWorkExperience: false })}
                        className={`p-4 rounded-[10px] border text-center font-bold text-sm transition cursor-pointer ${
                          formData.hasWorkExperience === false
                            ? 'bg-orange-50 dark:bg-orange-950/60 border-orange-500 text-orange-600 dark:text-orange-400 ring-2 ring-orange-500/20'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        Belum pernah
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, hasWorkExperience: true })}
                        className={`p-4 rounded-[10px] border text-center font-bold text-sm transition cursor-pointer ${
                          formData.hasWorkExperience === true
                            ? 'bg-orange-50 dark:bg-orange-950/60 border-orange-500 text-orange-600 dark:text-orange-400 ring-2 ring-orange-500/20'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        Sudah pernah
                      </button>
                    </div>

                    {formData.hasWorkExperience === false && (
                      <div className="space-y-3 pt-2">
                        <div className="bg-orange-50/80 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/60 rounded-[10px] p-3.5 text-xs text-orange-700 dark:text-orange-300 font-semibold leading-relaxed">
                          Tidak masalah. Pengalaman seperti PKL, organisasi, freelance, atau proyek juga bisa membantu.
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {['PKL / Magang', 'Organisasi', 'Freelance', 'Proyek', 'Belum ada'].map((exp) => (
                            <button
                              key={exp}
                              type="button"
                              onClick={() => toggleArrayItem('nonWorkExperiences', exp)}
                              className={`px-3.5 py-2 rounded-[10px] text-xs font-bold transition cursor-pointer ${
                                formData.nonWorkExperiences.includes(exp)
                                  ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                              }`}
                            >
                              {exp}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {formData.hasWorkExperience === true && (
                      <div className="space-y-3 pt-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Posisi</label>
                            <input
                              type="text"
                              placeholder="Ketik posisi kerja..."
                              value={formData.experienceTitle}
                              onChange={(e) => setFormData({ ...formData, experienceTitle: e.target.value })}
                              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[10px] text-xs font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Perusahaan</label>
                            <input
                              type="text"
                              placeholder="Nama perusahaan..."
                              value={formData.experienceCompany}
                              onChange={(e) => setFormData({ ...formData, experienceCompany: e.target.value })}
                              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[10px] text-xs font-semibold"
                            />
                          </div>
                        </div>
                        {/* Datepicker Periode Kerja */}
                        <div className="space-y-2 pt-1">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mulai Bekerja</label>
                              <CustomDatePicker
                                value={formData.experienceStartDate}
                                onChange={(val) => setFormData({ ...formData, experienceStartDate: val })}
                                placeholder="Pilih bulan & tahun mulai..."
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Selesai Bekerja</label>
                              <CustomDatePicker
                                disabled={formData.experienceIsCurrent}
                                value={formData.experienceIsCurrent ? 'Sekarang' : formData.experienceEndDate}
                                minDate={formData.experienceStartDate}
                                onChange={(val) => setFormData({ ...formData, experienceEndDate: val })}
                                placeholder="Pilih bulan & tahun selesai..."
                                allowPresent={true}
                              />
                            </div>
                          </div>

                          {/* Checkbox Masih bekerja di sini */}
                          <label className="flex items-center gap-2 cursor-pointer pt-1 select-none">
                            <input
                              type="checkbox"
                              checked={formData.experienceIsCurrent}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setFormData((prev) => ({
                                  ...prev,
                                  experienceIsCurrent: checked,
                                  experienceEndDate: checked ? 'Sekarang' : prev.experienceEndDate === 'Sekarang' ? '' : prev.experienceEndDate,
                                }));
                              }}
                              className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500/20 cursor-pointer accent-orange-500"
                            />
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              Saya masih bekerja di sini
                            </span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* STEP: SKILL (BUAT CV) */}
              {/* ------------------------------------------------------------- */}
              {journeySteps[currentStepIndex - 1]?.label === 'Skill' && (
                <motion.div
                  key="stepSkill"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                      <Award className="w-6 h-6 text-orange-500" />
                      <span>Apa yang kamu bisa?</span>
                    </h2>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                      Pilih skill yang kamu kuasai atau tambahkan skill kustom.
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex flex-wrap gap-2">
                      {SKILL_SUGGESTIONS.map((sk) => {
                        const isSel = formData.skills.includes(sk);
                        return (
                          <button
                            key={sk}
                            type="button"
                            onClick={() => toggleSkill(sk)}
                            className={`px-3.5 py-2 rounded-[10px] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                              isSel
                                ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                            }`}
                          >
                            {isSel && <Check size={14} />}
                            <span>{sk}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Tambah skill lain..."
                        value={formData.customSkillInput}
                        onChange={(e) => setFormData({ ...formData, customSkillInput: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomSkill();
                          }
                        }}
                        className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[10px] text-xs font-semibold focus:outline-none focus:border-orange-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomSkill}
                        className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-[10px] transition cursor-pointer"
                      >
                        Tambah
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* STEP: TARGET KERJA / POSISI */}
              {/* ------------------------------------------------------------- */}
              {(journeySteps[currentStepIndex - 1]?.label === 'Target Kerja' ||
                journeySteps[currentStepIndex - 1]?.label === 'Target Posisi' ||
                journeySteps[currentStepIndex - 1]?.label === 'Target Pekerjaan' ||
                journeySteps[currentStepIndex - 1]?.label === 'Target') && (
                <motion.div
                  key="stepTarget"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                      <Target className="w-6 h-6 text-orange-500" />
                      <span>Kamu ingin bekerja sebagai apa?</span>
                    </h2>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                      Tentukan posisi, industri, dan lokasi targetmu.
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Posisi Target</label>
                      <PositionSearchInput
                        selectedPositions={formData.targetPositions}
                        onAddPosition={handleAddPosition}
                        onRemovePosition={handleRemovePosition}
                        placeholder="Cari atau ketik posisi target (misal: Admin Staff, Frontend Developer)..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Industri</label>
                      <div className="flex flex-wrap gap-2">
                        {INDUSTRY_ITEMS.map((ind) => (
                          <button
                            key={ind.id}
                            type="button"
                            onClick={() => toggleArrayItem('targetIndustries', ind.id)}
                            className={`px-3.5 py-2 rounded-[10px] text-xs font-bold transition flex items-center gap-1.5 ${
                              formData.targetIndustries.includes(ind.id)
                                ? 'bg-orange-500 text-white shadow-sm'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span>{ind.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* STEP: PREFERENSI */}
              {/* ------------------------------------------------------------- */}
              {journeySteps[currentStepIndex - 1]?.label === 'Preferensi' && (
                <motion.div
                  key="stepPreferensi"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                      <Compass className="w-6 h-6 text-orange-500" />
                      <span>Kerja seperti apa yang kamu cari?</span>
                    </h2>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                      Tentukan ekspektasi gaji, sistem kerja, dan prioritas utama.
                    </p>
                  </div>

                  <div className="space-y-5 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Ekspektasi gaji</label>
                      <CustomSelect
                        value={formData.expectedSalary}
                        onChange={(val) => setFormData({ ...formData, expectedSalary: val })}
                        options={SALARY_OPTIONS}
                        placeholder="Pilih range gaji..."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Bersedia luar kota?</label>
                        <div className="flex gap-2">
                          {['Ya', 'Tidak'].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setFormData({ ...formData, willingToRelocate: opt })}
                              className={`flex-1 py-2 rounded-[10px] text-xs font-bold border transition ${
                                formData.willingToRelocate === opt
                                  ? 'bg-orange-50 border-orange-500 text-orange-600'
                                  : 'bg-slate-50 border-slate-200 text-slate-700'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Kapan bisa mulai?</label>
                        <CustomSelect
                          value={formData.availabilityToStart}
                          onChange={(val) => setFormData({ ...formData, availabilityToStart: val })}
                          options={AVAILABILITY_OPTIONS}
                          placeholder="Waktu mulai..."
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* STEP: UPLOAD CV (PERBAIKI CV) */}
              {/* ------------------------------------------------------------- */}
              {journeySteps[currentStepIndex - 1]?.label === 'Upload CV' && (
                <motion.div
                  key="stepUploadCv"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6 text-center"
                >
                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-50 flex items-center justify-center gap-2">
                      <Upload className="w-6 h-6 text-orange-500" />
                      <span>Upload CV kamu</span>
                    </h2>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                      Kami akan membantu menemukan bagian yang bisa diperbaiki.
                    </p>
                  </div>

                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-[10px] p-8 bg-slate-50 dark:bg-slate-800/50 hover:bg-orange-50/50 transition cursor-pointer space-y-3">
                    <div className="w-12 h-12 rounded-[10px] bg-orange-100 dark:bg-orange-950 text-orange-500 flex items-center justify-center mx-auto">
                      <Upload size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Drag & drop file CV kamu di sini</p>
                      <p className="text-[11px] text-slate-400">Format PDF / DOCX (Maksimal 5MB)</p>
                    </div>
                    <button type="button" className="px-5 py-2.5 rounded-[10px] bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition">
                      Pilih File CV
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* STEP: DOKUMEN CV (MAU CEPAT DAPAT KERJA) */}
              {/* ------------------------------------------------------------- */}
              {journeySteps[currentStepIndex - 1]?.label === 'Dokumen CV' && (
                <motion.div
                  key="stepDokumenCv"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                      <FileText className="w-6 h-6 text-orange-500" />
                      <span>Kamu sudah punya CV?</span>
                    </h2>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                      Pilih opsi yang sesuai dengan kondisi CV kamu saat ini.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, hasCvAlready: true })}
                      className={`p-5 rounded-[10px] border text-left transition cursor-pointer ${
                        formData.hasCvAlready === true
                          ? 'bg-orange-50 border-orange-500 ring-2 ring-orange-500/20'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Upload size={20} className="text-orange-500 mb-2" />
                      <h4 className="text-xs font-bold text-slate-900">Sudah Punya</h4>
                      <p className="text-[11px] text-slate-500">Unggah file CV yang sudah kamu miliki.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, hasCvAlready: false })}
                      className={`p-5 rounded-[10px] border text-left transition cursor-pointer ${
                        formData.hasCvAlready === false
                          ? 'bg-orange-50 border-orange-500 ring-2 ring-orange-500/20'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Sparkles size={20} className="text-orange-500 mb-2" />
                      <h4 className="text-xs font-bold text-slate-900">Belum Punya</h4>
                      <p className="text-[11px] text-slate-500">Buat CV otomatis dari data yang sudah dimasukkan.</p>
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          )}

          {/* Navigasi Action Buttons (Only when on steps 1..N) */}
          {currentStepIndex > 0 && !showValueMoment && !showMarketingOffer && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-5 py-2.5 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft size={16} /> Kembali
              </button>

              <button
                type="button"
                onClick={handleNextStep}
                className="px-7 py-3 rounded-[10px] bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition flex items-center gap-2 cursor-pointer"
              >
                <span>Lanjutkan</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}

        </div>
      </main>

      {/* Footer Note */}
      <footer className="max-w-2xl w-full mx-auto text-center py-2">
        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5">
          <Lock size={12} className="text-slate-400" />
          <span>Data kamu aman bersama AmbilCUTI</span>
        </p>
      </footer>

    </div>
  );
}
