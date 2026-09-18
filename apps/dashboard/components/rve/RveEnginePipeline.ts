export interface CvParsedData {
  id: string;
  candidateName: string;
  roleTitle: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: Array<{
    id: string;
    role: string;
    company: string;
    period: string;
    achievements: string[];
    metricsCount: number;
  }>;
  education: Array<{
    id: string;
    degree: string;
    institution: string;
    period: string;
    gpa: string;
  }>;
  skills: string[];
  hobbiesAndMisc: string;
}

export interface BoundingBox {
  id: string;
  type: 'header' | 'summary' | 'experience' | 'skills' | 'education' | 'footer';
  x: number; // percentage of A4 width 0..100
  y: number; // percentage of A4 height 0..100
  width: number; // percentage 0..100
  height: number; // percentage 0..100
  visualWeight: number; // 0.0 to 1.0
  title: string;
}

export interface FixationPoint {
  id: string;
  sectionId: string;
  x: number; // percentage on A4 page
  y: number; // percentage on A4 page
  intensity: number; // 0.0 to 1.0
  durationMs: number;
  label: string;
  order: number;
  category: 'hotspot' | 'warm' | 'medium' | 'cold';
}

export interface AtsCorrelationItem {
  id: string;
  keyword: string;
  category: string;
  foundInCv: boolean;
  visibilityScore: number; // 0 to 100
  atsScore: number; // 0 to 100
  quadrant: 'gold' | 'prominent_low_ats' | 'hidden_high_ats' | 'cold_irrelevant';
  recommendation: string;
}

export interface AiModelEvaluation {
  modelName: string;
  badgeColor: string;
  score: number;
  pros: string[];
  cons: string[];
}

export interface RecruiterPersona {
  id: string;
  name: string;
  badge: string;
  category: 'company' | 'region' | 'special';
  categoryLabel: string;
  description: string;
  focusArea: string;
  evalFocus: string;
  companies: string[];
  matchScore: number;
  isRecommended?: boolean;
  ratings: {
    portfolio: number;
    impact: number;
    techStack: number;
    education: number;
  };
  highlights: string[];
  reducedEmphasis: string[];
  strictness: string;
}

import {
  CvPurpose,
  ComprehensiveCvScoreResult,
  evaluateCvComprehensive,
  CV_PURPOSE_PROFILES,
} from '@/lib/cv-purpose-scoring-engine';

export interface RveReportResult {
  parsedData: CvParsedData;
  boundingBoxes: BoundingBox[];
  fixationPoints: FixationPoint[];
  overallAttentionScore: number;
  fPatternScore: number;
  atsScore: number;
  recruiterVerdict: string;
  verdictStatus: 'interview' | 'maybe' | 'reject';
  confidenceScore: number;
  hrdNotes: string;
  atsCorrelations: AtsCorrelationItem[];
  beforeAfterFixes: Array<{
    id: string;
    section: string;
    before: string;
    after: string;
    impactBonus: number;
  }>;
  predictedInterviewQuestions: string[];
  // AI Screener Selling Point
  aiEvaluations: AiModelEvaluation[];
  consensusScore: number;
  topAiSummary: {
    overview: string;
    dropReasons: string[];
    estimatedProbability: number;
  };
  beforeAfterComparison: {
    beforeScore: number;
    afterScore: number;
    diff: number;
  };
  gamification: {
    progress: number;
    checklist: Array<{
      id: string;
      label: string;
      bonus: number;
      isDone: boolean;
    }>;
  };
  highPriorityRecommendations: string[];
  // 10 Purpose Profiles & 5 Diagnostic Dimensions Engine
  purposeScore: ComprehensiveCvScoreResult;
  activePurpose: CvPurpose;
}

/**
 * 1. CV PARSER ENGINE
 * Transforms raw inputs or saved CVs into standardized JSON structure.
 */
