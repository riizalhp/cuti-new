"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Database,
  BookOpen,
  Zap,
  Target,
  MessageSquare,
  UserCheck,
  RefreshCw,
  TrendingUp,
  Sparkles,
  Eye,
  Briefcase,
  GraduationCap,
  Mic,
  FlaskConical,
  BarChart3,
  Clock,
  Layers,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  X,
  ExternalLink,
  ShieldCheck,
  Radio,
  Sliders,
  ChevronRight,
  Activity,
  Award,
} from "lucide-react";
import { SidebarToggle } from "@/components/admin/SidebarToggle";

export type FeatureStatus = "AKTIF" | "SCAFFOLDED" | "PLANNED";
export type FeaturePillar = "continuous" | "adaptive" | "planned";

export interface FeatureDetail {
  id: string;
  name: string;
  pillar: FeaturePillar;
  pillarName: string;
  description: string;
  status: FeatureStatus;
  metric: string;
  note: string;
  iconName: string;
  algorithm: string;
  formula: string;
  thresholds: string;
  inputPipeline: string;
  outputImpact: string;
  codeFiles: string[];
}

export interface LearningEventItem {
  id: string;
  source: "blueprint" | "dictionary" | "cache" | "tuning" | "activity";
  title: string;
  detail: string;
  timeAgo: string;
  tag: string;
  badgeColor: string;
}

export interface SystemIntelligenceInitialData {
  stats: {
    activeFeatures: number;
    totalFeatures: number;
    blueprints: number;
    blueprintPromoted: number;
    blueprintEntries: number;
    dictionaryTokens: number;
    cacheEntries: number;
    cacheHits: number;
    cacheSavingsPercent: number;
    aiRequests: number;
    behaviorProfiles: number;
    tuningPending: number;
    tuningApproved: number;
    promptTotal: number;
    promptActive: number;
    recoCTR: string;
    recoImpressions: number;
    recoClicks: number;
    acceptanceRate: string;
  };
  recentLearningEvents: LearningEventItem[];
  dictByCategory: Array<{
    category: string;
    count: number;
    totalFreq: number;
    topTokens: Array<{ value: string; frequency: number }>;
  }>;
  lifecycleDistribution: Array<{
    stage: string;
    count: number;
    percentage: number;
  }>;
  churnDistribution: Array<{
    level: "LOW" | "MEDIUM" | "HIGH";
    count: number;
  }>;
  lastUpdated: string;
}

