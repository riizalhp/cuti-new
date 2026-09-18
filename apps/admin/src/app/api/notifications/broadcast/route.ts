import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@employr/db';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Get recent broadcast audit logs
    const recentBroadcasts = await prisma.audit_logs.findMany({
      where: { action: 'BROADCAST_NOTIFICATION' },
      orderBy: { created_at: 'desc' },
      take: 20,
    });

    const totalNotifications = await prisma.notifications.count();
    const unreadCount = await prisma.notifications.count({ where: { read_at: null } });

    return NextResponse.json({
      success: true,
      data: {
        totalSent: totalNotifications,
        totalUnread: unreadCount,
        recentBroadcasts: recentBroadcasts.map((b) => ({
          id: b.id,
          createdAt: b.created_at.toISOString(),
          details: b.new_value as any,
          ipAddress: b.ip_address,
        })),
      },
    });
  } catch (error: any) {
    console.error('[Broadcast Notifications GET] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal mengambil riwayat broadcast.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const {
      title,
      message,
      category = 'OPPORTUNITY',
      priority = 'INFORMATIONAL',
      actionUrl,
      targetSegment = 'all',
    } = payload;

    if (!title || !message) {
      return NextResponse.json(
        { success: false, message: 'Judul dan pesan notifikasi wajib diisi.' },
        { status: 400 }
      );
    }

    // Determine target users based on segment
    let whereClause: any = {};
    if (targetSegment === 'premium') {
      whereClause = {
        memberships: {
          some: {
            is_active: true,
            tier: { not: 'FREE' },
          },
        },
      };
    } else if (targetSegment === 'free') {
      whereClause = {
        OR: [
          { memberships: { none: {} } },
          { memberships: { every: { tier: 'FREE' } } },
        ],
      };
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: { id: true, email: true, name: true },
    });

    if (users.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Tidak ada pengguna yang cocok dengan target segmen ini.',
      });
    }

    const now = new Date();
    const notificationData = users.map((u) => ({
      id: crypto.randomUUID(),
      user_id: u.id,
      title: title.trim(),
      message: message.trim(),
      category: category as any,
      priority: priority as any,
      action_url: actionUrl?.trim() || null,
      read_at: null,
      created_at: now,
    }));

    // Batch insert notifications
    await prisma.notifications.createMany({
      data: notificationData,
    });

    // Record audit log
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    if (adminUser) {
      await prisma.audit_logs.create({
        data: {
          id: crypto.randomUUID(),
          user_id: adminUser.id,
          action: 'BROADCAST_NOTIFICATION',
          entity: 'notifications',
          entity_id: 'broadcast-' + Date.now(),
          ip_address: req.headers.get('x-forwarded-for') || '127.0.0.1',
          new_value: {
            title,
            message,
            category,
            priority,
            actionUrl: actionUrl || null,
            targetSegment,
            recipientCount: users.length,
            timestamp: now.toISOString(),
          },
          severity: 'INFO',
          created_at: now,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil menyiarkan notifikasi ke ${users.length} pengguna!`,
      recipientCount: users.length,
    });
  } catch (error: any) {
    console.error('[Broadcast Notifications POST] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal mengirim broadcast notifikasi.' },
      { status: 500 }
    );
  }
}
