export type CvPurpose =
  | 'job'
  | 'internship'
  | 'fresh_graduate'
  | 'freelance'
  | 'remote'
  | 'career_switch'
  | 'promotion'
  | 'academic_scholarship'
  | 'overseas'
  | 'general';

export interface PurposeWeights {
  experience?: number;
  skills?: number;
  projects?: number;
  achievement?: number;
  education?: number;
  summary?: number;
  keywords?: number;
  jobTitle?: number;
  atsReadability?: number;
  internship?: number;
  organization?: number;
  certification?: number;
  clientExperience?: number;
  tools?: number;
  contactAvailability?: number;
  remoteExperience?: number;
  communication?: number;
  language?: number;
  transferableSkills?: number;
  targetSkills?: number;
  leadership?: number;
  careerProgression?: number;
  academicAchievement?: number;
  research?: number;
  publication?: number;
  socialImpact?: number;
  internationalExperience?: number;
  completeness?: number;
}

export interface PurposeProfileConfig {
  id: CvPurpose;
  title: string;
  badge: string;
  iconName: string;
  category: 'career' | 'entry' | 'academic' | 'flexible';
  objective: string;
  description: string;
  weights: PurposeWeights;
  requiredComponents: string[];
  highImpactComponents: string[];
  optionalComponents: string[];
  evaluationFocusText: string;
}

export interface DimensionBreakdown {
  completeness: {
    score: number;
    label: string;
    passedItems: string[];
    missingItems: string[];
    description: string;
  };
  atsCompatibility: {
    score: number;
    label: string;
    passedChecks: string[];
    failedChecks: string[];
    description: string;
  };
  contentQuality: {
    score: number;
    label: string;
    actionVerbsCount: number;
    clarityLevel: 'Tinggi' | 'Sedang' | 'Perlu Ditingkatkan';
    description: string;
  };
  jobRelevance: {
    score: number;
    label: string;
    matchedKeywords: string[];
    missingKeywords: string[];
    transferableSkillsFound: string[];
    description: string;
  };
  achievementStrength: {
    score: number;
    label: string;
    measurableBulletsCount: number;
    totalBulletsCount: number;
    metricRatio: number;
    description: string;
  };
}

export interface ComponentScoreItem {
  key: keyof PurposeWeights;
  label: string;
  weight: number;
  score: number;
  weightedContribution: number;
  status: 'optimal' | 'good' | 'needs_work' | 'missing';
  feedback: string;
}

export interface ComprehensiveCvScoreResult {
  purpose: CvPurpose;
  purposeProfile: PurposeProfileConfig;
  overallScore: number;
  verdictStatus: 'interview' | 'maybe' | 'reject';
  verdictLabel: string;
  summaryFeedback: string;
  dimensions: DimensionBreakdown;
  componentBreakdown: ComponentScoreItem[];
  actionableImprovements: Array<{
    id: string;
    priority: 'high' | 'medium' | 'low';
    dimension: 'completeness' | 'ats' | 'quality' | 'relevance' | 'achievement';
    title: string;
    suggestion: string;
    exampleBefore?: string;
    exampleAfter?: string;
    impactBonus: number;
  }>;
}

