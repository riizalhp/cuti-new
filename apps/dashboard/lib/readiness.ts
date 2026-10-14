import { calculateAtsScore } from './ats-score';

export interface ChecklistItem {
  id?: string;
  label: string;
  status: boolean;
  score?: number;
  detail: string;
}

export interface ReadinessEvaluation {
  score: number;
  checklist: ChecklistItem[];
  avgAtsScore: number;
  completedCount: number;
  totalItems: number;
}

export interface DimensionMetric {
  label: string;
  value: string;
  passed: boolean;
}

export interface PillarEvaluation {
  id: string;
  title: string;
  score: number;
  status: string;
  icon?: string;
  desc: string;
  recommendation: string;
  actionTab: string;
  actionPath: string;
  actionLabel: string;
  metrics?: DimensionMetric[];
}

export interface RoadmapTask {
  label: string;
  completed: boolean;
}

export interface RoadmapMilestone {
  id: string;
  step: number;
  title: string;
  subtitle: string;
  description: string;
  status: 'completed' | 'in_progress' | 'pending';
  progressPercent: number;
  actionPath: string;
  actionLabel: string;
  tasks: RoadmapTask[];
}

export interface DiagnosticInsight {
  title: string;
  desc: string;
  actionPath?: string;
  actionLabel?: string;
}

export interface HolisticReadinessEvaluation {
  score: number;
  objectiveScore: number;
  diagnosticScore: number | null;
  isCalibrated: boolean;
  tier: 'good' | 'medium' | 'low' | 'empty';
  badge: {
    label: string;
    color: string;
    strokeColor: string;
    tier: 'good' | 'medium' | 'low' | 'empty';
  };
  dimensions: PillarEvaluation[];
  superpower: DiagnosticInsight;
  bottleneck: DiagnosticInsight;
  milestones: RoadmapMilestone[];
  checklist: ChecklistItem[];
  avgAtsScore: number;
  completedCount: number;
  totalItems: number;
}

export const READINESS_STORAGE_KEY = 'employr_career_readiness_score';
export const LEGACY_READINESS_STORAGE_KEY = 'cuti_career_readiness_score';
export const DIAGNOSTIC_QUIZ_STORAGE_KEY = 'employr_diagnostic_quiz_score';
export const READINESS_EVENT_NAME = 'employr_readiness_updated';

export function getStoredReadinessScore(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored =
      localStorage.getItem(READINESS_STORAGE_KEY) ||
      localStorage.getItem(LEGACY_READINESS_STORAGE_KEY);
    if (stored !== null && !isNaN(Number(stored))) {
      return Math.max(0, Math.min(100, Number(stored)));
    }
  } catch {
    // Ignore localStorage errors
  }
  return null;
}

export function setStoredReadinessScore(score: number): void {
  if (typeof window === 'undefined') return;
  try {
    const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
    localStorage.setItem(READINESS_STORAGE_KEY, String(clampedScore));
    window.dispatchEvent(
      new CustomEvent(READINESS_EVENT_NAME, { detail: { score: clampedScore } })
    );
  } catch {
    // Ignore localStorage errors
  }
}

export function clearStoredReadinessScore(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(READINESS_STORAGE_KEY);
    localStorage.removeItem(LEGACY_READINESS_STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent(READINESS_EVENT_NAME, { detail: { score: null } })
    );
  } catch {
    // Ignore localStorage errors
  }
}

export function getStatusFromScore(score: number): string {
  if (score >= 80) return 'Sangat Siap';
  if (score >= 65) return 'Siap Melamar';
  if (score >= 45) return 'Perlu Optimasi';
  if (score > 0) return 'Tahap Awal';
  return 'Belum Ada Data';
}

export function getReadinessBadge(score: number): {
  label: string;
  color: string;
  strokeColor: string;
  tier: 'good' | 'medium' | 'low' | 'empty';
} {
  if (score >= 80) {
    return {
      label: 'Sangat Siap Kerja (Job Ready Plus)',
      color: 'bg-emerald-700 text-white font-bold',
      strokeColor: 'text-emerald-700 dark:text-emerald-400',
      tier: 'good',
    };
  }
  if (score >= 65) {
    return {
      label: 'Siap Melamar (Job Ready)',
      color: 'bg-blue-600 text-white font-bold',
      strokeColor: 'text-blue-600 dark:text-blue-400',
      tier: 'medium',
    };
  }
  if (score >= 45) {
    return {
      label: 'Perlu Optimasi (Needs Polish)',
      color: 'bg-amber-500 text-slate-950 font-bold',
      strokeColor: 'text-amber-700 dark:text-amber-400',
      tier: 'medium',
    };
  }
  if (score > 0) {
    return {
      label: 'Fondasi Awal (Getting Started)',
      color: 'bg-rose-600 text-white font-bold',
      strokeColor: 'text-rose-700 dark:text-rose-400',
      tier: 'low',
    };
  }
  return {
    label: 'Belum Ada Data Profil',
    color: 'bg-slate-500 text-white font-bold',
    strokeColor: 'text-slate-500 dark:text-slate-400',
    tier: 'empty',
  };
}

