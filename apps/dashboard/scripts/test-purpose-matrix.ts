/* Uji cepat logika matrix & scorer (dijalankan dengan npx tsx) */
import {
  getSectionOrderForPurpose,
  getHiddenSectionKeys,
  getRequiredSectionKeys,
  hasSectionData,
} from '../lib/cv-section-scoring-matrix';
import { calculatePurposeAwareAtsScore, validateExportReadiness } from '../lib/cv-purpose-ats-score';

let failed = 0;
function expect(cond: boolean, msg: string) {
  if (!cond) {
    failed++;
    console.error('FAIL:', msg);
  } else {
    console.log('ok  :', msg);
  }
}

// 1. Urutan freelance: summary teratas (index 0), disusul section bobot 5 (S11 skills, S5 projects, S16 portfolioLinks)
const freelanceOrder = getSectionOrderForPurpose('freelance');
expect(
  freelanceOrder[0] === 'summary',
  `freelance: summary harus selalu di posisi teratas (index 0) → ${freelanceOrder[0]}`
);
const next3 = freelanceOrder.slice(1, 4);
expect(
  next3.includes('skills') && next3.includes('projects') && next3.includes('portfolioLinks'),
  `freelance: 3 section berikutnya = wajib S11/S5/S16 → ${JSON.stringify(next3)}`
);

// 1b. Semua profil dengan bobot summary > 0 harus menempatkan summary di index 0
const allPurposes = [
  'job', 'internship', 'fresh_graduate', 'freelance', 'remote',
  'career_switch', 'promotion', 'academic_scholarship', 'overseas',
  'general', 'volunteer_ngo', 'government', 'executive',
  'startup_founder', 'career_break',
] as const;
for (const p of allPurposes) {
  const ord = getSectionOrderForPurpose(p);
  expect(ord[0] === 'summary', `${p}: Ringkasan Profesional selalu pakem teratas (index 0) → ${ord[0]}`);
}

// 2. Section bobot 0 freelance disembunyikan (S4 internships, S13 scholarships, S14 publications, S19 hobbies)
const freelanceHidden = getHiddenSectionKeys('freelance');
expect(
  ['internships', 'scholarships', 'publications', 'hobbies'].every((k) => freelanceHidden.includes(k as any)),
  `freelance: S4/S13/S14/S19 disembunyikan → ${JSON.stringify(freelanceHidden)}`
);

// 3. Wajib internship = S5 projects, S6 organizations, S8 education (+ S1 kontak)
const internshipRequired = getRequiredSectionKeys('internship');
expect(
  internshipRequired.length === 3 && internshipRequired.includes('projects') && internshipRequired.includes('organizations') && internshipRequired.includes('education'),
  `internship: wajib = S5/S6/S8 → ${JSON.stringify(internshipRequired)}`
);

// 4. Career break: S10 courses wajib (bobot 5)
expect(getRequiredSectionKeys('career_break').includes('courses'), 'career_break: S10 courses wajib');

// 5. Validasi export: kontak + wajib kosong → tidak boleh export
const emptyCheck = validateExportReadiness({ purpose: 'internship' }, 'internship');
expect(!emptyCheck.canExport, `internship kosong → export diblok, missing=${JSON.stringify(emptyCheck.missing)}`);

// 6. Validasi export: semua wajib terisi → boleh export
const filledCv = {
  fullName: 'Budi',
  email: 'budi@contoh.com',
  projects: [{ id: 'p1', name: 'A', description: 'x' }],
  organizations: [{ id: 'o1', role: 'Staf', name: 'BEM', description: 'y' }],
  education: [{ id: 'e1', institution: 'UI', degree: 'S1', year: '2023' }],
};
expect(validateExportReadiness(filledCv, 'internship').canExport, 'internship lengkap → export diizinkan');

// 7. hasSectionData bekerja per section
expect(hasSectionData('contact', { fullName: 'Budi', email: 'a@b.c' }), 'hasSectionData kontak terisi');
expect(!hasSectionData('summary', { summary: 'pendek' }), 'hasSectionData summary <40 char = belum lengkap');
expect(hasSectionData('hobbies', { hobbies: ['Membaca', 'Fotografi'] }), 'hasSectionData hobbies');

// 8. Scorer purpose-aware: CV kosong freelance harus lebih rendah daripada CV terisi
const emptyFreelance = calculatePurposeAwareAtsScore({ fullName: 'X', email: 'x@y.z' }, 'freelance');
const filledFreelance = calculatePurposeAwareAtsScore(
  {
    fullName: 'X',
    email: 'x@y.z',
    skills: ['Figma', 'Illustrator', 'Photoshop', 'Branding', 'UI Design'],
    projects: [{ id: 'p1', name: 'Landing Page', description: 'Meningkatkan konversi 18%' }],
    portfolioLinks: [{ id: 'l1', label: 'Behance', url: 'https://behance.net/x' }],
    summary: 'Desainer freelance dengan 5 tahun pengalaman kerja sama dengan 20+ klien.',
  },
  'freelance'
);
expect(
  filledFreelance.totalScore > emptyFreelance.totalScore,
  `scorer: freelance terisi (${filledFreelance.totalScore}) > kosong (${emptyFreelance.totalScore})`
);

// 9. Skor berubah saat tujuan diganti (data sama, tujuan beda)
const asScholarship = calculatePurposeAwareAtsScore(filledFreelance as unknown as Record<string, unknown>, 'academic_scholarship');
expect(
  asScholarship.totalScore !== filledFreelance.totalScore,
  `scorer: skor berubah saat tujuan diganti (freelance=${filledFreelance.totalScore}, akademik=${asScholarship.totalScore})`
);

// 10. Issue purpose muncul untuk section wajib kosong
const withIssues = calculatePurposeAwareAtsScore({ purpose: 'volunteer_ngo' }, 'volunteer_ngo');
expect(
  withIssues.issues.some((i) => i.message.includes('Volunteer')),
  `scorer: issue section wajib volunteer kosong muncul`
);

console.log(failed === 0 ? '\nSEMUA TES LULUS ✅' : `\n${failed} TES GAGAL ❌`);
process.exit(failed === 0 ? 0 : 1);
