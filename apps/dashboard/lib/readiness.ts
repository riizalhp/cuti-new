export interface ChecklistItem {
  label: string;
  status: boolean;
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
      color: 'bg-emerald-500 text-white font-bold',
      strokeColor: 'text-emerald-500',
      tier: 'good',
    };
  }
  if (score >= 65) {
    return {
      label: 'Siap Melamar (Job Ready)',
      color: 'bg-blue-600 text-white font-bold',
      strokeColor: 'text-blue-500',
      tier: 'medium',
    };
  }
  if (score >= 45) {
    return {
      label: 'Perlu Optimasi (Needs Polish)',
      color: 'bg-amber-500 text-slate-950 font-bold',
      strokeColor: 'text-amber-500',
      tier: 'medium',
    };
  }
  if (score > 0) {
    return {
      label: 'Fondasi Awal (Getting Started)',
      color: 'bg-rose-500 text-white font-bold',
      strokeColor: 'text-rose-500',
      tier: 'low',
    };
  }
  return {
    label: 'Belum Ada Data Profil',
    color: 'bg-slate-500 text-white font-bold',
    strokeColor: 'text-slate-400',
    tier: 'empty',
  };
}

export function calculateReadinessScore(
  cvs: any[] | null | undefined,
  apps?: any[] | null | undefined
): ReadinessEvaluation {
  const isCvArray = Array.isArray(cvs) && cvs.length > 0;
  const isAppsArray = Array.isArray(apps) && apps.length > 0;

  if (!isCvArray) {
    const emptyChecklist: ChecklistItem[] = [
      {
        label: 'Kontak & Ringkasan Diri',
        status: false,
        detail: 'Lengkapi kontak aktif dan ringkasan profesional',
      },
      {
        label: 'Riwayat Pendidikan',
        status: false,
        detail: 'Tambahkan data sekolah atau universitas',
      },
      {
        label: 'Pengalaman & Portofolio',
        status: false,
        detail: 'Tambahkan minimal 1 pengalaman kerja, magang, atau proyek',
      },
      {
        label: 'Keahlian Terfokus',
        status: false,
        detail: 'Tambahkan minimal 4 skill relevan industri',
      },
      {
        label: 'Format Standar ATS',
        status: false,
        detail: 'Buat CV teroptimasi sistem di CV Builder',
      },
    ];

    return {
      score: 0,
      checklist: emptyChecklist,
      avgAtsScore: 0,
      completedCount: 0,
      totalItems: 5,
    };
  }

  let totalContacts = 0;
  let totalSummaries = 0;
  let totalEdu = 0;
  let totalExp = 0;
  let totalProjects = 0;
  let totalInternships = 0;
  let totalSkills = 0;
  let totalAtsScore = 0;

  cvs.forEach((cv: any) => {
    if (cv.fullName && cv.email && cv.phone) totalContacts++;
    if (cv.summary && cv.summary.trim().length >= 20) totalSummaries++;
    if (Array.isArray(cv.education) && cv.education.length > 0) totalEdu += cv.education.length;
    if (Array.isArray(cv.experience)) totalExp += cv.experience.length;
    if (Array.isArray(cv.projects)) totalProjects += cv.projects.length;
    if (Array.isArray(cv.internships)) totalInternships += cv.internships.length;
    if (Array.isArray(cv.skills)) totalSkills += cv.skills.length;
    totalAtsScore += typeof cv.atsScore === 'number' ? cv.atsScore : 0;
  });

  const avgAtsScore = Math.round(totalAtsScore / cvs.length);
  const hasContact = totalContacts > 0;
  const hasSummary = totalSummaries > 0;
  const contactSummaryStatus = hasContact && hasSummary;
  const hasEdu = totalEdu > 0;
  const hasExperience = totalExp + totalProjects + totalInternships > 0;
  const hasSkills = totalSkills >= 4;
  const isAtsOptimal = avgAtsScore >= 75;

  const checklist: ChecklistItem[] = [
    {
      label: 'Kontak & Ringkasan Diri',
      status: contactSummaryStatus,
      detail: contactSummaryStatus
        ? 'Kontak dan ringkasan profesional lengkap'
        : 'Lengkapi nomor kontak dan ringkasan profil',
    },
    {
      label: 'Riwayat Pendidikan',
      status: hasEdu,
      detail: hasEdu
        ? `${totalEdu} riwayat pendidikan terdata`
        : 'Belum menambahkan data pendidikan',
    },
    {
      label: 'Pengalaman & Portofolio',
      status: hasExperience,
      detail: hasExperience
        ? `${totalExp + totalProjects + totalInternships} pengalaman atau proyek terdaftar`
        : 'Tambahkan minimal 1 pengalaman kerja, magang, atau proyek',
    },
    {
      label: 'Keahlian Terfokus',
      status: hasSkills,
      detail: hasSkills
        ? `${totalSkills} keahlian relevan terpasang`
        : `${totalSkills} keahlian (target minimal 4 skill relevan)`,
    },
    {
      label: 'Format Standar ATS',
      status: isAtsOptimal,
      detail: isAtsOptimal
        ? `Rata-rata skor ATS ${avgAtsScore}/100 (Format siap lolos screening)`
        : `Rata-rata skor ATS ${avgAtsScore}/100 (Perlu pengayaan kata kunci industri)`,
    },
  ];

  const completedCount = checklist.filter((c) => c.status).length;
  const totalItems = checklist.length;

  // Base CV Readiness: 50% kelengkapan 5 item + 30% bobot ATS Score
  let baseScore = (completedCount / totalItems) * 50 + (avgAtsScore / 100) * 30;

  // Bonus Momentum Tracker: 20%
  if (isAppsArray) {
    const totalApps = apps.length;
    const trackerBonus = Math.min(20, Math.round((totalApps / 5) * 20));
    baseScore += trackerBonus;
  }

  const calculatedScore = Math.min(100, Math.max(0, Math.round(baseScore)));

  return {
    score: calculatedScore,
    checklist,
    avgAtsScore,
    completedCount,
    totalItems,
  };
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
    const ats = primaryCv.atsScore ?? 0;
    const cvScore = Math.min(100, Math.max(0, ats));

    const needsImprovements: string[] = [];
    if (!primaryCv.summary || primaryCv.summary.trim().length < 20) needsImprovements.push('ringkasan');
    if (!primaryCv.skills || primaryCv.skills.length < 4) needsImprovements.push('skill');
    if (!primaryCv.experience || primaryCv.experience.length === 0) needsImprovements.push('pengalaman');

    cvPillar = {
      id: 'cv_ats',
      title: 'Kualitas Berkas & Skor ATS',
      score: cvScore,
      status: getStatusFromScore(cvScore),
      desc:
        cvScore >= 80
          ? 'CV telah menggunakan struktur terstandarisasi dengan kepadatan kata kunci industri yang baik.'
          : needsImprovements.length > 0
          ? `Perlu penguatan di bagian: ${needsImprovements.join(', ')} untuk menembus seleksi HR.`
          : 'Format CV perlu dioptimalkan agar mudah dipindai oleh sistem rekrutmen.',
      recommendation:
        cvScore >= 85
          ? 'Pertahankan format dan tambahkan metrik angka capaian pada deskripsi pengalaman.'
          : needsImprovements.length > 0
          ? `Lengkapi bagian ${needsImprovements[0]} melalui CV Builder untuk menaikkan skor ATS.`
          : 'Uji CV Anda di Simulasi Screening untuk mendeteksi kata kunci yang kurang.',
      actionTab: 'cv',
      actionPath: '/cv',
      actionLabel: 'Buka CV Builder',
      metrics: [
        {
          label: 'Skor ATS Terkini',
          value: `${cvScore}/100`,
          passed: cvScore >= 75,
        },
        {
          label: 'Ringkasan Diri',
          value: primaryCv.summary && primaryCv.summary.trim().length >= 20 ? 'Lengkap' : 'Perlu Diisi',
          passed: Boolean(primaryCv.summary && primaryCv.summary.trim().length >= 20),
        },
        {
          label: 'Daftar Pengalaman',
          value: Array.isArray(primaryCv.experience) ? `${primaryCv.experience.length} riwayat` : '0 riwayat',
          passed: Boolean(Array.isArray(primaryCv.experience) && primaryCv.experience.length > 0),
        },
      ],
    };
  } else {
    cvPillar = {
      id: 'cv_ats',
      title: 'Kualitas Berkas & Skor ATS',
      score: 0,
      status: 'Belum Ada Data',
      desc: 'Belum ada CV yang tersimpan. Buat CV pertama Anda untuk memulai kalkulasi kesiapan.',
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
  // Dimensi 2: Riset & Kecocokan Lowongan (Bobot 25%)
  // ----------------------------------------------------
  let matchPillar: PillarEvaluation;
  if (primaryCv) {
    let matchFactors = 0;
    const totalMatchFactors = 4;

    const hasTargetRole = Boolean(primaryCv.jobTitle || primaryCv.targetRole);
    if (hasTargetRole) matchFactors++;

    const skillCount = Array.isArray(primaryCv.skills) ? primaryCv.skills.length : 0;
    if (skillCount >= 4) matchFactors++;
    if (skillCount >= 6) matchFactors++;

    const hasSummaryKeywords =
      primaryCv.summary && primaryCv.summary.trim().length >= 40;
    if (hasSummaryKeywords) matchFactors++;

    const matchScore = Math.round((matchFactors / totalMatchFactors) * 100);

    matchPillar = {
      id: 'job_match',
      title: 'Riset & Kecocokan Lowongan',
      score: matchScore,
      status: getStatusFromScore(matchScore),
      desc:
        matchScore >= 75
          ? 'Profil Anda memiliki spesifikasi peran yang jelas dengan padanan keahlian industri yang terarah.'
          : matchScore >= 50
          ? 'Posisi target sudah mulai terdefinisi, namun padanan kata kunci skill masih perlu diperkaya.'
          : 'Profil masih terlalu umum. Tentukan peran yang dituju agar relevansi lamaran meningkat.',
      recommendation:
        !hasTargetRole
          ? 'Cantumkan target posisi atau spesialisasi di profil CV Anda.'
          : skillCount < 5
          ? 'Perkaya daftar keahlian teknis sesuai deskripsi lowongan di pasar kerja.'
          : 'Gunakan fitur Kecocokan Lowongan untuk mencocokkan CV Anda dengan kualifikasi loker riil.',
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
          value: `${skillCount} keahlian`,
          passed: skillCount >= 4,
        },
        {
          label: 'Spesifikasi Ringkasan',
          value: hasSummaryKeywords ? 'Tajam & Terarah' : 'Perlu Dipertegas',
          passed: Boolean(hasSummaryKeywords),
        },
      ],
    };
  } else {
    matchPillar = {
      id: 'job_match',
      title: 'Riset & Kecocokan Lowongan',
      score: 0,
      status: 'Belum Ada Data',
      desc: 'Tentukan posisi kerja target dan bandingkan kecocokan keahlian Anda.',
      recommendation: 'Buat CV dan uji kecocokan dengan deskripsi lowongan kerja impian.',
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
    let adminFactors = 0;
    const totalAdminFactors = 4;

    const hasFullContact = Boolean(primaryCv.fullName && primaryCv.email && primaryCv.phone);
    if (hasFullContact) adminFactors++;

    const hasCity = Boolean(primaryCv.city || primaryCv.address || primaryCv.location);
    if (hasCity) adminFactors++;

    const hasOnlinePresence = Boolean(
      primaryCv.linkedin || primaryCv.website || primaryCv.github || primaryCv.portfolio
    );
    if (hasOnlinePresence) adminFactors++;

    const hasSummaryReady = Boolean(primaryCv.summary && primaryCv.summary.trim().length >= 30);
    if (hasSummaryReady) adminFactors++;

    const adminScore = Math.round((adminFactors / totalAdminFactors) * 100);

    adminPillar = {
      id: 'application_kit',
      title: 'Administrasi & Berkas Lamaran',
      score: adminScore,
      status: getStatusFromScore(adminScore),
      desc:
        adminScore >= 75
          ? 'Paket berkas lamaran Anda lengkap: kontak valid, domisili jelas, dan tautan profil profesional siap dikirim.'
          : 'Beberapa elemen administratif seperti kontak, domisili, atau tautan profil pendukung belum lengkap.',
      recommendation:
        !hasFullContact
          ? 'Pastikan nomor telepon WhatsApp aktif dan email profesional terisi.'
          : !hasOnlinePresence
          ? 'Sematkan tautan profil LinkedIn atau portofolio kerja pada profil CV.'
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
          label: 'Tautan Portofolio / LinkedIn',
          value: hasOnlinePresence ? 'Tersedia' : 'Belum Ada',
          passed: hasOnlinePresence,
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
        { label: 'Tautan Portofolio', value: 'Belum ada', passed: false },
      ],
    };
  }

  // ----------------------------------------------------
  // Dimensi 4: Momentum Pelamaran & Tracker (Bobot 20%)
  // ----------------------------------------------------
  let trackerPillar: PillarEvaluation;
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

    // Skor berbasis aktivitas konsisten: target 8 lamaran terfokus = 70 poin + status pipeline
    const appPoints = Math.min(70, Math.round((recentApps / 8) * 70));
    const pipelinePoints = advancedStages > 0 ? 30 : Math.min(20, totalApps * 5);
    const momentumScore = Math.min(100, Math.max(0, appPoints + pipelinePoints));

    trackerPillar = {
      id: 'tracker_momentum',
      title: 'Momentum Pelamaran & Tracker',
      score: momentumScore,
      status: getStatusFromScore(momentumScore),
      desc:
        recentApps >= 8
          ? `Momentum sangat baik: ${recentApps} lamaran dikirim dan terpantau dalam 30 hari terakhir.`
          : recentApps > 0
          ? `${recentApps} lamaran tercatat dalam 30 hari terakhir. Jaga ritme melamar minimal 3 lamaran per minggu.`
          : 'Belum ada catatan aktivitas lamaran dalam 30 hari terakhir di Tracker.',
      recommendation:
        recentApps < 3
          ? 'Kirimkan minimal 3 lamaran kerja terfokus minggu ini dan catat di Tracker Lamaran.'
          : recentApps < 8
          ? 'Perluas jangkauan dan selalu perbarui status perkembangan lamaran Anda.'
          : 'Pertahankan kedisiplinan pelacakan dan evaluasi respon rekruter di Tracker.',
      actionTab: 'tracker',
      actionPath: '/tracker',
      actionLabel: 'Buka Tracker Lamaran',
      metrics: [
        {
          label: 'Lamaran Aktif (30 Hari)',
          value: `${recentApps} lamaran`,
          passed: recentApps >= 5,
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
    trackerPillar = {
      id: 'tracker_momentum',
      title: 'Momentum Pelamaran & Tracker',
      score: 0,
      status: 'Belum Ada Data',
      desc: 'Pantau kemajuan karier Anda dengan mencatat setiap lowongan yang dilamar.',
      recommendation: 'Mulai tambahkan lamaran pertama Anda di Tracker Lamaran.',
      actionTab: 'tracker',
      actionPath: '/tracker',
      actionLabel: 'Tambah Lamaran di Tracker',
      metrics: [
        { label: 'Lamaran Terkirim', value: '0 lamaran', passed: false },
        { label: 'Ritme Mingguan', value: 'Belum aktif', passed: false },
        { label: 'Status Pipeline', value: 'Kosong', passed: false },
      ],
    };
  }

  return [cvPillar, matchPillar, adminPillar, trackerPillar];
}

export function calculateHolisticReadiness(
  cvs: any[] | null | undefined,
  apps: any[] | null | undefined
): HolisticReadinessEvaluation {
  const dimensions = calculatePillars(cvs, apps);
  const evaluation = calculateReadinessScore(cvs, apps);

  // Bobot: Dimensi 1 (35%), Dimensi 2 (25%), Dimensi 3 (20%), Dimensi 4 (20%)
  const weightedScore = Math.round(
    dimensions[0].score * 0.35 +
      dimensions[1].score * 0.25 +
      dimensions[2].score * 0.20 +
      dimensions[3].score * 0.20
  );

  const finalScore = Math.min(100, Math.max(0, weightedScore));
  const badge = getReadinessBadge(finalScore);

  // Cari Superpower (dimensi skor tertinggi) dan Bottleneck (dimensi skor terendah)
  const sortedByScore = [...dimensions].sort((a, b) => b.score - a.score);
  const bestDimension = sortedByScore[0];
  const lowestDimension = sortedByScore[sortedByScore.length - 1];

  const superpower: DiagnosticInsight = {
    title: bestDimension.score > 0 ? bestDimension.title : 'Menunggu Analisis Berkas',
    desc:
      bestDimension.score >= 75
        ? `Kekuatan utama Anda berada pada ${bestDimension.title} dengan skor ${bestDimension.score}/100. Kualitas aspek ini sudah melampaui rata-rata pelamar entry-level.`
        : bestDimension.score > 0
        ? `Aspek terbaik saat ini adalah ${bestDimension.title} (${bestDimension.score}/100). Terus tingkatkan agar menjadi nilai jual utama.`
        : 'Lengkapi profil dan buat CV pertamamu untuk menemukan kekuatan terbaikmu.',
  };

  const bottleneck: DiagnosticInsight = {
    title: lowestDimension.score < 75 ? lowestDimension.title : 'Semua Pilar Optimal',
    desc:
      lowestDimension.score < 60
        ? `Fokus perbaikan mendesak: ${lowestDimension.title} (${lowestDimension.score}/100). Mengoptimalkan bagian ini akan meningkatkan kesiapan kerja Anda secara signifikan.`
        : lowestDimension.score < 80
        ? `${lowestDimension.title} masih berpeluang ditingkatkan dari ${lowestDimension.score}/100 ke standar keunggulan 85+.`
        : 'Luar biasa! Seluruh pilar kesiapan kerja Anda berada pada level prima dan siap bersaing.',
    actionPath: lowestDimension.actionPath,
    actionLabel: lowestDimension.actionLabel,
  };

  // Hitung Dynamic Roadmap Milestones
  const isCvArray = Array.isArray(cvs) && cvs.length > 0;
  const primaryCv = isCvArray ? cvs.find((c: any) => c.isPrimary) || cvs[0] : null;
  const isAppsArray = Array.isArray(apps) && apps.length > 0;

  const m1Task1 = Boolean(primaryCv && primaryCv.fullName && primaryCv.email && primaryCv.phone);
  const m1Task2 = Boolean(primaryCv && Array.isArray(primaryCv.education) && primaryCv.education.length > 0);
  const m1Task3 = Boolean(primaryCv && (primaryCv.atsScore ?? 0) >= 75);
  const m1Completed = m1Task1 && m1Task2 && m1Task3;
  const m1Progress = Math.round(((Number(m1Task1) + Number(m1Task2) + Number(m1Task3)) / 3) * 100);

  const m2Task1 = Boolean(primaryCv && primaryCv.summary && primaryCv.summary.trim().length >= 30);
  const m2Task2 = Boolean(primaryCv && Array.isArray(primaryCv.skills) && primaryCv.skills.length >= 4);
  const m2Task3 = Boolean(primaryCv && (primaryCv.jobTitle || primaryCv.targetRole));
  const m2Completed = m2Task1 && m2Task2 && m2Task3;
  const m2Progress = Math.round(((Number(m2Task1) + Number(m2Task2) + Number(m2Task3)) / 3) * 100);

  const m3Task1 = Boolean(primaryCv && (primaryCv.linkedin || primaryCv.portfolio || primaryCv.website));
  const m3Task2 = Boolean(primaryCv && (primaryCv.city || primaryCv.location));
  const m3Completed = m3Task1 && m3Task2;
  const m3Progress = Math.round(((Number(m3Task1) + Number(m3Task2)) / 2) * 100);

  const appCount = isAppsArray ? apps.length : 0;
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
      description: 'Pastikan informasi identitas, riwayat pendidikan, dan format CV lolos pemindaian ATS dengan skor minimum 75.',
      status: m1Completed ? 'completed' : m1Progress > 0 ? 'in_progress' : 'pending',
      progressPercent: m1Progress,
      actionPath: '/cv',
      actionLabel: 'Buka CV Builder',
      tasks: [
        { label: 'Data kontak (WhatsApp & email) terverifikasi', completed: m1Task1 },
        { label: 'Riwayat pendidikan minimal 1 tingkatan tercantum', completed: m1Task2 },
        { label: 'Skor ATS CV mencapai minimal 75/100', completed: m1Task3 },
      ],
    },
    {
      id: 'm2',
      step: 2,
      title: 'Spesifikasi & Relevansi Peran',
      subtitle: 'Target Posisi & Kepadatan Keahlian',
      description: 'Pertajam target posisi pekerjaan dan lengkapi minimal 4 keahlian teknis relevan agar CV mudah ditemukan rekruter.',
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
      subtitle: 'Tautan Portofolio & Domisili Terdata',
      description: 'Lengkapi kredensial pelengkap seperti domisili tempat tinggal dan tautan portofolio/LinkedIn agar profil meyakinkan.',
      status: m3Completed ? 'completed' : m3Progress > 0 ? 'in_progress' : 'pending',
      progressPercent: m3Progress,
      actionPath: '/mailer',
      actionLabel: 'Siapkan Surat Lamaran',
      tasks: [
        { label: 'Tautan portofolio kerja / LinkedIn terpasang', completed: m3Task1 },
        { label: 'Domisili kota tempat tinggal terdata jelas', completed: m3Task2 },
      ],
    },
    {
      id: 'm4',
      step: 4,
      title: 'Eksekusi & Momentum Pelamaran',
      subtitle: 'Pencatatan & Kedisiplinan Melamar',
      description: 'Kirimkan lamaran kerja secara konsisten dan gunakan Tracker Lamaran untuk memantau status hingga tahap panggilan kerja.',
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
    tier: badge.tier,
    badge,
    dimensions,
    superpower,
    bottleneck,
    milestones,
    checklist: evaluation.checklist,
    avgAtsScore: evaluation.avgAtsScore,
    completedCount: evaluation.completedCount,
    totalItems: evaluation.totalItems,
  };
}