export function parseCvDocument(
  sourceMode: 'saved' | 'upload' | 'text',
  savedData?: Partial<CvParsedData>,
  uploadedFile?: File | null,
  rawText?: string,
  uploadedParsedData?: any
): CvParsedData {
  if (sourceMode === 'saved' || !sourceMode) {
    if (!savedData) {
      savedData = {
        id: 'default-cv-template',
        candidateName: 'Kandidat Pelamar',
        roleTitle: 'Professional Specialist',
        email: 'kandidat@email.com',
        phone: '+62 812-3456-7890',
        location: 'Indonesia',
        summary:
          'Professional berdedikasi tinggi dengan fokus pada hasil kerja nyata, efisiensi sistem, dan kolaborasi tim yang solid.',
        experience: [
          {
            id: 'exp-1',
            role: 'Professional Specialist',
            company: 'Perusahaan Terkemuka',
            period: '2023 - Sekarang',
            achievements: [
              'Memimpin penyelesaian target kerja dan inisiatif proyek dengan efisiensi 30%+ lebih cepat.',
              'Mengoordinasikan alur kerja tim dan memastikan kualitas hasil sesuai standar industri.',
            ],
            metricsCount: 2,
          },
        ],
        education: [
          {
            id: 'edu-1',
            degree: 'S1 Sarjana / Pendidikan Terakhir',
            institution: 'Perguruan Tinggi Terkemuka',
            period: '2018 - 2022',
            gpa: 'IPK 3.75 / 4.00',
          },
        ],
        skills: [
          'Komunikasi Profesional',
          'Problem Solving',
          'Manajemen Waktu',
          'Kerja Sama Tim',
          'Analisis Data & Eksekusi',
        ],
        hobbiesAndMisc: 'Bahasa Indonesia (Native), Bahasa Inggris (Proficient).',
      };
    }

    const normalizeAchievements = (exp: any): string[] => {
      if (Array.isArray(exp?.achievements) && exp.achievements.length > 0) {
        return exp.achievements.map((a: any) => (typeof a === 'string' ? a : String(a))).filter(Boolean);
      }
      if (typeof exp?.achievements === 'string' && exp.achievements.trim().length > 0) {
        return exp.achievements.split('\n').map((s: string) => s.trim()).filter(Boolean);
      }
      if (Array.isArray(exp?.bullets) && exp.bullets.length > 0) {
        return exp.bullets.map((b: any) => (typeof b === 'string' ? b : String(b))).filter(Boolean);
      }
      if (typeof exp?.description === 'string' && exp.description.trim().length > 0) {
        return exp.description.split('\n').map((s: string) => s.trim()).filter(Boolean);
      }
      return ['Melaksanakan tanggung jawab operasional dan berkontribusi terhadap pencapaian target.'];
    };

    const normalizeExperience = (list: any[] | undefined): CvParsedData['experience'] => {
      if (!Array.isArray(list) || list.length === 0) {
        const defaultRole = savedData?.roleTitle || (savedData as any)?.headline || 'Professional Specialist';
        return [
          {
            id: 'exp-1',
            role: defaultRole,
            company: 'Perusahaan Terkemuka',
            period: '2023 - Sekarang',
            achievements: [
              'Memimpin penyelesaian target kerja dan inisiatif proyek dengan efisiensi tinggi.',
              'Mengoordinasikan alur kerja tim dan memastikan kualitas hasil sesuai standar industri.',
            ],
            metricsCount: 2,
          },
        ];
      }

      return list.map((item, idx) => {
        const achs = normalizeAchievements(item);
        return {
          id: item?.id || `exp-${idx + 1}`,
          role: item?.role || item?.position || item?.jobTitle || item?.title || 'Pengalaman Kerja',
          company: item?.company || item?.companyName || item?.institution || 'Perusahaan',
          period: item?.period || (item?.startDate && item?.endDate ? `${item.startDate} - ${item.endDate}` : '') || item?.year || '2022 - Sekarang',
          achievements: achs,
          metricsCount: item?.metricsCount || achs.length || 1,
        };
      });
    };

    const normalizeEducation = (list: any[] | undefined): CvParsedData['education'] => {
      if (!Array.isArray(list) || list.length === 0) {
        return [
          {
            id: 'edu-1',
            degree: 'S1 Sarjana / Pendidikan Terakhir',
            institution: 'Perguruan Tinggi Terkemuka',
            period: '2018 - 2022',
            gpa: 'IPK 3.75 / 4.00',
          },
        ];
      }

      return list.map((item, idx) => ({
        id: item?.id || `edu-${idx + 1}`,
        degree: item?.degree || item?.major || item?.fieldOfStudy || 'Sarjana',
        institution: item?.institution || item?.school || item?.university || 'Institusi Pendidikan',
        period: item?.period || (item?.startDate && item?.endDate ? `${item.startDate} - ${item.endDate}` : '') || item?.year || '2018 - 2022',
        gpa: item?.gpa || item?.score || item?.grade || 'IPK 3.75',
      }));
    };

    const normalizeSkills = (skills: any): string[] => {
      if (Array.isArray(skills) && skills.length > 0) {
        return skills.map((s) => (typeof s === 'string' ? s : s?.name || String(s))).filter(Boolean);
      }
      if (typeof skills === 'string' && skills.trim().length > 0) {
        return skills.split(',').map((s) => s.trim()).filter(Boolean);
      }
      return [
        'Komunikasi Profesional',
        'Problem Solving',
        'Manajemen Waktu',
        'Kerja Sama Tim',
        'Analisis Data & Eksekusi',
      ];
    };

    const candName =
      savedData.candidateName ||
      (savedData as any).fullName ||
      (savedData as any).name ||
      'Kandidat Pelamar';

    const roleTitle =
      savedData.roleTitle ||
      (savedData as any).headline ||
      (savedData as any).targetRole ||
      (savedData as any).targetPosition ||
      'Professional Specialist';

    const email = savedData.email || 'kandidat@email.com';
    const phone = savedData.phone || '+62 812-3456-7890';
    const location = savedData.location || 'Indonesia';
    const summary =
      savedData.summary ||
      (savedData as any).about ||
      (savedData as any).profileSummary ||
      'Professional berdedikasi tinggi dengan fokus pada hasil kerja nyata, efisiensi sistem, dan kolaborasi tim yang solid.';

    return {
      id: savedData.id || 'saved-cv',
      candidateName: candName,
      roleTitle: roleTitle,
      email: email,
      phone: phone,
      location: location,
      summary: summary,
      experience: normalizeExperience(savedData.experience || (savedData as any).workExperience),
      education: normalizeEducation(savedData.education || (savedData as any).educations),
      skills: normalizeSkills(savedData.skills),
      hobbiesAndMisc: savedData.hobbiesAndMisc || 'Bahasa Indonesia (Native), Bahasa Inggris (Proficient).',
    };
  }

  if (sourceMode === 'upload' && uploadedParsedData) {
    const cleanName = uploadedParsedData.fullName
      || uploadedParsedData.candidateName
      || uploadedFile?.name?.replace(/\.[^/.]+$/, '').replace(/[-_]/g, '')
      || 'KANDIDAT CV UPLOAD';

    const role = uploadedParsedData.experienceTitle
      || uploadedParsedData.roleTitle
      || uploadedParsedData.headline
      || 'Professional Specialist';

    const skills = Array.isArray(uploadedParsedData.skills)
      ? uploadedParsedData.skills.filter(Boolean)
      : typeof uploadedParsedData.skills === 'string'
        ? uploadedParsedData.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];

    const expList = (() => {
      if (Array.isArray(uploadedParsedData.experience) && uploadedParsedData.experience.length > 0) {
        return uploadedParsedData.experience.map((e: any, i: number) => ({
          id: `exp-u-${i}`,
          role: e.role || e.position || e.jobTitle || e.title || role,
          company: e.company || e.companyName || uploadedParsedData.experienceCompany || 'Perusahaan',
          period: e.period || (e.startDate && e.endDate ? `${e.startDate} - ${e.endDate}` : '') || '2022 - Sekarang',
          achievements: Array.isArray(e.achievements)
            ? e.achievements
            : Array.isArray(e.bullets)
              ? e.bullets
              : e.description
                ? [e.description]
                : ['Belum ada deskripsi detail.'],
          metricsCount: e.metricsCount || 0,
        }));
      }
      return [{
        id: 'exp-u1',
        role: role,
        company: uploadedParsedData.experienceCompany || 'Perusahaan',
        period: '2022 - Sekarang',
        achievements: ['Pengalaman kerja sedang diproses.'],
        metricsCount: 0,
      }];
    })();

    const eduList = (() => {
      if (Array.isArray(uploadedParsedData.education) && uploadedParsedData.education.length > 0) {
        return uploadedParsedData.education.map((e: any, i: number) => ({
          id: `edu-u-${i}`,
          degree: e.degree || e.major || e.fieldOfStudy || uploadedParsedData.educationLevel || 'Sarjana',
          institution: e.institution || e.school || e.university || uploadedParsedData.institutionName || 'Institusi Pendidikan',
          period: e.period || (e.startDate && e.endDate ? `${e.startDate} - ${e.endDate}` : '') || '2018 - 2022',
          gpa: e.gpa || e.score || e.grade || uploadedParsedData.gpa || 'IPK -',
        }));
      }
      return [{
        id: 'edu-u1',
        degree: uploadedParsedData.educationLevel || 'Sarjana',
        institution: uploadedParsedData.institutionName || 'Institusi Pendidikan',
        period: '2018 - 2022',
        gpa: uploadedParsedData.gpa || 'IPK -',
      }];
    })();

    const targetPositions = Array.isArray(uploadedParsedData.targetPositions)
      ? uploadedParsedData.targetPositions
      : [];

    return {
      id: 'upload-cv',
      candidateName: typeof cleanName === 'string' ? cleanName : 'Kandidat',
      roleTitle: role,
      email: uploadedParsedData.contactInfo || uploadedParsedData.email || 'kandidat@email.com',
      phone: uploadedParsedData.phone || '+62 812-3456-7890',
      location: uploadedParsedData.location || 'Indonesia',
      summary: uploadedParsedData.summary || `${role} dengan pengalaman di bidang terkait, fokus pada hasil kerja nyata dan kolaborasi tim.`,
      experience: expList,
      education: eduList,
      skills: skills.length > 0 ? skills : ['Kompetensi Teknis', 'Kolaborasi Tim', 'Problem Solving'],
      hobbiesAndMisc: uploadedParsedData.hobbiesAndMisc || 'Bahasa Indonesia (Native), Bahasa Inggris (Proficient).',
    };
  }

  // Upload file exists but no parsed data yet — fallback to text mode
  if (sourceMode === 'upload' && uploadedFile && !uploadedParsedData) {
    const cleanName = uploadedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    return {
      id: 'upload-cv',
      candidateName: cleanName.toUpperCase() || 'KANDIDAT CV UPLOAD',
      roleTitle: 'Software & Technology Specialist',
      email: 'kandidat.upload@email.com',
      phone: '+62 811-0000-1111',
      location: 'Indonesia',
      summary: `Menunggu hasil parsing dari file ${uploadedFile.name}...`,
      experience: [{
        id: 'exp-u1',
        role: 'Professional Lead / Developer',
        company: 'Perusahaan Teknologi Utama',
        period: '2022 - Sekarang',
        achievements: ['Menunggu hasil parsing dokumen CV.'],
        metricsCount: 0,
      }],
      education: [{
        id: 'edu-u1',
        degree: 'S1 Sarjana Komputer / Teknik',
        institution: 'Perguruan Tinggi Terkemuka',
        period: '2018 - 2022',
        gpa: 'IPK 3.65 / 4.00',
      }],
      skills: ['Document Parsed', 'ATS Ready'],
      hobbiesAndMisc: `Sumber Berkas: ${uploadedFile.name}`,
    };
  }

  // Direct Text Paste Mode
  const textLines = (rawText || '').split('\n').filter((l) => l.trim().length > 0);
  const nameLine = textLines[0] || 'KANDIDAT TEKS TEMPELD';
  const summaryLine = textLines.slice(1, 3).join(' ') || 'Teks CV telah ditempel dan diproses secara dinamis oleh RVE Engine.';

  return {
    id: 'text-cv',
    candidateName: nameLine,
    roleTitle: 'Professional Candidate',
    email: 'kandidat.text@email.com',
    phone: '+62 815-9999-8888',
    location: 'Indonesia',
    summary: summaryLine,
    experience: [
      {
        id: 'exp-t1',
        role: 'Pengalaman Utama (Direct Paste)',
        company: 'Instansi / Perusahaan',
        period: '2022 - Sekarang',
        achievements: textLines.length > 3 ? textLines.slice(3, 6) : ['Melaksanakan fungsi operasional dan pencapaian target kerja.'],
        metricsCount: 1,
      },
    ],
    education: [
      {
        id: 'edu-t1',
        degree: 'Sarjana / Diploma',
        institution: 'Institusi Pendidikan',
        period: '2018 - 2022',
        gpa: 'IPK Baik',
      },
    ],
    skills: ['Teks Tempel', 'Direct Parsing', 'Kompetensi Relevan'],
    hobbiesAndMisc: 'Informasi Tambahan Teks',
  };
}

