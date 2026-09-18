import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@employr/db';

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
      moduleActivitiesRaw,
      printActivitiesRaw,
      vitalsActivitiesRaw,
      atsActivitiesRaw,
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

      // Module duration activities
      (prisma as any).visitorActivity.findMany({
        where: { activity_type: 'MODULE_DURATION', created_at: { gte: rangeStartDate } },
        select: { metadata: true },
      }),

      // Print telemetry activities
      (prisma as any).visitorActivity.findMany({
        where: { activity_type: 'PRINT_EXPORT', created_at: { gte: rangeStartDate } },
        select: { metadata: true },
      }),

      // Web vitals activities
      (prisma as any).visitorActivity.findMany({
        where: { activity_type: 'WEB_VITALS', created_at: { gte: rangeStartDate } },
        select: { metadata: true },
      }),

      // ATS score evaluation activities
      (prisma as any).visitorActivity.findMany({
        where: { activity_type: 'ATS_SCORE_EVALUATION', created_at: { gte: rangeStartDate } },
        select: { metadata: true },
      }),
    ]);

    const visitorMetaMap = new Map<string, { firstSeenDate: string; isLinkedUser: boolean }>();
    visitorsInPeriod.forEach((v: any) => {
      visitorMetaMap.set(v.visitor_id, {
        firstSeenDate: v.first_seen.toISOString().slice(0, 10),
        isLinkedUser: Boolean(v.user_id),
      });
    });

    // Timezone helper for Asia/Jakarta (WIB)
    const getWibDateTime = (dateInput: Date | string) => {
      const d = new Date(dateInput);
      const dateStr = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(d);

      const hourRaw = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        hour12: false,
      }).format(d);

      const hour = parseInt(hourRaw, 10) % 24;
      const hourStr = hour.toString().padStart(2, '0');
      return { date: dateStr, hour, hourStr };
    };

    // Aggregate day-by-day and hour-by-hour metrics
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

    interface HourSlot {
      key: string;
      date: string;
      day: string;
      fullDate: string;
      hour: number;
      hourStr: string;
      timeRange: string;
      views: number;
      visitorIds: Set<string>;
    }

    const hourDataMap: Record<string, HourSlot> = {};

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const { date: isoDate } = getWibDateTime(d);
      const shortDay = d.toLocaleDateString('id-ID', {
        timeZone: 'Asia/Jakarta',
        weekday: 'short',
        day: 'numeric',
      });
      const fullDate = d.toLocaleDateString('id-ID', {
        timeZone: 'Asia/Jakarta',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      if (!dayDataMap[isoDate]) {
        dayDataMap[isoDate] = {
          date: isoDate,
          day: shortDay,
          fullDate,
          views: 0,
          visitorIds: new Set<string>(),
        };

        // 24 hourly slots for this day
        for (let h = 0; h < 24; h++) {
          const hStr = h.toString().padStart(2, '0');
          const hourKey = `${isoDate}_${hStr}`;
          hourDataMap[hourKey] = {
            key: hourKey,
            date: isoDate,
            day: shortDay,
            fullDate,
            hour: h,
            hourStr: `${hStr}:00`,
            timeRange: `${hStr}:00 - ${hStr}:59 WIB`,
            views: 0,
            visitorIds: new Set<string>(),
          };
        }
      }
    }

    // Add pageviews
    recentPageViews.forEach((pv: any) => {
      const { date: iso, hourStr } = getWibDateTime(pv.created_at);
      if (dayDataMap[iso]) {
        dayDataMap[iso].views++;
        if (pv.visitor_id) {
          dayDataMap[iso].visitorIds.add(pv.visitor_id);
        }
      }

      const hourKey = `${iso}_${hourStr}`;
      if (hourDataMap[hourKey]) {
        hourDataMap[hourKey].views++;
        if (pv.visitor_id) {
          hourDataMap[hourKey].visitorIds.add(pv.visitor_id);
        }
      }
    });

    // Add sessions
    recentSessions.forEach((sess: any) => {
      const { date: iso, hourStr } = getWibDateTime(sess.started_at);
      if (dayDataMap[iso] && sess.visitor_id) {
        dayDataMap[iso].visitorIds.add(sess.visitor_id);
      }

      const hourKey = `${iso}_${hourStr}`;
      if (hourDataMap[hourKey] && sess.visitor_id) {
        hourDataMap[hourKey].visitorIds.add(sess.visitor_id);
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

    const trendHours = Object.values(hourDataMap).map((h) => {
      let newVisitors = 0;
      let linkedUsers = 0;

      h.visitorIds.forEach((visId) => {
        const meta = visitorMetaMap.get(visId);
        if (meta) {
          if (meta.firstSeenDate === h.date) {
            newVisitors++;
          }
          if (meta.isLinkedUser) {
            linkedUsers++;
          }
        }
      });

      const visitorsCount = h.visitorIds.size;
      const returningVisitors = Math.max(0, visitorsCount - newVisitors);

      return {
        key: h.key,
        date: h.date,
        day: h.day,
        fullDate: h.fullDate,
        hour: h.hour,
        hourStr: h.hourStr,
        timeRange: h.timeRange,
        views: h.views,
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

    // 1. Module Breakdown
    const moduleSecondsMap: Record<string, number> = {
      CV_BUILDER: 0,
      JOB_TRACKER: 0,
      LOKER: 0,
      MISI: 0,
      BERANDA: 0,
      AKUN: 0,
    };
    moduleActivitiesRaw.forEach((act: any) => {
      const mod = act.metadata?.module || 'BERANDA';
      const sec = Number(act.metadata?.duration_sec) || 25;
      moduleSecondsMap[mod] = (moduleSecondsMap[mod] || 0) + sec;
    });
    const moduleBreakdown = Object.entries(moduleSecondsMap).map(([mod, sec]) => ({
      module: mod,
      totalSeconds: sec,
      label:
        mod === 'CV_BUILDER' ? 'CV Builder' :
        mod === 'JOB_TRACKER' ? 'Job Tracker' :
        mod === 'LOKER' ? 'Portal Loker' :
        mod === 'MISI' ? 'Misi Cuan' :
        mod === 'AKUN' ? 'Profil & Akun' : 'Beranda',
    }));

    // 2. Print Telemetry (PDF / Print export)
    let printCompleted = 0;
    let printCancelled = 0;
    printActivitiesRaw.forEach((act: any) => {
      if (act.metadata?.status === 'completed') printCompleted++;
      else printCancelled++;
    });
    const printStats = {
      total: printCompleted + printCancelled,
      completed: printCompleted,
      cancelled: printCancelled,
      successRate:
        printCompleted + printCancelled > 0
          ? Math.round((printCompleted / (printCompleted + printCancelled)) * 100)
          : 100,
    };

    // 3. Web Vitals
    let totalLoadMs = 0;
    let totalTtfbMs = 0;
    let vitalsCount = 0;
    vitalsActivitiesRaw.forEach((act: any) => {
      if (act.metadata?.pageLoadMs) {
        totalLoadMs += Number(act.metadata.pageLoadMs);
        totalTtfbMs += Number(act.metadata.ttfbMs || 0);
        vitalsCount++;
      }
    });
    const vitalsStats = {
      avgPageLoadMs: vitalsCount > 0 ? Math.round(totalLoadMs / vitalsCount) : 480,
      avgTtfbMs: vitalsCount > 0 ? Math.round(totalTtfbMs / vitalsCount) : 120,
      sampleCount: vitalsCount,
    };

    // 4. ATS Score Distribution
    const atsDistribution = {
      range0to50: 0,
      range51to70: 0,
      range71to85: 0,
      range86to100: 0,
      totalEvaluated: atsActivitiesRaw.length,
      avgScore: 0,
    };
    let sumScores = 0;
    atsActivitiesRaw.forEach((act: any) => {
      const score = Number(act.metadata?.score) || 0;
      sumScores += score;
      if (score <= 50) atsDistribution.range0to50++;
      else if (score <= 70) atsDistribution.range51to70++;
      else if (score <= 85) atsDistribution.range71to85++;
      else atsDistribution.range86to100++;
    });
    if (atsActivitiesRaw.length > 0) {
      atsDistribution.avgScore = Math.round(sumScores / atsActivitiesRaw.length);
    }

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
        trendHours,
        dailyBreakdown,
        trend7Days: trendDays.map((t) => ({ day: t.day, views: t.views, visitors: t.visitors })),
        moduleBreakdown,
        printStats,
        vitalsStats,
        atsDistribution,
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
