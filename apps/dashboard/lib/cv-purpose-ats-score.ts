import { calculateDynamicAtsScore } from './ats-score-engine';
import { DynamicATSResult, ATSIssue } from './ats-score-types';
import { CvPurpose } from './cv-purpose-scoring-engine';
import {
  CvSectionKey,
  CvSectionDataInput,
  getSectionOrderForPurpose,
  getSectionWeight,
  hasSectionData,
  getSectionFillRatio,
  getSectionLabel,
  getRequiredSectionKeys,
} from './cv-section-scoring-matrix';

/**
 * Purpose-Aware ATS Scorer
 * ========================
 * Menggabungkan dua komponen:
 * 1. Format ATS (engine existing `calculateDynamicAtsScore`) — keterbacaan mesin,
 *    kualitas konten, integritas — tetap jadi fondasi.
 * 2. Purpose Completeness — kelengkapan section dinilai sesuai bobot matrix
 *    tujuan CV (0–5). Section wajib (bobot 5) kosong memberi penalti besar;
 *    section berbobot tinggi yang terisi memberi bonus.
 *
 * Skor berubah otomatis ketika user mengganti tujuan CV.
 */

export interface PurposeSectionStatus {
  key: CvSectionKey;
  label: string;
  weight: number;
  filled: boolean;
  fillRatio: number;
  required: boolean;
  hidden: boolean;
}

export interface PurposeAwareAtsResult extends DynamicATSResult {
  purpose: CvPurpose;
  purposeBreakdown: {
    formatScore: number;
    completenessScore: number;
    totalScore: number;
    sectionStatuses: PurposeSectionStatus[];
    missingRequired: string[];
    missingHighImpact: string[];
    /** Bonus dari keyword AI yang di-apply user (0 jika belum ada). */
    aiKeywordBonus?: number;
  };
}

const FORMAT_WEIGHT = 0.6;
const PURPOSE_WEIGHT = 0.4;

/**
 * Sinyal keyword ATS hasil AI (dari 'keywords_used' pada output cv-rewriter-prompt).
 * Disimpan per section saat user meng-apply opsi AI; di-blend sebagai sinyal positif
 * kualitas keyword tanpa mengubah skor baseline (format + completeness).
 */
export interface AiKeywordSignal {
  keywords: string[];
  appliedAt: number; // Date.now()
}

export type AiKeywordSignals = Record<string, AiKeywordSignal>; // key: sectionKey

const AI_KEYWORD_BONUS_CAP = 5; // maks +5 poin total, tidak menimpa baseline

