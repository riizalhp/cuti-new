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
    score: number; // 0 - 100
    label: string;
    passedItems: string[];
    missingItems: string[];
    description: string;
  };
  atsCompatibility: {
    score: number; // 0 - 100
    label: string;
    passedChecks: string[];
    failedChecks: string[];
    description: string;
  };
  contentQuality: {
    score: number; // 0 - 100
    label: string;
    actionVerbsCount: number;
    clarityLevel: 'Tinggi' | 'Sedang' | 'Perlu Ditingkatkan';
    description: string;
  };
  jobRelevance: {
    score: number; // 0 - 100
    label: string;
    matchedKeywords: string[];
    missingKeywords: string[];
    transferableSkillsFound: string[];
    description: string;
  };
  achievementStrength: {
    score: number; // 0 - 100
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
  weight: number; // percentage, e.g. 20 for 20%
  score: number; // 0 - 100 earned score for this component
  weightedContribution: number; // weight * score / 100
  status: 'optimal' | 'good' | 'needs_work' | 'missing';
  feedback: string;
}

export interface ComprehensiveCvScoreResult {
  purpose: CvPurpose;
  purposeProfile: PurposeProfileConfig;
  overallScore: number; // 0 - 100
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
