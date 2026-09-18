import { CvPurpose } from './cv-purpose-scoring-engine';

/**
 * Matrix Scoring Section CV Berdasarkan Tujuan Pembuatan CV
 * =========================================================
 * - Setiap section diberi bobot 0–5 untuk setiap profil tujuan.
 * - Bobot menentukan: urutan tampil, visibilitas (0 = disembunyikan),
 *   dan validasi wajib (5) sebelum export CV.
 * - Sumber aturan: "Aturan Scoring Section CV Berdasarkan Tujuan Pembuatan CV".
 *
 * Bobot 5 = wajib & paling menentukan | 4 = sangat disarankan | 3 = disarankan
 * 2 = opsional | 1 = minor/pelengkap | 0 = tidak relevan (disembunyikan)
 */

export type CvSectionKey =
  | 'summary'
  | 'experience'
  | 'internships'
  | 'projects'
  | 'organizations'
  | 'volunteers'
  | 'education'
  | 'certifications'
  | 'skills'
  | 'languages'
  | 'courses'
  | 'scholarships'
  | 'publications'
  | 'awards'
  | 'portfolioLinks'
  | 'otherRelevant'
  | 'references'
  | 'hobbies';

/** Bentuk longgar data CV (form data / CVData / hasil parse) yang diterima helper matrix. */
export type CvSectionDataInput = object | null | undefined;

export interface CvSectionDefinition {
  sCode: string;
  key: CvSectionKey | 'contact';
  label: string;
  /** Section kontak (S1) bukan bagian dari sectionOrder — selalu tampil paling atas. */
  isContact?: boolean;
}

/** 19 section final: 14 lama + 5 baru (S14 Publikasi, S15 Penghargaan, S16 Portofolio, S17 Relevan Lainnya, S19 Hobi). */
export const CV_SECTION_DEFINITIONS: CvSectionDefinition[] = [
  { sCode: 'S1', key: 'contact', label: 'Informasi & Kontak', isContact: true },
  { sCode: 'S2', key: 'summary', label: 'Ringkasan Profesional' },
  { sCode: 'S3', key: 'experience', label: 'Pengalaman Kerja' },
  { sCode: 'S4', key: 'internships', label: 'Pengalaman Magang' },
  { sCode: 'S5', key: 'projects', label: 'Proyek' },
  { sCode: 'S6', key: 'organizations', label: 'Pengalaman Organisasi' },
  { sCode: 'S7', key: 'volunteers', label: 'Volunteer & Pengabdian Masyarakat' },
  { sCode: 'S8', key: 'education', label: 'Pendidikan' },
  { sCode: 'S9', key: 'certifications', label: 'Sertifikat' },
  { sCode: 'S10', key: 'courses', label: 'Pelatihan & Kursus' },
  { sCode: 'S11', key: 'skills', label: 'Keahlian' },
  { sCode: 'S12', key: 'languages', label: 'Bahasa' },
  { sCode: 'S13', key: 'scholarships', label: 'Beasiswa' },
  { sCode: 'S14', key: 'publications', label: 'Publikasi Ilmiah' },
  { sCode: 'S15', key: 'awards', label: 'Penghargaan & Prestasi' },
  { sCode: 'S16', key: 'portfolioLinks', label: 'Portofolio & Tautan' },
  { sCode: 'S17', key: 'otherRelevant', label: 'Pengalaman Relevan Lainnya' },
  { sCode: 'S18', key: 'references', label: 'Referensi' },
  { sCode: 'S19', key: 'hobbies', label: 'Minat & Hobi' },
];

const SECTION_KEY_ORDER: CvSectionKey[] = CV_SECTION_DEFINITIONS
  .filter((s) => !s.isContact)
  .map((s) => s.key as CvSectionKey);

/**
 * Matrix bobot per profil. Urutan nilai mengikuti S2..S19 (S1 kontak selalu 5).
 * Sumber: tabel 4.1–4.15 pada dokumen aturan.
 * Catatan: S10 Career Break dinaikkan ke 5 agar konsisten dengan daftar
 * "Wajib: S1, S2, S10" pada aturan (bobot 5 = wajib).
 */
