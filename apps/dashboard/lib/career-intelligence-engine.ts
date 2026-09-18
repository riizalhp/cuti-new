/**
 * Employr - Career Intelligence Engine
 * 
 * Engine analisis data karier yang membaca profil pengguna, CV aktif,
 * dan riwayat lamaran untuk menghasilkan evaluasi berbasis bukti (evidence-based).
 */

export interface EvidenceItem {
  source: 'cv_experience' | 'cv_project' | 'cv_skill' | 'cv_education' | 'profile' | 'tracker';
  title: string;
  detail: string;
}

export interface CompetencyCluster {
  id: string;
  name: string;
  description: string;
  aliases: string[];
  keywords: string[];
  requiredScore: number;
  weight: number;
}

export interface RoleTaxonomyItem {
  id: string;
  title: string;
  category: 'admin' | 'customer' | 'creative' | 'tech' | 'marketing' | 'product' | 'operations';
  categoryLabel: string;
  description: string;
  seniority: 'Entry Level' | 'Junior' | 'Menengah';
  competencies: CompetencyCluster[];
  commonTransitions: {
    targetRoleId: string;
    effort: 'Rendah' | 'Sedang' | 'Signifikan';
    bridgeSkills: string[];
    path: string[];
  }[];
}

export interface CompetencyScoreResult {
  id: string;
  name: string;
  currentScore: number;
  requiredScore: number;
  gap: number;
  weight: number;
  confidence: 'Tinggi' | 'Sedang' | 'Terbatas';
  evidence: EvidenceItem[];
  whyItMatters: string;
  suggestedAction: string;
}

export interface SkillGapItem {
  competencyId: string;
  name: string;
  currentScore: number;
  requiredScore: number;
  priority: 'Tinggi' | 'Sedang' | 'Nilai Tambah';
  priorityLabel: string;
  whyItMatters: string;
  suggestedAction: string;
  actionType: 'learn' | 'project' | 'cv_tailor' | 'apply';
}

export interface CareerDirectionItem {
  roleId: string;
  title: string;
  category: string;
  fitScore: number;
  fitLabel: string;
  transitionEffort: 'Rendah' | 'Sedang' | 'Signifikan';
  transferableSkills: string[];
  missingCompetencies: string[];
  recommendedNextStep: string;
  careerPath: string[];
}

export interface CareerAssessment {
  targetRole: RoleTaxonomyItem;
  availableRoles: { id: string; title: string; categoryLabel: string }[];
  roleFitScore: number;
  roleFitLabel: string;
  readinessScore: number;
  competencies: CompetencyScoreResult[];
  topStrengths: CompetencyScoreResult[];
  priorityGaps: SkillGapItem[];
  careerDirections: CareerDirectionItem[];
  nextBestMove: {
    title: string;
    description: string;
    actionUrl: string;
    actionLabel: string;
    secondaryActionUrl?: string;
    secondaryActionLabel?: string;
  };
  profileCompleteness: {
    percentage: number;
    hasCv: boolean;
    cvCount: number;
    hasSkills: boolean;
    hasExperience: boolean;
    hasEducation: boolean;
    trackedJobsCount: number;
  };
  lastEvaluatedAt: string;
  isBenchmarkMode?: boolean;
  selectedCvScope?: {
    id: string;
    title: string;
    targetPosition?: string;
  };
  availableCvs?: {
    id: string;
    title: string;
    targetPosition?: string;
  }[];
}

/**
 * Taksonomi Role Pasar Kerja Indonesia (Vokasi, Entry-Level, Fresh Grad, & Tech)
 */
