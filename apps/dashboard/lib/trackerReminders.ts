'use client';

export type ReminderCategory =
  | 'lamaran'
  | 'follow_up'
  | 'follow_up_kedua'
  | 'deadline_apply'
  | 'interview'
  | 'post_interview'
  | 'assessment'
  | 'task'
  | 'offer'
  | 'activity';

export type ReminderUrgency = 'critical' | 'high' | 'medium' | 'info';

export interface TrackerReminder {
  id: string;
  appId?: string;
  company: string;
  position: string;
  category: ReminderCategory;
  urgency: ReminderUrgency;
  title: string;
  message: string;
  daysDiff?: number;
  dueLabel?: string;
  actionText?: string;
  actionType?: 'copy_template' | 'open_url' | 'update_status' | 'view_app';
  templateType?: 'follow_up_apply' | 'follow_up_final' | 'thank_you_interview' | 'follow_up_interview' | 'inquiry_offer';
  portalUrl?: string;
}

export interface ApplicationWithReminders {
  id: string;
  company: string;
  position: string;
  location: string;
  appliedDate: string;
  status: 'Terkirim' | 'Screening' | 'Interview' | 'Offering' | 'Ditolak';
  salary: string;
  notes: string;
  portal: string;
  portalUrl?: string;
  interviewDate?: string;
  interviewTime?: string;
  interviewTimezone?: 'WIB' | 'WITA' | 'WIT';
  interviewChecklist?: string[];
  ignoreInterviewReminder?: boolean;
  deadlineDate?: string;
  offerDeadline?: string;
  hasAssessment?: boolean;
  assessmentDeadline?: string;
  hasTask?: boolean;
  interviewNotes?: string;
  interviewResult?: 'waiting' | 'passed_next_round' | 'offering' | 'rejected';
  [key: string]: any;
}

/**
 * Cek apakah aplikasi telah diabaikan pengingat interview-nya via localStorage
 */
export const isAppInterviewIgnored = (appId: string): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem('employr_ignored_interview_reminders') || localStorage.getItem('cuti_ignored_interview_reminders');
    if (!raw) return false;
    const list: string[] = JSON.parse(raw);
    return Array.isArray(list) && list.includes(appId);
  } catch {
    return false;
  }
};

/**
 * Parser tanggal Indonesia / ISO ke Date object murni
 */
export const parseIndonesianDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  const str = dateStr.trim().toLowerCase();
  const now = new Date();

  if (str === 'hari ini') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  if (str === 'kemarin') {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    d.setDate(d.getDate() - 1);
    return d;
  }

  // Format ISO YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const parts = str.split('T')[0].split('-');
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  }

  // Format DD MMMM YYYY (misal: "10 September 2026")
  const parts = str.split(/\s+/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const year = parseInt(parts[2], 10);
    const months = [
      'januari', 'februari', 'maret', 'april', 'mei', 'juni',
      'juli', 'agustus', 'september', 'oktober', 'november', 'desember'
    ];
    const monthIdx = months.findIndex((m) => m === parts[1]);
    if (!isNaN(day) && !isNaN(year) && monthIdx >= 0) {
      return new Date(year, monthIdx, day);
    }
  }

  return null;
};

/**
 * Hitung selisih hari antara 2 tanggal (target - reference)
 */
export const getDayDiff = (target: Date, base: Date = new Date()): number => {
  const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const baseMidnight = new Date(base.getFullYear(), base.getMonth(), base.getDate()).getTime();
  return Math.round((targetMidnight - baseMidnight) / (1000 * 60 * 60 * 24));
};

/**
 * Generator Template Email / Pesan Sopan untuk Pelamar Kerja
 */
