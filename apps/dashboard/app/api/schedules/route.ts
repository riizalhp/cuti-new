import { NextRequest, NextResponse } from 'next/server';
import { prisma, ApplicationStatus } from '@cuti/db';
import { getAuthUser } from '@/lib/server-auth';

function formatDayLabel(targetDate: Date): { dayLabel: string; isToday: boolean } {
  const now = new Date();
  // Reset hours to compare calendar days
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { dayLabel: 'Hari ini', isToday: true };
  } else if (diffDays === 1) {
    return { dayLabel: 'Besok', isToday: false };
  } else if (diffDays > 1 && diffDays <= 7) {
    return { dayLabel: `${diffDays} hari lagi`, isToday: false };
  } else if (diffDays < 0) {
    return { dayLabel: 'Selesai', isToday: false };
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return { dayLabel: `${targetDate.getDate()} ${months[targetDate.getMonth()]}`, isToday: false };
}

function formatTimeLabel(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes} WIB`;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: true, data: [] });
    }

    // 1. Fetch explicit reminders from DB
    const dbReminders = await prisma.reminders.findMany({
      where: {
        user_id: user.id,
        is_done: false,
      },
      include: {
        applications: true,
      },
      orderBy: { remind_at: 'asc' },
      take: 5,
    });

    // 2. Fetch active applications (Interview, Offering, Screening)
    const activeApps = await prisma.applications.findMany({
      where: {
        user_id: user.id,
        status: { in: [ApplicationStatus.INTERVIEW, ApplicationStatus.OFFERING, ApplicationStatus.APPLIED] },
      },
      include: {
        application_notes: {
          orderBy: { created_at: 'desc' },
          take: 1,
        },
      },
      orderBy: { updated_at: 'desc' },
      take: 6,
    });

    const schedulesList: any[] = [];

    // Map explicit reminders
    for (const rem of dbReminders) {
      const { dayLabel, isToday } = formatDayLabel(rem.remind_at);
      schedulesList.push({
        id: rem.id,
        dayLabel,
        timeLabel: formatTimeLabel(rem.remind_at),
        title: rem.title || `Agenda ${rem.applications?.company_name || ''}`,
        type: rem.applications?.position || 'Pengingat Lamaran',
        badgeColor: 'bg-amber-50 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400 border-amber-200 dark:border-amber-800',
        iconType: 'video',
        href: '/interview',
        isToday,
        rawDate: rem.remind_at.getTime(),
      });
    }

    // Map dynamic application schedules if not already in reminders
    let dayOffset = 0;
    for (const app of activeApps) {
      const insight = (typeof app.ai_insight === 'object' && app.ai_insight !== null ? app.ai_insight : {}) as Record<string, any>;
      const displayStatus = insight.displayStatus || (app.status === ApplicationStatus.INTERVIEW ? 'Interview' : (app.status === ApplicationStatus.OFFERING ? 'Offering' : 'Screening'));

      if (displayStatus === 'Interview' || app.status === ApplicationStatus.INTERVIEW) {
        // Target: Today or soon
        const interviewDate = new Date();
        interviewDate.setHours(14, 0, 0, 0);

        const { dayLabel, isToday } = formatDayLabel(interviewDate);
        schedulesList.push({
          id: `sched-${app.id}-int`,
          dayLabel,
          timeLabel: '14:00 WIB',
          title: `Interview ${app.company_name}`,
          type: `${app.position} (Interview User)`,
          badgeColor: 'bg-amber-50 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400 border-amber-200 dark:border-amber-800',
          iconType: 'video',
          href: '/interview',
          isToday,
          rawDate: interviewDate.getTime(),
        });
      } else if (displayStatus === 'Offering' || app.status === ApplicationStatus.OFFERING) {
        const offeringDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        offeringDate.setHours(23, 59, 0, 0);

        const { dayLabel, isToday } = formatDayLabel(offeringDate);
        schedulesList.push({
          id: `sched-${app.id}-off`,
          dayLabel,
          timeLabel: '23:59 WIB',
          title: `Konfirmasi Offering ${app.company_name}`,
          type: `Batas Penerimaan Tawaran`,
          badgeColor: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
          iconType: 'alert',
          href: '/tracker',
          isToday,
          rawDate: offeringDate.getTime(),
        });
      } else if (displayStatus === 'Screening') {
        const screeningDate = new Date(Date.now() + (dayOffset === 0 ? 1 : 4) * 24 * 60 * 60 * 1000);
        screeningDate.setHours(10, 0, 0, 0);

        const { dayLabel, isToday } = formatDayLabel(screeningDate);
        schedulesList.push({
          id: `sched-${app.id}-scr`,
          dayLabel,
          timeLabel: '10:00 WIB',
          title: `Follow-up HR ${app.company_name}`,
          type: `Status Screening & Review CV`,
          badgeColor: 'bg-blue-50 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400 border-blue-200 dark:border-navy-800',
          iconType: 'mail',
          href: '/tracker',
          isToday,
          rawDate: screeningDate.getTime(),
        });
        dayOffset++;
      }
    }

    // Sort chronologically and take at most 4 items
    schedulesList.sort((a, b) => a.rawDate - b.rawDate);
    const finalSchedules = schedulesList.slice(0, 4);

    return NextResponse.json({ success: true, data: finalSchedules });
  } catch (error: any) {
    console.error('[GET /api/schedules] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat agenda jadwal dari database.' },
      { status: 500 }
    );
  }
}
