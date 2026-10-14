/**
 * Career Direction & Diagnostic Engine v2
 * Menganalisis kecocokan profil kandidat terhadap peran karier berdasarkan
 * skill match ratio yang jujur, mengidentifikasi kekuatan & gap per-user,
 * dan merekomendasikan jalur transisi alternatif yang realistis.
 */

export interface CareerPathOption {
  role: string;
  fitScore: number;
  isPrimaryTarget?: boolean;
  isRealisticTransition?: boolean;
  isCareerSwitch?: boolean;
  isLearned?: boolean;
  isGatedBlocked?: boolean;
  entryCount?: number;
  tagline: string;
  matchedSkills: string[];
  gapSkills: string[];
  isSemantic?: boolean;
  semanticSimilarity?: number;
}

export interface DynamicRoleBlueprint {
  role_name: string;
  category?: string;
  top_essential_skills: string[];
  top_nicetohave_skills: string[];
  entry_count?: number;
  details?: {
    role_id?: string;
    target_education?: string | null;
    experience?: string | null;
    market_aliases_and_slang?: string[];
    responsibilities?: string[];
    tools_and_platforms?: string[];
    local_context_requirements?: string[];
    transferable_experience_bridges?: Array<{
      informal_experience: string;
      cv_bullets: string[];
    }>;
  } | null;
}

export interface MentorNarrative {
  headline: string;
  backgroundStory: string;
  transferableInsight: string;
  nextStepAction: string;
  fullNarrative: string;
}

export interface CareerDiagnosisResult {
  aimingChoice: 'know_role' | 'exploring' | 'open_opportunities';
  primaryRole: string;
  primaryFitScore: number;
  topStrength: string;
  topGap: string;
  gapSkillsList?: string[];
  matchedSkillsList?: string[];
  isUnknownRole: boolean;
  isCareerSwitch?: boolean;
  isLearnedRole?: boolean;
  learnedCount?: number;
  unknownRoleMessage: string;
  realisticTransition: {
    role: string;
    fitScore: number;
    reason: string;
  };
  suggestedPaths: CareerPathOption[];
  isSemantic?: boolean;
  mentorNarrative?: MentorNarrative;
  transferableBridges?: Array<{
    informal_experience: string;
    cv_bullets: string[];
  }>;
  toolsAndPlatforms?: string[];
  localRequirements?: string[];
}

// ─── Role Blueprint Database ────────────────────────────────────────

export interface RoleBlueprint {
  title: string;
  category: 'tech' | 'product' | 'marketing' | 'operations' | 'design' | 'business' | 'finance' | 'fnb_retail' | 'education' | 'creative' | 'other';
  essentialSkills: string[];
  niceToHaveSkills: string[];
  relatedTransitionalRoles: string[];
  typicalStrengths: string[];
  typicalGaps: string[];
  transferableBridges?: Array<{
    informal_experience: string;
    cv_bullets: string[];
  }>;
  toolsAndPlatforms?: string[];
  localRequirements?: string[];
  isLearned?: boolean;
  entryCount?: number;
}