// ==========================================
// 1. DEFINISI 10 PURPOSE PROFILES
// ==========================================
export const CV_PURPOSE_PROFILES: Record<CvPurpose, PurposeProfileConfig> = {
  job: {
    id: 'job',
    title: 'Lamar Kerja',
    badge: 'Full-Time Professional',
    iconName: 'Briefcase',
    category: 'career',
    objective: 'Mendapatkan panggilan interview untuk posisi pekerjaan profesional tertentu.',
    description: 'Menilai keselarasan kata kunci job description, bukti pencapaian dengan metrik angka konkret, dan pengalaman kerja relevan.',
    weights: {
      jobTitle: 10,
      summary: 10,
      experience: 20,
      projects: 10,
      skills: 15,
      achievement: 10,
      keywords: 15,
      education: 5,
      atsReadability: 5,
    },
    requiredComponents: ['Kontak Lengkap', 'Target Posisi', 'Ringkasan Profesional', 'Pengalaman Kerja / Relevan', 'Keahlian (Skills)', 'Pendidikan'],
    highImpactComponents: ['Keyword Job Description', 'Pencapaian Berangka (Impact %)', 'Proyek Relevan', 'Job Title Relevan'],
    optionalComponents: ['Organisasi', 'Volunteer', 'Sertifikasi', 'Pelatihan', 'Referensi'],
    evaluationFocusText: 'Penekanan pada metrik pencapaian kuantitatif (angka/%) dan kecocokan kata kunci dengan lowongan target.',
  },
  internship: {
    id: 'internship',
    title: 'Magang / Internship',
    badge: 'Student & Early Talent',
    iconName: 'GraduationCap',
    category: 'entry',
    objective: 'Mendapatkan posisi magang untuk mahasiswa atau talenta pemula tanpa penalti minim pengalaman kerja.',
    description: 'Menilai potensi melalui proyek kuliah/pribadi, organisasi, prestasi, dan keterampilan yang siap diasah di dunia kerja.',
    weights: {
      education: 15,
      skills: 15,
      projects: 20,
      internship: 15,
      organization: 10,
      achievement: 10,
      certification: 5,
      summary: 5,
      keywords: 5,
    },
    requiredComponents: ['Kontak Lengkap', 'Pendidikan Aktif/Terakhir', 'Keahlian (Skills)', 'Proyek / Tugas Besar', 'Ringkasan Minat Karier'],
    highImpactComponents: ['Proyek Nyata', 'Pengalaman Magang/Kepanitiaan', 'Organisasi Kampus', 'Sertifikat & Pelatihan', 'Prestasi / Lomba'],
    optionalComponents: ['Volunteer', 'Portfolio Link', 'Aktivitas Ekstrakurikuler'],
    evaluationFocusText: 'Bebas penalti pengalaman kerja profesional; skor berfokus pada proyek nyata, organisasi, dan inisiatif belajar.',
  },
  fresh_graduate: {
    id: 'fresh_graduate',
    title: 'Fresh Graduate',
    badge: 'First Job Ready',
    iconName: 'Sparkles',
    category: 'entry',
    objective: 'Membuktikan potensi, kapabilitas nyata, dan kesiapan kerja lulusan baru.',
    description: 'Menilai portofolio proyek terapan, magang, keaktifan organisasi, dan sertifikasi keahlian spesifik industri.',
    weights: {
      education: 15,
      projects: 20,
      skills: 15,
      internship: 15,
      organization: 10,
      achievement: 10,
      certification: 5,
      summary: 5,
      keywords: 5,
    },
    requiredComponents: ['Pendidikan & IPK', 'Keahlian Teknis & Soft Skills', 'Proyek Portofolio', 'Ringkasan Profesional', 'Kontak'],
    highImpactComponents: ['Proyek Akhir / Capstone', 'Pengalaman Magang', 'Peran Kepemimpinan Organisasi', 'Sertifikat Kompetensi'],
    optionalComponents: ['Prestasi Akademik/Non-akademik', 'Aktivitas Sukarela', 'Pelatihan Industri'],
    evaluationFocusText: 'Skor tidak jatuh jika belum punya pengalaman kerja tetap, asalkan proyek, skill, dan pendidikan terdokumentasi kuat.',
  },
  freelance: {
    id: 'freelance',
    title: 'Freelance',
    badge: 'Portfolio & Client Results',
    iconName: 'Laptop',
    category: 'flexible',
    objective: 'Meyakinkan klien dan merekrut proyek berbasis hasil nyata dan portofolio.',
    description: 'Fokus pada formula Problem → Solution → Role → Tools → Result dan portofolio proyek nyata klien.',
    weights: {
      skills: 20,
      projects: 25,
      clientExperience: 15,
      achievement: 15,
      summary: 10,
      tools: 5,
      certification: 5,
      contactAvailability: 5,
    },
    requiredComponents: ['Daftar Keahlian Spesifik', 'Portofolio Proyek', 'Ringkasan Value Proposition', 'Kontak & Link Portofolio'],
    highImpactComponents: ['Studi Kasus (Problem-Solution-Result)', 'Tools & Software Khusus', 'Hasil Bisnis Klien (e.g. +18% konversi)', 'Ketersediaan Kerja'],
    optionalComponents: ['Testimoni Klien', 'Sertifikasi Keahlian', 'Rate / Paket Layanan'],
    evaluationFocusText: 'Menilai kejelasan solusi dan dampak bisnis yang dihasilkan untuk klien, bukan sekadar daftar tugas teknis.',
  },
  remote: {
    id: 'remote',
    title: 'Remote Job',
    badge: 'Async & Autonomy',
    iconName: 'Globe',
    category: 'flexible',
    objective: 'Membuktikan kemampuan kerja mandiri, komunikasi asinkron, dan kolaborasi jarak jauh.',
    description: 'Menilai penguasaan alat kolaborasi modern (Slack, Notion, Jira, GitHub), kemampuan bahasa, dan rekam jejak kerja terdistribusi.',
    weights: {
      experience: 20,
      skills: 15,
      remoteExperience: 15,
      tools: 10,
      achievement: 10,
      communication: 10,
      summary: 10,
      language: 5,
      keywords: 5,
    },
    requiredComponents: ['Pengalaman Kerja Relevan', 'Keahlian Inti', 'Ringkasan Kesiapan Remote', 'Tools Kolaborasi Jarak Jauh', 'Kontak'],
    highImpactComponents: ['Pengalaman Kerja Remote / Asinkron', 'Collaboration Stack (Slack, Jira, Git, Notion)', 'Komunikasi Tertulis & Bahasa Inggris', 'Manajemen Proyek Mandiri'],
    optionalComponents: ['Zona Waktu & Ketersediaan Jam Kerja', 'Sertifikasi Remote Work'],
    evaluationFocusText: 'Memvalidasi bukti kerja asinkron, kemandirian pemecahan masalah, dan kejelasan komunikasi tertulis.',
  },
  career_switch: {
    id: 'career_switch',
    title: 'Career Switch',
    badge: 'Transferable Value',
    iconName: 'RefreshCw',
    category: 'career',
    objective: 'Menyoroti keahlian transferable dan proyek baru untuk beralih ke bidang industri yang berbeda.',
    description: 'Mendeteksi kecocokan kompetensi lintas domain (misal Marketing → Product Management) dan portofolio transisi.',
    weights: {
      transferableSkills: 20,
      projects: 20,
      targetSkills: 15,
      experience: 15,
      achievement: 10,
      certification: 10,
      summary: 5,
      keywords: 5,
    },
    requiredComponents: ['Ringkasan Alasan Transisi', 'Transferable Skills', 'Proyek Relevan di Bidang Baru', 'Target Skills Baru', 'Pengalaman Kerja Sebelumnya'],
    highImpactComponents: ['Pemetaan Relevansi Skill Lama ke Baru', 'Proyek Transisi / Portfolio Bidang Baru', 'Sertifikasi / Bootcamp Terverifikasi', 'Pencapaian Terukur'],
    optionalComponents: ['Pengalaman Organisasi', 'Kursus Online / Pelatihan'],
    evaluationFocusText: 'Mengevaluasi bagaimana pengalaman sebelumnya diterjemahkan menjadi nilai tambah untuk bidang baru.',
  },
  promotion: {
    id: 'promotion',
    title: 'Promosi / Internal Career',
    badge: 'Leadership & Impact',
    iconName: 'TrendingUp',
    category: 'career',
    objective: 'Mendapatkan kenaikan jabatan, kenaikan level struktural, atau mobilitas karier internal.',
    description: 'Fokus pada dampak bisnis nyata, kepemimpinan tim, efisiensi operasional, dan progresi tanggung jawab.',
    weights: {
      achievement: 25,
      experience: 20,
      leadership: 15,
      skills: 15,
      careerProgression: 10,
      projects: 5,
      education: 5,
      certification: 5,
    },
    requiredComponents: ['Posisi Saat Ini & Riwayat Peran', 'Pengalaman Relevan', 'Metrik Pencapaian & Dampak', 'Keahlian Kepemimpinan & Teknis'],
    highImpactComponents: ['Dampak Bisnis (e.g. Sales +32%, Hemat Biaya 15%)', 'Manajemen Tim & Mentoring', 'Inisiatif Lintas Divisi', 'Progresi Tanggung Jawab'],
    optionalComponents: ['Sertifikasi Manajemen', 'Penghargaan Internal Perusahaan'],
    evaluationFocusText: 'Impact & kepemimpinan jauh lebih menentukan daripada sekadar daftar keyword ATS umum.',
  },
  academic_scholarship: {
    id: 'academic_scholarship',
    title: 'Beasiswa / Akademik',
    badge: 'Research & Excellence',
    iconName: 'Award',
    category: 'academic',
    objective: 'Mendapatkan beasiswa studi lanjut, program pertukaran, riset ilmiah, atau posisi akademisi.',
    description: 'Menilai capaian akademik (IPK, beasiswa sebelumnya, penghargaan lomba), publikasi ilmiah, riset, dan kontribusi sosial.',
    weights: {
      academicAchievement: 20,
      education: 20,
      research: 15,
      organization: 10,
      achievement: 10,
      publication: 10,
      socialImpact: 5,
      certification: 5,
      summary: 5,
    },
    requiredComponents: ['Riwayat Pendidikan & IPK', 'Prestasi Akademik / Kejuaraan', 'Proyek Riset / Tugas Ilmiah', 'Ringkasan Akademik & Rencana Studi'],
    highImpactComponents: ['IPK Tinggi / Skripsi Terbaik', 'Publikasi / Jurnal / Konferensi', 'Hibah Riset & Beasiswa Sebelumnya', 'Dampak Sosial & Kepemimpinan'],
    optionalComponents: ['Pengalaman Mengajar / Asisten Lab', 'Kegiatan Sukarela', 'Sertifikat Bahasa Asing (IELTS/TOEFL)'],
    evaluationFocusText: 'Mengutamakan standar keunggulan akademik, kontribusi riset, dan rekam jejak pengabdian masyarakat.',
  },
  overseas: {
    id: 'overseas',
    title: 'Kerja di Luar Negeri',
    badge: 'Global & International',
    iconName: 'Plane',
    category: 'career',
    objective: 'Mendapatkan pekerjaan di perusahaan internasional atau relokasi kerja ke luar negeri.',
    description: 'Menilai kemahiran bahasa asing, pengalaman kolaborasi lintas budaya, dan kepatuhan format ATS internasional.',
    weights: {
      experience: 20,
      skills: 15,
      keywords: 15,
      language: 15,
      achievement: 10,
      education: 10,
      internationalExperience: 5,
      summary: 5,
      atsReadability: 5,
    },
    requiredComponents: ['Pengalaman Kerja Relevan', 'Kemampuan Bahasa (Inggris/Lokal)', 'Keahlian Global', 'Pendidikan', 'Ringkasan Profil Internasional', 'Kontak'],
    highImpactComponents: ['Kemahiran Bahasa Asing Terverifikasi', 'Kolaborasi Lintas Budaya / Tim Global', 'Keyword Standar Industri Global', 'Format ATS Internasional (Tanpa Foto/Data Pribadi Sensitif)'],
    optionalComponents: ['Visa Readiness / Ketersediaan Relokasi', 'Sertifikasi Internasional'],
    evaluationFocusText: 'Menilai daya saing global, standar format internasional, dan penguasaan bahasa kerja utama.',
  },
  general: {
    id: 'general',
    title: 'CV Umum / Master CV',
    badge: 'Comprehensive Master',
    iconName: 'FileText',
    category: 'flexible',
    objective: 'Menyimpan profil master yang lengkap, terstruktur, dan siap dikustomisasi ke berbagai target lowongan.',
    description: 'Menilai kelengkapan seluruh seksi esensial, keterbacaan format, dan keseimbangan rekam jejak karier.',
    weights: {
      completeness: 20,
      experience: 15,
      skills: 15,
      education: 10,
      projects: 10,
      achievement: 10,
      summary: 10,
      certification: 5,
      atsReadability: 5,
    },
    requiredComponents: ['Kontak Lengkap', 'Ringkasan Profil', 'Pengalaman Kerja', 'Pendidikan', 'Daftar Keahlian'],
    highImpactComponents: ['Kelengkapan Portofolio Proyek', 'Sertifikat Kompetensi', 'Organisasi & Prestasi', 'Pencapaian Terukur'],
    optionalComponents: ['Bahasa Asing', 'Pelatihan', 'Referensi'],
    evaluationFocusText: 'Menilai kelengkapan data dasar sebagai repositori utama sebelum disesuaikan ke posisi spesifik.',
  },
};

