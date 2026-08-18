/**
 * Job Matching Algorithm
 * Calculates match score between user CV and job posting
 */

export interface JobMatchResult {
  jobId: string;
  matchScore: number;
  breakdown: {
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
  salary?: string;
  description: string;
  requirements?: string;
  skills?: string[];
}

export interface CV {
  skills?: Array<{ name: string }>;
  experience?: Array<any>;
  projects?: Array<any>;
  internships?: Array<any>;
  location?: string;
  expectedSalary?: string;
}

/**
 * Calculate skills overlap percentage
 */
function calculateSkillsMatch(cvSkills: string[], jobSkills: string[]): number {
  if (!cvSkills.length || !jobSkills.length) return 0;

  const cvSkillsLower = cvSkills.map(s => s.toLowerCase().trim());
  const jobSkillsLower = jobSkills.map(s => s.toLowerCase().trim());

  let matchCount = 0;
  jobSkillsLower.forEach(jobSkill => {
    if (cvSkillsLower.some(cvSkill =>
      cvSkill.includes(jobSkill) || jobSkill.includes(cvSkill)
    )) {
      matchCount++;
    }
  });

  return Math.min(100, Math.round((matchCount / jobSkillsLower.length) * 100));
}

/**
 * Calculate experience level match
 */
function calculateExperienceMatch(cv: CV, jobDescription: string): number {
  const totalExp = (cv.experience?.length || 0) +
                   (cv.projects?.length || 0) +
                   (cv.internships?.length || 0);

  // Extract years of experience from job description
  const expMatch = jobDescription.match(/(\d+)\+?\s*(tahun|year)/i);
  const requiredYears = expMatch ? parseInt(expMatch[1]) : 0;

  if (requiredYears === 0) {
    // Entry level or no specific requirement
    return totalExp >= 1 ? 100 : 80;
  }

  // Rough estimate: 1 experience entry ≈ 1-2 years
  const estimatedYears = totalExp * 1.5;

  if (estimatedYears >= requiredYears) return 100;
  if (estimatedYears >= requiredYears * 0.7) return 85;
  if (estimatedYears >= requiredYears * 0.5) return 70;
  return 50;
}

/**
 * Calculate location match
 */
function calculateLocationMatch(cvLocation: string, jobLocation: string): number {
  if (!cvLocation || !jobLocation) return 75; // neutral if not specified

  const cvLoc = cvLocation.toLowerCase().trim();
  const jobLoc = jobLocation.toLowerCase().trim();

  // Exact match
  if (cvLoc === jobLoc) return 100;

  // Contains match (e.g., "Jakarta Selatan" contains "Jakarta")
  if (cvLoc.includes(jobLoc) || jobLoc.includes(cvLoc)) return 90;

  // Same province/region
  const regions = ['jakarta', 'bandung', 'surabaya', 'medan', 'semarang'];
  const cvRegion = regions.find(r => cvLoc.includes(r));
  const jobRegion = regions.find(r => jobLoc.includes(r));
  if (cvRegion && cvRegion === jobRegion) return 80;

  // Remote/hybrid keywords
  if (jobLoc.includes('remote') || jobLoc.includes('hybrid')) return 95;

  return 60; // different location but still possible
}

/**
 * Calculate salary range match
 */
function calculateSalaryMatch(cvSalary: string, jobSalary: string): number {
  if (!cvSalary || !jobSalary) return 80; // neutral if not specified

  // Extract numbers from salary strings
  const extractNumber = (str: string): number => {
    const match = str.match(/(\d+[\.,]?\d*)/);
    if (!match) return 0;
    return parseFloat(match[1].replace(',', '.').replace('.', ''));
  };

  const cvAmount = extractNumber(cvSalary);
  const jobAmount = extractNumber(jobSalary);

  if (cvAmount === 0 || jobAmount === 0) return 80;

  // Check if salary meets expectations
  if (jobAmount >= cvAmount) return 100;
  if (jobAmount >= cvAmount * 0.9) return 95;
  if (jobAmount >= cvAmount * 0.8) return 85;
  if (jobAmount >= cvAmount * 0.7) return 70;
  return 50;
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
    'komunikasi', 'teamwork', 'leadership', 'problem solving', 'analytical'
  ];

  const textLower = text.toLowerCase();
  return commonSkills.filter(skill => textLower.includes(skill));
}

/**
 * Main matching function
 */
export function calculateJobMatch(cv: CV, job: Job): JobMatchResult {
  // Extract CV skills
  const cvSkills = cv.skills?.map(s => s.name) || [];

  // Extract job skills from explicit field or description
  const jobSkills = job.skills ||
                    extractSkillsFromText((job.requirements || '') + ' ' + job.description);

  // Calculate individual matches
  const skillsMatch = calculateSkillsMatch(cvSkills, jobSkills);
  const experienceMatch = calculateExperienceMatch(cv, job.description);
  const locationMatch = calculateLocationMatch(cv.location || '', job.location);
  const salaryMatch = calculateSalaryMatch(cv.expectedSalary || '', job.salary || '');

  // Weighted average (skills most important for ATS)
  const matchScore = Math.round(
    skillsMatch * 0.45 +
    experienceMatch * 0.30 +
    locationMatch * 0.15 +
    salaryMatch * 0.10
  );

  return {
    jobId: job.id,
    matchScore,
    breakdown: {
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
  const matches = jobs.map(job => calculateJobMatch(cv, job));
  return matches
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}
