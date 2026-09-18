'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import {
  Eye,
  Flame,
  Layers,
  Zap,
  Building2,
  Briefcase,
  Upload,
  FileText,
  RefreshCw,
  Info,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  Clock,
  Check,
  Target,
  BarChart3,
  Lightbulb,
  ChevronRight,
  ArrowRight,
  ArrowLeftRight,
  TrendingUp,
  Bot,
  Cpu,
  Globe,
  Award,
  Send,
  X,
  CornerDownRight,
  Sliders,
  SlidersHorizontal,
  Gauge,
  Users,
  CheckSquare,
  HelpCircle,
  Smile,
  Compass,
  FileCheck,
  FileCheck2,
  History,
  ArrowLeft,
  Trash2,
  Bookmark,
  Plus,
  Star,
  Search,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Play,
  Laptop,
  Plane,
  FolderKanban,
} from 'lucide-react';
import { getScoreTextClass, getScoreProgressBarClass, getScoreBadgeClass } from '@/lib/score-color';
import {
  CvPurpose,
  CV_PURPOSE_PROFILES,
  ComprehensiveCvScoreResult,
  PurposeProfileConfig,
  evaluateCvComprehensive,
} from '@/lib/cv-purpose-scoring-engine';
import {
  runFullRvePipeline,
  generateCvScreenerAiPrompt,
  parseAiScreenerResponse,
  enrichScreenerPoint,
  CvParsedData,
  RecruiterPersona,
  RveReportResult,
} from './rve/RveEnginePipeline';
import { A4HeatmapCanvas } from './rve/A4HeatmapCanvas';
import { cvApi } from '@/lib/api';
import { getStoredSession } from '@/lib/auth';

// 11 Recruiter Personas dengan kategori, star ratings, contoh perusahaan, & match score
const recruiterPersonas: RecruiterPersona[] = [
  {
    id: 'startup',
    name: 'Startup',
    badge: 'Fast-Paced & Impact',
    category: 'company',
    categoryLabel: 'Jenis Perusahaan',
    description: 'Fokus tinggi pada kecepatan eksekusi, portofolio proyek nyata, stack modern, dan dampak bisnis langsung.',
    focusArea: 'Portofolio & Impact',
    evalFocus: 'Lebih mementingkan bukti eksekusi & portofolio nyata dibanding gelar formal.',
    companies: ['Gojek', 'Tokopedia', 'Ruangguru', 'Xendit'],
    matchScore: 96,
    isRecommended: true,
    ratings: { portfolio: 5, impact: 5, techStack: 4, education: 2 },
    highlights: ['Portfolio project nyata', 'Tech stack modern', 'Dampak bisnis & metrik %', 'Kecepatan eksekusi'],
    reducedEmphasis: ['IPK akademik', 'Sertifikat formal non-praktis'],
    strictness: 'Fokus Bukti & Impact',
  },
  {
    id: 'unicorn',
    name: 'Unicorn',
    badge: 'High Scale & System',
    category: 'company',
    categoryLabel: 'Jenis Perusahaan',
    description: 'Menilai kemampuan skala sistem besar, arsitektur, kepemimpinan tim, dan efisiensi performa.',
    focusArea: 'Arsitektur & Skala',
    evalFocus: 'Penekanan pada skalabilitas sistem, arsitektur handal, dan kepemimpinan tim besar.',
    companies: ['Grab', 'Traveloka', 'Shopee', 'Bukalapak'],
    matchScore: 90,
    isRecommended: true,
    ratings: { portfolio: 5, impact: 5, techStack: 5, education: 3 },
    highlights: ['Arsitektur sistem skala besar', 'Optimasi performa & query', 'Leadership & kolaborasi tim'],
    reducedEmphasis: ['Pengalaman perusahaan skala kecil tanpa metrik'],
    strictness: 'Skalabilitas Sistem',
  },
  {
    id: 'corporate',
    name: 'Corporate',
    badge: 'Formal & Structure',
    category: 'company',
    categoryLabel: 'Jenis Perusahaan',
    description: 'Memperhatikan struktur formal, rekam jejak karir yang stabil, gelar pendidikan, dan kualifikasi baku.',
    focusArea: 'Kualifikasi & Stabilitas',
    evalFocus: 'Ketat pada kelengkapan administrasi, reputasi kampus, dan stabilitas riwayat karir.',
    companies: ['Astra', 'Telkom Indonesia', 'BCA', 'Unilever'],
    matchScore: 65,
    isRecommended: false,
    ratings: { portfolio: 3, impact: 4, techStack: 3, education: 5 },
    highlights: ['Gelar & reputasi institusi', 'Stabilitas riwayat pekerjaan', 'Kesesuaian standar administrasi'],
    reducedEmphasis: ['Proyek sampingan (side project) tidak resmi'],
    strictness: 'Standar Kualifikasi Formal',
  },
  {
    id: 'product-co',
    name: 'Product Company',
    badge: 'Product Ownership',
    category: 'company',
    categoryLabel: 'Jenis Perusahaan',
    description: 'Menyoroti pemahaman pengalaman pengguna, kolaborasi tim, dan bagaimana kode/fitur meningkatkan user metric.',
    focusArea: 'Product Mindset & UX',
    evalFocus: 'Pemahaman pengguna (user experience) dan kolaborasi produk melintas divisi.',
    companies: ['Tiket.com', 'Traveloka', 'Blibli', 'DANA'],
    matchScore: 86,
    isRecommended: false,
    ratings: { portfolio: 4, impact: 5, techStack: 4, education: 3 },
    highlights: ['Dampak fitur terhadap pengguna (User Impact)', 'A/B Testing & data-driven design', 'Cross-functional collaboration'],
    reducedEmphasis: ['Tugas rutin maintenance tanpa ownership fitur'],
    strictness: 'Product Impact & UX',
  },
  {
    id: 'consulting',
    name: 'Consulting',
    badge: 'Problem Solving',
    category: 'company',
    categoryLabel: 'Jenis Perusahaan',
    description: 'Mencari kemampuan analisis masalah terstruktur, komunikasi tingkat direksi, dan eksekusi solusi bisnis.',
    focusArea: 'Problem Solving & Analisis',
    evalFocus: 'Kerangka pemikiran analitis terstruktur (case solving) dan komunikasi manajerial.',
    companies: ['McKinsey & Co', 'BCG', 'Bain', 'PwC / Deloitte'],
    matchScore: 75,
    isRecommended: false,
    ratings: { portfolio: 3, impact: 5, techStack: 3, education: 5 },
    highlights: ['Struktur pemecahan masalah terurut', 'Prestasi kompetisi bisnis / case study', 'Kepemimpinan organisasi & komunikasi'],
    reducedEmphasis: ['Detail koding tanpa dampak strategi bisnis'],
    strictness: 'Kerangka Analitis Ketat',
  },
  {
    id: 'remote-us',
    name: 'Remote US',
    badge: 'Autonomy & Metric %',
    category: 'region',
    categoryLabel: 'Wilayah / Global',
    description: 'Menyukai CV ringkas berorientasi metrik %, komunikasi bahasa Inggris profesional, dan kemandirian tinggi.',
    focusArea: 'Metrik Angka & Bahasa',
    evalFocus: 'CV 1-2 halaman ringkas padat dengan metrik keberhasilan % dan link GitHub/Portofolio.',
    companies: ['GitLab', 'Automattic', 'Deel', 'Toptal'],
    matchScore: 88,
    isRecommended: true,
    ratings: { portfolio: 5, impact: 5, techStack: 5, education: 2 },
    highlights: ['Metrik kuantitatif % di setiap bullet point', 'Link live project & GitHub', 'Bahasa Inggris fluent / professional'],
    reducedEmphasis: ['Format CV >2 halaman', 'Alamat rumah lengkap & foto pribadi'],
    strictness: 'Metrik Angka & Otonomi',
  },
  {
    id: 'australia',
    name: 'Australia',
    badge: 'Work-Life & Autonomy',
    category: 'region',
    categoryLabel: 'Wilayah / Global',
    description: 'Menilai keterampilan praktis langsung, budaya kolaboratif terbuka, independensi, dan komunikasi profesional.',
    focusArea: 'Skill Praktis & Kolaborasi',
    evalFocus: 'Kerapian komunikasi bahasa Inggris dan bukti keterampilan praktis langsung.',
    companies: ['Atlassian', 'Canva', 'Employment Hero', 'SafetyCulture'],
    matchScore: 82,
    isRecommended: false,
    ratings: { portfolio: 4, impact: 4, techStack: 4, education: 3 },
    highlights: ['Komunikasi bahasa Inggris profesional', 'Kemandirian kerja & proaktif', 'Pengalaman kolaborasi tim agile'],
    reducedEmphasis: ['Gelar akademik tanpa bukti komunikasi praktis'],
    strictness: 'Skill Praktis & Bahasa',
  },
  {
    id: 'jepang',
    name: 'Jepang',
    badge: 'Kedisiplinan & Detail',
    category: 'region',
    categoryLabel: 'Wilayah / Global',
    description: 'Sangat teliti terhadap kerapihan format, konsistensi riwayat kerja, kedisiplinan, dan motivasi jangka panjang.',
    focusArea: 'Konsistensi & Loyalitas',
    evalFocus: 'Kerapihan format seragam standar Nikkei dan motivasi komitmen jangka panjang.',
    companies: ['Toyota', 'Honda', 'Sony', 'Panasonic'],
    matchScore: 72,
    isRecommended: false,
    ratings: { portfolio: 3, impact: 4, techStack: 3, education: 4 },
    highlights: ['Kerapian format & tata bahasa', 'Loyalitas & durasi kerja', 'Kemampuan bahasa & etos kedisiplinan'],
    reducedEmphasis: ['Riwayat kerja sering berpindah dalam waktu singkat'],
    strictness: 'Kerapian Format & Loyalitas',
  },
  {
    id: 'cina',
    name: 'Cina',
    badge: 'Target KPI & Speed',
    category: 'region',
    categoryLabel: 'Wilayah / Global',
    description: 'Sangat terfokus pada indikator kinerja kuantitatif KPI, daya tahan kerja tinggi, kecepatan eksekusi, dan hasil bisnis.',
    focusArea: 'Target KPI & Eksekusi',
    evalFocus: 'Target pencapaian angka KPI yang agresif dan kecepatan penyelesaian masalah.',
    companies: ['TikTok / ByteDance', 'Huawei', 'Shopee / Sea', 'Oppo'],
    matchScore: 85,
    isRecommended: false,
    ratings: { portfolio: 4, impact: 5, techStack: 4, education: 3 },
    highlights: ['Pencapaian angka metrik KPI', 'Ketahanan kerja & kecepatan', 'Hasil omzet / efisiensi konkret'],
    reducedEmphasis: ['Deskripsi tugas rutin tanpa pencapaian angka'],
    strictness: 'Target KPI & Kecepatan',
  },
  {
    id: 'fresh-grad',
    name: 'Fresh Graduate',
    badge: 'Potensi & Organisasi',
    category: 'special',
    categoryLabel: 'Khusus',
    description: 'Menilai keaktifan organisasi kampus, IPK, kecepatan belajar, proyek akademik, dan sikap haus ilmu.',
    focusArea: 'Potensi & Organisasi',
    evalFocus: 'Fokus pada keaktifan organisasi kampus, proyek tugas akhir, dan potensi belajar.',
    companies: ['MT Program', 'Internship', 'Graduate Trainee'],
    matchScore: 78,
    isRecommended: false,
    ratings: { portfolio: 3, impact: 3, techStack: 3, education: 5 },
    highlights: ['Kepemimpinan organisasi kampus', 'IPK & judul skripsi/tugas akhir', 'Sertifikat kompetensi & pelatihan'],
    reducedEmphasis: ['Ekspektasi pengalaman kerja senior'],
    strictness: 'Potensi & Organisasi Kampus',
  },
  {
    id: 'bumn',
    name: 'BUMN',
    badge: 'Kualifikasi Standar',
    category: 'special',
    categoryLabel: 'Khusus',
    description: 'Prioritas pada kesesuaian dokumen resmi, IPK minimum, kelengkapan administrasi, dan keaslian berkas.',
    focusArea: 'Administrasi & IPK',
    evalFocus: 'Fokus pada kepatuhan regulasi resmi, IPK minimum, dan berkas administrasi.',
    companies: ['Pertamina', 'Telkom', 'Bank Mandiri', 'PLN'],
    matchScore: 58,
    isRecommended: false,
    ratings: { portfolio: 2, impact: 3, techStack: 3, education: 5 },
    highlights: ['Transkrip nilai & IPK minimum', 'Sertifikat resmi negara/BNSP', 'Kelengkapan dokumen administrasi'],
    reducedEmphasis: ['Pengalaman magang informal tanpa surat resmi'],
    strictness: 'Regulasi & Administrasi',
  },
];