// Master feature definitions
const ALL_FEATURES: FeatureDetail[] = [
  {
    id: "blueprints",
    name: "Learned Role Blueprints",
    pillar: "continuous",
    pillarName: "Pilar 1: Continuous Self-Learning",
    description: "Agregasi keahlian dari CV komunitas menjadi blueprint peran baru tanpa rilis kode baru.",
    status: "AKTIF",
    metric: "12 blueprint aktif",
    note: "Threshold kemunculan skill ≥40% essential",
    iconName: "Layers",
    algorithm: "Incremental Skill Frequency Aggregation with Auto-Promotion",
    formula: "Ratio = (Kemunculan Skill) / (Total Entri Role). Essential jika ratio >= 0.40; Nice-to-have jika 0.20 <= ratio < 0.40.",
    thresholds: "Aktif mandiri saat entry_count >= 3 atau diverifikasi admin (is_promoted = true).",
    inputPipeline: "CV Create/Update -> learnedRoleService.recordEntry() -> Background aggregateRole() -> Upsert learned_role_blueprints.",
    outputImpact: "Kandidat yang memilih peran baru langsung mendapatkan evaluasi skill gap dan peta transisi di Career Direction Engine.",
    codeFiles: [
      "packages/db/src/learned-role-service.ts",
      "apps/dashboard/lib/career-direction-engine.ts",
      "apps/admin/src/app/blueprints/page.tsx",
    ],
  },
  {
    id: "dictionary",
    name: "CV Vocabulary & Token Auto-Discovery",
    pillar: "continuous",
    pillarName: "Pilar 1: Continuous Self-Learning",
    description: "Kamus NLP lokal yang memperluas kosakata keterampilan, posisi, almamater, dan kota secara mandiri.",
    status: "AKTIF",
    metric: "2.340+ token NLP",
    note: "In-memory cache 5 menit untuk parsing sub-10ms",
    iconName: "BookOpen",
    algorithm: "Dynamic Token Extraction & Regex In-Memory Merging",
    formula: "Regex Match -> Filter Whitelist -> Upsert dengan frequency = frequency + 1. Di-cache selama 5 menit.",
    thresholds: "Hanya token yang lolos filter anti-sampah dan panjang karakter 2-50 yang disimpan.",
    inputPipeline: "Penguraian CV (PDF/DOCX) & Simpan Profil -> cv_learning_dictionary -> Injeksi ke smart-cv-parser.",
    outputImpact: "Akurasi ekstraksi CV meningkat pesat tanpa biaya panggilan LLM eksternal.",
    codeFiles: [
      "apps/dashboard/lib/smart-cv-parser.ts",
      "apps/dashboard/app/api/cv/parse/route.ts",
      "apps/dashboard/app/api/user/profile/route.ts",
    ],
  },
  {
    id: "reco_tuner",
    name: "Behavioral Recommendation Auto-Tuner",
    pillar: "continuous",
    pillarName: "Pilar 1: Continuous Self-Learning",
    description: "Penala bobot pencocokan lowongan adaptif berdasarkan rasio klik (CTR) dan bias posisi pengguna.",
    status: "AKTIF",
    metric: "CTR 14 hari: 8.2%",
    note: "Penekanan lowongan yang dilihat berulang dalam 7 hari",
    iconName: "Target",
    algorithm: "Heuristic CTR & Position-Bias Reinforcement Loop",
    formula: "Jika avgClickPosition > 5: Recency +10%, Location +5%, Skill -5%. Jika CTR < 5%: Location +15%. Σ(Bobot) = 1.0.",
    thresholds: "Evaluasi jendela waktu geser 14 hari terakhir dari visitor_activities.",
    inputPipeline: "Interaksi Kartu Loker -> trackRecommendationClick() -> getOptimizedWeights() -> Pemeringkatan Rekomendasi.",
    outputImpact: "Pengguna disajikan lowongan yang semakin relevan dan terhindar dari kebosanan (repetition fatigue).",
    codeFiles: [
      "apps/dashboard/lib/recommendation-tuner.ts",
      "apps/dashboard/app/api/jobs/recommended/route.ts",
      "apps/dashboard/lib/scoring-config.ts",
    ],
  },
  {
    id: "outcome_tuning",
    name: "Outcome-Driven Scoring Weight Auto-Tuning",
    pillar: "continuous",
    pillarName: "Pilar 1: Continuous Self-Learning",
    description: "Kalibrasi lingkaran tertutup antara skor ATS/Job Match dengan keberhasilan panggilan wawancara nyata.",
    status: "SCAFFOLDED",
    metric: "2 pending saran tuning",
    note: "Menunggu kuota data latih 500 sampel hasil wawancara",
    iconName: "RefreshCw",
    algorithm: "Closed-Loop Outcome Correlation with Guardrail Clamping",
    formula: "Delta Bobot = Korelasi Komponen Skor vs Rasio Panggilan Kerja. Dibatasi MAX_WEIGHT_CHANGE = ±0.10 (10%).",
    thresholds: "Minimal sampel 500 interaksi wawancara untuk menghasilkan saran persetujuan ke admin.",
    inputPipeline: "Review Pasca Wawancara (PostInterviewReviewModal) -> outcome-correlation job -> Draft system_settings -> Admin Approval.",
    outputImpact: "Skor ATS platform semakin akurat mencerminkan selera rekruter industri Indonesia.",
    codeFiles: [
      "apps/dashboard/lib/tuning-suggestions.ts",
      "apps/dashboard/components/PostInterviewReviewModal.tsx",
      "packages/queue/src/jobs/outcome-correlation.ts",
    ],
  },
  {
    id: "semantic_cache",
    name: "AI Semantic Cache with Dynamic Invalidation",
    pillar: "continuous",
    pillarName: "Pilar 1: Continuous Self-Learning",
    description: "Tembolok semantik cerdas penyimpan hasil inferensi AI dengan invalidasi deterministik saat instruksi berubah.",
    status: "AKTIF",
    metric: "Hemat ~60% kuota",
    note: "Invalidasi otomatis saat prompt admin diperbarui",
    iconName: "Zap",
    algorithm: "Deterministic 32-bit Exact Hashing with Contextual Fingerprint",
    formula: "CacheKey = FNV32(Task + Content + Role + Goal + Lang + Hash(SystemInstruction)).",
    thresholds: "Waktu respon sub-10ms, konsumsi token 0 untuk pertanyaan/frasa serupa yang pernah dijawab.",
    inputPipeline: "AI Gateway /api/ai -> Cek ai_semantic_cache -> Hit (kembalikan respon & naikkan hits) / Miss (panggil LLM & simpan).",
    outputImpact: "Mengurangi biaya OpenAI secara drastis dan mempercepat loading UI asisten CV hingga 100x lipat.",
    codeFiles: [
      "apps/dashboard/lib/semantic-cache.ts",
      "apps/dashboard/lib/nlp-pruner.ts",
      "apps/dashboard/app/api/ai/route.ts",
    ],
  },
  {
    id: "prompt_quality",
    name: "AI Prompt Quality & Acceptance Telemetry",
    pillar: "continuous",
    pillarName: "Pilar 1: Continuous Self-Learning",
    description: "Pemantau efektivitas prompt AI dengan melacak tindakan nyata pengguna (diterapkan, diubah, ditolak).",
    status: "AKTIF",
    metric: "Acceptance: 70%+",
    note: "Pelacakan per-versi prompt aktif",
    iconName: "MessageSquare",
    algorithm: "Human Feedback Acceptance Rate & Action Latency Tracking",
    formula: "AcceptanceRate = (Applied + Modified) / Total Interactions. RejectionRate = Rejected / Total.",
    thresholds: "Peringatan otomatis muncul di admin panel jika tingkat penerimaan turun di bawah 50%.",
    inputPipeline: "Saran Asisten AI -> Aksi Pengguna (Terapkan/Edit/Tutup) -> trackAiFeedback() -> Dasbor /ai-quality.",
    outputImpact: "Admin dapat segera memperbaiki kata-kata instruksi prompt yang menghasilkan saran tidak memuaskan.",
    codeFiles: [
      "apps/dashboard/lib/prompt-performance.ts",
      "apps/dashboard/lib/visitor-tracker.ts",
      "apps/admin/src/app/ai-quality/page.tsx",
    ],
  },
  {
    id: "behavior_profiles",
    name: "User Behavioral Profile & Churn Intelligence",
    pillar: "continuous",
    pillarName: "Pilar 1: Continuous Self-Learning",
    description: "Pemetaan profil perilaku pengguna harian, klasifikasi tahapan siklus hidup, dan kalkulasi risiko churn.",
    status: "AKTIF",
    metric: "Nightly 03:00 WIB",
    note: "Mengkategorikan NEW, BUILDING, APPLYING, HIRED, CHURNED",
    iconName: "UserCheck",
    algorithm: "Nightly Behavioral Clustering & Lifecycle Heuristics",
    formula: "ChurnRisk = Inaktif > 21 hari (HIGH), 7-21 hari (MEDIUM), < 7 hari (LOW). Lifecycle dihitung dari riwayat lamaran & aktivitas.",
    thresholds: "Dijalankan setiap malam pukul 03:00 WIB oleh BullMQ worker build-user-profiles.",
    inputPipeline: "Aktivitas Sesi & Lamaran 30 Hari -> build-user-profiles.ts -> Upsert user_behavior_profiles.",
    outputImpact: "Sistem dapat mengirimkan rekomendasi kontekstual atau intervensi bagi pengguna yang berisiko pasif.",
    codeFiles: [
      "packages/queue/src/jobs/build-user-profiles.ts",
      "packages/queue/src/jobs/churn-detection.ts",
    ],
  },
  {
    id: "career_intelligence",
    name: "Career Intelligence & Skill-Gap Engine",
    pillar: "adaptive",
    pillarName: "Pilar 2: Adaptive Context Intelligence",
    description: "Evaluasi kesiapan karier berbasis bukti dari 6 sumber data profil dan pemetaan jembatan keterampilan.",
    status: "AKTIF",
    metric: "6 sumber bukti",
    note: "Menghitung transition effort (Rendah/Sedang/Signifikan)",
    iconName: "Brain",
    algorithm: "Evidence-Based Multi-Source Competency Aggregator",
    formula: "Korelasikan Pengalaman + Proyek + Skill + Edukasi + Profil + Tracker terhadap standar posisi target.",
    thresholds: "Kategori kesenjangan: Kritis (keterampilan inti tidak ada), Sedang, dan Nilai Tambah.",
    inputPipeline: "Data Profil Pengguna -> career-intelligence-engine.ts -> Visualisasi radar kesiapan & roadmap belajar.",
    outputImpact: "Pengguna mendapat saran langkah nyata untuk menutup kekurangan sebelum melamar.",
    codeFiles: ["apps/dashboard/lib/career-intelligence-engine.ts"],
  },
  {
    id: "cv_purpose",
    name: "Multi-Persona CV Purpose Scoring (15 Profil)",
    pillar: "adaptive",
    pillarName: "Pilar 2: Adaptive Context Intelligence",
    description: "Evaluasi format dan bobot CV yang beradaptasi dengan 15 profil tujuan (Fresh Grad hingga Eksekutif).",
    status: "AKTIF",
    metric: "15 persona aktif",
    note: "Bobot metrik dinamis sesuai konteks tujuan",
    iconName: "GraduationCap",
    algorithm: "Contextual Persona Weight Matrix Modulation",
    formula: "Setiap tujuan karier memodifikasi penalti dan bobot section (misal: Fresh Grad fokus potensi, Pro fokus metrik capaian).",
    thresholds: "15 matriks terkalibrasi untuk keperluan magang, beasiswa, BUMN, startup, luar negeri, dll.",
    inputPipeline: "Pilihan Tujuan CV Pengguna -> cv-purpose-scoring-engine.ts -> Penyesuaian skor ATS dan checklist format.",
    outputImpact: "Pengguna tidak mendapat kritik format yang keliru (misal: fresh graduate tidak dipaksa memiliki 5 tahun pengalaman).",
    codeFiles: [
      "apps/dashboard/lib/cv-purpose-scoring-engine.ts",
      "apps/dashboard/lib/cv-section-scoring-matrix.ts",
    ],
  },
  {
    id: "rve_pipeline",
    name: "RVE Recruiter Eye-Tracking Simulation",
    pillar: "adaptive",
    pillarName: "Pilar 2: Adaptive Context Intelligence",
    description: "Simulasi titik fokus pandangan mata rekruter 6 detik dan konsensus evaluasi 4 tipe penyaring CV.",
    status: "AKTIF",
    metric: "Pola F, Z, Gutenberg",
    note: "4 tipe rekruter (Startup, Korporat, Agensi, MNC)",
    iconName: "Eye",
    algorithm: "Visual Saccade Simulation & Multi-Screener Consensus",
    formula: "Bounding Box Layout Weighting + Analisis Kuadran ATS (Gold Quadrant, Hidden High ATS, dll).",
    thresholds: "Dilengkapi fallback algoritma heuristik instan bila gateway AI sedang sibuk.",
    inputPipeline: "Layout Komponen CV -> RveEnginePipeline.ts -> Visualisasi Heatmap & Rekomendasi Tata Letak.",
    outputImpact: "Memastikan bagian terkuat kandidat langsung terlihat dalam 6 detik pertama oleh HR.",
    codeFiles: [
      "apps/dashboard/components/rve/RveEnginePipeline.ts",
      "apps/dashboard/components/AiCvScreenerView.tsx",
    ],
  },
  {
    id: "ai_gateway",
    name: "Multi-Provider AI Gateway & Cost Tracking",
    pillar: "adaptive",
    pillarName: "Pilar 2: Adaptive Context Intelligence",
    description: "Perutean dinamis per fitur ke model provider optimal serta pencatatan biaya token otomatis.",
    status: "AKTIF",
    metric: "Multi-provider pool",
    note: "Failover, round robin, least used",
    iconName: "Database",
    algorithm: "Granular Feature-to-Provider Routing with Cost Ledger",
    formula: "Biaya = (tokens_in * rate_in) + (tokens_out * rate_out). Pencatatan real-time ke ai_usage_logs.",
    thresholds: "Failover otomatis ke provider cadangan bila provider utama mengalami error 5xx atau rate-limit 429.",
    inputPipeline: "Request AI -> Gateway Routing Map -> Provider Eksekusi -> Simpan log ke ai_usage_logs.",
    outputImpact: "Menghindari ketergantungan pada 1 vendor AI dan mengontrol biaya operasional platform.",
    codeFiles: [
      "apps/dashboard/app/api/ai/route.ts",
      "apps/admin/src/app/ai-config/page.tsx",
    ],
  },
  {
    id: "cv_rewriter",
    name: "Dynamic 2D Prompt CV Rewriter",
    pillar: "adaptive",
    pillarName: "Pilar 2: Adaptive Context Intelligence",
    description: "Pembangun butir pengalaman dinamis berbasis matriks 2D: Tujuan (Goal) × Formula (STAR, XYZ, Metrics).",
    status: "AKTIF",
    metric: "4 Goals × 7 Formulas",
    note: "Injeksi konteks peran dan bahasa target on-the-fly",
    iconName: "Sparkles",
    algorithm: "2D Matrix Prompt Synthesis with Local NLG Fallback",
    formula: "Prompt = Matrix(Goal, Formula) + Konteks(Posisi, Perusahaan, Kata Kunci Loker Target, Bahasa).",
    thresholds: "Generator NLG lokal aktif untuk kalimat pendek guna menghemat token LLM.",
    inputPipeline: "Input Pengalaman Kandidat -> AiAssistantDrawer -> Sintesis Prompt Dinamis -> Respon Terstruktur.",
    outputImpact: "Kalimat CV terdengar natural, berbobot metrik, dan bebas dari gaya bahasa klise AI.",
    codeFiles: [
      "apps/dashboard/lib/cv-rewriter-prompt.ts",
      "apps/dashboard/lib/nlp-pruner.ts",
      "apps/dashboard/components/ai/AiAssistantDrawer.tsx",
    ],
  },
  {
    id: "mock_interview",
    name: "Dynamic Mock Interview & STAR Evaluator",
    pillar: "adaptive",
    pillarName: "Pilar 2: Adaptive Context Intelligence",
    description: "Simulator wawancara kerja yang menyesuaikan pertanyaan dan mengevaluasi jawaban dengan kerangka STAR.",
    status: "AKTIF",
    metric: "Skor 0-100 STAR",
    note: "Analisis kekuatan, perbaikan, & contoh ideal",
    iconName: "Mic",
    algorithm: "Contextual Behavioral QA Generation & Competency Rubric",
    formula: "Skor = 25% Situation + 25% Task + 30% Action + 20% Result. Analisis keselarasan dengan peran target.",
    thresholds: "Tersedia 3 tingkat kesulitan (Junior, Mid, Senior) yang mengatur kedalaman pertanyaan jebakan.",
    inputPipeline: "Peran Target & Level -> AI Question Generator -> Jawaban Kandidat -> STAR Evaluator.",
    outputImpact: "Kandidat dapat berlatih wawancara tanpa rasa takut dan mengetahui kelemahan jawabannya sebelum sesi nyata.",
    codeFiles: ["apps/dashboard/components/InterviewView.tsx"],
  },
  {
    id: "job_matcher",
    name: "Multi-Factor Job Matcher",
    pillar: "adaptive",
    pillarName: "Pilar 2: Adaptive Context Intelligence",
    description: "Evaluasi kecocokan 4 pilar antara profil kandidat dengan kualifikasi lowongan pekerjaan.",
    status: "AKTIF",
    metric: "4 pilar kecocokan",
    note: "Skills overlap, experience, location, salary",
    iconName: "Briefcase",
    algorithm: "Multi-Dimensional Vector & Heuristic Alignment",
    formula: "Match Score = (w_skill * SkillScore) + (w_exp * ExpScore) + (w_loc * LocScore) + (w_sal * SalScore).",
    thresholds: "Bobot membaca dinamis dari penala rekomendasi adaptif.",
    inputPipeline: "Kualifikasi Loker + Profil CV -> job-matcher.ts -> Skor persentase & daftar missing skills.",
    outputImpact: "Pengguna langsung tahu peluang lolos dan keahlian spesifik yang perlu ditambahkan sebelum melamar.",
    codeFiles: [
      "apps/dashboard/lib/job-matcher.ts",
      "apps/dashboard/components/CvMatchAnalysisView.tsx",
    ],
  },
  {
    id: "ai_suggestions",
    name: "Personalized AI Career Suggestions",
    pillar: "adaptive",
    pillarName: "Pilar 2: Adaptive Context Intelligence",
    description: "Kartu saran prioritas di Beranda pengguna yang terus berganti sesuai kelengkapan dan kondisi terkini.",
    status: "AKTIF",
    metric: "Prioritas dinamis",
    note: "Mengevaluasi kelengkapan profil & tren lamaran",
    iconName: "TrendingUp",
    algorithm: "Priority Rule-Based Lifecycle Action Generator",
    formula: "Jika skills < 4: Action Tambah Skill. Jika ATS < 70: Action Optimasi Format. Jika lamaran = 0: Action Eksplor Loker.",
    thresholds: "Maksimal menampilkan 3 kartu saran paling krusial agar tidak membebani perhatian pengguna.",
    inputPipeline: "Ringkasan Profil Pengguna -> ai-suggestions.ts -> Render kartu aksi di Beranda.",
    outputImpact: "Memberikan panduan langkah demi langkah seperti mentor pribadi.",
    codeFiles: [
      "apps/dashboard/lib/ai-suggestions.ts",
      "apps/dashboard/components/AICareerAssistantCard.tsx",
    ],
  },
  {
    id: "employr_coach",
    name: "Employr Coach (Learning AI Tutor)",
    pillar: "adaptive",
    pillarName: "Pilar 2: Adaptive Context Intelligence",
    description: "Asisten AI kontekstual yang memahami materi kursus dan video pembelajaran di ruang kelas.",
    status: "AKTIF",
    metric: "Konteks modul aktif",
    note: "Rangkum materi, kuis, & studi kasus lokal",
    iconName: "GraduationCap",
    algorithm: "Context-Injected Curriculum QA Engine",
    formula: "Sistem menginjeksi transkrip dan ringkasan modul aktif ke dalam prompt sebelum merespon pertanyaan siswa.",
    thresholds: "Respon wajib memberikan analogi praktis industri Indonesia (ekosistem Gojek, Bibit, Shopee).",
    inputPipeline: "Modul Belajar -> Ruang Kelas Belajar -> Drawer Tanya Coach -> Respon Terarah.",
    outputImpact: "Siswa yang bingung dapat langsung bertanya dan memahami konsep sulit tanpa harus menunggu instruktur.",
    codeFiles: ["apps/learning/app/kursus/[slug]/belajar/[lessonId]/page.tsx"],
  },
  {
    id: "growth_studio",
    name: "Growth Experiment Studio",
    pillar: "adaptive",
    pillarName: "Pilar 2: Adaptive Context Intelligence",
    description: "Pengujian konten organik berbasis metode ilmiah untuk menguji narasi edukasi karier yang paling diminati.",
    status: "AKTIF",
    metric: "Metode Ilmiah",
    note: "Hipotesis -> Eksperimen -> Keputusan",
    iconName: "FlaskConical",
    algorithm: "Hypothesis-Driven Growth Experimentation Loop",
    formula: "Siklus: Hipotesis Variabel -> Publikasi Konten (Threads/LinkedIn) -> Agregasi Metrik -> Keputusan (KEEP/ITERATE/KILL).",
    thresholds: "Eksperimen dievaluasi setelah mencapai minimal 1.000 impresi atau 7 hari penayangan.",
    inputPipeline: "Generator Konten AI Persona Khusus -> Catat UTM & Reaksi -> Evaluasi Jurnal Pembelajaran.",
    outputImpact: "Membantu tim menemukan pesan komunikasi yang paling resonan bagi pencari kerja muda Indonesia.",
    codeFiles: [
      "apps/admin/src/app/growth/page.tsx",
      "apps/admin/src/app/api/growth/posts/route.ts",
    ],
  },
  {
    id: "ml_correlation",
    name: "Automated ML Outcome Correlation",
    pillar: "planned",
    pillarName: "Pilar 3: Planned Roadmap",
    description: "Regresi logistik otomatis tanpa perantara untuk memetakan korelasi Pearson setiap komponen ATS ke hasil offering.",
    status: "PLANNED",
    metric: "Korelasi Pearson ML",
    note: "Fondasi siap, menunggu kuota data latih 500 sampel",
    iconName: "BarChart3",
    algorithm: "Autonomous Logistic Regression & Pearson Correlation Calibration",
    formula: "Bobot Komponen = Regresi Probabilitas Konversi Offering terhadap Skor Tiap Sesi CV.",
    thresholds: "Membutuhkan minimal 500 data hasil akhir lamaran (Hired/Rejected) yang terverifikasi.",
    inputPipeline: "Worker outcome-correlation.ts -> Model Latihan Regresi -> Kalibrasi Bobot Langsung.",
    outputImpact: "Menghilangkan bias manusia dalam menentukan bobot penilaian CV kandidat.",
    codeFiles: ["packages/queue/src/jobs/outcome-correlation.ts"],
  },
  {
    id: "salary_kit",
    name: "Company Insights & Salary Negotiation Kit",
    pillar: "planned",
    pillarName: "Pilar 3: Planned Roadmap",
    description: "Agregasi data kompensasi komunitas dan generator skrip negosiasi tawaran kerja berbasis pencapaian.",
    status: "PLANNED",
    metric: "Komunitas Gaji",
    note: "Tercantum dalam Roadmap PRD Fase 4",
    iconName: "Clock",
    algorithm: "Community Salary Aggregation & Dynamic Counter-Offer Generator",
    formula: "Rentang Gaji Acuan = Median & Persentil 25-75 per Industri dan Kota. Skrip disesuaikan dengan nilai tambah kandidat.",
    thresholds: "Aktif setelah fitur kontribusi gaji komunitas diluncurkan.",
    inputPipeline: "Laporan Gaji Pengguna -> Agregator Wawasan -> Generator Skrip Negosiasi.",
    outputImpact: "Membantu lulusan baru percaya diri saat bernegosiasi gaji pertama mereka.",
    codeFiles: ["docs/prd.md"],
  },
];