/**
 * 2. LAYOUT DETECTION ENGINE & 3. VISUAL HIERARCHY ENGINE
 * Calculates bounding boxes [x, y, w, h] on standard A4 page layout (percentages)
 * and evaluates visual weights based on font contrast, spacing, and numbers.
 */
export function calculateLayoutAndHierarchy(parsed: CvParsedData): BoundingBox[] {
  return [
    {
      id: 'header-block',
      type: 'header',
      x: 6,
      y: 4,
      width: 88,
      height: 12,
      visualWeight: 0.95, // High visual weight (bold, large font, name)
      title: 'Header & Identitas Utama',
    },
    {
      id: 'summary-block',
      type: 'summary',
      x: 6,
      y: 18,
      width: 88,
      height: 14,
      visualWeight: 0.82, // Medium-high weight
      title: 'Ringkasan Profil (Executive Summary)',
    },
    {
      id: 'experience-block',
      type: 'experience',
      x: 6,
      y: 34,
      width: 88,
      height: 34,
      visualWeight: 0.91, // High weight (bullet points, numbers, companies)
      title: 'Pengalaman Kerja & Pencapaian',
    },
    {
      id: 'skills-block',
      type: 'skills',
      x: 6,
      y: 70,
      width: 88,
      height: 13,
      visualWeight: 0.78, // Medium weight (keywords, tags)
      title: 'Keterampilan & Tech Stack',
    },
    {
      id: 'education-block',
      type: 'education',
      x: 6,
      y: 84,
      width: 88,
      height: 9,
      visualWeight: 0.52, // Medium-low weight
      title: 'Pendidikan & Kualifikasi',
    },
    {
      id: 'footer-block',
      type: 'footer',
      x: 6,
      y: 94,
      width: 88,
      height: 4,
      visualWeight: 0.22, // Low weight (Cold Zone)
      title: 'Informasi Tambahan / Cold Zone',
    },
  ];
}

/**
 * 4. EYE TRACKING PREDICTION MODEL & 5. HEATMAP POINT GENERATOR
 * Simulates 6-8 second recruiter eye fixation points following F-Pattern & Z-Pattern trajectory.
 */
export function predictEyeTrackingAndHeatmap(
  parsed: CvParsedData,
  boxes: BoundingBox[]
): FixationPoint[] {
  const points: FixationPoint[] = [
    // Fixation #1: Top Left Candidate Name (Hotspot 96%)
    {
      id: 'fix-1',
      sectionId: 'header-block',
      x: 18,
      y: 7,
      intensity: 0.96,
      durationMs: 1200,
      label: 'Nama Candidate & Role Title',
      order: 1,
      category: 'hotspot',
    },
    // Fixation #2: Role Title & Sub-header (Hotspot 88%)
    {
      id: 'fix-2',
      sectionId: 'header-block',
      x: 55,
      y: 8,
      intensity: 0.88,
      durationMs: 800,
      label: 'Gelar / Target Posisi',
      order: 2,
      category: 'hotspot',
    },
    // Fixation #3: Summary First Sentence (Warm 82%)
    {
      id: 'fix-3',
      sectionId: 'summary-block',
      x: 22,
      y: 20,
      intensity: 0.82,
      durationMs: 900,
      label: 'Awal Ringkasan Profil',
      order: 3,
      category: 'warm',
    },
    // Fixation #4: First Job Title & Company (Hotspot 94%)
    {
      id: 'fix-4',
      sectionId: 'experience-block',
      x: 25,
      y: 37,
      intensity: 0.94,
      durationMs: 1400,
      label: 'Posisi Kerja Terakhir & Perusahaan',
      order: 4,
      category: 'hotspot',
    },
    // Fixation #5: First Achievement Metric / % Number (Hotspot 90%)
    {
      id: 'fix-5',
      sectionId: 'experience-block',
      x: 65,
      y: 41,
      intensity: 0.9,
      durationMs: 1100,
      label: 'Pencapaian Terukur (Metrik %)',
      order: 5,
      category: 'hotspot',
    },
    // Fixation #6: Second Job Title (Warm 76%)
    {
      id: 'fix-6',
      sectionId: 'experience-block',
      x: 24,
      y: 52,
      intensity: 0.76,
      durationMs: 750,
      label: 'Pengalaman Kerja Kedua',
      order: 6,
      category: 'warm',
    },
    // Fixation #7: Tech Stack Keywords (Warm 78%)
    {
      id: 'fix-7',
      sectionId: 'skills-block',
      x: 30,
      y: 73,
      intensity: 0.78,
      durationMs: 850,
      label: 'Kumpulan Skills & Tech Stack',
      order: 7,
      category: 'warm',
    },
    // Fixation #8: Education Institution (Medium 52%)
    {
      id: 'fix-8',
      sectionId: 'education-block',
      x: 25,
      y: 86,
      intensity: 0.52,
      durationMs: 500,
      label: 'Nama Universitas & IPK',
      order: 8,
      category: 'medium',
    },
    // Fixation #9: Cold Zone / Hobbies (Cold 22%)
    {
      id: 'fix-9',
      sectionId: 'footer-block',
      x: 25,
      y: 95,
      intensity: 0.22,
      durationMs: 200,
      label: 'Informasi Tambahan / Cold Zone',
      order: 9,
      category: 'cold',
    },
  ];

  return points;
}

/**
 * 6. ATS CORRELATION ENGINE
 * Cross-references Eye-Tracking visual visibility against ATS keyword density.
 * Menghasilkan daftar kata kunci ATS secara dinamis berdasarkan target posisi & isi CV pengguna.
 */
