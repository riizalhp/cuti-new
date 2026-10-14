/**
 * Job Matching Algorithm
 * Calculates realistic match score between user CV and job posting
 */

export interface CvCoherenceResult {
  isCoherent: boolean;
  coherenceScore: number;
  hasRoleConflict: boolean;
  warning?: string;
}

export interface JobMatchResult {
  jobId: string;
  matchScore: number;
  breakdown: {
    roleMatch: number;
    skillsMatch: number;
    experienceMatch: number;
    locationMatch: number;
    salaryMatch: number;
    isCoherent: boolean;
    coherenceScore: number;
    hasRoleConflict: boolean;
    coherenceWarning?: string;
  };
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  workType?: string;
  salary?: string;
  description: string;
  requirements?: string | string[];
  skills?: string[];
}

export interface CV {
  skills?: Array<{ name: string } | string>;
  skillsList?: string[];
  targetRole?: string;
  target_position?: string;
  headline?: string;
  experience?: Array<any>;
  projects?: Array<any>;
  internships?: Array<any>;
  location?: string;
  expectedSalary?: string;
}

/**
 * Indonesian Regional Mapping for Accurate Location Matching
 */
const REGION_GROUPS: Record<string, string[]> = {
  diy: ['yogyakarta', 'jogja', 'sleman', 'bantul', 'kulon progo', 'gunungkidul', 'diy', 'd.i. yogyakarta'],
  jateng: ['semarang', 'solo', 'surakarta', 'magelang', 'salatiga', 'purwokerto', 'kudus', 'pekalongan', 'tegal', 'cilacap', 'klaten', 'jawa tengah'],
  jabodetabek: ['jakarta', 'bogor', 'depok', 'tangerang', 'bekasi', 'cikarang', 'karawang', 'dki', 'jabodetabek'],
  jabar: ['bandung', 'cimahi', 'cirebon', 'sukabumi', 'tasikmalaya', 'garut', 'sumedang', 'jawa barat'],
  jatim: ['surabaya', 'malang', 'sidoarjo', 'gresik', 'kediri', 'jember', 'banyuwangi', 'madiun', 'jawa timur', 'jombang'],
  sumut: ['medan', 'binjai', 'deli serdang', 'pematangsiantar', 'tapanuli', 'sumatera utara'],
  sumbar: ['padang', 'bukittinggi', 'sumatera barat'],
  riau: ['pekanbaru', 'dumai', 'riau'],
  sumsel: ['palembang', 'sumatera selatan'],
  aceh: ['banda aceh', 'aceh', 'lhokseumawe'],
  bali: ['denpasar', 'badung', 'gianyar', 'bali'],
  sulsel: ['makassar', 'gowa', 'sulawesi selatan'],
  kalsel: ['banjarmasin', 'banjarbaru', 'kalimantan selatan'],
  kaltim: ['balikpapan', 'samarinda', 'ikn', 'kalimantan timur'],
};

