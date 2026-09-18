/**
 * Centralized Score Color Utility (Traffic Light Standard)
 * =======================================================
 * Standarisasi warna scoring di seluruh aplikasi Employr:
 * - Hijau (Emerald): Skor Bagus (>= 75%)
 * - Kuning (Amber): Skor Sedang / Medium (60% - 74%)
 * - Merah (Rose): Skor Kecil / Rendah (< 60%)
 * - Abu-abu (Slate): Skor Kosong / 0 / Template Default
 */

export type ScoreTier = 'good' | 'medium' | 'low' | 'empty';

export interface ScoreColorTokens {
  tier: ScoreTier;
  text: string;
  bgBox: string;
  border: string;
  bar: string;
  badge: string;
  iconWrapper: string;
  statusLabel: string;
}

/**
 * Tentukan tier skor berdasarkan persentase 0-100
 */
export function getScoreTier(
  score: number | null | undefined,
  isEmpty = false
): ScoreTier {
  if (isEmpty || score === null || score === undefined || score <= 0) {
    return 'empty';
  }
  if (score >= 75) {
    return 'good';
  }
  if (score >= 60) {
    return 'medium';
  }
  return 'low';
}

/**
 * Dapatkan set token warna lengkap sesuai hierarki UI Employr
 */
export function getScoreColorTokens(
  score: number | null | undefined,
  isEmpty = false
): ScoreColorTokens {
  const tier = getScoreTier(score, isEmpty);

  switch (tier) {
    case 'good':
      return {
        tier: 'good',
        text: 'text-emerald-600 dark:text-emerald-400',
        bgBox: 'bg-emerald-50/70 dark:bg-emerald-950/30',
        border: 'border-emerald-100 dark:border-emerald-900/40',
        bar: 'bg-emerald-500',
        badge:
          'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        iconWrapper:
          'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50',
        statusLabel: 'Bagus & Siap Screening',
      };

    case 'medium':
      return {
        tier: 'medium',
        text: 'text-amber-600 dark:text-amber-400',
        bgBox: 'bg-amber-50/70 dark:bg-amber-950/30',
        border: 'border-amber-100 dark:border-amber-900/40',
        bar: 'bg-amber-500',
        badge:
          'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        iconWrapper:
          'bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50',
        statusLabel: 'Cukup (Perlu Sedikit Optimasi)',
      };

    case 'low':
      return {
        tier: 'low',
        text: 'text-rose-600 dark:text-rose-400',
        bgBox: 'bg-rose-50/70 dark:bg-rose-950/30',
        border: 'border-rose-100 dark:border-rose-900/40',
        bar: 'bg-rose-500',
        badge:
          'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        iconWrapper:
          'bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/50',
        statusLabel: 'Rendah (Perlu Perbaikan)',
      };

    case 'empty':
    default:
      return {
        tier: 'empty',
        text: 'text-slate-400 dark:text-slate-500',
        bgBox: 'bg-slate-50/80 dark:bg-slate-800/40',
        border: 'border-slate-200 dark:border-slate-700',
        bar: 'bg-slate-300 dark:bg-slate-700',
        badge:
          'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
        iconWrapper:
          'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700',
        statusLabel: 'Belum Ada Data',
      };
  }
}

/**
 * Shorthand untuk warna teks persentase skor
 */
export function getScoreTextClass(
  score: number | null | undefined,
  isEmpty = false
): string {
  return getScoreColorTokens(score, isEmpty).text;
}

/**
 * Shorthand untuk progress bar fill
 */
export function getScoreProgressBarClass(
  score: number | null | undefined,
  isEmpty = false
): string {
  return getScoreColorTokens(score, isEmpty).bar;
}

/**
 * Shorthand untuk class badge lengkap
 */
export function getScoreBadgeClass(
  score: number | null | undefined,
  isEmpty = false
): string {
  return getScoreColorTokens(score, isEmpty).badge;
}