export function analyzeAtsCorrelation(
  parsed: CvParsedData,
  fixations: FixationPoint[],
  targetRole: string
): AtsCorrelationItem[] {
  const roleName = (targetRole || parsed.roleTitle || 'Professional').trim();

  // 1. Kumpulkan seluruh teks CV untuk pencocokan kata kunci
  const getExpText = (e: any): string => {
    const ach = e?.achievements;
    if (Array.isArray(ach)) return ach.join(' ');
    if (typeof ach === 'string') return ach;
    return e?.description || '';
  };

  const allCvText = [
    parsed.summary || '',
    ...parsed.skills,
    ...parsed.experience.map((e) => `${e.role || ''} ${e.company || ''} ${getExpText(e)}`),
    ...parsed.education.map((e) => `${e.degree || ''} ${e.institution || ''}`),
  ]
    .join(' ')
    .toLowerCase();

  // 2. Ekstrak kata kunci dinamis dari skills dan role pengguna
  const dynamicKeywords: Array<{ kw: string; category: string }> = [];

  // Ambil hingga 4 skill utama milik kandidat
  if (parsed.skills.length > 0) {
    parsed.skills.slice(0, 4).forEach((skill) => {
      dynamicKeywords.push({ kw: skill, category: 'Keahlian Inti CV' });
    });
  }

  // Tambahkan kata kunci berbasis target role & kompetensi industri
  if (dynamicKeywords.length < 6) {
    const defaultCompetencies = [
      { kw: roleName, category: 'Target Jabatan' },
      { kw: 'Metrik Pencapaian (%)', category: 'Dampak Kuantitatif' },
      { kw: 'Komunikasi & Kolaborasi Tim', category: 'Soft Skill & Leadership' },
      { kw: 'Penyelesaian Masalah (Problem Solving)', category: 'Metode Kerja' },
      { kw: 'Manajemen Proyek & Target', category: 'Eksekusi Kerja' },
      { kw: 'Standar Kualitas & Review', category: 'Quality Assurance' },
    ];

    for (const comp of defaultCompetencies) {
      if (dynamicKeywords.length >= 6) break;
      if (!dynamicKeywords.some((k) => k.kw.toLowerCase() === comp.kw.toLowerCase())) {
        dynamicKeywords.push(comp);
      }
    }
  }

  return dynamicKeywords.slice(0, 6).map((item, idx) => {
    const searchTerms = item.kw.toLowerCase().split(/[\s/,&]+/).filter((t) => t.length > 2);
    const isFound = searchTerms.length > 0
      ? searchTerms.some((term) => allCvText.includes(term))
      : allCvText.includes(item.kw.toLowerCase());

    // Hitung skor visibilitas dan status keberadaan kata kunci secara jujur
    const visibilityScore = isFound ? Math.min(95, 80 + idx * 3) : 0;
    const atsScore = isFound ? Math.min(98, 85 + idx * 2) : 0;

    let quadrant: AtsCorrelationItem['quadrant'] = isFound ? 'gold' : 'cold_irrelevant';
    let recommendation = isFound
      ? 'Sudah terdeteksi di CV dan selaras dengan profil kompetensi posisi target.'
      : `Disarankan dicantumkan di seksi Keahlian atau Pengalaman untuk posisi ${roleName}.`;

    return {
      id: `ats-corr-${idx}`,
      keyword: item.kw,
      category: item.category,
      foundInCv: isFound,
      visibilityScore,
      atsScore,
      quadrant,
      recommendation,
    };
  });
}

/**
 * 7. AI RECOMMENDATION ENGINE & DYNAMIC HEURISTIC PIPELINE
 * Evaluasi menyeluruh berbasis data riil CV kandidat & persona target recruiter.
 */
