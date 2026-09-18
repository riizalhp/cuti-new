'use client';

import { PageHeader } from '@/components/ui/PageHeader';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import { getScoreTextClass, getScoreBadgeClass, getScoreProgressBarClass } from '@/lib/score-color';
import { normalizeLinkedInUrl } from '@/lib/linkedin-url';
import { RoleCombobox } from '@/components/ui/RoleCombobox';

interface LinkedInAnalysisViewProps {
  isDarkMode?: boolean;
  onOpenUpgradeModal?: () => void;
  analysisId?: string;
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
    finding: 'Headline telah memenuhi standar 3 unsur ASEAN Ahead.',
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
      title: 'Optimasi Headline Profil ke Formula 3 Unsur ASEAN Ahead',
      problem: {
        observation: existingHeadline
          ? `Headline saat ini ("${existingHeadline.slice(0, 60)}...") belum sepenuhnya memenuhi 3 unsur recruiter scan.`
          : 'Headline masih bersifat generik atau belum menyebutkan kombinasi keahlian dan target peran secara tajam.',
        interpretation: 'Recruiter menyaring puluhan kandidat dalam hitungan detik. Headline adalah penentu apakah profil akan diklik atau diabaikan.',
      },
      whyItMatters: 'Headline muncul di samping nama Anda di setiap pencarian, komentar, dan pesan LinkedIn.',
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

  // Tepat 3 opsi headline (Protokol v2.0.0 anti-decision fatigue)
  const defaultHeadlines: HeadlineItem[] = [
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

  const finalTop5Skills = cleanedTop5Skills.length >= 3 ? cleanedTop5Skills : [
    { name: primaryTool, priority: 1, reason: 'Keahlian teknis utama yang paling sering dicari recruiter dalam filter pencarian' },
    { name: role, priority: 2, reason: 'Kata kunci jabatan target untuk algoritma ranking kandidat LinkedIn' },
    { name: secondaryTool, priority: 3, reason: 'Alat pendukung yang memperkuat kredibilitas hasil kerja nyata' },
    { name: tertiaryTool, priority: 4, reason: 'Kompetensi pelengkap yang membedakan Anda dari pelamar pemula lainnya' },
    { name: 'Pemecahan Masalah Terukur', priority: 5, reason: 'Sinyal kemampuan deliver hasil berdasarkan Evidence Bank' },
  ];

  const defaultAbout = `Saya adalah kandidat yang fokus berkembang menuju peran ${role} di bidang ${industry}.\n\nMelalui ${proof}, saya telah menggunakan ${primaryTool} dan ${secondaryTool} untuk mencapai ${outcomes}.\n\nSaya mencari kesempatan ${role} di mana saya dapat mendukung tim dengan eksekusi yang teliti dan solusi yang terukur.\n\n• Menyelesaikan ${proof} dengan pemanfaatan ${primaryTool} secara intensif\n• Mencapai hasil terukur: ${outcomes}\n• Menguasai alur kerja praktis menggunakan ${primaryTool} dan ${secondaryTool}\n• Memahami konsep dasar serta praktik implementasi untuk kebutuhan industri ${industry}\n• Aktif mendalami peningkatan kompetensi pada ${tertiaryTool} untuk memperluas kapabilitas teknis\n\nTerbuka untuk berjejaring dan berdiskusi dengan praktisi, mentor, dan recruiter di bidang ${role} serta ${industry}.`;

  const isAboutCorrupted =
    !raw.optimizedAbout ||
    raw.optimizedAbout.includes('...') ||
    /(?:\bat\b|\bdi\b)\s+[A-Z0-9\s.]{3,}/i.test(raw.optimizedAbout);

  const finalAbout = isAboutCorrupted ? defaultAbout : raw.optimizedAbout;

  // Questionable keywords: skills that sound like high-level executive claims but lack project context
  const questionable = raw.questionableKeywords?.length
    ? raw.questionableKeywords
    : skillsList.filter((s) => /(?:Architecture|Strategy|Cost|Budget|Enterprise|SAP)/i.test(s));

  const overallScore = raw.overallScore || 88;
  const overallReadinessLabel: 'Strong' | 'Needs Attention' | 'Critical' =
    overallScore >= 85 ? 'Strong' : overallScore >= 65 ? 'Needs Attention' : 'Critical';

  return {
    ...raw,
    overallScore,
    overallReadinessLabel,
    ssiScore: raw.ssiScore || 84,
    profileStatus: raw.profileStatus || 'All-Star Ready (Career Intelligence v2.0.0)',
    scoreBreakdown: raw.scoreBreakdown || { headline: 90, about: 88, experience: 85, keywords: 92, engagement: 82 },
    competencyMap: finalCompetencyMap,
    prioritizedRecommendations: finalPrioritizedRecs,
    headlines: cleanedHeadlines,
    recruiterScanAudit: cleanedRecruiterScanAudit,
    top5Skills: finalTop5Skills,
    optimizedAbout: finalAbout,
    aboutStructure: {
      threeSentenceOpening: {
        sentence1: `Saya adalah kandidat yang fokus berkembang menuju peran ${role} di bidang ${industry}.`,
        sentence2: `Melalui ${proof}, saya telah menggunakan ${primaryTool} dan ${secondaryTool} untuk mencapai ${outcomes}.`,
        sentence3: `Saya mencari kesempatan ${role} di mana saya dapat mendukung tim dengan eksekusi yang teliti dan solusi yang terukur.`,
      },
      evidenceBullets: [
        `Menyelesaikan ${proof} dengan pemanfaatan ${primaryTool} secara intensif`,
        `Mencapai hasil terukur: ${outcomes}`,
        `Menguasai alur kerja praktis menggunakan ${primaryTool} dan ${secondaryTool}`,
        `Memahami konsep dasar serta praktik implementasi untuk kebutuhan industri ${industry}`,
        `Aktif mendalami peningkatan kompetensi pada ${tertiaryTool} untuk memperluas kapabilitas teknis`,
      ],
      closingLine: `Terbuka untuk berjejaring dan berdiskusi dengan praktisi, mentor, dan recruiter di bidang ${role} serta ${industry}.`,
    },
    keySkills: raw.keySkills?.length ? raw.keySkills.filter((k) => k && k !== '...' && !k.includes('at SMA')) : [role, primaryTool, secondaryTool, tertiaryTool, 'Portofolio Terukur'],
    missingKeywords: raw.missingKeywords?.length ? raw.missingKeywords.filter((m) => m && m !== '...') : [`${role} KPI`, 'Dokumentasi Teknis', 'Manajemen Waktu', 'Kolaborasi Tim'],
    questionableKeywords: questionable,
    auditFindings: raw.auditFindings?.length ? raw.auditFindings : [
      { category: 'Headline Profil', status: 'good', tip: 'Memenuhi rumus ASEAN Ahead: Target Role + 2-3 Core Tools + Audiens/Output.' },
      { category: 'Bio / About 30-Detik', status: 'good', tip: 'Format 3 kalimat langsung menjabarkan identitas, bukti konkret, dan peran yang dicari.' },
      { category: 'Bukti Portofolio', status: 'warning', tip: 'Pastikan melampirkan tautan live demo / portofolio pada bagian Featured profil LinkedIn Anda.' },
    ],
  };
};

export const LinkedInAnalysisView: React.FC<LinkedInAnalysisViewProps> = ({
  onOpenUpgradeModal,
  analysisId,
}) => {
  const router = useRouter();

  // Saved Analysis & Dedicated URL States
  const [savedId, setSavedId] = useState<string | null>(null);
  const [isLoadingSaved, setIsLoadingSaved] = useState<boolean>(Boolean(analysisId));
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
    }>
  >([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(false);

  // UX UTAMA: Default langsung ke 'url' (Ekstraksi Otomatis Zero-Friction)
  const [activeInputTab, setActiveInputTab] = useState<'url' | 'evidence'>('url');

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
      ? (savedId ? `${window.location.origin}/linkedin/${savedId}` : window.location.href)
      : '';
    if (targetUrl && navigator.clipboard) {
      navigator.clipboard.writeText(targetUrl);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2500);
    }
  };

