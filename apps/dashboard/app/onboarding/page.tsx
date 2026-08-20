'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { userApi } from '@/lib/api';
import { setSessionCookie, getStoredSession } from '@/lib/auth';
import { DotLottiePlayer } from '@/components/DotLottiePlayer';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { CitySearchInput } from '@/components/ui/CitySearchInput';
import { MajorSearchInput } from '@/components/ui/MajorSearchInput';
import { SchoolSearchInput } from '@/components/ui/SchoolSearchInput';
import { PositionSearchInput } from '@/components/ui/PositionSearchInput';
import {
  User,
  GraduationCap,
  Briefcase,
  Target,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Check,
  Lock,
  DollarSign,
  MapPin,
  Award,
  BookOpen,
} from 'lucide-react';

export default function CardlessClaudeStyleOnboardingPage() {
  const router = useRouter();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValueMoment, setShowValueMoment] = useState(false);
  const [showMarketingOffer, setShowMarketingOffer] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    tosAccepted: false,
    fullName: '',
    contactInfo: '',
    location: '',
    educationLevel: '',
    institutionName: '',
    major: '',
    graduationYear: '',
    hasWorkExperience: null as boolean | null,
    nonWorkExperiences: [] as string[],
    experienceTitle: '',
    experienceCompany: '',
    experienceStartDate: '',
    experienceEndDate: '',
    experienceIsCurrent: false,
    skills: [] as string[],
    customSkillInput: '',
    targetPositions: [] as string[],
    targetIndustries: [] as string[],
    expectedSalary: '',
    willingToRelocate: '',
    availabilityToStart: '',
    hasCvAlready: null as boolean | null,
  });

  // Handle Enter key globally for next step
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !showValueMoment && !showMarketingOffer) {
        // If focusing a button or link, let native click handle it
        const target = e.target as HTMLElement;
        if (target && (target.tagName === 'BUTTON' || target.tagName === 'A')) {
          return;
        }
        if (isCurrentQuestionValid()) {
          handleNextQuestion();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestionIndex, formData, showValueMoment, showMarketingOffer]);

  // Constants
  const EDUCATION_LEVELS = ['SMA', 'SMK', 'D3', 'D4', 'S1', 'S2', 'Lainnya'];
  const SALARY_OPTIONS = ['Rp 2 Juta - 4 Juta', 'Rp 4 Juta - 7 Juta', 'Rp 7 Juta - 10 Juta', '> Rp 10 Juta'];
  const SKILL_SUGGESTIONS = [
    'Microsoft Office',
    'Excel & Spreadsheet',
    'Customer Service',
    'Figma',
    'Photoshop',
    'Communication',
    'Social Media',
    'Data Entry',
    'Bahasa Inggris',
    'Time Management',
  ];

  // Questions List
  const questions = [
    { id: 'tos', title: 'Selamat datang di Employr!', desc: 'Sebelum mulai, harap baca dan setujui ketentuan layanan kami.', icon: Lock },
    { id: 'fullName', title: 'Siapa nama lengkapmu?', desc: 'Biar kami bisa menyapamu dengan ramah.', icon: User },
    { id: 'location', title: 'Di mana domisili tempat tinggalmu?', desc: 'Kami carikan informasi & lowongan di sekitar kotamu.', icon: MapPin },
    { id: 'education', title: 'Apa pendidikan terakhirmu?', desc: 'Kualifikasi pendidikan yang kamu tempuh.', icon: GraduationCap },
    { id: 'school', title: 'Nama sekolah / kampus & jurusan?', desc: 'Detail almamater pendidikanmu.', icon: BookOpen },
    { id: 'targetPosition', title: 'Kamu ingin bekerja sebagai apa?', desc: 'Posisi atau pekerjaan impian yang ditargetkan.', icon: Target },
    { id: 'experience', title: 'Sudah punya pengalaman kerja?', desc: 'Pengalaman PKL, freelance, atau organisasi juga dihitung.', icon: Briefcase },
    { id: 'skills', title: 'Skill apa saja yang kamu kuasai?', desc: 'Pilih keahlian utama untuk ditonjolkan.', icon: Award },
    { id: 'preference', title: 'Berapa ekspektasi gajimu?', desc: 'Range gaji impian pekerjaanmu.', icon: DollarSign },
  ];

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex - 1];

  const isCurrentQuestionValid = (): boolean => {
    if (!currentQuestion) return false;
    switch (currentQuestion.id) {
      case 'tos':
        return formData.tosAccepted;
      case 'fullName':
        return formData.fullName.trim().length > 0;
      case 'location':
        return formData.location.trim().length > 0;
      case 'education':
        return formData.educationLevel !== '';
      case 'school':
        return formData.institutionName.trim().length > 0 && formData.major.trim().length > 0;
      case 'targetPosition':
        return formData.targetPositions.length > 0;
      case 'experience':
        if (formData.hasWorkExperience === null) return false;
        if (formData.hasWorkExperience) {
          return formData.experienceTitle.trim().length > 0 && formData.experienceCompany.trim().length > 0;
        }
        return true;
      case 'skills':
        return formData.skills.length > 0;
      case 'preference':
        return formData.expectedSalary !== '';
      default:
        return true;
    }
  };

  const handleNextQuestion = () => {
    if (!isCurrentQuestionValid()) return;
    setDirection(1);
    if (currentQuestionIndex < totalQuestions) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setShowValueMoment(true);
    }
  };

  const handlePrevQuestion = () => {
    setDirection(-1);
    if (showMarketingOffer) {
      setShowMarketingOffer(false);
      setShowValueMoment(true);
    } else if (showValueMoment) {
      setShowValueMoment(false);
    } else if (currentQuestionIndex > 1) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleFinishAndNavigateToDashboard = async () => {
    setIsSubmitting(true);
    try {
      await userApi.updateProfile({
        fullName: formData.fullName || 'Pengguna Employr',
        location: formData.location,
        headline: `${formData.targetPositions.join(', ') || 'Talenta'} | ${formData.educationLevel}`,
        targetPosition: formData.targetPositions.join(', ') || 'Talenta',
        targetIndustry: formData.targetIndustries.join(', '),
        experienceYears: formData.hasWorkExperience ? 'Berpengalaman' : 'Fresh Graduate',
        expectedSalary: formData.expectedSalary,
      });
    } catch (err) {
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.setItem('cuti_onboarding_completed', 'true');

        // Build enriched session with onboarding data
        const existingSession = getStoredSession();
        const enrichedSession = {
          id: existingSession?.id || '',
          name: formData.fullName || existingSession?.name || 'Pengguna Employr',
          email: existingSession?.email || formData.contactInfo || '',
          role: existingSession?.role || '',
          provider: existingSession?.provider || '',
        };

        // Update auth session cookie & localStorage
        setSessionCookie(enrichedSession, 30);

        // Store extended onboarding profile data for CV defaults
        localStorage.setItem(
          'cuti_onboarding_profile',
          JSON.stringify({
            fullName: formData.fullName,
            location: formData.location,
            educationLevel: formData.educationLevel,
            institutionName: formData.institutionName,
            major: formData.major,
            targetPositions: formData.targetPositions,
            hasWorkExperience: formData.hasWorkExperience,
            experienceTitle: formData.experienceTitle,
            experienceCompany: formData.experienceCompany,
            skills: formData.skills,
            expectedSalary: formData.expectedSalary,
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

  // Build Breadcrumb Summary Chips from completed steps
  const breadcrumbChips = [
    formData.fullName.trim(),
    formData.location.trim(),
    formData.educationLevel,
    formData.major.trim(),
    formData.targetPositions[0],
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans p-6 sm:p-10 flex flex-col justify-between selection:bg-orange-500 selection:text-white">
      {/* 1. Minimalist Top Progress Bar (2px) */}
      {!showValueMoment && !showMarketingOffer && (
        <div className="fixed top-0 left-0 right-0 h-[2px] bg-slate-100 dark:bg-slate-900 z-50 overflow-hidden">
          <motion.div
            className="h-full bg-[#1738D1]"
            initial={{ width: 0 }}
            animate={{ width: `${(currentQuestionIndex / totalQuestions) * 100}%` }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          />
        </div>
      )}

      {/* Top Header Bar (Removed logo & question counter) */}
      <header className="max-w-lg w-full mx-auto" />

      {/* Center Screen Content (Seamless No-Card Claude Style) */}
      <main className="max-w-lg w-full mx-auto my-auto py-8">
        {!showValueMoment && !showMarketingOffer && currentQuestion && (
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentQuestion.id}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8 text-center sm:text-left"
            >
              {/* 2. Breadcrumb Chips — summary of previously filled data */}
              {currentQuestion.id !== 'tos' && breadcrumbChips.length > 0 && (
                <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                  {breadcrumbChips.map((chip, i) => (
                    <motion.span
                      key={`${chip}-${i}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04, duration: 0.2 }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-[10px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60"
                    >
                      <Check size={10} className="text-emerald-500" />
                      {chip}
                    </motion.span>
                  ))}
                </div>
              )}

              {/* Question Header & Description */}
              <div className="space-y-2">
                {currentQuestion.id === 'tos' ? (
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span>Selamat datang di</span>
                    <Image src="/logo.webp" alt="Employr" width={120} height={32} className="h-7 sm:h-8 w-auto object-contain dark:brightness-0 dark:invert inline-block" />
                  </h1>
                ) : (
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
                    {currentQuestion.title}
                  </h1>
                )}
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {currentQuestion.desc}
                </p>
              </div>

              {/* Minimal Clean Field Elements */}
              <div className="pt-2">
                {/* 0. TOS AGREEMENT */}
                {currentQuestion.id === 'tos' && (
                  <div className="space-y-4 text-left">
                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 transition text-left space-y-3">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData({ ...formData, tosAccepted: !formData.tosAccepted })}
                        className="w-full flex items-start gap-3 cursor-pointer text-left"
                      >
                        <span
                          className={`w-5 h-5 shrink-0 mt-0.5 rounded-md border-2 flex items-center justify-center transition ${
                            formData.tosAccepted
                              ? 'bg-[#1738D1] border-[#1738D1] text-white'
                              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-transparent'
                          }`}
                        >
                          <Check size={13} strokeWidth={3} />
                        </span>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-relaxed">
                          Saya menyetujui seluruh ketentuan layanan dan kebijakan privasi Employr untuk rekomendasi lowongan kerja & layanan pembuatan CV.
                        </span>
                      </motion.button>

                      <div className="flex items-center gap-4 text-[11px] pt-1 border-t border-slate-200 dark:border-slate-800/60 font-semibold text-[#1738D1] pl-8">
                        <Link href="/syarat-ketentuan" target="_blank" className="hover:underline flex items-center gap-1">
                          Syarat & Ketentuan ↗
                        </Link>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <Link href="/kebijakan-privasi" target="_blank" className="hover:underline flex items-center gap-1">
                          Kebijakan Privasi ↗
                        </Link>
                      </div>
                    </div>
                    {!formData.tosAccepted && (
                      <p className="text-[11px] font-semibold text-orange-500 text-center">
                        Wajib menyetujui persetujuan di atas untuk mulai mengisi onboarding
                      </p>
                    )}
                  </div>
                )}

                {/* 1. FULL NAME */}
                {currentQuestion.id === 'fullName' && (
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type="text"
                        autoFocus
                        placeholder="Ketik nama lengkapmu..."
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className={`w-full text-lg sm:text-xl font-bold py-3 bg-transparent border-b-2 text-slate-900 dark:text-slate-100 focus:outline-none transition placeholder:text-slate-300 dark:placeholder:text-slate-700 ${
                          formData.fullName.trim()
                            ? 'border-emerald-400 dark:border-emerald-500'
                            : 'border-slate-200 dark:border-slate-800 focus:border-[#1738D1]'
                        }`}
                      />
                      {formData.fullName.trim() && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute right-0 top-1/2 -translate-y-1/2 text-emerald-500"
                        >
                          <CheckCircle2 size={18} />
                        </motion.span>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. DOMISILI CITY */}
                {currentQuestion.id === 'location' && (
                  <div className="text-left">
                    <CitySearchInput
                      value={formData.location}
                      onChange={(val) => setFormData({ ...formData, location: val })}
                      placeholder="Ketik kota domisilimu..."
                      autoFocus
                    />
                  </div>
                )}

                {/* 3. EDUCATION LEVEL */}
                {currentQuestion.id === 'education' && (
                  <div className="text-left space-y-4">
                    <CustomSelect
                      value={formData.educationLevel}
                      onChange={(val) => setFormData({ ...formData, educationLevel: val })}
                      options={EDUCATION_LEVELS}
                      placeholder="Pilih tingkat pendidikan..."
                    />
                  </div>
                )}

                {/* 4. SCHOOL & MAJOR */}
                {currentQuestion.id === 'school' && (
                  <div className="space-y-5 text-left">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                        Nama Sekolah / Kampus
                      </label>
                      <SchoolSearchInput
                        value={formData.institutionName}
                        onChange={(val) => setFormData({ ...formData, institutionName: val })}
                        educationLevel={formData.educationLevel}
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                        Jurusan / Program Studi
                      </label>
                      <MajorSearchInput
                        value={formData.major}
                        onChange={(val) => setFormData({ ...formData, major: val })}
                        educationLevel={formData.educationLevel}
                      />
                    </div>
                  </div>
                )}

                {/* 5. TARGET POSITION */}
                {currentQuestion.id === 'targetPosition' && (
                  <div className="text-left">
                    <PositionSearchInput
                      selectedPositions={formData.targetPositions}
                      onAddPosition={(pos) => setFormData((prev) => ({ ...prev, targetPositions: [...prev.targetPositions, pos] }))}
                      onRemovePosition={(pos) => setFormData((prev) => ({ ...prev, targetPositions: prev.targetPositions.filter((p) => p !== pos) }))}
                      placeholder="Cari atau ketik posisi yang ditargetkan..."
                      autoFocus
                    />
                  </div>
                )}

                {/* 6. EXPERIENCE */}
                {currentQuestion.id === 'experience' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setFormData({ ...formData, hasWorkExperience: false })}
                        className={`p-5 rounded-2xl border text-center font-bold text-xs transition cursor-pointer ${
                          formData.hasWorkExperience === false
                            ? 'bg-orange-50/80 dark:bg-orange-950/60 border-[#1738D1] text-orange-600 dark:text-orange-400 ring-2 ring-[#1738D1]/20'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        Belum pernah kerja
                      </motion.button>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setFormData({ ...formData, hasWorkExperience: true })}
                        className={`p-5 rounded-2xl border text-center font-bold text-xs transition cursor-pointer ${
                          formData.hasWorkExperience === true
                            ? 'bg-orange-50/80 dark:bg-orange-950/60 border-[#1738D1] text-orange-600 dark:text-orange-400 ring-2 ring-[#1738D1]/20'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        Sudah pernah kerja
                      </motion.button>
                    </div>

                    {formData.hasWorkExperience === true && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
                        <input
                          type="text"
                          placeholder="Posisi terakhirmu..."
                          value={formData.experienceTitle}
                          onChange={(e) => setFormData({ ...formData, experienceTitle: e.target.value })}
                          className="px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#1738D1]"
                        />
                        <input
                          type="text"
                          placeholder="Nama Perusahaan..."
                          value={formData.experienceCompany}
                          onChange={(e) => setFormData({ ...formData, experienceCompany: e.target.value })}
                          className="px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#1738D1]"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* 7. SKILLS */}
                {currentQuestion.id === 'skills' && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      {SKILL_SUGGESTIONS.map((sk) => {
                        const isSel = formData.skills.includes(sk);
                        return (
                          <motion.button
                            key={sk}
                            type="button"
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                skills: isSel ? prev.skills.filter((s) => s !== sk) : [...prev.skills, sk],
                              }));
                            }}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                              isSel ? 'bg-[#1738D1] text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                            }`}
                          >
                            {isSel && <Check size={14} />}
                            <span>{sk}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                    {/* Custom skill input */}
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Ketik skill lainnya..."
                        value={formData.customSkillInput}
                        onChange={(e) => setFormData({ ...formData, customSkillInput: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && formData.customSkillInput.trim()) {
                            e.preventDefault();
                            const skill = formData.customSkillInput.trim();
                            if (!formData.skills.includes(skill)) {
                              setFormData((prev) => ({
                                ...prev,
                                skills: [...prev.skills, skill],
                                customSkillInput: '',
                              }));
                            }
                          }
                        }}
                        className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#1738D1] transition"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const skill = formData.customSkillInput.trim();
                          if (skill && !formData.skills.includes(skill)) {
                            setFormData((prev) => ({
                              ...prev,
                              skills: [...prev.skills, skill],
                              customSkillInput: '',
                            }));
                          }
                        }}
                        disabled={!formData.customSkillInput.trim()}
                        className="px-4 py-2.5 rounded-xl bg-[#1738D1] text-white text-xs font-bold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Tambah
                      </button>
                    </div>
                    {/* Show custom skills added */}
                    {formData.skills.filter((s) => !SKILL_SUGGESTIONS.includes(s)).length > 0 && (
                      <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1">
                        {formData.skills
                          .filter((s) => !SKILL_SUGGESTIONS.includes(s))
                          .map((sk) => (
                            <motion.button
                              key={sk}
                              type="button"
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.94 }}
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  skills: prev.skills.filter((s) => s !== sk),
                                }))
                              }
                              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#1738D1] text-white shadow-sm flex items-center gap-1.5 cursor-pointer"
                            >
                              <Check size={14} />
                              <span>{sk}</span>
                            </motion.button>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 8. PREFERENCE */}
                {currentQuestion.id === 'preference' && (
                  <div className="text-left space-y-4">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Range Gaji Impian</label>
                    <CustomSelect
                      value={formData.expectedSalary}
                      onChange={(val) => setFormData({ ...formData, expectedSalary: val })}
                      options={SALARY_OPTIONS}
                      placeholder="Pilih range gaji..."
                    />
                  </div>
                )}
              </div>

              {/* Navigation Button Bar (Claude Seamless Bottom Bar) */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 1}
                  className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft size={16} /> Kembali
                </button>

                <button
                  type="button"
                  onClick={handleNextQuestion}
                  disabled={!isCurrentQuestionValid()}
                  className="px-7 py-3 rounded-xl bg-[#1738D1] hover:bg-[#132EA8] text-white font-bold text-xs shadow-md shadow-[#1738D1]/20 transition flex items-center gap-2 cursor-pointer active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>{currentQuestionIndex === totalQuestions ? 'Selesai' : 'Lanjut'}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* VALUE MOMENT SCREEN */}
        {showValueMoment && !showMarketingOffer && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
            }}
            className="space-y-6 text-center"
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.6 },
                visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 18 } },
              }}
            >
              <DotLottiePlayer
                src="/animations/profile-ready.json"
                autoplay={true}
                loop={false}
                className="w-28 h-28 mx-auto"
                fallback={
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-200">
                    <CheckCircle2 size={32} />
                  </div>
                }
              />
            </motion.div>
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
              }}
              className="space-y-1"
            >
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                Profilmu Siap, {displayFirstName}!
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Kami telah menyesuaikan data profil untuk target posisi <strong>{primaryTargetPos}</strong> di <strong>{primaryLocation}</strong>.
              </p>
            </motion.div>

            <motion.button
              type="button"
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowMarketingOffer(true)}
              className="w-full py-3.5 rounded-xl bg-[#1738D1] hover:bg-[#132EA8] text-white font-bold text-xs shadow-md shadow-[#1738D1]/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Lanjutkan</span>
              <ArrowRight size={16} />
            </motion.button>
          </motion.div>
        )}

        {/* MARKETING OFFER SCREEN */}
        {showMarketingOffer && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
            }}
            className="space-y-6"
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
              }}
              className="space-y-2 text-center sm:text-left"
            >
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-50">
                Tingkatkan Peluang Karirmu dengan Premium Pass
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dapatkan akses penuh seluruh fitur Employr & opsi pembuatan CV langsung oleh tim HRD:
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Premium Pass Card */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.97 },
                  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 220, damping: 20 } },
                }}
                whileHover={{ y: -3 }}
                className="relative bg-gradient-to-b from-orange-50 to-white dark:from-orange-950/40 dark:to-slate-900 border-2 border-[#1738D1] rounded-2xl p-5 flex flex-col justify-between space-y-5"
              >
                <div className="absolute -top-3 left-4">
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-[#1738D1] text-white shadow-sm shadow-[#1738D1]/30">Rekomendasi</span>
                </div>
                <div className="space-y-3 pt-1">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Premium Pass Akses Penuh</h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-extrabold text-[#1738D1]">Rp 99.000</span>
                    <span className="text-xs text-slate-400 line-through">Rp 149.000</span>
                  </div>
                  <ul className="space-y-2 text-[11px] text-slate-600 dark:text-slate-400">
                    <li className="flex items-start gap-2">
                      <Check size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                      <span>Akses penuh seluruh fitur & template ATS</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                      <span>AI CV Matcher & Screener analisis instan</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                      <span>Job Application Tracker tanpa batas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                      <span>Bank Soal & Simulasi Interview AI</span>
                    </li>
                  </ul>
                </div>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push('/pembayaran?plan=premium')}
                  className="w-full py-2.5 rounded-xl bg-[#1738D1] hover:bg-[#132EA8] text-white font-bold text-xs shadow-md shadow-[#1738D1]/20 transition cursor-pointer"
                >
                  Pilih Premium (Rp 99rb)
                </motion.button>
              </motion.div>

              {/* Dibuatkan HRD Plan */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.97 },
                  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 220, damping: 20 } },
                }}
                whileHover={{ y: -3 }}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Dibuatkan Khusus Tim HRD</h4>
                  <p className="text-xl font-extrabold text-slate-800 dark:text-slate-100">Rp 49.000</p>
                  <ul className="space-y-2 text-[11px] text-slate-600 dark:text-slate-400">
                    <li className="flex items-start gap-2">
                      <Check size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                      <span>CV disusun langsung oleh praktisi HRD</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                      <span>Riset keyword ATS sesuai target posisi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                      <span>Garansi revisi & pengerjaan cepat</span>
                    </li>
                  </ul>
                </div>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push('/pembayaran?plan=hrd_service')}
                  className="w-full py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs transition cursor-pointer"
                >
                  Pilih Dibuatkan HRD (Rp 49rb)
                </motion.button>
              </motion.div>
            </div>

            <motion.div
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { duration: 0.3 } },
              }}
              className="pt-1 text-center"
            >
              <button
                type="button"
                onClick={handleFinishAndNavigateToDashboard}
                disabled={isSubmitting}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition cursor-pointer flex items-center justify-center gap-1 mx-auto disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Memproses...' : 'Lanjut buat CV'}</span>
                {!isSubmitting && <ArrowRight size={14} />}
              </button>
            </motion.div>
          </motion.div>
        )}
      </main>

      {/* Bottom Footer */}
      <footer className="max-w-lg w-full mx-auto text-center">
        <p className="text-xs font-medium text-slate-400 dark:text-slate-600 flex items-center justify-center gap-1.5">
          <Lock size={12} className="text-slate-400" />
          <span>Data kamu aman bersama Employr</span>
        </p>
      </footer>
    </div>
  );
}
