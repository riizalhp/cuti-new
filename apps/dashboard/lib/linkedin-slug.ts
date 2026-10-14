/**
 * Helper utilities for generating and parsing clean semantic LinkedIn audit URLs.
 * Format: /linkedin/audit/[role]/[nama]
 * Example: /linkedin/audit/frontend-developer/riizalhp
 */

export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function extractLinkedInUsername(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  // Cek apakah format linkedin.com/in/<username>
  const inMatch = trimmed.match(/(?:linkedin\.com\/in\/|in\/)([^/?#\s]+)/i);
  if (inMatch && inMatch[1]) {
    return slugify(inMatch[1]);
  }
  // Jika URL penuh lain
  if (/^https?:\/\//i.test(trimmed)) {
    const segments = trimmed.replace(/^https?:\/\//i, '').split(/[/?#]/).filter(Boolean);
    const last = segments[segments.length - 1];
    if (last && last !== 'linkedin.com') return slugify(last);
  }
  // Jika nama biasa atau handle biasa
  return slugify(trimmed);
}

export function buildLinkedInAuditSlug(
  targetRole?: string | null,
  profileUrlOrName?: string | null,
  shortId?: string | null
): {
  roleSlug: string;
  nameSlug: string;
  fullSlug: string;
  auditPath: string;
} {
  const roleSlug = slugify(targetRole || 'professional') || 'professional';
  let baseName = extractLinkedInUsername(profileUrlOrName || 'kandidat') || 'kandidat';
  
  let nameSlug = baseName;
  if (shortId && /^[0-9a-f]{6,8}$/i.test(shortId)) {
    nameSlug = `${baseName}-${shortId.toLowerCase()}`;
  }

  const fullSlug = `${roleSlug}/${nameSlug}`;
  const auditPath = `/linkedin/audit/${fullSlug}`;

  return {
    roleSlug,
    nameSlug,
    fullSlug,
    auditPath,
  };
}

export function parseLinkedInAuditName(nameParam: string): {
  cleanName: string;
  shortId?: string;
} {
  if (!nameParam) return { cleanName: '' };
  const trimmed = nameParam.trim().toLowerCase();
  
  // Deteksi short hash 6-8 karakter di akhir (misal: riizalhp-f8e995d2)
  const match = trimmed.match(/^(.*?)-([0-9a-f]{6,8})$/i);
  if (match && match[1] && match[2]) {
    return {
      cleanName: match[1],
      shortId: match[2].toLowerCase(),
    };
  }
  
  return { cleanName: trimmed };
}
