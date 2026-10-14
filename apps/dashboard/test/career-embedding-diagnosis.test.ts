// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { computeSemanticCareerDiagnosis } from '@/lib/career-embedding-diagnosis';
import { computeCareerDiagnosis } from '@/lib/career-direction-engine';

describe('Semantic Career Diagnosis with Embeddings', () => {
  it('berhasil menghasilkan diagnosis semantik untuk target peran spesifik', async () => {
    const result = await computeSemanticCareerDiagnosis({
      aimingChoice: 'know_role',
      targetRoleInput: 'Frontend Developer',
      userSkills: ['HTML & CSS', 'JavaScript', 'React', 'Tailwind CSS'],
      educationLevel: 'S1',
      major: 'Teknik Informatika',
      hasExperience: true,
      experienceTitle: 'Junior Web Developer',
      experienceCompany: 'Tech Studio',
      summary: 'Mengembangkan antarmuka web interaktif menggunakan React dan Tailwind.',
    });

    expect(result).toBeDefined();
    expect(result.primaryRole).toBe('Frontend Developer');
    expect(result.primaryFitScore).toBeGreaterThanOrEqual(65);
    expect(result.isSemantic).toBe(true);
    expect(result.suggestedPaths.length).toBeGreaterThan(0);
    expect(result.topStrength).toBeDefined();
    expect(result.topGap).toBeDefined();

    const primary = result.suggestedPaths.find((p) => p.isPrimaryTarget);
    expect(primary).toBeDefined();
    expect(primary?.isSemantic).toBe(true);
    expect(primary?.semanticSimilarity).toBeGreaterThan(50);
  }, 30000);

  it('berhasil memetakan jalur eksplorasi berbasis kemiripan vektor semantik', async () => {
    const result = await computeSemanticCareerDiagnosis({
      aimingChoice: 'exploring',
      userSkills: ['Figma', 'Wireframing', 'Prototyping', 'Desain Visual'],
      educationLevel: 'SMK',
      major: 'Desain Komunikasi Visual',
      hasExperience: false,
      summary: 'Lulusan DKV yang antusias merancang antarmuka aplikasi digital.',
    });

    expect(result).toBeDefined();
    expect(result.isSemantic).toBe(true);
    expect(result.suggestedPaths.length).toBeGreaterThan(0);
    // UI/UX Designer or Graphic Designer should be among top suggested paths
    const roleTitles = result.suggestedPaths.map((p) => p.role);
    expect(roleTitles.some((r) => r.includes('Designer'))).toBe(true);
  }, 30000);

  it('mampu memetakan posisi baru/kustom ke blueprint terdekat secara semantik', async () => {
    const result = await computeSemanticCareerDiagnosis({
      aimingChoice: 'know_role',
      targetRoleInput: 'Spesialis Antarmuka Web',
      userSkills: ['HTML & CSS', 'JavaScript', 'Figma'],
      educationLevel: 'D3',
      major: 'Manajemen Informatika',
      hasExperience: true,
    });

    expect(result).toBeDefined();
    expect(result.isSemantic).toBe(true);
    expect(result.suggestedPaths.length).toBeGreaterThan(0);
    expect(result.realisticTransition.role).toBeDefined();
  }, 30000);

  it('mampu menangani switch career profil pelatih olahraga ke customer service dengan posisi terkuat yang tepat', async () => {
    const result = await computeSemanticCareerDiagnosis({
      aimingChoice: 'know_role',
      targetRoleInput: 'Customer Service',
      userSkills: [
        'Periodisasi latihan',
        'kondisi fisik',
        'teknik lari',
        'tes kebugaran',
        'monitoring beban',
        'analisis video',
        'Microsoft Excel',
        'Google Sheets',
        'Kepemimpinan',
        'komunikasi dengan atlet dan orang tua',
        'motivasi',
        'manajemen tim',
      ],
      educationLevel: 'S1',
      major: 'Pendidikan Kepelatihan Olahraga',
      hasExperience: true,
      experienceTitle: 'Pelatih Kepala Atletik PASI DIY',
      experienceCompany: 'PASI DIY',
      summary: 'Pelatih atletik berpengalaman menyusun program latihan dan komunikasi intensif dengan atlet serta orang tua.',
    });

    expect(result).toBeDefined();
    expect(result.primaryRole).toBe('Customer Service');
    expect(result.isCareerSwitch).toBe(true);
    expect(result.primaryFitScore).toBeGreaterThanOrEqual(40);

    // Suggested paths must include Pelatih Olahraga & Kebugaran as the strongest background role
    const coachPath = result.suggestedPaths.find((p) => p.role.includes('Pelatih'));
    expect(coachPath).toBeDefined();
    expect(coachPath?.fitScore).toBeGreaterThanOrEqual(75);
    expect(coachPath?.tagline).toBe('Posisi terkuat dari latar belakangmu');
  }, 30000);

  it('menghasilkan diferensiasi nyata untuk opsi exploring dengan opsi spektrum lintas bidang', async () => {
    const result = await computeSemanticCareerDiagnosis({
      aimingChoice: 'exploring',
      userSkills: ['Copywriting', 'Canva', 'Social Media Management', 'Microsoft Excel', 'Komunikasi Publik'],
      educationLevel: 'S1',
      major: 'Ilmu Komunikasi',
      hasExperience: false,
    });

    expect(result).toBeDefined();
    expect(result.aimingChoice).toBe('exploring');
    expect(result.suggestedPaths.length).toBeGreaterThan(1);
    expect(result.suggestedPaths[0].tagline).toContain('Rekomendasi');

    // Cek bahwa alternatif eksplorasi mengandung tagline eksplorasi bidang
    const alternatives = result.suggestedPaths.slice(1);
    expect(alternatives.some((p) => p.tagline.includes('eksplorasi bidang') || p.tagline.includes('Alternatif'))).toBe(true);
  }, 30000);

  it('memprioritaskan peran siap lamar dengan gap skill minimal pada opsi open_opportunities', async () => {
    const result = await computeSemanticCareerDiagnosis({
      aimingChoice: 'open_opportunities',
      userSkills: ['Pelayanan Pelanggan', 'Komunikasi', 'Problem Solving', 'Microsoft Office', 'Ketelitian'],
      educationLevel: 'SMA',
      hasExperience: true,
      experienceTitle: 'Customer Service Representative',
    });

    expect(result).toBeDefined();
    expect(result.aimingChoice).toBe('open_opportunities');
    expect(result.suggestedPaths.length).toBeGreaterThan(0);
    expect(result.suggestedPaths[0].tagline).toContain('Peluang lolos screening tercepat');

    // Posisi teratas harus memiliki gap minimal
    const topPath = result.suggestedPaths[0];
    expect(topPath.gapSkills.length).toBeLessThanOrEqual(2);
  }, 30000);

  it('memberikan skor motivatif (>= 70%) untuk input onboarding cepat (<= 4 skill) dengan adaptive denominator', async () => {
    // Simulasi user onboarding yang mengisi cepat dengan 2-3 keahlian utama saja
    const result = await computeSemanticCareerDiagnosis({
      aimingChoice: 'exploring',
      userSkills: ['Figma', 'UI Design', 'Wireframing'],
      educationLevel: 'SMK',
      major: 'Multimedia',
      hasExperience: false,
      summary: 'Lulusan SMK yang fokus belajar desain UI.',
    });

    expect(result).toBeDefined();
    expect(result.suggestedPaths.length).toBeGreaterThan(0);

    // Rekomendasi terkuat harus mencapai tier hijau/sangat cocok (>= 70%) berkat adaptive denominator
    const topPath = result.suggestedPaths[0];
    expect(topPath.fitScore).toBeGreaterThanOrEqual(70);
    expect(topPath.role).toMatch(/Design/i);
  }, 30000);

  it('memastikan offline computeCareerDiagnosis juga memberikan skor motivatif (>= 70%) untuk input onboarding cepat', () => {
    const offlineResult = computeCareerDiagnosis({
      aimingChoice: 'exploring',
      userSkills: ['Figma', 'UI Design', 'Wireframing'],
      educationLevel: 'SMK',
      major: 'Multimedia',
      hasExperience: false,
    });

    expect(offlineResult).toBeDefined();
    expect(offlineResult.suggestedPaths.length).toBeGreaterThan(0);

    const topPath = offlineResult.suggestedPaths[0];
    expect(topPath.fitScore).toBeGreaterThanOrEqual(70);
    expect(topPath.role).toMatch(/Design/i);
  });

  it('memastikan lulusan SMK RPL saat exploring tidak disodori peran Akuntan, Medis, atau Olahraga', async () => {
    // Skenario nyata user di tangkapan layar: SMK RPL dengan skill kantor generik
    const result = await computeSemanticCareerDiagnosis({
      aimingChoice: 'exploring',
      userSkills: ['Microsoft Office', 'Excel & Spreadsheet', 'Customer Service'],
      educationLevel: 'SMK',
      major: 'Rekayasa Perangkat Lunak (RPL)',
      hasExperience: false,
    });

    expect(result).toBeDefined();
    expect(result.suggestedPaths.length).toBeGreaterThan(0);

    const roleTitles = result.suggestedPaths.map((p) => p.role);

    // Gated roles HARUS 100% diblokir dari daftar eksplorasi
    const prohibitedGatedRoles = [
      'Accountant',
      'Staff Finance',
      'Staf Administrasi Medis',
      'Pelatih Olahraga & Kebugaran',
      'Pelatih Fisik & Pembinaan Atlet',
      'Guru Pendidikan Jasmani (PJOK)',
      'Arsitek',
      'Drafter Arsitektur',
      'Teknik Sipil / Pengawas Proyek Lapangan',
    ];
    for (const prohibited of prohibitedGatedRoles) {
      expect(roleTitles).not.toContain(prohibited);
    }

    // Rekomendasi utama harus relevan dengan domain teknologi/TI atau operasional terbuka
    expect(roleTitles.some((r) => r.includes('IT') || r.includes('Komputer') || r.includes('Operasional') || r.includes('Quality Assurance'))).toBe(true);
  }, 30000);

  it('memastikan lulusan Human Resources (SDM) saat exploring diprioritaskan ke HR Generalist dan tidak disodori Akuntan atau Medis', async () => {
    const result = await computeSemanticCareerDiagnosis({
      aimingChoice: 'exploring',
      userSkills: ['Microsoft Office', 'Komunikasi Interpersonal', 'Rekrutmen Dasar'],
      educationLevel: 'S1',
      major: 'Manajemen Sumber Daya Manusia (HR)',
      hasExperience: false,
    });

    expect(result).toBeDefined();
    expect(result.primaryRole).toBe('Human Resources Generalist');

    const roleTitles = result.suggestedPaths.map((p) => p.role);
    expect(roleTitles).not.toContain('Accountant');
    expect(roleTitles).not.toContain('Staff Finance');
    expect(roleTitles).not.toContain('Staf Administrasi Medis');
    expect(roleTitles).not.toContain('Pelatih Olahraga & Kebugaran');
  }, 30000);
});