export const ROLE_TAXONOMY: RoleTaxonomyItem[] = [
  {
    id: 'staff-admin',
    title: 'Staff Administrasi & Operasional',
    category: 'admin',
    categoryLabel: 'Administrasi',
    description: 'Mengelola dokumentasi kantor, input data, rekapitulasi laporan, dan koordinasi operasional harian.',
    seniority: 'Entry Level',
    competencies: [
      {
        id: 'office-software',
        name: 'Aplikasi Perkantoran & Spreadsheet',
        description: 'Kemampuan mengoperasikan Microsoft Excel, Word, Google Sheets, dan pengolahan data tabel.',
        aliases: ['excel', 'google sheets', 'spreadsheet', 'microsoft office', 'word'],
        keywords: ['excel', 'sheets', 'vlookup', 'pivot', 'rumus', 'word', 'dokumen', 'rekap', 'input data', 'tabel'],
        requiredScore: 85,
        weight: 1.3,
      },
      {
        id: 'data-entry',
        name: 'Ketelitian & Pengelolaan Data',
        description: 'Akurasi input dokumen, filling arsip fisik atau digital, dan validasi data transaksi.',
        aliases: ['data entry', 'arsip', 'pengarsipan', 'administrasi berkas', 'input data'],
        keywords: ['data entry', 'arsip', 'filling', 'akurasi', 'teliti', 'faktur', 'invoice', 'inventaris'],
        requiredScore: 80,
        weight: 1.2,
      },
      {
        id: 'business-comm',
        name: 'Komunikasi Bisnis & Korespondensi',
        description: 'Menyusun surat dinas, email formal, tata bahasa tertulis yang santun, dan penerimaan tamu.',
        aliases: ['korespondensi', 'email formal', 'surat menyurat', 'komunikasi kantor'],
        keywords: ['surat', 'email', 'notulen', 'rapat', 'korespondensi', 'telepon', 'tamu', 'tata bahasa'],
        requiredScore: 75,
        weight: 1.0,
      },
      {
        id: 'operational-coord',
        name: 'Koordinasi Operasional & Logistik',
        description: 'Mendukung kelancaran inventaris barang kantor, pengadaan perlengkapan, dan pengiriman dokumen.',
        aliases: ['operasional', 'logistik', 'pengadaan', 'atk'],
        keywords: ['operasional', 'logistik', 'atk', 'pengadaan', 'vendor', 'jadwal', 'ekspedisi'],
        requiredScore: 70,
        weight: 1.0,
      },
      {
        id: 'problem-solving',
        name: 'Penyelesaian Masalah Harian',
        description: 'Tanggap menghadapi kendala administratif dan mampu memprioritaskan tugas yang mendesak.',
        aliases: ['time management', 'prioritas', 'ketepatan waktu'],
        keywords: ['deadline', 'prioritas', 'tanggung jawab', 'disiplin', 'multi-tasking'],
        requiredScore: 70,
        weight: 0.9,
      },
    ],
    commonTransitions: [
      {
        targetRoleId: 'customer-service',
        effort: 'Rendah',
        bridgeSkills: ['Komunikasi Bisnis', 'Penanganan Permintaan'],
        path: ['Staff Administrasi', 'Customer Support', 'Service Lead'],
      },
      {
        targetRoleId: 'junior-data-admin',
        effort: 'Sedang',
        bridgeSkills: ['Excel Lanjutan', 'Dashboard Visual'],
        path: ['Staff Administrasi', 'Data Entry Specialist', 'Junior Data Analyst'],
      },
    ],
  },
  {
    id: 'customer-service',
    title: 'Customer Service & Support',
    category: 'customer',
    categoryLabel: 'Layanan Pelanggan',
    description: 'Menjawab pertanyaan pelanggan, menyelesaikan komplain via chat/telepon, dan menjaga kepuasan pengguna.',
    seniority: 'Entry Level',
    competencies: [
      {
        id: 'empathy-comm',
        name: 'Komunikasi Empatik & Layanan',
        description: 'Mendengarkan aktif, bertutur kata ramah, dan meredakan kekecewaan pelanggan dengan tenang.',
        aliases: ['komunikasi', 'layanan pelanggan', 'pelayanan', 'ramah', 'interpersonal'],
        keywords: ['pelanggan', 'customer', 'komunikasi', 'ramah', 'empati', 'bicara', 'telepon', 'chat'],
        requiredScore: 90,
        weight: 1.4,
      },
      {
        id: 'complaint-resolution',
        name: 'Resolusi Komplain & Problem Solving',
        description: 'Menganalisis keluhan, mengidentifikasi akar masalah, dan memberikan solusi sesuai SOP perusahaan.',
        aliases: ['komplain', 'penanganan masalah', 'troubleshooting'],
        keywords: ['komplain', 'solusi', 'sop', 'keluhan', 'resolusi', 'eskalasi', 'ticket'],
        requiredScore: 85,
        weight: 1.2,
      },
      {
        id: 'crm-helpdesk',
        name: 'Penggunaan Tool Helpdesk & CRM',
        description: 'Mencatat tiket masalah pelanggan di sistem helpdesk seperti Zendesk, Freshdesk, WhatsApp Business, atau CRM internal.',
        aliases: ['crm', 'helpdesk', 'zendesk', 'whatsapp business', 'ticketing'],
        keywords: ['zendesk', 'freshdesk', 'crm', 'tiket', 'whatsapp', 'aplikasi helpdesk', 'live chat'],
        requiredScore: 75,
        weight: 1.0,
      },
      {
        id: 'product-knowledge',
        name: 'Pemahaman Produk & SOP Cepat',
        description: 'Kemampuan menyerap informasi produk, alur retur, syarat promo, dan penjelasan teknis secara ringkas.',
        aliases: ['product knowledge', 'sop', 'faq'],
        keywords: ['produk', 'katalog', 'faq', 'prosedur', 'syarat', 'fitur', 'kebijakan'],
        requiredScore: 80,
        weight: 1.1,
      },
      {
        id: 'typing-speed',
        name: 'Kecepatan Mengetik & Dokumentasi',
        description: 'Mengetik cepat dan rapi untuk melayani multi-chat pelanggan secara serentak.',
        aliases: ['mengetik cepat', 'fast typing', 'rekap chat'],
        keywords: ['wpm', 'mengetik', 'catatan', 'rekap', 'multitask', 'chat response'],
        requiredScore: 70,
        weight: 0.9,
      },
    ],
    commonTransitions: [
      {
        targetRoleId: 'staff-admin',
        effort: 'Rendah',
        bridgeSkills: ['Dokumentasi Rapi', 'Korespondensi Email'],
        path: ['Customer Support', 'Operations Support', 'Staff Administrasi'],
      },
      {
        targetRoleId: 'social-media-specialist',
        effort: 'Sedang',
        bridgeSkills: ['Copywriting Komunikasi', 'Manajemen Komunitas'],
        path: ['Customer Support', 'Social Media Officer', 'Community Manager'],
      },
    ],
  },
  {
    id: 'social-media-specialist',
    title: 'Social Media & Digital Content',
    category: 'marketing',
    categoryLabel: 'Pemasaran Digital',
    description: 'Mengelola akun media sosial brand, merancang ide konten kreatif, copywriting caption, dan analisis interaksi.',
    seniority: 'Entry Level',
    competencies: [
      {
        id: 'content-creation',
        name: 'Perancangan Konten & Storytelling',
        description: 'Menyusun kalender konten bulanan, membuat naskah video pendek (Reels, TikTok), dan konsep visual.',
        aliases: ['konten', 'content creation', 'storytelling', 'ide kreatif'],
        keywords: ['konten', 'tiktok', 'instagram', 'reels', 'youtube', 'video', 'kreatif', 'kalender konten'],
        requiredScore: 88,
        weight: 1.3,
      },
      {
        id: 'copywriting',
        name: 'Copywriting & Penulisan Caption',
        description: 'Menulis teks yang memikat audiens, call-to-action yang jelas, dan gaya bahasa sesuai target pasar.',
        aliases: ['copywriting', 'caption', 'penulisan', 'scriptwriting'],
        keywords: ['copywriting', 'caption', 'naskah', 'hook', 'cta', 'artikel', 'headline'],
        requiredScore: 85,
        weight: 1.2,
      },
      {
        id: 'basic-design-video',
        name: 'Desain Grafis & Edit Video Dasar',
        description: 'Kemampuan mengoperasikan Canva, CapCut, Photoshop, atau Premiere Pro untuk produksi materi cepat.',
        aliases: ['canva', 'capcut', 'editing video', 'desain grafis'],
        keywords: ['canva', 'capcut', 'photoshop', 'premiere', 'audio', 'visual', 'layout', 'flyer'],
        requiredScore: 78,
        weight: 1.1,
      },
      {
        id: 'social-analytics',
        name: 'Analisis Metrik & Tren Media Sosial',
        description: 'Membaca data reach, engagement rate, views, dan merespons tren viral terkini.',
        aliases: ['analytics', 'insight instagram', 'tiktok analytics', 'engagement'],
        keywords: ['insight', 'analytics', 'engagement', 'reach', 'followers', 'tren', 'viral'],
        requiredScore: 72,
        weight: 1.0,
      },
      {
        id: 'community-management',
        name: 'Manajemen Komunitas & Kolaborasi',
        description: 'Membalas komentar warganet, DM pengguna, serta koordinasi dengan pembuat konten (KOL / Influencer).',
        aliases: ['community', 'kol', 'influencer', 'interaksi'],
        keywords: ['kol', 'influencer', 'komentar', 'dm', 'komunitas', 'kolaborasi'],
        requiredScore: 70,
        weight: 0.9,
      },
    ],
    commonTransitions: [
      {
        targetRoleId: 'junior-graphic-designer',
        effort: 'Sedang',
        bridgeSkills: ['Visual Design Principles', 'Photoshop & Illustrator'],
        path: ['Content Creator', 'Visual Content Designer', 'Graphic Designer'],
      },
      {
        targetRoleId: 'staff-admin',
        effort: 'Rendah',
        bridgeSkills: ['Pengelolaan Dokumen', 'Komunikasi Formal'],
        path: ['Social Media Officer', 'Marketing Admin', 'Marketing Coordinator'],
      },
    ],
  },
  {
    id: 'junior-graphic-designer',
    title: 'Junior Graphic Designer',
    category: 'creative',
    categoryLabel: 'Desain Grafis',
    description: 'Membuat aset visual promosi, materi branding, feed media sosial, dan layout cetak sesuai panduan gaya.',
    seniority: 'Junior',
    competencies: [
      {
        id: 'design-tools',
        name: 'Penguasaan Software Desain',
        description: 'Keahlian memakai Adobe Illustrator, Photoshop, Figma, dan Canva secara efisien.',
        aliases: ['adobe illustrator', 'photoshop', 'figma', 'canva', 'coreldraw'],
        keywords: ['illustrator', 'photoshop', 'figma', 'coreldraw', 'vector', 'bitmap', 'artboard'],
        requiredScore: 90,
        weight: 1.4,
      },
      {
        id: 'visual-principles',
        name: 'Prinsip Tipografi & Tata Letak',
        description: 'Pemahaman hierarki visual, kontras warna, keterbacaan font, dan whitespace dalam desain.',
        aliases: ['tipografi', 'tata letak', 'layout', 'warna', 'hierarki visual'],
        keywords: ['tipografi', 'font', 'warna', 'kontras', 'layout', 'grid', 'komposisi', 'estetika'],
        requiredScore: 85,
        weight: 1.2,
      },
      {
        id: 'branding-guidelines',
        name: 'Penerapan Brand Guidelines',
        description: 'Kepatuhan terhadap identitas merek, palet warna baku, logo lockup, dan konsistensi visual.',
        aliases: ['branding', 'brand identity', 'brand guideline', 'logo'],
        keywords: ['branding', 'brand guide', 'palet warna', 'logo', 'identitas', 'konsistensi visual'],
        requiredScore: 80,
        weight: 1.1,
      },
      {
        id: 'portfolio-presentation',
        name: 'Portofolio & Presentasi Karya',
        description: 'Menyajikan studi kasus karya desain secara terstruktur di Behance, Dribbble, atau PDF portofolio.',
        aliases: ['portofolio', 'portfolio', 'behance', 'mockup'],
        keywords: ['portofolio', 'portfolio', 'behance', 'dribbble', 'mockup', 'karya', 'studi kasus'],
        requiredScore: 82,
        weight: 1.1,
      },
      {
        id: 'print-production',
        name: 'Spesifikasi Cetak & Format Digital',
        description: 'Pengetahuan format file (CMYK vs RGB, DPI, bleed line, resolusi cetak banner dan brosur).',
        aliases: ['cetak', 'cmyk', 'resolusi', 'banner', 'brosur'],
        keywords: ['cmyk', 'rgb', 'cetak', 'banner', 'brosur', 'packaging', 'resolusi', 'bleed'],
        requiredScore: 70,
        weight: 0.8,
      },
    ],
    commonTransitions: [
      {
        targetRoleId: 'social-media-specialist',
        effort: 'Rendah',
        bridgeSkills: ['Copywriting Dasar', 'Konten Kalender'],
        path: ['Graphic Designer', 'Creative Lead Media Sosial'],
      },
      {
        targetRoleId: 'junior-web-dev',
        effort: 'Signifikan',
        bridgeSkills: ['HTML & CSS Dasar', 'Figma to Code'],
        path: ['Graphic Designer', 'UI Designer', 'Frontend Developer'],
      },
    ],
  },
  {
    id: 'junior-web-dev',
    title: 'Junior Web Developer',
    category: 'tech',
    categoryLabel: 'Teknologi & IT',
    description: 'Membangun antarmuka web responsif, mengintegrasikan API data, serta memperbaiki bug kode sistem.',
    seniority: 'Junior',
    competencies: [
      {
        id: 'frontend-basics',
        name: 'HTML5, CSS3, & Desain Responsif',
        description: 'Struktur kode semantik, CSS Flexbox/Grid, Tailwind CSS, dan tampilan ramah ponsel.',
        aliases: ['html', 'css', 'responsive', 'tailwind', 'bootstrap'],
        keywords: ['html', 'css', 'tailwind', 'responsive', 'bootstrap', 'dom', 'semantik', 'flexbox'],
        requiredScore: 90,
        weight: 1.3,
      },
      {
        id: 'javascript-typescript',
        name: 'JavaScript & Pemrograman Logis',
        description: 'ES6+, manipulasi state, async/await, logika percabangan, dan konsep data array/object.',
        aliases: ['javascript', 'js', 'typescript', 'ts'],
        keywords: ['javascript', 'typescript', 'es6', 'array', 'object', 'async', 'promise', 'fetch', 'api'],
        requiredScore: 85,
        weight: 1.3,
      },
      {
        id: 'modern-framework',
        name: 'Framework Web Modern (React / Next.js / Vue)',
        description: 'Komponen berbasis fungsi, hooks, routing halaman, dan pengelolaan siklus hidup tampilan.',
        aliases: ['react', 'next.js', 'vue', 'frontend framework'],
        keywords: ['react', 'next.js', 'vue', 'components', 'props', 'state', 'hooks', 'jsx'],
        requiredScore: 80,
        weight: 1.2,
      },
      {
        id: 'git-version-control',
        name: 'Git & Manajemen Kolaborasi Kode',
        description: 'Commit teratur, branching, resolving conflict, dan penggunaan GitHub/GitLab.',
        aliases: ['git', 'github', 'gitlab', 'version control'],
        keywords: ['git', 'github', 'gitlab', 'commit', 'branch', 'pull request', 'merge'],
        requiredScore: 78,
        weight: 1.0,
      },
      {
        id: 'database-api-integration',
        name: 'Konsumsi API & Pemahaman Basis Data',
        description: 'Menghubungkan frontend ke REST API atau GraphQL, serta pemahaman query SQL dasar.',
        aliases: ['rest api', 'sql', 'mysql', 'postgresql', 'backend integration'],
        keywords: ['api', 'rest', 'json', 'sql', 'mysql', 'postgres', 'crud', 'query'],
        requiredScore: 75,
        weight: 1.0,
      },
    ],
    commonTransitions: [
      {
        targetRoleId: 'associate-product-manager',
        effort: 'Sedang',
        bridgeSkills: ['Product Sense', 'Analisis Kebutuhan Fitur'],
        path: ['Junior Web Dev', 'Technical Product Coordinator', 'Associate Product Manager'],
      },
      {
        targetRoleId: 'staff-admin',
        effort: 'Rendah',
        bridgeSkills: ['Pengelolaan Database Excel', 'Pelaporan Data'],
        path: ['Junior Dev', 'Data Entry & IT Admin', 'Operations Analyst'],
      },
    ],
  },
  {
    id: 'associate-product-manager',
    title: 'Associate Product Manager',
    category: 'product',
    categoryLabel: 'Produk Digital',
    description: 'Membantu riset pengguna, menyusun spesifikasi fitur (PRD), dan berkolaborasi dengan tim desain dan engineering.',
    seniority: 'Junior',
    competencies: [
      {
        id: 'product-sense',
        name: 'Product Sense & Riset Pengguna',
        description: 'Memahami masalah pengguna riil, menyusun user story, dan mengidentifikasi peluang solusi digital.',
        aliases: ['product sense', 'riset pengguna', 'user research', 'user story'],
        keywords: ['user story', 'problem statement', 'riset', 'interview user', 'persona', 'fitur', 'pain point'],
        requiredScore: 85,
        weight: 1.3,
      },
      {
        id: 'feature-spec',
        name: 'Penyusunan Spesifikasi Fitur (PRD)',
        description: 'Menulis dokumen kebutuhan fitur yang terperinci, alur interaksi, dan kriteria penerimaan.',
        aliases: ['prd', 'product requirement', 'spesifikasi fitur', 'acceptance criteria'],
        keywords: ['prd', 'spesifikasi', 'flowchart', 'wireframe', 'requirement', 'acceptance criteria', 'notion'],
        requiredScore: 82,
        weight: 1.2,
      },
      {
        id: 'data-analytics',
        name: 'Analisis Data & Metrik Produk',
        description: 'Menganalisis funnel konversi, retensi pengguna, skor kepuasan, dan metrik kinerja fitur.',
        aliases: ['metrik', 'analytics', 'funnel', 'kpi', 'google analytics'],
        keywords: ['metrik', 'kpi', 'funnel', 'retensi', 'churn', 'analytics', 'dashboard', 'konversi'],
        requiredScore: 78,
        weight: 1.1,
      },
      {
        id: 'cross-collaboration',
        name: 'Kolaborasi Lintas Divisi (Stakeholder)',
        description: 'Komunikasi efektif antara tim developer, UI designer, marketing, dan manajemen operasional.',
        aliases: ['stakeholder management', 'kolaborasi tim', 'scrum', 'agile'],
        keywords: ['scrum', 'agile', 'sprint', 'trello', 'jira', 'developer', 'designer', 'meeting', 'koordinasi'],
        requiredScore: 85,
        weight: 1.2,
      },
      {
        id: 'tech-basics',
        name: 'Dasar Teknis Sistem & API',
        description: 'Memahami cara kerja aplikasi, alur database dasar, dan batasan teknis arsitektur sistem.',
        aliases: ['dasar teknis', 'arsitektur web', 'api dasar'],
        keywords: ['api', 'database', 'frontend', 'backend', 'bug', 'deployment', 'arsitektur'],
        requiredScore: 70,
        weight: 0.9,
      },
    ],
    commonTransitions: [
      {
        targetRoleId: 'social-media-specialist',
        effort: 'Sedang',
        bridgeSkills: ['Content Marketing', 'User Acquisition'],
        path: ['APM', 'Product Marketing Specialist', 'Growth Manager'],
      },
      {
        targetRoleId: 'staff-admin',
        effort: 'Rendah',
        bridgeSkills: ['Dokumentasi Proyek', 'Koordinasi Operasional'],
        path: ['APM', 'Project Coordinator', 'Operations Specialist'],
      },
    ],
  },
];