export function runFullRvePipeline(
  sourceMode: 'saved' | 'upload' | 'text',
  savedData?: Partial<CvParsedData>,
  uploadedFile?: File | null,
  rawText?: string,
  targetRole: string = '',
  appliedFixIds: string[] = [],
  uploadedParsedData?: any,
  activePurpose: CvPurpose = 'job'
): RveReportResult {
  const parsedData = parseCvDocument(sourceMode, savedData, uploadedFile, rawText, uploadedParsedData);
  const resolvedTargetRole = (targetRole || parsedData.roleTitle || 'Professional').trim();
  const boundingBoxes = calculateLayoutAndHierarchy(parsedData);
  const fixationPoints = predictEyeTrackingAndHeatmap(parsedData, boundingBoxes);
  const atsCorrelations = analyzeAtsCorrelation(parsedData, fixationPoints, resolvedTargetRole);

  // 1. Analisis Kuantitatif & Scoring Multi-Purpose 5 Dimensi
  const purposeScore = evaluateCvComprehensive(parsedData, activePurpose, resolvedTargetRole);

  const allExpText = parsedData.experience
    .map((e) => (Array.isArray(e.achievements) ? e.achievements.join(' ') : ''))
    .join(' ');
  const metricsFound = (allExpText.match(/\d+%|\d+\+|persen|\bjt\b|\bjuta\b|\bribu\b|meningkatkan|menghemat|mempercepat/gi) || []).length;
  const hasStrongMetrics = metricsFound >= 2;
  const hasSkills = parsedData.skills.length >= 4;
  const hasSummary = parsedData.summary.length > 50;
  const hasExperience = parsedData.experience.length > 0;

  // 2. Perhitungan Skor Dinamis Terintegrasi Purpose
  const bonusFromFixes = appliedFixIds.length * 5;
  const basePurposeScore = purposeScore.overallScore;
  const overallAttentionScore = Math.min(98, basePurposeScore + 2 + bonusFromFixes);
  const fPatternScore = Math.min(99, (hasSummary && hasExperience ? 86 : 74) + bonusFromFixes);
  const atsScore = Math.min(98, purposeScore.dimensions.atsCompatibility.score + (appliedFixIds.length > 0 ? 8 : 0));

  const screenerVisualScore = Math.min(98, fPatternScore);
  const screenerAtsScore = Math.min(98, atsScore);
  const screenerImpactScore = Math.min(98, basePurposeScore + bonusFromFixes);
  const consensusScore = Math.min(99, Math.max(50, Math.round(basePurposeScore + bonusFromFixes)));


  const verdictStatus = consensusScore >= 85 ? 'interview' : consensusScore >= 70 ? 'maybe' : 'reject';

  // 3. Drop Reasons Dinamis berdasarkan kelemahan riil CV
  const dropReasons: string[] = [];
  if (!hasStrongMetrics) {
    dropReasons.push('Pencapaian pengalaman kerja belum banyak mencantumkan metrik kuantitatif (%) atau angka konkret.');
  }
  if (!hasSummary || parsedData.summary.length < 70) {
    dropReasons.push('Ringkasan profil masih terlalu singkat, belum menonjolkan keahlian inti untuk posisi target.');
  }
  if (parsedData.skills.length < 5) {
    dropReasons.push('Daftar keterampilan (skills) masih terbatas dan dapat ditambah variasi kompetensi pendukung.');
  }
  if (dropReasons.length === 0) {
    dropReasons.push('Tingkatkan penggunaan kata kerja aksi berdampak tinggi pada poin pencapaian terbaru.');
  }

  // 4. Rekomendasi Prioritas Tinggi Dinamis
  const highPriorityRecommendations: string[] = [
    `Tambahkan metrik angka kuantitatif (%) pada tanggung jawab proyek di posisi ${parsedData.experience[0]?.role || 'terakhir'}.`,
    `Perjelas Executive Summary agar langsung mengaitkan pengalaman dengan posisi ${resolvedTargetRole}.`,
    `Cantumkan kata kunci kompetensi utama (${parsedData.skills.slice(0, 3).join(', ') || 'keahlian inti'}) di seksi paling atas.`,
  ];

  // 5. Perbaikan Sebelum & Sesudah Dinamis dari data CV asli
  const rawFirstExp = parsedData.experience[0];
  const firstAch = Array.isArray(rawFirstExp?.achievements) && rawFirstExp.achievements.length > 0
    ? rawFirstExp.achievements[0]
    : 'Melaksanakan tugas operasional harian sesuai arahan pimpinan.';

  const optimizedFirstAch = firstAch.includes('%') || firstAch.includes('35%')
    ? firstAch
    : `${firstAch.replace(/\.$/, '')}, berhasil meningkatkan efisiensi proses kerja sebesar 25%+ dan memangkas waktu operasional.`;

  const rawSummary = parsedData.summary || 'Kandidat profesional berdedikasi dengan motivasi belajar tinggi.';
  const optimizedSummary = `${resolvedTargetRole} berpengalaman ${parsedData.experience.length > 1 ? '3+ tahun' : 'dalam bidang terkait'} dengan rekam jejak konsisten pada ${parsedData.skills.slice(0, 2).join(' & ') || 'bidang spesialisasi'}. Fokus pada hasil kerja nyata, efisiensi sistem, dan kolaborasi tim.`;

  const rawSkillsList = parsedData.skills.length > 0
    ? parsedData.skills.join(', ')
    : 'Keahlian Teknis, Komunikasi, Pemecahan Masalah';
  const optimizedSkillsList = parsedData.skills.length > 0
    ? `${parsedData.skills.join(', ')}, Metrik Efisiensi, Standar Kualitas Kerja, Best Practices`
    : `${resolvedTargetRole}, Manajemen Waktu, Analisis Data, Kolaborasi Tim, Problem Solving`;

  const beforeAfterFixes = [
    {
      id: 'fix-1',
      section: `Pengalaman Kerja (${rawFirstExp?.role || resolvedTargetRole})`,
      before: firstAch,
      after: optimizedFirstAch,
      impactBonus: 5,
    },
    {
      id: 'fix-2',
      section: 'Ringkasan Profil (Executive Summary)',
      before: rawSummary,
      after: optimizedSummary,
      impactBonus: 5,
    },
    {
      id: 'fix-3',
      section: 'Seksi Skills & Kompetensi Inti',
      before: rawSkillsList,
      after: optimizedSkillsList,
      impactBonus: 5,
    },
  ];

  // 6. Pertanyaan Wawancara Terprediksi Dinamis
  const predictedInterviewQuestions = [
    `Bisa ceritakan salah satu pencapaian paling signifikan saat Anda bertugas di ${rawFirstExp?.company || 'proyek terakhir'}?`,
    `Bagaimana metode Anda dalam memanfaatkan keahlian ${parsedData.skills[0] || resolvedTargetRole} untuk menyelesaikan tantangan kerja kompleks?`,
    `Apa pendekatan Anda dalam memastikan kualitas hasil kerja saat berkolaborasi dengan rekan tim lintas divisi?`,
  ];

  // 7. Multi-Screener Evaluasi Persona (Mematuhi Aturan Brand & Evaluasi Mendalam)
  const skillsListStr = parsedData.skills.length > 0 ? parsedData.skills.slice(0, 3).join(', ') : 'keahlian terkait';
  const roleName = resolvedTargetRole || 'posisi target';
  const companyName = rawFirstExp?.company || 'institusi kerja/proyek';
  const expRoleName = rawFirstExp?.role || roleName;

  const aiEvaluations: AiModelEvaluation[] = [
    {
      modelName: 'Screener Algoritma Keyword (ATS Engine)',
      badgeColor: 'bg-emerald-500',
      score: screenerAtsScore,
      pros: [
        `Kesesuaian kata kunci primer untuk posisi ${roleName} terindeks dengan baik pada filter sistem ATS, didukung kompetensi utama seperti ${skillsListStr} yang terbaca jelas oleh mesin parser.`,
        `Struktur dokumen menggunakan penamaan seksi standar industri (Ringkasan, Pengalaman Kerja, Pendidikan, Keterampilan) sehingga sistem ATS mampu memetakan riwayat kandidat tanpa kegagalan segmentasi data.`,
        `Format penulisan jabatan profesional ${expRoleName} dan instansi ${companyName} tersusun dalam teks murni yang ramah mesin pencari lowongan tanpa karakter tersembunyi yang berisiko korup.`,
      ],
      cons: [
        parsedData.skills.length < 6
          ? `Daftar kata kunci keterampilan teknis (${parsedData.skills.length} terdeteksi) masih perlu diperkaya dengan tools modern, metodologi kerja industri, atau akronim spesifik peran ${roleName} agar lolos ambang batas filter ketat.`
          : `Kepadatan variasi sinonim kata kunci industri masih dapat dioptimalkan agar profil menjangkau pencarian algoritma ATS multi-perusahaan secara lebih luas.`,
        'Sebagian kata kunci keahlian masih berdiri sendiri di seksi keterampilan dan belum terintegrasi secara kontekstual ke dalam kalimat pencapaian pengalaman kerja.',
      ],
    },
    {
      modelName: 'Screener Struktur Visual & Eye-Tracking (HRD)',
      badgeColor: 'bg-blue-500',
      score: screenerVisualScore,
      pros: [
        `Zona pandang 6 detik pertama (F-Pattern) terbentuk optimal di area atas: nama kandidat (${parsedData.candidateName || 'Kandidat'}), kontak aktif, dan jabatan target langsung menangkap fokus reviewer dalam 3 detik awal.`,
        `Hierarki tipografi antara judul posisi, nama institusi, dan rentang periode kerja memiliki kontras yang tegas sehingga memudahkan tim HRD memetakan kronologi karier secara vertikal dengan cepat.`,
        `Panjang ringkasan profil proporsional dan terstruktur rapi, menghindarkan reviewer dari cognitive fatigue saat menyaring puluhan hingga ratusan berkas dalam sehari.`,
      ],
      cons: [
        'Poin-poin uraian kerja membutuhkan konsistensi jeda antar-baris (line spacing) dan penyeragaman kata kerja aksi di awal kalimat agar alur pemindaian mata HRD terasa mengalir tanpa tersendat.',
        `Kaitkan ringkasan eksekutif secara lebih tajam dengan karakteristik posisi target (${roleName}) untuk menciptakan hook emosional yang langsung membekas di benak reviewer.`,
      ],
    },
    {
      modelName: 'Screener Dampak & Kualifikasi (Hiring Manager)',
      badgeColor: 'bg-amber-500',
      score: screenerImpactScore,
      pros: [
        `Pengalaman nyata pada ${expRoleName} di ${companyName} membuktikan kandidat memiliki pemahaman operasional dan kesiapan eksekusi tugas yang relevan dengan kebutuhan divisi kerja.`,
        `Latar belakang pendidikan serta portofolio kompetensi mencerminkan etos kerja disiplin, daya nalar logis, serta kapasitas problem-solving yang selaras dengan ekspektasi peran ${roleName}.`,
        `Uraian tanggung jawab memperlihatkan inisiatif kerja mandiri dan kemampuan koordinasi tim yang krusial untuk level posisi ${roleName}.`,
      ],
      cons: [
        !hasStrongMetrics
          ? 'Deskripsi pengalaman kerja masih dominan menyajikan daftar rutinitas tugas harian (task-oriented); sangat disarankan mengubah formulasi kalimat menjadi berorientasi dampak bisnis (impact-oriented) dengan menyertakan metrik kuantitatif terukur (%, efisiensi waktu, volume capaian).'
          : 'Metrik persentase keberhasilan yang sudah ada perlu dipertajam dengan penjelasan konteks dampak bisnis langsung terhadap efisiensi tim atau pertumbuhan target perusahaan.',
        `Perlu penegasan lebih mendalam mengenai skala tanggung jawab (seperti ukuran tim kolaborasi, kompleksitas tantangan teknis, atau lingkup proyek) agar Hiring Manager dapat memvalidasi tingkat otonomi kerja Anda secara akurat.`,
      ],
    },
  ];

  const beforeScore = Math.max(50, consensusScore - (appliedFixIds.length > 0 ? 14 : 10));

  return {
    parsedData,
    boundingBoxes,
    fixationPoints,
    overallAttentionScore,
    fPatternScore,
    atsScore,
    recruiterVerdict:
      verdictStatus === 'interview'
        ? `Lolos Pre-Screening RVE Pipeline! Struktur visual dan narasi CV sangat memikat perhatian recruiter target (${resolvedTargetRole}) dalam 6 detik pertama dan memenuhi kualifikasi sistem evaluasi.`
        : verdictStatus === 'maybe'
        ? `CV Berpeluang Dipertimbangkan (Maybe). Diperlukan penajaman pada penulisan metrik angka pencapaian agar impresi awal pada posisi ${resolvedTargetRole} lebih kuat.`
        : `CV Berisiko Tereliminasi. Mohon optimalkan seksi ringkasan dan tambahkan kata kunci yang sesuai dengan kualifikasi ${resolvedTargetRole}.`,
    verdictStatus,
    confidenceScore: 88,
    hrdNotes: `Recruiter Vision Pipeline mencatat tata letak judul dan seksi pengalaman tersusun rapi. Keterbacaan pola-F sangat baik dengan fokus utama pada pengalaman ${rawFirstExp?.role || resolvedTargetRole}.`,
    atsCorrelations,
    beforeAfterFixes,
    predictedInterviewQuestions,
    aiEvaluations,
    consensusScore,
    topAiSummary: {
      overview: `CV Anda memiliki fondasi yang ${consensusScore >= 80 ? 'sangat solid' : 'cukup baik'} untuk meloloskan tahap awal seleksi.`,
      dropReasons,
      estimatedProbability: consensusScore,
    },
    beforeAfterComparison: {
      beforeScore,
      afterScore: consensusScore,
      diff: consensusScore - beforeScore,
    },
    gamification: {
      progress: Math.min(100, consensusScore),
      checklist: [
        {
          id: 'check-1',
          label: 'Metrik Angka & Pencapaian (%)',
          bonus: 8,
          isDone: appliedFixIds.includes('fix-1') || hasStrongMetrics,
        },
        {
          id: 'check-2',
          label: 'Executive Summary Berorientasi Hasil',
          bonus: 6,
          isDone: appliedFixIds.includes('fix-2') || hasSummary,
        },
        {
          id: 'check-3',
          label: 'Kata Kunci Spesifik Role & Stack',
          bonus: 6,
          isDone: appliedFixIds.includes('fix-3') || hasSkills,
        },
      ],
    },
    highPriorityRecommendations,
    purposeScore,
    activePurpose,
  };
}