const PURPOSE_SECTION_WEIGHTS: Record<CvPurpose, Partial<Record<CvSectionKey, number>>> = {
  // 4.1 Lamar Kerja
  job: {
    summary: 5, experience: 5, internships: 2, projects: 3, organizations: 2, volunteers: 1,
    education: 4, certifications: 3, courses: 2, skills: 5, languages: 2, scholarships: 0,
    publications: 0, awards: 3, portfolioLinks: 2, otherRelevant: 2, references: 2, hobbies: 0,
  },
  // 4.2 Career Switch
  career_switch: {
    summary: 5, experience: 4, internships: 2, projects: 5, organizations: 3, volunteers: 2,
    education: 3, certifications: 3, courses: 3, skills: 5, languages: 2, scholarships: 0,
    publications: 0, awards: 2, portfolioLinks: 3, otherRelevant: 4, references: 1, hobbies: 0,
  },
  // 4.3 Promosi / Internal Career
  promotion: {
    summary: 5, experience: 5, internships: 0, projects: 3, organizations: 3, volunteers: 1,
    education: 2, certifications: 2, courses: 2, skills: 4, languages: 1, scholarships: 0,
    publications: 0, awards: 4, portfolioLinks: 1, otherRelevant: 2, references: 2, hobbies: 0,
  },
  // 4.4 Kerja di Luar Negeri
  overseas: {
    summary: 5, experience: 5, internships: 2, projects: 2, organizations: 2, volunteers: 2,
    education: 4, certifications: 3, courses: 2, skills: 4, languages: 5, scholarships: 0,
    publications: 0, awards: 2, portfolioLinks: 2, otherRelevant: 2, references: 3, hobbies: 0,
  },
  // 4.5 Magang / Internship
  internship: {
    summary: 3, experience: 1, internships: 2, projects: 5, organizations: 5, volunteers: 2,
    education: 5, certifications: 2, courses: 3, skills: 3, languages: 1, scholarships: 0,
    publications: 1, awards: 2, portfolioLinks: 2, otherRelevant: 2, references: 1, hobbies: 1,
  },
  // 4.6 Fresh Graduate
  fresh_graduate: {
    summary: 4, experience: 1, internships: 3, projects: 5, organizations: 3, volunteers: 2,
    education: 5, certifications: 4, courses: 3, skills: 4, languages: 1, scholarships: 0,
    publications: 0, awards: 2, portfolioLinks: 3, otherRelevant: 2, references: 1, hobbies: 0,
  },
  // 4.7 Freelance
  freelance: {
    summary: 4, experience: 2, internships: 0, projects: 5, organizations: 1, volunteers: 1,
    education: 1, certifications: 2, courses: 1, skills: 5, languages: 1, scholarships: 0,
    publications: 0, awards: 1, portfolioLinks: 5, otherRelevant: 2, references: 3, hobbies: 0,
  },
  // 4.8 Remote Job
  remote: {
    summary: 5, experience: 4, internships: 1, projects: 3, organizations: 1, volunteers: 1,
    education: 2, certifications: 2, courses: 2, skills: 4, languages: 3, scholarships: 0,
    publications: 0, awards: 2, portfolioLinks: 3, otherRelevant: 3, references: 1, hobbies: 0,
  },
  // 4.9 CV Umum / Master CV
  general: {
    summary: 3, experience: 3, internships: 3, projects: 3, organizations: 3, volunteers: 3,
    education: 3, certifications: 3, courses: 3, skills: 3, languages: 3, scholarships: 3,
    publications: 3, awards: 3, portfolioLinks: 3, otherRelevant: 3, references: 3, hobbies: 2,
  },
  // 4.10 Beasiswa / Akademik
  academic_scholarship: {
    summary: 4, experience: 1, internships: 1, projects: 3, organizations: 2, volunteers: 2,
    education: 5, certifications: 2, courses: 2, skills: 2, languages: 2, scholarships: 5,
    publications: 5, awards: 4, portfolioLinks: 1, otherRelevant: 2, references: 3, hobbies: 0,
  },
  // 4.11 Volunteer / NGO / Nirlaba
  volunteer_ngo: {
    summary: 4, experience: 2, internships: 1, projects: 2, organizations: 3, volunteers: 5,
    education: 2, certifications: 1, courses: 1, skills: 3, languages: 1, scholarships: 0,
    publications: 0, awards: 2, portfolioLinks: 1, otherRelevant: 3, references: 3, hobbies: 1,
  },
  // 4.12 Kepemerintahan (CPNS/BUMN)
  government: {
    summary: 3, experience: 4, internships: 2, projects: 1, organizations: 3, volunteers: 1,
    education: 5, certifications: 4, courses: 3, skills: 2, languages: 1, scholarships: 0,
    publications: 0, awards: 3, portfolioLinks: 0, otherRelevant: 2, references: 2, hobbies: 0,
  },
  // 4.13 Eksekutif & Kepemimpinan Senior
  executive: {
    summary: 5, experience: 5, internships: 0, projects: 2, organizations: 2, volunteers: 1,
    education: 2, certifications: 1, courses: 1, skills: 3, languages: 1, scholarships: 0,
    publications: 0, awards: 5, portfolioLinks: 1, otherRelevant: 2, references: 4, hobbies: 0,
  },
  // 4.14 Wirausaha / Startup Founder
  startup_founder: {
    summary: 5, experience: 2, internships: 0, projects: 5, organizations: 2, volunteers: 1,
    education: 1, certifications: 1, courses: 1, skills: 3, languages: 1, scholarships: 0,
    publications: 0, awards: 4, portfolioLinks: 5, otherRelevant: 2, references: 2, hobbies: 0,
  },
  // 4.15 Career Break / Kembali Bekerja
  career_break: {
    summary: 5, experience: 3, internships: 1, projects: 3, organizations: 2, volunteers: 3,
    education: 2, certifications: 3, courses: 5, skills: 3, languages: 1, scholarships: 0,
    publications: 0, awards: 1, portfolioLinks: 2, otherRelevant: 4, references: 2, hobbies: 0,
  },
};

