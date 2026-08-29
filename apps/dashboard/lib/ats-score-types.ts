export type ATSScoreState = 'critical' | 'weak' | 'fair' | 'good' | 'excellent';

export interface ATSIssue {
  id: string;
  category: 'contentQuality' | 'atsReadability' | 'completeness' | 'contentIntegrity';
  severity: 'critical' | 'major' | 'minor';
  section?: 'basics' | 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications';
  fieldId?: string;
  message: string;
  recommendation: string;
  penalty: number;
  potentialGain: number;
}

export interface EngineBreakdown {
  score: number; // 0 - 100
  weight: number; // e.g. 0.40
  weightedScore: number; // score * weight
  issuesCount: number;
}

export interface DynamicATSResult {
  totalScore: number; // 0 - 100
  state: ATSScoreState;
  stateLabel: string;
  stateDescription: string;
  potentialScore: number;

  engines: {
    contentQuality: EngineBreakdown;
    atsReadability: EngineBreakdown;
    completeness: EngineBreakdown;
    contentIntegrity: EngineBreakdown;
  };

  issues: ATSIssue[];
  penaltiesApplied: { category: string; amount: number; reason: string }[];
  isEmptyOrDefault: boolean;
  calculatedAt: string;
}

export const ATS_ACTION_VERBS = [
  'developed', 'built', 'designed', 'implemented', 'optimized', 'automated',
  'led', 'managed', 'analyzed', 'created', 'improved', 'engineered', 'launched',
  'reduced', 'increased', 'architected', 'scaled', 'delivered', 'spearheaded',
  'orchestrated', 'streamlined', 'transformed', 'formulated', 'established',
  'drove', 'generated', 'expanded', 'accelerated', 'pioneered', 'restructured'
];

export const TEMPLATE_PLACEHOLDERS = [
  'nama perusahaan', 'nama perusahaan sebelumnya', 'nama universitas',
  'john doe', 'jane doe', 'nama lengkap anda', 'nama lengkap',
  'email@example.com', 'your name', 'company name',
  'job title', 'insert your text', 'add your experience', 'write your summary',
  'lorem ipsum', 'sample text', 'click here to edit', 'double click to edit',
  'replace this text', 'add your content', 'responsible for various tasks',
  'worked with different teams', 'performed assigned duties',
];