// ── Dynamic persona match scoring ────────────────────────────────────────────
// Menghitung skor kecocokan (0-100) antara isi CV dan bobot tiap persona recruiter.
// Sinyal diekstrak dari CV: bukti proyek/portofolio, metrik dampak, jumlah skill, & pendidikan.
// Hasil di-blend dengan skor kualitas CV keseluruhan (RVE consensusScore).
// Jika CV kosong (belum ada data), fallback ke matchScore bawaan persona sebagai baseline.
function computePersonaMatchScore(persona: RecruiterPersona, cv: any, cvQualityScore: number): number {
  const skills = Array.isArray(cv?.skills) ? cv.skills : [];
  const experience = Array.isArray(cv?.experience) ? cv.experience : [];
  const education = Array.isArray(cv?.education) ? cv.education : [];
  const summary = cv?.summary || '';

  // Fallback baseline jika CV tidak punya sinyal terhitung (tanpa skills/experience/education).
  // Summary saja tidak cukup — tanpa data terstruktur kita tidak bisa menilai kecocokan persona.
  const hasContent = skills.length > 0 || experience.length > 0 || education.length > 0;
  if (!hasContent) return persona.matchScore;

  const allText = [
    summary,
    ...experience.map((e: any) => `${e?.role || ''} ${e?.company || ''} ${e?.description || ''}`),
    ...education.map((e: any) => `${e?.degree || ''} ${e?.institution || ''}`),
  ]
    .join(' ')
    .toLowerCase();

  // portfolio: bukti proyek nyata / link repo / portofolio
  const linkMatches = (allText.match(/https?:\/\/|github\.com|gitlab\.com|bitbucket\.org|\.vercel\.app|\.netlify\.app|\.github\.io/g) || []).length;
  const portfolioSignal = Math.min(1, experience.length * 0.3 + linkMatches * 0.35);

  // impact: metrik angka & kata kerja dampak
  const impactMatches = (allText.match(/\d+%|persen|\bjt\b|\bjuta\b|\bribu\b|meningkatkan|menurunkan|menghemat|mempercepat|mencapai|mengurangi|\bhemat\b|growth|increase|improve|revenue|omzet/g) || []).length;
  const impactSignal = Math.min(1, impactMatches / 3);

  // techStack: cakupan skill
  const techStackSignal = Math.min(1, skills.length / 8);

  // education: riwayat pendidikan + gelar
  const degreeBoost = education.some((e: any) => /s1|s2|sarjana|magister|master|bachelor|diploma|smk|d3/i.test(e?.degree || '')) ? 0.25 : 0;
  const educationSignal = Math.min(1, education.length * 0.4 + degreeBoost);

  const r = persona.ratings;
  const dims = {
    portfolio: portfolioSignal,
    impact: impactSignal,
    techStack: techStackSignal,
    education: educationSignal,
  };
  const totalWeight = r.portfolio + r.impact + r.techStack + r.education;
  const weightedFit =
    r.portfolio * dims.portfolio +
    r.impact * dims.impact +
    r.techStack * dims.techStack +
    r.education * dims.education;
  const fit = totalWeight > 0 ? (weightedFit / totalWeight) * 100 : 50;

  // Blend dengan kualitas CV keseluruhan agar skor realistis (CV lemah = skor turun di semua persona)
  const quality = typeof cvQualityScore === 'number' && cvQualityScore > 0 ? cvQualityScore : 70;
  return Math.round(fit * 0.75 + quality * 0.25);
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

interface SavedReportHistoryItem {
  id: string;
  candidateName: string;
  targetRole: string;
  targetLevel?: 'Entry' | 'Junior' | 'Mid' | 'Senior';
  personaName: string;
  personaFocus?: string;
  activePurpose?: CvPurpose;
  purposeTitle?: string;
  consensusScore: number;
  verdictStatus: 'interview' | 'maybe' | 'reject';
  timestamp: string;
  appliedFixes: string[];
  cvSourceMode: 'saved' | 'upload';
  selectedCvId: string;
  selectedPersonaId: string;
  rveReport?: RveReportResult;
  selectedSavedCv?: any;
}

const MODULE_CONFIGS = [
  {
    id: 'vision' as const,
    label: 'Recruiter Vision (Pandangan HRD 6 Detik & Heatmap)',
    shortLabel: 'Recruiter Vision',
    badgeTitle: 'Human Simulation',
    anchorId: 'step-vision',
    icon: Eye,
    color: 'text-rose-500',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60',
    pipelineText: 'Recruiter Vision — Memprediksi Pola Mata HRD 6 Detik...',
  },
  {
    id: 'ats' as const,
    label: 'ATS Compatibility Matrix (Kata Kunci & Format ATS)',
    shortLabel: 'ATS Matrix',
    badgeTitle: 'Machine Filter',
    anchorId: 'step-ats',
    icon: BarChart3,
    color: 'text-blue-500',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/60 text-navy-700 dark:text-blue-300 border-blue-200 dark:border-navy-900/60',
    pipelineText: 'ATS Compatibility — Menguji Kata Kunci & Format Mesin ATS...',
  },
  {
    id: 'aiScreener' as const,
    label: 'Simulasi Multi-Screener (Evaluasi Konsensus Recruiter)',
    shortLabel: 'Multi-Screener',
    badgeTitle: 'Primary Selling Point',
    anchorId: 'step-ai-screener',
    icon: Bot,
    color: 'text-emerald-500',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60',
    pipelineText: 'Multi-Screener Intelligence — Menguji Evaluasi Konsensus Recruiter...',
  },
  {
    id: 'forecast' as const,
    label: 'Hiring Forecast (Prediksi Pertanyaan Wawancara)',
    shortLabel: 'Hiring Forecast',
    badgeTitle: 'Interview Forecast',
    anchorId: 'step-prediction',
    icon: TrendingUp,
    color: 'text-orange-500',
    badgeBg: 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-900/60',
    pipelineText: 'Hiring Forecast — Menghitung Peluang & Prediksi Wawancara...',
  },
  {
    id: 'improvement' as const,
    label: 'Auto Improvement (Perbaikan Otomatis Kalimat CV)',
    shortLabel: 'Auto Improvement',
    badgeTitle: 'Auto Improvement',
    anchorId: 'step-improvement',
    icon: Sparkles,
    color: 'text-amber-500',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/60',
    pipelineText: 'Auto Improvement — Menyusun Langkah Perbaikan CV Instant...',
  },
];

export const AiCvScreenerView: React.FC<{ mode?: 'setup' | 'report' }> = ({ mode = 'setup' }) => {
  const router = useRouter();
  const toast = useToast();
  // Phase / View State: 'setup' (Form Input & Recruiter Selection) vs 'report' (Full Width Immersive Pipeline)
  const [activePhase, setActivePhase] = useState<'setup' | 'report'>(mode);

  // Dynamic Saved CVs from database / localStorage / defaults
  const [savedCvs, setSavedCvs] = useState<any[]>([]);
  const [userSession, setUserSession] = useState<any>(null);

  // Saved History State (Per-account / LocalStorage)
  const [reportHistory, setReportHistory] = useState<SavedReportHistoryItem[]>([]);

  // Helper untuk menormalisasi data CV dari berbagai skema database / localStorage / profil pengguna
  const normalizeCvItem = (item: any, sessionUser?: any, profileUser?: any) => {
    const candidateName =
      item.candidateName ||
      item.fullName ||
      item.name ||
      item.data?.fullName ||
      item.data?.candidateName ||
      sessionUser?.name ||
      profileUser?.fullName ||
      profileUser?.name ||
      'Kandidat Pelamar';

    const roleTitle =
      item.roleTitle ||
      item.headline ||
      item.targetPosition ||
      item.target_position ||
      item.targetRole ||
      item.role ||
      item.data?.headline ||
      profileUser?.headline ||
      'Professional Specialist';

    const email =
      item.email ||
      item.data?.email ||
      sessionUser?.email ||
      profileUser?.email ||
      'kandidat@email.com';

    const phone =
      item.phone ||
      item.data?.phone ||
      profileUser?.phone ||
      '+62 812-3456-7890';

    const location =
      item.location ||
      (item.city && item.country ? `${item.city}, ${item.country}` : item.city) ||
      item.data?.location ||
      profileUser?.city ||
      profileUser?.location ||
      'Indonesia';

    const summary =
      item.summary ||
      item.about ||
      item.profileSummary ||
      item.executiveSummary ||
      item.data?.summary ||
      profileUser?.summary ||
      'Professional berdedikasi tinggi dengan fokus pada pencapaian target dan kerja sama tim yang solid.';

    const rawExp =
      (Array.isArray(item.experience) && item.experience.length > 0
        ? item.experience
        : Array.isArray(item.workExperience) && item.workExperience.length > 0
        ? item.workExperience
        : Array.isArray(item.data?.experience) && item.data.experience.length > 0
        ? item.data.experience
        : Array.isArray(item.data?.workExperience) && item.data.workExperience.length > 0
        ? item.data.workExperience
        : Array.isArray(profileUser?.experience) && profileUser.experience.length > 0
        ? profileUser.experience
        : Array.isArray(profileUser?.workExperience) && profileUser.workExperience.length > 0
        ? profileUser.workExperience
        : []);

    const rawEdu =
      (Array.isArray(item.education) && item.education.length > 0
        ? item.education
        : Array.isArray(item.educations) && item.educations.length > 0
        ? item.educations
        : Array.isArray(item.data?.education) && item.data.education.length > 0
        ? item.data.education
        : Array.isArray(profileUser?.education) && profileUser.education.length > 0
        ? profileUser.education
        : []);

    const rawSkills =
      item.skills ||
      item.skillList ||
      item.data?.skills ||
      profileUser?.skills ||
      [];

    const skills = Array.isArray(rawSkills)
      ? rawSkills.map((s: any) => (typeof s === 'string' ? s : s?.name || String(s))).filter(Boolean)
      : typeof rawSkills === 'string'
      ? rawSkills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    return {
      id: item.id || `cv-${Math.random().toString(36).substring(2, 9)}`,
      title: item.title || item.headline || (candidateName ? `CV ${candidateName}` : 'CV Saya'),
      candidateName,
      roleTitle,
      email,
      phone,
      location,
      summary,
      experience: rawExp,
      education: rawEdu,
      skills,
      hobbiesAndMisc: item.hobbiesAndMisc || item.data?.hobbiesAndMisc || profileUser?.hobbiesAndMisc || 'Bahasa Indonesia (Native), Bahasa Inggris (Proficient).',
      updatedAt: item.updatedAt || 'Baru saja',
      atsScore: item.atsScore || item.data?.atsScore || 85,
    };
  };

  // Load user session & dynamic CVs from API and localStorage on mount
  useEffect(() => {
    const session = getStoredSession();
    let profile: any = null;
    if (typeof window !== 'undefined') {
      try {
        const storedProfile = localStorage.getItem('employr_user_profile');
        if (storedProfile) profile = JSON.parse(storedProfile);
      } catch (e) {}
    }

    if (session) {
      setUserSession(session);
      const userHistoryKey = `employr_screener_history_${session.email || session.id || 'default'}`;
      const savedHist = localStorage.getItem(userHistoryKey) || localStorage.getItem('employr_screener_history');
      if (savedHist) {
        try {
          const parsed = JSON.parse(savedHist);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setReportHistory(parsed);
          }
        } catch (e) {
          console.error('Failed to parse user screener history:', e);
        }
      }
    } else {
      const globalHist = localStorage.getItem('employr_screener_history');
      if (globalHist) {
        try {
          const parsed = JSON.parse(globalHist);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setReportHistory(parsed);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    // Fetch CVs dari database API, dengan fallback ke localStorage employr_cv_list / profil
    (async () => {
      let candidateCvs: any[] = [];
      try {
        const remoteCvs = await cvApi.getAll();
        if (Array.isArray(remoteCvs) && remoteCvs.length > 0) {
          candidateCvs = remoteCvs;
        }
      } catch (e) {
        console.warn('Could not fetch remote CVs, checking localStorage fallback');
      }

      if (candidateCvs.length === 0 && typeof window !== 'undefined') {
        try {
          const localList = localStorage.getItem('employr_cv_list');
          if (localList) {
            const parsedList = JSON.parse(localList);
            if (Array.isArray(parsedList) && parsedList.length > 0) {
              candidateCvs = parsedList;
            }
          }
          if (candidateCvs.length === 0) {
            const activeDraft = localStorage.getItem('employr_cv_active_draft');
            if (activeDraft) {
              const parsedDraft = JSON.parse(activeDraft);
              if (parsedDraft && (parsedDraft.fullName || parsedDraft.candidateName || parsedDraft.skills)) {
                candidateCvs = [parsedDraft];
              }
            }
          }
        } catch (e) {}
      }

      if (candidateCvs.length > 0) {
        const normalized = candidateCvs.map((c) => normalizeCvItem(c, session, profile));
        setSavedCvs(normalized);
        setSelectedCvId((prev) => prev || normalized[0].id);
        if (normalized[0]?.roleTitle) {
          setTargetRole((prev) => prev || normalized[0].roleTitle);
        }

        // Jika belum ada riwayat sesi screening di localStorage, sediakan sesi awal dari CV aktif
        const userHistoryKey = session
          ? `employr_screener_history_${session.email || session.id || 'default'}`
          : 'employr_screener_history';
        const existingRaw = localStorage.getItem(userHistoryKey) || localStorage.getItem('employr_screener_history');
        if (!existingRaw) {
          const initialSession: SavedReportHistoryItem = {
            id: `hist-${Date.now()}`,
            candidateName: normalized[0].candidateName,
            targetRole: normalized[0].roleTitle,
            targetLevel: 'Junior',
            personaName: 'Startup',
            personaFocus: 'Portofolio & Impact',
            activePurpose: 'fresh_graduate',
            purposeTitle: 'Fresh Graduate',
            consensusScore: normalized[0].atsScore || 76,
            verdictStatus: (normalized[0].atsScore || 76) >= 75 ? 'interview' : 'maybe',
            timestamp: new Date().toLocaleString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            appliedFixes: [],
            cvSourceMode: 'saved',
            selectedCvId: normalized[0].id,
            selectedPersonaId: 'startup',
            selectedSavedCv: normalized[0],
          };
          setReportHistory([initialSession]);
          try {
            localStorage.setItem(userHistoryKey, JSON.stringify([initialSession]));
            localStorage.setItem('employr_screener_history', JSON.stringify([initialSession]));
          } catch (e) {}
        }
      } else {
        // Buat profil dinamis berdasarkan user session atau profil onboarding
        const userDefaultCv = normalizeCvItem(
          {
            id: 'user-active-cv',
            title: session?.name ? `CV - ${session.name}` : 'CV Utama Saya',
            candidateName: session?.name || profile?.fullName || 'Kandidat Pelamar',
            roleTitle: profile?.headline || 'Professional Specialist',
            email: session?.email || profile?.email || 'kandidat@email.com',
          },
          session,
          profile
        );
        setSavedCvs([userDefaultCv]);
        setSelectedCvId(userDefaultCv.id);
        if (userDefaultCv.roleTitle) {
          setTargetRole((prev) => prev || userDefaultCv.roleTitle);
        }
      }
    })();
  }, []);

  // Source Mode Selection
  const [cvSourceMode, setCvSourceMode] = useState<'saved' | 'upload'>('saved');
  const [selectedCvId, setSelectedCvId] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [rawCvText, setRawCvText] = useState('');
  const [uploadedParsedData, setUploadedParsedData] = useState<any>(null);
  const [isParsingUpload, setIsParsingUpload] = useState(false);
  const [isChangeCvModalOpen, setIsChangeCvModalOpen] = useState<boolean>(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState<boolean>(false);
  const [savedCvSearch, setSavedCvSearch] = useState<string>('');
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const cvFileInputRef = useRef<HTMLInputElement>(null);

  // Target Job Role & Recruiter Persona & 10 Purpose Profiles (Default: Pemula / Mahasiswa - Hick's Law)
  const [activePurpose, setActivePurpose] = useState<CvPurpose>('fresh_graduate');
  const [purposeCategoryFilter, setPurposeCategoryFilter] = useState<'all' | 'career' | 'entry' | 'academic' | 'flexible'>('entry');
  const [targetRole, setTargetRole] = useState('');
  const [targetLevel, setTargetLevel] = useState<'Entry' | 'Junior' | 'Mid' | 'Senior'>('Entry');
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('startup');
  const [aiReportData, setAiReportData] = useState<RveReportResult | null>(null);

  // Reset aiReportData when inputs change (hanya pada mode setup)
  useEffect(() => {
    if (mode !== 'report') {
      setAiReportData(null);
    }
  }, [selectedCvId, selectedPersonaId, targetRole, cvSourceMode, uploadedFile, uploadedParsedData, activePurpose, mode]);

  // Hydrate active report from localStorage when accessing /cv-screener/report
  useEffect(() => {
    if (mode === 'report' && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('employr_active_screener_report');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.rveReport) {
            setAiReportData(parsed.rveReport);
            if (parsed.selectedPersonaId) setSelectedPersonaId(parsed.selectedPersonaId);
            if (parsed.activePurpose) setActivePurpose(parsed.activePurpose);
            if (parsed.targetRole) setTargetRole(parsed.targetRole);
            if (parsed.targetLevel) setTargetLevel(parsed.targetLevel);
            if (parsed.cvSourceMode) setCvSourceMode(parsed.cvSourceMode);
            if (parsed.selectedCvId) setSelectedCvId(parsed.selectedCvId);
            if (parsed.appliedFixes) setAppliedFixes(parsed.appliedFixes);
            if (parsed.selectedSavedCv) {
              setSavedCvs((prev) => [parsed.selectedSavedCv, ...prev.filter((c) => c.id !== parsed.selectedSavedCv.id)]);
            }
            setHasRunPipeline(true);
            setActivePhase('report');
            return;
          }
        }
        const globalHist = localStorage.getItem('employr_screener_history');
        if (globalHist) {
          const items = JSON.parse(globalHist);
          if (Array.isArray(items) && items.length > 0) {
            const hist = items[0];
            if (hist.rveReport) setAiReportData(hist.rveReport);
            setCvSourceMode(hist.cvSourceMode);
            if (hist.selectedCvId) setSelectedCvId(hist.selectedCvId);
            setSelectedPersonaId(hist.selectedPersonaId);
            setTargetRole(hist.targetRole);
            if (hist.targetLevel) setTargetLevel(hist.targetLevel);
            if (hist.activePurpose) setActivePurpose(hist.activePurpose);
            setAppliedFixes(hist.appliedFixes || []);
            if (hist.selectedSavedCv) {
              setSavedCvs((prev) => [hist.selectedSavedCv, ...prev.filter((c) => c.id !== hist.selectedSavedCv.id)]);
            }
            setHasRunPipeline(true);
            setActivePhase('report');
            return;
          }
        }
        router.replace('/cv-screener');
      } catch (err) {
        console.warn('Gagal memuat laporan aktif:', err);
      }
    }
  }, [mode, router]);

  // Custom Seniority Dropdown Popover State & Click Outside Ref
  const [isSeniorityDropdownOpen, setIsSeniorityDropdownOpen] = useState(false);
  const seniorityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (seniorityRef.current && !seniorityRef.current.contains(e.target as Node)) {
        setIsSeniorityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const SENIORITY_OPTIONS = [
    { value: 'Entry', label: 'Entry-Level (0 - 1 Tahun)' },
    { value: 'Junior', label: 'Junior-Level (1 - 3 Tahun)' },
    { value: 'Mid', label: 'Mid-Level (3 - 5 Tahun)' },
    { value: 'Senior', label: 'Senior-Level (5+ Tahun)' },
  ] as const;

  // Interactive Fixes State & One-Click Auto Optimization State
  const [appliedFixes, setAppliedFixes] = useState<string[]>([]);
  const [isAutoOptimizing, setIsAutoOptimizing] = useState(false);

  // Selected Modules Checklist State
  const [selectedModules, setSelectedModules] = useState<{
    vision: boolean;
    ats: boolean;
    aiScreener: boolean;
    forecast: boolean;
    improvement: boolean;
  }>({
    vision: true,
    ats: true,
    aiScreener: true,
    forecast: true,
    improvement: true,
  });

  const toggleModule = (key: keyof typeof selectedModules) => {
    setSelectedModules((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      // Ensure at least one module is selected
      if (!Object.values(next).some(Boolean)) return prev;
      return next;
    });
  };

  // Simulation & Pipeline State
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [hasRunPipeline, setHasRunPipeline] = useState(true);

  // Heatmap Overlay View Mode State
  const [showHeatmapOverlay, setShowHeatmapOverlay] = useState<boolean>(true);
  const [heatmapViewMode, setHeatmapViewMode] = useState<'heatmap' | 'f-pattern' | 'bbox' | 'ats-matrix'>('heatmap');

  // Interactive Recruiter Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: 'Halo! Saya Tim Recruiter Employr. Saya telah menganalisis CV Anda secara menyeluruh. Ada yang ingin Anda tanyakan tentang hasil screening atau cara meloloskan CV ini?',
      time: 'Baru saja',
    },
  ]);
  const [inputChatText, setInputChatText] = useState('');

  // Recruiter Persona Search & Filter States
  const [personaSearchQuery, setPersonaSearchQuery] = useState('');
  const [personaCategoryFilter, setPersonaCategoryFilter] = useState<'all' | 'company' | 'region' | 'special'>('all');
  const [expandedPersonaId, setExpandedPersonaId] = useState<string | null>('startup');
  const [showAllPersonas, setShowAllPersonas] = useState(false);

  const filteredPersonas = useMemo(() => {
    return recruiterPersonas.filter((p) => {
      if (personaCategoryFilter !== 'all' && p.category !== personaCategoryFilter) {
        return false;
      }
      if (personaSearchQuery.trim()) {
        const q = personaSearchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchCategory = p.categoryLabel.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        const matchFocus = p.focusArea.toLowerCase().includes(q);
        const matchCompany = p.companies.some((c) => c.toLowerCase().includes(q));
        return matchName || matchCategory || matchDesc || matchFocus || matchCompany;
      }
      return true;
    });
  }, [personaSearchQuery, personaCategoryFilter]);

  const renderStarRating = (count: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${star <= count ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`}
          />
        ))}
      </div>
    );
  };

  const selectedSavedCv = savedCvs.find((c) => c.id === selectedCvId) || savedCvs[0] || undefined;
  const filteredSavedCvs = useMemo(() => {
    if (!savedCvSearch.trim()) return savedCvs;
    const query = savedCvSearch.toLowerCase().trim();
    return savedCvs.filter(
      (c) =>
        (c.candidateName && c.candidateName.toLowerCase().includes(query)) ||
        (c.title && c.title.toLowerCase().includes(query)) ||
        (c.roleTitle && c.roleTitle.toLowerCase().includes(query))
    );
  }, [savedCvs, savedCvSearch]);
  const currentPersona = recruiterPersonas.find((p) => p.id === selectedPersonaId) || recruiterPersonas[0];

  const hasSavedCvs = savedCvs.length > 0;
  const hasUsableCv = cvSourceMode === 'upload' ? Boolean(uploadedFile) : hasSavedCvs;
  const effectiveRole = targetRole.trim() || selectedSavedCv?.roleTitle || 'Role Impian';

  // Execute RVE Pipeline (Dynamic Heuristic or Real AI Result)
  const rveReport = useMemo(() => {
    const baseline = runFullRvePipeline(
      cvSourceMode,
      selectedSavedCv,
      uploadedFile,
      rawCvText,
      targetRole || selectedSavedCv?.roleTitle || '',
      appliedFixes,
      uploadedParsedData,
      activePurpose
    );

    if (aiReportData) {
      const bonus = appliedFixes.length * 5;
      const updatedConsensus = Math.min(99, aiReportData.consensusScore + bonus);
      return {
        ...aiReportData,
        consensusScore: updatedConsensus,
        verdictStatus: (updatedConsensus >= 85 ? 'interview' : updatedConsensus >= 70 ? 'maybe' : 'reject') as any,
        gamification: {
          progress: updatedConsensus,
          checklist: aiReportData.gamification.checklist.map((c) => ({
            ...c,
            isDone: appliedFixes.includes(c.id) || c.isDone,
          })),
        },
      };
    }

    return baseline;
  }, [cvSourceMode, selectedSavedCv, uploadedFile, rawCvText, targetRole, appliedFixes, aiReportData, activePurpose]);

  // Skor match dinamis per persona berdasarkan isi CV
  const personaMatchScores = useMemo(() => {
    const map: Record<string, number> = {};
    const quality = rveReport?.consensusScore ?? 70;
    for (const p of recruiterPersonas) {
      map[p.id] = computePersonaMatchScore(p, selectedSavedCv, quality);
    }
    return map;
  }, [selectedSavedCv, rveReport]);

  const bestMatchPersonaId = useMemo(() => {
    let bestId = recruiterPersonas[0]?.id || '';
    let best = -1;
    for (const p of recruiterPersonas) {
      const s = personaMatchScores[p.id] ?? 0;
      if (s > best) {
        best = s;
        bestId = p.id;
      }
    }
    return bestId;
  }, [personaMatchScores]);

  const currentPersonaMatchScore = personaMatchScores[currentPersona.id] ?? currentPersona.matchScore;

  const activeStepMap = useMemo(() => {
    const map: Record<string, number> = {};
    let step = 1;
    MODULE_CONFIGS.forEach((mod) => {
      if (selectedModules[mod.id]) {
        map[mod.id] = step;
        step++;
      }
    });
    return map;
  }, [selectedModules]);

  // Durasi scan mata HRD dan hotspot utama dihitung dinamis dari konten riil CV
  const scanDuration = useMemo(() => {
    const text = [
      rveReport.parsedData.summary,
      ...rveReport.parsedData.skills,
      ...rveReport.parsedData.experience.map((e) => (Array.isArray(e.achievements) ? e.achievements.join(' ') : '')),
    ].join(' ');
    const words = text.split(/\s+/).filter(Boolean).length;
    const seconds = Math.max(5.2, Math.min(8.4, (words || 150) / 35));
    return seconds.toFixed(1);
  }, [rveReport]);

  const primaryHotspotText = useMemo(() => {
    const hasMetrics = rveReport.gamification.checklist.some((c) => c.id === 'check-1' && c.isDone);
    return hasMetrics ? 'Nama & Metrik Angka' : 'Nama & Posisi Jabatan';
  }, [rveReport]);

  const activePipelineSteps = useMemo(() => {
    return MODULE_CONFIGS.filter((mod) => selectedModules[mod.id]).map((mod) => {
      const stepNum = activeStepMap[mod.id];
      return {
        id: mod.id,
        text: `STEP ${stepNum}: ${mod.pipelineText}`,
      };
    });
  }, [selectedModules, activeStepMap]);

  // Parse uploaded CV file via /api/cv/parse (real PDF/DOCX/TXT extraction)
  const handleParseUploadedFile = async (file: File) => {
    setIsParsingUpload(true);
    setUploadedParsedData(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/cv/parse', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const errorJson = await res.json().catch(() => null);
        throw new Error(errorJson?.error || `Parse API status ${res.status}`);
      }
      const json = await res.json();
      if (json.success && json.data) {
        setUploadedParsedData(json.data);
        const detectedRole =
          json.data.experienceTitle ||
          (Array.isArray(json.data.targetPositions) && json.data.targetPositions[0]) ||
          '';
        if (detectedRole && (!targetRole || targetRole === 'Professional' || targetRole === 'Role Impian')) {
          setTargetRole(detectedRole);
        }
        toast.success(`Berkas "${file.name}" berhasil diekstrak!`);
      } else {
        throw new Error(json.error || 'Gagal memparse berkas CV');
      }
    } catch (err: any) {
      console.warn('[handleParseUploadedFile] Gagal parse:', err);
      toast.warning(err.message || 'Teks berkas tidak dapat diekstrak otomatis. Berkas tetap dapat digunakan.');
      setUploadedParsedData(null);
    } finally {
      setIsParsingUpload(false);
    }
  };

  const handleFileSelect = (file: File) => {
    const validExtensions = ['.pdf', '.docx', '.doc', '.txt'];
    const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
    if (!validExtensions.includes(ext)) {
      toast.error('Format berkas harus berupa PDF, DOCX, DOC, atau TXT.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran berkas melebihi batas maksimal 5MB.');
      return;
    }
    setUploadedFile(file);
    setCvSourceMode('upload');
    handleParseUploadedFile(file);
  };

  const handleDropFile = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingFile) setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  };

  const handleSelectSavedCv = (cv: any) => {
    setSelectedCvId(cv.id);
    setCvSourceMode('saved');
    if (cv.roleTitle && (!targetRole || targetRole === 'Professional' || targetRole === 'Role Impian')) {
      setTargetRole(cv.roleTitle);
    }
    toast.success(`Profil "${cv.title || cv.candidateName}" dipilih.`);
  };

  const handleConfirmCvSelection = () => {
    if (cvSourceMode === 'upload') {
      if (!uploadedFile) {
        toast.warning('Silakan pilih berkas CV terlebih dahulu.');
        return;
      }
      const roleToUse =
        uploadedParsedData?.experienceTitle ||
        (Array.isArray(uploadedParsedData?.targetPositions) && uploadedParsedData?.targetPositions[0]);
      if (roleToUse && (!targetRole || targetRole === 'Professional' || targetRole === 'Role Impian')) {
        setTargetRole(roleToUse);
      }
      toast.success(`Berkas "${uploadedFile.name}" aktif untuk evaluasi.`);
    } else {
      const activeCv = selectedSavedCv || savedCvs[0];
      if (activeCv) {
        setSelectedCvId(activeCv.id);
        if (activeCv.roleTitle && (!targetRole || targetRole === 'Professional' || targetRole === 'Role Impian')) {
          setTargetRole(activeCv.roleTitle);
        }
        toast.success(`CV "${activeCv.title || activeCv.candidateName}" aktif.`);
      }
    }
    setIsChangeCvModalOpen(false);
  };

  const handleCloseCvDrawer = () => {
    if (cvSourceMode === 'upload' && !uploadedFile && hasSavedCvs) {
      setCvSourceMode('saved');
    }
    setIsChangeCvModalOpen(false);
  };

  // Helper untuk menyimpan riwayat sesi screening ke state & localStorage secara persisten
  const persistReportHistory = (items: SavedReportHistoryItem[]) => {
    setReportHistory(items);
    if (typeof window !== 'undefined') {
      try {
        const session = userSession || getStoredSession();
        const userHistoryKey = session
          ? `employr_screener_history_${session.email || session.id || 'default'}`
          : 'employr_screener_history';
        const serialized = JSON.stringify(items);
        localStorage.setItem(userHistoryKey, serialized);
        localStorage.setItem('employr_screener_history', serialized);
      } catch (err) {
        console.warn('Gagal menyimpan riwayat ke localStorage:', err);
      }
    }
  };

  const handleStartRvePipeline = async () => {
    if (cvSourceMode === 'upload' && !uploadedFile) {
      toast.warning('Silakan pilih atau upload file CV Anda terlebih dahulu.');
      return;
    }
    if (cvSourceMode === 'saved' && !hasSavedCvs) {
      toast.warning('Belum ada CV tersimpan di akun Anda. Buat CV terlebih dahulu atau pilih Unggah Berkas.');
      return;
    }

    const effectiveRole = targetRole || selectedSavedCv?.roleTitle || 'Professional';
    if (!targetRole && selectedSavedCv?.roleTitle) {
      setTargetRole(selectedSavedCv.roleTitle);
    }

    setIsProcessing(true);
    setPipelineStep(0);
    setHasRunPipeline(false);
    setActivePhase('report');

    const baseline = runFullRvePipeline(
      cvSourceMode,
      selectedSavedCv,
      uploadedFile,
      rawCvText,
      effectiveRole,
      appliedFixes,
      uploadedParsedData,
      activePurpose
    );

    let finalReport = baseline;

    try {
      const aiPrompt = generateCvScreenerAiPrompt(
        baseline.parsedData,
        effectiveRole,
        targetLevel,
        currentPersona,
        appliedFixes,
        activePurpose
      );

      const stepInterval = setInterval(() => {
        setPipelineStep((prev) => (prev < activePipelineSteps.length - 1 ? prev + 1 : prev));
      }, 200);

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature: 'cv_screener',
          task: 'cv_screener',
          promptName: 'CV Screener & Recruiter Simulation',
          prompt: aiPrompt,
        }),
      });

      clearInterval(stepInterval);

      if (res.ok) {
        const json = await res.json();
        if (json.text) {
          const aiResult = parseAiScreenerResponse(json.text, baseline);
          finalReport = aiResult;
          setAiReportData(aiResult);
        } else {
          setAiReportData(baseline);
        }
      } else {
        setAiReportData(baseline);
      }
    } catch (e) {
      console.warn('[handleStartRvePipeline] Fallback ke dynamic heuristic pipeline:', e);
      setAiReportData(baseline);
      finalReport = baseline;
    } finally {
      setIsProcessing(false);
      setHasRunPipeline(true);

      // Save active report to localStorage for dedicated report page / refresh persistence
      try {
        const activeReportPayload = {
          rveReport: finalReport,
          selectedPersonaId,
          activePurpose,
          targetRole: effectiveRole,
          targetLevel,
          cvSourceMode,
          selectedCvId,
          appliedFixes,
          selectedSavedCv,
          timestamp: Date.now(),
        };
        localStorage.setItem('employr_active_screener_report', JSON.stringify(activeReportPayload));
      } catch (err) {
        console.warn('Gagal menyimpan active report ke localStorage:', err);
      }

      // Auto Save to Report History
      const newHistItem: SavedReportHistoryItem = {
        id: `hist-${Date.now()}`,
        candidateName:
          cvSourceMode === 'saved'
            ? (selectedSavedCv?.candidateName || 'Kandidat')
            : (uploadedFile?.name || 'CV Upload'),
        targetRole: effectiveRole,
        targetLevel,
        personaName: currentPersona.name,
        personaFocus: currentPersona.focusArea,
        activePurpose,
        purposeTitle: CV_PURPOSE_PROFILES[activePurpose]?.title || 'Fresh Graduate',
        consensusScore: finalReport.consensusScore,
        verdictStatus: finalReport.verdictStatus,
        timestamp: new Date().toLocaleString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        appliedFixes: [...appliedFixes],
        cvSourceMode,
        selectedCvId,
        selectedPersonaId,
        rveReport: finalReport,
        selectedSavedCv,
      };

      // Baca riwayat saat ini dari localStorage agar selalu sinkron dan tidak hilang
      let currentHist: SavedReportHistoryItem[] = [];
      try {
        const session = userSession || getStoredSession();
        const userHistoryKey = session
          ? `employr_screener_history_${session.email || session.id || 'default'}`
          : 'employr_screener_history';
        const raw = localStorage.getItem(userHistoryKey) || localStorage.getItem('employr_screener_history');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) currentHist = parsed;
        }
      } catch {}

      const updatedHistory = [newHistItem, ...currentHist.filter((h) => h.id !== newHistItem.id)];
      persistReportHistory(updatedHistory);

      // Direct navigation to dedicated /cv-screener/report
      router.push('/cv-screener/report');
    }
  };

  const handleLoadHistoryReport = (hist: SavedReportHistoryItem) => {
    setIsProcessing(false);
    setCvSourceMode(hist.cvSourceMode);
    if (hist.selectedCvId) setSelectedCvId(hist.selectedCvId);
    setSelectedPersonaId(hist.selectedPersonaId);
    setTargetRole(hist.targetRole);
    if (hist.targetLevel) setTargetLevel(hist.targetLevel);
    if (hist.activePurpose) setActivePurpose(hist.activePurpose);
    setAppliedFixes(hist.appliedFixes || []);
    if (hist.rveReport) {
      setAiReportData(hist.rveReport);
    }
    if (hist.selectedSavedCv) {
      setSavedCvs((prev) => [hist.selectedSavedCv, ...prev.filter((c) => c.id !== hist.selectedSavedCv.id)]);
    }
    setHasRunPipeline(true);
    setActivePhase('report');

    try {
      const activePayload = {
        rveReport: hist.rveReport,
        selectedPersonaId: hist.selectedPersonaId,
        activePurpose: hist.activePurpose || 'fresh_graduate',
        targetRole: hist.targetRole,
        targetLevel: hist.targetLevel || 'Entry',
        cvSourceMode: hist.cvSourceMode,
        selectedCvId: hist.selectedCvId,
        appliedFixes: hist.appliedFixes || [],
        selectedSavedCv: hist.selectedSavedCv,
        timestamp: Date.now(),
      };
      localStorage.setItem('employr_active_screener_report', JSON.stringify(activePayload));
    } catch {}
    router.push('/cv-screener/report');
  };

  // Langsung buka hasil evaluasi CV tanpa menjalankan animasi loading Step 1-5 ulang
  const handleViewCvReportDirectly = (cv: any) => {
    setIsHistoryDrawerOpen(false);
    setSelectedCvId(cv.id);
    setCvSourceMode('saved');
    const effectiveRole = cv.roleTitle || targetRole || 'Professional';
    setTargetRole(effectiveRole);

    // Cek apakah CV ini sudah ada di riwayat sesi screening
    const existingSession = reportHistory.find(
      (h) => h.selectedCvId === cv.id || (h.candidateName === cv.candidateName && h.targetRole === effectiveRole)
    );

    if (existingSession && existingSession.rveReport) {
      handleLoadHistoryReport(existingSession);
      return;
    }

    // Jika belum ada di riwayat atau belum ada rveReport, jalankan kalkulasi instan tanpa animasi loading
    const baseline = runFullRvePipeline(
      'saved',
      cv,
      null,
      '',
      effectiveRole,
      appliedFixes,
      null,
      activePurpose
    );

    setAiReportData(baseline);
    setIsProcessing(false);
    setHasRunPipeline(true);
    setActivePhase('report');

    const newHistItem: SavedReportHistoryItem = {
      id: `hist-${Date.now()}`,
      candidateName: cv.candidateName || 'Kandidat',
      targetRole: effectiveRole,
      targetLevel,
      personaName: currentPersona.name,
      personaFocus: currentPersona.focusArea,
      activePurpose,
      purposeTitle: CV_PURPOSE_PROFILES[activePurpose]?.title || 'Fresh Graduate',
      consensusScore: baseline.consensusScore,
      verdictStatus: baseline.verdictStatus,
      timestamp: new Date().toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      appliedFixes: [...appliedFixes],
      cvSourceMode: 'saved',
      selectedCvId: cv.id,
      selectedPersonaId,
      rveReport: baseline,
      selectedSavedCv: cv,
    };

    let currentHist: SavedReportHistoryItem[] = [];
    try {
      const session = userSession || getStoredSession();
      const userHistoryKey = session
        ? `employr_screener_history_${session.email || session.id || 'default'}`
        : 'employr_screener_history';
      const raw = localStorage.getItem(userHistoryKey) || localStorage.getItem('employr_screener_history');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) currentHist = parsed;
      }
    } catch {}

    const updatedHistory = [newHistItem, ...currentHist.filter((h) => h.id !== newHistItem.id)];
    persistReportHistory(updatedHistory);

    try {
      const activeReportPayload = {
        rveReport: baseline,
        selectedPersonaId,
        activePurpose,
        targetRole: effectiveRole,
        targetLevel,
        cvSourceMode: 'saved',
        selectedCvId: cv.id,
        appliedFixes,
        selectedSavedCv: cv,
        timestamp: Date.now(),
      };
      localStorage.setItem('employr_active_screener_report', JSON.stringify(activeReportPayload));
    } catch (err) {
      console.warn('Gagal menyimpan active report:', err);
    }

    router.push('/cv-screener/report');
  };

  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = reportHistory.filter((item) => item.id !== id);
    persistReportHistory(updated);
  };

  const handleClearAllHistory = () => {
    persistReportHistory([]);
  };

  // 10. Satu Tombol Besar: Optimalkan CV Saya (Auto Apply All Fixes & Nyata Tersimpan)
  const handleAutoOptimizeCv = async () => {
    setIsAutoOptimizing(true);
    const fixes = ['fix-1', 'fix-2', 'fix-3'];
    setAppliedFixes(fixes);

    try {
      if (selectedSavedCv) {
        const updatedExp = [...(selectedSavedCv.experience || [])];
        const firstFix = rveReport.beforeAfterFixes.find((f) => f.id === 'fix-1');
        if (firstFix && updatedExp[0]) {
          const achs = Array.isArray(updatedExp[0].achievements) ? [...updatedExp[0].achievements] : [];
          achs[0] = firstFix.after;
          updatedExp[0] = { ...updatedExp[0], achievements: achs };
        }

        const secondFix = rveReport.beforeAfterFixes.find((f) => f.id === 'fix-2');
        const updatedSummary = secondFix ? secondFix.after : selectedSavedCv.summary;

        const extraSkills = ['Koordinasi Proyek', 'Pelaporan Kegiatan', 'Analisis Data'];
        const updatedSkills = Array.from(new Set([...(selectedSavedCv.skills || []), ...extraSkills]));

        const updatedCvData = {
          ...selectedSavedCv,
          summary: updatedSummary,
          experience: updatedExp,
          skills: updatedSkills,
          updatedAt: 'Baru saja diperbarui',
        };

        localStorage.setItem('employr_cv_active_draft', JSON.stringify(updatedCvData));
        setSavedCvs((prev) => prev.map((c) => (c.id === selectedSavedCv.id ? updatedCvData : c)));

        if (selectedSavedCv.id && !selectedSavedCv.id.startsWith('default-')) {
          await cvApi.update(selectedSavedCv.id, updatedCvData).catch(() => {});
        }
      }
      toast.success('Semua perbaikan kalimat berhasil diterapkan dan disimpan ke draf CV Anda!');
    } catch (e) {
      console.warn('Gagal menyimpan otomatis ke CV:', e);
      toast.info('Perbaikan diterapkan pada simulasi laporan!');
    } finally {
      setIsAutoOptimizing(false);
      const elem = document.getElementById('verdict-summary-top');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleApplyFix = async (fixId: string) => {
    if (!appliedFixes.includes(fixId)) {
      setAppliedFixes((prev) => [...prev, fixId]);
      try {
        if (selectedSavedCv) {
          const targetFix = rveReport.beforeAfterFixes.find((f) => f.id === fixId);
          if (targetFix) {
            let updatedData = { ...selectedSavedCv };
            if (fixId === 'fix-1' && updatedData.experience?.[0]) {
              const updatedExp = [...updatedData.experience];
              const achs = Array.isArray(updatedExp[0].achievements) ? [...updatedExp[0].achievements] : [];
              achs[0] = targetFix.after;
              updatedExp[0] = { ...updatedExp[0], achievements: achs };
              updatedData.experience = updatedExp;
            } else if (fixId === 'fix-2') {
              updatedData.summary = targetFix.after;
            } else if (fixId === 'fix-3') {
              const extraSkills = ['Koordinasi Proyek', 'Pelaporan Kegiatan'];
              updatedData.skills = Array.from(new Set([...(updatedData.skills || []), ...extraSkills]));
            }
            updatedData.updatedAt = 'Baru saja diperbarui';
            localStorage.setItem('employr_cv_active_draft', JSON.stringify(updatedData));
            setSavedCvs((prev) => prev.map((c) => (c.id === selectedSavedCv.id ? updatedData : c)));
            if (selectedSavedCv.id && !selectedSavedCv.id.startsWith('default-')) {
              await cvApi.update(selectedSavedCv.id, updatedData).catch(() => {});
            }
          }
        }
        toast.success('Perbaikan seksi berhasil disimpan ke draf CV!');
      } catch {
        toast.info('Perbaikan diterapkan pada simulasi!');
      }
    }
  };

  // Chat handling logic connected to AI system
  const handleSendChatMessage = async (textToSend?: string) => {
    const query = textToSend || inputChatText;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      time: 'Baru saja',
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputChatText('');

    const effectiveRole = targetRole || selectedSavedCv?.roleTitle || 'Professional';

    try {
      const aiPrompt = `Anda adalah Tim Recruiter Konsultan Karier untuk platform Employr.
Pengguna sedang berkonsultasi mengenai hasil evaluasi CV untuk target posisi "${effectiveRole}".
Kriteria Recruiter: ${currentPersona.name} (${currentPersona.evalFocus}).
Ringkasan CV: ${rveReport.parsedData.summary || '-'}
Keahlian: ${rveReport.parsedData.skills.join(', ') || '-'}
Skor Konsensus Saat Ini: ${rveReport.consensusScore}%
Catatan Evaluasi: ${rveReport.topAiSummary.dropReasons.join('; ')}

Pertanyaan Pengguna: "${query}"

Berikan respon konsultasi yang profesional, bersahabat, ringkas (2-3 kalimat), dan berorientasi aksi nyata dalam Bahasa Indonesia. Jangan menyebut istilah prompt atau LLM.`;

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature: 'cv_screener',
          task: 'cv_screener',
          prompt: aiPrompt,
        }),
      });

      const data = await res.json();
      if (!data.text) throw new Error('No response text');

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.text,
        time: 'Baru saja',
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    } catch {
      let responseText = '';
      const lower = query.toLowerCase();

      if (lower.includes('ditolak') || lower.includes('kelemahan') || lower.includes('kurang')) {
        responseText = `Berdasarkan evaluasi kriteria ${currentPersona.name}, CV Anda berpeluang lolos lebih tinggi bila menambahkan metrik angka (%) pada pengalaman proyek serta menonjolkan keahlian relevan untuk posisi ${effectiveRole}.`;
      } else if (lower.includes('summary') || lower.includes('ringkasan')) {
        responseText = `Menyesuaikan ringkasan profil agar langsung menyebutkan keunggulan utama dan pengalaman ${effectiveRole} akan memikat recruiter dalam 6 detik pertama! Klik "Optimalkan CV Saya" untuk memperbarui otomatis.`;
      } else if (lower.includes('100%') || lower.includes('sempurna')) {
        responseText = `Untuk mencapai hasil 100% optimal: 1) Sertakan metrik keberhasilan %, 2) Pastikan kata kunci ${effectiveRole} berada di bagian teratas, dan 3) Gunakan kata kerja aktif pada tiap poin pengalaman.`;
      } else {
        responseText = `Pertanyaan yang sangat bagus! Recruiter tipe ${currentPersona.name} sangat memprioritaskan ${currentPersona.focusArea}. Mengoptimalkan bagian tersebut akan memberikan dampak peningkatan skor paling nyata.`;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: responseText,
        time: 'Baru saja',
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 w-full pb-12 font-sans transition-all duration-300">
      {/* PHASE 1: SETUP & HISTORY 3-COLUMN LAYOUT VIEW */}
      {activePhase === 'setup' && (
        <div className="space-y-4 sm:space-y-5 w-full animate-in fade-in duration-300">
          {/* Header Status & Action Bar */}
          <div className="relative overflow-hidden px-4 py-2.5 sm:py-3 rounded-[10px] bg-[#162758] border border-[#20367A] text-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap relative z-10">
              <div className="flex items-center gap-2 shrink-0">
                <div className="p-1.5 rounded-[8px] bg-white/10 text-white shrink-0">
                  <Play className="w-4 h-4 fill-white" />
                </div>
                <span className="font-extrabold text-xs sm:text-sm text-white tracking-tight uppercase">
                  CV Screener
                </span>
              </div>

              <div className="h-4 w-[1px] bg-white/20 hidden sm:block shrink-0" />

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-white/10 border border-white/15 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Tahap:</span>
                  <span className="text-xs font-black text-white leading-none">Konfigurasi Target</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-white/10 border border-white/15 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Status:</span>
                  <span className="text-xs font-black text-emerald-400 leading-none">Siaga</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 md:ml-auto w-full sm:w-auto flex items-center justify-end gap-2.5 relative z-10 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={() => setIsHistoryDrawerOpen(true)}
                className="px-3.5 py-2 rounded-[10px] bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white font-bold text-xs border border-white/20 shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                title="Buka Riwayat Screening & Laporan CV"
              >
                <History className="w-3.5 h-3.5 text-orange-400" />
                <span>Riwayat Screening</span>
                {reportHistory.length > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-extrabold bg-orange-500 text-white rounded-[6px] leading-none">
                    {reportHistory.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={handleStartRvePipeline}
                disabled={isProcessing}
                className="px-4 py-2 rounded-[10px] bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-black text-xs shadow-md shadow-orange-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0 w-full sm:w-auto"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Mulai Screening</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Configuration Card: Position, Seniority & CV File Source */}
          <div className="p-5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              {/* KIRI: Pilih Berkas CV / CV Aktif (Gaya match-cv) */}
              <div className="md:col-span-6 space-y-1.5">
                <label className="text-xs font-extrabold text-slate-900 dark:text-white block mb-1">
                  Pilih Berkas CV
                </label>
                <div className="bg-slate-50 dark:bg-slate-800/80 rounded-[10px] border border-slate-200 dark:border-slate-700 p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-[10px] bg-[#1F3578]/10 dark:bg-blue-950 text-[#1F3578] dark:text-blue-400 flex items-center justify-center shrink-0">
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          CV Aktif:
                        </span>
                        <span className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[200px]">
                          {cvSourceMode === 'upload'
                            ? (uploadedFile ? uploadedFile.name : 'Belum ada berkas terunggah')
                            : (hasSavedCvs
                                ? (selectedSavedCv.title || selectedSavedCv.candidateName)
                                : 'Belum ada CV tersimpan')}
                        </span>
                        {cvSourceMode === 'upload' && isParsingUpload && (
                          <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1 shrink-0 animate-pulse">
                            <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                            <span>Membaca CV...</span>
                          </span>
                        )}
                        {cvSourceMode === 'upload' && !isParsingUpload && uploadedParsedData && (
                          <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 shrink-0">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Terekstraksi</span>
                          </span>
                        )}
                        {cvSourceMode === 'saved' && hasUsableCv && (
                          <span className={`px-2 py-0.5 rounded-[10px] text-[10px] font-extrabold border flex items-center gap-1 shrink-0 ${getScoreBadgeClass(selectedSavedCv?.atsScore)}`}>
                            <Star className="w-3 h-3 fill-current" />
                            <span>{selectedSavedCv?.atsScore}% ATS</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {cvSourceMode === 'upload'
                          ? (isParsingUpload ? 'Sedang mengekstrak teks...' : uploadedParsedData?.experienceTitle || uploadedParsedData?.fullName || 'Berkas Unggahan Lokal')
                          : (hasSavedCvs
                              ? `${selectedSavedCv.roleTitle} • Terakhir dianalisis ${selectedSavedCv.updatedAt}`
                              : 'Buat CV di menu CV Builder atau pilih Unggah Berkas')}
                      </p>
                    </div>
                  </div>

                  {hasUsableCv ? (
                    <button
                      type="button"
                      onClick={() => setIsChangeCvModalOpen(true)}
                      className="group px-3.5 py-1.5 rounded-[10px] bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 text-[#1F3578] dark:text-blue-300 text-xs font-bold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-xs hover:shadow-sm active:scale-[0.97]"
                      title="Ganti berkas CV yang sedang aktif"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5 text-[#1F3578] dark:text-blue-300 group-hover:rotate-180 transition-transform duration-300 ease-out" />
                      <span>Ganti CV</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsChangeCvModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Pilih Berkas CV</span>
                    </button>
                  )}
                </div>
              </div>

              {/* KANAN: Nama Posisi Pekerjaan Target + Tingkat Senioritas (Dropdown) */}
              <div className="md:col-span-6 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-extrabold text-slate-900 dark:text-white block mb-1">
                      Nama Posisi Pekerjaan Target *
                    </label>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="Contoh: Senior Fullstack Engineer"
                      className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-[#1738D1] focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-slate-900 dark:text-white block mb-1">
                      Tingkat Senioritas
                    </label>
                    <div className="relative" ref={seniorityRef}>
                      <button
                        type="button"
                        onClick={() => setIsSeniorityDropdownOpen((prev) => !prev)}
                        className="w-full px-3.5 py-2.5 rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium flex items-center justify-between focus:ring-2 focus:ring-[#1738D1] focus:outline-none transition cursor-pointer shadow-2xs"
                      >
                        <span>
                          {SENIORITY_OPTIONS.find((o) => o.value === targetLevel)?.label || targetLevel}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                            isSeniorityDropdownOpen ? 'rotate-180 text-orange-500' : ''
                          }`}
                        />
                      </button>

                      {isSeniorityDropdownOpen && (
                        <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] shadow-xl text-xs py-1 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                          {SENIORITY_OPTIONS.map((opt) => {
                            const isSelected = targetLevel === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                  setTargetLevel(opt.value);
                                  setIsSeniorityDropdownOpen(false);
                                }}
                                className={`w-full text-left px-3.5 py-2.5 font-medium transition cursor-pointer flex items-center justify-between ${
                                  isSelected
                                    ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-bold'
                                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#1738D1]' : 'bg-slate-300 dark:bg-slate-600'}`} />
                                  <span>{opt.label}</span>
                                </div>
                                {isSelected && <Check className="w-3.5 h-3.5 text-orange-500 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PURPOSE PROFILES SELECTOR (10 Tujuan CV Adaptif) */}
          <div className="p-5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-orange-500" />
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Pilih Tujuan &amp; Konteks CV (Purpose Profile)
                  </h3>
                  <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-extrabold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    10 Profil Adaptif
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Setiap tujuan memiliki matriks bobot scoring dan aturan penilaian yang disesuaikan secara dinamis.
                </p>
              </div>

              {/* Filter Kategori Purpose */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                {[
                  { id: 'entry', label: 'Pemula / Mahasiswa' },
                  { id: 'career', label: 'Karier' },
                  { id: 'flexible', label: 'Fleksibel' },
                  { id: 'academic', label: 'Akademik' },
                  { id: 'all', label: 'Semua (10)' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setPurposeCategoryFilter(tab.id as any)}
                    className={`px-2.5 py-1 rounded-[10px] text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                      purposeCategoryFilter === tab.id
                        ? 'bg-[#1738D1] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid 10 Purpose Profiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {Object.values(CV_PURPOSE_PROFILES)
                .filter((p) => purposeCategoryFilter === 'all' || p.category === purposeCategoryFilter)
                .map((prof) => {
                  const isSelected = activePurpose === prof.id;
                  return (
                    <button
                      key={prof.id}
                      type="button"
                      onClick={() => setActivePurpose(prof.id)}
                      className={`p-3 rounded-[10px] border text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                        isSelected
                          ? 'bg-blue-50/60 dark:bg-blue-950/40 border-[#1738D1] ring-2 ring-[#1738D1]/20 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                            {prof.title}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#1738D1] shrink-0" />}
                        </div>
                        <span className="inline-block px-1.5 py-0.5 rounded-[6px] text-[9px] font-bold uppercase bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {prof.badge}
                        </span>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight pt-0.5">
                          {prof.objective}
                        </p>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[9px] font-bold text-slate-500 dark:text-slate-400">
                        <span>{prof.requiredComponents.length} Komponen</span>
                        <span className="text-[#1738D1] dark:text-blue-400 font-extrabold">100% Bobot</span>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* MAIN 2-COLUMN BALANCED GRID (Left Recruiter List, Right Detailed Preview) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* COLUMN 1: Recruiter List (Pilih Tipe Recruiter - Left Column) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={personaSearchQuery}
                    onChange={(e) => setPersonaSearchQuery(e.target.value)}
                    placeholder="Cari recruiter atau perusahaan..."
                    className="w-full pl-8 pr-7 py-1.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1738D1] focus:outline-none transition"
                  />
                  {personaSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setPersonaSearchQuery('')}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Pilih Tipe Recruiter
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {filteredPersonas.length} Tipe
                  </span>
                </div>

                {/* Compact Vertical List of Recruiter Cards */}
                <div className="space-y-2">
                  {(showAllPersonas || personaSearchQuery
                    ? filteredPersonas
                    : filteredPersonas.slice(0, 7)
                  ).map((persona) => {
                    const isSelected = selectedPersonaId === persona.id;

                    return (
                      <div
                        key={persona.id}
                        onClick={() => {
                          setSelectedPersonaId(persona.id);
                          setExpandedPersonaId(persona.id);
                        }}
                        className={`p-3 rounded-[10px] border transition-all cursor-pointer flex items-center justify-between gap-2.5 group ${
                          isSelected
                            ? 'border-[#1738D1] bg-orange-50/90 dark:bg-orange-950/40 ring-1 ring-[#1738D1]/20 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 hover:border-orange-400 dark:hover:border-[#1738D1]/60 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Avatar Icon */}
                          <div
                            className={`p-2 rounded-[10px] shrink-0 transition ${
                              isSelected
                                ? 'bg-[#1738D1] text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-orange-100 dark:group-hover:bg-orange-950 group-hover:text-orange-600'
                            }`}
                          >
                            {persona.category === 'company' && <Building2 className="w-4 h-4" />}
                            {persona.category === 'region' && <Globe className="w-4 h-4" />}
                            {persona.category === 'special' && <GraduationCap className="w-4 h-4" />}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4
                                className={`font-black text-xs transition truncate ${
                                  isSelected
                                    ? 'text-orange-600 dark:text-orange-400'
                                    : 'text-slate-900 dark:text-white group-hover:text-orange-600'
                                }`}
                              >
                                {persona.name}
                              </h4>
                              {hasUsableCv && persona.id === bestMatchPersonaId && (
                                <span className="text-[8px] font-extrabold text-amber-700 bg-amber-100 dark:bg-amber-950 dark:text-amber-300 px-1 py-0.2 rounded-[10px] border border-amber-300 dark:border-amber-800 shrink-0">
                                  Top Match
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                              Fokus: {persona.focusArea}
                            </p>
                          </div>
                        </div>

                        {/* Dynamic Match Score + Selected Indicator */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-[10px] border transition-colors ${
                              hasUsableCv
                                ? getScoreBadgeClass(personaMatchScores[persona.id] ?? persona.matchScore)
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {hasUsableCv ? `${personaMatchScores[persona.id] ?? persona.matchScore}%` : '—'}
                          </span>
                          {isSelected && (
                            <span className="p-0.5 rounded-full bg-[#1738D1] text-white shadow-xs shrink-0">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Show All Toggle Button */}
                {!personaSearchQuery && filteredPersonas.length > 7 && (
                  <button
                    type="button"
                    onClick={() => setShowAllPersonas(!showAllPersonas)}
                    className="w-full py-2 rounded-[10px] bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-600 dark:text-slate-300 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    <span>{showAllPersonas ? 'Ringkaskan List' : `Lihat ${filteredPersonas.length - 7} lainnya`}</span>
                    {showAllPersonas ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              {/* Tips Footer Card */}
              <div className="p-3.5 rounded-[10px] bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-navy-900/60 flex items-start gap-2.5 text-[11px] text-navy-900 dark:text-blue-200">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="leading-snug">
                  <strong className="font-bold">Tips:</strong> Pilih recruiter yang paling relevan dengan posisi &amp; perusahaan impianmu. Kamu bisa ubah kapan saja untuk melihat perbedaan hasil evaluasi.
                </p>
              </div>
            </div>

            {/* COLUMN 2: Preview Recruiter & Modul Screening (Right Column) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                  Preview Recruiter
                </span>

                {/* Current Persona Header Card */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-[10px] bg-[#1738D1] text-white shadow-md">
                        {currentPersona.category === 'company' && <Building2 className="w-6 h-6" />}
                        {currentPersona.category === 'region' && <Globe className="w-6 h-6" />}
                        {currentPersona.category === 'special' && <GraduationCap className="w-6 h-6" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xl font-black text-slate-900 dark:text-white">
                            {currentPersona.name}
                          </h3>
                          {hasUsableCv && currentPersona.id === bestMatchPersonaId && (
                            <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-[10px] border border-amber-300 dark:border-amber-800">
                              Best Match
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                          {currentPersona.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-2xl font-black block transition-colors ${getScoreTextClass(currentPersonaMatchScore, !hasUsableCv)}`}>
                        {hasUsableCv ? `${currentPersonaMatchScore}%` : '—'}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Match</span>
                    </div>
                  </div>

                  {/* Sistem akan fokus pada: */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                      Sistem akan fokus pada:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {currentPersona.highlights.map((item, idx) => (
                        <div
                          key={idx}
                          className="px-2.5 py-2 rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-1.5 text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-snug"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="break-words">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contoh Perusahaan */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                      Contoh Perusahaan
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentPersona.companies.map((comp, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold"
                        >
                          {comp}
                        </span>
                      ))}
                      <span className="px-2 py-1 rounded-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold">
                        +2
                      </span>
                    </div>
                  </div>

                  {/* Yang Paling Dinilai */}
                  <div className="p-3.5 rounded-[10px] bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 flex items-start gap-2.5 text-xs">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold text-amber-900 dark:text-amber-200 block text-xs">
                        Yang Paling Dinilai
                      </span>
                      <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium leading-snug pt-0.5">
                        {currentPersona.evalFocus}
                      </p>
                    </div>
                  </div>

                  {/* Module Checkbox Selection */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                        Pilih Fitur Screening yang Diuji:
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {Object.values(selectedModules).filter(Boolean).length} / 5 Diuji
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {MODULE_CONFIGS.map((item) => {
                        const isChecked = selectedModules[item.id];
                        const stepNum = activeStepMap[item.id];
                        const ItemIcon = item.icon;

                        return (
                          <div
                            key={item.id}
                            onClick={() => toggleModule(item.id)}
                            className={`p-2.5 rounded-[10px] border transition-all flex items-center justify-between cursor-pointer select-none ${
                              isChecked
                                ? 'bg-orange-50/70 dark:bg-orange-950/30 border-orange-300 dark:border-orange-800 text-slate-900 dark:text-white font-bold shadow-2xs'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 font-medium opacity-60 hover:opacity-100'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0 pr-2">
                              <ItemIcon className={`w-4 h-4 shrink-0 ${item.color}`} />
                              <span className="text-[11px] truncate leading-tight">{item.label}</span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {isChecked && (
                                <span className="px-1.5 py-0.5 rounded-[10px] text-[9px] font-black uppercase bg-[#1738D1] text-white shadow-2xs">
                                  STEP {stepNum}
                                </span>
                              )}
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="w-4 h-4 accent-[#1738D1] rounded-[10px] cursor-pointer pointer-events-none"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Submit Action Button: Mulai Screening */}
                  <button
                    type="button"
                    onClick={handleStartRvePipeline}
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-[10px] bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-black text-sm shadow-md shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:-translate-y-0.5 mt-2"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Memproses Evaluasi...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-white" />
                        <span>Mulai Screening</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 2: IMMERSIVE FULL-WIDTH REPORT VIEW */}
      {activePhase === 'report' && (
        <div className="space-y-6 w-full animate-in fade-in duration-300">
          {/* Top Bar Navigation for Report View */}
          <div className="p-4 sm:p-5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (mode === 'report') {
                    router.push('/cv-screener');
                  } else {
                    setActivePhase('setup');
                  }
                }}
                className="px-3.5 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4 text-orange-500" />
                <span>Ubah Recruiter &amp; CV</span>
              </button>

              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Hasil Evaluasi Screening CV
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-[10px] text-[10px] font-extrabold bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                    Recruiter: {currentPersona.name}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-[10px] text-[10px] font-extrabold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-navy-800">
                    Posisi: {targetRole || selectedSavedCv?.roleTitle || 'Sesuai Profil CV'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setIsHistoryDrawerOpen(true)}
                className="px-3.5 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Buka Riwayat Screening & Laporan CV"
              >
                <History className="w-3.5 h-3.5 text-orange-500" />
                <span>Riwayat Screening</span>
                {reportHistory.length > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-extrabold bg-[#1738D1] text-white rounded-[6px] leading-none">
                    {reportHistory.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Processing Animation */}
          {isProcessing && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-8 text-center space-y-6 shadow-sm">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-orange-200 animate-ping" />
                <div className="relative w-16 h-16 rounded-full bg-[#1738D1] text-white flex items-center justify-center shadow-md">
                  <Sparkles className="w-8 h-8 animate-pulse text-white fill-white" />
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Proses Screening Sedang Berjalan ({activePipelineSteps.length} Fitur Diuji)
                </h3>
                <p className="text-xs text-orange-600 dark:text-orange-400 font-bold animate-pulse">
                  {activePipelineSteps[pipelineStep]?.text || 'Menyelesaikan analisis...'}
                </p>
              </div>

              <div className="space-y-2 max-w-md mx-auto text-left">
                {activePipelineSteps.map((stepItem, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    {idx < pipelineStep ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : idx === pipelineStep ? (
                      <RefreshCw className="w-4 h-4 text-orange-500 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-700 shrink-0" />
                    )}
                    <span
                      className={
                        idx === pipelineStep
                          ? 'font-bold text-orange-600 dark:text-orange-400'
                          : idx < pipelineStep
                          ? 'text-slate-500 dark:text-slate-400 line-through opacity-70'
                          : 'text-slate-400 dark:text-slate-500'
                      }
                    >
                      {stepItem.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Master Full-Width Report Content */}
          {!isProcessing && hasRunPipeline && (
            <div className="space-y-6 w-full">
              {/* Top AI Summary Banner */}
              <div className="p-6 rounded-[10px] bg-[#1738D1] text-white shadow-md space-y-3 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

                <div className="flex items-center justify-between border-b border-white/20 pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 fill-white text-white" />
                    <h3 className="font-extrabold text-xs uppercase tracking-wider">Ringkasan Evaluasi Sistem</h3>
                  </div>
                  <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-[10px] border border-white/20">
                    Estimasi Peluang: {rveReport.topAiSummary.estimatedProbability}%
                  </span>
                </div>

                <p className="text-xs font-semibold leading-relaxed">
                  {rveReport.topAiSummary.overview} Peluang panggilan interview saat ini diperkirakan{' '}
                  <strong className="underline decoration-amber-300 underline-offset-2">
                    {rveReport.topAiSummary.estimatedProbability}%
                  </strong>.
                </p>

                <div className="space-y-1.5 pt-1 text-xs">
                  <span className="text-[11px] font-bold text-amber-200 block">Poin Penyebab Peluang Belum 100%:</span>
                  <ul className="space-y-1">
                    {rveReport.topAiSummary.dropReasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-slate-100 text-[11px]">
                        <span className="text-amber-300 font-bold">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* PURPOSE PROFILE SWITCHER BAR (10 Profil Adaptif) */}
              <div className="p-4 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-orange-500" />
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Tujuan Simulasi Screening (Purpose Profile)
                    </span>
                    <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-extrabold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                      Aktif: {CV_PURPOSE_PROFILES[activePurpose]?.title || 'Lamar Kerja'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Ganti tujuan untuk melihat adaptasi bobot scoring seketika
                  </span>
                </div>

                {/* 10 Purpose Buttons Horizontal Scroll / Wrap */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {Object.values(CV_PURPOSE_PROFILES).map((prof) => {
                    const isSelected = activePurpose === prof.id;
                    return (
                      <button
                        key={prof.id}
                        type="button"
                        onClick={() => setActivePurpose(prof.id)}
                        className={`px-3 py-1.5 rounded-[10px] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-[#1738D1] text-white shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span>{prof.title}</span>
                        {isSelected && <Check className="w-3 h-3 text-white shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* OVERALL MASTER SCORE & 5 DIAGNOSTIC SCORING DIMENSIONS */}
              <div
                id="verdict-summary-top"
                className="p-6 md:p-8 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
              >
                {/* Master Hero Score Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Skor Komprehensif Berdasarkan Tujuan
                      </span>
                      <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-bold bg-navy-50 dark:bg-navy-950 text-navy-700 dark:text-navy-300 border border-navy-200 dark:border-navy-800">
                        {CV_PURPOSE_PROFILES[activePurpose]?.badge}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">CV Score</span>
                      <span className="text-4xl font-black text-orange-500">
                        {rveReport.purposeScore?.overallScore ?? rveReport.consensusScore}
                        <span className="text-base font-bold text-slate-400">/100</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-xl pt-0.5">
                      {rveReport.purposeScore?.summaryFeedback || rveReport.topAiSummary.overview}
                    </p>
                  </div>

                  {/* Verdict Status Indicator */}
                  <div className="flex flex-col items-start sm:items-end gap-2 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-[10px] border border-slate-200/80 dark:border-slate-700/80 shrink-0">
                    {rveReport.verdictStatus === 'interview' && (
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                        <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-xs" />
                        <span>Interview Recommended</span>
                      </div>
                    )}
                    {rveReport.verdictStatus === 'maybe' && (
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-extrabold text-sm">
                        <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-xs" />
                        <span>Dipertimbangkan (Maybe)</span>
                      </div>
                    )}
                    {rveReport.verdictStatus === 'reject' && (
                      <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-extrabold text-sm">
                        <span className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-xs" />
                        <span>Perlu Perbaikan (Reject)</span>
                      </div>
                    )}
                    <span className="text-[10px] font-bold text-slate-400 block">
                      Tingkat Kepercayaan Analisis: {rveReport.confidenceScore}%
                    </span>
                  </div>
                </div>

                {/* 5 PILAR DIMENSI DIAGNOSTIK BENTO GRID */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-orange-500" />
                      5 Dimensi Diagnostik Kualitas CV
                    </h4>
                    <span className="text-[10px] font-extrabold text-slate-400">
                      Standar Multidimensi
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {/* Dimensi 1: Completeness */}
                    <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                            Completeness
                          </span>
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                            {rveReport.purposeScore?.dimensions.completeness.score ?? 92}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${rveReport.purposeScore?.dimensions.completeness.score ?? 92}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                        {rveReport.purposeScore?.dimensions.completeness.missingItems.length === 0
                          ? 'Seksi wajib lengkap terisi.'
                          : `Perlu: ${rveReport.purposeScore?.dimensions.completeness.missingItems.slice(0, 1).join(', ')}`}
                      </p>
                    </div>

                    {/* Dimensi 2: ATS Compatibility */}
                    <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                            ATS Compatibility
                          </span>
                          <span className="text-xs font-black text-[#1738D1] dark:text-blue-400">
                            {rveReport.purposeScore?.dimensions.atsCompatibility.score ?? 95}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#1738D1] transition-all duration-500"
                            style={{ width: `${rveReport.purposeScore?.dimensions.atsCompatibility.score ?? 95}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                        Format dan hierarki heading terbaca sempurna oleh bot parser.
                      </p>
                    </div>

                    {/* Dimensi 3: Content Quality */}
                    <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                            Content Quality
                          </span>
                          <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                            {rveReport.purposeScore?.dimensions.contentQuality.score ?? 78}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                            style={{ width: `${rveReport.purposeScore?.dimensions.contentQuality.score ?? 78}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                        {rveReport.purposeScore?.dimensions.contentQuality.actionVerbsCount ?? 3} Action Verbs terdeteksi.
                      </p>
                    </div>

                    {/* Dimensi 4: Job / Target Relevance */}
                    <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                            Job Relevance
                          </span>
                          <span className="text-xs font-black text-purple-600 dark:text-purple-400">
                            {rveReport.purposeScore?.dimensions.jobRelevance.score ?? 84}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-purple-500 transition-all duration-500"
                            style={{ width: `${rveReport.purposeScore?.dimensions.jobRelevance.score ?? 84}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                        {rveReport.purposeScore?.dimensions.jobRelevance.matchedKeywords.length ?? 4} Kata kunci cocok dengan lowongan target.
                      </p>
                    </div>

                    {/* Dimensi 5: Achievement Strength */}
                    <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                            Achievement Strength
                          </span>
                          <span className={`text-xs font-black transition-colors ${getScoreTextClass(rveReport.purposeScore?.dimensions.achievementStrength.score ?? 69)}`}>
                            {rveReport.purposeScore?.dimensions.achievementStrength.score ?? 69}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${getScoreProgressBarClass(rveReport.purposeScore?.dimensions.achievementStrength.score ?? 69)}`}
                            style={{ width: `${rveReport.purposeScore?.dimensions.achievementStrength.score ?? 69}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                        {rveReport.purposeScore?.dimensions.achievementStrength.measurableBulletsCount ?? 2} poin memiliki metrik angka konkret (%).
                      </p>
                    </div>
                  </div>
                </div>

                {/* RINCIAN MATRIKS BOBOT SESUAI PURPOSE PROFILE ($100%) */}
                {rveReport.purposeScore?.componentBreakdown && (
                  <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-orange-500" />
                        Rincian Matriks Bobot Scoring ({CV_PURPOSE_PROFILES[activePurpose]?.title})
                      </span>
                      <span className="text-[10px] font-black text-[#1738D1] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded-[8px] border border-blue-200 dark:border-blue-800">
                        Total Bobot: 100%
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                      {rveReport.purposeScore.componentBreakdown.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-[8px] bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                              {item.label}
                            </span>
                            <span className="text-[10px] font-extrabold text-orange-500 shrink-0">
                              {item.weight}% Bobot
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                            <span className="truncate">{item.feedback}</span>
                            <span className="font-bold text-slate-900 dark:text-white shrink-0 ml-1">
                              {item.score}/100
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Perbandingan Sebelum & Sesudah Card */}
                <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Sebelum Optimasi</span>
                      <span className="text-base font-bold text-slate-500 line-through">
                        ATS {rveReport.beforeAfterComparison.beforeScore}%
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 block uppercase">
                        Setelah Optimasi
                      </span>
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                        {rveReport.beforeAfterComparison.afterScore}%
                      </span>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-[10px] text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto">
                    +{rveReport.beforeAfterComparison.diff}% Peningkatan
                  </span>
                </div>

                {/* Gamification (Progress CV & Missing Checklist) */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Gauge className="w-4 h-4 text-orange-500" />
                      Progress Kesiapan CV
                    </span>
                    <span className="text-orange-500 font-extrabold">{rveReport.gamification.progress}% / 100%</span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                      style={{ width: `${rveReport.gamification.progress}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 text-[11px] pt-1">
                    {rveReport.gamification.checklist.map((item) => (
                      <span
                        key={item.id}
                        className={`px-2.5 py-1 rounded-[10px] border flex items-center gap-1.5 font-semibold ${
                          item.isDone
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {item.isDone ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                        )}
                        <span>{item.label}</span>
                        <span className="font-bold text-[10px] opacity-80">(+{item.bonus}%)</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actionable Improvement Section High Priority Right After Verdict */}
                <div className="p-5 rounded-[10px] bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-900/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-orange-500" />
                      <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                        Rekomendasi Perbaikan Prioritas Tinggi
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">
                      {rveReport.highPriorityRecommendations?.length || 3} Poin Ditemukan
                    </span>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    {(rveReport.highPriorityRecommendations && rveReport.highPriorityRecommendations.length > 0
                      ? rveReport.highPriorityRecommendations
                      : [
                          `Tambahkan metrik angka kuantitatif (%) pada pencapaian proyek di posisi terakhir.`,
                          `Persingkat Executive Summary menjadi 2-3 kalimat berorientasi dampak langsung.`,
                          `Masukkan kata kunci spesifik kompetensi di seksi paling atas.`,
                        ]
                    ).map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="font-bold text-orange-500">{idx + 1}.</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Satu Tombol Besar: Optimalkan CV Saya */}
                  <button
                    type="button"
                    onClick={handleAutoOptimizeCv}
                    disabled={isAutoOptimizing}
                    className="w-full py-4 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] active:scale-[0.99] text-white font-black text-sm shadow-md shadow-[#1738D1]/25 transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5 mt-2"
                  >
                    {isAutoOptimizing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Sedang Mengoptimalkan Seluruh CV...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 fill-white" />
                        <span>Optimalkan CV Saya (Satu Klik Perbaiki Semua)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Timeline Stepper Navigation Bar */}
              <div className="sticky -top-2.5 sm:-top-5 z-30 -mt-2 sm:-mt-3 bg-white dark:bg-slate-900 p-2.5 sm:p-3 rounded-[10px] border border-slate-200 dark:border-slate-800 shadow-lg transition-all">
                <div className="flex items-center justify-start gap-2 overflow-x-auto no-scrollbar text-[11px] font-bold">
                  {MODULE_CONFIGS.filter((mod) => selectedModules[mod.id]).map((mod) => {
                    const stepNum = activeStepMap[mod.id];
                    const ModIcon = mod.icon;
                    return (
                      <a
                        key={mod.id}
                        href={`#${mod.anchorId}`}
                        className="px-3.5 py-1.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950/60 text-slate-700 dark:text-slate-300 hover:text-orange-600 transition shrink-0 flex items-center gap-1.5"
                      >
                        <ModIcon className={`w-3.5 h-3.5 ${mod.color}`} />
                        <span>STEP {stepNum}: {mod.shortLabel}</span>
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* CONTINUOUS FULL-WIDTH PIPELINE SECTIONS */}
              <div className="space-y-8 w-full">
                {/* STEP 1: RECRUITER VISION & HEATMAP */}
                {selectedModules.vision && (
                <div
                  id="step-vision"
                  className="p-6 md:p-8 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 scroll-mt-20"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="space-y-1">
                      <span className="px-2.5 py-0.5 rounded-[10px] text-[10px] font-extrabold uppercase bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 inline-flex items-center gap-1">
                        <Eye className="w-3 h-3 text-rose-600" />
                        <span>STEP {activeStepMap.vision} — Human Simulation</span>
                      </span>
                      <h3 className="font-black text-xl text-slate-900 dark:text-white">
                        Recruiter Vision (Simulasi Pandangan HRD 6 Detik)
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Memprediksi lintasan mata recruiter saat pertama kali memindai kertas CV A4 Anda.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowHeatmapOverlay(!showHeatmapOverlay)}
                      className={`px-4 py-2 rounded-[10px] font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                        showHeatmapOverlay
                          ? 'bg-[#1738D1] text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                      <span>{showHeatmapOverlay ? 'Heatmap Overlay ON' : 'Heatmap Overlay OFF'}</span>
                    </button>
                  </div>

                  {/* Eye-Tracking Key Metrics Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Durasi Scan HRD
                      </span>
                      <div className="flex items-center gap-1.5 font-black text-base text-slate-900 dark:text-white">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span>{scanDuration} Detik</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Durasi awal HR memindai halaman.</p>
                    </div>

                    <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Kesesuaian Pola-F (F-Pattern)
                      </span>
                      <div className="flex items-center gap-1.5 font-black text-base text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>{rveReport.fPatternScore}% Sesuai</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Lintasan mata sangat optimal.</p>
                    </div>

                    <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Hotspot Utama Eye-Tracking
                      </span>
                      <div className="flex items-center gap-1.5 font-black text-base text-rose-600 dark:text-rose-400">
                        <Flame className="w-4 h-4 text-rose-500" />
                        <span>{primaryHotspotText}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Daya tarik utama recruiter.</p>
                    </div>
                  </div>

                  {/* View Mode Switcher */}
                  <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                    <span className="font-bold text-slate-400 mr-1">Layer Tampilan:</span>
                    {[
                      { id: 'heatmap', label: 'Gradien Heatmap Termal' },
                      { id: 'f-pattern', label: 'Lintasan Eye-Tracking Pola-F' },
                      { id: 'bbox', label: 'Bounding Box & Visual Weight' },
                      { id: 'ats-matrix', label: 'Matriks Korelasi ATS' },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setHeatmapViewMode(mode.id as any)}
                        className={`px-3.5 py-1.5 rounded-[10px] text-xs font-bold transition cursor-pointer ${
                          heatmapViewMode === mode.id
                            ? 'bg-navy-700 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>

                  {/* Embedded Real A4 Heatmap Canvas */}
                  <div className="pt-2">
                    <A4HeatmapCanvas
                      parsedData={rveReport.parsedData}
                      boundingBoxes={rveReport.boundingBoxes}
                      fixationPoints={rveReport.fixationPoints}
                      atsCorrelations={rveReport.atsCorrelations}
                      viewMode={heatmapViewMode}
                      showOverlay={showHeatmapOverlay}
                      targetLevel={targetLevel}
                    />
                  </div>
                </div>
                )}

                {/* STEP 2: REKOMENDASI KATA KUNCI INDUSTRI & CTA MATCH CV */}
                {selectedModules.ats && (
                <div
                  id="step-ats"
                  className="p-6 md:p-8 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 scroll-mt-20"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="space-y-1">
                      <span className="px-2.5 py-0.5 rounded-[10px] text-[10px] font-extrabold uppercase bg-blue-50 dark:bg-blue-950/60 text-navy-700 dark:text-blue-300 border border-blue-200 dark:border-navy-900/60 inline-flex items-center gap-1">
                        <BarChart3 className="w-3 h-3 text-blue-600" />
                        <span>STEP {activeStepMap.ats} — Rekomendasi Kata Kunci Industri</span>
                      </span>
                      <h3 className="font-black text-xl text-slate-900 dark:text-white">
                        Standar Kata Kunci Kompetensi: {effectiveRole}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Diambil dari data posisi yang dilamar pada profil CV Anda. Menampilkan keahlian standar yang umum dicari rekruter untuk posisi ini.
                      </p>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-3xl font-black text-navy-700 dark:text-navy-300">{rveReport.atsScore}%</span>
                      <span className="text-[10px] text-slate-400 block font-semibold">Skor Standar ATS</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rveReport.atsCorrelations.map((item) => {
                      const isFound = item.foundInCv || item.quadrant === 'gold';
                      return (
                        <div
                          key={item.id}
                          className={`p-4 rounded-[10px] border space-y-2 text-xs transition-all ${
                            isFound
                              ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/60'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/90 dark:border-slate-700/80'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{item.keyword}</span>
                            <span
                              className={`px-2 py-0.5 rounded-[10px] text-[10px] font-extrabold uppercase flex items-center gap-1 ${
                                isFound
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              }`}
                            >
                              {isFound ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>Sudah di CV</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3 h-3 text-amber-600" />
                                  <span>Disarankan</span>
                                </>
                              )}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">
                            {item.category || 'Kompetensi Industri'}
                          </span>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">{item.recommendation}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* BANNER CTA LANGSUNG KE MATCH CV */}
                  <div className="p-5 rounded-[10px] bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-slate-800/90 dark:via-blue-950/40 dark:to-slate-800/90 border border-blue-200/90 dark:border-blue-800/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-extrabold uppercase bg-blue-100 dark:bg-blue-900/80 text-[#1738D1] dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          Pencocokan Lowongan Spesifik (1-ke-1)
                        </span>
                        <span className="text-xs font-bold text-slate-400">• Fitur Match CV</span>
                      </div>
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                        Punya Lowongan Kerja Spesifik yang Ingin Dilamar?
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Uji kecocokan kata kunci dan kualifikasi CV Anda langsung terhadap <strong>Job Description</strong> resmi lowongan incaran di fitur <strong>Match CV</strong> untuk melihat skor kecocokan presisi dan menutup skill gap.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => router.push(`/match-cv?cvId=${selectedCvId || ''}&role=${encodeURIComponent(effectiveRole)}`)}
                      className="px-4 py-2.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-bold text-xs shadow-md shadow-[#1738D1]/20 active:scale-[0.98] transition flex items-center gap-2 shrink-0 cursor-pointer"
                    >
                      <span>Cocokkan dengan Job Description di Match CV</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                )}

                {/* STEP 3: AI RECRUITER SIMULATION (GPT-5, Gemini, Claude Cards) */}
                {selectedModules.aiScreener && (
                <div
                  id="step-ai-screener"
                  className="p-6 md:p-8 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 scroll-mt-20"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="space-y-1">
                      <span className="px-2.5 py-0.5 rounded-[10px] text-[10px] font-extrabold uppercase bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60 inline-flex items-center gap-1">
                        <Bot className="w-3 h-3 text-emerald-600" />
                        <span>STEP {activeStepMap.aiScreener} — Primary Selling Point</span>
                      </span>
                      <h3 className="font-black text-xl text-slate-900 dark:text-white">
                        Simulasi Multi-Screener (Sistem v2)
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Perusahaan modern saat ini menyaring kandidat menggunakan sistem penyaringan otomatis. Kami mensimulasikannya secara bersamaan.
                      </p>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-950/80 p-4 rounded-[10px] border border-emerald-200 dark:border-emerald-800 text-center shrink-0">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block uppercase">Consensus Score</span>
                      <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{rveReport.consensusScore}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {rveReport.aiEvaluations.map((ai, idx) => {
                      const isAts = ai.modelName.toLowerCase().includes('ats') || ai.modelName.toLowerCase().includes('keyword');
                      const isVisual = ai.modelName.toLowerCase().includes('visual') || ai.modelName.toLowerCase().includes('eye') || ai.modelName.toLowerCase().includes('hrd');

                      const screenerContext = {
                        targetRole: rveReport.parsedData.roleTitle || targetRole,
                        candidateName: rveReport.parsedData.candidateName,
                        skills: rveReport.parsedData.skills,
                        company: rveReport.parsedData.experience[0]?.company,
                        expRole: rveReport.parsedData.experience[0]?.role,
                      };

                      const screenerIcon = isAts ? (
                        <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : isVisual ? (
                        <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Briefcase className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      );

                      const scoreBadgeStyle = isAts
                        ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800'
                        : isVisual
                        ? 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 border-blue-200 dark:border-blue-800'
                        : 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/80 border-amber-200 dark:border-amber-800';

                      return (
                        <div
                          key={ai.modelName || idx}
                          className="p-5 rounded-[10px] bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-4 flex flex-col justify-between shadow-xs hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                        >
                          <div className="space-y-4">
                            {/* Card Header */}
                            <div className="flex items-start justify-between gap-2 border-b border-slate-200/70 dark:border-slate-700/70 pb-3">
                              <div className="space-y-0.5">
                                <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 leading-snug">
                                  {screenerIcon}
                                  {ai.modelName}
                                </span>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                                  {isAts
                                    ? 'Filter parsing kata kunci & format'
                                    : isVisual
                                    ? 'Simulasi F-Pattern 6 detik pertama'
                                    : 'Evaluasi dampak nyata & kesiapan tim'}
                                </span>
                              </div>
                              <span className={`text-xs font-black px-2.5 py-1 rounded-[10px] border shrink-0 ${scoreBadgeStyle}`}>
                                {ai.score}%
                              </span>
                            </div>

                            {/* Pros / Kelebihan Utama */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-[6px] border border-emerald-200/60 dark:border-emerald-900/40 w-fit">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                <span>Kelebihan Utama (Pros)</span>
                              </div>
                              <div className="space-y-2">
                                {ai.pros.map((p, i) => {
                                  const enriched = enrichScreenerPoint(p, 'pro', ai.modelName, screenerContext);
                                  return (
                                    <div
                                      key={i}
                                      className="flex items-start gap-2 text-slate-700 dark:text-slate-200 text-xs leading-relaxed bg-white dark:bg-slate-900/70 p-2.5 rounded-[8px] border border-slate-200/60 dark:border-slate-700/60 shadow-2xs"
                                    >
                                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                      <span>{enriched}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Cons / Catatan Evaluasi */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-[6px] border border-amber-200/60 dark:border-amber-900/40 w-fit">
                                <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                <span>Catatan Evaluasi & Rekomendasi</span>
                              </div>
                              <div className="space-y-2">
                                {ai.cons.map((c, i) => {
                                  const enriched = enrichScreenerPoint(c, 'con', ai.modelName, screenerContext);
                                  return (
                                    <div
                                      key={i}
                                      className="flex items-start gap-2 text-slate-700 dark:text-slate-200 text-xs leading-relaxed bg-white dark:bg-slate-900/70 p-2.5 rounded-[8px] border border-slate-200/60 dark:border-slate-700/60 shadow-2xs"
                                    >
                                      <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                      <span>{enriched}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                )}

                {/* STEP 4: HIRING FORECAST & INTERACTIVE CHATBOT */}
                {selectedModules.forecast && (
                <div
                  id="step-prediction"
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start scroll-mt-20"
                >
                  {/* Left: Predicted Questions */}
                  <div className="lg:col-span-7 p-6 md:p-8 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="space-y-1">
                        <span className="px-2.5 py-0.5 rounded-[10px] text-[10px] font-extrabold uppercase bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-900/60 inline-flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-orange-600" />
                          <span>STEP {activeStepMap.forecast} — Interview Forecast</span>
                        </span>
                        <h3 className="font-black text-lg text-slate-900 dark:text-white">
                          Prediksi Pertanyaan Wawancara dari Hotspot CV
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs">
                      {rveReport.predictedInterviewQuestions.map((q, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 flex items-start gap-3 text-slate-800 dark:text-slate-200 hover:border-slate-300 transition-all"
                        >
                          <span className="w-5 h-5 rounded-full bg-[#1738D1] text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                            {idx + 1}
                          </span>
                          <p className="font-medium leading-relaxed">{q}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Tanya Recruiter AI Interactive Panel */}
                  <div className="lg:col-span-5 p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Bot className="w-5 h-5 text-orange-500" />
                        <div>
                          <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">Tanya Tim Recruiter</h3>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">Interaksi &amp; Konsultasi Hasil CV</p>
                        </div>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Tim Recruiter Aktif" />
                    </div>

                    {/* Message History */}
                    <div className="space-y-3 max-h-64 overflow-y-auto text-xs pr-1 no-scrollbar">
                      {chatMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] p-3.5 rounded-[10px] leading-relaxed text-xs ${
                              msg.sender === 'user'
                                ? 'bg-[#1738D1] text-white font-medium rounded-tr-none'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/70 dark:border-slate-700/70'
                            }`}
                          >
                            <p>{msg.text}</p>
                            <span
                              className={`text-[9px] block mt-1 text-right ${
                                msg.sender === 'user' ? 'text-orange-100' : 'text-slate-400 dark:text-slate-500'
                              }`}
                            >
                              {msg.time}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Quick Suggestion Chips */}
                    <div className="flex flex-wrap gap-1.5 text-[10px]">
                      <button
                        type="button"
                        onClick={() => handleSendChatMessage('Mengapa CV saya belum 100%?')}
                        className="px-2.5 py-1 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950 hover:text-orange-600 dark:hover:text-orange-400 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition cursor-pointer font-medium flex items-center gap-1"
                      >
                        <Lightbulb className="w-3 h-3 text-amber-500" />
                        <span>Mengapa CV belum 100%?</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendChatMessage('Bagaimana kalau saya ganti summary?')}
                        className="px-2.5 py-1 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950 hover:text-orange-600 dark:hover:text-orange-400 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition cursor-pointer font-medium flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3 text-blue-500" />
                        <span>Ganti summary?</span>
                      </button>
                    </div>

                    {/* Input */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <input
                        type="text"
                        value={inputChatText}
                        onChange={(e) => setInputChatText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                        placeholder="Tanyakan ke Tim Recruiter..."
                        className="flex-1 px-3 py-2 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1738D1] focus:outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => handleSendChatMessage()}
                        className="p-2 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white transition cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
                )}

                {/* STEP 5: AUTO IMPROVEMENT & REWRITE FIXES */}
                {selectedModules.improvement && (
                <div
                  id="step-improvement"
                  className="p-6 md:p-8 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 scroll-mt-20"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="space-y-1">
                      <span className="px-2.5 py-0.5 rounded-[10px] text-[10px] font-extrabold uppercase bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 inline-flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>STEP {activeStepMap.improvement} — Auto Improvement</span>
                      </span>
                      <h3 className="font-black text-xl text-slate-900 dark:text-white">
                        Perbandingan Sebelum &amp; Sesudah Kalimat CV
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Klik tombol di tiap seksi untuk menerapkan perbaikan secara manual, atau gunakan tombol otomatis di atas.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {rveReport.beforeAfterFixes.map((fix) => {
                      const isApplied = appliedFixes.includes(fix.id);
                      return (
                        <div
                          key={fix.id}
                          className={`p-5 rounded-[10px] border transition-all space-y-3 text-xs ${
                            isApplied
                              ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">{fix.section}</span>
                            <button
                              type="button"
                              onClick={() => handleApplyFix(fix.id)}
                              disabled={isApplied}
                              className={`px-4 py-2 rounded-[10px] text-xs font-bold transition-all cursor-pointer ${
                                isApplied
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 cursor-default'
                                  : 'bg-[#1738D1] hover:bg-[#132EA8] text-white shadow-xs'
                              }`}
                            >
                              {isApplied ? (
                                <span className="flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  Telah Diterapkan (+5% Skor)
                                </span>
                              ) : (
                                '+ Terapkan Perbaikan ini'
                              )}
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                            <div className="p-3 rounded-[10px] bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200">
                              <span className="font-bold text-[10px] uppercase text-rose-600 dark:text-rose-400 block">
                                Sebelum (Kurang Optimal):
                              </span>
                              <p className="mt-1 leading-snug">{fix.before}</p>
                            </div>

                            <div className="p-3 rounded-[10px] bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200">
                              <span className="font-bold text-[10px] uppercase text-emerald-600 dark:text-emerald-400 block">
                                Sesudah Dioptimalkan:
                              </span>
                              <p className="mt-1 leading-snug">{fix.after}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      {/* RIGHT-HAND SLIDE-IN DRAWER: PILIH PROFIL CV AKTIF / UPLOAD FILE */}
      {isChangeCvModalOpen && (
        <div
          onClick={handleCloseCvDrawer}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end transition-opacity cursor-pointer animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-md sm:max-w-lg h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300 cursor-default"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-[10px] bg-blue-50 dark:bg-blue-950/60 text-[#1738D1] dark:text-blue-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                    Pilih Profil CV Aktif / Upload File
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Gunakan CV akun atau upload berkas dokumen baru (PDF/DOCX)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseCvDrawer}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-[10px] hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Switcher */}
            <div className="px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-[10px] text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setCvSourceMode('saved')}
                  className={`flex-1 py-2 rounded-[8px] transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    cvSourceMode === 'saved'
                      ? 'bg-white dark:bg-slate-900 text-[#1738D1] dark:text-blue-400 shadow-xs font-black'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>CV Tersimpan ({savedCvs.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCvSourceMode('upload')}
                  className={`flex-1 py-2 rounded-[8px] transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    cvSourceMode === 'upload'
                      ? 'bg-white dark:bg-slate-900 text-[#1738D1] dark:text-blue-400 shadow-xs font-black'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Berkas Baru</span>
                  {uploadedFile && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cvSourceMode === 'saved' ? (
                /* TAB 1: CV TERSIMPAN */
                <div className="space-y-3">
                  {/* Search Bar if > 1 CV */}
                  {savedCvs.length > 1 && (
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={savedCvSearch}
                        onChange={(e) => setSavedCvSearch(e.target.value)}
                        placeholder="Cari profil CV tersimpan..."
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-[10px] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#1738D1]"
                      />
                    </div>
                  )}

                  {/* Empty State */}
                  {savedCvs.length === 0 ? (
                    <div className="py-10 px-4 text-center rounded-[10px] border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          Belum Ada CV Tersimpan
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                          Kamu belum memiliki CV tersimpan di akun ini. Kamu bisa mengunggah file CV (PDF/DOCX) atau membuat CV baru di CV Builder.
                        </p>
                      </div>
                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCvSourceMode('upload')}
                          className="px-3.5 py-2 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Berkas CV</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => router.push('/cv')}
                          className="px-3.5 py-2 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
                        >
                          Buka CV Builder
                        </button>
                      </div>
                    </div>
                  ) : filteredSavedCvs.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      Tidak ada profil CV yang cocok dengan pencarian "{savedCvSearch}".
                    </div>
                  ) : (
                    /* List of Saved CV Cards */
                    <div className="space-y-2.5">
                      {filteredSavedCvs.map((cv) => {
                        const isSelected = selectedCvId === cv.id && cvSourceMode === 'saved';
                        return (
                          <div
                            key={cv.id}
                            onClick={() => handleSelectSavedCv(cv)}
                            className={`p-3.5 rounded-[10px] border transition-all cursor-pointer relative group ${
                              isSelected
                                ? 'border-[#1738D1] bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-[#1738D1]/20'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2.5">
                              <div className="flex items-start gap-2.5 min-w-0">
                                <div
                                  className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 transition ${
                                    isSelected
                                      ? 'border-[#1738D1] bg-[#1738D1] text-white'
                                      : 'border-slate-300 dark:border-slate-600 group-hover:border-slate-400'
                                  }`}
                                >
                                  {isSelected && <Check className="w-2.5 h-2.5" />}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                                    {cv.title || cv.candidateName}
                                  </h4>
                                  <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mt-0.5 truncate">
                                    {cv.roleTitle}
                                  </p>
                                  <p className="text-[10px] text-slate-400 mt-1">
                                    Diperbarui {cv.updatedAt}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-1.5 shrink-0">
                                <span
                                  className={`px-2 py-0.5 rounded-[10px] text-[10px] font-extrabold border flex items-center gap-1 ${getScoreBadgeClass(
                                    cv.atsScore
                                  )}`}
                                >
                                  <Star className="w-2.5 h-2.5 fill-current" />
                                  <span>{cv.atsScore}% ATS</span>
                                </span>
                                {isSelected ? (
                                  <span className="px-2 py-0.5 rounded-[10px] text-[9px] font-black bg-[#1738D1] text-white tracking-wider uppercase">
                                    Aktif
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectSavedCv(cv);
                                    }}
                                    className="text-[10px] font-bold text-[#1738D1] dark:text-blue-400 hover:underline cursor-pointer"
                                  >
                                    Pilih CV
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Skills preview pills */}
                            {Array.isArray(cv.skills) && cv.skills.length > 0 && (
                              <div className="flex items-center gap-1 flex-wrap mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                                {cv.skills.slice(0, 4).map((s: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="px-1.5 py-0.5 rounded-[6px] text-[9px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 truncate max-w-[110px]"
                                  >
                                    {s}
                                  </span>
                                ))}
                                {cv.skills.length > 4 && (
                                  <span className="text-[9px] font-bold text-slate-400">
                                    +{cv.skills.length - 4}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* TAB 2: UPLOAD BERKAS */
                <div className="space-y-4">
                  {/* Dropzone Area */}
                  <div
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDropFile}
                    onClick={() => cvFileInputRef.current?.click()}
                    className={`p-6 rounded-[10px] border-2 border-dashed transition-all text-center cursor-pointer ${
                      isDraggingFile
                        ? 'border-[#1738D1] bg-blue-50/60 dark:bg-blue-950/40 ring-4 ring-[#1738D1]/10 scale-[1.01]'
                        : 'border-slate-300 dark:border-slate-700 hover:border-[#1738D1] dark:hover:border-blue-500 bg-slate-50/60 dark:bg-slate-800/30'
                    }`}
                  >
                    <input
                      ref={cvFileInputRef}
                      type="file"
                      accept=".pdf,.docx,.doc,.txt"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(file);
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950 text-[#1738D1] dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Tarik &amp; lepas berkas CV ke sini, atau klik untuk memilih
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Mendukung format PDF, DOCX, DOC, dan TXT (Maks. 5MB)
                    </p>
                    <div className="mt-3">
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white text-xs font-bold shadow-xs transition">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Pilih Berkas Komputer</span>
                      </span>
                    </div>
                  </div>

                  {/* Upload State & Extracted Results Card */}
                  {uploadedFile && (
                    <div className="p-4 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="p-2 rounded-[8px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#1738D1] dark:text-blue-400 shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                              {uploadedFile.name}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • Berkas Terpilih
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => cvFileInputRef.current?.click()}
                            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-[6px] hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition cursor-pointer text-[10px] font-bold"
                            title="Ganti Berkas"
                          >
                            Ganti
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setUploadedFile(null);
                              setUploadedParsedData(null);
                            }}
                            className="p-1.5 text-rose-500 hover:text-rose-700 rounded-[6px] hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                            title="Hapus Berkas"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Parsing in Progress */}
                      {isParsingUpload && (
                        <div className="p-3 rounded-[8px] bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 flex items-center gap-2 text-xs">
                          <RefreshCw className="w-4 h-4 animate-spin text-amber-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-bold">Membaca struktur &amp; konten CV...</p>
                            <p className="text-[10px] text-amber-700 dark:text-amber-400">
                              Mengekstrak informasi pengalaman, pendidikan, dan keahlian
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Extraction Successful Preview */}
                      {!isParsingUpload && uploadedParsedData && (
                        <div className="p-3 rounded-[8px] bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 text-xs font-black">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Struktur CV Berhasil Diekstrak</span>
                            </div>
                            <span className="px-2 py-0.5 rounded-[8px] text-[9px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200">
                              NLP Ready
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                            <div>
                              <span className="text-slate-400 block text-[9px] font-bold uppercase">
                                Nama Kandidat
                              </span>
                              <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                                {uploadedParsedData.fullName || 'Terdeteksi dari Dokumen'}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[9px] font-bold uppercase">
                                Posisi / Headline
                              </span>
                              <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                                {uploadedParsedData.experienceTitle ||
                                  (uploadedParsedData.targetPositions && uploadedParsedData.targetPositions[0]) ||
                                  'Professional Specialist'}
                              </span>
                            </div>
                          </div>

                          {/* Quick button to set target role */}
                          {uploadedParsedData.experienceTitle && (
                            <div className="pt-1.5 border-t border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-between">
                              <span className="text-[10px] text-emerald-700 dark:text-emerald-400">
                                Gunakan posisi terdeteksi: <strong>{uploadedParsedData.experienceTitle}</strong>
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setTargetRole(uploadedParsedData.experienceTitle);
                                  toast.success(`Posisi target diset ke: ${uploadedParsedData.experienceTitle}`);
                                }}
                                className="px-2 py-0.5 rounded-[6px] bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition cursor-pointer"
                              >
                                Terapkan Posisi
                              </button>
                            </div>
                          )}

                          {/* Extracted Skills Preview */}
                          {Array.isArray(uploadedParsedData.skills) && uploadedParsedData.skills.length > 0 && (
                            <div className="pt-1 flex items-center gap-1 flex-wrap">
                              <span className="text-[9px] font-bold text-slate-400 mr-1">Skills:</span>
                              {uploadedParsedData.skills.slice(0, 5).map((s: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="px-1.5 py-0.5 rounded-[6px] text-[9px] font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                                >
                                  {s}
                                </span>
                              ))}
                              {uploadedParsedData.skills.length > 5 && (
                                <span className="text-[9px] font-bold text-slate-400">
                                  +{uploadedParsedData.skills.length - 5}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* If parsing finished but no extracted data */}
                      {!isParsingUpload && !uploadedParsedData && (
                        <div className="p-3 rounded-[8px] bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs flex items-center gap-2">
                          <Info className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>
                            Berkas siap digunakan. Evaluasi RVE akan mengekstrak teks berkas langsung saat screening berjalan.
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                {cvSourceMode === 'saved' ? (
                  <span>
                    Aktif:{' '}
                    <strong className="text-slate-800 dark:text-white">
                      {selectedSavedCv?.title || selectedSavedCv?.candidateName || 'Belum dipilih'}
                    </strong>
                  </span>
                ) : (
                  <span>
                    {uploadedFile ? (
                      <strong className="text-slate-800 dark:text-white truncate block">
                        {uploadedFile.name}
                      </strong>
                    ) : (
                      'Belum ada berkas dipilih'
                    )}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCloseCvDrawer}
                  className="px-3.5 py-2 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCvSelection}
                  disabled={cvSourceMode === 'upload' && !uploadedFile}
                  className={`px-4 py-2 rounded-[10px] text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer ${
                    cvSourceMode === 'upload' && !uploadedFile
                      ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-60'
                      : 'bg-[#1738D1] hover:bg-[#132EA8] shadow-[#1738D1]/20 active:scale-[0.98]'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Terapkan CV Ini</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RIGHT-HAND SLIDE-IN DRAWER: RIWAYAT & HASIL SCREENING CV */}
      {isHistoryDrawerOpen && (
        <div
          onClick={() => setIsHistoryDrawerOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end transition-opacity cursor-pointer animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-md sm:max-w-lg h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300 cursor-default"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-[10px] bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                    Riwayat &amp; Hasil Screening CV
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {reportHistory.length} sesi tersimpan di akun Anda
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryDrawerOpen(false)}
                className="p-1.5 rounded-[8px] text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-5 space-y-5 overflow-y-auto flex-1">
              {/* Laporan Intelligence Dinamis Terhubung Database Card */}
              <div className="p-4 rounded-[10px] bg-gradient-to-br from-blue-50/80 to-slate-50/80 dark:from-navy-950/40 dark:to-slate-900/40 border border-blue-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-[10px] bg-[#1738D1] text-white shrink-0 shadow-xs">
                    <Sparkles className="w-4 h-4 fill-white" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-xs text-slate-900 dark:text-white">
                      Laporan Screening Intelligence
                    </h5>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug pt-0.5">
                      Lihat Laporan Intelligence Full-Width untuk analisis lengkap recruiter target.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsHistoryDrawerOpen(false);
                    router.push('/cv-screener/report');
                  }}
                  className="w-full py-2.5 rounded-[10px] bg-white dark:bg-slate-900 hover:bg-blue-50/50 text-[#1738D1] dark:text-blue-400 text-xs font-bold transition flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-800 cursor-pointer shadow-2xs"
                >
                  <span>Lihat Laporan</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 pt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span>Lihat Laporan dinamis terhubung dengan database dan per akun</span>
                </div>
              </div>

              {/* Sesi Screening Sebelumnya */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Sesi Screening Sebelumnya
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {reportHistory.length} Sesi
                  </span>
                </div>

                {reportHistory.length === 0 ? (
                  <div className="p-6 rounded-[10px] border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
                    <History className="w-7 h-7 text-slate-300 dark:text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-500 font-medium">
                      Belum ada sesi riwayat screening. Mulai simulasi screening untuk menyimpan sesi di sini.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {reportHistory.map((hist) => {
                      const verdictBg =
                        hist.verdictStatus === 'interview'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : hist.verdictStatus === 'maybe'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800';
                      const verdictLabel =
                        hist.verdictStatus === 'interview'
                          ? 'Peluang Lolos'
                          : hist.verdictStatus === 'maybe'
                          ? 'Peluang Moderat'
                          : 'Perlu Revisi';

                      return (
                        <div
                          key={hist.id}
                          onClick={() => {
                            setIsHistoryDrawerOpen(false);
                            handleLoadHistoryReport(hist);
                          }}
                          className="p-3.5 rounded-[10px] border border-slate-200 dark:border-slate-800 hover:border-[#1738D1]/60 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all cursor-pointer space-y-2.5 group shadow-2xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-[#1738D1] transition truncate">
                                {hist.candidateName}
                              </span>
                              <span className="text-[9px] font-extrabold bg-blue-50 text-[#1738D1] dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded-[10px] border border-blue-200 dark:border-blue-800 shrink-0">
                                {hist.personaName}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => handleDeleteHistory(hist.id, e)}
                                className="p-1 text-slate-400 hover:text-rose-500 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                title="Hapus riwayat sesi ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                            <p className="font-medium truncate">
                              {hist.targetRole} {hist.targetLevel ? `• ${hist.targetLevel}` : ''}
                            </p>
                            {hist.purposeTitle && (
                              <span className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded-[6px] shrink-0">
                                {hist.purposeTitle}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[10px] border-t border-slate-100 dark:border-slate-800/80 pt-2 text-slate-400">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-[8px] border text-[9px] font-extrabold ${verdictBg}`}>
                                {verdictLabel}
                              </span>
                              <span>{hist.timestamp}</span>
                            </div>

                            <div className="flex items-center gap-1 font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-[8px] border border-emerald-200/60 dark:border-emerald-800/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0" />
                              <span>{hist.consensusScore}% ATS</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SECTION 2: Hasil CV Terbaru di Akun */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#1738D1]" />
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Hasil CV Terbaru di Akun
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    {savedCvs.length} Berkas
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {savedCvs.map((cv) => {
                    const isSelected = selectedCvId === cv.id && cvSourceMode === 'saved';
                    return (
                      <div
                        key={cv.id}
                        onClick={() => handleViewCvReportDirectly(cv)}
                        className={`p-3 rounded-[10px] border transition-all flex items-center justify-between cursor-pointer group ${
                          isSelected
                            ? 'border-[#1738D1] bg-blue-50/60 dark:bg-blue-950/40 ring-1 ring-[#1738D1]/30 shadow-2xs'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <h5 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-[#1738D1] transition truncate">
                              {cv.candidateName}
                            </h5>
                            {isSelected && (
                              <span className="px-1.5 py-0.2 rounded-[6px] text-[8px] font-extrabold bg-[#1738D1] text-white">
                                Aktif
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {cv.roleTitle}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-[8px] border border-emerald-200/60 dark:border-emerald-800/60">
                            {cv.atsScore}% ATS
                          </span>
                          <span className="text-[10px] font-bold text-[#1738D1] dark:text-blue-400 group-hover:underline flex items-center gap-0.5">
                            <span>Lihat Hasil</span>
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-2.5">
              {reportHistory.length > 0 ? (
                <button
                  type="button"
                  onClick={handleClearAllHistory}
                  className="text-[11px] font-bold text-rose-500 hover:text-rose-600 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Semua Riwayat</span>
                </button>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={() => setIsHistoryDrawerOpen(false)}
                className="px-4 py-2 rounded-[10px] bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