/** Urutan default (nomor section) sebagai tie-breaker untuk bobot yang sama. */
const DEFAULT_KEY_INDEX: Record<string, number> = SECTION_KEY_ORDER.reduce(
  (acc, key, idx) => ({ ...acc, [key]: idx }),
  {} as Record<string, number>
);

export function getSectionWeight(purpose: CvPurpose, key: CvSectionKey): number {
  return PURPOSE_SECTION_WEIGHTS[purpose]?.[key] ?? 0;
}

/** Matrix bobot lengkap per section untuk satu profil. */
export function getSectionWeightMatrix(purpose: CvPurpose): Record<CvSectionKey, number> {
  const result = {} as Record<CvSectionKey, number>;
  for (const key of SECTION_KEY_ORDER) {
    result[key] = getSectionWeight(purpose, key);
  }
  return result;
}

/**
 * Urutan render section final:
 * - Ringkasan Profesional ('summary') adalah anchor utama elevator pitch yang selalu
 *   tampil di posisi teratas (tepat di bawah kontak) selama bobotnya > 0.
 * - Section lainnya diurutkan descending berdasarkan bobot tujuan CV.
 * - Bobot sama → ikuti urutan default (nomor section).
 * - Section bobot 0 disembunyikan (tidak masuk hasil).
 */
export function getSectionOrderForPurpose(purpose: CvPurpose): CvSectionKey[] {
  const hasSummary = getSectionWeight(purpose, 'summary') > 0;
  const otherOrdered = SECTION_KEY_ORDER
    .filter((key) => key !== 'summary')
    .map((key) => ({ key, weight: getSectionWeight(purpose, key) }))
    .filter((entry) => entry.weight > 0)
    .sort((a, b) => (b.weight - a.weight) || (DEFAULT_KEY_INDEX[a.key] - DEFAULT_KEY_INDEX[b.key]))
    .map((entry) => entry.key);

  return hasSummary ? ['summary', ...otherOrdered] : otherOrdered;
}

/** Section berbobot 0 → disembunyikan otomatis dari builder untuk profil ini. */
export function getHiddenSectionKeys(purpose: CvPurpose): CvSectionKey[] {
  return SECTION_KEY_ORDER.filter((key) => getSectionWeight(purpose, key) === 0);
}

/** Section berbobot 5 → wajib divalidasi ada isi sebelum export (di luar kontak S1). */
export function getRequiredSectionKeys(purpose: CvPurpose): CvSectionKey[] {
  return SECTION_KEY_ORDER.filter((key) => getSectionWeight(purpose, key) === 5);
}

export function getSectionLabel(key: CvSectionKey | 'contact'): string {
  return CV_SECTION_DEFINITIONS.find((s) => s.key === key)?.label || key;
}

export function getSectionSCode(key: CvSectionKey | 'contact'): string {
  return CV_SECTION_DEFINITIONS.find((s) => s.key === key)?.sCode || '';
}