/**
 * Normalisasi data teks profil & CV untuk pencocokan kata kunci
 */
function normalizeText(text: string | null | undefined): string {
  if (!text) return '';
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Mencari bukti konkret dari data CV dan Profil untuk kompetensi tertentu
 */
function extractEvidenceForCompetency(
  comp: CompetencyCluster,
  userProfile: any,
  cvs: any[]
): EvidenceItem[] {
  const evidence: EvidenceItem[] = [];
  const searchTerms = [...comp.keywords, ...comp.aliases].map((t) => t.toLowerCase());

  // 1. Cek dari CV Experiences & Projects
  if (Array.isArray(cvs) && cvs.length > 0) {
    cvs.forEach((cv) => {
      // Data skills di CV
      if (Array.isArray(cv.skills)) {
        cv.skills.forEach((sk: string) => {
          const normSkill = normalizeText(sk);
          if (searchTerms.some((term) => normSkill.includes(term) || term.includes(normSkill))) {
            evidence.push({
              source: 'cv_skill',
              title: `Keahlian: ${sk}${cv.title ? ` [${cv.title}]` : ''}`,
              detail: `Terdaftar dalam daftar keahlian pada dokumen "${cv.title || 'CV Aktif'}".`,
            });
          }
        });
      }

      // Pengalaman kerja di CV
      if (Array.isArray(cv.experience)) {
        cv.experience.forEach((exp: any) => {
          const combinedExpText = normalizeText(
            `${exp.position || ''} ${exp.company || ''} ${exp.description || ''}`
          );
          const matchedTerms = searchTerms.filter((term) => combinedExpText.includes(term));
          if (matchedTerms.length > 0) {
            evidence.push({
              source: 'cv_experience',
              title: `Pengalaman: ${exp.position || 'Staf'} di ${exp.company || 'Perusahaan'}${cv.title ? ` [${cv.title}]` : ''}`,
              detail: exp.description
                ? `Deskripsi pekerjaan mencerminkan aktivitas: "${exp.description.slice(0, 110)}..."`
                : `Menjalankan tanggung jawab relevan selama periode ${exp.startDate || ''} s/d ${exp.endDate || 'Sekarang'}.`,
            });
          }
        });
      }

      // Proyek / Portofolio di CV
      if (Array.isArray(cv.projects)) {
        cv.projects.forEach((proj: any) => {
          const combinedProjText = normalizeText(
            `${proj.name || ''} ${proj.role || ''} ${proj.description || ''}`
          );
          if (searchTerms.some((term) => combinedProjText.includes(term))) {
            evidence.push({
              source: 'cv_project',
              title: `Proyek: ${proj.name || 'Proyek Karier'}${cv.title ? ` [${cv.title}]` : ''}`,
              detail: proj.description
                ? `Penerapan kemampuan praktis: "${proj.description.slice(0, 110)}..."`
                : 'Mendokumentasikan hasil implementasi proyek yang relevan.',
            });
          }
        });
      }

      // Pendidikan di CV
      if (Array.isArray(cv.education)) {
        cv.education.forEach((edu: any) => {
          const combinedEduText = normalizeText(`${edu.degree || ''} ${edu.major || ''} ${edu.school || ''}`);
          if (searchTerms.some((term) => combinedEduText.includes(term))) {
            evidence.push({
              source: 'cv_education',
              title: `Pendidikan: ${edu.major || edu.degree || 'Studi'} (${edu.school || 'Institusi'})`,
              detail: 'Latar belakang pendidikan formal yang menopang fondasi kompetensi ini.',
            });
          }
        });
      }
    });
  }

  // 2. Cek dari Profil Utama User
  if (userProfile) {
    if (Array.isArray(userProfile.skills)) {
      userProfile.skills.forEach((sk: string) => {
        const normSkill = normalizeText(sk);
        if (searchTerms.some((term) => normSkill.includes(term))) {
          if (!evidence.some((e) => e.title.includes(sk))) {
            evidence.push({
              source: 'profile',
              title: `Profil Keahlian: ${sk}`,
              detail: 'Keahlian terverifikasi tersimpan pada profil akun pengguna.',
            });
          }
        }
      });
    }

    if (userProfile.major) {
      const normMajor = normalizeText(userProfile.major);
      if (searchTerms.some((term) => normMajor.includes(term))) {
        evidence.push({
          source: 'profile',
          title: `Jurusan Profil: ${userProfile.major}`,
          detail: 'Bidang studi utama yang memiliki korelasi kuat dengan kompetensi ini.',
        });
      }
    }
  }

  return evidence.slice(0, 4);
}

/**
 * Menghitung estimasi skor kompetensi pengguna berdasarkan bukti dan pengalamannya
 */
function scoreUserCompetency(
  comp: CompetencyCluster,
  evidence: EvidenceItem[],
  yearsOfExp: number
): { score: number; confidence: 'Tinggi' | 'Sedang' | 'Terbatas' } {
  let rawScore = 35;

  evidence.forEach((ev) => {
    switch (ev.source) {
      case 'cv_experience':
        rawScore += 22;
        break;
      case 'cv_project':
        rawScore += 18;
        break;
      case 'cv_skill':
        rawScore += 12;
        break;
      case 'profile':
        rawScore += 10;
        break;
      case 'cv_education':
        rawScore += 8;
        break;
      default:
        rawScore += 5;
    }
  });

  if (yearsOfExp > 0) {
    rawScore += Math.min(12, yearsOfExp * 4);
  }

  const finalScore = Math.min(96, Math.max(30, Math.round(rawScore)));

  let confidence: 'Tinggi' | 'Sedang' | 'Terbatas' = 'Terbatas';
  if (evidence.length >= 3 || (evidence.length >= 2 && evidence.some((e) => e.source === 'cv_experience'))) {
    confidence = 'Tinggi';
  } else if (evidence.length >= 1) {
    confidence = 'Sedang';
  }

  return { score: finalScore, confidence };
}

/**
 * Label semantik kecocokan role
 */
function getRoleFitSemanticLabel(score: number): string {
  if (score >= 82) return 'Sangat Cocok';
  if (score >= 70) return 'Potensial dengan Sedikit Optimasi';
  if (score >= 55) return 'Perlu Penguatan Kompetensi Kunci';
  return 'Fondasi Masih Perlu Dibangun';
}

/**
 * Rekomendasi tindakan kesenjangan skill berdasarkan kategori role
 */
function generateGapRecommendation(
  comp: CompetencyCluster,
  currentScore: number,
  requiredScore: number
): { whyItMatters: string; suggestedAction: string } {
  const gap = requiredScore - currentScore;

  if (comp.id === 'office-software') {
    return {
      whyItMatters: 'Hampir seluruh loker administrasi mensyaratkan kemampuan olah data cepat dengan Excel atau Google Sheets.',
      suggestedAction: 'Pelajari formula esensial (VLOOKUP, Pivot Table) dan cantumkan bukti projek mini rekap data di CV.',
    };
  }

  if (comp.id === 'data-entry') {
    return {
      whyItMatters: 'Akurasi pembukuan dan pengarsipan menjadi tolak ukur utama kelayakan staf operasional baru.',
      suggestedAction: 'Tuliskan pengalaman organisasi atau kepanitiaan di CV yang melibatkan pendataan berkas dan presensi.',
    };
  }

  if (comp.id === 'empathy-comm') {
    return {
      whyItMatters: 'Komunikasi santun dan ketahanan emosional adalah penilaian pertama perekrut saat menyaring staf customer service.',
      suggestedAction: 'Latih simulasi penanganan pelanggan komplain dan sertakan soft skills komunikasi aktif di ringkasan profil CV.',
    };
  }

  if (comp.id === 'frontend-basics' || comp.id === 'javascript-typescript') {
    return {
      whyItMatters: 'Fondasi kode modern diuji langsung pada tahapan tes teknis penyaringan web developer.',
      suggestedAction: 'Bangun 1 website portofolio interaktif responsif, lalu sertakan tautan repository GitHub aktif di CV Anda.',
    };
  }

  if (comp.id === 'content-creation' || comp.id === 'copywriting') {
    return {
      whyItMatters: 'Perekrut media sosial selalu meminta portofolio atau akun referensi untuk melihat gaya penulisan dan visual Anda.',
      suggestedAction: 'Kumpulkan 3 contoh konten terbaik (caption dan desain) dalam dokumen portofolio ringkas 1 halaman.',
    };
  }

  if (gap >= 15) {
    return {
      whyItMatters: `Kompetensi ${comp.name} sering menjadi pembeda utama antara pelamar yang lolos ke tahap wawancara dan yang ditolak.`,
      suggestedAction: `Fokuskan 1-2 minggu ke depan untuk melengkapi studi kasus nyata terkait ${comp.name} di bagian portofolio atau proyek CV.`,
    };
  }

  return {
    whyItMatters: `Kompetensi ${comp.name} sudah berada di jalur yang baik, namun membutuhkan sedikit penguatan bukti terukur.`,
    suggestedAction: `Perjelas kata kunci ${comp.aliases[0] || comp.name} di bagian riwayat pengalaman kerja pada CV Anda.`,
  };
}

/**
 * Menghitung Analisis Lengkap Career Intelligence untuk seorang Pengguna
 */
export function evaluateCareerIntelligence(
  userProfile: any,
  cvs: any[],
  applications: any[],
  selectedRoleId?: string,
  dynamicRole?: RoleTaxonomyItem,
  selectedCvId: string = 'all',
  userDefinedRoles?: RoleTaxonomyItem[]
): CareerAssessment {
  // Hanya gunakan role yang relevan dengan pengguna (tidak menjejalkan seluruh catalog acuan)
  let allRoles: RoleTaxonomyItem[] = [];

  if (Array.isArray(userDefinedRoles) && userDefinedRoles.length > 0) {
    allRoles = [...userDefinedRoles];
  } else if (dynamicRole) {
    allRoles = [dynamicRole];
  } else if (userProfile?.target_job) {
    const matched = ROLE_TAXONOMY.find(
      (r) =>
        normalizeText(r.title).includes(normalizeText(userProfile.target_job)) ||
        normalizeText(userProfile.target_job).includes(normalizeText(r.title))
    );
    if (matched) {
      allRoles = [matched];
    }
  }

  if (dynamicRole && !allRoles.some((r) => r.id === dynamicRole.id)) {
    allRoles.unshift(dynamicRole);
  }

  // Jika masih kosong (user baru tanpa data CV/profil sama sekali), berikan 1 acuan default
  if (allRoles.length === 0) {
    allRoles = [ROLE_TAXONOMY[0]];
  }

  const matchedRole = dynamicRole || (selectedRoleId
    ? allRoles.find((r) => r.id === selectedRoleId || r.title.toLowerCase() === selectedRoleId.toLowerCase())
    : userProfile?.target_job
    ? allRoles.find(
        (r) =>
          normalizeText(r.title).includes(normalizeText(userProfile.target_job)) ||
          normalizeText(userProfile.target_job).includes(normalizeText(r.title))
      )
    : undefined);

  const targetRole = matchedRole || allRoles[0];
  const yearsOfExp = userProfile?.experience_year || 0;

  const hasCv = Array.isArray(cvs) && cvs.length > 0;
  const hasSkills = Boolean(userProfile?.skills && userProfile.skills.length > 0);
  const isBenchmarkMode = !hasCv && !hasSkills;

  const availableCvs = Array.isArray(cvs)
    ? cvs.map((c) => ({
        id: c.id,
        title: c.title || 'CV Tanpa Judul',
        targetPosition: c.target_position || c.targetPosition || '',
      }))
    : [];

  // Filter basis CV jika user memilih evaluasi dokumen spesifik (mencegah bias cross-contamination antar role)
  const targetCv = selectedCvId !== 'all' ? cvs.find((c) => c.id === selectedCvId) : null;
  const activeEvaluatedCvs = targetCv ? [targetCv] : cvs;
  const selectedCvScope = targetCv
    ? {
        id: targetCv.id,
        title: targetCv.title || 'Dokumen CV',
        targetPosition: targetCv.target_position || targetCv.targetPosition,
      }
    : {
        id: 'all',
        title: 'Semua Dokumen (Portofolio Holistik)',
      };

  let totalWeightedScore = 0;
  let totalWeights = 0;

  const competencyResults: CompetencyScoreResult[] = targetRole.competencies.map((comp) => {
    const evidence = isBenchmarkMode
      ? [
          {
            source: 'profile' as const,
            title: `Standar Industri: ${comp.name}`,
            detail: `Posisi ${targetRole.title} mensyaratkan penguasaan standar nilai ${comp.requiredScore}. Susun CV Anda untuk mengukur skor riil.`,
          },
        ]
      : extractEvidenceForCompetency(comp, userProfile, activeEvaluatedCvs);

    const { score, confidence } = isBenchmarkMode
      ? { score: 0, confidence: 'Terbatas' as const }
      : scoreUserCompetency(comp, evidence, yearsOfExp);

    const gap = score - comp.requiredScore;
    const { whyItMatters, suggestedAction } = generateGapRecommendation(comp, score, comp.requiredScore);

    totalWeightedScore += score * comp.weight;
    totalWeights += comp.weight;

    return {
      id: comp.id,
      name: comp.name,
      currentScore: score,
      requiredScore: comp.requiredScore,
      gap,
      weight: comp.weight,
      confidence,
      evidence,
      whyItMatters,
      suggestedAction,
    };
  });

  const calculatedFitScore = Math.min(98, Math.max(25, Math.round(totalWeightedScore / totalWeights)));
  const roleFitScore = isBenchmarkMode ? 0 : calculatedFitScore;
  const roleFitLabel = isBenchmarkMode
    ? 'Standar Industri (Belum Ada Data CV)'
    : getRoleFitSemanticLabel(roleFitScore);

  const hasExperience = Boolean(yearsOfExp > 0 || (hasCv && cvs.some((c) => c.experience && c.experience.length > 0)));
  const hasEducation = Boolean(userProfile?.education || userProfile?.major);
  const trackedJobsCount = Array.isArray(applications) ? applications.length : 0;

  let completenessScore = 10;
  if (hasCv) completenessScore += 35;
  if (hasSkills) completenessScore += 20;
  if (hasExperience) completenessScore += 15;
  if (hasEducation) completenessScore += 10;
  if (trackedJobsCount > 0) completenessScore += 10;

  const readinessScore = isBenchmarkMode
    ? 0
    : Math.min(100, Math.round(completenessScore * 0.4 + roleFitScore * 0.6));

  const topStrengths = [...competencyResults]
    .sort((a, b) => b.currentScore - a.currentScore)
    .slice(0, 3);

  const sortedGaps = [...competencyResults]
    .filter((c) => c.gap < 0)
    .sort((a, b) => a.gap - b.gap);

  const priorityGaps: SkillGapItem[] = (sortedGaps.length > 0 ? sortedGaps : competencyResults.slice(0, 3)).map(
    (c, index) => {
      let priority: 'Tinggi' | 'Sedang' | 'Nilai Tambah' = 'Nilai Tambah';
      let priorityLabel = 'Peningkatan Opsional';

      if (c.gap <= -15 || index === 0) {
        priority = 'Tinggi';
        priorityLabel = 'Prioritas Kritis';
      } else if (c.gap <= -8 || index === 1) {
        priority = 'Sedang';
        priorityLabel = 'Penting Ditingkatkan';
      }

      return {
        competencyId: c.id,
        name: c.name,
        currentScore: c.currentScore,
        requiredScore: c.requiredScore,
        priority,
        priorityLabel,
        whyItMatters: c.whyItMatters,
        suggestedAction: c.suggestedAction,
        actionType: c.currentScore < 60 ? 'learn' : 'cv_tailor',
      };
    }
  );

  // Tentukan alternatif role arah karier yang relevan:
  // 1. Role lain yang dimiliki pengguna dari CV / Tracker
  // 2. Role transisi resmi yang tercantum di targetRole.commonTransitions
  const transitionTargetIds = (targetRole.commonTransitions || []).map((t) => t.targetRoleId);

  const relevantAlternativeRoles: RoleTaxonomyItem[] = [];

  // Prioritas 1: Target role lain milik user
  allRoles.forEach((r) => {
    if (r.id !== targetRole.id && !relevantAlternativeRoles.some((ar) => ar.id === r.id)) {
      relevantAlternativeRoles.push(r);
    }
  });

  // Prioritas 2: Role yang ada di commonTransitions resmi
  ROLE_TAXONOMY.forEach((r) => {
    if (
      r.id !== targetRole.id &&
      transitionTargetIds.includes(r.id) &&
      !relevantAlternativeRoles.some((ar) => ar.id === r.id)
    ) {
      relevantAlternativeRoles.push(r);
    }
  });

  const careerDirections: CareerDirectionItem[] = relevantAlternativeRoles.map((altRole) => {
    let altTotalScore = 0;
    let altTotalWeights = 0;
    const transferable: string[] = [];
    const missing: string[] = [];

    altRole.competencies.forEach((altComp) => {
      if (isBenchmarkMode) {
        missing.push(altComp.name);
      } else {
        const ev = extractEvidenceForCompetency(altComp, userProfile, activeEvaluatedCvs);
        const { score } = scoreUserCompetency(altComp, ev, yearsOfExp);
        altTotalScore += score * altComp.weight;
        altTotalWeights += altComp.weight;

        if (score >= altComp.requiredScore - 5) {
          transferable.push(altComp.name);
        } else {
          missing.push(altComp.name);
        }
      }
    });

    const altFitScore = isBenchmarkMode
      ? 25
      : Math.min(95, Math.max(30, Math.round(altTotalScore / altTotalWeights)));
    const transitionData = targetRole.commonTransitions.find((t) => t.targetRoleId === altRole.id);
    const effort = transitionData?.effort || (altFitScore >= 75 ? 'Rendah' : altFitScore >= 60 ? 'Sedang' : 'Signifikan');
    const path = transitionData?.path || [targetRole.title, `Associate ${altRole.title}`, altRole.title];

    return {
      roleId: altRole.id,
      title: altRole.title,
      category: altRole.categoryLabel,
      fitScore: altFitScore,
      fitLabel: getRoleFitSemanticLabel(altFitScore),
      transitionEffort: effort,
      transferableSkills: transferable.slice(0, 3),
      missingCompetencies: missing.slice(0, 2),
      recommendedNextStep:
        missing.length > 0
          ? `Perkuat pemahaman dasar ${missing[0]} untuk mempermudah transisi karier.`
          : `Profil Anda sudah sangat kompetitif untuk mulai melamar posisi ${altRole.title}.`,
      careerPath: path,
    };
  }).sort((a, b) => b.fitScore - a.fitScore);

  let nextMove = {
    title: `Susun CV Pertama Anda untuk Posisi ${targetRole.title}`,
    description: `Gunakan standar industri ini sebagai panduan. Cantumkan keahlian ${targetRole.competencies.slice(0, 2).map((c) => c.name).join(' & ')} pada dokumen CV Anda.`,
    actionUrl: `/cv`,
    actionLabel: `Buat CV ${targetRole.title}`,
    secondaryActionUrl: 'https://loker.employr.id',
    secondaryActionLabel: 'Lihat Lowongan Terbuka',
  };

  if (!isBenchmarkMode) {
    const topGap = priorityGaps[0];
    if (topGap && topGap.currentScore < topGap.requiredScore) {
      const scopeNotice = targetCv ? ` pada dokumen "${targetCv.title}"` : '';
      nextMove = {
        title: `Tingkatkan ${topGap.name}${scopeNotice}`,
        description: `Kesenjangan nilai saat ini (${topGap.currentScore} dari target ${topGap.requiredScore}) perlu ditutup untuk meningkatkan daya saing di posisi ${targetRole.title}. ${topGap.suggestedAction}`,
        actionUrl: targetCv ? `/cv` : '/cv',
        actionLabel: targetCv ? `Sesuaikan ${targetCv.title}` : 'Sesuaikan CV Saya',
        secondaryActionUrl: 'https://loker.employr.id',
        secondaryActionLabel: 'Cari Lowongan Serupa',
      };
    } else {
      nextMove = {
        title: `Dokumen ${targetCv ? `"${targetCv.title}"` : 'Karier Anda'} Sangat Kompetitif untuk Posisi ${targetRole.title}`,
        description: `Kecocokan role mencapai ${roleFitScore}%. Manfaatkan momentum ini untuk mengirim lamaran ke lowongan kerja yang relevan.`,
        actionUrl: 'https://loker.employr.id',
        actionLabel: 'Jelajahi Lowongan Kerja',
        secondaryActionUrl: '/tracker',
        secondaryActionLabel: 'Buka Tracker Lamaran',
      };
    }
  }

  return {
    targetRole,
    availableRoles: allRoles.map((r) => ({
      id: r.id,
      title: r.title,
      categoryLabel: r.categoryLabel,
    })),
    roleFitScore,
    roleFitLabel,
    readinessScore,
    competencies: competencyResults,
    topStrengths,
    priorityGaps,
    careerDirections,
    nextBestMove: nextMove,
    profileCompleteness: {
      percentage: completenessScore,
      hasCv,
      cvCount: Array.isArray(cvs) ? cvs.length : 0,
      hasSkills,
      hasExperience,
      hasEducation,
      trackedJobsCount,
    },
    lastEvaluatedAt: new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    isBenchmarkMode,
    selectedCvScope,
    availableCvs,
  };
}
