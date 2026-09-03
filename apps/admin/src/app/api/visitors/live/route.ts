import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@cuti/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domainFilter = searchParams.get('domain') || 'all';

    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

    const where: any = {
      last_seen: { gte: twoMinutesAgo },
    };

    if (domainFilter !== 'all') {
      where.OR = [
        { domain: { contains: domainFilter, mode: 'insensitive' } },
        { hostname: { contains: domainFilter, mode: 'insensitive' } },
      ];
    }

    const liveVisitors = await (prisma as any).visitor.findMany({
      where,
      orderBy: { last_seen: 'desc' },
      take: 50,
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar_url: true,
            role: true,
          },
        },
      },
    });

    const formatted = liveVisitors.map((v: any) => {
      const activeSecondsAgo = Math.max(0, Math.floor((Date.now() - new Date(v.last_seen).getTime()) / 1000));
      return {
        id: v.id,
        visitorId: v.visitor_id,
        currentPage: v.current_page || '/',
        currentTitle: v.current_title || 'Home',
        domain: v.domain || 'employr.id',
        hostname: v.hostname || 'employr.id',
        deviceType: v.device_type || 'Desktop',
        browser: v.browser || 'Unknown',
        os: v.os || 'Unknown',
        trafficSource: v.traffic_source || 'Direct',
        city: v.city || 'Jakarta',
        country: v.country || 'Indonesia',
        lastSeen: v.last_seen.toISOString(),
        activeSecondsAgo,
        linkedUser: v.users
          ? {
              id: v.users.id,
              name: v.users.name,
              email: v.users.email,
              avatarUrl: v.users.avatar_url,
              role: v.users.role,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        count: formatted.length,
        visitors: formatted,
      },
    });
  } catch (error: any) {
    console.error('[Admin Live Visitors API] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil live visitors: ' + error.message },
      { status: 500 }
    );
  }
}