/**
 * Resolusi skor ATS dengan dynamic fallback:
 * Jika primaryCv.atsScore belum di-scan manual, hitung otomatis via calculateAtsScore.
 */
export function resolveAtsScore(primaryCv: any): number {
  if (!primaryCv) return 0;
  if (typeof primaryCv.atsScore === 'number' && primaryCv.atsScore > 0) {
    return Math.min(100, Math.round(primaryCv.atsScore));
  }
  try {
    const dynamicRes = calculateAtsScore(primaryCv);
    if (dynamicRes && typeof dynamicRes.totalScore === 'number' && dynamicRes.totalScore > 0) {
      return Math.min(100, Math.round(dynamicRes.totalScore));
    }
  } catch {
    // Dynamic calculate fallback error
  }
  return 0;
}

/**
 * Menghitung jam terbang riil secara inklusif:
 * Mendukung pengalaman kerja, magang/PKL (SMK), portofolio proyek, dan organisasi.
 */
export function calculateTotalExperiences(primaryCv: any): {
  workCount: number;
  internshipCount: number;
  projectCount: number;
  orgCount: number;
  totalCount: number;
} {
  if (!primaryCv) {
    return { workCount: 0, internshipCount: 0, projectCount: 0, orgCount: 0, totalCount: 0 };
  }
  const workCount = Array.isArray(primaryCv.experience) ? primaryCv.experience.length : 0;
  const internshipCount = Array.isArray(primaryCv.internships) ? primaryCv.internships.length : 0;
  const projectCount = Array.isArray(primaryCv.projects) ? primaryCv.projects.length : 0;
  const orgCount = Array.isArray(primaryCv.organizations) ? primaryCv.organizations.length : 0;
  const totalCount = workCount + internshipCount + projectCount + orgCount;

  return { workCount, internshipCount, projectCount, orgCount, totalCount };
}