export const ROLE_BLUEPRINTS: Record<string, RoleBlueprint> = {
  // ─── Tech & Digital ─────────────────────────────────────────────
  'Frontend Developer': {
    title: 'Frontend Developer',
    category: 'tech',
    essentialSkills: ['HTML & CSS', 'JavaScript', 'TypeScript', 'React', 'Tailwind CSS', 'Git & GitHub'],
    niceToHaveSkills: ['Next.js', 'State Management', 'REST API Integration', 'Responsive Design', 'Web Performance'],
    relatedTransitionalRoles: ['UI/UX Designer', 'Fullstack Developer', 'Quality Assurance'],
    typicalStrengths: ['Penerjemahan Desain UI ke Kode Interaktif', 'Implementasi Komponen Reusable', 'Kepekaan Responsivitas Layar'],
    typicalGaps: ['Automated Testing (Cypress/Playwright)', 'State Architecture Skala Besar', 'Backend Integration Mendalam'],
  },
  'Backend Developer': {
    title: 'Backend Developer',
    category: 'tech',
    essentialSkills: ['Node.js', 'PostgreSQL', 'SQL', 'REST API Design', 'Database Modeling', 'Git'],
    niceToHaveSkills: ['Docker', 'Authentication & Security', 'Redis', 'Cloud Basics', 'TypeScript'],
    relatedTransitionalRoles: ['Fullstack Developer', 'Data Analyst', 'Quality Assurance'],
    typicalStrengths: ['Pemodelan Basis Data Relasional', 'Perancangan Logika API', 'Pencegahan Kesalahan Data'],
    typicalGaps: ['Microservices Orchestration', 'Query Profiling Tingkat Lanjut', 'CI/CD Pipeline'],
  },
  'Fullstack Developer': {
    title: 'Fullstack Developer',
    category: 'tech',
    essentialSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'Git'],
    niceToHaveSkills: ['Next.js', 'REST API Design', 'Docker', 'Tailwind CSS', 'Cloud Basics'],
    relatedTransitionalRoles: ['Frontend Developer', 'Backend Developer', 'Product Manager'],
    typicalStrengths: ['Pemahaman End-to-End Aplikasi Web', 'Fleksibilitas Frontend & Backend', 'Prototyping Cepat'],
    typicalGaps: ['Spesialisasi Mendalam di Satu Sisi', 'DevOps & Infrastructure', 'System Design Skala Besar'],
  },
  'Data Analyst': {
    title: 'Data Analyst',
    category: 'tech',
    essentialSkills: ['Excel & Spreadsheet', 'SQL', 'Data Visualization', 'Problem Solving', 'Data Cleaning'],
    niceToHaveSkills: ['Python', 'Tableau', 'PowerBI', 'Statistika Dasar', 'Business Intelligence'],
    relatedTransitionalRoles: ['Business Analyst', 'Growth Marketing', 'Staff Finance'],
    typicalStrengths: ['Pengolahan Spreadsheet Kompleks', 'Visualisasi Data yang Bersih', 'Ketelitian Ekstraksi Data'],
    typicalGaps: ['Predictive Statistical Modeling', 'Data Pipeline Otomatis', 'Programming (Python/R)'],
  },
  'Quality Assurance': {
    title: 'Quality Assurance',
    category: 'tech',
    essentialSkills: ['Manual Testing', 'Test Case Writing', 'Bug Reporting', 'Attention to Detail', 'Problem Solving'],
    niceToHaveSkills: ['Automation Testing', 'Selenium', 'API Testing', 'Postman', 'SQL', 'Agile / Scrum'],
    relatedTransitionalRoles: ['Frontend Developer', 'Backend Developer', 'Project Coordinator'],
    typicalStrengths: ['Ketelitian Menemukan Bug & Edge Case', 'Dokumentasi Test Case Sistematis', 'Pemahaman Alur Bisnis Aplikasi'],
    typicalGaps: ['Automation Framework (Cypress/Selenium)', 'Performance & Load Testing', 'CI/CD Integration'],
  },
  'Teknisi Komputer & Jaringan': {
    title: 'Teknisi Komputer & Jaringan',
    category: 'tech',
    essentialSkills: ['Troubleshooting Hardware', 'Jaringan Komputer', 'Instalasi OS', 'Networking Dasar', 'Customer Service'],
    niceToHaveSkills: ['Linux', 'Mikrotik', 'CCTV Installation', 'Server Administration', 'Active Directory'],
    relatedTransitionalRoles: ['IT Support', 'Admin Staff', 'Quality Assurance'],
    typicalStrengths: ['Diagnosis Masalah Hardware & Software', 'Instalasi & Konfigurasi Jaringan', 'Pelayanan Pengguna Langsung'],
    typicalGaps: ['Cloud Infrastructure', 'Scripting & Otomasi', 'Cybersecurity Dasar'],
  },
  'IT Support': {
    title: 'IT Support',
    category: 'tech',
    essentialSkills: ['Troubleshooting', 'Customer Service', 'Microsoft Office', 'Networking Dasar', 'Instalasi Software'],
    niceToHaveSkills: ['Active Directory', 'Ticketing System', 'Remote Desktop', 'Linux Dasar', 'Email Server'],
    relatedTransitionalRoles: ['Teknisi Komputer & Jaringan', 'Admin Staff', 'Quality Assurance'],
    typicalStrengths: ['Respons Cepat Terhadap Masalah Teknis', 'Komunikasi dengan Non-Teknis', 'Manajemen Inventaris IT'],
    typicalGaps: ['Scripting & Automation', 'Cloud Administration', 'Network Security'],
  },

  // ─── Design & Creative ─────────────────────────────────────────
  'UI/UX Designer': {
    title: 'UI/UX Designer',
    category: 'design',
    essentialSkills: ['Figma', 'Wireframing', 'Prototyping', 'User Research', 'Design System', 'Usability Testing'],
    niceToHaveSkills: ['Interaction Design', 'Information Architecture', 'Micro-copywriting', 'HTML & CSS'],
    relatedTransitionalRoles: ['Graphic Designer', 'Frontend Developer', 'Product Manager'],
    typicalStrengths: ['Penyusunan User Flow Intuitif', 'Penguasaan Komponen Desain', 'Empati Masalah Pengguna'],
    typicalGaps: ['Validasi Desain Kuantitatif (A/B Testing)', 'Design Handoff Kompleks', 'Motion Design'],
  },
  'Graphic Designer': {
    title: 'Graphic Designer',
    category: 'design',
    essentialSkills: ['Photoshop', 'Illustrator', 'Desain Visual', 'Tipografi', 'Layout & Komposisi', 'Branding'],
    niceToHaveSkills: ['Figma', 'CorelDRAW', 'Canva', 'Print Design', 'Packaging Design'],
    relatedTransitionalRoles: ['UI/UX Designer', 'Video Editor & Content Creator', 'Social Media Specialist'],
    typicalStrengths: ['Kreativitas Visual & Estetika Warna', 'Pembuatan Materi Promosi', 'Konsistensi Brand Identity'],
    typicalGaps: ['User Experience Research', '3D Design & Motion Graphics', 'Web/App Design Interaktif'],
  },
  'Video Editor & Content Creator': {
    title: 'Video Editor & Content Creator',
    category: 'creative',
    essentialSkills: ['Video Editing', 'Adobe Premiere', 'Content Planning', 'Storytelling', 'Social Media'],
    niceToHaveSkills: ['After Effects', 'DaVinci Resolve', 'Photography', 'Copywriting', 'YouTube SEO', 'CapCut'],
    relatedTransitionalRoles: ['Graphic Designer', 'Social Media Specialist', 'Fotografer & Videografer'],
    typicalStrengths: ['Penyuntingan Video Menarik & Dinamis', 'Pemahaman Algoritma Platform', 'Perencanaan Konten Konsisten'],
    typicalGaps: ['Motion Graphics Kompleks', 'Color Grading Profesional', 'Strategi Monetisasi Konten'],
  },
  'Fotografer & Videografer': {
    title: 'Fotografer & Videografer',
    category: 'creative',
    essentialSkills: ['Photography', 'Videography', 'Lighting', 'Komposisi Visual', 'Photo Editing'],
    niceToHaveSkills: ['Adobe Lightroom', 'Video Editing', 'Drone Operation', 'Event Coverage', 'Product Photography'],
    relatedTransitionalRoles: ['Video Editor & Content Creator', 'Graphic Designer', 'Social Media Specialist'],
    typicalStrengths: ['Komposisi & Pencahayaan Foto/Video', 'Dokumentasi Acara Profesional', 'Editing Foto Konsisten'],
    typicalGaps: ['Cinematography Sinematik', 'Post-Production Tingkat Lanjut', 'Manajemen Bisnis Freelance'],
  },
  'Fashion Designer': {
    title: 'Fashion Designer',
    category: 'creative',
    essentialSkills: ['Desain Fashion', 'Pattern Making', 'Menjahit', 'Ilustrasi Fashion', 'Tren Mode', 'Material Knowledge'],
    niceToHaveSkills: ['Adobe Illustrator', 'Draping', 'Textile Design', 'Branding', 'Fashion Photography'],
    relatedTransitionalRoles: ['Graphic Designer', 'Visual Merchandiser', 'Content Writer'],
    typicalStrengths: ['Kreativitas Desain Busana & Aksesori', 'Pemahaman Tren Mode Terkini', 'Skill Produksi (Pola & Jahit)'],
    typicalGaps: ['Fashion Business Management', 'Digital Fashion (CLO3D)', 'Supply Chain & Sourcing'],
  },
  'Arsitek': {
    title: 'Arsitek',
    category: 'design',
    essentialSkills: ['AutoCAD', 'SketchUp', 'Gambar Kerja & Detail Arsitektur', '3D Modeling & Rendering', 'Building Codes & SNI', 'Perancangan Konsep Arsitektur'],
    niceToHaveSkills: ['Revit / BIM', 'Lumion / Enscape', 'RAB & Estimasi Biaya', 'Site Supervision', 'Photoshop'],
    relatedTransitionalRoles: ['Drafter Arsitektur', 'Desainer Interior', 'Teknik Sipil / Pengawas Proyek Lapangan'],
    typicalStrengths: ['Perancangan Konsep & Tata Ruang Arsitektural', 'Penyusunan Gambar Kerja Detail', 'Visualisasi 3D Rendering Fotorealistis'],
    typicalGaps: ['Building Information Modeling (BIM) Lanjutan', 'Perizinan Bangunan Gedung (PBG)', 'Manajemen Kontrak Konstruksi'],
  },
  'Drafter Arsitektur': {
    title: 'Drafter Arsitektur',
    category: 'design',
    essentialSkills: ['AutoCAD', 'Gambar Kerja Arsitektur', 'Detail Konstruksi', 'SketchUp', 'Membaca Gambar Teknik'],
    niceToHaveSkills: ['Revit', 'RAB Dasar', '3D Rendering', 'Estimasi Material', 'Photoshop'],
    relatedTransitionalRoles: ['Arsitek', 'Desainer Interior', 'Teknik Sipil / Pengawas Proyek Lapangan'],
    typicalStrengths: ['Presisi Pembuatan Gambar Kerja CAD 2D/3D', 'Kecepatan Modeling Gambar Teknik', 'Ketelitian Notasi & Standar Arsitektur'],
    typicalGaps: ['Perancangan Konseptual Desain', 'Perhitungan Struktur & Mekanikal', 'Presentasi Klien Komprehensif'],
  },
  'Desainer Interior': {
    title: 'Desainer Interior',
    category: 'design',
    essentialSkills: ['SketchUp', '3D Rendering (V-Ray/Enscape)', 'Space Planning', 'Material & Finishing', 'AutoCAD'],
    niceToHaveSkills: ['Pilihan Furnitur & Lighting', 'RAB Interior', 'Photoshop', 'Project Management'],
    relatedTransitionalRoles: ['Arsitek', 'Drafter Arsitektur', 'Visual Merchandiser'],
    typicalStrengths: ['Optimalisasi Estetika Tata Ruang Interior', 'Rendering 3D Fotorealistis', 'Pemilihan Skema Warna & Material'],
    typicalGaps: ['Detail Konstruksi Struktural', 'Manajemen Vendor Interior Skala Besar', 'Building Codes Bangunan Bertingkat'],
  },
  'Teknik Sipil / Pengawas Proyek Lapangan': {
    title: 'Teknik Sipil / Pengawas Proyek Lapangan',
    category: 'operations',
    essentialSkills: ['Membaca Gambar Teknik', 'Pengawasan Lapangan', 'RAB & Estimasi Biaya', 'Manajemen K3 Konstruksi', 'Time Management'],
    niceToHaveSkills: ['AutoCAD', 'Microsoft Project', 'Quality Control Material', 'Pelaporan Harian Proyek'],
    relatedTransitionalRoles: ['Project Coordinator', 'Drafter Arsitektur', 'Arsitek'],
    typicalStrengths: ['Pengawasan Kualitas Konstruksi Lapangan', 'Penerjemahan Gambar ke Realisasi Fisik', 'Koordinasi Mandor & Pekerja'],
    typicalGaps: ['Perhitungan Struktur Lanjutan (ETABS/SAP2000)', 'Contract Law & Klaim Konstruksi', 'Metode Konstruksi Pracetak'],
  },

  // ─── Marketing & Communication ────────────────────────────────
  'Product Marketing': {
    title: 'Product Marketing',
    category: 'marketing',
    essentialSkills: ['Go-to-Market Strategy', 'User Persona', 'Communication', 'Content Strategy', 'Copywriting', 'Competitive Analysis'],
    niceToHaveSkills: ['Customer Journey', 'Social Media', 'Data Analysis', 'Email Marketing'],
    relatedTransitionalRoles: ['Digital Marketer', 'Content Writer', 'Product Manager'],
    typicalStrengths: ['Penyampaian Value Proposisi Produk', 'Riset Kompetitor & Tren Pasar', 'Komunikasi Multisaluran'],
    typicalGaps: ['Paid Ads Attribution Modeling', 'Automated Lifecycle Marketing', 'Product Analytics'],
  },
  'Growth Marketing': {
    title: 'Growth Marketing',
    category: 'marketing',
    essentialSkills: ['Performance Marketing', 'Data Analysis', 'Conversion Rate Optimization', 'Funnel Optimization', 'Copywriting'],
    niceToHaveSkills: ['Google Analytics', 'SQL', 'A/B Testing', 'Social Media Ads', 'Google Ads'],
    relatedTransitionalRoles: ['Digital Marketer', 'Data Analyst', 'Product Marketing'],
    typicalStrengths: ['Eksperimentasi Pertumbuhan Pengguna', 'Analisis Metrik Funnel', 'Copywriting Berorientasi Aksi'],
    typicalGaps: ['Budget Allocation Skala Besar', 'Tracking Event Kompleks', 'Statistical Significance Testing'],
  },
  'Digital Marketer': {
    title: 'Digital Marketer',
    category: 'marketing',
    essentialSkills: ['Social Media Marketing', 'Google Ads', 'Facebook Ads', 'Content Planning', 'Data Analysis'],
    niceToHaveSkills: ['SEO', 'Email Marketing', 'Google Analytics', 'Copywriting', 'Canva'],
    relatedTransitionalRoles: ['Social Media Specialist', 'Growth Marketing', 'Content Writer'],
    typicalStrengths: ['Eksekusi Kampanye Multi-Platform', 'Analisis Performa Iklan', 'Targeting Audiens'],
    typicalGaps: ['Marketing Automation Tools', 'Advanced Analytics & Attribution', 'Brand Strategy Jangka Panjang'],
  },
  'Social Media Specialist': {
    title: 'Social Media Specialist',
    category: 'marketing',
    essentialSkills: ['Social Media Management', 'Content Planning', 'Copywriting', 'Canva', 'Community Management'],
    niceToHaveSkills: ['Video Editing', 'Photography', 'Facebook Ads', 'Instagram Ads', 'TikTok Ads', 'Analytics'],
    relatedTransitionalRoles: ['Digital Marketer', 'Content Writer', 'Video Editor & Content Creator'],
    typicalStrengths: ['Pengelolaan Konten Multi-Platform', 'Engagement & Community Building', 'Pemahaman Tren & Algoritma'],
    typicalGaps: ['Paid Social Advertising Mendalam', 'Influencer Campaign Management', 'Social Listening Tools'],
  },
  'Content Writer': {
    title: 'Content Writer',
    category: 'marketing',
    essentialSkills: ['Copywriting', 'Penulisan Kreatif', 'Riset Topik', 'SEO Writing', 'Editing & Proofreading'],
    niceToHaveSkills: ['Content Strategy', 'Social Media', 'WordPress', 'Email Marketing', 'Bahasa Inggris'],
    relatedTransitionalRoles: ['Social Media Specialist', 'Digital Marketer', 'Product Marketing'],
    typicalStrengths: ['Penulisan Konten Menarik & Informatif', 'Riset Topik Mendalam', 'Konsistensi Tone & Voice'],
    typicalGaps: ['SEO Technical (Schema, Core Web Vitals)', 'Content Performance Analytics', 'Video Script Writing'],
  },
  'SEO Specialist': {
    title: 'SEO Specialist',
    category: 'marketing',
    essentialSkills: ['SEO On-Page', 'Keyword Research', 'Google Search Console', 'Content Strategy', 'Analytics'],
    niceToHaveSkills: ['SEO Technical', 'Ahrefs', 'Semrush', 'Link Building', 'HTML Dasar'],
    relatedTransitionalRoles: ['Digital Marketer', 'Content Writer', 'Data Analyst'],
    typicalStrengths: ['Optimasi Halaman untuk Mesin Pencari', 'Riset Kata Kunci Komprehensif', 'Analisis Traffic & Ranking'],
    typicalGaps: ['Technical SEO (Schema, Crawl Budget)', 'International SEO', 'Programmatic SEO'],
  },

  // ─── Product & Business ────────────────────────────────────────
  'Project Manager': {
    title: 'Project Manager',
    category: 'product',
    essentialSkills: ['Project Management', 'Problem Solving', 'Critical Thinking', 'Communication', 'Teamwork', 'Agile & Scrum'],
    niceToHaveSkills: ['Jira', 'Trello', 'Waterfall Development', 'Risk Management', 'Stakeholder Management', 'Budgeting'],
    relatedTransitionalRoles: ['Project Coordinator', 'Product Manager', 'Business Analyst'],
    typicalStrengths: ['Manajemen Alur Kerja & Timeline Proyek', 'Koordinasi Lintas Divisi', 'Mitigasi Risiko & Problem Solving'],
    typicalGaps: ['Budgeting Skala Besar', 'Enterprise Agile Coaching', 'Technical Architecture Fundamentals'],
  },
  'Product Manager': {
    title: 'Product Manager',
    category: 'product',
    essentialSkills: ['Product Roadmap', 'User Research', 'Prioritization', 'Communication', 'Problem Solving', 'Data Analysis'],
    niceToHaveSkills: ['Agile / Scrum', 'Wireframing', 'SQL', 'A/B Testing', 'Stakeholder Management'],
    relatedTransitionalRoles: ['Product Marketing', 'Business Analyst', 'Project Coordinator'],
    typicalStrengths: ['Stakeholder Management & Komunikasi Tim', 'Pemahaman Kebutuhan Pengguna', 'Penyusunan Prioritas Masalah'],
    typicalGaps: ['Technical Fundamentals & Arsitektur', 'Product Analytics Berbasis SQL', 'A/B Testing Mendalam'],
  },
  'Project Coordinator': {
    title: 'Project Coordinator',
    category: 'product',
    essentialSkills: ['Project Management', 'Communication', 'Microsoft Office', 'Time Management', 'Problem Solving'],
    niceToHaveSkills: ['Agile / Scrum', 'Trello', 'Jira', 'Stakeholder Management', 'Budgeting'],
    relatedTransitionalRoles: ['Project Manager', 'Product Manager', 'Admin Staff', 'Business Analyst'],
    typicalStrengths: ['Koordinasi Tim & Jadwal Proyek', 'Dokumentasi Progress Terstruktur', 'Komunikasi Lintas Tim'],
    typicalGaps: ['Resource & Budget Management', 'Risk Assessment', 'Agile Methodology Mendalam'],
  },
  'Business Analyst': {
    title: 'Business Analyst',
    category: 'business',
    essentialSkills: ['Data Analysis', 'Excel & Spreadsheet', 'Problem Solving', 'Communication', 'Business Process'],
    niceToHaveSkills: ['SQL', 'Wireframing', 'Stakeholder Management', 'PowerBI', 'Requirements Documentation'],
    relatedTransitionalRoles: ['Data Analyst', 'Project Manager', 'Product Manager', 'Project Coordinator'],
    typicalStrengths: ['Analisis Kebutuhan Bisnis', 'Dokumentasi Proses & Requirement', 'Presentasi Data ke Stakeholder'],
    typicalGaps: ['Technical System Understanding', 'Advanced Data Modeling', 'Process Automation'],
  },
  'Business Development': {
    title: 'Business Development',
    category: 'business',
    essentialSkills: ['Negotiation', 'Communication', 'Networking', 'Market Research', 'Presentation', 'Sales Strategy'],
    niceToHaveSkills: ['CRM Tools', 'Partnership Management', 'Financial Modeling', 'Lead Generation'],
    relatedTransitionalRoles: ['Sales Representative', 'Product Marketing', 'Project Coordinator'],
    typicalStrengths: ['Membangun Relasi & Kemitraan Bisnis', 'Identifikasi Peluang Pasar Baru', 'Presentasi Proposal Persuasif'],
    typicalGaps: ['Financial Analysis & Forecasting', 'Contract Negotiation Kompleks', 'Strategic Planning Jangka Panjang'],
  },

  // ─── Operations & Admin ────────────────────────────────────────
  'Admin Staff': {
    title: 'Admin Staff',
    category: 'operations',
    essentialSkills: ['Microsoft Office', 'Administrasi', 'Data Entry', 'Komunikasi', 'Filing & Arsip'],
    niceToHaveSkills: ['Excel & Spreadsheet', 'Customer Service', 'Surat Menyurat', 'Inventaris', 'Google Workspace'],
    relatedTransitionalRoles: ['Staf Operasional', 'Customer Service', 'Human Resources Generalist'],
    typicalStrengths: ['Ketelitian Entri Data & Arsip Dokumen', 'Manajemen Jadwal & Korespondensi', 'Koordinasi Administrasi Harian'],
    typicalGaps: ['Otomasi Alur Kerja Digital', 'Analisis Data Operasional', 'Project Management Tools'],
  },
  'Staf Operasional': {
    title: 'Staf Operasional',
    category: 'operations',
    essentialSkills: ['Microsoft Office', 'Koordinasi Operasional', 'Time Management', 'Komunikasi', 'Problem Solving'],
    niceToHaveSkills: ['Excel & Spreadsheet', 'Inventaris', 'Pelaporan Harian', 'Koordinasi Vendor', 'Customer Service'],
    relatedTransitionalRoles: ['Admin Staff', 'Staf Logistik & Gudang', 'Customer Service'],
    typicalStrengths: ['Disiplin Waktu & Manajemen Jadwal', 'Komunikasi Lintas Divisi', 'Pelaksanaan SOP Operasional'],
    typicalGaps: ['Otomasi Alur Kerja (Zapier/Workflow)', 'Analisis Efisiensi Biaya Operasional', 'Data-Driven Decision Making'],
  },
  'Customer Service': {
    title: 'Customer Service',
    category: 'operations',
    essentialSkills: ['Customer Service', 'Komunikasi', 'Problem Solving', 'Kesabaran', 'Empati'],
    niceToHaveSkills: ['CRM Tools', 'Ticketing System', 'Bahasa Inggris', 'Microsoft Office', 'Live Chat'],
    relatedTransitionalRoles: ['Admin Staff', 'Sales Representative', 'Human Resources Generalist'],
    typicalStrengths: ['Penanganan Keluhan Pelanggan dengan Empati', 'Respons Cepat & Solutif', 'Komunikasi Lisan & Tulisan'],
    typicalGaps: ['Customer Analytics & Retention Metrics', 'Omnichannel Support Tools', 'Escalation Process Design'],
  },
  'Human Resources Generalist': {
    title: 'Human Resources Generalist',
    category: 'business',
    essentialSkills: ['Rekrutmen Dasar', 'Komunikasi Interpersonal', 'Administrasi Karyawan', 'Microsoft Office', 'Onboarding'],
    niceToHaveSkills: ['Job Portal Management', 'HRIS Basics', 'Hubungan Industrial Dasar', 'Training & Development'],
    relatedTransitionalRoles: ['Admin Staff', 'Customer Service', 'Project Coordinator'],
    typicalStrengths: ['Kemampuan Membangun Relasi Hangat', 'Pengorganisasian Dokumen Karyawan', 'Penyaringan Kandidat Awal'],
    typicalGaps: ['People Analytics & Retensi', 'Evaluasi Kompensasi & Benefit', 'Employer Branding'],
  },
  'Staf Logistik & Gudang': {
    title: 'Staf Logistik & Gudang',
    category: 'operations',
    essentialSkills: ['Manajemen Inventaris', 'Administrasi', 'Ketelitian', 'Microsoft Office', 'Koordinasi Operasional'],
    niceToHaveSkills: ['Excel & Spreadsheet', 'WMS Basics', 'Forklift Operation', 'Supply Chain Dasar', 'Data Entry'],
    relatedTransitionalRoles: ['Staf Operasional', 'Admin Staff', 'Kasir & Store Associate'],
    typicalStrengths: ['Pengelolaan Stok & Inventaris', 'Ketelitian Pengecekan Barang', 'Koordinasi Pengiriman'],
    typicalGaps: ['Supply Chain Optimization', 'Warehouse Management System', 'Data Analytics Logistik'],
  },

  // ─── Sales & Retail ────────────────────────────────────────────
  'Sales Representative': {
    title: 'Sales Representative',
    category: 'business',
    essentialSkills: ['Negotiation', 'Communication', 'Persuasi', 'Target Oriented', 'Customer Relationship'],
    niceToHaveSkills: ['CRM Tools', 'Presentation', 'Market Research', 'Cold Calling', 'Social Media'],
    relatedTransitionalRoles: ['Business Development', 'Customer Service', 'Digital Marketer'],
    typicalStrengths: ['Komunikasi Persuasif & Negosiasi', 'Pencapaian Target Penjualan', 'Membangun Hubungan Pelanggan'],
    typicalGaps: ['Sales Analytics & Pipeline Management', 'Enterprise Sales Strategy', 'CRM Automation'],
  },
  'Kasir & Store Associate': {
    title: 'Kasir & Store Associate',
    category: 'fnb_retail',
    essentialSkills: ['Customer Service', 'Ketelitian', 'Komunikasi', 'Operasi Kasir', 'Kerapian'],
    niceToHaveSkills: ['POS System', 'Inventaris', 'Visual Merchandising', 'Microsoft Office', 'Bahasa Inggris'],
    relatedTransitionalRoles: ['Customer Service', 'Admin Staff', 'Sales Representative'],
    typicalStrengths: ['Pelayanan Pelanggan Langsung', 'Ketelitian Transaksi Keuangan', 'Penataan Display Produk'],
    typicalGaps: ['Retail Analytics & KPI', 'Manajemen Stok Digital', 'Omnichannel Retail'],
  },
  'Barista / Service Staff': {
    title: 'Barista / Service Staff',
    category: 'fnb_retail',
    essentialSkills: ['Customer Service', 'Komunikasi', 'Kebersihan & Higienitas', 'Kecepatan Kerja', 'Kerja Tim'],
    niceToHaveSkills: ['Latte Art', 'Menu Knowledge', 'POS System', 'Food Safety', 'Bahasa Inggris'],
    relatedTransitionalRoles: ['Kasir & Store Associate', 'Customer Service', 'Event Coordinator'],
    typicalStrengths: ['Pelayanan Tamu Ramah & Cepat', 'Keterampilan Meracik Minuman', 'Kerja Tim di Lingkungan Sibuk'],
    typicalGaps: ['Manajemen Operasional F&B', 'Cost Control & Inventory', 'Menu Development'],
  },
  'Visual Merchandiser': {
    title: 'Visual Merchandiser',
    category: 'fnb_retail',
    essentialSkills: ['Desain Visual', 'Layout & Komposisi', 'Branding', 'Kreativitas', 'Attention to Detail'],
    niceToHaveSkills: ['Photoshop', 'Retail Knowledge', 'Photography', 'Tren Mode', 'Event Setup'],
    relatedTransitionalRoles: ['Graphic Designer', 'Fashion Designer', 'Kasir & Store Associate'],
    typicalStrengths: ['Penataan Display Menarik', 'Pemahaman Estetika Brand', 'Eksekusi Tema Visual Seasonal'],
    typicalGaps: ['Retail Analytics & Conversion', 'Digital Visual Merchandising', 'Budget Management'],
  },

  // ─── Finance ───────────────────────────────────────────────────
  'Accountant': {
    title: 'Accountant',
    category: 'finance',
    essentialSkills: ['Akuntansi Dasar', 'Excel & Spreadsheet', 'Laporan Keuangan', 'Ketelitian', 'Microsoft Office'],
    niceToHaveSkills: ['Accurate', 'Jurnal Umum', 'Perpajakan Dasar', 'SAP', 'Audit Dasar'],
    relatedTransitionalRoles: ['Staff Finance', 'Admin Staff', 'Data Analyst'],
    typicalStrengths: ['Penyusunan Laporan Keuangan Akurat', 'Ketelitian Pencatatan Transaksi', 'Pemahaman Standar Akuntansi'],
    typicalGaps: ['Financial Analysis & Forecasting', 'Tax Planning Lanjutan', 'ERP System Mendalam'],
  },
  'Staff Finance': {
    title: 'Staff Finance',
    category: 'finance',
    essentialSkills: ['Administrasi Keuangan', 'Excel & Spreadsheet', 'Data Entry', 'Ketelitian', 'Microsoft Office'],
    niceToHaveSkills: ['Akuntansi Dasar', 'Perpajakan Dasar', 'Invoice Processing', 'Bank Reconciliation'],
    relatedTransitionalRoles: ['Accountant', 'Admin Staff', 'Staf Operasional'],
    typicalStrengths: ['Pengelolaan Dokumen Keuangan Harian', 'Proses Invoice & Reimburse', 'Rekonsiliasi Data Keuangan'],
    typicalGaps: ['Financial Reporting Standards', 'Budgeting & Forecasting', 'Tax Compliance'],
  },

  // ─── Education ─────────────────────────────────────────────────
  'Guru / Tutor': {
    title: 'Guru / Tutor',
    category: 'education',
    essentialSkills: ['Komunikasi', 'Kesabaran', 'Penguasaan Materi', 'Kreativitas Mengajar', 'Empati'],
    niceToHaveSkills: ['Microsoft Office', 'Google Classroom', 'Presentation', 'Kurikulum Merdeka', 'Bahasa Inggris'],
    relatedTransitionalRoles: ['Content Writer', 'Customer Service', 'Human Resources Generalist'],
    typicalStrengths: ['Penyampaian Materi Mudah Dipahami', 'Kesabaran Mendampingi Siswa', 'Pembuatan Bahan Ajar Kreatif'],
    typicalGaps: ['EdTech & Learning Platform', 'Assessment Design Berbasis Data', 'Differentiated Learning'],
  },

  // ─── Events ────────────────────────────────────────────────────
  'Event Coordinator': {
    title: 'Event Coordinator',
    category: 'operations',
    essentialSkills: ['Event Planning', 'Koordinasi Tim', 'Communication', 'Time Management', 'Problem Solving'],
    niceToHaveSkills: ['Budgeting', 'Vendor Management', 'Social Media', 'Negotiation', 'Microsoft Office'],
    relatedTransitionalRoles: ['Project Coordinator', 'Admin Staff', 'Social Media Specialist'],
    typicalStrengths: ['Koordinasi Acara dari Persiapan hingga Eksekusi', 'Manajemen Vendor & Supplier', 'Respons Cepat di Lapangan'],
    typicalGaps: ['Event Marketing & Promotion', 'Sponsorship Acquisition', 'Post-Event Analytics'],
  },

  // ─── Sports & Fitness ──────────────────────────────────────────
  'Pelatih Olahraga & Kebugaran': {
    title: 'Pelatih Olahraga & Kebugaran',
    category: 'education',
    essentialSkills: ['Periodisasi Latihan', 'Kondisi Fisik', 'Teknik Olahraga', 'Manajemen Tim', 'Tes Kebugaran'],
    niceToHaveSkills: ['Analisis Video', 'Nutrisi Olahraga', 'Pertolongan Pertama', 'Microsoft Excel', 'Komunikasi'],
    relatedTransitionalRoles: ['Pelatih Fisik & Pembinaan Atlet', 'Instruktur Kebugaran', 'Guru Pendidikan Jasmani (PJOK)', 'Event Coordinator Olahraga'],
    typicalStrengths: ['Penyusunan Program Latihan Terstruktur', 'Pengembangan Ketahanan Fisik Atlet', 'Motivasi & Kepemimpinan Tim'],
    typicalGaps: ['Sertifikasi Kepelatihan Internasional', 'Sport Science Lanjutan'],
  },
  'Pelatih Fisik & Pembinaan Atlet': {
    title: 'Pelatih Fisik & Pembinaan Atlet',
    category: 'education',
    essentialSkills: ['Periodisasi Latihan Fisik', 'Kondisi Fisik & Daya Tahan', 'Teknik Atletik & Olahraga', 'Pencegahan & Manajemen Cedera', 'Evaluasi Kebugaran Atlet'],
    niceToHaveSkills: ['Sport Science Dasar', 'Biomekanika Olahraga', 'Nutrisi Atlet', 'Analisis Video Performa', 'Komunikasi Motivasi'],
    relatedTransitionalRoles: ['Pelatih Olahraga & Kebugaran', 'Instruktur Kebugaran', 'Guru Pendidikan Jasmani (PJOK)', 'Event Coordinator Olahraga'],
    typicalStrengths: ['Penyusunan Program Kondisi Fisik Spesifik', 'Pembinaan Karakter & Mental Atlet', 'Monitoring Performa Fisik Terukur'],
    typicalGaps: ['Sertifikasi Strength & Conditioning Internasional (CSCS)', 'Sport Science Lanjutan'],
  },
  'Instruktur Kebugaran': {
    title: 'Instruktur Kebugaran',
    category: 'fnb_retail',
    essentialSkills: ['Instruktur Fitness', 'Teknik Latihan Beban', 'Customer Service', 'Motivasi Klien', 'Komunikasi Interpersonal'],
    niceToHaveSkills: ['Nutrisi Dasar', 'Penyusunan Jadwal Latihan', 'First Aid', 'Pemasaran Personal', 'POS System'],
    relatedTransitionalRoles: ['Pelatih Olahraga & Kebugaran', 'Pelatih Fisik & Pembinaan Atlet', 'Customer Service', 'Kasir & Store Associate'],
    typicalStrengths: ['Pelayanan Ramah & Bimbingan Kebugaran Personal', 'Edukasi Pola Hidup Sehat', 'Komunikasi Antusias'],
    typicalGaps: ['Fisioterapi & Manajemen Cedera Spesifik', 'Manajemen Bisnis Kebugaran'],
  },
  'Guru Pendidikan Jasmani (PJOK)': {
    title: 'Guru Pendidikan Jasmani (PJOK)',
    category: 'education',
    essentialSkills: ['Pendidikan Jasmani & Kesehatan', 'Penyusunan RPP / Kurikulum Olahraga', 'Manajemen Kelas & Lapangan', 'Teknik Dasar Multi-Cabang Olahraga', 'Evaluasi Kebugaran Siswa'],
    niceToHaveSkills: ['Pertolongan Pertama (P3K)', 'Penyelenggaraan Classmeeting / Turnamen Sekolah', 'Psikologi Perkembangan Anak & Remaja', 'Microsoft Office'],
    relatedTransitionalRoles: ['Pelatih Olahraga & Kebugaran', 'Pelatih Fisik & Pembinaan Atlet', 'Guru / Tutor', 'Event Coordinator Olahraga'],
    typicalStrengths: ['Instruksi Gerak Edukatif yang Ramah & Menyenangkan', 'Pengelolaan Siswa dalam Skala Besar', 'Edukasi Pola Hidup Bersih & Sehat'],
    typicalGaps: ['Sertifikasi Pendidik Profesional (PPG)', 'Pengembangan Media Pembelajaran Digital'],
  },
  'Event Coordinator Olahraga': {
    title: 'Event Coordinator Olahraga',
    category: 'operations',
    essentialSkills: ['Manajemen Operasional Turnamen', 'Regulasi Pertandingan Olahraga', 'Koordinasi Venue & Lapangan', 'Manajemen Wasit & Ofisial', 'Komunikasi Tim'],
    niceToHaveSkills: ['Sponsorship Olahraga', 'Ticketing & Pendaftaran Peserta', 'First Aid / Medis Lapangan', 'Budgeting Sederhana'],
    relatedTransitionalRoles: ['Event Coordinator', 'Pelatih Olahraga & Kebugaran', 'Pelatih Fisik & Pembinaan Atlet', 'Project Coordinator'],
    typicalStrengths: ['Pemahaman Ritme & Aturan Kompetisi Olahraga', 'Penanganan Cepat Masalah Lapangan', 'Koordinasi Komunitas Olahraga'],
    typicalGaps: ['Manajemen Sponsor Skala Nasional', 'Live Broadcasting & Media Rights'],
  },

  // ─── Healthcare & Medical ──────────────────────────────────────
  'Staf Administrasi Medis': {
    title: 'Staf Administrasi Medis',
    category: 'operations',
    essentialSkills: ['Administrasi Rumah Sakit / Klinik', 'Rekam Medis & E-Klaim', 'BPJS Kesehatan & Asuransi', 'Komunikasi Pasien', 'Microsoft Office'],
    niceToHaveSkills: ['SIMRS', 'Manajemen Antrean', 'Standar Akreditasi RS', 'Terminologi Medis'],
    relatedTransitionalRoles: ['Admin Staff', 'Customer Service', 'Staf Operasional'],
    typicalStrengths: ['Ketelitian Pengelolaan Berkas Medis', 'Pemahaman Prosedur Klaim & BPJS', 'Pelayanan Pasien yang Tanggap & Empatis'],
    typicalGaps: ['Audit Rekam Medis Elektronik Mendalam', 'Integrasi Sistem SATUSEHAT', 'Analisis Data Epidemiologi'],
  },
  'Perawat Klinis / Ners': {
    title: 'Perawat Klinis / Ners',
    category: 'operations',
    essentialSkills: ['Asuhan Keperawatan Komprehensif', 'Tindakan Invasif & Pemasangan Infus', 'Patient Safety & Pencegahan Infeksi (PPI)', 'Kegawatdaruratan Medis (BTCLS)', 'Dokumentasi SIMRS / EHR'],
    niceToHaveSkills: ['Interpretasi EKG Dasar', 'Manajemen Obat 7 Benar', 'Standar Akreditasi KARS/JCI', 'Komunikasi Terapeutik Pasien & Keluarga'],
    relatedTransitionalRoles: ['Staf Administrasi Medis', 'Klinisi Homecare', 'Konsultan Layanan Medis'],
    typicalStrengths: ['Kepatuhan Tinggi pada Prosedur Klinis & SOP', 'Ketenangan & Ketangkasan Tangani Kegawatan', 'Empati & Hubungan Terapeutik Kuat'],
    typicalGaps: ['Sertifikasi Spesialisasi Lanjutan (ICU/Kardiologi)', 'Manajemen Kepala Ruangan (Ward Management)'],
  },

  // ─── Public Relations & Communications ─────────────────────────
  'Public Relations (PR)': {
    title: 'Public Relations (PR)',
    category: 'marketing',
    essentialSkills: ['Media Relations', 'Press Release Writing', 'Komunikasi Publik', 'Crisis Communication', 'Event Management'],
    niceToHaveSkills: ['Social Media Strategy', 'Media Monitoring', 'Stakeholder Management', 'Public Speaking'],
    relatedTransitionalRoles: ['Event Coordinator', 'Content Writer', 'Social Media Specialist'],
    typicalStrengths: ['Membangun Citra & Reputasi Positif Perusahaan', 'Hubungan Solid dengan Media & Mitra', 'Komunikasi Krisis Cepat & Tepat'],
    typicalGaps: ['Data-Driven PR Analytics', 'Investor Relations', 'Government Relations Lanjutan'],
  },
};

