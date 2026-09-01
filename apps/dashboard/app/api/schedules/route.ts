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
      take: 6,
    });

    const schedulesList: any[] = [];

    // Map explicit reminders from user
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