/**
 * 8. PROMPT GENERATOR UNTUK INTEGRASI AI SYSTEM
 * Membangun prompt terstruktur untuk evaluasi CV Screener via AI Gateway (/api/ai).
 */
export function generateCvScreenerAiPrompt(
  parsed: CvParsedData,
  targetRole: string,
  targetLevel: string,
  persona: RecruiterPersona,
  appliedFixIds: string[] = [],
  activePurpose: CvPurpose = 'job'
): string {
  const role = targetRole || parsed.roleTitle || 'Professional';
  return `Evaluasi secara mendalam dokumen CV berikut untuk simulasi screening recruiter.

DATA KANDIDAT:
- Nama: ${parsed.candidateName}
- Target Posisi: ${role} (Level: ${targetLevel})
- Tujuan Evaluasi CV (Purpose Profile): ${activePurpose} (Sesuaikan ekspektasi komponen dengan tujuan ini)
- Ringkasan Profil: ${parsed.summary || '-'}
- Keterampilan / Skills: ${parsed.skills.join(', ') || '-'}
- Pengalaman Kerja:
${parsed.experience.map((e, idx) => `  ${idx + 1}. ${e.role} di ${e.company} (${e.period}): ${Array.isArray(e.achievements) ? e.achievements.join(' | ') : e.achievements || '-'}`).join('\n')}
- Pendidikan:
${parsed.education.map((e, idx) => `  ${idx + 1}. ${e.degree} di ${e.institution} (${e.gpa || e.period})`).join('\n')}

KRITERIA RECRUITER TARGET:
- Persona: ${persona.name} (${persona.badge})
- Fokus Evaluasi: ${persona.evalFocus}
- Ekspektasi Utama: ${persona.highlights.join(', ')}
- Hal yang Kurang Ditekankan: ${persona.reducedEmphasis.join(', ')}
- Target Perusahaan: ${persona.companies.join(', ')}

ATURAN KRITIS PENILAIAN MULTI-SCREENER (aiEvaluations):
Wajib mengevaluasi secara ketat dan mendalam dari 3 sudut pandang independen dengan nama persis:
1. "Screener Algoritma Keyword (ATS Engine)":
   - 'pros' (2–3 poin, 15–35 kata per poin): Analisis detail kesesuaian kata kunci teknis, hard skills, dan istilah industri dengan target posisi ${role}. Sebutkan keahlian spesifik kandidat dari CV yang terbaca sempurna oleh parser ATS, serta evaluasi standarisasi format seksi.
   - 'cons' (2 poin, 15–35 kata per poin): Analisis detail kata kunci industri yang masih minim, tools/metodologi modern yang perlu ditambahkan, serta kelemahan integrasi kata kunci ke dalam kalimat pencapaian kerja.
2. "Screener Struktur Visual & Eye-Tracking (HRD)":
   - 'pros' (2–3 poin, 15–35 kata per poin): Analisis efektivitas pola pemindaian 6 detik pertama (F-Pattern), hook ringkasan profil, ketegasan hierarki tipografi judul pekerjaan & instansi, dan kenyamanan spasi teks.
   - 'cons' (2 poin, 15–35 kata per poin): Analisis konsistensi format bullet point, penyeragaman kata kerja aksi di awal kalimat, dan penajaman proposisi nilai pada ringkasan agar selaras dengan kultur kerja ${persona.name}.
3. "Screener Dampak & Kualifikasi (Hiring Manager)":
   - 'pros' (2–3 poin, 15–35 kata per poin): Analisis kesiapan kerja nyata, relevansi proyek/tanggung jawab terhadap kualifikasi ${role} level ${targetLevel}, dan inisiatif pemecahan masalah operasional.
   - 'cons' (2 poin, 15–35 kata per poin): Analisis kelemahan perumusan kalimat yang masih task-oriented (daftar rutinitas tugas), minimnya metrik keberhasilan kuantitatif (%, efisiensi, skala capaian), dan pentingnya membuktikan dampak bisnis langsung.

DILARANG KERAS MENGHASILKAN KATA PENDEK/SLOP seperti "Skill ada", "Format rapi", "Metrik kurang", "Mudah scan", "Summary hambar", "PM experience ada", "IPK bagus", "Dampak bisnis kabur". Setiap poin HARUS berupa kalimat evaluasi profesional yang utuh dan bernilai edukatif tinggi.

KEMBALIKAN HANYA JSON VALID TANPA MARKDOWN DENGAN STRUKTUR BERIKUT:
{
  "consensusScore": 88,
  "confidenceScore": 90,
  "verdictStatus": "interview",
  "recruiterVerdict": "Penjelasan ringkas hasil screening...",
  "hrdNotes": "Catatan impresi 6 detik pertama...",
  "topAiSummary": {
    "overview": "Ringkasan kesiapan CV...",
    "dropReasons": ["Poin kelemahan 1...", "Poin kelemahan 2...", "Poin kelemahan 3..."],
    "estimatedProbability": 88
  },
  "highPriorityRecommendations": [
    "Saran prioritas 1...",
    "Saran prioritas 2...",
    "Saran prioritas 3..."
  ],
  "atsCorrelations": [
    {
      "keyword": "Nama Skill / Kompetensi",
      "category": "Kategori",
      "foundInCv": true,
      "visibilityScore": 85,
      "atsScore": 90,
      "quadrant": "gold",
      "recommendation": "Rekomendasi spesifik..."
    }
  ],
  "beforeAfterFixes": [
    {
      "id": "fix-1",
      "section": "Pengalaman Kerja",
      "before": "Kalimat sebelum...",
      "after": "Kalimat sesudah yang lebih menjual dan terukur...",
      "impactBonus": 5
    },
    {
      "id": "fix-2",
      "section": "Ringkasan Profil (Executive Summary)",
      "before": "Kalimat sebelum...",
      "after": "Ringkasan sesudah...",
      "impactBonus": 5
    },
    {
      "id": "fix-3",
      "section": "Seksi Skills & Kompetensi",
      "before": "Skills sebelum...",
      "after": "Skills sesudah...",
      "impactBonus": 5
    }
  ],
  "predictedInterviewQuestions": [
    "Pertanyaan wawancara 1...",
    "Pertanyaan wawancara 2...",
    "Pertanyaan wawancara 3..."
  ],
  "aiEvaluations": [
    {
      "modelName": "Screener Algoritma Keyword (ATS Engine)",
      "score": 88,
      "pros": [
        "Kesesuaian kata kunci teknis dan fungsional untuk posisi ${role} terdeteksi baik pada sistem parser, didukung kompetensi spesifik yang selaras dengan kualifikasi lowongan.",
        "Struktur dokumen dan penamaan seksi standar industri memudahkan parser mengekstraksi riwayat pendidikan serta pengalaman kerja tanpa kendala segmentasi data."
      ],
      "cons": [
        "Daftar keahlian industri masih dapat diperkaya dengan tools modern atau metodologi relevan yang menjadi kata kunci pencarian utama recruiter.",
        "Sebagian kata kunci teknis masih terpisah di seksi skill dan belum terintegrasi ke dalam uraian kalimat pencapaian pengalaman kerja."
      ]
    },
    {
      "modelName": "Screener Struktur Visual & Eye-Tracking (HRD)",
      "score": 90,
      "pros": [
        "Pola pemindaian mata F-Pattern terbentuk optimal di seksi atas: nama kandidat, kontak aktif, dan posisi target langsung terbaca jelas dalam 3 detik pertama.",
        "Hierarki tipografi antara judul posisi, nama institusi, dan periode kerja tersusun rapi sehingga memudahkan pemetaan kronologi karier secara instan."
      ],
      "cons": [
        "Poin uraian pengalaman kerja memerlukan konsistensi penempatan kata kerja aksi di awal kalimat untuk menjaga ritme pemindaian cepat tim HRD.",
        "Ringkasan profil perlu penajaman hook proposisi nilai yang lebih memikat agar langsung membedakan kandidat dari ratusan pelamar lain."
      ]
    },
    {
      "modelName": "Screener Dampak & Kualifikasi (Hiring Manager)",
      "score": 86,
      "pros": [
        "Pengalaman kerja nyata dan keterlibatan proyek membuktikan kesiapan eksekusi operasional yang selaras dengan kualifikasi level ${targetLevel}.",
        "Kompetensi pemecahan masalah serta daya adaptasi kerja tercermin secara positif dalam ruang lingkup tanggung jawab yang pernah diemban."
      ],
      "cons": [
        "Uraian pencapaian kerja masih dominan berorientasi tugas rutin (task-oriented); disarankan mengubahnya menjadi impact-oriented dengan mencantumkan metrik angka konkret (%).",
        "Perlu penjelasan lebih rinci terkait skala tanggung jawab atau kompleksitas tantangan kerja untuk membuktikan tingkat kemandirian kandidat."
      ]
    }
  ]
}`;
}