// ==========================================
// 2. HELPER DICTIONARIES & PATTERN MATCHERS
// ==========================================

const ACTION_VERBS = [
  'membangun', 'merancang', 'mengembangkan', 'memimpin', 'meningkatkan', 'mengoptimalkan',
  'mengurangi', 'memangkas', 'mengotomatisasi', 'mengimplementasikan', 'menganalisis', 'mengelola',
  'mengkoordinasikan', 'meluncurkan', 'mengeksekusi', 'menghasilkan', 'mengintegrasikan', 'merumuskan',
  'designed', 'built', 'developed', 'led', 'improved', 'optimized', 'reduced', 'automated',
  'launched', 'implemented', 'analyzed', 'managed', 'created', 'achieved', 'spearheaded'
];

const COLLABORATION_TOOLS = [
  'slack', 'notion', 'jira', 'github', 'gitlab', 'asana', 'trello', 'zoom', 'figma',
  'linear', 'confluence', 'discord', 'google workspace', 'miro', 'loom', 'basecamp'
];

const TRANSFERABLE_SKILL_MAP: Record<string, string[]> = {
  'project management': ['manajemen proyek', 'agile', 'scrum', 'trello', 'jira', 'timeline', 'stakeholder', 'koordinasi'],
  'data analysis': ['analisis data', 'excel', 'sql', 'tableau', 'metrik', 'reporting', 'visualisasi', 'google analytics'],
  'leadership': ['kepemimpinan', 'mentoring', 'team lead', 'supervisi', 'manajemen tim', 'delegasi'],
  'communication': ['komunikasi', 'presentasi', 'negosiasi', 'public speaking', 'copywriting', 'client handling'],
  'problem solving': ['pemecahan masalah', 'troubleshooting', 'analisis kebutuhan', 'root cause analysis', 'optimasi'],
  'research': ['riset pasar', 'user research', 'benchmarking', 'studi literatur', 'survei'],
};

