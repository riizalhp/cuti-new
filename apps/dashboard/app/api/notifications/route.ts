import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@employr/db';
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
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Auto-cleanup background: bersihkan notifikasi yang sudah dibaca > 14 hari atau basi > 30 hari
    const cutoffRead = new Date();
    cutoffRead.setDate(cutoffRead.getDate() - 14);
    const cutoffStale = new Date();
    cutoffStale.setDate(cutoffStale.getDate() - 30);

    prisma.notifications.deleteMany({
      where: {
        user_id: user.id,
        OR: [
          { read_at: { not: null }, created_at: { lt: cutoffRead } },
          { created_at: { lt: cutoffStale } },
        ],
      },
    }).catch(() => {});

    const rows = await prisma.notifications.findMany({
      where: {
        user_id: user.id,
        created_at: { gte: cutoffStale },
      },
      orderBy: { created_at: 'desc' },
      take: 20,
    });

    const data = rows.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      category: n.category,
      priority: n.priority,
      actionUrl: n.action_url,
      isRead: n.read_at !== null,
      createdAt: n.created_at,
      timeLabel: formatRelativeTime(n.created_at),
    }));

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[GET /api/notifications] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat notifikasi.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Silakan login terlebih dahulu.' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);

    // Body { id } -> tandai satu notifikasi; tanpa id -> tandai semua
    if (body && typeof body.id === 'string' && body.id.trim()) {
      const updated = await prisma.notifications.updateMany({
        where: { id: body.id.trim(), user_id: user.id },
        data: { read_at: new Date() },
      });
      return NextResponse.json({ success: true, updated: updated.count });
    }

    const updated = await prisma.notifications.updateMany({
      where: { user_id: user.id, read_at: null },
      data: { read_at: new Date() },
    });

    return NextResponse.json({ success: true, updated: updated.count });
  } catch (error: any) {
    console.error('[PATCH /api/notifications] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui notifikasi.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Silakan login terlebih dahulu.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const olderThanDays = searchParams.get('days');

    // Hapus satu notifikasi spesifik jika ID diberikan
    if (id) {
      const deleted = await prisma.notifications.deleteMany({
        where: { id: id.trim(), user_id: user.id },
      });
      return NextResponse.json({ success: true, deleted: deleted.count });
    }

    // Hapus notifikasi yang sudah dibaca dan lebih lama dari X hari
    if (olderThanDays) {
      const days = parseInt(olderThanDays, 10);
      if (!isNaN(days) && days > 0) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const deleted = await prisma.notifications.deleteMany({
          where: {
            user_id: user.id,
            read_at: { not: null },
            created_at: { lt: cutoffDate },
          },
        });
        return NextResponse.json({ success: true, deleted: deleted.count });
      }
    }

    // Default: Hapus semua notifikasi yang sudah dibaca
    const deleted = await prisma.notifications.deleteMany({
      where: { user_id: user.id, read_at: { not: null } },
    });

    return NextResponse.json({ success: true, deleted: deleted.count });
  } catch (error: any) {
    console.error('[DELETE /api/notifications] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membersihkan notifikasi.' },
      { status: 500 }
    );
  }
}
