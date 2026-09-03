import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@cuti/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const domainFilter = searchParams.get('domain') || 'all'; // all, employr.id, app.employr.id, loker.employr.id, localhost
    const status = searchParams.get('status') || 'all'; // all, online, offline
    const device = searchParams.get('device') || 'all'; // all, desktop, mobile, tablet
    const source = searchParams.get('source') || 'all'; // all, direct, google, social, referral, campaign
    const userFilter = searchParams.get('user') || 'all'; // all, linked, anonymous
    const dateRange = searchParams.get('dateRange') || 'all'; // all, today, 7d, 30d
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const where: any = {};

    // 0. Domain / Hostname Filter
    if (domainFilter !== 'all') {
      where.OR = [
        { domain: { contains: domainFilter, mode: 'insensitive' } },
        { hostname: { contains: domainFilter, mode: 'insensitive' } },
      ];
    }

    // 1. Search Query (Visitor ID, Linked User name/email, IP address, current page)
    if (search.trim()) {
      const q = search.trim();
      where.OR = [
        { visitor_id: { contains: q, mode: 'insensitive' } },
        { ip_address: { contains: q, mode: 'insensitive' } },
        { current_page: { contains: q, mode: 'insensitive' } },
        { current_title: { contains: q, mode: 'insensitive' } },
        {
          users: {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    // 2. Status Filter (Online: last_seen within 2 minutes)
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    if (status === 'online') {
      where.last_seen = { gte: twoMinutesAgo };
    } else if (status === 'offline') {
      where.last_seen = { lt: twoMinutesAgo };
    }

    // 3. Device Filter
    if (device !== 'all') {
      where.device_type = { equals: device, mode: 'insensitive' };
    }

    // 4. Source Filter
    if (source !== 'all') {
      if (source === 'direct') {
        where.traffic_source = { equals: 'Direct' };
      } else if (source === 'google') {
        where.traffic_source = { contains: 'Google', mode: 'insensitive' };
      } else if (source === 'social') {
        where.OR = [
          { traffic_source: { contains: 'Instagram', mode: 'insensitive' } },
          { traffic_source: { contains: 'TikTok', mode: 'insensitive' } },
          { traffic_source: { contains: 'Facebook', mode: 'insensitive' } },
          { traffic_source: { contains: 'Twitter', mode: 'insensitive' } },
          { traffic_source: { contains: 'LinkedIn', mode: 'insensitive' } },
          { traffic_source: { contains: 'WhatsApp', mode: 'insensitive' } },
        ];
      } else if (source === 'referral') {
        where.traffic_source = { contains: 'Referral', mode: 'insensitive' };
      } else if (source === 'campaign') {
        where.traffic_source = { contains: 'Campaign', mode: 'insensitive' };
      }
    }

    // 5. User Linking Filter
    if (userFilter === 'linked') {
      where.user_id = { not: null };
    } else if (userFilter === 'anonymous') {
      where.user_id = null;
    }

    // 6. Date Range Filter
    if (dateRange === 'today') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      where.first_seen = { gte: startOfDay };
    } else if (dateRange === '7d') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      where.first_seen = { gte: sevenDaysAgo };
    } else if (dateRange === '30d') {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      where.first_seen = { gte: thirtyDaysAgo };
    }

    const [total, visitors] = await Promise.all([
      (prisma as any).visitor.count({ where }),
      (prisma as any).visitor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { last_seen: 'desc' },
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
          _count: {
            select: {
              sessions: true,
              page_views: true,
              activities: true,
            },
          },
        },
      }),
    ]);

    const formatted = visitors.map((v: any) => {
      const isOnline = new Date(v.last_seen).getTime() >= twoMinutesAgo.getTime();
      return {
        id: v.id,
        visitorId: v.visitor_id,
        isOnline,
        currentPage: v.current_page || '/',
        currentTitle: v.current_title || 'Home',
        domain: v.domain || 'employr.id',
        hostname: v.hostname || 'employr.id',
        totalVisits: v.total_visits || v._count.sessions,
        totalPageviews: v.total_pageviews || v._count.page_views,
        totalDurationSec: v.total_duration_sec,
        deviceType: v.device_type || 'Desktop',
        browser: v.browser || 'Unknown',
        browserVersion: v.browser_version || '',
        os: v.os || 'Unknown',
        screenResolution: v.screen_resolution || '',
        ipAddress: v.ip_address || '127.0.0.1',
        country: v.country || 'Indonesia',
        city: v.city || 'Jakarta',
        firstReferrer: v.first_referrer || '',
        trafficSource: v.traffic_source || 'Direct',
        utmSource: v.utm_source,
        utmMedium: v.utm_medium,
        utmCampaign: v.utm_campaign,
        firstSeen: v.first_seen.toISOString(),
        lastSeen: v.last_seen.toISOString(),
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
      data: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('[Admin Visitors API] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data pengunjung: ' + error.message },
      { status: 500 }
    );
  }
}
