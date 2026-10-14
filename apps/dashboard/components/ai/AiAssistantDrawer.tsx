'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  CloseIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  RefreshCwIcon,
  EditIcon,
  TargetIcon,
  FileCheckIcon,
  AlignLeftIcon,
  ZapIcon,
  MessageSquareIcon,
  AlertTriangleIcon,
  ClockIcon,
  TrashIcon,
  ChevronRightIcon,
  SlidersIcon,
  CopyIcon,
  CheckIcon,
  FileTextIcon,
  LoaderIcon,
} from '@/components/icons/CustomIcons';

import { AutoResizeTextarea } from '@/components/ui/AutoResizeTextarea';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { tryLocalTemplateGeneration, tryLocalSummaryTemplateGeneration } from '@/lib/nlp-pruner';
import { buildCvRewriterSystemPrompt, buildCvRewriterUserPrompt } from '@/lib/cv-rewriter-prompt';
import { cleanBulletLine, cleanBulletText } from '@/lib/cv-bullets';
import type { CvPurpose } from '@/lib/cv-purpose-scoring-engine';
import type { AiKeywordSignal } from '@/lib/cv-purpose-ats-score';

export interface CvContextData {
  headline?: string;
  targetRole?: string;
  education?: string;
  skills?: string[];
}

export interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sectionKey: string;
  sectionTitle: string;
  currentContent?: string;
  onApplyContent: (newContent: string, feedbackMsg: string) => void;
  targetJobTitle?: string;
  /** Profil tujuan CV aktif — menentukan level karier & bahasa output prompt. */
  purpose?: CvPurpose;
  /** Nama perusahaan entri pengalaman yang sedang diedit (opsional). */
  companyName?: string;
  /** User masih bekerja di entri ini sekarang (kata kerja bentuk kini). */
  isCurrentJob?: boolean;
  /** Kata kunci dari JD lowongan target (opsional, memperkuat goal ATS). */
  jobKeywords?: string;
  /** Callback keyword ATS yang dipakai AI saat user meng-apply satu opsi — untuk skor ATS real-time. */
  onKeywordsApplied?: (sectionKey: string, keywords: string[]) => void;
  /** Data konteks CV aktif (pendidikan, target profesi, keahlian) untuk auto-hydration ringkasan. */
  cvContext?: CvContextData;
}

export type AiGoal = 'auto' | 'impact' | 'ats' | 'concise';
export type AiFormula = 'auto' | 'star' | 'car' | 'par' | 'xyz' | 'sar' | 'metrics' | 'ats-keywords';

export interface AiGenerationOption {
  id: string;
  batchId?: number;
  batchLabel?: string;
  createdAt?: string;
  label: string;
  formulaTag: string;
  text: string;
  /** Output terstruktur baru dari cv-rewriter-prompt (per bullet meta). */
  bullets?: Array<{
    text: string;
    formula_applied?: string;
    has_placeholder?: boolean;
    keywords_used?: string[];
  }>;
  notes?: string;
}

/** Deteksi placeholder angka — dari meta bullets ATAU pattern teks (termasuk local template). */
export function optionHasPlaceholder(opt: AiGenerationOption): boolean {
  if (opt.bullets?.some((b) => b.has_placeholder)) return true;
  return /\[(isi|tambahkan)[^\]]*\]/i.test(opt.text || '');
}

export interface AiGenerationRecord {
  id: string;
  createdAt: string;
  sectionKey: string;
  sectionTitle: string;
  targetJobTitle: string;
  goal: string;
  formula: string;
  inputText: string;
  options: AiGenerationOption[];
}

const STORAGE_KEY = 'employr_ai_generation_history';
const MAX_HISTORY = 20;

function getStoredHistory(): AiGenerationRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredHistory(records: AiGenerationRecord[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, MAX_HISTORY)));
  } catch {
    // ignore
  }
}

export interface ClarifyOption {
  id: string;
  label: string;
  text: string;
}

export interface ClarifyGap {
  id: string;
  category: 'metrics_scale' | 'ats_keywords' | 'role_alignment' | 'concise_value_prop';
  title: string;
  question: string;
  options: ClarifyOption[];
  placeholder: string;
}

export function getRoleCategory(targetJobTitle: string = '', text: string = ''): string {
  const combined = `${targetJobTitle} ${text}`.toLowerCase();
  if (/(coach|esport|e-sport|gaming|game|mobile legends|mlbb|pubg|free fire|valorant|dota|roamer|jungler)/i.test(combined)) {
    return 'esports';
  }
  if (/(developer|engineer|programmer|frontend|backend|fullstack|software|web|data|it|devops|qa|tester|ui\/ux|system)/i.test(combined)) {
    return 'tech';
  }
  if (/(marketing|pemasaran|social media|medsos|content creator|copywriter|seo|growth|digital marketing|iklan)/i.test(combined)) {
    return 'marketing';
  }
  if (/(finance|keuangan|akuntansi|accounting|auditor|pajak|tax|kasir|teller)/i.test(combined)) {
    return 'finance';
  }
  if (/(customer service|cs|call center|helpdesk|support|komplain|layanan pelanggan)/i.test(combined)) {
    return 'cs';
  }
  if (/(sales|penjualan|bizdev|business development|account executive|telesales|spg|spb|marketing lapangan)/i.test(combined)) {
    return 'sales';
  }
  if (/(admin|administrasi|operasional|operations|logistik|gudang|staf)/i.test(combined)) {
    return 'admin_ops';
  }
  return 'general';
}

