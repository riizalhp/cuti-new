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
  Compass,
  TrendingUp,
  Zap,
  Layers,
  Pencil,
  Plus,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

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
  const [scannedActiveTab, setScannedActiveTab] = useState<'experience' | 'projects' | 'certifications' | 'organizations'>('experience');

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

  // Helper functions to update/edit extracted CV records directly
  const updateExperience = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const list = [...prev.extractedExperiences];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, extractedExperiences: list };
    });
  };

  const updateExperienceDate = (
    index: number,
    field: 'startDate' | 'endDate' | 'isCurrent',
    value: any
  ) => {
    setFormData((prev) => {
      const list = [...prev.extractedExperiences];
      const current = list[index] || {};
      const fallback = parsePeriodToDates(current.period);
      const item = {
        ...current,
        startDate: current.startDate || fallback.startDate,
        endDate: current.endDate || fallback.endDate,
        isCurrent: current.isCurrent ?? fallback.isCurrent,
      };

      if (field === 'startDate') {
        item.startDate = value;
      } else if (field === 'endDate') {
        item.endDate = value;
        item.isCurrent = value === 'Sekarang' || value === 'Saat Ini';
      } else if (field === 'isCurrent') {
        item.isCurrent = value;
        if (value) {
          item.endDate = 'Sekarang';
        } else if (item.endDate === 'Sekarang') {
          item.endDate = '';
        }
      }

      const start = item.startDate || '';
      const end = item.isCurrent ? 'Sekarang' : item.endDate || '';
      item.period = start && end ? `${start} - ${end}` : start || end || '';
      list[index] = item;
      return { ...prev, extractedExperiences: list };
    });
  };

  const deleteExperience = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      extractedExperiences: prev.extractedExperiences.filter((_, i) => i !== index),
    }));
  };

  const addExperience = () => {
    setFormData((prev) => ({
      ...prev,
      extractedExperiences: [
        ...prev.extractedExperiences,
        {
          id: `exp-${Date.now()}`,
          role: '',
          company: '',
          startDate: '',
          endDate: '',
          isCurrent: false,
          period: '',
          description: '',
        },
      ],
    }));
  };

  const updateProject = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const list = [...prev.extractedProjects];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, extractedProjects: list };
    });
  };

  const deleteProject = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      extractedProjects: prev.extractedProjects.filter((_, i) => i !== index),
    }));
  };

  const addProject = () => {
    setFormData((prev) => ({
      ...prev,
      extractedProjects: [
        ...prev.extractedProjects,
        {
          id: `proj-${Date.now()}`,
          name: '',
          role: '',
          period: '',
          description: '',
        },
      ],
    }));
  };

  const updateCertification = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const list = [...prev.extractedCertifications];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, extractedCertifications: list };
    });
  };

  const deleteCertification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      extractedCertifications: prev.extractedCertifications.filter((_, i) => i !== index),
    }));
  };

  const addCertification = () => {
    setFormData((prev) => ({
      ...prev,
      extractedCertifications: [
        ...prev.extractedCertifications,
        {
          id: `cert-${Date.now()}`,
          name: '',
          issuer: '',
          issueDate: '',
        },
      ],
    }));
  };

  const updateOrganization = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const list = [...prev.extractedOrganizations];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, extractedOrganizations: list };
    });
  };

  const deleteOrganization = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      extractedOrganizations: prev.extractedOrganizations.filter((_, i) => i !== index),
    }));
  };

  const addOrganization = () => {
    setFormData((prev) => ({
      ...prev,
      extractedOrganizations: [
        ...prev.extractedOrganizations,
        {
          id: `org-${Date.now()}`,
          name: '',
          role: '',
          period: '',
          description: '',
        },
      ],
    }));
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
    extractedExperiences: [] as any[],
    extractedProjects: [] as any[],
    extractedOrganizations: [] as any[],
    extractedCertifications: [] as any[],
  });

  // Career Direction State
  const [careerSubStep, setCareerSubStep] = useState<'aiming' | 'loading' | 'suggested_paths'>('aiming');
  const [loadingPhase, setLoadingPhase] = useState<'analyzing' | 'success'>('analyzing');
  const diagnosisTimerRef = useRef<NodeJS.Timeout[]>([]);
  const [aimingChoice, setAimingChoice] = useState<'know_role' | 'exploring' | 'open_opportunities'>('know_role');
  const [targetRoleInput, setTargetRoleInput] = useState('Frontend Developer');
  const [selectedCareerPaths, setSelectedCareerPaths] = useState<string[]>([]);
  const [dynamicBlueprints, setDynamicBlueprints] = useState<DynamicRoleBlueprint[]>([]);

  // Cleanup diagnosis timers on unmount
  useEffect(() => {
    return () => {
      diagnosisTimerRef.current.forEach(clearTimeout);
    };
  }, []);

  // Trigger loading & diagnosis animation before showing suggested paths
  const handleStartDiagnosis = () => {
    if (aimingChoice === 'know_role' && !targetRoleInput.trim()) return;

    diagnosisTimerRef.current.forEach(clearTimeout);
    diagnosisTimerRef.current = [];

    setCareerSubStep('loading');
    setLoadingPhase('analyzing');

    const t1 = setTimeout(() => {
      setLoadingPhase('success');
      const t2 = setTimeout(() => {
        setCareerSubStep('suggested_paths');
      }, 1500);
      diagnosisTimerRef.current.push(t2);
    }, 2000);
    diagnosisTimerRef.current.push(t1);
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

    // Pre-populate data awal dari sesi
    setFormData((prev) => ({
      ...prev,
      fullName: prev.fullName || session.name || '',
      contactInfo: prev.contactInfo || session.email || '',
      phone: prev.phone || session.phone || '',
    }));

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
          fullName: prev.fullName || profile.fullName || profile.name || '',
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

  // Memoized Real-Time Career Diagnosis
  const currentDiagnosis = useMemo(() => {
    return computeCareerDiagnosis({
      aimingChoice,
      targetRoleInput,
      userSkills: formData.skills,
      educationLevel: formData.educationLevel,
      major: formData.major,
      hasExperience: formData.hasWorkExperience,
      dynamicBlueprints,
    });
  }, [aimingChoice, targetRoleInput, formData.skills, formData.educationLevel, formData.major, formData.hasWorkExperience, dynamicBlueprints]);

  // Sync initial target role & preselect suggested paths when entering career_direction
  useEffect(() => {
    if (currentStage === 'career_direction') {
      if (selectedCareerPaths.length === 0 && currentDiagnosis.suggestedPaths.length > 0) {
        const primary = currentDiagnosis.suggestedPaths.find((p) => p.isPrimaryTarget) || currentDiagnosis.suggestedPaths[0];
        if (primary) {
          setSelectedCareerPaths([primary.role]);
        }
      }
    }
  }, [currentStage, currentDiagnosis, selectedCareerPaths.length]);

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

    // Dynamic progress ticker to provide real-time visual progression while awaiting server extraction
    let currentProgress = 15;
    const progressInterval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 6) + 3;
      if (currentProgress >= 92) {
        currentProgress = 92;
        setScanStatusText('Menyusun data terstruktur profil...');
      } else if (currentProgress >= 70) {
        setScanStatusText('Menganalisis keahlian & riwayat pengalaman...');
      } else if (currentProgress >= 40) {
        setScanStatusText('Mengekstrak teks & struktur CV...');
      }
      setScanProgress(currentProgress);
    }, 280);

    try {
      const bodyData = new FormData();
      bodyData.append('file', file);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

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

      if (typeof window !== 'undefined') {
        localStorage.setItem('employr_imported_cv_data', JSON.stringify(data));
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
        fullName: data.fullName || prev.fullName,
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
        extractedExperiences: parsedExperiences,
        extractedProjects: data.projects || [],
        extractedOrganizations: data.organizations || [],
        extractedCertifications: data.certifications || [],
      }));

      // Segera simpan ringkasan dan data kontak ke profil pengguna secara instan
      if (data.summary) {
        userApi
          .updateProfile({
            bio: data.summary,
            fullName: data.fullName || undefined,
            phone: data.phone || undefined,
            location: data.location || undefined,
          })
          .catch(() => {});
      }

      if ((data.experience?.length || 0) > 0) {
        setScannedActiveTab('experience');
      } else if ((data.projects?.length || 0) > 0) {
        setScannedActiveTab('projects');
      } else if ((data.certifications?.length || 0) > 0) {
        setScannedActiveTab('certifications');
      } else if ((data.organizations?.length || 0) > 0) {
        setScannedActiveTab('organizations');
      } else {
        setScannedActiveTab('experience');
      }

      setScanProgress(100);
      setScanStatusText('Ekstraksi berhasil!');
      await new Promise((resolve) => setTimeout(resolve, 350));
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
    const activeDiagnosis = overrideDiagnosis || currentDiagnosis;

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

        // Store extended onboarding profile data for CV defaults
        localStorage.setItem(
          'employr_onboarding_profile',
          JSON.stringify({
            fullName: formData.fullName,
            contactInfo: formData.contactInfo,
            phone: formData.phone,
            location: formData.location,
            educationLevel: formData.educationLevel,
            institutionName: formData.institutionName,
            major: formData.major,
            targetPositions: resolvedRoles,
            hasWorkExperience: formData.hasWorkExperience,
            experienceTitle: formData.experienceTitle,
            experienceCompany: formData.experienceCompany,
            skills: formData.skills,
            expectedSalary: formData.expectedSalary,
            summary: formData.summary,
            hasCvAlready: formData.hasCvAlready,
            careerDiagnosis: activeDiagnosis,
          })
        );

        // Also sync manual adjustments to employr_imported_cv_data so CV Builder reflects edited values
        const importedRaw = localStorage.getItem('employr_imported_cv_data');
        if (importedRaw) {
          try {
            const parsedImported = JSON.parse(importedRaw);
            const degreeStr = `${formData.educationLevel} ${formData.major}`.trim();
            const updatedImported = {
              ...parsedImported,
              fullName: formData.fullName || parsedImported.fullName,
              contactInfo: formData.contactInfo || parsedImported.contactInfo,
              phone: formData.phone || parsedImported.phone,
              location: formData.location || parsedImported.location,
              educationLevel: formData.educationLevel || parsedImported.educationLevel,
              institutionName: formData.institutionName || parsedImported.institutionName,
              major: formData.major || parsedImported.major,
              targetPositions: resolvedRoles,
              skills: formData.skills?.length ? formData.skills : parsedImported.skills,
              careerDiagnosis: activeDiagnosis,
              experience: formData.extractedExperiences?.length ? formData.extractedExperiences : parsedImported.experience,
              projects: formData.extractedProjects?.length ? formData.extractedProjects : parsedImported.projects,
              certifications: formData.extractedCertifications?.length ? formData.extractedCertifications : parsedImported.certifications,
              organizations: formData.extractedOrganizations?.length ? formData.extractedOrganizations : parsedImported.organizations,
              education: (parsedImported.education && parsedImported.education.length > 0)
                ? parsedImported.education.map((edu: any, idx: number) => idx === 0 ? {
                    ...edu,
                    degree: degreeStr || edu.degree,
                    institution: formData.institutionName || edu.institution,
                  } : edu)
                : formData.institutionName || degreeStr
                ? [{
                    id: `edu-${Date.now()}`,
                    institution: formData.institutionName || 'Pendidikan Terakhir',
                    degree: degreeStr || 'Sarjana',
                    location: formData.location || '',
                    year: '2021 - 2025',
                    gpa: '',
                  }]
                : [],
            };
            localStorage.setItem('employr_imported_cv_data', JSON.stringify(updatedImported));
          } catch {
            // Ignore error
          }
        }
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
        return 'max-w-4xl lg:max-w-5xl';
      case 'career_direction':
        return careerSubStep === 'loading' ? 'max-w-xl' : 'max-w-3xl lg:max-w-4xl';
      case 'fork':
        return 'max-w-2xl sm:max-w-3xl';
      case 'questions':
        return 'max-w-xl sm:max-w-2xl';
      case 'tos':
      default:
        return 'max-w-xl';
    }
  }, [currentStage, careerSubStep]);

  if (isCheckingAccess) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white dark:bg-slate-950 font-sans text-xs text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-slate-300 dark:border-slate-700 border-t-[#1738D1] rounded-full animate-spin" />
          <span>Memeriksa status orientasi...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans p-6 sm:p-10 flex flex-col justify-between selection:bg-orange-500 selection:text-white">
      {/* Full-Screen Drag & Drop Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-[#1738D1]/15 dark:bg-[#1738D1]/30 backdrop-blur-xs flex items-center justify-center p-6 sm:p-10 pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full h-full max-w-2xl max-h-[75vh] border-3 border-dashed border-[#1738D1] dark:border-blue-400 bg-white/95 dark:bg-slate-900/95 rounded-3xl shadow-2xl flex flex-col items-center justify-center gap-4 text-center p-8"
            >
              <div className="w-20 h-20 rounded-2xl bg-blue-100 dark:bg-blue-950 text-[#1738D1] dark:text-blue-400 flex items-center justify-center shadow-lg shadow-[#1738D1]/15 scale-110">
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
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/80 text-[#1738D1] dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                Maksimal 10MB
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Minimalist Top Progress Bar */}
      {currentStage === 'questions' && (
        <div className="fixed top-0 left-0 right-0 h-[2px] bg-slate-100 dark:bg-slate-900 z-50 overflow-hidden">
          <motion.div
            className="h-full bg-[#1738D1]"
            initial={{ width: 0 }}
            animate={{ width: `${(currentQuestionIndex / totalQuestions) * 100}%` }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          />
        </div>
      )}

      {/* Top Header & Brand Bar */}
      <header className={`w-full mx-auto transition-all duration-300 ${stageMaxWidth}`}>
        {currentStage !== 'tos' && (
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 mb-2">
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
            <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {currentStage === 'upload_scan' && (scanCompleted ? 'Tinjau Hasil Ekstraksi' : 'Unggah Berkas')}
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
        )}
      </header>

      {/* Center Screen Content */}
      <main className={`w-full mx-auto py-6 sm:py-8 transition-all duration-300 ${stageMaxWidth} ${
        currentStage === 'tos' || currentStage === 'fork' ? 'my-auto' : ''
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
        {currentStage === 'upload_scan' && (
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
                <label
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`w-full p-8 border-2 border-dashed rounded-2xl transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group ${
                    isDragging
                      ? 'border-[#1738D1] bg-blue-100/60 dark:bg-blue-900/40 ring-4 ring-[#1738D1]/15 scale-[1.01]'
                      : 'border-[#1738D1]/50 hover:border-[#1738D1] dark:border-blue-800 bg-blue-50/30 hover:bg-blue-50/60 dark:bg-blue-950/10'
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                      isDragging
                        ? 'scale-110 bg-[#1738D1] text-white shadow-md shadow-[#1738D1]/20'
                        : 'bg-blue-100 dark:bg-blue-900/60 text-[#1738D1] dark:text-blue-400 group-hover:scale-105'
                    }`}
                  >
                    <FileUp size={28} />
                  </div>
                  <div className="text-center space-y-1">
                    <p
                      className={`text-xs font-extrabold transition ${
                        isDragging ? 'text-[#1738D1] dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {isDragging
                        ? 'Lepaskan berkas di sini untuk mulai memindai'
                        : 'Klik untuk pilih file atau tarik berkas ke sini'}
                    </p>
                    <p className="text-[11px] font-medium text-slate-400">
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
                      <span className="flex items-center gap-2 text-[#1738D1]">
                        <span className="w-2 h-2 rounded-full bg-[#1738D1] animate-ping" />
                        {scanStatusText}
                      </span>
                      <span className="text-slate-500 font-mono font-bold">{scanProgress}%</span>
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

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-7">
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        Pendidikan & Jurusan
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={formData.educationLevel}
                          onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                          className="w-28 sm:w-32 shrink-0 px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1738D1]"
                        >
                          <option value="">Jenjang</option>
                          {EDUCATION_LEVELS.map((lvl) => (
                            <option key={lvl} value={lvl}>
                              {lvl}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Jurusan (contoh: Teknik Informatika)"
                          value={formData.major}
                          onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                          className="flex-1 min-w-0 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1738D1]"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-5">
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        Target Posisi
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Staf Operasional, Desainer"
                        value={formData.targetPositions.join(', ')}
                        onChange={(e) => {
                          const val = e.target.value;
                          const parts = val ? val.split(',').map((s) => s.trimStart()) : [];
                          setFormData({ ...formData, targetPositions: parts });
                        }}
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

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Ringkasan Diri (About Me)
                      </label>
                      <span className="text-[10px] font-medium text-[#1738D1] dark:text-blue-400 flex items-center gap-1">
                        <Pencil size={10} /> Bisa disunting langsung
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      placeholder="Tuliskan ringkasan singkat tentang latar belakang, keahlian, dan tujuan karier kamu..."
                      value={formData.summary}
                      onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium leading-relaxed text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1738D1] resize-y"
                    />
                  </div>

                  {/* Ringkasan Data Lengkap Siap Masuk ke CV */}
                  {(formData.extractedExperiences?.length > 0 ||
                    formData.extractedProjects?.length > 0 ||
                    formData.extractedCertifications?.length > 0 ||
                    formData.extractedOrganizations?.length > 0) && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="space-y-0.5">
                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Data Lengkap yang Siap Masuk ke CV Builder
                        </label>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Pastikan data di bawah ini sudah akurat. Kamu bisa mengubahnya langsung jika ada kesalahan.
                        </p>
                      </div>

                      {/* Interactive Tab Navigation */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="tablist" aria-label="Kategori Data CV">
                        {/* Tab 1: Pengalaman */}
                        <button
                          type="button"
                          role="tab"
                          aria-selected={scannedActiveTab === 'experience'}
                          onClick={() => setScannedActiveTab('experience')}
                          className={`relative p-2.5 sm:p-3 rounded-xl text-left transition-all cursor-pointer ${
                            scannedActiveTab === 'experience'
                              ? 'bg-blue-50/90 dark:bg-blue-950/60 border-2 border-[#1738D1] shadow-xs ring-2 ring-[#1738D1]/15'
                              : 'bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase">
                            <Briefcase size={12} className={scannedActiveTab === 'experience' ? 'text-[#1738D1]' : 'text-slate-400'} />
                            <span className={scannedActiveTab === 'experience' ? 'text-[#1738D1] dark:text-blue-300' : 'text-slate-500 dark:text-slate-400'}>
                              Pengalaman
                            </span>
                          </div>
                          <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                            {formData.extractedExperiences?.length || 0} Riwayat Kerja
                          </p>
                          {scannedActiveTab === 'experience' && (
                            <span className="absolute -bottom-[2px] left-3 right-3 h-[3px] bg-[#1738D1] rounded-full" />
                          )}
                        </button>

                        {/* Tab 2: Proyek */}
                        <button
                          type="button"
                          role="tab"
                          aria-selected={scannedActiveTab === 'projects'}
                          onClick={() => setScannedActiveTab('projects')}
                          className={`relative p-2.5 sm:p-3 rounded-xl text-left transition-all cursor-pointer ${
                            scannedActiveTab === 'projects'
                              ? 'bg-blue-50/90 dark:bg-blue-950/60 border-2 border-[#1738D1] shadow-xs ring-2 ring-[#1738D1]/15'
                              : 'bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase">
                            <Sparkles size={12} className={scannedActiveTab === 'projects' ? 'text-purple-600' : 'text-slate-400'} />
                            <span className={scannedActiveTab === 'projects' ? 'text-[#1738D1] dark:text-blue-300' : 'text-slate-500 dark:text-slate-400'}>
                              Proyek
                            </span>
                          </div>
                          <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                            {formData.extractedProjects?.length || 0} Portofolio
                          </p>
                          {scannedActiveTab === 'projects' && (
                            <span className="absolute -bottom-[2px] left-3 right-3 h-[3px] bg-[#1738D1] rounded-full" />
                          )}
                        </button>

                        {/* Tab 3: Sertifikasi */}
                        <button
                          type="button"
                          role="tab"
                          aria-selected={scannedActiveTab === 'certifications'}
                          onClick={() => setScannedActiveTab('certifications')}
                          className={`relative p-2.5 sm:p-3 rounded-xl text-left transition-all cursor-pointer ${
                            scannedActiveTab === 'certifications'
                              ? 'bg-blue-50/90 dark:bg-blue-950/60 border-2 border-[#1738D1] shadow-xs ring-2 ring-[#1738D1]/15'
                              : 'bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase">
                            <Award size={12} className={scannedActiveTab === 'certifications' ? 'text-amber-600' : 'text-slate-400'} />
                            <span className={scannedActiveTab === 'certifications' ? 'text-[#1738D1] dark:text-blue-300' : 'text-slate-500 dark:text-slate-400'}>
                              Sertifikasi
                            </span>
                          </div>
                          <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                            {formData.extractedCertifications?.length || 0} Sertifikat
                          </p>
                          {scannedActiveTab === 'certifications' && (
                            <span className="absolute -bottom-[2px] left-3 right-3 h-[3px] bg-[#1738D1] rounded-full" />
                          )}
                        </button>

                        {/* Tab 4: Organisasi */}
                        <button
                          type="button"
                          role="tab"
                          aria-selected={scannedActiveTab === 'organizations'}
                          onClick={() => setScannedActiveTab('organizations')}
                          className={`relative p-2.5 sm:p-3 rounded-xl text-left transition-all cursor-pointer ${
                            scannedActiveTab === 'organizations'
                              ? 'bg-blue-50/90 dark:bg-blue-950/60 border-2 border-[#1738D1] shadow-xs ring-2 ring-[#1738D1]/15'
                              : 'bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase">
                            <BookOpen size={12} className={scannedActiveTab === 'organizations' ? 'text-emerald-600' : 'text-slate-400'} />
                            <span className={scannedActiveTab === 'organizations' ? 'text-[#1738D1] dark:text-blue-300' : 'text-slate-500 dark:text-slate-400'}>
                              Organisasi
                            </span>
                          </div>
                          <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                            {formData.extractedOrganizations?.length || 0} Organisasi
                          </p>
                          {scannedActiveTab === 'organizations' && (
                            <span className="absolute -bottom-[2px] left-3 right-3 h-[3px] bg-[#1738D1] rounded-full" />
                          )}
                        </button>
                      </div>

                      {/* Active Tab Editable Content */}
                      <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-xs">
                        {/* 1. TAB PENGALAMAN */}
                        {scannedActiveTab === 'experience' && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                                <Briefcase size={14} className="text-[#1738D1]" />
                                <span>Detail Pengalaman Kerja</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-[#1738D1] dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                  {formData.extractedExperiences.length}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={addExperience}
                                className="text-[11px] font-bold text-[#1738D1] hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Plus size={13} /> Tambah Pengalaman
                              </button>
                            </div>

                            {formData.extractedExperiences.length === 0 ? (
                              <div className="py-6 text-center space-y-2">
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  Belum ada riwayat pengalaman terdeteksi dari berkas CV ini.
                                </p>
                                <button
                                  type="button"
                                  onClick={addExperience}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-[#1738D1] bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 cursor-pointer"
                                >
                                  <Plus size={13} /> Tambah Pengalaman Manual
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {formData.extractedExperiences.map((exp: any, i: number) => (
                                  <div
                                    key={exp.id || i}
                                    className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 space-y-2.5 transition-all"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 space-y-2.5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                          <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                                              Posisi / Jabatan
                                            </label>
                                            <input
                                              type="text"
                                              placeholder="Contoh: Staff Administrasi"
                                              value={exp.role || ''}
                                              onChange={(e) => updateExperience(i, 'role', e.target.value)}
                                              className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1738D1]"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                                              Perusahaan / Tempat Kerja
                                            </label>
                                            <input
                                              type="text"
                                              placeholder="Nama Perusahaan"
                                              value={exp.company || ''}
                                              onChange={(e) => updateExperience(i, 'company', e.target.value)}
                                              className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1738D1]"
                                            />
                                          </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                          <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                                              Tanggal Mulai Bekerja
                                            </label>
                                            <CustomDatePicker
                                              value={exp.startDate || parsePeriodToDates(exp.period).startDate}
                                              onChange={(val) => updateExperienceDate(i, 'startDate', val)}
                                              placeholder="Pilih Bulan & Tahun Mulai..."
                                              className="w-full"
                                            />
                                          </div>
                                          <div>
                                            <div className="flex items-center justify-between mb-0.5">
                                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                Tanggal Selesai Bekerja
                                              </label>
                                              <label className="inline-flex items-center gap-1.5 cursor-pointer text-[10px] font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 select-none">
                                                <input
                                                  type="checkbox"
                                                  checked={Boolean(exp.isCurrent ?? parsePeriodToDates(exp.period).isCurrent)}
                                                  onChange={(e) => updateExperienceDate(i, 'isCurrent', e.target.checked)}
                                                  className="w-3 h-3 text-[#1738D1] rounded border-slate-300 dark:border-slate-700 focus:ring-[#1738D1]"
                                                />
                                                <span>Masih Bekerja Di Sini</span>
                                              </label>
                                            </div>
                                            <CustomDatePicker
                                              value={(exp.isCurrent ?? parsePeriodToDates(exp.period).isCurrent) ? 'Sekarang' : (exp.endDate || parsePeriodToDates(exp.period).endDate)}
                                              onChange={(val) => updateExperienceDate(i, 'endDate', val)}
                                              placeholder="Pilih Bulan & Tahun Selesai..."
                                              disabled={Boolean(exp.isCurrent ?? parsePeriodToDates(exp.period).isCurrent)}
                                              allowPresent={true}
                                              minDate={exp.startDate || parsePeriodToDates(exp.period).startDate}
                                              className="w-full"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => deleteExperience(i)}
                                        title="Hapus riwayat ini"
                                        className="p-1.5 mt-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shrink-0 cursor-pointer"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>

                                    <div>
                                      <div className="flex items-center justify-between mb-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                          Deskripsi & Tanggung Jawab (Bisa Langsung Diedit)
                                        </label>
                                        <span className="text-[10px] font-medium text-[#1738D1] dark:text-blue-400 flex items-center gap-1">
                                          <Pencil size={10} /> Edit langsung di kotak
                                        </span>
                                      </div>
                                      <textarea
                                        rows={3}
                                        placeholder="Jelaskan tanggung jawab, tugas harian, atau pencapaian utama selama bekerja..."
                                        value={exp.description || ''}
                                        onChange={(e) => updateExperience(i, 'description', e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs leading-relaxed text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#1738D1] resize-y"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* 2. TAB PROYEK */}
                        {scannedActiveTab === 'projects' && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                                <Sparkles size={14} className="text-purple-600" />
                                <span>Detail Portofolio & Proyek</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                                  {formData.extractedProjects.length}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={addProject}
                                className="text-[11px] font-bold text-[#1738D1] hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Plus size={13} /> Tambah Proyek
                              </button>
                            </div>

                            {formData.extractedProjects.length === 0 ? (
                              <div className="py-6 text-center space-y-2">
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  Belum ada portofolio atau proyek terdeteksi dari berkas CV ini.
                                </p>
                                <button
                                  type="button"
                                  onClick={addProject}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-[#1738D1] bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 cursor-pointer"
                                >
                                  <Plus size={13} /> Tambah Proyek Manual
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {formData.extractedProjects.map((proj: any, i: number) => (
                                  <div
                                    key={proj.id || i}
                                    className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 space-y-2.5 transition-all"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                                        <div>
                                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                                            Nama Proyek
                                          </label>
                                          <input
                                            type="text"
                                            placeholder="Contoh: Redesign Aplikasi Mobile"
                                            value={proj.name || ''}
                                            onChange={(e) => updateProject(i, 'name', e.target.value)}
                                            className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1738D1]"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                                            Peran (Opsional)
                                          </label>
                                          <input
                                            type="text"
                                            placeholder="Contoh: Lead Designer"
                                            value={proj.role || ''}
                                            onChange={(e) => updateProject(i, 'role', e.target.value)}
                                            className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1738D1]"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                                            Periode (Opsional)
                                          </label>
                                          <input
                                            type="text"
                                            placeholder="Contoh: 2023"
                                            value={proj.period || ''}
                                            onChange={(e) => updateProject(i, 'period', e.target.value)}
                                            className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#1738D1]"
                                          />
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => deleteProject(i)}
                                        title="Hapus proyek ini"
                                        className="p-1.5 mt-3.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shrink-0 cursor-pointer"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>

                                    <div>
                                      <div className="flex items-center justify-between mb-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                          Deskripsi Proyek (Bisa Langsung Diedit)
                                        </label>
                                        <span className="text-[10px] font-medium text-[#1738D1] dark:text-blue-400 flex items-center gap-1">
                                          <Pencil size={10} /> Edit langsung di kotak
                                        </span>
                                      </div>
                                      <textarea
                                        rows={3}
                                        placeholder="Jelaskan ringkasan proyek, teknologi yang digunakan, atau dampak hasilnya..."
                                        value={proj.description || ''}
                                        onChange={(e) => updateProject(i, 'description', e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs leading-relaxed text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#1738D1] resize-y"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* 3. TAB SERTIFIKASI */}
                        {scannedActiveTab === 'certifications' && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                                <Award size={14} className="text-amber-600" />
                                <span>Detail Sertifikasi & Lisensi</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                  {formData.extractedCertifications.length}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={addCertification}
                                className="text-[11px] font-bold text-[#1738D1] hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Plus size={13} /> Tambah Sertifikat
                              </button>
                            </div>

                            {formData.extractedCertifications.length === 0 ? (
                              <div className="py-6 text-center space-y-2">
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  Belum ada sertifikasi terdeteksi dari berkas CV ini.
                                </p>
                                <button
                                  type="button"
                                  onClick={addCertification}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-[#1738D1] bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 cursor-pointer"
                                >
                                  <Plus size={13} /> Tambah Sertifikat Manual
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {formData.extractedCertifications.map((cert: any, i: number) => (
                                  <div
                                    key={cert.id || i}
                                    className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 space-y-2 transition-all"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                                        <div>
                                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                                            Nama Sertifikat
                                          </label>
                                          <input
                                            type="text"
                                            placeholder="Contoh: BNSP Digital Marketing"
                                            value={cert.name || ''}
                                            onChange={(e) => updateCertification(i, 'name', e.target.value)}
                                            className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1738D1]"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                                            Penerbit / Penyelenggara
                                          </label>
                                          <input
                                            type="text"
                                            placeholder="Contoh: Google, BNSP, Microsoft"
                                            value={cert.issuer || ''}
                                            onChange={(e) => updateCertification(i, 'issuer', e.target.value)}
                                            className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1738D1]"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                                            Tahun / Tanggal Terbit
                                          </label>
                                          <CustomDatePicker
                                            value={cert.issueDate || ''}
                                            onChange={(val) => updateCertification(i, 'issueDate', val)}
                                            placeholder="Pilih Tanggal Terbit..."
                                            className="w-full"
                                          />
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => deleteCertification(i)}
                                        title="Hapus sertifikat ini"
                                        className="p-1.5 mt-3.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shrink-0 cursor-pointer"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* 4. TAB ORGANISASI */}
                        {scannedActiveTab === 'organizations' && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                                <BookOpen size={14} className="text-emerald-600" />
                                <span>Detail Riwayat Organisasi</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                  {formData.extractedOrganizations.length}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={addOrganization}
                                className="text-[11px] font-bold text-[#1738D1] hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Plus size={13} /> Tambah Organisasi
                              </button>
                            </div>

                            {formData.extractedOrganizations.length === 0 ? (
                              <div className="py-6 text-center space-y-2">
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  Belum ada riwayat organisasi terdeteksi dari berkas CV ini.
                                </p>
                                <button
                                  type="button"
                                  onClick={addOrganization}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-[#1738D1] bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 cursor-pointer"
                                >
                                  <Plus size={13} /> Tambah Organisasi Manual
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {formData.extractedOrganizations.map((org: any, i: number) => (
                                  <div
                                    key={org.id || i}
                                    className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 space-y-2.5 transition-all"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                                        <div>
                                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                                            Nama Organisasi
                                          </label>
                                          <input
                                            type="text"
                                            placeholder="Contoh: BEM Fakultas Teknik"
                                            value={org.name || ''}
                                            onChange={(e) => updateOrganization(i, 'name', e.target.value)}
                                            className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1738D1]"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                                            Jabatan / Posisi
                                          </label>
                                          <input
                                            type="text"
                                            placeholder="Contoh: Koordinator Acara"
                                            value={org.role || ''}
                                            onChange={(e) => updateOrganization(i, 'role', e.target.value)}
                                            className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1738D1]"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                                            Periode
                                          </label>
                                          <input
                                            type="text"
                                            placeholder="Contoh: 2021 - 2022"
                                            value={org.period || ''}
                                            onChange={(e) => updateOrganization(i, 'period', e.target.value)}
                                            className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#1738D1]"
                                          />
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => deleteOrganization(i)}
                                        title="Hapus organisasi ini"
                                        className="p-1.5 mt-3.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shrink-0 cursor-pointer"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>

                                    <div>
                                      <div className="flex items-center justify-between mb-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                          Deskripsi Kegiatan Organisasi (Bisa Langsung Diedit)
                                        </label>
                                        <span className="text-[10px] font-medium text-[#1738D1] dark:text-blue-400 flex items-center gap-1">
                                          <Pencil size={10} /> Edit langsung di kotak
                                        </span>
                                      </div>
                                      <textarea
                                        rows={3}
                                        placeholder="Jelaskan kontribusi, program kerja, atau kegiatan yang kamu jalankan..."
                                        value={org.description || ''}
                                        onChange={(e) => updateOrganization(i, 'description', e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs leading-relaxed text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#1738D1] resize-y"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
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
                    onClick={() => {
                      if (formData.targetPositions.length > 0) {
                        setTargetRoleInput(formData.targetPositions[0]);
                      }
                      // Also save current scanned & edited state to localStorage immediately
                      try {
                        const importedRaw = localStorage.getItem('employr_imported_cv_data');
                        const existing = importedRaw ? JSON.parse(importedRaw) : {};
                        const updated = {
                          ...existing,
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
                        };
                        localStorage.setItem('employr_imported_cv_data', JSON.stringify(updated));
                        if (formData.summary) {
                          userApi.updateProfile({ bio: formData.summary }).catch(() => {});
                        }
                      } catch {}
                      setCurrentStage('career_direction');
                      setCareerSubStep('aiming');
                    }}
                    className="flex-1 py-3 px-5 rounded-xl bg-[#F97316] hover:bg-[#ea580c] text-white font-bold shadow-md shadow-[#F97316]/20 transition flex items-center justify-between gap-3 cursor-pointer active:scale-[0.99]"
                  >
                    <div className="text-left">
                      <div className="text-xs sm:text-sm font-extrabold tracking-tight leading-tight">
                        Simpan & Lanjutkan
                      </div>
                      <div className="text-[11px] font-normal text-orange-100 opacity-90 leading-tight mt-0.5">
                        Langkah selanjutnya: Tentukan arah karier
                      </div>
                    </div>
                    <ArrowRight size={18} className="shrink-0" />
                  </button>
                </div>
              </div>
            )}
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
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#1738D1] dark:text-blue-400 text-[11px] font-extrabold border border-blue-200 dark:border-blue-900/60">
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
                    onClick={() => setAimingChoice('know_role')}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      aimingChoice === 'know_role'
                        ? 'bg-blue-50/50 dark:bg-blue-950/30 border-[#1738D1] ring-2 ring-[#1738D1]/15'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          aimingChoice === 'know_role' ? 'bg-[#1738D1] text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
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
                              aimingChoice === 'know_role' ? 'border-[#1738D1] bg-[#1738D1] text-white' : 'border-slate-300 dark:border-slate-700'
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
                            <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                              Target Role Incaran:
                            </label>
                            <input
                              type="text"
                              value={targetRoleInput}
                              onChange={(e) => setTargetRoleInput(e.target.value)}
                              placeholder="Ketik posisi incaran (misal: Frontend Developer)"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#1738D1] focus:ring-2 focus:ring-[#1738D1]/15 transition"
                            />
                            <div className="space-y-1.5 pt-1">
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Saran cepat:</div>
                              <div className="flex flex-wrap gap-1.5">
                                {[
                                  'Project Manager',
                                  'Frontend Developer',
                                  'Data Analyst',
                                  'Digital Marketer',
                                  'Admin Staff',
                                  'Content Writer',
                                  ...formData.targetPositions.filter(
                                    (p) => !['Project Manager', 'Frontend Developer', 'Data Analyst', 'Digital Marketer', 'Admin Staff', 'Content Writer'].includes(p)
                                  ),
                                ].map((role) => {
                                  const isSelectedRole = targetRoleInput.trim().toLowerCase() === role.toLowerCase();
                                  return (
                                    <button
                                      key={role}
                                      type="button"
                                      onClick={() => setTargetRoleInput(role)}
                                      className={`text-[11px] font-bold px-3 py-1 rounded-lg border transition cursor-pointer active:scale-95 ${
                                        isSelectedRole
                                          ? 'bg-[#1738D1] text-white border-[#1738D1] shadow-xs'
                                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400 hover:bg-slate-50'
                                      }`}
                                    >
                                      {role}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 2. I'm exploring */}
                  <div
                    onClick={() => setAimingChoice('exploring')}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      aimingChoice === 'exploring'
                        ? 'bg-blue-50/50 dark:bg-blue-950/30 border-[#1738D1] ring-2 ring-[#1738D1]/15'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          aimingChoice === 'exploring' ? 'bg-[#1738D1] text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
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
                              aimingChoice === 'exploring' ? 'border-[#1738D1] bg-[#1738D1] text-white' : 'border-slate-300 dark:border-slate-700'
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
                    onClick={() => setAimingChoice('open_opportunities')}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      aimingChoice === 'open_opportunities'
                        ? 'bg-blue-50/50 dark:bg-blue-950/30 border-[#1738D1] ring-2 ring-[#1738D1]/15'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          aimingChoice === 'open_opportunities' ? 'bg-[#1738D1] text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
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
                              aimingChoice === 'open_opportunities' ? 'border-[#1738D1] bg-[#1738D1] text-white' : 'border-slate-300 dark:border-slate-700'
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

                {/* Action Navigation */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
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
                    className="px-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft size={14} /> Ganti Data
                  </button>

                  <button
                    type="button"
                    onClick={handleStartDiagnosis}
                    disabled={aimingChoice === 'know_role' && !targetRoleInput.trim()}
                    className="flex-1 py-3.5 px-6 rounded-xl bg-[#F97316] hover:bg-[#ea580c] text-white font-bold text-xs shadow-md shadow-[#F97316]/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
                  >
                    <span>Lanjutkan Diagnosis</span>
                    <ArrowRight size={16} />
                  </button>
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
                      <DotLottiePlayer
                        src="/animations/ats-optimize.json"
                        autoplay={true}
                        loop={true}
                        className="w-36 h-36 mx-auto"
                        fallback={
                          <div className="w-20 h-20 rounded-2xl bg-blue-50 dark:bg-blue-950 text-[#1738D1] dark:text-blue-400 flex items-center justify-center animate-spin">
                            <Compass size={36} />
                          </div>
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/70 text-[#1738D1] dark:text-blue-400 text-[10px] font-extrabold uppercase tracking-wider border border-blue-200/60">
                        <span className="w-2 h-2 rounded-full bg-[#1738D1] animate-ping" />
                        <span>Sedang Menganalisis</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                        Menyusun Diagnosis Karier...
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                        {aimingChoice === 'know_role'
                          ? `Menyelaraskan profil dan keahlianmu dengan standar peran ${targetRoleInput}...`
                          : aimingChoice === 'exploring'
                          ? 'Menganalisis potensi kecocokan keahlianmu ke berbagai pilihan peran industri...'
                          : 'Menghitung peluang kerja dengan probabilitas lolos seleksi berkas tertinggi...'}
                      </p>
                    </div>

                    {/* Dynamic Progress Bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#1738D1] to-[#F97316]"
                        initial={{ width: '10%' }}
                        animate={{ width: '92%' }}
                        transition={{ duration: 1.9, ease: 'easeInOut' }}
                      />
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
                          <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200">
                            <CheckCircle2 size={40} />
                          </div>
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
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
                        onClick={() => setCareerSubStep('suggested_paths')}
                        className="px-5 py-2.5 rounded-xl bg-[#1738D1] hover:bg-[#132ea8] text-white text-xs font-bold shadow-md shadow-[#1738D1]/20 transition inline-flex items-center gap-2 cursor-pointer active:scale-95"
                      >
                        <span>Lihat Suggested Career Paths</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* 4C: SUGGESTED CAREER PATHS & DIAGNOSTIC CARDS */}
            {careerSubStep === 'suggested_paths' && (
              <motion.div
                key="career-suggested"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6 text-left"
              >
                {/* Banner Title */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/60 dark:from-slate-900 dark:to-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[#1738D1] dark:text-blue-400 text-[10px] font-extrabold uppercase tracking-wider">
                    <CheckCircle2 size={13} />
                    <span>Hasil Diagnosis Arah Karier</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                    Sekarang Employr sudah memahami kariermu.
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Berdasarkan latar belakang, keahlian, dan target peranmu, berikut analisis kecocokan dan rekomendasi langkah karier terbaik:
                  </p>
                </div>

                {/* Unknown Role Banner */}
                {currentDiagnosis.isUnknownRole && (
                  <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5">
                    <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                        Posisi &quot;{currentDiagnosis.primaryRole}&quot; belum tersedia di database analisis kami.
                      </p>
                      <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 leading-relaxed">
                        {currentDiagnosis.unknownRoleMessage}
                      </p>
                    </div>
                  </div>
                )}

                {/* Suggested Career Paths List */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Suggested Career Paths (Pilih 1 atau beberapa):
                    </label>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {selectedCareerPaths.length} peran dipilih
                    </span>
                  </div>

                  <div className="space-y-2">
                    {currentDiagnosis.suggestedPaths.map((path) => {
                      const isSelected = selectedCareerPaths.includes(path.role);
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
                          className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-white dark:bg-slate-800 border-[#1738D1] shadow-xs ring-1 ring-[#1738D1]/20'
                              : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition ${
                                isSelected
                                  ? 'bg-[#1738D1] border-[#1738D1] text-white'
                                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                              }`}
                            >
                              {isSelected && <Check size={12} strokeWidth={3} />}
                            </div>
                            <div className="truncate">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                                  {path.role}
                                </span>
                                {path.isLearned && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 text-[9px] font-bold border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                                    <Sparkles size={9} />
                                    Dipetakan Komunitas ({path.entryCount || 1})
                                  </span>
                                )}
                                {path.isRealisticTransition && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold border border-emerald-200 dark:border-emerald-800">
                                    Jalur Transisi Realistis
                                  </span>
                                )}
                                {path.isPrimaryTarget && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/80 text-[#1738D1] dark:text-blue-300 text-[9px] font-bold border border-blue-200 dark:border-blue-800">
                                    Target Incaran
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                Keahlian cocok: {path.matchedSkills.join(', ')}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-lg text-xs font-black ${
                                path.fitScore >= 90
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                                  : path.fitScore >= 80
                                  ? 'bg-blue-100 dark:bg-blue-950 text-[#1738D1] dark:text-blue-300 border border-blue-200'
                                  : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200'
                              }`}
                            >
                              {path.fitScore}% fit
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4 Instant Diagnostic Bento Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {/* 1. Fit Score Insight */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider">
                      <Target size={12} />
                      <span>{currentDiagnosis.isUnknownRole ? 'Rekomendasi Peran Terdekat' : 'Kecocokan Peran'}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                      {currentDiagnosis.isUnknownRole ? (
                        <>Peran terdekat yang cocok: <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{currentDiagnosis.realisticTransition.role}</span> ({currentDiagnosis.realisticTransition.fitScore}% fit).</>
                      ) : (
                        <>Kamu <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{currentDiagnosis.primaryFitScore}% fit</span> untuk posisi {currentDiagnosis.primaryRole}.</>
                      )}
                    </p>
                  </div>

                  {/* 2. Top Strength */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-[#1738D1] dark:text-blue-400 text-[10px] font-extrabold uppercase tracking-wider">
                      <Zap size={12} />
                      <span>Kekuatan Terbesarmu</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                      Paling kuat di: <span className="text-[#1738D1] dark:text-blue-400 font-extrabold">{currentDiagnosis.topStrength}</span>.
                    </p>
                  </div>

                  {/* 3. Skill Gap */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-[10px] font-extrabold uppercase tracking-wider">
                      <TrendingUp size={12} />
                      <span>Gap Terbesar untuk Ditingkatkan</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                      Fokus peningkatan utama: <span className="text-amber-700 dark:text-amber-400 font-extrabold">{currentDiagnosis.topGap}</span>.
                    </p>
                  </div>

                  {/* 4. Realistic Transition Path */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 text-[10px] font-extrabold uppercase tracking-wider">
                      <Compass size={12} />
                      <span>{currentDiagnosis.isUnknownRole ? 'Jalur yang Bisa Dicoba' : 'Jalur Transisi Realistis'}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                      {currentDiagnosis.isUnknownRole ? (
                        <>{currentDiagnosis.realisticTransition.reason}</>
                      ) : (
                        <><span className="text-purple-700 dark:text-purple-300 font-extrabold">{currentDiagnosis.realisticTransition.role}</span> bisa jadi jalur transisi yang relevan ({currentDiagnosis.realisticTransition.fitScore}% fit) berdasarkan profilmu.</>
                      )}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCareerSubStep('aiming')}
                    className="px-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft size={14} /> Ubah Target Peran
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const finalRoles = selectedCareerPaths.length > 0 ? selectedCareerPaths : [currentDiagnosis.primaryRole];
                      setFormData((prev) => ({ ...prev, targetPositions: finalRoles }));
                      handleFinishAndNavigateTo('/cv', finalRoles, currentDiagnosis);
                    }}
                    disabled={isSubmitting}
                    className="flex-1 py-3.5 rounded-xl bg-[#F97316] hover:bg-[#ea580c] text-white font-bold text-xs shadow-md shadow-[#F97316]/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
                  >
                    <span>{isSubmitting ? 'Menyiapkan CV...' : 'Lanjut ke CV Builder'}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const finalRoles = selectedCareerPaths.length > 0 ? selectedCareerPaths : [currentDiagnosis.primaryRole];
                      setFormData((prev) => ({ ...prev, targetPositions: finalRoles }));
                      handleFinishAndNavigateTo('/beranda', finalRoles, currentDiagnosis);
                    }}
                    className="text-[11px] font-bold text-slate-500 hover:text-[#1738D1] dark:hover:text-blue-400 transition cursor-pointer"
                  >
                    Atau langsung masuk ke Beranda Dashboard →
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Bottom Footer */}
      <footer className={`w-full mx-auto text-center py-4 transition-all duration-300 ${stageMaxWidth}`}>
        <p className="text-xs font-medium text-slate-400 dark:text-slate-600 flex items-center justify-center gap-1.5">
          <Lock size={12} className="text-slate-400" />
          <span>Data kamu aman bersama Employr</span>
        </p>
      </footer>
    </div>
  );
}
