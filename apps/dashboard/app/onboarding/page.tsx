'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { CustomDatePicker } from '@/components/ui/CustomDatePicker';
import { Avatar } from '@/components/ui/components-primitives-avatar';
import { getLokerUrl } from '@/lib/urls';
import {
  computeCareerDiagnosis,
  CareerDiagnosisResult,
  CareerPathOption,
  DynamicRoleBlueprint,
} from '@/lib/career-direction-engine';
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
  Compass,
  TrendingUp,
  Zap,
  Layers,
  Pencil,
  Plus,
  Trash2,
  AlertTriangle,
  FileText,
  Eye,
  Layout,
  LayoutGrid,
  ExternalLink,
  X,
} from 'lucide-react';
import {
  A4PaperlikeCanvas,
  CVTemplatePreview,
  TemplateThumbnailVisual,
  cvTemplates,
  TemplateOption,
  CVData,
  mergeFragmentCertifications,
} from '@/components/CVView';

export default function CardlessClaudeStyleOnboardingPage() {
  const router = useRouter();

  // Access & Guard Check: prevent unauthorized or already-completed forced access
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  // Onboarding Step Flow: 'tos' | 'fork' | 'upload_scan' | 'questions' | 'career_direction'
  const [currentStage, setCurrentStage] = useState<'tos' | 'fork' | 'upload_scan' | 'questions' | 'career_direction'>('tos');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Upload & File Scanning State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatusText, setScanStatusText] = useState('Membaca berkas dokumen...');
  const [scanCompleted, setScanCompleted] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const importedRaw = localStorage.getItem('employr_imported_cv_data');
        if (importedRaw) {
          const parsed = JSON.parse(importedRaw);
          if (parsed.templateId) return parsed.templateId;
        }
      } catch {}
    }
    return 'ats-modern';
  });
  const [scannedMobileView, setScannedMobileView] = useState<'templates' | 'preview'>('templates');

  // Helper to split period string like "Jan 2022 - Mar 2023" into separate startDate and endDate
  const parsePeriodToDates = (periodStr?: string) => {
    if (!periodStr) return { startDate: '', endDate: '', isCurrent: false };
    const parts = periodStr.split(/\s*[-–—至to]\s*/i);
    const start = parts[0]?.trim() || '';
    const end = parts[1]?.trim() || '';
    const isCurrent = /sekarang|saat\s*ini|present|current/i.test(end || start);
    return {
      startDate: start,
      endDate: isCurrent ? 'Sekarang' : end,
      isCurrent,
    };
  };

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
    topAchievementSnippet: '',
    extractedExperiences: [] as any[],
    extractedProjects: [] as any[],
    extractedOrganizations: [] as any[],
    extractedCertifications: [] as any[],
    extractedCourses: [] as any[],
    extractedEducation: [] as any[],
  });

  // Memoized CV Data for Live A4 Paperlike Preview
  const cvPreviewData: Partial<CVData> = useMemo(() => {
    const degreeCombined = [formData.educationLevel, formData.major].filter(Boolean).join(' - ');
    return {
      id: 'scanned-cv-preview',
      title: 'CV Saya',
      updatedAt: 'Baru saja',
      atsScore: 85,
      fullName: formData.fullName || 'Nama Lengkap Anda',
      headline: formData.targetPositions?.[0] || 'Target Posisi / Profesi',
      email: formData.contactInfo && formData.contactInfo.includes('@') ? formData.contactInfo : '',
      phone: formData.phone || (!formData.contactInfo.includes('@') ? formData.contactInfo : ''),
      location: formData.location || 'Indonesia',
      summary: formData.summary || '',
      skills: formData.skills || [],
      education: (formData.extractedEducation && formData.extractedEducation.length > 0)
        ? formData.extractedEducation.map((edu: any, idx: number) => ({
            id: edu.id || `edu-preview-${idx}`,
            institution: edu.institution || formData.institutionName || 'Institusi Pendidikan',
            degree: edu.degree || degreeCombined || 'Sarjana / Mahasiswa',
            major: edu.major || formData.major || '',
            location: edu.location || formData.location || '',
            year: edu.year || (formData.graduationYear ? `Lulus ${formData.graduationYear}` : ''),
            startDate: edu.startDate || '',
            endDate: edu.endDate || formData.graduationYear || '',
            description: edu.description || '',
          }))
        : (formData.educationLevel || formData.major || formData.institutionName)
          ? [
              {
                id: 'edu-preview-1',
                institution: formData.institutionName || 'Institusi Pendidikan',
                degree: degreeCombined || 'Sarjana / Mahasiswa',
                location: formData.location || '',
                year: formData.graduationYear ? `Lulus ${formData.graduationYear}` : '',
                startDate: '',
                endDate: formData.graduationYear || '',
                description: '',
              },
            ]
          : [],
      experience: (formData.extractedExperiences || []).map((exp: any, idx: number) => ({
        id: exp.id || `exp-preview-${idx}`,
        role: exp.role || 'Posisi Pekerjaan',
        company: exp.company || 'Nama Perusahaan',
        location: '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        period: exp.period || (exp.startDate && exp.endDate ? `${exp.startDate} - ${exp.endDate}` : exp.startDate || exp.endDate || ''),
        description: exp.description || '',
      })),
      projects: (formData.extractedProjects || []).map((proj: any, idx: number) => ({
        id: proj.id || `proj-preview-${idx}`,
        name: proj.name || 'Nama Proyek',
        role: proj.role || '',
        period: proj.period || '',
        description: proj.description || '',
      })),
      certifications: mergeFragmentCertifications(formData.extractedCertifications || []).map((cert: any, idx: number) => ({
        id: cert.id || `cert-preview-${idx}`,
        name: cert.name || 'Nama Sertifikasi',
        issuer: cert.issuer || '',
        issueDate: cert.issueDate || '',
      })),
      organizations: (formData.extractedOrganizations || []).map((org: any, idx: number) => ({
        id: org.id || `org-preview-${idx}`,
        name: org.name || 'Nama Organisasi',
        role: org.role || '',
        period: org.period || '',
        description: org.description || '',
      })),
      courses: (formData.extractedCourses || []).map((crs: any, idx: number) => ({
        id: crs.id || `crs-preview-${idx}`,
        courseName: crs.courseName || crs.name || 'Nama Kursus / Pelatihan',
        institution: crs.institution || crs.provider || '',
        year: crs.year || crs.period || '',
        description: crs.description || '',
      })),
    };
  }, [formData]);

  // Career Direction State
  const [careerSubStep, setCareerSubStep] = useState<'aiming' | 'loading' | 'suggested_paths'>('aiming');
  const [loadingPhase, setLoadingPhase] = useState<'analyzing' | 'success'>('analyzing');
  const [analysisStep, setAnalysisStep] = useState<1 | 2 | 3>(1);
  const [analysisProgress, setAnalysisProgress] = useState(20);
  const diagnosisTimerRef = useRef<NodeJS.Timeout[]>([]);
  const [aimingChoice, setAimingChoice] = useState<'know_role' | 'exploring' | 'open_opportunities'>('know_role');
  const [targetRoleInput, setTargetRoleInput] = useState('Frontend Developer');
  const [selectedCareerPaths, setSelectedCareerPaths] = useState<string[]>([]);
  const [dynamicBlueprints, setDynamicBlueprints] = useState<DynamicRoleBlueprint[]>([]);
  const [semanticDiagnosis, setSemanticDiagnosis] = useState<CareerDiagnosisResult | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [activeSkillsModal, setActiveSkillsModal] = useState(false);
  const [activeStrengthModal, setActiveStrengthModal] = useState(false);

  // Cleanup diagnosis timers on unmount
  useEffect(() => {
    return () => {
      diagnosisTimerRef.current.forEach(clearTimeout);
    };
  }, []);

  const handleScannedSaveAndContinue = () => {
    if (formData.targetPositions.length > 0) {
      setTargetRoleInput(formData.targetPositions[0]);
    }
    try {
      const importedRaw = localStorage.getItem('employr_imported_cv_data');
      const existing = importedRaw ? JSON.parse(importedRaw) : {};
      const updated = {
        ...existing,
        templateId: selectedTemplateId,
        fullName: formData.fullName || existing.fullName,
        contactInfo: formData.contactInfo || existing.contactInfo,
        phone: formData.phone || existing.phone,
        educationLevel: formData.educationLevel || existing.educationLevel,
        major: formData.major || existing.major,
        targetPositions: formData.targetPositions,
        skills: formData.skills?.length ? formData.skills : existing.skills,
        summary: formData.summary || existing.summary,
        experience: formData.extractedExperiences,
        projects: formData.extractedProjects,
        certifications: formData.extractedCertifications,
        organizations: formData.extractedOrganizations,
        courses: formData.extractedCourses,
        education: (formData.extractedEducation && formData.extractedEducation.length > 0) ? formData.extractedEducation : existing.education,
      };
      localStorage.setItem('employr_imported_cv_data', JSON.stringify(updated));
      if (formData.summary) {
        userApi.updateProfile({ bio: formData.summary }).catch(() => {});
      }
    } catch {}
    setCurrentStage('career_direction');
    setCareerSubStep('aiming');
  };

  // Trigger semantic embedding diagnosis & animation before showing suggested paths
  const handleStartDiagnosis = async () => {
    if (aimingChoice === 'know_role' && !targetRoleInput.trim()) return;

    diagnosisTimerRef.current.forEach((t) => {
      clearTimeout(t);
      clearInterval(t);
    });
    diagnosisTimerRef.current = [];

    setCareerSubStep('loading');
    setLoadingPhase('analyzing');
    setAnalysisStep(1);
    setAnalysisProgress(25);
    setIsDiagnosing(true);

    // Fast-path check: Is fresh matching semantic diagnosis already available?
    const hasFreshSemantic = Boolean(
      semanticDiagnosis &&
        (aimingChoice === 'know_role'
          ? (semanticDiagnosis.primaryRole || '').toLowerCase().trim() === targetRoleInput.toLowerCase().trim()
          : semanticDiagnosis.aimingChoice === aimingChoice)
    );

    // Step 1 -> Step 2 (900ms, progress to 65%)
    const t1 = setTimeout(() => {
      setAnalysisStep(2);
      setAnalysisProgress(65);
    }, 900);
    diagnosisTimerRef.current.push(t1);

    // Step 2 -> Step 3 (1800ms, progress to 92% then micro-crawl 93% -> 96%)
    let crawlInterval: NodeJS.Timeout | null = null;
    const t2 = setTimeout(() => {
      setAnalysisStep(3);
      setAnalysisProgress(92);

      // Dynamic background micro-crawler: 92% -> 93% -> 94% -> 95% -> 96%
      crawlInterval = setInterval(() => {
        setAnalysisProgress((prev) => {
          if (prev >= 96) {
            if (crawlInterval) clearInterval(crawlInterval);
            return 96;
          }
          return prev + 1;
        });
      }, 350);
      diagnosisTimerRef.current.push(crawlInterval as any);
    }, 1800);
    diagnosisTimerRef.current.push(t2);

    // Minimum animation promise (2.2s) so the user experiences the delight stages smoothly
    const minAnimationPromise = new Promise((resolve) => {
      const tMin = setTimeout(() => resolve(true), 2200);
      diagnosisTimerRef.current.push(tMin);
    });

    // Semantic diagnosis fetch with strict 4.0s timeout and graceful local fallback
    const fetchDiagnosis = async () => {
      if (hasFreshSemantic) return;

      const expRoles = (formData.extractedExperiences || []).map((e: any) => e.role).filter(Boolean);
      const expTitle = formData.experienceTitle || expRoles.join(', ') || '';
      const expComp = formData.experienceCompany || (formData.extractedExperiences?.[0]?.company || '');
      const hasExp = formData.hasWorkExperience !== null ? formData.hasWorkExperience : (Boolean(formData.extractedExperiences?.length));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      try {
        const res = await fetch('/api/career/diagnose', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            aimingChoice,
            targetRoleInput: aimingChoice === 'know_role' ? targetRoleInput.trim() : '',
            skills: formData.skills,
            educationLevel: formData.educationLevel,
            major: formData.major,
            hasExperience: hasExp,
            experienceTitle: expTitle,
            experienceCompany: expComp,
            experiences: formData.extractedExperiences || [],
            projects: formData.extractedProjects || [],
            topAchievementSnippet: formData.topAchievementSnippet || '',
            summary: formData.summary,
            dynamicBlueprints,
          }),
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setSemanticDiagnosis(json.data);
            const paths = json.data.suggestedPaths || [];
            const primary = paths.find((p: any) => p.isPrimaryTarget) || paths[0];
            if (primary) {
              setSelectedCareerPaths([primary.role]);
            }
          }
        }
      } catch (err: any) {
        // Fallback gracefully without blocking the user
        console.warn('[Onboarding] Fallback diagnosis rule-based:', err?.message || err);
      } finally {
        clearTimeout(timeoutId);
      }
    };

    try {
      await Promise.all([minAnimationPromise, fetchDiagnosis()]);
    } catch {
      // Guaranteed safety net: never allow unhandled rejections to block progress
    } finally {
      if (crawlInterval) {
        clearInterval(crawlInterval);
      }
    }

    // Ensure selected career path is filled from fallback if still empty
    const paths = semanticDiagnosis?.suggestedPaths || currentDiagnosis?.suggestedPaths || [];
    if (selectedCareerPaths.length === 0 && paths.length > 0) {
      const primary = paths.find((p: any) => p.isPrimaryTarget) || paths[0];
      if (primary) {
        setSelectedCareerPaths([primary.role]);
      }
    }

    // Progress reaches 100% strictly when the analysis is truly ready
    setAnalysisProgress(100);

    // Brief 350ms pause so user sees 100% completion before revealing the success screen
    const tComplete = setTimeout(() => {
      setIsDiagnosing(false);
      setLoadingPhase('success');

      // Jeda 2.0s di layar "Diagnosis Berhasil" sebelum otomatis lanjut ke suggested_paths
      const tFinal = setTimeout(() => {
        setCareerSubStep('suggested_paths');
      }, 2000);
      diagnosisTimerRef.current.push(tFinal);
    }, 350);
    diagnosisTimerRef.current.push(tComplete);
  };

  // Access Guard & Profile Hydration
  useEffect(() => {
    // 1. Cek sesi login - pengguna yang belum login tidak boleh akses onboarding
    const session = getStoredSession();
    if (!session || !session.email) {
      router.replace('/login?redirect=%2Fonboarding');
      return;
    }

    // 2. Cek apakah user sudah clear (sudah pernah onboarding)
    const isLocalCompleted = localStorage.getItem('employr_onboarding_completed') === 'true';
    if (session.onboarded || isLocalCompleted) {
      router.replace('/beranda');
      return;
    }

    // Check if imported CV data already has a extracted candidate name
    let initialCvFullName = '';
    if (typeof window !== 'undefined') {
      try {
        const importedRaw = localStorage.getItem('employr_imported_cv_data');
        if (importedRaw) {
          const parsed = JSON.parse(importedRaw);
          if (parsed?.fullName && typeof parsed.fullName === 'string' && parsed.fullName.trim()) {
            initialCvFullName = parsed.fullName.trim();
          }
        }
      } catch {}
    }

    // Pre-populate data awal dari sesi / imported CV
    setFormData((prev) => ({
      ...prev,
      fullName: prev.fullName || initialCvFullName || session.name || '',
      contactInfo: prev.contactInfo || session.email || '',
      phone: prev.phone || session.phone || '',
    }));

    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      const requestedStage = sp.get('stage') as any;
      const requestedSubstep = sp.get('substep') as any;
      if (requestedStage) setCurrentStage(requestedStage);
      if (requestedSubstep) setCareerSubStep(requestedSubstep);
    }

    // 3. Verifikasi profil dari database
    userApi
      .getProfile()
      .then((profile: any) => {
        if (!profile) {
          setIsCheckingAccess(false);
          return;
        }

        // Jika database mencatat sudah onboarded (sudah clear), tidak boleh bisa diakses paksa
        if (profile.onboarded) {
          localStorage.setItem('employr_onboarding_completed', 'true');
          const currentSession = getStoredSession();
          if (currentSession) {
            setSessionCookie({ ...currentSession, onboarded: true }, 30);
          }
          router.replace('/beranda');
          return;
        }

        setFormData((prev) => ({
          ...prev,
          fullName: prev.fullName || initialCvFullName || profile.fullName || profile.name || '',
          contactInfo: prev.contactInfo || profile.email || '',
          phone: prev.phone || profile.phone || '',
          location: prev.location || profile.location || '',
          educationLevel: prev.educationLevel || profile.education || '',
          major: prev.major || profile.major || '',
          skills: prev.skills && prev.skills.length > 0 ? prev.skills : (profile.skills || []),
          targetPositions: prev.targetPositions && prev.targetPositions.length > 0 ? prev.targetPositions : (profile.targetJob ? [profile.targetJob] : []),
          expectedSalary: prev.expectedSalary || profile.expectedSalary || '',
          summary: prev.summary || profile.bio || '',
        }));

        setIsCheckingAccess(false);
      })
      .catch(() => {
        setIsCheckingAccess(false);
      });
  }, [router]);

  // Fetch dynamic blueprints learned from community input
  useEffect(() => {
    fetch('/api/career/blueprints')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setDynamicBlueprints(json.data);
        }
      })
      .catch(() => {});
  }, []);

  // Memoized Real-Time Career Diagnosis (Rule-based baseline)
  const currentDiagnosis = useMemo(() => {
    const expRoles = (formData.extractedExperiences || []).map((e: any) => e.role).filter(Boolean);
    const expTitle = formData.experienceTitle || expRoles.join(', ') || '';
    const expComp = formData.experienceCompany || (formData.extractedExperiences?.[0]?.company || '');
    const hasExp = formData.hasWorkExperience !== null ? formData.hasWorkExperience : (Boolean(formData.extractedExperiences?.length));

    return computeCareerDiagnosis({
      aimingChoice,
      targetRoleInput,
      userSkills: formData.skills,
      educationLevel: formData.educationLevel,
      major: formData.major,
      hasExperience: hasExp,
      experienceTitle: expTitle,
      experienceCompany: expComp,
      experiences: formData.extractedExperiences || [],
      projects: formData.extractedProjects || [],
      topAchievementSnippet: formData.topAchievementSnippet || '',
      dynamicBlueprints,
    });
  }, [
    aimingChoice,
    targetRoleInput,
    formData.skills,
    formData.educationLevel,
    formData.major,
    formData.hasWorkExperience,
    formData.experienceTitle,
    formData.experienceCompany,
    formData.extractedExperiences,
    formData.extractedProjects,
    formData.topAchievementSnippet,
    dynamicBlueprints,
  ]);

  // Active diagnosis: prioritizes high-fidelity semantic embedding diagnosis matching current target & aimingChoice
  const displayDiagnosis = useMemo(() => {
    if (semanticDiagnosis) {
      if (aimingChoice === 'know_role') {
        if (targetRoleInput.trim()) {
          const semNorm = (semanticDiagnosis.primaryRole || '').toLowerCase().trim();
          const targetNorm = targetRoleInput.toLowerCase().trim();
          if (semNorm === targetNorm || semNorm.includes(targetNorm) || targetNorm.includes(semNorm)) {
            return semanticDiagnosis;
          }
        }
      } else {
        if (semanticDiagnosis.aimingChoice === aimingChoice) {
          return semanticDiagnosis;
        }
      }
    }
    return currentDiagnosis;
  }, [semanticDiagnosis, currentDiagnosis, targetRoleInput, aimingChoice]);

  // Debounced semantic diagnosis update when targetRoleInput or aimingChoice is modified in career_direction stage
  useEffect(() => {
    if (currentStage !== 'career_direction') return;
    if (aimingChoice === 'know_role' && !targetRoleInput.trim()) return;

    if (aimingChoice === 'know_role') {
      const semNorm = (semanticDiagnosis?.primaryRole || '').toLowerCase().trim();
      const targetNorm = targetRoleInput.toLowerCase().trim();
      if (semanticDiagnosis && (semNorm === targetNorm || semNorm.includes(targetNorm) || targetNorm.includes(semNorm))) {
        return;
      }
    } else {
      if (semanticDiagnosis && semanticDiagnosis.aimingChoice === aimingChoice) {
        return;
      }
    }

    const timer = setTimeout(() => {
      const expRoles = (formData.extractedExperiences || []).map((e: any) => e.role).filter(Boolean);
      const expTitle = formData.experienceTitle || expRoles.join(', ') || '';
      const expComp = formData.experienceCompany || (formData.extractedExperiences?.[0]?.company || '');
      const hasExp = formData.hasWorkExperience !== null ? formData.hasWorkExperience : (Boolean(formData.extractedExperiences?.length));

      fetch('/api/career/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aimingChoice,
          targetRoleInput: aimingChoice === 'know_role' ? targetRoleInput.trim() : '',
          skills: formData.skills,
          educationLevel: formData.educationLevel,
          major: formData.major,
          hasExperience: hasExp,
          experienceTitle: expTitle,
          experienceCompany: expComp,
          experiences: formData.extractedExperiences || [],
          projects: formData.extractedProjects || [],
          topAchievementSnippet: formData.topAchievementSnippet || '',
          summary: formData.summary,
          dynamicBlueprints,
        }),
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setSemanticDiagnosis(json.data);
          }
        })
        .catch(() => {});
    }, 500);

    return () => clearTimeout(timer);
  }, [currentStage, targetRoleInput, aimingChoice, formData, dynamicBlueprints, semanticDiagnosis?.primaryRole, semanticDiagnosis?.aimingChoice]);

  // Sync initial target role & preselect suggested paths when entering career_direction
  useEffect(() => {
    if (currentStage === 'career_direction') {
      if (selectedCareerPaths.length === 0 && displayDiagnosis.suggestedPaths.length > 0) {
        const primary = displayDiagnosis.suggestedPaths.find((p) => p.isPrimaryTarget) || displayDiagnosis.suggestedPaths[0];
        if (primary) {
          setSelectedCareerPaths([primary.role]);
        }
      }
    }
  }, [currentStage, displayDiagnosis, selectedCareerPaths.length]);

  // Handle Enter key globally for next step in questions mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.isComposing) return;

      if (currentStage === 'questions') {
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
  }, [currentStage, currentQuestionIndex, formData]);

  // Constants
  const EDUCATION_LEVELS = ['SMA', 'SMK', 'D3', 'D4', 'S1', 'S2', 'S3', 'Lainnya'];
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
      if (formData.targetPositions.length > 0) {
        setTargetRoleInput(formData.targetPositions[0]);
      }
      setCurrentStage('career_direction');
      setCareerSubStep('aiming');
    }
  };

  const handlePrevQuestion = () => {
    setDirection(-1);
    if (currentStage === 'career_direction') {
      if (careerSubStep === 'suggested_paths') {
        setCareerSubStep('aiming');
        return;
      }
      if (careerSubStep === 'loading') {
        diagnosisTimerRef.current.forEach(clearTimeout);
        setCareerSubStep('aiming');
        return;
      }
      if (formData.hasCvAlready) {
        setCurrentStage('upload_scan');
      } else {
        setCurrentStage('questions');
        setCurrentQuestionIndex(totalQuestions);
      }
    } else if (currentQuestionIndex > 1) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else {
      setCurrentStage('fork');
    }
  };

  // Drag and Drop Upload Event Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUploadAndScan(file);
    }
  };

  // Helper parser for CV files (.json, .txt, .pdf, .docx)
  const handleFileUploadAndScan = async (file: File) => {
    if (!file) return;

    // Validate file extension
    const allowedExtensions = ['.pdf', '.docx', '.doc', '.txt', '.json'];
    const fileName = file.name.toLowerCase();
    const isAllowed = allowedExtensions.some((ext) => fileName.endsWith(ext));
    if (!isAllowed) {
      setScanError('Format berkas tidak didukung. Silakan unggah berkas dengan format PDF, DOCX, atau JSON.');
      setScanCompleted(false);
      setUploadedFile(null);
      return;
    }

    // Validate file size (Maksimal 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setScanError('Ukuran berkas terlalu besar. Maksimal ukuran berkas adalah 10MB.');
      setScanCompleted(false);
      setUploadedFile(null);
      return;
    }

    setUploadedFile(file);
    setIsScanning(true);
    setScanProgress(15);
    setScanStatusText('Membaca berkas dokumen...');
    setScanError(null);

    // Dynamic progress ticker with active micro-progress during server extraction
    let currentProgress = 15;
    const progressInterval = setInterval(() => {
      if (currentProgress < 88) {
        currentProgress += Math.floor(Math.random() * 5) + 3;
        if (currentProgress >= 70) {
          setScanStatusText('Menganalisis keahlian & riwayat pengalaman...');
        } else if (currentProgress >= 40) {
          setScanStatusText('Mengekstrak teks & struktur CV...');
        }
      } else if (currentProgress < 97) {
        // Micro-progress dinamis di fase akhir: 89% -> 90% -> 91% -> 92% -> 93% -> 94% -> 95% -> 96% -> 97%
        currentProgress += 1;
        setScanStatusText('Menyusun data terstruktur profil...');
      }
      setScanProgress(currentProgress);
    }, 320);

    try {
      const bodyData = new FormData();
      bodyData.append('file', file);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 85000);

      const res = await fetch('/api/cv/parse', {
        method: 'POST',
        body: bodyData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const result = await res.json();
      clearInterval(progressInterval);

      if (!res.ok || !result.success) {
        setScanError(result.error || 'Berkas yang kamu unggah tampaknya bukan dokumen CV atau Resume. Pastikan berkas memuat informasi pendidikan, pengalaman, atau keahlian kamu.');
        setScanCompleted(false);
        setUploadedFile(null);
        return;
      }

      const data = result.data || {};
      const extractedFullName =
        data.fullName && typeof data.fullName === 'string' && data.fullName.trim().length > 0
          ? data.fullName.trim()
          : '';

      if (typeof window !== 'undefined') {
        const storedImport = {
          ...data,
          fullName: extractedFullName || data.fullName,
        };
        localStorage.setItem('employr_imported_cv_data', JSON.stringify(storedImport));
      }

      // Normalize extracted educationLevel & major
      let extractedEduLevel = (data.educationLevel || '').trim();
      let extractedMajor = (data.major || '').trim();

      const foundLevel = EDUCATION_LEVELS.find((l) => l.toLowerCase() === extractedEduLevel.toLowerCase());
      if (foundLevel) extractedEduLevel = foundLevel;

      if (!extractedEduLevel && extractedMajor) {
        const match = extractedMajor.match(/^(SMA|SMK|D3|D4|D1|D2|S1|S2|S3)\b[\s:-]*(.*)$/i);
        if (match) {
          const detected = EDUCATION_LEVELS.find((l) => l.toLowerCase() === match[1].toLowerCase()) || match[1].toUpperCase();
          extractedEduLevel = detected;
          extractedMajor = match[2].trim();
        }
      } else if (extractedEduLevel && extractedMajor.toLowerCase().startsWith(extractedEduLevel.toLowerCase())) {
        extractedMajor = extractedMajor.slice(extractedEduLevel.length).replace(/^[\s:-]+/, '').trim();
      }

      const parsedExperiences = (data.experience || []).map((exp: any) => {
        const dates = parsePeriodToDates(exp.period || '');
        return {
          ...exp,
          startDate: exp.startDate || dates.startDate,
          endDate: exp.endDate || dates.endDate,
          isCurrent: exp.isCurrent ?? dates.isCurrent,
        };
      });

      setFormData((prev) => ({
        ...prev,
        hasCvAlready: true,
        fullName: extractedFullName || prev.fullName,
        contactInfo: data.contactInfo || prev.contactInfo,
        phone: data.phone || prev.phone,
        location: data.location || prev.location,
        educationLevel: extractedEduLevel || prev.educationLevel,
        institutionName: data.institutionName || prev.institutionName,
        major: extractedMajor || prev.major,
        targetPositions: data.targetPositions?.length ? data.targetPositions : prev.targetPositions,
        hasWorkExperience: data.hasWorkExperience !== null ? data.hasWorkExperience : prev.hasWorkExperience,
        experienceTitle: data.experienceTitle || prev.experienceTitle,
        experienceCompany: data.experienceCompany || prev.experienceCompany,
        skills: data.skills?.length ? data.skills : [],
        summary: data.summary || prev.summary,
        topAchievementSnippet: data.topAchievementSnippet || '',
        extractedExperiences: parsedExperiences,
        extractedProjects: data.projects || [],
        extractedOrganizations: data.organizations || [],
        extractedCertifications: mergeFragmentCertifications(data.certifications || []),
        extractedCourses: data.courses || [],
        extractedEducation: data.education || [],
      }));

      // Segera simpan ringkasan, nama CV, dan data kontak ke profil pengguna secara instan
      if (data.summary || extractedFullName) {
        userApi
          .updateProfile({
            bio: data.summary || undefined,
            fullName: extractedFullName || undefined,
            phone: data.phone || undefined,
            location: data.location || undefined,
          })
          .catch(() => {});
      }

      setScanProgress(100);
      setScanStatusText('Ekstraksi berhasil!');
      await new Promise((resolve) => setTimeout(resolve, 350));
      setScannedMobileView('templates');
      setScanCompleted(true);
    } catch (err: any) {
      clearInterval(progressInterval);
      if (err.name === 'AbortError') {
        setScanError('Waktu pemindaian melebihi batas waktu (timeout). Silakan periksa koneksi atau coba unggah ulang berkas.');
      } else {
        setScanError(err.message || 'Terjadi kendala saat membaca berkas. Silakan tinjau dan sesuaikan data di bawah.');
      }
      setScanCompleted(false);
      setUploadedFile(null);
    } finally {
      clearInterval(progressInterval);
      setIsScanning(false);
    }
  };

  // Full-page Drag and Drop Upload across any part of the page
  useEffect(() => {
    const handleWindowDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current += 1;
      if (e.dataTransfer?.types?.includes('Files')) {
        setIsDragging(true);
      }
    };

    const handleWindowDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
    };

    const handleWindowDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current -= 1;
      if (dragCounter.current <= 0) {
        dragCounter.current = 0;
        setIsDragging(false);
      }
    };

    const handleWindowDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current = 0;
      setIsDragging(false);

      if (isScanning) return;

      const file = e.dataTransfer?.files?.[0];
      if (file) {
        if (currentStage !== 'upload_scan') {
          setCurrentStage('upload_scan');
        }
        handleFileUploadAndScan(file);
      }
    };

    window.addEventListener('dragenter', handleWindowDragEnter);
    window.addEventListener('dragover', handleWindowDragOver);
    window.addEventListener('dragleave', handleWindowDragLeave);
    window.addEventListener('drop', handleWindowDrop);

    return () => {
      window.removeEventListener('dragenter', handleWindowDragEnter);
      window.removeEventListener('dragover', handleWindowDragOver);
      window.removeEventListener('dragleave', handleWindowDragLeave);
      window.removeEventListener('drop', handleWindowDrop);
    };
  }, [currentStage, isScanning]);

  const handleFinishAndNavigateTo = async (
    destination: '/cv' | '/beranda' = '/beranda',
    overrideRoles?: string[],
    overrideDiagnosis?: CareerDiagnosisResult
  ) => {
    setIsSubmitting(true);
    const resolvedRoles =
      overrideRoles && overrideRoles.length > 0
        ? overrideRoles
        : formData.targetPositions.length > 0
        ? formData.targetPositions
        : [targetRoleInput || 'Product Manager'];
    const activeDiagnosis = overrideDiagnosis || displayDiagnosis;

    // Catat data peran dan keahlian ke sistem pembelajaran hybrid mandiri
    const targetToLearn = resolvedRoles[0] || targetRoleInput || 'Product Manager';
    fetch('/api/career/learn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role_name: targetToLearn,
        skills: formData.skills,
        education_level: formData.educationLevel,
        major: formData.major,
      }),
    }).catch(() => {});

    const resolvedPhone = formData.phone || (formData.contactInfo && !formData.contactInfo.includes('@') ? formData.contactInfo : '');
    const resolvedEmail = formData.contactInfo && formData.contactInfo.includes('@') ? formData.contactInfo : '';

    try {
      await userApi.updateProfile({
        onboarded: true,
        fullName: formData.fullName || 'Pengguna Employr',
        phone: resolvedPhone,
        location: formData.location,
        education: formData.educationLevel || formData.institutionName,
        major: formData.major,
        skills: formData.skills,
        lastCompany: formData.experienceCompany,
        targetJob: resolvedRoles.join(', '),
        targetPosition: resolvedRoles.join(', '),
        targetIndustry: formData.targetIndustries.join(', '),
        headline: `${resolvedRoles.join(', ')} | ${formData.educationLevel || 'Fresh Graduate'}`,
        experienceYears: formData.hasWorkExperience ? (formData.experienceTitle || 'Berpengalaman') : 'Fresh Graduate (0-1 Tahun)',
        expectedSalary: formData.expectedSalary,
        bio: formData.summary,
        workPreference: formData.willingToRelocate ? 'Bisa Relokasi' : '',
        availability: formData.availabilityToStart,
      });
    } catch {
      // Graceful fallback
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.setItem('employr_onboarding_completed', 'true');

        // Persist career direction diagnosis
        localStorage.setItem('employr_career_diagnosis', JSON.stringify(activeDiagnosis));

        // Build enriched session with onboarding data
        const existingSession = getStoredSession();
        const enrichedSession = {
          id: existingSession?.id || '',
          name: formData.fullName || existingSession?.name || 'Pengguna Employr',
          email: existingSession?.email || resolvedEmail || '',
          role: existingSession?.role || '',
          provider: existingSession?.provider || '',
          phone: resolvedPhone || existingSession?.phone || '',
          onboarded: true,
        };

        // Update auth session cookie & localStorage
        setSessionCookie(enrichedSession, 30);

        // Bersihkan seluruh cache sementara onboarding agar tidak tertinggal di browser
        localStorage.removeItem('employr_imported_cv_data');
        localStorage.removeItem('employr_onboarding_profile');
        localStorage.removeItem('cuti_imported_cv_data');
        localStorage.removeItem('cuti_onboarding_profile');
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

  // Dynamic Content Width per Stage to prevent narrow cramming
  const stageMaxWidth = useMemo(() => {
    switch (currentStage) {
      case 'upload_scan':
        return scanCompleted ? 'max-w-[1440px]' : 'max-w-2xl sm:max-w-3xl';
      case 'career_direction':
        return careerSubStep === 'loading'
          ? 'max-w-xl'
          : careerSubStep === 'suggested_paths'
          ? 'max-w-7xl px-4 sm:px-6 lg:px-8'
          : 'max-w-3xl lg:max-w-4xl';
      case 'fork':
        return 'max-w-2xl sm:max-w-3xl';
      case 'questions':
        return 'max-w-xl sm:max-w-2xl';
      case 'tos':
      default:
        return 'max-w-xl';
    }
  }, [currentStage, scanCompleted, careerSubStep]);

  if (isCheckingAccess) {
    return (
      <div className="min-h-[100dvh] w-full flex-1 flex items-center justify-center bg-white dark:bg-slate-950 font-sans text-xs text-slate-500 dark:text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-slate-300 dark:border-slate-700 border-t-[#1738D1] rounded-full animate-spin" />
          <span>Memeriksa status orientasi...</span>
        </div>
      </div>
    );
  }

  // Dedicated Full-Screen Onboarding Review: Template Selection + Auto-Fit A4 Paperlike Preview
  if (currentStage === 'upload_scan' && scanCompleted) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Minimalist Top Progress Bar */}
        <div className="fixed top-0 left-0 right-0 h-[2px] bg-slate-100 dark:bg-slate-900 z-50 overflow-hidden">
          <motion.div
            className="h-full bg-cobalt-500"
            initial={{ width: '50%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          />
        </div>

        {/* Top Header: Employr Brand Bar */}
        <header className="shrink-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xs border-b border-slate-100 dark:border-slate-800/80 px-6 py-3.5 sm:px-8 flex items-center justify-between z-30">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.webp"
              alt="Employr"
              width={120}
              height={28}
              unoptimized
              priority
              className="h-6 w-auto object-contain dark:brightness-0 dark:invert"
            />
          </div>
          <div className="text-caption font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Langkah 2 dari 2
          </div>
        </header>

        {/* Sub-Header: Title, Description, and File Status Pill */}
        <div className="shrink-0 px-6 py-3 sm:px-8 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 z-20">
          <div className="space-y-0.5">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
              Pilih Desain Template ATS
            </h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Pilih desain yang paling cocok untuk profilmu. Data otomatis diselaraskan pada pratinjau lembar A4.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Mobile View Toggle (< lg) */}
            <div className="flex lg:hidden items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setScannedMobileView('templates')}
                className={`px-2.5 py-1 rounded-md text-caption font-bold transition cursor-pointer ${
                  scannedMobileView === 'templates'
                    ? 'bg-white dark:bg-slate-700 text-cobalt-500 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                Template ({cvTemplates.filter((t) => !t.hidden).length})
              </button>
              <button
                type="button"
                onClick={() => setScannedMobileView('preview')}
                className={`px-2.5 py-1 rounded-md text-caption font-bold transition cursor-pointer ${
                  scannedMobileView === 'preview'
                    ? 'bg-white dark:bg-slate-700 text-cobalt-500 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                Pratinjau A4
              </button>
            </div>

            {/* Extracted File Badge */}
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 max-w-xs truncate shadow-2xs">
              <FileCheck size={14} className="shrink-0 text-emerald-700 dark:text-emerald-400" />
              <span className="truncate text-caption sm:text-xs">
                {uploadedFile?.name || 'Berkas CV'}
              </span>
            </div>
          </div>
        </div>

        {/* Middle Split: Left Template Grid (3 cols) + Right A4 Paperlike Preview */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
          {/* Left: Template List (3 Grid Columns) */}
          <div
            className={`w-full lg:w-[580px] xl:w-[640px] 2xl:w-[700px] shrink-0 border-r border-slate-200 dark:border-slate-800 overflow-y-auto bg-slate-50 dark:bg-slate-950/60 p-3 sm:p-4 ${
              scannedMobileView === 'templates' ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
              {cvTemplates
                .filter((tpl) => !tpl.hidden)
                .map((tpl) => {
                  const isSelected = selectedTemplateId === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      id={`template-card-${tpl.id}`}
                      onClick={() => setSelectedTemplateId(tpl.id)}
                      className={`p-2 sm:p-2.5 rounded-[10px] border transition-all cursor-pointer flex flex-col justify-between group text-left ${
                        isSelected
                          ? 'bg-blue-50/90 dark:bg-blue-950/70 border-cobalt-500 ring-2 ring-cobalt-500/25 shadow-md'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-navy-700 hover:shadow-xs'
                      }`}
                    >
                      {/* A4 Mini Thumbnail with Exact Aspect Ratio */}
                      <div className="w-full aspect-[210/297] rounded-[7px] border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 shadow-2xs bg-white relative mb-2 group-hover:scale-[1.01] transition-transform">
                        <TemplateThumbnailVisual templateId={tpl.id} customData={cvPreviewData} docSectionSpacing={18} />
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-cobalt-500 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      {/* Badge & Name */}
                      <div className="space-y-1 min-w-0 w-full">
                        <span className="px-1.5 py-0.5 rounded-[5px] text-[8px] sm:text-caption font-extrabold uppercase bg-blue-100/90 text-navy-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-navy-800 inline-block truncate max-w-full">
                          {tpl.badge}
                        </span>
                        <h4
                          className="font-extrabold text-caption sm:text-xs text-slate-900 dark:text-white leading-tight truncate whitespace-nowrap"
                          title={tpl.name}
                        >
                          {tpl.name}
                        </h4>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Right: A4 Paperlike Preview (Responsive auto-fit scale so no scroll is needed, multi-page horizontal side-by-side) */}
          <div
            className={`flex-1 h-full overflow-hidden bg-slate-100 dark:bg-slate-900/80 relative select-none ${
              scannedMobileView === 'preview' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            <A4PaperlikeCanvas
              templateId={selectedTemplateId}
              customData={cvPreviewData}
              layoutOrientation="horizontal"
              docMarginTop={1.27}
              docMarginBottom={1.27}
              docMarginLeft={1.27}
              docMarginRight={1.27}
              docSectionSpacing={18}
              showPageNumbers={true}
            />
          </div>
        </div>

        {/* Bottom Sticky Action Bar */}
        <footer className="shrink-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-30 shadow-lg px-6 py-3 sm:px-8">
          <div className="relative flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setScanCompleted(false);
                setUploadedFile(null);
                setFormData((prev) => ({ ...prev, skills: [] }));
              }}
              className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
            >
              <RotateCcw size={14} />
              <span>Unggah Berkas Lain</span>
            </button>

            <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 hidden sm:flex items-center gap-1.5 text-caption font-medium text-slate-500 dark:text-slate-400 select-none">
              <Lock size={12} className="text-slate-500 dark:text-slate-400 shrink-0" />
              <span>Data kamu aman bersama Employr</span>
            </div>

            <button
              type="button"
              onClick={handleScannedSaveAndContinue}
              className="h-10 px-4 rounded-xl bg-[#F97316] hover:bg-[#ea580c] active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-[#F97316]/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Gunakan Template Ini & Lanjut</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </footer>
      </div>
    );
  }

  // Dedicated Full-Screen Career Direction Studio: 1 Frame Fit Edge-to-Edge, No Page Scroll
  if (currentStage === 'career_direction' && careerSubStep === 'suggested_paths') {
    return (
      <div className="fixed inset-0 z-50 bg-slate-50/70 dark:bg-slate-950 flex flex-col overflow-hidden animate-in fade-in duration-200 font-sans">
        {/* Minimalist Top Progress Bar */}
        <div className="fixed top-0 left-0 right-0 h-[2px] bg-slate-100 dark:bg-slate-900 z-50 overflow-hidden">
          <motion.div
            className="h-full bg-cobalt-500"
            initial={{ width: '85%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          />
        </div>

        {/* Top Header: Employr Brand Bar */}
        <header className="shrink-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xs border-b border-slate-100 dark:border-slate-800/80 px-6 py-3 sm:px-8 flex items-center justify-between z-30">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.webp"
              alt="Employr"
              width={120}
              height={28}
              unoptimized
              priority
              className="h-6 w-auto object-contain dark:brightness-0 dark:invert"
            />
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-cobalt-600 dark:text-blue-300 text-[10px] font-extrabold uppercase tracking-wider border border-blue-200 dark:border-blue-800">
              Career Studio
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-caption font-extrabold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 shadow-2xs">
              <CheckCircle2 size={12} />
              <span>Diagnosis Selesai</span>
            </span>
            <span className="text-caption font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:inline">
              {selectedCareerPaths.length} Peran Dipilih
            </span>
          </div>
        </header>

        {/* Middle Studio Workspace: Full Frame Edge-to-Edge Grid (No Page Scroll) */}
        <div className="flex-1 min-h-0 overflow-hidden px-4 py-3 sm:px-6 sm:py-4 lg:px-8 xl:px-10">
          <div className="w-full h-full grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-6 overflow-hidden">
            
            {/* LEFT COLUMN: Executive Diagnosis & 4 Bento Telemetry Cards (~42% / col-span-5) */}
            <div className="lg:col-span-5 flex flex-col justify-between h-full overflow-hidden space-y-3">
              
              {/* Diagnosis Overview Banner */}
              <div className="p-4 sm:p-4.5 rounded-2xl bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-white dark:from-slate-900 dark:via-blue-950/40 dark:to-slate-900 border border-blue-200/80 dark:border-blue-900/50 space-y-1.5 shadow-xs shrink-0">
                <div className="flex items-center gap-1.5 text-cobalt-600 dark:text-blue-400 text-caption font-extrabold uppercase tracking-wider">
                  <CheckCircle2 size={13} className="text-emerald-700 dark:text-emerald-400 shrink-0" />
                  <span>
                    Hasil Diagnosis Arah Karier
                    {displayDiagnosis.isSemantic && (
                      <span className="ml-1.5 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/80 text-cobalt-600 dark:text-blue-300 text-[10px] tracking-normal font-bold">
                        Pemetaan Akurat
                      </span>
                    )}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
                  Rekomendasi Jalur Karier Paling Cocok
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Berdasarkan latar belakang, keahlian, dan target peranmu, berikut analisis kecocokan serta rekomendasi langkah karier terbaik:
                </p>
              </div>

              {/* Contextual Mentor Narrative Card */}
              {displayDiagnosis.mentorNarrative && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 space-y-1 shadow-xs shrink-0">
                  <div className="flex items-center gap-1.5 text-cobalt-600 dark:text-blue-400 text-caption font-extrabold uppercase tracking-wider">
                    <Sparkles size={13} className="text-amber-700 shrink-0" />
                    <span>{displayDiagnosis.mentorNarrative.headline}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-relaxed line-clamp-3">
                    {displayDiagnosis.mentorNarrative.fullNarrative}
                  </p>
                </div>
              )}

              {/* 4 Instant Diagnostic Bento Cards (2x2 Compact Grid) */}
              {(() => {
                const getScoreTier = (score: number, isSwitch = false) => {
                  if (score >= 70) {
                    return {
                      colorClass: 'text-emerald-700 dark:text-emerald-400',
                      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800',
                      dotClass: 'bg-emerald-500',
                      label: 'Sangat Cocok',
                    };
                  }
                  if (score >= 50) {
                    return {
                      colorClass: 'text-cobalt-700 dark:text-blue-400',
                      badgeClass: 'bg-blue-50 text-cobalt-700 border-blue-200 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800',
                      dotClass: 'bg-cobalt-500',
                      label: isSwitch ? 'Transisi Menjanjikan' : 'Potensial',
                    };
                  }
                  return {
                    colorClass: 'text-slate-600 dark:text-slate-400',
                    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700',
                    dotClass: 'bg-slate-400',
                    label: isSwitch ? 'Transisi Karier' : 'Pondasi Awal',
                  };
                };

                const targetScore = displayDiagnosis.primaryFitScore;
                const isTargetSwitch = Boolean(displayDiagnosis.isCareerSwitch);
                const targetTier = getScoreTier(targetScore, isTargetSwitch);

                const transScore = displayDiagnosis.realisticTransition.fitScore;
                const transTier = getScoreTier(transScore, false);
                const activeAiming = displayDiagnosis.aimingChoice || aimingChoice;

                return (
                  <div className="grid grid-cols-2 gap-2.5 flex-1 min-h-0 overflow-hidden">
                    {/* 1. Fit Score Insight (Big Number) */}
                    <div className="p-3 sm:p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          <Target size={12} className={targetTier.colorClass} />
                          <span>
                            {activeAiming === 'open_opportunities'
                              ? 'Kesiapan Screening'
                              : activeAiming === 'exploring'
                              ? 'Kecocokan Terkuat'
                              : 'Kecocokan'}
                          </span>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold border ${targetTier.badgeClass}`}>
                          {targetTier.label}
                        </span>
                      </div>
                      <div className="my-1">
                        <div className={`text-2xl font-black tracking-tight ${targetTier.colorClass}`}>
                          {targetScore}%
                        </div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate" title={displayDiagnosis.primaryRole}>
                          {displayDiagnosis.primaryRole}
                        </div>
                      </div>
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-tight">
                        {activeAiming === 'open_opportunities'
                          ? 'Modal kualifikasi paling siap untuk screening'
                          : activeAiming === 'exploring'
                          ? 'Posisi dengan keselarasan profil paling optimal'
                          : targetScore >= 75
                          ? 'Peluang lolos screening tinggi'
                          : isTargetSwitch
                          ? 'Potensi transisi dengan melengkapi skill kunci'
                          : 'Lengkapi skill kunci untuk perbesar peluang'}
                      </p>
                    </div>

                    {/* 2. Top Strength */}
                    <div className="p-3 sm:p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 size={12} />
                          <span>Kekuatan Utama</span>
                        </div>
                        {displayDiagnosis.matchedSkillsList && displayDiagnosis.matchedSkillsList.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setActiveStrengthModal(true)}
                            className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 hover:underline cursor-pointer"
                          >
                            Detail ({displayDiagnosis.matchedSkillsList.length})
                          </button>
                        )}
                      </div>
                      <div className="my-1">
                        <p className="text-xs sm:text-sm font-extrabold text-emerald-800 dark:text-emerald-300 leading-snug break-words" title={displayDiagnosis.topStrength}>
                          {displayDiagnosis.topStrength}
                        </p>
                      </div>
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-tight">
                        Modal kuat yang siap ditonjolkan
                      </p>
                    </div>

                    {/* 3. Skill Development Gap */}
                    <div className="p-3 sm:p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                          <TrendingUp size={12} />
                          <span>Skill Prioritas</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveSkillsModal(true)}
                          className="text-[10px] font-bold text-amber-700 hover:text-amber-800 dark:text-amber-400 hover:underline cursor-pointer"
                        >
                          Lihat semua ({displayDiagnosis.gapSkillsList?.length || '4+'})
                        </button>
                      </div>
                      <div className="my-1">
                        <p className="text-xs sm:text-sm font-extrabold text-amber-800 dark:text-amber-300 leading-snug break-words">
                          {displayDiagnosis.topGap}
                        </p>
                      </div>
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-tight">
                        Fokus untuk menutup gap kompetensi
                      </p>
                    </div>

                    {/* 4. Realistic Transition Path (Big Number) */}
                    <div className="p-3 sm:p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          <Compass size={12} className={transTier.colorClass} />
                          <span>
                            {activeAiming === 'open_opportunities'
                              ? 'Pilihan Siap Lamar ke-2'
                              : activeAiming === 'exploring'
                              ? 'Opsi Alternatif Terdekat'
                              : 'Jalur Alternatif Terdekat'}
                          </span>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold border ${transTier.badgeClass}`}>
                          {transTier.label}
                        </span>
                      </div>
                      <div className="my-1">
                        <div className={`text-2xl font-black tracking-tight ${transTier.colorClass}`}>
                          {transScore}%
                        </div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate" title={displayDiagnosis.realisticTransition.role}>
                          {displayDiagnosis.realisticTransition.role}
                        </div>
                      </div>
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-tight">
                        {activeAiming === 'open_opportunities'
                          ? 'Peluang posisi siap lamar berikutnya'
                          : activeAiming === 'exploring'
                          ? 'Alternatif cabang karier dengan modal terdekat'
                          : 'Peluang screening & transisi tertinggi'}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* RIGHT COLUMN: Interactive Path Selector (2-Zone: Target Incaran & Peluang Terdekat) (~58% / col-span-7) */}
            <div className="lg:col-span-7 flex flex-col h-full overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-4 sm:p-5">
              {/* Header Pilihan Peran */}
              {(() => {
                const activeAiming = displayDiagnosis.aimingChoice || aimingChoice;
                return (
                  <div className="shrink-0 flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                        Pilihan Target Peran (Career Paths)
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {activeAiming === 'know_role'
                          ? 'Pilih 1 atau beberapa peran untuk disesuaikan pada template CV dan pelacakan lamaran:'
                          : activeAiming === 'exploring'
                          ? 'Pilih 1 atau beberapa peran yang ingin kamu jajal untuk template CV dan pelacakan lamaran:'
                          : 'Pilih posisi dengan peluang lolos screening tercepat untuk fokus lamaranmu:'}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-caption font-extrabold bg-blue-50 dark:bg-blue-950/80 text-cobalt-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0">
                      {selectedCareerPaths.length} peran dipilih
                    </span>
                  </div>
                );
              })()}

              {/* Scrollable Card List within 1 Frame */}
              <div className="flex-1 overflow-y-auto space-y-3.5 pt-3 pr-1.5 custom-scrollbar">
                {/* Unknown Role Banner */}
                {displayDiagnosis.isUnknownRole && (
                  <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5">
                    <AlertTriangle size={16} className="text-amber-700 shrink-0 mt-0.5 dark:text-amber-400" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                        Posisi &quot;{displayDiagnosis.primaryRole}&quot; belum tersedia di database analisis kami.
                      </p>
                      <p className="text-caption text-amber-700/80 dark:text-amber-400/80 leading-relaxed">
                        {displayDiagnosis.unknownRoleMessage}
                      </p>
                    </div>
                  </div>
                )}

                {(() => {
                  const activeAiming = displayDiagnosis.aimingChoice || aimingChoice;
                  const getRoleTier = (score: number, isSwitch = false) => {
                    if (score >= 70) {
                      return {
                        badgeClass: 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
                        dotClass: 'bg-emerald-500',
                        label: 'Sangat Cocok',
                      };
                    }
                    if (score >= 50) {
                      return {
                        badgeClass: 'bg-blue-50 dark:bg-blue-950/80 text-cobalt-600 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                        dotClass: 'bg-cobalt-500',
                        label: isSwitch ? 'Jalur Transisi' : 'Potensial',
                      };
                    }
                    return {
                      badgeClass: 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
                      dotClass: 'bg-slate-400',
                      label: isSwitch ? 'Eksplorasi Baru' : 'Pondasi Awal',
                    };
                  };

                  const targetPath = displayDiagnosis.suggestedPaths.find((p) => p.isPrimaryTarget) || displayDiagnosis.suggestedPaths[0];
                  const alternativePaths = displayDiagnosis.suggestedPaths
                    .filter((p) => p.role !== targetPath?.role)
                    .sort((a, b) => b.fitScore - a.fitScore);

                  return (
                    <>
                      {/* ZONE 1: Target Incaran / Rekomendasi Utama / Peluang Tercepat */}
                      {targetPath && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between px-0.5">
                            <span className="text-[11px] font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                              <Target size={12} className="text-cobalt-600 dark:text-blue-400" />
                              <span>
                                {activeAiming === 'know_role'
                                  ? '1. Target Incaranmu'
                                  : activeAiming === 'exploring'
                                  ? '1. Rekomendasi Terkuat Profilmu'
                                  : '1. Peluang Lolos Paling Cepat'}
                              </span>
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                              {activeAiming === 'know_role'
                                ? 'Pilihan Awal'
                                : activeAiming === 'exploring'
                                ? 'Kecocokan Tertinggi'
                                : 'Siap Lamar (Gap Rendah)'}
                            </span>
                          </div>

                          {(() => {
                            const isSelected = selectedCareerPaths.includes(targetPath.role);
                            const isSwitch = Boolean(targetPath.isCareerSwitch || displayDiagnosis.isCareerSwitch);
                            const tier = getRoleTier(targetPath.fitScore, isSwitch);

                            return (
                              <div
                                key={targetPath.role}
                                onClick={() => {
                                  setSelectedCareerPaths((prev) =>
                                    prev.includes(targetPath.role)
                                      ? prev.filter((r) => r !== targetPath.role)
                                      : [...prev, targetPath.role]
                                  );
                                }}
                                className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col gap-2.5 ${
                                  isSelected
                                    ? 'bg-blue-50/40 dark:bg-slate-800/90 border-cobalt-500 shadow-xs ring-1 ring-cobalt-500/20'
                                    : 'bg-white dark:bg-slate-900/70 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 shadow-2xs'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div
                                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition ${
                                        isSelected
                                          ? 'bg-cobalt-500 border-cobalt-500 text-white'
                                          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                                      }`}
                                    >
                                      {isSelected && <Check size={12} strokeWidth={3} />}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                                          {targetPath.role}
                                        </span>
                                        <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/80 text-cobalt-600 dark:text-blue-300 text-[10px] font-bold border border-blue-200 dark:border-blue-800">
                                          {activeAiming === 'know_role'
                                            ? 'Target Incaran'
                                            : activeAiming === 'exploring'
                                            ? 'Rekomendasi Utama'
                                            : 'Peluang Tercepat'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="shrink-0 flex items-center gap-1.5">
                                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold border flex items-center gap-1.5 ${tier.badgeClass}`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${tier.dotClass}`} />
                                      <span>{targetPath.fitScore}% Fit</span>
                                      <span className="opacity-75 font-semibold text-[10px]">({tier.label})</span>
                                    </span>
                                  </div>
                                </div>

                                <div className="pl-7 space-y-1 border-t border-slate-100 dark:border-slate-800/80 pt-2">
                                  {targetPath.tagline && (
                                    <p className="text-[11px] font-semibold text-cobalt-600 dark:text-blue-400">
                                      {targetPath.tagline}
                                    </p>
                                  )}
                                  <p className="text-caption text-slate-600 dark:text-slate-300 leading-snug">
                                    <span className="font-semibold text-slate-500 dark:text-slate-400">Keahlian cocok: </span>
                                    {targetPath.matchedSkills.length > 0 ? targetPath.matchedSkills.join(', ') : 'Pondasi umum profil'}
                                  </p>
                                  {targetPath.gapSkills && targetPath.gapSkills.length > 0 && (
                                    <p className="text-caption text-slate-500 dark:text-slate-400 leading-snug">
                                      <span className="font-semibold text-amber-700 dark:text-amber-400">Keahlian pendukung: </span>
                                      {targetPath.gapSkills.join(', ')}
                                    </p>
                                  )}

                                  <div className="pt-1 flex items-center justify-between">
                                    <a
                                      href={getLokerUrl(`?q=${encodeURIComponent(targetPath.role)}`)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="inline-flex items-center gap-1 text-[11px] font-bold text-cobalt-600 hover:text-cobalt-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition"
                                    >
                                      <span>Cari lowongan {targetPath.role} di portal loker</span>
                                      <ExternalLink size={10} />
                                    </a>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {/* ZONE 2: Alternatif / Eksplorasi Spektrum / Pilihan Potensial Siap Lamar */}
                      {alternativePaths.length > 0 && (
                        <div className="space-y-1.5 pt-1.5">
                          <div className="flex items-center justify-between px-0.5">
                            <span className="text-[11px] font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                              <Sparkles size={12} className="text-emerald-600 dark:text-emerald-400" />
                              <span>
                                {activeAiming === 'know_role'
                                  ? '2. Jalur Karier Alternatif dari Profilmu'
                                  : activeAiming === 'exploring'
                                  ? '2. Eksplorasi Spektrum Karier Lainnya'
                                  : '2. Posisi Potensial Siap Lamar Berikutnya'}
                              </span>
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                              {activeAiming === 'know_role'
                                ? 'Transferable Skills'
                                : activeAiming === 'exploring'
                                ? 'Lintas Bidang'
                                : 'Peluang Tambahan'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 px-0.5">
                            {activeAiming === 'know_role'
                              ? 'Rekomendasi profesi yang relevan dengan modal keahlianmu (bukan feed lowongan langsung).'
                              : activeAiming === 'exploring'
                              ? 'Bandingkan cabang profesi yang relevan dengan modal keahlianmu lintas sektor.'
                              : 'Pilihan posisi dengan modal kualifikasi yang sudah kamu kuasai untuk memperluas peluang lolos.'}
                          </p>

                          {alternativePaths.map((path, idx) => {
                            const isSelected = selectedCareerPaths.includes(path.role);
                            const tier = getRoleTier(path.fitScore, Boolean(path.isCareerSwitch));

                            return (
                              <div
                                key={path.role}
                                onClick={() => {
                                  setSelectedCareerPaths((prev) =>
                                    prev.includes(path.role)
                                      ? prev.filter((r) => r !== path.role)
                                      : [...prev, path.role]
                                  );
                                }}
                                className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col gap-2.5 ${
                                  isSelected
                                    ? 'bg-blue-50/40 dark:bg-slate-800/90 border-cobalt-500 shadow-xs ring-1 ring-cobalt-500/20'
                                    : 'bg-white dark:bg-slate-900/70 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 shadow-2xs'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div
                                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition ${
                                        isSelected
                                          ? 'bg-cobalt-500 border-cobalt-500 text-white'
                                          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                                      }`}
                                    >
                                      {isSelected && <Check size={12} strokeWidth={3} />}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                                          {path.role}
                                        </span>
                                        {idx === 0 ? (
                                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                                            {activeAiming === 'open_opportunities'
                                              ? 'Siap Lamar'
                                              : activeAiming === 'exploring'
                                              ? 'Opsi Eksplorasi 1'
                                              : 'Rekomendasi Terbaik'}
                                          </span>
                                        ) : (
                                          <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/80 text-cobalt-600 dark:text-blue-300 text-[10px] font-bold border border-blue-200 dark:border-blue-800">
                                            {activeAiming === 'open_opportunities'
                                              ? 'Peluang Tambahan'
                                              : activeAiming === 'exploring'
                                              ? `Opsi Eksplorasi ${idx + 1}`
                                              : 'Transisi Realistis'}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="shrink-0 flex items-center gap-1.5">
                                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold border flex items-center gap-1.5 ${tier.badgeClass}`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${tier.dotClass}`} />
                                      <span>{path.fitScore}% Fit</span>
                                      <span className="opacity-75 font-semibold text-[10px]">({tier.label})</span>
                                    </span>
                                  </div>
                                </div>

                                <div className="pl-7 space-y-1 border-t border-slate-100 dark:border-slate-800/80 pt-2">
                                  {path.tagline && (
                                    <p className="text-[11px] font-semibold text-cobalt-600 dark:text-blue-400">
                                      {path.tagline}
                                    </p>
                                  )}
                                  <p className="text-caption text-slate-600 dark:text-slate-300 leading-snug">
                                    <span className="font-semibold text-slate-500 dark:text-slate-400">Keahlian cocok: </span>
                                    {path.matchedSkills.length > 0 ? path.matchedSkills.join(', ') : 'Pondasi umum profil'}
                                  </p>
                                  {path.gapSkills && path.gapSkills.length > 0 && (
                                    <p className="text-caption text-slate-500 dark:text-slate-400 leading-snug">
                                      <span className="font-semibold text-amber-700 dark:text-amber-400">Keahlian pendukung: </span>
                                      {path.gapSkills.join(', ')}
                                    </p>
                                  )}

                                  <div className="pt-1 flex items-center justify-between">
                                    <a
                                      href={getLokerUrl(`?q=${encodeURIComponent(path.role)}`)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="inline-flex items-center gap-1 text-[11px] font-bold text-cobalt-600 hover:text-cobalt-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition"
                                    >
                                      <span>Cari lowongan {path.role} di portal loker</span>
                                      <ExternalLink size={10} />
                                    </a>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Helper notice */}
              <div className="shrink-0 pt-2.5 text-center text-caption text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                Draf CV pertamamu akan otomatis disesuaikan untuk peran yang kamu centang di atas.
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Sticky Action Footer */}
        <footer className="shrink-0 bg-white/95 dark:bg-slate-950/95 border-t border-slate-200 dark:border-slate-800 px-6 py-3 sm:px-8 shadow-lg z-30">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setCareerSubStep('aiming')}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ArrowLeft size={14} />
              <span>Ubah Target Peran</span>
            </button>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  const finalRoles = selectedCareerPaths.length > 0 ? selectedCareerPaths : [displayDiagnosis.primaryRole];
                  setFormData((prev) => ({ ...prev, targetPositions: finalRoles }));
                  handleFinishAndNavigateTo('/beranda', finalRoles, displayDiagnosis);
                }}
                className="text-caption font-bold text-slate-500 hover:text-cobalt-500 dark:hover:text-blue-400 transition cursor-pointer hidden md:inline"
              >
                Langsung ke Beranda →
              </button>

              <button
                type="button"
                onClick={() => {
                  const finalRoles = selectedCareerPaths.length > 0 ? selectedCareerPaths : [displayDiagnosis.primaryRole];
                  setFormData((prev) => ({ ...prev, targetPositions: finalRoles }));
                  handleFinishAndNavigateTo('/cv', finalRoles, displayDiagnosis);
                }}
                disabled={isSubmitting || selectedCareerPaths.length === 0}
                className="px-6 py-2.5 sm:py-3 rounded-xl bg-[#F97316] hover:bg-[#ea580c] active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-[#F97316]/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isSubmitting ? 'Menyiapkan CV...' : 'Lanjut ke CV Builder'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex-1 w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pt-20 pb-28 px-6 sm:pt-24 sm:pb-28 sm:px-10 flex flex-col justify-between selection:bg-orange-500 selection:text-white">
      {/* Full-Screen Drag & Drop Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-cobalt-500/15 dark:bg-cobalt-500/30 backdrop-blur-xs flex items-center justify-center p-6 sm:p-10 pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full h-full max-w-2xl max-h-[75vh] border-3 border-dashed border-cobalt-500 dark:border-blue-400 bg-white/95 dark:bg-slate-900/95 rounded-3xl shadow-2xl flex flex-col items-center justify-center gap-4 text-center p-8"
            >
              <div className="w-20 h-20 rounded-2xl bg-blue-100 dark:bg-blue-950 text-cobalt-500 dark:text-blue-400 flex items-center justify-center shadow-lg shadow-cobalt-500/15 scale-110">
                <FileUp size={44} className="animate-bounce" />
              </div>
              <div className="space-y-1.5 max-w-md">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  Lepaskan Berkas CV di Mana Saja
                </h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Tarik dan lepas berkas ke bagian mana saja pada layar untuk memindai otomatis (PDF, DOCX, TXT, atau JSON)
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-caption font-bold bg-blue-50 dark:bg-blue-950/80 text-cobalt-500 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                Maksimal 10MB
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Minimalist Top Progress Bar */}
      {(currentStage === 'questions' || currentStage === 'upload_scan') && (
        <div className="fixed top-0 left-0 right-0 h-[2px] bg-slate-100 dark:bg-slate-900 z-50 overflow-hidden">
          <motion.div
            className="h-full bg-cobalt-500"
            initial={{ width: 0 }}
            animate={{
              width:
                currentStage === 'questions'
                  ? `${(currentQuestionIndex / totalQuestions) * 100}%`
                  : scanCompleted
                  ? '100%'
                  : isScanning
                  ? `${Math.max(50, Math.min(95, 50 + scanProgress * 0.45))}%`
                  : '50%',
            }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          />
        </div>
      )}

      {/* Top Header & Brand Bar - Statis di pojok kiri atas dan pojok kanan atas */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xs border-b border-slate-100 dark:border-slate-800/80 px-6 py-4 sm:px-10 sm:py-5">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.webp"
              alt="Employr"
              width={120}
              height={28}
              unoptimized
              priority
              className="h-6 w-auto object-contain dark:brightness-0 dark:invert"
            />
          </div>
          <div className="text-caption font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {currentStage === 'tos' && 'Ketentuan Layanan'}
            {currentStage === 'upload_scan' && (scanCompleted ? 'Langkah 2 dari 2' : 'Langkah 1 dari 2')}
            {currentStage === 'career_direction' && (
              careerSubStep === 'aiming'
                ? 'Target Karier'
                : careerSubStep === 'loading'
                ? 'Diagnosis Profil'
                : 'Rekomendasi Karier'
            )}
            {currentStage === 'questions' && `Langkah ${currentQuestionIndex} dari ${totalQuestions}`}
            {currentStage === 'fork' && 'Pilih Metode'}
          </div>
        </div>
      </header>

      {/* Center Screen Content */}
      <main className={`w-full mx-auto py-6 sm:py-8 transition-all duration-300 ${stageMaxWidth} ${
        currentStage === 'tos' || currentStage === 'fork' || currentStage === 'upload_scan' ? 'my-auto' : ''
      }`}>
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
                      ? 'bg-cobalt-500 border-cobalt-500 text-white'
                      : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-transparent'
                  }`}
                >
                  <Check size={13} strokeWidth={3} />
                </span>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-relaxed">
                  Saya menyetujui Syarat &amp; Ketentuan serta Kebijakan Privasi Employr untuk rekomendasi loker dan pembuatan CV.
                </span>
              </motion.button>

              <div className="flex items-center gap-4 text-caption pt-1 border-t border-slate-200 dark:border-slate-800/60 font-semibold text-cobalt-500 pl-8">
                <Link href="/syarat-ketentuan" target="_blank" className="hover:underline flex items-center gap-1">
                  Syarat & Ketentuan ↗
                </Link>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <Link href="/kebijakan-privasi" target="_blank" className="hover:underline flex items-center gap-1">
                  Kebijakan Privasi ↗
                </Link>
              </div>
            </div>
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
                className="p-5 rounded-2xl border-2 border-cobalt-500/40 hover:border-cobalt-500 bg-blue-50/40 dark:bg-blue-950/20 text-left transition flex items-start gap-4 cursor-pointer group shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-cobalt-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-cobalt-500/20">
                  <Upload size={22} />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-cobalt-500 transition">
                      Sudah Punya CV (Upload & Scan)
                    </h3>
                    <span className="text-caption font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200">
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
                  <Sparkles size={22} className="text-orange-700 dark:text-orange-400" />
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
          </motion.div>
        )}

        {/* ============================================================ */}
        {/* STAGE 3A: UPLOAD & AUTO-SCAN FLOW */}
        {/* ============================================================ */}
        {currentStage === 'upload_scan' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6 text-center sm:text-left"
          >
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
                Unggah Berkas CV Kamu
              </h1>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Pilih file PDF, DOCX, atau JSON untuk dipindai otomatis oleh sistem.
              </p>
            </div>

            <div className="space-y-4">
              {/* Upload Zone */}
              <label
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`w-full p-8 border-2 border-dashed rounded-2xl transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group ${
                  isDragging
                    ? 'border-cobalt-500 bg-blue-100/60 dark:bg-blue-900/40 ring-4 ring-cobalt-500/15 scale-[1.01]'
                    : 'border-cobalt-500/50 hover:border-cobalt-500 dark:border-blue-800 bg-blue-50/30 hover:bg-blue-50/60 dark:bg-blue-950/10'
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                    isDragging
                      ? 'scale-110 bg-cobalt-500 text-white shadow-md shadow-cobalt-500/20'
                      : 'bg-blue-100 dark:bg-blue-900/60 text-cobalt-500 dark:text-blue-400 group-hover:scale-105'
                  }`}
                >
                  <FileUp size={28} />
                </div>
                <div className="text-center space-y-1">
                  <p
                    className={`text-xs font-extrabold transition ${
                      isDragging ? 'text-cobalt-500 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {isDragging
                      ? 'Lepaskan berkas di sini untuk mulai memindai'
                      : 'Klik untuk pilih file atau tarik berkas ke sini'}
                  </p>
                  <p className="text-caption font-medium text-slate-500 dark:text-slate-400">
                    Mendukung PDF, DOCX, dan JSON (Maksimal 10MB)
                  </p>
                </div>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.txt,.json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUploadAndScan(file);
                    e.target.value = '';
                  }}
                  className="hidden"
                />
              </label>

              {/* Scanning Progress State */}
              {isScanning && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-2 text-cobalt-500">
                      <span className="w-2 h-2 rounded-full bg-cobalt-500 animate-ping" />
                      {scanStatusText}
                    </span>
                    <span className="text-slate-500 font-mono font-bold">{scanProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <motion.div
                      className="h-full bg-cobalt-500"
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
            </div>
          </motion.div>
        )}

        {/* ============================================================ */}
        {/* STAGE 3B: STEP-BY-STEP GUIDED QUESTIONS FLOW */}
        {/* ============================================================ */}
        {currentStage === 'questions' && currentQuestion && (
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
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-caption font-bold-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60"
                    >
                      <Check size={10} className="text-emerald-700 dark:text-emerald-400" />
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
                            : 'border-slate-200 dark:border-slate-800 focus:border-cobalt-500 focus-visible:ring-2 focus-visible:ring-cobalt-500/30 rounded-xs'
                        }`}
                      />
                      {formData.fullName.trim() && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute right-0 top-1/2 -translate-y-1/2 text-emerald-700 dark:text-emerald-400"
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
                      blueprints={dynamicBlueprints}
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
                            ? 'bg-orange-50/80 dark:bg-orange-950/60 border-[#F97316] text-orange-700 dark:text-orange-400 ring-2 ring-[#F97316]/20'
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
                            ? 'bg-orange-50/80 dark:bg-orange-950/60 border-[#F97316] text-orange-700 dark:text-orange-400 ring-2 ring-[#F97316]/20'
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
                          className="px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-cobalt-500"
                        />
                        <input
                          type="text"
                          placeholder="Nama Perusahaan..."
                          value={formData.experienceCompany}
                          onChange={(e) => setFormData({ ...formData, experienceCompany: e.target.value })}
                          className="px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-cobalt-500"
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
                              isSel ? 'bg-cobalt-500 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
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
                        className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-cobalt-500 transition"
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
                        className="px-4 py-2.5 rounded-xl bg-cobalt-500 text-white text-xs font-bold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
                              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-cobalt-500 text-white shadow-sm flex items-center gap-1.5 cursor-pointer"
                            >
                              <Check size={14} />
                              <span>{sk}</span>
                            </motion.button>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* ============================================================ */}
        {/* STAGE 4: TENTUKAN CAREER DIRECTION & DIAGNOSIS KARIER */}
        {/* ============================================================ */}
        {currentStage === 'career_direction' && (
          <AnimatePresence mode="wait">
            {/* 4A: WHAT ARE YOU AIMING FOR? */}
            {careerSubStep === 'aiming' && (
              <motion.div
                key="career-aiming"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6 text-left"
              >
                {/* Top Header */}
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-cobalt-500 dark:text-blue-400 text-caption font-extrabold border border-blue-200 dark:border-blue-900/60">
                    <Compass size={13} />
                    <span>Tentukan Career Direction</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
                    What are you aiming for?
                  </h1>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Pilih kondisi target kariermu sekarang agar Employr bisa menyusun diagnosis kecocokan dan merekomendasikan peran terbaik.
                  </p>
                </div>

                {/* The 3 Aiming Choices */}
                <div className="grid grid-cols-1 gap-3">
                  {/* 1. I know my target role */}
                  <div
                    onClick={() => {
                      setAimingChoice('know_role');
                      if (!targetRoleInput.trim()) {
                        setTargetRoleInput(formData.targetPositions?.[0] || 'Frontend Developer');
                      }
                    }}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      aimingChoice === 'know_role'
                        ? 'bg-blue-50/50 dark:bg-blue-950/30 border-cobalt-500 ring-2 ring-cobalt-500/15'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          aimingChoice === 'know_role' ? 'bg-cobalt-500 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        <Target size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                            I know my target role
                          </h3>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              aimingChoice === 'know_role' ? 'border-cobalt-500 bg-cobalt-500 text-white' : 'border-slate-300 dark:border-slate-700'
                            }`}
                          >
                            {aimingChoice === 'know_role' && <Check size={10} strokeWidth={3} />}
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          Sudah memiliki posisi spesifik yang ingin dituju dan dilamar.
                        </p>

                        {/* Target Role Input & Quick Suggestions */}
                        {aimingChoice === 'know_role' && (
                          <div className="mt-4 pt-3.5 border-t border-blue-100 dark:border-blue-900/40 space-y-2.5" onClick={(e) => e.stopPropagation()}>
                            <label className="block text-caption font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                              Target Role Incaran:
                            </label>
                            <PositionSearchInput
                              selectedPositions={targetRoleInput.trim() ? [targetRoleInput.trim()] : []}
                              onAddPosition={(pos) => setTargetRoleInput(pos)}
                              onRemovePosition={() => setTargetRoleInput('')}
                              placeholder="Cari atau ketik posisi incaran (misal: kurir, barista, admin shopee)..."
                              blueprints={dynamicBlueprints}
                              autoFocus
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 2. I'm exploring */}
                  <div
                    onClick={() => {
                      setAimingChoice('exploring');
                      setTargetRoleInput('');
                    }}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      aimingChoice === 'exploring'
                        ? 'bg-blue-50/50 dark:bg-blue-950/30 border-cobalt-500 ring-2 ring-cobalt-500/15'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          aimingChoice === 'exploring' ? 'bg-cobalt-500 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        <Compass size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                            I’m exploring
                          </h3>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              aimingChoice === 'exploring' ? 'border-cobalt-500 bg-cobalt-500 text-white' : 'border-slate-300 dark:border-slate-700'
                            }`}
                          >
                            {aimingChoice === 'exploring' && <Check size={10} strokeWidth={3} />}
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          Masih menimbang beberapa opsi dan ingin tahu peran mana yang paling relevan dengan keahlianmu.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 3. I'm open to opportunities */}
                  <div
                    onClick={() => {
                      setAimingChoice('open_opportunities');
                      setTargetRoleInput('');
                    }}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      aimingChoice === 'open_opportunities'
                        ? 'bg-blue-50/50 dark:bg-blue-950/30 border-cobalt-500 ring-2 ring-cobalt-500/15'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          aimingChoice === 'open_opportunities' ? 'bg-cobalt-500 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        <Sparkles size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                            I’m open to opportunities
                          </h3>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              aimingChoice === 'open_opportunities' ? 'border-cobalt-500 bg-cobalt-500 text-white' : 'border-slate-300 dark:border-slate-700'
                            }`}
                          >
                            {aimingChoice === 'open_opportunities' && <Check size={10} strokeWidth={3} />}
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          Fleksibel dan mengutamakan peluang kerja dengan probabilitas lolos screening tertinggi.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 4B: LOADING STATE WITH LOTTIE ANIMATION */}
            {careerSubStep === 'loading' && (
              <motion.div
                key="career-loading"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md mx-auto my-6 p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl text-center space-y-6"
              >
                {loadingPhase === 'analyzing' ? (
                  <div className="space-y-5">
                    <div className="w-36 h-36 mx-auto flex items-center justify-center">
                      <Avatar color="blue" size="xl" blinking={true} />
                    </div>

                    <div className="space-y-2.5">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/70 text-cobalt-500 dark:text-blue-400 text-caption font-extrabold uppercase tracking-wider border border-blue-200/60">
                        <span className="w-2 h-2 rounded-full bg-cobalt-500 animate-ping" />
                        <span>
                          {analysisStep === 1
                            ? 'Membaca Profil...'
                            : analysisStep === 2
                            ? 'Menyelaraskan Industri...'
                            : 'Menghitung Kecocokan...'}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                        Menyusun Diagnosis Karier...
                      </h2>
                      <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto min-h-[38px] flex items-center justify-center">
                        <AnimatePresence mode="wait">
                          <motion.p
                            key={analysisStep}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.2 }}
                          >
                            {analysisStep === 1 && (
                              <span>Membaca latar belakang pendidikan dan keahlian yang kamu kuasai...</span>
                            )}
                            {analysisStep === 2 && (
                              <span>
                                {aimingChoice === 'know_role'
                                  ? `Menyelaraskan profil dengan standar peran ${targetRoleInput || 'industri'}...`
                                  : aimingChoice === 'exploring'
                                  ? 'Menyelaraskan kompetensi ke berbagai sektor industri kerja...'
                                  : 'Memetakan posisi dengan kualifikasi paling siap lamar dan gap minimal...'}
                              </span>
                            )}
                            {analysisStep === 3 && (
                              <span>
                                {aimingChoice === 'open_opportunities'
                                  ? 'Menghitung rasio kesiapan skill dan posisi dengan peluang lolos tercepat...'
                                  : 'Menghitung skor kecocokan peran dan peluang jalur transisi...'}
                              </span>
                            )}
                          </motion.p>
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Dynamic Progress Bar with Stepped Animation */}
                    <div className="space-y-1.5 pt-1">
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-[#1738D1] via-blue-500 to-[#F97316]"
                          initial={{ width: '15%' }}
                          animate={{ width: `${analysisProgress}%` }}
                          transition={{
                            duration: analysisProgress >= 92 && analysisProgress < 100 ? 0.35 : 0.6,
                            ease: 'easeOut',
                          }}
                        />
                      </div>
                      <div className="flex justify-between items-center px-1 text-[11px] font-bold text-slate-400">
                        <span>Analisis Multi-Vektor</span>
                        <span className="text-cobalt-600 dark:text-blue-400 font-extrabold">{analysisProgress}%</span>
                      </div>
                    </div>

                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          diagnosisTimerRef.current.forEach((t) => {
                            clearTimeout(t);
                            clearInterval(t);
                          });
                          setIsDiagnosing(false);
                          setCareerSubStep('suggested_paths');
                        }}
                        className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition underline underline-offset-2 cursor-pointer font-medium"
                      >
                        Lewati & buka rekomendasi langsung
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-36 h-36 mx-auto flex items-center justify-center">
                      <DotLottiePlayer
                        src="/animations/profile-ready.json"
                        autoplay={true}
                        loop={false}
                        className="w-36 h-36 mx-auto"
                        fallback={
                          <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-200">
                            <CheckCircle2 size={40} />
                          </div>
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 text-caption font-extrabold uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 size={12} />
                        <span>Diagnosis Berhasil</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                        Sekarang Employr sudah memahami kariermu.
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                        Target peran dan rekomendasi langkah karier telah berhasil dipetakan secara optimal.
                      </p>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          diagnosisTimerRef.current.forEach(clearTimeout);
                          setCareerSubStep('suggested_paths');
                        }}
                        className="px-5 py-2.5 rounded-xl bg-cobalt-500 hover:bg-[#132ea8] text-white text-xs font-bold shadow-md shadow-cobalt-500/20 transition inline-flex items-center gap-2 cursor-pointer active:scale-95"
                      >
                        <span>Lihat Suggested Career Paths</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Modal Detail Skill Prioritas */}
        {activeSkillsModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                      Daftar Keahlian Prioritas
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Target posisi: <span className="font-bold text-slate-800 dark:text-slate-200">{displayDiagnosis.primaryRole}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSkillsModal(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3.5 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                  Keahlian di bawah ini adalah kompetensi inti yang paling dicari perekrut untuk posisi <strong>{displayDiagnosis.primaryRole}</strong>. Melengkapi 1–2 keahlian ini akan meningkatkan persentase kecocokan CV kamu secara instan.
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Keahlian yang Perlu Dilengkapi ({displayDiagnosis.gapSkillsList?.length || 0})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(displayDiagnosis.gapSkillsList && displayDiagnosis.gapSkillsList.length > 0
                      ? displayDiagnosis.gapSkillsList
                      : ['Keahlian teknis spesifik peran', 'Portofolio / Sertifikasi terkait']
                    ).map((skill, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/80 bg-white dark:bg-slate-800/60 flex items-center gap-2"
                      >
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {displayDiagnosis.matchedSkillsList && displayDiagnosis.matchedSkillsList.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                      Keahlian yang Sudah Kamu Miliki ({displayDiagnosis.matchedSkillsList.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {displayDiagnosis.matchedSkillsList.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1"
                        >
                          <Check size={12} strokeWidth={3} />
                          <span>{skill}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveSkillsModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
                >
                  Mengerti & Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Detail Kekuatan Utama */}
        {activeStrengthModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                      Detail Kekuatan Utama
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Modal kompetensi dan bukti nyata profilmu
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStrengthModal(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3.5 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                  <p className="font-extrabold text-sm text-emerald-950 dark:text-emerald-100 mb-1">
                    {displayDiagnosis.topStrength}
                  </p>
                  <p className="text-emerald-800/90 dark:text-emerald-300/90 text-caption">
                    Poin ini mencatat modal riwayat nyata atau penguasaan keahlian yang langsung memberi nilai tambah saat melamar pekerjaan.
                  </p>
                </div>

                {displayDiagnosis.matchedSkillsList && displayDiagnosis.matchedSkillsList.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Keahlian Terpenuhi ({displayDiagnosis.matchedSkillsList.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {displayDiagnosis.matchedSkillsList.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1"
                        >
                          <Check size={12} strokeWidth={3} />
                          <span>{skill}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveStrengthModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Unified Bottom Action Bar - Statis di Bawah */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xs border-t border-slate-200/80 dark:border-slate-800/80 px-6 py-3.5 sm:px-10 shadow-lg">
        <div className="w-full relative flex items-center justify-between gap-3">
          {/* Centered Trust Badge - Exactly in the Horizontal Center of the Viewport */}
          <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 hidden sm:flex items-center gap-1.5 text-caption font-medium text-slate-500 dark:text-slate-400 select-none whitespace-nowrap">
            <Lock size={12} className="text-slate-500 dark:text-slate-400 shrink-0" />
            <span>Data kamu aman bersama Employr</span>
          </div>

          {currentStage === 'tos' ? (
            <>
              <div />

              <button
                type="button"
                disabled={!formData.tosAccepted}
                onClick={() => setCurrentStage('fork')}
                className="h-10 px-6 rounded-xl bg-[#F97316] hover:bg-[#ea580c] active:scale-[0.98] text-white font-extrabold text-xs shadow-md shadow-[#F97316]/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ml-auto"
              >
                <span>Mulai Sekarang</span>
                <ArrowRight size={15} />
              </button>
            </>
          ) : currentStage === 'fork' ? (
            <>
              <button
                type="button"
                onClick={() => setCurrentStage('tos')}
                className="h-10 px-4 rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <ArrowLeft size={15} />
                <span>Kembali</span>
              </button>

              <span className="text-caption font-medium text-slate-400 dark:text-slate-500 hidden sm:inline ml-auto">
                Pilih salah satu metode untuk lanjut
              </span>
            </>
          ) : currentStage === 'upload_scan' ? (
            <>
              <button
                type="button"
                onClick={() => setCurrentStage('fork')}
                className="h-10 px-4 rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <ArrowLeft size={15} />
                <span>Ganti Metode</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentStage('questions');
                  setCurrentQuestionIndex(1);
                }}
                className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98] ml-auto"
              >
                <span>Isi Manual</span>
                <ArrowRight size={14} />
              </button>
            </>
          ) : currentStage === 'questions' ? (
            <>
              <button
                type="button"
                onClick={handlePrevQuestion}
                className="h-10 px-4 rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <ArrowLeft size={15} />
                <span>Kembali</span>
              </button>

              <button
                type="button"
                onClick={handleNextQuestion}
                disabled={!isCurrentQuestionValid()}
                className="h-10 px-6 rounded-xl bg-[#F97316] hover:bg-[#ea580c] active:scale-[0.98] text-white font-extrabold text-xs shadow-md shadow-[#F97316]/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ml-auto"
              >
                <span>{currentQuestionIndex === totalQuestions ? 'Selesai' : 'Lanjut'}</span>
                <ArrowRight size={15} />
              </button>
            </>
          ) : currentStage === 'career_direction' && careerSubStep === 'aiming' ? (
            <>
              <button
                type="button"
                onClick={() => {
                  if (formData.hasCvAlready) {
                    setCurrentStage('upload_scan');
                  } else {
                    setCurrentStage('questions');
                    setCurrentQuestionIndex(totalQuestions);
                  }
                }}
                className="h-10 px-4 rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <ArrowLeft size={14} />
                <span>Ganti Data</span>
              </button>

              <button
                type="button"
                onClick={handleStartDiagnosis}
                disabled={aimingChoice === 'know_role' && !targetRoleInput.trim()}
                className="h-10 px-6 rounded-xl bg-[#F97316] hover:bg-[#ea580c] active:scale-[0.98] text-white font-extrabold text-xs shadow-md shadow-[#F97316]/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ml-auto"
              >
                <span>Lanjutkan Diagnosis</span>
                <ArrowRight size={15} />
              </button>
            </>
          ) : (
            <>
              <div />
              <span className="text-[11px] text-slate-400 dark:text-slate-600 hidden sm:inline font-mono ml-auto">
                Employr
              </span>
            </>
          )}
        </div>
      </footer>
    </div>
  );
}
