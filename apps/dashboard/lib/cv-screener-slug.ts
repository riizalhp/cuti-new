import { slugify, deslugify } from './slug';

/**
 * Helper utilities untuk membuat dan membaca semantic URL laporan evaluasi CV ATS.
 * Format: /cv-screener/report/[role]/[name]
 * Contoh: /cv-screener/report/frontend-developer/budi-santoso
 * Contoh dengan short token: /cv-screener/report/frontend-developer/budi-santoso-au6o
 */

export function extractCandidateSlug(candidateName?: string | null): string {
  if (!candidateName) return 'kandidat';
  const clean = candidateName
    .replace(/\.(pdf|docx|doc)$/i, '')
    .replace(/^cv[-_\s]+/i, '')
    .replace(/[-_\s]+cv$/i, '')
    .trim();
  const res = slugify(clean);
  return res || 'kandidat';
}

export function extractShortToken(idOrToken?: string | null): string | undefined {
  if (!idOrToken) return undefined;
  const str = idOrToken.trim().toLowerCase();

  // Jika format lama 'hist-1791620019024', konversi epoch millisecond ke base36 4-karakter
  if (str.startsWith('hist-')) {
    const rawNum = parseInt(str.replace('hist-', ''), 10);
    if (!isNaN(rawNum)) {
      return rawNum.toString(36).slice(-4);
    }
    return str.slice(-4);
  }

  // Jika format 'scr_xxxx' atau 'scr-xxxx'
  if (str.startsWith('scr_') || str.startsWith('scr-')) {
    return str.replace(/^scr[-_]/, '').slice(-6);
  }

  // Jika mengandung token alfanumerik yang memiliki minimal 1 angka (e.g. au6o, 8a3f)
  const match = str.match(/((?=.*\d)[a-z0-9]{4,8})$/i);
  if (match) {
    return match[1].toLowerCase();
  }

  return undefined;
}

export function buildCvScreenerSlug(
  targetRole?: string | null,
  candidateName?: string | null,
  _idOrToken?: string | null
): {
  roleSlug: string;
  nameSlug: string;
  fullSlug: string;
  reportPath: string;
} {
  const roleSlug = slugify(targetRole || 'professional') || 'professional';
  const nameSlug = extractCandidateSlug(candidateName);
  const fullSlug = `${roleSlug}/${nameSlug}`;
  const reportPath = `/cv-screener/report/${fullSlug}`;

  return {
    roleSlug,
    nameSlug,
    fullSlug,
    reportPath,
  };
}

export function parseCvScreenerSlug(nameParam: string): {
  cleanName: string;
  shortId?: string;
} {
  if (!nameParam) return { cleanName: '' };
  const trimmed = nameParam.trim().toLowerCase();

  // Deteksi short hash 4-8 karakter berangka di akhir (misal: budi-santoso-au6o)
  const match = trimmed.match(/^(.*?)-((?=.*\d)[a-z0-9]{4,8})$/i);
  if (match && match[1] && match[2]) {
    return {
      cleanName: match[1],
      shortId: match[2].toLowerCase(),
    };
  }

  return { cleanName: trimmed };
}

export { slugify, deslugify };