// ─── Role Alias Table ────────────────────────────────────────────

export const ROLE_ALIASES: Record<string, string> = {
  // Admin & Operations
  'admin': 'Admin Staff',
  'admin staff': 'Admin Staff',
  'administrasi': 'Admin Staff',
  'staf administrasi': 'Admin Staff',
  'staff administrasi': 'Admin Staff',
  'sekretaris': 'Admin Staff',
  'staff operasional': 'Staf Operasional',
  'staf operasional': 'Staf Operasional',
  'operasional': 'Staf Operasional',
  'logistik': 'Staf Logistik & Gudang',
  'gudang': 'Staf Logistik & Gudang',
  'warehouse': 'Staf Logistik & Gudang',

  // Customer-facing
  'customer service': 'Customer Service',
  'cs': 'Customer Service',
  'customer care': 'Customer Service',
  'call center': 'Customer Service',

  // Tech
  'frontend': 'Frontend Developer',
  'front end': 'Frontend Developer',
  'front-end': 'Frontend Developer',
  'react developer': 'Frontend Developer',
  'backend': 'Backend Developer',
  'back end': 'Backend Developer',
  'back-end': 'Backend Developer',
  'fullstack': 'Fullstack Developer',
  'full stack': 'Fullstack Developer',
  'full-stack': 'Fullstack Developer',
  'web developer': 'Fullstack Developer',
  'programmer': 'Fullstack Developer',
  'software engineer': 'Fullstack Developer',
  'developer': 'Fullstack Developer',
  'qa': 'Quality Assurance',
  'quality assurance': 'Quality Assurance',
  'tester': 'Quality Assurance',
  'qa tester': 'Quality Assurance',
  'testing': 'Quality Assurance',
  'data analyst': 'Data Analyst',
  'data analis': 'Data Analyst',
  'analis data': 'Data Analyst',
  'data science': 'Data Analyst',
  'teknisi': 'Teknisi Komputer & Jaringan',
  'teknisi komputer': 'Teknisi Komputer & Jaringan',
  'network engineer': 'Teknisi Komputer & Jaringan',
  'it support': 'IT Support',
  'helpdesk': 'IT Support',
  'technical support': 'IT Support',

  // Design
  'ui ux': 'UI/UX Designer',
  'ui/ux': 'UI/UX Designer',
  'ux designer': 'UI/UX Designer',
  'ui designer': 'UI/UX Designer',
  'product designer': 'UI/UX Designer',
  'graphic designer': 'Graphic Designer',
  'desainer grafis': 'Graphic Designer',
  'desain grafis': 'Graphic Designer',
  'video editor': 'Video Editor & Content Creator',
  'content creator': 'Video Editor & Content Creator',
  'youtuber': 'Video Editor & Content Creator',
  'tiktoker': 'Video Editor & Content Creator',
  'fotografer': 'Fotografer & Videografer',
  'photographer': 'Fotografer & Videografer',
  'videografer': 'Fotografer & Videografer',
  'videographer': 'Fotografer & Videografer',
  'fashion': 'Fashion Designer',
  'fashion designer': 'Fashion Designer',
  'desainer fashion': 'Fashion Designer',
  'desain busana': 'Fashion Designer',
  'visual merchandiser': 'Visual Merchandiser',
  'merchandiser': 'Visual Merchandiser',

  // Marketing
  'digital marketing': 'Digital Marketer',
  'digital marketer': 'Digital Marketer',
  'online marketing': 'Digital Marketer',
  'social media': 'Social Media Specialist',
  'social media specialist': 'Social Media Specialist',
  'sosial media': 'Social Media Specialist',
  'sosmed': 'Social Media Specialist',
  'admin sosmed': 'Social Media Specialist',
  'content writer': 'Content Writer',
  'copywriter': 'Content Writer',
  'penulis konten': 'Content Writer',
  'penulis': 'Content Writer',
  'seo': 'SEO Specialist',
  'seo specialist': 'SEO Specialist',
  'product marketing': 'Product Marketing',
  'growth marketing': 'Growth Marketing',
  'performance marketing': 'Growth Marketing',
  'growth hacker': 'Growth Marketing',

  // Product & Business
  'product manager': 'Product Manager',
  'product owner': 'Product Manager',
  'po': 'Product Manager',
  'project manager': 'Project Manager',
  'project manager / scrum master': 'Project Manager',
  'scrum master': 'Project Manager',
  'it project manager': 'Project Manager',
  'pm': 'Project Manager',
  'project lead': 'Project Manager',
  'project coordinator': 'Project Coordinator',
  'koordinator proyek': 'Project Coordinator',
  'business analyst': 'Business Analyst',
  'business development': 'Business Development',
  'bd': 'Business Development',
  'bizdev': 'Business Development',

  // Sales & Retail
  'sales': 'Sales Representative',
  'sales representative': 'Sales Representative',
  'sales executive': 'Sales Representative',
  'marketing sales': 'Sales Representative',
  'kasir': 'Kasir & Store Associate',
  'store associate': 'Kasir & Store Associate',
  'pramuniaga': 'Kasir & Store Associate',
  'spg': 'Kasir & Store Associate',
  'spb': 'Kasir & Store Associate',
  'barista': 'Barista / Service Staff',
  'waiter': 'Barista / Service Staff',
  'waitress': 'Barista / Service Staff',
  'pelayan': 'Barista / Service Staff',
  'crew restoran': 'Barista / Service Staff',

  // Finance
  'accountant': 'Accountant',
  'akuntan': 'Accountant',
  'akuntansi': 'Accountant',
  'staff akuntansi': 'Accountant',
  'staf akuntansi': 'Accountant',
  'finance': 'Staff Finance',
  'staff finance': 'Staff Finance',
  'staf keuangan': 'Staff Finance',
  'keuangan': 'Staff Finance',
  'tax': 'Staff Finance',
  'pajak': 'Staff Finance',

  // HR
  'hr': 'Human Resources Generalist',
  'hrd': 'Human Resources Generalist',
  'human resources': 'Human Resources Generalist',
  'sdm': 'Human Resources Generalist',
  'personalia': 'Human Resources Generalist',
  'rekruter': 'Human Resources Generalist',
  'recruiter': 'Human Resources Generalist',

  // Education
  'guru': 'Guru / Tutor',
  'tutor': 'Guru / Tutor',
  'pengajar': 'Guru / Tutor',
  'teacher': 'Guru / Tutor',
  'dosen': 'Guru / Tutor',
  'instruktur': 'Guru / Tutor',

  // Events
  'event': 'Event Coordinator',
  'event coordinator': 'Event Coordinator',
  'event organizer': 'Event Coordinator',
  'eo': 'Event Coordinator',

  // Sports & Fitness
  'pelatih': 'Pelatih Olahraga & Kebugaran',
  'pelatih olahraga': 'Pelatih Olahraga & Kebugaran',
  'pelatih atlet': 'Pelatih Fisik & Pembinaan Atlet',
  'pelatih atletik': 'Pelatih Fisik & Pembinaan Atlet',
  'pelatih fisik': 'Pelatih Fisik & Pembinaan Atlet',
  'strength and conditioning': 'Pelatih Fisik & Pembinaan Atlet',
  'coach': 'Pelatih Olahraga & Kebugaran',
  'athletic coach': 'Pelatih Fisik & Pembinaan Atlet',
  'fitness coach': 'Pelatih Olahraga & Kebugaran',
  'instruktur fitness': 'Instruktur Kebugaran',
  'personal trainer': 'Instruktur Kebugaran',
  'pt fitness': 'Instruktur Kebugaran',
  'instruktur senam': 'Instruktur Kebugaran',
  'instruktur olahraga': 'Instruktur Kebugaran',
  'guru olahraga': 'Guru Pendidikan Jasmani (PJOK)',
  'guru pjok': 'Guru Pendidikan Jasmani (PJOK)',
  'guru penjaskes': 'Guru Pendidikan Jasmani (PJOK)',
  'guru penjas': 'Guru Pendidikan Jasmani (PJOK)',
  'eo olahraga': 'Event Coordinator Olahraga',
  'event olahraga': 'Event Coordinator Olahraga',

  // Architecture, Interior & Civil
  'arsitek': 'Arsitek',
  'architect': 'Arsitek',
  'arsitektur': 'Arsitek',
  'drafter': 'Drafter Arsitektur',
  'drafter arsitektur': 'Drafter Arsitektur',
  'cad drafter': 'Drafter Arsitektur',
  'drafter autocad': 'Drafter Arsitektur',
  'desainer interior': 'Desainer Interior',
  'interior designer': 'Desainer Interior',
  'desain interior': 'Desainer Interior',
  'interior': 'Desainer Interior',
  'teknik sipil': 'Teknik Sipil / Pengawas Proyek Lapangan',
  'sipil': 'Teknik Sipil / Pengawas Proyek Lapangan',
  'pengawas proyek': 'Teknik Sipil / Pengawas Proyek Lapangan',
  'site supervisor': 'Teknik Sipil / Pengawas Proyek Lapangan',
  'civil engineer': 'Teknik Sipil / Pengawas Proyek Lapangan',

  // Healthcare & Medical
  'administrasi medis': 'Staf Administrasi Medis',
  'staf administrasi medis': 'Staf Administrasi Medis',
  'admin rs': 'Staf Administrasi Medis',
  'rekam medis': 'Staf Administrasi Medis',
  'asisten medis': 'Staf Administrasi Medis',
  'medis': 'Staf Administrasi Medis',
  'perawat': 'Perawat Klinis / Ners',
  'nurse': 'Perawat Klinis / Ners',
  'ners': 'Perawat Klinis / Ners',
  'staf perawat': 'Perawat Klinis / Ners',
  'perawat klinis': 'Perawat Klinis / Ners',
  'perawat rs': 'Perawat Klinis / Ners',

  // Public Relations & PR
  'pr': 'Public Relations (PR)',
  'public relations': 'Public Relations (PR)',
  'humas': 'Public Relations (PR)',
  'hubungan masyarakat': 'Public Relations (PR)',
};

