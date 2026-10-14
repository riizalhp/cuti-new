/**
 * Utility untuk membersihkan karakter bullet point (•, ▪, -, *, –, dll.) dari teks CV.
 * Mencegah terjadinya "double bullet" saat di-render menggunakan <ul className="list-disc">
 * atau pada komponen form input yang sudah memiliki indikator bullet bawaan.
 */

// Karakter bullet lengkap dari Word (DOCX), PDF, Unicode symbols, Wingdings:
// \u2022 = •, \u25AA = ▪, \u25AB = ▫, \u25A0 = ■, \u25A1 = □, \u25CF = ●, \u25CB = ○, \u25E6 = ◦
// \u2043 = ⁃, \u2013 = –, \u2014 = —, \u2212 = −, \u2219 = ∙, \u00B7 = ·, \u2023 = ‣
// \uF0B7 = Word Wingdings Bullet, \uF0A7 = Word Square Bullet, \uF076 = Word Diamond Bullet
const BULLET_START_REGEX =
  /^[\s\u00A0\u200B-\u200D\uFEFF•▪▫■□●○◦⁃–—−∙‣▶►▸➢➤➔➜✓✔*+\-\uF0B7\uF0A7\uF076\uF0D8\uF0DE]+|^(\d+|[a-zA-Z])[\.\)]\s*/;

const HTML_BULLET_ENTITIES_REGEX =
  /^(&bull;|&#8226;|&middot;|&#183;|&#x2022;)\s*/gi;

/**
 * Membersihkan semua simbol bullet, list marker (1., a)), dash, dan spasi di awal 1 baris string.
 */
export function cleanBulletLine(line: string): string {
  if (!line || typeof line !== 'string') return '';
  let str = line.replace(HTML_BULLET_ENTITIES_REGEX, '').trim();

  // Bersihkan berulang jika ada double bullet bertumpuk dari Word/PDF (misal: "• ▪ " atau "- • ")
  let prev = '';
  while (str && str !== prev && BULLET_START_REGEX.test(str)) {
    prev = str;
    str = str.replace(BULLET_START_REGEX, '').trim();
  }

  return str.trim();
}

/**
 * Memecah teks multiline atau inline bullet menjadi array baris bersih tanpa simbol bullet.
 * Menangani:
 * - Pemisahan baris standar (\n, \r\n)
 * - Pemisahan bullet inline tanpa baris baru (kasus umum ekstraksi PDF: "• Tugas 1 • Tugas 2")
 */
export function parseCleanBulletLines(text?: string): string[] {
  if (!text || typeof text !== 'string' || !text.trim()) return [];

  // Jika teks tidak memiliki newline tapi memiliki inline bullet pemisah (misal hasil ekstraksi PDF)
  const rawSegments = text.includes('\n')
    ? text.split(/\r?\n/)
    : text.split(/(?<=\S)\s+[•▪▫■□●○◦⁃∙‣\uF0B7]\s+/);

  const cleanedLines: string[] = [];
  for (const seg of rawSegments) {
    const cleaned = cleanBulletLine(seg);
    if (cleaned) {
      cleanedLines.push(cleaned);
    }
  }

  return cleanedLines;
}

/**
 * Mengembalikan string multiline rapi dengan pemisah \n dan tanpa karakter bullet di awal baris.
 */
export function cleanBulletText(text?: string): string {
  return parseCleanBulletLines(text).join('\n');
}
