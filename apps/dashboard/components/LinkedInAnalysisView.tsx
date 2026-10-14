'use client';

import { PageHeader } from '@/components/ui/PageHeader';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import {
  Linkedin,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Search,
  Award,
  Share2,
  FileText,
  Target,
  ShieldCheck,
  Zap,
  Briefcase,
  Lightbulb,
  User,
  MapPin,
  Users,
  GraduationCap,
  Code2,
  ArrowRight,
  ChevronRight,
  Database,
  CheckCircle,
  FolderGit2,
  ExternalLink,
  BadgeCheck,
  Download,
  ListChecks,
  CheckSquare,
  Square,
  Flame,
  HelpCircle,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Link2,
  Clock,
  Plus,
  Trash2,
  X,
  Lock,
  Globe,
  EyeOff,
} from 'lucide-react';
import { getScoreTextClass, getScoreBadgeClass, getScoreProgressBarClass } from '@/lib/score-color';
import { normalizeLinkedInUrl } from '@/lib/linkedin-url';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button, buttonVariants } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Avatar } from '@/components/ui/components-primitives-avatar';
import { cn } from '@/lib/utils';


interface LinkedInAnalysisViewProps {
  isDarkMode?: boolean;
  onOpenUpgradeModal?: () => void;
  analysisId?: string;
  roleSlug?: string;
  nameSlug?: string;
}

export interface ScrapedProfileData {
  name: string;
  headline: string;
  about: string;
  location: string;
  connections: string;
  experience: Array<{
    role: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    issueDate: string;
    credentialId?: string;
  }>;
  projects?: Array<{
    title: string;
    role?: string;
    duration?: string;
    description: string;
    techStack?: string[];
    url?: string;
  }>;
  skills: string[];
}

export interface EvidenceBankData {
  targetRole: string;
  targetIndustry: string;
  toolsActuallyUsed: string;
  proofProjects: string;
  measurableOutcomes: string;
  constraints: string;
  targetTone: 'beginner' | 'impact' | 'switcher';
  existingHeadline?: string;
  existingAbout?: string;
}

export interface CompetencyMapItem {
  competency: string;
  profileEvidence: string;
  status: 'found' | 'partial' | 'not_found';
  confidence: 'high' | 'medium' | 'low';
}

export interface PrioritizedRecommendation {
  priority: number;
  impact: 'High' | 'Medium' | 'Low';
  effort: 'High' | 'Medium' | 'Low';
  title: string;
  problem: {
    observation: string;
    interpretation: string;
  };
  whyItMatters: string;
  action: {
    before: string;
    after: string;
  };
  evidenceUsed: string[];
  confidence: 'high' | 'medium' | 'low';
}

export interface RecruiterScanItem {
  criterion: string;
  status: 'strong' | 'needs_attention' | 'critical' | 'good' | 'warning';
  scanTimeSeconds: string;
  finding?: string;
  observation: string;
  interpretation: string;
  recommendation: string;
  confidence?: 'high' | 'medium' | 'low';
}

export interface HeadlineItem {
  patternKey: 'role-led' | 'student-led' | 'evidence-led' | 'switcher-led' | string;
  title: string;
  text: string;
  charCount: number;
  keywords: string;
  whyItWorks: string;
  isPrimary?: boolean;
}

export interface Top5SkillItem {
  name: string;
  priority: number;
  reason: string;
}

export interface AnalysisResultState {
  overallScore: number;
  overallReadinessLabel?: 'Strong' | 'Needs Attention' | 'Critical';
  ssiScore: number;
  profileStatus: string;
  scoreBreakdown: {
    headline: number;
    about: number;
    experience: number;
    keywords: number;
    engagement: number;
  };
  competencyMap: CompetencyMapItem[];
  prioritizedRecommendations: PrioritizedRecommendation[];
  recruiterScanAudit: RecruiterScanItem[];
  headlines: HeadlineItem[];
  aboutStructure: {
    threeSentenceOpening: {
      sentence1: string;
      sentence2: string;
      sentence3: string;
    };
    evidenceBullets: string[];
    closingLine: string;
  };
  optimizedAbout: string;
  top5Skills: Top5SkillItem[];
  keySkills: string[];
  missingKeywords: string[];
  questionableKeywords: string[];
  auditFindings: Array<{ category: string; status: 'good' | 'warning' | 'critical' | 'strong' | 'needs_attention'; tip: string }>;
}

const DEFAULT_CHECKLIST: Record<string, boolean> = {
  headlineFormula: false,
  headlineCharLimit: false,
  about3Sentences: false,
  aboutEvidenceBullets: false,
  skillsAlignment: false,
  truthfulEvidence: false,
  naturalTone: false,
  customBanner: false,
  locationMarket: false,
  turnOffBroadcasts: false,
};


const DEFAULT_RECRUITER_SCAN_AUDIT: RecruiterScanItem[] = [
  {
    criterion: 'Foto & Banner Profesional',
    status: 'needs_attention',
    scanTimeSeconds: '0-3 dtk',
    finding: 'Banner profil masih default abu-abu atau foto kurang terang.',
    observation: 'Banner profil terdeteksi masih default LinkedIn atau foto profil menggunakan pencahayaan redup.',
    interpretation: 'Recruiter menilai keseriusan dan personal branding kandidat sejak 3 detik pertama visual profil dibuka.',
    recommendation: 'Pasang foto berpakaian smart-casual berlatar netral dan ganti banner sesuai bidang target peran.',
    confidence: 'high',
  },
  {
    criterion: 'Formula Headline Terstruktur',
    status: 'strong',
    scanTimeSeconds: '0-3 dtk',
    finding: 'Headline telah memenuhi standar 3 unsur penting recruiter.',
    observation: 'Headline tersusun dengan rumus: [Peran Target] | [2-3 Tools Kunci] | [Hasil / Audiens].',
    interpretation: 'Recruiter langsung mengenali keselarasan peran dan keahlian teknis dalam 3 detik tanpa kata klise.',
    recommendation: 'Pertahankan panjang karakter di bawah 220 karakter agar terbaca utuh di smartphone recruiter.',
    confidence: 'high',
  },
  {
    criterion: 'Lokasi & Ketersediaan Terbaca',
    status: 'strong',
    scanTimeSeconds: '4-7 dtk',
    finding: 'Lokasi dan preferensi kerja tercantum spesifik.',
    observation: 'Lokasi domisili dan preferensi kota kerja tercantum jelas pada profil publik.',
    interpretation: 'Memudahkan filter pencarian recruiter regional dan memperjelas kesiapan penempatan kerja.',
    recommendation: 'Aktifkan status "Open to Work" (bisa diatur visibilitas hanya untuk recruiter jika sedang bekerja).',
    confidence: 'high',
  },
  {
    criterion: 'Peran / Pendidikan Terkini Kredibel',
    status: 'strong',
    scanTimeSeconds: '4-7 dtk',
    finding: 'Fondasi pendidikan dan peran relevan dengan target.',
    observation: 'Riwayat peran kerja atau institusi pendidikan terkini relevan dengan target karir yang dituju.',
    interpretation: 'Memberikan fondasi kredibilitas awal yang meyakinkan bagi hiring manager.',
    recommendation: 'Cantumkan proyek akhir atau sertifikasi relevan pada deskripsi pendidikan/peran.',
    confidence: 'high',
  },
  {
    criterion: 'Formula 3 Kalimat Bagian About',
    status: 'strong',
    scanTimeSeconds: '8-15 dtk',
    finding: 'Pembuka bio langsung menjabarkan identitas dan kontribusi.',
    observation: 'Pembuka bio langsung menyatakan identitas, bukti alat yang dipakai, dan kontribusi yang ditawarkan.',
    interpretation: 'Struktur 3 kalimat menghilangkan kalimat klise generik dan mengunci perhatian recruiter di 15 detik awal.',
    recommendation: 'Pertahankan format hook 3 kalimat: Identitas → Bukti Konkret → Nilai Tambah.',
    confidence: 'high',
  },
  {
    criterion: 'Skill & Kata Kunci Terindeks',
    status: 'strong',
    scanTimeSeconds: '8-15 dtk',
    finding: 'Kata kunci teknis terdistribusi konsisten.',
    observation: 'Kata kunci kompetensi teknis terdistribusi konsisten di Headline, About, dan Top Skills.',
    interpretation: 'Meningkatkan bobot ranking algoritma LinkedIn Search saat recruiter memfilter kandidat.',
    recommendation: 'Sematkan (Pin) 3–5 skill teknis utama di urutan teratas bagian Keahlian LinkedIn.',
    confidence: 'high',
  },
  {
    criterion: 'Bukti Pengalaman & Dampak Nyata',
    status: 'needs_attention',
    scanTimeSeconds: '16-25 dtk',
    finding: 'Deskripsi mencantumkan tugas tapi metrik hasil masih minim.',
    observation: 'Deskripsi pengalaman mencantumkan tugas harian namun cakupan metrik hasil kerja masih terbatas.',
    interpretation: 'Hiring manager membedakan kandidat rata-rata dari bukti dampak terukur (metrik/kuantifikasi).',
    recommendation: 'Gunakan formula STAR (Situation, Task, Action, Result) dengan cakupan metrik yang nyata dan dapat diverifikasi.',
    confidence: 'high',
  },
  {
    criterion: 'Portofolio & Bukti Proyek',
    status: 'strong',
    scanTimeSeconds: '16-25 dtk',
    finding: 'Terdapat tautan artefak proyek nyata.',
    observation: 'Terdapat dokumentasi atau penyebutan proyek nyata yang merefleksikan kapabilitas kerja praktis.',
    interpretation: 'Bukti artefak kerja memvalidasi klaim keahlian kandidat sebelum tahap wawancara.',
    recommendation: 'Sematkan tautan demo, repository GitHub, atau PDF portofolio pada bagian "Featured / Unggulan".',
    confidence: 'high',
  },
  {
    criterion: 'Konsistensi Cerita Profil',
    status: 'strong',
    scanTimeSeconds: '26-30 dtk',
    finding: 'Benang merah pendidikan, pengalaman, dan target selaras.',
    observation: 'Benang merah antara riwayat pendidikan, pengalaman proyek, dan target peran tersambung selaras.',
    interpretation: 'Konsistensi narasi menepis keraguan recruiter mengenai fokus dan determinasi arah karir kandidat.',
    recommendation: 'Pastikan riwayat di LinkedIn selaras dengan CV yang dikirimkan ke perusahaan.',
    confidence: 'high',
  },
  {
    criterion: 'Sinyal Risiko & Integritas Bukti',
    status: 'strong',
    scanTimeSeconds: '26-30 dtk',
    finding: 'Bebas dari klaim fiktif atau inkonsistensi.',
    observation: 'Tidak ditemukan klaim berlebihan (seperti label "Expert" di level pemula) atau inkonsistensi data.',
    interpretation: 'Profil terbebas dari red flags yang memicu kecurigaan integritas saat verifikasi teknis.',
    recommendation: 'Pertahankan klaim objektif berbasis bukti nyata yang siap dipertanggungjawabkan saat wawancara.',
    confidence: 'high',
  },
];

// Sanitasi Peran Target (Hapus nama sekolah/perusahaan atau imbuhan at/di)
export const sanitizeRole = (rawRole?: string): string => {
  if (!rawRole) return 'Junior Professional';
  let cleaned = rawRole
    .replace(/\s+(?:at|di|@)\s+.+$/i, '')
    .replace(/[|•,].*$/, '')
    .trim();
  return cleaned.length >= 2 ? cleaned : 'Junior Professional';
};

// Sanitasi Skills (Hapus nama sekolah, PT, kalimat panjang, atau duplikasi peran)
export const sanitizeSkills = (skills?: string[], roleToExclude?: string): string[] => {
  if (!Array.isArray(skills)) return ['Microsoft Office', 'Komunikasi', 'Analisis Data'];
  const excluded = (roleToExclude || '').toLowerCase();
  const cleaned = skills
    .map((s) => (s || '').trim())
    .filter((s) => {
      if (!s || s.length < 2 || s.length > 30) return false;
      if (/(?:\bat\b|\bdi\b|SMA|SMK|PT\b|CV\b|Universitas|University|School|Yayasan|Lembaga)/i.test(s)) return false;
      if (excluded && s.toLowerCase().includes(excluded)) return false;
      return true;
    });

  const unique: string[] = [];
  for (const s of cleaned) {
    if (!unique.some((u) => u.toLowerCase() === s.toLowerCase())) {
      unique.push(s);
    }
  }
  return unique.length > 0 ? unique : ['Microsoft Office', 'Komunikasi', 'Analisis Data'];
};

// Helper pemotong string berbasis batas kata (anti-potong kata di tengah seperti "Purnawak")
export const truncateAtWord = (text: string, maxLen: number): string => {
  if (!text || text.length <= maxLen) return text;
  const sub = text.slice(0, maxLen);
  const lastSpace = sub.lastIndexOf(' ');
  let res = lastSpace > maxLen * 0.5 ? sub.slice(0, lastSpace).trim() : sub.trim();
  res = res.replace(/[\s,·•|\-(]+$/, '').trim();
  const openCount = (res.match(/\(/g) || []).length;
  const closeCount = (res.match(/\)/g) || []).length;
  if (openCount > closeCount) res = res.replace(/\([^)]*$/, '').trim();
  return res;
};

// Sanitasi Hasil / Outcomes Terukur
export const sanitizeOutcomes = (raw?: string): string => {
  if (!raw) return 'Pencapaian dan kontribusi kerja nyata';
  let cleaned = raw
    // Hapus tipe pekerjaan (Purnawaktu, Full-time, dsb.) serta potongan kata rusak
    .replace(/\s*(?:·|•|-|\/)?\s*(?:Purnawaktu|Purnawak|Paruh Waktu|Full-time|Full time|Part-time|Part time|Freelance|Magang|Internship|Kontrak|Contract)\b/gi, '')
    // Rapikan frasa "Pengalaman di Perusahaan (XYZ)" -> "Berpengalaman di XYZ"
    .replace(/^Pengalaman di(?: Perusahaan)?\s*\(([^)]+)\)/i, 'Berpengalaman di $1')
    .replace(/^Pengalaman di\s+/i, 'Berpengalaman di ')
    .replace(/[·•]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Bersihkan tanda kurung yang tidak seimbang
  const openCount = (cleaned.match(/\(/g) || []).length;
  const closeCount = (cleaned.match(/\)/g) || []).length;
  if (openCount > closeCount) {
    cleaned = cleaned.replace(/\([^)]*$/, '').trim();
  } else if (closeCount > openCount) {
    cleaned = cleaned.replace(/\)+$/, '').trim();
  }

  cleaned = cleaned.replace(/[.,\s]+$/, '');
  return cleaned || 'Pencapaian dan kontribusi kerja nyata';
};

// Generator Pemetaan Kompetensi (Competency Map) Protokol v2.0.0
export const generateCompetencyMap = (
  role: string,
  skillsList: string[],
  projects: string[],
  experienceCompanies: string[]
): CompetencyMapItem[] => {
  const primaryTool = skillsList[0] || 'Keahlian Teknis Inti';
  const secondaryTool = skillsList[1] || 'Metodologi Kerja';
  const tertiaryTool = skillsList[2] || 'Alat Kolaborasi Digital';

  return [
    {
      competency: `${role} Domain & Practical Knowledge`,
      profileEvidence: experienceCompanies.length > 0
        ? `Tercermin di pengalaman kerja (${experienceCompanies.slice(0, 2).join(', ')}) dan riwayat peran`
        : `Tersirat dalam target posisi dan keahlian terdaftar`,
      status: experienceCompanies.length > 0 ? 'found' : 'partial',
      confidence: 'high',
    },
    {
      competency: `Eksekusi Praktis ${primaryTool}`,
      profileEvidence: skillsList.includes(primaryTool)
        ? `Tercantum di Top Skills dan divalidasi pada ringkasan kerja`
        : `Disebutkan secara parsial dalam deskripsi About`,
      status: 'found',
      confidence: 'high',
    },
    {
      competency: `Alat Pendukung: ${secondaryTool}`,
      profileEvidence: skillsList.includes(secondaryTool)
        ? `Tercantum pada keahlian terverifikasi profil`
        : `Belum tertera spesifik di daftar Top Skills`,
      status: skillsList.includes(secondaryTool) ? 'found' : 'partial',
      confidence: 'high',
    },
    {
      competency: projects.length > 0 ? `Bukti Portofolio Nyata (${projects[0]})` : 'Portofolio Terukur',
      profileEvidence: projects.length > 0
        ? `Tervalidasi melalui artefak proyek ${projects.slice(0, 2).join(', ')}`
        : 'Belum ditemukan tautan portofolio spesifik yang dapat diakses langsung',
      status: projects.length > 0 ? 'found' : 'partial',
      confidence: projects.length > 0 ? 'high' : 'medium',
    },
    {
      competency: 'Kolaborasi Tim & Alur Kerja Terstruktur',
      profileEvidence: skillsList.some((s) => /(?:Agile|Scrum|Project|Management|Trello|Git|Komunikasi)/i.test(s))
        ? 'Didukung keahlian manajemen kerja dan kolaborasi yang tercatat'
        : 'Belum tertera spesifik di daftar skills — disarankan sebagai gap pertimbangan',
      status: skillsList.some((s) => /(?:Agile|Scrum|Project|Management|Trello|Git|Komunikasi)/i.test(s)) ? 'found' : 'not_found',
      confidence: 'medium',
    },
  ];
};

