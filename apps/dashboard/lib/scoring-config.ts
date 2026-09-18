import { prisma } from '@employr/db';

interface ScoringWeights {
  ats: {
    contentQuality: number;
    atsReadability: number;
    completeness: number;
    contentIntegrity: number;
  };
  jobMatch: {
    skills: number;
    experience: number;
    location: number;
    salary: number;
  };
}

const DEFAULTS: ScoringWeights = {
  ats: { contentQuality: 0.4, atsReadability: 0.25, completeness: 0.2, contentIntegrity: 0.15 },
  jobMatch: { skills: 0.45, experience: 0.30, location: 0.15, salary: 0.10 },
};

let cached: ScoringWeights | null = null;
let cacheExpiry = 0;

function validateWeights(weights: ScoringWeights): ScoringWeights {
  const validated = { ...weights };
  
  // Each weight must be between 0.05 and 0.60
  const clamp = (v: number) => Math.max(0.05, Math.min(0.60, v));
  
  validated.ats.contentQuality = clamp(validated.ats.contentQuality);
  validated.ats.atsReadability = clamp(validated.ats.atsReadability);
  validated.ats.completeness = clamp(validated.ats.completeness);
  validated.ats.contentIntegrity = clamp(validated.ats.contentIntegrity);
  
  // ATS weights must sum to ~1.0 (normalize if off)
  const atsSum = validated.ats.contentQuality + validated.ats.atsReadability + 
                 validated.ats.completeness + validated.ats.contentIntegrity;
  if (Math.abs(atsSum - 1.0) > 0.01) {
    validated.ats.contentQuality /= atsSum;
    validated.ats.atsReadability /= atsSum;
    validated.ats.completeness /= atsSum;
    validated.ats.contentIntegrity /= atsSum;
  }
  
  validated.jobMatch.skills = clamp(validated.jobMatch.skills);
  validated.jobMatch.experience = clamp(validated.jobMatch.experience);
  validated.jobMatch.location = clamp(validated.jobMatch.location);
  validated.jobMatch.salary = clamp(validated.jobMatch.salary);
  
  // Job match weights must sum to ~1.0
  const jmSum = validated.jobMatch.skills + validated.jobMatch.experience + 
                validated.jobMatch.location + validated.jobMatch.salary;
  if (Math.abs(jmSum - 1.0) > 0.01) {
    validated.jobMatch.skills /= jmSum;
    validated.jobMatch.experience /= jmSum;
    validated.jobMatch.location /= jmSum;
    validated.jobMatch.salary /= jmSum;
  }
  
  return validated;
}

export async function getScoringWeights(): Promise<ScoringWeights> {
  if (cached && Date.now() < cacheExpiry) return cached;
  
  try {
    const settings = await prisma.system_settings.findMany({
      where: { group: 'scoring_weights' },
    });
    
    const weights = {
      ats: { ...DEFAULTS.ats },
      jobMatch: { ...DEFAULTS.jobMatch }
    };
    
    for (const s of settings) {
      const val = parseFloat(s.value);
      if (isNaN(val)) continue;
      
      if (s.key === 'ats_content_quality') weights.ats.contentQuality = val;
      if (s.key === 'ats_readability') weights.ats.atsReadability = val;
      if (s.key === 'ats_completeness') weights.ats.completeness = val;
      if (s.key === 'ats_integrity') weights.ats.contentIntegrity = val;
      if (s.key === 'jobmatch_skills') weights.jobMatch.skills = val;
      if (s.key === 'jobmatch_experience') weights.jobMatch.experience = val;
      if (s.key === 'jobmatch_location') weights.jobMatch.location = val;
      if (s.key === 'jobmatch_salary') weights.jobMatch.salary = val;
    }
    
    cached = validateWeights(weights);
    cacheExpiry = Date.now() + 5 * 60 * 1000; // 5 min cache
    return cached;
  } catch {
    return {
      ats: { ...DEFAULTS.ats },
      jobMatch: { ...DEFAULTS.jobMatch }
    };
  }
}

export function getDefaultWeights(): ScoringWeights {
  return {
    ats: { ...DEFAULTS.ats },
    jobMatch: { ...DEFAULTS.jobMatch }
  };
}