export const ROLE_CATEGORY_LABELS: Record<string, string> = {
  tech: 'Teknologi & IT',
  design: 'Desain Grafis & UI/UX',
  creative: 'Media & Kreatif',
  marketing: 'Marketing & Komunikasi',
  product: 'Produk & Proyek',
  business: 'Bisnis & Manajemen',
  operations: 'Operasional & Administrasi',
  fnb_retail: 'Retail, F&B & Hospitality',
  finance: 'Keuangan & Akuntansi',
  education: 'Pendidikan & Pengajaran',
};

export interface EngineRoleOption {
  title: string;
  category: RoleBlueprint['category'];
  categoryLabel: string;
  essentialSkills: string[];
}

export const ENGINE_ROLES: EngineRoleOption[] = Object.values(ROLE_BLUEPRINTS).map((bp) => ({
  title: bp.title,
  category: bp.category,
  categoryLabel: ROLE_CATEGORY_LABELS[bp.category] || 'Lainnya',
  essentialSkills: bp.essentialSkills,
}));

// ─── Skill Matching & Language Filtering ────────────────────────

export function isLanguageSkill(skill: string): boolean {
  const s = skill.toLowerCase().trim();
  return (
    /^(bahasa\s+)?(indonesia|inggris|english|jepang|japanese|mandarin|korea|korean|arab|arabic|jerman|german|perancis|french)$/i.test(s) ||
    /^(toefl|ielts|toeic)/i.test(s) ||
    /^(bahasa\s+(indonesia|inggris|jepang|mandarin|korea|arab|jerman|perancis))$/i.test(s)
  );
}

export function filterOutLanguageSkills(skills: string[]): string[] {
  return (skills || []).filter((s) => !isLanguageSkill(s));
}

export const TRANSFERABLE_SKILL_EQUIVALENTS: Record<string, string[]> = {
  // Office & Productivity Tools
  'excel': ['microsoft office', 'excel & spreadsheet'],
  'microsoft excel': ['microsoft office', 'excel & spreadsheet'],
  'google sheets': ['microsoft office', 'excel & spreadsheet'],
  'spreadsheet': ['microsoft office', 'excel & spreadsheet'],
  'word': ['microsoft office', 'administrasi'],
  'microsoft word': ['microsoft office', 'administrasi'],

  // Interpersonal, Service & Communication Skills
  'komunikasi dengan atlet dan orang tua': ['komunikasi', 'customer service'],
  'komunikasi dengan orang tua': ['komunikasi', 'customer service'],
  'komunikasi atlet': ['komunikasi'],
  'pelayanan': ['customer service'],
  'public speaking': ['komunikasi', 'presentasi'],
  'bimbingan': ['komunikasi', 'kesabaran'],

  // Leadership, Coordination & Organization
  'manajemen tim': ['koordinasi tim', 'teamwork'],
  'kepemimpinan': ['koordinasi tim', 'leadership'],
  'koordinasi tim': ['koordinasi operasional', 'teamwork'],
  'monitoring beban latihan': ['attention to detail', 'monitoring beban'],
  'analisis video': ['attention to detail', 'problem solving'],
  'periodisasi latihan': ['time management', 'perencanaan'],
  'evaluasi': ['problem solving', 'attention to detail'],

  // Design, Media & Tech
  'ui design': ['figma', 'wireframing', 'prototyping', 'design system', 'user research'],
  'desain ui': ['figma', 'wireframing', 'prototyping', 'design system'],
  'ux design': ['user research', 'usability testing', 'prototyping', 'wireframing'],
  'desain ux': ['user research', 'usability testing', 'prototyping', 'wireframing'],
  'desain grafis': ['canva', 'adobe photoshop', 'adobe illustrator', 'desain visual'],
  'graphic design': ['canva', 'adobe photoshop', 'adobe illustrator', 'desain visual'],
  'web design': ['figma', 'html & css', 'wireframing'],
  'desain web': ['figma', 'html & css', 'wireframing'],
  'desain visual': ['canva', 'adobe photoshop', 'figma'],
};

export function skillMatches(userSkill: string, blueprintSkill: string): boolean {
  const u = userSkill.toLowerCase().trim();
  const b = blueprintSkill.toLowerCase().trim();
  if (!u || !b) return false;

  if (u === b) return true;
  if (u.length >= 4 && b.length >= 4 && (u.includes(b) || b.includes(u))) return true;

  const uTokens = u.split(/[\s&,/]+/).filter(t => t.length > 2);
  const bTokens = b.split(/[\s&,/]+/).filter(t => t.length > 2);
  if (bTokens.length === 0) return false;

  const hitCount = bTokens.filter(bt =>
    uTokens.some(ut => ut === bt || (ut.length >= 4 && bt.length >= 4 && (ut.includes(bt) || bt.includes(ut))))
  ).length;

  if (hitCount / bTokens.length >= 0.6) return true;

  // Transferable Skill Bridges
  for (const [key, equivalents] of Object.entries(TRANSFERABLE_SKILL_EQUIVALENTS)) {
    if (u === key || u.includes(key) || key.includes(u)) {
      if (equivalents.some(eq => eq === b || b.includes(eq) || eq.includes(b))) {
        return true;
      }
    }
  }

  return false;
}

// ─── Gated / Restricted Professional Barrier Engine ─────────────
// Profesi yang membutuhkan kualifikasi domain, latar belakang pendidikan spesifik,
// atau lisensi/sertifikasi keras. DILARANG KERAS dijadikan rekomendasi alternatif/eksplorasi
// bagi kandidat yang tidak memiliki prasyarat domain.

