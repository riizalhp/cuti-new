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

export interface PillarEvaluation {
  id: string;
  title: string;
  score: number;
  status: string;
  icon?: string;
  desc: string;
  recommendation: string;
  actionTab: string;
}

export const READINESS_STORAGE_KEY = 'cuti_career_readiness_score';
export const READINESS_EVENT_NAME = 'cuti_readiness_updated';

export function getStoredReadinessScore(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(READINESS_STORAGE_KEY);
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
  if (score >= 85) return 'Sangat Baik';
  if (score >= 70) return 'Cukup Baik';
  if (score >= 50) return 'Perlu Perbaikan';
  return 'Belum Optimal';
}

export function getReadinessBadge(score: number): { label: string; color: string } {
  if (score >= 85) {
    return {
      label: 'Sangat Siap Kerja (Job Ready)',
      color: 'bg-emerald-500 text-white',
    };
  }
  if (score >= 70) {
    return {
      label: 'Siap Kerja (Perlu Sedikit Optimasi)',
      color: 'bg-[#1738D1] text-white',
    };
  }
  return {
    label: 'Perlu Pembenahan Karir',
    color: 'bg-amber-500 text-slate-950 font-bold',
  };
}

export function calculateReadinessScore(
  cvs: any[] | null | undefined,
  _apps?: any[] | null | undefined
): ReadinessEvaluation {
  if (!Array.isArray(cvs) || cvs.length === 0) {
    const emptyChecklist: ChecklistItem[] = [
      {
        label: 'Kontak & Ringkasan Diri',
        status: false,
        detail: 'Lengkapi nomor kontak dan ringkasan profil',
      },
      {
        label: 'Riwayat Pendidikan',
        status: false,
        detail: 'Belum menambahkan data pendidikan',
      },
      {
        label: 'Pengalaman & Portofolio',
        status: false,
        detail: 'Tambahkan minimal 1 pengalaman kerja, magang, atau proyek',
      },
      {
        label: 'Skill Teknis & Softskill',
        status: false,
        detail: 'Tambahkan minimal 4 skill utama',
      },
      {
        label: 'Format CV ATS Friendly',
        status: false,
        detail: 'Buat CV pertamamu di CV Builder',
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
    totalAtsScore += cv.atsScore ?? 85;
  });

  const avgAtsScore = Math.round(totalAtsScore / cvs.length);
  const hasContact = totalContacts > 0;
  const hasSummary = totalSummaries > 0;
  const contactSummaryStatus = hasContact && hasSummary;
  const hasEdu = totalEdu > 0;
  const hasExperience = totalExp + totalProjects + totalInternships > 0;
  const hasSkills = totalSkills >= 4;
  const isAtsOptimal = avgAtsScore >= 80;

  const checklist: ChecklistItem[] = [
    {
      label: 'Kontak & Ringkasan Diri',
      status: contactSummaryStatus,
      detail: contactSummaryStatus
        ? `${totalContacts} CV dengan kontak & ringkasan lengkap`
        : 'Lengkapi nomor kontak dan ringkasan profil',
    },
    {
      label: 'Riwayat Pendidikan',
      status: hasEdu,
      detail: hasEdu
        ? `${totalEdu} riwayat pendidikan dari ${cvs.length} CV`
        : 'Belum menambahkan data pendidikan',
    },
    {
      label: 'Pengalaman & Portofolio',
      status: hasExperience,
      detail: hasExperience
        ? `${totalExp + totalProjects + totalInternships} total pengalaman/proyek`
        : 'Tambahkan minimal 1 pengalaman kerja, magang, atau proyek',
    },
    {
      label: 'Skill Teknis & Softskill',
      status: hasSkills,
      detail: hasSkills
        ? `${totalSkills} keahlian dari ${cvs.length} CV`
        : `${totalSkills} keahlian (target minimal 4 skill relevan)`,
    },
    {
      label: 'Format CV ATS Friendly',
      status: isAtsOptimal,
      detail: isAtsOptimal
        ? `Rata-rata ATS ${avgAtsScore}/100 (Format lolos screening HR)`
        : `Rata-rata ATS ${avgAtsScore}/100 (Perlu pengayaan kata kunci)`,
    },
  ];

  const completedCount = checklist.filter((c) => c.status).length;
  const totalItems = checklist.length;

  // Formula standar: 60% Bobot Kelengkapan 5 Berkas + 40% Bobot Skor ATS
  const calculatedScore = Math.round(
    (completedCount / totalItems) * 60 + (avgAtsScore / 100) * 40
  );

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

  // 1. CV & ATS Pillar
  let cvPillar: PillarEvaluation;
  if (isCvArray) {
    const primary = cvs.find((c: any) => c.isPrimary) || cvs[0];
    const ats = primary.atsScore ?? 0;
    const cvScore = Math.min(100, Math.max(0, ats));

    const needsImprovements: string[] = [];
    if (!primary.summary || primary.summary.trim().length < 20) needsImprovements.push('ringkasan');
    if (!primary.skills || primary.skills.length < 4) needsImprovements.push('skill');
    if (!primary.experience || primary.experience.length === 0) needsImprovements.push('pengalaman');

    cvPillar = {
      id: 'cv',
      title: 'Kualitas CV & ATS Score',
      score: cvScore,
      status: getStatusFromScore(cvScore),
      desc:
        cvScore >= 80
          ? 'CV sudah menggunakan format standar ATS dengan kata kunci industri yang tepat.'
          : needsImprovements.length > 0
          ? `CV perlu perbaikan di bagian: ${needsImprovements.join(', ')}.`
          : 'CV perlu dioptimalkan untuk meningkatkan skor ATS.',
      recommendation:
        cvScore >= 85
          ? 'Tambahkan kuantifikasi hasil pencapaian di bagian pengalaman kerja.'
          : needsImprovements.length > 0
          ? `Lengkapi bagian ${needsImprovements[0]} untuk meningkatkan skor ATS.`
          : 'Optimalkan kata kunci di CV sesuai lowongan yang dituju.',
      actionTab: 'cv',
    };
  } else {
    cvPillar = {
      id: 'cv',
      title: 'Kualitas CV & ATS Score',
      score: 0,
      status: 'Belum Optimal',
      desc: 'Belum ada CV. Buat CV untuk memulai analisis.',
      recommendation: 'Buat CV pertamamu untuk mendapatkan skor ATS.',
      actionTab: 'cv',
    };
  }

  // 2. LinkedIn & Profil Pillar
  let linkedinPillar: PillarEvaluation;
  if (isCvArray) {
    const primary = cvs.find((c: any) => c.isPrimary) || cvs[0];
    let profileSections = 0;
    const totalProfileSections = 4;
    if (primary.summary && primary.summary.trim().length >= 20) profileSections++;
    if (primary.skills && primary.skills.length >= 3) profileSections++;
    if (primary.experience && primary.experience.length > 0) profileSections++;
    if (primary.projects && primary.projects.length > 0) profileSections++;

    const linkedinScore = Math.round((profileSections / totalProfileSections) * 100);
    linkedinPillar = {
      id: 'linkedin',
      title: 'Profil LinkedIn & Portofolio',
      score: linkedinScore,
      status: getStatusFromScore(linkedinScore),
      desc:
        linkedinScore >= 80
          ? 'Profil sudah lengkap dengan headline, pengalaman, dan portofolio.'
          : linkedinScore >= 50
          ? 'Profil memiliki informasi dasar, namun perlu dilengkapi.'
          : 'Profil masih perlu banyak perbaikan dan kelengkapan.',
      recommendation:
        !primary.projects || primary.projects.length === 0
          ? 'Tambahkan proyek portofolio untuk memperkuat profil.'
          : 'Perbarui headline dan deskripsi profil secara berkala.',
      actionTab: 'cv',
    };
  } else {
    linkedinPillar = {
      id: 'linkedin',
      title: 'Profil LinkedIn & Portofolio',
      score: 0,
      status: 'Belum Optimal',
      desc: 'Belum ada data profil. Buat CV terlebih dahulu.',
      recommendation: 'Lengkapi CV dan hubungkan dengan profil LinkedIn.',
      actionTab: 'cv',
    };
  }

  // 3. Interview Pillar
  let interviewPillar: PillarEvaluation;
  if (isAppsArray) {
    const interviewApps = apps.filter((a: any) =>
      ['Interview', 'Offering'].includes(a.status)
    ).length;
    const totalApps = apps.length;

    const interviewRate = totalApps > 0 ? (interviewApps / totalApps) * 100 : 0;
    const interviewScore = Math.min(
      100,
      Math.round(interviewRate * 3 + (interviewApps > 0 ? 50 : 0))
    );

    interviewPillar = {
      id: 'interview',
      title: 'Keterampilan Interview',
      score: interviewScore,
      status: getStatusFromScore(interviewScore),
      desc:
        interviewApps > 0
          ? `${interviewApps} dari ${totalApps} lamaran sudah masuk tahap interview/offering.`
          : 'Belum ada lamaran yang masuk tahap interview.',
      recommendation:
        interviewApps === 0
          ? 'Latih kemampuan interview dengan simulasi sistem.'
          : interviewScore < 70
          ? 'Tingkatkan persiapan interview untuk meningkatkan konversi.'
          : 'Pertahankan performa interview dan latih pertanyaan teknis.',
      actionTab: 'interview',
    };
  } else {
    interviewPillar = {
      id: 'interview',
      title: 'Keterampilan Interview',
      score: 0,
      status: 'Belum Optimal',
      desc: 'Belum ada data lamaran untuk mengukur keterampilan interview.',
      recommendation: 'Mulai melamar dan latih simulasi interview.',
      actionTab: 'interview',
    };
  }

  // 4. Activity & Networking Pillar
  let activityPillar: PillarEvaluation;
  if (isAppsArray) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentApps = apps.filter((a: any) => {
      const d = new Date(a.createdAt || a.appliedDate || 0);
      return d >= thirtyDaysAgo;
    }).length;

    const activityScore = Math.min(100, Math.round((recentApps / 12) * 100));

    activityPillar = {
      id: 'activity',
      title: 'Aktivitas Lamaran & Networking',
      score: activityScore,
      status: getStatusFromScore(activityScore),
      desc:
        recentApps >= 12
          ? `Sangat aktif: ${recentApps} lamaran dalam 30 hari terakhir.`
          : recentApps > 0
          ? `${recentApps} lamaran dalam 30 hari terakhir. Target: 12+.`
          : 'Belum ada lamaran dalam 30 hari terakhir.',
      recommendation:
        recentApps < 3
          ? 'Mulai melamar secara konsisten minimal 3 per minggu.'
          : recentApps < 12
          ? 'Tingkatkan frekuensi lamaran untuk peluang lebih besar.'
          : 'Pertahankan konsistensi dan manfaatkan fitur Referral.',
      actionTab: 'tracker',
    };
  } else {
    activityPillar = {
      id: 'activity',
      title: 'Aktivitas Lamaran & Networking',
      score: 0,
      status: 'Belum Optimal',
      desc: 'Belum ada data aktivitas lamaran.',
      recommendation: 'Mulai lacak lamaran kerjamu di Tracker.',
      actionTab: 'tracker',
    };
  }

  return [cvPillar, linkedinPillar, interviewPillar, activityPillar];
}