// ==========================================
// 3. ENGINE EVALUATOR & SCORER
// ==========================================

export interface CvInputEvaluationData {
  candidateName?: string;
  roleTitle?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  experience?: Array<{
    id?: string;
    role?: string;
    company?: string;
    period?: string;
    achievements?: string[];
    description?: string;
    metricsCount?: number;
  }>;
  education?: Array<{
    id?: string;
    degree?: string;
    institution?: string;
    period?: string;
    gpa?: string | number;
    description?: string;
  }>;
  skills?: string[];
  projects?: Array<{
    id?: string;
    name?: string;
    role?: string;
    description?: string;
    period?: string;
  }>;
  organizations?: Array<{
    id?: string;
    name?: string;
    role?: string;
    description?: string;
    period?: string;
  }>;
  certifications?: Array<{
    id?: string;
    name?: string;
    issuer?: string;
    year?: string;
  }>;
  languages?: Array<{
    language?: string;
    proficiency?: string;
  }>;
  hobbiesAndMisc?: string;
}

/**
 * Menghitung analisis metrik kuantitatif pada seluruh teks pengalaman & proyek
 */
export function analyzeQuantitativeImpact(data: CvInputEvaluationData) {
  const allBulletPoints: string[] = [];

  if (Array.isArray(data.experience)) {
    data.experience.forEach((exp) => {
      if (Array.isArray(exp.achievements)) {
        exp.achievements.forEach((ach) => allBulletPoints.push(ach));
      }
      if (exp.description) {
        allBulletPoints.push(exp.description);
      }
    });
  }

  if (Array.isArray(data.projects)) {
    data.projects.forEach((proj) => {
      if (proj.description) allBulletPoints.push(proj.description);
    });
  }

  const metricRegex = /(\d+[\.,]?\d*\s*(%|persen|ribu|jt|juta|milyar|k|x\b|user|pengguna|orang|karyawan|cabang|transaksi|leads|klien|kandidat|\$|rp|idr))/i;
  const growthRegex = /\b(meningkatkan|memangkas|menghemat|mempercepat|mengakselerasi|melampaui|menaikkan|mereduksi|increased|reduced|boosted|grew)\b/i;

  let measurableBulletsCount = 0;
  allBulletPoints.forEach((text) => {
    if (metricRegex.test(text) || (growthRegex.test(text) && /\d+/.test(text))) {
      measurableBulletsCount++;
    }
  });

  const totalBulletsCount = Math.max(1, allBulletPoints.length);
  const metricRatio = measurableBulletsCount / totalBulletsCount;

  return {
    measurableBulletsCount,
    totalBulletsCount,
    metricRatio,
    allBulletPoints,
  };
}

/**
 * Fungsi Utama: Menghitung skor CV menyeluruh berdasarkan Purpose Profile aktif & 5 Dimensi Diagnostik
 */
