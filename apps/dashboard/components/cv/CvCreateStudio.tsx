'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Sparkles,
  LayoutGrid,
  Target,
  FileText,
  FileUp,
  AlertCircle,
  Briefcase,
  GraduationCap,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  UploadCloud,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Compass,
  Laptop,
  Globe,
  RefreshCw,
  Award,
  BookOpen,
  Wrench,
  Landmark,
  HeartPulse,
  X,
} from 'lucide-react';
import {
  cvTemplates,
  CVTemplatePreview,
  TemplateThumbnailVisual,
  A4PaperlikeCanvas,
  CVData,
} from '@/components/CVView';
import { CvPurpose, CV_PURPOSE_PROFILES, PurposeWeights } from '@/lib/cv-purpose-scoring-engine';
import { getSectionOrderForPurpose } from '@/lib/cv-section-scoring-matrix';
import { generateStarterCvPreset, generateEmptyCvPreset } from '@/lib/cv-starter-presets';
import { cvApi } from '@/lib/api';
import { getStoredSession } from '@/lib/auth';
import { formatIndonesianDate, slugify } from '@/lib/slug';
import { JobTitleSearchSelect } from '@/components/ui/JobTitleSearchSelect';

const PURPOSE_WEIGHT_LABELS: Record<string, string> = {
  experience: 'Pengalaman Kerja Relevan',
  projects: 'Portofolio & Proyek Nyata',
  skills: 'Keahlian Teknis & Keyword',
  education: 'Pendidikan & Prestasi',
  achievement: 'Pencapaian & Angka Nyata',
  organization: 'Organisasi & Kepemimpinan',
  internship: 'Pengalaman Magang / PKL',
  certification: 'Sertifikasi & Lisensi Resmi',
  keywords: 'Kesesuaian Kata Kunci Loker',
  summary: 'Ringkasan Profil & Minat',
  jobTitle: 'Kesesuaian Target Posisi',
  atsReadability: 'Kerapian Format Dokumen',
  clientExperience: 'Hasil Kerja Nyata untuk Klien',
  remoteExperience: 'Kemandirian & Komunikasi Kerja',
  transferableSkills: 'Keahlian Lintas Bidang (Transferable)',
  targetSkills: 'Keahlian di Bidang Baru',
  academicAchievement: 'Prestasi Akademik & IPK',
  language: 'Kemampuan Bahasa Asing',
  communication: 'Komunikasi & Kolaborasi',
  tools: 'Alat & Software Pendukung',
  completeness: 'Kelengkapan Dokumen & Berkas',
};

function getProfileWeights(weights?: PurposeWeights | Record<string, number | undefined>) {
  if (!weights) return [];
  return Object.entries(weights)
    .filter(([_, val]) => typeof val === 'number' && (val as number) > 0)
    .sort((a, b) => ((b[1] as number) || 0) - ((a[1] as number) || 0));
}

function renderPurposeIcon(purposeId: CvPurpose) {
  switch (purposeId) {
    case 'job':
      return <Briefcase className="w-4 h-4" />;
    case 'internship':
      return <GraduationCap className="w-4 h-4" />;
    case 'fresh_graduate':
      return <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    case 'smk_vokasi':
      return <Wrench className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
    case 'healthcare':
      return <HeartPulse className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
    case 'government':
      return <Landmark className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
    case 'freelance':
      return <Laptop className="w-4 h-4" />;
    case 'remote':
      return <Globe className="w-4 h-4" />;
    case 'career_switch':
      return <RefreshCw className="w-4 h-4" />;
    case 'academic_scholarship':
      return <BookOpen className="w-4 h-4" />;
    case 'overseas':
      return <Compass className="w-4 h-4" />;
    case 'promotion':
      return <Award className="w-4 h-4 text-amber-500" />;
    case 'general':
    default:
      return <FileText className="w-4 h-4" />;
  }
}

function getCompactBadgeConfig(purposeId: CvPurpose) {
  switch (purposeId) {
    case 'job':
      return {
        label: 'Populer',
        className: 'bg-blue-50 dark:bg-blue-950/60 text-[#1738D1] dark:text-blue-300 border-blue-200/80 dark:border-blue-900',
      };
    case 'fresh_graduate':
      return {
        label: 'Lulusan D3 / S1',
        className: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-900',
      };
    case 'smk_vokasi':
      return {
        label: 'Praktik & Sertifikasi',
        className: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-900',
      };
    case 'healthcare':
      return {
        label: 'STR & Lisensi Klinis',
        className: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-900',
      };
    case 'internship':
      return {
        label: 'Mahasiswa & Pelajar',
        className: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-900',
      };
    case 'government':
      return {
        label: 'Seleksi FHCI & Publik',
        className: 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200/80 dark:border-sky-900',
      };
    case 'career_switch':
      return {
        label: 'Lintas Bidang',
        className: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-900',
      };
    case 'freelance':
      return {
        label: 'Portofolio Klien',
        className: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      };
    case 'remote':
      return {
        label: 'Kerja Jarak Jauh',
        className: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      };
    case 'academic_scholarship':
      return {
        label: 'Akademik & Riset',
        className: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      };
    case 'overseas':
      return {
        label: 'Program Global',
        className: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      };
    case 'promotion':
      return {
        label: 'Internal Kantor',
        className: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      };
    case 'general':
    default:
      return {
        label: 'Master Cadangan',
        className: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      };
  }
}

const STORAGE_DRAFT_KEY = 'employr_cv_create_draft';