export function calculatePillars(
  cvs: any[] | null | undefined,
  apps: any[] | null | undefined
): PillarEvaluation[] {
  const isCvArray = Array.isArray(cvs) && cvs.length > 0;
  const isAppsArray = Array.isArray(apps) && apps.length > 0;
  const primaryCv = isCvArray ? cvs.find((c: any) => c.isPrimary) || cvs[0] : null;

  // ----------------------------------------------------
  // Dimensi 1: Kualitas Berkas & ATS Score (Bobot 35%)
  // ----------------------------------------------------
  let cvPillar: PillarEvaluation;
  if (primaryCv) {
    const ats = resolveAtsScore(primaryCv);
    const exps = calculateTotalExperiences(primaryCv);
    const hasSummary = Boolean(primaryCv.summary && primaryCv.summary.trim().length >= 20);
    const skillCount = Array.isArray(primaryCv.skills) ? primaryCv.skills.length : 0;
    const eduCount = Array.isArray(primaryCv.education) ? primaryCv.education.length : 0;

    // Komposit skor kualitas berkas (ATS + kelengkapan riwayat)
    let completenessPts = 0;
    if (hasSummary) completenessPts += 20;
    if (skillCount >= 4) completenessPts += 25;
    else completenessPts += skillCount * 6;
    if (exps.totalCount >= 1) completenessPts += 35;
    if (eduCount >= 1) completenessPts += 20;

    // Nilai akhir dimensi 1: kombinasi ATS (60%) dan kelengkapan struktur (40%)
    // atau gunakan skor ATS jika sudah lebih tinggi
    const blendedCvScore = Math.round(ats * 0.6 + completenessPts * 0.4);
    const cvScore = Math.min(100, Math.max(ats > 0 ? ats : 0, blendedCvScore));

    const needsImprovements: string[] = [];
    if (!hasSummary) needsImprovements.push('ringkasan profesional');
    if (skillCount < 4) needsImprovements.push('keahlian industri');
    if (exps.totalCount === 0) needsImprovements.push('pengalaman/PKL/proyek');

    cvPillar = {
      id: 'cv_ats',
      title: 'Kualitas Berkas & Skor ATS',
      score: cvScore,
      status: getStatusFromScore(cvScore),
      desc:
        cvScore >= 80
          ? 'CV telah menggunakan struktur terstandarisasi dengan kepadatan kata kunci industri dan jam terbang yang jelas.'
          : needsImprovements.length > 0
          ? `Perlu penguatan di bagian: ${needsImprovements.join(', ')} untuk menembus seleksi HR.`
          : 'Format CV perlu dioptimalkan agar mudah dipindai oleh sistem rekrutmen.',
      recommendation:
        cvScore >= 85
          ? 'Pertahankan format dan tambahkan metrik angka capaian pada deskripsi pengalaman atau PKL.'
          : needsImprovements.length > 0
          ? `Lengkapi bagian ${needsImprovements[0]} melalui CV Builder untuk menaikkan skor ATS.`
          : 'Uji CV kamu di Simulasi Screening untuk mendeteksi kata kunci industri yang kurang.',
      actionTab: 'cv',
      actionPath: '/cv',
      actionLabel: 'Buka CV Builder',
      metrics: [
        {
          label: 'Skor Keterbacaan ATS',
          value: `${ats > 0 ? ats : cvScore}/100`,
          passed: (ats > 0 ? ats : cvScore) >= 70,
        },
        {
          label: 'Ringkasan Profesional',
          value: hasSummary ? 'Lengkap & Terstruktur' : 'Perlu Diisi',
          passed: hasSummary,
        },
        {
          label: 'Pengalaman & Portofolio',
          value:
            exps.totalCount > 0
              ? `${exps.totalCount} riwayat (${exps.workCount} kerja, ${exps.internshipCount} magang/PKL, ${exps.projectCount + exps.orgCount} proyek/org)`
              : 'Belum ada data',
          passed: exps.totalCount > 0,
        },
      ],
    };
  } else {
    cvPillar = {
      id: 'cv_ats',
      title: 'Kualitas Berkas & Skor ATS',
      score: 0,
      status: 'Belum Ada Data',
      desc: 'Belum ada CV yang tersimpan. Buat CV pertamamu untuk memulai kalkulasi kesiapan.',
      recommendation: 'Mulai buat CV standar industri di menu CV Builder.',
      actionTab: 'cv',
      actionPath: '/cv',
      actionLabel: 'Buat CV Sekarang',
      metrics: [
        { label: 'Skor ATS', value: '0/100', passed: false },
        { label: 'Ringkasan Diri', value: 'Kosong', passed: false },
        { label: 'Pengalaman', value: 'Belum ada', passed: false },
      ],
    };
  }

  // ----------------------------------------------------
  // Dimensi 2: Spesifikasi & Kecocokan Peran (Bobot 25%)
  // ----------------------------------------------------
  let matchPillar: PillarEvaluation;
  if (primaryCv) {
    let matchScorePts = 0;
    const hasTargetRole = Boolean(
      (primaryCv.jobTitle && primaryCv.jobTitle.trim().length > 0) ||
      (primaryCv.targetRole && primaryCv.targetRole.trim().length > 0)
    );
    if (hasTargetRole) matchScorePts += 30;

    const skillCount = Array.isArray(primaryCv.skills) ? primaryCv.skills.length : 0;
    if (skillCount >= 5) matchScorePts += 30;
    else if (skillCount >= 3) matchScorePts += 20;
    else matchScorePts += skillCount * 5;

    const hasSummaryKeywords = Boolean(
      primaryCv.summary && primaryCv.summary.trim().length >= 40
    );
    if (hasSummaryKeywords) matchScorePts += 20;

    // Evaluasi alignment: Jika ada target role dan lamaran di tracker cocok
    const targetRoleLower = (primaryCv.jobTitle || primaryCv.targetRole || '').toLowerCase();
    const hasTrackerMatch =
      isAppsArray &&
      apps.some((a: any) => {
        const pos = (a.position || '').toLowerCase();
        return targetRoleLower && (pos.includes(targetRoleLower) || targetRoleLower.includes(pos));
      });

    if (hasTrackerMatch) {
      matchScorePts += 20;
    } else if (hasTargetRole && skillCount >= 4) {
      matchScorePts += 15;
    }

    const matchScore = Math.min(100, Math.max(0, matchScorePts));

    matchPillar = {
      id: 'job_match',
      title: 'Spesifikasi & Relevansi Peran',
      score: matchScore,
      status: getStatusFromScore(matchScore),
      desc:
        matchScore >= 75
          ? 'Profilmu memiliki spesifikasi peran yang jelas dengan padanan keahlian industri yang terarah.'
          : matchScore >= 50
          ? 'Posisi target sudah mulai terdefinisi, namun padanan kata kunci skill masih perlu diperkaya.'
          : 'Profil masih terlalu umum. Tentukan peran yang dituju agar relevansi lamaran meningkat.',
      recommendation:
        !hasTargetRole
          ? 'Cantumkan target posisi atau spesialisasi di profil CV kamu.'
          : skillCount < 5
          ? 'Perkaya daftar keahlian teknis sesuai deskripsi loker di pasar kerja.'
          : 'Gunakan fitur Kecocokan Lowongan untuk mencocokkan CV kamu dengan kualifikasi loker riil.',
      actionTab: 'match-cv',
      actionPath: '/match-cv',
      actionLabel: 'Uji Kecocokan Lowongan',
      metrics: [
        {
          label: 'Target Posisi Terfokus',
          value: primaryCv.jobTitle || primaryCv.targetRole || 'Belum Spesifik',
          passed: hasTargetRole,
        },
        {
          label: 'Kepadatan Skill Terdaftar',
          value: `${skillCount} keahlian industri`,
          passed: skillCount >= 4,
        },
        {
          label: 'Spesifikasi Ringkasan',
          value: hasSummaryKeywords ? 'Tajam & Terarah' : 'Perlu Dipertegas',
          passed: hasSummaryKeywords,
        },
      ],
    };
  } else {
    matchPillar = {
      id: 'job_match',
      title: 'Spesifikasi & Relevansi Peran',
      score: 0,
      status: 'Belum Ada Data',
      desc: 'Tentukan posisi kerja target dan bandingkan kecocokan keahlianmu.',
      recommendation: 'Buat CV dan uji kecocokan dengan deskripsi loker impian.',
      actionTab: 'match-cv',
      actionPath: '/match-cv',
      actionLabel: 'Buka Match CV',
      metrics: [
        { label: 'Target Posisi', value: 'Belum ada', passed: false },
        { label: 'Keahlian Kunci', value: '0 skill', passed: false },
        { label: 'Relevansi Industri', value: 'Belum diuji', passed: false },
      ],
    };
  }

  // ----------------------------------------------------
  // Dimensi 3: Administrasi & Kelengkapan Berkas (Bobot 20%)
  // ----------------------------------------------------
  let adminPillar: PillarEvaluation;
  if (primaryCv) {
    let adminPts = 0;

    // Kontak lengkap: Email & Telepon/WA (30%)
    const hasFullContact = Boolean(primaryCv.fullName && primaryCv.email && primaryCv.phone);
    if (hasFullContact) adminPts += 30;

    // Domisili jelas (25%)
    const hasCity = Boolean(primaryCv.city || primaryCv.address || primaryCv.location);
    if (hasCity) adminPts += 25;

    // Kredensial pendukung inklusif (25%):
    // Memiliki LinkedIn/Website/GitHub/Portofolio ATAU Sertifikasi/Pelatihan ATAU Riwayat Pendidikan
    const hasOnlineLink = Boolean(
      primaryCv.linkedin || primaryCv.website || primaryCv.github || primaryCv.portfolio
    );
    const hasCert = Boolean(
      (Array.isArray(primaryCv.certifications) && primaryCv.certifications.length > 0) ||
      (Array.isArray(primaryCv.courses) && primaryCv.courses.length > 0)
    );
    const hasCredentials = hasOnlineLink || hasCert || (Array.isArray(primaryCv.education) && primaryCv.education.length > 0);
    if (hasCredentials) adminPts += 25;

    // Kesiapan berkas pengantar (20%)
    const hasSummaryReady = Boolean(primaryCv.summary && primaryCv.summary.trim().length >= 30);
    if (hasSummaryReady) adminPts += 20;

    const adminScore = Math.min(100, Math.max(0, adminPts));

    adminPillar = {
      id: 'application_kit',
      title: 'Administrasi & Berkas Lamaran',
      score: adminScore,
      status: getStatusFromScore(adminScore),
      desc:
        adminScore >= 75
          ? 'Paket berkas lamaranmu lengkap: kontak valid, domisili jelas, dan kredensial profesional siap dikirim.'
          : 'Beberapa elemen administratif seperti kontak WhatsApp, domisili, atau kredensial pendukung belum lengkap.',
      recommendation:
        !hasFullContact
          ? 'Pastikan nomor WhatsApp aktif dan email profesional terisi di CV.'
          : !hasCredentials
          ? 'Sematkan tautan profil LinkedIn atau data sertifikat pelatihan ke dalam CV.'
          : 'Susun draf surat pengantar profesional di menu Email & Cover Letter sebelum melamar.',
      actionTab: 'mailer',
      actionPath: '/mailer',
      actionLabel: 'Siapkan Surat Lamaran',
      metrics: [
        {
          label: 'Kontak WhatsApp & Email',
          value: hasFullContact ? 'Valid & Lengkap' : 'Belum Lengkap',
          passed: hasFullContact,
        },
        {
          label: 'Domisili Tempat Tinggal',
          value: hasCity ? (primaryCv.city || primaryCv.location || 'Terdata') : 'Belum Diisi',
          passed: hasCity,
        },
        {
          label: 'Kredensial & Portofolio',
          value: hasOnlineLink ? 'Tautan Aktif' : hasCert ? 'Sertifikat Terdata' : hasCredentials ? 'Terdata' : 'Belum Ada',
          passed: hasCredentials,
        },
      ],
    };
  } else {
    adminPillar = {
      id: 'application_kit',
      title: 'Administrasi & Berkas Lamaran',
      score: 0,
      status: 'Belum Ada Data',
      desc: 'Lengkapi identitas diri dan siapkan surat pengantar lamaran profesional.',
      recommendation: 'Lengkapi data identitas di CV dan buat draf surat lamaran pertama.',
      actionTab: 'mailer',
      actionPath: '/mailer',
      actionLabel: 'Buka Menu Mailer',
      metrics: [
        { label: 'Kontak Valid', value: 'Belum ada', passed: false },
        { label: 'Domisili', value: 'Belum ada', passed: false },
        { label: 'Kredensial Pendukung', value: 'Belum ada', passed: false },
      ],
    };
  }

  // ----------------------------------------------------
  // Dimensi 4: Momentum Pelamaran & Tracker (Bobot 20%)
  // ----------------------------------------------------
  let trackerPillar: PillarEvaluation;
  const isCvReady = primaryCv && resolveAtsScore(primaryCv) >= 65;

  if (isAppsArray) {
    const totalApps = apps.length;
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentApps = apps.filter((a: any) => {
      const d = new Date(a.createdAt || a.appliedDate || 0);
      return d >= thirtyDaysAgo;
    }).length;

    const advancedStages = apps.filter((a: any) =>
      ['Screening', 'Interview', 'Offering'].includes(a.status)
    ).length;

    // Nilai terukur: volume (50%) + kemajuan pipeline (30%) + baseline berkas siap (20%)
    const appPoints = Math.min(50, Math.round((recentApps / 5) * 50));
    const pipelinePoints = advancedStages > 0 ? 30 : Math.min(15, totalApps * 3);
    const cvReadyBonus = isCvReady ? 20 : 10;
    const momentumScore = Math.min(100, Math.max(0, appPoints + pipelinePoints + cvReadyBonus));

    trackerPillar = {
      id: 'tracker_momentum',
      title: 'Momentum Pelamaran & Tracker',
      score: momentumScore,
      status: getStatusFromScore(momentumScore),
      desc:
        recentApps >= 5
          ? `Momentum sangat baik: ${recentApps} lamaran terpantau aktif dalam 30 hari terakhir.`
          : recentApps > 0
          ? `${recentApps} lamaran tercatat dalam 30 hari terakhir. Jaga ritme melamar minimal 3 lamaran per minggu.`
          : 'Belum ada aktivitas lamaran dalam 30 hari terakhir. Perbarui status lamaranmu di Tracker.',
      recommendation:
        recentApps < 3
          ? 'Kirimkan minimal 3 lamaran kerja terfokus minggu ini dan catat di Tracker Lamaran.'
          : recentApps < 5
          ? 'Perluas jangkauan dan selalu perbarui status perkembangan lamaranmu.'
          : 'Pertahankan kedisiplinan pelacakan dan evaluasi respon rekruter di Tracker.',
      actionTab: 'tracker',
      actionPath: '/tracker',
      actionLabel: 'Buka Tracker Lamaran',
      metrics: [
        {
          label: 'Lamaran Aktif (30 Hari)',
          value: `${recentApps} lamaran`,
          passed: recentApps >= 3,
        },
        {
          label: 'Total Tercatat di Tracker',
          value: `${totalApps} perusahaan`,
          passed: totalApps > 0,
        },
        {
          label: 'Tahap Lanjutan (Screening/Offering)',
          value: `${advancedStages} lamaran`,
          passed: advancedStages > 0,
        },
      ],
    };
  } else {
    // Akun baru belum punya lamaran di tracker:
    // Berikan baseline wajar (35 poin jika berkas siap) agar tidak langsung mengunci skor 0
    const baselineScore = isCvReady ? 35 : 0;

    trackerPillar = {
      id: 'tracker_momentum',
      title: 'Momentum Pelamaran & Tracker',
      score: baselineScore,
      status: baselineScore > 0 ? 'Siap Melamar' : 'Belum Ada Data',
      desc:
        baselineScore > 0
          ? 'Berkas CV kamu sudah siap. Mulai kirim lamaran kerja dan pantau perkembangannya di Tracker.'
          : 'Pantau kemajuan kariermu dengan mencatat setiap lowongan yang kamu lamar di Tracker.',
      recommendation: 'Mulai tambahkan lamaran pertamamu di Tracker Lamaran.',
      actionTab: 'tracker',
      actionPath: '/tracker',
      actionLabel: 'Tambah Lamaran di Tracker',
      metrics: [
        { label: 'Lamaran Terkirim', value: '0 lamaran', passed: false },
        { label: 'Status Pipeline', value: baselineScore > 0 ? 'Siap Eksekusi' : 'Kosong', passed: baselineScore > 0 },
        { label: 'Kedisiplinan Melamar', value: 'Belum aktif', passed: false },
      ],
    };
  }

  return [cvPillar, matchPillar, adminPillar, trackerPillar];
}

