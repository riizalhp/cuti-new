import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@cuti/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

    const visitor = await (prisma as any).visitor.findFirst({
      where: isUUID ? { OR: [{ id }, { visitor_id: id }] } : { visitor_id: id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar_url: true,
            role: true,
            created_at: true,
            memberships: {
              select: {
                tier: true,
                package_name: true,
                is_lifetime: true,
                is_active: true,
              },
            },
          },
        },
        sessions: {
          orderBy: { started_at: 'desc' },
          take: 50,
        },
        page_views: {
          orderBy: { created_at: 'desc' },
          take: 100,
        },
        activities: {
          orderBy: { created_at: 'asc' },
          take: 200,
        },
      },
    });

    if (!visitor) {
      return NextResponse.json({ success: false, message: 'Visitor tidak ditemukan' }, { status: 404 });
    }

    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const isOnline = new Date(visitor.last_seen).getTime() >= twoMinutesAgo.getTime();

    // Map chronological timeline
    const activityTimeline = visitor.activities.map((act: any) => ({
      id: act.id,
      timestamp: act.created_at.toISOString(),
      type: act.activity_type,
      name: act.activity_name,
      path: act.page_path,
      metadata: act.metadata,
    }));

    const responseData = {
      id: visitor.id,
      visitorId: visitor.visitor_id,
      isOnline,
      currentPage: visitor.current_page || '/',
      currentTitle: visitor.current_title || 'Home',
      totalVisits: visitor.total_visits,
      totalPageviews: visitor.total_pageviews,
      totalDurationSec: visitor.total_duration_sec,
      deviceType: visitor.device_type || 'Desktop',
      browser: visitor.browser || 'Unknown',
      browserVersion: visitor.browser_version || '',
      os: visitor.os || 'Unknown',
      screenResolution: visitor.screen_resolution || '',
      ipAddress: visitor.ip_address || '127.0.0.1',
      country: visitor.country || 'Indonesia',
      city: visitor.city || 'Jakarta',
      firstReferrer: visitor.first_referrer || '',
      trafficSource: visitor.traffic_source || 'Direct',
      utmSource: visitor.utm_source,
      utmMedium: visitor.utm_medium,
      utmCampaign: visitor.utm_campaign,
      utmContent: visitor.utm_content,
      utmTerm: visitor.utm_term,
      firstSeen: visitor.first_seen.toISOString(),
      lastSeen: visitor.last_seen.toISOString(),
      linkedUser: visitor.users
        ? {
            id: visitor.users.id,
            name: visitor.users.name,
            email: visitor.users.email,
            avatarUrl: visitor.users.avatar_url,
            role: visitor.users.role,
            joinedAt: visitor.users.created_at.toISOString(),
            membership: visitor.users.memberships
              ? {
                  tier: visitor.users.memberships.tier,
                  packageName: visitor.users.memberships.package_name,
                  isLifetime: visitor.users.memberships.is_lifetime,
                  isActive: visitor.users.memberships.is_active,
                }
              : null,
          }
        : null,
      sessions: visitor.sessions.map((s: any) => ({
        id: s.id,
        sessionId: s.session_id,
        startedAt: s.started_at.toISOString(),
        lastActiveAt: s.last_active_at.toISOString(),
        durationSec: s.duration_sec,
        entryPage: s.entry_page,
        exitPage: s.exit_page,
        pageviewsCount: s.pageviews_count,
        trafficSource: s.traffic_source,
        referrer: s.referrer,
        deviceType: s.device_type,
        browser: s.browser,
        os: s.os,
      })),
      pageViews: visitor.page_views.map((pv: any) => ({
        id: pv.id,
        url: pv.url,
        path: pv.path,
        title: pv.title,
        durationSec: pv.duration_sec,
        createdAt: pv.created_at.toISOString(),
      })),
      activityTimeline,
    };

    return NextResponse.json({ success: true, data: responseData });
  } catch (error: any) {
    console.error('[Admin Visitor Detail API] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil detail visitor: ' + error.message },
      { status: 500 }
    );
  }
}