export function CvCreateStudio() {
  const router = useRouter();

  // Wizard Step: 1 = Tujuan, 2 = Template, 3 = Konfigurasi
  const [step, setStep] = useState<number>(1);

  // Step 1: Tujuan CV (Master-Detail Architecture di Desktop, Accordion di Mobile)
  const [selectedPurpose, setSelectedPurpose] = useState<CvPurpose>('job');
  const [purposeCategoryFilter, setPurposeCategoryFilter] = useState<
    'all' | 'entry' | 'career' | 'public' | 'flexible' | 'academic'
  >('all');
  const [expandedPurposeId, setExpandedPurposeId] = useState<CvPurpose | null>('job');
  const [showAllPurposes, setShowAllPurposes] = useState<boolean>(false);

  // Sinkronisasi accordion: saat tujuan aktif berubah, set accordion aktif ke tujuan tersebut
  useEffect(() => {
    if (selectedPurpose) {
      setExpandedPurposeId(selectedPurpose);
    }
  }, [selectedPurpose]);

  // Jika user memilih tujuan di luar top 6 (misal dari draft atau klik detail), otomatis buka list
  useEffect(() => {
    if (
      selectedPurpose &&
      !['job', 'fresh_graduate', 'smk_vokasi', 'healthcare', 'internship', 'government', 'career_switch'].includes(selectedPurpose)
    ) {
      setShowAllPurposes(true);
    }
  }, [selectedPurpose]);

  // Step 2: Template CV
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('ats-modern');
  const [templateFilterTab, setTemplateFilterTab] = useState<'all' | 'popular' | 'clean' | 'compact'>('all');
  const [mobileTemplateView, setMobileTemplateView] = useState<'templates' | 'preview'>('templates');

  // Step 3: Konfigurasi Identitas & Live Preview
  const [mobileStep3View, setMobileStep3View] = useState<'config' | 'preview'>('config');
  const [cvTitle, setCvTitle] = useState<string>('');
  const [targetJobRole, setTargetJobRole] = useState<string>('');
  const [isEditingTargetRole, setIsEditingTargetRole] = useState<boolean>(false);
  const [startMode, setStartMode] = useState<'example' | 'empty' | 'import'>('example');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const [isScanningFile, setIsScanningFile] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanStatusText, setScanStatusText] = useState<string>('Membaca berkas dokumen...');
  const [scanCompleted, setScanCompleted] = useState<boolean>(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [parsedImportedData, setParsedImportedData] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasSubmittedAttempt, setHasSubmittedAttempt] = useState<boolean>(false);
  const [activeConfigDrawer, setActiveConfigDrawer] = useState<'purpose' | 'template' | null>(null);

  // Close contextual drawer on Escape key (WCAG AA & Microsoft Fluent rule)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeConfigDrawer) {
        setActiveConfigDrawer(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeConfigDrawer]);

  // Load draft from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(STORAGE_DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.step) setStep(Math.min(3, Math.max(1, parsed.step)));
        if (parsed.purpose) setSelectedPurpose(parsed.purpose);
        if (parsed.templateId) setSelectedTemplateId(parsed.templateId);
        if (parsed.title) setCvTitle(parsed.title);
        if (parsed.targetRole) setTargetJobRole(parsed.targetRole);
        if (parsed.startMode) setStartMode(parsed.startMode);
      }
    } catch {
      // Ignore parse error
    }
  }, []);

  // Save draft to localStorage on change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        STORAGE_DRAFT_KEY,
        JSON.stringify({
          step,
          purpose: selectedPurpose,
          templateId: selectedTemplateId,
          title: cvTitle,
          targetRole: targetJobRole,
          startMode,
        })
      );
    } catch {
      // Ignore save error
    }
  }, [step, selectedPurpose, selectedTemplateId, cvTitle, targetJobRole, startMode]);

  // Set default title when template or purpose changes and user hasn't typed custom title
  useEffect(() => {
    const rawTplName = cvTemplates.find((t) => t.id === selectedTemplateId)?.name || 'Standard';
    const cleanTplName = rawTplName.replace(/^ATS\s+/i, '').trim();
    if (!cvTitle || cvTitle.startsWith('CV ATS')) {
      const role = targetJobRole.trim();
      setCvTitle(role ? `CV ATS - ${role}` : `CV ATS (${cleanTplName})`);
    }
  }, [selectedTemplateId, targetJobRole]);

  // Filter templates
  const availableTemplates = useMemo(() => {
    const list = cvTemplates.filter((t) => !t.hidden);
    if (templateFilterTab === 'popular') {
      return list.filter((t) => t.id === 'ats-modern' || t.id === 'ketat-serif' || t.id === 'harvard-modern');
    }
    if (templateFilterTab === 'clean') {
      return list.filter((t) => t.id === 'luasa-minimal' || t.id === 'minimalist-executive' || t.id === 'ats-modern');
    }
    if (templateFilterTab === 'compact') {
      return list.filter((t) => t.id === 'ketat-serif' || t.id === 'ats-compact' || t.id === 'rezi-classic');
    }
    return list;
  }, [templateFilterTab]);

  // Preview dummy data tailored to current selected purpose
  const previewData = useMemo(() => {
    return generateStarterCvPreset({
      purpose: selectedPurpose,
      targetRole: targetJobRole.trim() || 'Software Engineer',
      templateId: selectedTemplateId,
    });
  }, [selectedPurpose, targetJobRole, selectedTemplateId]);

  // Step 3 live dynamic preview data based on startMode (example, empty, import)
  const step3PreviewData = useMemo<Partial<CVData>>(() => {
    const currentSession = getStoredSession();
    const onboardingProfileStr =
      typeof window !== 'undefined' ? localStorage.getItem('cuti_onboarding_profile') : null;
    const onboardingProfile = onboardingProfileStr ? JSON.parse(onboardingProfileStr) : null;
    // Nama kandidat di lembar A4 CV murni berasal dari profil pengguna / data impor / nama placeholder,
    // TIDAK dipengaruhi oleh judul berkas dokumen (cvTitle) yang hanya berfungsi sebagai nama file simpan.
    const candidateName =
      currentSession?.name ||
      onboardingProfile?.fullName ||
      (startMode === 'empty' ? 'Nama Lengkap Kamu' : 'Alexander Pratama, S.Kom.');

    // Mode 'example' ATAU Mode 'import' yang belum mengunggah berkas -> tetap tampilkan contoh dummy sesuai Tujuan CV
    if (startMode === 'example' || (startMode === 'import' && !parsedImportedData)) {
      return generateStarterCvPreset({
        purpose: selectedPurpose,
        targetRole: targetJobRole.trim() || 'Software Engineer',
        templateId: selectedTemplateId,
        userName: candidateName,
        userEmail: currentSession?.email || onboardingProfile?.contactInfo || 'alexander.pratama@email.com',
        userPhone: (currentSession as any)?.phone || onboardingProfile?.phone || '+62 812-3456-7890',
        userLocation: onboardingProfile?.location || 'Jakarta, Indonesia',
      });
    }

    if (startMode === 'import' && parsedImportedData) {
      return {
        purpose: selectedPurpose,
        sectionOrder: getSectionOrderForPurpose(selectedPurpose),
        fullName: parsedImportedData.fullName || candidateName,
        headline: targetJobRole.trim() || parsedImportedData.targetPositions?.[0] || 'Target Posisi',
        target_position: targetJobRole.trim() || parsedImportedData.targetPositions?.[0] || 'Target Posisi',
        email: parsedImportedData.contactInfo?.email || parsedImportedData.email || currentSession?.email || '',
        phone: parsedImportedData.contactInfo?.phone || parsedImportedData.phone || '',
        location: parsedImportedData.contactInfo?.location || parsedImportedData.location || '',
        summary: parsedImportedData.summary || '',
        skills: parsedImportedData.skills || [],
        experience: parsedImportedData.experience || [],
        internships: parsedImportedData.internships || [],
        education: parsedImportedData.education || [],
        projects: parsedImportedData.projects || [],
        certifications: parsedImportedData.certifications || [],
        organizations: parsedImportedData.organizations || [],
        languages: parsedImportedData.languages || [],
        courses: parsedImportedData.courses || [],
        scholarships: parsedImportedData.scholarships || [],
        volunteers: parsedImportedData.volunteers || [],
        references: parsedImportedData.references || [],
      };
    }

    // Mode 'empty' (Lembar Bersih): Mengikuti struktur & urutan section dari Tujuan CV yang dipilih
    return generateEmptyCvPreset({
      purpose: selectedPurpose,
      targetRole: targetJobRole.trim() || 'Software Engineer',
      templateId: selectedTemplateId,
      userName: candidateName,
      userEmail: currentSession?.email || onboardingProfile?.contactInfo || 'email@kamu.com',
      userPhone: (currentSession as any)?.phone || onboardingProfile?.phone || '+62 812-xxxx-xxxx',
      userLocation: onboardingProfile?.location || 'Jakarta, Indonesia',
    });
  }, [startMode, selectedPurpose, targetJobRole, selectedTemplateId, parsedImportedData]);

  // Validation
  const isTitleValid = cvTitle.trim().length > 0;
  const isTargetRoleValid = targetJobRole.trim().length > 0;
  const isStep3Valid = isTitleValid && isTargetRoleValid;

  // File Upload & Auto-Scan Handler (Identik Onboarding Architecture)
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    const allowedExtensions = ['.pdf', '.docx', '.doc', '.txt', '.json'];
    const fileName = file.name.toLowerCase();
    const isAllowed = allowedExtensions.some((ext) => fileName.endsWith(ext));
    if (!isAllowed) {
      setScanError('Format berkas tidak didukung. Silakan gunakan format PDF, DOCX, DOC, atau TXT.');
      setScanCompleted(false);
      setUploadedFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setScanError('Ukuran berkas melebihi batas maksimal 10MB.');
      setScanCompleted(false);
      setUploadedFile(null);
      return;
    }

    setUploadedFile(file);
    setIsScanningFile(true);
    setScanProgress(15);
    setScanStatusText('Membaca berkas dokumen...');
    setScanError(null);

    // Dynamic micro-progress ticker while awaiting server extraction
    let currentProgress = 15;
    const progressInterval = setInterval(() => {
      if (currentProgress < 50) {
        currentProgress += Math.floor(Math.random() * 5) + 3;
        setScanStatusText('Membaca berkas dokumen...');
      } else if (currentProgress < 85) {
        currentProgress += Math.floor(Math.random() * 4) + 2;
        setScanStatusText('Mengekstrak pengalaman, pendidikan, dan kontak...');
      } else if (currentProgress < 96) {
        currentProgress += 1;
        setScanStatusText('Menyinkronkan data ke tata letak template ATS...');
      }
      setScanProgress(currentProgress);
    }, 280);

    try {
      const body = new FormData();
      body.append('file', file);

      const res = await fetch('/api/cv/parse', {
        method: 'POST',
        body,
      });

      const result = await res.json();
      clearInterval(progressInterval);

      if (!res.ok || !result.success) {
        setScanError(
          result.error ||
            'Berkas tidak dapat dipindai. Pastikan format PDF/DOCX memuat informasi pendidikan atau pengalaman kamu.'
        );
        setIsScanningFile(false);
        setScanCompleted(false);
        return;
      }

      const data = result.data || {};
      setParsedImportedData(data);
      setScanStatusText('Ekstraksi berkas selesai!');
      setScanProgress(100);
      setScanCompleted(true);

      // Auto-fill title & role if available
      if (data.targetPositions?.[0] && !targetJobRole) {
        setTargetJobRole(data.targetPositions[0]);
      }
      if (data.fullName && (!cvTitle || cvTitle.startsWith('CV ATS'))) {
        setCvTitle(`CV ATS - ${data.fullName}`);
      }
    } catch (err: any) {
      setScanError(err.message || 'Gagal mengunggah berkas. Silakan coba lagi.');
      setScanCompleted(false);
    } finally {
      setIsScanningFile(false);
    }
  };

  // Final Action: Create CV and redirect to /cv/[id]
  const handleFinalSubmit = async () => {
    setHasSubmittedAttempt(true);
    if (!isStep3Valid) return;

    setIsSubmitting(true);
    try {
      const currentSession = getStoredSession();
      const onboardingProfileStr =
        typeof window !== 'undefined' ? localStorage.getItem('cuti_onboarding_profile') : null;
      const onboardingProfile = onboardingProfileStr ? JSON.parse(onboardingProfileStr) : null;

      let initialData: Partial<CVData> = {};

      if (startMode === 'example' || (startMode === 'import' && !parsedImportedData)) {
        const preset = generateStarterCvPreset({
          purpose: selectedPurpose,
          targetRole: targetJobRole.trim() || 'Professional',
          templateId: selectedTemplateId,
          userName: currentSession?.name || onboardingProfile?.fullName || '',
          userEmail: currentSession?.email || onboardingProfile?.contactInfo || '',
          userPhone: (currentSession as any)?.phone || onboardingProfile?.phone || '',
          userLocation: onboardingProfile?.location || 'Indonesia',
        });
        initialData = { ...preset };
      } else if (startMode === 'import' && parsedImportedData) {
        initialData = {
          purpose: selectedPurpose,
          sectionOrder: getSectionOrderForPurpose(selectedPurpose),
          fullName: parsedImportedData.fullName || currentSession?.name || 'Nama Lengkap',
          headline: targetJobRole.trim() || parsedImportedData.targetPositions?.[0] || 'Professional',
          email: parsedImportedData.contactInfo?.email || parsedImportedData.email || currentSession?.email || '',
          phone: parsedImportedData.contactInfo?.phone || parsedImportedData.phone || '',
          location: parsedImportedData.contactInfo?.location || parsedImportedData.location || '',
          summary: parsedImportedData.summary || '',
          skills: parsedImportedData.skills || [],
          experience: parsedImportedData.experience || [],
          internships: parsedImportedData.internships || [],
          education: parsedImportedData.education || [],
          projects: parsedImportedData.projects || [],
          certifications: parsedImportedData.certifications || [],
          organizations: parsedImportedData.organizations || [],
          languages: parsedImportedData.languages || [],
          courses: parsedImportedData.courses || [],
          scholarships: parsedImportedData.scholarships || [],
          volunteers: parsedImportedData.volunteers || [],
          references: parsedImportedData.references || [],
        };
      } else {
        // Mode 'empty': Mengikuti susunan section tujuan CV yang dipilih (bukan di-reset ke 0 semua)
        const emptyPreset = generateEmptyCvPreset({
          purpose: selectedPurpose,
          targetRole: targetJobRole.trim() || 'Professional',
          templateId: selectedTemplateId,
          userName: currentSession?.name || onboardingProfile?.fullName || 'Nama Lengkap',
          userEmail: currentSession?.email || onboardingProfile?.contactInfo || '',
          userPhone: (currentSession as any)?.phone || onboardingProfile?.phone || '',
          userLocation: onboardingProfile?.location || 'Indonesia',
        });
        initialData = { ...emptyPreset };
      }

      const newId =
        typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `cv-${Date.now()}`;
      const nowStr = formatIndonesianDate(new Date());
      const rawTitle = cvTitle.trim() || 'CV ATS Baru';
      const initialSlug = slugify(rawTitle) || 'cv-ats';

      const newCV: CVData = {
        id: newId,
        title: rawTitle,
        slug: initialSlug,
        target_position: targetJobRole.trim(),
        purpose: selectedPurpose,
        templateId: selectedTemplateId,
        createdAt: nowStr,
        updatedAt: nowStr,
        ...initialData,
      } as CVData;

      // Optimistic save to localStorage (simpan baik untuk ID maupun Slug agar CVView langsung mengenali)
      if (typeof window !== 'undefined') {
        try {
          const storedList = localStorage.getItem('cuti_cv_list');
          const cvList = storedList ? JSON.parse(storedList) : [];
          const updatedList = [newCV, ...cvList];
          localStorage.setItem('cuti_cv_list', JSON.stringify(updatedList));
          localStorage.setItem('cuti_cv_active_draft', JSON.stringify(newCV));
          localStorage.setItem(`cuti_cv_data_${newId}`, JSON.stringify(newCV));
          localStorage.setItem(`cuti_cv_data_${initialSlug}`, JSON.stringify(newCV));
          localStorage.removeItem(STORAGE_DRAFT_KEY);
        } catch (e) {
          console.error('[CvCreateStudio] Error caching to localStorage:', e);
        }
      }

      // Persist ke Server Database sebelum redirect untuk mencegah race condition dan redirect loop UUID -> Slug
      try {
        const created: any = await cvApi.create(newCV);
        const destination = created?.slug || initialSlug || created?.id || newId;
        const serverCV = { ...newCV, ...(created || {}), id: created?.id || newId };
        if (typeof window !== 'undefined') {
          const storedList = localStorage.getItem('cuti_cv_list');
          const list = storedList ? JSON.parse(storedList) : [];
          const synced = list.map((c: any) => (c.id === newId ? serverCV : c));
          localStorage.setItem('cuti_cv_list', JSON.stringify(synced));
          localStorage.setItem('cuti_cv_active_draft', JSON.stringify(serverCV));
          localStorage.setItem(`cuti_cv_data_${serverCV.id}`, JSON.stringify(serverCV));
          localStorage.setItem(`cuti_cv_data_${destination}`, JSON.stringify(serverCV));
        }
        router.replace(`/cv/${destination}`);
      } catch (err) {
        console.error('[CvCreateStudio] Server save error, fallback optimistic navigation:', err);
        router.replace(`/cv/${initialSlug}`);
      }
    } catch (err) {
      console.error('[CvCreateStudio] Failed creating CV:', err);
      setIsSubmitting(false);
    }
  };

  const handleExitToCvList = () => {
    router.push('/cv');
  };

  const activeTemplateName = cvTemplates.find((t) => t.id === selectedTemplateId)?.name || 'ATS Standard';
  const activePurposeProfile = CV_PURPOSE_PROFILES[selectedPurpose] || CV_PURPOSE_PROFILES.job;

  const filteredPurposes = useMemo(() => {
    // Prioritaskan urutan tujuan yang paling banyak digunakan oleh talenta Indonesia (16-24 tahun)
    const priorityOrder: CvPurpose[] = [
      'job',
      'fresh_graduate',
      'smk_vokasi',
      'healthcare',
      'internship',
      'government',
      'career_switch',
      'freelance',
      'remote',
      'academic_scholarship',
      'overseas',
    ];

    const allProfiles = priorityOrder
      .map((id) => CV_PURPOSE_PROFILES[id])
      .filter(Boolean);

    return allProfiles.filter(
      (p) => purposeCategoryFilter === 'all' || p.category === purposeCategoryFilter
    );
  }, [purposeCategoryFilter]);

  const displayedPurposes = useMemo(() => {
    if (showAllPurposes || purposeCategoryFilter !== 'all') {
      return filteredPurposes;
    }
    return filteredPurposes.slice(0, 6);
  }, [filteredPurposes, showAllPurposes, purposeCategoryFilter]);

  const topWeights = useMemo(() => {
    if (!activePurposeProfile || !activePurposeProfile.weights) return [];
    return Object.entries(activePurposeProfile.weights)
      .filter(([_, val]) => typeof val === 'number' && (val as number) > 0)
      .sort((a, b) => (b[1] as number) - (a[1] as number));
  }, [activePurposeProfile]);

  return (
    <div className="h-full w-full min-h-full max-h-full overflow-hidden flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans select-none">
      {/* ========================================================= */}
      {/* TOP HEADER STUDIO: Dedicated Focus Mode Bar               */}
      {/* ========================================================= */}
      <header className="h-[60px] shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 flex items-center justify-between z-30 shadow-2xs">
        {/* Left: Exit & Brand Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleExitToCvList}
            className="min-h-[44px] min-w-[44px] sm:min-w-0 sm:min-h-0 px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs focus-visible:ring-2 focus-visible:ring-[#1738D1]"
            title="Kembali ke Daftar CV"
            aria-label="Kembali ke Daftar CV"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Daftar CV</span>
          </button>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />

          <div className="flex items-center gap-2 min-w-0">
            <span className="font-black text-xs md:text-sm text-slate-900 dark:text-white tracking-tight truncate hidden md:inline-block">
              Studio Pembuatan CV
            </span>
            <span className="hidden md:inline-flex px-2 py-0.5 rounded-[8px] text-[10px] font-black uppercase bg-blue-50 dark:bg-blue-950/70 text-[#1738D1] dark:text-blue-400 border border-blue-200 dark:border-blue-900">
              ATS Standard
            </span>
          </div>
        </div>

        {/* Center: Interactive Stepper Indicator */}
        <div className="flex items-center gap-1 sm:gap-2">
          {[
            { num: 1, label: 'Tujuan CV' },
            { num: 2, label: 'Pilih Template' },
            { num: 3, label: 'Konfigurasi' },
          ].map((item, idx) => {
            const isActive = step === item.num;
            const isPassed = step > item.num;
            return (
              <React.Fragment key={item.num}>
                {idx > 0 && (
                  <div
                    className={`w-2.5 sm:w-8 h-0.5 transition-colors ${
                      step >= item.num ? 'bg-[#1738D1]' : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  />
                )}
                <button
                  type="button"
                  onClick={() => setStep(item.num)}
                  className={`min-h-[36px] sm:min-h-[40px] flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-[10px] text-xs font-bold transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[#1738D1] ${
                    isActive
                      ? 'bg-[#1738D1] text-white shadow-xs'
                      : isPassed
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  aria-label={`Langkah ${item.num}: ${item.label}`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                      isActive
                        ? 'bg-white text-[#1738D1]'
                        : isPassed
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {isPassed ? <Check className="w-3 h-3 stroke-[3]" /> : item.num}
                  </span>
                  <span className="hidden md:inline font-bold">{item.label}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Right: Mode Badge & Quick Cancel */}
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-[10px] text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Fokus Mode</span>
          </div>
          <button
            type="button"
            onClick={handleExitToCvList}
            className="min-h-[40px] flex items-center justify-center text-xs font-bold text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer px-2.5 py-1 focus-visible:ring-2 focus-visible:ring-rose-500 rounded-[8px]"
          >
            Batal
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* BODY WORKSPACE AREA (Scrollable di mobile, dual-pane di desktop) */}
      {/* ========================================================= */}
      <main
        className="flex-1 min-h-0 w-full flex flex-col overflow-y-auto lg:overflow-hidden no-scrollbar px-3 sm:px-5 lg:px-6 py-3 sm:py-4"
      >
        <div className="w-full h-full flex-1 min-h-0 flex flex-col">
          {/* ======================================================= */}
          {/* STEP 1: MASTER-DETAIL ARSITEKTUR TUJUAN CV             */}
          {/* ======================================================= */}
          {step === 1 && (
            <div className="w-full h-full flex-1 min-h-0 flex flex-col lg:overflow-hidden animate-in fade-in duration-200">
              {/* Header Step 1: Status, Heading, dan Filter Tabs */}
              <div className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3 pb-2.5 sm:pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1738D1] dark:text-blue-400 uppercase tracking-wider">
                    <Target className="w-3.5 h-3.5 text-orange-500" />
                    <span>Target Karier &amp; Kriteria Lolos</span>
                  </div>
                  <h1 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Tentukan Arah Karier &amp; Tujuan CV
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    <span className="hidden sm:inline">Pilih target di panel kiri. Pelajari kriteria penilaian dan tips lolos seleksi HRD di panel kanan.</span>
                    <span className="sm:hidden">Pilih target karier. Buka accordion pada kartu untuk membaca kriteria lolos &amp; panduan HRD.</span>
                  </p>
                </div>

                {/* Filter Kategori Tabs (Lega di mobile karena switcher list/detail dihapus) */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
                  {[
                    { id: 'all', label: 'Semua (11)' },
                    { id: 'entry', label: 'Pemula & Sekolah' },
                    { id: 'career', label: 'Karier' },
                    { id: 'public', label: 'BUMN & Publik' },
                    { id: 'flexible', label: 'Fleksibel' },
                    { id: 'academic', label: 'Akademik' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setPurposeCategoryFilter(tab.id as any)}
                      className={`min-h-[34px] px-2.5 sm:px-3 py-1 rounded-[8px] text-xs font-bold transition whitespace-nowrap cursor-pointer focus-visible:ring-2 focus-visible:ring-[#1738D1] ${
                        purposeCategoryFilter === tab.id
                          ? 'bg-[#1738D1] text-white shadow-2xs'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Posisi Search Bar di Step 1 */}
              <div className="shrink-0 pt-2 pb-1">
                <div className="bg-white dark:bg-slate-900 p-2.5 sm:p-3.5 rounded-[10px] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1.5 sm:space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-[#1738D1] dark:text-blue-400 shrink-0" />
                    <label
                      htmlFor="target-job-role"
                      className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider"
                    >
                      Target Posisi Lowongan <span className="text-rose-500">*</span>
                    </label>
                  </div>

                  <JobTitleSearchSelect
                    id="target-job-role"
                    value={targetJobRole}
                    onChange={(val) => {
                      setTargetJobRole(val);
                      if (!cvTitle || cvTitle.startsWith('CV ATS')) {
                        setCvTitle(`CV ATS - ${val}`);
                      }
                    }}
                    placeholder="Ketik target posisi (contoh: barista, admin gudang, kurir motor)..."
                  />
                </div>
              </div>

              {/* Master-Detail 2 Kolom Kiri & Kanan */}
              <div className="w-full flex-1 min-h-0 flex flex-col lg:flex-row lg:overflow-hidden pt-1.5 gap-3 sm:gap-4">
                {/* KOLOM KIRI: Master List Pilihan (Full width di mobile, fixed width di desktop) */}
                <div
                  role="radiogroup"
                  aria-label="Pilihan Tujuan Karier"
                  className="w-full lg:w-[540px] xl:w-[600px] 2xl:w-[660px] shrink-0 lg:h-full min-h-0 border border-slate-200 dark:border-slate-800 rounded-[10px] lg:overflow-y-auto overscroll-contain bg-slate-50 dark:bg-slate-950/60 p-2.5 sm:p-3.5 pb-24 lg:pb-4 block"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 content-start">
                    {displayedPurposes.map((prof) => {
                      const isSelected = selectedPurpose === prof.id;
                      const isExpanded = expandedPurposeId === prof.id;
                      const badgeConfig = getCompactBadgeConfig(prof.id);
                      const cardWeights = getProfileWeights(prof.weights);

                      return (
                        <div
                          key={prof.id}
                          role="radio"
                          aria-checked={isSelected}
                          tabIndex={0}
                          onClick={() => {
                            setSelectedPurpose(prof.id);
                            if (expandedPurposeId !== prof.id) {
                              setExpandedPurposeId(prof.id);
                            }
                          }}
                          onDoubleClick={() => {
                            setSelectedPurpose(prof.id);
                            setStep(2);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              setSelectedPurpose(prof.id);
                              setStep(2);
                            } else if (e.key === ' ') {
                              e.preventDefault();
                              setSelectedPurpose(prof.id);
                              setExpandedPurposeId(prof.id);
                            }
                          }}
                          className={`p-3 rounded-[10px] border transition-all cursor-pointer flex flex-col justify-between text-left relative group select-none outline-none focus-visible:ring-2 focus-visible:ring-[#1738D1] min-h-[104px] ${
                            isSelected
                              ? 'bg-blue-50/90 dark:bg-blue-950/70 border-[#1738D1] ring-2 ring-[#1738D1]/20 shadow-xs'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700 hover:shadow-2xs'
                          }`}
                          title="Pilih tujuan karier untuk melihat kriteria lolos seleksi HRD"
                        >
                          {/* Baris Atas: Ikon + Judul Profil + Radio Checkmark */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={`w-7 h-7 rounded-[7px] flex items-center justify-center shrink-0 transition ${
                                  isSelected
                                    ? 'bg-[#1738D1] text-white shadow-xs'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/60 group-hover:text-[#1738D1]'
                                }`}
                              >
                                {renderPurposeIcon(prof.id)}
                              </div>
                              <h3
                                className={`font-black text-xs sm:text-[13px] leading-tight truncate ${
                                  isSelected
                                    ? 'text-[#1738D1] dark:text-blue-400'
                                    : 'text-slate-900 dark:text-white group-hover:text-[#1738D1]'
                                }`}
                              >
                                {prof.title}
                              </h3>
                            </div>

                            {/* Radio checkmark circle */}
                            <div
                              className={`w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 transition ${
                                isSelected
                                  ? 'bg-[#1738D1] text-white shadow-2xs'
                                  : 'border-2 border-slate-300 dark:border-slate-700 group-hover:border-blue-400'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>

                          {/* Baris Tengah: Deskripsi 2 Baris Lengkap (line-clamp-2) */}
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed my-2">
                            {prof.objective}
                          </p>

                          {/* Baris Bawah: Badge Kompak di Baris Bawahnya */}
                          <div className="flex items-center justify-between gap-1.5 pt-0.5 mt-auto">
                            <span
                              className={`px-1.5 py-0.5 rounded-[4px] text-[8px] sm:text-[9px] font-bold uppercase tracking-wider border shrink-0 ${
                                badgeConfig.className
                              }`}
                            >
                              {badgeConfig.label}
                            </span>
                            {isSelected && (
                              <span className="text-[9px] font-bold text-[#1738D1] dark:text-blue-400 flex items-center gap-1">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                                <span>Dipilih</span>
                              </span>
                            )}
                          </div>

                          {/* ========================================================= */}
                          {/* ACCORDION KHUSUS MOBILE (< lg): In-place Kriteria & Panduan */}
                          {/* ========================================================= */}
                          <div className="lg:hidden pt-2 border-t border-slate-100 dark:border-slate-800/80 mt-2.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPurpose(prof.id);
                                setExpandedPurposeId((prev) => (prev === prof.id ? null : prof.id));
                              }}
                              className={`w-full min-h-[38px] px-2.5 py-1.5 rounded-[8px] text-[11px] font-bold transition cursor-pointer flex items-center justify-between gap-1.5 focus-visible:ring-2 focus-visible:ring-[#1738D1] ${
                                isExpanded
                                  ? 'bg-blue-100/70 dark:bg-blue-950/60 text-[#1738D1] dark:text-blue-300'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                              }`}
                              aria-expanded={isExpanded}
                            >
                              <span className="flex items-center gap-1.5">
                                <Target className="w-3.5 h-3.5 text-[#1738D1] dark:text-blue-400 shrink-0" />
                                <span>{isExpanded ? 'Tutup Kriteria & Panduan' : 'Kriteria Lolos & Panduan HRD'}</span>
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              )}
                            </button>

                            {/* Konten Accordion Mobile */}
                            {isExpanded && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-200"
                              >
                                {/* 1. Fokus Skrining HRD */}
                                <div className="p-2.5 rounded-[8px] bg-blue-50/80 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-900/60 space-y-1">
                                  <div className="flex items-center gap-1 text-[11px] font-bold text-[#1738D1] dark:text-blue-400">
                                    <Target className="w-3 h-3 shrink-0" />
                                    <span>Kunci Lolos Skrining HRD:</span>
                                  </div>
                                  <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                    {prof.evaluationFocusText}
                                  </p>
                                </div>

                                {/* 2. Ringkasan Bobot Penilaian Utama */}
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                    <span>Distribusi Bobot Penilaian</span>
                                    <span className="text-[#1738D1] dark:text-blue-400">Total 100%</span>
                                  </div>
                                  <div className="grid grid-cols-1 gap-1">
                                    {cardWeights.slice(0, 4).map(([key, val]) => (
                                      <div
                                        key={key}
                                        className="p-1.5 px-2 rounded-[6px] border border-slate-200/70 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-[11px]"
                                      >
                                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate pr-2">
                                          {PURPOSE_WEIGHT_LABELS[key] || key}
                                        </span>
                                        <span className="font-black text-[#1738D1] dark:text-blue-400 shrink-0">
                                          {val}%
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* 3. Komponen Wajib (Must Have) */}
                                <div className="space-y-1">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span>Komponen Wajib (Must Have):</span>
                                  </span>
                                  <div className="flex flex-wrap gap-1">
                                    {prof.requiredComponents.map((comp) => (
                                      <span
                                        key={comp}
                                        className="px-2 py-0.5 rounded-[5px] text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                      >
                                        ✓ {comp}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                {/* 4. Komponen Nilai Tambah (High Impact) */}
                                <div className="space-y-1">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                    <Award className="w-3 h-3 text-[#1738D1] dark:text-blue-400" />
                                    <span>Nilai Tambah (High Impact):</span>
                                  </span>
                                  <div className="flex flex-wrap gap-1">
                                    {prof.highImpactComponents.map((comp) => (
                                      <span
                                        key={comp}
                                        className="px-2 py-0.5 rounded-[5px] text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-[#1738D1] dark:text-blue-300 border border-blue-200 dark:border-blue-900"
                                      >
                                        ★ {comp}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Tombol Lihat Lainnya (Progressive Disclosure seperti cv-screener) */}
                    {purposeCategoryFilter === 'all' && filteredPurposes.length > 6 && (
                      <div className="col-span-1 sm:col-span-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAllPurposes(!showAllPurposes)}
                          className="w-full py-2.5 rounded-[10px] bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-800 shadow-2xs group focus-visible:ring-2 focus-visible:ring-[#1738D1]"
                        >
                          <span>
                            {showAllPurposes
                              ? 'Tutup pilihan lainnya'
                              : `Lihat ${filteredPurposes.length - 6} pilihan lainnya`}
                          </span>
                          {showAllPurposes ? (
                            <ChevronUp className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-slate-700" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-slate-700" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* KOLOM KANAN: Detail Dossier Kalibrasi ATS (In-Depth Inspector khusus Desktop) */}
                <div
                  className="hidden lg:block flex-1 min-w-0 min-h-0 w-full lg:h-full lg:overflow-y-auto overscroll-contain border border-slate-200 dark:border-slate-800 rounded-[10px] bg-white dark:bg-slate-900 p-3.5 sm:p-6 space-y-4 sm:space-y-5 pb-24 lg:pb-6"
                >
                  {/* Dossier Header: Badge, Title, and Action Button */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-black uppercase bg-blue-100 dark:bg-blue-950 text-[#1738D1] dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                          {activePurposeProfile.category === 'entry'
                            ? 'Pemula & Sekolah / Kampus'
                            : activePurposeProfile.category === 'career'
                            ? 'Karier Profesional'
                            : activePurposeProfile.category === 'public'
                            ? 'BUMN & Instansi Resmi'
                            : activePurposeProfile.category === 'flexible'
                            ? 'Format Fleksibel'
                            : 'Akademik & Beasiswa'}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          Standar Lolos Seleksi
                        </span>
                      </div>
                      <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        {activePurposeProfile.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-2xl">
                        {activePurposeProfile.objective}
                      </p>
                    </div>
                  </div>

                  {/* Penjelasan Metode Kurasi */}
                  <div className="space-y-1.5">
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Bagaimana Sistem Bekerja untuk Profil Ini
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {activePurposeProfile.description}
                    </p>
                  </div>

                  {/* Kotak Fokus Skrining HRD */}
                  <div className="p-3.5 rounded-[10px] bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#1738D1] dark:text-blue-400">
                      <Target className="w-3.5 h-3.5 text-[#1738D1] dark:text-blue-400 shrink-0" />
                      <span>Kunci Lolos Skrining HRD:</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium pl-5">
                      {activePurposeProfile.evaluationFocusText}
                    </p>
                  </div>

                  {/* Edukasi 2 Gerbang Penilaian: Format ATS vs Kualitas HRD */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                        <span className="w-2 h-2 rounded-full bg-[#1738D1] shrink-0" />
                        <span>Gerbang 1: Format ATS (Scanner Mesin)</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        Memastikan struktur berkas terbaca sistem pemindai / scanner HRD: format heading baku, tanpa grafik rusak, dan ekstraksi data bersih.
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <span>Gerbang 2: Standar HRD (Daya Tarik Nyata)</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        Menilai substansi yang dibaca manusia: pencapaian berangka (%), bukti proyek, sertifikasi, dan kata kerja aktif.
                      </p>
                    </div>
                  </div>

                  {/* Porsi Penilaian CV (Visual Weights Progress) */}
                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Distribusi Bobot Penilaian ({activePurposeProfile.title})
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Bobot otomatis dikalibrasi sesuai profil—tidak ada penalti pengalaman kerja untuk pemula &amp; pelajar.
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-[#1738D1] dark:text-blue-400 shrink-0 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-[6px] border border-blue-200/80 dark:border-blue-900">
                        Total 100%
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {topWeights.map(([key, val]) => (
                        <div
                          key={key}
                          className="p-2.5 rounded-[8px] border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] truncate">
                              {PURPOSE_WEIGHT_LABELS[key] || key}
                            </span>
                            <span className="font-black text-[#1738D1] dark:text-blue-400 text-xs shrink-0 pl-1">
                              {val}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#1738D1] dark:bg-blue-500 rounded-full transition-all duration-300"
                              style={{ width: `${val}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Matriks Komponen: Wajib vs Nilai Tambah */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {/* Komponen Wajib */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Komponen Wajib (Must Have)</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {activePurposeProfile.requiredComponents.map((comp) => (
                          <span
                            key={comp}
                            className="px-2.5 py-1 rounded-[6px] text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          >
                            ✓ {comp}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Komponen Nilai Tambah */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                        <Award className="w-3.5 h-3.5 text-[#1738D1] dark:text-blue-400" />
                        <span>Nilai Tambah (High Impact)</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {activePurposeProfile.highImpactComponents.map((comp) => (
                          <span
                            key={comp}
                            className="px-2.5 py-1 rounded-[6px] text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-[#1738D1] dark:text-blue-300 border border-blue-200 dark:border-blue-900"
                          >
                            ★ {comp}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* STEP 2: PILIH DESAIN TEMPLATE ATS (LAYOUT SAMA ONBOARDING) */}
          {/* ======================================================= */}
          {step === 2 && (
            <div className="w-full h-full flex-1 min-h-0 flex flex-col lg:overflow-hidden animate-in fade-in duration-200">
              {/* Header Step 2 */}
              <div className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-2 sm:gap-3 pb-2.5 sm:pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1738D1] dark:text-blue-400 uppercase tracking-wider">
                    <LayoutGrid className="w-3.5 h-3.5 text-orange-500" />
                    <span>Katalog Desain Standar ATS</span>
                  </div>
                  <h1 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Pilih Tata Letak &amp; Desain Template
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                    Template diformat 1 halaman A4 standar lolos scanner HRD. Pilih desain yang paling sesuai dengan targetmu.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {/* Mobile View Toggle (< lg) */}
                  <div className="grid grid-cols-2 lg:hidden p-1 bg-slate-100 dark:bg-slate-800 rounded-[10px] text-xs gap-1">
                    <button
                      type="button"
                      onClick={() => setMobileTemplateView('templates')}
                      className={`min-h-[36px] px-3 py-1.5 rounded-[8px] text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#1738D1] ${
                        mobileTemplateView === 'templates'
                          ? 'bg-white dark:bg-slate-700 text-[#1738D1] dark:text-blue-300 shadow-2xs'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                      }`}
                    >
                      <span>Katalog Desain</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold">
                        {availableTemplates.length}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobileTemplateView('preview')}
                      className={`min-h-[36px] px-3 py-1.5 rounded-[8px] text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#1738D1] ${
                        mobileTemplateView === 'preview'
                          ? 'bg-white dark:bg-slate-700 text-[#1738D1] dark:text-blue-300 shadow-2xs'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                      }`}
                    >
                      <span>Pratinjau A4</span>
                    </button>
                  </div>

                  {/* Filter Template Tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
                    {[
                      { id: 'all', label: 'Semua Desain' },
                      { id: 'popular', label: 'Terpopuler' },
                      { id: 'clean', label: 'Minimalis' },
                      { id: 'compact', label: 'Ketat' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setTemplateFilterTab(tab.id as any)}
                        className={`min-h-[34px] px-2.5 sm:px-3 py-1 rounded-[8px] text-xs font-bold transition whitespace-nowrap cursor-pointer focus-visible:ring-2 focus-visible:ring-[#1738D1] ${
                          templateFilterTab === tab.id
                            ? 'bg-[#1738D1] text-white shadow-2xs'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Middle Split Studio: Left Template Grid (3 cols) + Right A4 Paperlike Preview */}
              <div className="w-full flex-1 min-h-0 flex flex-col lg:flex-row lg:overflow-hidden pt-2 gap-3 sm:gap-4">
                {/* Left: Template Catalog Grid (Scrollable di mobile & desktop) */}
                <div
                  className={`w-full lg:w-[540px] xl:w-[600px] 2xl:w-[660px] shrink-0 lg:h-full min-h-0 border border-slate-200 dark:border-slate-800 rounded-[10px] lg:overflow-y-auto overscroll-contain bg-slate-50 dark:bg-slate-950/60 p-2.5 sm:p-3.5 pb-24 lg:pb-4 ${
                    mobileTemplateView === 'templates' ? 'block' : 'hidden lg:block'
                  }`}
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                    {availableTemplates.map((tpl) => {
                      const isSelected = selectedTemplateId === tpl.id;
                      return (
                        <button
                          key={tpl.id}
                          type="button"
                          id={`template-card-${tpl.id}`}
                          onClick={() => setSelectedTemplateId(tpl.id)}
                          onDoubleClick={() => {
                            setSelectedTemplateId(tpl.id);
                            setStep(3);
                          }}
                          className={`p-2 sm:p-2.5 rounded-[10px] border transition-all cursor-pointer flex flex-col justify-between group text-left outline-none focus-visible:ring-2 focus-visible:ring-[#1738D1] ${
                            isSelected
                              ? 'bg-blue-50/90 dark:bg-blue-950/70 border-[#1738D1] ring-2 ring-[#1738D1]/25 shadow-md'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-navy-700 hover:shadow-2xs'
                          }`}
                          title="Pilih template untuk melihat pratinjau format A4"
                        >
                          {/* A4 Mini Thumbnail with Exact Aspect Ratio (Identik Onboarding) */}
                          <div className="w-full aspect-[210/297] rounded-[7px] border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 shadow-2xs bg-white relative mb-2 group-hover:scale-[1.01] transition-transform">
                            <TemplateThumbnailVisual templateId={tpl.id} customData={previewData} />
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#1738D1] text-white flex items-center justify-center shadow-xs">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}
                          </div>

                          {/* Badge & Name */}
                          <div className="space-y-1 min-w-0 w-full">
                            <span className="px-1.5 py-0.5 rounded-[5px] text-[8px] sm:text-[9px] font-extrabold uppercase bg-blue-100/90 text-navy-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-navy-800 inline-block truncate max-w-full">
                              {tpl.badge}
                            </span>
                            <h4
                              className="font-extrabold text-[11px] sm:text-xs text-slate-900 dark:text-white leading-tight truncate whitespace-nowrap"
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

                {/* Right: A4 Paperlike Canvas Live Preview */}
                <div
                  className={`flex-1 min-w-0 w-full min-h-[520px] lg:min-h-0 lg:h-full lg:overflow-hidden bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-[10px] relative select-none pb-24 lg:pb-0 ${
                    mobileTemplateView === 'preview' ? 'flex' : 'hidden lg:flex'
                  }`}
                >
                  <A4PaperlikeCanvas
                    templateId={selectedTemplateId}
                    customData={previewData}
                    layoutOrientation="horizontal"
                    docMarginTop={1.27}
                    docMarginBottom={1.27}
                    docMarginLeft={1.27}
                    docMarginRight={1.27}
                    showPageNumbers={true}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* STEP 3: KONFIGURASI DOKUMEN & LIVE PREVIEW A4 (DUAL PANE) */}
          {/* ======================================================= */}
          {step === 3 && (
            <div className="w-full h-full flex-1 min-h-0 flex flex-col lg:overflow-hidden animate-in fade-in duration-200">
              {/* Header Step 3: Status, Heading, dan Mobile View Toggle */}
              <div className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-2 sm:gap-3 pb-2.5 sm:pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1738D1] dark:text-blue-400 uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5 text-orange-500" />
                    <span>Inisiasi Lembar Dokumen</span>
                  </div>
                  <h1 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Beri Nama &amp; Tentukan Cara Memulai
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                    Pratinjau lembar A4 di sisi kanan akan langsung menyesuaikan dengan metode mulai dan template pilihanmu.
                  </p>
                </div>

                {/* Mobile View Toggle (< lg) */}
                <div className="grid grid-cols-2 lg:hidden p-1 bg-slate-100 dark:bg-slate-800 rounded-[10px] text-xs gap-1">
                  <button
                    type="button"
                    onClick={() => setMobileStep3View('config')}
                    className={`min-h-[36px] px-3 py-1.5 rounded-[8px] text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#1738D1] ${
                      mobileStep3View === 'config'
                        ? 'bg-white dark:bg-slate-700 text-[#1738D1] dark:text-blue-300 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    <span>Formulir Inisiasi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileStep3View('preview')}
                    className={`min-h-[36px] px-3 py-1.5 rounded-[8px] text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#1738D1] ${
                      mobileStep3View === 'preview'
                        ? 'bg-white dark:bg-slate-700 text-[#1738D1] dark:text-blue-300 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    <span>Pratinjau A4</span>
                  </button>
                </div>
              </div>

              {/* Middle Split Studio: Left Form Controls (Scrollable) + Right A4 Paperlike Preview */}
              <div className="w-full flex-1 min-h-0 flex flex-col lg:flex-row lg:overflow-hidden pt-2 gap-3 sm:gap-4">
                {/* Left Column: Form Controls (Scrollable di mobile & desktop) */}
                <div
                  className={`w-full lg:w-[540px] xl:w-[600px] 2xl:w-[660px] shrink-0 lg:h-full min-h-0 border border-slate-200 dark:border-slate-800 rounded-[10px] lg:overflow-y-auto overscroll-contain bg-slate-50 dark:bg-slate-950/60 p-3 sm:p-4 pb-24 lg:pb-6 space-y-4 ${
                    mobileStep3View === 'config' ? 'block' : 'hidden lg:block'
                  }`}
                >
                  {/* Summary Card Pilihan Template & Tujuan */}
                  <div className="p-3.5 sm:p-4 rounded-[10px] bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        Template &amp; Tujuan Terpilih
                      </span>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white truncate">
                        {activeTemplateName}
                      </h4>
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-[#1738D1] text-white">
                          {activePurposeProfile?.title}
                        </span>
                        {targetJobRole && (
                          <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 truncate max-w-[180px]">
                            {targetJobRole}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-row gap-2 items-center shrink-0 w-full sm:w-auto justify-end pt-1 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => setActiveConfigDrawer('purpose')}
                        className="min-h-[44px] px-3.5 py-2 rounded-[10px] bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 text-xs font-bold text-[#1738D1] dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition cursor-pointer shadow-2xs focus-visible:ring-2 focus-visible:ring-[#1738D1] flex items-center gap-1.5"
                      >
                        <Target className="w-3.5 h-3.5 text-[#1738D1] dark:text-blue-300 shrink-0" />
                        <span>Ganti Tujuan</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveConfigDrawer('template')}
                        className="min-h-[44px] px-3.5 py-2 rounded-[10px] bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 text-xs font-bold text-[#1738D1] dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition cursor-pointer shadow-2xs focus-visible:ring-2 focus-visible:ring-[#1738D1] flex items-center gap-1.5"
                      >
                        <LayoutGrid className="w-3.5 h-3.5 text-[#1738D1] dark:text-blue-300 shrink-0" />
                        <span>Ganti Template</span>
                      </button>
                    </div>
                  </div>

                  {/* Field Judul CV & Target Posisi */}
                  <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                          Nama File / Judul CV <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                          Nama berkas simpan
                        </span>
                      </div>
                      <input
                        type="text"
                        value={cvTitle}
                        onChange={(e) => setCvTitle(e.target.value)}
                        placeholder="Contoh: CV ATS - Staff Administrasi 2026"
                        className={`w-full px-4 py-2.5 rounded-[10px] border text-base sm:text-xs font-semibold focus:ring-2 transition ${
                          hasSubmittedAttempt && !isTitleValid
                            ? 'border-rose-500 bg-rose-50/50 text-rose-900 focus:ring-rose-500'
                            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-[#1738D1]'
                        }`}
                      />
                      {hasSubmittedAttempt && !isTitleValid ? (
                        <p className="text-[11px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Nama file CV wajib diisi.</span>
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                          Nama berkas untuk arsip di daftar dokumenmu (tidak dicetak di dalam lembar A4 CV).
                        </p>
                      )}
                    </div>

                    {/* Target Posisi */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor="step3-target-role"
                          className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider"
                        >
                          Target Posisi <span className="text-rose-500">*</span>
                        </label>
                        {targetJobRole && (
                          <button
                            type="button"
                            onClick={() => setIsEditingTargetRole(!isEditingTargetRole)}
                            className="min-h-[36px] px-2.5 py-1 rounded-[8px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold text-[#1738D1] dark:text-blue-400 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[#1738D1]"
                          >
                            {isEditingTargetRole ? 'Tutup' : 'Ubah Posisi'}
                          </button>
                        )}
                      </div>

                      {targetJobRole && !isEditingTargetRole ? (
                        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-[#1738D1] dark:text-blue-400 shrink-0" />
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {targetJobRole}
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Terkonfigurasi
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <JobTitleSearchSelect
                            id="step3-target-role"
                            value={targetJobRole}
                            onChange={(val) => {
                              setTargetJobRole(val);
                              if (!cvTitle || cvTitle.startsWith('CV ATS')) {
                                setCvTitle(`CV ATS - ${val}`);
                              }
                              setIsEditingTargetRole(false);
                            }}
                            hasError={hasSubmittedAttempt && !isTargetRoleValid}
                            placeholder="Ketik target posisi pekerjaan..."
                          />
                          {hasSubmittedAttempt && !isTargetRoleValid && (
                            <p className="text-[11px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>Target posisi wajib diisi agar evaluasi relevan.</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pilihan Metode Memulai Isi Dokumen */}
                  <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 space-y-3.5 shadow-2xs">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">
                        Pilih Metode Memulai Isi Dokumen
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Pilihan metode akan langsung mengubah pratinjau lembar A4 di sisi kanan.
                      </p>
                    </div>

                    <div role="radiogroup" aria-label="Metode Memulai Isi Dokumen" className="space-y-2.5">
                      {/* Opsi 1: Mulai dengan Data Contoh (Rekomendasi) */}
                      <div
                        role="radio"
                        aria-checked={startMode === 'example'}
                        tabIndex={0}
                        onClick={() => setStartMode('example')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setStartMode('example');
                          }
                        }}
                        className={`p-3.5 rounded-[10px] border transition-all cursor-pointer flex items-start gap-3 outline-none focus-visible:ring-2 focus-visible:ring-[#1738D1] ${
                          startMode === 'example'
                            ? 'bg-blue-50/70 dark:bg-blue-950/40 border-[#1738D1] ring-2 ring-[#1738D1]/20 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            startMode === 'example' ? 'bg-[#1738D1] text-white' : 'border border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {startMode === 'example' && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                              Mulai dengan Data Contoh
                            </h4>
                            <span className="px-1.5 py-0.5 rounded-[6px] text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              Rekomendasi
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                            Dokumen terisi susunan deskripsi kerja dan keahlian relevan target posisi {targetJobRole || 'kamu'}. Tinggal ganti data riwayatmu.
                          </p>
                        </div>
                      </div>

                      {/* Opsi 2: Mulai dari Lembar Bersih / Kosong */}
                      <div
                        role="radio"
                        aria-checked={startMode === 'empty'}
                        tabIndex={0}
                        onClick={() => setStartMode('empty')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setStartMode('empty');
                          }
                        }}
                        className={`p-3.5 rounded-[10px] border transition-all cursor-pointer flex items-start gap-3 outline-none focus-visible:ring-2 focus-visible:ring-[#1738D1] ${
                          startMode === 'empty'
                            ? 'bg-blue-50/70 dark:bg-blue-950/40 border-[#1738D1] ring-2 ring-[#1738D1]/20 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            startMode === 'empty' ? 'bg-[#1738D1] text-white' : 'border border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {startMode === 'empty' && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <h4 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                            Mulai dari Lembar Bersih (Kosongan)
                          </h4>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                            Menyajikan struktur section kosong yang disesuaikan dengan tujuan CV pilihanmu, siap diketik dari nol.
                          </p>
                        </div>
                      </div>

                      {/* Opsi 3: Impor Berkas CV Lama */}
                      <div
                        role="radio"
                        aria-checked={startMode === 'import'}
                        tabIndex={0}
                        onClick={() => setStartMode('import')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setStartMode('import');
                          }
                        }}
                        className={`p-3.5 rounded-[10px] border transition-all cursor-pointer flex flex-col gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-[#1738D1] ${
                          startMode === 'import'
                            ? 'bg-blue-50/70 dark:bg-blue-950/40 border-[#1738D1] ring-2 ring-[#1738D1]/20 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                              startMode === 'import' ? 'bg-[#1738D1] text-white' : 'border border-slate-300 dark:border-slate-700'
                            }`}
                          >
                            {startMode === 'import' && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <h4 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                              Impor Berkas CV Lama (PDF / DOCX)
                            </h4>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                              Sistem memindai teks berkas dan mengekstrak pengalaman, pendidikan, serta keahlian langsung ke template A4.
                            </p>
                          </div>
                        </div>

                        {/* Dropzone Upload Khusus Mode Impor (Arsitektur Identik Onboarding) */}
                        {startMode === 'import' && (
                          <div className="pt-1.5 pl-8 space-y-3" onClick={(e) => e.stopPropagation()}>
                            {!scanCompleted ? (
                              <label
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setIsDraggingFile(true);
                                }}
                                onDragLeave={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setIsDraggingFile(false);
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setIsDraggingFile(false);
                                  const file = e.dataTransfer.files?.[0];
                                  if (file) handleFileUpload(file);
                                }}
                                className={`p-4 sm:p-5 border-2 border-dashed rounded-[10px] flex flex-col items-center justify-center gap-2 cursor-pointer transition ${
                                  isDraggingFile
                                    ? 'border-[#1738D1] bg-blue-100/60 dark:bg-blue-950/60 ring-2 ring-[#1738D1]/30'
                                    : 'border-[#1738D1]/40 hover:border-[#1738D1] bg-white dark:bg-slate-800'
                                }`}
                              >
                                <UploadCloud className="w-6 h-6 text-[#1738D1] dark:text-blue-400" />
                                <div className="text-center">
                                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                                    {isDraggingFile ? 'Lepaskan Berkas di Sini' : 'Pilih Berkas atau Tarik ke Sini'}
                                  </span>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                    Mendukung format PDF, DOCX, DOC, TXT (Maks. 10MB)
                                  </p>
                                </div>
                                <input
                                  type="file"
                                  accept=".pdf,.docx,.doc,.txt"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUpload(file);
                                  }}
                                  className="hidden"
                                />
                              </label>
                            ) : (
                              <div className="p-3 rounded-[10px] bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                  <div className="min-w-0">
                                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 truncate block">
                                      {uploadedFile?.name || 'Berkas berhasil dipindai'}
                                    </span>
                                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                                      Data berhasil disinkronkan ke pratinjau A4
                                    </span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setScanCompleted(false);
                                    setUploadedFile(null);
                                    setParsedImportedData(null);
                                  }}
                                  className="min-h-[44px] px-3 py-1.5 rounded-[8px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer transition shadow-2xs shrink-0"
                                >
                                  Ganti Berkas
                                </button>
                              </div>
                            )}

                            {isScanningFile && (
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                  <span>{scanStatusText}</span>
                                  <span>{scanProgress}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-[#1738D1] transition-all duration-300"
                                    style={{ width: `${scanProgress}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {scanError && (
                              <p className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>{scanError}</span>
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: A4 Paperlike Canvas Live Preview (Identik Langkah 2) */}
                <div
                  className={`flex-1 min-w-0 w-full min-h-[520px] lg:min-h-0 lg:h-full lg:overflow-hidden bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-[10px] relative select-none pb-24 lg:pb-0 ${
                    mobileStep3View === 'preview' ? 'flex' : 'hidden lg:flex'
                  }`}
                >
                  {/* Subtle Floating Status Pill */}
                  <div className="absolute top-2.5 right-2.5 z-10 hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-white/95 dark:bg-slate-800/95 backdrop-blur-xs border border-slate-200 dark:border-slate-700 shadow-2xs text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>
                      {startMode === 'example' && 'Pratinjau Contoh Terisi'}
                      {startMode === 'empty' && 'Pratinjau Lembar Bersih'}
                      {startMode === 'import' && (parsedImportedData ? 'Hasil Ekstraksi Berkas' : 'Menunggu Berkas')}
                    </span>
                  </div>

                  <A4PaperlikeCanvas
                    templateId={selectedTemplateId}
                    customData={step3PreviewData}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ========================================================= */}
      {/* STICKY BOTTOM ACTION BAR: Seamless Step Transitions       */}
      {/* ========================================================= */}
      <footer className="h-16 shrink-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-3 sm:px-6 lg:px-8 flex items-center justify-between z-30 shadow-md">
          {/* Sisi Kiri: Status / Back Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {step === 1 ? (
              <>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden sm:inline">
                  Tujuan Aktif:{' '}
                  <strong className="text-slate-900 dark:text-white font-bold">
                    {activePurposeProfile?.title}
                  </strong>
                </span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hidden md:inline">
                  • Pilih tujuan untuk melihat kriteria kelulusan
                </span>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setStep((prev) => Math.max(1, prev - 1))}
                  className="min-h-[44px] px-3 sm:px-4 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#1738D1]"
                >
                  <ArrowLeft className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">
                    {step === 2 && 'Kembali ke Tujuan CV'}
                    {step === 3 && 'Kembali ke Pilih Template'}
                  </span>
                  <span className="sm:hidden">Kembali</span>
                </button>
                {step === 2 && (
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hidden md:inline">
                    • Pratinjau layout standar 1 halaman A4
                  </span>
                )}
              </>
            )}
          </div>

          {/* Sisi Kanan: Forward Action Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {step === 1 && (
              <button
                type="button"
                onClick={() => setStep(2)}
                className="min-h-[44px] px-4 sm:px-6 py-2.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-[#1738D1]/20 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#1738D1]"
              >
                <span className="hidden sm:inline">Lanjut: Pilih Template ATS</span>
                <span className="sm:hidden">Pilih Template</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(3)}
                className="min-h-[44px] px-4 sm:px-6 py-2.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-[#1738D1]/20 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#1738D1]"
              >
                <span className="hidden sm:inline">Gunakan Template Ini &amp; Lanjut</span>
                <span className="sm:hidden">Gunakan Template</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="min-h-[44px] px-5 sm:px-7 py-2.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-[#1738D1]/20 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#1738D1]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                    <span>Menyiapkan Studio Editor...</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Mulai Susun CV Saya</span>
                    <span className="sm:hidden">Mulai Susun CV</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </>
                )}
              </button>
            )}
          </div>
        </footer>

      {/* CONTEXTUAL SLIDE-IN DRAWER (UBAH TEMPLATE / TUJUAN SECARA IN-PLACE) */}
      {activeConfigDrawer && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-stretch justify-center sm:justify-end animate-in fade-in duration-200"
          onClick={() => setActiveConfigDrawer(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-config-title"
            className="relative z-10 w-full max-h-[92dvh] sm:max-h-none h-auto sm:h-full sm:max-w-xl rounded-t-[16px] sm:rounded-none border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl flex flex-col justify-between overflow-hidden animate-in max-sm:slide-in-from-bottom sm:slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag Handle Mobile */}
            <div className="sm:hidden flex justify-center pt-2.5 pb-1 shrink-0" aria-hidden="true">
              <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
            </div>

            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 shrink-0">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1738D1] dark:text-blue-400">
                  Penyesuaian Cepat Langkah 3
                </span>
                <h3 id="drawer-config-title" className="text-base font-extrabold text-slate-900 dark:text-white">
                  {activeConfigDrawer === 'template' ? 'Pilih Template CV' : 'Pilih Tujuan Pembuatan CV'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveConfigDrawer(null)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-[10px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[#1738D1]"
                aria-label="Tutup panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body (scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
              {activeConfigDrawer === 'template' ? (
                <div className="grid grid-cols-2 gap-3">
                  {cvTemplates
                    .filter((t) => !t.hidden)
                    .map((tpl) => {
                      const isSelected = selectedTemplateId === tpl.id;
                      return (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => setSelectedTemplateId(tpl.id)}
                          className={`text-left p-2.5 rounded-[10px] border transition cursor-pointer flex flex-col justify-between relative group ${
                            isSelected
                              ? 'border-[#1738D1] bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-[#1738D1]/20'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-800/60'
                          }`}
                        >
                          <div className="aspect-[210/297] w-full rounded-[6px] overflow-hidden bg-slate-100 dark:bg-slate-800 mb-2 border border-slate-200/60 dark:border-slate-700">
                            <TemplateThumbnailVisual templateId={tpl.id} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {tpl.name}
                              </span>
                              {isSelected && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#1738D1] dark:text-blue-400 shrink-0" />
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block line-clamp-1 mt-0.5">
                              {tpl.badge || 'Format ATS Standar'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                </div>
              ) : (
                <div className="space-y-2">
                  {(Object.keys(CV_PURPOSE_PROFILES) as CvPurpose[]).map((pKey) => {
                    const profile = CV_PURPOSE_PROFILES[pKey];
                    const isSelected = selectedPurpose === pKey;
                    const badgeConfig = getCompactBadgeConfig(pKey);
                    return (
                      <button
                        key={pKey}
                        type="button"
                        onClick={() => setSelectedPurpose(pKey)}
                        className={`w-full text-left p-3.5 rounded-[10px] border transition cursor-pointer flex items-center justify-between min-h-[48px] ${
                          isSelected
                            ? 'border-[#1738D1] bg-blue-50/70 dark:bg-blue-950/40 ring-1 ring-[#1738D1]'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`p-2 rounded-[8px] shrink-0 ${
                              isSelected
                                ? 'bg-[#1738D1] text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {renderPurposeIcon(pKey)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {profile.title}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded-[6px] text-[10px] font-bold border ${badgeConfig.className}`}
                              >
                                {badgeConfig.label}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {profile.description || profile.objective}
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-[#1738D1] dark:text-blue-400 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sticky Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between shrink-0">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate pr-2">
                Pilihan aktif:{' '}
                <strong className="text-slate-900 dark:text-white font-bold">
                  {activeConfigDrawer === 'template' ? activeTemplateName : activePurposeProfile?.title}
                </strong>
              </div>
              <button
                type="button"
                onClick={() => setActiveConfigDrawer(null)}
                className="min-h-[44px] px-5 py-2.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-bold text-xs shadow-md shadow-[#1738D1]/20 transition cursor-pointer active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#1738D1] shrink-0"
              >
                Selesai &amp; Terapkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
