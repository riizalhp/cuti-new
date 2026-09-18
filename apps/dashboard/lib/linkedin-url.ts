/**
 * Normalizes user-inputted LinkedIn profile URL.
 * Menerima format:
 * - linkedin.com/in/username
 * - www.linkedin.com/in/username
 * - id.linkedin.com/in/username
 * - in/username
 * - username
 * - https://www.linkedin.com/in/username
 * 
 * Menghasilkan URL lengkap dengan protokol https://
 */
export function normalizeLinkedInUrl(input: string): string {
  let trimmed = (input || '').trim();
  if (!trimmed) return '';

  // Bersihkan karakter @ atau slash di awal
  trimmed = trimmed.replace(/^[@/]+/, '');

  // Jika sudah memiliki protokol http:// atau https://
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // Jika diawali (subdomain.)linkedin.com
  if (/^(?:[a-zA-Z0-9_-]+\.)?linkedin\.com/i.test(trimmed)) {
    return 'https://' + trimmed;
  }

  // Jika diawali in/username
  if (/^in\/[a-zA-Z0-9_%-]+/i.test(trimmed)) {
    return 'https://www.linkedin.com/' + trimmed;
  }

  // Jika hanya memasukkan username/slug (misal: "riizalhp")
  if (/^[a-zA-Z0-9_%-]+$/i.test(trimmed)) {
    return 'https://www.linkedin.com/in/' + trimmed;
  }

  return 'https://' + trimmed;
}

/**
 * Validasi apakah input mengarah ke profil LinkedIn yang valid
 */
export function isValidLinkedInProfileInput(input: string): boolean {
  if (!input || !input.trim()) return false;
  const normalized = normalizeLinkedInUrl(input);
  return /linkedin\.com\/in\/[a-zA-Z0-9_%-]+/i.test(normalized);
}