export function calculatePurposeAwareAtsScore(
  cv: CvSectionDataInput,
  purpose: CvPurpose = 'job',
  aiKeywordSignals?: AiKeywordSignals
): PurposeAwareAtsResult {
  const base = calculateDynamicAtsScore(cv);

  const order = getSectionOrderForPurpose(purpose);
  const requiredKeys = getRequiredSectionKeys(purpose);

  const sectionStatuses: PurposeSectionStatus[] = order.map((key) => ({
    key,
    label: getSectionLabel(key),
    weight: getSectionWeight(purpose, key),
    filled: hasSectionData(key, cv),
    fillRatio: getSectionFillRatio(key, cv),
    required: requiredKeys.includes(key),
    hidden: false,
  }));

  // Jika CV kosong atau masih draft contoh bawaan template, kunci skor pada 0 dan tampilkan Draft Contoh
  if (base.isEmptyOrDefault) {
    return {
      ...base,
      totalScore: 0,
      state: 'critical',
      stateLabel: base.stateLabel || 'Draft Contoh',
      stateDescription:
        base.stateDescription ||
        'Data masih menggunakan contoh bawaan template. Masukkan data riwayat aslimu untuk memulai evaluasi ATS.',
      purpose,
      purposeBreakdown: {
        formatScore: 0,
        completenessScore: 0,
        totalScore: 0,
        sectionStatuses,
        missingRequired: [],
        missingHighImpact: [],
        aiKeywordBonus: 0,
      },
    };
  }

  // Skor kelengkapan purpose: rata-rata tertimbang fill ratio per section
  let weightedSum = 0;
  let totalWeight = 0;
  for (const status of sectionStatuses) {
    weightedSum += status.fillRatio * status.weight;
    totalWeight += status.weight;
  }
  const purposeCompleteness = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 0;

  // Penalti section wajib kosong: -8 poin per section wajib yang kosong
  const missingRequired = sectionStatuses
    .filter((s) => s.required && !s.filled)
    .map((s) => s.label);
  const missingHighImpact = sectionStatuses
    .filter((s) => s.weight === 4 && !s.filled)
    .map((s) => s.label);

  const requiredPenalty = missingRequired.length * 8;

  const completenessScore = Math.max(0, purposeCompleteness - requiredPenalty);

  const totalScore = Math.max(
    0,
    Math.min(100, Math.round(base.totalScore * FORMAT_WEIGHT + completenessScore * PURPOSE_WEIGHT))
  );

  // Sinyal keyword AI: +2 per section yang di-apply AI dengan keywords (cap +5).
  // Skor baseline tidak berubah — sinyal hanya bisa menaikkan, tidak menurunkan.
  const appliedSections = aiKeywordSignals
    ? Object.values(aiKeywordSignals).filter((s) => s.keywords.length > 0).length
    : 0;
  const aiKeywordBonus = Math.min(AI_KEYWORD_BONUS_CAP, appliedSections * 2);
  const finalScore = Math.min(100, totalScore + aiKeywordBonus);

  // Turunkan state label berdasarkan skor final (termasuk bonus keyword AI)
  const state: PurposeAwareAtsResult['state'] =
    finalScore >= 85 ? 'excellent' : finalScore >= 70 ? 'good' : finalScore >= 55 ? 'fair' : finalScore >= 40 ? 'weak' : 'critical';

  const stateLabel =
    state === 'excellent' ? 'Sangat Baik' :
    state === 'good' ? 'Baik' :
    state === 'fair' ? 'Cukup' :
    state === 'weak' ? 'Lemah' : 'Kritis';

  // Issue tambahan untuk section wajib/high-impact yang kosong
  const purposeIssues: ATSIssue[] = [
    ...missingRequired.map((label, i) => ({
      id: `purpose-required-${i}`,
      category: 'completeness' as const,
      severity: 'critical' as const,
      message: `Section wajib "${label}" masih kosong untuk tujuan CV ini.`,
      recommendation: `Isi section "${label}" — wajib (bobot 5) untuk tujuan CV yang dipilih sebelum export.`,
      penalty: 8,
      potentialGain: 8,
    })),
    ...missingHighImpact.map((label, i) => ({
      id: `purpose-high-${i}`,
      category: 'completeness' as const,
      severity: 'major' as const,
      message: `Section "${label}" sangat disarankan untuk tujuan CV ini.`,
      recommendation: `Lengkapi section "${label}" untuk memperkuat CV sesuai tujuan yang dipilih.`,
      penalty: 3,
      potentialGain: 3,
    })),
  ];

  return {
    ...base,
    totalScore: finalScore,
    state,
    stateLabel,
    issues: [...base.issues, ...purposeIssues],
    purpose,
    purposeBreakdown: {
      formatScore: base.totalScore,
      completenessScore,
      totalScore: finalScore,
      sectionStatuses,
      missingRequired,
      missingHighImpact,
      aiKeywordBonus: appliedSections > 0 ? aiKeywordBonus : 0,
    },
  };
}

/**
 * Validasi export: section wajib (bobot 5) harus terisi sebelum tombol
 * Download/Export aktif. Kontak (S1) ikut divalidasi karena selalu wajib.
 */
export function validateExportReadiness(cv: CvSectionDataInput, purpose: CvPurpose): {
  canExport: boolean;
  missing: string[];
} {
  const requiredKeys = getRequiredSectionKeys(purpose);
  const allRequired: Array<CvSectionKey | 'contact'> = ['contact', ...requiredKeys];
  const missing = allRequired
    .filter((key) => !hasSectionData(key, cv))
    .map((key) => getSectionLabel(key));
  return { canExport: missing.length === 0, missing };
}
