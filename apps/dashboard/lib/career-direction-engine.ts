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
  isLearned?: boolean;
  entryCount?: number;
  tagline: string;
  matchedSkills: string[];
  gapSkills: string[];
}

export interface DynamicRoleBlueprint {
  role_name: string;
  category?: string;
  top_essential_skills: string[];
  top_nicetohave_skills: string[];
  entry_count?: number;
}

export interface CareerDiagnosisResult {
  aimingChoice: 'know_role' | 'exploring' | 'open_opportunities';
  primaryRole: string;
  primaryFitScore: number;
  topStrength: string;
  topGap: string;
  isUnknownRole: boolean;
  isLearnedRole?: boolean;
  learnedCount?: number;
  unknownRoleMessage: string;
  realisticTransition: {
    role: string;
    fitScore: number;
    reason: string;
  };
  suggestedPaths: CareerPathOption[];
}

// ─── Role Blueprint Database ────────────────────────────────────────

export interface RoleBlueprint {
  title: string;
  category: 'tech' | 'product' | 'marketing' | 'operations' | 'design' | 'business' | 'finance' | 'fnb_retail' | 'education' | 'creative';
  essentialSkills: string[];
  niceToHaveSkills: string[];
  relatedTransitionalRoles: string[];
  typicalStrengths: string[];
  typicalGaps: string[];
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
    relatedTransitionalRoles: ['Product Manager', 'Admin Staff', 'Business Analyst'],
    typicalStrengths: ['Koordinasi Tim & Jadwal Proyek', 'Dokumentasi Progress Terstruktur', 'Komunikasi Lintas Tim'],
    typicalGaps: ['Resource & Budget Management', 'Risk Assessment', 'Agile Methodology Mendalam'],
  },
  'Business Analyst': {
    title: 'Business Analyst',
    category: 'business',
    essentialSkills: ['Data Analysis', 'Excel & Spreadsheet', 'Problem Solving', 'Communication', 'Business Process'],
    niceToHaveSkills: ['SQL', 'Wireframing', 'Stakeholder Management', 'PowerBI', 'Requirements Documentation'],
    relatedTransitionalRoles: ['Data Analyst', 'Product Manager', 'Project Coordinator'],
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
  'pm': 'Product Manager',
  'product owner': 'Product Manager',
  'po': 'Product Manager',
  'project manager': 'Project Coordinator',
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

// ─── Skill Matching ─────────────────────────────────────────────

function skillMatches(userSkill: string, blueprintSkill: string): boolean {
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

  return hitCount / bTokens.length >= 0.6;
}

function countSkillMatches(userSkills: string[], bpSkills: string[]): { matched: string[]; gap: string[] } {
  const matched: string[] = [];
  const gap: string[] = [];
  for (const bpSkill of bpSkills) {
    const found = userSkills.some(us => skillMatches(us, bpSkill));
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

  // 4) Check dynamic learned blueprints (Self-Learning from community data)
  if (Array.isArray(dynamicBlueprints) && dynamicBlueprints.length > 0) {
    for (const dyn of dynamicBlueprints) {
      const dynLower = (dyn.role_name || '').toLowerCase().trim();
      if (!dynLower) continue;

      if (dynLower === normalized || normalized.includes(dynLower) || dynLower.includes(normalized)) {
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

interface EvalParams {
  userSkills: string[];
  educationLevel: string;
  major: string;
  hasExperience: boolean | null | undefined;
}

function evaluateRoleFit(
  bp: RoleBlueprint,
  params: EvalParams,
  isUserTarget: boolean = false,
): CareerPathOption {
  const { userSkills, educationLevel, major, hasExperience } = params;

  const essential = countSkillMatches(userSkills, bp.essentialSkills);
  const niceToHave = countSkillMatches(userSkills, bp.niceToHaveSkills);

  const essentialRatio = bp.essentialSkills.length > 0 ? essential.matched.length / bp.essentialSkills.length : 0;
  const niceRatio = bp.niceToHaveSkills.length > 0 ? niceToHave.matched.length / bp.niceToHaveSkills.length : 0;

  // Weighted: essential 70%, nice-to-have 20%, profile 10%
  let score = (essentialRatio * 70) + (niceRatio * 20);

  // Profile bonuses (max 10 points)
  if (hasExperience) score += 4;

  const eduLevel = (educationLevel || '').toUpperCase();
  if (['S1', 'D4', 'S2', 'S3'].includes(eduLevel)) score += 3;
  else if (['D3'].includes(eduLevel)) score += 2;
  else if (['SMK'].includes(eduLevel)) score += 1;

  const majorLower = (major || '').toLowerCase();
  const categoryKeywords: Record<string, string[]> = {
    tech: ['informatika', 'komputer', 'sistem informasi', 'software', 'teknik', 'it', 'programming', 'elektro'],
    design: ['desain', 'design', 'seni', 'visual', 'dkv', 'multimedia', 'arsitektur'],
    marketing: ['pemasaran', 'marketing', 'komunikasi', 'advertising', 'public relation', 'ilmu komunikasi', 'jurnalistik'],
    business: ['manajemen', 'bisnis', 'business', 'administrasi bisnis', 'ekonomi'],
    finance: ['akuntansi', 'keuangan', 'finance', 'ekonomi', 'perbankan', 'pajak'],
    operations: ['manajemen', 'administrasi', 'logistik', 'supply chain'],
    creative: ['desain', 'seni', 'fashion', 'multimedia', 'film', 'fotografi', 'animasi'],
    fnb_retail: ['perhotelan', 'pariwisata', 'tata boga', 'culinary', 'hospitality'],
    education: ['pendidikan', 'keguruan', 'pgsd', 'teaching'],
    product: ['informatika', 'manajemen', 'bisnis', 'sistem informasi'],
  };
  const relevantKeywords = categoryKeywords[bp.category] || [];
  if (majorLower && relevantKeywords.some(kw => majorLower.includes(kw))) {
    score += 3;
  }

  const finalScore = clamp(Math.round(score), 12, 97);

  const allMatched = [...essential.matched, ...niceToHave.matched];

  return {
    role: bp.title,
    fitScore: finalScore,
    isPrimaryTarget: isUserTarget,
    isLearned: bp.isLearned,
    entryCount: bp.entryCount,
    tagline: bp.isLearned
      ? `Dipelajari dari ${bp.entryCount || 1} profil kandidat serupa`
      : isUserTarget
      ? 'Target posisi incaranmu'
      : 'Jalur alternatif yang relevan dengan keahlianmu',
    matchedSkills: allMatched.length > 0 ? allMatched.slice(0, 4) : [],
    gapSkills: essential.gap.slice(0, 3),
  };
}

// ─── Strength & Gap Derivation ──────────────────────────────────

function deriveTopStrength(userSkills: string[], bp: RoleBlueprint): string {
  const essential = countSkillMatches(userSkills, bp.essentialSkills);

  if (essential.matched.length >= 3) {
    return `${essential.matched.slice(0, 2).join(' & ')} (${essential.matched.length} dari ${bp.essentialSkills.length} keahlian inti terpenuhi)`;
  }

  if (essential.matched.length > 0) {
    const relatedStrength = bp.typicalStrengths.find(s => {
      const sLower = s.toLowerCase();
      return essential.matched.some(m => {
        const first = m.toLowerCase().split(/[\s&]+/)[0];
        return first.length >= 3 && sLower.includes(first);
      });
    });
    return relatedStrength || bp.typicalStrengths[0];
  }

  if (userSkills.length > 0) {
    return `Keahlian di bidang ${userSkills.slice(0, 2).join(' & ')}`;
  }

  return 'Motivasi dan kemauan untuk belajar';
}

function deriveTopGap(userSkills: string[], bp: RoleBlueprint): string {
  const essential = countSkillMatches(userSkills, bp.essentialSkills);

  if (essential.gap.length === 0) {
    return bp.typicalGaps[0] || 'Pendalaman spesialisasi lanjutan';
  }

  if (essential.gap.length <= 2) {
    return essential.gap.join(' & ');
  }

  return `${essential.gap[0]} dan ${essential.gap.length - 1} keahlian inti lainnya`;
}

// ─── Main Entry ─────────────────────────────────────────────────

export function computeCareerDiagnosis(params: {
  aimingChoice: 'know_role' | 'exploring' | 'open_opportunities';
  targetRoleInput?: string;
  userSkills?: string[];
  educationLevel?: string;
  major?: string;
  hasExperience?: boolean | null;
  dynamicBlueprints?: DynamicRoleBlueprint[];
}): CareerDiagnosisResult {
  const {
    aimingChoice,
    targetRoleInput,
    userSkills = [],
    educationLevel = '',
    major = '',
    hasExperience,
    dynamicBlueprints = [],
  } = params;

  const rawRole = targetRoleInput?.trim() || '';
  const targetBp = findClosestBlueprint(rawRole, dynamicBlueprints);
  const isUnknownRole = !targetBp && rawRole.length > 0;

  const evalParams: EvalParams = { userSkills, educationLevel, major, hasExperience };

  // ── Unknown role: evaluate ALL blueprints, recommend top matches ──
  if (isUnknownRole) {
    const allScored = Object.values(ROLE_BLUEPRINTS)
      .map(bp => evaluateRoleFit(bp, evalParams, false))
      .sort((a, b) => b.fitScore - a.fitScore);

    const topPaths = allScored.slice(0, 4);
    const best = topPaths[0];
    const bestBp = ROLE_BLUEPRINTS[best.role];

    if (topPaths.length > 1) {
      topPaths[0].isRealisticTransition = true;
    }

    return {
      aimingChoice,
      primaryRole: rawRole,
      primaryFitScore: best?.fitScore || 0,
      isUnknownRole: true,
      unknownRoleMessage: `Kami belum memiliki analisis khusus untuk "${rawRole}". Berdasarkan keahlianmu, berikut peran-peran yang paling cocok:`,
      topStrength: bestBp ? deriveTopStrength(userSkills, bestBp) : (userSkills.length > 0 ? `Keahlian di bidang ${userSkills.slice(0, 2).join(' & ')}` : 'Motivasi dan kemauan untuk belajar'),
      topGap: bestBp ? deriveTopGap(userSkills, bestBp) : 'Eksplorasi keahlian spesifik untuk posisi ini',
      realisticTransition: {
        role: best?.role || 'Staf Operasional',
        fitScore: best?.fitScore || 0,
        reason: `Berdasarkan keahlianmu, ${best?.role || 'posisi ini'} mungkin jalur yang bisa kamu pertimbangkan.`,
      },
      suggestedPaths: topPaths,
    };
  }

  // ── Known role (Static or Learned) ──
  const bp = targetBp || ROLE_BLUEPRINTS['Staf Operasional'];
  const primaryPath = evaluateRoleFit(bp, evalParams, true);

  // Evaluate transitional roles
  const relatedOptions: CareerPathOption[] = [];
  for (const relTitle of bp.relatedTransitionalRoles) {
    const relBp = ROLE_BLUEPRINTS[relTitle];
    if (relBp && relBp.title !== bp.title) {
      relatedOptions.push(evaluateRoleFit(relBp, evalParams, false));
    }
  }

  // If transitional roles are empty (e.g. newly learned role), recommend top other blueprints
  if (relatedOptions.length < 3) {
    const allOthers = Object.values(ROLE_BLUEPRINTS)
      .filter(ob => ob.title !== bp.title && !relatedOptions.some(r => r.role === ob.title))
      .map(ob => evaluateRoleFit(ob, evalParams, false))
      .sort((a, b) => b.fitScore - a.fitScore);

    for (const opt of allOthers) {
      if (relatedOptions.length >= 3) break;
      relatedOptions.push(opt);
    }
  }

  // Sort all paths by score
  const suggestedPaths = [primaryPath, ...relatedOptions]
    .sort((a, b) => b.fitScore - a.fitScore)
    .slice(0, 4);

  // Mark best transition
  const bestTransition = suggestedPaths.find(p => p.role !== bp.title) || primaryPath;
  const bestTransitionInList = suggestedPaths.find(p => p.role === bestTransition.role);
  if (bestTransitionInList && bestTransitionInList.role !== bp.title) {
    bestTransitionInList.isRealisticTransition = true;
  }

  return {
    aimingChoice,
    primaryRole: bp.title,
    primaryFitScore: primaryPath.fitScore,
    isUnknownRole: false,
    isLearnedRole: bp.isLearned,
    learnedCount: bp.entryCount,
    unknownRoleMessage: '',
    topStrength: deriveTopStrength(userSkills, bp),
    topGap: deriveTopGap(userSkills, bp),
    realisticTransition: {
      role: bestTransition.role,
      fitScore: bestTransition.fitScore,
      reason: bp.isLearned
        ? `${bp.title} dipetakan langsung dari tren profil kandidat nyata (${bp.entryCount || 1} kandidat).`
        : bestTransition.role !== bp.title
        ? `${bestTransition.role} bisa jadi jalur transisi yang relevan (${bestTransition.fitScore}% fit) berdasarkan keahlianmu saat ini.`
        : `Profilmu sudah cukup sesuai untuk ${bp.title}.`,
    },
    suggestedPaths,
  };
}

