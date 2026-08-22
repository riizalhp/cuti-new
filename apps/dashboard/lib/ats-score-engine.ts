import {
  ATSScoreState,
  ATSIssue,
  DynamicATSResult,
  ATS_ACTION_VERBS,
  TEMPLATE_PLACEHOLDERS,
} from './ats-score-types';

function isPlaceholderText(text?: string): boolean {
  if (!text || text.trim().length === 0) return true;
  const lower = text.toLowerCase().trim();
  return TEMPLATE_PLACEHOLDERS.some((p) => lower.includes(p));
}

export function isCVEmptyOrDefault(cv: any): boolean {
  if (!cv) return true;

  const fullName = cv.fullName || `${cv.firstName || ''} ${cv.lastName || ''}`.trim();
  const hasRealName = Boolean(fullName && fullName.length > 2 && !isPlaceholderText(fullName));
  const hasRealEmail = Boolean(cv.email && cv.email.includes('@') && !isPlaceholderText(cv.email));
  const hasRealPhone = Boolean(cv.phone && cv.phone.trim().length >= 8);

  const skills = Array.isArray(cv.skills)
    ? cv.skills.filter((s: any) => {
        const str = typeof s === 'string' ? s : s?.name || '';
        return Boolean(str && !isPlaceholderText(str));
      })
    : [];

  const experiences = Array.isArray(cv.experience)
    ? cv.experience.filter(
        (e: any) => !isPlaceholderText(e.company) && !isPlaceholderText(e.role || e.title)
      )
    : [];

  const education = Array.isArray(cv.education)
    ? cv.education.filter(
        (ed: any) => !isPlaceholderText(ed.institution || ed.school)
      )
    : [];

  const projects = Array.isArray(cv.projects)
    ? cv.projects.filter((p: any) => !isPlaceholderText(p.name || p.title))
    : [];

  const hasRealSummary = Boolean(
    cv.summary && cv.summary.trim().length >= 25 && !isPlaceholderText(cv.summary)
  );

  if (
    !hasRealName &&
    !hasRealEmail &&
    !hasRealSummary &&
    experiences.length === 0 &&
    education.length === 0 &&
    projects.length === 0 &&
    skills.length === 0
  ) {
    return true;
  }

  return false;
}

export function getAtsStateInfo(score: number, isEmpty = false): {
  state: ATSScoreState;
  stateLabel: string;
  stateDescription: string;
} {
  if (isEmpty || score === 0) {
    return {
      state: 'critical',
      stateLabel: 'Belum Diisi',
      stateDescription: 'Isi informasi CV untuk mulai menghitung skor ATS.',
    };
  }
  if (score >= 90) {
    return {
      state: 'excellent',
      stateLabel: 'Excellent',
      stateDescription: 'CV sangat terstruktur & highly optimized untuk parser ATS.',
    };
  }
  if (score >= 75) {
    return {
      state: 'good',
      stateLabel: 'Good',
      stateDescription: 'CV kuat dan mudah dibaca oleh sebagian besar sistem ATS.',
    };
  }
  if (score >= 60) {
    return {
      state: 'fair',
      stateLabel: 'Getting there',
      stateDescription: 'Struktur CV cukup baik, namun masih perlu beberapa penyempurnaan.',
    };
  }
  if (score >= 40) {
    return {
      state: 'weak',
      stateLabel: 'Needs improvement',
      stateDescription: 'Banyak bagian penting CV yang kurang terukur atau tidak terstruktur.',
    };
  }
  return {
    state: 'critical',
    stateLabel: 'Needs major improvement',
    stateDescription: 'Format dan isi CV berisiko tinggi gagal diparse oleh sistem ATS.',
  };
}

