/**
 * AI Career Suggestions Generator
 * Generates personalized suggestions based on user's profile analysis
 */

export interface AISuggestion {
  title: string;
  desc: string;
  action: string;
  icon: 'PlusCircle' | 'UserCheck' | 'Clock' | 'Sparkles' | 'Target';
}

export interface UserProfile {
  cvs?: Array<{
    skills?: Array<{ name: string }>;
    experience?: Array<any>;
    projects?: Array<any>;
    internships?: Array<any>;
    education?: Array<any>;
    summary?: string;
    atsScore?: number;
  }>;
  applications?: Array<{
    status: string;
    appliedDate?: string;
    createdAt?: string;
  }>;
}

/**
 * Generate dynamic suggestions based on user profile analysis
 */
export function generateAISuggestions(profile: UserProfile): AISuggestion[] {
  const suggestions: AISuggestion[] = [];

  if (!profile.cvs || profile.cvs.length === 0) {
    suggestions.push({
      title: 'Buat CV ATS Friendly Pertamamu',
      desc: 'CV yang dioptimalkan ATS meningkatkan peluang lolos screening HR hingga 70%.',
      action: 'Buat CV',
      icon: 'PlusCircle',
    });
    return suggestions;
  }

  // Aggregate data from all CVs
  const totalSkills = profile.cvs.reduce((sum, cv) => sum + (cv.skills?.length || 0), 0);
  const totalExperience = profile.cvs.reduce((sum, cv) =>
    sum + (cv.experience?.length || 0) + (cv.projects?.length || 0) + (cv.internships?.length || 0), 0
  );
  const totalEducation = profile.cvs.reduce((sum, cv) => sum + (cv.education?.length || 0), 0);
  const avgAtsScore = profile.cvs.reduce((sum, cv) => sum + (cv.atsScore || 0), 0) / profile.cvs.length;
  const hasSummary = profile.cvs.some(cv => cv.summary && cv.summary.trim().length >= 20);

  // 1. Skills Suggestion
  if (totalSkills < 4) {
    suggestions.push({
      title: 'Tambahkan Skill Teknis & Softskill',
      desc: `Kamu baru punya ${totalSkills} skill. Target minimal 6-8 skill relevan untuk meningkatkan daya saing.`,
      action: 'Tambah Skill',
      icon: 'PlusCircle',
    });
  } else if (totalSkills < 8) {
    suggestions.push({
      title: 'Lengkapi Portfolio Skill',
      desc: '70% lowongan IT membutuhkan kombinasi technical & soft skills. Tambahkan 2-3 skill lagi.',
      action: 'Tambah Skill',
      icon: 'PlusCircle',
    });
  }

  // 2. Experience/Project Suggestion
  if (totalExperience === 0) {
    suggestions.push({
      title: 'Lengkapi Pengalaman atau Project',
      desc: 'Tambahkan minimal 1 pengalaman kerja, magang, atau project portfolio untuk memperkuat profil.',
      action: 'Tambah Pengalaman',
      icon: 'UserCheck',
    });
  } else if (totalExperience < 3) {
    suggestions.push({
      title: 'Perkaya Riwayat Pengalaman',
      desc: 'Sebutkan hasil kuantitatif (contoh: meningkatkan performa 30%, mengelola 50+ klien).',
      action: 'Lengkapi Now',
      icon: 'UserCheck',
    });
  }

  // 3. ATS Score Suggestion
  if (avgAtsScore < 70) {
    suggestions.push({
      title: 'Optimalkan ATS Score CV',
      desc: `Skor ATS saat ini ${Math.round(avgAtsScore)}/100. Tambahkan kata kunci relevan dari job description.`,
      action: 'Tingkatkan Score',
      icon: 'Sparkles',
    });
  } else if (avgAtsScore < 85) {
    suggestions.push({
      title: 'Maksimalkan Format ATS',
      desc: `Skor ATS ${Math.round(avgAtsScore)}/100 sudah baik. Tingkatkan ke 85+ untuk hasil optimal.`,
      action: 'Optimalkan',
      icon: 'Sparkles',
    });
  }

  // 4. Summary Suggestion
  if (!hasSummary) {
    suggestions.push({
      title: 'Tulis Ringkasan Profesional',
      desc: 'CV dengan ringkasan profil yang kuat meningkatkan engagement HR hingga 40%.',
      action: 'Tulis Ringkasan',
      icon: 'UserCheck',
    });
  }

  // 5. Optimal Apply Time (based on application patterns)
  if (profile.applications && profile.applications.length > 3) {
    const applyTimes = profile.applications
      .filter(app => app.createdAt || app.appliedDate)
      .map(app => new Date(app.createdAt || app.appliedDate!));

    const successfulApps = profile.applications.filter(app =>
      ['Interview', 'Offering', 'INTERVIEW', 'OFFERING', 'Screening'].includes(app.status)
    );

    if (successfulApps.length > 0) {
      // Analyze most successful apply days/times
      const dayStats: Record<number, number> = {};
      successfulApps.forEach(app => {
        if (app.createdAt || app.appliedDate) {
          const day = new Date(app.createdAt || app.appliedDate!).getDay();
          dayStats[day] = (dayStats[day] || 0) + 1;
        }
      });

      const bestDay = Object.entries(dayStats).sort((a, b) => b[1] - a[1])[0];
      const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

      if (bestDay) {
        suggestions.push({
          title: `Waktu Terbaik Melamar: ${dayNames[parseInt(bestDay[0])]} Pagi`,
          desc: `Berdasarkan histori kamu, lamaran di hari ${dayNames[parseInt(bestDay[0])]} punya rasio callback tertinggi.`,
          action: 'Set Reminder',
          icon: 'Clock',
        });
      }
    } else {
      // Default suggestion for new users
      suggestions.push({
        title: 'Waktu Terbaik Melamar: Selasa Jam 09:00',
        desc: 'Rasio tanggapan HR meningkat pesat di awal minggu jam kerja pagi.',
        action: 'Set Reminder',
        icon: 'Clock',
      });
    }
  } else {
    // Default for users with few applications
    suggestions.push({
      title: 'Mulai Kirim Lamaran Secara Konsisten',
      desc: 'Target minimal 5-10 lamaran per minggu untuk meningkatkan peluang panggilan interview.',
      action: 'Cari Lowongan',
      icon: 'Target',
    });
  }

  // Return top 3 most relevant suggestions
  return suggestions.slice(0, 3);
}

/**
 * Get contextual action URL based on suggestion type
 */
export function getSuggestionActionUrl(suggestion: AISuggestion): string {
  if (suggestion.title.toLowerCase().includes('cv') || suggestion.title.toLowerCase().includes('skill')) {
    return '/cv';
  }
  if (suggestion.title.toLowerCase().includes('pengalaman') || suggestion.title.toLowerCase().includes('project')) {
    return '/cv';
  }
  if (suggestion.title.toLowerCase().includes('lowongan')) {
    return '/scrape-jobs';
  }
  if (suggestion.title.toLowerCase().includes('ats') || suggestion.title.toLowerCase().includes('score')) {
    return '/cv';
  }
  if (suggestion.title.toLowerCase().includes('lamaran')) {
    return '/tracker';
  }
  return '/cv';
}