function normalizeText(text: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculate location match with strict geographical realism
 */
export function calculateLocationMatch(cvLocation: string, jobLocation: string, workType?: string): number {
  const normJob = normalizeText(jobLocation);
  const normCv = normalizeText(cvLocation);
  const wt = (workType || '').toUpperCase();

  // 1. Remote / Hybrid / Online is always universally accessible (100%)
  if (
    wt === 'REMOTE' ||
    wt === 'HYBRID' ||
    wt === 'ONLINE' ||
    normJob.includes('remote') ||
    normJob.includes('wfh') ||
    normJob.includes('hybrid') ||
    normJob.includes('online') ||
    normJob.includes('bisa dari mana saja') ||
    normJob.includes('seluruh indonesia')
  ) {
    return 100;
  }

  // If user has not specified a location, give neutral baseline
  if (!normCv) {
    return 50;
  }

  // If job location is unknown or generic "Indonesia" / "[object Object]"
  if (!normJob || normJob === 'indonesia' || normJob === 'object object') {
    return 50;
  }

  // 2. Exact match or direct containment (e.g. "Yogyakarta" in "Kota Yogyakarta, DI Yogyakarta")
  if (normCv === normJob || normCv.includes(normJob) || normJob.includes(normCv)) {
    return 100;
  }

  // 3. Region cluster matching (e.g. Yogyakarta vs Sleman vs Bantul)
  for (const group of Object.values(REGION_GROUPS)) {
    const cvInGroup = group.some((city) => normCv.includes(city));
    const jobInGroup = group.some((city) => normJob.includes(city));
    if (cvInGroup && jobInGroup) {
      return 90; // Same metropolitan / provincial area
    }
  }

  // 4. Neighboring regions (e.g. DIY and Central Java are adjacent)
  const isCvDiyJateng = REGION_GROUPS.diy.some((c) => normCv.includes(c)) || REGION_GROUPS.jateng.some((c) => normCv.includes(c));
  const isJobDiyJateng = REGION_GROUPS.diy.some((c) => normJob.includes(c)) || REGION_GROUPS.jateng.some((c) => normJob.includes(c));
  if (isCvDiyJateng && isJobDiyJateng) {
    return 70; // Neighboring province
  }

  // 5. Strictly ONSITE in a distant city/island (e.g. Aceh vs Yogyakarta, Medan vs Surabaya)
  // Heavy penalty! Candidate cannot realistically commute onsite across provinces without relocation.
  return 5;
}

/**
 * Calculate role / title alignment
 */
export function calculateRoleMatch(targetRole: string, jobTitle: string): number {
  const normRole = normalizeText(targetRole);
  const normTitle = normalizeText(jobTitle);

  if (!normRole) return 50; // Neutral if user has not set a target role
  if (!normTitle) return 0;

  // Direct containment
  if (normTitle.includes(normRole) || normRole.includes(normTitle)) {
    return 100;
  }

  const roleTokens = normRole
    .split(/\s+/)
    .filter((t) => t.length > 2 && !['and', 'atau', 'dan', 'staff', 'junior', 'senior', 'intern', 'magang'].includes(t));

  const titleTokens = normTitle.split(/\s+/).filter((t) => t.length > 2);

  if (roleTokens.length === 0) return 50;

  const matchedTokens = roleTokens.filter((rt) => titleTokens.some((tt) => tt.includes(rt) || rt.includes(tt)));
  if (matchedTokens.length === roleTokens.length) {
    return 95;
  }
  if (matchedTokens.length > 0) {
    return Math.round((matchedTokens.length / roleTokens.length) * 85);
  }

  // Role synonyms & related domains
  const roleSynonyms: Record<string, string[]> = {
    'customer service': ['cs', 'customer support', 'call center', 'helpdesk', 'layanan pelanggan', 'telemarketing', 'contact center', 'front liner', 'desk collection'],
    'sales': ['marketing', 'account executive', 'business development', 'sales representative', 'promotor', 'penjualan', 'direct sales', 'account manager'],
    'coach': ['pelatih', 'trainer', 'mentor', 'esports', 'analyst', 'gaming'],
    'project manager': ['project', 'pmo', 'scrum', 'agile', 'product manager', 'project lead', 'program manager'],
    'product manager': ['product', 'pmo', 'project manager', 'product owner', 'scrum'],
    'web developer': ['frontend', 'backend', 'fullstack', 'software engineer', 'programmer', 'web', 'developer'],
    'frontend developer': ['frontend', 'react', 'next', 'vue', 'web developer', 'ui engineer'],
    'backend developer': ['backend', 'node', 'golang', 'php', 'laravel', 'api engineer'],
    'ui ux designer': ['product design', 'ui designer', 'ux designer', 'figma', 'designer'],
    'digital marketing': ['marketing', 'seo', 'social media', 'content creator', 'ads', 'copywriter'],
    'admin': ['administrasi', 'data entry', 'operasional', 'back office', 'staff admin'],
    'finance': ['akuntansi', 'keuangan', 'kasir', 'tax', 'pajak', 'auditor', 'accounting'],
    'operations': ['operasional', 'logistik', 'gudang', 'warehouse', 'kurir', 'driver', 'staff gudang'],
    'hr': ['human resources', 'recruiter', 'personalia', 'talent acquisition', 'hrd'],
    'content creator': ['social media', 'videographer', 'video editor', 'copywriter', 'content writer', 'kreator konten'],
  };

  for (const [key, synonyms] of Object.entries(roleSynonyms)) {
    if (normRole.includes(key)) {
      if (synonyms.some((syn) => normTitle.includes(syn))) {
        return 80;
      }
    }
  }

  // Completely irrelevant role (e.g. "Teknisi Listrik" vs "Project Manager")
  return 0;
}

const GENERIC_SOFT_SKILLS = new Set([
  'komunikasi', 'komunikasi tim', 'teamwork', 'leadership', 'kepemimpinan',
  'problem solving', 'analytical', 'kerjasama', 'adaptif', 'teliti',
  'disiplin', 'integritas', 'excel', 'microsoft excel', 'word', 'microsoft word',
  'powerpoint', 'office', 'google sheets', 'canva', 'public speaking',
  'time management', 'manajemen waktu'
]);

/**
 * Calculate skills overlap percentage with soft skills dampening
 */
function calculateSkillsMatch(cvSkills: string[], jobSkills: string[]): number {
  if (!cvSkills.length || !jobSkills.length) return 0;

  const cvSkillsLower = cvSkills.filter(Boolean).map((s) => normalizeText(String(s)));
  const jobSkillsLower = jobSkills.filter(Boolean).map((s) => normalizeText(String(s)));

  if (!cvSkillsLower.length || !jobSkillsLower.length) return 0;

  let matchCount = 0;
  let hasDomainSkillMatch = false;

  jobSkillsLower.forEach((jobSkill) => {
    const isMatched = cvSkillsLower.some((cvSkill) => cvSkill.includes(jobSkill) || jobSkill.includes(cvSkill));
    if (isMatched) {
      matchCount++;
      if (!GENERIC_SOFT_SKILLS.has(jobSkill)) {
        hasDomainSkillMatch = true;
      }
    }
  });

  const rawPercent = Math.min(100, Math.round((matchCount / jobSkillsLower.length) * 100));

  // If only generic soft skills matched without any domain hard skills, damp the score heavily
  if (matchCount > 0 && !hasDomainSkillMatch) {
    return Math.min(25, Math.round(rawPercent * 0.3));
  }

  return rawPercent;
}

/**
 * Calculate experience level match
 */
function calculateExperienceMatch(cv: CV, jobDescription: string): number {
  const totalExp =
    (cv.experience?.length || 0) +
    (cv.projects?.length || 0) +
    (cv.internships?.length || 0);

  const expMatch = jobDescription.match(/(\d+)\+?\s*(tahun|year)/i);
  const requiredYears = expMatch ? parseInt(expMatch[1], 10) : 0;

  if (requiredYears === 0) {
    return totalExp >= 1 ? 90 : 60;
  }

  const estimatedYears = totalExp * 1.5;
  if (estimatedYears >= requiredYears) return 100;
  if (estimatedYears >= requiredYears * 0.7) return 80;
  if (estimatedYears >= requiredYears * 0.5) return 60;
  return 30;
}

/**
 * Calculate salary range match
 */
function calculateSalaryMatch(cvSalary: string, jobSalary: string): number {
  if (!cvSalary || !jobSalary) return 60; // neutral if not specified

  const extractNumber = (str: string): number => {
    const match = str.match(/(\d+[\.,]?\d*)/);
    if (!match) return 0;
    return parseFloat(match[1].replace(',', '.').replace('.', ''));
  };

  const cvAmount = extractNumber(cvSalary);
  const jobAmount = extractNumber(jobSalary);

  if (cvAmount === 0 || jobAmount === 0) return 60;

  if (jobAmount >= cvAmount) return 100;
  if (jobAmount >= cvAmount * 0.9) return 90;
  if (jobAmount >= cvAmount * 0.8) return 80;
  if (jobAmount >= cvAmount * 0.7) return 60;
  return 40;
}

/**
 * Extract skills from job description text
 */
function extractSkillsFromText(text: string): string[] {
  const commonSkills = [
    'javascript', 'typescript', 'react', 'vue', 'angular', 'node', 'python',
    'java', 'php', 'laravel', 'django', 'flask', 'sql', 'mysql', 'postgresql',
    'mongodb', 'redis', 'docker', 'kubernetes', 'aws', 'gcp', 'azure',
    'html', 'css', 'tailwind', 'bootstrap', 'git', 'github', 'gitlab',
    'excel', 'word', 'powerpoint', 'admin', 'data entry', 'customer service',
    'komunikasi', 'teamwork', 'leadership', 'problem solving', 'analytical',
    'agile', 'scrum', 'trello', 'jira', 'figma', 'canva', 'copywriting'
  ];

  const textLower = text.toLowerCase();
  return commonSkills.filter((skill) => textLower.includes(skill));
}

/**
 * Check internal coherence between CV declared target role and actual experiences/skills
 */
export function checkCvInternalCoherence(cv: CV): CvCoherenceResult {
  const rawTarget = cv.targetRole || cv.target_position || cv.headline || '';
  const targetRole = normalizeText(rawTarget);
  if (!targetRole) {
    return { isCoherent: true, coherenceScore: 100, hasRoleConflict: false };
  }

  // Extract roles from experience, projects, and internships
  const expRoles = [
    ...(Array.isArray(cv.experience) ? cv.experience.map((e: any) => e.role || e.position || '') : []),
    ...(Array.isArray(cv.projects) ? cv.projects.map((p: any) => p.role || p.name || '') : []),
    ...(Array.isArray(cv.internships) ? cv.internships.map((i: any) => i.role || i.position || '') : []),
  ].map(normalizeText).filter(Boolean);

  // Extract skills
  const cvSkills = [
    ...(Array.isArray(cv.skills) ? cv.skills.map((s: any) => (typeof s === 'string' ? s : s?.name || s?.skill || '')) : []),
    ...(Array.isArray(cv.skillsList) ? cv.skillsList : []),
  ].map(normalizeText).filter(Boolean);

  // If candidate has no experience and no skills filled yet (blank starter CV)
  if (expRoles.length === 0 && cvSkills.length === 0) {
    return { isCoherent: true, coherenceScore: 70, hasRoleConflict: false };
  }

  const roleTokens = targetRole
    .split(/\s+/)
    .filter((t) => t.length > 2 && !['and', 'atau', 'dan', 'staff', 'junior', 'senior', 'intern', 'magang'].includes(t));

  // Check 1: Does any experience role overlap with target role or its synonyms?
  let hasExperienceRoleMatch = false;
  for (const expRole of expRoles) {
    if (calculateRoleMatch(targetRole, expRole) >= 70) {
      hasExperienceRoleMatch = true;
      break;
    }
  }

  // Check 2: Does any skill overlap with target role tokens or hard domain skills?
  let hasDomainSkillMatch = false;
  for (const skill of cvSkills) {
    if (!GENERIC_SOFT_SKILLS.has(skill)) {
      if (roleTokens.some((rt) => skill.includes(rt) || rt.includes(skill))) {
        hasDomainSkillMatch = true;
        break;
      }
    }
  }

  // Severe Internal Conflict:
  // Target position is explicitly set, and candidate HAS filled experience/skills,
  // but ZERO experience roles match and ZERO domain skills match!
  if (!hasExperienceRoleMatch && !hasDomainSkillMatch && (expRoles.length > 0 || cvSkills.length > 3)) {
    return {
      isCoherent: false,
      coherenceScore: 20,
      hasRoleConflict: true,
      warning: `Target posisi "${rawTarget}" tidak didukung oleh riwayat pekerjaan atau keahlian di dalam CV ini.`,
    };
  }

  return {
    isCoherent: true,
    coherenceScore: hasExperienceRoleMatch ? 100 : 75,
    hasRoleConflict: false,
  };
}

/**
 * Main matching function with role gate, strict location penalty, and internal coherence check
 */
export function calculateJobMatch(
  cv: CV,
  job: Job,
  weights?: { role: number; skills: number; experience: number; location: number; salary: number }
): JobMatchResult {
  const w = weights ?? { role: 0.35, skills: 0.30, experience: 0.15, location: 0.15, salary: 0.05 };

  const coherence = checkCvInternalCoherence(cv);
  const targetRole = cv.targetRole || cv.target_position || cv.headline || '';
  const roleMatch = calculateRoleMatch(targetRole, job.title || '');

  // Extract CV skills
  const cvSkills: string[] = [
    ...(Array.isArray(cv.skills)
      ? cv.skills.map((s: any) => (typeof s === 'string' ? s : s?.name || s?.skill || s?.title || ''))
      : []),
    ...(Array.isArray(cv.skillsList) ? cv.skillsList : []),
  ].filter(Boolean);

  // Extract job skills
  const rawReqs = typeof job.requirements === 'string'
    ? job.requirements
    : Array.isArray(job.requirements)
    ? job.requirements.join(' ')
    : '';

  const jobSkills =
    Array.isArray(job.skills) && job.skills.length > 0
      ? job.skills.map((s: any) => (typeof s === 'string' ? s : s?.name || '')).filter(Boolean)
      : extractSkillsFromText(`${rawReqs} ${job.description || ''}`);

  const skillsMatch = calculateSkillsMatch(cvSkills, jobSkills);
  const experienceMatch = calculateExperienceMatch(cv, job.description || '');
  const locationMatch = calculateLocationMatch(cv.location || '', job.location || '', job.workType);
  const salaryMatch = calculateSalaryMatch(cv.expectedSalary || '', job.salary || '');

  let rawScore = Math.round(
    roleMatch * w.role +
    skillsMatch * w.skills +
    experienceMatch * w.experience +
    locationMatch * w.location +
    salaryMatch * w.salary
  );

  // Core Hard Gate & Role Cap Penalty:
  // If targetRole is specified by candidate:
  if (targetRole) {
    if (roleMatch === 0) {
      // Role is completely unaligned (e.g. Sales Manager vs CS or Esports Coach)
      if (skillsMatch === 0) {
        // Disqualification: neither role nor skills match
        rawScore = Math.min(10, Math.round(rawScore * 0.15));
      } else {
        // Some skills matched (e.g. generic tools/soft skills), but the profession is completely different.
        // Role Cap Penalty: lock max score at 25% so unrelated professions NEVER reach 40%-50%!
        rawScore = Math.min(25, Math.round(rawScore * 0.45));
      }
    } else if (roleMatch < 50) {
      // Weak/partial role match: cap maximum score at 55%
      rawScore = Math.min(55, rawScore);
    }
  }

  // Internal CV Coherence Guard:
  // If CV has a severe internal contradiction (e.g. Target says Customer Service, but body is 100% Esports Coach):
  // Even if the external job is "Customer Service Officer" (roleMatch = 100),
  // this candidate's CV does NOT actually qualify for Customer Service in reality!
  if (coherence.hasRoleConflict) {
    rawScore = Math.min(20, Math.round(rawScore * 0.3));
  }

  if (locationMatch < 20 && (!job.workType || job.workType.toUpperCase() === 'ONSITE')) {
    // Distant onsite job without relocation capability gets penalized
    rawScore = Math.round(rawScore * 0.4);
  }

  const matchScore = Math.min(99, Math.max(0, rawScore));

  return {
    jobId: job.id,
    matchScore,
    breakdown: {
      roleMatch,
      skillsMatch,
      experienceMatch,
      locationMatch,
      salaryMatch,
      isCoherent: coherence.isCoherent,
      coherenceScore: coherence.coherenceScore,
      hasRoleConflict: coherence.hasRoleConflict,
      coherenceWarning: coherence.warning,
    },
  };
}

/**
 * Get top matching jobs for a CV
 */
export function getTopMatchingJobs(cv: CV, jobs: Job[], limit: number = 10): JobMatchResult[] {
  const matches = jobs.map((job) => calculateJobMatch(cv, job));
  return matches
    .filter((m) => m.matchScore >= 25)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}