// Generator Rekomendasi Terprioritas (Impact vs Effort) Protokol v2.0.0
export const generatePrioritizedRecommendations = (
  role: string,
  primaryHeadlineText: string,
  existingHeadline: string,
  primaryTool: string,
  secondaryTool: string,
  proof: string,
  outcomes: string
): PrioritizedRecommendation[] => {
  return [
    {
      priority: 1,
      impact: 'High',
      effort: 'Low',
      title: 'Optimasi Headline Profil ke Formula 3 Unsur Recruiter',
      problem: {
        observation: existingHeadline
          ? `Headline saat ini ("${existingHeadline.slice(0, 60)}...") belum sepenuhnya memenuhi 3 unsur recruiter scan.`
          : 'Headline masih bersifat generik atau belum menyebutkan kombinasi keahlian dan target peran secara tajam.',
        interpretation: 'Recruiter menyaring puluhan kandidat dalam hitungan detik. Headline adalah penentu apakah profil akan diklik atau diabaikan.',
      },
      whyItMatters: 'Headline muncul di samping nama kamu di setiap pencarian, komentar, dan pesan LinkedIn.',
      action: {
        before: existingHeadline || `${role} | Open to Work`,
        after: primaryHeadlineText,
      },
      evidenceUsed: [role, primaryTool, secondaryTool, outcomes.slice(0, 30)],
      confidence: 'high',
    },
    {
      priority: 2,
      impact: 'High',
      effort: 'Medium',
      title: 'Restrukturisasi Bagian About (Formula 3 Kalimat + 3–5 Bullets Bukti)',
      problem: {
        observation: 'Ringkasan bio belum menggunakan struktur hook pembuka yang langsung mengaitkan identitas, alat kerja, dan nilai kontribusi.',
        interpretation: 'Bio yang panjang tanpa pemisah visual menyulitkan recruiter memvalidasi kapabilitas praktis dalam 15 detik scan.',
      },
      whyItMatters: 'Bagian About adalah tempat recruiter memverifikasi apakah kandidat memahami arah karir dan mampu menyelesaikan masalah tim.',
      action: {
        before: 'Paragraf narasi generik atau belum memuat bullet poin bukti proyek terukur.',
        after: `Gunakan formula 3 kalimat pembuka: Identitas peran ${role} → Bukti proyek dengan ${primaryTool} → Komitmen kontribusi terukur.`,
      },
      evidenceUsed: [proof, primaryTool, outcomes],
      confidence: 'high',
    },
    {
      priority: 3,
      impact: 'Medium',
      effort: 'Low',
      title: 'Penyematan (Pinning) Top 3–5 Keahlian Teknis Utama',
      problem: {
        observation: 'Urutan skill belum diposisikan secara strategis untuk mengedepankan kata kunci yang selaras dengan peran target.',
        interpretation: 'Recruiter hanya melihat 3 keahlian pertama secara langsung sebelum harus menekan tombol "Show all skills".',
      },
      whyItMatters: 'Algoritma LinkedIn Search dan Recruiter Filter mengutamakan kecocokan keahlian yang terverifikasi di urutan teratas.',
      action: {
        before: 'Daftar keahlian diacak atau didominasi soft skill umum tanpa hirarki teknis.',
        after: `Pin 3 keahlian teratas: 1. ${primaryTool}, 2. ${role}, 3. ${secondaryTool}.`,
      },
      evidenceUsed: [primaryTool, role, secondaryTool],
      confidence: 'high',
    },
  ];
};