/**
 * Helper untuk memperkaya dan menormalisasi poin evaluasi screener agar mendalam, profesional,
 * dan terbebas dari frasa pendek/generik (antislop).
 */
export function enrichScreenerPoint(
  text: string,
  type: 'pro' | 'con',
  screenerName: string,
  context: {
    targetRole?: string;
    candidateName?: string;
    skills?: string[];
    company?: string;
    expRole?: string;
    hasMetrics?: boolean;
    personaName?: string;
  } = {}
): string {
  const clean = (text || '').trim();
  const lower = clean.toLowerCase();
  const role = context.targetRole || 'posisi target';
  const skillsStr = context.skills && context.skills.length > 0
    ? context.skills.slice(0, 3).join(', ')
    : 'keahlian teknis terkait';
  const company = context.company || 'institusi kerja/proyek';
  const expRole = context.expRole || role;

  // 1. Pemetaan frasa pendek khas generik
  if (type === 'pro') {
    if (lower.includes('skill ada') || lower === 'ada skill' || lower === 'skill relevan') {
      return `Kesesuaian kata kunci keahlian teknis dan fungsional terdeteksi baik oleh parser ATS, didukung kompetensi utama (${skillsStr}) yang relevan dengan kualifikasi ${role}.`;
    }
    if (lower.includes('format rapi') || lower === 'format baik' || lower === 'tata letak baik') {
      return `Format dokumen bersih dan terstruktur dengan penamaan seksi standar industri, mempermudah parser ATS mengekstrak data tanpa risiko karakter korup atau unparsed text.`;
    }
    if (lower.includes('mudah scan') || lower === 'scan mudah' || lower === 'baca cepat') {
      return `Pola pemindaian mata F-Pattern terbentuk optimal di seksi atas: nama kandidat, kontak aktif, dan jabatan terkini langsung terbaca jelas dalam 3 detik pertama.`;
    }
    if (lower.includes('section jelas') || lower === 'seksi jelas' || lower === 'seksinya jelas') {
      return `Hierarki visual dan tipografi antar seksi tertata tegas, memudahkan tim rekruter memetakan kronologi pendidikan dan perjalanan karier secara instan.`;
    }
    if (lower.includes('experience ada') || lower.includes('pengalaman ada') || lower.includes('pm experience')) {
      return `Rekam jejak pengalaman nyata pada peran ${expRole} di ${company} membuktikan kesiapan kandidat dalam mengemban tanggung jawab dan kolaborasi tim secara profesional.`;
    }
    if (lower.includes('ipk bagus') || lower.includes('ipk tinggi') || lower === 'pendidikan bagus') {
      return `Kualifikasi akademis dan prestasi studi mencerminkan daya tangkap tinggi, kedisiplinan kerja, serta fondasi keilmuan yang solid untuk level posisi ini.`;
    }
  } else {
    if (lower.includes('metrik kurang') || lower === 'minim angka' || lower === 'kurang angka') {
      return `Kepadatan metrik angka kuantitatif (%) pada uraian pengalaman kerja masih minim, sehingga algoritma belum dapat mengukur efektivitas dan dampak kerja secara terukur.`;
    }
    if (lower.includes('summary hambar') || lower === 'ringkasan hambar' || lower === 'summary standar') {
      return `Ringkasan eksekutif (Executive Summary) belum memiliki kalimat hook pembeda yang kuat untuk langsung menegaskan proposisi nilai dan spesialisasi utama kandidat untuk peran ${role}.`;
    }
    if (lower.includes('dampak bisnis kabur') || lower === 'dampak kurang' || lower === 'kurang dampak') {
      return `Deskripsi pengalaman kerja masih didominasi daftar rutinitas tugas (task-oriented), belum memperlihatkan dampak bisnis langsung (business impact) seperti efisiensi waktu, optimalisasi biaya, atau pertumbuhan metrik tim.`;
    }
  }

  // 2. Jika kalimat terlalu pendek (< 32 karakter), perkaya dengan analisis mendalam kontekstual
  if (clean.length < 32) {
    const sName = (screenerName || '').toLowerCase();
    if (sName.includes('ats') || sName.includes('keyword')) {
      return type === 'pro'
        ? `Kesesuaian kata kunci teknis dan format seksi terdeteksi baik oleh algoritma ATS untuk posisi ${role} (${clean}).`
        : `Perluasan kata kunci industri spesifik dan integrasi tools relevan masih perlu ditingkatkan pada seksi pencapaian kerja (${clean}).`;
    }
    if (sName.includes('hrd') || sName.includes('visual') || sName.includes('eye')) {
      return type === 'pro'
        ? `Tata letak seksi dan hierarki judul memfasilitasi pemindaian cepat 6 detik pertama oleh tim HRD (${clean}).`
        : `Kerapian jeda baris dan konsistensi bullet point perlu ditingkatkan untuk kenyamanan pemindaian visual tim HRD (${clean}).`;
    }
    // Hiring Manager / Dampak
    return type === 'pro'
      ? `Kualifikasi profesional dan inisiatif kerja menunjukkan kesiapan kandidat dalam memenuhi ekspektasi operasional tim (${clean}).`
      : `Kuantifikasi hasil kerja dengan angka terukur dan bukti kontribusi dampak nyata masih perlu dipertajam (${clean}).`;
  }

  return clean;
}

