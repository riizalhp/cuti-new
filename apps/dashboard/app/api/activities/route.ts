import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@cuti/db';
import { getAuthUser } from '@/lib/server-auth';

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return 'Baru saja';
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Kemarin';
  if (diffDays < 7) return `${diffDays} hari lalu`;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function mapApplicationActivity(app: any) {
  const insight = (typeof app.ai_insight === 'object' && app.ai_insight !== null ? app.ai_insight : {}) as Record<string, any>;
  const displayStatus = insight.displayStatus || (app.status as string);
  const company = app.company_name || insight.company || 'Perusahaan';
  const position = app.position || 'Posisi';

  switch (displayStatus) {
    case 'Interview':
      return {
        type: 'interview',
        title: 'Interview dijadwalkan',
        description: `Undangan wawancara dari ${company} untuk posisi ${position}.`,
        company,
        position,
      };
    case 'Offering':
    case 'Diterima':
      return {
        type: 'offering',
        title: 'Offering letter diterima',
        description: `Penawaran kerja dari ${company} untuk posisi ${position} telah diterima.`,
        company,
        position,
      };
    case 'Ditolak':
      return {
        type: 'viewed',
        title: 'Lamaran tidak dilanjutkan',
        description: `Perusahaan ${company} menutup proses seleksi untuk posisi ${position}.`,
        company,
        position,
      };
    case 'Screening':
      return {
        type: 'viewed',
        title: 'Lamaran sedang direview HR',
        description: `Berkas lamaran ${position} di ${company} sedang dalam proses screening.`,
        company,
        position,
      };
    case 'Terkirim':
    default:
      return {
        type: 'applied',
        title: 'Lamaran terkirim',
        description: `Lamaran untuk posisi ${position} di ${company} berhasil dikirim.`,
        company,
        position,
      };
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10', 10) || 10, 50);

    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: true, data: [] });
    }

    const [apps, cvs] = await Promise.all([
      prisma.applications.findMany({
        where: { user_id: user.id },
        orderBy: { created_at: 'desc' },
        take: limit,
      }),
      prisma.cv_projects.findMany({
        where: { user_id: user.id, is_active: true },
        orderBy: { updated_at: 'desc' },
        take: 3,
      }),
    ]);

    const activities: any[] = [];

    // Application-driven activities
    for (const app of apps) {
      const base = mapApplicationActivity(app);
      activities.push({
        id: `app-${app.id}`,
        type: base.type,
        title: base.title,
        description: base.description,
        company: base.company,
        position: base.position,
        time: formatRelativeTime(app.created_at),
        createdAt: app.created_at.toISOString(),
      });
    }

    // CV update activities
    for (const cv of cvs) {
      activities.push({
        id: `cv-${cv.id}`,
        type: 'cv_updated',
        title: 'CV diperbarui',
        description: `Draf CV "${cv.title}" terakhir disunting.`,
        company: 'Employr CV Builder',
        position: cv.target_position || 'CV ATS',
        time: formatRelativeTime(cv.updated_at),
        createdAt: cv.updated_at.toISOString(),
      });
    }

    // Sort newest first and cap
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, data: activities.slice(0, limit) });
  } catch (error: any) {
    console.error('[GET /api/activities] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat aktivitas dari database.' },
      { status: 500 }
    );
  }
}