export const getReminderTemplateText = (
  templateType: 'follow_up_apply' | 'follow_up_final' | 'thank_you_interview' | 'follow_up_interview' | 'inquiry_offer',
  company: string,
  position: string,
  candidateName: string = 'Saya'
): string => {
  switch (templateType) {
    case 'follow_up_apply':
      return `Selamat pagi/siang Tim HRD ${company},

Perkenalkan saya ${candidateName}, yang beberapa waktu lalu telah mengirimkan berkas lamaran untuk posisi ${position}.

Saya ingin menanyakan perihal perkembangan proses rekrutmen tersebut, sekaligus menegaskan kembali antusiasme saya untuk dapat berkontribusi bersama ${company}. Apabila terdapat dokumen tambahan atau informasi lain yang dibutuhkan, saya dengan senang hati akan menyediakannya.

Terima kasih banyak atas perhatian dan waktu Bapak/Ibu.

Salam hangat,
${candidateName}`;

    case 'follow_up_final':
      return `Selamat pagi/siang Tim Rekrutmen ${company},

Semoga pesan ini menjumpai Bapak/Ibu dalam keadaan sehat. Saya ${candidateName}, pelamar untuk posisi ${position}.

Mengingat batas waktu peninjauan awal telah lewat, saya bermaksud mengonfirmasi status kelanjutan proses seleksi ini. Jika saat ini posisi tersebut telah terisi oleh kandidat lain, saya sangat memahami dan berterima kasih atas kesempatan yang telah diberikan.

Terima kasih atas keramahan dan profesionalisme tim ${company}.

Hormat saya,
${candidateName}`;

    case 'thank_you_interview':
      return `Selamat pagi/siang Bapak/Ibu Interviewer di ${company},

Terima kasih banyak atas kesempatan wawancara posisi ${position} yang telah kita laksanakan kemarin. Diskusi mengenai tantangan peran ini semakin membuat saya bersemangat untuk dapat bergabung dan memberikan kontribusi terbaik di ${company}.

Semoga hasilnya memuaskan dan saya menantikan kabar baik perihal tahapan selanjutnya.

Salam hormat,
${candidateName}`;

    case 'follow_up_interview':
      return `Selamat pagi/siang Tim HRD ${company},

Saya ${candidateName}, peserta wawancara untuk posisi ${position} beberapa hari yang lalu.

Saya ingin mengonfirmasi tindak lanjut dari sesi wawancara tersebut, mengingat komitmen saya yang sangat tinggi terhadap posisi ini. Apabila ada hal lain yang perlu dipersiapkan untuk tahapan berikutnya, mohon berkenan menginformasikannya kepada saya.

Terima kasih banyak atas waktu dan kesempatan yang diberikan.

Hormat saya,
${candidateName}`;

    case 'inquiry_offer':
      return `Selamat pagi/siang Tim HRD ${company},

Terima kasih sebesar-besarnya atas penawaran kerja (Offering Letter) untuk posisi ${position} di ${company}. Saya sangat bersyukur dan mengapresiasi kepercayaan yang diberikan.

Saat ini saya sedang meninjau rincian dokumen kontrak dengan seksama. Saya akan segera menyampaikan keputusan final sebelum batas waktu yang ditentukan.

Terima kasih atas dukungan dan koordinasi yang baik dari tim ${company}.

Salam hormat,
${candidateName}`;

    default:
      return '';
  }
};

/**
 * Mesin kalkulasi rule-based reminder
 */