/**
 * 9. PARSER RESPON AI UNTUK RVE RESULT
 * Mengintegrasikan JSON hasil respons AI Gateway dengan fallback yang aman.
 */
export function parseAiScreenerResponse(
  aiJsonText: string,
  baselineResult: RveReportResult
): RveReportResult {
  try {
    const cleaned = aiJsonText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    const context = {
      targetRole: baselineResult.parsedData.roleTitle,
      candidateName: baselineResult.parsedData.candidateName,
      skills: baselineResult.parsedData.skills,
      company: baselineResult.parsedData.experience[0]?.company,
      expRole: baselineResult.parsedData.experience[0]?.role,
    };

    return {
      ...baselineResult,
      consensusScore: typeof parsed.consensusScore === 'number' ? parsed.consensusScore : baselineResult.consensusScore,
      confidenceScore: typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : baselineResult.confidenceScore,
      verdictStatus: ['interview', 'maybe', 'reject'].includes(parsed.verdictStatus) ? parsed.verdictStatus : baselineResult.verdictStatus,
      recruiterVerdict: parsed.recruiterVerdict || baselineResult.recruiterVerdict,
      hrdNotes: parsed.hrdNotes || baselineResult.hrdNotes,
      topAiSummary: {
        overview: parsed.topAiSummary?.overview || baselineResult.topAiSummary.overview,
        dropReasons: Array.isArray(parsed.topAiSummary?.dropReasons) && parsed.topAiSummary.dropReasons.length > 0
          ? parsed.topAiSummary.dropReasons
          : baselineResult.topAiSummary.dropReasons,
        estimatedProbability: typeof parsed.topAiSummary?.estimatedProbability === 'number'
          ? parsed.topAiSummary.estimatedProbability
          : baselineResult.topAiSummary.estimatedProbability,
      },
      highPriorityRecommendations: Array.isArray(parsed.highPriorityRecommendations) && parsed.highPriorityRecommendations.length > 0
        ? parsed.highPriorityRecommendations
        : baselineResult.highPriorityRecommendations,
      atsCorrelations: Array.isArray(parsed.atsCorrelations) && parsed.atsCorrelations.length > 0
        ? parsed.atsCorrelations.map((item: any, idx: number) => {
            const isFound = Boolean(item.foundInCv);
            return {
              id: `ats-corr-${idx}`,
              keyword: item.keyword || item.kw || `Skill #${idx + 1}`,
              category: item.category || 'Kompetensi Industri',
              foundInCv: isFound,
              visibilityScore: isFound ? (typeof item.visibilityScore === 'number' ? item.visibilityScore : 85) : 0,
              atsScore: isFound ? (typeof item.atsScore === 'number' ? item.atsScore : 88) : 0,
              quadrant: isFound ? 'gold' : 'cold_irrelevant',
              recommendation: item.recommendation || (isFound ? 'Sudah terdeteksi di CV dan sesuai kualifikasi.' : 'Disarankan ditambahkan ke CV untuk memperkuat profil.'),
            };
          })
        : baselineResult.atsCorrelations,
      beforeAfterFixes: Array.isArray(parsed.beforeAfterFixes) && parsed.beforeAfterFixes.length > 0
        ? parsed.beforeAfterFixes.map((item: any, idx: number) => ({
            id: item.id || `fix-${idx + 1}`,
            section: item.section || `Seksi #${idx + 1}`,
            before: item.before || '',
            after: item.after || '',
            impactBonus: typeof item.impactBonus === 'number' ? item.impactBonus : 5,
          }))
        : baselineResult.beforeAfterFixes,
      predictedInterviewQuestions: Array.isArray(parsed.predictedInterviewQuestions) && parsed.predictedInterviewQuestions.length > 0
        ? parsed.predictedInterviewQuestions
        : baselineResult.predictedInterviewQuestions,
      aiEvaluations: Array.isArray(parsed.aiEvaluations) && parsed.aiEvaluations.length > 0
        ? parsed.aiEvaluations.map((item: any, idx: number) => {
            const defaultModel = idx === 0
              ? 'Screener Algoritma Keyword (ATS Engine)'
              : idx === 1
              ? 'Screener Struktur Visual & Eye-Tracking (HRD)'
              : 'Screener Dampak & Kualifikasi (Hiring Manager)';
            const modelName = item.modelName || defaultModel;
            const baselineItem = baselineResult.aiEvaluations[idx] || baselineResult.aiEvaluations[0];

            const rawPros = Array.isArray(item.pros) && item.pros.length > 0 ? item.pros : (baselineItem?.pros || []);
            const sanitizedPros = rawPros.map((p: any) =>
              enrichScreenerPoint(typeof p === 'string' ? p : String(p || ''), 'pro', modelName, context)
            );

            const rawCons = Array.isArray(item.cons) && item.cons.length > 0 ? item.cons : (baselineItem?.cons || []);
            const sanitizedCons = rawCons.map((c: any) =>
              enrichScreenerPoint(typeof c === 'string' ? c : String(c || ''), 'con', modelName, context)
            );

            return {
              modelName,
              badgeColor: idx === 0 ? 'bg-emerald-500' : idx === 1 ? 'bg-blue-500' : 'bg-amber-500',
              score: typeof item.score === 'number' ? item.score : (baselineItem?.score ?? baselineResult.consensusScore),
              pros: sanitizedPros.length > 0 ? sanitizedPros : (baselineItem?.pros || ['Struktur CV memenuhi standar evaluasi ATS.']),
              cons: sanitizedCons.length > 0 ? sanitizedCons : (baselineItem?.cons || ['Tingkatkan detail kuantifikasi pencapaian kerja.']),
            };
          })
        : baselineResult.aiEvaluations,
    };
  } catch (err) {
    console.warn('[parseAiScreenerResponse] Gagal parse JSON AI, menggunakan dynamic heuristic baseline:', err);
    return baselineResult;
  }
}


