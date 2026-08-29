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
  Upload,
  Sparkles,
  FileCheck,
  AlertCircle,
  FileUp,
  RotateCcw,
  Mail,
  Phone,
} from 'lucide-react';

export default function CardlessClaudeStyleOnboardingPage() {
  const router = useRouter();

  // Onboarding Step Flow: 'tos' | 'fork' | 'upload_scan' | 'questions'
  const [currentStage, setCurrentStage] = useState<'tos' | 'fork' | 'upload_scan' | 'questions'>('tos');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValueMoment, setShowValueMoment] = useState(false);
  const [showMarketingOffer, setShowMarketingOffer] = useState(false);

  // Upload & File Scanning State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanCompleted, setScanCompleted] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    tosAccepted: false,
    fullName: '',
    contactInfo: '',
    phone: '',
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
    summary: '',
    extractedExperiences: [] as any[],
    extractedProjects: [] as any[],
    extractedOrganizations: [] as any[],
    extractedCertifications: [] as any[],
  });

  // Handle Enter key globally for next step in questions mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.isComposing) return;

      if (currentStage === 'questions' && !showValueMoment && !showMarketingOffer) {
        const target = e.target as HTMLElement;
        if (target && (target.tagName === 'BUTTON' || target.tagName === 'A' || target.tagName === 'TEXTAREA')) {
          return;
        }
        if (isCurrentQuestionValid()) {
          e.preventDefault();
          handleNextQuestion();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStage, currentQuestionIndex, formData, showValueMoment, showMarketingOffer]);

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

  // Guided Questions List
  const questions = [
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
    } else {
      setCurrentStage('fork');
    }
  };

  // Helper parser for CV files (.json, .txt, .pdf, .docx)
  const handleFileUploadAndScan = async (file: File) => {
    if (!file) return;
    setUploadedFile(file);
    setIsScanning(true);
    setScanProgress(20);
    setScanError(null);

    try {
      const bodyData = new FormData();
      bodyData.append('file', file);

      setScanProgress(45);
      const res = await fetch('/api/cv/parse', {
        method: 'POST',
        body: bodyData,
      });

      setScanProgress(80);
      const result = await res.json();

      if (!res.ok || !result.success) {
        setScanError(result.error || 'Berkas yang kamu unggah tampaknya bukan dokumen CV atau Resume. Pastikan berkas memuat informasi pendidikan, pengalaman, atau keahlian kamu.');
        setScanCompleted(false);
        setUploadedFile(null);
        return;
      }

      const data = result.data || {};

      if (typeof window !== 'undefined') {
        localStorage.setItem('cuti_imported_cv_data', JSON.stringify(data));
      }

      setFormData((prev) => ({
        ...prev,
        hasCvAlready: true,
        fullName: data.fullName || prev.fullName,
        contactInfo: data.contactInfo || prev.contactInfo,
        phone: data.phone || prev.phone,
        location: data.location || prev.location,
        educationLevel: data.educationLevel || prev.educationLevel,
        institutionName: data.institutionName || prev.institutionName,
        major: data.major || prev.major,
        targetPositions: data.targetPositions?.length ? data.targetPositions : prev.targetPositions,
        hasWorkExperience: data.hasWorkExperience !== null ? data.hasWorkExperience : prev.hasWorkExperience,
        experienceTitle: data.experienceTitle || prev.experienceTitle,
        experienceCompany: data.experienceCompany || prev.experienceCompany,
        skills: data.skills?.length ? data.skills : [],
        summary: data.summary || prev.summary,
        extractedExperiences: data.experience || [],
        extractedProjects: data.projects || [],
        extractedOrganizations: data.organizations || [],
        extractedCertifications: data.certifications || [],
      }));

      setScanProgress(100);
      setScanCompleted(true);
    } catch (err: any) {
      setScanError(err.message || 'Terjadi kendala saat membaca berkas. Silakan tinjau dan sesuaikan data di bawah.');
      setScanCompleted(true);
    } finally {
      setIsScanning(false);
    }
  };

  const handleFinishAndNavigateTo = async (destination: '/cv' | '/beranda' = '/beranda') => {
    setIsSubmitting(true);
    try {
      await userApi.updateProfile({
        fullName: formData.fullName || 'Pengguna Employr',
        location: formData.location,
        headline: `${formData.targetPositions.join(', ') || 'Talenta'} | ${formData.educationLevel || 'Fresh Graduate'}`,
        targetPosition: formData.targetPositions.join(', ') || 'Talenta',
        targetIndustry: formData.targetIndustries.join(', '),
        experienceYears: formData.hasWorkExperience ? 'Berpengalaman' : 'Fresh Graduate',
        expectedSalary: formData.expectedSalary,
      });
    } catch (err) {
      // Graceful fallback
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
            contactInfo: formData.contactInfo,
            phone: formData.phone,
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
            summary: formData.summary,
            hasCvAlready: formData.hasCvAlready,
          })
        );
      }
      setIsSubmitting(false);
      router.push(destination);
    }
  };

  const displayFirstName = formData.fullName.trim() ? formData.fullName.split(' ')[0] : 'Kamu';
  const primaryTargetPos = formData.targetPositions.length > 0 ? formData.targetPositions[0] : 'Pekerjaan Impian';
  const primaryLocation = formData.location || 'Kota Tujuan';

  // Build Breadcrumb Summary Chips
  const breadcrumbChips = [
    formData.fullName.trim(),
    formData.location.trim(),
    formData.educationLevel,
    formData.major.trim(),
    formData.targetPositions[0],
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans p-6 sm:p-10 flex flex-col justify-between selection:bg-orange-500 selection:text-white">
      {/* 1. Minimalist Top Progress Bar */}
      {currentStage === 'questions' && !showValueMoment && !showMarketingOffer && (
        <div className="fixed top-0 left-0 right-0 h-[2px] bg-slate-100 dark:bg-slate-900 z-50 overflow-hidden">
          <motion.div
            className="h-full bg-[#1738D1]"
            initial={{ width: 0 }}
            animate={{ width: `${(currentQuestionIndex / totalQuestions) * 100}%` }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          />
        </div>
      )}

      {/* Top Header Placeholder */}
      <header className="max-w-lg w-full mx-auto" />

      {/* Center Screen Content */}
      <main className="max-w-lg w-full mx-auto my-auto py-6">
        {/* ============================================================ */}
        {/* STAGE 1: TOS AGREEMENT */}
        {/* ============================================================ */}
        {currentStage === 'tos' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6 text-center sm:text-left"
          >
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span>Selamat datang di</span>
                <Image
                  src="/logo.webp"
                  alt="Employr"
                  width={120}
                  height={32}
                  className="h-7 sm:h-8 w-auto object-contain dark:brightness-0 dark:invert inline-block"
                />
              </h1>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Sebelum mulai, harap baca dan setujui ketentuan layanan kami.
              </p>
            </div>

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

            <button
              type="button"
              disabled={!formData.tosAccepted}
              onClick={() => setCurrentStage('fork')}
              className="w-full py-3.5 rounded-xl bg-[#F97316] hover:bg-[#ea580c] text-white font-bold text-xs shadow-md shadow-[#F97316]/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-98"
            >
              <span>Mulai Sekarang</span>
              <ArrowRight size={16} />
            </button>
          </motion.div>
        )}

        {/* ============================================================ */}
        {/* STAGE 2: FORK SELECTION (Sudah Punya CV vs Belum Punya) */}
        {/* ============================================================ */}
        {currentStage === 'fork' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6 text-center sm:text-left"
          >
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
                Bagaimana kamu ingin memulai?
              </h1>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Pilih metode tercepat untuk menyiapkan profil karirmu.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 pt-2">
              {/* Option A: Sudah Punya CV */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setFormData({ ...formData, hasCvAlready: true });
                  setCurrentStage('upload_scan');
                }}
                className="p-5 rounded-2xl border-2 border-[#1738D1]/40 hover:border-[#1738D1] bg-blue-50/40 dark:bg-blue-950/20 text-left transition flex items-start gap-4 cursor-pointer group shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-[#1738D1] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#1738D1]/20">
                  <Upload size={22} />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-[#1738D1] transition">
                      Sudah Punya CV (Upload & Scan)
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200">
                      Otomatis & Cepat
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Unggah file PDF, DOCX, atau JSON. Sistem akan memindai teks dan langsung mengisi data profilmu.
                  </p>
                </div>
              </motion.button>

              {/* Option B: Belum Punya CV */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setFormData({ ...formData, hasCvAlready: false });
                  setCurrentStage('questions');
                  setCurrentQuestionIndex(1);
                }}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-400 bg-slate-50 dark:bg-slate-900 text-left transition flex items-start gap-4 cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
                  <Sparkles size={22} className="text-orange-500" />
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-orange-600 transition">
                    Belum Punya, Buat dari Awal
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Kenalan singkat lewat beberapa pertanyaan mudah. Kami pandu menyusun CV pertamamu dari nol.
                  </p>
                </div>
              </motion.button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setCurrentStage('tos')}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 transition cursor-pointer"
              >
                <ArrowLeft size={14} /> Kembali
              </button>
            </div>
          </motion.div>
        )}

        {/* ============================================================ */}
        {/* STAGE 3A: UPLOAD & AUTO-SCAN FLOW */}
        {/* ============================================================ */}
        {currentStage === 'upload_scan' && !showMarketingOffer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6 text-center sm:text-left"
          >
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
                {scanCompleted ? 'Hasil Pemindaian CV' : 'Unggah Berkas CV Kamu'}
              </h1>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {scanCompleted
                  ? 'Periksa data yang berhasil diekstrak. Kamu bisa langsung menyesuaikannya jika diperlukan.'
                  : 'Pilih file PDF, DOCX, atau JSON untuk dipindai otomatis oleh sistem.'}
              </p>
            </div>

            {!scanCompleted ? (
              <div className="space-y-4">
                {/* Upload Zone */}
                <label className="w-full p-8 border-2 border-dashed border-[#1738D1]/50 hover:border-[#1738D1] dark:border-blue-800 rounded-2xl bg-blue-50/30 dark:bg-blue-950/10 transition flex flex-col items-center justify-center gap-3 cursor-pointer group">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/60 text-[#1738D1] dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition">
                    <FileUp size={28} />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                      Klik untuk pilih file atau tarik berkas ke sini
                    </p>
                    <p className="text-[11px] font-medium text-slate-400">
                      Mendukung PDF, DOCX, TXT, dan JSON (Maksimal 10MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.txt,.json"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUploadAndScan(file);
                    }}
                    className="hidden"
                  />
                </label>

                {/* Scanning Progress State */}
                {isScanning && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-2 text-[#1738D1]">
                        <span className="w-2 h-2 rounded-full bg-[#1738D1] animate-ping" />
                        Memindai & mengekstrak struktur CV...
                      </span>
                      <span className="text-slate-500">{scanProgress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <motion.div
                        className="h-full bg-[#1738D1]"
                        initial={{ width: 0 }}
                        animate={{ width: `${scanProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}

                {scanError && (
                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-2.5 text-xs text-amber-700 dark:text-amber-400">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{scanError}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCurrentStage('fork')}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft size={14} /> Ganti Metode
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStage('questions');
                      setCurrentQuestionIndex(1);
                    }}
                    className="text-xs font-bold text-[#1738D1] hover:underline cursor-pointer"
                  >
                    Atau isi manual langkah-demi-langkah →
                  </button>
                </div>
              </div>
            ) : (
              /* Scanned Review Cards */
              <div className="space-y-5 text-left">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <FileCheck size={16} className="shrink-0" />
                  <span>Berkas &quot;{uploadedFile?.name}&quot; berhasil dipindai dan dipetakan!</span>
                </div>

                <div className="space-y-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1738D1]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        Email Kontak
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          placeholder="email@domain.com"
                          value={formData.contactInfo}
                          onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                          className="w-full px-3.5 py-2 pl-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1738D1]"
                        />
                        <Mail size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        Nomor HP / WhatsApp
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="08123456789"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-3.5 py-2 pl-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1738D1]"
                        />
                        <Phone size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        Pendidikan & Jurusan
                      </label>
                      <input
                        type="text"
                        value={`${formData.educationLevel} ${formData.major}`.trim() || 'S1 Manajemen'}
                        onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1738D1]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        Target Posisi
                      </label>
                      <input
                        type="text"
                        value={formData.targetPositions.join(', ') || 'Staf Operasional'}
                        onChange={(e) => setFormData({ ...formData, targetPositions: [e.target.value] })}
                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1738D1]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Keahlian Terdeteksi ({formData.skills.length})
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {formData.skills.map((s, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-[10px] font-bold text-[#1738D1] dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Ringkasan Data Lengkap Siap Masuk ke CV */}
                  {(formData.extractedExperiences?.length > 0 ||
                    formData.extractedProjects?.length > 0 ||
                    formData.extractedCertifications?.length > 0 ||
                    formData.extractedOrganizations?.length > 0) && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Data Lengkap yang Siap Masuk ke CV Builder
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase">
                            <Briefcase size={12} className="text-[#1738D1]" />
                            <span>Pengalaman</span>
                          </div>
                          <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                            {formData.extractedExperiences?.length || 0} Riwayat Kerja
                          </p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase">
                            <Sparkles size={12} className="text-purple-600" />
                            <span>Proyek</span>
                          </div>
                          <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                            {formData.extractedProjects?.length || 0} Portofolio
                          </p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase">
                            <Award size={12} className="text-amber-600" />
                            <span>Sertifikasi</span>
                          </div>
                          <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                            {formData.extractedCertifications?.length || 0} Sertifikat
                          </p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase">
                            <BookOpen size={12} className="text-emerald-600" />
                            <span>Organisasi</span>
                          </div>
                          <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                            {formData.extractedOrganizations?.length || 0} Organisasi
                          </p>
                        </div>
                      </div>

                      {/* Brief Highlights */}
                      {formData.extractedExperiences?.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                          <p className="font-bold text-[#1738D1] dark:text-blue-400 flex items-center gap-1">
                            <CheckCircle2 size={12} />
                            Riwayat Pengalaman Terdeteksi:
                          </p>
                          <ul className="list-disc list-inside space-y-0.5 pl-1 text-[10px] text-slate-500 dark:text-slate-400">
                            {formData.extractedExperiences.slice(0, 3).map((exp: any, i: number) => (
                              <li key={i} className="truncate">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{exp.company || 'Perusahaan'}</span>
                                {exp.role ? ` — ${exp.role}` : ''}
                                {exp.period ? ` (${exp.period})` : ''}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setScanCompleted(false);
                      setUploadedFile(null);
                      setFormData((prev) => ({ ...prev, skills: [] }));
                    }}
                    className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw size={14} /> Unggah Ulang
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowMarketingOffer(true)}
                    className="flex-1 py-3.5 rounded-xl bg-[#F97316] hover:bg-[#ea580c] text-white font-bold text-xs shadow-md shadow-[#F97316]/20 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Lanjut ke Penawaran Spesial</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ============================================================ */}
        {/* STAGE 3B: STEP-BY-STEP GUIDED QUESTIONS FLOW */}
        {/* ============================================================ */}
        {currentStage === 'questions' && !showValueMoment && !showMarketingOffer && currentQuestion && (
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
              {/* Breadcrumb Chips */}
              {breadcrumbChips.length > 0 && (
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
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
                  {currentQuestion.title}
                </h1>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {currentQuestion.desc}
                </p>
              </div>

              {/* Minimal Clean Field Elements */}
              <div className="pt-2">
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
                            ? 'bg-orange-50/80 dark:bg-orange-950/60 border-[#F97316] text-orange-600 dark:text-orange-400 ring-2 ring-[#F97316]/20'
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
                            ? 'bg-orange-50/80 dark:bg-orange-950/60 border-[#F97316] text-orange-600 dark:text-orange-400 ring-2 ring-[#F97316]/20'
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
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Range Gaji Impian
                    </label>
                    <CustomSelect
                      value={formData.expectedSalary}
                      onChange={(val) => setFormData({ ...formData, expectedSalary: val })}
                      options={SALARY_OPTIONS}
                      placeholder="Pilih range gaji..."
                    />
                  </div>
                )}
              </div>

              {/* Navigation Button Bar */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={handlePrevQuestion}
                  className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft size={16} /> Kembali
                </button>

                <button
                  type="button"
                  onClick={handleNextQuestion}
                  disabled={!isCurrentQuestionValid()}
                  className="px-7 py-3 rounded-xl bg-[#F97316] hover:bg-[#ea580c] text-white font-bold text-xs shadow-md shadow-[#F97316]/20 transition flex items-center gap-2 cursor-pointer active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>{currentQuestionIndex === totalQuestions ? 'Selesai' : 'Lanjut'}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* ============================================================ */}
        {/* VALUE MOMENT SCREEN */}
        {/* ============================================================ */}
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
              className="w-full py-3.5 rounded-xl bg-[#F97316] hover:bg-[#ea580c] text-white font-bold text-xs shadow-md shadow-[#F97316]/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Lanjutkan</span>
              <ArrowRight size={16} />
            </motion.button>
          </motion.div>
        )}

        {/* ============================================================ */}
        {/* MARKETING OFFER SCREEN */}
        {/* ============================================================ */}
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
            {currentStage === 'upload_scan' && (
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setShowMarketingOffer(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <ArrowLeft size={14} /> Kembali ke Hasil Pindai
                </button>
              </div>
            )}

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
              }}
              className="space-y-2 text-center sm:text-left"
            >
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-50">
                Tingkatkan Peluang Karirmu dengan Paket Spesial
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dapatkan akses penuh seluruh fitur Employr &amp; opsi pembuatan CV langsung oleh tim spesialis:
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
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-[#1738D1] text-white shadow-sm shadow-[#1738D1]/30">
                    Rekomendasi
                  </span>
                </div>
                <div className="space-y-3 pt-1">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Paket Siap Kerja</h4>
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
                      <span>Analisis kecocokan CV instan</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                      <span>Job Application Tracker tanpa batas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                      <span>Bank Soal & Panduan Interview Kerja</span>
                    </li>
                  </ul>
                </div>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push('/pembayaran?plan=premium')}
                  className="w-full py-2.5 rounded-xl bg-[#F97316] hover:bg-[#ea580c] text-white font-bold text-xs shadow-md shadow-[#F97316]/20 transition cursor-pointer"
                >
                  Pilih Paket (Rp 99rb)
                </motion.button>
              </motion.div>

              {/* CV Profesional Plan */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.97 },
                  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 220, damping: 20 } },
                }}
                whileHover={{ y: -3 }}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">CV Profesional</h4>
                  <p className="text-xl font-extrabold text-slate-800 dark:text-slate-100">Rp 59.000</p>
                  <ul className="space-y-2 text-[11px] text-slate-600 dark:text-slate-400">
                    <li className="flex items-start gap-2">
                      <Check size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                      <span>CV disusun rapi standar industri</span>
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
                  Pilih CV Profesional (Rp 59rb)
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
                onClick={() => handleFinishAndNavigateTo('/cv')}
                disabled={isSubmitting}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition cursor-pointer flex items-center justify-center gap-1 mx-auto disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Memproses...' : 'Lanjut ke CV Builder'}</span>
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