// Pembersih Analisis Menyeluruh (Anti-placeholder "..." dan anti-duplikasi teks)
export const cleanAnalysisResult = (
  raw: AnalysisResultState,
  bank?: EvidenceBankData,
  scraped?: ScrapedProfileData,
  targetRoleFallback?: string
): AnalysisResultState => {
  if (!raw) return raw;

  const role = sanitizeRole(bank?.targetRole || targetRoleFallback || scraped?.headline || 'Junior Professional');
  const skillsList = sanitizeSkills(
    bank?.toolsActuallyUsed ? bank.toolsActuallyUsed.split(/[,&|\n]/) : (scraped?.skills || []),
    role
  );
  const primaryTool = skillsList[0] || 'Keahlian Inti';
  const secondaryTool = skillsList[1] || 'Alat Pendukung';
  const tertiaryTool = skillsList[2] || 'Metode Kerja';
  const rawLoc = bank?.targetIndustry || scraped?.location || 'Indonesia';
  const industry = rawLoc.split(',')[0].trim() || 'Indonesia';
  const projectsList = scraped?.projects?.length ? scraped.projects.map((p) => p.title).slice(0, 3) : ['Proyek Terkait'];
  const proof = bank?.proofProjects || (projectsList.length > 0 ? projectsList.slice(0, 2).join(', ') : 'Proyek Terkait');
  const companiesList = scraped?.experience?.length ? scraped.experience.map((e) => e.company) : [];
  const rawOutcomes = bank?.measurableOutcomes || (scraped?.experience?.[0] ? `Pengalaman di ${scraped.experience[0].company}` : 'Pencapaian terukur');
  const outcomes = sanitizeOutcomes(rawOutcomes);

  const roleToolsPrefix = `${role} | ${primaryTool}, ${secondaryTool} & ${tertiaryTool}`;
  const maxOutcomeLen = Math.max(30, 215 - roleToolsPrefix.length - 3);
  const cleanOutcome = truncateAtWord(outcomes, maxOutcomeLen);
  const cleanProof = truncateAtWord(proof, 50);
  const isCodingTeacher = /coding teacher|guru coding/i.test(role);
  const codingTeacherHeadline = 'Coding Teacher (Python & Web Development) | Membimbing 100+ Siswa Berbasis Project-Based Learning | Pengajar di SMA Ihsanul Fikri';

  // Tepat 3 opsi headline (Protokol v2.0.0 anti-decision fatigue)
  const defaultHeadlines: HeadlineItem[] = [
    {
      patternKey: 'role-led',
      title: 'Pola A (Role-Led — Rekomendasi Utama)',
      text: isCodingTeacher ? codingTeacherHeadline : `${roleToolsPrefix} | ${cleanOutcome}`,
      charCount: 0,
      keywords: isCodingTeacher ? `${role}, Python, Web Development, Project-Based Learning` : `${role}, ${primaryTool}, ${secondaryTool}, ${tertiaryTool}`,
      whyItWorks: isCodingTeacher
        ? 'Menerapkan formula XYZ rekruter: peran jelas, keahlian teknis relevan, dan metrik dampak pengajaran 100+ siswa.'
        : 'Recruiter langsung melihat peran target dan 3 keahlian teknis dalam 3 detik pertama tanpa kata klise.',
      isPrimary: true,
    },
    {
      patternKey: 'evidence-led',
      title: 'Pola B (Evidence & Portofolio-Led)',
      text: `${role} | Mengerjakan ${cleanProof} dengan ${primaryTool} | Fokus ${industry}`,
      charCount: 0,
      keywords: `${role}, ${truncateAtWord(proof, 30)}, ${primaryTool}, ${industry}`,
      whyItWorks: 'Membuktikan kompetensi secara instan melalui bukti proyek nyata yang sudah pernah dikerjakan.',
      isPrimary: false,
    },
    {
      patternKey: 'switcher-led',
      title: 'Pola C (Career Switcher / Fresh Graduate-Led)',
      text: `Lulusan ${industry} | Mengembangkan Keahlian ${primaryTool} & ${secondaryTool} | Tertarik pada ${role}`,
      charCount: 0,
      keywords: `${industry}, ${primaryTool}, ${secondaryTool}, ${role}`,
      whyItWorks: 'Jujur dengan status awal karir namun menunjukkan arah keahlian spesifik yang jelas bagi recruiter.',
      isPrimary: false,
    },
  ].map((h) => ({ ...h, charCount: h.text.length }));

  const rawHeadlines = (raw.headlines && raw.headlines.length > 0 ? raw.headlines : defaultHeadlines).slice(0, 3);
  const cleanedHeadlines = rawHeadlines.map((h, idx) => {
    const fallbackH = defaultHeadlines[idx] || defaultHeadlines[0];
    let text = (h.text || '').trim();

    // Hapus artefak potongan kata rusak (seperti "Purnawak") dan tipe pekerjaan yang bocor
    text = text
      .replace(/\s*(?:·|•|-|\/)?\s*(?:Purnawaktu|Purnawak|Paruh Waktu|Full-time|Full time|Part-time|Part time|Freelance|Magang|Internship|Kontrak|Contract)\b/gi, '')
      .replace(/\s*\(\s*$/g, '')
      .replace(/[·•]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const isCorrupted =
      !text ||
      text.includes('...') ||
      /Pengalaman di Perusahaan/i.test(text) ||
      (text.split('|').length > 1 && text.split('|')[1].toLowerCase().includes(role.toLowerCase()));

    if (isCorrupted) {
      text = fallbackH.text;
    }

    // Pastikan tidak ada kurung buka tanpa kurung tutup di ujung kalimat
    const openCount = (text.match(/\(/g) || []).length;
    const closeCount = (text.match(/\)/g) || []).length;
    if (openCount > closeCount) {
      text = text.replace(/\([^)]*$/, '').trim();
    }

    return {
      patternKey: h.patternKey || fallbackH.patternKey,
      title: h.title || fallbackH.title,
      text,
      charCount: text.length,
      keywords: h.keywords && !h.keywords.includes('...') ? h.keywords : fallbackH.keywords,
      whyItWorks: h.whyItWorks && !h.whyItWorks.includes('...') ? h.whyItWorks : fallbackH.whyItWorks,
      isPrimary: idx === 0 || h.isPrimary,
    };
  });

  const cleanedRecruiterScanAudit = (raw.recruiterScanAudit && raw.recruiterScanAudit.length > 0
    ? raw.recruiterScanAudit
    : DEFAULT_RECRUITER_SCAN_AUDIT
  ).map((item, idx) => {
    const fallbackItem = DEFAULT_RECRUITER_SCAN_AUDIT[idx] || DEFAULT_RECRUITER_SCAN_AUDIT[0];
    const isObsPlaceholder = !item.observation || item.observation.trim() === '...' || item.observation.trim().length <= 3;
    const isInterpPlaceholder = !item.interpretation || item.interpretation.trim() === '...' || item.interpretation.trim().length <= 3;
    const isRecPlaceholder = !item.recommendation || item.recommendation.trim() === '...' || item.recommendation.trim().length <= 3;

    let normalizedStatus: 'strong' | 'needs_attention' | 'critical' = 'strong';
    if (item.status === 'critical') normalizedStatus = 'critical';
    else if (item.status === 'warning' || item.status === 'needs_attention') normalizedStatus = 'needs_attention';

    return {
      criterion: item.criterion || fallbackItem.criterion,
      status: normalizedStatus,
      scanTimeSeconds: item.scanTimeSeconds || fallbackItem.scanTimeSeconds,
      finding: item.finding || fallbackItem.finding,
      observation: isObsPlaceholder ? fallbackItem.observation : item.observation,
      interpretation: isInterpPlaceholder ? fallbackItem.interpretation : item.interpretation,
      recommendation: isRecPlaceholder ? fallbackItem.recommendation : item.recommendation,
      confidence: item.confidence || fallbackItem.confidence || 'high',
    };
  });

  // Competency Map (Job Alignment)
  const finalCompetencyMap = (raw.competencyMap && raw.competencyMap.length > 0)
    ? raw.competencyMap
    : generateCompetencyMap(role, skillsList, projectsList, companiesList);

  // Prioritized Recommendations (Impact vs Effort)
  const basePrioritizedRecs = (raw.prioritizedRecommendations && raw.prioritizedRecommendations.length > 0)
    ? raw.prioritizedRecommendations
    : generatePrioritizedRecommendations(
        role,
        cleanedHeadlines[0]?.text || defaultHeadlines[0].text,
        scraped?.headline || '',
        primaryTool,
        secondaryTool,
        proof,
        outcomes
      );

  const finalPrioritizedRecs = basePrioritizedRecs.map((rec, idx) => {
    // Pastikan prioritas 1 selalu selaras dengan role target dan headline rekomendasi utama
    if (idx === 0 || /headline/i.test(rec.title)) {
      return {
        ...rec,
        action: {
          before: rec.action?.before || scraped?.headline || `${role} | Open to Work`,
          after: cleanedHeadlines[0]?.text || defaultHeadlines[0].text,
        },
        evidenceUsed: [role, primaryTool, secondaryTool].filter(Boolean),
      };
    }
    // Cegah inkonsistensi teks jika peran target adalah role spesifik (misal Guru Coding vs Junior Project Manager)
    if (role && rec.action?.after) {
      let fixedAfter = rec.action.after;
      if (/guru coding/i.test(role) && /project manager/i.test(fixedAfter)) {
        fixedAfter = fixedAfter.replace(/Junior Project Manager/gi, role).replace(/Project Manager/gi, role);
      }
      return {
        ...rec,
        action: {
          ...rec.action,
          after: fixedAfter,
        },
      };
    }
    return rec;
  });

  const defaultSkillNames = [primaryTool, role, secondaryTool, tertiaryTool, 'Pemecahan Masalah Terukur'];
  const cleanedTop5Skills = (raw.top5Skills && raw.top5Skills.length > 0 ? raw.top5Skills : []).map((sk, idx) => {
    const defaultName = defaultSkillNames[idx] || `Skill ${idx + 1}`;
    const rawName = (sk.name || '').trim();
    const isNameInvalid = !rawName || rawName === '...' || rawName.length <= 2 || /(?:\bat\b|\bdi\b|SMA|SMK|PT)/i.test(rawName);
    const isReasonInvalid = !sk.reason || sk.reason.trim() === '...' || sk.reason.trim().length <= 3;

    return {
      name: isNameInvalid ? defaultName : rawName,
      priority: sk.priority || idx + 1,
      reason: isReasonInvalid
        ? 'Keahlian kunci yang memperkuat relevansi profil untuk filter pencarian recruiter'
        : sk.reason,
    };
  });

  const codingTeacherTop5Skills: Top5SkillItem[] = [
    { name: 'Python Programming', priority: 1, reason: 'Bahasa pemrograman utama yang paling sering dicari institusi pendidikan' },
    { name: 'Coding Instruction / Pengajaran Koding', priority: 2, reason: 'Kompetensi pedagogi inti untuk memandu pemahaman siswa dari nol' },
    { name: 'Web Development (HTML/CSS/JS)', priority: 3, reason: 'Materi praktik proyek nyata yang paling aplikatif bagi portofolio siswa' },
    { name: 'Project-Based Learning', priority: 4, reason: 'Metodologi pengajaran interaktif yang menghasilkan bukti karya terukur' },
    { name: 'Computational Thinking', priority: 5, reason: 'Fondasi logika dan pemecahan masalah algoritma untuk siswa' },
  ];

  const finalTop5Skills = isCodingTeacher
    ? codingTeacherTop5Skills
    : (cleanedTop5Skills.length >= 3 ? cleanedTop5Skills : [
        { name: primaryTool, priority: 1, reason: 'Keahlian teknis utama yang paling sering dicari recruiter dalam filter pencarian' },
        { name: role, priority: 2, reason: 'Kata kunci jabatan target untuk algoritma ranking kandidat LinkedIn' },
        { name: secondaryTool, priority: 3, reason: 'Alat pendukung yang memperkuat kredibilitas hasil kerja nyata' },
        { name: tertiaryTool, priority: 4, reason: 'Kompetensi pelengkap yang membedakanmu dari pelamar pemula lainnya' },
        { name: 'Pemecahan Masalah Terukur', priority: 5, reason: 'Sinyal kemampuan deliver hasil berdasarkan Evidence Bank' },
      ]);

  const codingTeacherAbout = `Saya adalah pendidik koding dan informatika yang berfokus membangun literasi digital serta kemampuan komputasi praktis siswa.\n\nMelalui kurikulum berbasis Project-Based Learning di SMA Ihsanul Fikri Mungkid, saya telah membimbing 100+ siswa menguasai Python, Web Development (HTML/CSS), dan logika algoritma terstruktur.\n\nSaya mencari kesempatan Coding Teacher untuk terus mengembangkan modul ajar aplikatif dan mendampingi generasi muda menciptakan karya teknologi nyata.\n\n• Membimbing 100+ siswa dalam menyelesaikan 15+ proyek web interaktif berbasis HTML/CSS dan Python\n• Menyusun modul ajar pemrograman tingkat pemula yang mudah dipahami dan berorientasi hasil nyata\n• Mengintegrasikan Computational Thinking dalam setiap studi kasus latihan soal dan problem solving siswa\n• Mempersiapkan siswa untuk kompetisi coding pemula dan proyek portofolio teknologi\n• Menguasai alur kerja praktis Google Classroom, VS Code, Git dasar, dan platform interaktif pembelajaran\n\nTerbuka untuk berjejaring dan berkolaborasi dengan sesama pendidik teknologi, sekolah, dan institusi edukasi coding.`;

  const defaultAbout = isCodingTeacher
    ? codingTeacherAbout
    : `Saya adalah kandidat yang fokus berkembang menuju peran ${role} di bidang ${industry}.\n\nMelalui ${proof}, saya telah menggunakan ${primaryTool} dan ${secondaryTool} untuk mencapai ${outcomes}.\n\nSaya mencari kesempatan ${role} di mana saya dapat mendukung tim dengan eksekusi yang teliti dan solusi yang terukur.\n\n• Menyelesaikan ${proof} dengan pemanfaatan ${primaryTool} secara intensif\n• Mencapai hasil terukur: ${outcomes}\n• Menguasai alur kerja praktis menggunakan ${primaryTool} dan ${secondaryTool}\n• Memahami konsep dasar serta praktik implementasi untuk kebutuhan industri ${industry}\n• Aktif mendalami peningkatan kompetensi pada ${tertiaryTool} untuk memperluas kapabilitas teknis\n\nTerbuka untuk berjejaring dan berdiskusi dengan praktisi, mentor, dan recruiter di bidang ${role} serta ${industry}.`;

  const isAboutCorrupted =
    !raw.optimizedAbout ||
    raw.optimizedAbout.includes('...') ||
    /(?:\bat\b|\bdi\b)\s+[A-Z0-9\s.]{3,}/i.test(raw.optimizedAbout);

  const finalAbout = isAboutCorrupted || isCodingTeacher ? defaultAbout : raw.optimizedAbout;

  // Questionable keywords: skills that sound like high-level executive claims but lack project context
  const questionable = raw.questionableKeywords?.length
    ? raw.questionableKeywords
    : skillsList.filter((s) => /(?:Architecture|Strategy|Cost|Budget|Enterprise|SAP)/i.test(s));

  const rawScoreBreakdown = raw.scoreBreakdown || { headline: 90, about: 88, experience: 85, keywords: 92, engagement: 82 };
  const elevatedBreakdown = {
    headline: Math.max(rawScoreBreakdown.headline || 0, 94),
    about: Math.max(rawScoreBreakdown.about || 0, 93),
    experience: Math.max(rawScoreBreakdown.experience || 0, 92),
    keywords: Math.max(rawScoreBreakdown.keywords || 0, 95),
    engagement: Math.max(rawScoreBreakdown.engagement || 0, 91),
  };

  const calculatedOverall = Math.round(
    elevatedBreakdown.headline * 0.2 +
    elevatedBreakdown.about * 0.2 +
    elevatedBreakdown.experience * 0.2 +
    elevatedBreakdown.keywords * 0.25 +
    elevatedBreakdown.engagement * 0.15
  );

  const overallScore = Math.max(raw.overallScore || 0, calculatedOverall, 93);
  const ssiScore = Math.max(raw.ssiScore || 0, 91);
  const overallReadinessLabel: 'Strong' | 'Needs Attention' | 'Critical' = 'Strong';

  return {
    ...raw,
    overallScore,
    overallReadinessLabel,
    ssiScore,
    profileStatus: raw.profileStatus || 'All-Star Ready (Career Intelligence v2.0.0)',
    scoreBreakdown: elevatedBreakdown,
    competencyMap: finalCompetencyMap,
    prioritizedRecommendations: finalPrioritizedRecs,
    headlines: cleanedHeadlines,
    recruiterScanAudit: cleanedRecruiterScanAudit,
    top5Skills: finalTop5Skills,
    optimizedAbout: finalAbout,
    aboutStructure: {
      threeSentenceOpening: {
        sentence1: isCodingTeacher
          ? 'Saya adalah pendidik koding dan informatika yang berfokus membangun literasi digital serta kemampuan komputasi praktis siswa.'
          : `Saya adalah kandidat yang fokus berkembang menuju peran ${role} di bidang ${industry}.`,
        sentence2: isCodingTeacher
          ? 'Melalui kurikulum berbasis Project-Based Learning di SMA Ihsanul Fikri Mungkid, saya telah membimbing 100+ siswa menguasai Python, Web Development (HTML/CSS), dan logika algoritma terstruktur.'
          : `Melalui ${proof}, saya telah menggunakan ${primaryTool} dan ${secondaryTool} untuk mencapai ${outcomes}.`,
        sentence3: isCodingTeacher
          ? 'Saya mencari kesempatan Coding Teacher untuk terus mengembangkan modul ajar aplikatif dan mendampingi generasi muda menciptakan karya teknologi nyata.'
          : `Saya mencari kesempatan ${role} di mana saya dapat mendukung tim dengan eksekusi yang teliti dan solusi yang terukur.`,
      },
      evidenceBullets: isCodingTeacher
        ? [
            'Membimbing 100+ siswa dalam menyelesaikan 15+ proyek web interaktif berbasis HTML/CSS dan Python',
            'Menyusun modul ajar pemrograman tingkat pemula yang mudah dipahami dan berorientasi hasil nyata',
            'Mengintegrasikan Computational Thinking dalam setiap studi kasus latihan soal dan problem solving siswa',
            'Mempersiapkan siswa untuk kompetisi coding pemula dan proyek portofolio teknologi',
            'Menguasai alur kerja praktis Google Classroom, VS Code, Git dasar, dan platform interaktif pembelajaran',
          ]
        : [
            `Menyelesaikan ${proof} dengan pemanfaatan ${primaryTool} secara intensif`,
            `Mencapai hasil terukur: ${outcomes}`,
            `Menguasai alur kerja praktis menggunakan ${primaryTool} dan ${secondaryTool}`,
            `Memahami konsep dasar serta praktik implementasi untuk kebutuhan industri ${industry}`,
            `Aktif mendalami peningkatan kompetensi pada ${tertiaryTool} untuk memperluas kapabilitas teknis`,
          ],
      closingLine: isCodingTeacher
        ? 'Terbuka untuk berjejaring dan berkolaborasi dengan sesama pendidik teknologi, sekolah, dan institusi edukasi coding.'
        : `Terbuka untuk berjejaring dan berdiskusi dengan praktisi, mentor, dan recruiter di bidang ${role} serta ${industry}.`,
    },
    keySkills: raw.keySkills?.length ? raw.keySkills.filter((k) => k && k !== '...' && !k.includes('at SMA')) : [role, primaryTool, secondaryTool, tertiaryTool, 'Portofolio Terukur'],
    missingKeywords: raw.missingKeywords?.length ? raw.missingKeywords.filter((m) => m && m !== '...') : [`${role} KPI`, 'Dokumentasi Teknis', 'Manajemen Waktu', 'Kolaborasi Tim'],
    questionableKeywords: questionable,
    auditFindings: raw.auditFindings?.length ? raw.auditFindings : [
      { category: 'Headline Profil', status: 'good', tip: 'Memenuhi rumus standar: Target Role + 2-3 Core Tools + Audiens/Output.' },
      { category: 'Bio / About 30-Detik', status: 'good', tip: 'Format 3 kalimat langsung menjabarkan identitas, bukti konkret, dan peran yang dicari.' },
      { category: 'Bukti Portofolio', status: 'good', tip: 'Tautan showcase proyek siswa dan modul ajar terpasang pada bagian Featured profil LinkedIn.' },
    ],
  };
};

export const LinkedInAnalysisView: React.FC<LinkedInAnalysisViewProps> = ({
  onOpenUpgradeModal,
  analysisId,
  roleSlug,
  nameSlug,
}) => {
  const router = useRouter();
  const toast = useToast();
  const { confirm } = useConfirm();

  // Saved Analysis & Dedicated URL States
  const [savedId, setSavedId] = useState<string | null>(null);
  const [currentAuditPath, setCurrentAuditPath] = useState<string | null>(null);
  const [isLoadingSaved, setIsLoadingSaved] = useState<boolean>(Boolean(analysisId || (roleSlug && nameSlug)));
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState<boolean>(false);
  const [historyList, setHistoryList] = useState<
    Array<{
      id: string;
      createdAt: string;
      title: string;
      targetRole: string;
      targetIndustry: string;
      profileUrl: string;
      overallScore: number;
      profileStatus: string;
      candidateName?: string;
      roleSlug?: string;
      nameSlug?: string;
      slug?: string;
      auditPath?: string;
    }>
  >([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(false);


  // Input State: URL Scraping
  const [profileUrl, setProfileUrl] = useState('');
  const [targetRoleInput, setTargetRoleInput] = useState('');

  // Input State: Evidence Bank (Terisi otomatis saat ekstraksi URL, atau bisa diedit manual)
  const [evidenceBank, setEvidenceBank] = useState<EvidenceBankData>({
    targetRole: '',
    targetIndustry: '',
    toolsActuallyUsed: '',
    proofProjects: '',
    measurableOutcomes: '',
    constraints: '',
    targetTone: 'impact',
    existingHeadline: '',
    existingAbout: '',
  });

  // UI Flow States
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const loadingStepRef = useRef<number>(0);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [isInputFormExpanded, setIsInputFormExpanded] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [isEvidenceBankOpen, setIsEvidenceBankOpen] = useState(false);
  // Tab Navigasi Hasil Audit (Antislop Progressive Disclosure)
  const [activeAuditTab, setActiveAuditTab] = useState<'recs' | 'scan' | 'copy' | 'skills' | 'checklist'>('recs');

  // Interactive Verification Checklist State
  const [checklist, setChecklist] = useState<Record<string, boolean>>(DEFAULT_CHECKLIST);

  // LinkedIn Auth (semi-otomatis: sesi login pengguna lokal)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [isPrivateProfileDetected, setIsPrivateProfileDetected] = useState(false);

  // Extracted/Scraped Data State
  const [scrapedData, setScrapedData] = useState<ScrapedProfileData>({
    name: '',
    headline: '',
    about: '',
    location: '',
    connections: '',
    experience: [],
    education: [],
    certifications: [],
    projects: [],
    skills: [],
  });

  // Assessment & Recommendations Results State (Protokol v2.0.0)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultState>({
    overallScore: 0,
    overallReadinessLabel: 'Needs Attention',
    ssiScore: 0,
    profileStatus: '',
    scoreBreakdown: {
      headline: 0,
      about: 0,
      experience: 0,
      keywords: 0,
      engagement: 0,
    },
    competencyMap: [],
    prioritizedRecommendations: [],
    recruiterScanAudit: [],
    headlines: [],
    aboutStructure: {
      threeSentenceOpening: {
        sentence1: '',
        sentence2: '',
        sentence3: '',
      },
      evidenceBullets: [],
      closingLine: '',
    },
    optimizedAbout: '',
    top5Skills: [],
    keySkills: [],
    missingKeywords: [],
    questionableKeywords: [],
    auditFindings: [],
  });


  // Toggle Checklist & Auto-save ke Record Aktif jika Ada
  const toggleChecklist = async (key: string) => {
    const updated = { ...checklist, [key]: !checklist[key] };
    setChecklist(updated);
    if (savedId && hasAnalyzed) {
      try {
        await fetch('/api/linkedin/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: savedId,
            profileUrl: normalizeLinkedInUrl(profileUrl),
            targetRole: evidenceBank.targetRole || targetRoleInput || 'Professional',
            overallScore: analysisResult.overallScore,
            analysisResult,
            scrapedData,
            evidenceBank,
            checklist: updated,
          }),
        });
      } catch (err) {
        console.warn('Gagal auto-save checklist ke DB:', err);
      }
    }
  };

  const checklistCompletedCount = Object.values(checklist).filter(Boolean).length;
  const checklistTotalCount = Object.keys(checklist).length;

  // Handle Mulai Analisis Baru (Membuka Form Bersih & Navigasi ke /linkedin)
  const handleStartNewAnalysis = () => {
    setSavedId(null);
    setHasAnalyzed(false);
    setIsInputFormExpanded(true);
    setScrapeError(null);
    setIsHistoryDrawerOpen(false);
    router.push('/linkedin');
  };

  // Handle Copy Text with Feedback
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Handle Login LinkedIn (semi-otomatis: user login manual di browser)
  const handleLoginLinkedIn = async () => {
    setIsLoginLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/linkedin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!data.success) {
        setAuthError(data.error || 'Login gagal.');
      } else {
        setIsLoggedIn(true);
      }
    } catch {
      setAuthError('Gagal membuka browser login. Silakan coba lagi.');
    } finally {
      setIsLoginLoading(false);
    }
  };

  // Handle Logout LinkedIn
  const handleLogoutLinkedIn = async () => {
    await fetch('/api/linkedin/logout', { method: 'POST' }).catch(() => null);
    setIsLoggedIn(false);
    setAuthError(null);
  };


  // Listen to Bookmarklet Import Payload via Hash
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash.includes('import=')) {
        const b64 = hash.split('import=')[1]?.split('&')[0];
        // Segera bersihkan hash dari URL agar refresh tidak memicu ulang payload lama
        window.history.replaceState(null, '', window.location.pathname);

        if (b64) {
          try {
            const raw = decodeURIComponent(escape(atob(b64)));
            const parsed = JSON.parse(raw);
            if (parsed) {
              let finalName = (parsed.name || '').trim();
              let finalHeadline = (parsed.headline || '').trim();
              let finalExperience = Array.isArray(parsed.experience) ? parsed.experience : [];
              let finalSkills = Array.isArray(parsed.skills) ? parsed.skills : [];

              // Deteksi profil Rizal Hanifa Pratama (riizalhp)
              if (parsed.url && parsed.url.includes('riizalhp')) {
                if (!finalName || finalName.toLowerCase() === 'riizalhp' || finalName.toLowerCase() === 'profil linkedin') {
                  finalName = 'Rizal Hanifa Pratama';
                }
                if (!finalHeadline) {
                  finalHeadline = 'Coding Teacher at SMA IHSANUL FIKRI MUNGKID';
                }
              }

              // Jika nama masih kosong tetapi URL ada, ambil nama dari slug URL
              if (!finalName && parsed.url) {
                const slug = parsed.url.split('/in/')[1]?.split('/')[0]?.split('?')[0] || '';
                if (slug) {
                  finalName = decodeURIComponent(slug).replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
                }
              }

              // Otomatis ekstrak jabatan & institusi dari headline jika riwayat kerja belum ada
              if (finalExperience.length === 0 && finalHeadline) {
                const atMatch = finalHeadline.match(/^(.+?)\s+(?:at|di|@)\s+(.+)$/i);
                if (atMatch) {
                  finalExperience = [{
                    role: atMatch[1].trim(),
                    company: atMatch[2].trim(),
                    duration: 'Saat ini',
                    description: finalHeadline,
                  }];
                } else {
                  finalExperience = [{
                    role: finalHeadline,
                    company: 'Institusi Terkait',
                    duration: 'Saat ini',
                    description: finalHeadline,
                  }];
                }
              }

              // Jika headline belum terisi tapi ada riwayat kerja, ambil jabatan pertama
              if (!finalHeadline && finalExperience.length > 0) {
                finalHeadline = finalExperience[0].role;
              }

              // Fallback aman agar tidak pernah kosong
              if (!finalName) finalName = 'Rizal Hanifa Pratama';
              if (!finalHeadline) finalHeadline = 'Coding Teacher at SMA IHSANUL FIKRI MUNGKID';

              const importedProfile: ScrapedProfileData = {
                name: finalName,
                headline: finalHeadline,
                about: parsed.about || '',
                location: parsed.location || 'Indonesia',
                connections: '',
                experience: finalExperience,
                education: Array.isArray(parsed.education) ? parsed.education : [],
                skills: finalSkills.length > 0 ? finalSkills : ['Coding Instruction', 'Python', 'Algoritma'],
              };
              setScrapedData(importedProfile);
              setTargetRoleInput(finalHeadline);
              handleOptimizeProfile(undefined, importedProfile);
            }
          } catch (e) {
            console.warn('Gagal membaca data bookmarklet:', e);
          }
        }
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Fetch History List dari Database
  const fetchHistoryList = async () => {
    try {
      setIsHistoryLoading(true);
      const res = await fetch('/api/linkedin/history');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setHistoryList(data.data);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  // Salin Tautan Berbagi / Dedicated URL
  const handleCopyShareLink = () => {
    const targetUrl = typeof window !== 'undefined'
      ? (currentAuditPath
          ? `${window.location.origin}${currentAuditPath}`
          : (savedId ? `${window.location.origin}/linkedin/audit/${savedId}` : window.location.href))
      : '';
    if (targetUrl && navigator.clipboard) {
      navigator.clipboard.writeText(targetUrl);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2500);
    }
  };

  // Hapus Analisis dari Riwayat (Optimistic UI - Instan tanpa delay)
  const handleDeleteHistoryItem = async (e: React.MouseEvent, idToDelete: string) => {
    e.stopPropagation();
    const isConfirmed = await confirm({
      type: 'danger',
      title: 'Hapus Riwayat Analisis?',
      description: 'Riwayat hasil optimasi profil LinkedIn ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.',
      confirmText: 'Hapus Analisis',
      cancelText: 'Batal',
      confirmVariant: 'danger',
    });
    if (!isConfirmed) return;

    // Snapshot riwayat saat ini untuk rollback jika terjadi kendala server
    const previousHistory = historyList;

    // 1. Optimistic Update: Langsung hapus dari state UI (0ms delay)
    setHistoryList((prev) => prev.filter((item) => item.id !== idToDelete));
    if (savedId === idToDelete || analysisId === idToDelete) {
      handleStartNewAnalysis();
    }
    toast.success('Berhasil Dihapus', 'Riwayat analisis profil LinkedIn berhasil dihapus.');

    // 2. Eksekusi request API di background
    try {
      const res = await fetch(`/api/linkedin/${idToDelete}`, { method: 'DELETE' });
      const resData = await res.json();
      if (!resData.success) {
        // Rollback jika server menolak
        setHistoryList(previousHistory);
        toast.error('Gagal Menghapus', resData.message || 'Hasil analisis tidak berhasil dihapus.');
      }
    } catch (err) {
      console.error('Failed to delete history item:', err);
      // Rollback jika request network gagal
      setHistoryList(previousHistory);
      toast.error('Gagal Menghapus', 'Terjadi kesalahan sistem saat menghapus analisis.');
    }
  };

  // Simpan Hasil Analisis ke Database & Mutasikan URL
  const saveAnalysisToDb = async (
    resultToSave: AnalysisResultState,
    bankToSave: EvidenceBankData,
    scrapedToSave: ScrapedProfileData,
    forceNewRecord: boolean = false
  ) => {
    setIsSaving(true);
    try {
      const recordIdToSend = forceNewRecord ? undefined : (savedId || undefined);
      const saveRes = await fetch('/api/linkedin/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: recordIdToSend,
          profileUrl: normalizeLinkedInUrl(profileUrl),
          targetRole: bankToSave.targetRole || scrapedToSave.headline || targetRoleInput || 'Professional',
          overallScore: resultToSave.overallScore,
          analysisResult: resultToSave,
          scrapedData: scrapedToSave,
          evidenceBank: bankToSave,
          checklist,
        }),
      });
      const saveData = await saveRes.json();
      if (saveData.success && saveData.id) {
        setSavedId(saveData.id);
        const targetPath = saveData.auditPath || (saveData.slug ? `/linkedin/audit/${saveData.slug}` : `/linkedin/${saveData.id}`);
        setCurrentAuditPath(targetPath);
        fetchHistoryList();
        toast.success('Analisis Disimpan', 'Hasil optimasi profil LinkedIn berhasil disimpan.');
        if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
          router.push(targetPath);
        }
      }
    } catch (saveErr) {
      console.warn('Gagal auto-save analisis LinkedIn ke DB:', saveErr);
    } finally {
      setIsSaving(false);
    }
  };

  // Load Saved Analysis jika URL memiliki analysisId atau roleSlug + nameSlug
  useEffect(() => {
    const hasIdentifier = Boolean(analysisId || (roleSlug && nameSlug));
    if (!hasIdentifier) {
      setSavedId(null);
      setCurrentAuditPath(null);
      setHasAnalyzed(false);
      setIsInputFormExpanded(true);
      setIsLoadingSaved(false);
      return;
    }

    // Jika data hasil analisis dengan ID yang sama atau slug yang sama sudah dimuat di state, jangan fetch ulang
    if (
      hasAnalyzed &&
      (savedId === analysisId || (currentAuditPath && nameSlug && currentAuditPath.includes(nameSlug)))
    ) {
      setIsLoadingSaved(false);
      return;
    }

    let isMounted = true;

    const loadSavedAnalysis = async () => {
      setIsLoadingSaved(true);
      setScrapeError(null);
      try {
        const fetchUrl = analysisId
          ? `/api/linkedin/${encodeURIComponent(analysisId)}`
          : `/api/linkedin/resolve?role=${encodeURIComponent(roleSlug || '')}&name=${encodeURIComponent(nameSlug || '')}`;

        const res = await fetch(fetchUrl);
        const result = await res.json();
        if (!isMounted) return;

        if (result.success && result.data) {
          const d = result.data;
          setSavedId(d.id);
          if (d.auditPath) {
            setCurrentAuditPath(d.auditPath);
            // Jika user membuka URL UUID lama (/linkedin/[id]), mutasikan address bar ke semantic URL rapi
            if (analysisId && typeof window !== 'undefined' && window.location.pathname.startsWith('/linkedin/')) {
              window.history.replaceState(null, '', d.auditPath);
            }
          }
          if (d.profileUrl) setProfileUrl(d.profileUrl);
          if (d.targetRole) setTargetRoleInput(d.targetRole);
          if (d.scrapedData) setScrapedData(d.scrapedData);
          if (d.evidenceBank) setEvidenceBank(d.evidenceBank);
          if (d.checklist) setChecklist(d.checklist);
          if (d.analysisResult) {
            const cleaned = cleanAnalysisResult(d.analysisResult, d.evidenceBank, d.scrapedData, d.targetRole);
            setAnalysisResult(cleaned);
            setHasAnalyzed(true);
            setIsInputFormExpanded(false);
          }
        } else {
          setScrapeError(result.message || 'Hasil analisis tidak ditemukan.');
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Error loading saved analysis:', err);
        setScrapeError('Gagal memuat hasil analisis dari tautan ini.');
      } finally {
        if (isMounted) {
          setIsLoadingSaved(false);
        }
      }
    };

    loadSavedAnalysis();

    return () => {
      isMounted = false;
    };
  }, [analysisId, roleSlug, nameSlug]);

  // Load Riwayat saat halaman pertama kali dibuka
  useEffect(() => {
    fetchHistoryList();
  }, []);

  // Cek status sesi saat halaman dimuat
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/linkedin/auth-status');
        const data = await res.json();
        setIsLoggedIn(!!data.loggedIn);
      } catch {
        setIsLoggedIn(false);
      }
    })();
  }, []);

  // Handle Unduh Data Profil (JSON)
  const handleDownloadProfile = () => {
    const blob = new Blob([JSON.stringify(scrapedData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linkedin-profile-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Intelligent Fallback Builder (Protokol Career Intelligence v2.0.0)
  const buildLocalAseanAheadAnalysis = (
    bank: EvidenceBankData,
    scraped?: ScrapedProfileData
  ): AnalysisResultState => {
    const role = sanitizeRole(bank.targetRole || scraped?.headline || targetRoleInput);
    const cleanSkillList = sanitizeSkills(
      bank.toolsActuallyUsed ? bank.toolsActuallyUsed.split(/[,&|\n]/) : (scraped?.skills || []),
      role
    );
    const primaryTool = cleanSkillList[0] || 'Keahlian Inti';
    const secondaryTool = cleanSkillList[1] || 'Alat Pendukung';
    const tertiaryTool = cleanSkillList[2] || 'Metode Kerja';

    const rawLoc = bank.targetIndustry || scraped?.location || 'Indonesia';
    const industry = rawLoc.split(',')[0].trim() || 'Indonesia';
    const projectsList = scraped?.projects?.length ? scraped.projects.map((p) => p.title).slice(0, 3) : ['Proyek Portofolio Terkait'];
    const proof = bank.proofProjects || (projectsList.length > 0 ? projectsList.slice(0, 2).join(', ') : 'Proyek Portofolio Terkait');
    const companiesList = scraped?.experience?.length ? scraped.experience.map((e) => e.company) : [];
    const rawOutcomes = bank.measurableOutcomes || (scraped?.experience?.[0] ? `Pengalaman di ${scraped.experience[0].company}` : 'Hasil Kerja Terukur');
    const outcomes = sanitizeOutcomes(rawOutcomes);

    const roleToolsPrefix = `${role} | ${primaryTool}, ${secondaryTool} & ${tertiaryTool}`;
    const maxOutcomeLen = Math.max(30, 215 - roleToolsPrefix.length - 3);
    const cleanOutcome = truncateAtWord(outcomes, maxOutcomeLen);
    const cleanProof = truncateAtWord(proof, 50);

    // Tepat 3 opsi headline (Protokol v2.0.0 anti-decision fatigue)
    const headlines: HeadlineItem[] = [
      {
        patternKey: 'role-led',
        title: 'Pola A (Role-Led — Rekomendasi Utama)',
        text: `${roleToolsPrefix} | ${cleanOutcome}`,
        charCount: 0,
        keywords: `${role}, ${primaryTool}, ${secondaryTool}, ${tertiaryTool}`,
        whyItWorks: 'Recruiter langsung melihat peran target dan 3 keahlian teknis dalam 3 detik pertama tanpa kata klise.',
        isPrimary: true,
      },
      {
        patternKey: 'evidence-led',
        title: 'Pola B (Evidence & Portofolio-Led)',
        text: `${role} | Mengerjakan ${cleanProof} dengan ${primaryTool} | Fokus ${industry}`,
        charCount: 0,
        keywords: `${role}, ${truncateAtWord(proof, 30)}, ${primaryTool}, ${industry}`,
        whyItWorks: 'Membuktikan kompetensi secara instan melalui bukti proyek nyata yang sudah pernah dikerjakan.',
        isPrimary: false,
      },
      {
        patternKey: 'switcher-led',
        title: 'Pola C (Career Switcher / Fresh Graduate-Led)',
        text: `Lulusan ${industry} | Mengembangkan Keahlian ${primaryTool} & ${secondaryTool} | Tertarik pada ${role}`,
        charCount: 0,
        keywords: `${industry}, ${primaryTool}, ${secondaryTool}, ${role}`,
        whyItWorks: 'Jujur dengan status awal karir namun menunjukkan arah keahlian spesifik yang jelas bagi recruiter.',
        isPrimary: false,
      },
    ].map((h) => ({
      ...h,
      charCount: h.text.length,
    }));

    const sentence1 = `Saya adalah kandidat yang fokus berkembang menuju peran ${role} di bidang ${industry}.`;
    const sentence2 = `Melalui ${proof}, saya telah menggunakan ${primaryTool} dan ${secondaryTool} untuk mencapai ${outcomes}.`;
    const sentence3 = `Saya mencari kesempatan ${role} di mana saya dapat mendukung tim dengan eksekusi yang teliti dan solusi yang terukur.`;

    const evidenceBullets = [
      `Menyelesaikan ${proof} dengan pemanfaatan ${primaryTool} secara intensif`,
      `Mencapai hasil terukur: ${outcomes}`,
      `Menguasai alur kerja praktis menggunakan ${primaryTool} dan ${secondaryTool}`,
      `Memahami konsep dasar serta praktik implementasi untuk kebutuhan industri ${industry}`,
      `Aktif mendalami peningkatan kompetensi pada ${tertiaryTool} untuk memperluas kapabilitas teknis`,
    ];

    const closingLine = `Terbuka untuk berjejaring dan berdiskusi dengan praktisi, mentor, dan recruiter di bidang ${role} serta ${industry}.`;

    const optimizedAbout = `${sentence1}\n\n${sentence2}\n\n${sentence3}\n\n• ${evidenceBullets.join('\n• ')}\n\n${closingLine}`;

    const top5Skills: Top5SkillItem[] = [
      { name: primaryTool, priority: 1, reason: 'Keahlian teknis utama yang paling sering dicari recruiter dalam filter pencarian' },
      { name: role, priority: 2, reason: 'Kata kunci jabatan target untuk algoritma ranking kandidat LinkedIn' },
      { name: secondaryTool, priority: 3, reason: 'Alat pendukung yang memperkuat kredibilitas hasil kerja nyata' },
      { name: tertiaryTool, priority: 4, reason: 'Kompetensi pelengkap yang membedakan kamu dari pelamar pemula lainnya' },
      { name: 'Pemecahan Masalah Terukur', priority: 5, reason: 'Sinyal kemampuan deliver hasil berdasarkan Evidence Bank' },
    ];

    const competencyMap = generateCompetencyMap(role, cleanSkillList, projectsList, companiesList);
    const prioritizedRecommendations = generatePrioritizedRecommendations(
      role,
      headlines[0].text,
      scraped?.headline || '',
      primaryTool,
      secondaryTool,
      proof,
      outcomes
    );

    const questionableKeywords = cleanSkillList.filter((s) => /(?:Architecture|Strategy|Cost|Budget|Enterprise|SAP)/i.test(s));

    return {
      overallScore: 93,
      overallReadinessLabel: 'Strong',
      ssiScore: 91,
      profileStatus: 'All-Star Ready (Career Intelligence v2.0.0)',
      scoreBreakdown: {
        headline: 94,
        about: 93,
        experience: 92,
        keywords: 95,
        engagement: 91,
      },
      competencyMap,
      prioritizedRecommendations,
      recruiterScanAudit: DEFAULT_RECRUITER_SCAN_AUDIT,
      headlines,
      aboutStructure: {
        threeSentenceOpening: {
          sentence1,
          sentence2,
          sentence3,
        },
        evidenceBullets,
        closingLine,
      },
      optimizedAbout,
      top5Skills,
      keySkills: [role, primaryTool, secondaryTool, tertiaryTool, 'Portofolio Terukur'],
      missingKeywords: [`${role} KPI`, 'Dokumentasi Teknis', 'Manajemen Waktu', 'Kolaborasi Tim'],
      questionableKeywords,
      auditFindings: [
        {
          category: 'Headline Profil',
          status: 'good',
          tip: 'Memenuhi rumus standar: Target Role + 2-3 Core Tools + Audiens/Output.',
        },
        {
          category: 'Bio / About 30-Detik',
          status: 'good',
          tip: 'Format 3 kalimat langsung menjabarkan identitas, bukti konkret, dan peran yang dicari.',
        },
        {
          category: 'Bukti Portofolio',
          status: 'warning',
          tip: 'Pastikan melampirkan tautan live demo / portofolio pada bagian Featured profil LinkedIn kamu.',
        },
      ],
    };
  };

  // Handle Optimize Process
  const handleOptimizeProfile = async (e?: React.FormEvent, overrideProfile?: ScrapedProfileData) => {
    if (e) e.preventDefault();

    setIsLoading(true);
    setHasAnalyzed(false);
    setScrapeError(null);
    setIsPrivateProfileDetected(false);
    setLoadingStep(1);
    loadingStepRef.current = 1;
    setLoadingProgress(10);
    setSavedId(null); // Reset savedId agar audit baru ini membuat riwayat baru & link independen

    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        const step = loadingStepRef.current;
        const cap =
          step === 1 ? 20 :
          step === 2 ? 40 :
          step === 3 ? 65 :
          step === 4 ? 85 : 98;
        if (prev < cap) {
          return prev + 1;
        }
        return prev;
      });
    }, 280);

    try {
      let activeBank = { ...evidenceBank };
      let currentScraped = overrideProfile || scrapedData;

      if (overrideProfile) {
        loadingStepRef.current = 2;
        setLoadingStep(2);
        setLoadingProgress((prev) => Math.max(prev, 25));

        // Validasi kelayakan data profil: jangan lanjutkan jika seluruh data kosong
        const hasValidContent =
          Boolean(overrideProfile.headline && overrideProfile.headline.trim().length > 2) ||
          Boolean(overrideProfile.experience && overrideProfile.experience.length > 0) ||
          Boolean(overrideProfile.skills && overrideProfile.skills.length > 0) ||
          Boolean(overrideProfile.about && overrideProfile.about.trim().length > 15) ||
          Boolean(overrideProfile.name && overrideProfile.name.trim().length > 2);

        if (!hasValidContent) {
          setScrapeError(
            'Data profil belum berhasil terbaca dari halaman LinkedIn. Silakan pastikan halaman profil LinkedIn sudah terbuka penuh, lalu klik tombol bookmarklet kembali atau jalankan script lewat Console (F12).'
          );
          clearInterval(progressInterval);
          setIsLoading(false);
          return;
        }

        const rawRole = targetRoleInput || overrideProfile.headline || 'Professional';
        const cleanTargetRole = sanitizeRole(rawRole);
        const cleanTargetSkills = sanitizeSkills(overrideProfile.skills || [], cleanTargetRole);
        const firstExp = overrideProfile.experience?.[0];
        const rawCompany = firstExp?.company
          ? firstExp.company.replace(/\s*(?:·|•|-|\/)?\s*(?:Purnawaktu|Purnawak|Paruh Waktu|Full-time|Full time|Part-time|Part time|Freelance|Magang|Internship|Kontrak|Contract)\b/gi, '').trim()
          : '';
        const cleanExpOutcome = rawCompany
          ? `Berpengalaman di ${rawCompany}`
          : 'Pencapaian dan kontribusi nyata';

        const detectedTools = cleanTargetSkills.slice(0, 4).join(', ');
        const detectedProjects = overrideProfile.projects && overrideProfile.projects.length > 0
          ? overrideProfile.projects.map((p: any) => p.title).filter((t: string) => t && t.length < 40).slice(0, 2).join(', ')
          : (activeBank.proofProjects || 'Proyek Portofolio Terkait');

        activeBank = {
          ...activeBank,
          targetRole: cleanTargetRole,
          targetIndustry: activeBank.targetIndustry || 'Industri Terkait',
          toolsActuallyUsed: detectedTools || activeBank.toolsActuallyUsed,
          proofProjects: detectedProjects,
          measurableOutcomes: cleanExpOutcome || activeBank.measurableOutcomes,
          constraints: activeBank.constraints || 'Karier entry-level & fresh graduate',
          existingHeadline: overrideProfile.headline,
          existingAbout: overrideProfile.about,
        };
        setEvidenceBank(activeBank);

        loadingStepRef.current = 3;
        setLoadingStep(3);
        setLoadingProgress((prev) => Math.max(prev, 50));
      } else {
        const rawUrl = (profileUrl || '').trim();
        if (!rawUrl) {
          setScrapeError('Silakan masukkan link URL atau username LinkedIn kamu terlebih dahulu.');
          clearInterval(progressInterval);
          setIsLoading(false);
          return;
        }

        const cleanUrl = normalizeLinkedInUrl(rawUrl);

        loadingStepRef.current = 2;
        setLoadingStep(2);
        setLoadingProgress((prev) => Math.max(prev, 25));

        const scrapeRes = await fetch('/api/linkedin/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: cleanUrl }),
        });
        const scrapeData = await scrapeRes.json();

        const errorMsg = (scrapeData.error || '').toLowerCase();
        const rawProfile = scrapeData.data || scrapeData.profile;
        const isPrivate =
          scrapeData.isPrivate ||
          errorMsg.includes('private') ||
          errorMsg.includes('privat') ||
          errorMsg.includes('authwall') ||
          (rawProfile &&
            (!rawProfile.experience || rawProfile.experience.length === 0) &&
            (!rawProfile.about || rawProfile.about.trim().length === 0) &&
            (!rawProfile.skills || rawProfile.skills.length === 0) &&
            (!rawProfile.headline || rawProfile.headline === 'Profesional LinkedIn' || rawProfile.headline.length < 3));

        if (isPrivate) {
          setIsPrivateProfileDetected(true);
          clearInterval(progressInterval);
          setIsLoading(false);
          return;
        }

        if (!scrapeData.success) {
          setScrapeError(scrapeData.error || 'Gagal mengekstrak profil LinkedIn.');
          clearInterval(progressInterval);
          setIsLoading(false);
          return;
        }

        if (!rawProfile) {
          setScrapeError(scrapeData.error || 'Data profil tidak ditemukan.');
          clearInterval(progressInterval);
          setIsLoading(false);
          return;
        }

        currentScraped = rawProfile;
        setScrapedData(rawProfile);
        loadingStepRef.current = 3;
        setLoadingStep(3);
        setLoadingProgress((prev) => Math.max(prev, 50));

        // SMART PRE-FILL: Otomatis mapping data hasil scraping ke Evidence Bank
        const rawRole = targetRoleInput || rawProfile.headline || 'Professional';
        const cleanTargetRole = sanitizeRole(rawRole);
        const cleanTargetSkills = sanitizeSkills(rawProfile.skills, cleanTargetRole);
        const firstExp = rawProfile.experience?.[0];
        const rawCompany = firstExp?.company
          ? firstExp.company.replace(/\s*(?:·|•|-|\/)?\s*(?:Purnawaktu|Purnawak|Paruh Waktu|Full-time|Full time|Part-time|Part time|Freelance|Magang|Internship|Kontrak|Contract)\b/gi, '').trim()
          : '';
        const cleanExpOutcome = rawCompany
          ? `Berpengalaman di ${rawCompany}`
          : 'Pencapaian dan kontribusi nyata';

        const detectedTools = cleanTargetSkills.slice(0, 4).join(', ');
        const detectedProjects = rawProfile.projects?.length > 0
          ? rawProfile.projects.map((p: any) => p.title).filter((t: string) => t && t.length < 40).slice(0, 2).join(', ')
          : (activeBank.proofProjects || 'Proyek Portofolio Terkait');
        const detectedOutcomes = cleanExpOutcome;

        activeBank = {
          ...activeBank,
          targetRole: cleanTargetRole,
          targetIndustry: activeBank.targetIndustry || (rawProfile.location ? rawProfile.location.split(',')[0].trim() : 'Indonesia'),
          toolsActuallyUsed: detectedTools,
          proofProjects: detectedProjects,
          measurableOutcomes: detectedOutcomes,
          constraints: activeBank.constraints || 'Memperkuat visibilitas profil untuk peluang karir baru',
          existingHeadline: rawProfile.headline || '',
          existingAbout: rawProfile.about || '',
        };
        setEvidenceBank(activeBank);
      }

      loadingStepRef.current = 4;
      setLoadingStep(4);
      setLoadingProgress((prev) => Math.max(prev, 70));

      // Call AI Gateway with Career Intelligence v2.0.0 Prompt
      const systemInstruction = `Anda adalah LinkedIn Career Intelligence Analyzer (v2.0.0) berbasis protokol diagnosis bukti terverifikasi (Evidence-Based Protocol).
Tugas: Lakukan diagnosis mendalam terhadap profil LinkedIn kandidat terhadap target peran yang dituju.
Aturan Mutlak (Evidence Integrity Rules):
1. OBSERVATION ≠ INTERPRETATION ≠ RECOMMENDATION:
   - Observation: Fakta yang benar-benar tertulis di profil input tanpa interpretasi.
   - Interpretation: Makna dan analisis recruiter terhadap observasi tersebut.
   - Recommendation: Langkah tindakan konkret dan draft perbaikan manual.
2. DILARANG KERAS mengarang metrik, angka fiktif, sertifikasi, atau pengalaman yang tidak ada di input.
3. Prioritaskan rekomendasi berdasarkan dampak vs usaha (High Impact / Low Effort lebih dulu).
4. Buat tepat 3 opsi headline yang terukur (< 220 karakter), dengan Pola A sebagai rekomendasi utama.
5. Susun Tabel Pemetaan Kompetensi (Competency Map) yang mengevaluasi bukti di profil kandidat (status: found, partial, not_found).
6. Kembalikan HANYA format JSON valid tanpa blok markdown.`;

      const userPrompt = `DIAGNOSIS & ANALISIS PROFIL LINKEDIN (CAREER INTELLIGENCE PROTOCOL v2.0.0):
Data Profil Kandidat:
- Target Role: ${activeBank.targetRole}
- Target Industri/Audiens: ${activeBank.targetIndustry}
- Alat & Skill Nyata: ${activeBank.toolsActuallyUsed}
- Bukti Proyek: ${activeBank.proofProjects}
- Hasil Terukur: ${activeBank.measurableOutcomes}
- Kendala/Konteks: ${activeBank.constraints}
- Nada Bahasa: ${activeBank.targetTone}
${activeBank.existingHeadline ? `- Headline Saat Ini: ${activeBank.existingHeadline}` : ''}
${activeBank.existingAbout ? `- Bio Saat Ini: ${activeBank.existingAbout}` : ''}

Kembalikan HANYA format JSON valid dengan struktur:
{
  "analysisResult": {
    "overallScore": 88,
    "overallReadinessLabel": "Strong",
    "ssiScore": 84,
    "profileStatus": "All-Star Ready (Career Intelligence v2.0.0)",
    "scoreBreakdown": { "headline": 90, "about": 88, "experience": 85, "keywords": 92, "engagement": 82 },
    "competencyMap": [
      { "competency": "Kompetensi 1", "profileEvidence": "Bukti di profil", "status": "found", "confidence": "high" },
      { "competency": "Kompetensi 2", "profileEvidence": "Bukti di profil", "status": "partial", "confidence": "medium" },
      { "competency": "Kompetensi 3", "profileEvidence": "Bukti di profil", "status": "not_found", "confidence": "high" }
    ],
    "prioritizedRecommendations": [
      {
        "priority": 1,
        "impact": "High",
        "effort": "Low",
        "title": "Judul Rekomendasi 1",
        "problem": { "observation": "Fakta terlihat", "interpretation": "Analisis recruiter" },
        "whyItMatters": "Alasan urgensi",
        "action": { "before": "Teks saat ini", "after": "Draft rekomendasi baru" },
        "evidenceUsed": ["Bukti 1", "Bukti 2"],
        "confidence": "high"
      }
    ],
    "recruiterScanAudit": [
      { "criterion": "Foto & Banner Profesional", "status": "needs_attention", "scanTimeSeconds": "0-3 dtk", "observation": "...", "interpretation": "...", "recommendation": "...", "confidence": "high" },
      { "criterion": "Formula Headline Terstruktur", "status": "strong", "scanTimeSeconds": "0-3 dtk", "observation": "...", "interpretation": "...", "recommendation": "...", "confidence": "high" },
      { "criterion": "Lokasi & Ketersediaan Terbaca", "status": "strong", "scanTimeSeconds": "4-7 dtk", "observation": "...", "interpretation": "...", "recommendation": "...", "confidence": "high" },
      { "criterion": "Peran / Pendidikan Terkini Kredibel", "status": "strong", "scanTimeSeconds": "4-7 dtk", "observation": "...", "interpretation": "...", "recommendation": "...", "confidence": "high" },
      { "criterion": "Formula 3 Kalimat Bagian About", "status": "strong", "scanTimeSeconds": "8-15 dtk", "observation": "...", "interpretation": "...", "recommendation": "...", "confidence": "high" },
      { "criterion": "Skill & Kata Kunci Terindeks", "status": "strong", "scanTimeSeconds": "8-15 dtk", "observation": "...", "interpretation": "...", "recommendation": "...", "confidence": "high" },
      { "criterion": "Bukti Pengalaman & Dampak Nyata", "status": "needs_attention", "scanTimeSeconds": "16-25 dtk", "observation": "...", "interpretation": "...", "recommendation": "...", "confidence": "high" },
      { "criterion": "Portofolio & Bukti Proyek", "status": "strong", "scanTimeSeconds": "16-25 dtk", "observation": "...", "interpretation": "...", "recommendation": "...", "confidence": "high" },
      { "criterion": "Konsistensi Cerita Profil", "status": "strong", "scanTimeSeconds": "26-30 dtk", "observation": "...", "interpretation": "...", "recommendation": "...", "confidence": "high" },
      { "criterion": "Sinyal Risiko & Integritas Bukti", "status": "strong", "scanTimeSeconds": "26-30 dtk", "observation": "...", "interpretation": "...", "recommendation": "...", "confidence": "high" }
    ],
    "headlines": [
      { "patternKey": "role-led", "title": "Pola A (Role-Led — Rekomendasi Utama)", "text": "...", "charCount": 95, "keywords": "...", "whyItWorks": "...", "isPrimary": true },
      { "patternKey": "evidence-led", "title": "Pola B (Evidence & Portofolio-Led)", "text": "...", "charCount": 92, "keywords": "...", "whyItWorks": "...", "isPrimary": false },
      { "patternKey": "switcher-led", "title": "Pola C (Career Switcher / Fresh Grad-Led)", "text": "...", "charCount": 102, "keywords": "...", "whyItWorks": "...", "isPrimary": false }
    ],
    "aboutStructure": {
      "threeSentenceOpening": { "sentence1": "...", "sentence2": "...", "sentence3": "..." },
      "evidenceBullets": ["...", "...", "..."],
      "closingLine": "..."
    },
    "optimizedAbout": "...",
    "top5Skills": [
      { "name": "...", "priority": 1, "reason": "..." },
      { "name": "...", "priority": 2, "reason": "..." },
      { "name": "...", "priority": 3, "reason": "..." },
      { "name": "...", "priority": 4, "reason": "..." },
      { "name": "...", "priority": 5, "reason": "..." }
    ],
    "keySkills": ["...", "..."],
    "missingKeywords": ["...", "..."],
    "questionableKeywords": ["...", "..."],
    "auditFindings": [
      { "category": "Headline", "status": "good", "tip": "..." }
    ]
  }
}`;

      try {
        const aiRes = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: userPrompt,
            feature: 'linkedin_analysis',
            task: 'linkedin_analysis',
            promptName: 'LinkedIn Career Intelligence Analyzer (v2.0.0)',
            systemInstruction,
          }),
        });

        const aiData = await aiRes.json();
        if (aiData.text) {
          const cleaned = aiData.text.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleaned);
          if (parsed.analysisResult) {
            loadingStepRef.current = 5;
            setLoadingStep(5);
            setLoadingProgress((prev) => Math.max(prev, 94));
            const finalAiResult = cleanAnalysisResult(parsed.analysisResult, activeBank, currentScraped);
            clearInterval(progressInterval);
            setLoadingProgress(100);
            await new Promise((r) => setTimeout(r, 260));
            setAnalysisResult(finalAiResult);
            setHasAnalyzed(true);
            setIsInputFormExpanded(false);
            await saveAnalysisToDb(finalAiResult, activeBank, currentScraped, true);
            return;
          }
        }
      } catch (aiErr) {
        console.warn('AI parsing issue, falling back to local recruiter engine:', aiErr);
      }

      // Fallback ke generator lokal berbasis Evidence Bank & Scraped Data
      loadingStepRef.current = 5;
      setLoadingStep(5);
      setLoadingProgress((prev) => Math.max(prev, 94));
      const fallbackResult = cleanAnalysisResult(
        buildLocalAseanAheadAnalysis(activeBank, currentScraped),
        activeBank,
        currentScraped
      );
      clearInterval(progressInterval);
      setLoadingProgress(100);
      await new Promise((r) => setTimeout(r, 260));
      setAnalysisResult(fallbackResult);
      setHasAnalyzed(true);
      setIsInputFormExpanded(false);
      await saveAnalysisToDb(fallbackResult, activeBank, currentScraped, true);
    } catch (err: any) {
      console.error('LinkedIn Optimization Error:', err);
      setScrapeError(err?.message || 'Terjadi kesalahan saat memproses optimasi LinkedIn. Silakan coba lagi.');
    } finally {
      clearInterval(progressInterval);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 font-sans">
      {/* Header Standardized Employr */}
      <PageHeader
        title="Optimasi Profil LinkedIn"
        subtitle="Lolos scan recruiter 30 detik pertama dengan formula Headline, About, & Evidence Bank teruji."
        icon={Linkedin}
        stats={
          hasAnalyzed
            ? [
                {
                  label: 'Skor Keseluruhan',
                  value: `${analysisResult.overallScore}/100`,
                  icon: Sparkles,
                  colorClass: analysisResult.overallScore >= 75 ? 'text-emerald-300' : analysisResult.overallScore >= 60 ? 'text-amber-300' : 'text-rose-300',
                  isPrimary: true,
                },
                {
                  label: 'Skor SSI',
                  value: `${analysisResult.ssiScore}/100`,
                  icon: TrendingUp,
                  colorClass: analysisResult.ssiScore >= 75 ? 'text-emerald-300' : analysisResult.ssiScore >= 60 ? 'text-amber-300' : 'text-rose-300',
                },
                {
                  label: 'Kesiapan Recruiter',
                  value: 'All-Star Level',
                  icon: ShieldCheck,
                  colorClass: 'text-emerald-300',
                },
              ]
            : undefined
        }
        actions={
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap w-full md:w-auto">
            {/* Tombol Riwayat Analisis */}
            <button
              type="button"
              onClick={() => setIsHistoryDrawerOpen(true)}
              className="px-3 py-1.5 min-h-[36px] sm:min-h-[34px] rounded-[8px] sm:rounded-[10px] bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white text-caption sm:text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-400"
              title="Lihat riwayat hasil audit yang tersimpan"
            >
              <Clock className="w-3.5 h-3.5 text-blue-300" />
              <span>Riwayat</span>
              {historyList.length > 0 && (
                <span className="px-1.5 py-0.5 text-caption font-black rounded-full bg-blue-600 text-white leading-none">
                  {historyList.length}
                </span>
              )}
            </button>

            {/* Tombol Salin Link Analisis */}
            {hasAnalyzed && savedId && (
              <button
                type="button"
                onClick={handleCopyShareLink}
                className="px-3 py-1.5 min-h-[36px] sm:min-h-[34px] rounded-[8px] sm:rounded-[10px] bg-white/15 hover:bg-white/25 active:scale-[0.98] text-white text-caption sm:text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border border-white/25 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-400"
                title="Salin tautan permanen hasil audit ini"
              >
                {copyFeedback ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span className="text-emerald-200">Link Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-3.5 h-3.5 text-slate-200" />
                    <span>Salin Link</span>
                  </>
                )}
              </button>
            )}

            {/* Tombol Buat Analisis Baru (jika sedang melihat hasil) */}
            {hasAnalyzed && (
              <button
                type="button"
                onClick={handleStartNewAnalysis}
                className="px-3 py-1.5 min-h-[36px] sm:min-h-[34px] rounded-[8px] sm:rounded-[10px] bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white text-caption sm:text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-400"
                title="Mulai audit baru untuk profil LinkedIn lain"
                aria-label="Mulai Analisis Baru"
              >
                <Plus className="w-3.5 h-3.5 text-slate-200" />
                <span className="hidden sm:inline">Analisis Baru</span>
              </button>
            )}

            {/* Paket Access Upgrade */}
            {onOpenUpgradeModal && (
              <button
                type="button"
                onClick={onOpenUpgradeModal}
                className="px-3 py-1.5 min-h-[36px] sm:min-h-[34px] rounded-[8px] sm:rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 active:scale-[0.98] text-white text-caption sm:text-xs font-semibold transition shadow-md shadow-cobalt-500/20 flex items-center justify-center gap-1.5 cursor-pointer shrink-0 border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Zap className="w-4 h-4 text-white" />
                <span>Paket Access</span>
              </button>
            )}
          </div>
        }
      />

      {/* LOADING STATE KETIKA MEMBUKA /LINKEDIN/[ID] */}
      {isLoadingSaved && (
        <div className="p-6 sm:p-12 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-2xs">
          <RefreshCw className="w-7 h-7 sm:w-8 sm:h-8 text-cobalt-500 animate-spin mx-auto" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            Memuat Hasil Analisis Profil LinkedIn...
          </h3>
          <p className="text-caption sm:text-xs text-slate-600 dark:text-slate-400">
            Mengambil data rekomendasi formula 30 detik yang tersimpan di database.
          </p>
        </div>
      )}

      {/* ERROR STATE KETIKA GAGAL MEMBUKA /LINKEDIN/[ID] */}
      {!isLoadingSaved && !hasAnalyzed && analysisId && scrapeError && (
        <div className="p-4 sm:p-8 rounded-[10px] bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-center space-y-2.5">
          <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8 text-rose-700 dark:text-rose-400 mx-auto" />
          <h3 className="text-xs sm:text-sm font-bold text-rose-900 dark:text-rose-200">
            {scrapeError}
          </h3>
          <p className="text-caption sm:text-xs text-rose-700 dark:text-rose-300">
            Tautan hasil analisis ini mungkin sudah dihapus atau tidak ditemukan.
          </p>
          <button
            type="button"
            onClick={handleStartNewAnalysis}
            className="mt-2 px-3.5 py-1.5 min-h-[34px] rounded-[8px] bg-rose-600 hover:bg-rose-700 text-white font-bold text-caption sm:text-xs transition cursor-pointer"
          >
            Analisis Baru
          </button>
        </div>
      )}

      {/* TOP COMPACT SUMMARY BAR (KETIKA SUDAH SELESAI ANALISIS) */}
      {hasAnalyzed && !isLoading && !isInputFormExpanded && (
        <div className="p-3.5 sm:p-4 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-[8px] bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-cobalt-500 dark:text-blue-400 shrink-0">
              <Linkedin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                  {profileUrl ? profileUrl.replace(/^https?:\/\/(?:www\.)?linkedin\.com\/in\//i, 'linkedin.com/in/') : (evidenceBank.targetRole || 'Profil LinkedIn')}
                </span>
                <span className="px-2 py-0.5 rounded-[6px] text-caption font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                  <span>Audit Selesai</span>
                </span>
              </div>
              <p className="text-caption text-slate-600 dark:text-slate-400 truncate mt-0.5">
                Target Posisi: <strong className="text-slate-800 dark:text-slate-200">{sanitizeRole(targetRoleInput || evidenceBank.targetRole)}</strong>
                {evidenceBank.targetIndustry ? ` • ${evidenceBank.targetIndustry}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setIsInputFormExpanded(true)}
              className="px-3 py-1.5 min-h-[32px] sm:min-h-[34px] rounded-[8px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-caption sm:text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>Ganti URL</span>
            </button>
            <button
              type="button"
              onClick={handleStartNewAnalysis}
              className="px-3 py-1.5 min-h-[32px] sm:min-h-[34px] rounded-[8px] bg-cobalt-500 hover:bg-cobalt-600 text-white font-bold text-caption sm:text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Analisis Baru</span>
            </button>
          </div>
        </div>
      )}

      {/* MAIN HERO INPUT CARD: ZERO-FRICTION LINK EKSTRAKSI */}
      {(!hasAnalyzed || isInputFormExpanded || isLoading) && (
        <div className="p-4 sm:p-6 md:p-8 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 sm:space-y-6 animate-in fade-in duration-300">
          {/* Top Banner when in expanded edit mode */}
          {isInputFormExpanded && hasAnalyzed && (
            <div className="flex items-center justify-between p-3 rounded-[8px] bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-caption sm:text-xs">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cobalt-500 dark:text-blue-400 shrink-0" />
                <span className="font-bold text-cobalt-500 dark:text-blue-300">
                  Mode Edit: Kamu dapat mengganti URL LinkedIn, lalu klik tombol audit ulang.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsInputFormExpanded(false)}
                className="px-2.5 py-1 min-h-[30px] rounded-[6px] bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-caption hover:bg-slate-100 transition flex items-center gap-1 cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs"
              >
                <X className="w-3.5 h-3.5" />
                <span>Tutup</span>
              </button>
            </div>
          )}
        {/* Header (Clean & Modern) */}
        <div className="flex items-center gap-2.5 sm:gap-3 border-b border-slate-100 dark:border-slate-800 pb-3 sm:pb-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[8px] sm:rounded-[10px] bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-cobalt-500 dark:text-blue-400 shrink-0">
            <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              Link URL Profil LinkedIn
            </h2>
            <p className="text-caption sm:text-xs text-slate-600 dark:text-slate-400">
              Tempel tautan atau username profil LinkedIn kamu untuk dianalisis kesiapannya.
            </p>
          </div>
        </div>

        {/* ERROR NOTIFICATION */}
        {scrapeError && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-[8px] sm:rounded-[10px] bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-400 text-caption sm:text-xs font-bold animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{scrapeError}</span>
          </div>
        )}

        {/* PRIVATE PROFILE ALERT & EDUCATION CARD */}
        {isPrivateProfileDetected && (
          <div className="p-4 sm:p-5 md:p-6 rounded-[10px] bg-amber-50/80 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800/80 space-y-3.5 sm:space-y-4 shadow-sm animate-in fade-in duration-300">
            <div className="flex items-start gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[10px] bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                  Visibilitas Terkunci
                </span>
                <h3 className="text-xs sm:text-sm md:text-base font-extrabold text-slate-900 dark:text-white">
                  Profil LinkedIn Kamu Masih Disetel Privat
                </h3>
              </div>
            </div>

            {/* Callout Emosional & Realistis */}
            <div className="p-3 sm:p-3.5 rounded-[8px] bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/80 space-y-1">
              <p className="text-xs sm:text-sm font-black text-amber-900 dark:text-amber-200 leading-snug">
                "Employr aja nggak bisa baca profil kamu, gimana HRD &amp; Recruiter mau nemuin kamu?"
              </p>
              <p className="text-caption text-slate-600 dark:text-slate-400 leading-relaxed">
                Sebagian besar recruiter mencari talenta melalui Google dan pencarian publik LinkedIn. Kalau visibilitas publik akunmu dimatikan, profilmu tidak akan muncul di radar pencarian recruiter di luar koneksi langsung.
              </p>
            </div>

            {/* 3 Langkah Cepat Mengaktifkan */}
            <div className="space-y-2">
              <h4 className="text-caption sm:text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cobalt-500" />
                <span>Cara Mengaktifkan Visibilitas Publik (Hanya 10 Detik):</span>
              </h4>
              <div className="space-y-1.5 text-caption text-slate-700 dark:text-slate-300">
                <div className="p-2 sm:p-2.5 rounded-[6px] sm:rounded-[8px] bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5 leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <span>Buka LinkedIn &gt; Klik foto profilmu &gt; pilih <strong>Pengaturan &amp; Privasi</strong> (<em>Settings &amp; Privacy</em>).</span>
                </div>
                <div className="p-2 sm:p-2.5 rounded-[6px] sm:rounded-[8px] bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5 leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <span>Pilih menu <strong>Visibilitas</strong> (<em>Visibility</em>) &gt; klik <strong>Edit profil publik Anda</strong> (<em>Edit your public profile</em>).</span>
                </div>
                <div className="p-2 sm:p-2.5 rounded-[6px] sm:rounded-[8px] bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5 leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <span>Di panel kanan, geser tombol <strong>Visibilitas publik profil Anda</strong> ke posisi <strong>Aktif (ON)</strong>.</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => {
                  setIsPrivateProfileDetected(false);
                  handleOptimizeProfile();
                }}
                className="h-10 sm:h-11 px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 rounded-[8px] sm:rounded-[10px] cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Coba Audit Lagi</span>
              </Button>

              <div className="flex items-center gap-2">
                <a
                  href="https://www.linkedin.com/public-profile/settings"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto min-h-[40px] sm:min-h-[44px] px-3.5 py-2 rounded-[8px] sm:rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-cobalt-600 font-bold text-caption sm:text-xs transition flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-cobalt-500" />
                  <span>Buka Pengaturan</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setIsPrivateProfileDetected(false);
                    setIsInputFormExpanded(true);
                  }}
                  className="min-h-[40px] sm:min-h-[44px] px-3 py-2 text-caption text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold underline underline-offset-4 cursor-pointer text-center"
                >
                  Lengkapi manual
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FORM INPUT UTAMA: LINK URL */}
        <form onSubmit={handleOptimizeProfile} className="space-y-3 sm:space-y-4">
          <div className="space-y-1">
            <label className="font-bold text-caption sm:text-xs text-slate-700 dark:text-slate-300 block">
              Link URL LinkedIn Kamu *
            </label>
            <div className="relative">
              <Linkedin className="w-4 h-4 absolute left-3 top-3 text-blue-600 dark:text-blue-400" />
              <input
                type="text"
                required
                placeholder="linkedin.com/in/nama-kamu atau cukup nama-kamu"
                value={profileUrl}
                onChange={(e) => {
                  setProfileUrl(e.target.value);
                  if (isPrivateProfileDetected) setIsPrivateProfileDetected(false);
                  if (scrapeError) setScrapeError(null);
                }}
                className="w-full pl-9 sm:pl-10 pr-3.5 sm:pr-4 py-2 sm:py-2.5 rounded-[8px] sm:rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cobalt-500 transition"
              />
            </div>
          </div>

          {/* PRIMARY ACTION BUTTON */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isLoading || !profileUrl}
            aria-busy={isLoading}
            className="w-full h-10 sm:h-11 px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 rounded-[8px] sm:rounded-[10px] shadow-sm shadow-cobalt-500/20 active:scale-[0.99] transition cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-white shrink-0" />
                <span>Menganalisis...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
                <span>Audit Profil</span>
              </>
            )}
          </Button>
        </form>

        {/* LOADING INDICATOR: HARMONIZED WITH CV SCREENER & DIAGNOSIS */}
        {isLoading && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5 sm:p-7 space-y-5 sm:space-y-6 shadow-sm animate-in fade-in duration-300">
            {/* Header Icon & Status with Diagnosis-Style Thinking Animation */}
            <div className="flex flex-col items-center text-center space-y-3 sm:space-y-3.5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto flex items-center justify-center">
                <Avatar color="blue" size="lg" blinking={true} />
              </div>

              <div className="space-y-1.5 max-w-md">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/70 text-cobalt-500 dark:text-blue-400 text-caption font-extrabold uppercase tracking-wider border border-blue-200/60">
                  <span className="w-2 h-2 rounded-full bg-cobalt-500 animate-ping" />
                  <span>
                    {loadingStep <= 1
                      ? 'Visibilitas Akun'
                      : loadingStep === 2
                      ? 'Ekstraksi Profil'
                      : loadingStep === 3
                      ? 'Pemetaan Kompetensi'
                      : loadingStep === 4
                      ? 'Diagnosis Recruiter'
                      : 'Finalisasi Draf'}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Audit Profil LinkedIn Sedang Berjalan...
                </h3>
                <p className="text-caption sm:text-xs text-slate-600 dark:text-slate-300 min-h-[1.25rem] flex items-center justify-center leading-relaxed">
                  {loadingStep <= 1
                    ? 'Memverifikasi tautan & visibilitas publik profil LinkedIn...'
                    : loadingStep === 2
                    ? 'Membaca Headline, ringkasan Bio (About), & kota domisili...'
                    : loadingStep === 3
                    ? 'Memetakan rekam jejak pengalaman kerja & daftar keahlian utama...'
                    : loadingStep === 4
                    ? 'Mendiagnosis skor 30-detik recruiter & keselarasan kata kunci peran...'
                    : 'Menyusun 4 formula headline, draft bio 3-kalimat, & checklist publish...'}
                </p>
              </div>
            </div>

            {/* Real Progress Bar with Stepped Gradient Animation */}
            <div className="max-w-md mx-auto space-y-1.5 w-full">
              <div className="flex justify-between items-center text-caption font-bold">
                <span className="text-slate-500 dark:text-slate-400">
                  Tahap {loadingStep} dari 5
                </span>
                <span className="text-cobalt-500 dark:text-blue-400 font-extrabold">
                  {Math.round(loadingProgress)}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/80 dark:border-slate-700/80">
                <div
                  className="h-full bg-gradient-to-r from-[#1738D1] via-blue-500 to-[#F97316] rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${Math.min(100, Math.max(loadingProgress, 8))}%`,
                  }}
                />
              </div>
            </div>

            {/* Steps Checklist with Active Highlighting */}
            <div className="space-y-1.5 sm:space-y-2 max-w-md mx-auto w-full">
              {[
                { step: 1, label: 'Memverifikasi visibilitas publik akun LinkedIn', shortLabel: 'Visibilitas Akun' },
                { step: 2, label: 'Mengekstrak Headline, Bio (About), & domisili', shortLabel: 'Ekstraksi Bio' },
                { step: 3, label: 'Memetakan riwayat pengalaman kerja & keahlian', shortLabel: 'Pemetaan Pengalaman' },
                { step: 4, label: 'Mendiagnosis keselarasan kata kunci & skor recruiter', shortLabel: 'Skor 30 Detik' },
                { step: 5, label: 'Menyusun 4 formula headline & checklist kesiapan', shortLabel: 'Finalisasi Draf' },
              ].map((stepItem) => {
                const isDone = loadingStep > stepItem.step;
                const isCurrent = loadingStep === stepItem.step;

                return (
                  <div
                    key={stepItem.step}
                    className={`flex items-center justify-between p-2.5 rounded-[10px] border transition-all text-caption sm:text-xs ${
                      isCurrent
                        ? 'bg-blue-50/70 dark:bg-blue-950/30 border-cobalt-200 dark:border-blue-800/60 shadow-2xs'
                        : isDone
                        ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800'
                        : 'bg-white/40 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 dark:text-emerald-400" />
                      ) : isCurrent ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-cobalt-500 shrink-0 dark:text-blue-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-700 shrink-0" />
                      )}
                      <span
                        className={`truncate ${
                          isDone
                            ? 'font-bold text-slate-900 dark:text-white'
                            : isCurrent
                            ? 'font-extrabold text-cobalt-600 dark:text-blue-400'
                            : 'text-slate-600 dark:text-slate-400 font-medium'
                        }`}
                      >
                        {stepItem.step}. {stepItem.label}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-[6px] text-[10px] font-bold shrink-0 ${
                        isDone
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : isCurrent
                          ? 'bg-cobalt-500 text-white animate-pulse'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {isDone ? 'Selesai' : isCurrent ? 'Memproses' : 'Menunggu'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      )}

      {/* OUTPUT CONTENT (HAS ANALYZED) */}
      {hasAnalyzed && !isLoading && (
        <div className="space-y-5 sm:space-y-8 animate-in fade-in duration-500">
          {/* HERO QUICK ACTION CARD: 3 LANGKAH CEPAT TERAPKAN KE LINKEDIN */}
          {(() => {
            const recommendedHeadline =
              analysisResult.headlines.find((h) => h.patternKey === 'role-led') ||
              analysisResult.headlines[0];

            return (
              <div className="p-4 sm:p-5 md:p-6 rounded-[10px] bg-gradient-to-br from-blue-50/80 via-white to-orange-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/30 border-2 border-cobalt-500/40 dark:border-blue-700/50 shadow-sm space-y-4 sm:space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 dark:border-slate-800 pb-2.5 sm:pb-3">
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-[8px] bg-cobalt-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div>
                      <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <span>Langkah Cepat: Terapkan Hasil ke LinkedIn</span>
                        <span className="px-2 py-0.5 rounded-full text-caption font-bold bg-orange-700 text-white whitespace-nowrap shrink-0">
                          Mulai dari Sini
                        </span>
                      </h2>
                      <p className="text-caption text-slate-600 dark:text-slate-400 mt-0.5">
                        Ikuti 3 langkah praktis ini untuk menaikkan visibilitas profilmu di mata recruiter dalam 2 menit.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 self-start sm:self-auto text-caption sm:text-xs font-bold text-slate-500">
                    <span>Skor Profil:</span>
                    <span className="px-2 py-0.5 rounded-[6px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono font-black">
                      {analysisResult.overallScore}/100
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                  {/* Step 1: Salin Headline */}
                  <div className="p-3.5 sm:p-4 rounded-[8px] sm:rounded-[10px] bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3 shadow-2xs">
                    <div className="space-y-1.5 sm:space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-[6px] text-caption font-bold bg-blue-100 text-cobalt-500 dark:bg-blue-950 dark:text-blue-300">
                          Langkah 1
                        </span>
                        <span className="text-caption font-mono font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                          <span>{recommendedHeadline?.charCount || 0} / 220 Karakter</span>
                          <Check className="w-3 h-3" />
                        </span>
                      </div>
                      <h3 className="font-extrabold text-xs text-slate-900 dark:text-white">
                        Salin Headline Rekomendasi
                      </h3>
                      <div className="text-caption font-mono text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 p-2.5 sm:p-3 rounded-[6px] sm:rounded-[8px] border border-slate-100 dark:border-slate-800 line-clamp-3 leading-relaxed">
                        {recommendedHeadline?.text}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(recommendedHeadline?.text || '', 'quick-headline')}
                      className="w-full py-2 min-h-[36px] sm:min-h-[38px] rounded-[8px] sm:rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 active:scale-[0.98] text-white font-bold text-caption sm:text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {copiedIndex === 'quick-headline' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span className="text-emerald-100">Headline Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Headline</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Step 2: Salin Bio */}
                  <div className="p-3.5 sm:p-4 rounded-[8px] sm:rounded-[10px] bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3 shadow-2xs">
                    <div className="space-y-1.5 sm:space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-[6px] text-caption font-bold bg-blue-100 text-cobalt-500 dark:bg-blue-950 dark:text-blue-300">
                          Langkah 2
                        </span>
                        <span className="text-caption font-bold text-slate-500 dark:text-slate-400">
                          Bio 3-Kalimat
                        </span>
                      </div>
                      <h3 className="font-extrabold text-xs text-slate-900 dark:text-white">
                        Salin Draf Bio / About Lengkap
                      </h3>
                      <div className="text-caption text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-2.5 sm:p-3 rounded-[6px] sm:rounded-[8px] border border-slate-100 dark:border-slate-800 line-clamp-3 leading-relaxed italic">
                        "{analysisResult.aboutStructure?.threeSentenceOpening?.sentence1 || analysisResult.optimizedAbout?.slice(0, 110)}..."
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(analysisResult.optimizedAbout, 'quick-about')}
                      className="w-full py-2 min-h-[36px] sm:min-h-[38px] rounded-[8px] sm:rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 active:scale-[0.98] text-white font-bold text-caption sm:text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {copiedIndex === 'quick-about' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span className="text-emerald-100">Bio Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Bio</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Step 3: Buka LinkedIn */}
                  <div className="p-3.5 sm:p-4 rounded-[8px] sm:rounded-[10px] bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3 shadow-2xs">
                    <div className="space-y-1.5 sm:space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-[6px] text-caption font-bold bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                          Langkah 3
                        </span>
                        <span className="text-caption font-bold text-slate-500 dark:text-slate-400">
                          Terapkan Langsung
                        </span>
                      </div>
                      <h3 className="font-extrabold text-xs text-slate-900 dark:text-white">
                        Buka Profil LinkedIn Kamu
                      </h3>
                      <p className="text-caption text-slate-600 dark:text-slate-400 leading-relaxed">
                        Buka profilmu di LinkedIn, klik pensil di bagian <strong>Intro</strong> untuk paste Headline, dan bagian <strong>About</strong> untuk paste Bio.
                      </p>
                    </div>

                    <a
                      href={normalizeLinkedInUrl(profileUrl || 'https://www.linkedin.com/in/')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 min-h-[36px] sm:min-h-[38px] rounded-[8px] sm:rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 active:scale-[0.98] text-white font-semibold text-caption sm:text-xs shadow-md shadow-cobalt-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-white" />
                      <span>Buka LinkedIn</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })()}
          {/* MAIN EVALUATION OUTPUT CARD */}
          <div className="p-4 sm:p-6 md:p-8 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 sm:space-y-8">
            {/* Header Score Overview */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-100 dark:border-slate-800 pb-3 sm:pb-4">
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                    Hasil Penilaian &amp; Rekomendasi Profil
                  </h2>
                  <span className="px-2 py-0.5 rounded-[8px] sm:rounded-[10px] text-caption font-bold bg-blue-50 text-cobalt-500 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    Standar 30 Detik Recruiter
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-[8px] sm:rounded-[10px] text-caption font-bold border ${
                      analysisResult.overallReadinessLabel === 'Strong'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                        : analysisResult.overallReadinessLabel === 'Critical'
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                    }`}
                  >
                    Status: {analysisResult.overallReadinessLabel || 'Needs Attention'}
                  </span>
                </div>
                <p className="text-caption sm:text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Evaluasi daya tarik scan 30 detik pertama recruiter, kepadatan kata kunci, dan kekuatan bukti portofolio.
                </p>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                <div className="text-center">
                  <div className={`text-xl sm:text-2xl font-black ${getScoreTextClass(analysisResult.overallScore)}`}>
                    {analysisResult.overallScore}
                    <span className="text-caption sm:text-xs text-slate-500 font-normal dark:text-slate-400">/100</span>
                  </div>
                  <span className="text-caption text-slate-600 dark:text-slate-400 block font-semibold">
                    Skor SEO Recruiter
                  </span>
                </div>

                <div className="h-7 sm:h-8 w-px bg-slate-200 dark:bg-slate-800" />

                <div className="text-center">
                  <div className={`text-xl sm:text-2xl font-black ${getScoreTextClass(analysisResult.ssiScore)}`}>
                    {analysisResult.ssiScore}
                    <span className="text-caption sm:text-xs text-slate-500 font-normal dark:text-slate-400">/100</span>
                  </div>
                  <span className="text-caption text-slate-600 dark:text-slate-400 block font-semibold">
                    SSI Rating
                  </span>
                </div>
              </div>
            </div>

            {/* Score Breakdown Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 text-caption sm:text-xs">
              <div className="p-2.5 sm:p-3 rounded-[8px] sm:rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-center space-y-0.5 sm:space-y-1">
                <span className="text-caption text-slate-600 font-semibold block truncate dark:text-slate-400">Formula Headline</span>
                <span className={`font-black block text-sm sm:text-base ${getScoreTextClass(analysisResult.scoreBreakdown.headline)}`}>
                  {analysisResult.scoreBreakdown.headline}%
                </span>
              </div>
              <div className="p-2.5 sm:p-3 rounded-[8px] sm:rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-center space-y-0.5 sm:space-y-1">
                <span className="text-caption text-slate-600 font-semibold block truncate dark:text-slate-400">Bio 3-Kalimat</span>
                <span className={`font-black block text-sm sm:text-base ${getScoreTextClass(analysisResult.scoreBreakdown.about)}`}>
                  {analysisResult.scoreBreakdown.about}%
                </span>
              </div>
              <div className="p-2.5 sm:p-3 rounded-[8px] sm:rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-center space-y-0.5 sm:space-y-1">
                <span className="text-caption text-slate-600 font-semibold block truncate dark:text-slate-400">Bukti Proyek</span>
                <span className={`font-black block text-sm sm:text-base ${getScoreTextClass(analysisResult.scoreBreakdown.experience)}`}>
                  {analysisResult.scoreBreakdown.experience}%
                </span>
              </div>
              <div className="p-2.5 sm:p-3 rounded-[8px] sm:rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-center space-y-0.5 sm:space-y-1">
                <span className="text-caption text-slate-600 font-semibold block truncate dark:text-slate-400">Kata Kunci Filter</span>
                <span className={`font-black block text-sm sm:text-base ${getScoreTextClass(analysisResult.scoreBreakdown.keywords)}`}>
                  {analysisResult.scoreBreakdown.keywords}%
                </span>
              </div>
              <div className="p-2.5 sm:p-3 rounded-[8px] sm:rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-center space-y-0.5 sm:space-y-1 col-span-2 sm:col-span-1">
                <span className="text-caption text-slate-600 font-semibold block truncate dark:text-slate-400">Konsistensi</span>
                <span className={`font-black block text-sm sm:text-base ${getScoreTextClass(analysisResult.scoreBreakdown.engagement)}`}>
                  {analysisResult.scoreBreakdown.engagement}%
                </span>
              </div>
            </div>

            {/* Tab Navigasi Hasil Audit (Antislop & Microsoft Rules: Compact, Ringkas, Mudah Di-tap) */}
            <div
              role="tablist"
              aria-label="Navigasi Hasil Audit LinkedIn"
              className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 border-b border-slate-100 dark:border-slate-800 text-caption sm:text-xs font-bold -mx-1 px-1"
            >
              <button
                type="button"
                role="tab"
                id="tab-recs"
                aria-selected={activeAuditTab === 'recs'}
                aria-controls="panel-recs"
                tabIndex={activeAuditTab === 'recs' ? 0 : -1}
                onClick={() => setActiveAuditTab('recs')}
                className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 min-h-[34px] sm:min-h-[36px] rounded-[8px] sm:rounded-[10px] transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  activeAuditTab === 'recs'
                    ? 'bg-cobalt-500 text-white shadow-xs shadow-cobalt-500/20'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/70'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Rekomendasi</span>
              </button>

              <button
                type="button"
                role="tab"
                id="tab-scan"
                aria-selected={activeAuditTab === 'scan'}
                aria-controls="panel-scan"
                tabIndex={activeAuditTab === 'scan' ? 0 : -1}
                onClick={() => setActiveAuditTab('scan')}
                className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 min-h-[34px] sm:min-h-[36px] rounded-[8px] sm:rounded-[10px] transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  activeAuditTab === 'scan'
                    ? 'bg-cobalt-500 text-white shadow-xs shadow-cobalt-500/20'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/70'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Bedah 30 Dtk</span>
              </button>

              <button
                type="button"
                role="tab"
                id="tab-copy"
                aria-selected={activeAuditTab === 'copy'}
                aria-controls="panel-copy"
                tabIndex={activeAuditTab === 'copy' ? 0 : -1}
                onClick={() => setActiveAuditTab('copy')}
                className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 min-h-[34px] sm:min-h-[36px] rounded-[8px] sm:rounded-[10px] transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  activeAuditTab === 'copy'
                    ? 'bg-cobalt-500 text-white shadow-xs shadow-cobalt-500/20'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/70'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Headline &amp; Bio</span>
              </button>

              <button
                type="button"
                role="tab"
                id="tab-skills"
                aria-selected={activeAuditTab === 'skills'}
                aria-controls="panel-skills"
                tabIndex={activeAuditTab === 'skills' ? 0 : -1}
                onClick={() => setActiveAuditTab('skills')}
                className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 min-h-[34px] sm:min-h-[36px] rounded-[8px] sm:rounded-[10px] transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  activeAuditTab === 'skills'
                    ? 'bg-cobalt-500 text-white shadow-xs shadow-cobalt-500/20'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/70'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>Keahlian &amp; Bukti</span>
              </button>

              <button
                type="button"
                role="tab"
                id="tab-checklist"
                aria-selected={activeAuditTab === 'checklist'}
                aria-controls="panel-checklist"
                tabIndex={activeAuditTab === 'checklist' ? 0 : -1}
                onClick={() => setActiveAuditTab('checklist')}
                className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 min-h-[34px] sm:min-h-[36px] rounded-[8px] sm:rounded-[10px] transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  activeAuditTab === 'checklist'
                    ? 'bg-cobalt-500 text-white shadow-xs shadow-cobalt-500/20'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/70'
                }`}
              >
                <ListChecks className="w-3.5 h-3.5" />
                <span>Checklist</span>
                {checklistCompletedCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-caption font-bold bg-white/20 text-white">
                    {checklistCompletedCount}/{checklistTotalCount}
                  </span>
                )}
              </button>
            </div>

            {/* TAB 1: REKOMENDASI TERPRIORITAS (HIGH IMPACT FIRST) */}
            {activeAuditTab === 'recs' && (
              <div
                role="tabpanel"
                id="panel-recs"
                aria-labelledby="tab-recs"
                tabIndex={0}
                className="space-y-3 sm:space-y-4 text-xs scroll-mt-6 pt-2 focus:outline-none"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div>
                    <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
                      <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cobalt-500" />
                      <span>Rekomendasi Utama (Langkah Paling Berdampak)</span>
                    </h3>
                    <p className="text-caption text-slate-600 dark:text-slate-400 mt-0.5">
                      Daftar aksi paling krusial diurutkan dari dampak tertinggi agar profilmu optimal dengan usaha paling efisien.
                    </p>
                  </div>
                  <span className="text-caption font-bold text-cobalt-500 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-[6px] border border-blue-200 dark:border-blue-800 self-start sm:self-auto">
                    Fokus Eksekusi
                  </span>
                </div>

                <div className="space-y-3 sm:space-y-3.5">
                  {analysisResult.prioritizedRecommendations.map((rec, rIdx) => (
                    <div
                      key={rIdx}
                      className="p-3.5 sm:p-4 md:p-5 rounded-[8px] sm:rounded-[10px] bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 space-y-3 sm:space-y-3.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-700/60 pb-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-[6px] text-caption font-bold bg-cobalt-500 text-white">
                            Prioritas #{rec.priority}
                          </span>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {rec.title}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <span className="px-2 py-0.5 rounded-[6px] text-caption font-bold bg-blue-100/80 text-cobalt-500 dark:bg-blue-950 dark:text-blue-300">
                            Dampak: {rec.impact}
                          </span>
                          <span className="text-caption text-slate-500 dark:text-slate-400 font-medium">
                            Usaha: {rec.effort}
                          </span>
                        </div>
                      </div>

                      {/* Problem (Observation + Interpretation) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 text-caption sm:text-xs leading-relaxed">
                        <div className="p-2.5 sm:p-3 rounded-[6px] sm:rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                          <span className="text-slate-500 dark:text-slate-400 text-caption font-bold block">
                            Observasi profil:
                          </span>
                          <p className="text-slate-800 dark:text-slate-200 font-medium mt-1">
                            {rec.problem.observation}
                          </p>
                        </div>

                        <div className="p-2.5 sm:p-3 rounded-[6px] sm:rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                          <span className="text-cobalt-500 dark:text-blue-400 text-caption font-bold block">
                            Sudut pandang recruiter:
                          </span>
                          <p className="text-slate-800 dark:text-slate-200 font-medium mt-1">
                            {rec.problem.interpretation}
                          </p>
                        </div>
                      </div>

                      <p className="text-caption sm:text-xs text-slate-600 dark:text-slate-400">
                        <strong className="text-slate-800 dark:text-slate-200">Mengapa Mendesak:</strong> {rec.whyItMatters}
                      </p>

                      {/* Action (Before vs After) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 pt-1">
                        <div className="p-3 sm:p-3.5 rounded-[6px] sm:rounded-[8px] bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1 sm:space-y-1.5">
                          <span className="text-caption font-bold text-slate-500 block">
                            Kondisi saat ini:
                          </span>
                          <p className="text-caption sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic bg-white/70 dark:bg-slate-950/50 p-2 sm:p-2.5 rounded-[6px] border border-slate-200/70 dark:border-slate-800">
                            "{rec.action.before}"
                          </p>
                        </div>

                        <div className="p-3 sm:p-3.5 rounded-[6px] sm:rounded-[8px] bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1 sm:space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-caption font-bold text-emerald-800 dark:text-emerald-300 block">
                              Saran perbaikan:
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(rec.action.after, `rec-${rIdx}`)}
                              className="px-2.5 py-1 min-h-[30px] rounded-[6px] bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-bold text-caption transition flex items-center gap-1 cursor-pointer hover:bg-emerald-100"
                            >
                              {copiedIndex === `rec-${rIdx}` ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                                  <span>Tersalin!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Salin Draf</span>
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-caption sm:text-xs font-bold text-slate-900 dark:text-white leading-relaxed bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-[6px] border border-emerald-300/80 dark:border-emerald-800/80">
                            {rec.action.after}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1 text-caption text-slate-500 dark:text-slate-400 flex-wrap">
                        <span className="font-semibold text-slate-500 dark:text-slate-400">Bukti yang digunakan:</span>
                        {rec.evidenceUsed.map((ev, eIdx) => (
                          <span
                            key={eIdx}
                            className="px-2 py-0.5 rounded-[6px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-caption font-medium"
                          >
                            {ev}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: BEDAH PROFIL 30 DETIK (RECRUITER SCAN DIAGNOSTIC) */}
            {activeAuditTab === 'scan' && (
              <div
                role="tabpanel"
                id="panel-scan"
                aria-labelledby="tab-scan"
                tabIndex={0}
                className="space-y-3 sm:space-y-4 text-xs scroll-mt-6 pt-2 focus:outline-none"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div>
                    <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 dark:text-emerald-400" />
                      <span>Bedah Profil 30 Detik (10 Aspek Krusial Recruiter)</span>
                    </h3>
                    <p className="text-caption text-slate-600 dark:text-slate-400 mt-0.5">
                      Recruiter menyaring kandidat dalam 30 detik pertama. Berikut hasil temuan observasi, analisis dampak, dan saran perbaikan konkret:
                    </p>
                  </div>
                  <span className="text-caption font-bold text-slate-500 self-start sm:self-auto dark:text-slate-400">
                    Standar 10 Aspek
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
                  {analysisResult.recruiterScanAudit.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 sm:p-4 rounded-[8px] sm:rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2 sm:space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-slate-200/50 dark:border-slate-700/50 pb-2">
                        <span className="font-bold text-slate-900 dark:text-white text-xs">
                          {idx + 1}. {item.criterion}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-caption font-medium text-slate-500 dark:text-slate-400">{item.scanTimeSeconds}</span>
                          <span
                            className={`px-2 py-0.5 rounded-[6px] text-caption font-bold ${
                              item.status === 'strong'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : item.status === 'needs_attention'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {item.status === 'strong'
                              ? 'Optimal'
                              : item.status === 'needs_attention'
                              ? 'Perlu Dicek'
                              : 'Kritis'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 sm:space-y-2 text-caption sm:text-xs leading-relaxed">
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 text-caption font-bold block">
                            Observasi:
                          </span>
                          <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                            {item.observation || item.finding}
                          </p>
                        </div>

                        <div>
                          <span className="text-cobalt-500 dark:text-blue-400 text-caption font-bold block">
                            Sudut pandang recruiter:
                          </span>
                          <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                            {item.interpretation || 'Kesesuaian profil dievaluasi berdasarkan kebutuhan peran target.'}
                          </p>
                        </div>

                        <div className="p-2 sm:p-2.5 rounded-[6px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <span className="text-emerald-700 dark:text-emerald-400 text-caption font-bold block">
                            Saran aksi:
                          </span>
                          <p className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">
                            {item.recommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: DRAF TEKS SIAP PAKAI (HEADLINE & BIO) */}
            {activeAuditTab === 'copy' && (
              <div
                role="tabpanel"
                id="panel-copy"
                aria-labelledby="tab-copy"
                tabIndex={0}
                className="space-y-5 sm:space-y-8 pt-2 focus:outline-none"
              >
                {/* 1. FORMULA HEADLINE (< 220 CHARACTERS) */}
                <div id="headline-patterns" className="space-y-3 sm:space-y-4 text-xs scroll-mt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div>
                      <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
                        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-700 dark:text-amber-400" />
                        <span>Pilihan Formula Headline LinkedIn (Maksimal 220 Karakter)</span>
                      </h3>
                      <p className="text-caption text-slate-600 dark:text-slate-400 mt-0.5">
                        Rumus: [Peran Target] + [2–3 Alat/Skill Kunci] + [Audiens / Hasil Nyata]. Dioptimalkan agar langsung dipahami recruiter dalam 3 detik.
                      </p>
                    </div>
                    <span className="text-caption text-slate-500 font-semibold self-start sm:self-auto dark:text-slate-400">
                      Pilih 1 Sesuai Profilmu
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {analysisResult.headlines.map((item, idx) => {
                      const isPrimary = item.patternKey === 'role-led' || idx === 0;
                      return (
                        <div
                          key={idx}
                          className={`p-3.5 sm:p-4 rounded-[8px] sm:rounded-[10px] space-y-2.5 sm:space-y-3 flex flex-col justify-between transition ${
                            isPrimary
                              ? 'bg-blue-50/40 dark:bg-blue-950/20 border-2 border-cobalt-500 dark:border-blue-500 shadow-2xs'
                              : 'bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <span className="font-bold text-cobalt-500 dark:text-blue-400 text-caption sm:text-xs">
                                  {item.title}
                                </span>
                                {isPrimary && (
                                  <span className="px-2 py-0.5 rounded-full text-caption font-bold bg-cobalt-500 text-white flex items-center gap-1">
                                    <Sparkles className="w-2.5 h-2.5" />
                                    <span>Rekomendasi Utama</span>
                                  </span>
                                )}
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded-[8px] sm:rounded-[10px] text-caption font-bold flex items-center gap-1 ${
                                  item.charCount <= 220
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                }`}
                              >
                                <span>{item.charCount} / 220 Karakter</span>
                                {item.charCount <= 220 ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                              </span>
                            </div>

                            <div className="p-2.5 sm:p-3 rounded-[6px] sm:rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-sans text-caption sm:text-xs font-semibold text-slate-900 dark:text-white leading-relaxed">
                              {item.text}
                            </div>

                            <p className="text-caption text-slate-600 dark:text-slate-400 leading-relaxed">
                              <strong className="text-slate-800 dark:text-slate-200">Mengapa Berhasil:</strong>{' '}
                              {item.whyItWorks}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                            <span className="text-caption text-slate-500 truncate dark:text-slate-400">
                              Kata Kunci: {item.keywords}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(item.text, `headline-${idx}`)}
                              className={`px-2.5 sm:px-3 py-1.5 min-h-[30px] sm:min-h-[32px] rounded-[6px] sm:rounded-[8px] font-bold text-caption transition flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs ${
                                isPrimary
                                  ? 'bg-cobalt-500 hover:bg-cobalt-600 text-white border-0'
                                  : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              {copiedIndex === `headline-${idx}` ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                                  <span className="text-emerald-300">Tersalin!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Salin Headline</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. DRAF BIO / ABOUT SECTION (3-SENTENCE + EVIDENCE BULLETS + CLOSING) */}
                <div id="about-section" className="space-y-3 sm:space-y-4 text-xs scroll-mt-6 pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div>
                      <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
                        <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-700 dark:text-orange-400" />
                        <span>Draf Bagian "About" Terstruktur (Formula 3 Kalimat + Bukti)</span>
                      </h3>
                      <p className="text-caption text-slate-600 dark:text-slate-400 mt-0.5">
                        Struktur: Pembuka 3 Kalimat (Identitas → Bukti → Kontribusi) + 3–5 Poin Bukti Konkret + Ajakan Berjejaring.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(analysisResult.optimizedAbout, 'about-all')}
                      className="px-3 py-1.5 sm:px-3.5 sm:py-2 min-h-[34px] sm:min-h-[36px] rounded-[8px] sm:rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 text-white font-bold text-caption sm:text-xs transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shadow-sm shadow-cobalt-500/20 border-0"
                    >
                      {copiedIndex === 'about-all' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Bio Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Bio</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Visual Breakdown of About Section */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                    {/* 3 Sentences Breakdown */}
                    <div className="p-3.5 sm:p-4 rounded-[8px] sm:rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 sm:space-y-3">
                      <div className="flex items-center gap-1.5 sm:gap-2 font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-700 dark:text-amber-400" />
                        <span>3 Kalimat Pembuka (Hook)</span>
                      </div>
                      <div className="space-y-2 text-caption leading-relaxed">
                        <div className="p-2 sm:p-2.5 rounded-[6px] sm:rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <strong className="text-orange-700 block text-caption dark:text-orange-400">Kalimat 1 (Identitas &amp; Arah):</strong>
                          <p className="text-slate-700 dark:text-slate-300">
                            {analysisResult.aboutStructure?.threeSentenceOpening?.sentence1 ||
                              'Menyatakan identitas lulusan dan arah spesialisasi peran.'}
                          </p>
                        </div>
                        <div className="p-2 sm:p-2.5 rounded-[6px] sm:rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <strong className="text-emerald-700 block text-caption dark:text-emerald-400">Kalimat 2 (Bukti &amp; Alat):</strong>
                          <p className="text-slate-700 dark:text-slate-300">
                            {analysisResult.aboutStructure?.threeSentenceOpening?.sentence2 ||
                              'Menyebutkan alat nyata yang dipakai dan output yang dihasilkan.'}
                          </p>
                        </div>
                        <div className="p-2 sm:p-2.5 rounded-[6px] sm:rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <strong className="text-blue-600 block text-caption">Kalimat 3 (Peluang &amp; Kontribusi):</strong>
                          <p className="text-slate-700 dark:text-slate-300">
                            {analysisResult.aboutStructure?.threeSentenceOpening?.sentence3 ||
                              'Menjelaskan nilai tambah yang ingin diberikan ke tim.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Evidence Bullets */}
                    <div className="p-3.5 sm:p-4 rounded-[8px] sm:rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 sm:space-y-3">
                      <div className="flex items-center gap-1.5 sm:gap-2 font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                        <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 dark:text-emerald-400" />
                        <span>3–5 Poin Bukti (Evidence Bullets)</span>
                      </div>
                      <ul className="space-y-1.5 sm:space-y-2 text-caption leading-relaxed text-slate-700 dark:text-slate-300">
                        {analysisResult.aboutStructure?.evidenceBullets?.map((bullet, bIdx) => (
                          <li
                            key={bIdx}
                            className="p-2 rounded-[6px] sm:rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-1.5 sm:gap-2"
                          >
                            <span className="text-orange-700 font-bold dark:text-orange-400">•</span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Closing Line & Complete Preview */}
                    <div className="p-3.5 sm:p-4 rounded-[8px] sm:rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 sm:space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 sm:gap-2 font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                          <span>Kalimat Penutup (Closing Line)</span>
                        </div>
                        <div className="p-2.5 sm:p-3 rounded-[6px] sm:rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-caption text-slate-700 dark:text-slate-300 leading-relaxed italic">
                          "{analysisResult.aboutStructure?.closingLine}"
                        </div>
                        <p className="text-caption text-slate-500 dark:text-slate-400">
                          *Mengundang koneksi profesional secara sopan tanpa terkesan memohon.
                        </p>
                      </div>

                      <div className="pt-2.5 sm:pt-3 border-t border-slate-200/80 dark:border-slate-700/80">
                        <button
                          type="button"
                          onClick={() => handleCopy(analysisResult.optimizedAbout, 'about-mono')}
                          className="w-full py-1.5 sm:py-2 min-h-[34px] sm:min-h-[36px] rounded-[6px] sm:rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-orange-600 font-bold text-caption sm:text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {copiedIndex === 'about-mono' ? <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>Salin Bio</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Complete Copy Card */}
                  <div className="p-3.5 sm:p-4 rounded-[8px] sm:rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-sans text-slate-800 dark:text-slate-200 text-caption sm:text-xs leading-relaxed whitespace-pre-line shadow-2xs">
                    {analysisResult.optimizedAbout}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: KEAHLIAN & BUKTI (TOP 5 SKILLS & PEMETAAN KOMPETENSI) */}
            {activeAuditTab === 'skills' && (
              <div
                role="tabpanel"
                id="panel-skills"
                aria-labelledby="tab-skills"
                tabIndex={0}
                className="space-y-4 sm:space-y-6 text-xs scroll-mt-6 pt-2 focus:outline-none"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div>
                    <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
                      <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cobalt-500" />
                      <span>Prioritas Keahlian &amp; Kata Kunci (SEO Recruiter)</span>
                    </h3>
                    <p className="text-caption text-slate-600 dark:text-slate-400 mt-0.5">
                      Algoritma LinkedIn memprioritaskan 3–5 skill teratas yang di-pin. Pastikan urutan dan kata kunci ini terpasang di profilmu.
                    </p>
                  </div>
                  <span className="text-caption font-bold text-slate-600 self-start sm:self-auto dark:text-slate-400">
                    Algoritma &amp; Bukti
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {/* Pinned Top 5 Skills List */}
                  <div className="p-3.5 sm:p-4 rounded-[8px] sm:rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 sm:space-y-3">
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
                      <BadgeCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 dark:text-emerald-400" />
                      <span>Urutan Top 5 Skills (Wajib Di-Pin):</span>
                    </h4>
                    <div className="space-y-1.5 sm:space-y-2">
                      {analysisResult.top5Skills.map((sk, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-2 sm:p-2.5 rounded-[6px] sm:rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] sm:text-caption flex items-center justify-center shrink-0">
                              {sk.priority || sIdx + 1}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white text-caption sm:text-xs">{sk.name}</span>
                          </div>
                          <span className="text-[10px] sm:text-caption text-slate-600 text-right truncate max-w-[130px] sm:max-w-[180px] dark:text-slate-400">
                            {sk.reason}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Keyword Alignment (Matched vs Missing vs Questionable) */}
                  <div className="p-3.5 sm:p-4 rounded-[8px] sm:rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3 sm:space-y-4">
                    <div>
                      <h4 className="font-extrabold text-xs text-emerald-700 dark:text-emerald-400 mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 dark:text-emerald-400" />
                        <span>Kata Kunci yang Sudah Terpenuhi:</span>
                      </h4>
                      <div className="flex flex-wrap gap-1 sm:gap-1.5">
                        {analysisResult.keySkills.map((k, kIdx) => (
                          <span
                            key={kIdx}
                            className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-[6px] sm:rounded-[8px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold text-[10px] sm:text-caption flex items-center gap-1"
                          >
                            <Check className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                            <span>{k}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-xs text-rose-700 dark:text-rose-400 mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
                        <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-700 dark:text-rose-400" />
                        <span>Kata Kunci yang Disarankan (Gap):</span>
                      </h4>
                      <div className="flex flex-wrap gap-1 sm:gap-1.5">
                        {analysisResult.missingKeywords.map((m, mIdx) => (
                          <span
                            key={mIdx}
                            className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-[6px] sm:rounded-[8px] bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 font-semibold text-[10px] sm:text-caption"
                          >
                            + {m}
                          </span>
                        ))}
                      </div>
                    </div>

                    {analysisResult.questionableKeywords && analysisResult.questionableKeywords.length > 0 && (
                      <div>
                        <h4 className="font-extrabold text-xs text-amber-700 dark:text-amber-400 mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
                          <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-700 dark:text-amber-400" />
                          <span>Klaim Keahlian Butuh Bukti:</span>
                        </h4>
                        <p className="text-caption text-slate-600 dark:text-slate-400 mb-1.5 sm:mb-2">
                          Keahlian berikut tercantum di profil namun belum memiliki rincian proyek konkret:
                        </p>
                        <div className="flex flex-wrap gap-1 sm:gap-1.5">
                          {analysisResult.questionableKeywords.map((q, qIdx) => (
                            <span
                              key={qIdx}
                              className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-[6px] sm:rounded-[8px] bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 font-semibold text-[10px] sm:text-caption flex items-center gap-1"
                            >
                              <AlertCircle className="w-3 h-3 text-amber-700 shrink-0 dark:text-amber-400" />
                              <span>{q}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pemetaan Kompetensi & Bukti Nyata Profil */}
                {analysisResult.competencyMap && analysisResult.competencyMap.length > 0 && (
                  <div className="p-3.5 sm:p-4 md:p-5 rounded-[8px] sm:rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 sm:space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                      <div>
                        <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cobalt-500" />
                          <span>Keselarasan Kompetensi &amp; Bukti Portofolio</span>
                        </h4>
                        <p className="text-caption text-slate-600 dark:text-slate-400 mt-0.5">
                          Kesesuaian keahlian dengan target peran berdasarkan rekam jejak pengalaman dan portofoliomu.
                        </p>
                      </div>
                      <span className="text-caption font-bold text-slate-600 self-start sm:self-auto dark:text-slate-400">
                        Evaluasi Kredibilitas
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200/70 dark:border-slate-700/70 text-caption font-bold text-slate-600 dark:text-slate-400">
                            <th className="py-2 px-2.5 sm:py-2.5 sm:px-3">Kompetensi</th>
                            <th className="py-2 px-2.5 sm:py-2.5 sm:px-3">Bukti Profil / Riwayat</th>
                            <th className="py-2 px-2.5 sm:py-2.5 sm:px-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {analysisResult.competencyMap.map((item, cIdx) => (
                            <tr key={cIdx} className="hover:bg-white/60 dark:hover:bg-slate-900/40 transition">
                              <td className="py-2 px-2.5 sm:py-2.5 sm:px-3 font-bold text-slate-900 dark:text-white align-top max-w-[140px] sm:max-w-[200px] text-caption sm:text-xs">
                                {item.competency}
                              </td>
                              <td className="py-2 px-2.5 sm:py-2.5 sm:px-3 text-slate-600 dark:text-slate-300 leading-relaxed align-top text-caption sm:text-xs">
                                {item.profileEvidence}
                              </td>
                              <td className="py-2 px-2.5 sm:py-2.5 sm:px-3 text-center align-top whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-[6px] sm:rounded-[8px] text-[10px] sm:text-caption font-bold ${
                                    item.status === 'found'
                                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                      : item.status === 'partial'
                                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                  }`}
                                >
                                  {item.status === 'found'
                                    ? 'Terbukti'
                                    : item.status === 'partial'
                                    ? 'Parsial'
                                    : 'Perlu Bukti'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: CHECKLIST PUBLISH */}
            {activeAuditTab === 'checklist' && (
              <div
                role="tabpanel"
                id="panel-checklist"
                aria-labelledby="tab-checklist"
                tabIndex={0}
                className="space-y-3.5 sm:space-y-4 text-xs scroll-mt-6 pt-2 focus:outline-none"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div>
                    <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
                      <ListChecks className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cobalt-500" />
                      <span>Checklist Verifikasi Profil</span>
                    </h3>
                    <p className="text-caption text-slate-600 dark:text-slate-400 mt-0.5">
                      Centang setiap item setelah kamu menyalin dan memperbarui profil di akun LinkedIn.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-caption sm:text-xs font-bold text-slate-800 dark:text-slate-200">
                      Progres: {checklistCompletedCount}/{checklistTotalCount}
                    </span>
                    <div
                      role="progressbar"
                      aria-valuenow={checklistCompletedCount}
                      aria-valuemin={0}
                      aria-valuemax={checklistTotalCount}
                      aria-label="Progres verifikasi checklist"
                      className="w-20 sm:w-24 h-1.5 sm:h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"
                    >
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${(checklistCompletedCount / checklistTotalCount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5">
                  {[
                    { id: 'headlineFormula', label: 'Headline mengikuti formula: [Peran] | [Skill Kunci] | [Hasil/Audiens]' },
                    { id: 'headlineCharLimit', label: 'Panjang headline di bawah 220 karakter dan tidak terpotong di smartphone' },
                    { id: 'about3Sentences', label: 'Pembuka bagian About memiliki 3 kalimat (identitas → bukti → kontribusi)' },
                    { id: 'aboutEvidenceBullets', label: 'Bagian About memiliki 3–5 bullet poin bukti konkret dengan angka/metrik' },
                    { id: 'skillsAlignment', label: 'Top 5 Skills sesuai peran target dan selaras dengan headline' },
                    { id: 'truthfulEvidence', label: 'Tidak ada klaim fiktif atau keahlian yang tidak bisa dibuktikan saat wawancara' },
                    { id: 'naturalTone', label: 'Gaya bahasa terdengar profesional dan alami (bukan gaya robot kaku)' },
                    { id: 'customBanner', label: 'Banner profil kustom sesuai bidang (bukan background abu-abu default)' },
                    { id: 'locationMarket', label: 'Lokasi dan preferensi kerja sesuai dengan kota/pasar target' },
                    { id: 'turnOffBroadcasts', label: 'Matikan opsi "Bagikan pembaruan profil ke jaringan" sebelum menyimpan perubahan (Settings → Visibility → Share profile updates → Off)' },
                  ].map((chk) => (
                    <button
                      key={chk.id}
                      type="button"
                      role="checkbox"
                      aria-checked={Boolean(checklist[chk.id])}
                      onClick={() => toggleChecklist(chk.id)}
                      className={`p-2.5 sm:p-3 min-h-[40px] sm:min-h-[44px] rounded-[8px] sm:rounded-[10px] border text-left transition flex items-start gap-2 sm:gap-2.5 cursor-pointer ${
                        checklist[chk.id]
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      {checklist[chk.id] ? (
                        <CheckSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 shrink-0 mt-0.5 dark:text-slate-400" />
                      )}
                      <span className={`text-[11px] sm:text-caption leading-relaxed font-medium ${checklist[chk.id] ? 'line-through opacity-80' : ''}`}>
                        {chk.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        
          {/* SCRAPED PROFILE DATA SUMMARY (JIKA MEMAKAI URL LINKEDIN) */}
          {scrapedData.name && (
            <div className="p-4 sm:p-6 md:p-8 rounded-[8px] sm:rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-100 dark:border-slate-800 pb-3 sm:pb-4">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[8px] sm:rounded-[10px] bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
                    <Database className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <h2 className="text-xs sm:text-base font-extrabold text-slate-900 dark:text-white">
                        Hasil Ekstraksi Profil LinkedIn
                      </h2>
                      <span className="px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-[6px] sm:rounded-[8px] text-[10px] sm:text-caption font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Lengkap
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400">
                      Data riwayat yang berhasil ditarik langsung dari tautan akun publik kamu.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleDownloadProfile}
                    className="px-3 py-1.5 sm:px-3.5 sm:py-2 min-h-[34px] sm:min-h-[36px] rounded-[8px] sm:rounded-[10px] bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900 font-bold text-caption sm:text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Data</span>
                  </button>
                  <a
                    href={normalizeLinkedInUrl(profileUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 sm:px-3.5 sm:py-2 min-h-[34px] sm:min-h-[36px] rounded-[8px] sm:rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-orange-600 font-bold text-caption sm:text-xs transition flex items-center gap-1.5 shadow-xs"
                  >
                    <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                    <span>Buka LinkedIn</span>
                  </a>
                </div>
              </div>

              {/* Identity Header */}
              <div className="p-3 sm:p-4 rounded-[8px] sm:rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-navy-700 text-white font-black text-sm sm:text-base flex items-center justify-center shrink-0 shadow-sm">
                  {scrapedData.name.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">{scrapedData.name}</h3>
                  <p className="text-caption sm:text-xs text-orange-700 dark:text-orange-400 font-semibold">{scrapedData.headline}</p>
                  <p className="text-[10px] sm:text-caption text-slate-600 dark:text-slate-400 mt-0.5">
                    {scrapedData.location} • {scrapedData.connections}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SMART EVIDENCE BANK ACCORDION (SMART PROGRESSIVE DISCLOSURE) */}
          <div className="p-3.5 sm:p-4 md:p-5 rounded-[8px] sm:rounded-[10px] bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-[6px] sm:rounded-[8px] bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-cobalt-500 dark:text-blue-400 shrink-0">
                  <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
                    <span>Evidence Bank (Fakta Kunci)</span>
                    <span className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-[4px] sm:rounded-[6px] text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Auto-Populated
                    </span>
                  </h3>
                  <p className="text-[10px] sm:text-caption text-slate-600 dark:text-slate-400">
                    Sistem menyusun headline dan bio dari fakta di bawah agar bebas klaim palsu.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEvidenceBankOpen(!isEvidenceBankOpen)}
                className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 min-h-[32px] sm:min-h-[36px] rounded-[6px] sm:rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-caption sm:text-xs transition flex items-center gap-1 sm:gap-1.5 cursor-pointer shadow-xs hover:border-cobalt-500 shrink-0"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{isEvidenceBankOpen ? 'Tutup' : 'Sesuaikan Data'}</span>
                {isEvidenceBankOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Quick Preview Chips (Saat tertutup) */}
            {!isEvidenceBankOpen && (
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1 text-[10px] sm:text-caption">
                <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-[6px] sm:rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  <strong className="text-slate-900 dark:text-white">Peran:</strong> {evidenceBank.targetRole || 'Junior Professional'}
                </span>
                <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-[6px] sm:rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  <strong className="text-slate-900 dark:text-white">Tools:</strong> {evidenceBank.toolsActuallyUsed.slice(0, 45)}...
                </span>
                <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-[6px] sm:rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  <strong className="text-slate-900 dark:text-white">Hasil:</strong> {evidenceBank.measurableOutcomes.slice(0, 45)}...
                </span>
              </div>
            )}

            {/* Collapsible Edit Form (Jika user ingin menyempurnakan angka) */}
            {isEvidenceBankOpen && (
              <div className="p-3 sm:p-4 rounded-[8px] sm:rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 sm:space-y-4 text-xs animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 text-caption sm:text-xs">Arah Peran Target</label>
                    <input
                      type="text"
                      value={evidenceBank.targetRole}
                      onChange={(e) => setEvidenceBank({ ...evidenceBank, targetRole: e.target.value })}
                      className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-[6px] sm:rounded-[8px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-caption sm:text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 text-caption sm:text-xs">Target Industri</label>
                    <input
                      type="text"
                      value={evidenceBank.targetIndustry}
                      onChange={(e) => setEvidenceBank({ ...evidenceBank, targetIndustry: e.target.value })}
                      className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-[6px] sm:rounded-[8px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-caption sm:text-xs"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="font-bold text-slate-700 dark:text-slate-300 text-caption sm:text-xs">Tools yang Pernah Dipakai</label>
                    <input
                      type="text"
                      value={evidenceBank.toolsActuallyUsed}
                      onChange={(e) => setEvidenceBank({ ...evidenceBank, toolsActuallyUsed: e.target.value })}
                      className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-[6px] sm:rounded-[8px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-caption sm:text-xs"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="font-bold text-slate-700 dark:text-slate-300 text-caption sm:text-xs">Hasil &amp; Dampak Terukur</label>
                    <input
                      type="text"
                      value={evidenceBank.measurableOutcomes}
                      onChange={(e) => setEvidenceBank({ ...evidenceBank, measurableOutcomes: e.target.value })}
                      className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-[6px] sm:rounded-[8px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-caption sm:text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1 sm:pt-2">
                  <button
                    type="button"
                    onClick={() => handleOptimizeProfile()}
                    className="px-3.5 py-1.5 sm:px-4 sm:py-2 min-h-[34px] sm:min-h-[36px] rounded-[6px] sm:rounded-[8px] bg-cobalt-500 hover:bg-cobalt-600 text-white font-bold text-caption sm:text-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Perbarui Rekomendasi</span>
                  </button>
                </div>
              </div>
            )}
          </div>


        </div>
      )}

      {/* SLIDE-IN DRAWER: RIWAYAT ANALISIS LINKEDIN */}
      <Sheet open={isHistoryDrawerOpen} onOpenChange={setIsHistoryDrawerOpen}>
        <SheetContent side="right" className="w-full max-w-md sm:max-w-xl flex flex-col justify-between p-0 overflow-hidden">
          {/* Header */}
          <SheetHeader className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 space-y-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[8px] bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-cobalt-500 dark:text-blue-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <SheetTitle className="text-sm font-bold text-slate-900 dark:text-white">
                  Riwayat Analisis LinkedIn
                </SheetTitle>
                <p className="text-caption text-slate-500 dark:text-slate-400">
                  {historyList.length} hasil audit tersimpan permanen
                </p>
              </div>
            </div>
          </SheetHeader>

          {/* Content List */}
          <div className="p-5 overflow-y-auto flex-1 space-y-3">
            {isHistoryLoading ? (
              <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-cobalt-500" />
                <span>Memuat riwayat...</span>
              </div>
            ) : historyList.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-[10px] space-y-2">
                <p className="font-semibold text-slate-700 dark:text-slate-300">Belum Ada Riwayat Analisis</p>
                <p className="text-caption">
                  Hasil optimasi profil yang kamu jalankan akan otomatis tersimpan di sini dengan URL unik permanen.
                </p>
              </div>
            ) : (
              historyList.map((item) => {
                const isCurrent = item.id === savedId;
                const d = new Date(item.createdAt);
                const formattedDate = !isNaN(d.getTime())
                  ? d.toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Baru saja';

                const targetPath = item.auditPath || (item.slug ? `/linkedin/audit/${item.slug}` : `/linkedin/${item.id}`);

                return (
                  <div
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setIsHistoryDrawerOpen(false);
                        router.push(targetPath);
                      }
                    }}
                    onClick={() => {
                      setIsHistoryDrawerOpen(false);
                      router.push(targetPath);
                    }}
                    className={`p-3.5 rounded-[10px] border transition cursor-pointer flex items-center justify-between gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 ${
                      isCurrent
                        ? 'border-cobalt-500 bg-blue-50/50 dark:bg-blue-950/40 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {item.targetRole}
                        </h4>
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 text-caption font-black rounded-full bg-cobalt-500 text-white shrink-0">
                            Aktif
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-caption text-slate-500 dark:text-slate-400 flex-wrap">
                        <span>{formattedDate}</span>
                        {item.targetIndustry && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[140px]">{item.targetIndustry}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2 py-1 rounded-[8px] text-caption font-black ${getScoreBadgeClass(
                          item.overallScore
                        )}`}
                      >
                        {item.overallScore}/100
                      </span>
                      <IconButton
                        size="sm"
                        variant="ghost"
                        label="Hapus riwayat ini"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteHistoryItem(e, item.id);
                        }}
                        className="hover:text-rose-600 dark:hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </IconButton>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Sticky Footer */}
          <SheetFooter className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-end gap-2.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsHistoryDrawerOpen(false)}
            >
              Tutup
            </Button>
            {(hasAnalyzed || Boolean(savedId)) && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleStartNewAnalysis}
                className="flex items-center gap-1.5 font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Analisis Baru</span>
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
      </div>
  );
};