/**
 * Single Unified Calculation Engine
 * Menghasilkan indeks kesiapan kerja holistik 4 dimensi dengan opsi kalibrasi kuis diagnostik.
 */
export function calculateHolisticReadiness(
  cvs: any[] | null | undefined,
  apps: any[] | null | undefined,
  diagnosticScoreInput?: number | null
): HolisticReadinessEvaluation {
  const dimensions = calculatePillars(cvs, apps);
  const isCvArray = Array.isArray(cvs) && cvs.length > 0;
  const primaryCv = isCvArray ? cvs.find((c: any) => c.isPrimary) || cvs[0] : null;
  const avgAtsScore = resolveAtsScore(primaryCv);

  // Bobot 4 Dimensi Objektif: 35% CV & ATS, 25% Job Match, 20% Admin, 20% Tracker
  const objectiveScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        dimensions[0].score * 0.35 +
        dimensions[1].score * 0.25 +
        dimensions[2].score * 0.20 +
        dimensions[3].score * 0.20
      )
    )
  );

  // Kalibrasi diagnostik mandiri (85% Objektif + 15% Evaluasi Mandiri jika kuis sudah diisi)
  const diagScore =
    typeof diagnosticScoreInput === 'number' &&
    !isNaN(diagnosticScoreInput) &&
    diagnosticScoreInput > 0
      ? Math.min(100, Math.max(0, diagnosticScoreInput))
      : null;

  const isCalibrated = diagScore !== null;
  const finalScore = isCalibrated
    ? Math.min(100, Math.max(0, Math.round(objectiveScore * 0.85 + diagScore * 0.15)))
    : objectiveScore;

  const badge = getReadinessBadge(finalScore);

  // Cari Superpower (dimensi skor tertinggi) dan Bottleneck (dimensi skor terendah)
  const sortedByScore = [...dimensions].sort((a, b) => b.score - a.score);
  const bestDimension = sortedByScore[0];
  const lowestDimension = sortedByScore[sortedByScore.length - 1];

  const superpower: DiagnosticInsight = {
    title: bestDimension.score > 0 ? bestDimension.title : 'Menunggu Analisis Berkas',
    desc:
      bestDimension.score >= 75
        ? `Kekuatan utamamu ada pada ${bestDimension.title} (${bestDimension.score}/100) — sudah melampaui rata-rata pelamar.`
        : bestDimension.score > 0
        ? `Aspek terbaik saat ini adalah ${bestDimension.title} (${bestDimension.score}/100) — terus asah untuk daya saing maksimal.`
        : 'Lengkapi profil dan buat CV pertamamu untuk menemukan keunggulan terbaikmu.',
  };

  const bottleneck: DiagnosticInsight = {
    title: lowestDimension.score < 75 ? lowestDimension.title : 'Semua Pilar Optimal',
    desc:
      lowestDimension.score < 60
        ? `Fokus utama: Optimalkan ${lowestDimension.title} (${lowestDimension.score}/100) untuk mendongkrak peluang lolos kerjamu.`
        : lowestDimension.score < 80
        ? `${lowestDimension.title} sudah baik (${lowestDimension.score}/100) dan masih bisa ditingkatkan ke standar prima.`
        : 'Seluruh pilar kesiapan kerja kamu berada di level prima dan siap bersaing.',
    actionPath: lowestDimension.actionPath,
    actionLabel: lowestDimension.actionLabel,
  };

  // Checklist 4 Dimensi Terpadu (Sinkron 1:1 dengan kartu Beranda & Dimensi Detail)
  const checklist: ChecklistItem[] = [
    {
      id: 'cv_ats',
      label: 'Kualitas Berkas & ATS',
      status: dimensions[0].score >= 65,
      score: dimensions[0].score,
      detail:
        dimensions[0].score >= 65
          ? `Skor ${dimensions[0].score}/100 — format ATS terstruktur & ramah pemindai`
          : `Skor ${dimensions[0].score}/100 — lengkapi ringkasan, skill, dan pengalaman`,
    },
    {
      id: 'job_match',
      label: 'Spesifikasi & Relevansi Peran',
      status: dimensions[1].score >= 65,
      score: dimensions[1].score,
      detail:
        dimensions[1].score >= 65
          ? `Target posisi terarah dengan ${primaryCv?.skills?.length || 0} keahlian industri`
          : 'Tentukan target posisi spesifik dan cantumkan minimal 4 keahlian',
    },
    {
      id: 'application_kit',
      label: 'Administrasi & Berkas Lamaran',
      status: dimensions[2].score >= 65,
      score: dimensions[2].score,
      detail:
        dimensions[2].score >= 65
          ? 'Kontak valid, domisili jelas, dan kredensial profesional terdata'
          : 'Lengkapi kontak aktif, domisili, atau kredensial pendukung',
    },
    {
      id: 'tracker_momentum',
      label: 'Momentum Pelamaran & Tracker',
      status: dimensions[3].score >= 50,
      score: dimensions[3].score,
      detail:
        dimensions[3].score >= 50
          ? `${Array.isArray(apps) ? apps.length : 0} lamaran tercatat & aktif dipantau di Tracker`
          : 'Catat minimal 1–3 lamaran kerja di Tracker untuk membangun ritme',
    },
  ];

  const completedCount = checklist.filter((c) => c.status).length;
  const totalItems = checklist.length;

  // Hitung Dynamic Roadmap Milestones
  const exps = calculateTotalExperiences(primaryCv);
  const m1Task1 = Boolean(primaryCv && primaryCv.fullName && primaryCv.email && primaryCv.phone);
  const m1Task2 = Boolean(primaryCv && Array.isArray(primaryCv.education) && primaryCv.education.length > 0);
  const m1Task3 = Boolean(primaryCv && avgAtsScore >= 70);
  const m1Completed = m1Task1 && m1Task2 && m1Task3;
  const m1Progress = Math.round(((Number(m1Task1) + Number(m1Task2) + Number(m1Task3)) / 3) * 100);

  const m2Task1 = Boolean(primaryCv && primaryCv.summary && primaryCv.summary.trim().length >= 30);
  const m2Task2 = Boolean(primaryCv && Array.isArray(primaryCv.skills) && primaryCv.skills.length >= 4);
  const m2Task3 = Boolean(primaryCv && (primaryCv.jobTitle || primaryCv.targetRole));
  const m2Completed = m2Task1 && m2Task2 && m2Task3;
  const m2Progress = Math.round(((Number(m2Task1) + Number(m2Task2) + Number(m2Task3)) / 3) * 100);

  const hasCredentials = Boolean(
    primaryCv &&
    (primaryCv.linkedin ||
      primaryCv.portfolio ||
      primaryCv.website ||
      (Array.isArray(primaryCv.certifications) && primaryCv.certifications.length > 0) ||
      exps.internshipCount > 0)
  );
  const m3Task1 = hasCredentials;
  const m3Task2 = Boolean(primaryCv && (primaryCv.city || primaryCv.location));
  const m3Completed = m3Task1 && m3Task2;
  const m3Progress = Math.round(((Number(m3Task1) + Number(m3Task2)) / 2) * 100);

  const appCount = Array.isArray(apps) ? apps.length : 0;
  const m4Task1 = appCount >= 1;
  const m4Task2 = appCount >= 3;
  const m4Completed = m4Task1 && m4Task2;
  const m4Progress = Math.round(((Number(m4Task1) + Number(m4Task2)) / 2) * 100);

  const milestones: RoadmapMilestone[] = [
    {
      id: 'm1',
      step: 1,
      title: 'Fondasi Berkas & Standar ATS',
      subtitle: 'Kelengkapan Profil & Format Screening',
      description:
        'Pastikan informasi identitas, riwayat pendidikan, dan format CV lolos pemindaian ATS dengan skor minimum 70.',
      status: m1Completed ? 'completed' : m1Progress > 0 ? 'in_progress' : 'pending',
      progressPercent: m1Progress,
      actionPath: '/cv',
      actionLabel: 'Buka CV Builder',
      tasks: [
        { label: 'Data kontak (WhatsApp & email) terverifikasi', completed: m1Task1 },
        { label: 'Riwayat pendidikan minimal 1 tingkatan tercantum', completed: m1Task2 },
        { label: 'Skor ATS CV mencapai minimal 70/100', completed: m1Task3 },
      ],
    },
    {
      id: 'm2',
      step: 2,
      title: 'Spesifikasi & Relevansi Peran',
      subtitle: 'Target Posisi & Kepadatan Keahlian',
      description:
        'Pertajam target posisi pekerjaan dan lengkapi minimal 4 keahlian teknis relevan agar CV mudah ditemukan rekruter.',
      status: m2Completed ? 'completed' : m2Progress > 0 ? 'in_progress' : 'pending',
      progressPercent: m2Progress,
      actionPath: '/match-cv',
      actionLabel: 'Uji Kecocokan Lowongan',
      tasks: [
        { label: 'Ringkasan profesional minimal 30 karakter', completed: m2Task1 },
        { label: 'Minimal 4 keahlian teknis/softskill relevan', completed: m2Task2 },
        { label: 'Target posisi kerja spesifik sudah ditentukan', completed: m2Task3 },
      ],
    },
    {
      id: 'm3',
      step: 3,
      title: 'Paket Administrasi & Pendukung',
      subtitle: 'Kredensial Portofolio & Domisili Terdata',
      description:
        'Lengkapi kredensial pelengkap seperti domisili tempat tinggal dan sertifikasi/tautan profil agar profil meyakinkan.',
      status: m3Completed ? 'completed' : m3Progress > 0 ? 'in_progress' : 'pending',
      progressPercent: m3Progress,
      actionPath: '/mailer',
      actionLabel: 'Siapkan Surat Lamaran',
      tasks: [
        { label: 'Kredensial pendukung (sertifikat / magang / LinkedIn) terpasang', completed: m3Task1 },
        { label: 'Domisili kota tempat tinggal terdata jelas', completed: m3Task2 },
      ],
    },
    {
      id: 'm4',
      step: 4,
      title: 'Eksekusi & Momentum Pelamaran',
      subtitle: 'Pencatatan & Kedisiplinan Melamar',
      description:
        'Kirimkan lamaran kerja secara konsisten dan gunakan Tracker Lamaran untuk memantau status hingga tahap panggilan kerja.',
      status: m4Completed ? 'completed' : m4Progress > 0 ? 'in_progress' : 'pending',
      progressPercent: m4Progress,
      actionPath: '/tracker',
      actionLabel: 'Kelola Tracker Lamaran',
      tasks: [
        { label: 'Mengirimkan dan mencatat minimal 1 lamaran kerja', completed: m4Task1 },
        { label: 'Mencapai target konsistensi minimal 3 lamaran di Tracker', completed: m4Task2 },
      ],
    },
  ];

  return {
    score: finalScore,
    objectiveScore,
    diagnosticScore: diagScore,
    isCalibrated,
    tier: badge.tier,
    badge,
    dimensions,
    superpower,
    bottleneck,
    milestones,
    checklist,
    avgAtsScore,
    completedCount,
    totalItems,
  };
}

/**
 * Kompatibilitas mundur untuk pemanggil legacy calculateReadinessScore.
 * Sekarang langsung mengembalikan hasil perhitungan single engine.
 */
export function calculateReadinessScore(
  cvs: any[] | null | undefined,
  apps?: any[] | null | undefined
): ReadinessEvaluation {
  const holistic = calculateHolisticReadiness(cvs, apps);
  return {
    score: holistic.score,
    checklist: holistic.checklist,
    avgAtsScore: holistic.avgAtsScore,
    completedCount: holistic.completedCount,
    totalItems: holistic.totalItems,
  };
}