export const calculateApplicationReminders = (
  apps: ApplicationWithReminders[],
  now: Date = new Date()
): TrackerReminder[] => {
  const reminders: TrackerReminder[] = [];

  // Rule 0: No activity reminder (Jika user tidak melamar dalam 7 hari terakhir)
  if (apps.length === 0) {
    reminders.push({
      id: 'rem-no-apps',
      company: 'Karier Impian',
      position: 'Pencarian Kerja',
      category: 'activity',
      urgency: 'info',
      title: 'Mulai Melamar Pekerjaan',
      message: 'Belum ada lamaran yang dicatat di Tracker. Yuk mulai tambah lamaran pertama kamu!',
      actionText: 'Tambah Lamaran',
      actionType: 'view_app',
    });
  } else {
    // Cari lamaran terbaru
    let latestApplyDate: Date | null = null;
    apps.forEach((a) => {
      const d = parseIndonesianDate(a.appliedDate);
      if (d && (!latestApplyDate || d > latestApplyDate)) {
        latestApplyDate = d;
      }
    });

    if (latestApplyDate) {
      const daysSinceLatest = Math.abs(getDayDiff(latestApplyDate, now));
      if (daysSinceLatest >= 7) {
        reminders.push({
          id: 'rem-no-recent-activity',
          company: 'Employr Tracker',
          position: 'Aktivitas Mingguan',
          category: 'activity',
          urgency: 'info',
          title: 'Yuk Lanjutkan Pencarian Kerja',
          message: `Sudah ${daysSinceLatest} hari kamu belum melamar. Yuk konsisten kirim lamaran baru untuk perbesar peluang lolos!`,
          actionText: 'Cari Lowongan',
          actionType: 'open_url',
          portalUrl: '/match-cv',
        });
      }
    }
  }

  // Loop per lamaran
  apps.forEach((app) => {
    const appliedDateObj = parseIndonesianDate(app.appliedDate);
    const daysSinceApplied = appliedDateObj ? Math.abs(getDayDiff(appliedDateObj, now)) : 0;

    // 1. Kategori Lamaran & Follow-up (Kolom 'Terkirim' & 'Screening')
    if (app.status === 'Terkirim' || app.status === 'Screening') {
      // H+3: Belum ada update dari perusahaan
      if (daysSinceApplied === 3 || daysSinceApplied === 4) {
        reminders.push({
          id: `rem-h3-${app.id}`,
          appId: app.id,
          company: app.company,
          position: app.position,
          category: 'lamaran',
          urgency: 'medium',
          title: `Update Lamaran ${app.company}`,
          message: `Sudah ${daysSinceApplied} hari sejak kamu melamar. Belum ada update dari perusahaan.`,
          daysDiff: daysSinceApplied,
          dueLabel: `${daysSinceApplied} Hari Lalu`,
          actionText: app.portalUrl ? 'Cek Status Portal' : 'Lihat Detail',
          actionType: app.portalUrl ? 'open_url' : 'view_app',
          portalUrl: app.portalUrl,
        });
      }

      // H+5 atau H+7: Saatnya follow-up
      if (daysSinceApplied >= 5 && daysSinceApplied < 10) {
        reminders.push({
          id: `rem-h5-${app.id}`,
          appId: app.id,
          company: app.company,
          position: app.position,
          category: 'follow_up',
          urgency: 'high',
          title: `Saatnya Follow-up di ${app.company}`,
          message: `Sudah ${daysSinceApplied} hari sejak apply. Kirimkan pesan follow-up singkat ke HRD untuk memastikan berkasmu terbaca.`,
          daysDiff: daysSinceApplied,
          dueLabel: `H+${daysSinceApplied} Melamar`,
          actionText: 'Salin Template Email',
          actionType: 'copy_template',
          templateType: 'follow_up_apply',
          portalUrl: app.portalUrl,
        });
      }

      // H+10 / H+14: Follow-up kedua / evaluasi
      if (daysSinceApplied >= 10) {
        reminders.push({
          id: `rem-h10-${app.id}`,
          appId: app.id,
          company: app.company,
          position: app.position,
          category: 'follow_up_kedua',
          urgency: 'info',
          title: `Evaluasi Lamaran ${app.company}`,
          message: `Belum ada respons setelah ${daysSinceApplied} hari. Pertimbangkan follow-up terakhir atau lanjutkan energi ke lowongan lain.`,
          daysDiff: daysSinceApplied,
          dueLabel: `H+${daysSinceApplied} Tanpa Kabar`,
          actionText: 'Salin Pesan Terakhir',
          actionType: 'copy_template',
          templateType: 'follow_up_final',
          portalUrl: app.portalUrl,
        });
      }
    }

    // 2. Kategori Interview (Kolom 'Interview')
    if (app.status === 'Interview') {
      // Abaikan jika user secara eksplisit memilih lewati/abaikan pengingat lowongan ini
      if (app.ignoreInterviewReminder || isAppInterviewIgnored(app.id)) {
        return;
      }

      const interviewDateObj = app.interviewDate ? parseIndonesianDate(app.interviewDate) : null;
      const tz = app.interviewTimezone || 'WIB';
      const timeStr = app.interviewTime ? ` pukul ${app.interviewTime} ${tz}` : '';

      if (interviewDateObj) {
        const daysToInterview = getDayDiff(interviewDateObj, now);

        // H-3 Interview
        if (daysToInterview === 3) {
          reminders.push({
            id: `rem-int-h3-${app.id}`,
            appId: app.id,
            company: app.company,
            position: app.position,
            category: 'interview',
            urgency: 'info',
            title: `Interview 3 Hari Lagi`,
            message: `Interview kamu 3 hari lagi di ${app.company}${timeStr}. Sudah siap materi & portofolio?`,
            dueLabel: 'H-3 Jadwal',
            actionText: 'Siapkan Jawaban',
            actionType: 'view_app',
          });
        }

        // H-1 Interview (Besok)
        if (daysToInterview === 1) {
          reminders.push({
            id: `rem-int-h1-${app.id}`,
            appId: app.id,
            company: app.company,
            position: app.position,
            category: 'interview',
            urgency: 'high',
            title: `Besok Kamu Punya Interview!`,
            message: `Besok kamu punya jadwal interview dengan ${app.company}${timeStr}. Cek kembali link meeting, outfit, dan koneksi internet.`,
            dueLabel: 'Besok',
            actionText: 'Cek Detail Jadwal',
            actionType: 'view_app',
          });
        }

        // H-0 Hari Ini
        if (daysToInterview === 0) {
          reminders.push({
            id: `rem-int-today-${app.id}`,
            appId: app.id,
            company: app.company,
            position: app.position,
            category: 'interview',
            urgency: 'critical',
            title: `Interview Hari Ini!`,
            message: `Jadwal interview dengan ${app.company} berlangsung hari ini${timeStr}. Masuk ke ruang tunggu 10-15 menit lebih awal.`,
            dueLabel: 'Hari Ini',
            actionText: 'Buka Ruang Meeting',
            actionType: 'open_url',
            portalUrl: app.portalUrl,
          });
        }

        // Post-Interview Reminders (hanya jika belum ada hasil final Offering/Ditolak)
        const hasFinalResult = app.interviewResult === 'offering' || app.interviewResult === 'rejected' || app.interviewResult === 'passed_next_round';
        if (!hasFinalResult && daysToInterview < 0) {
          const daysAgo = Math.abs(daysToInterview);

          // H+3 s/d H+7: Follow-up pertama ke Recruiter
          if (daysAgo >= 3 && daysAgo <= 7) {
            reminders.push({
              id: `rem-postint-h3-${app.id}`,
              appId: app.id,
              company: app.company,
              position: app.position,
              category: 'post_interview',
              urgency: 'high',
              title: `Follow-up Hasil Interview`,
              message: `Sudah ${daysAgo} hari setelah interview di ${app.company}. Jika belum ada kabar, saatnya kirim follow-up sopan ke recruiter.`,
              dueLabel: `H+${daysAgo} Pasca Interview`,
              actionText: 'Salin Template Follow-up',
              actionType: 'copy_template',
              templateType: 'follow_up_interview',
            });
          }
          // H+14 s/d H+21: Follow-up ke-2 atau Cek Status (proses HR butuh waktu 2-3 minggu)
          else if (daysAgo >= 14 && daysAgo <= 21) {
            reminders.push({
              id: `rem-postint-h14-${app.id}`,
              appId: app.id,
              company: app.company,
              position: app.position,
              category: 'post_interview',
              urgency: 'medium',
              title: `Belum Ada Kabar dari ${app.company}?`,
              message: `Sudah ${Math.floor(daysAgo / 7)} minggu sejak sesi wawancara. Kamu bisa menanyakan kelanjutan proses atau mencatat evaluasi wawancara.`,
              dueLabel: `H+${daysAgo} Pasca Interview`,
              actionText: 'Salin Template Follow-up',
              actionType: 'copy_template',
              templateType: 'follow_up_interview',
            });
          }
          // H > 21: Reminder berkala santai
          else if (daysAgo > 21) {
            reminders.push({
              id: `rem-postint-h21-${app.id}`,
              appId: app.id,
              company: app.company,
              position: app.position,
              category: 'post_interview',
              urgency: 'info',
              title: `Tinjau Status Interview ${app.company}`,
              message: `Sudah lebih dari 3 minggu sejak interview di ${app.company}. Perbarui status hasil wawancara atau catat evaluasi diri.`,
              dueLabel: `H+${daysAgo} Pasca Interview`,
              actionText: 'Perbarui Status',
              actionType: 'view_app',
            });
          }
        }
      } else {
        // Fallback jika belum input tanggal spesifik interview
        reminders.push({
          id: `rem-int-notset-${app.id}`,
          appId: app.id,
          company: app.company,
          position: app.position,
          category: 'interview',
          urgency: 'medium',
          title: `Atur Jadwal Interview ${app.company}`,
          message: `Kamu sudah berada di tahap Interview! Catat tanggal dan jam wawancara agar tidak terlewat.`,
          dueLabel: 'Jadwal Pending',
          actionText: 'Isi Jadwal',
          actionType: 'view_app',
        });
      }
    }

    // 3. Kategori Offering (Kolom 'Offering')
    if (app.status === 'Offering') {
      const offerDeadlineObj = app.offerDeadline ? parseIndonesianDate(app.offerDeadline) : null;

      if (offerDeadlineObj) {
        const daysToDeadline = getDayDiff(offerDeadlineObj, now);

        if (daysToDeadline === 1) {
          reminders.push({
            id: `rem-offer-h1-${app.id}`,
            appId: app.id,
            company: app.company,
            position: app.position,
            category: 'offer',
            urgency: 'critical',
            title: `Batas Terakhir Offer Besok!`,
            message: `Besok adalah batas terakhir menerima penawaran kerja dari ${app.company}. Jangan sampai hangus!`,
            dueLabel: 'Besok Deadline',
            actionText: 'Konfirmasi Penawaran',
            actionType: 'view_app',
          });
        } else if (daysToDeadline > 1) {
          reminders.push({
            id: `rem-offer-pending-${app.id}`,
            appId: app.id,
            company: app.company,
            position: app.position,
            category: 'offer',
            urgency: 'high',
            title: `Offer Kerja Belum Direspons`,
            message: `Kamu memiliki penawaran kerja dari ${app.company} yang belum direspons (${daysToDeadline} hari tersisa).`,
            dueLabel: `${daysToDeadline} Hari Lagi`,
            actionText: 'Review Kontrak',
            actionType: 'copy_template',
            templateType: 'inquiry_offer',
          });
        }
      } else {
        // Default jika tidak ada tanggal batas: ingatkan setelah 2 hari
        reminders.push({
          id: `rem-offer-general-${app.id}`,
          appId: app.id,
          company: app.company,
          position: app.position,
          category: 'offer',
          urgency: 'high',
          title: `Selamat! Ada Offering Letter`,
          message: `Offer kerja kamu dari ${app.company} belum direspons. Pastikan dipelajari dengan teliti sebelum tanda tangan.`,
          dueLabel: 'Perlu Keputusan',
          actionText: 'Cek Penawaran',
          actionType: 'view_app',
        });
      }
    }

    // 4. Kategori Deadline Apply & Assessment & Task
    if (app.deadlineDate) {
      const deadlineObj = parseIndonesianDate(app.deadlineDate);
      if (deadlineObj) {
        const daysLeft = getDayDiff(deadlineObj, now);
        if (daysLeft === 0) {
          reminders.push({
            id: `rem-dl-today-${app.id}`,
            appId: app.id,
            company: app.company,
            position: app.position,
            category: 'deadline_apply',
            urgency: 'critical',
            title: `Lowongan Ditutup Hari Ini!`,
            message: `Lamaran untuk posisi ${app.position} di ${app.company} akan ditutup hari ini. Segera submit!`,
            dueLabel: 'Hari Ini',
            actionText: 'Lamar Sekarang',
            actionType: 'open_url',
            portalUrl: app.portalUrl,
          });
        } else if (daysLeft >= 1 && daysLeft <= 3) {
          reminders.push({
            id: `rem-dl-soon-${app.id}`,
            appId: app.id,
            company: app.company,
            position: app.position,
            category: 'deadline_apply',
            urgency: 'high',
            title: `Deadline Lamaran Tinggal ${daysLeft} Hari`,
            message: `Batas waktu pengiriman berkas di ${app.company} tinggal ${daysLeft} hari lagi.`,
            dueLabel: `${daysLeft} Hari Lagi`,
            actionText: 'Lamar Sekarang',
            actionType: 'open_url',
            portalUrl: app.portalUrl,
          });
        }
      }
    }

    // 5. Task dari Recruiter / Assessment
    if (app.hasTask || (app.notes && /task|tugas|take[- ]home|studi kasus/i.test(app.notes))) {
      reminders.push({
        id: `rem-task-${app.id}`,
        appId: app.id,
        company: app.company,
        position: app.position,
        category: 'task',
        urgency: 'high',
        title: `Task dari Recruiter ${app.company}`,
        message: `Kamu masih punya task/penugasan dari recruiter ${app.company} yang belum diselesaikan.`,
        dueLabel: 'Task Aktif',
        actionText: 'Lihat Catatan Task',
        actionType: 'view_app',
      });
    }
  });

  // Urutkan berdasarkan urgency: critical > high > medium > info
  const urgencyWeight: Record<ReminderUrgency, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    info: 1,
  };

  return reminders.sort((a, b) => urgencyWeight[b.urgency] - urgencyWeight[a.urgency]);
};