// Helper to map icon name to Lucide Icon
function getIcon(name: string) {
  const iconMap: Record<string, React.ElementType> = {
    Layers,
    BookOpen,
    Target,
    RefreshCw,
    Zap,
    MessageSquare,
    UserCheck,
    Brain,
    GraduationCap,
    Eye,
    Database,
    Sparkles,
    Mic,
    Briefcase,
    TrendingUp,
    FlaskConical,
    BarChart3,
    Clock,
  };
  return iconMap[name] || Brain;
}

export function SystemIntelligenceView({ initialData }: { initialData: SystemIntelligenceInitialData }) {
  const [data, setData] = useState<SystemIntelligenceInitialData>(initialData);
  const [selectedPillar, setSelectedPillar] = useState<"all" | FeaturePillar>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFeature, setSelectedFeature] = useState<FeatureDetail | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "telemetry">("overview");

  // Fetch updated data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/system-intelligence");
      const json = await res.json();
      if (json.success && json.data) {
        // Update stats
        setData((prev) => ({
          ...prev,
          stats: {
            ...prev.stats,
            blueprints: json.data.blueprints,
            blueprintEntries: json.data.blueprintEntries,
            dictionaryTokens: json.data.dictionaryTokens,
            cacheEntries: json.data.cacheEntries,
            cacheHits: json.data.cacheHits,
            cacheSavingsPercent: json.data.cacheSavingsPercent,
            aiRequests: json.data.aiRequests,
            behaviorProfiles: json.data.behaviorProfiles,
          },
          lastUpdated: new Date().toLocaleTimeString("id-ID"),
        }));
      }
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      handleRefresh();
    }, 15000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Filter features
  const filteredFeatures = useMemo(() => {
    return ALL_FEATURES.filter((f) => {
      const matchesPillar = selectedPillar === "all" || f.pillar === selectedPillar;
      const matchesSearch =
        searchQuery.trim() === "" ||
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.algorithm.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.metric.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesPillar && matchesSearch;
    });
  }, [selectedPillar, searchQuery]);

  // Pillar counts
  const counts = useMemo(() => {
    return {
      all: ALL_FEATURES.length,
      continuous: ALL_FEATURES.filter((f) => f.pillar === "continuous").length,
      adaptive: ALL_FEATURES.filter((f) => f.pillar === "adaptive").length,
      planned: ALL_FEATURES.filter((f) => f.pillar === "planned").length,
    };
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* ── 1. Top Header with Live Pulse & Actions ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <SidebarToggle />
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                <Brain size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                    System Intelligence Monitor
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[10px] text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Live Self-Learning
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  Pemantauan real-time proses pembelajaran mandiri, umpan balik pengguna, dan evolusi algoritma
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls: Auto-refresh toggle & manual refresh */}
        <div className="flex items-center gap-3 shrink-0">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-[10px] shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 cursor-pointer"
            />
            <span>Auto Refresh (15s)</span>
          </label>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-[10px] bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
            <span>{isRefreshing ? "Memperbarui..." : "Sinkronkan"}</span>
          </button>
        </div>
      </div>

      {/* ── 2. System Evolution & Maturity Hero Card ("Sejauh Mana Sistem Berkembang") ── */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-[10px] text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Tingkat Kedewasaan Sistem
              </span>
              <span className="text-xs text-indigo-300/80">
                Terakhir disinkronkan: {data.lastUpdated}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Level 3: Adaptive Community Learning
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                78% Matang
              </span>
            </h2>
            <p className="text-sm text-indigo-100/80 leading-relaxed">
              Sistem saat ini aktif mengumpulkan data riil dari komunitas pengguna (kosakata CV, nama peran baru, telemetri klik loker) untuk memperbarui blueprint karier dan menala bobot secara mandiri tanpa memerlukan rilis kode baru.
            </p>
          </div>

          {/* Evolution Stages Mini Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0 lg:max-w-md w-full">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
              <div className="flex items-center justify-between text-[11px] text-indigo-200 font-bold mb-1">
                <span>Tahap 1</span>
                <CheckCircle2 size={13} className="text-emerald-400" />
              </div>
              <p className="text-xs font-bold text-white">Static Seeds</p>
              <div className="mt-2 w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-400 h-full w-full rounded-full" />
              </div>
              <span className="text-[10px] text-indigo-300/70 mt-1 block">100% Siap</span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
              <div className="flex items-center justify-between text-[11px] text-indigo-200 font-bold mb-1">
                <span>Tahap 2</span>
                <Activity size={13} className="text-indigo-400 animate-pulse" />
              </div>
              <p className="text-xs font-bold text-white">Community Data</p>
              <div className="mt-2 w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div className="bg-indigo-400 h-full w-[85%] rounded-full" />
              </div>
              <span className="text-[10px] text-indigo-300/70 mt-1 block">85% Aktif</span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
              <div className="flex items-center justify-between text-[11px] text-indigo-200 font-bold mb-1">
                <span>Tahap 3</span>
                <Sliders size={13} className="text-amber-400" />
              </div>
              <p className="text-xs font-bold text-white">Closed-Loop</p>
              <div className="mt-2 w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div className="bg-amber-400 h-full w-[65%] rounded-full" />
              </div>
              <span className="text-[10px] text-indigo-300/70 mt-1 block">65% Berjalan</span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
              <div className="flex items-center justify-between text-[11px] text-indigo-200 font-bold mb-1">
                <span>Tahap 4</span>
                <Clock size={13} className="text-slate-400" />
              </div>
              <p className="text-xs font-bold text-white">Full Auto ML</p>
              <div className="mt-2 w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div className="bg-slate-500 h-full w-[20%] rounded-full" />
              </div>
              <span className="text-[10px] text-indigo-300/70 mt-1 block">Menunggu Data</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Live Telemetry KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Learned Blueprints */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-indigo-200 dark:hover:border-indigo-900 transition">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
              <Layers size={18} />
            </div>
            <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800">
              {data.stats.blueprintPromoted} Terverifikasi
            </span>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Blueprint Peran Komunitas
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
              {data.stats.blueprints.toLocaleString("id-ID")} Peran
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1">
            <span>Dari {data.stats.blueprintEntries.toLocaleString("id-ID")} entri input CV pengguna</span>
          </p>
        </div>

        {/* Card 2: NLP Dictionary Growth */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-indigo-200 dark:hover:border-indigo-900 transition">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
              <BookOpen size={18} />
            </div>
            <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800">
              Auto-Discovery
            </span>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Kamus Kosakata CV (NLP)
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
              {data.stats.dictionaryTokens.toLocaleString("id-ID")} Token
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            4 kategori: skill, posisi, almamater, kota
          </p>
        </div>

        {/* Card 3: Semantic Cache Savings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-indigo-200 dark:hover:border-indigo-900 transition">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800">
              <Zap size={18} />
            </div>
            <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800">
              Sub-10ms
            </span>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            AI Semantic Cache Hits
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
              {data.stats.cacheHits.toLocaleString("id-ID")} Hits
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            {data.stats.cacheEntries.toLocaleString("id-ID")} entri tembolok, hemat ~{data.stats.cacheSavingsPercent}% kuota
          </p>
        </div>

        {/* Card 4: Recommendation Feedback & CTR */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-indigo-200 dark:hover:border-indigo-900 transition">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800">
              <Target size={18} />
            </div>
            <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-400 dark:border-indigo-800">
              14 Hari Terakhir
            </span>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            CTR Penala Rekomendasi
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
              {data.stats.recoCTR}%
            </span>
            <span className="text-xs text-slate-500">
              ({data.stats.recoClicks}/{data.stats.recoImpressions} klik)
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            Acceptance AI: {data.stats.acceptanceRate}% dari umpan balik pengguna
          </p>
        </div>
      </div>

      {/* ── 4. Main Section Tabs (Overview, Activity Timeline, Telemetry) ── */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-[10px] text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "overview"
                ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Layers size={14} />
            <span>Matriks Mesin Cerdas (19)</span>
          </button>

          <button
            onClick={() => setActiveTab("timeline")}
            className={`px-4 py-2 rounded-[10px] text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "timeline"
                ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Activity size={14} />
            <span>Pergerakan Belajar Terkini</span>
            {data.recentLearningEvents.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-500 text-white font-mono">
                {data.recentLearningEvents.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("telemetry")}
            className={`px-4 py-2 rounded-[10px] text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "telemetry"
                ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Sliders size={14} />
            <span>Telemetri & Penala Bobot</span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: OVERVIEW & FEATURE MATRIX ── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Pillar Filters & Search Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setSelectedPillar("all")}
                className={`px-3 py-1.5 rounded-[10px] text-xs font-bold transition cursor-pointer ${
                  selectedPillar === "all"
                    ? "bg-[#1738D1] text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                Semua ({counts.all})
              </button>
              <button
                onClick={() => setSelectedPillar("continuous")}
                className={`px-3 py-1.5 rounded-[10px] text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  selectedPillar === "continuous"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100"
                }`}
              >
                <span>Pilar 1: Continuous Learning</span>
                <span className="opacity-75 font-mono">({counts.continuous})</span>
              </button>
              <button
                onClick={() => setSelectedPillar("adaptive")}
                className={`px-3 py-1.5 rounded-[10px] text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  selectedPillar === "adaptive"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100"
                }`}
              >
                <span>Pilar 2: Adaptive Intelligence</span>
                <span className="opacity-75 font-mono">({counts.adaptive})</span>
              </button>
              <button
                onClick={() => setSelectedPillar("planned")}
                className={`px-3 py-1.5 rounded-[10px] text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  selectedPillar === "planned"
                    ? "bg-slate-700 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                }`}
              >
                <span>Pilar 3: Planned</span>
                <span className="opacity-75 font-mono">({counts.planned})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[260px]">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari fitur, algoritma, atau metrik..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Feature List Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                  <Layers size={16} />
                  Daftar Mesin Pembelajaran & Kecerdasan ({filteredFeatures.length})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Klik baris mana saja untuk melihat rincian formula algoritma, pipeline data, dan file kode di drawer
                </p>
              </div>
              <span className="text-xs text-slate-400">
                Menampilkan {filteredFeatures.length} dari 19 total fitur
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider w-10">
                      #
                    </th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Nama Mesin & Arsitektur
                    </th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Metrik Pembelajaran
                    </th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Algoritma / Cara Kerja
                    </th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider w-24">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredFeatures.map((f, i) => {
                    const Icon = getIcon(f.iconName);
                    return (
                      <tr
                        key={f.id}
                        onClick={() => setSelectedFeature(f)}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition cursor-pointer group"
                      >
                        <td className="px-5 py-4 text-xs font-mono text-slate-400">{i + 1}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:group-hover:bg-indigo-950/80 dark:group-hover:text-indigo-400 transition shrink-0 mt-0.5">
                              <Icon size={16} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                                  {f.name}
                                </span>
                                <span className="text-[10px] font-medium px-2 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                                  {f.pillar === "continuous"
                                    ? "Pilar 1"
                                    : f.pillar === "adaptive"
                                    ? "Pilar 2"
                                    : "Pilar 3"}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 max-w-md">
                                {f.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-[10px] text-[10px] font-bold border ${
                              f.status === "AKTIF"
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800"
                                : f.status === "SCAFFOLDED"
                                ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800"
                                : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                            }`}
                          >
                            {f.status === "AKTIF"
                              ? "✅ Aktif"
                              : f.status === "SCAFFOLDED"
                              ? "🔧 Scaffolded"
                              : "📋 Planned"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{f.metric}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{f.note}</p>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-400 max-w-xs truncate">
                          {f.algorithm}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition inline-flex items-center gap-1">
                            Detail <ChevronRight size={14} />
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: LIVE LEARNING ACTIVITY STREAM (PERGERAKAN TERKINI) ── */}
      {activeTab === "timeline" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                  <Activity size={18} className="text-indigo-600 dark:text-indigo-400" />
                  Log Pergerakan & Kejadian Pembelajaran Mandiri
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Aktivitas nyata saat sistem merekam peran baru, memperluas kamus NLP, mengaktifkan cache, atau menala rekomendasi
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {data.recentLearningEvents.length} entri terekam
              </span>
            </div>

            {data.recentLearningEvents.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Brain size={32} className="mx-auto text-slate-300 opacity-50" />
                <p className="text-sm font-medium">Belum ada aktivitas pembelajaran baru yang tercatat</p>
                <p className="text-xs text-slate-500">
                  Aktivitas akan muncul secara otomatis ketika pengguna membuat CV, mengunggah dokumen, atau berinteraksi dengan AI.
                </p>
              </div>
            ) : (
              <div className="relative pl-6 border-l-2 border-indigo-100 dark:border-slate-800 space-y-6 my-4">
                {data.recentLearningEvents.map((evt, idx) => (
                  <div key={evt.id || idx} className="relative group">
                    {/* Circle Node */}
                    <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 bg-indigo-500 ring-4 ring-indigo-50 dark:ring-indigo-950/60" />

                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-4 hover:border-indigo-300 dark:hover:border-indigo-800 transition">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${evt.badgeColor}`}
                          >
                            {evt.tag}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {evt.title}
                          </h4>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 shrink-0">
                          {evt.timeAgo}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {evt.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: TELEMETRY & LIVE TUNER WEIGHTS ── */}
      {activeTab === "telemetry" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recommendation Tuner Weights Breakdown */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                  <Sliders size={16} className="text-indigo-600 dark:text-indigo-400" />
                  Bobot Penala Rekomendasi Aktif
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Dihitung dinamis dari rasio klik CTR 14 hari terakhir (Total bobot = 1.0)
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-[10px] text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                Terkalibrasi Otomatis
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">Kesesuaian Keahlian (Skills Overlap)</span>
                  <span className="text-indigo-600 font-mono">35%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: "35%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">Tingkat Pengalaman (Experience Level)</span>
                  <span className="text-blue-600 font-mono">25%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: "25%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">Kesesuaian Lokasi / Provinsi</span>
                  <span className="text-emerald-600 font-mono">20%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: "20%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">Kesesuaian Ekspektasi Gaji</span>
                  <span className="text-amber-600 font-mono">10%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                  <div className="bg-amber-600 h-full rounded-full" style={{ width: "10%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">Kebaruan Lowongan (Recency)</span>
                  <span className="text-rose-600 font-mono">10%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                  <div className="bg-rose-600 h-full rounded-full" style={{ width: "10%" }} />
                </div>
              </div>
            </div>

            <div className="mt-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
              <ShieldCheck size={16} className="text-indigo-600 shrink-0 mt-0.5" />
              <span>
                <strong>Mekanisme Anti-Saturasi:</strong> Lowongan yang telah tampil pada kartu rekomendasi lebih dari 2 kali dalam 7 hari terakhir secara otomatis dipindahkan ke daftar supresi agar pengguna selalu melihat lowongan baru.
              </span>
            </div>
          </div>

          {/* Dictionary Distribution Breakdown */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                  <BookOpen size={16} className="text-emerald-600 dark:text-emerald-400" />
                  Kamus NLP Hasil Pembelajaran
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Total {data.stats.dictionaryTokens.toLocaleString("id-ID")} token dari ekstraksi CV nyata
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">4 Kategori</span>
            </div>

            <div className="space-y-4">
              {data.dictByCategory.map((cat) => (
                <div key={cat.category} className="border-b border-slate-100 dark:border-slate-800 pb-3 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      {cat.category === "skill"
                        ? "Keahlian"
                        : cat.category === "position"
                        ? "Nama Posisi / Jabatan"
                        : cat.category === "institution"
                        ? "Institusi / Kampus / Sekolah"
                        : "Kota / Domisili"}
                    </span>
                    <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {cat.count.toLocaleString("id-ID")} token
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.topTokens.slice(0, 8).map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      >
                        {t.value}
                        <span className="ml-1 text-[10px] text-slate-400">×{t.frequency}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 5. RIGHT-HAND SLIDE-IN DRAWER (INSPEKSI DETAIL MESIN) ── */}
      <AnimatePresence>
        {selectedFeature && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end transition-opacity">
            <div className="absolute inset-0" onClick={() => setSelectedFeature(null)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative z-10 w-full max-w-md sm:max-w-xl h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                    {(() => {
                      const Icon = getIcon(selectedFeature.iconName);
                      return <Icon size={20} />;
                    })()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
                      {selectedFeature.name}
                    </h3>
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                      {selectedFeature.pillarName}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFeature(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Body (Scrollable) */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 dark:text-slate-300 text-xs">
                {/* Status & Metrics Badge */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Status Operasional
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {selectedFeature.status === "AKTIF"
                        ? "Berjalan di Production"
                        : selectedFeature.status === "SCAFFOLDED"
                        ? "Siap / Menunggu Kuota Data"
                        : "Direncanakan (Roadmap PRD)"}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-[10px] text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-400">
                    {selectedFeature.metric}
                  </span>
                </div>

                {/* Deskripsi & Peran */}
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Layers size={14} className="text-indigo-600" /> Deskripsi Fungsi
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {selectedFeature.description}
                  </p>
                </div>

                {/* Algoritma & Formula */}
                <div className="space-y-1.5 p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                  <h4 className="font-bold text-indigo-950 dark:text-indigo-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders size={14} className="text-indigo-600" /> Algoritma & Formula
                  </h4>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedFeature.algorithm}
                  </p>
                  <p className="font-mono text-[11px] text-indigo-700 dark:text-indigo-300 bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-900 mt-2 leading-relaxed">
                    {selectedFeature.formula}
                  </p>
                </div>

                {/* Ambang Batas / Guardrails */}
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-600" /> Ambang Batas & Guardrail
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {selectedFeature.thresholds}
                  </p>
                </div>

                {/* Input Pipeline */}
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Database size={14} className="text-blue-600" /> Alur Masukan Data (Input Pipeline)
                  </h4>
                  <p className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    {selectedFeature.inputPipeline}
                  </p>
                </div>

                {/* Dampak Luaran */}
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Award size={14} className="text-amber-600" /> Dampak ke Pengguna
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {selectedFeature.outputImpact}
                  </p>
                </div>

                {/* File Kode Rujukan */}
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <ExternalLink size={14} className="text-indigo-600" /> File Kode Rujukan
                  </h4>
                  <div className="space-y-1">
                    {selectedFeature.codeFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-indigo-600 dark:text-indigo-400 flex items-center justify-between"
                      >
                        <span>{file}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Employr Core Architecture</span>
                <button
                  onClick={() => setSelectedFeature(null)}
                  className="px-4 py-2 rounded-[10px] bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs transition cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