export function getFormulaClarificationGaps(
  text: string,
  targetJobTitle: string = '',
  goal: AiGoal = 'auto',
  formula: AiFormula = 'auto',
  cvContext?: CvContextData
): ClarifyGap[] {
  const trimmed = text.trim();
  const role = targetJobTitle || cvContext?.headline || 'Profesional';
  const roleCat = getRoleCategory(role, '');
  const textCat = getRoleCategory('', trimmed);

  // Jika teks sudah sangat komprehensif (> 220 karakter) dan memiliki data angka, tidak perlu interupsi
  if (trimmed.length > 220 && /\d+/.test(trimmed)) {
    return [];
  }

  const gaps: ClarifyGap[] = [];

  const hasPercentage = /\d+%/.test(trimmed);
  const hasScaleMetric = /(\d+\s*(orang|tim|proyek|klien|player|atlet|pertandingan|scrim|jam|bulan|tahun|user|siswa|peserta))/i.test(trimmed);
  const hasImpactWords = /(meningkat|menaikkan|juara|winrate|win rate|efisien|menghemat|mencapai|lolos|top\s*\d+|tumbuh|sukses)/i.test(trimmed);
  const isRoleMismatched = roleCat !== 'general' && textCat !== 'general' && roleCat !== textCat;

  // 1. GAP: Takaran Skala & Capaian Terukur
  const needsMetrics =
    goal === 'impact' ||
    formula === 'metrics' ||
    formula === 'xyz' ||
    formula === 'car' ||
    (goal === 'auto' && (!hasPercentage || !hasImpactWords) && (!hasScaleMetric || isRoleMismatched));

  if (needsMetrics) {
    if (roleCat === 'esports') {
      gaps.push({
        id: 'gap-metrics-esports',
        category: 'metrics_scale',
        title: 'Takaran Skala & Hasil Kompetitif',
        question: `Berapa skala tim atau target capaian terukur yang pernah kamu bawa untuk posisi ${role}?`,
        options: [
          {
            id: 'opt-esp-1',
            label: 'Skala Tim & Scrim',
            text: 'Memimpin 5 atlet kompetitif, mengelola 25+ jadwal scrim bulanan dengan win rate 75%+',
          },
          {
            id: 'opt-esp-2',
            label: 'Capaian Turnamen',
            text: 'Membawa tim lolos babak Playoff / Top 4 turnamen regional semi-pro & komunitas',
          },
          {
            id: 'opt-esp-3',
            label: 'Kenaikan Rank & Makro',
            text: 'Menaikkan tier 100% pemain ke Mythical Immortal dengan peningkatan disiplin makro 40%',
          },
        ],
        placeholder: 'Contoh: Juara 1 turnamen regional MLBB, win rate scrim 80%',
      });
    } else if (roleCat === 'tech') {
      gaps.push({
        id: 'gap-metrics-tech',
        category: 'metrics_scale',
        title: 'Skala Sistem & Dampak Kuantitatif',
        question: `Berapa skala pengguna, proyek, atau peningkatan performa yang kamu hasilkan di bidang ${role}?`,
        options: [
          {
            id: 'opt-tech-1',
            label: 'Skala Pengguna',
            text: 'Mengembangkan fitur web/app yang digunakan aktif oleh 5.000+ pengguna bulanan',
          },
          {
            id: 'opt-tech-2',
            label: 'Optimasi Performa',
            text: 'Mengurangi loading time aplikasi hingga 40% dan menghemat beban server 25%',
          },
          {
            id: 'opt-tech-3',
            label: 'Pengiriman Proyek',
            text: 'Menuntaskan 8+ modul sprint tepat waktu dengan 98% test coverage tanpa breaking bug',
          },
        ],
        placeholder: 'Contoh: Melayani 10k pengguna, loading dipercepat 35%',
      });
    } else if (roleCat === 'finance') {
      gaps.push({
        id: 'gap-metrics-finance',
        category: 'metrics_scale',
        title: 'Volume Transaksi & Akurasi Finansial',
        question: `Berapa volume transaksi harian atau tingkat akurasi laporan yang kamu kelola sebagai ${role}?`,
        options: [
          {
            id: 'opt-fin-1',
            label: 'Volume & Akurasi',
            text: 'Memproses 150+ transaksi harian dan rekonsiliasi kas/bank dengan akurasi 99.8%',
          },
          {
            id: 'opt-fin-2',
            label: 'Kecepatan Closing',
            text: 'Menyelesaikan laporan keuangan bulanan tepat waktu 2 hari sebelum batas closing',
          },
          {
            id: 'opt-fin-3',
            label: 'Efisiensi Anggaran',
            text: 'Membantu efisiensi operasional dan mereduksi selisih anggaran inventaris hingga 15%',
          },
        ],
        placeholder: 'Contoh: Rekonsiliasi 100+ transaksi/hari, akurasi 99.9%',
      });
    } else if (roleCat === 'marketing') {
      gaps.push({
        id: 'gap-metrics-mkt',
        category: 'metrics_scale',
        title: 'Pertumbuhan Metrik & Konversi',
        question: `Berapa angka pertumbuhan follower, impresi, atau ROAS campaign yang berhasil kamu raih?`,
        options: [
          {
            id: 'opt-mkt-1',
            label: 'Pertumbuhan Organik',
            text: 'Meningkatkan engagement rate media sosial organik hingga 45% dalam tempo 3 bulan',
          },
          {
            id: 'opt-mkt-2',
            label: 'Performa Iklan (ROAS)',
            text: 'Mengelola budget ads berbayar dengan ROAS konsisten 3.5x dan jangkauan 50k+ audiens',
          },
          {
            id: 'opt-mkt-3',
            label: 'Output Konten',
            text: 'Memproduksi 30+ aset konten kreatif per bulan yang menghasilkan 200+ leads baru',
          },
        ],
        placeholder: 'Contoh: Engagement naik 50%, 100k view organik',
      });
    } else if (roleCat === 'sales') {
      gaps.push({
        id: 'gap-metrics-sales',
        category: 'metrics_scale',
        title: 'Pencapaian Target Penjualan',
        question: `Berapa persentase pencapaian target atau volume penjualan yang kamu raih di posisi ${role}?`,
        options: [
          {
            id: 'opt-sales-1',
            label: 'Target Quota',
            text: 'Mencapai target penjualan 115% selama 2 kuartal beruntun dengan closing rate 28%',
          },
          {
            id: 'opt-sales-2',
            label: 'Akuisisi Klien',
            text: 'Mengakuisisi 25+ klien baru dan membangun portofolio kemitraan bisnis jangka panjang',
          },
          {
            id: 'opt-sales-3',
            label: 'Efisiensi Pipeline',
            text: 'Menghubungi 40+ prospek harian dan mendongkrak konversi funnel sebesar 35%',
          },
        ],
        placeholder: 'Contoh: Capai 120% target penjualan bulanan, 30 klien baru',
      });
    } else if (roleCat === 'cs') {
      gaps.push({
        id: 'gap-metrics-cs',
        category: 'metrics_scale',
        title: 'Volume Tiket & Kepuasan Pelanggan',
        question: `Berapa volume komplain harian dan tingkat kepuasan pelanggan (CSAT) yang kamu jaga?`,
        options: [
          {
            id: 'opt-cs-1',
            label: 'CSAT & Volume',
            text: 'Menangani 80–100 tiket komplain harian dengan tingkat kepuasan pelanggan (CSAT) 95%',
          },
          {
            id: 'opt-cs-2',
            label: 'Kecepatan Respons',
            text: 'Menjaga SLA respons pertama di bawah 10 menit dan first-contact resolution 90%',
          },
          {
            id: 'opt-cs-3',
            label: 'Reduksi Keluhan',
            text: 'Menurunkan komplain berulang sebesar 25% melalui perbaikan dokumentasi FAQ dan SOP',
          },
        ],
        placeholder: 'Contoh: 100 tiket/hari, CSAT 96%, respons < 15 menit',
      });
    } else {
      // General / Default
      gaps.push({
        id: 'gap-metrics-general',
        category: 'metrics_scale',
        title: 'Skala & Hasil Nyata',
        question: `Berapa skala kerja atau hasil terukur yang bisa disematkan untuk posisi ${role}?`,
        options: [
          {
            id: 'opt-gen-1',
            label: 'Penyelesaian Proyek',
            text: 'Menyelesaikan 3+ proyek studi kasus dengan predikat nilai memuaskan dan apresiasi tim',
          },
          {
            id: 'opt-gen-2',
            label: 'Skala Tim / Peserta',
            text: 'Mengorganisir kepanitiaan/tim 15 orang untuk menyukseskan program berpeserta 250+ orang',
          },
          {
            id: 'opt-gen-3',
            label: 'Dedikasi Magang / Kerja',
            text: 'Menuntaskan masa magang 6 bulan dengan pencapaian target operasional harian 100%',
          },
        ],
        placeholder: 'Contoh: Selesai tepat waktu 100%, memimpin 10 orang',
      });
    }
  }

  // 2. GAP: Keahlian Metodologi & Kata Kunci ATS
  const needsAts =
    goal === 'ats' ||
    formula === 'ats-keywords' ||
    (goal === 'auto' && trimmed.length < 90 && !/(strategy|analisis|manajemen|sistem|metode|teknis)/i.test(trimmed));

  if (needsAts) {
    if (roleCat === 'esports') {
      gaps.push({
        id: 'gap-ats-esports',
        category: 'ats_keywords',
        title: 'Keahlian Taktis & Metodologi Coaching',
        question: `Keahlian taktis in-game atau metodologi bimbingan apa yang jadi fokus utamamu?`,
        options: [
          {
            id: 'opt-ats-esp-1',
            label: 'Drafting & Meta',
            text: 'Draft Pick & Banning Strategy, Analisis Meta Hero, Evaluasi Replay & Objective Timing',
          },
          {
            id: 'opt-ats-esp-2',
            label: 'Shotcalling & Makro',
            text: 'In-Game Macro Decision, Shotcalling Management, Team Chemistry & Mental Coaching',
          },
          {
            id: 'opt-ats-esp-3',
            label: 'Scouting & Mekanik',
            text: 'Player Scouting, Role Mastery (Mid/Exp/Gold/Roam/Jungle) & Evaluasi Scrim Berkala',
          },
        ],
        placeholder: 'Contoh: Analisis drafting pick, makro game, mental coaching',
      });
    } else if (roleCat === 'tech') {
      gaps.push({
        id: 'gap-ats-tech',
        category: 'ats_keywords',
        title: 'Tech Stack & Metodologi Rekayasa',
        question: `Tools, framework, atau metodologi apa yang ingin ditonjolkan untuk menyaring ATS ${role}?`,
        options: [
          {
            id: 'opt-ats-tech-1',
            label: 'Frontend Stack',
            text: 'TypeScript, React, Next.js App Router, Tailwind CSS & REST API Integration',
          },
          {
            id: 'opt-ats-tech-2',
            label: 'Backend & Database',
            text: 'Node.js, PostgreSQL, Prisma ORM, Database Optimization & Microservices',
          },
          {
            id: 'opt-ats-tech-3',
            label: 'Engineering Practice',
            text: 'Agile/Scrum, Git Version Control, Clean Architecture, CI/CD & Unit Testing',
          },
        ],
        placeholder: 'Contoh: React, TypeScript, Next.js, Git, Agile',
      });
    } else if (roleCat === 'finance') {
      gaps.push({
        id: 'gap-ats-finance',
        category: 'ats_keywords',
        title: 'Software Finansial & Standar Akuntansi',
        question: `Software akuntansi atau kepatuhan standar apa yang ingin kamu tonjolkan di filter ATS?`,
        options: [
          {
            id: 'opt-ats-fin-1',
            label: 'Tools & Spreadsheet',
            text: 'Microsoft Excel Tingkat Mahir (VLOOKUP, XLOOKUP, Pivot), SAP & Accurate Accounting',
          },
          {
            id: 'opt-ats-fin-2',
            label: 'Standar Akuntansi',
            text: 'Standar Akuntansi Keuangan (PSAK), Jurnal Umum, Rekonsiliasi Bank & Neraca Saldo',
          },
          {
            id: 'opt-ats-fin-3',
            label: 'Perpajakan & Budgeting',
            text: 'Perpajakan Indonesia (PPh 21/23/PPN), e-Faktur, Budgeting & Analisis Laporan Arus Kas',
          },
        ],
        placeholder: 'Contoh: Excel Pivot, SAP, PSAK, Pajak PPh/PPN',
      });
    } else if (roleCat === 'marketing') {
      gaps.push({
        id: 'gap-ats-mkt',
        category: 'ats_keywords',
        title: 'Kanal Pemasaran & Tools Analisis',
        question: `Kanal pemasaran dan tools analitik apa yang menjadi keahlian utama untuk posisi ${role}?`,
        options: [
          {
            id: 'opt-ats-mkt-1',
            label: 'Media Sosial & Konten',
            text: 'Social Media Management, Copywriting Persuasif, Content Planning & Riset Tren',
          },
          {
            id: 'opt-ats-mkt-2',
            label: 'Performance Ads & Data',
            text: 'Meta Ads Manager, Google Analytics 4, A/B Testing, Conversion Funnel & ROI Tracking',
          },
          {
            id: 'opt-ats-mkt-3',
            label: 'SEO & Desain Kreatif',
            text: 'SEO On-Page Dasar, Canva/CapCut Content Production & Email Marketing Campaign',
          },
        ],
        placeholder: 'Contoh: Meta Ads, TikTok Marketing, Copywriting, GA4',
      });
    } else {
      gaps.push({
        id: 'gap-ats-general',
        category: 'ats_keywords',
        title: 'Keahlian Inti & Terminologi Kerja',
        question: `Kompetensi fungsional apa yang paling ingin kamu perkuat agar lolos seleksi ATS ${role}?`,
        options: [
          {
            id: 'opt-ats-gen-1',
            label: 'Administrasi & Tools',
            text: 'Microsoft Office (Excel/Word/PowerPoint), Google Workspace, Pengarsipan & Entri Data',
          },
          {
            id: 'opt-ats-gen-2',
            label: 'Komunikasi & Kolaborasi',
            text: 'Komunikasi Efektif, Manajemen Waktu, Kolaborasi Lintas Tim & Orientasi Detail',
          },
          {
            id: 'opt-ats-gen-3',
            label: 'Problem Solving & Adaptasi',
            text: 'Pemecahan Masalah Kritis, Kemampuan Belajar Cepat (Fast Learner) & Kedisiplinan Kerja',
          },
        ],
        placeholder: 'Contoh: MS Office, Komunikasi, Kerja Tim, Manajemen Waktu',
      });
    }
  }

  // 3. GAP: Penyelarasan Peran (Khusus jika mismatch nyata)
  if (isRoleMismatched && gaps.length < 2) {
    gaps.push({
      id: 'gap-role-alignment',
      category: 'role_alignment',
      title: 'Penyelarasan Fokus ke Posisi Sasaran',
      question: `Draf kamu menyebutkan pengalaman di luar bidang ${role}. Bagaimana kamu ingin menyelaraskannya?`,
      options: [
        {
          id: 'opt-align-1',
          label: 'Fokus Kepemimpinan',
          text: `Mengalihkan pengalaman manajemen orang dan komunikasi untuk memimpin tim ${role} secara profesional`,
        },
        {
          id: 'opt-align-2',
          label: 'Fokus Analisis & Taktik',
          text: `Menggabungkan kemampuan analisis evaluasi dengan strategi teknis yang dibutuhkan di peran ${role}`,
        },
        {
          id: 'opt-align-3',
          label: 'Fokus Disiplin & Mental',
          text: `Menekankan dedikasi pembinaan mental, ketenangan di bawah tekanan, dan budaya kerja disiplin`,
        },
      ],
      placeholder: 'Contoh: Alihkan pengalaman komunikasi ke bimbingan tim',
    });
  }

  // 4. GAP: Ringkas & Proposisi Nilai (Khusus jika goal === 'concise')
  if (goal === 'concise' && gaps.length === 0) {
    gaps.push({
      id: 'gap-concise-vp',
      category: 'concise_value_prop',
      title: 'Proposisi Nilai Utama (Value Proposition)',
      question: `Apa 1 kekuatan paling menonjol yang ingin langsung diingat perekrut dalam 2 kalimat?`,
      options: [
        {
          id: 'opt-vp-1',
          label: 'Taktis & Berorientasi Hasil',
          text: 'Pribadi taktis dan disiplin tinggi dengan fokus utama pada efisiensi kerja dan pencapaian target',
        },
        {
          id: 'opt-vp-2',
          label: 'Analitis & Adaptif',
          text: 'Kombinasi analisis mendalam dan eksekusi lincah yang cepat menyesuaikan diri dengan tren baru',
        },
        {
          id: 'opt-vp-3',
          label: 'Kolaboratif & Kepemimpinan',
          text: 'Gaya kepemimpinan komunikatif yang mampu menjaga moral tim dan membangun kolaborasi solid',
        },
      ],
      placeholder: 'Contoh: Pribadi taktis, disiplin tinggi, cepat adaptasi',
    });
  }

  return gaps.slice(0, 2);
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  sectionKey,
  sectionTitle,
  currentContent = '',
  onApplyContent,
  targetJobTitle = 'Professional',
  purpose,
  companyName,
  isCurrentJob = false,
  jobKeywords: initialJobKeywords,
  onKeywordsApplied,
  cvContext,
}) => {
  const [goal, setGoal] = useState<AiGoal>('auto');
  const [formula, setFormula] = useState<AiFormula>('auto');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isStyleConfigOpen, setIsStyleConfigOpen] = useState(false);
  const [step, setStep] = useState<'select' | 'interview' | 'clarify' | 'loading' | 'results' | 'empty' | 'error' | 'history'>('select');
  const [userRawInput, setUserRawInput] = useState(currentContent);
  const [errorMessage, setErrorMessage] = useState('');

  // Clarification state untuk melengkapi formula penulisan (non-blocking + rekomendasi siap tap)
  const [clarifyGaps, setClarifyGaps] = useState<ClarifyGap[]>([]);
  const [clarifySelections, setClarifySelections] = useState<{ [gapId: string]: string[] }>({});
  const [clarifyCustomInputs, setClarifyCustomInputs] = useState<{ [gapId: string]: string }>({});

  // History State
  const [historyList, setHistoryList] = useState<AiGenerationRecord[]>([]);
  const [selectedHistoryRecord, setSelectedHistoryRecord] = useState<AiGenerationRecord | null>(null);

  // Interview state
  const [interviewQuestionIdx, setInterviewQuestionIdx] = useState(0);
  const [interviewAnswers, setInterviewAnswers] = useState<{ [key: string]: string }>({});
  const [currentAnswerInput, setCurrentAnswerInput] = useState('');

  // Generated options state
  const [generatedOptions, setGeneratedOptions] = useState<AiGenerationOption[]>([]);

  // JD keywords state (untuk goal ATS)
  const [jobKeywords, setJobKeywords] = useState(initialJobKeywords || '');

  // Dedicated state for separated summary forms & multi-batch accumulation
  const [currentSummary, setCurrentSummary] = useState<string>(currentContent || '');
  const [initialDraftSummary, setInitialDraftSummary] = useState<string>(currentContent || '');
  const [aiPromptInput, setAiPromptInput] = useState<string>('');
  const [generationCount, setGenerationCount] = useState<number>(0);
  const [appliedOptionId, setAppliedOptionId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const prevSectionKeyRef = useRef(sectionKey);

  // Reset drawer state when opened with new content
  useEffect(() => {
    if (isOpen) {
      // 1. Fetch from Database API first, fallback to localStorage
      fetch('/api/ai/history')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            setHistoryList(data.data);
            saveStoredHistory(data.data);
          } else {
            setHistoryList(getStoredHistory());
          }
        })
        .catch(() => {
          setHistoryList(getStoredHistory());
        });

      setCurrentSummary(currentContent || '');
      setInitialDraftSummary(currentContent || '');
      setUserRawInput(currentContent || '');

      // Reset options if user switched to another section
      if (prevSectionKeyRef.current !== sectionKey) {
        setGeneratedOptions([]);
        setGenerationCount(0);
        setAiPromptInput('');
        setAppliedOptionId(null);
        prevSectionKeyRef.current = sectionKey;
      }

      setStep('select');
      setGoal('auto');
      setFormula('auto');
      setIsStyleConfigOpen(false);
      setIsAdvancedOpen(false);
      setInterviewQuestionIdx(0);
      setInterviewAnswers({});
      setCurrentAnswerInput('');
      setClarifyGaps([]);
      setClarifySelections({});
      setClarifyCustomInputs({});
      setErrorMessage('');
      setSelectedHistoryRecord(null);
      setJobKeywords(initialJobKeywords || '');
      setIsLoadingAi(false);
    }
  }, [isOpen, sectionKey, currentContent, initialJobKeywords]);

  if (!isOpen) return null;

  // Kontekstual UX berdasarkan section
  const isBulletSection = ['experience', 'internships', 'projects', 'organizations', 'pengalaman'].some((k) =>
    sectionKey.toLowerCase().includes(k) || sectionTitle.toLowerCase().includes(k)
  );
  const isSummary = sectionKey.toLowerCase().includes('summary') || sectionTitle.toLowerCase().includes('ringkasan');

  const contextLabel = isSummary
    ? 'Ceritakan latar belakang & target posisi'
    : `Deskripsi ${sectionTitle}`;

  const contextPlaceholderEmpty = isSummary
    ? 'Contoh: Lulusan baru Akuntansi UI, mahir SAP & Excel, aktif di organisasi, mencari posisi Junior Finance...'
    : isBulletSection
    ? `Contoh: Saya mengelola proyek web app untuk 50+ klien, berhasil meningkatkan konversi 25%...`
    : 'Ceritakan pengalaman atau poin utama kamu secara bebas...';

  const contextPlaceholderSelect = isSummary
    ? 'Ketik poin pengalaman, keahlian utama, atau posisi yang kamu tuju...'
    : isBulletSection
    ? `Ketik tugas, tanggung jawab, atau pencapaian utama di posisi ${sectionTitle}...`
    : 'Ketik poin atau pengalaman sederhana kamu di sini...';

  const contextEmptyTitle = isSummary
    ? 'Ceritakan latar belakang dan target posisimu'
    : `Ceritakan Pengalamanmu di ${sectionTitle}`;

  const contextEmptyDesc = isSummary
    ? 'Tulis poin singkat latar belakang dan keahlianmu. Sistem akan menyusunnya jadi ringkasan profesional yang ramah ATS.'
    : 'Tidak perlu menulis dengan format CV kaku. Cukup ceritakan tugas dan pencapaian kamu dengan bahasa sehari-hari secara bebas.';

  // Analisis kekurangan data input user untuk menentukan pertanyaan interview yang relevan
  const analyzeInputGaps = (text: string) => {
    const gaps: Array<{ id: string; question: string; placeholder: string }> = [];
    const lower = text.toLowerCase();
    const hasNumbers = /\d+/.test(text);
    const hasTools = /(jira|trello|asana|figma|slack|notion|excel|sql|python|react|node|agile|scrum|kanban|waterfall)/i.test(text);
    const hasMetrics = /(\d+%|\d+\s*(orang|klien|proyek|user|client|tim|bulan|minggu|jam))/i.test(text);
    const hasImpact = /(meningkat|menurun|berhasil|mencapai|menghemat|efisien|optim|reduc|improv|achiev|deliver|launch|complet)/i.test(text);

    if (!hasNumbers && !hasMetrics) {
      gaps.push({
        id: 'scale',
        question: isSummary
          ? 'Berapa tahun pengalaman kerja kamu di bidang ini?'
          : `Di posisi ${sectionTitle}, berapa skala kerjamu? (misal: kelola 5 proyek, tim 10 orang, 50+ klien)`,
        placeholder: isSummary
          ? 'Contoh: 3 tahun pengalaman di bidang fintech'
          : 'Contoh: Mengelola 5 proyek dan tim 10 orang',
      });
    }

    if (!hasImpact) {
      gaps.push({
        id: 'impact',
        question: `Apa hasil atau dampak konkret dari pekerjaanmu? (misal: efisiensi naik 30%, proyek selesai tepat waktu 95%)`,
        placeholder: 'Contoh: Proyek selesai tepat waktu 95%, hemat biaya 20%',
      });
    }

    if (isBulletSection && !hasTools && text.length < 100) {
      gaps.push({
        id: 'tools',
        question: `Tools atau metodologi apa yang kamu gunakan di posisi ini?`,
        placeholder: 'Contoh: Agile/Scrum, Jira, Figma, Google Analytics',
      });
    }

    return gaps;
  };

  const detectedGaps = analyzeInputGaps(userRawInput);
  const shouldShowInterview = detectedGaps.length > 0 && interviewQuestionIdx === 0 && Object.keys(interviewAnswers).length === 0;

  // Use detected gaps as interview questions (only questions that are actually needed)
  const interviewQuestions = detectedGaps;

  const handleStartAiProcess = async (promptOverride?: string, skipClarify: boolean = false) => {
    const cvDerivedSummary = [
      cvContext?.education ? `Lulusan ${cvContext.education}` : '',
      cvContext?.skills && cvContext.skills.length > 0 ? `memiliki keahlian ${cvContext.skills.slice(0, 4).join(', ')}` : '',
      cvContext?.headline ? `menargetkan posisi ${cvContext.headline}` : (targetJobTitle ? `menargetkan posisi ${targetJobTitle}` : ''),
    ].filter(Boolean).join(' yang ');

    const defaultSummaryFallback = cvDerivedSummary || 'Professional muda yang berdedikasi dan siap berkembang.';

    const baseText = isSummary
      ? (promptOverride || aiPromptInput.trim() || currentSummary.trim() || defaultSummaryFallback)
      : (promptOverride || userRawInput.trim() || 'Mengelola operasional dan pengembangan proyek secara efektif.');

    // Cek kebutuhan klarifikasi rumus penulisan jika belum di-skip
    if (!skipClarify) {
      const formulaGaps = getFormulaClarificationGaps(baseText, targetJobTitle, goal, formula, cvContext);
      if (formulaGaps.length > 0) {
        setClarifyGaps(formulaGaps);
        setStep('clarify');
        return;
      }
    }

    // Only trigger interview if non-summary AND there are actual data gaps AND user hasn't answered yet
    if (!isSummary && shouldShowInterview && userRawInput.length < 80 && !skipClarify) {
      setStep('interview');
      return;
    }

    setIsLoadingAi(true);
    if (isSummary) {
      setStep('select');
    } else {
      setStep('loading');
    }
    setErrorMessage('');

    try {
      const ans1 = interviewAnswers['q1'] ? `Skala kerja: ${interviewAnswers['q1']}.` : '';
      const ans2 = interviewAnswers['q2'] ? `Dampak: ${interviewAnswers['q2']}.` : '';

      const isBulletSection = ['experience', 'internships', 'projects', 'organizations', 'pengalaman'].some((k) =>
        sectionKey.toLowerCase().includes(k) || sectionTitle.toLowerCase().includes(k)
      );

      // System prompt dinamis (cv-rewriter-prompt): 1 template + variabel per request.
      // Tujuan penulisan & formula = dua dimensi kontrol independen dari UI drawer.
      const promptSystem = buildCvRewriterSystemPrompt({
        jabatan: targetJobTitle,
        perusahaan: companyName,
        isCurrentJob,
        purpose,
        goal,
        formula,
        jobKeywords: jobKeywords.trim() || undefined,
      });

      const extraContext = [ans1, ans2].filter(Boolean);
      const userPrompt = isBulletSection
        ? buildCvRewriterUserPrompt(baseText, extraContext)
        : `TASK: ${isSummary ? 'optimize_summary' : 'optimize_section'}
SECTION: ${sectionTitle}
INPUT: "${baseText}"
${ans1 ? 'SKALA: ' + ans1 : ''}
${ans2 ? 'DAMPAK: ' + ans2 : ''}
FORMAT: Kembalikan JSON array TEPAT 3 objek: [{"id":"opt-1","label":"Fokus Hasil & Metrik","formulaTag":"Hasil Terukur","text":"paragraf ringkasan disini"}, {"id":"opt-2","label":"Fokus Kata Kunci ATS","formulaTag":"Kata Kunci Relevan","text":"paragraf ringkasan disini"}, {"id":"opt-3","label":"Fokus Ringkas & Komunikatif","formulaTag":"Komunikatif","text":"paragraf ringkasan disini"}]. Tanpa markdown, tanpa teks pengantar.`;

      // 1. Coba Local Template Engine (0 Tokens Used, Rp 0) untuk input sederhana
      const localOptions = isBulletSection && !ans1 && !ans2 ? tryLocalTemplateGeneration(baseText, sectionTitle, targetJobTitle) : null;
      let options: AiGenerationOption[] = [];

      if (localOptions && goal === 'auto' && formula === 'auto') {
        options = localOptions;
      } else {
        // 2. Kirim ke API AI Gateway dengan Mode-Aware Cache Key & Micro Payload
        try {
          const res = await fetch('/api/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: userPrompt,
              systemInstruction: promptSystem,
              promptName: `CV Assistant (${sectionTitle})`,
              contextKey: sectionKey,
              goal,
              role: targetJobTitle,
              feature: 'cv_assistant',
            }),
          });

          const result = await res.json();

          if (!res.ok || result.error) {
            throw new Error(result.error || 'Gagal menghubungi server.');
          }

          // Clean raw text response (strip markdown fences if present)
          let cleanedText = (result.text || '').trim();
          if (cleanedText.startsWith('```')) {
            cleanedText = cleanedText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
          }

          try {
            const parsed = JSON.parse(cleanedText);
            // Format baru: {bullets: [...], notes} per opsi (cv-rewriter-prompt).
            if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.bullets) {
              options = parsed.map((o: any, idx: number) => ({
                id: o.id || `opt-${idx + 1}`,
                label: o.label || `Opsi ${idx + 1}`,
                formulaTag: o.formulaTag || o.formula_applied || 'Sistem',
                text: Array.isArray(o.bullets) ? o.bullets.map((b: any) => cleanBulletLine(b?.text || '')).join('\n') : cleanBulletText(String(o.text || '')),
                bullets: o.bullets,
                notes: o.notes,
              }));
            } else if (Array.isArray(parsed)) {
              options = parsed.map((p: any, idx: number) => {
                const textVal = typeof p === 'string'
                  ? p
                  : (p.text || p.summary || p.ringkasan || p.content || '');
                return {
                  id: p.id || `opt-${idx + 1}`,
                  label: p.label || (p.option ? `Opsi ${p.option}` : `Opsi ${idx + 1}`),
                  formulaTag: p.formulaTag || p.formula_applied || (isSummary ? 'Ringkasan Teroptimasi' : 'Sistem'),
                  text: cleanBulletText(String(textVal)),
                  notes: p.notes,
                };
              }).filter((opt: any) => opt.text.trim().length > 0);
            } else if (parsed && typeof parsed === 'object') {
              const textVal = parsed.text || parsed.summary || parsed.ringkasan || parsed.content || '';
              options = [{
                id: parsed.id || 'opt-1',
                label: parsed.label || 'Opsi 1: Rekomendasi Utama',
                formulaTag: parsed.formulaTag || 'Rekomendasi Teroptimasi',
                text: Array.isArray(parsed.bullets)
                  ? parsed.bullets.map((b: any) => cleanBulletLine(b?.text || '')).join('\n')
                  : cleanBulletText(String(textVal)),
                bullets: Array.isArray(parsed.bullets) ? parsed.bullets : undefined,
                notes: parsed.notes,
              }];
            }
          } catch {
            if (cleanedText.length > 20) {
              options = [
                {
                  id: 'opt-1',
                  label: 'Opsi 1: Rekomendasi Utama',
                  formulaTag: 'Rekomendasi Teroptimasi',
                  text: cleanedText.slice(0, 350),
                },
              ];
            }
          }
        } catch (apiErr: any) {
          console.warn('[Assistant Drawer] Gateway mengalami kendala, beralih ke template cerdas lokal:', apiErr?.message);
          if (isSummary) {
            options = tryLocalSummaryTemplateGeneration(baseText, targetJobTitle, cvContext);
          } else if (localOptions) {
            options = localOptions;
          } else {
            throw apiErr;
          }
        }
      }

      if (Array.isArray(options) && options.length > 0) {
        const nextBatch = generationCount + 1;
        setGenerationCount(nextBatch);
        const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        const mappedOptions: AiGenerationOption[] = options.map((opt, idx) => ({
          ...opt,
          id: `batch-${nextBatch}-opt-${idx + 1}-${Date.now()}`,
          batchId: nextBatch,
          batchLabel: `Batch #${nextBatch}`,
          createdAt: timeNow,
        }));

        // Akumulasi opsi baru di awal (terbaru di atas) tanpa menghapus opsi lama!
        setGeneratedOptions((prev) => [...mappedOptions, ...prev]);
        setStep('results');

        // Save to Database API + localStorage fallback
        const newRecord: AiGenerationRecord = {
          id: crypto.randomUUID ? crypto.randomUUID() : `gen-${Date.now()}`,
          createdAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }),
          sectionKey,
          sectionTitle,
          targetJobTitle,
          goal,
          formula,
          inputText: baseText,
          options: mappedOptions,
        };

        const updatedHistory = [newRecord, ...historyList].slice(0, MAX_HISTORY);
        setHistoryList(updatedHistory);
        saveStoredHistory(updatedHistory);

        // Persist to Database
        fetch('/api/ai/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sectionKey,
            sectionTitle,
            targetJobTitle,
            goal,
            formula,
            inputText: baseText,
            options: mappedOptions,
          }),
        }).catch(() => {
          // silently fail, localStorage fallback already saved
        });
      } else {
        throw new Error('Respon sistem tidak dapat diproses.');
      }
    } catch (err: any) {
      console.error('[Assistant Drawer] Error:', err);
      setErrorMessage(err.message || 'Terjadi kendala saat menyusun rekomendasi.');
      if (!isSummary) setStep('error');
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleToggleClarifyOption = (gapId: string, optionId: string) => {
    setClarifySelections((prev) => {
      const current = prev[gapId] || [];
      const exists = current.includes(optionId);
      return {
        ...prev,
        [gapId]: exists ? current.filter((id) => id !== optionId) : [...current, optionId],
      };
    });
  };

  const handleCustomClarifyChange = (gapId: string, val: string) => {
    setClarifyCustomInputs((prev) => ({
      ...prev,
      [gapId]: val,
    }));
  };

  const handleApplyClarificationAndProcess = () => {
    const additions: string[] = [];
    clarifyGaps.forEach((gap) => {
      const selectedIds = clarifySelections[gap.id] || [];
      const selectedTexts = gap.options
        .filter((opt) => selectedIds.includes(opt.id))
        .map((opt) => opt.text);
      const customText = (clarifyCustomInputs[gap.id] || '').trim();

      if (selectedTexts.length > 0) {
        additions.push(`${gap.title}: ${selectedTexts.join('; ')}`);
      }
      if (customText) {
        additions.push(`${gap.title} (tambahan): ${customText}`);
      }
    });

    const currentBase = isSummary
      ? (aiPromptInput.trim() || currentSummary.trim())
      : userRawInput.trim();

    let enhancedText = currentBase;
    if (additions.length > 0) {
      enhancedText = currentBase
        ? `${currentBase}. ${additions.join('. ')}.`
        : additions.join('. ');
    }

    if (isSummary) {
      setAiPromptInput(enhancedText);
    } else {
      setUserRawInput(enhancedText);
    }

    handleStartAiProcess(enhancedText, true);
  };

  const handleSkipClarification = () => {
    handleStartAiProcess(undefined, true);
  };

  const hasSelectedAnyClarification =
    Object.values(clarifySelections).some((arr) => arr.length > 0) ||
    Object.values(clarifyCustomInputs).some((str) => str.trim().length > 0);

  const handleAnswerInterviewNext = () => {
    if (currentAnswerInput.trim()) {
      setInterviewAnswers((prev) => ({
        ...prev,
        [interviewQuestions[interviewQuestionIdx].id]: currentAnswerInput.trim(),
      }));
    }
    setCurrentAnswerInput('');

    if (interviewQuestionIdx < interviewQuestions.length - 1) {
      setInterviewQuestionIdx((prev) => prev + 1);
    } else {
      handleStartAiProcess(undefined, true);
    }
  };

  const handleSelectOption = (opt: AiGenerationOption) => {
    setAppliedOptionId(opt.id);
    setCurrentSummary(opt.text);

    const placeholderHint = optionHasPlaceholder(opt)
      ? ' (Lengkapi data bertanda [ ] dengan pencapaian aslimu sebelum ekspor).'
      : '';
    const notesHint = opt.notes ? ` ${opt.notes}` : '';
    const usedKw = Array.from(new Set(opt.bullets?.flatMap((b) => b.keywords_used || []) || []));
    const kwHint = usedKw.length > 0 ? ` Keyword: ${usedKw.slice(0, 5).join(', ')}.` : '';
    const feedback = `Hasil berhasil diterapkan ke CV: hasil terukur dan keyword relevan.${kwHint}${placeholderHint}${notesHint}`;
    if (usedKw.length > 0 && onKeywordsApplied) {
      onKeywordsApplied(sectionKey, usedKw);
    }
    onApplyContent(opt.text, feedback);

    // Non-summary section closes drawer, summary keeps drawer open for comparison
    if (!isSummary) {
      onClose();
    }
  };

  const handleCopyText = (id: string, text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleDeleteHistoryRecord = (recordId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = historyList.filter((h) => h.id !== recordId);
    setHistoryList(updated);
    saveStoredHistory(updated);
    if (selectedHistoryRecord?.id === recordId) {
      setSelectedHistoryRecord(null);
    }
  };

  const handleClearAllHistory = () => {
    setHistoryList([]);
    saveStoredHistory([]);
    setSelectedHistoryRecord(null);
  };

  const handleAddPromptChip = (chipText: string) => {
    setAiPromptInput((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return chipText;
      if (trimmed.toLowerCase().includes(chipText.toLowerCase())) return prev;
      return `${trimmed}, ${chipText}`;
    });
  };

  const defaultQuickChips = [
    { id: 'fresh', label: 'Fresh Graduate', text: 'Fresh graduate yang berdedikasi dan siap berkembang' },
    { id: 'smk', label: 'Lulusan SMK / Vokasi', text: 'Lulusan SMK dengan keterampilan praktis teruji' },
    { id: 'office', label: 'Mahir MS Office / Excel', text: 'mahir mengoperasikan Microsoft Office dan Excel' },
    { id: 'admin', label: 'Administrasi & Data', text: 'terbiasa mengelola administrasi, pengarsipan, dan entri data' },
    { id: 'komunikasi', label: 'Komunikatif & Teliti', text: 'memiliki kemampuan komunikasi yang baik, teliti, dan disiplin' },
    { id: 'magang', label: 'Siap Magang', text: 'mencari kesempatan magang (internship)' },
    { id: 'fulltime', label: 'Siap Kerja Penuh', text: 'siap bekerja penuh waktu (full-time)' },
  ];

  const skillQuickChips = (cvContext?.skills || [])
    .slice(0, 3)
    .map((s, idx) => ({
      id: `cv-skill-${idx}`,
      label: `Keahlian: ${s}`,
      text: `memiliki kompetensi di bidang ${s}`,
    }));

  const summaryQuickChips = [...skillQuickChips, ...defaultQuickChips];
  const promptWordCount = aiPromptInput.trim() ? aiPromptInput.trim().split(/\s+/).length : 0;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent
        side="right"
        hideCloseButton
        className="w-full max-w-md sm:max-w-xl p-0 flex flex-col justify-between overflow-hidden"
      >
        <SheetTitle className="sr-only">
          {isSummary ? 'Bantu Tulis Ringkasan Profil' : 'Bantu Tulis Rekomendasi'}
        </SheetTitle>

        {isStyleConfigOpen ? (
          /* SUB-VIEW: KONFIGURASI GAYA PENULISAN */
          <div className="w-full h-full flex flex-col justify-between overflow-hidden">
            {/* Header Konfigurasi */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={() => setIsStyleConfigOpen(false)}
                  className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 flex items-center justify-center transition cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                  aria-label="Kembali ke formulir draf"
                >
                  <ChevronRightIcon className="w-4 h-4 rotate-180" />
                </button>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    Gaya Penulisan
                  </h4>
                  <p className="text-caption text-slate-500 dark:text-slate-400 font-medium truncate">
                    Tujuan, Formula &amp; Kata Kunci
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {(goal !== 'auto' || formula !== 'auto') && (
                  <button
                    type="button"
                    onClick={() => {
                      setGoal('auto');
                      setFormula('auto');
                    }}
                    className="text-caption font-bold text-cobalt-500 dark:text-blue-400 hover:underline px-2.5 py-1.5 min-h-[36px] flex items-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 rounded-[6px]"
                  >
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsStyleConfigOpen(false)}
                  className="px-3.5 py-1.5 min-h-[36px] rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 text-white font-extrabold text-xs shadow-sm transition flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                >
                  <span>Selesai</span>
                  <CheckCircleIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Body Konfigurasi */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 min-h-0 space-y-4 no-scrollbar">
              {/* Goal Selection Header */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Pilih Tujuan Penulisan
                </h4>

                {/* Option: Recommendation (DEFAULT) */}
                <button
                  type="button"
                  onClick={() => setGoal('auto')}
                  className={`w-full text-left p-3 rounded-[10px] border transition cursor-pointer flex items-start gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 ${
                    goal === 'auto'
                      ? 'bg-blue-50/90 dark:bg-blue-950/60 border-cobalt-500 dark:border-blue-600 ring-2 ring-cobalt-500/20'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-cobalt-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <TargetIcon className="w-3 h-3 fill-white" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Rekomendasi Terbaik</span>
                        <span className="text-caption font-black uppercase px-1.5 py-0.5 rounded-[10px] bg-cobalt-500 text-white">
                          Default
                        </span>
                      </span>
                      {goal === 'auto' && <CheckCircleIcon className="w-4 h-4 text-cobalt-500 dark:text-blue-400" />}
                    </div>
                    <p className="text-caption text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      Sistem menganalisis posisi dan memilih kombinasi formula terbaik secara otomatis.
                    </p>
                  </div>
                </button>

                {/* Radio Goals */}
                <div className="space-y-2 pt-1">
                  {/* Goal 1: Impact */}
                  <label
                    onClick={() => setGoal('impact')}
                    className={`flex items-center justify-between p-3 rounded-[10px] border text-xs font-bold transition cursor-pointer focus-within:ring-2 focus-within:ring-cobalt-500 ${
                      goal === 'impact'
                        ? 'bg-blue-50/60 dark:bg-blue-950/40 border-cobalt-500 text-cobalt-500 dark:text-blue-300'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <TargetIcon className="w-4 h-4 text-cobalt-500" />
                      <span>Fokus Pencapaian &amp; Dampak Terukur</span>
                    </div>
                    <input type="radio" checked={goal === 'impact'} onChange={() => setGoal('impact')} className="accent-[#1738D1]" />
                  </label>

                  {/* Goal 2: ATS */}
                  <label
                    onClick={() => setGoal('ats')}
                    className={`flex items-center justify-between p-3 rounded-[10px] border text-xs font-bold transition cursor-pointer focus-within:ring-2 focus-within:ring-cobalt-500 ${
                      goal === 'ats'
                        ? 'bg-blue-50/60 dark:bg-blue-950/40 border-cobalt-500 text-cobalt-500 dark:text-blue-300'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileCheckIcon className="w-4 h-4 text-cobalt-500" />
                      <span>Fokus Optimalisasi Keyword ATS</span>
                    </div>
                    <input type="radio" checked={goal === 'ats'} onChange={() => setGoal('ats')} className="accent-[#1738D1]" />
                  </label>

                  {/* JD Keywords Input — muncul saat goal ATS dipilih */}
                  {goal === 'ats' && (
                    <div className="p-3 rounded-[10px] bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-2 animate-in fade-in">
                      <label htmlFor="ats-target-keywords-input" className="text-caption font-bold text-slate-700 dark:text-slate-300 block">
                        Kata Kunci Lowongan Target <span className="text-slate-500 font-medium dark:text-slate-400">(opsional)</span>
                      </label>
                      <textarea
                        id="ats-target-keywords-input"
                        rows={2}
                        value={jobKeywords}
                        onChange={(e) => setJobKeywords(e.target.value)}
                        placeholder="Contoh: React, TypeScript, REST API, Agile..."
                        className="w-full p-2.5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cobalt-500 leading-relaxed"
                      />
                      <p className="text-caption text-slate-500 dark:text-slate-400 font-medium">
                        Sistem memprioritaskan istilah yang cocok dengan daftar ini di bullet CV kamu.
                      </p>
                    </div>
                  )}

                  {/* Goal 3: Concise */}
                  <label
                    onClick={() => setGoal('concise')}
                    className={`flex items-center justify-between p-3 rounded-[10px] border text-xs font-bold transition cursor-pointer focus-within:ring-2 focus-within:ring-cobalt-500 ${
                      goal === 'concise'
                        ? 'bg-blue-50/60 dark:bg-blue-950/40 border-cobalt-500 text-cobalt-500 dark:text-blue-300'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <AlignLeftIcon className="w-4 h-4 text-cobalt-500" />
                      <span>Ringkas, Tajam &amp; Profesional</span>
                    </div>
                    <input type="radio" checked={goal === 'concise'} onChange={() => setGoal('concise')} className="accent-[#1738D1]" />
                  </label>
                </div>
              </div>

              {/* Advanced Collapsible Section */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                  className="w-full flex items-center justify-between py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 rounded-[6px]"
                >
                  <span className="flex items-center gap-1.5">
                    <ZapIcon className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                    <span>Advanced Formula Penulisan</span>
                  </span>
                  {isAdvancedOpen ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                </button>

                {isAdvancedOpen && (
                  <div className="mt-2 p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 animate-in fade-in">
                    <label className="text-caption font-bold text-slate-600 dark:text-slate-300 block">
                      Pilih Formula Spesifik
                    </label>
                    <select
                      value={formula}
                      onChange={(e) => setFormula(e.target.value as AiFormula)}
                      className="w-full p-2.5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-900 dark:text-white focus:ring-2 focus:ring-cobalt-500"
                    >
                      <option value="auto">Auto: Direkomendasikan Sistem</option>
                      <option value="star">STAR: Situation, Task, Action, Result</option>
                      <option value="car">CAR: Challenge, Action, Result</option>
                      <option value="par">PAR: Problem, Action, Result</option>
                      <option value="xyz">XYZ: Result, Measurement, Action</option>
                      <option value="sar">SAR: Situation, Action, Result</option>
                      <option value="metrics">Metrics: Berbasis Data Kuantitatif</option>
                      <option value="ats-keywords">ATS Keywords: Terminologi Industri</option>
                    </select>
                    <p className="text-caption text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      Formula teknis ini akan diprioritaskan saat menyusun kalimat pengalaman kerja kamu.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Sticky Footer Konfigurasi */}
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/95 dark:bg-slate-900/95 flex items-center justify-between gap-2 shrink-0">
              <span className="text-caption font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                {goal === 'auto'
                  ? 'Rekomendasi Sistem'
                  : goal === 'impact'
                  ? 'Fokus Dampak'
                  : goal === 'ats'
                  ? 'Fokus ATS'
                  : 'Ringkas & Tajam'}
              </span>
              <button
                type="button"
                onClick={() => setIsStyleConfigOpen(false)}
                className="px-4 py-2.5 rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 text-white font-extrabold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer border-0"
              >
                <span>Terapkan Gaya Ini</span>
                <CheckCircleIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* MAIN VIEW: FORM & HASIL REKOMENDASI */
          <div className="w-full h-full flex flex-col justify-between overflow-hidden">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-orange-50/20 dark:bg-orange-950/10 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                {step === 'clarify' ? (
                  <button
                    type="button"
                    onClick={() => setStep('select')}
                    className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center transition cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                    aria-label="Kembali ke formulir draf"
                    title="Kembali"
                  >
                    <ChevronRightIcon className="w-4 h-4 rotate-180" />
                  </button>
                ) : (
                  <div className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-[10px] bg-cobalt-500 text-white flex items-center justify-center shadow-sm shadow-cobalt-500/30 shrink-0">
                    <TargetIcon className="w-5 h-5 fill-white" />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {step === 'clarify'
                      ? 'Lengkapi Rumus Rekomendasi'
                      : isSummary
                      ? 'Bantu Tulis Ringkasan Profil'
                      : 'Bantu Tulis Rekomendasi'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                    {step === 'clarify'
                      ? 'Rekomendasi jawaban cerdas siap-pakai'
                      : isSummary
                      ? 'Susun dan bandingkan variasi ringkasan profesional'
                      : `Konteks: ${sectionTitle}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {historyList.length > 0 && step !== 'history' && step !== 'clarify' && (
                  <button
                    type="button"
                    onClick={() => setStep('history')}
                    className="px-3 py-1.5 min-h-[44px] rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                    title="Lihat Riwayat Rekomendasi"
                    aria-label={`Lihat riwayat rekomendasi, ${historyList.length} rekaman`}
                  >
                    <ClockIcon className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    <span className="hidden sm:inline">Riwayat ({historyList.length})</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-10 h-10 min-h-[44px] min-w-[44px] rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                  aria-label="Tutup drawer"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

        {/* Drawer Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-5 no-scrollbar">
          {/* STEP: CLARIFY (LENGKAPI RUMUS REKOMENDASI TERBAIK) */}
          {step === 'clarify' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Header Banner */}
              <div className="p-4 rounded-[10px] bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-[8px] bg-cobalt-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <TargetIcon className="w-4 h-4 fill-white" />
                    </div>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
                      Lengkapi Rumus Rekomendasi
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-[10px] bg-cobalt-500 text-white text-[10px] font-extrabold uppercase tracking-wider">
                    {goal === 'auto'
                      ? 'Format Rekomendasi'
                      : goal === 'impact'
                      ? 'Format Dampak & Metrik'
                      : goal === 'ats'
                      ? 'Format Optimalisasi ATS'
                      : 'Format Ringkas'}
                  </span>
                </div>
                <p className="text-caption text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Sistem menganalisis draf untuk posisi <strong className="text-slate-900 dark:text-white font-bold">{targetJobTitle || 'Profesional'}</strong>. Ketuk 1–2 rekomendasi jawaban di bawah agar kalimat CV kamu tajam, terukur, dan bernilai jual tinggi.
                </p>
              </div>

              {/* Clarification Gap Cards */}
              <div className="space-y-3.5">
                {clarifyGaps.map((gap, gapIdx) => {
                  const selectedIds = clarifySelections[gap.id] || [];
                  return (
                    <div
                      key={gap.id}
                      className="p-4 sm:p-4.5 rounded-[10px] bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-3"
                    >
                      {/* Gap Header */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-[6px] bg-blue-100 dark:bg-blue-950 text-cobalt-600 dark:text-blue-400 font-black text-caption flex items-center justify-center shrink-0">
                            {gapIdx + 1}
                          </span>
                          <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {gap.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                          {selectedIds.length > 0 ? `${selectedIds.length} Dipilih` : 'Pilih Jawaban'}
                        </span>
                      </div>

                      {/* Question Text */}
                      <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-semibold">
                        {gap.question}
                      </p>

                      {/* 3 Clickable Recommendation Options */}
                      <div className="space-y-2 pt-0.5">
                        {gap.options.map((opt) => {
                          const isSelected = selectedIds.includes(opt.id);
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleToggleClarifyOption(gap.id, opt.id)}
                              className={`w-full text-left p-3 rounded-[10px] border transition cursor-pointer flex items-start gap-2.5 min-h-[44px] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 ${
                                isSelected
                                  ? 'bg-blue-50/90 dark:bg-blue-950/70 border-cobalt-500 dark:border-blue-500 ring-2 ring-cobalt-500/20 shadow-xs'
                                  : 'bg-slate-50/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50'
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                  isSelected
                                    ? 'border-cobalt-500 bg-cobalt-500 text-white'
                                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                                }`}
                              >
                                {isSelected && <CheckIcon className="w-2.5 h-2.5 text-white stroke-[3]" />}
                              </div>
                              <div className="flex-1 space-y-0.5 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span
                                    className={`text-[10px] font-extrabold uppercase tracking-wider ${
                                      isSelected
                                        ? 'text-cobalt-600 dark:text-blue-400'
                                        : 'text-slate-600 dark:text-slate-400'
                                    }`}
                                  >
                                    {opt.label}
                                  </span>
                                  {isSelected && (
                                    <span className="text-[10px] font-bold text-cobalt-600 dark:text-blue-400">
                                      Terpilih
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
                                  &quot;{opt.text}&quot;
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Optional Custom Input */}
                      <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <label
                          htmlFor={`custom-clarify-input-${gap.id}`}
                          className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block"
                        >
                          Atau ketik angka/catatan spesifik kamu (opsional):
                        </label>
                        <input
                          id={`custom-clarify-input-${gap.id}`}
                          type="text"
                          value={clarifyCustomInputs[gap.id] || ''}
                          onChange={(e) => handleCustomClarifyChange(gap.id, e.target.value)}
                          placeholder={gap.placeholder}
                          className="w-full p-2.5 min-h-[40px] rounded-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cobalt-500 placeholder:text-slate-400 leading-relaxed"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP: HISTORY */}
          {step === 'history' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900 dark:text-white">
                  <ClockIcon className="w-4 h-4 text-orange-700 dark:text-orange-400" />
                  <span>Riwayat Rekomendasi ({historyList.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClearAllHistory}
                    className="px-2 py-1 min-h-[32px] text-caption font-bold text-rose-700 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded-[6px]"
                  >
                    <TrashIcon className="w-3 h-3" />
                    <span>Hapus Semua</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('select')}
                    className="px-3 py-1.5 min-h-[34px] rounded-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                  >
                    Kembali
                  </button>
                </div>
              </div>

              {historyList.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs font-medium space-y-2 dark:text-slate-400">
                  <ClockIcon className="w-8 h-8 mx-auto opacity-50 text-slate-500 dark:text-slate-400" />
                  <p>Belum ada riwayat rekomendasi yang tersimpan.</p>
                </div>
              ) : selectedHistoryRecord ? (
                /* Detail View of Selected History Record */
                <div className="space-y-4 animate-in fade-in">
                  <button
                    type="button"
                    onClick={() => setSelectedHistoryRecord(null)}
                    className="text-xs font-bold text-orange-700 dark:text-orange-400 hover:underline flex items-center gap-1 cursor-pointer min-h-[32px]"
                  >
                    ← Kembali ke daftar riwayat
                  </button>

                  <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-caption text-slate-500 font-medium dark:text-slate-400">
                      <span>{selectedHistoryRecord.createdAt}</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{selectedHistoryRecord.sectionTitle}</span>
                    </div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 italic line-clamp-2">
                      &quot;{selectedHistoryRecord.inputText}&quot;
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Opsi Tersimpan ({selectedHistoryRecord.options.length})
                    </h5>
                    {selectedHistoryRecord.options.map((opt) => (
                      <div
                        key={opt.id}
                        className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-600 transition space-y-3 shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-caption font-black text-slate-800 dark:text-slate-200">
                            {opt.label}
                          </span>
                          <span className="px-2 py-0.5 rounded-[10px] bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 text-caption font-bold border border-orange-200 dark:border-orange-800">
                            {opt.formulaTag}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                          &quot;{opt.text}&quot;
                        </p>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleSelectOption(opt)}
                            className="px-4 py-2 min-h-[38px] rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 text-white font-extrabold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                          >
                            <span>Gunakan Poin Ini</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* History List Cards */
                <div className="space-y-3">
                  {historyList.map((rec) => (
                    <button
                      key={rec.id}
                      type="button"
                      onClick={() => setSelectedHistoryRecord(rec)}
                      className="w-full text-left p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-600 transition cursor-pointer space-y-2 group shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 dark:text-white">
                            {rec.sectionTitle}
                          </span>
                          <span className="px-2 py-0.5 rounded-[10px] bg-orange-50 dark:bg-orange-950/80 text-orange-700 dark:text-orange-400 text-caption font-extrabold border border-orange-200 dark:border-orange-800">
                            {rec.options.length} Opsi
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-caption text-slate-500 font-medium dark:text-slate-400">{rec.createdAt}</span>
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteHistoryRecord(rec.id, e);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.stopPropagation();
                                handleDeleteHistoryRecord(rec.id, e as any);
                              }
                            }}
                            className="p-1.5 min-h-[30px] min-w-[30px] rounded-[6px] text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer dark:text-slate-400 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                            title="Hapus riwayat ini"
                            aria-label={`Hapus riwayat ${rec.sectionTitle}`}
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium line-clamp-2">
                        &quot;{rec.inputText}&quot;
                      </p>

                      <div className="flex items-center justify-between text-caption text-orange-700 dark:text-orange-400 font-bold pt-1">
                        <span>Pilih dari {rec.options.length} variasi susunan</span>
                        <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* DEDICATED VIEW FOR RINGKASAN PROFIL (SUMMARY) */}
          {step !== 'history' && step !== 'clarify' && isSummary && (
            <div className="space-y-5 animate-in fade-in">
              {/* FORM 1: RINGKASAN PROFIL (SAAT INI DI CV) */}
              <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-[10px] bg-blue-100 dark:bg-blue-950 text-cobalt-500 dark:text-blue-400 flex items-center justify-center">
                      <FileTextIcon className="w-3.5 h-3.5" />
                    </div>
                    <label htmlFor="cv-current-summary-textarea" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                      Ringkasan Profil (Saat Ini di CV)
                    </label>
                  </div>

                  {currentSummary.trim() ? (
                    <span className="px-2 py-0.5 rounded-[10px] bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-caption font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <CheckIcon className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                      <span>Tersimpan di CV</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-caption font-bold">
                      Belum Ada Ringkasan
                    </span>
                  )}
                </div>

                <AutoResizeTextarea
                  id="cv-current-summary-textarea"
                  minHeight={80}
                  maxHeight={260}
                  value={currentSummary}
                  onChange={(e) => setCurrentSummary(e.target.value)}
                  placeholder="Ringkasan profil CV kamu masih kosong. Gunakan hasil rekomendasi teroptimasi di bawah atau ketik langsung di sini..."
                  className="w-full p-3 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cobalt-500 leading-relaxed"
                />

                <div className="flex flex-wrap items-center justify-between gap-2 text-caption text-slate-600 dark:text-slate-400 pt-0.5">
                  <span className="font-medium">
                    {currentSummary.trim() ? currentSummary.trim().split(/\s+/).length : 0} kata • {currentSummary.length} karakter
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {initialDraftSummary.trim() && currentSummary.trim() !== initialDraftSummary.trim() && (
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentSummary(initialDraftSummary);
                          setAppliedOptionId(null);
                          onApplyContent(initialDraftSummary, 'Draf awal ringkasan berhasil dikembalikan.');
                        }}
                        className="px-3 py-1.5 min-h-[36px] rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                        title="Kembalikan ke teks sebelum rekomendasi diterapkan"
                      >
                        <RefreshCwIcon className="w-3.5 h-3.5" />
                        <span>Kembalikan Draf Awal</span>
                      </button>
                    )}
                    {currentSummary.trim() !== (currentContent || '').trim() && (
                      <button
                        type="button"
                        onClick={() => onApplyContent(currentSummary, 'Ringkasan Profil CV berhasil diperbarui.')}
                        className="px-3 py-1.5 min-h-[36px] rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer border-0 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                      >
                        <CheckIcon className="w-3.5 h-3.5" />
                        <span>Simpan Perubahan ke CV</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* FORM 2: INPUT KEBUTUHAN (CERITAKAN TENTANG KAMU) */}
              <div className="p-4 rounded-[10px] bg-white dark:bg-slate-800/80 border-2 border-orange-200/90 dark:border-orange-900/60 shadow-xs space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-[10px] bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 flex items-center justify-center">
                        <TargetIcon className="w-3.5 h-3.5 fill-orange-500" />
                      </div>
                      <label htmlFor="cv-prompt-summary-textarea" className="text-xs font-bold text-slate-900 dark:text-white cursor-pointer">
                        Ceritakan latar belakang & target posisi
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsStyleConfigOpen((prev) => !prev)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[34px] rounded-[10px] text-xs font-bold transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 ${
                        isStyleConfigOpen
                          ? 'text-white bg-cobalt-500'
                          : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200'
                      }`}
                      title="Konfigurasi Gaya & Fokus Penulisan"
                      aria-expanded={isStyleConfigOpen}
                    >
                      <SlidersIcon className="w-3.5 h-3.5" />
                      <span>{isStyleConfigOpen ? 'Tutup Opsi' : 'Gaya Penulisan'}</span>
                    </button>
                  </div>
                  <p className="text-caption text-slate-600 dark:text-slate-400 pl-8">
                    Tulis poin pengalaman, keahlian utama, atau posisi yang kamu tuju.
                  </p>
                </div>

                {/* Auto-Hydration Banner dari Data CV Aktif */}
                {cvContext && (cvContext.headline || cvContext.education) && !aiPromptInput.trim() && (
                  <div className="flex items-center justify-between p-2.5 rounded-[10px] bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 text-xs">
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <FileTextIcon className="w-3.5 h-3.5 text-cobalt-500 shrink-0" />
                      <span className="text-caption font-semibold text-slate-700 dark:text-slate-300 truncate">
                        Konteks CV: {[cvContext.education, cvContext.headline].filter(Boolean).join(' • ')}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const parts = [
                          cvContext.education ? `Lulusan ${cvContext.education}` : '',
                          cvContext.skills && cvContext.skills.length > 0 ? `memiliki keahlian ${cvContext.skills.slice(0, 3).join(', ')}` : '',
                          cvContext.headline ? `mencari posisi ${cvContext.headline}` : (targetJobTitle ? `mencari posisi ${targetJobTitle}` : ''),
                        ].filter(Boolean);
                        setAiPromptInput(parts.join(', '));
                      }}
                      className="px-2.5 py-1 min-h-[30px] rounded-[8px] bg-cobalt-500 hover:bg-cobalt-600 text-white font-bold text-caption transition cursor-pointer shrink-0 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                    >
                      Gunakan Data CV
                    </button>
                  </div>
                )}

                <AutoResizeTextarea
                  id="cv-prompt-summary-textarea"
                  minHeight={90}
                  maxHeight={260}
                  value={aiPromptInput}
                  onChange={(e) => setAiPromptInput(e.target.value)}
                  placeholder="Contoh: Lulusan baru Akuntansi UI, mahir SAP & Excel, pengalaman magang 6 bulan di KAP, mencari posisi Junior Auditor..."
                  className="w-full p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cobalt-500 leading-relaxed"
                />

                {/* Inline Quick Assist Chips & Indikator Kelengkapan Konteks */}
                <div className="space-y-1.5 pt-0.5">
                  <div className="flex items-center justify-between text-caption">
                    <span className="font-bold text-slate-600 dark:text-slate-400">
                      {promptWordCount === 0
                        ? 'Ketuk chip untuk melengkapi bahan baku ringkasan:'
                        : promptWordCount < 8
                        ? 'Konteks dasar • Tambah chip untuk hasil lebih presisi:'
                        : 'Konteks siap • Kamu bisa menambah detail atau langsung proses:'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-[8px] text-[10px] font-extrabold ${
                        promptWordCount >= 8
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                          : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                      }`}
                    >
                      {promptWordCount >= 8 ? 'Konteks Siap' : 'Konteks Singkat'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 -mx-1 px-1">
                    {summaryQuickChips.map((chip) => {
                      const isSelected = aiPromptInput.toLowerCase().includes(chip.text.toLowerCase());
                      return (
                        <button
                          key={chip.id}
                          type="button"
                          onClick={() => handleAddPromptChip(chip.text)}
                          className={`px-2.5 py-1 min-h-[32px] rounded-[10px] text-caption font-bold whitespace-nowrap transition cursor-pointer border flex items-center gap-1 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-cobalt-600 dark:text-blue-300 border-cobalt-300 dark:border-blue-700'
                              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <span>{isSelected ? '✓' : '+'}</span>
                          <span>{chip.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="text-caption text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Gaya: </span>
                    <span className="font-bold text-cobalt-500 dark:text-blue-400">
                      {goal === 'auto'
                        ? 'Rekomendasi Otomatis'
                        : goal === 'impact'
                        ? 'Fokus Dampak'
                        : goal === 'ats'
                        ? 'Fokus ATS'
                        : 'Ringkas'}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={isLoadingAi}
                    onClick={() => handleStartAiProcess()}
                    className="px-4 py-2.5 min-h-[42px] rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 disabled:opacity-60 text-white font-extrabold text-xs shadow-md shadow-cobalt-500/20 transition flex items-center gap-2 cursor-pointer border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                  >
                    {isLoadingAi ? (
                      <>
                        <LoaderIcon className="w-3.5 h-3.5 animate-spin" />
                        <span>Sedang Memproses...</span>
                      </>
                    ) : (
                      <>
                        <TargetIcon className="w-3.5 h-3.5 fill-white" />
                        <span>{generatedOptions.length > 0 ? 'Susun Alternatif Baru' : 'Susun Rekomendasi'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* FORM 3: HASIL REKOMENDASI TEROPTIMASI (DAFTAR & PEMBANDING) */}
              <div className="space-y-3.5 pt-1">
                <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
                      Hasil Rekomendasi Teroptimasi
                    </h4>
                    {generatedOptions.length > 0 && (
                      <span className="px-2 py-0.5 rounded-[10px] bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 text-caption font-bold border border-orange-200 dark:border-orange-800">
                        {generatedOptions.length} Variasi
                      </span>
                    )}
                  </div>

                  {generatedOptions.length > 0 && (
                    <button
                      type="button"
                      disabled={isLoadingAi}
                      onClick={() => handleStartAiProcess()}
                      className="px-3 py-1.5 min-h-[36px] rounded-[10px] bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/60 dark:hover:bg-orange-900 text-orange-700 dark:text-orange-300 font-bold text-xs border border-orange-200 dark:border-orange-800 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                      title="Susun variasi baru tanpa menghilangkan hasil sebelumnya"
                    >
                      <RefreshCwIcon className={`w-3.5 h-3.5 ${isLoadingAi ? 'animate-spin' : ''}`} />
                      <span>Susun Alternatif Baru</span>
                    </button>
                  )}
                </div>

                {/* Loading state for summary */}
                {isLoadingAi && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="p-4 rounded-[10px] bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 flex items-center gap-3 animate-in fade-in"
                  >
                    <LoaderIcon className="w-5 h-5 text-orange-700 dark:text-orange-400 animate-spin shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Sedang menyusun opsi ringkasan terbaik...
                      </p>
                      <p className="text-caption text-slate-600 dark:text-slate-400">
                        Memproses keyword ATS dan mengoptimalkan struktur kalimat profesional.
                      </p>
                    </div>
                  </div>
                )}

                {/* Error message */}
                {errorMessage && (
                  <div className="p-3.5 rounded-[10px] bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangleIcon className="w-4 h-4 shrink-0 text-rose-700 dark:text-rose-400" />
                      <span>{errorMessage}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleStartAiProcess()}
                      className="text-xs font-bold underline hover:no-underline cursor-pointer min-h-[32px] flex items-center"
                    >
                      Coba Lagi
                    </button>
                  </div>
                )}

                {/* Empty State when no options yet */}
                {generatedOptions.length === 0 && !isLoadingAi && (
                  <div className="py-8 px-4 text-center rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 space-y-2">
                    <TargetIcon className="w-8 h-8 text-orange-400 mx-auto opacity-70" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Belum ada rekomendasi yang disusun
                      </p>
                      <p className="text-caption text-slate-600 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                        Ketik poin pengalaman dan keahlianmu di form atas, lalu klik <strong>Susun Rekomendasi</strong> untuk menghasilkan berbagai opsi ringkasan profil siap pakai.
                      </p>
                    </div>
                  </div>
                )}

                {/* List of Generated Options for Comparison */}
                {generatedOptions.length > 0 && (
                  <div className="space-y-3">
                    {generatedOptions.map((opt) => {
                      const isApplied = appliedOptionId === opt.id || currentSummary.trim() === opt.text.trim();
                      const isLatestBatch = opt.batchId === generationCount;
                      const currentWordCount = currentSummary.trim() ? currentSummary.trim().split(/\s+/).length : 0;
                      const optWordCount = opt.text.trim() ? opt.text.trim().split(/\s+/).length : 0;
                      const wordDiff = optWordCount - currentWordCount;
                      const wordDiffBadge = currentWordCount > 0
                        ? wordDiff > 0
                          ? `+${wordDiff} kata`
                          : wordDiff < 0
                          ? `${wordDiff} kata`
                          : 'Panjang sama'
                        : `${optWordCount} kata`;

                      return (
                        <div
                          key={opt.id}
                          className={`p-4 rounded-[10px] border transition space-y-3 shadow-xs ${
                            isApplied
                              ? 'bg-blue-50/40 dark:bg-blue-950/30 border-cobalt-500 dark:border-blue-500 ring-1 ring-cobalt-500/30'
                              : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                {opt.label}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="px-2 py-0.5 rounded-[10px] bg-blue-50 dark:bg-blue-950/80 text-cobalt-500 dark:text-blue-300 text-caption font-bold border border-blue-200 dark:border-blue-800">
                                {wordDiffBadge}
                              </span>
                              <span className="px-2 py-0.5 rounded-[10px] bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 text-caption font-semibold hidden sm:inline-block">
                                {opt.formulaTag}
                              </span>
                            </div>
                          </div>

                          <div className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-line select-text">
                            &quot;{opt.text}&quot;
                          </div>

                          {optionHasPlaceholder(opt) && (
                            <div className="p-2.5 rounded-[10px] bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-caption font-bold text-amber-700 dark:text-amber-300 flex items-start gap-1.5">
                              <AlertTriangleIcon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <span>Lengkapi data di dalam tanda kurung siku [ ] dengan pencapaian riil sebelum ekspor CV.</span>
                            </div>
                          )}

                          {opt.notes && (
                            <p className="text-caption text-slate-500 dark:text-slate-400 italic">
                              {opt.notes}
                            </p>
                          )}

                          {opt.bullets?.some((b) => b.keywords_used && b.keywords_used.length > 0) && (
                            <div className="flex flex-wrap gap-1">
                              {Array.from(new Set(opt.bullets.flatMap((b) => b.keywords_used || []))).slice(0, 6).map((kw) => (
                                <span
                                  key={kw}
                                  className="px-1.5 py-0.5 rounded-[4px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-caption font-bold"
                                >
                                  {kw}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                            <button
                              type="button"
                              onClick={() => handleCopyText(opt.id, opt.text)}
                              className="px-3 py-2 min-h-[38px] rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                            >
                              {copiedId === opt.id ? (
                                <>
                                  <CheckIcon className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                                  <span className="text-emerald-700 font-extrabold dark:text-emerald-400">Tersalin!</span>
                                </>
                              ) : (
                                <>
                                  <CopyIcon className="w-3.5 h-3.5" />
                                  <span>Salin Teks</span>
                                </>
                              )}
                            </button>

                            {isApplied ? (
                              <div className="px-3.5 py-2 min-h-[38px] rounded-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs border border-emerald-300 dark:border-emerald-700 flex items-center gap-1.5">
                                <CheckIcon className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                                <span>Sedang Digunakan di CV</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSelectOption(opt)}
                                className="px-4 py-2 min-h-[38px] rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 text-white font-extrabold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                              >
                                <span>Gunakan Hasil Ini</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* REGULAR WORKFLOW FOR NON-SUMMARY SECTIONS */}
          {step !== 'history' && step !== 'clarify' && !isSummary && (
            <>
              {/* STEP: EMPTY STATE */}
              {step === 'empty' && (
                <div className="space-y-4 text-center py-8 px-2">
                  <div className="w-14 h-14 rounded-[10px] bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 flex items-center justify-center mx-auto shadow-sm">
                    <TargetIcon className="w-7 h-7" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {contextEmptyTitle}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                      {contextEmptyDesc}
                    </p>
                  </div>

                  <AutoResizeTextarea
                    minHeight={90}
                    maxHeight={450}
                    value={userRawInput}
                    onChange={(e) => setUserRawInput(e.target.value)}
                    placeholder={contextPlaceholderEmpty}
                    className="w-full p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cobalt-500 leading-relaxed"
                  />

                  <button
                    type="button"
                    disabled={!userRawInput.trim()}
                    onClick={() => setStep('select')}
                    className="w-full py-3 px-4 rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-cobalt-500/20 transition flex items-center justify-center gap-2 cursor-pointer border-0"
                  >
                    <span>Mulai Susun Kalimat</span>
                    
                  </button>
                </div>
              )}

              {/* STEP: SELECT STRATEGY & GOALS */}
              {step === 'select' && (
                <div className="space-y-3.5">
                  {/* Input Draft Preview Header */}
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {contextLabel}
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsStyleConfigOpen((prev) => !prev)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-caption font-bold transition cursor-pointer ${
                        isStyleConfigOpen
                          ? 'text-white bg-cobalt-500 hover:bg-cobalt-600 shadow-xs'
                          : goal !== 'auto' || formula !== 'auto'
                          ? 'text-cobalt-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/70 border border-blue-300 dark:border-blue-700'
                          : 'text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                      }`}
                      title="Buka panel konfigurasi gaya penulisan di samping"
                    >
                      <SlidersIcon className="w-3.5 h-3.5" />
                      <span>{isStyleConfigOpen ? 'Tutup Konfigurasi' : 'Konfigurasi Gaya Penulisan'}</span>
                      {goal !== 'auto' && !isStyleConfigOpen && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cobalt-500 dark:bg-blue-400" />
                      )}
                    </button>
                  </div>

                  {/* Active Style Indicator Banner */}
                  <div className="flex items-center justify-between gap-2 text-caption py-1.5 px-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">Gaya aktif:</span>
                      <span className="font-bold text-cobalt-500 dark:text-blue-400">
                        {goal === 'auto'
                          ? 'Rekomendasi Otomatis'
                          : goal === 'impact'
                          ? 'Fokus Dampak & Metrik'
                          : goal === 'ats'
                          ? 'Optimalisasi ATS'
                          : 'Ringkas & Tajam'}
                        {formula !== 'auto' ? ` • Formula ${formula.toUpperCase()}` : ''}
                      </span>
                    </div>
                    {!isStyleConfigOpen && (
                      <button
                        type="button"
                        onClick={() => setIsStyleConfigOpen(true)}
                        className="text-caption font-bold text-cobalt-500 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        Ubah
                      </button>
                    )}
                  </div>

                  {/* Dynamic Height Textarea */}
                  <AutoResizeTextarea
                    minHeight={120}
                    maxHeight={500}
                    value={userRawInput}
                    onChange={(e) => setUserRawInput(e.target.value)}
                    placeholder={contextPlaceholderSelect}
                    className="w-full p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cobalt-500 leading-relaxed"
                  />
                </div>
              )}

              {/* STEP: INTERVIEW */}
              {step === 'interview' && interviewQuestions.length > 0 && (
                <div className="space-y-5 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    {interviewQuestions.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i <= interviewQuestionIdx ? 'bg-cobalt-500' : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="p-4 rounded-[10px] bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300 font-extrabold text-xs">
                        <MessageSquareIcon className="w-4 h-4 text-orange-700 dark:text-orange-400" />
                        <span>Data Tambahan Dibutuhkan</span>
                      </div>
                      <span className="text-caption font-bold text-slate-500 dark:text-slate-400">
                        {interviewQuestionIdx + 1} / {interviewQuestions.length}
                      </span>
                    </div>
                    <p className="text-caption text-slate-500 dark:text-slate-400 leading-relaxed">
                      Sistem membutuhkan informasi tambahan agar hasil lebih akurat dan terukur.
                    </p>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-semibold pt-1">
                      {interviewQuestions[interviewQuestionIdx]?.question}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="interview-answer-input" className="text-xs font-bold text-slate-700 dark:text-slate-300 block cursor-pointer">
                      Jawaban Singkat Kamu:
                    </label>
                    <input
                      id="interview-answer-input"
                      type="text"
                      value={currentAnswerInput}
                      onChange={(e) => setCurrentAnswerInput(e.target.value)}
                      placeholder={interviewQuestions[interviewQuestionIdx]?.placeholder}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAnswerInterviewNext();
                      }}
                      className="w-full p-3 min-h-[44px] rounded-[10px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cobalt-500"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleStartAiProcess()}
                      className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 font-bold underline cursor-pointer min-h-[36px] flex items-center"
                    >
                      Lewati (Lanjut Proses)
                    </button>

                    <button
                      type="button"
                      onClick={handleAnswerInterviewNext}
                      className="px-5 py-2.5 min-h-[40px] rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 text-white font-extrabold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                    >
                      <span>Lanjutkan</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP: LOADING ANIMATION */}
              {step === 'loading' && (
                <div role="status" aria-live="polite" className="py-12 space-y-6 text-center animate-in fade-in">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-orange-200 dark:border-orange-900 border-t-orange-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center text-orange-700 dark:text-orange-400">
                      <TargetIcon className="w-6 h-6 fill-orange-500" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Menganalisis &amp; Menyusun Kalimat Teroptimasi...
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      Menghubungi layanan sistem &amp; memproses keyword ATS.
                    </p>
                  </div>

                  <div className="w-full max-w-xs mx-auto p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-left text-xs font-bold text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>Menghubungi server sistem</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>Menerapkan Formula STAR/CAR/XYZ</span>
                    </div>
                    <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400 animate-pulse motion-reduce:animate-none">
                      <TargetIcon className="w-4 h-4" />
                      <span>Mengoptimalkan Keyword ATS</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP: ERROR */}
              {step === 'error' && (
                <div className="py-8 space-y-4 text-center animate-in fade-in">
                  <div className="w-14 h-14 rounded-[10px] bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 flex items-center justify-center mx-auto shadow-sm dark:text-rose-400">
                    <AlertTriangleIcon className="w-7 h-7" />
                  </div>
                  <div className="space-y-1.5 max-w-xs mx-auto">
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                      Gagal Memproses Rekomendasi
                    </h4>
                    <p className="text-xs text-rose-700 dark:text-rose-400 leading-relaxed font-medium">
                      {errorMessage || 'Terjadi kesalahan sistem saat memproses rekomendasi.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep('select')}
                    className="px-5 py-2.5 min-h-[40px] rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 text-white font-extrabold text-xs shadow-sm transition inline-flex items-center gap-2 cursor-pointer border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                  >
                    <RefreshCwIcon className="w-4 h-4" />
                    <span>Coba Lagi</span>
                  </button>
                </div>
              )}

              {/* STEP: RESULTS */}
              {step === 'results' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Hasil Rekomendasi Penulisan Teroptimasi
                    </h4>
                    <span className="text-caption font-bold text-orange-700 dark:text-orange-400">
                      {generatedOptions.length} Opsi Tersedia
                    </span>
                  </div>

                  <div className="space-y-3">
                    {generatedOptions.map((opt) => (
                      <div
                        key={opt.id}
                        className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-600 transition space-y-3 shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-caption font-black text-slate-800 dark:text-slate-200">
                            {opt.label}
                          </span>
                          <span className="px-2 py-0.5 rounded-[10px] bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 text-caption font-bold border border-orange-200 dark:border-orange-800">
                            {opt.formulaTag}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium whitespace-pre-line">
                          &quot;{opt.text}&quot;
                        </p>

                        {optionHasPlaceholder(opt) && (
                          <div className="p-2.5 rounded-[10px] bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-caption font-bold text-amber-700 dark:text-amber-300 flex items-start gap-1.5">
                            <AlertTriangleIcon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>Lengkapi data di dalam tanda kurung siku [ ] dengan pencapaian riil sebelum dipakai.</span>
                          </div>
                        )}

                        {opt.notes && (
                          <p className="text-caption text-slate-500 dark:text-slate-400 font-medium italic">{opt.notes}</p>
                        )}

                        {opt.bullets?.some((b) => b.keywords_used && b.keywords_used.length > 0) && (
                          <div className="flex flex-wrap gap-1">
                            {Array.from(new Set(opt.bullets.flatMap((b) => b.keywords_used || []))).slice(0, 8).map((kw) => (
                              <span
                                key={kw}
                                className="px-1.5 py-0.5 rounded-[10px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-caption font-bold"
                              >
                                {kw}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleSelectOption(opt)}
                            className="px-4 py-2 min-h-[38px] rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 text-white font-extrabold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                          >
                            <span>Gunakan Poin Ini</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Drawer Footer Controls */}
        <div className="p-4 sm:p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] border-t border-slate-100 dark:border-slate-800 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-xs flex items-center justify-between gap-3 shrink-0 sticky bottom-0 z-20 mt-auto shadow-xs">
          {step === 'clarify' ? (
            <>
              <button
                type="button"
                onClick={handleSkipClarification}
                className="px-4 py-2.5 min-h-[44px] rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer border border-slate-200 dark:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
              >
                <span>Lewati &amp; Langsung Proses</span>
              </button>

              <button
                type="button"
                onClick={handleApplyClarificationAndProcess}
                className="px-5 py-2.5 min-h-[44px] rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 text-white font-extrabold text-xs shadow-md shadow-cobalt-500/20 transition flex items-center gap-2 cursor-pointer border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 ml-auto"
              >
                <CheckCircleIcon className="w-4 h-4" />
                <span>{hasSelectedAnyClarification ? 'Gunakan Rekomendasi & Susun' : 'Susun Sekarang'}</span>
              </button>
            </>
          ) : isSummary ? (
            <>
              {generatedOptions.length > 0 ? (
                <button
                  type="button"
                  disabled={isLoadingAi}
                  onClick={() => handleStartAiProcess()}
                  className="px-3.5 py-2.5 min-h-[44px] rounded-[10px] bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/60 dark:hover:bg-orange-900 text-orange-700 dark:text-orange-300 font-bold text-xs border border-orange-200 dark:border-orange-800 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                >
                  <RefreshCwIcon className={`w-3.5 h-3.5 ${isLoadingAi ? 'animate-spin' : ''}`} />
                  <span>Susun Alternatif Baru</span>
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 min-h-[44px] rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 text-white font-extrabold text-xs shadow-md shadow-cobalt-500/20 transition flex items-center gap-1.5 cursor-pointer border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 shrink-0 ml-auto"
              >
                <CheckCircleIcon className="w-4 h-4" />
                <span>Selesai</span>
              </button>
            </>
          ) : (
            <>
              {step === 'select' && (
                <>
                  <div />
                  <button
                    type="button"
                    onClick={() => handleStartAiProcess()}
                    className="px-6 py-2.5 min-h-[44px] rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 text-white font-extrabold text-xs shadow-md shadow-cobalt-500/20 transition flex items-center gap-2 cursor-pointer border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 ml-auto"
                  >
                    <TargetIcon className="w-4 h-4 fill-white" />
                    <span>Proses Sekarang</span>
                  </button>
                </>
              )}

              {step === 'results' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleStartAiProcess()}
                    className="px-3.5 py-2.5 min-h-[44px] rounded-[10px] bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/60 dark:hover:bg-orange-900 text-orange-700 dark:text-orange-300 font-bold text-xs border border-orange-200 dark:border-orange-800 transition flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                  >
                    <RefreshCwIcon className="w-3.5 h-3.5" />
                    <span>Susun Alternatif Baru</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 min-h-[44px] rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 text-white font-extrabold text-xs shadow-md shadow-cobalt-500/20 transition flex items-center gap-1.5 cursor-pointer border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 shrink-0 ml-auto"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>Selesai</span>
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    )}
  </SheetContent>
</Sheet>
);
};
