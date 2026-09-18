/**
 * Job Matching Algorithm
 * Calculates realistic match score between user CV and job posting
 */

export interface JobMatchResult {
  jobId: string;
  matchScore: number;
  breakdown: {
    roleMatch: number;
    skillsMatch: number;
    experienceMatch: number;
    locationMatch: number;
    salaryMatch: number;
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
    'project manager': ['project', 'pmo', 'scrum', 'agile', 'product manager', 'project lead', 'program manager'],
    'product manager': ['product', 'pmo', 'project manager', 'product owner', 'scrum'],
    'web developer': ['frontend', 'backend', 'fullstack', 'software engineer', 'programmer', 'web', 'developer'],
    'frontend developer': ['frontend', 'react', 'next', 'vue', 'web developer', 'ui engineer'],
    'backend developer': ['backend', 'node', 'golang', 'php', 'laravel', 'api engineer'],
    'ui ux designer': ['product design', 'ui designer', 'ux designer', 'figma', 'designer'],
    'digital marketing': ['marketing', 'seo', 'social media', 'content creator', 'ads', 'copywriter'],
    'admin': ['administrasi', 'data entry', 'operasional', 'back office', 'staff admin'],
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

/**
 * Calculate skills overlap percentage
 */
function calculateSkillsMatch(cvSkills: string[], jobSkills: string[]): number {
  if (!cvSkills.length || !jobSkills.length) return 0;

  const cvSkillsLower = cvSkills.filter(Boolean).map((s) => normalizeText(String(s)));
  const jobSkillsLower = jobSkills.filter(Boolean).map((s) => normalizeText(String(s)));

  if (!cvSkillsLower.length || !jobSkillsLower.length) return 0;

  let matchCount = 0;
  jobSkillsLower.forEach((jobSkill) => {
    if (cvSkillsLower.some((cvSkill) => cvSkill.includes(jobSkill) || jobSkill.includes(cvSkill))) {
      matchCount++;
    }
  });

  return Math.min(100, Math.round((matchCount / jobSkillsLower.length) * 100));
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
 * Main matching function with role gate & strict location penalty
 */
export function calculateJobMatch(
  cv: CV,
  job: Job,
  weights?: { role: number; skills: number; experience: number; location: number; salary: number }
): JobMatchResult {
  const w = weights ?? { role: 0.35, skills: 0.30, experience: 0.15, location: 0.15, salary: 0.05 };

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

  // Core Hard Gate:
  // If targetRole is specified, but roleMatch is 0 AND skillsMatch is 0:
  // This job is completely unrelated (e.g. AC technician for a Project Manager).
  // Heavy disqualification: cap maximum score at 12% so it never pretends to be a recommendation.
  if (targetRole && roleMatch === 0 && skillsMatch === 0) {
    rawScore = Math.min(12, Math.round(rawScore * 0.2));
  } else if (locationMatch < 20 && (!job.workType || job.workType.toUpperCase() === 'ONSITE')) {
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