export interface GatedRoleRule {
  domain: string;
  requiredMajors: string[];
  requiredSkills: string[];
  requiredTitleKeywords?: string[];
}

export const GATED_ROLE_RULES: Record<string, GatedRoleRule> = {
  // ── 1. Keuangan & Akuntansi (Finance & Accounting) ──────────────
  'Accountant': {
    domain: 'Keuangan & Akuntansi',
    requiredMajors: ['akuntansi', 'keuangan', 'finance', 'pajak', 'perpajakan', 'perbankan', 'akuntansi keuangan'],
    requiredSkills: ['akuntansi dasar', 'laporan keuangan', 'jurnal umum', 'perpajakan dasar', 'pajak', 'accurate', 'audit dasar', 'brevet', 'standar akuntansi'],
    requiredTitleKeywords: ['akuntan', 'accountant', 'finance', 'keuangan', 'auditor', 'pajak', 'tax'],
  },
  'Staff Finance': {
    domain: 'Keuangan & Akuntansi',
    requiredMajors: ['akuntansi', 'keuangan', 'finance', 'pajak', 'perpajakan', 'perbankan', 'administrasi keuangan'],
    requiredSkills: ['administrasi keuangan', 'akuntansi dasar', 'laporan keuangan', 'invoice processing', 'bank reconciliation', 'perpajakan dasar', 'pajak'],
    requiredTitleKeywords: ['finance', 'keuangan', 'kasir', 'treasury', 'pajak', 'tax', 'akuntansi'],
  },

  // ── 2. Kesehatan & Medis (Healthcare & Medical) ─────────────────
  'Staf Administrasi Medis': {
    domain: 'Kesehatan & Medis',
    requiredMajors: ['kesehatan', 'keperawatan', 'kebidanan', 'farmasi', 'rekam medis', 'kedokteran', 'medis', 'fisioterapi', 'analis kesehatan', 'kesehatan masyarakat'],
    requiredSkills: ['rekam medis', 'administrasi rumah sakit', 'bpjs kesehatan', 'simrs', 'terminologi medis', 'e-klaim', 'pelayanan pasien medis'],
    requiredTitleKeywords: ['medis', 'klinik', 'rumah sakit', 'perawat', 'bidan', 'farmasi', 'rekam medis', 'apotek', 'puskesmas'],
  },
  'Perawat Klinis / Ners': {
    domain: 'Kesehatan & Medis',
    requiredMajors: ['keperawatan', 'ners', 'd3 keperawatan', 's1 keperawatan', 'profesi ners', 'kesehatan'],
    requiredSkills: ['asuhan keperawatan', 'btcls', 'str', 'pasang infus', 'patient safety', 'ppi', 'tindakan medis', 'simrs'],
    requiredTitleKeywords: ['perawat', 'nurse', 'ners', 'klinis', 'rumah sakit', 'klinik', 'igd', 'rawat inap'],
  },

  // ── 3. Keolahragaan & Atletik (Sports & Fitness) ────────────────
  'Pelatih Olahraga & Kebugaran': {
    domain: 'Olahraga & Kebugaran',
    requiredMajors: ['olahraga', 'kepelatihan', 'penjaskes', 'pjok', 'keolahragaan', 'atletik', 'kebugaran', 'fitness'],
    requiredSkills: ['periodisasi latihan', 'kondisi fisik', 'teknik olahraga', 'pembinaan atlet', 'tes kebugaran'],
    requiredTitleKeywords: ['pelatih', 'coach', 'atlet', 'trainer', 'fitness', 'olahraga'],
  },
  'Pelatih Fisik & Pembinaan Atlet': {
    domain: 'Olahraga & Kebugaran',
    requiredMajors: ['olahraga', 'kepelatihan', 'penjaskes', 'pjok', 'keolahragaan', 'atletik', 'kebugaran', 'fitness'],
    requiredSkills: ['periodisasi latihan fisik', 'kondisi fisik & daya tahan', 'teknik atletik & olahraga', 'pencegahan & manajemen cedera', 'evaluasi kebugaran atlet', 'kondisi fisik'],
    requiredTitleKeywords: ['pelatih', 'coach', 'atlet', 'trainer', 'fitness', 'olahraga'],
  },
  'Instruktur Kebugaran': {
    domain: 'Olahraga & Kebugaran',
    requiredMajors: ['olahraga', 'kepelatihan', 'penjaskes', 'pjok', 'keolahragaan', 'atletik', 'kebugaran', 'fitness', 'senam'],
    requiredSkills: ['instruktur fitness', 'teknik latihan beban', 'kebugaran', 'gym', 'aerobik'],
    requiredTitleKeywords: ['instruktur', 'fitness', 'gym', 'trainer', 'pelatih', 'coach'],
  },
  'Guru Pendidikan Jasmani (PJOK)': {
    domain: 'Olahraga & Pendidikan',
    requiredMajors: ['penjaskes', 'pjok', 'pendidikan jasmani', 'olahraga', 'kepelatihan'],
    requiredSkills: ['pendidikan jasmani & kesehatan', 'penyusunan rpp / kurikulum olahraga', 'teknik dasar multi-cabang olahraga', 'evaluasi kebugaran siswa'],
    requiredTitleKeywords: ['pjok', 'penjas', 'guru olahraga', 'pelatih', 'guru'],
  },
  'Event Coordinator Olahraga': {
    domain: 'Olahraga & Even',
    requiredMajors: ['olahraga', 'kepelatihan', 'penjaskes', 'pjok', 'keolahragaan', 'manajemen olahraga'],
    requiredSkills: ['manajemen operasional turnamen', 'regulasi pertandingan olahraga', 'koordinasi venue & lapangan', 'manajemen wasit & ofisial'],
    requiredTitleKeywords: ['olahraga', 'turnamen', 'kompetisi', 'event olahraga', 'wasit', 'ofisial', 'atlet'],
  },

  // ── 4. Arsitektur & Teknik Konstruksi (Architecture & Civil) ────
  'Arsitek': {
    domain: 'Arsitektur & Desain Ruang',
    requiredMajors: ['arsitektur', 'desain arsitektur', 'teknik arsitektur'],
    requiredSkills: ['autocad', 'sketchup', 'gambar kerja & detail arsitektur', '3d modeling & rendering', 'building codes & sni', 'perancangan konsep arsitektur', 'revit'],
    requiredTitleKeywords: ['arsitek', 'architect', 'drafter'],
  },
  'Drafter Arsitektur': {
    domain: 'Arsitektur & Desain Ruang',
    requiredMajors: ['arsitektur', 'teknik gambar bangunan', 'desain pemodelan', 'teknik sipil', 'desain interior'],
    requiredSkills: ['autocad', 'gambar kerja arsitektur', 'detail konstruksi', 'sketchup', 'membaca gambar teknik', 'revit'],
    requiredTitleKeywords: ['drafter', 'cad', 'arsitek', 'juru gambar'],
  },
  'Desainer Interior': {
    domain: 'Desain Ruang & Interior',
    requiredMajors: ['desain interior', 'arsitektur', 'desain produk', 'seni rupa'],
    requiredSkills: ['space planning', 'material & finishing', 'v-ray', 'enscape', 'autocad', 'sketchup'],
    requiredTitleKeywords: ['interior', 'desainer interior', 'drafter interior'],
  },
  'Teknik Sipil / Pengawas Proyek Lapangan': {
    domain: 'Teknik Sipil & Konstruksi',
    requiredMajors: ['teknik sipil', 'sipil', 'konstruksi', 'bangunan', 'teknik bangunan'],
    requiredSkills: ['membaca gambar teknik', 'pengawasan lapangan', 'rab & estimasi biaya', 'manajemen k3 konstruksi'],
    requiredTitleKeywords: ['sipil', 'civil', 'pengawas proyek', 'site engineer', 'mandor', 'pelaksana lapangan'],
  },

  // ── 5. Keguruan & Pendidikan Formal (Formal Education) ──────────
  'Guru / Tutor': {
    domain: 'Keguruan & Pendidikan',
    requiredMajors: ['pendidikan', 'keguruan', 'pgsd', 'fkip', 'teaching', 'tarbiyah', 'bimbingan konseling', 'pendidikan bahasa'],
    requiredSkills: ['kurikulum merdeka', 'rpp', 'keguruan', 'metode mengajar', 'pedagogik', 'kreativitas mengajar'],
    requiredTitleKeywords: ['guru', 'pengajar', 'tutor', 'dosen', 'pendidik', 'tentor'],
  },

  // ── 6. Human Resources & People Operations ──────────────────────
  'Human Resources Generalist': {
    domain: 'Human Resources & Organisasi',
    requiredMajors: ['sdm', 'sumber daya manusia', 'human resources', 'human resource', 'hr', 'psikologi', 'manajemen sdm', 'administrasi perkantoran', 'manajemen bisnis'],
    requiredSkills: ['rekrutmen dasar', 'administrasi karyawan', 'hris', 'onboarding', 'talent acquisition', 'hubungan industrial'],
    requiredTitleKeywords: ['hr', 'human resources', 'recruiter', 'rekrutmen', 'personalia', 'talent acquisition', 'people ops'],
  },
};

/**
 * Validates whether candidate has baseline qualification for gated specialized roles.
 * Returns true for open generalist roles (e.g. Operations, CS, Marketing, Sales, Retail).
 */
export function isCandidateEligibleForGatedRole(
  role: string,
  params: {
    major?: string;
    userSkills?: string[];
    experienceTitle?: string;
  }
): boolean {
  const rule = GATED_ROLE_RULES[role];
  if (!rule) return true; // Open transferable role

  const majorLower = (params.major || '').toLowerCase().trim();
  const expLower = (params.experienceTitle || '').toLowerCase().trim();
  const userSkills = params.userSkills || [];

  // 1. Major qualification check
  if (majorLower && rule.requiredMajors.some((m) => majorLower.includes(m))) {
    return true;
  }

  // 2. Prior experience / title keyword check
  if (expLower && rule.requiredTitleKeywords?.some((tk) => expLower.includes(tk))) {
    return true;
  }

  // 3. Explicit verified domain skill check
  if (userSkills.length > 0) {
    const hasDomainSkill = userSkills.some((us) => {
      const u = us.toLowerCase().trim();
      return rule.requiredSkills.some((rs) => u === rs || u.includes(rs) || rs.includes(u) || skillMatches(us, rs));
    });
    if (hasDomainSkill) {
      return true;
    }
  }

  return false;
}

function countSkillMatches(userSkills: string[], bpSkills: string[]): { matched: string[]; gap: string[] } {
  const cleanSkills = filterOutLanguageSkills(userSkills);
  const matched: string[] = [];
  const gap: string[] = [];
  for (const bpSkill of bpSkills) {
    const found = cleanSkills.some(us => skillMatches(us, bpSkill));
    if (found) matched.push(bpSkill);
    else gap.push(bpSkill);
  }
  return { matched, gap };
}

// ─── Blueprint Matching ─────────────────────────────────────────

function findClosestBlueprint(
  roleInput: string,
  dynamicBlueprints?: DynamicRoleBlueprint[]
): RoleBlueprint | null {
  if (!roleInput || !roleInput.trim()) return null;
  const normalized = roleInput.toLowerCase().trim();

  // 1) Exact key match in static blueprints
  for (const [key, bp] of Object.entries(ROLE_BLUEPRINTS)) {
    if (key.toLowerCase() === normalized) return bp;
  }

  // 2) Alias table
  for (const [alias, bpKey] of Object.entries(ROLE_ALIASES)) {
    if (normalized === alias || normalized.includes(alias) || alias.includes(normalized)) {
      const bp = ROLE_BLUEPRINTS[bpKey];
      if (bp) return bp;
    }
  }

  // 3) Partial key match in static blueprints
  for (const [key, bp] of Object.entries(ROLE_BLUEPRINTS)) {
    const kl = key.toLowerCase();
    if (normalized.includes(kl) || kl.includes(normalized)) {
      return bp;
    }
  }

  // 4) Check dynamic learned blueprints (Self-Learning from community & Master Market Data)
  if (Array.isArray(dynamicBlueprints) && dynamicBlueprints.length > 0) {
    for (const dyn of dynamicBlueprints) {
      const dynLower = (dyn.role_name || '').toLowerCase().trim();
      if (!dynLower) continue;

      let isMatch = dynLower === normalized || normalized.includes(dynLower) || dynLower.includes(normalized);

      // Check market aliases & slang in dynamic blueprint details
      if (!isMatch && Array.isArray(dyn.details?.market_aliases_and_slang)) {
        isMatch = dyn.details.market_aliases_and_slang.some((alias) => {
          const al = alias.toLowerCase().trim();
          return al && (normalized === al || normalized.includes(al) || al.includes(normalized));
        });
      }

      if (isMatch) {
        return {
          title: dyn.role_name,
          category: (dyn.category as any) || 'other',
          essentialSkills: dyn.top_essential_skills || [],
          niceToHaveSkills: dyn.top_nicetohave_skills || [],
          relatedTransitionalRoles: [],
          typicalStrengths: [
            dyn.top_essential_skills?.length
              ? `Keahlian terpopuler: ${dyn.top_essential_skills.slice(0, 2).join(' & ')}`
              : 'Kemampuan beradaptasi tinggi',
          ],
          typicalGaps: [
            dyn.top_essential_skills?.length > 2
              ? `Peningkatan di: ${dyn.top_essential_skills.slice(2, 4).join(' & ')}`
              : 'Pendalaman keahlian spesifik industri',
          ],
          transferableBridges: dyn.details?.transferable_experience_bridges || [],
          toolsAndPlatforms: dyn.details?.tools_and_platforms || [],
          localRequirements: dyn.details?.local_context_requirements || [],
          isLearned: true,
          entryCount: dyn.entry_count || 1,
        };
      }
    }
  }

  // 5) Not found
  return null;
}

// ─── Score Computation ──────────────────────────────────────────

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

/**
 * Checks if two role titles are variants of the same canonical role
 * (e.g. "Project Manager" vs "Project Manager / Scrum Master", "PM" vs "Project Manager")
 */