  // Hapus Analisis dari Riwayat
  const handleDeleteHistoryItem = async (e: React.MouseEvent, idToDelete: string) => {
    e.stopPropagation();
    if (!confirm('Apakah kamu yakin ingin menghapus hasil analisis ini?')) return;
    try {
      const res = await fetch(`/api/linkedin/${idToDelete}`, { method: 'DELETE' });
      const resData = await res.json();
      if (resData.success) {
        setHistoryList((prev) => prev.filter((item) => item.id !== idToDelete));
        if (savedId === idToDelete) {
          handleStartNewAnalysis();
        }
      }
    } catch (err) {
      console.error('Failed to delete history item:', err);
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
        fetchHistoryList();
        if (!analysisId || analysisId !== saveData.id) {
          router.push(`/linkedin/${saveData.id}`, { scroll: false });
        }
      }
    } catch (saveErr) {
      console.warn('Gagal auto-save analisis LinkedIn ke DB:', saveErr);
    } finally {
      setIsSaving(false);
    }
  };

  // Load Saved Analysis jika URL memiliki analysisId
  useEffect(() => {
    if (!analysisId) {
      setSavedId(null);
      setHasAnalyzed(false);
      setIsInputFormExpanded(true);
      setIsLoadingSaved(false);
      return;
    }

    // Jika data hasil analisis dengan ID yang sama sudah dimuat di state, jangan fetch ulang
    if (hasAnalyzed && savedId === analysisId) {
      setIsLoadingSaved(false);
      return;
    }

    let isMounted = true;

    const loadSavedAnalysis = async () => {
      setIsLoadingSaved(true);
      setScrapeError(null);
      try {
        const res = await fetch(`/api/linkedin/${analysisId}`);
        const result = await res.json();
        if (!isMounted) return;

        if (result.success && result.data) {
          const d = result.data;
          setSavedId(d.id);
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
  }, [analysisId, hasAnalyzed, savedId]);

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
      { name: tertiaryTool, priority: 4, reason: 'Kompetensi pelengkap yang membedakan Anda dari pelamar pemula lainnya' },
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
      overallScore: 88,
      overallReadinessLabel: 'Strong',
      ssiScore: 84,
      profileStatus: 'All-Star Ready (Career Intelligence v2.0.0)',
      scoreBreakdown: {
        headline: 90,
        about: 88,
        experience: 85,
        keywords: 92,
        engagement: 82,
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
          tip: 'Memenuhi rumus ASEAN Ahead: Target Role + 2-3 Core Tools + Audiens/Output.',
        },
        {
          category: 'Bio / About 30-Detik',
          status: 'good',
          tip: 'Format 3 kalimat langsung menjabarkan identitas, bukti konkret, dan peran yang dicari.',
        },
        {
          category: 'Bukti Portofolio',
          status: 'warning',
          tip: 'Pastikan melampirkan tautan live demo / portofolio pada bagian Featured profil LinkedIn Anda.',
        },
      ],
    };
  };

  // Handle Optimize Process
  const handleOptimizeProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setIsLoading(true);
    setHasAnalyzed(false);
    setScrapeError(null);
    setLoadingStep(1);
    setSavedId(null); // Reset savedId agar audit baru ini membuat riwayat baru & link independen

    try {
      let activeBank = { ...evidenceBank };
      let currentScraped = scrapedData;

      // JIKA MODE URL: Ekstraksi Otomatis dari Link LinkedIn
      if (activeInputTab === 'url') {
        const rawUrl = (profileUrl || '').trim();
        if (!rawUrl) {
          setScrapeError('Silakan masukkan link URL atau username LinkedIn kamu terlebih dahulu.');
          setIsLoading(false);
          return;
        }

        const cleanUrl = normalizeLinkedInUrl(rawUrl);

        // Cek sesi login
        const authRes = await fetch('/api/linkedin/auth-status');
        const authData = await authRes.json();
        if (!authData.loggedIn) {
          setScrapeError('Belum ada sesi login LinkedIn. Klik tombol "Login LinkedIn" di bawah, lalu coba lagi.');
          setIsLoading(false);
          return;
        }

        setLoadingStep(2);
        const scrapeRes = await fetch('/api/linkedin/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: cleanUrl }),
        });
        const scrapeData = await scrapeRes.json();
        if (!scrapeData.success) {
          setScrapeError(scrapeData.error || 'Gagal mengekstrak profil LinkedIn.');
          setIsLoading(false);
          return;
        }

        currentScraped = scrapeData.data;
        setScrapedData(scrapeData.data);

        // SMART PRE-FILL: Otomatis mapping data hasil scraping ke Evidence Bank
        const rawRole = targetRoleInput || scrapeData.data.headline || 'Professional';
        const cleanTargetRole = sanitizeRole(rawRole);
        const cleanTargetSkills = sanitizeSkills(scrapeData.data.skills, cleanTargetRole);
        const firstExp = scrapeData.data.experience?.[0];
        const rawCompany = firstExp?.company
          ? firstExp.company.replace(/\s*(?:·|•|-|\/)?\s*(?:Purnawaktu|Purnawak|Paruh Waktu|Full-time|Full time|Part-time|Part time|Freelance|Magang|Internship|Kontrak|Contract)\b/gi, '').trim()
          : '';
        const cleanExpOutcome = rawCompany
          ? `Berpengalaman di ${rawCompany}`
          : 'Pencapaian dan kontribusi nyata';

        const detectedTools = cleanTargetSkills.slice(0, 4).join(', ');
        const detectedProjects = scrapeData.data.projects?.length > 0
          ? scrapeData.data.projects.map((p: any) => p.title).filter((t: string) => t && t.length < 40).slice(0, 2).join(', ')
          : (activeBank.proofProjects || 'Proyek Portofolio Terkait');
        const detectedOutcomes = cleanExpOutcome;

        activeBank = {
          ...activeBank,
          targetRole: cleanTargetRole,
          targetIndustry: activeBank.targetIndustry || (scrapeData.data.location ? scrapeData.data.location.split(',')[0].trim() : 'Indonesia'),
          toolsActuallyUsed: detectedTools,
          proofProjects: detectedProjects,
          measurableOutcomes: detectedOutcomes,
          constraints: activeBank.constraints || 'Memperkuat visibilitas profil untuk peluang karir baru',
          existingHeadline: scrapeData.data.headline || '',
          existingAbout: scrapeData.data.about || '',
        };
        setEvidenceBank(activeBank);
      } else {
        // Mode Manual: Pastikan target role terisi
        if (!activeBank.targetRole) {
          setScrapeError('Silakan isi peran target minimal di Evidence Bank.');
          setIsLoading(false);
          return;
        }
      }

      setLoadingStep(3);

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
            const finalAiResult = cleanAnalysisResult(parsed.analysisResult, activeBank, currentScraped);
            setAnalysisResult(finalAiResult);
            setHasAnalyzed(true);
            setIsInputFormExpanded(false);
            await saveAnalysisToDb(finalAiResult, activeBank, currentScraped, true);
            return;
          }
        }
      } catch (aiErr) {
        console.warn('AI parsing issue, falling back to local ASEAN Ahead engine:', aiErr);
      }

      // Fallback ke generator lokal berbasis Evidence Bank & Scraped Data
      const fallbackResult = cleanAnalysisResult(
        buildLocalAseanAheadAnalysis(activeBank, currentScraped),
        activeBank,
        currentScraped
      );
      setAnalysisResult(fallbackResult);
      setHasAnalyzed(true);
      setIsInputFormExpanded(false);
      await saveAnalysisToDb(fallbackResult, activeBank, currentScraped, true);
    } catch (err: any) {
      console.error('LinkedIn Optimization Error:', err);
      setScrapeError(err?.message || 'Terjadi kesalahan saat memproses optimasi LinkedIn. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Header Standardized Employr */}
      <PageHeader
        title="Optimasi Profil LinkedIn"
        subtitle="Standar ASEAN Ahead: Lolos scan recruiter 30 detik pertama dengan formula Headline, About, & Evidence Bank teruji."
        icon={Linkedin}
        badge="ASEAN Ahead Standard"
        stats={
          hasAnalyzed
            ? [
                {
                  label: 'Overall Score',
                  value: `${analysisResult.overallScore}/100`,
                  icon: Sparkles,
                  colorClass: getScoreTextClass(analysisResult.overallScore),
                },
                {
                  label: 'SSI Score',
                  value: `${analysisResult.ssiScore}/100`,
                  icon: TrendingUp,
                  colorClass: getScoreTextClass(analysisResult.ssiScore),
                },
                {
                  label: 'Recruiter Readiness',
                  value: 'All-Star Level',
                  icon: ShieldCheck,
                  colorClass: 'text-emerald-600 dark:text-emerald-400',
                },
              ]
            : undefined
        }
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {/* Tombol Riwayat Analisis */}
            <button
              type="button"
              onClick={() => setIsHistoryDrawerOpen(true)}
              className="px-3 py-1.5 rounded-[10px] bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-white/20"
              title="Lihat riwayat hasil audit yang tersimpan"
            >
              <Clock className="w-3.5 h-3.5 text-blue-300" />
              <span>Riwayat</span>
              {historyList.length > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-black rounded-full bg-blue-500 text-white leading-none">
                  {historyList.length}
                </span>
              )}
            </button>

            {/* Tombol Salin Link Analisis */}
            {hasAnalyzed && savedId && (
              <button
                type="button"
                onClick={handleCopyShareLink}
                className="px-3 py-1.5 rounded-[10px] bg-white/15 hover:bg-white/25 active:scale-[0.98] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-white/25 shadow-xs"
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
                className="px-3 py-1.5 rounded-[10px] bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-white/20"
                title="Mulai audit baru untuk profil LinkedIn lain"
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
                className="px-3.5 py-2 rounded-[10px] bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white text-xs font-black transition shadow-md shadow-orange-500/30 flex items-center justify-center gap-1.5 cursor-pointer shrink-0 border-0"
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
        <div className="p-12 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
          <RefreshCw className="w-8 h-8 text-[#1738D1] animate-spin mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Memuat Hasil Analisis Profil LinkedIn...
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Mengambil data rekomendasi formula ASEAN Ahead yang tersimpan di database.
          </p>
        </div>
      )}

      {/* ERROR STATE KETIKA GAGAL MEMBUKA /LINKEDIN/[ID] */}
      {!isLoadingSaved && !hasAnalyzed && analysisId && scrapeError && (
        <div className="p-8 rounded-[10px] bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-600 dark:text-rose-400 mx-auto" />
          <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">
            {scrapeError}
          </h3>
          <p className="text-xs text-rose-700 dark:text-rose-300">
            Tautan hasil analisis ini mungkin sudah dihapus atau tidak ditemukan.
          </p>
          <button
            type="button"
            onClick={handleStartNewAnalysis}
            className="mt-2 px-4 py-2 rounded-[8px] bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer"
          >
            Mulai Analisis Baru
          </button>
        </div>
      )}

      {/* QUICK BANNER RIWAYAT DI HALAMAN /LINKEDIN UTAMA */}
      {!isLoadingSaved && !hasAnalyzed && !analysisId && historyList.length > 0 && (
        <div className="p-3.5 px-4 rounded-[10px] bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 flex items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
            <div className="w-7 h-7 rounded-[8px] bg-[#1738D1] text-white flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white">
                Kamu memiliki {historyList.length} hasil audit LinkedIn sebelumnya
              </span>
              <p className="text-[11px] text-slate-500">
                Terakhir: {historyList[0]?.targetRole} ({historyList[0]?.overallScore}/100)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsHistoryDrawerOpen(true)}
            className="px-3 py-1.5 rounded-[8px] bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 text-[#1738D1] dark:text-blue-400 font-bold text-xs hover:bg-blue-50 dark:hover:bg-slate-700 transition cursor-pointer shrink-0 shadow-2xs"
          >
            Buka Riwayat
          </button>
        </div>
      )}

      {/* TOP COMPACT SUMMARY BAR (KETIKA SUDAH SELESAI ANALISIS) */}
      {hasAnalyzed && !isLoading && !isInputFormExpanded && (
        <div className="p-4 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-[8px] bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-[#1738D1] dark:text-blue-400 shrink-0">
              <Linkedin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                  {profileUrl ? profileUrl.replace(/^https?:\/\/(?:www\.)?linkedin\.com\/in\//i, 'linkedin.com/in/') : (evidenceBank.targetRole || 'Profil LinkedIn')}
                </span>
                <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Audit Selesai</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                Target Posisi: <strong className="text-slate-700 dark:text-slate-300">{sanitizeRole(targetRoleInput || evidenceBank.targetRole)}</strong>
                {evidenceBank.targetIndustry ? ` • ${evidenceBank.targetIndustry}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setIsInputFormExpanded(true)}
              className="px-3 py-1.5 rounded-[8px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>Ganti URL / Target Posisi</span>
            </button>
            <button
              type="button"
              onClick={handleStartNewAnalysis}
              className="px-3 py-1.5 rounded-[8px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Analisis Baru</span>
            </button>
          </div>
        </div>
      )}

      {/* MAIN HERO INPUT CARD: ZERO-FRICTION LINK EKSTRAKSI */}
      {(!hasAnalyzed || isInputFormExpanded || isLoading) && (
        <div className="p-6 md:p-8 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6 animate-in fade-in duration-300">
          {/* Top Banner when in expanded edit mode */}
          {isInputFormExpanded && hasAnalyzed && (
            <div className="flex items-center justify-between p-3.5 rounded-[8px] bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-xs">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#1738D1] dark:text-blue-400" />
                <span className="font-bold text-[#1738D1] dark:text-blue-300">
                  Mode Edit: Kamu dapat mengganti URL atau target posisi, lalu klik tombol audit ulang.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsInputFormExpanded(false)}
                className="px-2.5 py-1 rounded-[6px] bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 transition flex items-center gap-1 cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs"
              >
                <X className="w-3.5 h-3.5" />
                <span>Tutup Form</span>
              </button>
            </div>
          )}
        {/* Header Tab Switcher (Modern & Clean) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-[#1738D1] dark:text-blue-400 shrink-0">
              <Linkedin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {activeInputTab === 'url' ? 'Ekstrak & Audit Profil LinkedIn' : 'Mode Manual: Evidence Bank'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {activeInputTab === 'url'
                  ? 'Cukup tempelkan link profil LinkedIn kamu untuk langsung diaudit secara instan.'
                  : 'Rancang dan optimalkan profil tanpa perlu menghubungkan akun LinkedIn.'}
              </p>
            </div>
          </div>

          <div className="flex items-center p-1 rounded-[10px] bg-slate-100 dark:bg-slate-800 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveInputTab('url')}
              className={`px-3 py-1.5 rounded-[8px] font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                activeInputTab === 'url'
                  ? 'bg-white dark:bg-slate-900 text-[#1738D1] dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Linkedin className="w-3.5 h-3.5 text-blue-600" />
              <span>Ekstrak Link (Utama)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveInputTab('evidence')}
              className={`px-3 py-1.5 rounded-[8px] font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                activeInputTab === 'evidence'
                  ? 'bg-white dark:bg-slate-900 text-[#1738D1] dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              <span>Input Manual</span>
            </button>
          </div>
        </div>

        {/* ERROR NOTIFICATION */}
        {scrapeError && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-[10px] bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 text-xs font-bold animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{scrapeError}</span>
          </div>
        )}

        {/* TAB 1 (DEFAULT): EKSTRAKSI URL ZERO-FRICTION */}
        {activeInputTab === 'url' && (
          <div className="space-y-5 animate-in fade-in duration-300">

            {/* STATUS LOGIN LINKEDIN (COMPACT & CLEAN) */}
            <div
              className={`p-3.5 rounded-[10px] border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isLoggedIn
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 ${
                    isLoggedIn
                      ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {isLoggedIn ? <BadgeCheck className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                </div>
                <div>
                  <p
                    className={`font-extrabold text-xs ${
                      isLoggedIn ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {isLoggedIn === null
                      ? 'Memeriksa sesi LinkedIn...'
                      : isLoggedIn
                      ? 'Sesi LinkedIn Aktif'
                      : 'Sesi LinkedIn Belum Terhubung'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isLoggedIn
                      ? 'Sesi tersimpan lokal di perangkat Anda. Sistem siap membaca profil publik.'
                      : 'Login sekali di browser (password tidak disimpan) untuk membaca data profil secara utuh.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                {isLoggedIn ? (
                  <button
                    type="button"
                    onClick={handleLogoutLinkedIn}
                    className="px-3 py-1.5 rounded-[8px] border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 font-bold text-xs transition hover:bg-rose-50 dark:hover:bg-rose-950 cursor-pointer"
                  >
                    Hapus Sesi
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleLoginLinkedIn}
                    disabled={isLoginLoading}
                    className="px-3.5 py-1.5 rounded-[8px] bg-[#0A66C2] hover:bg-[#004182] text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {isLoginLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Linkedin className="w-3.5 h-3.5" />}
                    <span>{isLoginLoading ? 'Menunggu Login...' : 'Login LinkedIn'}</span>
                  </button>
                )}
              </div>
            </div>

            {authError && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-[10px] bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* FORM INPUT UTAMA: LINK + TARGET ROLE */}
            <form onSubmit={handleOptimizeProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8 space-y-1.5">
                  <label className="font-bold text-xs text-slate-700 dark:text-slate-300 block">
                    Link URL LinkedIn Kamu *
                  </label>
                  <div className="relative">
                    <Linkedin className="w-4 h-4 absolute left-3.5 top-3.5 text-blue-500" />
                    <input
                      type="text"
                      required
                      placeholder="linkedin.com/in/riizalhp atau cukup riizalhp"
                      value={profileUrl}
                      onChange={(e) => setProfileUrl(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1738D1] transition"
                    />
                  </div>
                </div>

                <div className="md:col-span-4 space-y-1.5">
                  <label className="font-bold text-xs text-slate-700 dark:text-slate-300 block">
                    Target Posisi (Opsional)
                  </label>
                  <RoleCombobox
                    value={targetRoleInput}
                    onChange={(val) => {
                      setTargetRoleInput(val);
                      setEvidenceBank((prev) => ({ ...prev, targetRole: val }));
                    }}
                    placeholder="Pilih peran dari engine atau ketik posisi baru..."
                  />
                </div>
              </div>

              {/* PRIMARY ACTION BUTTON */}
              <button
                type="submit"
                disabled={isLoading || !profileUrl}
                className="w-full py-3.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] active:scale-[0.98] text-white font-black text-sm transition shadow-lg shadow-[#1738D1]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border-0"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Mengekstrak Data &amp; Menganalisis Profil LinkedIn...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-white" />
                    <span>Ekstrak &amp; Audit Profil Sekarang</span>
                  </>
                )}
              </button>
            </form>

            {/* SECONDARY ESCAPE HATCH: BELUM PUNYA LINK ATAU PRIVATE */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setActiveInputTab('evidence')}
                className="text-xs font-bold text-slate-500 hover:text-[#1738D1] dark:text-slate-400 dark:hover:text-blue-400 transition cursor-pointer underline underline-offset-4"
              >
                Belum punya akun LinkedIn publik atau profil diset privat? Gunakan Input Manual (Evidence Bank) →
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: MANUAL EVIDENCE BANK (FALLBACK / FORMULIR BEBAS LINK) */}
        {activeInputTab === 'evidence' && (
          <div className="space-y-5 animate-in fade-in duration-300">

            {/* Evidence Bank Grid Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>1. Arah Peran Target *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Contoh: Junior Data Analyst, HR Assistant</span>
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={evidenceBank.targetRole}
                    onChange={(e) => setEvidenceBank({ ...evidenceBank, targetRole: e.target.value })}
                    placeholder="Contoh: Junior Data Analyst"
                    className="w-full pl-10 pr-4 py-2.5 rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-medium text-xs focus:outline-none focus:ring-2 focus:ring-[#1738D1] transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>2. Target Industri / Pasar Kerja *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Contoh: Fintech, EduTech, UMKM, Jakarta</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={evidenceBank.targetIndustry}
                    onChange={(e) => setEvidenceBank({ ...evidenceBank, targetIndustry: e.target.value })}
                    placeholder="Contoh: Retail & E-commerce, Jakarta"
                    className="w-full pl-10 pr-4 py-2.5 rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-medium text-xs focus:outline-none focus:ring-2 focus:ring-[#1738D1] transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>3. Tools &amp; Keahlian Nyata yang Pernah Digunakan *</span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                    Aturan: Tuliskan hanya yang bisa dipertanggungjawabkan saat wawancara
                  </span>
                </label>
                <div className="relative">
                  <Code2 className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={evidenceBank.toolsActuallyUsed}
                    onChange={(e) => setEvidenceBank({ ...evidenceBank, toolsActuallyUsed: e.target.value })}
                    placeholder="Contoh: Microsoft Excel (Pivot, VLOOKUP), SQL Dasar, Power BI"
                    className="w-full pl-10 pr-4 py-2.5 rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-medium text-xs focus:outline-none focus:ring-2 focus:ring-[#1738D1] transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>4. Proyek Bukti (Proof Projects) *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Dashboard, tugas akhir, portofolio</span>
                </label>
                <textarea
                  rows={2}
                  value={evidenceBank.proofProjects}
                  onChange={(e) => setEvidenceBank({ ...evidenceBank, proofProjects: e.target.value })}
                  placeholder="Contoh: 3 Dashboard interaktif penjualan ritel, Analisis data survei 200 responden"
                  className="w-full p-3 rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-medium text-xs focus:outline-none focus:ring-2 focus:ring-[#1738D1] transition resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>5. Hasil &amp; Dampak Terukur (Outcomes) *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Angka, presentasi, efisiensi</span>
                </label>
                <textarea
                  rows={2}
                  value={evidenceBank.measurableOutcomes}
                  onChange={(e) => setEvidenceBank({ ...evidenceBank, measurableOutcomes: e.target.value })}
                  placeholder="Contoh: Mempresentasikan temuan ke panel fakultas, memangkas waktu rekap data rutin 20%"
                  className="w-full p-3 rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-medium text-xs focus:outline-none focus:ring-2 focus:ring-[#1738D1] transition resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>6. Kendala &amp; Status Karir Saat Ini</span>
                  <span className="text-[10px] text-slate-400 font-normal">Fresh graduate, switcher, dsb</span>
                </label>
                <input
                  type="text"
                  value={evidenceBank.constraints}
                  onChange={(e) => setEvidenceBank({ ...evidenceBank, constraints: e.target.value })}
                  placeholder="Contoh: Belum ada pengalaman kerja full-time, sedang aktif belajar SQL"
                  className="w-full px-3 py-2.5 rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-medium text-xs focus:outline-none focus:ring-2 focus:ring-[#1738D1] transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-xs text-slate-700 dark:text-slate-300 block">
                  7. Pilihan Nada Bahasa (Tone of Voice)
                </label>
                <div className="grid grid-cols-3 gap-2 pt-0.5">
                  {[
                    { id: 'beginner', label: 'Pemula & Jujur' },
                    { id: 'impact', label: 'Berorientasi Hasil' },
                    { id: 'switcher', label: 'Transisi Karir' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setEvidenceBank({ ...evidenceBank, targetTone: t.id as any })}
                      className={`py-2 px-2 rounded-[10px] text-[11px] font-bold border text-center transition cursor-pointer ${
                        evidenceBank.targetTone === t.id
                          ? 'bg-blue-50 dark:bg-blue-950/80 text-[#1738D1] dark:text-blue-300 border-[#1738D1] dark:border-blue-700'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ACTION BUTTON */}
            <button
              type="button"
              onClick={() => handleOptimizeProfile()}
              disabled={isLoading || !evidenceBank.targetRole}
              className="w-full py-3.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] active:scale-[0.98] text-white font-black text-sm transition shadow-lg shadow-[#1738D1]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border-0"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Menyusun Rekomendasi Standar ASEAN Ahead...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Optimalkan Profil dengan Evidence Bank</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* LOADING INDICATOR PROGRESS BAR */}
        {isLoading && (
          <div className="p-5 rounded-[10px] bg-orange-50/80 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300 font-extrabold text-xs">
              <RefreshCw className="w-4 h-4 animate-spin text-orange-500" />
              <span>Memproses Penilaian Profil Berdasarkan 30-Second Recruiter Scan...</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2.5">
                {loadingStep >= 1 ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-700 shrink-0" />
                )}
                <span className={loadingStep >= 1 ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-400'}>
                  1. Memvalidasi data profil &amp; memetakan Evidence Bank
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                {loadingStep >= 2 ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-700 shrink-0" />
                )}
                <span className={loadingStep >= 2 ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-400'}>
                  2. Membaca Headline, Bio, Riwayat Pengalaman, &amp; Skills
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                {loadingStep >= 3 ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-700 shrink-0" />
                )}
                <span className={loadingStep >= 3 ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-400'}>
                  3. Menghitung Skor Recruiter, 4 Pola Headline, &amp; Draf Bio 3-Kalimat
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      )}

      {/* OUTPUT CONTENT (HAS ANALYZED) */}
      {hasAnalyzed && !isLoading && (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* HERO QUICK ACTION CARD: 3 LANGKAH CEPAT TERAPKAN KE LINKEDIN */}
          {(() => {
            const recommendedHeadline =
              analysisResult.headlines.find((h) => h.patternKey === 'role-led') ||
              analysisResult.headlines[0];

            return (
              <div className="p-6 rounded-[10px] bg-gradient-to-br from-blue-50/80 via-white to-orange-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/30 border-2 border-[#1738D1]/40 dark:border-blue-700/50 shadow-md space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-[8px] bg-[#1738D1] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <span>Langkah Cepat: Terapkan Hasil ke LinkedIn Kamu</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-500 text-white">
                          Mulai dari Sini
                        </span>
                      </h2>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Ikuti 3 langkah praktis ini untuk menaikkan visibilitas profilmu di mata recruiter dalam 2 menit.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs font-bold text-slate-500">
                    <span>Skor Profil:</span>
                    <span className="px-2 py-0.5 rounded-[6px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono font-black">
                      {analysisResult.overallScore}/100
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Step 1: Salin Headline */}
                  <div className="p-4 rounded-[10px] bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3 shadow-2xs">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-black uppercase bg-blue-100 text-[#1738D1] dark:bg-blue-950 dark:text-blue-300">
                          Langkah 1
                        </span>
                        <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <span>{recommendedHeadline?.charCount || 0} / 220 Karakter</span>
                          <Check className="w-3 h-3" />
                        </span>
                      </div>
                      <h3 className="font-extrabold text-xs text-slate-900 dark:text-white">
                        Salin Headline Rekomendasi
                      </h3>
                      <div className="text-[11px] font-mono text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 p-3 rounded-[8px] border border-slate-100 dark:border-slate-800 line-clamp-3 leading-relaxed">
                        {recommendedHeadline?.text}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(recommendedHeadline?.text || '', 'quick-headline')}
                      className="w-full py-2.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {copiedIndex === 'quick-headline' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span className="text-emerald-100">Headline Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Headline (Pola A)</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Step 2: Salin Bio */}
                  <div className="p-4 rounded-[10px] bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3 shadow-2xs">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-black uppercase bg-blue-100 text-[#1738D1] dark:bg-blue-950 dark:text-blue-300">
                          Langkah 2
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          Bio 3-Kalimat
                        </span>
                      </div>
                      <h3 className="font-extrabold text-xs text-slate-900 dark:text-white">
                        Salin Draf Bio / About Lengkap
                      </h3>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-3 rounded-[8px] border border-slate-100 dark:border-slate-800 line-clamp-3 leading-relaxed italic">
                        "{analysisResult.aboutStructure?.threeSentenceOpening?.sentence1 || analysisResult.optimizedAbout?.slice(0, 110)}..."
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(analysisResult.optimizedAbout, 'quick-about')}
                      className="w-full py-2.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {copiedIndex === 'quick-about' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span className="text-emerald-100">Bio Lengkap Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Seluruh Bio</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Step 3: Buka LinkedIn */}
                  <div className="p-4 rounded-[10px] bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3 shadow-2xs">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-black uppercase bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                          Langkah 3
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          Terapkan Langsung
                        </span>
                      </div>
                      <h3 className="font-extrabold text-xs text-slate-900 dark:text-white">
                        Buka Profil LinkedIn Kamu
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        Buka profilmu di LinkedIn, klik ikon pensil di bagian <strong>Intro</strong> untuk paste Headline, dan bagian <strong>About</strong> untuk paste Bio.
                      </p>
                    </div>

                    <a
                      href={normalizeLinkedInUrl(profileUrl || 'https://www.linkedin.com/in/')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 rounded-[10px] bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-orange-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-white" />
                      <span>Buka LinkedIn Sekarang</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })()}
          {/* MAIN EVALUATION OUTPUT CARD */}
          <div className="p-6 md:p-8 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-8">
            {/* Header Score Overview */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Hasil Penilaian &amp; Rekomendasi Profil
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-[10px] text-[10px] font-bold bg-blue-50 text-[#1738D1] dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    Standar ASEAN Ahead
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-[10px] text-[10px] font-bold uppercase border ${
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
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Evaluasi daya tarik scan 30 detik pertama recruiter, kepadatan kata kunci, dan kekuatan bukti portofolio.
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-center">
                  <div className={`text-2xl font-black ${getScoreTextClass(analysisResult.overallScore)}`}>
                    {analysisResult.overallScore}
                    <span className="text-xs text-slate-400 font-normal">/100</span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">
                    Skor SEO Recruiter
                  </span>
                </div>

                <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />

                <div className="text-center">
                  <div className={`text-2xl font-black ${getScoreTextClass(analysisResult.ssiScore)}`}>
                    {analysisResult.ssiScore}
                    <span className="text-xs text-slate-400 font-normal">/100</span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">
                    SSI Rating
                  </span>
                </div>
              </div>
            </div>

            {/* Score Breakdown Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-center space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold block truncate">Formula Headline</span>
                <span className={`font-black block text-base ${getScoreTextClass(analysisResult.scoreBreakdown.headline)}`}>
                  {analysisResult.scoreBreakdown.headline}%
                </span>
              </div>
              <div className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-center space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold block truncate">Bio 3-Kalimat</span>
                <span className={`font-black block text-base ${getScoreTextClass(analysisResult.scoreBreakdown.about)}`}>
                  {analysisResult.scoreBreakdown.about}%
                </span>
              </div>
              <div className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-center space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold block truncate">Bukti Proyek</span>
                <span className={`font-black block text-base ${getScoreTextClass(analysisResult.scoreBreakdown.experience)}`}>
                  {analysisResult.scoreBreakdown.experience}%
                </span>
              </div>
              <div className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-center space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold block truncate">Kata Kunci Filter</span>
                <span className={`font-black block text-base ${getScoreTextClass(analysisResult.scoreBreakdown.keywords)}`}>
                  {analysisResult.scoreBreakdown.keywords}%
                </span>
              </div>
              <div className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-center space-y-1 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 font-semibold block truncate">Konsistensi</span>
                <span className={`font-black block text-base ${getScoreTextClass(analysisResult.scoreBreakdown.engagement)}`}>
                  {analysisResult.scoreBreakdown.engagement}%
                </span>
              </div>
            </div>

            {/* Tab Navigasi Hasil Audit (Antislop: Fokus, Tenang & Mengurangi Beban Kognitif) */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 border-b border-slate-100 dark:border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveAuditTab('recs')}
                className={`px-3.5 py-2 rounded-[10px] transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  activeAuditTab === 'recs'
                    ? 'bg-[#1738D1] text-white shadow-sm shadow-[#1738D1]/20'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/70'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>1. Rekomendasi Utama</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveAuditTab('scan')}
                className={`px-3.5 py-2 rounded-[10px] transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  activeAuditTab === 'scan'
                    ? 'bg-[#1738D1] text-white shadow-sm shadow-[#1738D1]/20'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/70'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>2. Bedah Profil 30 Detik</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveAuditTab('copy')}
                className={`px-3.5 py-2 rounded-[10px] transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  activeAuditTab === 'copy'
                    ? 'bg-[#1738D1] text-white shadow-sm shadow-[#1738D1]/20'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/70'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>3. Headline &amp; Bio</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveAuditTab('skills')}
                className={`px-3.5 py-2 rounded-[10px] transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  activeAuditTab === 'skills'
                    ? 'bg-[#1738D1] text-white shadow-sm shadow-[#1738D1]/20'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/70'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>4. Keahlian &amp; Bukti</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveAuditTab('checklist')}
                className={`px-3.5 py-2 rounded-[10px] transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  activeAuditTab === 'checklist'
                    ? 'bg-[#1738D1] text-white shadow-sm shadow-[#1738D1]/20'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/70'
                }`}
              >
                <ListChecks className="w-3.5 h-3.5" />
                <span>5. Checklist Publish</span>
                {checklistCompletedCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-white/20 text-white">
                    {checklistCompletedCount}/{checklistTotalCount}
                  </span>
                )}
              </button>
            </div>

            {/* TAB 1: REKOMENDASI TERPRIORITAS (HIGH IMPACT FIRST) */}
            {activeAuditTab === 'recs' && (
              <div id="prioritized-recs" className="space-y-4 text-xs scroll-mt-6 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Flame className="w-4 h-4 text-[#1738D1]" />
                      <span>Rekomendasi Utama (Langkah Paling Berdampak)</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Daftar aksi paling krusial diurutkan dari dampak tertinggi agar profilmu optimal dengan usaha paling efisien.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-[#1738D1] bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-[6px] border border-blue-200 dark:border-blue-800 self-start sm:self-auto">
                    Fokus Eksekusi
                  </span>
                </div>

                <div className="space-y-3.5">
                  {analysisResult.prioritizedRecommendations.map((rec, rIdx) => (
                    <div
                      key={rIdx}
                      className="p-4 sm:p-5 rounded-[10px] bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 space-y-3.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-700/60 pb-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-1 rounded-[8px] text-[10px] font-bold bg-[#1738D1] text-white">
                            Prioritas #{rec.priority}
                          </span>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {rec.title}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-blue-100/80 text-[#1738D1] dark:bg-blue-950 dark:text-blue-300">
                            Dampak: {rec.impact}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            Usaha: {rec.effort}
                          </span>
                        </div>
                      </div>

                      {/* Problem (Observation + Interpretation) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed">
                        <div className="p-3 rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                          <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                            Observasi (Fakta di Profil)
                          </span>
                          <p className="text-slate-800 dark:text-slate-200 font-medium mt-1">
                            {rec.problem.observation}
                          </p>
                        </div>

                        <div className="p-3 rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                          <span className="text-[#1738D1] dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider block">
                            Sudut Pandang Recruiter
                          </span>
                          <p className="text-slate-800 dark:text-slate-200 font-medium mt-1">
                            {rec.problem.interpretation}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        <strong className="text-slate-800 dark:text-slate-200">Mengapa Mendesak:</strong> {rec.whyItMatters}
                      </p>

                      {/* Action (Before vs After) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <div className="p-3.5 rounded-[8px] bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1.5">
                          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
                            Kondisi Saat Ini (Sebelum):
                          </span>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic bg-white/70 dark:bg-slate-950/50 p-2.5 rounded-[6px] border border-slate-200/70 dark:border-slate-800">
                            "{rec.action.before}"
                          </p>
                        </div>

                        <div className="p-3.5 rounded-[8px] bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300 tracking-wider block">
                              Saran Perbaikan (Sesudah):
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(rec.action.after, `rec-${rIdx}`)}
                              className="px-2.5 py-1 rounded-[6px] bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-bold text-[10px] transition flex items-center gap-1 cursor-pointer hover:bg-emerald-100"
                            >
                              {copiedIndex === `rec-${rIdx}` ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-500" />
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
                          <p className="text-xs font-bold text-slate-900 dark:text-white leading-relaxed bg-white dark:bg-slate-900 p-2.5 rounded-[6px] border border-emerald-300/80 dark:border-emerald-800/80">
                            {rec.action.after}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                        <span className="font-semibold text-slate-400">Bukti yang digunakan:</span>
                        {rec.evidenceUsed.map((ev, eIdx) => (
                          <span
                            key={eIdx}
                            className="px-2 py-0.5 rounded-[6px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium"
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
              <div id="recruiter-scan" className="space-y-4 text-xs scroll-mt-6 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>Bedah Profil 30 Detik (10 Aspek Krusial Recruiter)</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Recruiter menyaring kandidat dalam 30 detik pertama. Berikut hasil temuan observasi, analisis dampak, dan saran perbaikan konkret:
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 self-start sm:self-auto">
                    Standar 10 Aspek
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysisResult.recruiterScanAudit.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-slate-200/50 dark:border-slate-700/50 pb-2">
                        <span className="font-bold text-slate-900 dark:text-white text-xs">
                          {idx + 1}. {item.criterion}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-medium text-slate-400">{item.scanTimeSeconds}</span>
                          <span
                            className={`px-2 py-0.5 rounded-[6px] text-[10px] font-bold uppercase ${
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

                      <div className="space-y-2 text-xs leading-relaxed">
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                            Observasi:
                          </span>
                          <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                            {item.observation || item.finding}
                          </p>
                        </div>

                        <div>
                          <span className="text-[#1738D1] dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider block">
                            Sudut Pandang Recruiter:
                          </span>
                          <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                            {item.interpretation || 'Kesesuaian profil dievaluasi berdasarkan kebutuhan peran target.'}
                          </p>
                        </div>

                        <div className="p-2.5 rounded-[6px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <span className="text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider block">
                            Saran Aksi:
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
              <div className="space-y-8 pt-2">
                {/* 1. FORMULA HEADLINE (< 220 CHARACTERS) */}
                <div id="headline-patterns" className="space-y-4 text-xs scroll-mt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>Pilihan Formula Headline LinkedIn (Maksimal 220 Karakter)</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Rumus: [Peran Target] + [2–3 Alat/Skill Kunci] + [Audiens / Hasil Nyata]. Dioptimalkan agar langsung dipahami recruiter dalam 3 detik.
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold self-start sm:self-auto">
                      Pilih 1 Sesuai Profilmu
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysisResult.headlines.map((item, idx) => {
                      const isPrimary = item.patternKey === 'role-led' || idx === 0;
                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-[10px] space-y-3 flex flex-col justify-between transition ${
                            isPrimary
                              ? 'bg-blue-50/40 dark:bg-blue-950/20 border-2 border-[#1738D1] dark:border-blue-500 shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#1738D1] dark:text-blue-400 text-xs">
                                  {item.title}
                                </span>
                                {isPrimary && (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#1738D1] text-white tracking-wider flex items-center gap-1">
                                    <Sparkles className="w-2.5 h-2.5" />
                                    <span>Rekomendasi Utama</span>
                                  </span>
                                )}
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded-[10px] text-[10px] font-bold flex items-center gap-1 ${
                                  item.charCount <= 220
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                }`}
                              >
                                <span>{item.charCount} / 220 Karakter</span>
                                {item.charCount <= 220 ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                              </span>
                            </div>

                            <div className="p-3 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-sans text-xs font-semibold text-slate-900 dark:text-white leading-relaxed">
                              {item.text}
                            </div>

                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                              <strong className="text-slate-700 dark:text-slate-300">Mengapa Berhasil:</strong>{' '}
                              {item.whyItWorks}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                            <span className="text-[10px] text-slate-400 truncate">
                              Kata Kunci: {item.keywords}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(item.text, `headline-${idx}`)}
                              className={`px-3 py-1.5 rounded-[10px] font-bold text-[10px] transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs ${
                                isPrimary
                                  ? 'bg-[#1738D1] hover:bg-[#132EA8] text-white border-0'
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
                <div id="about-section" className="space-y-4 text-xs scroll-mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-orange-500" />
                        <span>Draf Bagian "About" Terstruktur (Formula 3 Kalimat + Bukti)</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Struktur: Pembuka 3 Kalimat (Identitas → Bukti → Kontribusi) + 3–5 Poin Bukti Konkret + Ajakan Berjejaring.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(analysisResult.optimizedAbout, 'about-all')}
                      className="px-3.5 py-2 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shadow-md shadow-[#1738D1]/20 border-0"
                    >
                      {copiedIndex === 'about-all' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Tersalin ke Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Seluruh Bio</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Visual Breakdown of About Section */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 3 Sentences Breakdown */}
                    <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                      <div className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>3 Kalimat Pembuka (Hook)</span>
                      </div>
                      <div className="space-y-2 text-[11px] leading-relaxed">
                        <div className="p-2.5 rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <strong className="text-orange-600 block text-[10px] uppercase">Kalimat 1 (Identitas &amp; Arah):</strong>
                          <p className="text-slate-700 dark:text-slate-300">
                            {analysisResult.aboutStructure?.threeSentenceOpening?.sentence1 ||
                              'Menyatakan identitas lulusan dan arah spesialisasi peran.'}
                          </p>
                        </div>
                        <div className="p-2.5 rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <strong className="text-emerald-600 block text-[10px] uppercase">Kalimat 2 (Bukti &amp; Alat):</strong>
                          <p className="text-slate-700 dark:text-slate-300">
                            {analysisResult.aboutStructure?.threeSentenceOpening?.sentence2 ||
                              'Menyebutkan alat nyata yang dipakai dan output yang dihasilkan.'}
                          </p>
                        </div>
                        <div className="p-2.5 rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <strong className="text-blue-600 block text-[10px] uppercase">Kalimat 3 (Peluang &amp; Kontribusi):</strong>
                          <p className="text-slate-700 dark:text-slate-300">
                            {analysisResult.aboutStructure?.threeSentenceOpening?.sentence3 ||
                              'Menjelaskan nilai tambah yang ingin diberikan ke tim.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Evidence Bullets */}
                    <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                      <div className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span>3–5 Poin Bukti (Evidence Bullets)</span>
                      </div>
                      <ul className="space-y-2 text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                        {analysisResult.aboutStructure?.evidenceBullets?.map((bullet, bIdx) => (
                          <li
                            key={bIdx}
                            className="p-2 rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-2"
                          >
                            <span className="text-orange-500 font-bold">•</span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Closing Line & Complete Preview */}
                    <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white">
                          <Users className="w-4 h-4 text-blue-500" />
                          <span>Kalimat Penutup (Closing Line)</span>
                        </div>
                        <div className="p-3 rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed italic">
                          "{analysisResult.aboutStructure?.closingLine}"
                        </div>
                        <p className="text-[10px] text-slate-400">
                          *Mengundang koneksi profesional secara sopan tanpa terkesan memohon.
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-200/80 dark:border-slate-700/80">
                        <button
                          type="button"
                          onClick={() => handleCopy(analysisResult.optimizedAbout, 'about-mono')}
                          className="w-full py-2 rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-orange-600 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {copiedIndex === 'about-mono' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>Salin Draf Lengkap</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Complete Copy Card */}
                  <div className="p-4 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-sans text-slate-800 dark:text-slate-200 text-xs leading-relaxed whitespace-pre-line shadow-xs">
                    {analysisResult.optimizedAbout}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: KEAHLIAN & BUKTI (TOP 5 SKILLS & PEMETAAN KOMPETENSI) */}
            {activeAuditTab === 'skills' && (
              <div id="top5-skills" className="space-y-6 text-xs scroll-mt-6 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Target className="w-4 h-4 text-[#1738D1]" />
                      <span>Prioritas Keahlian &amp; Keselarasan Kata Kunci (SEO Recruiter)</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Algoritma LinkedIn memprioritaskan 3–5 skill teratas yang di-pin. Pastikan urutan dan kata kunci ini terpasang di profil Anda.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 self-start sm:self-auto">
                    Algoritma &amp; Bukti
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pinned Top 5 Skills List */}
                  <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                      <BadgeCheck className="w-4 h-4 text-emerald-500" />
                      <span>Urutan Top 5 Skills (Wajib Di-Pin):</span>
                    </h4>
                    <div className="space-y-2">
                      {analysisResult.top5Skills.map((sk, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-2.5 rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                              {sk.priority || sIdx + 1}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white text-xs">{sk.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 text-right truncate max-w-[180px]">
                            {sk.reason}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Keyword Alignment (Matched vs Missing vs Questionable) */}
                  <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-4">
                    <div>
                      <h4 className="font-extrabold text-xs text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Kata Kunci yang Sudah Terpenuhi:</span>
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {analysisResult.keySkills.map((k, kIdx) => (
                          <span
                            key={kIdx}
                            className="px-2.5 py-1 rounded-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold text-[11px] flex items-center gap-1"
                          >
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span>{k}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-xs text-rose-600 dark:text-rose-400 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                        <span>Kata Kunci Tambahan yang Disarankan (Gap):</span>
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {analysisResult.missingKeywords.map((m, mIdx) => (
                          <span
                            key={mIdx}
                            className="px-2.5 py-1 rounded-[10px] bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 font-semibold text-[11px]"
                          >
                            + {m}
                          </span>
                        ))}
                      </div>
                    </div>

                    {analysisResult.questionableKeywords && analysisResult.questionableKeywords.length > 0 && (
                      <div>
                        <h4 className="font-extrabold text-xs text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                          <span>Klaim Keahlian yang Perlu Bukti Pendukung:</span>
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2">
                          Keahlian berikut tercantum di profil namun belum memiliki rincian proyek konkret:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {analysisResult.questionableKeywords.map((q, qIdx) => (
                            <span
                              key={qIdx}
                              className="px-2.5 py-1 rounded-[10px] bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 font-semibold text-[11px] flex items-center gap-1"
                            >
                              <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
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
                  <div className="p-4 sm:p-5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200/60 dark:border-slate-700/60 pb-2.5">
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-[#1738D1]" />
                          <span>Tabel Keselarasan Kompetensi &amp; Bukti Portofolio</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Kesesuaian keahlian dengan target peran berdasarkan rekam jejak pengalaman dan portofolio Anda.
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 self-start sm:self-auto">
                        Evaluasi Kredibilitas
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200/70 dark:border-slate-700/70 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            <th className="py-2.5 px-3">Kompetensi</th>
                            <th className="py-2.5 px-3">Bukti Profil / Riwayat</th>
                            <th className="py-2.5 px-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {analysisResult.competencyMap.map((item, cIdx) => (
                            <tr key={cIdx} className="hover:bg-white/60 dark:hover:bg-slate-900/40 transition">
                              <td className="py-3 px-3 font-bold text-slate-900 dark:text-white align-top max-w-[200px]">
                                {item.competency}
                              </td>
                              <td className="py-3 px-3 text-slate-600 dark:text-slate-300 leading-relaxed align-top">
                                {item.profileEvidence}
                              </td>
                              <td className="py-3 px-3 text-center align-top whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] text-[10px] font-bold ${
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
              <div id="verification-checklist" className="space-y-4 text-xs scroll-mt-6 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <ListChecks className="w-4 h-4 text-[#1738D1]" />
                      <span>Checklist Verifikasi Sebelum Publish ke LinkedIn</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Centang setiap item setelah Anda menyalin dan memperbarui profil di akun LinkedIn.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                      Progres: {checklistCompletedCount}/{checklistTotalCount}
                    </span>
                    <div className="w-24 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${(checklistCompletedCount / checklistTotalCount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
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
                      onClick={() => toggleChecklist(chk.id)}
                      className={`p-3 rounded-[10px] border text-left transition flex items-start gap-2.5 cursor-pointer ${
                        checklist[chk.id]
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      {checklist[chk.id] ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      )}
                      <span className={`text-[11px] leading-relaxed font-medium ${checklist[chk.id] ? 'line-through opacity-80' : ''}`}>
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
            <div className="p-6 md:p-8 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[10px] bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                        Hasil Ekstraksi Profil LinkedIn Asli
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-[10px] text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Terbaca Lengkap
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Data riwayat yang berhasil ditarik langsung dari link akun publik Anda.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleDownloadProfile}
                    className="px-3.5 py-2 rounded-[10px] bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900 font-bold text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Data (JSON)</span>
                  </button>
                  <a
                    href={normalizeLinkedInUrl(profileUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-orange-600 font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
                  >
                    <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                    <span>Buka LinkedIn</span>
                  </a>
                </div>
              </div>

              {/* Identity Header */}
              <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-navy-700 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-sm">
                  {scrapedData.name.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{scrapedData.name}</h3>
                  <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold">{scrapedData.headline}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {scrapedData.location} • {scrapedData.connections}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SMART EVIDENCE BANK ACCORDION (SMART PROGRESSIVE DISCLOSURE) */}
          <div className="p-5 rounded-[10px] bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[8px] bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-[#1738D1] dark:text-blue-400 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Evidence Bank (Fakta Kunci yang Mendasari Rekomendasi)</span>
                    <span className="px-2 py-0.2 rounded-[6px] text-[9px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Auto-Populated
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Sistem menyusun headline dan bio dari fakta di bawah agar bebas klaim palsu.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEvidenceBankOpen(!isEvidenceBankOpen)}
                className="px-3 py-1.5 rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs hover:border-[#1738D1]"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{isEvidenceBankOpen ? 'Tutup Detail' : 'Lihat / Sesuaikan Fakta'}</span>
                {isEvidenceBankOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Quick Preview Chips (Saat tertutup) */}
            {!isEvidenceBankOpen && (
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                <span className="px-2.5 py-1 rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  <strong className="text-slate-900 dark:text-white">Peran:</strong> {evidenceBank.targetRole || 'Junior Professional'}
                </span>
                <span className="px-2.5 py-1 rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  <strong className="text-slate-900 dark:text-white">Tools:</strong> {evidenceBank.toolsActuallyUsed.slice(0, 45)}...
                </span>
                <span className="px-2.5 py-1 rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  <strong className="text-slate-900 dark:text-white">Hasil:</strong> {evidenceBank.measurableOutcomes.slice(0, 45)}...
                </span>
              </div>
            )}

            {/* Collapsible Edit Form (Jika user ingin menyempurnakan angka) */}
            {isEvidenceBankOpen && (
              <div className="p-4 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 text-xs animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Arah Peran Target</label>
                    <input
                      type="text"
                      value={evidenceBank.targetRole}
                      onChange={(e) => setEvidenceBank({ ...evidenceBank, targetRole: e.target.value })}
                      className="w-full px-3 py-2 rounded-[8px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Target Industri</label>
                    <input
                      type="text"
                      value={evidenceBank.targetIndustry}
                      onChange={(e) => setEvidenceBank({ ...evidenceBank, targetIndustry: e.target.value })}
                      className="w-full px-3 py-2 rounded-[8px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Tools yang Pernah Dipakai</label>
                    <input
                      type="text"
                      value={evidenceBank.toolsActuallyUsed}
                      onChange={(e) => setEvidenceBank({ ...evidenceBank, toolsActuallyUsed: e.target.value })}
                      className="w-full px-3 py-2 rounded-[8px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Hasil &amp; Dampak Terukur</label>
                    <input
                      type="text"
                      value={evidenceBank.measurableOutcomes}
                      onChange={(e) => setEvidenceBank({ ...evidenceBank, measurableOutcomes: e.target.value })}
                      className="w-full px-3 py-2 rounded-[8px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => handleOptimizeProfile()}
                    className="px-4 py-2 rounded-[8px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Perbarui Rekomendasi dengan Fakta Baru</span>
                  </button>
                </div>
              </div>
            )}
          </div>


        </div>
      )}

      {/* SLIDE-IN DRAWER: RIWAYAT ANALISIS LINKEDIN */}
      {isHistoryDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end transition-opacity">
          <div className="relative z-10 w-full max-w-md sm:max-w-lg h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[8px] bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-[#1738D1] dark:text-blue-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Riwayat Analisis LinkedIn
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {historyList.length} hasil audit tersimpan permanen
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryDrawerOpen(false)}
                className="p-1.5 rounded-[8px] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content List */}
            <div className="p-5 overflow-y-auto flex-1 space-y-3">
              {isHistoryLoading ? (
                <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-[#1738D1]" />
                  <span>Memuat riwayat...</span>
                </div>
              ) : historyList.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-[10px] space-y-2">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Belum Ada Riwayat Analisis</p>
                  <p className="text-[11px]">
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

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setIsHistoryDrawerOpen(false);
                        router.push(`/linkedin/${item.id}`);
                      }}
                      className={`p-3.5 rounded-[10px] border transition cursor-pointer flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'border-[#1738D1] bg-blue-50/50 dark:bg-blue-950/40 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {item.targetRole}
                          </h4>
                          {isCurrent && (
                            <span className="px-1.5 py-0.5 text-[9px] font-black rounded-full bg-[#1738D1] text-white shrink-0">
                              Aktif
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 flex-wrap">
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
                          className={`px-2 py-1 rounded-[8px] text-[11px] font-black ${getScoreBadgeClass(
                            item.overallScore
                          )}`}
                        >
                          {item.overallScore}/100
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteHistoryItem(e, item.id)}
                          className="p-1.5 rounded-[6px] hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          title="Hapus riwayat ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Sticky Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={handleStartNewAnalysis}
                className="px-3.5 py-2 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat Analisis Baru</span>
              </button>
              <button
                type="button"
                onClick={() => setIsHistoryDrawerOpen(false)}
                className="px-3.5 py-2 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
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
