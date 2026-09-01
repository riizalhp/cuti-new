import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@cuti/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const now = new Date();
    const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalVisitors,
      liveCount,
      todayVisitorsCount,
      todayPageviewsCount,
      newVisitorsCount,
      returningVisitorsCount,
      avgDurationResult,
      topPagesRaw,
      trafficSourcesRaw,
      deviceTypesRaw,
      recentPageViews7D,
    ] = await Promise.all([
      // Total lifetime visitors
      (prisma as any).visitor.count(),

      // Live visitors (< 2 mins)
      (prisma as any).visitor.count({
        where: { last_seen: { gte: twoMinutesAgo } },
      }),

      // Visitors active today
      (prisma as any).visitor.count({
        where: { last_seen: { gte: startOfToday } },
      }),

      // Pageviews today
      (prisma as any).visitorPageView.count({
        where: { created_at: { gte: startOfToday } },
      }),

      // New visitors (first seen today)
      (prisma as any).visitor.count({
        where: { first_seen: { gte: startOfToday } },
      }),

      // Returning visitors (total_visits > 1)
      (prisma as any).visitor.count({
        where: { total_visits: { gt: 1 } },
      }),

      // Avg duration from sessions
      (prisma as any).visitorSession.aggregate({
        _avg: { duration_sec: true },
      }),

      // Top pages
      (prisma as any).visitorPageView.groupBy({
        by: ['path'],
        _count: { path: true },
        orderBy: { _count: { path: 'desc' } },
        take: 10,
      }),

      // Traffic sources
      (prisma as any).visitor.groupBy({
        by: ['traffic_source'],
        _count: { traffic_source: true },
        orderBy: { _count: { traffic_source: 'desc' } },
        take: 8,
      }),

      // Device types
      (prisma as any).visitor.groupBy({
        by: ['device_type'],
        _count: { device_type: true },
        orderBy: { _count: { device_type: 'desc' } },
      }),

      // 7-day pageviews count by day
      (prisma as any).visitorPageView.findMany({
        where: { created_at: { gte: sevenDaysAgo } },
        select: { created_at: true },
      }),
    ]);

    // Aggregate 7-day trend
    const dayMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
      dayMap[key] = 0;
    }

    recentPageViews7D.forEach((pv: any) => {
      const d = new Date(pv.created_at);
      const key = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
      if (dayMap[key] !== undefined) {
        dayMap[key]++;
      }
    });

    const trend7Days = Object.entries(dayMap).map(([day, views]) => ({
      day,
      views,
    }));

    const topPages = topPagesRaw.map((p: any) => ({
      path: p.path,
      views: p._count.path,
    }));

    const trafficSources = trafficSourcesRaw.map((ts: any) => ({
      source: ts.traffic_source || 'Direct',
      count: ts._count.traffic_source,
    }));

    const deviceBreakdown = deviceTypesRaw.map((dt: any) => ({
      device: dt.device_type || 'Desktop',
      count: dt._count.device_type,
    }));

    const avgDurationSec = Math.round(avgDurationResult._avg.duration_sec || 0);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalVisitors,
          liveCount,
          todayVisitorsCount,
          todayPageviewsCount,
          newVisitorsCount,
          returningVisitorsCount,
          avgDurationSec,
        },
        topPages,
        trafficSources,
        deviceBreakdown,
        trend7Days,
      },
    });
  } catch (error: any) {
    console.error('[Admin Visitor Stats API] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat analitik visitor: ' + error.message },
      { status: 500 }
    );
  }
}