export function areRolesSimilar(roleA: string, roleB: string): boolean {
  const a = roleA.toLowerCase().trim();
  const b = roleB.toLowerCase().trim();
  if (!a || !b) return false;
  if (a === b) return true;

  // Filter out invalid/junk names (e.g. containing company/location suffixes like " - yogyakarta", "pt ")
  if (/(\s-\s|pt\s|^pt\.|\bcorp\b|\bltd\b)/i.test(a) || /(\s-\s|pt\s|^pt\.|\bcorp\b|\bltd\b)/i.test(b)) {
    return true;
  }

  // Direct substring inclusion (e.g. "Project Manager" inside "Project Manager / Scrum Master")
  if (a.includes(b) || b.includes(a)) {
    return true;
  }

  // Token overlap check
  const tokensA = a.split(/[\s/&,-]+/).filter((t) => t.length > 2);
  const tokensB = b.split(/[\s/&,-]+/).filter((t) => t.length > 2);
  if (tokensA.length === 0 || tokensB.length === 0) return false;

  const common = tokensA.filter((t) => tokensB.includes(t));
  const minLen = Math.min(tokensA.length, tokensB.length);
  return common.length / minLen >= 0.6;
}

/**
 * Deduplicates an array of CareerPathOption to ensure no two similar roles appear together.
 * Preserves the highest-scoring unique roles.
 */
export function deduplicateRolePaths(paths: CareerPathOption[]): CareerPathOption[] {
  const result: CareerPathOption[] = [];
  for (const path of paths) {
    // Skip junk company/location names
    if (/(\s-\s|pt\s|^pt\.|\bcorp\b|\bltd\b)/i.test(path.role)) {
      continue;
    }
    const isDuplicate = result.some((r) => areRolesSimilar(r.role, path.role));
    if (!isDuplicate) {
      result.push(path);
    }
  }
  return result;
}

interface EvalParams {
  userSkills: string[];
  educationLevel: string;
  major: string;
  hasExperience: boolean | null | undefined;
  experienceTitle?: string;
  experienceCompany?: string;
}

function evaluateRoleFit(
  bp: RoleBlueprint,
  params: EvalParams,
  isUserTarget: boolean = false,
): CareerPathOption {
  const { userSkills, educationLevel, major, hasExperience, experienceTitle } = params;

  const essential = countSkillMatches(userSkills, bp.essentialSkills);
  const niceToHave = countSkillMatches(userSkills, bp.niceToHaveSkills);

  // Onboarding Adaptive Denominator:
  // When users quickly fill 1-4 skills during onboarding, evaluate match against provided input
  // rather than punishing them with exhaustive professional requirements.
  const userSkillCount = userSkills.length;
  const isLightweight = userSkillCount > 0 && userSkillCount <= 4;
  const essentialDenom = isLightweight
    ? Math.min(bp.essentialSkills.length, Math.max(2, userSkillCount))
    : (bp.essentialSkills.length || 1);
  const essentialRatio = essentialDenom > 0 ? clamp(essential.matched.length / essentialDenom, 0, 1) : 0;

  const niceDenom = isLightweight
    ? Math.min(bp.niceToHaveSkills.length, Math.max(2, userSkillCount))
    : (bp.niceToHaveSkills.length || 1);
  const niceRatio = niceDenom > 0 ? clamp(niceToHave.matched.length / niceDenom, 0, 1) : 0;

  // Base skill match (up to 70 points: 55 for essential, 15 for nice-to-have)
  const skillScore = (essentialRatio * 55) + (niceRatio * 15);

  // Experience title direct relevance (up to 25 points)
  let titleBonus = 0;
  if (hasExperience && experienceTitle) {
    const expLower = experienceTitle.toLowerCase();
    const bpLower = bp.title.toLowerCase();
    if (
      expLower.includes(bpLower) ||
      bpLower.includes(expLower) ||
      areRolesSimilar(experienceTitle, bp.title) ||
      ROLE_ALIASES[expLower] === bp.title
    ) {
      titleBonus = 25; // Direct proven title match (e.g. was already Project Manager / Coordinator)
    } else if (bp.relatedTransitionalRoles.some((r) => expLower.includes(r.toLowerCase()))) {
      titleBonus = 16; // Related experience
    } else {
      const bpWords = bpLower.split(/[\s/&,-]+/).filter((w) => w.length > 2);
      const hasWordMatch = bpWords.some((w) => expLower.includes(w));
      if (hasWordMatch) {
        titleBonus = 18;
      } else {
        titleBonus = 4; // General work experience
      }
    }
  } else if (hasExperience) {
    titleBonus = 4;
  }

  // Profile / Education level bonus (aligned with semantic diagnosis)
  let eduBonus = 0;
  const eduLevel = (educationLevel || '').toUpperCase();
  if (['S1', 'D4', 'S2', 'S3'].includes(eduLevel)) eduBonus = 6;
  else if (['D3'].includes(eduLevel)) eduBonus = 4;
  else if (['SMK'].includes(eduLevel)) eduBonus = 4;
  else if (['SMA'].includes(eduLevel)) eduBonus = 3;

  // Starter bonus for entry-level / fresh grad candidates
  const starterBonus = !hasExperience ? 2 : 0;

  // Major / Study field relevance (up to 6 points)
  let majorBonus = 0;
  const majorLower = (major || '').toLowerCase();
  const categoryKeywords: Record<string, string[]> = {
    tech: [
      'informatika', 'komputer', 'sistem informasi', 'software', 'teknik', 'it', 'programming', 'elektro',
      'rekayasa perangkat lunak', 'rpl', 'tkj', 'teknik komputer dan jaringan', 'sistem komputer', 'perangkat lunak',
      'cyber security', 'data science', 'web development',
    ],
    design: [
      'desain', 'design', 'seni', 'visual', 'dkv', 'multimedia', 'arsitektur', 'desain grafis', 'desain komunikasi visual',
      'animasi', 'interior',
    ],
    marketing: [
      'pemasaran', 'marketing', 'komunikasi', 'advertising', 'public relation', 'ilmu komunikasi', 'jurnalistik',
      'pr', 'humas', 'hubungan masyarakat', 'digital marketing',
    ],
    business: [
      'manajemen', 'bisnis', 'business', 'administrasi bisnis', 'ekonomi', 'administrasi perkantoran', 'manajemen bisnis',
      'sdm', 'sumber daya manusia', 'human resources', 'human resource', 'hr', 'psikologi', 'manajemen sdm',
    ],
    finance: [
      'akuntansi', 'keuangan', 'finance', 'ekonomi', 'perbankan', 'pajak', 'perpajakan', 'administrasi keuangan',
      'akuntansi keuangan', 'syariah',
    ],
    operations: [
      'manajemen', 'administrasi', 'logistik', 'supply chain', 'event', 'turnamen', 'administrasi perkantoran',
      'perhotelan', 'operasional',
    ],
    creative: [
      'desain', 'seni', 'fashion', 'multimedia', 'film', 'fotografi', 'animasi', 'tata busana', 'broadcasting',
    ],
    fnb_retail: [
      'perhotelan', 'pariwisata', 'tata boga', 'culinary', 'hospitality', 'fitness', 'kebugaran', 'senam', 'retail', 'tata hidang',
    ],
    education: [
      'pendidikan', 'keguruan', 'pgsd', 'teaching', 'olahraga', 'kepelatihan', 'penjaskes', 'pjok', 'keolahragaan', 'atletik',
      'fkip', 'bimbingan konseling', 'pendidikan bahasa',
    ],
    product: ['informatika', 'manajemen', 'bisnis', 'sistem informasi', 'komputer', 'teknologi informasi'],
    other: [
      'olahraga', 'kepelatihan', 'kebugaran', 'kesehatan', 'medis', 'pertanian', 'keolahragaan', 'atletik',
      'keperawatan', 'kebidanan', 'farmasi', 'hukum', 'rekam medis',
    ],
  };
  const relevantKeywords = categoryKeywords[bp.category] || [];
  if (majorLower && relevantKeywords.some((kw) => majorLower.includes(kw))) {
    majorBonus = 6;
  }

  // Domain education synergy: when candidate's field of study aligns with the role category AND has matching skills
  let domainSynergy = 0;
  if (majorBonus > 0 && essential.matched.length > 0) {
    domainSynergy = 6;
  }

  // Synergy bonus for candidates with strong skill + title alignment
  let alignmentBonus = 0;
  if (essentialRatio >= 0.5 && titleBonus >= 16) {
    alignmentBonus = 8;
  }

  // Aspiration bonus for chosen target role
  const targetAspirationBonus = isUserTarget ? 6 : 0;

  // Lightweight starter momentum bonus when at least 1 essential skill matches
  const starterMomentum = isLightweight && essential.matched.length > 0 ? 8 : 0;

  let totalScore = Math.round(
    skillScore + titleBonus + eduBonus + starterBonus + majorBonus + domainSynergy + alignmentBonus + targetAspirationBonus + starterMomentum
  );

  // Gated specialized profession qualification check
  const isEligible = isCandidateEligibleForGatedRole(bp.title, params);
  if (!isEligible) {
    if (isUserTarget) {
      // User explicitly typed this role as goal, but has high qualification gap
      totalScore = Math.min(totalScore, 42);
    } else {
      // Automated recommendation: severely cap so it never hijacks alternatives
      totalScore = Math.min(totalScore, 28);
    }
  }

  const finalScore = clamp(totalScore, isUserTarget ? 25 : 15, 96);

  const allMatched = [...essential.matched, ...niceToHave.matched];

  // Determine if candidate is pursuing a Career Switch
  const isCareerSwitch = Boolean(
    isUserTarget &&
    (majorBonus === 0 || titleBonus <= 4) &&
    (hasExperience || eduBonus >= 2) &&
    essentialRatio < 0.65
  );

  return {
    role: bp.title,
    fitScore: finalScore,
    isPrimaryTarget: isUserTarget,
    isCareerSwitch,
    isLearned: bp.isLearned,
    isGatedBlocked: !isEligible,
    entryCount: bp.entryCount,
    tagline: !isEligible
      ? 'Jalur profesi khusus yang membutuhkan kualifikasi domain'
      : isCareerSwitch
      ? 'Target transisi karier baru'
      : isUserTarget
      ? 'Target posisi incaranmu'
      : 'Jalur alternatif yang relevan dengan keahlianmu',
    matchedSkills: allMatched.length > 0 ? allMatched.slice(0, 4) : [],
    gapSkills: essential.gap.slice(0, 3),
  };
}

// ─── Achievement & Impact Extractor ─────────────────────────────

/**
 * Extracts quantifiable achievements or key impact highlights from candidate's work experiences and projects.
 * Enforces strict filtering against passive job descriptions (e.g. "bertanggung jawab", "tugas meliputi").
 * Translates common English achievement phrases into clean Indonesian and cuts strictly on word boundaries.
 */
export function extractTopAchievement(
  experiences?: any[],
  projects?: any[],
  topAchievementSnippet?: string | null
): string | null {
  // If a pre-synthesized AI snippet is provided from CV scan, use it directly
  if (topAchievementSnippet && typeof topAchievementSnippet === 'string' && topAchievementSnippet.trim().length >= 8) {
    return cleanAchievementSnippet(topAchievementSnippet.trim());
  }

  const combinedTexts: string[] = [];

  if (Array.isArray(experiences) && experiences.length > 0) {
    for (const exp of experiences) {
      if (typeof exp.description === 'string' && exp.description.trim()) {
        combinedTexts.push(exp.description);
      }
      if (Array.isArray(exp.highlights)) {
        combinedTexts.push(...exp.highlights.filter((h: any) => typeof h === 'string' && h.trim()));
      }
      if (Array.isArray(exp.achievements)) {
        combinedTexts.push(...exp.achievements.filter((a: any) => typeof a === 'string' && a.trim()));
      }
    }
  }

  if (Array.isArray(projects) && projects.length > 0) {
    for (const proj of projects) {
      if (typeof proj.description === 'string' && proj.description.trim()) {
        combinedTexts.push(proj.description);
      }
      if (Array.isArray(proj.highlights)) {
        combinedTexts.push(...proj.highlights.filter((h: any) => typeof h === 'string' && h.trim()));
      }
    }
  }

  if (combinedTexts.length === 0) return null;

  // Split into sentences and bullet points
  const rawPoints: string[] = [];
  for (const block of combinedTexts) {
    const lines = block.split(/[\n\r•▪\-\*\;]+/);
    for (const line of lines) {
      const clean = line.trim().replace(/^[\d\.\s\-\*\•\▪]+/, '').trim();
      // Skip boilerplate / passive statements
      if (/^(tanggung\s*jawab|tugas|bertanggung\s*jawab|jobdesk|deskripsi\s*kerja|kewajiban|syarat|kualifikasi|responsible for)\b/i.test(clean)) {
        continue;
      }
      if (clean.length >= 12 && clean.length <= 180) {
        rawPoints.push(clean);
      }
    }
  }

  if (rawPoints.length === 0) return null;

  // 1. Level 1 Priority: Points containing percentage or measurable metrics (e.g. 80%, 15 sprint, Rp 50jt)
  const metricPoint = rawPoints.find((p) =>
    /\b(\d+%\s*|\d+\s*persen|\d+\+?\s*(proyek|klien|projects?|clients?|pengguna|user|sprint|tim|teams?|anggota|transaksi|cabang|event|siswa|peserta|artikel)|rp\.?\s*\d+|juta|miliar)\b/i.test(p)
  );
  if (metricPoint) {
    return cleanAchievementSnippet(metricPoint);
  }

  // 2. Level 2 Priority: Points with strong action verbs (berhasil, meningkatkan, memimpin, mengoptimalkan, dsb)
  const actionPoint = rawPoints.find((p) =>
    /\b(berhasil|meningkatkan|mengoptimalkan|mengurangi|memimpin|mengelola|merancang|mengkoordinasikan|mengembangkan|meluncurkan|achieved|increased|reduced|managed|led|directed|delivered)\b/i.test(p)
  );
  if (actionPoint) {
    return cleanAchievementSnippet(actionPoint);
  }

  return null;
}

function cleanAchievementSnippet(text: string): string {
  let s = text.trim();

  // Smart heuristic normalization for common English bullet patterns into clean Indonesian
  s = s
    .replace(/^directed\s+a\s+portfolio\s+of\s+(\d+)\s+client\s+projects,\s*ensuring\s+(\d+%)\s+on-time\s+delivery/i, 'Memimpin $1 proyek klien dengan ketepatan waktu $2')
    .replace(/^directed\s+a\s+portfolio\s+of\s+(\d+)\s+client\s+projects/i, 'Memimpin portofolio $1 proyek klien')
    .replace(/^managed\s+(\d+)\s+sprints?\s+with\s+(\d+)\s+team\s+members?/i, 'Mengelola $1 sprint bersama $2 anggota tim')
    .replace(/^increased\s+(?:team\s+)?efficiency\s+(?:by|up\s+to)\s+(\d+%)/i, 'Meningkatkan efisiensi kerja hingga $1')
    .replace(/^reduced\s+(?:operational\s+)?costs?\s+(?:by|up\s+to)\s+(\d+%)/i, 'Mereduksi biaya operasional hingga $1')
    .replace(/^led\s+a\s+team\s+of\s+(\d+)/i, 'Memimpin tim $1 orang')
    .replace(/\bensuring\s+(\d+%)\s+on-time\s+delivery\b/i, 'ketepatan waktu $1')
    .replace(/\bensuring\s+(\d+%)\b/i, 'ketercapaian $1');

  // Remove trailing punctuation
  s = s.replace(/[\.\;\:\,\-]+$/, '').trim();

  // Capitalize first letter
  if (s.length > 0) {
    s = s.charAt(0).toUpperCase() + s.slice(1);
  }

  // Preserve full snippet without premature cutting (up to 250 chars)
  const MAX_CHARS = 250;
  if (s.length > MAX_CHARS) {
    const trimmed = s.slice(0, MAX_CHARS);
    const lastSpaceIndex = trimmed.lastIndexOf(' ');
    if (lastSpaceIndex > 100) {
      s = trimmed.slice(0, lastSpaceIndex) + '...';
    } else {
      s = trimmed + '...';
    }
  }

  return s;
}

