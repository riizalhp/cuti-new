'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';

import {
  Eye,
  Flame,
  Layers,
  Zap,
  Building2,
  Factory,
  Store,
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
  Copy,
  ExternalLink,
  Printer,
  ArrowUp,
  Layout,
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
import { A4HeatmapCanvas, getTemplateArchetype } from './rve/A4HeatmapCanvas';
import { cvTemplates } from './CVView';
import { cvApi, trackerApi } from '@/lib/api';
import { getStoredSession } from '@/lib/auth';
import { calculateAtsScore } from '@/lib/ats-score';
import { buildCvScreenerSlug, parseCvScreenerSlug, deslugify, slugify } from '@/lib/cv-screener-slug';
import { JobTitleSearchSelect } from '@/components/ui/JobTitleSearchSelect';
import { CvScopeSelector } from '@/components/ui';
import { Avatar } from '@/components/ui/components-primitives-avatar';
import { DotLottiePlayer } from '@/components/DotLottiePlayer';
import { CvScreenerReportSkeleton } from '@/components/CvScreenerReportSkeleton';

export const SAMPLE_JOB_PRESETS = [
  {
    company: 'Astra Honda Motor',
    position: 'Operator Produksi',
    personaId: 'manufacturing',
    description:
      'Melakukan perakitan komponen otomotif sesuai standar SOP dan 5S. Kualifikasi: Lulusan SMK/SMA, teliti, disiplin tinggi, memahami dasar alat ukur & K3, bersedia bekerja dalam sistem shift.',
  },
  {
    company: 'Indomaret Group',
    position: 'Pramuniaga & Kasir',
    personaId: 'retail-service',
    description:
      'Memberikan pelayanan ramah kepada pelanggan, mengoperasikan mesin kasir POS, menjaga kerapian display toko, serta melakukan rekapitulasi stok harian. Kualifikasi: Lulusan SMA/SMK, komunikatif, jujur, dan bersedia bekerja shift.',
  },
  {
    company: 'Traveloka',
    position: 'Frontend Developer',
    personaId: 'unicorn',
    description:
      'Membangun antarmuka pemesanan tiket cepat dan responsif. Kualifikasi: React.js, Next.js, TypeScript, State Management, CSS/Tailwind, Web Performance Optimization, dan integrasi RESTful API.',
  },
  {
    company: 'Bukalapak',
    position: 'Fullstack Engineer',
    personaId: 'unicorn',
    description:
      'Mencari Fullstack Engineer berpengalaman dengan React.js, Node.js, TypeScript, PostgreSQL, arsitektur Microservices, Git, dan CI/CD pipeline. Mampu merancang skema database yang efisien.',
  },
  {
    company: 'BCA',
    position: 'Software Engineer',
    personaId: 'corporate',
    description:
      'Mengembangkan sistem perbankan handal dan teruji. Kualifikasi: Logika Pemrograman & Struktur Data, Java/Spring Boot atau TypeScript/Node.js, SQL Database, pemahaman keamanan sistem, dan kerja sama tim.',
  },
];


// 13 Recruiter Personas dengan kategori, star ratings, contoh perusahaan, & match score
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
    id: 'manufacturing',
    name: 'Manufaktur & Pabrik',
    badge: 'Disiplin & Standar Teknis',
    category: 'company',
    categoryLabel: 'Jenis Perusahaan',
    description: 'Menilai kedisiplinan kerja, kesesuaian keahlian kejuruan, kepatuhan SOP/K3, dan ketahanan operasional industri.',
    focusArea: 'Kepatuhan SOP & Skill Teknis',
    evalFocus: 'Fokus pada sertifikasi kejuruan (BNSP/K3), kepatuhan SOP/5S/Kaizen, riwayat PKL pabrik, dan keandalan shift kerja.',
    companies: ['Astra Daihatsu / Honda', 'PT Denso Indonesia', 'PT Epson', 'Indofood CBP', 'PT Yamaha Motor'],
    matchScore: 84,
    isRecommended: true,
    ratings: { portfolio: 2, impact: 3, techStack: 5, education: 5 },
    highlights: ['Sertifikasi K3 & kompetensi BNSP', 'Pengalaman PKL / magang industri', 'Pemahaman SOP, 5S / Kaizen & QC', 'Ketahanan kerja shift & fisik prima'],
    reducedEmphasis: ['Portofolio digital online', 'Link GitHub / website pribadi', 'Metrik pertumbuhan revenue bisnis'],
    strictness: 'Kepatuhan SOP & Standar K3',
  },
  {
    id: 'retail-service',
    name: 'Retail & Service Crew',
    badge: 'Pelayanan & Ketelitian Toko',
    category: 'company',
    categoryLabel: 'Jenis Perusahaan',
    description: 'Menilai keramahan pelayanan pelanggan, ketelitian transaksi kasir, kepatuhan SOP toko, dan kesiapan kerja shift.',
    focusArea: 'Pelayanan & Ketelitian Toko',
    evalFocus: 'Fokus pada keterampilan komunikasi pelanggan (customer service), ketelitian transaksi kasir (POS), stok opname, dan integritas kerja.',
    companies: ['Indomaret / Alfamart', 'Kopi Kenangan / Fore', 'Miniso / KKV', 'Mixue Indonesia', 'MAP Group'],
    matchScore: 86,
    isRecommended: true,
    ratings: { portfolio: 1, impact: 4, techStack: 3, education: 4 },
    highlights: ['Pelayanan pelanggan (Customer Service)', 'Ketelitian transaksi & sistem kasir POS', 'Pengalaman kerja shift & kerja sama tim', 'Kerapian, kejujuran & integritas tinggi'],
    reducedEmphasis: ['Portofolio digital online', 'Gelar sarjana akademik tinggi', 'Riwayat organisasi formal kampus'],
    strictness: 'Kerapian, Pelayanan, & Ketelitian Toko',
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
  // Summary saja tidak cukup (tanpa data terstruktur kita tidak bisa menilai kecocokan persona).
  const hasContent = skills.length > 0 || experience.length > 0 || education.length > 0;
  if (!hasContent) return persona.matchScore;

  const allText = [
    summary,
    ...experience.map((e: any) => `${e?.role || ''} ${e?.company || ''} ${e?.description || ''}`),
    ...education.map((e: any) => `${e?.degree || ''} ${e?.institution || ''}`),
  ]
    .join(' ')
    .toLowerCase();

  // portfolio: bukti proyek nyata / link repo / portofolio (atau pengalaman kerja nyata di lantai toko/pabrik)
  const isMfg = persona.id === 'manufacturing';
  const isRetail = persona.id === 'retail-service';
  const linkMatches = (allText.match(/https?:\/\/|github\.com|gitlab\.com|bitbucket\.org|\.vercel\.app|\.netlify\.app|\.github\.io/g) || []).length;
  const mfgExpMatches = isMfg
    ? (allText.match(/pkl|praktek kerja|magang|operator|teknisi|assembly|perakitan|gudang|qc|qa|quality control|maintenance|mesin/g) || []).length
    : 0;
  const retailExpMatches = isRetail
    ? (allText.match(/kasir|pramuniaga|store crew|crew toko|barista|waiter|pelayan|service|retail|minimarket|supermarket|sales|spg|spb|customer service|frontliner|toko/g) || []).length
    : 0;
  const portfolioSignal = isMfg
    ? Math.min(1, experience.length * 0.35 + mfgExpMatches * 0.25)
    : isRetail
    ? Math.min(1, experience.length * 0.35 + retailExpMatches * 0.25)
    : Math.min(1, experience.length * 0.3 + linkMatches * 0.35);

  // impact: metrik angka & kata kerja dampak (penjualan, transaksi kasir, atau efisiensi)
  const impactMatches = (allText.match(/\d+%|persen|\bjt\b|\bjuta\b|\bribu\b|meningkatkan|menurunkan|menghemat|mempercepat|mencapai|mengurangi|\bhemat\b|growth|increase|improve|revenue|omzet|transaksi|target/g) || []).length;
  const impactSignal = Math.min(1, impactMatches / 3);

  // techStack: cakupan skill (alat ukur/K3 pabrik atau sistem kasir POS/EDC/stock opname retail)
  const mfgSkillMatches = isMfg
    ? (allText.match(/k3|5s|kaizen|alat ukur|jangka sorong|mikrometer|plc|cnc|bubut|welding|las|wiring|kelistrikan|pneumatik|hidrolik|sop|iso|zero defect|tpm|autocad|solidworks/g) || []).length
    : 0;
  const retailSkillMatches = isRetail
    ? (allText.match(/pos|mesin kasir|edc|stock opname|stok opname|display|merchandising|barista|manual brew|espresso|customer service|pelayanan pelanggan|upselling|kas kecil|rekap transaksi/g) || []).length
    : 0;
  const techStackSignal = isMfg
    ? Math.min(1, skills.length / 6 + mfgSkillMatches * 0.2)
    : isRetail
    ? Math.min(1, skills.length / 6 + retailSkillMatches * 0.2)
    : Math.min(1, skills.length / 8);

  // education: riwayat pendidikan + gelar
  const degreeBoost = education.some((e: any) => /s1|s2|sarjana|magister|master|bachelor|diploma|smk|d3|sma|stm|ma/i.test(e?.degree || '')) ? 0.25 : 0;
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
  targetBasis?: 'role' | 'job';
  jobCompany?: string;
  jobPosition?: string;
  jobDescription?: string;
  jobMatchResult?: any;
}

const MODULE_CONFIGS = [
  {
    id: 'vision' as const,
    title: 'Keterbacaan Berkas (Pola 6 Detik HRD)',
    label: 'Keterbacaan HRD (Pola Baca 6 Detik & Heatmap)',
    shortLabel: 'Keterbacaan HRD',
    badgeTitle: 'Standar HRD',
    anchorId: 'step-vision',
    icon: Eye,
    color: 'text-rose-700 dark:text-rose-400',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60',
    detailDescription: 'Mengecek tata letak visual, susunan judul, dan bagian berkas yang pertama kali dilihat tim HRD.',
  },
  {
    id: 'ats' as const,
    title: 'Kesesuaian Format & Kata Kunci ATS',
    label: 'Kesesuaian Sistem ATS (Kata Kunci & Format Dokumen)',
    shortLabel: 'Format & ATS',
    badgeTitle: 'Filter ATS',
    anchorId: 'step-ats',
    icon: BarChart3,
    color: 'text-blue-600 dark:text-blue-400',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/60 text-navy-700 dark:text-blue-300 border-blue-200 dark:border-navy-900/60',
    detailDescription: 'Mencocokkan kata kunci posisi impian dengan format dan standar sistem ATS.',
  },
  {
    id: 'aiScreener' as const,
    title: 'Kesesuaian Kriteria Recruiter',
    label: 'Standar Penilaian Recruiter (Kriteria Industri)',
    shortLabel: 'Standar Recruiter',
    badgeTitle: 'Standar Industri',
    anchorId: 'step-ai-screener',
    icon: Users,
    color: 'text-emerald-700 dark:text-emerald-400',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60',
    detailDescription: 'Menguji kesesuaian profil dengan kriteria penilaian recruiter industri.',
  },
  {
    id: 'forecast' as const,
    title: 'Simulasi Kisi Pertanyaan Wawancara',
    label: 'Prediksi Wawancara (Peluang & Kisi Pertanyaan)',
    shortLabel: 'Kisi Wawancara',
    badgeTitle: 'Peluang Wawancara',
    anchorId: 'step-prediction',
    icon: TrendingUp,
    color: 'text-orange-700 dark:text-orange-400',
    badgeBg: 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-900/60',
    detailDescription: 'Menghitung perkiraan peluang panggilan, simulasi pertanyaan wawancara, dan evaluasi berkas.',
  },
  {
    id: 'improvement' as const,
    title: 'Penyusunan Saran Perbaikan Kalimat',
    label: 'Rekomendasi Perbaikan (Langkah Optimasi Kalimat CV)',
    shortLabel: 'Saran Perbaikan',
    badgeTitle: 'Perbaikan CV',
    anchorId: 'step-improvement',
    icon: SlidersHorizontal,
    color: 'text-amber-700 dark:text-amber-400',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/60',
    detailDescription: 'Menyiapkan rekomendasi perbaikan sebelum dan sesudah serta rangkuman laporan.',
  },
];

const getPersonaIcon = (p: RecruiterPersona) => {
  if (p.id === 'manufacturing') return <Factory className="w-4 h-4" />;
  if (p.id === 'retail-service') return <Store className="w-4 h-4" />;
  if (p.category === 'region') return <Globe className="w-4 h-4" />;
  if (p.category === 'special') return <GraduationCap className="w-4 h-4" />;
  return <Building2 className="w-4 h-4" />;
};

/**
 * Fallback generator untuk rute semantik publik /cv-screener/report/[role]/[name]
 * Mengonstruksi data profil CV kandidat terstruktur realistis dan menjalankan pipeline RVE
 */
export function buildSemanticReportFallback(roleSlug: string, nameSlug?: string) {
  const effectiveRole = deslugify(roleSlug) || 'Head Coach';
  const { cleanName, shortId } = parseCvScreenerSlug(nameSlug || '');
  const candidateName = cleanName ? deslugify(cleanName) : 'Dimas Arya Wijaya';
  const fallbackId = shortId ? `scr-${shortId}` : `scr-${Date.now().toString(36).slice(-6)}`;

  let candidateCv: any;
  if (roleSlug.toLowerCase().includes('coach')) {
    candidateCv = {
      id: fallbackId,
      title: `CV ATS ${effectiveRole} - ${candidateName}`,
      candidateName,
      roleTitle: effectiveRole,
      email: `${slugify(candidateName).replace(/-/g, '.')}@email.com`,
      phone: '+62 812-9876-5432',
      location: 'Jakarta, Indonesia',
      summary: `${effectiveRole} berpengalaman lebih dari 4 tahun dalam merancang strategi taktis, pembinaan performa tim, manajemen roster, dan analisis data pertandingan. Terbukti memimpin tim meraih kejuaraan kompetisi resmi dan meningkatkan win rate tim hingga 28% melalui kepemimpinan terstruktur dan kedisiplinan program latihan terukur.`,
      experience: [
        {
          id: 'exp-1',
          role: effectiveRole,
          company: 'PT Prestasi Olahraga Indonesia',
          period: '2022 - Sekarang',
          achievements: [
            'Memimpin 12 atlet dan staf pelatih dalam perancangan strategi turnamen dan evaluasi analitik taktik mingguan.',
            'Meningkatkan rasio kemenangan (win rate) tim sebesar 28% sepanjang musim kompetisi nasional 2023-2024.',
            'Menyusun program pembinaan mental ketahanan bertanding dan periodisasi latihan fisik berstandar nasional.',
          ],
          metricsCount: 2,
        },
        {
          id: 'exp-2',
          role: 'Assistant Coach & Tactical Analyst',
          company: 'Garuda Sports & Performance Lab',
          period: '2020 - 2022',
          achievements: [
            'Melakukan analisis rekaman pertandingan (VOD review) dan membedah kecenderungan taktik lawan untuk 40+ pertandingan resmi.',
            'Mengembangkan kurikulum fundamental drill harian yang mempercepat adaptasi atlet baru hingga 35%.',
          ],
          metricsCount: 2,
        },
      ],
      education: [
        {
          id: 'edu-1',
          degree: 'S1 Ilmu Keolahragaan & Manajemen Kepelatihan',
          institution: 'Universitas Negeri Jakarta',
          period: '2016 - 2020',
          gpa: '3.72 / 4.00',
        },
      ],
      skills: [
        'Team Leadership',
        'Tactical Planning & Game Strategy',
        'Performance Analytics',
        'Roster & Talent Management',
        'VOD Review & Match Analysis',
        'Mental Toughness Training',
        'Public Speaking & Mentoring',
        'Problem Solving',
      ],
      pageCount: 1,
    };
  } else {
    candidateCv = {
      id: fallbackId,
      title: `CV ATS ${effectiveRole} - ${candidateName}`,
      candidateName,
      roleTitle: effectiveRole,
      email: `${slugify(candidateName).replace(/-/g, '.')}@email.com`,
      phone: '+62 812-9876-5432',
      location: 'Jakarta, Indonesia',
      summary: `Profesional ${effectiveRole} berdedikasi tinggi dengan rekam jejak terbukti dalam eksekusi proyek strategis, peningkatan metrik efisiensi kerja hingga 25%, dan kerja sama lintas tim multidisiplin.`,
      experience: [
        {
          id: 'exp-1',
          role: effectiveRole,
          company: 'PT Solusi Teknologi Pratama',
          period: '2022 - Sekarang',
          achievements: [
            `Memimpin inisiatif kunci pada divisi ${effectiveRole} dengan efisiensi biaya operasional sebesar 20%.`,
            'Mengoptimalkan alur kerja tim dan standar operasional prosedur untuk mempercepat penyelesaian proyek hingga 25%.',
          ],
          metricsCount: 2,
        },
      ],
      education: [
        {
          id: 'edu-1',
          degree: 'Sarjana (S1)',
          institution: 'Universitas Indonesia',
          period: '2017 - 2021',
          gpa: '3.65 / 4.00',
        },
      ],
      skills: ['Leadership', 'Strategic Planning', 'Problem Solving', 'Data Analysis', 'Communication', 'Project Management'],
      pageCount: 1,
    };
  }

  const rep = runFullRvePipeline(
    'saved',
    candidateCv,
    null,
    '',
    effectiveRole,
    [],
    null,
    'job'
  );

  return {
    id: fallbackId,
    rveReport: rep,
    selectedPersonaId: 'startup',
    activePurpose: 'job' as CvPurpose,
    targetRole: effectiveRole,
    targetLevel: 'Senior' as const,
    cvSourceMode: 'saved' as const,
    selectedCvId: candidateCv.id,
    appliedFixes: [] as string[],
    selectedSavedCv: candidateCv,
    targetBasis: 'role' as const,
    jobPosition: effectiveRole,
    jobCompany: 'Industri Olahraga & Prestasi',
    jobDescription: `Pelaksanaan tugas kepelatihan dan kepemimpinan strategis posisi ${effectiveRole}`,
    jobMatchResult: null,
    timestamp: Date.now(),
  };
}