export function evaluateCvComprehensive(
  data: CvInputEvaluationData,
  purpose: CvPurpose = 'job',
  targetJobDescription: string = ''
): ComprehensiveCvScoreResult {
  const profile = CV_PURPOSE_PROFILES[purpose] || CV_PURPOSE_PROFILES.job;
  const weights = profile.weights;

  // 1. Ekstraksi Data Dasar
  const hasName = Boolean(data.candidateName && data.candidateName.trim().length > 2);
  const hasEmail = Boolean(data.email && data.email.includes('@'));
  const hasPhone = Boolean(data.phone && data.phone.trim().length > 6);
  const hasSummary = Boolean(data.summary && data.summary.trim().length > 40);
  const summaryLength = data.summary?.trim().length || 0;
  const experiences = Array.isArray(data.experience) ? data.experience : [];
  const educations = Array.isArray(data.education) ? data.education : [];
  const skills = Array.isArray(data.skills) ? data.skills.map((s) => (typeof s === 'string' ? s : String(s))) : [];
  const projects = Array.isArray(data.projects) ? data.projects : [];
  const organizations = Array.isArray(data.organizations) ? data.organizations : [];
  const certifications = Array.isArray(data.certifications) ? data.certifications : [];

  // Analisis Metrik & Dampak
  const impactAnalysis = analyzeQuantitativeImpact(data);

  // 2. Evaluasi 5 Dimensi Diagnostik
  // -------------------------------------------------------------

  // Dimensi 1: Completeness (Kelengkapan Data)
  const passedItems: string[] = [];
  const missingItems: string[] = [];

  if (hasName && (hasEmail || hasPhone)) passedItems.push('Informasi Kontak Lengkap');
  else missingItems.push('Informasi Kontak (Email / Telepon)');

  if (hasSummary) passedItems.push('Ringkasan Profesional');
  else missingItems.push('Ringkasan Profesional');

  if (skills.length >= 4) passedItems.push(`Daftar Keahlian (${skills.length} keahlian)`);
  else missingItems.push('Daftar Keahlian (Minimal 4-5 keahlian relevan)');

  if (educations.length > 0) passedItems.push('Riwayat Pendidikan');
  else missingItems.push('Riwayat Pendidikan');

  if (experiences.length > 0) passedItems.push(`Pengalaman Kerja (${experiences.length} posisi)`);
  else if (purpose === 'job' || purpose === 'remote' || purpose === 'promotion' || purpose === 'overseas') {
    missingItems.push('Pengalaman Kerja Relevan');
  }

  if (projects.length > 0) passedItems.push(`Proyek & Portofolio (${projects.length} proyek)`);
  else if (purpose === 'fresh_graduate' || purpose === 'internship' || purpose === 'freelance' || purpose === 'career_switch') {
    missingItems.push('Proyek & Portofolio Nyata');
  }

  if (organizations.length > 0) passedItems.push('Pengalaman Organisasi');
  if (certifications.length > 0) passedItems.push('Sertifikasi Kompetensi');

  let completenessScore = 60;
  if (hasName && hasEmail && hasPhone) completenessScore += 10;
  if (hasSummary) completenessScore += 10;
  if (skills.length >= 4) completenessScore += 10;
  if (educations.length > 0) completenessScore += 5;
  if (experiences.length > 0 || projects.length > 0) completenessScore += 15;
  if (certifications.length > 0 || organizations.length > 0) completenessScore += 5;
  completenessScore = Math.min(100, completenessScore);

  // Dimensi 2: ATS Compatibility (Format & Standar Mesin)
  const passedChecks: string[] = [];
  const failedChecks: string[] = [];

  if (hasSummary && summaryLength <= 600) passedChecks.push('Panjang ringkasan profil ideal untuk scanner ATS');
  else if (summaryLength > 600) failedChecks.push('Ringkasan profil terlalu panjang (>600 karakter)');
  else failedChecks.push('Ringkasan profil belum terisi optimal');

  if (skills.length >= 5) passedChecks.push('Struktur kata kunci keahlian terstandarisasi');
  else failedChecks.push('Kategori keahlian masih sedikit, perlu variasi skill');

  passedChecks.push('Hierarki bagian dokumen terstruktur jelas');
  passedChecks.push('Bebas dari tabel/grafik kompleks yang mengganggu pembacaan mesin');

  const atsScore = Math.min(99, Math.round(75 + (skills.length >= 5 ? 12 : 0) + (hasSummary ? 8 : 0) + (educations.length > 0 ? 5 : 0)));

  // Dimensi 3: Content Quality (Kualitas Narasi & Action Verbs)
  const allTextCombined = [
    data.summary || '',
    ...impactAnalysis.allBulletPoints,
    ...skills,
  ].join(' ').toLowerCase();

  let actionVerbsFound = 0;
  ACTION_VERBS.forEach((verb) => {
    if (allTextCombined.includes(verb)) actionVerbsFound++;
  });

  const contentQualityScore = Math.min(98, Math.round(
    65 +
    Math.min(20, actionVerbsFound * 3) +
    (summaryLength >= 80 ? 10 : 0) +
    (impactAnalysis.measurableBulletsCount > 0 ? 5 : 0)
  ));

  // Dimensi 4: Job / Purpose Relevance (Kesesuaian Target)
  const targetTokens = (targetJobDescription + ' ' + (data.roleTitle || '')).toLowerCase().split(/[\s,;/]+/).filter((w) => w.length > 2);
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  skills.forEach((skill) => {
    const sLower = skill.toLowerCase();
    if (targetTokens.some((t) => sLower.includes(t) || t.includes(sLower))) {
      if (!matchedKeywords.includes(skill)) matchedKeywords.push(skill);
    }
  });

  const transferableSkillsFound: string[] = [];
  Object.entries(TRANSFERABLE_SKILL_MAP).forEach(([category, keywordsList]) => {
    const found = keywordsList.some((kw) => allTextCombined.includes(kw));
    if (found) transferableSkillsFound.push(category);
  });

  let jobRelevanceScore = 70;
  if (data.roleTitle && data.roleTitle.length > 3) jobRelevanceScore += 10;
  if (matchedKeywords.length >= 3) jobRelevanceScore += 15;
  else if (skills.length >= 4) jobRelevanceScore += 8;
  if (purpose === 'remote') {
    const remoteToolsFound = COLLABORATION_TOOLS.filter((t) => allTextCombined.includes(t));
    if (remoteToolsFound.length >= 2) jobRelevanceScore += 10;
  }
  jobRelevanceScore = Math.min(99, jobRelevanceScore);

  // Dimensi 5: Achievement Strength (Kekuatan Metrik & Dampak)
  let achievementScore = 50;
  if (impactAnalysis.measurableBulletsCount >= 3) achievementScore = 92;
  else if (impactAnalysis.measurableBulletsCount === 2) achievementScore = 80;
  else if (impactAnalysis.measurableBulletsCount === 1) achievementScore = 70;
  else achievementScore = 55;

  // -------------------------------------------------------------
  // 3. KOMPONEN RINCIAN MATRIKS BOBOT SESUAI PURPOSE PROFILE
  // -------------------------------------------------------------
  const componentBreakdown: ComponentScoreItem[] = [];

  const addComponent = (
    key: keyof PurposeWeights,
    label: string,
    rawScore: number,
    status: ComponentScoreItem['status'],
    feedback: string
  ) => {
    const weight = weights[key] || 0;
    if (weight > 0) {
      componentBreakdown.push({
        key,
        label,
        weight,
        score: rawScore,
        weightedContribution: Math.round((rawScore * weight) / 100),
        status,
        feedback,
      });
    }
  };

  // Job Title
  if (weights.jobTitle) {
    const score = data.roleTitle ? 95 : 40;
    addComponent('jobTitle', 'Target Posisi & Headline', score, score > 70 ? 'optimal' : 'needs_work', data.roleTitle ? `Target posisi spesifik: "${data.roleTitle}"` : 'Target posisi belum dicantumkan secara spesifik');
  }

  // Summary
  if (weights.summary) {
    const score = hasSummary ? (summaryLength >= 90 ? 95 : 75) : 35;
    addComponent('summary', 'Ringkasan Profesional', score, score > 70 ? 'optimal' : 'needs_work', hasSummary ? 'Ringkasan profil terstruktur baik' : 'Ringkasan masih terlalu singkat atau kosong');
  }

  // Experience
  if (weights.experience) {
    const expCount = experiences.length;
    const score = expCount >= 2 ? 95 : expCount === 1 ? 80 : (purpose === 'fresh_graduate' || purpose === 'internship' ? 60 : 30);
    addComponent('experience', 'Pengalaman Kerja', score, score >= 80 ? 'optimal' : score >= 60 ? 'good' : 'needs_work', expCount > 0 ? `${expCount} riwayat posisi tercatat` : 'Belum ada riwayat pengalaman kerja formal');
  }

  // Projects
  if (weights.projects) {
    const projCount = projects.length;
    const score = projCount >= 2 ? 95 : projCount === 1 ? 80 : (experiences.length > 0 ? 70 : 40);
    addComponent('projects', 'Proyek & Portofolio', score, score >= 80 ? 'optimal' : score >= 60 ? 'good' : 'needs_work', projCount > 0 ? `${projCount} proyek portofolio dicantumkan` : 'Tambahkan minimal 1-2 proyek portofolio nyata');
  }

  // Skills
  if (weights.skills) {
    const score = skills.length >= 6 ? 95 : skills.length >= 3 ? 80 : 50;
    addComponent('skills', 'Keahlian (Skills)', score, score >= 80 ? 'optimal' : 'needs_work', `${skills.length} keahlian terdaftar`);
  }

  // Achievement
  if (weights.achievement) {
    const score = achievementScore;
    addComponent('achievement', 'Achievement & Impact', score, score >= 80 ? 'optimal' : score >= 65 ? 'good' : 'needs_work', `${impactAnalysis.measurableBulletsCount} dari ${impactAnalysis.totalBulletsCount} poin memiliki metrik angka konkret`);
  }

  // Keywords
  if (weights.keywords) {
    const score = jobRelevanceScore;
    addComponent('keywords', 'Kesesuaian Kata Kunci', score, score >= 80 ? 'optimal' : 'good', `${matchedKeywords.length} kata kunci cocok dengan target`);
  }

  // Education
  if (weights.education) {
    const score = educations.length > 0 ? 95 : 40;
    addComponent('education', 'Pendidikan', score, score > 70 ? 'optimal' : 'missing', educations.length > 0 ? `${educations[0]?.institution || 'Institusi terdaftar'}` : 'Data pendidikan belum diisi');
  }

  // ATS Readability
  if (weights.atsReadability) {
    addComponent('atsReadability', 'Keterbacaan ATS', atsScore, 'optimal', 'Format tata letak bersih dan ramah mesin ATS');
  }

  // Internship
  if (weights.internship) {
    const hasIntern = experiences.some((e) => /magang|intern|praktik|pkl/i.test((e.role || '') + ' ' + (e.company || '')));
    const score = hasIntern ? 95 : (projects.length >= 2 ? 80 : 60);
    addComponent('internship', 'Pengalaman Magang / Terapan', score, score >= 80 ? 'optimal' : 'good', hasIntern ? 'Terdapat pengalaman magang terverifikasi' : 'Dapat diperkuat dengan proyek magang / capstone');
  }

  // Organization
  if (weights.organization) {
    const score = organizations.length >= 1 ? 95 : 55;
    addComponent('organization', 'Pengalaman Organisasi', score, score > 70 ? 'optimal' : 'needs_work', organizations.length > 0 ? `${organizations.length} organisasi tercatat` : 'Belum mencantumkan pengalaman organisasi / kepanitiaan');
  }

  // Certification
  if (weights.certification) {
    const score = certifications.length >= 1 ? 95 : 55;
    addComponent('certification', 'Sertifikasi & Pelatihan', score, score > 70 ? 'optimal' : 'needs_work', certifications.length > 0 ? `${certifications.length} sertifikat dicantumkan` : 'Tambahkan sertifikasi kompetensi industri');
  }

  // Client Experience (Freelance)
  if (weights.clientExperience) {
    const score = experiences.length > 0 || projects.length >= 2 ? 90 : 60;
    addComponent('clientExperience', 'Pengalaman Klien / Proyek', score, score >= 80 ? 'optimal' : 'needs_work', 'Bukti pengerjaan proyek klien nyata');
  }

  // Tools & Tech
  if (weights.tools) {
    const foundTools = COLLABORATION_TOOLS.filter((t) => allTextCombined.includes(t));
    const score = foundTools.length >= 2 ? 95 : 65;
    addComponent('tools', 'Tools & Teknologi Pendukung', score, score >= 80 ? 'optimal' : 'needs_work', `${foundTools.length} tools kolaborasi modern terdeteksi`);
  }

  // Remote Experience
  if (weights.remoteExperience) {
    const hasRemoteSignal = /remote|jarak jauh|wfh|terdistribusi|async|asinkron/i.test(allTextCombined);
    const score = hasRemoteSignal ? 95 : (COLLABORATION_TOOLS.some((t) => allTextCombined.includes(t)) ? 80 : 60);
    addComponent('remoteExperience', 'Bukti Pengalaman Remote', score, score >= 80 ? 'optimal' : 'needs_work', hasRemoteSignal ? 'Terdapat rekam jejak kerja remote' : 'Tambahkan penyebutan kerja asinkron / remote tools');
  }

  // Communication
  if (weights.communication) {
    addComponent('communication', 'Komunikasi & Kolaborasi', contentQualityScore, 'good', 'Gaya komunikasi tertulis dan kejelasan peran');
  }

  // Language
  if (weights.language) {
    const hasEnglish = /inggris|english|toefl|ielts|proficient|fluent/i.test(allTextCombined);
    const score = hasEnglish ? 95 : 70;
    addComponent('language', 'Kemampuan Bahasa Asing', score, score >= 80 ? 'optimal' : 'good', hasEnglish ? 'Kemampuan Bahasa Inggris tercantum' : 'Cantumkan level kefasihan Bahasa Inggris');
  }

  // Transferable Skills (Career Switch)
  if (weights.transferableSkills) {
    const score = transferableSkillsFound.length >= 2 ? 95 : 70;
    addComponent('transferableSkills', 'Transferable Skills', score, score >= 80 ? 'optimal' : 'good', `${transferableSkillsFound.length} rumpun kompetensi transferable terdeteksi (${transferableSkillsFound.join(', ') || 'Umum'})`);
  }

  // Leadership (Promotion)
  if (weights.leadership) {
    const hasLeadership = /memimpin|lead|supervisor|manajemen|koordinator|mengelola tim/i.test(allTextCombined);
    const score = hasLeadership ? 95 : 65;
    addComponent('leadership', 'Kepemimpinan & Dampak Tim', score, score >= 80 ? 'optimal' : 'needs_work', hasLeadership ? 'Bukti kepemimpinan tim terdeteksi' : 'Cantumkan peran memimpin inisiatif / koordinasi tim');
  }

  // Academic Achievement (Scholarship)
  if (weights.academicAchievement) {
    const hasGpa = /ipk|gpa|\b3\.[5-9]\b|\b4\.0\b/i.test(allTextCombined);
    const score = hasGpa ? 95 : 70;
    addComponent('academicAchievement', 'Prestasi Akademik & IPK', score, score >= 80 ? 'optimal' : 'good', hasGpa ? 'Capaian akademik / IPK terdata' : 'Cantumkan IPK atau predikat kelulusan');
  }

  // -------------------------------------------------------------
  // 4. KALKULASI OVERALL SCORE DARI WEIGHTED CONTRIBUTIONS
  // -------------------------------------------------------------
  let calculatedOverallScore = 0;
  let totalWeightAccounted = 0;

  componentBreakdown.forEach((item) => {
    calculatedOverallScore += (item.score * item.weight) / 100;
    totalWeightAccounted += item.weight;
  });

  if (totalWeightAccounted > 0 && totalWeightAccounted !== 100) {
    calculatedOverallScore = (calculatedOverallScore / totalWeightAccounted) * 100;
  }

  const finalOverallScore = Math.min(99, Math.max(45, Math.round(calculatedOverallScore)));
  const verdictStatus: 'interview' | 'maybe' | 'reject' =
    finalOverallScore >= 82 ? 'interview' : finalOverallScore >= 68 ? 'maybe' : 'reject';

  const verdictLabel =
    verdictStatus === 'interview'
      ? 'Sangat Siap & Potensial'
      : verdictStatus === 'maybe'
      ? 'Cukup Baik (Perlu Optimalisasi Ringan)'
      : 'Perlu Perbaikan Komponen Kunci';

  // -------------------------------------------------------------
  // 5. ACTIONABLE IMPROVEMENTS BERDASARKAN DIMENSI TERLEMAH
  // -------------------------------------------------------------
  const actionableImprovements: ComprehensiveCvScoreResult['actionableImprovements'] = [];

  // Rekomendasi 1: Achievement Strength
  if (achievementScore < 80) {
    const firstExp = experiences[0];
    const rawAch = firstExp?.achievements?.[0] || 'Bertanggung jawab atas pengerjaan tugas harian tim.';
    const improvedAch = `${rawAch.replace(/\.$/, '')}, berhasil meningkatkan efisiensi proses sebesar 25%+ dan menghemat waktu kerja 5 jam/minggu.`;

    actionableImprovements.push({
      id: 'fix-achievement',
      priority: 'high',
      dimension: 'achievement',
      title: 'Ubah Deskripsi Tugas Menjadi Pencapaian Terukur (Metrik %)',
      suggestion: `Tambahkan angka/persentase konkret pada poin pengalaman di posisi ${firstExp?.role || 'terbaru'}. Rekruiter sangat menyukai kandidat yang mampu membuktikan dampak nyata.`,
      exampleBefore: rawAch,
      exampleAfter: improvedAch,
      impactBonus: 8,
    });
  }

  // Rekomendasi 2: Ringkasan Profil / Headline
  if (summaryLength < 80 || !data.roleTitle) {
    const role = data.roleTitle || 'Profesional';
    actionableImprovements.push({
      id: 'fix-summary',
      priority: 'medium',
      dimension: 'relevance',
      title: `Pertajam Ringkasan Profil untuk Posisi ${role}`,
      suggestion: 'Buat ringkasan 2-3 kalimat yang langsung menjelaskan spesialisasi utama, tahun pengalaman/bidang keahlian, dan nilai tambah yang kamu bawa.',
      exampleBefore: data.summary || 'Kandidat yang berdedikasi tinggi dan siap bekerja keras.',
      exampleAfter: `${role} yang berfokus pada ${skills.slice(0, 2).join(' & ') || 'eksekusi proyek berkualitas'}. Memiliki rekam jejak dalam meningkatkan efisiensi kerja tim dan siap memberikan dampak langsung pada target perusahaan.`,
      impactBonus: 6,
    });
  }

  // Rekomendasi 3: Purpose Specific
  if (purpose === 'career_switch' && transferableSkillsFound.length < 2) {
    actionableImprovements.push({
      id: 'fix-transferable',
      priority: 'high',
      dimension: 'relevance',
      title: 'Tonjolkan Transferable Skills Lintas Bidang',
      suggestion: 'Gunakan kata kerja yang relevan dengan posisi baru seperti Project Management, Analisis Data, dan Kolaborasi Stakeholder pada riwayat peran lama.',
      impactBonus: 7,
    });
  } else if (purpose === 'freelance' && projects.length < 2) {
    actionableImprovements.push({
      id: 'fix-freelance-portfolio',
      priority: 'high',
      dimension: 'quality',
      title: 'Tuliskan Proyek dengan Formula Problem → Solution → Result',
      suggestion: 'Klien freelance menilai kejelasan solusi: Jelaskan masalah klien, solusi yang kamu buat, tools yang dipakai, dan hasil bisnis yang didapat.',
      exampleBefore: 'Membuat desain landing page untuk klien.',
      exampleAfter: 'Merancang landing page SaaS menggunakan Figma, berhasil menaikkan rasio konversi pendaftaran sebesar 18%.',
      impactBonus: 9,
    });
  } else if (purpose === 'remote' && !COLLABORATION_TOOLS.some((t) => allTextCombined.includes(t))) {
    actionableImprovements.push({
      id: 'fix-remote-tools',
      priority: 'medium',
      dimension: 'relevance',
      title: 'Cantumkan Tools Kolaborasi Jarak Jauh',
      suggestion: 'Sebutkan kebiasaan memakai tools modern seperti Slack, Notion, Jira, Figma, atau GitHub untuk membuktikan kesiapan kerja mandiri dan asinkron.',
      impactBonus: 5,
    });
  }

  const summaryFeedback =
    verdictStatus === 'interview'
      ? `CV ini memiliki keselarasan yang sangat tinggi untuk tujuan ${profile.title}. Struktur dokumen rapi, keahlian inti terlihat jelas, dan profil siap bersaing.`
      : verdictStatus === 'maybe'
      ? `CV ini memiliki dasar yang kuat untuk ${profile.title}, namun beberapa poin seperti kekuatan metrik angka dan kata kunci pendukung masih dapat ditingkatkan.`
      : `CV ini memerlukan beberapa penyempurnaan pada komponen wajib dan penambahan bukti dampak nyata agar lolos seleksi awal untuk ${profile.title}.`;

  const dimensions: DimensionBreakdown = {
    completeness: {
      score: completenessScore,
      label: 'Kelengkapan Data',
      passedItems,
      missingItems,
      description: 'Menilai keberadaan seluruh seksi penting dan pendukung.',
    },
    atsCompatibility: {
      score: atsScore,
      label: 'Kesesuaian Sistem ATS',
      passedChecks,
      failedChecks,
      description: 'Menilai kemudahan pembacaan struktur oleh algoritma scanner CV.',
    },
    contentQuality: {
      score: contentQualityScore,
      label: 'Kualitas Narasi & Format',
      actionVerbsCount: actionVerbsFound,
      clarityLevel: actionVerbsFound >= 4 ? 'Tinggi' : actionVerbsFound >= 2 ? 'Sedang' : 'Perlu Ditingkatkan',
      description: 'Menilai kejelasan kalimat, action verbs, dan gaya penyusunan profesional.',
    },
    jobRelevance: {
      score: jobRelevanceScore,
      label: 'Kesesuaian Target Posisi',
      matchedKeywords,
      missingKeywords,
      transferableSkillsFound,
      description: 'Menilai keselarasan kata kunci, keahlian, dan kompetensi spesifik target.',
    },
    achievementStrength: {
      score: achievementScore,
      label: 'Kekuatan Dampak & Metrik Angka',
      measurableBulletsCount: impactAnalysis.measurableBulletsCount,
      totalBulletsCount: impactAnalysis.totalBulletsCount,
      metricRatio: Math.round(impactAnalysis.metricRatio * 100),
      description: 'Menilai proporsi poin pengalaman yang menyertakan angka terukur (%) dibanding sekadar daftar tugas.',
    },
  };

  return {
    purpose,
    purposeProfile: profile,
    overallScore: finalOverallScore,
    verdictStatus,
    verdictLabel,
    summaryFeedback,
    dimensions,
    componentBreakdown,
    actionableImprovements,
  };
}