/** Mode hybrid (user pilih 2 profil): bobot maksimum antar profil per section. */
export function mergeSectionOrders(purposes: CvPurpose[]): CvSectionKey[] {
  const merged = {} as Record<CvSectionKey, number>;
  for (const key of SECTION_KEY_ORDER) {
    merged[key] = Math.max(0, ...purposes.map((p) => getSectionWeight(p, key)));
  }
  const hasSummary = (merged['summary'] ?? 0) > 0;
  const otherOrdered = SECTION_KEY_ORDER
    .filter((key) => key !== 'summary')
    .map((key) => ({ key, weight: merged[key] }))
    .filter((entry) => entry.weight > 0)
    .sort((a, b) => (b.weight - a.weight) || (DEFAULT_KEY_INDEX[a.key] - DEFAULT_KEY_INDEX[b.key]))
    .map((entry) => entry.key);

  return hasSummary ? ['summary', ...otherOrdered] : otherOrdered;
}

/**
 * Cek apakah sebuah section punya isi (untuk validasi wajib & skor kelengkapan).
 * Menerima data CV bentuk apa pun (form data / CVData).
 */
export function hasSectionData(key: CvSectionKey | 'contact', data: CvSectionDataInput): boolean {
  const d = (data || {}) as Record<string, unknown>;
  switch (key) {
    case 'contact':
      return Boolean(
        (d.fullName && String(d.fullName).trim()) &&
        ((d.email && String(d.email).trim()) || (d.phone && String(d.phone).trim()))
      );
    case 'summary':
      return Boolean(String(d.summary || '').trim().length >= 40);
    case 'skills':
      return (Array.isArray(d.skills) ? d.skills : []).filter(Boolean).length > 0 ||
        (Array.isArray(d.skillsList) ? d.skillsList : []).filter(Boolean).length > 0;
    case 'hobbies':
      return (Array.isArray(d.hobbies) ? d.hobbies : []).filter((h) => String(h || '').trim()).length > 0;
    case 'portfolioLinks':
      return (Array.isArray(d.portfolioLinks) ? d.portfolioLinks : []).some((l) => String((l as { url?: string })?.url || '').trim()) ||
        Boolean(String(d.website || '').trim());
    default: {
      const arr = d[key];
      if (!Array.isArray(arr)) return false;
      return arr.some((item) => {
        if (!item || typeof item !== 'object') return Boolean(String(item || '').trim());
        return Object.values(item as Record<string, unknown>).some((v) => typeof v === 'string' && v.trim());
      });
    }
  }
}

/** Rasio terisi 0–1 untuk satu section (parsial dihitung proporsional). */
export function getSectionFillRatio(key: CvSectionKey | 'contact', data: CvSectionDataInput): number {
  const d = (data || {}) as Record<string, unknown>;
  switch (key) {
    case 'contact': {
      let filled = 0;
      if (String(d.fullName || '').trim()) filled++;
      if (String(d.email || '').trim()) filled++;
      if (String(d.phone || '').trim()) filled++;
      return filled / 3;
    }
    case 'summary': {
      const len = String(d.summary || '').trim().length;
      if (len === 0) return 0;
      if (len < 40) return 0.5;
      return 1;
    }
    case 'skills': {
      const count = (Array.isArray(d.skills) ? d.skills : []).filter(Boolean).length +
        (Array.isArray(d.skillsList) ? d.skillsList : []).filter(Boolean).length;
      if (count === 0) return 0;
      if (count < 4) return 0.5;
      return 1;
    }
    case 'hobbies': {
      const count = (Array.isArray(d.hobbies) ? d.hobbies : []).filter((h) => String(h || '').trim()).length;
      return count >= 3 ? 1 : count > 0 ? 0.5 : 0;
    }
    case 'portfolioLinks': {
      const links = (Array.isArray(d.portfolioLinks) ? d.portfolioLinks : []).filter((l) => String((l as { url?: string })?.url || '').trim());
      const total = links.length + (String(d.website || '').trim() ? 1 : 0);
      return total >= 2 ? 1 : total === 1 ? 0.5 : 0;
    }
    default: {
      const arr = d[key];
      if (!Array.isArray(arr)) return 0;
      const filledItems = arr.filter((item) => {
        if (!item || typeof item !== 'object') return Boolean(String(item || '').trim());
        return Object.values(item as Record<string, unknown>).some((v) => typeof v === 'string' && v.trim());
      });
      if (filledItems.length === 0) return 0;
      return filledItems.length >= 2 ? 1 : 0.5;
    }
  }
}