export const AiCvScreenerView: React.FC<{
  mode?: 'setup' | 'report';
  initialSessionId?: string;
  roleSlug?: string;
  nameSlug?: string;
}> = ({ mode = 'setup', initialSessionId, roleSlug, nameSlug }) => {
  const router = useRouter();
  const toast = useToast();
  const { confirm } = useConfirm();

  // Helper sinkronisasi awal untuk mencegah FOUC / kedipan skor saat me-refresh halaman report
  const getInitialActiveReportData = () => {
    if (typeof window === 'undefined') return null;
    try {
      const sp = new URLSearchParams(window.location.search);
      const sessionParam = initialSessionId || sp.get('session');
      const session = getStoredSession();
      const userHistoryKey = session ? `employr_screener_history_${session.email || session.id || 'default'}` : 'employr_screener_history';
      const userHist = localStorage.getItem(userHistoryKey) || localStorage.getItem('employr_screener_history');

      let matchedHist: SavedReportHistoryItem | null = null;
      if (userHist) {
        const items = JSON.parse(userHist);
        if (Array.isArray(items) && items.length > 0) {
          if (sessionParam) {
            const cleanParam = sessionParam.toLowerCase();
            matchedHist = items.find((h: any) => {
              if (!h.id) return false;
              const hid = h.id.toLowerCase();
              return hid === cleanParam || hid === `scr-${cleanParam}` || hid.includes(cleanParam);
            }) || null;
          }
          if (!matchedHist && roleSlug) {
            const { cleanName, shortId } = parseCvScreenerSlug(nameSlug || '');
            matchedHist = items.find((h: any) => {
              const hRole = slugify(h.targetRole || '');
              const hName = slugify(h.candidateName || '');
              if (shortId && (h.id?.toLowerCase().includes(shortId) || hName.includes(shortId))) return true;
              return hRole === roleSlug && (hName.includes(cleanName) || cleanName.includes(hName));
            }) || null;
          }
          if (!matchedHist && items[0]) {
            matchedHist = items[0];
          }
        }
      }

      const stored = localStorage.getItem('employr_active_screener_report');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.rveReport) {
          if (sessionParam) {
            const cleanParam = sessionParam.toLowerCase();
            const pid = parsed.id?.toLowerCase() || '';
            if (pid === cleanParam || pid === `scr-${cleanParam}` || pid.includes(cleanParam)) {
              return parsed;
            }
          } else if (roleSlug) {
            const { cleanName, shortId } = parseCvScreenerSlug(nameSlug || '');
            const pRole = slugify(parsed.targetRole || '');
            const pName = slugify(parsed.selectedSavedCv?.candidateName || parsed.candidateName || '');
            if (shortId && (parsed.id?.toLowerCase().includes(shortId) || pName.includes(shortId))) return parsed;
            if (pRole === roleSlug && (pName.includes(cleanName) || cleanName.includes(pName))) return parsed;
          } else {
            return parsed;
          }
        }
      }

      if (matchedHist) {
        const rep = matchedHist.rveReport || (matchedHist.selectedSavedCv ? runFullRvePipeline(
          matchedHist.cvSourceMode || 'saved',
          matchedHist.selectedSavedCv,
          null,
          '',
          matchedHist.targetRole || 'Professional',
          matchedHist.appliedFixes || [],
          null,
          matchedHist.activePurpose || 'fresh_graduate'
        ) : null);

        if (rep) {
          return {
            id: matchedHist.id,
            rveReport: rep,
            selectedPersonaId: matchedHist.selectedPersonaId,
            activePurpose: matchedHist.activePurpose,
            targetRole: matchedHist.targetRole,
            targetLevel: matchedHist.targetLevel,
            cvSourceMode: matchedHist.cvSourceMode,
            selectedCvId: matchedHist.selectedCvId,
            appliedFixes: matchedHist.appliedFixes || [],
            selectedSavedCv: matchedHist.selectedSavedCv,
            targetBasis: matchedHist.targetBasis,
            jobPosition: matchedHist.jobPosition,
            jobCompany: matchedHist.jobCompany,
            jobDescription: matchedHist.jobDescription,
            jobMatchResult: matchedHist.jobMatchResult,
          };
        }
      }

      // Jika ada roleSlug di URL tetapi belum tersimpan di riwayat, buat fallback instan
      if (roleSlug) {
        const fallback = buildSemanticReportFallback(roleSlug, nameSlug);
        try {
          localStorage.setItem('employr_active_screener_report', JSON.stringify(fallback));
          const userHistoryKey = session ? `employr_screener_history_${session.email || session.id || 'default'}` : 'employr_screener_history';
          const userHistRaw = localStorage.getItem(userHistoryKey) || '[]';
          const items = JSON.parse(userHistRaw);
          if (Array.isArray(items)) {
            const historyItem: SavedReportHistoryItem = {
              id: fallback.id,
              candidateName: fallback.selectedSavedCv.candidateName,
              targetRole: fallback.targetRole,
              targetLevel: fallback.targetLevel,
              personaName: 'Startup',
              personaFocus: 'Portofolio & Impact',
              activePurpose: fallback.activePurpose,
              purposeTitle: 'Profesional Berpengalaman',
              consensusScore: fallback.rveReport.consensusScore ?? 85,
              verdictStatus: fallback.rveReport.verdictStatus || 'interview',
              timestamp: new Date().toLocaleString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }),
              appliedFixes: [],
              cvSourceMode: 'saved',
              selectedCvId: fallback.selectedCvId,
              selectedPersonaId: fallback.selectedPersonaId,
              selectedSavedCv: fallback.selectedSavedCv,
              rveReport: fallback.rveReport,
            };
            if (!items.some((h: any) => h.id === fallback.id)) {
              items.unshift(historyItem);
              localStorage.setItem(userHistoryKey, JSON.stringify(items));
            }
          }
        } catch (_) {}
        return fallback;
      }
    } catch {}
    return null;
  };

  const initialReportPayload = mode === 'report' ? getInitialActiveReportData() : null;

  // Phase / View State: 'setup' (Form Input & Recruiter Selection) vs 'report' (Full Width Immersive Pipeline)
  const [activePhase, setActivePhase] = useState<'setup' | 'report'>(mode);

  // Dynamic Saved CVs from database / localStorage / defaults
  const [savedCvs, setSavedCvs] = useState<any[]>(() => {
    if (initialReportPayload?.selectedSavedCv) {
      return [initialReportPayload.selectedSavedCv];
    }
    return [];
  });
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

    const purpose: CvPurpose =
      item.purpose ||
      item.data?.purpose ||
      (rawExp.length === 0 ? 'fresh_graduate' : 'job');

    // Hitung skor ATS secara konsisten dengan modul /cv
    let computedAts = 0;
    try {
      const calc = calculateAtsScore(item);
      if (calc && typeof calc.totalScore === 'number') {
        computedAts = calc.totalScore;
      }
    } catch (e) {}

    const atsScore =
      typeof item.atsScore === 'number' && item.atsScore > 0
        ? item.atsScore
        : typeof item.data?.atsScore === 'number' && item.data.atsScore > 0
        ? item.data.atsScore
        : (computedAts > 0 ? computedAts : 0);

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
      atsScore,
      purpose,
      templateId: item.templateId || item.data?.templateId || 'ats-modern',
      projects: item.projects || item.data?.projects || [],
      internships: item.internships || item.data?.internships || [],
      certifications: item.certifications || item.data?.certifications || [],
      organizations: item.organizations || item.data?.organizations || [],
      languages: item.languages || item.data?.languages || [],
      courses: item.courses || item.data?.courses || [],
      volunteers: item.volunteers || item.volunteer || item.data?.volunteers || item.data?.volunteer || [],
      photoUrl: item.photoUrl || item.data?.photoUrl || '',
      rawData: item.data || item,
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
      const savedHist = localStorage.getItem(userHistoryKey);
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

    // Fetch CVs dari database API, dengan fallback ke localStorage cuti_cv_list / employr_cv_list / profil
    (async () => {
      let candidateCvs: any[] = [];
      try {
        const remoteCvs = await cvApi.getAll();
        if (Array.isArray(remoteCvs) && remoteCvs.length > 0) {
          candidateCvs = remoteCvs;
        }
      } catch (e) {
        console.warn('Could not fetch remote CVs');
      }

      if (candidateCvs.length > 0) {
        const normalized = candidateCvs.map((c) => normalizeCvItem(c, session, profile));
        setSavedCvs(normalized);
        setSelectedCvId((prev) => prev || normalized[0].id);
        if (normalized[0]?.roleTitle) {
          setTargetRole((prev: string) => prev || normalized[0].roleTitle);
        }
        if (normalized[0]?.purpose) {
          setActivePurpose(normalized[0].purpose);
        }

        // Jika belum ada riwayat sesi screening di localStorage, sediakan sesi awal dari CV aktif
        const userHistoryKey = session
          ? `employr_screener_history_${session.email || session.id || 'default'}`
          : 'employr_screener_history';
        const existingRaw = localStorage.getItem(userHistoryKey);
        if (!existingRaw) {
          const initialReport = runFullRvePipeline(
            'saved',
            normalized[0],
            null,
            '',
            normalized[0].roleTitle || 'Professional',
            [],
            null,
            'fresh_graduate'
          );

          const initialSession: SavedReportHistoryItem = {
            id: `scr-${Date.now().toString(36).slice(-6)}`,
            candidateName: normalized[0].candidateName,
            targetRole: normalized[0].roleTitle,
            targetLevel: 'Junior',
            personaName: 'Startup',
            personaFocus: 'Portofolio & Impact',
            activePurpose: 'fresh_graduate',
            purposeTitle: 'Fresh Graduate',
            consensusScore: initialReport.consensusScore ?? normalized[0].atsScore ?? 0,
            verdictStatus: initialReport.verdictStatus || ((normalized[0].atsScore ?? 0) >= 75 ? 'interview' : 'maybe'),
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
            selectedPersonaId: 'fresh-grad',
            selectedSavedCv: normalized[0],
            rveReport: initialReport,
          };
          setReportHistory([initialSession]);
          try {
            localStorage.setItem(userHistoryKey, JSON.stringify([initialSession]));
          } catch (e) {}
        }
      } else {
        // Mode murni: jika belum ada CV tersimpan di akun, biarkan kosong agar memicu Empty State resmi
        setSavedCvs([]);
        setSelectedCvId('');
      }
    })();
  }, []);

  // Source Mode Selection
  const [cvSourceMode, setCvSourceMode] = useState<'saved' | 'upload'>(
    () => (initialReportPayload?.cvSourceMode as any) || 'saved'
  );
  const [selectedCvId, setSelectedCvId] = useState<string>(
    () => initialReportPayload?.selectedCvId || ''
  );
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [rawCvText, setRawCvText] = useState('');
  const [uploadedParsedData, setUploadedParsedData] = useState<any>(null);
  const [isParsingUpload, setIsParsingUpload] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState<boolean>(false);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const cvFileInputRef = useRef<HTMLInputElement>(null);

  // Target Job Role & Recruiter Persona & 10 Purpose Profiles (Default: Pemula / Mahasiswa - Hick's Law)
  const [activePurpose, setActivePurpose] = useState<CvPurpose>(
    () => initialReportPayload?.activePurpose || 'fresh_graduate'
  );
  const [purposeCategoryFilter, setPurposeCategoryFilter] = useState<'all' | 'career' | 'entry' | 'academic' | 'flexible'>('entry');
  const [targetRole, setTargetRole] = useState<string>(() => initialReportPayload?.targetRole || '');
  const [targetLevel, setTargetLevel] = useState<'Entry' | 'Junior' | 'Mid' | 'Senior'>(
    () => initialReportPayload?.targetLevel || 'Entry'
  );
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>(
    () => initialReportPayload?.selectedPersonaId || 'fresh-grad'
  );
  const [aiReportData, setAiReportData] = useState<RveReportResult | null>(
    () => initialReportPayload?.rveReport || null
  );
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    () => initialReportPayload?.id || initialSessionId || null
  );

  const activeSessionItem = useMemo(() => {
    return reportHistory.find((h) => h.id === activeSessionId) || null;
  }, [reportHistory, activeSessionId]);

  // Target Basis: 'job' (Spesifik Lowongan Target / Job Description) vs 'role' (Posisi & Persona Umum)
  const [targetBasis, setTargetBasis] = useState<'role' | 'job'>(
    () => (initialReportPayload as any)?.targetBasis || 'job'
  );
  const [jobPosition, setJobPosition] = useState<string>(
    () => (initialReportPayload as any)?.jobPosition || ''
  );
  const [jobCompany, setJobCompany] = useState<string>(
    () => (initialReportPayload as any)?.jobCompany || ''
  );
  const [jobDescription, setJobDescription] = useState<string>(
    () => (initialReportPayload as any)?.jobDescription || ''
  );
  const [jobMatchResult, setJobMatchResult] = useState<any | null>(
    () => (initialReportPayload as any)?.jobMatchResult || null
  );
  const [isSavingToTracker, setIsSavingToTracker] = useState(false);
  const [isSavedToTracker, setIsSavedToTracker] = useState(false);
  const [isPersonaAccordionOpen, setIsPersonaAccordionOpen] = useState(false);

  // Sync from URL search params (e.g. from /match-cv redirect or tracker/loker links)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const sp = new URLSearchParams(window.location.search);
        const modeParam = sp.get('mode');
        const roleParam = sp.get('role');
        const companyParam = sp.get('company');
        const cvIdParam = sp.get('cvId');
        if (modeParam === 'job' || sp.get('source') === 'match-cv') {
          setTargetBasis('job');
        }
        if (roleParam) {
          setTargetRole(roleParam);
          setJobPosition(roleParam);
        }
        if (companyParam) {
          setJobCompany(companyParam);
        }
        if (cvIdParam) {
          setSelectedCvId(cvIdParam);
        }
      } catch {}
    }
  }, []);

  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Reset aiReportData when inputs change (hanya pada mode setup)
  useEffect(() => {
    if (mode !== 'report') {
      setAiReportData(null);
    }
  }, [selectedCvId, selectedPersonaId, targetRole, cvSourceMode, uploadedFile, uploadedParsedData, activePurpose, mode, targetBasis, jobPosition, jobCompany, jobDescription]);

  const savedCvsRef = useRef(savedCvs);
  savedCvsRef.current = savedCvs;
  const hasHydratedReportRef = useRef<string | null>(null);

  // Hydrate active report from localStorage when accessing /cv-screener/report
  useEffect(() => {
    if (mode === 'report' && typeof window !== 'undefined') {
      const currentReportKey = `${roleSlug || ''}:${nameSlug || ''}:${initialSessionId || ''}`;
      if (hasHydratedReportRef.current === currentReportKey) return;

      try {
        const sp = new URLSearchParams(window.location.search);
        const sessionParam = initialSessionId || sp.get('session');
        const session = getStoredSession();
        const userHistoryKey = session ? `employr_screener_history_${session.email || session.id || 'default'}` : 'employr_screener_history';
        const userHist = localStorage.getItem(userHistoryKey) || localStorage.getItem('employr_screener_history');

        let targetHist: SavedReportHistoryItem | null = null;
        if (userHist) {
          try {
            const items = JSON.parse(userHist);
            if (Array.isArray(items) && items.length > 0) {
              if (sessionParam) {
                targetHist = items.find((h: any) => h.id === sessionParam) || null;
              }
              if (!targetHist && roleSlug) {
                const { cleanName, shortId } = parseCvScreenerSlug(nameSlug || '');
                targetHist = items.find((h: any) => {
                  const hRole = slugify(h.targetRole || '');
                  const hName = slugify(h.candidateName || '');
                  if (shortId && (h.id?.toLowerCase().includes(shortId) || hName.includes(shortId))) return true;
                  return hRole === roleSlug && (hName.includes(cleanName) || cleanName.includes(hName));
                }) || null;
              }
              if (!targetHist && !localStorage.getItem('employr_active_screener_report')) {
                targetHist = items[0];
              }
            }
          } catch {}
        }

        // 1. Jika ada targetHist spesifik dari riwayat / query param
        if (targetHist) {
          const cvToUse = targetHist.selectedSavedCv || savedCvsRef.current.find((c) => c.id === targetHist?.selectedCvId) || savedCvsRef.current[0];
          const rep = targetHist.rveReport || (cvToUse ? runFullRvePipeline(
            targetHist.cvSourceMode || 'saved',
            cvToUse,
            null,
            '',
            targetHist.targetRole || 'Professional',
            targetHist.appliedFixes || [],
            null,
            targetHist.activePurpose || 'fresh_graduate'
          ) : null);

          if (rep) {
            setAiReportData(rep);
            if (targetHist.selectedPersonaId) setSelectedPersonaId(targetHist.selectedPersonaId);
            if (targetHist.activePurpose) setActivePurpose(targetHist.activePurpose);
            if (targetHist.targetRole) setTargetRole(targetHist.targetRole);
            if (targetHist.targetLevel) setTargetLevel(targetHist.targetLevel);
            if (targetHist.cvSourceMode) setCvSourceMode(targetHist.cvSourceMode);
            if (targetHist.selectedCvId) setSelectedCvId(targetHist.selectedCvId);
            if (targetHist.appliedFixes) setAppliedFixes(targetHist.appliedFixes);
            if (targetHist.targetBasis) setTargetBasis(targetHist.targetBasis);
            if (targetHist.jobPosition) setJobPosition(targetHist.jobPosition);
            if (targetHist.jobCompany) setJobCompany(targetHist.jobCompany);
            if (targetHist.jobDescription) setJobDescription(targetHist.jobDescription);
            if (targetHist.jobMatchResult) setJobMatchResult(targetHist.jobMatchResult);
            if (targetHist.selectedSavedCv) {
              setSavedCvs((prev) => {
                const exists = prev.some((c) => c.id === targetHist.selectedSavedCv.id);
                if (exists) return prev;
                return [targetHist.selectedSavedCv, ...prev];
              });
            }
            setHasRunPipeline(true);
            setActivePhase('report');
            setActiveSessionId(targetHist.id);

            // Simpan ke active report payload
            const payload = {
              id: targetHist.id,
              rveReport: rep,
              selectedPersonaId: targetHist.selectedPersonaId,
              activePurpose: targetHist.activePurpose || 'fresh_graduate',
              targetRole: targetHist.targetRole,
              targetLevel: targetHist.targetLevel || 'Entry',
              cvSourceMode: targetHist.cvSourceMode,
              selectedCvId: targetHist.selectedCvId,
              appliedFixes: targetHist.appliedFixes || [],
              selectedSavedCv: cvToUse,
              targetBasis: targetHist.targetBasis,
              jobPosition: targetHist.jobPosition,
              jobCompany: targetHist.jobCompany,
              jobDescription: targetHist.jobDescription,
              jobMatchResult: targetHist.jobMatchResult,
              timestamp: Date.now(),
            };
            localStorage.setItem('employr_active_screener_report', JSON.stringify(payload));

            // Jika URL saat ini masih mengakses path lama /cv-screener/report atau query param, mutasikan ke semantic path
            if (typeof window !== 'undefined' && window.location.pathname === '/cv-screener/report') {
              const { reportPath } = buildCvScreenerSlug(targetHist.targetRole, targetHist.candidateName, targetHist.id);
              window.history.replaceState(null, '', reportPath);
            }
            hasHydratedReportRef.current = currentReportKey;
            return;
          }
        }

        // 2. Cek employr_active_screener_report di localStorage
        const stored = localStorage.getItem('employr_active_screener_report');
        if (stored) {
          const parsed = JSON.parse(stored);
          const cvToUse = parsed.selectedSavedCv || savedCvsRef.current.find((c) => c.id === parsed.selectedCvId) || savedCvsRef.current[0];
          const effectiveReport = parsed.rveReport || (cvToUse ? runFullRvePipeline(
            parsed.cvSourceMode || 'saved',
            cvToUse,
            null,
            '',
            parsed.targetRole || 'Professional',
            parsed.appliedFixes || [],
            null,
            parsed.activePurpose || 'fresh_graduate'
          ) : null);

          if (effectiveReport) {
            setAiReportData(effectiveReport);
            if (parsed.selectedPersonaId) setSelectedPersonaId(parsed.selectedPersonaId);
            if (parsed.activePurpose) setActivePurpose(parsed.activePurpose);
            if (parsed.targetRole) setTargetRole(parsed.targetRole);
            if (parsed.targetLevel) setTargetLevel(parsed.targetLevel);
            if (parsed.cvSourceMode) setCvSourceMode(parsed.cvSourceMode);
            if (parsed.selectedCvId) setSelectedCvId(parsed.selectedCvId);
            if (parsed.appliedFixes) setAppliedFixes(parsed.appliedFixes);
            if (parsed.targetBasis) setTargetBasis(parsed.targetBasis);
            if (parsed.jobPosition) setJobPosition(parsed.jobPosition);
            if (parsed.jobCompany) setJobCompany(parsed.jobCompany);
            if (parsed.jobDescription) setJobDescription(parsed.jobDescription);
            if (parsed.jobMatchResult) setJobMatchResult(parsed.jobMatchResult);
            if (parsed.selectedSavedCv) {
              setSavedCvs((prev) => {
                const exists = prev.some((c) => c.id === parsed.selectedSavedCv.id);
                if (exists) return prev;
                return [parsed.selectedSavedCv, ...prev];
              });
            }
            setHasRunPipeline(true);
            setActivePhase('report');
            if (parsed.id) setActiveSessionId(parsed.id);

            if (typeof window !== 'undefined' && window.location.pathname === '/cv-screener/report') {
              const { reportPath } = buildCvScreenerSlug(
                parsed.targetRole,
                parsed.selectedSavedCv?.candidateName || parsed.candidateName,
                parsed.id
              );
              window.history.replaceState(null, '', reportPath);
            }
            hasHydratedReportRef.current = currentReportKey;
            return;
          }
        }

        // 3. Fallback: riwayat teratas
        if (userHist) {
          const items = JSON.parse(userHist);
          if (Array.isArray(items) && items.length > 0) {
            const hist = items[0];
            const cvToUse = hist.selectedSavedCv || savedCvsRef.current[0];
            const rep = hist.rveReport || (cvToUse ? runFullRvePipeline(
              hist.cvSourceMode || 'saved',
              cvToUse,
              null,
              '',
              hist.targetRole || 'Professional',
              hist.appliedFixes || [],
              null,
              hist.activePurpose || 'fresh_graduate'
            ) : null);

            if (rep) {
              setAiReportData(rep);
              setCvSourceMode(hist.cvSourceMode);
              if (hist.selectedCvId) setSelectedCvId(hist.selectedCvId);
              setSelectedPersonaId(hist.selectedPersonaId);
              setTargetRole(hist.targetRole);
              if (hist.targetLevel) setTargetLevel(hist.targetLevel);
              if (hist.activePurpose) setActivePurpose(hist.activePurpose);
              if (hist.appliedFixes) setAppliedFixes(hist.appliedFixes || []);
              if (hist.targetBasis) setTargetBasis(hist.targetBasis);
              if (hist.jobPosition) setJobPosition(hist.jobPosition);
              if (hist.jobCompany) setJobCompany(hist.jobCompany);
              if (hist.jobDescription) setJobDescription(hist.jobDescription);
              if (hist.jobMatchResult) setJobMatchResult(hist.jobMatchResult);
              if (hist.selectedSavedCv) {
                setSavedCvs((prev) => {
                  const exists = prev.some((c) => c.id === hist.selectedSavedCv.id);
                  if (exists) return prev;
                  return [hist.selectedSavedCv, ...prev];
                });
              }
              setHasRunPipeline(true);
              setActivePhase('report');
              if (hist.id) setActiveSessionId(hist.id);

              if (typeof window !== 'undefined' && window.location.pathname === '/cv-screener/report') {
                const { reportPath } = buildCvScreenerSlug(hist.targetRole, hist.candidateName, hist.id);
                window.history.replaceState(null, '', reportPath);
              }
              hasHydratedReportRef.current = currentReportKey;
              return;
            }
          }
        }

        // 4. Jika ada CV tersimpan di akun tapi belum pernah ada riwayat screening
        if (savedCvsRef.current && savedCvsRef.current.length > 0) {
          const firstCv = savedCvsRef.current[0];
          const effectiveRoleToRun = roleSlug ? deslugify(roleSlug) : (firstCv.roleTitle || 'Professional');
          const effectiveCandNameToRun = nameSlug ? deslugify(nameSlug) : (firstCv.candidateName || 'Kandidat');
          const rep = runFullRvePipeline(
            'saved',
            firstCv,
            null,
            '',
            effectiveRoleToRun,
            [],
            null,
            firstCv.purpose || 'fresh_graduate'
          );
          setAiReportData(rep);
          setSelectedCvId(firstCv.id);
          setTargetRole(effectiveRoleToRun);
          setHasRunPipeline(true);
          setActivePhase('report');
          if (firstCv.id) setActiveSessionId(firstCv.id);

          if (typeof window !== 'undefined' && window.location.pathname === '/cv-screener/report') {
            const { reportPath } = buildCvScreenerSlug(effectiveRoleToRun, effectiveCandNameToRun, firstCv.id);
            window.history.replaceState(null, '', reportPath);
          }
          hasHydratedReportRef.current = currentReportKey;
          return;
        }

        // 5. Fallback untuk rute semantik publik roleSlug / nameSlug
        if (roleSlug) {
          const fallback = buildSemanticReportFallback(roleSlug, nameSlug);
          setAiReportData(fallback.rveReport);
          setSelectedPersonaId(fallback.selectedPersonaId);
          setActivePurpose(fallback.activePurpose);
          setTargetRole(fallback.targetRole);
          setTargetLevel(fallback.targetLevel);
          setCvSourceMode(fallback.cvSourceMode);
          setSelectedCvId(fallback.selectedCvId);
          setAppliedFixes(fallback.appliedFixes);
          setSavedCvs((prev) => {
            if (prev.length === 1 && prev[0]?.id === fallback.selectedSavedCv?.id) return prev;
            return [fallback.selectedSavedCv];
          });
          setHasRunPipeline(true);
          setActivePhase('report');
          if (fallback.id) setActiveSessionId(fallback.id);

          try {
            localStorage.setItem('employr_active_screener_report', JSON.stringify(fallback));
            const existingHistRaw = localStorage.getItem(userHistoryKey) || '[]';
            const existingHist = JSON.parse(existingHistRaw);
            if (Array.isArray(existingHist)) {
              const updatedHist = [fallback, ...existingHist.filter((h: any) => h.id !== fallback.id)];
              localStorage.setItem(userHistoryKey, JSON.stringify(updatedHist));
              setReportHistory(updatedHist);
            }
          } catch (_) {}
          hasHydratedReportRef.current = currentReportKey;
          return;
        }

        // Benar-benar tidak ada data CV sama sekali, baru arahkan ke setup
        router.replace('/cv-screener');
      } catch (err) {
        console.warn('Gagal memuat laporan aktif:', err);
      }
    }
  }, [mode, router, roleSlug, nameSlug, initialSessionId]);


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

  // Auto-expanding textarea ref for job description (Anti-Slop R-03 Mobile Ergonomics)
  const jobDescriptionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (jobDescriptionRef.current) {
      jobDescriptionRef.current.style.height = 'auto';
      jobDescriptionRef.current.style.height = `${Math.max(140, jobDescriptionRef.current.scrollHeight)}px`;
    }
  }, [jobDescription]);

  const SENIORITY_OPTIONS = [
    { value: 'Entry', label: 'Entry-Level (0 - 1 Tahun)' },
    { value: 'Junior', label: 'Junior-Level (1 - 3 Tahun)' },
    { value: 'Mid', label: 'Mid-Level (3 - 5 Tahun)' },
    { value: 'Senior', label: 'Senior-Level (5+ Tahun)' },
  ] as const;

  // Interactive Fixes State & One-Click Auto Optimization State
  const [appliedFixes, setAppliedFixes] = useState<string[]>(
    () => initialReportPayload?.appliedFixes || []
  );
  const [isAutoOptimizing, setIsAutoOptimizing] = useState(false);
  const [isOptimizeDrawerOpen, setIsOptimizeDrawerOpen] = useState(false);
  const [optimizeMode, setOptimizeMode] = useState<'duplicate' | 'overwrite'>('duplicate');
  const [optimizedCvResult, setOptimizedCvResult] = useState<{
    id: string;
    title: string;
    mode: 'duplicate' | 'overwrite';
    timestamp: string;
  } | null>(null);

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

  // Floating Back to Top Button state for long report scroll
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        setShowBackToTop(window.scrollY > 400);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Heatmap Overlay View Mode State
  const [showHeatmapOverlay, setShowHeatmapOverlay] = useState<boolean>(true);
  const [heatmapViewMode, setHeatmapViewMode] = useState<'heatmap' | 'f-pattern' | 'bbox' | 'ats-matrix'>('heatmap');
  const [visionActivePage, setVisionActivePage] = useState<1 | 2 | 3>(1);

  // Interactive Recruiter Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: 'Halo! Saya Tim Recruiter Employr. Saya telah menganalisis CV kamu secara menyeluruh. Ada yang ingin kamu tanyakan tentang hasil screening atau cara meloloskan CV ini?',
      time: 'Baru saja',
    },
  ]);
  const [inputChatText, setInputChatText] = useState('');

  // Recruiter Persona Search & Filter States
  const [personaSearchQuery, setPersonaSearchQuery] = useState('');
  const [personaCategoryFilter, setPersonaCategoryFilter] = useState<'all' | 'company' | 'region' | 'special'>('all');
  const [expandedPersonaId, setExpandedPersonaId] = useState<string | null>('fresh-grad');
  const [showAllPersonas, setShowAllPersonas] = useState(false);
  const [isPersonaDrawerOpen, setIsPersonaDrawerOpen] = useState(false);

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

  // Sinkronkan activePurpose secara otomatis dari CV yang sedang aktif
  useEffect(() => {
    if (selectedSavedCv?.purpose && cvSourceMode === 'saved') {
      setActivePurpose(selectedSavedCv.purpose);
    }
  }, [selectedSavedCv?.purpose, cvSourceMode]);

  const effectiveVisionTemplateId = useMemo(() => {
    return selectedSavedCv?.templateId || selectedSavedCv?.data?.templateId || 'ats-modern';
  }, [selectedSavedCv]);

  const isVisionUsingCustomTemplate = Boolean(
    cvSourceMode !== 'upload' && Boolean(effectiveVisionTemplateId)
  );

  const visionActiveArchetype = useMemo(() => {
    return getTemplateArchetype(effectiveVisionTemplateId);
  }, [effectiveVisionTemplateId]);

  const visionActiveTemplateOption = useMemo(() => {
    return cvTemplates.find((t) => t.id === effectiveVisionTemplateId);
  }, [effectiveVisionTemplateId]);

  const visionArchetypeInfo = useMemo(() => {
    if (visionActivePage === 2) {
      return {
        label: 'Lembar Verifikasi Kredensial (The Proof)',
        patternName: 'Deep Proof Verification Scan',
        badge: 'Verifikasi Halaman 2',
        insight:
          'Prediksi Tatapan HRD (Detik 6–10): Menyisir paruh atas lembar kedua untuk validasi Riwayat Pendidikan, institusi, IPK, dan detail keahlian teknis.',
      };
    }
    if (visionActivePage === 3) {
      return {
        label: 'Zona Bahaya Eliminasi (Dead Zone)',
        patternName: 'Drop-off Rate 95%',
        badge: 'Risiko Eliminasi',
        insight:
          'Peringatan Kritis Eliminasi: 95% rekruter tidak pernah menggulir ke halaman ke-3 untuk pelamar pemula (usia 16–24 tahun). Berkas 3 halaman dinilai rawan tidak memilah prioritas kerja.',
      };
    }
    switch (visionActiveArchetype) {
      case 'grid-timeline':
        return {
          label: 'Grid 2-Kolom Timeline (Harvard Format)',
          patternName: 'Anchored Saccade Scan',
          badge: 'Harvard Grid 2-Kolom',
          insight:
            'Pandangan membidik Jabatan di kolom kanan (detik 1–2), lalu melirik ke kolom kiri 140px untuk verifikasi durasi/gap karier (detik 2–3). Bukan zig-zag acak.',
        };
      case 'sidebar':
        return {
          label: 'Asymmetric Sidebar Layout',
          patternName: 'Bifurcated Dual-Zone Scan',
          badge: 'Sidebar Asimetris',
          insight:
            'Pemisahan fokus cepat: detik 0–1 pemindaian identitas & skill di sidebar kiri, kemudian tatapan beralih ke riwayat pengalaman kerja di kolom utama kanan.',
        };
      case 'single-column':
      default:
        return {
          label: '1-Kolom Standar ATS Internasional',
          patternName: 'Classic F-Shape Reading Pattern',
          badge: '1 Kolom ATS',
          insight:
            'Pola F murni: pandangan bergerak horizontal di paruh atas pada nama dan ringkasan, lalu menyapu vertikal ke bawah di sepanjang sisi kiri heading pengalaman kerja.',
        };
    }
  }, [visionActiveArchetype, visionActivePage]);

  const currentPersona = recruiterPersonas.find((p) => p.id === selectedPersonaId) || recruiterPersonas[0];

  const hasSavedCvs = savedCvs.length > 0;
  const hasUsableCv = cvSourceMode === 'upload' ? Boolean(uploadedFile) : hasSavedCvs;
  const effectiveRole = targetRole.trim() || selectedSavedCv?.roleTitle || 'Role Impian';
  const isReadyToScreen = Boolean(
    hasUsableCv &&
    (targetBasis === 'job'
      ? Boolean((jobPosition || targetRole)?.trim() && jobDescription.trim())
      : Boolean(targetRole?.trim()))
  );

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
        stepNum,
        title: mod.title,
        shortLabel: mod.shortLabel,
        detailDescription: mod.detailDescription,
        icon: mod.icon,
        color: mod.color,
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

  const handleCvChange = (newCvId: string) => {
    setSelectedCvId(newCvId);
    setCvSourceMode('saved');
    const targetCv = savedCvs.find((c) => c.id === newCvId);
    if (targetCv) {
      if (targetCv.roleTitle && (!targetRole || targetRole === 'Professional' || targetRole === 'Role Impian')) {
        setTargetRole(targetCv.roleTitle);
      }
      if (targetCv.purpose) {
        setActivePurpose(targetCv.purpose);
      }
      toast.success(`CV "${targetCv.title || targetCv.candidateName}" aktif.`);
    }
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
      } catch (err) {
        console.warn('Gagal menyimpan riwayat ke localStorage:', err);
      }
    }
  };

  const handleSaveToTracker = async () => {
    const comp = jobCompany.trim() || 'Perusahaan Target';
    const pos = jobPosition.trim() || targetRole.trim() || 'Posisi';
    setIsSavingToTracker(true);
    try {
      await trackerApi.create({
        company: comp,
        position: pos,
        status: 'WISHLIST',
        appliedDate: new Date().toISOString().split('T')[0],
        notes: `Screening Employr: Skor ATS ${aiReportData?.atsScore || 80}%, Konsensus ${aiReportData?.consensusScore || 80}%.`,
      });
      setIsSavedToTracker(true);
      toast.success(`Lowongan ${pos} di ${comp} berhasil ditambahkan ke Tracker Lamaran!`);
    } catch (err: any) {
      console.error('Gagal menyimpan ke Tracker:', err);
      toast.error('Gagal menambahkan ke Tracker Lamaran. Silakan coba lagi.');
    } finally {
      setIsSavingToTracker(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setJobDescription(text.trim());
          toast.success('Teks kualifikasi lowongan berhasil ditempel dari clipboard.');
          return;
        }
      }
      toast.info('Clipboard kosong atau peramban membatasi izin baca. Silakan tempel manual dengan Ctrl+V pada kotak teks.');
    } catch {
      toast.info('Akses clipboard dibatasi browser. Silakan tempel manual dengan shortcut Ctrl+V pada kotak teks.');
    }
  };

  const handleStartRvePipeline = async () => {
    if (cvSourceMode === 'upload' && !uploadedFile) {
      toast.warning('Silakan pilih atau upload file CV kamu terlebih dahulu.');
      return;
    }
    if (cvSourceMode === 'saved' && !hasSavedCvs) {
      toast.warning('Belum ada CV tersimpan di akun kamu. Buat CV terlebih dahulu atau pilih Unggah Berkas.');
      return;
    }

    let effectiveRole = targetRole || selectedSavedCv?.roleTitle || 'Professional';
    if (targetBasis === 'job') {
      const trimmedPos = (jobPosition || targetRole || '').trim();
      const trimmedJd = jobDescription.trim();
      if (!trimmedPos) {
        toast.warning('Silakan isi Nama Posisi lowongan kerja yang ingin dilamar.');
        return;
      }
      if (!trimmedJd) {
        toast.warning('Silakan tempel teks Deskripsi / Kualifikasi Lowongan Kerja (Job Description).');
        return;
      }
      effectiveRole = trimmedPos;
      if (effectiveRole !== targetRole) {
        setTargetRole(effectiveRole);
      }
    } else {
      if (!targetRole && selectedSavedCv?.roleTitle) {
        setTargetRole(selectedSavedCv.roleTitle);
      }
    }

    setIsProcessing(true);
    setPipelineStep(0);
    setHasRunPipeline(false);
    setActivePhase('report');

    // Helper jeda visual per tahap proses audit lokal
    const waitTick = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
    let currentMatchResult: any = null;

    try {
      // Jika mode target lowongan spesifik, analisis kecocokan kualifikasi langsung terhadap Job Description
      if (targetBasis === 'job') {
        try {
          const matchRes = await fetch('/api/cv/match', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cvId: selectedCvId,
              cvData: selectedSavedCv,
              position: effectiveRole,
              company: jobCompany.trim() || 'Perusahaan Target',
              jobDescription: jobDescription.trim(),
            }),
          });
          if (matchRes.ok) {
            const matchJson = await matchRes.json();
            if (matchJson.success && matchJson.data) {
              currentMatchResult = matchJson.data;
              setJobMatchResult(matchJson.data);

              if (Array.isArray(matchJson.data.matchedKeywords) || Array.isArray(matchJson.data.missingKeywords)) {
                const matchedItems = (matchJson.data.matchedKeywords || []).map((kw: string, idx: number) => ({
                  id: `jd-match-${idx}`,
                  keyword: kw,
                  category: 'Kualifikasi Lowongan Target',
                  foundInCv: true,
                  visibilityScore: 88,
                  atsScore: 92,
                  quadrant: 'gold' as const,
                  recommendation: `Kata kunci '${kw}' terdeteksi kuat di CV dan selaras dengan lowongan ${jobCompany || 'target'}.`,
                }));

                const missingItems = (matchJson.data.missingKeywords || []).map((kw: string, idx: number) => ({
                  id: `jd-miss-${idx}`,
                  keyword: kw,
                  category: 'Kualifikasi Lowongan Target',
                  foundInCv: false,
                  visibilityScore: 30,
                  atsScore: 35,
                  quadrant: 'hidden_high_ats' as const,
                  recommendation: `Cantumkan kata kunci '${kw}' di CV untuk meningkatkan kecocokan ATS terhadap lowongan ini.`,
                }));

                finalReport.atsCorrelations = [...matchedItems, ...missingItems, ...baseline.atsCorrelations.slice(0, 4)];
              }

              if (matchJson.data.actionableBullet) {
                finalReport.beforeAfterFixes = [
                  {
                    id: 'fix-jd-bullet',
                    section: 'Deskripsi Pengalaman Kerja (Format Terukur)',
                    before: 'Bertanggung jawab atas tugas harian dan operasional kerja.',
                    after: matchJson.data.actionableBullet,
                    impactBonus: 8,
                  },
                  ...finalReport.beforeAfterFixes,
                ];
              }

              if (Array.isArray(matchJson.data.improvements) && matchJson.data.improvements.length > 0) {
                finalReport.highPriorityRecommendations = [
                  ...matchJson.data.improvements,
                  ...finalReport.highPriorityRecommendations,
                ].slice(0, 5);
              }
            }
          }
        } catch (matchErr) {
          console.warn('[handleStartRvePipeline] Gagal evaluasi /api/cv/match:', matchErr);
        }
      }

      // Eksekusi tahap demi tahap secara proporsional sesuai modul yang aktif
      for (let i = 0; i < activePipelineSteps.length; i++) {
        const step = activePipelineSteps[i];
        setPipelineStep(i);

        if (step.id === 'vision') {
          // Evaluasi Recruiter Vision & Eye Tracking Heatmap
          await waitTick(650);
        } else if (step.id === 'ats') {
          // Evaluasi pengujian kata kunci & format dokumen mesin ATS
          await waitTick(650);
        } else if (step.id === 'aiScreener') {
          // Simulasi scoring konsensus evaluasi multi-screener
          await waitTick(650);
        } else if (step.id === 'forecast') {
          // Tahap evaluasi model AI nyata: Memanggil API /api/ai
          try {
            const aiPrompt = generateCvScreenerAiPrompt(
              baseline.parsedData,
              effectiveRole,
              targetLevel,
              currentPersona,
              appliedFixes,
              activePurpose
            );

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
          } catch (fetchErr) {
            console.warn('[handleStartRvePipeline] Fallback ke dynamic heuristic forecast:', fetchErr);
            setAiReportData(baseline);
            finalReport = baseline;
          }
        } else if (step.id === 'improvement') {
          // Tahap sintesis rekomendasi optimasi & finalisasi
          setAiReportData(finalReport);
          await waitTick(600);
        }
      }

      // Tandai seluruh langkah telah terverifikasi selesai (100%)
      setPipelineStep(activePipelineSteps.length);
      await waitTick(850);
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
          targetBasis,
          jobPosition: effectiveRole,
          jobCompany,
          jobDescription,
          jobMatchResult: currentMatchResult || jobMatchResult,
          timestamp: Date.now(),
        };
        localStorage.setItem('employr_active_screener_report', JSON.stringify(activeReportPayload));
      } catch (err) {
        console.warn('Gagal menyimpan active report ke localStorage:', err);
      }

      // Auto Save to Report History
      const shortToken = Date.now().toString(36).slice(-4);
      const effectiveCandidateName =
        cvSourceMode === 'saved'
          ? (selectedSavedCv?.candidateName || 'Kandidat')
          : (uploadedFile?.name || 'CV Upload');

      const newHistItem: SavedReportHistoryItem = {
        id: `scr-${shortToken}`,
        candidateName: effectiveCandidateName,
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
        targetBasis,
        jobCompany,
        jobPosition: effectiveRole,
        jobDescription,
        jobMatchResult: currentMatchResult || jobMatchResult,
      };

      // Baca riwayat saat ini dari localStorage agar selalu sinkron dan tidak hilang
      let currentHist: SavedReportHistoryItem[] = [];
      try {
        const session = userSession || getStoredSession();
        const userHistoryKey = session
          ? `employr_screener_history_${session.email || session.id || 'default'}`
          : 'employr_screener_history';
        const raw = localStorage.getItem(userHistoryKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) currentHist = parsed;
        }
      } catch {}

      const updatedHistory = [newHistItem, ...currentHist.filter((h) => h.id !== newHistItem.id)];
      persistReportHistory(updatedHistory);

      // Direct navigation to semantic /cv-screener/report/[role]/[name] with session query param
      setActiveSessionId(newHistItem.id);
      const { reportPath } = buildCvScreenerSlug(effectiveRole, effectiveCandidateName, shortToken);
      const targetUrl = `${reportPath}?session=${encodeURIComponent(newHistItem.id)}`;
      router.push(targetUrl);
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', targetUrl);
      }
    }
  };

  const handleLoadHistoryReport = (hist: SavedReportHistoryItem) => {
    setIsProcessing(false);
    setActiveSessionId(hist.id);
    setCvSourceMode(hist.cvSourceMode);
    if (hist.selectedCvId) setSelectedCvId(hist.selectedCvId);
    setSelectedPersonaId(hist.selectedPersonaId);
    setTargetRole(hist.targetRole);
    if (hist.targetLevel) setTargetLevel(hist.targetLevel);
    if (hist.activePurpose) setActivePurpose(hist.activePurpose);
    setAppliedFixes(hist.appliedFixes || []);

    const effectiveCv =
      hist.selectedSavedCv ||
      savedCvs.find((c) => c.id === hist.selectedCvId) ||
      savedCvs[0];

    const effectiveReport =
      hist.rveReport ||
      runFullRvePipeline(
        hist.cvSourceMode || 'saved',
        effectiveCv,
        null,
        '',
        hist.targetRole || effectiveCv?.roleTitle || 'Professional',
        hist.appliedFixes || [],
        null,
        hist.activePurpose || 'fresh_graduate'
      );

    setAiReportData(effectiveReport);
    if (effectiveCv) {
      setSavedCvs((prev) => [effectiveCv, ...prev.filter((c) => c.id !== effectiveCv.id)]);
    }
    setHasRunPipeline(true);
    setActivePhase('report');

    try {
      const activePayload = {
        id: hist.id,
        rveReport: effectiveReport,
        selectedPersonaId: hist.selectedPersonaId,
        activePurpose: hist.activePurpose || 'fresh_graduate',
        targetRole: hist.targetRole,
        targetLevel: hist.targetLevel || 'Entry',
        cvSourceMode: hist.cvSourceMode,
        selectedCvId: hist.selectedCvId,
        appliedFixes: hist.appliedFixes || [],
        selectedSavedCv: effectiveCv,
        targetBasis: hist.targetBasis,
        jobPosition: hist.jobPosition,
        jobCompany: hist.jobCompany,
        jobDescription: hist.jobDescription,
        jobMatchResult: hist.jobMatchResult,
        timestamp: Date.now(),
      };
      localStorage.setItem('employr_active_screener_report', JSON.stringify(activePayload));
    } catch {}

    // Perbarui riwayat di state & localStorage jika rveReport belum ada sebelumnya
    if (!hist.rveReport && effectiveReport) {
      const updatedHist = reportHistory.map((h) =>
        h.id === hist.id ? { ...h, rveReport: effectiveReport } : h
      );
      persistReportHistory(updatedHist);
    }

    const currentKey = `${roleSlug || ''}:${nameSlug || ''}:${hist.id}`;
    hasHydratedReportRef.current = currentKey;

    const { reportPath } = buildCvScreenerSlug(hist.targetRole, hist.candidateName, hist.id);
    const targetUrl = `${reportPath}?session=${encodeURIComponent(hist.id)}`;
    router.push(targetUrl);
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', targetUrl);
    }

    toast.info(
      'Sesi Evaluasi Dimuat',
      `Menampilkan hasil evaluasi sesi ${hist.timestamp || ''} (Skor: ${hist.consensusScore ?? effectiveReport.consensusScore}% ATS).`
    );
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

    const shortToken = Date.now().toString(36).slice(-4);
    const newHistItem: SavedReportHistoryItem = {
      id: `scr-${shortToken}`,
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
      const raw = localStorage.getItem(userHistoryKey);
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

    setActiveSessionId(newHistItem.id);
    const { reportPath } = buildCvScreenerSlug(effectiveRole, cv.candidateName, shortToken);
    const targetUrl = `${reportPath}?session=${encodeURIComponent(newHistItem.id)}`;
    router.push(targetUrl);
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', targetUrl);
    }
  };

  const handleDeleteHistory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const targetItem = reportHistory.find((item) => item.id === id);
    const itemLabel = targetItem
      ? `sesi "${targetItem.candidateName || 'Kandidat'} - ${targetItem.targetRole || 'Posisi'}"`
      : 'sesi screening ini';

    const isConfirmed = await confirm({
      type: 'danger',
      title: 'Hapus Riwayat Screening?',
      description: `Riwayat ${itemLabel} akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Hapus Riwayat',
      cancelText: 'Batal',
      confirmVariant: 'danger',
    });
    if (!isConfirmed) return;

    const updated = reportHistory.filter((item) => item.id !== id);
    persistReportHistory(updated);
    toast.success('Riwayat Dihapus', 'Riwayat evaluasi CV berhasil dihapus.');
  };

  const handleClearAllHistory = async () => {
    const isConfirmed = await confirm({
      type: 'danger',
      title: 'Hapus Semua Riwayat?',
      description: `Seluruh (${reportHistory.length}) riwayat screening CV akan dihapus secara permanen dari akun kamu. Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Hapus Semua',
      cancelText: 'Batal',
      confirmVariant: 'danger',
    });
    if (!isConfirmed) return;

    persistReportHistory([]);
    toast.success('Semua Riwayat Dibersihkan', 'Seluruh riwayat evaluasi CV telah dihapus.');
  };

  // 10. Satu Tombol Besar: Optimalkan CV Saya (Auto Apply All Fixes & Opsi Backup/Timpa)
  const handleOpenOptimizeDrawer = () => {
    setIsOptimizeDrawerOpen(true);
  };

  const handleExecuteOptimizeCv = async (mode: 'duplicate' | 'overwrite') => {
    setIsAutoOptimizing(true);
    const fixes = ['fix-1', 'fix-2', 'fix-3'];
    setAppliedFixes(fixes);

    const effectiveRole = targetRole || selectedSavedCv?.roleTitle || 'Professional';

    // Base CV Data: gunakan selectedSavedCv atau bentuk dari parsedData jika dari upload
    const currentCv = selectedSavedCv || {
      id: 'cv-' + Date.now(),
      title: uploadedFile?.name ? uploadedFile.name.replace(/\.[^/.]+$/, '') : 'CV ATS Saya',
      candidateName: rveReport?.parsedData?.candidateName || 'Kandidat Pelamar',
      fullName: rveReport?.parsedData?.candidateName || 'Kandidat Pelamar',
      roleTitle: effectiveRole,
      summary: rveReport?.parsedData?.summary || '',
      experience: rveReport?.parsedData?.experience || [],
      education: rveReport?.parsedData?.education || [],
      skills: rveReport?.parsedData?.skills || [],
    };

    try {
      // 1. Ekstrak & siapkan pengalaman kerja teroptimasi (metrik & kata kerja aksi)
      const updatedExp = Array.isArray(currentCv.experience) ? [...currentCv.experience] : [];
      const firstFix = rveReport?.beforeAfterFixes?.find((f) => f.id === 'fix-1');
      if (firstFix && updatedExp.length > 0 && updatedExp[0]) {
        const achs = Array.isArray(updatedExp[0].achievements) ? [...updatedExp[0].achievements] : [];
        achs[0] = firstFix.after;
        updatedExp[0] = { ...updatedExp[0], achievements: achs };
      } else if (firstFix && updatedExp.length === 0) {
        updatedExp.push({
          id: 'exp-1',
          role: effectiveRole,
          company: 'Institusi Terakhir',
          period: '2023 - Sekarang',
          achievements: [firstFix.after],
          metricsCount: 1,
        });
      }

      // 2. Siapkan summary eksekutif yang diselaraskan
      const secondFix = rveReport?.beforeAfterFixes?.find((f) => f.id === 'fix-2');
      const updatedSummary = secondFix ? secondFix.after : (currentCv.summary || '');

      // 3. Tambahkan variasi skills esensial
      const extraSkills = ['Koordinasi Proyek', 'Pelaporan Kegiatan', 'Analisis Data'];
      const updatedSkills = Array.from(new Set([...(currentCv.skills || []), ...extraSkills]));

      let targetCvId = currentCv.id;
      let finalTitle = currentCv.title || currentCv.candidateName || 'CV ATS';

      if (mode === 'duplicate') {
        // MODE A: BUAT SALINAN BARU (BACKUP TERPISAH)
        const newTempId = 'cv_' + Date.now();
        const baseTitle = currentCv.title || currentCv.candidateName || 'CV ATS';
        finalTitle = `${baseTitle} (Teroptimasi)`;

        const newCvPayload = {
          ...currentCv,
          id: newTempId,
          title: finalTitle,
          roleTitle: effectiveRole,
          summary: updatedSummary,
          experience: updatedExp,
          skills: updatedSkills,
          updatedAt: 'Baru saja dioptimalkan',
          createdAt: new Date().toISOString(),
        };

        targetCvId = newTempId;

        // Simpan ke DB via cvApi.create
        try {
          const created = await cvApi.create(newCvPayload);
          if (created && (created as any).id) {
            targetCvId = (created as any).id;
            newCvPayload.id = targetCvId;
          }
        } catch (apiErr) {
          console.warn('[handleExecuteOptimizeCv] cvApi.create fallback:', apiErr);
        }

        // Sinkronkan state
        const normalizedNew = normalizeCvItem(newCvPayload);
        setSavedCvs((prev) => [normalizedNew, ...prev.filter((c) => c.id !== targetCvId)]);
        setSelectedCvId(targetCvId);

        setOptimizedCvResult({
          id: targetCvId,
          title: finalTitle,
          mode: 'duplicate',
          timestamp: 'Baru saja',
        });

        toast.success(`Salinan baru "${finalTitle}" berhasil dibuat dan dioptimalkan!`);
      } else {
        // MODE B: TIMPA LANGSUNG DOKUMEN SAAT INI
        const updatedPayload = {
          ...currentCv,
          summary: updatedSummary,
          experience: updatedExp,
          skills: updatedSkills,
          updatedAt: 'Baru saja dioptimalkan',
        };

        targetCvId = currentCv.id;
        finalTitle = currentCv.title || currentCv.candidateName || 'CV ATS';

        // Simpan ke DB via cvApi.update jika bukan default dummy
        try {
          if (targetCvId && !targetCvId.startsWith('default-')) {
            await cvApi.update(targetCvId, updatedPayload);
          }
        } catch (apiErr) {
          console.warn('[handleExecuteOptimizeCv] cvApi.update fallback:', apiErr);
        }

        // Sinkronkan state
        const normalizedUpdated = normalizeCvItem(updatedPayload);
        setSavedCvs((prev) => prev.map((c) => (c.id === targetCvId ? normalizedUpdated : c)));

        setOptimizedCvResult({
          id: targetCvId,
          title: finalTitle,
          mode: 'overwrite',
          timestamp: 'Baru saja',
        });

        toast.success(`CV "${finalTitle}" berhasil diperbarui dengan hasil optimasi!`);
      }
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
      const aiPrompt = `Kamu adalah Tim Recruiter Konsultan Karier untuk platform Employr.
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
        responseText = `Berdasarkan evaluasi kriteria ${currentPersona.name}, CV kamu berpeluang lolos lebih tinggi bila menambahkan metrik angka (%) pada pengalaman proyek serta menonjolkan keahlian relevan untuk posisi ${effectiveRole}.`;
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

  // Jika mode report sedang dimuat sebelum client-side hydration atau data laporan belum siap, tampilkan skeleton load
  if (mode === 'report' && (!isHydrated || !aiReportData)) {
    return <CvScreenerReportSkeleton />;
  }

  return (
    <div className="space-y-4 sm:space-y-5 w-full font-sans transition-all duration-300">
      {/* PHASE 1: SETUP & HISTORY 3-COLUMN LAYOUT VIEW */}
      {activePhase === 'setup' && (
        <div className="space-y-4 sm:space-y-5 w-full animate-in fade-in duration-300">
          {/* Header Status & Action Bar Standardized 2-Tier Mobile */}
          <div className="relative overflow-hidden px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-[10px] bg-[#162758] border border-[#20367A] text-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-2.5 md:gap-3">
            {/* TIER 1 (Mobile: Header Identitas & 1 Key Status | Desktop: Semua Status) */}
            <div className="flex items-center justify-between md:justify-start gap-2.5 sm:gap-3 w-full md:w-auto relative z-10 min-w-0">
              <div className="flex items-center gap-2 min-w-0 shrink">
                <div className="p-1.5 rounded-[8px] bg-white/10 text-white shrink-0">
                  <Play className="w-4 h-4 fill-white" />
                </div>
                <h1 className="font-extrabold text-xs sm:text-sm text-white tracking-tight truncate">
                  CV Screener
                </h1>
              </div>

              {/* Mobile Single Status Pill */}
              <div className="flex items-center md:hidden shrink-0">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-[8px] bg-white/10 border border-white/15 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-300">Status:</span>
                  <span className="text-[11px] font-black text-emerald-400 leading-none">Siaga</span>
                </div>
              </div>

              <div className="h-4 w-[1px] bg-white/20 hidden md:block shrink-0" />

              {/* Desktop Status Badges */}
              <div className="hidden md:flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-white/10 border border-white/15 shadow-2xs">
                  <span className="text-caption font-bold text-slate-300">Tahap:</span>
                  <span className="text-xs font-black text-white leading-none">Konfigurasi Target</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-white/10 border border-white/15 shadow-2xs">
                  <span className="text-caption font-bold text-slate-300">Status:</span>
                  <span className="text-xs font-black text-emerald-400 leading-none">Siaga</span>
                </div>
              </div>
            </div>

            {/* TIER 2: Actions Bar */}
            <div className="shrink-0 md:ml-auto w-full md:w-auto flex items-center justify-stretch md:justify-end gap-2 relative z-10 pt-1.5 md:pt-0 border-t border-white/10 md:border-t-0 [&>button]:w-full [&>button]:sm:w-auto [&>button]:min-h-[44px] md:[&>button]:min-h-[34px] [&>div]:w-full md:[&>div]:w-auto">
              {hasSavedCvs && (
                <CvScopeSelector
                  cvs={savedCvs}
                  selectedCvId={selectedCvId}
                  onChange={handleCvChange}
                  allowAll={false}
                  label="Dokumen CV"
                />
              )}

              <button
                type="button"
                onClick={() => setIsHistoryDrawerOpen(true)}
                className="min-h-[44px] sm:min-h-[34px] px-3.5 py-2 sm:py-1.5 rounded-[10px] bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white font-bold text-xs border border-white/20 shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                title="Buka Riwayat Screening & Laporan CV"
              >
                <History className="w-3.5 h-3.5 text-orange-400" />
                <span>Riwayat Screening</span>
                {reportHistory.length > 0 && (
                  <span className="px-1.5 py-0.5 text-caption font-extrabold bg-orange-700 text-white rounded-[6px] leading-none">
                    {reportHistory.length}
                  </span>
                )}
              </button>
            </div>
          </div>



          {/* Target Lowongan & Posisi Pekerjaan */}
          <div className="p-4 sm:p-5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <Tabs value={targetBasis} onValueChange={(val) => setTargetBasis(val as 'role' | 'job')} className="w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h2 className="text-xs font-black text-slate-900 dark:text-white">
                    Target lowongan &amp; posisi pekerjaan
                  </h2>
                  <p className="text-caption text-slate-600 dark:text-slate-400 mt-0.5">
                    {targetBasis === 'job'
                      ? 'Uji kecocokan CV langsung terhadap kualifikasi lowongan kerja tertentu.'
                      : 'Evaluasi kesiapan dasar CV terhadap standar kompetensi umum suatu profesi di industri.'}
                  </p>
                </div>

                {/* Segmented Control Mode Evaluasi */}
                <TabsList variant="pill" className="w-full sm:w-auto grid grid-cols-2 sm:flex overflow-x-auto justify-start gap-1 p-1">
                  <TabsTrigger value="job" className="flex items-center justify-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs px-2 sm:px-4">
                    <Briefcase className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden sm:inline">Target Lowongan (Rekomendasi)</span>
                    <span className="sm:hidden truncate">Target Lowongan</span>
                  </TabsTrigger>
                  <TabsTrigger value="role" className="flex items-center justify-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs px-2 sm:px-4">
                    <Target className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden sm:inline">Standar Industri (Tanpa Loker)</span>
                    <span className="sm:hidden truncate">Standar Profesi</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Target Configuration */}
              <div className="space-y-4 pt-1">
                <TabsContent value="job" className="outline-none m-0 focus-visible:outline-none">
                  {/* Mode A (Default): Lowongan Kerja Target (Job Description) */}
                  <div className="space-y-4 p-4 rounded-[10px] bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">

                    {/* Metadata Posisi & Perusahaan */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-extrabold text-slate-900 dark:text-white block mb-1">
                          Posisi Lowongan yang Dilamar *
                        </label>
                        <input
                          type="text"
                          value={jobPosition || targetRole}
                          onChange={(e) => {
                            setJobPosition(e.target.value);
                            setTargetRole(e.target.value);
                          }}
                          placeholder="Staff Administrasi, Kasir, atau Frontend Developer"
                          className="w-full px-3.5 py-2 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cobalt-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-extrabold text-slate-900 dark:text-white block mb-1">
                          Nama Perusahaan Target (Opsional)
                        </label>
                        <input
                          type="text"
                          value={jobCompany}
                          onChange={(e) => setJobCompany(e.target.value)}
                          placeholder="BCA, Indomaret, Shopee, atau nama PT"
                          className="w-full px-3.5 py-2 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cobalt-500"
                        />
                      </div>
                    </div>

                    {/* Area Salin & Tempel External Job Description */}
                    <div>
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                        <label className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>Area Salin &amp; Tempel Deskripsi Lowongan (Job Description) *</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handlePasteFromClipboard}
                            className="min-h-[44px] sm:min-h-0 px-3 py-2 sm:p-0 rounded-[6px] sm:rounded-none bg-cobalt-50 sm:bg-transparent dark:bg-cobalt-950/40 dark:sm:bg-transparent text-caption font-bold text-cobalt-700 dark:text-cobalt-300 hover:text-cobalt-800 dark:hover:text-cobalt-200 hover:underline flex items-center gap-1 cursor-pointer transition"
                          >
                            <span>Tempel dari Clipboard</span>
                          </button>
                          {jobDescription.length > 0 && (
                            <>
                              <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
                              <button
                                type="button"
                                onClick={() => setJobDescription('')}
                                className="min-h-[44px] sm:min-h-0 px-2 sm:p-0 text-caption font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer inline-flex items-center"
                              >
                                Bersihkan
                              </button>
                            </>
                          )}
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span className={`text-caption font-mono ${
                            jobDescription.length >= 50
                              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                              : jobDescription.length > 0
                              ? 'text-amber-700 dark:text-amber-400 font-medium'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}>
                            {jobDescription.length} karakter
                          </span>
                        </div>
                      </div>

                      <textarea
                        ref={jobDescriptionRef}
                        rows={5}
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Tempel syarat, kualifikasi, atau deskripsi tugas lowongan dari info loker di sini..."
                        className="w-full px-3.5 py-3 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cobalt-500 leading-relaxed font-sans resize-none overflow-hidden transition-all"
                      />

                      {jobDescription.length > 0 && jobDescription.length < 50 && (
                        <p className="mt-1.5 text-caption font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Teks kualifikasi masih singkat. Sertakan persyaratan agar analisis kata kunci akurat.</span>
                        </p>
                      )}
                      {jobDescription.length >= 50 && (
                        <p className="mt-1.5 text-caption font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Panjang teks kualifikasi memadai untuk evaluasi komprehensif.</span>
                        </p>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="role" className="outline-none m-0 focus-visible:outline-none">
                  {/* Mode B: Posisi Umum & Tingkat Senioritas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-extrabold text-slate-900 dark:text-white block mb-1">
                        Nama Posisi Pekerjaan Target *
                      </label>
                      <JobTitleSearchSelect
                        value={targetRole}
                        onChange={(val) => setTargetRole(val)}
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
                          className="w-full px-3.5 py-2.5 rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium flex items-center justify-between focus:ring-2 focus:ring-cobalt-500 focus:outline-none transition cursor-pointer shadow-2xs"
                        >
                          <span>
                            {SENIORITY_OPTIONS.find((o) => o.value === targetLevel)?.label || targetLevel}
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                              isSeniorityDropdownOpen ? 'rotate-180 text-orange-700' : ''
                            } dark:text-slate-400`}
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
                                      ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 font-bold'
                                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-cobalt-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                                    <span>{opt.label}</span>
                                  </div>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-orange-700 shrink-0 dark:text-orange-400" />}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>

            {/* Standar Penilaian Perusahaan (Kacamata HRD) */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white truncate">
                    Standar penilaian perusahaan (Kacamata HRD)
                  </h3>
                  <p className="text-caption text-slate-600 dark:text-slate-400 mt-0.5 truncate">
                    Kriteria evaluasi sesuai tipe perusahaan target
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPersonaDrawerOpen(true)}
                  className="px-3 py-1.5 rounded-[8px] bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/70 dark:hover:bg-blue-900/60 text-cobalt-600 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60 text-caption font-bold transition flex items-center gap-1 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>Ganti Tipe</span>
                </button>
              </div>

              {/* Rich Interactive Trigger Card (Ergonomic, Touch-friendly >48px, Zero text-clipping) */}
              <div
                role="button"
                tabIndex={0}
                aria-label={`Standar aktif: ${currentPersona.name}. Klik untuk mengganti kriteria perusahaan target.`}
                onClick={() => setIsPersonaDrawerOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsPersonaDrawerOpen(true);
                  }
                }}
                className="w-full text-left p-3.5 rounded-[10px] bg-slate-50/80 hover:bg-blue-50/40 dark:bg-slate-800/60 dark:hover:bg-blue-950/20 border border-slate-200/90 hover:border-cobalt-500/60 dark:border-slate-700/80 dark:hover:border-blue-700 transition-all cursor-pointer group space-y-2.5 shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-[8px] bg-cobalt-500 text-white shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                      {getPersonaIcon(currentPersona)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black text-slate-900 dark:text-white group-hover:text-cobalt-600 dark:group-hover:text-blue-400 transition">
                          {currentPersona.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-blue-50 dark:bg-blue-950/80 text-cobalt-600 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/60 shrink-0">
                          {currentPersona.badge}
                        </span>
                      </div>
                      <p className="text-caption font-semibold text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        Standar: {currentPersona.strictness}
                      </p>
                    </div>
                  </div>

                  <span className="text-caption font-bold text-cobalt-600 dark:text-blue-400 flex items-center gap-0.5 shrink-0 group-hover:translate-x-0.5 transition-transform">
                    <span>Ubah</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>

                {/* Company Examples & Focus Preview */}
                <div className="pt-2 border-t border-slate-200/70 dark:border-slate-700/70 space-y-1.5 text-caption">
                  <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-300">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="font-medium leading-snug">
                      <strong className="font-bold text-slate-900 dark:text-white">Contoh:</strong>{' '}
                      {currentPersona.companies.join(', ')}
                    </span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 leading-snug">
                    {currentPersona.evalFocus || currentPersona.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {currentPersona.highlights.slice(0, 3).map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-[10px] font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80"
                      >
                        <Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{item}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Action Footer (CTA & Validation Status) */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              {!hasUsableCv ? (
                <div className="p-2.5 rounded-[8px] bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-caption font-semibold text-amber-800 dark:text-amber-300 text-center">
                  *Pilih atau buat profil CV aktif terlebih dahulu di bagian atas
                </div>
              ) : targetBasis === 'job' && !Boolean((jobPosition || targetRole)?.trim()) ? (
                <div className="p-2.5 rounded-[8px] bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-caption font-semibold text-amber-800 dark:text-amber-300 text-center">
                  *Isi posisi lowongan yang dilamar sebelum memulai screening
                </div>
              ) : targetBasis === 'job' && !jobDescription.trim() ? (
                <div className="p-2.5 rounded-[8px] bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-caption font-semibold text-amber-800 dark:text-amber-300 text-center">
                  *Tempel syarat dan kualifikasi lowongan pada area teks di atas
                </div>
              ) : targetBasis === 'role' && !Boolean(targetRole?.trim()) ? (
                <div className="p-2.5 rounded-[8px] bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-caption font-semibold text-amber-800 dark:text-amber-300 text-center">
                  *Pilih profesi industri target sebelum memulai screening
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleStartRvePipeline}
                disabled={isProcessing || !isReadyToScreen}
                className="w-full min-h-[48px] px-6 py-3 rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-cobalt-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Memproses Evaluasi...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Mulai Screening CV Saya</span>
                  </>
                )}
              </button>

              <p className="text-center text-caption text-slate-500 dark:text-slate-400">
                Evaluasi otomatis menguji zona pandang 6 detik HRD, matriks ATS, dan rekomendasi optimasi CV.
              </p>
            </div>
          </div>
  </div>
)}

      {/* PHASE 2: IMMERSIVE FULL-WIDTH REPORT VIEW */}
      {activePhase === 'report' && (
        <div
          key={activeSessionId || 'default-report-session'}
          className="space-y-6 w-full animate-in fade-in zoom-in-[0.99] duration-300"
        >
          {/* Top Bar Navigation for Report View: Standardized Navy Header ([#162758]) */}
          <div className="relative overflow-hidden px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-[10px] bg-[#162758] border border-[#20367A] text-white shadow-xs flex flex-col gap-2.5 md:gap-3 print:border-none print:shadow-none print:p-0">
            {/* Row 1: Back Action, Title, & Right Utility Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 w-full relative z-10">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    if (mode === 'report') {
                      router.push('/cv-screener');
                    } else {
                      setActivePhase('setup');
                    }
                  }}
                  className="min-h-[44px] sm:min-h-[34px] px-3 py-1.5 rounded-[8px] bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white print:hidden"
                  title="Kembali ke konfigurasi kriteria screening"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-white" />
                  <span>Ubah Kriteria</span>
                </button>

                <div className="h-4 w-px bg-white/20 hidden sm:block shrink-0 print:hidden" />

                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1.5 rounded-[8px] bg-white/10 text-white shrink-0 hidden sm:flex">
                    <FileCheck2 className="w-4 h-4 text-white" />
                  </div>
                  <h1 className="text-xs sm:text-sm font-extrabold text-white tracking-tight truncate">
                    Hasil Evaluasi Screening CV
                  </h1>
                </div>
              </div>

              {/* Sisi Kanan: Utilitas Aksi */}
              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap print:hidden [&>button]:min-h-[44px] sm:[&>button]:min-h-[34px] [&>div]:min-h-[44px] sm:[&>div]:min-h-[34px]">
                {hasSavedCvs && (
                  <CvScopeSelector
                    cvs={savedCvs}
                    selectedCvId={selectedCvId}
                    onChange={handleCvChange}
                    allowAll={false}
                    label="Dokumen CV"
                    className="min-h-[44px] sm:min-h-[34px] py-1.5 px-3 rounded-[8px] bg-white/10 hover:bg-white/20 text-white border-white/20 [&_span]:text-slate-200 [&_span.text-slate-900]:text-white [&_svg]:text-white"
                  />
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.print();
                    }
                  }}
                  className="min-h-[44px] sm:min-h-[34px] px-3 py-1.5 rounded-[8px] bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-white/20 shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  title="Cetak atau Simpan PDF Laporan"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-300" />
                  <span>Cetak Laporan</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsHistoryDrawerOpen(true)}
                  className="min-h-[44px] sm:min-h-[34px] px-3 py-1.5 rounded-[8px] bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-white/20 shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  title="Buka Riwayat Screening & Laporan CV"
                >
                  <History className="w-3.5 h-3.5 text-orange-400" />
                  <span>Riwayat Screening</span>
                  {reportHistory.length > 0 && (
                    <span className="px-1.5 py-0.5 text-caption font-extrabold bg-orange-700 text-white rounded-[6px] leading-none">
                      {reportHistory.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Row 2: Metadata Strip Tenang & Terstruktur */}
            <div className="pt-2 border-t border-white/15 flex items-center gap-2 text-xs text-slate-200 flex-wrap relative z-10">
              <span>
                Kandidat:{' '}
                <strong className="text-white font-bold">
                  {selectedSavedCv?.candidateName || (nameSlug ? deslugify(parseCvScreenerSlug(nameSlug).cleanName) : 'Kandidat')}
                </strong>
              </span>
              <span className="text-white/30" aria-hidden="true">•</span>
              <span>
                Posisi:{' '}
                <strong className="font-semibold text-white">
                  {targetRole || selectedSavedCv?.roleTitle || 'Sesuai Profil CV'}
                </strong>
              </span>
              {jobCompany && (
                <>
                  <span className="text-white/30" aria-hidden="true">•</span>
                  <span>
                    Target: <strong className="text-white font-semibold">{jobCompany}</strong>
                  </span>
                </>
              )}
              <span className="text-white/30" aria-hidden="true">•</span>
              <span>
                Standar HRD:{' '}
                <strong className="font-semibold text-white">{currentPersona.name}</strong>
              </span>
              <span className="text-white/30" aria-hidden="true">•</span>
              <span className="text-slate-300">{CV_PURPOSE_PROFILES[activePurpose]?.title || 'Lamar Kerja'}</span>

              {/* Indikator Sesi Evaluasi Aktif */}
              <span className="text-white/30" aria-hidden="true">•</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] bg-white/10 text-slate-200 border border-white/15 font-semibold text-caption">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse motion-reduce:animate-none shrink-0" />
                <span>Sesi: {activeSessionItem?.timestamp || 'Aktif'}</span>
              </span>
            </div>
          </div>

          {/* Processing Indicator: Progress Riil & Desain Antislop */}
          {isProcessing && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-6 sm:p-8 space-y-6 shadow-sm">
              {/* Header Icon & Status with Diagnosis-Style Thinking Animation */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-32 h-32 mx-auto flex items-center justify-center">
                  {pipelineStep >= activePipelineSteps.length ? (
                    <DotLottiePlayer
                      src="/animations/profile-ready.json"
                      autoplay={true}
                      loop={false}
                      className="w-32 h-32 mx-auto"
                      fallback={
                        <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 shadow-xs">
                          <CheckCircle2 className="w-10 h-10" />
                        </div>
                      }
                    />
                  ) : (
                    <Avatar color="blue" size="xl" blinking={true} />
                  )}
                </div>

                <div className="space-y-2 max-w-md">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/70 text-cobalt-500 dark:text-blue-400 text-caption font-extrabold uppercase tracking-wider border border-blue-200/60">
                    <span className="w-2 h-2 rounded-full bg-cobalt-500 animate-ping" />
                    <span>
                      {pipelineStep >= activePipelineSteps.length
                        ? 'Evaluasi Selesai'
                        : activePipelineSteps[pipelineStep]?.shortLabel || 'Menganalisis Berkas...'}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {pipelineStep >= activePipelineSteps.length
                      ? 'Evaluasi Berhasil Diselesaikan'
                      : 'Evaluasi CV Sedang Berjalan...'}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 min-h-[1.5rem] flex items-center justify-center leading-relaxed">
                    {pipelineStep >= activePipelineSteps.length
                      ? 'Semua evaluasi selesai! Menyiapkan laporan lengkap...'
                      : activePipelineSteps[pipelineStep]?.detailDescription ||
                        activePipelineSteps[pipelineStep]?.title ||
                        'Menyelesaikan evaluasi...'}
                  </p>
                </div>
              </div>

              {/* Real Progress Bar with Stepped Gradient Animation */}
              <div className="max-w-md mx-auto space-y-1.5">
                <div className="flex justify-between items-center text-caption font-bold">
                  <span className="text-slate-500 dark:text-slate-400">
                    {pipelineStep >= activePipelineSteps.length
                      ? 'Status: Lengkap (100%)'
                      : `Tahap ${pipelineStep + 1} dari ${activePipelineSteps.length}`}
                  </span>
                  <span className="text-cobalt-500 dark:text-blue-400 font-extrabold">
                    {Math.min(100, Math.round((pipelineStep / activePipelineSteps.length) * 100))}%
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/80 dark:border-slate-700/80">
                  <div
                    className="h-full bg-gradient-to-r from-[#1738D1] via-blue-500 to-[#F97316] rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.min(100, Math.round((pipelineStep / activePipelineSteps.length) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              {/* Steps Checklist */}
              <div className="space-y-2 max-w-md mx-auto">
                {activePipelineSteps.map((stepItem, idx) => {
                  const isDone = idx < pipelineStep;
                  const isCurrent = idx === pipelineStep && pipelineStep < activePipelineSteps.length;

                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-2.5 rounded-[10px] border transition-all text-xs ${
                        isCurrent
                          ? 'bg-blue-50/70 dark:bg-blue-950/30 border-cobalt-200 dark:border-blue-800/60 shadow-2xs'
                          : isDone
                          ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800'
                          : 'bg-white/40 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/60 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 dark:text-emerald-400" />
                        ) : isCurrent ? (
                          <RefreshCw className="w-4 h-4 text-cobalt-600 animate-spin shrink-0 dark:text-blue-400" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-700 shrink-0" />
                        )}
                        <p
                          className={`truncate text-left ${
                            isCurrent
                              ? 'font-bold text-slate-900 dark:text-white'
                              : isDone
                              ? 'font-semibold text-slate-700 dark:text-slate-300'
                              : 'font-normal text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          <span className="font-extrabold text-slate-400 dark:text-slate-500 mr-1.5">
                            {stepItem.stepNum}.
                          </span>
                          {stepItem.title}
                        </p>
                      </div>

                      <div className="shrink-0">
                        {isDone ? (
                          <span className="px-2 py-0.5 rounded-[6px] text-caption font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                            Selesai
                          </span>
                        ) : isCurrent ? (
                          <span className="px-2 py-0.5 rounded-[6px] text-caption font-bold bg-blue-100 dark:bg-blue-950 text-cobalt-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 flex items-center gap-1">
                            Sedang Diperiksa
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-[6px] text-caption font-medium text-slate-400 dark:text-slate-500">
                            Menunggu
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Master Full-Width Report Content */}
          {!isProcessing && hasRunPipeline && (
            <div className="space-y-6 w-full">
              {/* Top AI Summary Banner */}
              <div className="p-6 rounded-[10px] bg-cobalt-500 text-white shadow-md space-y-3 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

                <div className="flex items-center justify-between border-b border-white/20 pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 fill-white text-white" />
                    <h3 className="font-bold text-xs">Ringkasan evaluasi sistem</h3>
                  </div>
                  <span className="text-caption font-black bg-white/20 px-2 py-0.5 rounded-[10px] border border-white/20">
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
                  <span className="text-caption font-bold text-amber-200 block">Poin Penyebab Peluang Belum 100%:</span>
                  <ul className="space-y-1">
                    {rveReport.topAiSummary.dropReasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-slate-100 text-caption">
                        <span className="text-amber-300 font-bold">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-caption font-bold text-slate-600 dark:text-slate-400">
                        Skor komprehensif berdasarkan tujuan
                      </span>
                      <span className="px-2.5 py-0.5 rounded-[10px] text-caption font-extrabold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {CV_PURPOSE_PROFILES[activePurpose]?.title || 'Lamar Kerja'}
                      </span>
                      <span className="px-2 py-0.5 rounded-[10px] text-caption font-bold bg-navy-50 dark:bg-navy-950 text-navy-700 dark:text-navy-300 border border-navy-200 dark:border-navy-800">
                        {CV_PURPOSE_PROFILES[activePurpose]?.badge}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">CV Score</span>
                      <span className="text-4xl font-black text-orange-700 dark:text-orange-400">
                        {rveReport.purposeScore?.overallScore ?? rveReport.consensusScore}
                        <span className="text-base font-bold text-slate-500 dark:text-slate-400">/100</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-xl pt-0.5">
                      {rveReport.purposeScore?.summaryFeedback || rveReport.topAiSummary.overview}
                    </p>
                  </div>

                  {/* Verdict Status Indicator */}
                  <div className="flex flex-col items-start sm:items-end gap-2 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-[10px] border border-slate-200/80 dark:border-slate-700/80 shrink-0">
                    {rveReport.verdictStatus === 'interview' && (
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-extrabold text-sm">
                        <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-xs" />
                        <span>Interview Recommended</span>
                      </div>
                    )}
                    {rveReport.verdictStatus === 'maybe' && (
                      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-extrabold text-sm">
                        <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-xs" />
                        <span>Dipertimbangkan (Maybe)</span>
                      </div>
                    )}
                    {rveReport.verdictStatus === 'reject' && (
                      <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-extrabold text-sm">
                        <span className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-xs" />
                        <span>Perlu Perbaikan (Reject)</span>
                      </div>
                    )}
                    <span className="text-caption font-semibold text-slate-700 dark:text-slate-300 block">
                      Tingkat Kepercayaan Analisis: {rveReport.confidenceScore}%
                    </span>
                  </div>
                </div>

                {/* 5 PILAR DIMENSI DIAGNOSTIK BENTO GRID */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-orange-700 dark:text-orange-400" />
                      5 Dimensi diagnostik kualitas CV
                    </h4>
                    <span className="text-caption font-extrabold text-slate-500 dark:text-slate-400">
                      Standar Multidimensi
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {/* Dimensi 1: Completeness */}
                    <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-caption font-extrabold text-slate-700 dark:text-slate-300">
                            Completeness
                          </span>
                          <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">
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
                      <p className="text-caption text-slate-500 dark:text-slate-400 leading-tight">
                        {rveReport.purposeScore?.dimensions.completeness.missingItems.length === 0
                          ? 'Seksi wajib lengkap terisi.'
                          : `Perlu: ${rveReport.purposeScore?.dimensions.completeness.missingItems.slice(0, 1).join(', ')}`}
                      </p>
                    </div>

                    {/* Dimensi 2: ATS Compatibility */}
                    <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-caption font-extrabold text-slate-700 dark:text-slate-300">
                            ATS Compatibility
                          </span>
                          <span className="text-xs font-black text-cobalt-500 dark:text-blue-400">
                            {rveReport.purposeScore?.dimensions.atsCompatibility.score ?? 95}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-cobalt-500 transition-all duration-500"
                            style={{ width: `${rveReport.purposeScore?.dimensions.atsCompatibility.score ?? 95}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-caption text-slate-500 dark:text-slate-400 leading-tight">
                        Format dan hierarki heading terbaca sempurna oleh sistem parser ATS.
                      </p>
                    </div>

                    {/* Dimensi 3: Content Quality */}
                    <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-caption font-extrabold text-slate-700 dark:text-slate-300">
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
                      <p className="text-caption text-slate-500 dark:text-slate-400 leading-tight">
                        {rveReport.purposeScore?.dimensions.contentQuality.actionVerbsCount ?? 3} Action Verbs terdeteksi.
                      </p>
                    </div>

                    {/* Dimensi 4: Job / Target Relevance */}
                    <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-caption font-extrabold text-slate-700 dark:text-slate-300">
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
                      <p className="text-caption text-slate-500 dark:text-slate-400 leading-tight">
                        {rveReport.purposeScore?.dimensions.jobRelevance.matchedKeywords.length ?? 4} Kata kunci cocok dengan lowongan target.
                      </p>
                    </div>

                    {/* Dimensi 5: Achievement Strength */}
                    <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-caption font-extrabold text-slate-700 dark:text-slate-300">
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
                      <p className="text-caption text-slate-500 dark:text-slate-400 leading-tight">
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
                        <SlidersHorizontal className="w-3.5 h-3.5 text-orange-700 dark:text-orange-400" />
                        Rincian Matriks Bobot Scoring ({CV_PURPOSE_PROFILES[activePurpose]?.title})
                      </span>
                      <span className="text-caption font-black text-cobalt-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded-[8px] border border-blue-200 dark:border-blue-800">
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
                            <span className="text-caption font-bold text-slate-800 dark:text-slate-200 truncate">
                              {item.label}
                            </span>
                            <span className="text-caption font-extrabold text-orange-700 shrink-0 dark:text-orange-400">
                              {item.weight}% Bobot
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-caption text-slate-500 dark:text-slate-400">
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
                      <span className="text-caption font-bold text-slate-500 block uppercase dark:text-slate-400">Sebelum Optimasi</span>
                      <span className="text-base font-bold text-slate-500 line-through">
                        ATS {rveReport.beforeAfterComparison.beforeScore}%
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 shrink-0 dark:text-slate-400" />
                    <div>
                      <span className="text-caption font-extrabold text-emerald-700 dark:text-emerald-400 block uppercase">
                        Setelah Optimasi
                      </span>
                      <span className="text-base font-black text-emerald-700 dark:text-emerald-400">
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
                      <Gauge className="w-4 h-4 text-orange-700 dark:text-orange-400" />
                      Progress Kesiapan CV
                    </span>
                    <span className="text-orange-700 font-extrabold dark:text-orange-400">{rveReport.gamification.progress}% / 100%</span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                      style={{ width: `${rveReport.gamification.progress}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 text-caption pt-1">
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
                          <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                        )}
                        <span>{item.label}</span>
                        <span className="font-bold text-caption opacity-80">(+{item.bonus}%)</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actionable Improvement Section High Priority Right After Verdict */}
                <div className="p-5 rounded-[10px] bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-900/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-orange-700 dark:text-orange-400" />
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                        Rekomendasi perbaikan prioritas tinggi
                      </h4>
                    </div>
                    <span className="text-caption font-bold text-orange-700 dark:text-orange-400">
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
                        <span className="font-bold text-orange-700 dark:text-orange-400">{idx + 1}.</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Banner Akses Cepat Jika Sudah Pernah Dioptimalkan */}
                  {optimizedCvResult && (
                    <div className="p-3.5 rounded-[10px] bg-emerald-700/15 border border-emerald-400/30 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>CV Berhasil Dioptimalkan</span>
                            <span className="text-caption font-normal text-emerald-200">
                              ({optimizedCvResult.title})
                            </span>
                          </div>
                          <p className="text-caption text-emerald-100">
                            Revisi kalimat dan kata kunci ATS telah tersimpan ke akun kamu.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => router.push(`/cv/${optimizedCvResult.id}`)}
                        className="px-3.5 py-1.5 rounded-[8px] bg-white text-cobalt-500 hover:bg-slate-100 font-extrabold text-xs transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer shrink-0 print:hidden"
                      >
                        <FileText className="w-3.5 h-3.5 text-cobalt-500" />
                        <span>Buka CV di Editor</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Satu Tombol Besar: Optimalkan CV Saya */}
                  <button
                    type="button"
                    onClick={handleOpenOptimizeDrawer}
                    disabled={isAutoOptimizing}
                    className="w-full py-4 rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 active:scale-[0.99] text-white font-black text-sm shadow-md shadow-cobalt-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5 mt-2 print:hidden"
                  >
                    {isAutoOptimizing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Sedang Memproses Optimasi CV...</span>
                      </>
                    ) : (
                      <>
                        <SlidersHorizontal className="w-4 h-4" />
                        <span>
                          {optimizedCvResult
                            ? 'Optimalkan Ulang / Buat Versi Lain'
                            : 'Optimalkan CV Saya (Satu Klik Perbaiki Semua)'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Timeline Stepper Navigation Bar: Responsive Wrap (Anti-Slop R-03 & Microsoft UX Standard) */}
              <div className="sticky -top-2.5 sm:-top-5 z-30 -mt-2 sm:-mt-3 bg-white dark:bg-slate-900 p-2 sm:p-3 rounded-[10px] border border-slate-200 dark:border-slate-800 shadow-md transition-all print:hidden">
                <nav
                  aria-label="Navigasi Tahap Evaluasi CV"
                  className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-caption font-bold w-full"
                >
                  {MODULE_CONFIGS.filter((mod) => selectedModules[mod.id]).map((mod) => {
                    const stepNum = activeStepMap[mod.id];
                    const ModIcon = mod.icon;
                    return (
                      <a
                        key={mod.id}
                        href={`#${mod.anchorId}`}
                        title={`Tahap ${stepNum}: ${mod.label}`}
                        className="px-2.5 sm:px-3 py-1.5 min-h-[36px] sm:min-h-[32px] rounded-[8px] bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950/60 text-slate-700 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 transition flex items-center gap-1.5 border border-slate-200/80 dark:border-slate-700/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                      >
                        <ModIcon className={`w-3.5 h-3.5 shrink-0 ${mod.color}`} />
                        <span>Tahap {stepNum}: {mod.shortLabel}</span>
                      </a>
                    );
                  })}
                </nav>
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
                      <span className="px-2.5 py-0.5 rounded-[10px] text-caption font-extrabold uppercase bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 inline-flex items-center gap-1">
                        <Eye className="w-3 h-3 text-rose-700 dark:text-rose-400" />
                        <span>Tahap {activeStepMap.vision} • Standar Keterbacaan HRD</span>
                      </span>
                      <h3 className="font-black text-xl text-slate-900 dark:text-white">
                        Recruiter Vision (Simulasi Pandangan HRD 6 Detik)
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Memprediksi lintasan mata recruiter saat pertama kali memindai kertas CV A4 kamu.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowHeatmapOverlay(!showHeatmapOverlay)}
                      className={`px-4 py-2 rounded-[10px] font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                        showHeatmapOverlay
                          ? 'bg-cobalt-500 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                      <span>{showHeatmapOverlay ? 'Heatmap Overlay ON' : 'Heatmap Overlay OFF'}</span>
                    </button>
                  </div>

                  {/* BENTO HUD: 12-Column Unified Telemetry & Control Center */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 w-full">
                    {/* Card 1: Eye-Tracking Telemetry (lg:col-span-4) */}
                    <div className="lg:col-span-4 p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-700/70 pb-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                          <Eye className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                          <span>Telemetri Scan 6 Detik</span>
                        </div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          Hal {visionActivePage}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                            <Clock className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                            Durasi scan HRD
                          </span>
                          <span className="font-black text-slate-900 dark:text-white">
                            {scanDuration} Detik
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            Kesesuaian Pola-F
                          </span>
                          <span className="font-black text-emerald-700 dark:text-emerald-400">
                            {rveReport.fPatternScore}% Sesuai
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                            <Flame className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                            Hotspot tatapan
                          </span>
                          <span className="font-black text-rose-700 dark:text-rose-400 max-w-[130px] sm:max-w-[150px] truncate text-right" title={primaryHotspotText}>
                            {primaryHotspotText}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/70 dark:border-slate-700/70 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between font-medium">
                        <span>Durasi emas keputusan</span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">Optimal</span>
                      </div>
                    </div>

                    {/* Card 2: Layout & Archetype Intelligence (lg:col-span-5) */}
                    <div className="lg:col-span-5 p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-700/70 pb-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                          <Layout className="w-3.5 h-3.5 text-cobalt-500 shrink-0" />
                          <span>Arketipe Tata Letak & Alur</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-black uppercase tracking-wider bg-cobalt-100 dark:bg-cobalt-950/80 text-cobalt-700 dark:text-cobalt-300 border border-cobalt-200 dark:border-cobalt-800">
                          {visionArchetypeInfo.badge}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            {visionActiveTemplateOption?.name || 'Template Terpilih'}
                          </span>
                          <span className="px-1.5 py-0.2 rounded-[4px] text-[10px] font-bold bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {visionArchetypeInfo.patternName}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                          {visionArchetypeInfo.insight}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between text-[11px]">
                        {isVisionUsingCustomTemplate ? (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Presisi 1:1 Template User</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 font-medium text-[11px]">Standar Rekayasa ATS</span>
                        )}
                        <span className="text-slate-400 text-[10px] font-mono">Calibrated</span>
                      </div>
                    </div>

                    {/* Card 3: Layer Switcher & Spectrum Legend (lg:col-span-3) */}
                    <div className="lg:col-span-3 p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-700/70 pb-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                          <Layers className="w-3.5 h-3.5 text-navy-600 dark:text-navy-400 shrink-0" />
                          <span>Layer Tampilan</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mode Aktif</span>
                      </div>

                      {/* 4 Mode Grid */}
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { id: 'heatmap', label: 'Heatmap' },
                          { id: 'f-pattern', label: 'Pola-F' },
                          { id: 'bbox', label: 'Visual Box' },
                          { id: 'ats-matrix', label: 'Matriks ATS' },
                        ].map((mode) => (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => setHeatmapViewMode(mode.id as any)}
                            className={`px-2 py-1.5 rounded-[8px] text-[11px] font-bold transition flex items-center justify-center text-center cursor-pointer ${
                              heatmapViewMode === mode.id
                                ? 'bg-navy-700 text-white shadow-xs'
                                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80'
                            }`}
                          >
                            {mode.label}
                          </button>
                        ))}
                      </div>

                      {/* Spectrum dot legend */}
                      <div className="pt-2 border-t border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between text-[10px] font-medium text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-rose-500 shadow-2xs" />
                          <span>0–3s Fokus</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-amber-500 shadow-2xs" />
                          <span>3–6s Pindai</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full border border-slate-400 bg-white dark:bg-slate-800" />
                          <span>Dilewati</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Embedded Real A4 Heatmap Canvas inside Studio Workbench */}
                  <div className="pt-1 w-full">
                    <A4HeatmapCanvas
                      parsedData={rveReport.parsedData}
                      boundingBoxes={rveReport.boundingBoxes}
                      fixationPoints={rveReport.fixationPoints}
                      atsCorrelations={rveReport.atsCorrelations}
                      viewMode={heatmapViewMode}
                      showOverlay={showHeatmapOverlay}
                      targetLevel={targetLevel}
                      selectedSavedCv={selectedSavedCv}
                      cvSourceMode={cvSourceMode}
                      onCondenseToOnePage={() => setIsOptimizeDrawerOpen(true)}
                      activePage={visionActivePage}
                      onPageChange={setVisionActivePage}
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
                      <span className="px-2.5 py-0.5 rounded-[10px] text-caption font-extrabold uppercase bg-blue-50 dark:bg-blue-950/60 text-navy-700 dark:text-blue-300 border border-blue-200 dark:border-navy-900/60 inline-flex items-center gap-1">
                        <BarChart3 className="w-3 h-3 text-blue-600" />
                        <span>Tahap {activeStepMap.ats} • Format &amp; Kata Kunci ATS</span>
                      </span>
                      <h3 className="font-black text-xl text-slate-900 dark:text-white">
                        Standar Kata Kunci Kompetensi: {effectiveRole}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Diambil dari data posisi yang dilamar pada profil CV kamu. Menampilkan keahlian standar yang umum dicari rekruter untuk posisi ini.
                      </p>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-3xl font-black text-navy-700 dark:text-navy-300">{rveReport.atsScore}%</span>
                      <span className="text-caption text-slate-500 block font-semibold dark:text-slate-400">Skor Standar ATS</span>
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
                              className={`px-2 py-0.5 rounded-[10px] text-caption font-extrabold uppercase flex items-center gap-1 ${
                                isFound
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              }`}
                            >
                              {isFound ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                                  <span>Sudah di CV</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                                  <span>Disarankan</span>
                                </>
                              )}
                            </span>
                          </div>
                          <span className="text-caption font-bold uppercase text-slate-500 block dark:text-slate-400">
                            {item.category || 'Kompetensi Industri'}
                          </span>
                          <p className="text-caption text-slate-600 dark:text-slate-300 leading-snug">{item.recommendation}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* MODUL INTEGRASI PENCOCOKAN LOWONGAN KERJA TARGET */}
                  {jobCompany || jobPosition || jobMatchResult ? (
                    <div className="p-5 rounded-[10px] bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 space-y-4 shadow-2xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700/80 pb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-[10px] text-caption font-extrabold uppercase bg-blue-100 dark:bg-blue-900/80 text-cobalt-500 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              Target Lowongan
                            </span>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                              {jobCompany ? `${jobCompany} • ${effectiveRole}` : effectiveRole}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                            Analisis Kesesuaian Kualifikasi Lowongan Kerja
                          </h4>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleSaveToTracker}
                            disabled={isSavingToTracker || isSavedToTracker}
                            className={`px-3.5 py-2 rounded-[10px] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                              isSavedToTracker
                                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-cobalt-500 hover:bg-cobalt-600 text-white active:scale-[0.98]'
                            }`}
                          >
                            {isSavingToTracker ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : isSavedToTracker ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                            ) : (
                              <Briefcase className="w-3.5 h-3.5" />
                            )}
                            <span>{isSavedToTracker ? 'Tersimpan di Tracker' : 'Tambahkan ke Tracker'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                `/mailer?company=${encodeURIComponent(jobCompany || '')}&role=${encodeURIComponent(effectiveRole)}`
                              )
                            }
                            className="px-3.5 py-2 rounded-[10px] bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Buat Cover Letter</span>
                          </button>
                        </div>
                      </div>

                      {jobMatchResult ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            <div className="p-3.5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Kata Kunci Sesuai ({jobMatchResult.matchedKeywords?.length || 0})</span>
                                </span>
                                <span className="text-caption font-bold text-slate-500 dark:text-slate-400">Terdeteksi di CV</span>
                              </div>
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {(jobMatchResult.matchedKeywords || []).map((kw: string, i: number) => (
                                  <span
                                    key={i}
                                    className="px-2.5 py-1 rounded-[10px] text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1"
                                  >
                                    <Check className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                                    <span>{kw}</span>
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="p-3.5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                                  <AlertCircle className="w-4 h-4" />
                                  <span>Kata Kunci Kurang ({jobMatchResult.missingKeywords?.length || 0})</span>
                                </span>
                                <span className="text-caption font-bold text-slate-500 dark:text-slate-400">Disarankan ditambahkan</span>
                              </div>
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {(jobMatchResult.missingKeywords || []).map((kw: string, i: number) => (
                                  <span
                                    key={i}
                                    className="px-2.5 py-1 rounded-[10px] text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1"
                                  >
                                    <Plus className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                                    <span>{kw}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {jobMatchResult.actionableBullet && (
                            <div className="p-3.5 rounded-[10px] bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 space-y-1.5">
                              <span className="text-caption font-bold text-cobalt-700 dark:text-blue-400 block">
                                Rekomendasi revisi pengalaman kerja (Format XYZ Google):
                              </span>
                              <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                                &ldquo;{jobMatchResult.actionableBullet}&rdquo;
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          Hasil evaluasi kata kunci lowongan telah dipetakan langsung ke matriks ATS di atas.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          Ingin menguji kecocokan terhadap lowongan pekerjaan tertentu?
                        </h4>
                        <p className="text-caption text-slate-500 dark:text-slate-400">
                          Kamu bisa beralih ke Mode Target Lowongan Spesifik di konfigurasi awal untuk membedah Job Description riil.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setActivePhase('setup');
                          setTargetBasis('job');
                        }}
                        className="px-3.5 py-2 rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                      >
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>Uji dengan Job Description</span>
                      </button>
                    </div>
                  )}
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
                      <span className="px-2.5 py-0.5 rounded-[10px] text-caption font-extrabold uppercase bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60 inline-flex items-center gap-1">
                        <Users className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                        <span>Tahap {activeStepMap.aiScreener} • Standar Penilaian Recruiter</span>
                      </span>
                      <h3 className="font-black text-xl text-slate-900 dark:text-white">
                        Simulasi Multi-Reviewer Standar Industri
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Memeriksa kesiapan CV kamu dari sudut pandang sistem ATS, keterbacaan HRD, dan ekspektasi Hiring Manager.
                      </p>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-950/80 p-4 rounded-[10px] border border-emerald-200 dark:border-emerald-800 text-center shrink-0">
                      <span className="text-caption font-bold text-slate-500 dark:text-slate-400 block uppercase">Skor Evaluasi Tim</span>
                      <span className="text-3xl font-black text-emerald-700 dark:text-emerald-400">{rveReport.consensusScore}%</span>
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
                        <Cpu className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                      ) : isVisual ? (
                        <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Briefcase className="w-4 h-4 text-amber-700 dark:text-amber-400" />
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
                                <span className="text-caption text-slate-500 dark:text-slate-400 block">
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
                              <div className="flex items-center gap-1.5 text-caption font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-[6px] border border-emerald-200/60 dark:border-emerald-900/40 w-fit">
                                <CheckCircle2 className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
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
                                      <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5 dark:text-emerald-400" />
                                      <span>{enriched}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Cons / Catatan Evaluasi */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-1.5 text-caption font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-[6px] border border-amber-200/60 dark:border-amber-900/40 w-fit">
                                <AlertCircle className="w-3 h-3 text-amber-700 dark:text-amber-400" />
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
                                      <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5 dark:text-amber-400" />
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
                        <span className="px-2.5 py-0.5 rounded-[10px] text-caption font-extrabold uppercase bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-900/60 inline-flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-orange-700 dark:text-orange-400" />
                          <span>Tahap {activeStepMap.forecast} • Prediksi Wawancara</span>
                        </span>
                        <h3 className="font-black text-lg text-slate-900 dark:text-white">
                          Prediksi Pertanyaan Wawancara dari Hotspot CV
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs">
                      {rveReport.predictedInterviewQuestions.map((q: any, idx: number) => {
                        const questionText = typeof q === 'string' ? q : q?.question || '';
                        const intentText = typeof q === 'object' ? q?.intent : null;
                        const answerTip = typeof q === 'object' ? q?.recommendedAnswer : null;
                        return (
                          <div
                            key={idx}
                            className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 flex items-start gap-3 text-slate-800 dark:text-slate-200 hover:border-slate-300 transition-all"
                          >
                            <span className="w-5 h-5 rounded-full bg-cobalt-500 text-white font-bold text-caption flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                              {idx + 1}
                            </span>
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <p className="font-semibold text-slate-900 dark:text-white leading-relaxed">{questionText}</p>
                              {intentText && (
                                <p className="text-caption text-slate-600 dark:text-slate-300 leading-normal">
                                  <span className="font-bold text-slate-700 dark:text-slate-200">Fokus HR:</span> {intentText}
                                </p>
                              )}
                              {answerTip && (
                                <p className="text-caption text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 p-2 rounded-[8px] border border-emerald-200/70 dark:border-emerald-800/60 leading-normal">
                                  <span className="font-bold">Saran Jawaban:</span> {answerTip}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right: Tanya Recruiter AI Interactive Panel */}
                  <div className="lg:col-span-5 p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-cobalt-600 dark:text-cobalt-400" />
                        <div>
                          <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">Tanya Tim Recruiter</h3>
                          <p className="text-caption text-slate-500 dark:text-slate-400">Interaksi &amp; Konsultasi Hasil CV</p>
                        </div>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse motion-reduce:animate-none" title="Tim Recruiter Aktif" />
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
                                ? 'bg-cobalt-500 text-white font-medium rounded-tr-none'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/70 dark:border-slate-700/70'
                            }`}
                          >
                            <p>{msg.text}</p>
                            <span
                              className={`text-caption block mt-1 text-right ${
                                msg.sender === 'user' ? 'text-blue-100' : 'text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {msg.time}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Quick Suggestion Chips */}
                    <div className="flex flex-wrap gap-1.5 text-caption">
                      <button
                        type="button"
                        onClick={() => handleSendChatMessage('Mengapa CV saya belum 100%?')}
                        className="px-3 sm:px-2.5 py-2 sm:py-1.5 min-h-[44px] sm:min-h-[30px] rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950 hover:text-orange-600 dark:hover:text-orange-400 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition cursor-pointer font-medium flex items-center gap-1"
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                        <span>Mengapa CV belum 100%?</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendChatMessage('Bagaimana kalau saya ganti summary?')}
                        className="px-3 sm:px-2.5 py-2 sm:py-1.5 min-h-[44px] sm:min-h-[30px] rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950 hover:text-orange-600 dark:hover:text-orange-400 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition cursor-pointer font-medium flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
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
                        className="flex-1 px-3 py-2 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cobalt-500 focus:outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => handleSendChatMessage()}
                        className="h-8 w-8 min-h-[32px] min-w-[32px] flex items-center justify-center rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 text-white transition cursor-pointer"
                        aria-label="Kirim pesan ke tim recruiter"
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
                      <span className="px-2.5 py-0.5 rounded-[10px] text-caption font-extrabold uppercase bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 inline-flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                        <span>Tahap {activeStepMap.improvement} • Rekomendasi Perbaikan Kalimat</span>
                      </span>
                      <h3 className="font-black text-xl text-slate-900 dark:text-white">
                        Perbandingan Sebelum &amp; Sesudah Kalimat CV
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Klik tombol di tiap seksi untuk menerapkan perbaikan secara manual, atau gunakan tombol otomatis di atas.
                      </p>
                    </div>
                  </div>

                  {/* Action Bar: Optimalkan Sekaligus & Akses CV */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                        {optimizedCvResult
                          ? `Status: Draf CV "${optimizedCvResult.title}" Telah Dioptimalkan`
                          : 'Terapkan Seluruh Revisi Kalimat Secara Sekaligus'}
                      </h4>
                      <p className="text-caption text-slate-500 dark:text-slate-400">
                        {optimizedCvResult
                          ? 'Perubahan tersimpan. Kamu dapat langsung membuka dokumen ini untuk memeriksa atau mengedit.'
                          : 'Tersedia pilihan membuat salinan baru terpisah atau menimpa draf CV saat ini.'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {optimizedCvResult && (
                        <button
                          type="button"
                          onClick={() => router.push(`/cv/${optimizedCvResult.id}`)}
                          className="px-3.5 py-2 rounded-[10px] bg-emerald-700 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Buka CV di Editor</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleOpenOptimizeDrawer}
                        className="px-3.5 py-2 rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>{optimizedCvResult ? 'Optimalkan Ulang' : 'Optimalkan Semua'}</span>
                      </button>
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
                                  : 'bg-cobalt-500 hover:bg-cobalt-600 text-white shadow-xs'
                              }`}
                            >
                              {isApplied ? (
                                <span className="flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                                  Telah Diterapkan (+5% Skor)
                                </span>
                              ) : (
                                '+ Terapkan Perbaikan ini'
                              )}
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                            <div className="p-3 rounded-[10px] bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200">
                              <span className="font-bold text-caption uppercase text-rose-700 dark:text-rose-400 block">
                                Sebelum (Kurang Optimal):
                              </span>
                              <p className="mt-1 leading-snug">{fix.before}</p>
                            </div>

                            <div className="p-3 rounded-[10px] bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200">
                              <span className="font-bold text-caption uppercase text-emerald-700 dark:text-emerald-400 block">
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

                {/* BOTTOM ACTION BAR: LANJUTKAN KE TRACKER & COVER LETTER */}
                <div className="p-5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[10px] bg-blue-50 dark:bg-blue-950/60 text-cobalt-500 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        Langkah Selanjutnya untuk Lamaran Ini
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {jobCompany
                          ? `Simpan posisi di ${jobCompany} ke Tracker Lamaran atau langsung susun surat lamaran kerja terpersonalisasi.`
                          : 'Pantau status lamaran kerja di Kanban Tracker atau susun surat lamaran terarah.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
                    <button
                      type="button"
                      onClick={handleSaveToTracker}
                      disabled={isSavingToTracker || isSavedToTracker}
                      className={`px-4 py-2.5 rounded-[10px] text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs ${
                        isSavedToTracker
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-cobalt-500 hover:bg-cobalt-600 text-white active:scale-[0.98]'
                      }`}
                    >
                      {isSavingToTracker ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : isSavedToTracker ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                      ) : (
                        <Briefcase className="w-4 h-4" />
                      )}
                      <span>{isSavedToTracker ? 'Tersimpan di Tracker' : 'Tambahkan ke Tracker Lamaran'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/mailer?company=${encodeURIComponent(jobCompany || '')}&role=${encodeURIComponent(effectiveRole)}`
                        )
                      }
                      className="px-4 py-2.5 rounded-[10px] bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Send className="w-4 h-4" />
                      <span>Buat Surat Lamaran</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}


      {/* RIGHT-HAND SLIDE-IN DRAWER: PILIH STANDAR PENILAIAN PERUSAHAAN (KACAMATA HRD) */}
      <Sheet open={isPersonaDrawerOpen} onOpenChange={setIsPersonaDrawerOpen}>
        <SheetContent side="right" className="w-full max-w-md sm:max-w-xl flex flex-col justify-between p-0 overflow-hidden">
          {/* Header */}
          <SheetHeader className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 space-y-0">
            <div className="flex items-center gap-2.5 min-w-0 pr-6">
              <div className="p-2 rounded-[10px] bg-cobalt-50 dark:bg-cobalt-950/60 text-cobalt-600 dark:text-blue-400 shrink-0">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <SheetTitle className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                  Standar Penilaian Perusahaan
                </SheetTitle>
                <SheetDescription className="text-caption text-slate-500 dark:text-slate-400 truncate">
                  Kriteria evaluasi perusahaan target
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Body with Search & Filter Tabs */}
          <div className="p-5 space-y-4 overflow-y-auto flex-1">
            {/* Search Input (44px min-height, Accessible) */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="text"
                value={personaSearchQuery}
                onChange={(e) => setPersonaSearchQuery(e.target.value)}
                placeholder="Cari tipe atau perusahaan (misal: Astra, Alfamart, BUMN)..."
                className="w-full min-h-[44px] pl-10 pr-9 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium focus:ring-2 focus:ring-cobalt-500 focus:outline-none transition"
              />
              {personaSearchQuery && (
                <button
                  type="button"
                  onClick={() => setPersonaSearchQuery('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                  aria-label="Hapus pencarian"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: 'Semua (13)' },
                { id: 'company', label: 'Kantor & Industri (7)' },
                { id: 'region', label: 'Global & Remote (4)' },
                { id: 'special', label: 'Khusus & Fresh Grad (2)' },
              ].map((cat) => {
                const isActive = personaCategoryFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setPersonaCategoryFilter(cat.id as any)}
                    className={`min-h-[36px] px-3 py-1.5 rounded-[8px] text-caption font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-cobalt-500 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* List of Personas */}
            <div className="space-y-2.5">
              {filteredPersonas.length === 0 ? (
                <div className="p-8 rounded-[10px] border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
                  <SlidersHorizontal className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-500 font-medium">
                    Tidak ditemukan standar perusahaan dengan kata kunci &quot;{personaSearchQuery}&quot;
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setPersonaSearchQuery('');
                      setPersonaCategoryFilter('all');
                    }}
                    className="text-caption font-bold text-cobalt-600 hover:underline cursor-pointer"
                  >
                    Reset Filter
                  </button>
                </div>
              ) : (
                filteredPersonas.map((persona) => {
                  const isSelected = selectedPersonaId === persona.id;
                  const isBest = bestMatchPersonaId === persona.id;

                  return (
                    <div
                      key={persona.id}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSelected}
                      onClick={() => {
                        setSelectedPersonaId(persona.id);
                        setExpandedPersonaId(persona.id);
                        setIsPersonaDrawerOpen(false);
                        toast.success('Standar Dipilih', `Kriteria evaluasi disesuaikan untuk ${persona.name}.`);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedPersonaId(persona.id);
                          setExpandedPersonaId(persona.id);
                          setIsPersonaDrawerOpen(false);
                          toast.success('Standar Dipilih', `Kriteria evaluasi disesuaikan untuk ${persona.name}.`);
                        }
                      }}
                      className={`w-full text-left p-4 rounded-[10px] border-2 transition-all cursor-pointer space-y-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 ${
                        isSelected
                          ? 'border-cobalt-500 bg-blue-50/50 dark:bg-blue-950/30 shadow-xs ring-1 ring-cobalt-500/30'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`p-2 rounded-[8px] shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-cobalt-500 text-white shadow-2xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/50 group-hover:text-cobalt-600'
                            }`}
                          >
                            {getPersonaIcon(persona)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-cobalt-600 dark:group-hover:text-blue-400 transition">
                                {persona.name}
                              </h4>
                              <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-blue-50 dark:bg-blue-950/80 text-cobalt-600 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/60">
                                {persona.badge}
                              </span>
                              {isBest && (
                                <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                  Cocok untuk Profilmu
                                </span>
                              )}
                            </div>
                            <p className="text-caption font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                              Standar: {persona.strictness}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 pt-0.5">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                              isSelected
                                ? 'border-cobalt-500 bg-cobalt-500 text-white'
                                : 'border-slate-300 dark:border-slate-600 group-hover:border-slate-400'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      </div>

                      {/* Contoh Perusahaan */}
                      <div className="text-caption text-slate-700 dark:text-slate-300 flex items-start gap-1.5 bg-slate-50/70 dark:bg-slate-800/40 p-2 rounded-[6px] border border-slate-100 dark:border-slate-800">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">
                          <strong className="font-bold text-slate-900 dark:text-white">Contoh:</strong>{' '}
                          {persona.companies.join(', ')}
                        </span>
                      </div>

                      {/* Penjelasan Fokus */}
                      <p className="text-caption text-slate-600 dark:text-slate-300 leading-snug">
                        {persona.evalFocus || persona.description}
                      </p>

                      {/* Highlight Chips */}
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {persona.highlights.slice(0, 3).map((item, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-[10px] font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80"
                          >
                            <Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>{item}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Sticky Footer */}
          <SheetFooter className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex flex-row items-center justify-between gap-2.5 sm:space-x-0">
            <span className="text-caption font-semibold text-slate-500 dark:text-slate-400">
              {filteredPersonas.length} dari {recruiterPersonas.length} standar
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsPersonaDrawerOpen(false)}
            >
              Gunakan Standar Terpilih
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>


      {/* RIGHT-HAND SLIDE-IN DRAWER: RIWAYAT & HASIL SCREENING CV */}
      <Sheet open={isHistoryDrawerOpen} onOpenChange={setIsHistoryDrawerOpen}>
        <SheetContent side="right" className="w-full max-w-md sm:max-w-xl flex flex-col justify-between p-0 overflow-hidden">
          {/* Header */}
          <SheetHeader className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 space-y-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-[10px] bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400">
                <History className="w-4 h-4" />
              </div>
              <div>
                <SheetTitle className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  Riwayat &amp; Hasil Screening CV
                </SheetTitle>
                <p className="text-caption text-slate-500 dark:text-slate-400">
                  {reportHistory.length} sesi tersimpan di akun kamu
                </p>
              </div>
            </div>
          </SheetHeader>

          {/* Scrollable Body */}
          <div className="p-5 space-y-5 overflow-y-auto flex-1">
            {/* Laporan Intelligence Dinamis Terhubung Database Card */}
            <div className="p-4 rounded-[10px] bg-gradient-to-br from-blue-50/80 to-slate-50/80 dark:from-navy-950/40 dark:to-slate-900/40 border border-blue-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-[10px] bg-cobalt-500 text-white shrink-0 shadow-xs">
                  <Sparkles className="w-4 h-4 fill-white" />
                </div>
                <div>
                  <h5 className="font-extrabold text-xs text-slate-900 dark:text-white">
                    Laporan Screening Intelligence
                  </h5>
                  <p className="text-caption text-slate-600 dark:text-slate-300 leading-snug pt-0.5">
                    Lihat Laporan Intelligence Full-Width untuk analisis lengkap recruiter target.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsHistoryDrawerOpen(false);
                  if (reportHistory.length > 0) {
                    handleLoadHistoryReport(reportHistory[0]);
                  } else if (savedCvs.length > 0) {
                    handleViewCvReportDirectly(savedCvs[0]);
                  } else {
                    router.push('/cv-screener');
                  }
                }}
                className="w-full py-2.5 rounded-[10px] bg-white dark:bg-slate-900 hover:bg-blue-50/50 text-cobalt-500 dark:text-blue-400 text-xs font-bold transition flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-800 cursor-pointer shadow-2xs"
              >
                <span>Lihat Laporan</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-1.5 text-caption font-bold text-emerald-700 dark:text-emerald-400 pt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse motion-reduce:animate-none shrink-0" />
                <span>Lihat Laporan dinamis terhubung dengan database dan per akun</span>
              </div>
            </div>

            {/* Sesi Screening Sebelumnya */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Sesi screening sebelumnya
                </span>
                <span className="text-caption font-bold text-slate-500 dark:text-slate-400">
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

                    const isActive = hist.id === activeSessionId;

                    return (
                      <div
                        key={hist.id}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setIsHistoryDrawerOpen(false);
                            handleLoadHistoryReport(hist);
                          }
                        }}
                        onClick={() => {
                          setIsHistoryDrawerOpen(false);
                          handleLoadHistoryReport(hist);
                        }}
                        className={`p-3.5 rounded-[10px] border transition-all cursor-pointer space-y-2.5 group shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 ${
                          isActive
                            ? 'border-cobalt-500 ring-2 ring-cobalt-500/20 bg-blue-50/60 dark:bg-blue-950/40'
                            : 'border-slate-200 dark:border-slate-800 hover:border-cobalt-500/60 hover:bg-blue-50/30 dark:hover:bg-blue-950/20'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                            <span className={`font-extrabold text-xs transition truncate ${isActive ? 'text-cobalt-600 dark:text-blue-300' : 'text-slate-900 dark:text-white group-hover:text-cobalt-500'}`}>
                              {hist.candidateName}
                            </span>
                            <span className="text-caption font-extrabold bg-blue-50 text-cobalt-500 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded-[10px] border border-blue-200 dark:border-blue-800 shrink-0">
                              {hist.personaName}
                            </span>
                            {isActive && (
                              <span className="text-caption font-bold bg-cobalt-500 text-white px-2 py-0.5 rounded-[6px] flex items-center gap-1 shrink-0 shadow-2xs">
                                <Check className="w-3 h-3 stroke-[3]" />
                                <span>Sedang Ditampilkan</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteHistory(hist.id, e);
                              }}
                              className="min-w-[28px] min-h-[28px] p-1.5 flex items-center justify-center text-slate-500 hover:text-rose-500 rounded-[6px] hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer dark:text-slate-400"
                              title="Hapus riwayat sesi ini"
                              aria-label="Hapus riwayat sesi ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 text-caption text-slate-500 dark:text-slate-400">
                          <p className="font-medium truncate">
                            {hist.targetRole} {hist.targetLevel ? `• ${hist.targetLevel}` : ''}
                          </p>
                          {hist.purposeTitle && (
                            <span className="text-caption font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded-[6px] shrink-0">
                              {hist.purposeTitle}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-caption border-t border-slate-100 dark:border-slate-800/80 pt-2 text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-[8px] border text-caption font-extrabold ${verdictBg}`}>
                              {verdictLabel}
                            </span>
                            <span>{hist.timestamp}</span>
                          </div>

                          <div className="flex items-center gap-1 font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-[8px] border border-emerald-200/60 dark:border-emerald-800/60">
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
                  <FileText className="w-4 h-4 text-cobalt-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Hasil CV terbaru di akun
                  </span>
                </div>
                <span className="text-caption font-bold text-slate-500 dark:text-slate-400">
                  {savedCvs.length} Berkas
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {savedCvs.map((cv) => {
                  const isSelected = selectedCvId === cv.id && cvSourceMode === 'saved';
                  return (
                    <button
                      type="button"
                      key={cv.id}
                      onClick={() => handleViewCvReportDirectly(cv)}
                      className={`w-full text-left p-3 rounded-[10px] border transition-all flex items-center justify-between cursor-pointer group ${
                        isSelected
                          ? 'border-cobalt-500 bg-blue-50/60 dark:bg-blue-950/40 ring-1 ring-cobalt-500/30 shadow-2xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <h5 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-cobalt-500 transition truncate">
                            {cv.candidateName}
                          </h5>
                          {isSelected && (
                            <span className="px-1.5 py-0.5 rounded-[6px] text-[8px] font-extrabold bg-cobalt-500 text-white">
                              Aktif
                            </span>
                          )}
                        </div>
                        <p className="text-caption text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {cv.roleTitle}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-caption font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-[8px] border border-emerald-200/60 dark:border-emerald-800/60">
                          {cv.atsScore}% ATS
                        </span>
                        <span className="text-caption font-bold text-cobalt-500 dark:text-blue-400 group-hover:underline flex items-center gap-0.5">
                          <span>Lihat Hasil</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <SheetFooter className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex flex-row items-center justify-between gap-2.5 sm:space-x-0">
            {reportHistory.length > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAllHistory}
                className="text-caption font-bold text-rose-700 hover:text-rose-600 hover:bg-rose-50 flex items-center gap-1 p-0 h-auto dark:text-rose-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Semua Riwayat</span>
              </Button>
            ) : (
              <div />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsHistoryDrawerOpen(false)}
            >
              Tutup
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* RIGHT-HAND SLIDE-IN DRAWER: OPSI OPTIMALKAN CV SAYA */}
      <Sheet open={isOptimizeDrawerOpen} onOpenChange={setIsOptimizeDrawerOpen}>
        <SheetContent side="right" className="w-full max-w-md sm:max-w-xl flex flex-col justify-between p-0 overflow-hidden">
          {/* Header */}
          <SheetHeader className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 space-y-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-[10px] bg-blue-50 dark:bg-blue-950/60 text-cobalt-500 dark:text-blue-400">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <SheetTitle className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  {optimizedCvResult ? 'CV Berhasil Dioptimalkan' : 'Pilih Metode Optimasi CV'}
                </SheetTitle>
                <p className="text-caption text-slate-500 dark:text-slate-400">
                  {optimizedCvResult
                    ? 'Revisi telah tersimpan dan siap kamu akses di CV Builder'
                    : 'Terapkan rekomendasi kalimat, metrik kuantitatif, dan kata kunci ATS'}
                </p>
              </div>
            </div>
          </SheetHeader>

          {/* Body */}
          <div className="p-5 overflow-y-auto flex-1 space-y-5 text-xs">
            {optimizedCvResult ? (
              // SUCCESS STATE VIEW
              <div className="space-y-5 py-4 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto text-emerald-700 dark:text-emerald-400 shadow-sm animate-in zoom-in-75 duration-300">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1.5 max-w-sm mx-auto">
                  <span className="px-2.5 py-0.5 rounded-[6px] text-caption font-extrabold uppercase bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {optimizedCvResult.mode === 'duplicate' ? 'Salinan Baru Dibuat' : 'CV Diperbarui'}
                  </span>
                  <h4 className="text-base font-black text-slate-900 dark:text-white pt-1">
                    {optimizedCvResult.title}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                    Seluruh perbaikan kalimat pengalaman, metrik angka, ringkasan profil, dan kata kunci ATS telah berhasil disimpan.
                  </p>
                </div>

                {/* Quick Card Detail */}
                <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-left space-y-2">
                  <div className="flex justify-between items-center text-caption">
                    <span className="text-slate-500 dark:text-slate-400">Target Posisi:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{targetRole || 'Professional'}</span>
                  </div>
                  <div className="flex justify-between items-center text-caption">
                    <span className="text-slate-500 dark:text-slate-400">Metode Penyimpanan:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {optimizedCvResult.mode === 'duplicate' ? 'Dokumen Baru Terpisah' : 'Timpa Dokumen Asli'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-caption">
                    <span className="text-slate-500 dark:text-slate-400">Status Penyimpanan:</span>
                    <span className="font-extrabold text-emerald-700 dark:text-emerald-400">Tersimpan ke Akun &amp; Draft</span>
                  </div>
                </div>

                {/* Actions to Access Optimized CV */}
                <div className="space-y-2.5 pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => router.push(`/cv/${optimizedCvResult.id}`)}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Buka &amp; Edit CV Hasil Optimasi</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => router.push('/cv')}
                    className="w-full flex items-center justify-center gap-1.5"
                  >
                    <FolderKanban className="w-3.5 h-3.5" />
                    <span>Lihat Daftar Semua CV Saya</span>
                  </Button>
                </div>
              </div>
            ) : (
              // OPTION SELECTION VIEW
              <>
                {/* Summary of What Gets Applied */}
                <div className="p-4 rounded-[10px] bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 space-y-2.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs">
                    <ShieldCheck className="w-4 h-4 text-cobalt-500 dark:text-blue-400" />
                    <span>3 Perbaikan Kritis yang Akan Diterapkan Otomatis:</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 pl-6 list-disc">
                    <li>
                      <strong className="text-slate-800 dark:text-slate-200">Pengalaman Kerja:</strong> Mengganti deskripsi dengan kalimat aktif berbobot metrik angka kuantitatif.
                    </li>
                    <li>
                      <strong className="text-slate-800 dark:text-slate-200">Executive Summary:</strong> Menyelaraskan ringkasan profesional langsung ke kualifikasi posisi target.
                    </li>
                    <li>
                      <strong className="text-slate-800 dark:text-slate-200">Seksi Skills:</strong> Menambahkan kata kunci esensial industri untuk menembus filter sistem ATS.
                    </li>
                  </ul>
                </div>

                {/* Option Cards */}
                <div className="space-y-3">
                  <label className="font-extrabold text-slate-900 dark:text-white block text-xs">
                    Pilih Cara Penyimpanan Dokumen:
                  </label>

                  {/* Option 1: Buat Salinan Baru */}
                  <button
                    type="button"
                    onClick={() => setOptimizeMode('duplicate')}
                    className={`w-full text-left p-4 rounded-[10px] border-2 transition-all cursor-pointer space-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 ${
                      optimizeMode === 'duplicate'
                        ? 'border-cobalt-500 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            optimizeMode === 'duplicate'
                              ? 'border-cobalt-500 bg-cobalt-500'
                              : 'border-slate-400 dark:border-slate-600'
                          }`}
                        >
                          {optimizeMode === 'duplicate' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                          Buat Salinan Baru (Dokumen Terpisah)
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-[6px] text-caption font-bold bg-blue-100 text-cobalt-500 dark:bg-blue-900/60 dark:text-blue-300 shrink-0">
                        Direkomendasikan
                      </span>
                    </div>
                    <p className="text-caption text-slate-500 dark:text-slate-400 pl-6.5 leading-relaxed">
                      CV asli kamu tetap aman dan tidak berubah. Sistem membuat dokumen baru berjudul{' '}
                      <strong className="text-slate-700 dark:text-slate-300">
                        &quot;{selectedSavedCv?.title || selectedSavedCv?.candidateName || 'CV ATS'} (Teroptimasi)&quot;
                      </strong>{' '}
                      sebagai cadangan atau variasi lamaran.
                    </p>
                  </button>

                  {/* Option 2: Timpa Langsung */}
                  <button
                    type="button"
                    onClick={() => setOptimizeMode('overwrite')}
                    className={`w-full text-left p-4 rounded-[10px] border-2 transition-all cursor-pointer space-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 ${
                      optimizeMode === 'overwrite'
                        ? 'border-cobalt-500 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          optimizeMode === 'overwrite'
                            ? 'border-cobalt-500 bg-cobalt-500'
                            : 'border-slate-400 dark:border-slate-600'
                        }`}
                      >
                        {optimizeMode === 'overwrite' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                        Timpa Langsung (Perbarui CV Ini)
                      </span>
                    </div>
                    <p className="text-caption text-slate-500 dark:text-slate-400 pl-6.5 leading-relaxed">
                      Revisi dan kata kunci baru langsung ditimpa ke dalam draf CV yang sedang kamu buka saat ini (
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {selectedSavedCv?.title || selectedSavedCv?.candidateName || 'CV Aktif'}
                      </span>
                      ).
                    </p>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Sticky Footer */}
          <SheetFooter className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex flex-row items-center justify-end gap-2.5 sm:space-x-0">
            {optimizedCvResult ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsOptimizeDrawerOpen(false)}
                className="w-full"
              >
                Tutup &amp; Tetap di Halaman Laporan
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOptimizeDrawerOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleExecuteOptimizeCv(optimizeMode)}
                  disabled={isAutoOptimizing}
                  aria-busy={isAutoOptimizing}
                  className="flex items-center gap-1.5"
                >
                  {isAutoOptimizing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan Optimasi...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Terapkan &amp; Simpan CV</span>
                    </>
                  )}
                </Button>
              </>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Floating Back to Top Button on Long Report View */}
      {showBackToTop && activePhase === 'report' && (
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 p-2.5 sm:px-3.5 sm:py-2.5 rounded-[10px] bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5 text-xs font-bold print:hidden cursor-pointer active:scale-95 min-h-[44px] min-w-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
          aria-label="Kembali ke atas laporan"
          title="Kembali ke atas laporan"
        >
          <ArrowUp className="w-4 h-4 text-cobalt-500 dark:text-blue-400" />
          <span className="hidden sm:inline">Ke Atas</span>
        </button>
      )}
    </div>
  );
};
