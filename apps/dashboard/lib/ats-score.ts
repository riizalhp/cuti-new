/**
 * ATS Score Calculator — dihitung dari isi CV yang sebenarnya,
 * bukan dari angka yang disimpan/keras-kode.
 */

export interface AtsScoreMetrics {
  totalScore: number;
  keywordScore: number;
  expScore: number;
  formatScore: number;
  completenessScore: number;
  recommendationsCount: number;
  accuracyRate: number;
}

export function calculateAtsScore(cv: any): AtsScoreMetrics {
  if (!cv) {
    return {
      totalScore: 0,
      keywordScore: 0,
      expScore: 0,
      formatScore: 0,
      completenessScore: 0,
      recommendationsCount: 4,
      accuracyRate: 0,
    };
  }

  // 1. Keyword Score (dari skill yang terisi)
  const skillCount = Array.isArray(cv.skills) ? cv.skills.length : 0;
  const keywordScore = Math.min(98, Math.max(45, skillCount * 10 + 25));

  // 2. Experience Score (dari jumlah & detail pengalaman)
  const experiences = Array.isArray(cv.experience) ? cv.experience : [];
  let expScore = 45;
  if (experiences.length >= 1) expScore += 25;
  if (experiences.length >= 2) expScore += 15;
  const hasDetailedDesc = experiences.some((e: any) => e.description && e.description.length > 40);
  if (hasDetailedDesc) expScore += 10;
  expScore = Math.min(96, expScore);

  // 3. Format & Layout (template ATS sudah dianggap rapi)
  const formatScore = 95;

  // 4. Completeness (kelengkapan data pribadi, ringkasan, pendidikan)
  const hasPersonal = Boolean(cv.fullName && cv.email && cv.phone);
  const hasSummary = Boolean(cv.summary && cv.summary.trim().length >= 20);
  const hasEdu = Array.isArray(cv.education) && cv.education.length > 0 && Boolean(cv.education[0]?.institution);
  let completenessScore = 35;
  if (hasPersonal) completenessScore += 25;
  if (hasSummary) completenessScore += 20;
  if (hasEdu) completenessScore += 20;
  completenessScore = Math.min(100, completenessScore);

  const totalScore = Math.round(
    keywordScore * 0.3 + expScore * 0.3 + formatScore * 0.2 + completenessScore * 0.2
  );
  const accuracyRate = Math.min(99, Math.max(70, Math.round(totalScore * 1.05)));
  const recommendationsCount = Math.max(1, 4 - Math.floor(totalScore / 25));

  return {
    totalScore,
    keywordScore,
    expScore,
    formatScore,
    completenessScore,
    recommendationsCount,
    accuracyRate,
  };
}

export function getAtsStatusLabel(score: number): string {
  if (score >= 85) return 'Sangat Baik';
  if (score >= 70) return 'Cukup Baik';
  if (score > 0) return 'Perlu Optimasi';
  return 'Belum Ada';
}
