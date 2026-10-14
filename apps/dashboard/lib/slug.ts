/**
 * Utility helper untuk membuat dan membaca slug URL CV yang rapi,
 * manusiawi, dan bebas dari UUID acak.
 */

export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Hapus karakter non-alfanumerik kecuali spasi dan strip
    .replace(/[\s_-]+/g, '-') // Satukan spasi atau garis bawah menjadi tanda hubung tunggal
    .replace(/^-+|-+$/g, ''); // Hapus tanda hubung di awal dan akhir
}

export function deslugify(slug: string): string {
  if (!slug) return '';
  const acronyms: Record<string, string> = {
    cv: 'CV',
    ats: 'ATS',
    hrd: 'HRD',
    ui: 'UI',
    ux: 'UX',
    it: 'IT',
    ai: 'AI',
    pm: 'PM',
    qa: 'QA',
    ceo: 'CEO',
    cto: 'CTO',
  };

  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => {
      const lower = word.toLowerCase();
      if (acronyms[lower]) return acronyms[lower];
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

export function isUUID(str: string): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

export function formatIndonesianDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24 && now.getDate() === date.getDate()) {
    return 'Hari ini';
  } else if (diffHours < 48 && now.getDate() - date.getDate() === 1) {
    return 'Kemarin';
  }

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}