// ─── Strength & Gap Derivation ──────────────────────────────────

export function extractGapSkills(userSkills: string[], bp: RoleBlueprint): string[] {
  const cleanSkills = filterOutLanguageSkills(userSkills);
  const essential = countSkillMatches(cleanSkills, bp.essentialSkills);
  return essential.gap;
}

export function extractMatchedSkills(userSkills: string[], bp: RoleBlueprint): string[] {
  const cleanSkills = filterOutLanguageSkills(userSkills);
  const essential = countSkillMatches(cleanSkills, bp.essentialSkills);
  const niceToHave = countSkillMatches(cleanSkills, bp.niceToHaveSkills);
  return [...essential.matched, ...niceToHave.matched];
}

export function deriveTopStrength(
  userSkills: string[],
  bp: RoleBlueprint,
  topAchievement?: string | null
): string {
  const cleanSkills = filterOutLanguageSkills(userSkills);
  const essential = countSkillMatches(cleanSkills, bp.essentialSkills);

  // Level 1: Verified measurable achievement from work experience / projects
  if (topAchievement) {
    if (essential.matched.length > 0) {
      return `Pencapaian: "${topAchievement}" (${essential.matched.length} skill inti terpenuhi)`;
    }
    return `Pencapaian: "${topAchievement}"`;
  }

  // Level 2: Strong skill match foundation
  if (essential.matched.length >= 3) {
    return `Penguasaan ${essential.matched.slice(0, 2).join(' & ')} (${essential.matched.length} dari ${bp.essentialSkills.length} keahlian inti)`;
  }

  if (essential.matched.length > 0) {
    return `Penguasaan ${essential.matched.join(' & ')} (${essential.matched.length} dari ${bp.essentialSkills.length} keahlian inti)`;
  }

  // Level 3: Fresh graduate / general foundational skills
  if (cleanSkills.length > 0) {
    return `Keahlian di bidang ${cleanSkills.slice(0, 2).join(' & ')}`;
  }

  return bp.typicalStrengths[0] || 'Problem Solving & Critical Thinking';
}

export function deriveTopGap(userSkills: string[], bp: RoleBlueprint): string {
  const cleanSkills = filterOutLanguageSkills(userSkills);
  const essential = countSkillMatches(cleanSkills, bp.essentialSkills);

  if (essential.gap.length === 0) {
    return bp.typicalGaps[0] || 'Pendalaman spesialisasi lanjutan';
  }

  if (essential.gap.length <= 2) {
    return essential.gap.join(' & ');
  }

  return `${essential.gap[0]} dan ${essential.gap.length - 1} keahlian inti lainnya`;
}

// ─── Contextual Mentor Narrative Synthesizer ─────────────────────

export function synthesizeMentorNarrative(params: {
  educationLevel?: string;
  major?: string;
  hasExperience?: boolean | null;
  experienceTitle?: string;
  experienceCompany?: string;
  userSkills?: string[];
  primaryRole: string;
  primaryFitScore: number;
  matchedSkills?: string[];
  gapSkills?: string[];
  realisticTransitionRole?: string;
  topAchievement?: string | null;
  isCareerSwitch?: boolean;
  aimingChoice?: 'know_role' | 'exploring' | 'open_opportunities';
}): MentorNarrative {
  const {
    educationLevel = '',
    major = '',
    hasExperience,
    experienceTitle = '',
    experienceCompany = '',
    userSkills = [],
    primaryRole,
    primaryFitScore,
    matchedSkills = [],
    gapSkills = [],
    realisticTransitionRole = '',
    topAchievement,
    isCareerSwitch = false,
    aimingChoice = 'know_role',
  } = params;

  // 1. Build Background Hook (Pendidikan & Almamater)
  let backgroundHook = '';
  const eduUpper = educationLevel.toUpperCase();
  const majorClean = major.trim();
  const majorLower = majorClean.toLowerCase();

  // Detect cross-domain backgrounds
  const isSportsField = /olahraga|kepelatihan|penjaskes|atletik|fitness|kebugaran|pelatih/i.test(majorLower + ' ' + experienceTitle);
  const isMedical = /dokter|medis|kedokteran|perawat|keperawatan|kebidanan|farmasi|kesehatan/i.test(majorLower + ' ' + experienceTitle);
  const isEducationField = /pendidikan|keguruan|guru|pgsd|pengajar|tutor/i.test(majorLower + ' ' + experienceTitle);
  const isEngineeringField = /sipil|mesin|elektro|industri|arsitektur|pertambangan/i.test(majorLower + ' ' + experienceTitle);
  const isLegalField = /hukum|law|legal/i.test(majorLower + ' ' + experienceTitle);
  const isFinanceField = /akuntansi|keuangan|finance|pajak|perbankan/i.test(majorLower + ' ' + experienceTitle);

  if (isCareerSwitch) {
    if (isSportsField) {
      backgroundHook = `Langkah berani beralih haluan dari latar belakang kepelatihan dan olahraga menuju ${primaryRole} membekalimu daya tahan mental tinggi, komunikasi persuasif dengan berbagai karakter, dan kepemimpinan tim yang tangguh.`;
    } else if (isMedical) {
      backgroundHook = `Beralih karier dari bidang medis ke ${primaryRole} adalah langkah berani yang didukung daya tahan krisis, empati, dan ketelitian prosedur yang tinggi.`;
    } else if (isEducationField) {
      backgroundHook = `Transisi karier dari dunia pendidikan ke ${primaryRole} membekalimu komunikasi persuasif dan kemampuan membimbing tim secara terstruktur.`;
    } else if (isEngineeringField) {
      backgroundHook = `Beralih haluan dari latar belakang teknik ke ${primaryRole} memperkuat daya analisis kuantitatif dan pemecahan masalah berbasis data.`;
    } else if (isLegalField) {
      backgroundHook = `Langkah ekspansi dari ranah hukum ke ${primaryRole} memberimu ketajaman negosiasi dan kepatuhan alur kerja yang disiplin.`;
    } else if (isFinanceField) {
      backgroundHook = `Peralihan dari bidang keuangan ke ${primaryRole} melatih kepekaan anggaran, efisiensi biaya, dan ketelitian detail tingkat tinggi.`;
    } else if (majorClean) {
      backgroundHook = `Keputusan beralih karier dari ${majorClean} menuju ${primaryRole} memperluas perspektif dengan modal pemikiran yang unik dan berharga.`;
    } else {
      backgroundHook = `Beralih haluan ke ${primaryRole} membuktikan tekad belajar yang adaptif dan siap menjawab kebutuhan industri baru.`;
    }
  } else if (eduUpper && majorClean) {
    if (eduUpper.includes('SMK')) {
      backgroundHook = `Latar belakang ${eduUpper} ${majorClean} memberimu fondasi keahlian praktis yang langsung relevan di industri.`;
    } else if (['S1', 'D4', 'D3'].some((d) => eduUpper.includes(d))) {
      backgroundHook = `Bekal pendidikan ${eduUpper} ${majorClean} melatih pemahaman konseptual dan daya analisis yang solid.`;
    } else {
      backgroundHook = `Pendidikan di ${eduUpper} ${majorClean} membekalimu adaptasi dan kemauan belajar yang tinggi.`;
    }
  } else if (eduUpper) {
    backgroundHook = `Sebagai lulusan ${eduUpper}, kamu memiliki modal potensi dan fleksibilitas untuk berkembang di berbagai peran.`;
  } else {
    backgroundHook = 'Profil dan keahlianmu menunjukkan potensi yang siap diarahkan ke target karier nyata.';
  }

  // 2. Transferable Asset (Pengalaman Kerja / Proyek / Skill / Pencapaian Nyata)
  let transferableAsset = '';
  const expTitle = experienceTitle.trim();
  const expComp = experienceCompany.replace(/\s*-\s*.*$/, '').replace(/^PT\.?\s+/i, '').trim();

  if (topAchievement) {
    transferableAsset = `Riwayat kerjamu mencatat pencapaian nyata: "${topAchievement}"—bukti rekam jejak terukur yang sangat dicari perekrut.`;
  } else if (hasExperience && expTitle) {
    const titleLower = expTitle.toLowerCase();
    const where = expComp ? ` di ${expComp}` : '';
    if (/kasir|store|pramuniaga|toko|retail/i.test(titleLower)) {
      transferableAsset = `Pengalamanmu sebagai ${expTitle}${where} melatih ketelitian transaksi, manajemen stok, dan pelayanan pelanggan langsung.`;
    } else if (/admin|administrasi|data|entry/i.test(titleLower)) {
      transferableAsset = `Pengalaman sebagai ${expTitle}${where} membentuk kebiasaan kerja rapi, pengarsipan tertib, dan akurasi tinggi.`;
    } else if (/barista|f&b|waiter|waitress|service/i.test(titleLower)) {
      transferableAsset = `Pengalaman di bidang F&B sebagai ${expTitle}${where} membentuk ketahanan kerja cepat, disiplin tinggi, dan komunikasi pelanggan prima.`;
    } else if (/sales|marketing|penjualan|promotor/i.test(titleLower)) {
      transferableAsset = `Pengalaman sebagai ${expTitle}${where} mengasah kemampuan negosiasi, orientasi target, dan cara meyakinkan audiens.`;
    } else if (/desain|design|editor|kreatif|content/i.test(titleLower)) {
      transferableAsset = `Pengalaman kreatifmu sebagai ${expTitle}${where} melatih kepekaan visual, estetika, dan komunikasi pesan lewat media.`;
    } else if (/project|proyek|scrum|program/i.test(titleLower)) {
      transferableAsset = `Pengalaman praktis sebagai ${expTitle}${where} membuktikan kepemimpinan alur kerja, koordinasi tim, dan penyelesaian proyek nyata.`;
    } else if (/pelatih|coach|instruktur|atletik|fitness|olahraga/i.test(titleLower)) {
      transferableAsset = `Pengalaman praktis sebagai ${expTitle}${where} melatih komunikasi persuasif, bimbingan personal, dan kepemimpinan tim di bawah tekanan tinggi.`;
    } else {
      transferableAsset = `Pengalaman kerja praktis sebagai ${expTitle}${where} membuktikan etos kerja nyata dan adaptasi cepat di lingkungan profesional.`;
    }
  } else {
    const cleanSkills = filterOutLanguageSkills(userSkills);
    if (matchedSkills.length > 0) {
      transferableAsset = `Penguasaanmu pada ${matchedSkills.slice(0, 2).join(' & ')} membuktikan kamu sudah punya modal keahlian teknis yang aplikatif.`;
    } else if (cleanSkills.length > 0) {
      transferableAsset = `Keahlianmu pada ${cleanSkills.slice(0, 2).join(' & ')} adalah modal awal yang bisa kamu kembangkan ke peran ini.`;
    } else {
      transferableAsset = 'Motivasi belajar yang tinggi menjadi akselerator utama untuk menguasai peran ini dalam waktu singkat.';
    }
  }

  // 3. Actionable Next Step (Gap & Bridge to Target Role)
  let actionableNextStep = '';
  if (aimingChoice === 'exploring') {
    actionableNextStep = `Bandingkan opsi peran di atas untuk menemukan arah karier yang paling sejalan dengan minat dan modal keahlianmu.`;
  } else if (aimingChoice === 'open_opportunities') {
    actionableNextStep = `Posisi ini memiliki rasio kesiapan skill paling tinggi—prioritaskan untuk dilamar agar memperbesar peluang panggilan interview tercepat.`;
  } else if (gapSkills.length > 0) {
    const focusGaps = gapSkills.slice(0, 2).join(' dan ');
    actionableNextStep = `Langkah percepatan: lengkapi 1–2 keahlian kunci (${focusGaps}) untuk memaksimalkan peluang lolos screening CV.`;
  } else if (realisticTransitionRole && realisticTransitionRole !== primaryRole) {
    actionableNextStep = `Sebagai opsi cadangan strategis, posisi ${realisticTransitionRole} juga bisa kamu jadikan batu loncatan yang sangat ramah pemula.`;
  } else {
    actionableNextStep = `Profilmu sudah selaras optimal. Langkah berikutnya adalah menyusun CV yang menonjolkan pencapaianmu agar langsung dilirik HRD.`;
  }

  // 4. Headline
  let headline = '';
  if (aimingChoice === 'exploring') {
    headline = `Peta Spektrum Karier Berdasarkan Keahlianmu: ${primaryRole}`;
  } else if (aimingChoice === 'open_opportunities') {
    headline = `Peluang Lolos Screening Tercepat: ${primaryRole}`;
  } else if (isCareerSwitch) {
    headline = `Peluang Transisi Karier Menjanjikan ke ${primaryRole}`;
  } else if (primaryFitScore >= 80) {
    headline = `Peluang Kuat untuk Memulai Karier di ${primaryRole}`;
  } else if (primaryFitScore >= 65) {
    headline = `Pondasi Menjanjikan Menuju Peran ${primaryRole}`;
  } else {
    headline = `Langkah Awal Membangun Jalur ke ${primaryRole}`;
  }

  const fullNarrative = `${backgroundHook} ${transferableAsset} ${actionableNextStep}`;

  return {
    headline,
    backgroundStory: backgroundHook,
    transferableInsight: transferableAsset,
    nextStepAction: actionableNextStep,
    fullNarrative,
  };
}

// ─── Main Entry ─────────────────────────────────────────────────