export function calculateDynamicAtsScore(cv: any): DynamicATSResult {
  const issues: ATSIssue[] = [];
  const penaltiesApplied: { category: string; amount: number; reason: string }[] = [];

  const isEmpty = isCVEmptyOrDefault(cv);

  if (!cv || isEmpty) {
    const stateInfo = getAtsStateInfo(0, true);
    return {
      totalScore: 0,
      state: stateInfo.state,
      stateLabel: stateInfo.stateLabel,
      stateDescription: stateInfo.stateDescription,
      potentialScore: 85,
      engines: {
        contentQuality: { score: 0, weight: 0.4, weightedScore: 0, issuesCount: 1 },
        atsReadability: { score: 0, weight: 0.25, weightedScore: 0, issuesCount: 1 },
        completeness: { score: 0, weight: 0.2, weightedScore: 0, issuesCount: 1 },
        contentIntegrity: { score: 0, weight: 0.15, weightedScore: 0, issuesCount: 1 },
      },
      issues: [
        {
          id: 'cv_empty',
          category: 'completeness',
          severity: 'critical',
          message: 'CV masih kosong atau menggunakan template default.',
          recommendation: 'Lengkapi nama, kontak, ringkasan, dan riwayat pengalaman kamu.',
          penalty: 100,
          potentialGain: 85,
        },
      ],
      penaltiesApplied: [],
      isEmptyOrDefault: true,
      calculatedAt: new Date().toISOString(),
    };
  }

  // --- ENGINE 1: CONTENT QUALITY (40% Weight) ---
  let cqPoints = 0;
  const maxCq = 40;

  // A. Experience Quality (10 pts)
  const experiences = Array.isArray(cv.experience) ? cv.experience : [];
  if (experiences.length >= 2) {
    cqPoints += 10;
  } else if (experiences.length === 1) {
    cqPoints += 6;
    issues.push({
      id: 'exp_single',
      category: 'contentQuality',
      severity: 'minor',
      section: 'experience',
      message: 'Hanya ada 1 riwayat pengalaman kerja.',
      recommendation: 'Tambahkan pengalaman kerja atau proyek lain untuk memperkuat rekam jejak.',
      penalty: 4,
      potentialGain: 4,
    });
  } else {
    issues.push({
      id: 'exp_missing',
      category: 'contentQuality',
      severity: 'critical',
      section: 'experience',
      message: 'Belum ada pengalaman kerja terisi.',
      recommendation: 'Tambahkan minimal 1-2 riwayat pengalaman kerja atau proyek utama.',
      penalty: 10,
      potentialGain: 10,
    });
  }

  // B. Achievement & Metrics Detection (8 pts)
  let metricMatchCount = 0;
  const metricRegex = /(\d+%\b|\$\d+|\bRp\s*\d+|\b\d+\s*(users|clients|customers|m|k|rb|juta|persen)\b|\b(increased|reduced|improved|grew|decreased)\s+by\s+\d+)/i;

  experiences.forEach((exp: any) => {
    const desc = exp.description || exp.bullets?.join(' ') || '';
    if (metricRegex.test(desc)) {
      metricMatchCount++;
    }
  });

  if (metricMatchCount >= 2) {
    cqPoints += 8;
  } else if (metricMatchCount === 1) {
    cqPoints += 4;
    issues.push({
      id: 'metric_few',
      category: 'contentQuality',
      severity: 'major',
      section: 'experience',
      message: 'Hasil kerja terukur (metrics) masih minim.',
      recommendation: 'Sertakan angka terukur (persentase, jumlah pengguna, efisiensi waktu) pada pengalaman lainnya.',
      penalty: 4,
      potentialGain: 4,
    });
  } else {
    issues.push({
      id: 'metric_missing',
      category: 'contentQuality',
      severity: 'major',
      section: 'experience',
      message: 'Tidak ditemukan angka pencapaian terukur.',
      recommendation: 'Tambahkan persentase %, angka nominal (Rp), atau skala dampak pada bullet deskripsi kerja.',
      penalty: 8,
      potentialGain: 8,
    });
  }

  // C. Action Verbs Usage (5 pts)
  let actionVerbCount = 0;
  experiences.forEach((exp: any) => {
    const text = (exp.description || exp.bullets?.join(' ') || '').toLowerCase();
    ATS_ACTION_VERBS.forEach((verb) => {
      if (text.includes(verb)) actionVerbCount++;
    });
  });

  if (actionVerbCount >= 3) {
    cqPoints += 5;
  } else if (actionVerbCount >= 1) {
    cqPoints += 3;
  } else {
    issues.push({
      id: 'action_verbs_missing',
      category: 'contentQuality',
      severity: 'minor',
      section: 'experience',
      message: 'Kurang menggunakan kata kerja aksi (Action Verbs).',
      recommendation: 'Awali setiap poin tugas dengan kata kerja kuat (contoh: Developed, Spearheaded, Optimized).',
      penalty: 2,
      potentialGain: 2,
    });
  }

  // D. Bullet Quality & Structure (7 pts)
  let detailedBulletsCount = 0;
  experiences.forEach((exp: any) => {
    const desc = exp.description || '';
    if (desc.trim().length > 60) detailedBulletsCount++;
  });
  if (detailedBulletsCount >= 2) {
    cqPoints += 7;
  } else if (detailedBulletsCount === 1) {
    cqPoints += 4;
  } else if (experiences.length > 0) {
    issues.push({
      id: 'bullet_too_short',
      category: 'contentQuality',
      severity: 'minor',
      section: 'experience',
      message: 'Deskripsi pengalaman kerja terlalu singkat.',
      recommendation: 'Tuliskan deskripsi minimal 2-3 kalimat terstruktur mengenai tugas dan dampak peranmu.',
      penalty: 3,
      potentialGain: 3,
    });
  }

  // E. Skills Quality (5 pts)
  const rawSkills = Array.isArray(cv.skills) ? cv.skills : [];
  const skillsList = rawSkills
    .map((s: any) => (typeof s === 'string' ? s.trim() : s?.name?.trim() || ''))
    .filter(Boolean);

  if (skillsList.length >= 8) {
    cqPoints += 5;
  } else if (skillsList.length >= 4) {
    cqPoints += 3;
    issues.push({
      id: 'skills_few',
      category: 'contentQuality',
      severity: 'minor',
      section: 'skills',
      message: 'Daftar skill masih tergolong minim (<8 skill).',
      recommendation: 'Tambahkan keahlian teknis (hard skills) dan tools profesional yang relevan.',
      penalty: 2,
      potentialGain: 2,
    });
  } else {
    issues.push({
      id: 'skills_missing',
      category: 'contentQuality',
      severity: 'major',
      section: 'skills',
      message: 'Sangat sedikit atau tidak ada skill spesifik terdaftar.',
      recommendation: 'Masukkan setidaknya 6-10 keahlian teknis dan metodologi kerja.',
      penalty: 5,
      potentialGain: 5,
    });
  }

  // F. Summary Quality (5 pts)
  const summaryText = (cv.summary || '').trim();
  if (summaryText.length >= 80) {
    cqPoints += 5;
  } else if (summaryText.length >= 35) {
    cqPoints += 3;
  } else {
    issues.push({
      id: 'summary_short',
      category: 'contentQuality',
      severity: 'minor',
      section: 'summary',
      message: 'Ringkasan profesional (Summary) terlalu pendek atau kosong.',
      recommendation: 'Tuliskan 2-4 kalimat ringkasan spesialisasi, latar belakang, dan keunggulan utamamu.',
      penalty: 3,
      potentialGain: 3,
    });
  }

  const contentQualityScore = Math.min(100, Math.round((cqPoints / maxCq) * 100));

  // --- ENGINE 2: ATS READABILITY (25% Weight) ---
  let arPoints = 0;
  const maxAr = 25;

  // A. Essential Section Presence (10 pts)
  let sectionCount = 0;
  if (summaryText.length > 0) sectionCount++;
  if (experiences.length > 0) sectionCount++;
  if (Array.isArray(cv.education) && cv.education.length > 0) sectionCount++;
  if (skillsList.length > 0) sectionCount++;

  if (sectionCount >= 4) {
    arPoints += 10;
  } else if (sectionCount >= 2) {
    arPoints += 6;
  }

  // B. Date Format Consistency (8 pts)
  let dateInconsistent = false;
  const datesList: string[] = [];
  experiences.forEach((exp: any) => {
    if (exp.startDate) datesList.push(exp.startDate);
    if (exp.endDate) datesList.push(exp.endDate);
  });

  const hasSlashDate = datesList.some((d) => /\d{1,2}\/\d{4}/.test(d));
  const hasMonthYearDate = datesList.some((d) => /[a-zA-Z]+\s+\d{4}/.test(d));
  if (hasSlashDate && hasMonthYearDate) {
    dateInconsistent = true;
    issues.push({
      id: 'date_inconsistent',
      category: 'atsReadability',
      severity: 'minor',
      section: 'experience',
      message: 'Format penulisan tanggal tidak konsisten.',
      recommendation: 'Gunakan satu standar format tanggal yang seragam (contoh: Jan 2023 - Des 2023).',
      penalty: 3,
      potentialGain: 3,
    });
  } else {
    arPoints += 8;
  }

  // C. Special Character / Non-standard Symbol Check (7 pts)
  const fullCvStr = JSON.stringify(cv);
  const containsUnsafeEmoji = /([✀-➿]|[-]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[‑-⛿]|\uD83E[\uDD10-\uDDFF])/g.test(fullCvStr);
  if (containsUnsafeEmoji) {
    issues.push({
      id: 'unsafe_emoji',
      category: 'atsReadability',
      severity: 'minor',
      message: 'Terdeteksi simbol khusus atau emoji yang berisiko membuat parser ATS error.',
      recommendation: 'Hapus emoji atau icon dekoratif di dalam teks CV agar parsing lancar.',
      penalty: 4,
      potentialGain: 4,
    });
    arPoints += 3;
  } else {
    arPoints += 7;
  }

  const atsReadabilityScore = Math.min(100, Math.round((arPoints / maxAr) * 100));

  // --- ENGINE 3: COMPLETENESS (20% Weight) ---
  let compPoints = 0;
  const maxComp = 20;

  const fullName = cv.fullName || `${cv.firstName || ''} ${cv.lastName || ''}`.trim();
  const email = cv.email || '';
  const phone = cv.phone || '';
  const location = cv.location || cv.city || '';
  const linkedin = cv.linkedin || cv.socials?.linkedin || '';

  if (fullName.length > 2) compPoints += 4;
  else {
    issues.push({
      id: 'name_missing',
      category: 'completeness',
      severity: 'critical',
      section: 'basics',
      message: 'Nama lengkap belum diisi.',
      recommendation: 'Isi nama lengkap di informasi dasar.',
      penalty: 4,
      potentialGain: 4,
    });
  }

  if (email.includes('@')) compPoints += 4;
  else {
    issues.push({
      id: 'email_missing',
      category: 'completeness',
      severity: 'critical',
      section: 'basics',
      message: 'Email tidak valid atau belum diisi.',
      recommendation: 'Masukkan email profesional aktif.',
      penalty: 4,
      potentialGain: 4,
    });
  }

  if (phone.length >= 8) compPoints += 3;
  else {
    issues.push({
      id: 'phone_missing',
      category: 'completeness',
      severity: 'major',
      section: 'basics',
      message: 'Nomor telepon / WhatsApp belum diisi.',
      recommendation: 'Tambahkan nomor kontak utama.',
      penalty: 3,
      potentialGain: 3,
    });
  }

  if (location.length >= 3) compPoints += 3;
  else {
    issues.push({
      id: 'location_missing',
      category: 'completeness',
      severity: 'minor',
      section: 'basics',
      message: 'Domisili kota/lokasi belum dicantumkan.',
      recommendation: 'Tambahkan domisili kota (misal: Jakarta South, Indonesia).',
      penalty: 2,
      potentialGain: 2,
    });
  }

  if (linkedin.length > 5) compPoints += 3;
  else {
    issues.push({
      id: 'linkedin_missing',
      category: 'completeness',
      severity: 'minor',
      section: 'basics',
      message: 'Tautan tautan LinkedIn belum dicantumkan.',
      recommendation: 'Tambahkan tautan profil LinkedIn aktif untuk meningkatkan kepercayaan recruiter.',
      penalty: 2,
      potentialGain: 2,
    });
  }

  const edList = Array.isArray(cv.education) ? cv.education : [];
  if (edList.length > 0) compPoints += 3;
  else {
    issues.push({
      id: 'education_missing',
      category: 'completeness',
      severity: 'major',
      section: 'education',
      message: 'Riwayat pendidikan belum diisi.',
      recommendation: 'Masukkan riwayat pendidikan perguruan tinggi atau sekolah menengah.',
      penalty: 3,
      potentialGain: 3,
    });
  }

  const completenessScore = Math.min(100, Math.round((compPoints / maxComp) * 100));

  // --- ENGINE 4: CONTENT INTEGRITY (15% Weight) ---
  let ciPoints = 15;
  const detectedPlaceholders: string[] = [];

  const stringifiedCv = JSON.stringify(cv).toLowerCase();
  TEMPLATE_PLACEHOLDERS.forEach((ph) => {
    if (stringifiedCv.includes(ph)) {
      detectedPlaceholders.push(ph);
    }
  });

  if (detectedPlaceholders.length > 0) {
    const phPenalty = Math.min(15, detectedPlaceholders.length * 5);
    ciPoints = Math.max(0, ciPoints - phPenalty);
    issues.push({
      id: 'placeholder_detected',
      category: 'contentIntegrity',
      severity: 'critical',
      message: `Terdeteksi teks template/placeholder leakage: "${detectedPlaceholders.slice(0, 3).join(', ')}"`,
      recommendation: 'Ganti atau hapus teks bawaan template dengan data diri serumit mungkin.',
      penalty: phPenalty,
      potentialGain: phPenalty,
    });
    penaltiesApplied.push({
      category: 'Content Integrity',
      amount: phPenalty,
      reason: 'Penggunaan teks template/placeholder leakage',
    });
  }

  // Anti-gaming Keyword Stuffing Check
  const skillOccurrences: Record<string, number> = {};
  skillsList.forEach((sk: string) => {
    const lowerSk = sk.toLowerCase();
    skillOccurrences[lowerSk] = (skillOccurrences[lowerSk] || 0) + 1;
  });

  const stuffedSkill = Object.keys(skillOccurrences).find((sk) => skillOccurrences[sk] >= 3);
  if (stuffedSkill) {
    ciPoints = Math.max(0, ciPoints - 5);
    issues.push({
      id: 'keyword_stuffing',
      category: 'contentIntegrity',
      severity: 'major',
      section: 'skills',
      message: `Terdeteksi penumpukan kata kunci (Keyword Stuffing) pada skill: "${stuffedSkill}".`,
      recommendation: 'Hindari mengulang-ulang kata kunci yang sama berulang kali di bagian skill.',
      penalty: 5,
      potentialGain: 5,
    });
  }

  const contentIntegrityScore = Math.min(100, Math.round((ciPoints / 15) * 100));

  // --- TOTAL SCORE CALCULATION (Weighted) ---
  const weightedScore = Math.round(
    contentQualityScore * 0.4 +
      atsReadabilityScore * 0.25 +
      completenessScore * 0.2 +
      contentIntegrityScore * 0.15
  );

  // Hard Cap Boundaries
  const totalScore = Math.min(100, Math.max(0, weightedScore));

  // Calculate Potential Score
  const potentialGainTotal = issues.reduce((acc, curr) => acc + curr.potentialGain, 0);
  const potentialScore = Math.min(100, totalScore + potentialGainTotal);

  const stateInfo = getAtsStateInfo(totalScore, false);

  return {
    totalScore,
    state: stateInfo.state,
    stateLabel: stateInfo.stateLabel,
    stateDescription: stateInfo.stateDescription,
    potentialScore,
    engines: {
      contentQuality: {
        score: contentQualityScore,
        weight: 0.4,
        weightedScore: Math.round(contentQualityScore * 0.4),
        issuesCount: issues.filter((i) => i.category === 'contentQuality').length,
      },
      atsReadability: {
        score: atsReadabilityScore,
        weight: 0.25,
        weightedScore: Math.round(atsReadabilityScore * 0.25),
        issuesCount: issues.filter((i) => i.category === 'atsReadability').length,
      },
      completeness: {
        score: completenessScore,
        weight: 0.2,
        weightedScore: Math.round(completenessScore * 0.2),
        issuesCount: issues.filter((i) => i.category === 'completeness').length,
      },
      contentIntegrity: {
        score: contentIntegrityScore,
        weight: 0.15,
        weightedScore: Math.round(contentIntegrityScore * 0.15),
        issuesCount: issues.filter((i) => i.category === 'contentIntegrity').length,
      },
    },
    issues,
    penaltiesApplied,
    isEmptyOrDefault: false,
    calculatedAt: new Date().toISOString(),
  };
}
