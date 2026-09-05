import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@cuti/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domainFilter = searchParams.get('domain') || 'all';
    const daysParam = parseInt(searchParams.get('days') || '7', 10);
    const daysCount = [7, 14, 30].includes(daysParam) ? daysParam : 7;

    const now = new Date();
    const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const rangeStartDate = new Date(now.getTime() - (daysCount - 1) * 24 * 60 * 60 * 1000);
    rangeStartDate.setHours(0, 0, 0, 0);

    // Domain filter helper
    const domainWhere = (extra: any = {}) => {
      if (domainFilter === 'all') return extra;
      return {
        ...extra,
        OR: [
          { domain: { contains: domainFilter, mode: 'insensitive' } },
          { hostname: { contains: domainFilter, mode: 'insensitive' } },
        ],
      };
    };

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
      domainBreakdownRaw,
      recentPageViews,
      recentSessions,
      visitorsInPeriod,
    ] = await Promise.all([
      // Total lifetime visitors
      (prisma as any).visitor.count({ where: domainWhere() }),

      // Live visitors (< 2 mins)
      (prisma as any).visitor.count({
        where: domainWhere({ last_seen: { gte: twoMinutesAgo } }),
      }),

      // Visitors active today
      (prisma as any).visitor.count({
        where: domainWhere({ last_seen: { gte: startOfToday } }),
      }),

      // Pageviews today (with domain filter)
      (prisma as any).visitorPageView.count({
        where: domainWhere({ created_at: { gte: startOfToday } }),
      }),

      // New visitors (first seen today)
      (prisma as any).visitor.count({
        where: domainWhere({ first_seen: { gte: startOfToday } }),
      }),

      // Returning visitors (total_visits > 1)
      (prisma as any).visitor.count({
        where: domainWhere({ total_visits: { gt: 1 } }),
      }),

      // Avg duration from sessions
      (prisma as any).visitorSession.aggregate({
        _avg: { duration_sec: true },
        where: domainWhere(),
      }),

      // Top pages
      (prisma as any).visitorPageView.groupBy({
        by: ['path'],
        where: domainWhere(),
        _count: { path: true },
        orderBy: { _count: { path: 'desc' } },
        take: 10,
      }),

      // Traffic sources
      (prisma as any).visitor.groupBy({
        by: ['traffic_source'],
        where: domainWhere(),
        _count: { traffic_source: true },
        orderBy: { _count: { traffic_source: 'desc' } },
        take: 8,
      }),

      // Device types
      (prisma as any).visitor.groupBy({
        by: ['device_type'],
        where: domainWhere(),
        _count: { device_type: true },
        orderBy: { _count: { device_type: 'desc' } },
      }),

      // Domain / subdomain breakdown
      (prisma as any).visitor.groupBy({
        by: ['domain'],
        where: { domain: { not: null } },
        _count: { domain: true },
        orderBy: { _count: { domain: 'desc' } },
        take: 10,
      }),

      // Pageviews in selected date range
      (prisma as any).visitorPageView.findMany({
        where: domainWhere({ created_at: { gte: rangeStartDate } }),
        select: { visitor_id: true, created_at: true },
      }),

      // Sessions in selected date range
      (prisma as any).visitorSession.findMany({
        where: domainWhere({ started_at: { gte: rangeStartDate } }),
        select: { visitor_id: true, started_at: true },
      }),

      // All visitors to determine first_seen and user linking
      (prisma as any).visitor.findMany({
        where: domainWhere(),
        select: { visitor_id: true, first_seen: true, user_id: true },
      }),
    ]);

    const visitorMetaMap = new Map<string, { firstSeenDate: string; isLinkedUser: boolean }>();
    visitorsInPeriod.forEach((v: any) => {
      visitorMetaMap.set(v.visitor_id, {
        firstSeenDate: v.first_seen.toISOString().slice(0, 10),
        isLinkedUser: Boolean(v.user_id),
      });
    });

    // Aggregate day-by-day metrics
    const dayDataMap: Record<
      string,
      {
        date: string;
        day: string;
        fullDate: string;
        views: number;
        visitorIds: Set<string>;
      }
    > = {};

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const isoDate = d.toISOString().slice(0, 10);
      const shortDay = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
      const fullDate = d.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      dayDataMap[isoDate] = {
        date: isoDate,
        day: shortDay,
        fullDate,
        views: 0,
        visitorIds: new Set<string>(),
      };
    }

    // Add pageviews
    recentPageViews.forEach((pv: any) => {
      const iso = new Date(pv.created_at).toISOString().slice(0, 10);
      if (dayDataMap[iso]) {
        dayDataMap[iso].views++;
        if (pv.visitor_id) {
          dayDataMap[iso].visitorIds.add(pv.visitor_id);
        }
      }
    });

    // Add sessions
    recentSessions.forEach((sess: any) => {
      const iso = new Date(sess.started_at).toISOString().slice(0, 10);
      if (dayDataMap[iso] && sess.visitor_id) {
        dayDataMap[iso].visitorIds.add(sess.visitor_id);
      }
    });

    const trendDays = Object.values(dayDataMap).map((d) => {
      let newVisitors = 0;
      let linkedUsers = 0;

      d.visitorIds.forEach((visId) => {
        const meta = visitorMetaMap.get(visId);
        if (meta) {
          if (meta.firstSeenDate === d.date) {
            newVisitors++;
          }
          if (meta.isLinkedUser) {
            linkedUsers++;
          }
        }
      });

      const visitorsCount = d.visitorIds.size;
      const returningVisitors = Math.max(0, visitorsCount - newVisitors);

      return {
        date: d.date,
        day: d.day,
        fullDate: d.fullDate,
        views: d.views,
        visitors: visitorsCount,
        newVisitors,
        returningVisitors,
        linkedUsers,
      };
    });

    // Daily breakdown table: newest date first
    const dailyBreakdown = [...trendDays].reverse();

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

    const domainBreakdown = domainBreakdownRaw.map((d: any) => ({
      domain: d.domain || 'employr.id',
      count: d._count.domain,
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
        domainBreakdown,
        trendDays,
        dailyBreakdown,
        trend7Days: trendDays.map((t) => ({ day: t.day, views: t.views, visitors: t.visitors })),
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