export function computeCareerDiagnosis(params: {
  aimingChoice: 'know_role' | 'exploring' | 'open_opportunities';
  targetRoleInput?: string;
  userSkills?: string[];
  educationLevel?: string;
  major?: string;
  hasExperience?: boolean | null;
  experienceTitle?: string;
  experienceCompany?: string;
  experiences?: any[];
  projects?: any[];
  topAchievementSnippet?: string | null;
  dynamicBlueprints?: DynamicRoleBlueprint[];
}): CareerDiagnosisResult {
  const {
    aimingChoice,
    targetRoleInput,
    userSkills = [],
    educationLevel = '',
    major = '',
    hasExperience,
    experienceTitle = '',
    experienceCompany = '',
    experiences = [],
    projects = [],
    topAchievementSnippet,
    dynamicBlueprints = [],
  } = params;

  const topAchievement = extractTopAchievement(experiences, projects, topAchievementSnippet);
  const cleanUserSkills = filterOutLanguageSkills(userSkills);
  const rawRole = targetRoleInput?.trim() || '';
  const targetBp = findClosestBlueprint(rawRole, dynamicBlueprints);
  const isUnknownRole = !targetBp && rawRole.length > 0;

  const evalParams: EvalParams = {
    userSkills: cleanUserSkills,
    educationLevel,
    major,
    hasExperience,
    experienceTitle,
    experienceCompany,
  };

  // ── Unknown role: evaluate ALL blueprints, recommend top matches ──
  if (isUnknownRole) {
    const allScored = Object.values(ROLE_BLUEPRINTS)
      .filter((bp) => isCandidateEligibleForGatedRole(bp.title, evalParams))
      .map(bp => evaluateRoleFit(bp, evalParams, false))
      .sort((a, b) => b.fitScore - a.fitScore);

    const topPaths = deduplicateRolePaths(allScored).slice(0, 4);
    const best = topPaths[0];
    const bestBp = ROLE_BLUEPRINTS[best?.role || 'Staf Operasional'];

    if (topPaths.length > 0) {
      topPaths[0].isRealisticTransition = true;
    }

    const mentorNarrative = synthesizeMentorNarrative({
      educationLevel,
      major,
      hasExperience,
      experienceTitle,
      experienceCompany,
      userSkills: cleanUserSkills,
      primaryRole: rawRole,
      primaryFitScore: best?.fitScore || 65,
      matchedSkills: best?.matchedSkills || [],
      gapSkills: best?.gapSkills || [],
      realisticTransitionRole: best?.role || 'Staf Operasional',
      topAchievement,
    });

    return {
      aimingChoice,
      primaryRole: rawRole,
      primaryFitScore: best?.fitScore || 0,
      isUnknownRole: true,
      unknownRoleMessage: `Kami belum memiliki analisis khusus untuk "${rawRole}". Berdasarkan keahlianmu, berikut peran-peran yang paling cocok:`,
      topStrength: bestBp ? deriveTopStrength(cleanUserSkills, bestBp, topAchievement) : (cleanUserSkills.length > 0 ? `Keahlian di bidang ${cleanUserSkills.slice(0, 2).join(' & ')}` : 'Problem Solving & Kemauan Belajar'),
      topGap: bestBp ? deriveTopGap(cleanUserSkills, bestBp) : 'Eksplorasi keahlian spesifik untuk posisi ini',
      gapSkillsList: bestBp ? extractGapSkills(cleanUserSkills, bestBp) : [],
      matchedSkillsList: bestBp ? extractMatchedSkills(cleanUserSkills, bestBp) : cleanUserSkills,
      realisticTransition: {
        role: best?.role || 'Staf Operasional',
        fitScore: best?.fitScore || 0,
        reason: `Berdasarkan keahlianmu, ${best?.role || 'posisi ini'} mungkin jalur yang bisa kamu pertimbangkan.`,
      },
      suggestedPaths: topPaths,
      mentorNarrative,
    };
  }

  if (aimingChoice === 'know_role') {
    // ── Track 1: Known role (Static or Learned) ──
    const bp = targetBp || ROLE_BLUEPRINTS['Staf Operasional'];
    const primaryPath = evaluateRoleFit(bp, evalParams, true);

    // Evaluate ALL other blueprints across database to find genuine highest-matching alternatives (deduplicated)
    const allOtherOptions = deduplicateRolePaths(
      Object.values(ROLE_BLUEPRINTS)
        .filter((ob) => ob.title !== bp.title && !areRolesSimilar(ob.title, bp.title))
        .filter((ob) => isCandidateEligibleForGatedRole(ob.title, evalParams))
        .map((ob) => {
          const option = evaluateRoleFit(ob, evalParams, false);
          // If this role is explicitly defined in target blueprint's transitional pathways, apply domain synergy boost
          if (
            Array.isArray(bp.relatedTransitionalRoles) &&
            bp.relatedTransitionalRoles.some((r) => r.toLowerCase() === ob.title.toLowerCase() || areRolesSimilar(r, ob.title))
          ) {
            option.fitScore = clamp(option.fitScore + 14, 25, 92);
          }
          return option;
        })
        .sort((a, b) => b.fitScore - a.fitScore)
    );

    // Filter out generic fallback roles (like Admin Staff, Customer Service) if higher-fit domain-aligned alternatives exist
    const highFitOptions = allOtherOptions.filter(
      (opt) => opt.fitScore >= 55 || !['Admin Staff', 'Customer Service', 'Staf Operasional'].includes(opt.role)
    );
    const selectedAlternatives = (highFitOptions.length >= 3 ? highFitOptions : allOtherOptions).slice(0, 3);
    const isCareerSwitch = Boolean(primaryPath.isCareerSwitch);

    if (selectedAlternatives.length > 0) {
      selectedAlternatives[0].isRealisticTransition = true;
      if (isCareerSwitch && selectedAlternatives[0].fitScore >= 70) {
        selectedAlternatives[0].tagline = 'Posisi terkuat dari latar belakangmu';
      }
    }

    // Preserve primary target first, followed by top deduplicated alternatives
    const suggestedPaths = deduplicateRolePaths([primaryPath, ...selectedAlternatives]);
    const bestTransition = selectedAlternatives[0] || primaryPath;

    const mentorNarrative = synthesizeMentorNarrative({
      educationLevel,
      major,
      hasExperience,
      experienceTitle,
      experienceCompany,
      userSkills: cleanUserSkills,
      primaryRole: bp.title,
      primaryFitScore: primaryPath.fitScore,
      matchedSkills: primaryPath.matchedSkills,
      gapSkills: primaryPath.gapSkills,
      realisticTransitionRole: bestTransition.role,
      topAchievement,
      isCareerSwitch,
      aimingChoice: 'know_role',
    });

    return {
      aimingChoice,
      primaryRole: bp.title,
      primaryFitScore: primaryPath.fitScore,
      isUnknownRole: false,
      isCareerSwitch,
      isLearnedRole: bp.isLearned,
      learnedCount: bp.entryCount,
      unknownRoleMessage: '',
      topStrength: deriveTopStrength(cleanUserSkills, bp, topAchievement),
      topGap: deriveTopGap(cleanUserSkills, bp),
      gapSkillsList: extractGapSkills(cleanUserSkills, bp),
      matchedSkillsList: extractMatchedSkills(cleanUserSkills, bp),
      realisticTransition: {
        role: bestTransition.role,
        fitScore: bestTransition.fitScore,
        reason: bp.isLearned
          ? `${bp.title} dipetakan langsung dari tren profil kandidat nyata (${bp.entryCount || 1} kandidat).`
          : isCareerSwitch
          ? `${bestTransition.role} adalah posisi terkuat dari profilmu (${bestTransition.fitScore}% fit), sementara ${bp.title} adalah jalur transisi baru.`
          : bestTransition.role !== bp.title
          ? `${bestTransition.role} bisa jadi jalur transisi yang relevan (${bestTransition.fitScore}% fit) berdasarkan keahlianmu saat ini.`
          : `Profilmu sudah cukup sesuai untuk ${bp.title}.`,
      },
      suggestedPaths,
      mentorNarrative,
      transferableBridges: bp.transferableBridges || [],
      toolsAndPlatforms: bp.toolsAndPlatforms || [],
      localRequirements: bp.localRequirements || [],
    };
  } else if (aimingChoice === 'exploring') {
    // ── Track 2: Exploring (Category Diversity Spektrum) ──
    const allScored = Object.values(ROLE_BLUEPRINTS)
      .filter((b) => isCandidateEligibleForGatedRole(b.title, evalParams))
      .map((b) => evaluateRoleFit(b, evalParams, false))
      .sort((a, b) => b.fitScore - a.fitScore);
    const sorted = deduplicateRolePaths(allScored);

    const topPrimary = sorted[0] || evaluateRoleFit(ROLE_BLUEPRINTS['Staf Operasional'], evalParams, false);
    topPrimary.isPrimaryTarget = true;
    topPrimary.tagline = 'Rekomendasi kecocokan terkuat dari keahlianmu';

    const bp = ROLE_BLUEPRINTS[topPrimary.role] || Object.values(ROLE_BLUEPRINTS)[0];

    const exploredAlternatives: CareerPathOption[] = [];
    const usedCategories = new Set<string>();
    if (bp?.category) usedCategories.add(bp.category);

    // 1st pass: Pick roles from different categories with solid fitScore
    for (const opt of sorted.slice(1)) {
      if (exploredAlternatives.length >= 3) break;
      const optBp = ROLE_BLUEPRINTS[opt.role];
      const cat = optBp?.category || 'other';
      if (!usedCategories.has(cat) && !areRolesSimilar(opt.role, topPrimary.role)) {
        usedCategories.add(cat);
        const catLabel = ROLE_CATEGORY_LABELS[cat] || 'Bidang Terkait';
        exploredAlternatives.push({
          ...opt,
          tagline: `Opsi eksplorasi bidang ${catLabel}`,
        });
      }
    }

    // 2nd pass: Backfill from remaining highest fit options if fewer than 3
    for (const opt of sorted.slice(1)) {
      if (exploredAlternatives.length >= 3) break;
      if (
        opt.role !== topPrimary.role &&
        !exploredAlternatives.some((e) => e.role === opt.role || areRolesSimilar(e.role, opt.role))
      ) {
        const optBp = ROLE_BLUEPRINTS[opt.role];
        const catLabel = optBp?.category ? (ROLE_CATEGORY_LABELS[optBp.category] || 'Bidang Terkait') : 'Alternatif';
        exploredAlternatives.push({
          ...opt,
          tagline: `Opsi eksplorasi bidang ${catLabel}`,
        });
      }
    }

    if (exploredAlternatives.length > 0) {
      exploredAlternatives[0].isRealisticTransition = true;
    }

    const suggestedPaths = [topPrimary, ...exploredAlternatives];
    const bestTransition = exploredAlternatives[0] || topPrimary;

    const mentorNarrative = synthesizeMentorNarrative({
      educationLevel,
      major,
      hasExperience,
      experienceTitle,
      experienceCompany,
      userSkills: cleanUserSkills,
      primaryRole: topPrimary.role,
      primaryFitScore: topPrimary.fitScore,
      matchedSkills: topPrimary.matchedSkills,
      gapSkills: topPrimary.gapSkills,
      realisticTransitionRole: bestTransition.role,
      topAchievement,
      isCareerSwitch: false,
      aimingChoice: 'exploring',
    });

    return {
      aimingChoice,
      primaryRole: topPrimary.role,
      primaryFitScore: topPrimary.fitScore,
      isUnknownRole: false,
      isCareerSwitch: false,
      isLearnedRole: bp.isLearned,
      learnedCount: bp.entryCount,
      unknownRoleMessage: '',
      topStrength: deriveTopStrength(cleanUserSkills, bp, topAchievement),
      topGap: deriveTopGap(cleanUserSkills, bp),
      gapSkillsList: extractGapSkills(cleanUserSkills, bp),
      matchedSkillsList: extractMatchedSkills(cleanUserSkills, bp),
      realisticTransition: {
        role: bestTransition.role,
        fitScore: bestTransition.fitScore,
        reason: `${bestTransition.role} menjadi opsi alternatif terdekat untuk mengeksplorasi cabang karier baru.`,
      },
      suggestedPaths,
      mentorNarrative,
    };
  } else {
    // ── Track 3: Open Opportunities (Ready to Apply / Minimal Skill Gap) ──
    const allScored = Object.values(ROLE_BLUEPRINTS)
      .filter((b) => isCandidateEligibleForGatedRole(b.title, evalParams))
      .map((b) => evaluateRoleFit(b, evalParams, false));

    const readyScored = allScored
      .map((opt) => {
        const gapPenalty = (opt.gapSkills?.length || 0) * 8;
        const matchedBonus = (opt.matchedSkills?.length || 0) * 3;
        return {
          ...opt,
          readyScore: opt.fitScore - gapPenalty + matchedBonus,
        };
      })
      .sort((a, b) => b.readyScore - a.readyScore);

    const sortedReady = deduplicateRolePaths(readyScored);
    const topReady = sortedReady[0] || evaluateRoleFit(ROLE_BLUEPRINTS['Staf Operasional'], evalParams, false);
    topReady.isPrimaryTarget = true;
    topReady.tagline = 'Peluang lolos screening tercepat (modal skill paling siap)';

    const bp = ROLE_BLUEPRINTS[topReady.role] || Object.values(ROLE_BLUEPRINTS)[0];

    const readyAlternatives = sortedReady.slice(1, 4).map((alt) => ({
      ...alt,
      tagline:
        (alt.gapSkills?.length || 0) === 0
          ? 'Siap lamar tanpa gap skill (100% modal terpenuhi)'
          : `Hanya butuh pelengkap ${alt.gapSkills?.length} skill kunci`,
    }));

    if (readyAlternatives.length > 0) {
      readyAlternatives[0].isRealisticTransition = true;
    }

    const suggestedPaths = [topReady, ...readyAlternatives];
    const bestTransition = readyAlternatives[0] || topReady;

    const mentorNarrative = synthesizeMentorNarrative({
      educationLevel,
      major,
      hasExperience,
      experienceTitle,
      experienceCompany,
      userSkills: cleanUserSkills,
      primaryRole: topReady.role,
      primaryFitScore: topReady.fitScore,
      matchedSkills: topReady.matchedSkills,
      gapSkills: topReady.gapSkills,
      realisticTransitionRole: bestTransition.role,
      topAchievement,
      isCareerSwitch: false,
      aimingChoice: 'open_opportunities',
    });

    return {
      aimingChoice,
      primaryRole: topReady.role,
      primaryFitScore: topReady.fitScore,
      isUnknownRole: false,
      isCareerSwitch: false,
      isLearnedRole: bp.isLearned,
      learnedCount: bp.entryCount,
      unknownRoleMessage: '',
      topStrength: deriveTopStrength(cleanUserSkills, bp, topAchievement),
      topGap: deriveTopGap(cleanUserSkills, bp),
      gapSkillsList: extractGapSkills(cleanUserSkills, bp),
      matchedSkillsList: extractMatchedSkills(cleanUserSkills, bp),
      realisticTransition: {
        role: bestTransition.role,
        fitScore: bestTransition.fitScore,
        reason: `${bestTransition.role} memiliki probabilitas screening tinggi dengan gap kompetensi minimal.`,
      },
      suggestedPaths,
      mentorNarrative,
    };
  }
}

