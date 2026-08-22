/**
 /**
 * ATS Score Bridge module — untuk backward compatibility dengan komponen lama yang mengimpor dari `lib/ats-score.ts`.
 * Seluruh fungsi inti disalurkan ke `ats-score-engine.ts`.
 */

export * from './ats-score-types';
export * from './ats-score-engine';

import {
  calculateDynamicAtsScore,
  getAtsStateInfo,
  isCVEmptyOrDefault as checkEmpty,
} from './ats-score-engine';

export function isCVEmptyOrDefault(cv: any): boolean {
  return checkEmpty(cv);
}

export function calculateAtsScore(cv: any): any {
  const res = calculateDynamicAtsScore(cv);

  return {
    totalScore: res.totalScore,
    keywordScore: res.engines.contentQuality.score,
    expScore: res.engines.contentQuality.score,
    formatScore: res.engines.atsReadability.score,
    completenessScore: res.engines.completeness.score,
    recommendationsCount: res.issues.length,
    accuracyRate: Math.min(99, Math.max(70, Math.round(res.totalScore * 1.05))),
    isEmptyOrDefault: res.isEmptyOrDefault,
    penalties: res.issues.map((i) => i.message),
    bonuses: [
      'Engine Content Quality 40%',
      'Engine ATS Readability 25%',
      'Engine Completeness 20%',
      'Engine Content Integrity 15%',
    ],
    dynamicResult: res,
  };
}

export function getAtsStatusLabel(score: number, isEmpty = false): string {
  const info = getAtsStateInfo(score, isEmpty);
  return info.stateLabel;
}
