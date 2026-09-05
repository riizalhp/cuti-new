import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@cuti/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domainFilter = searchParams.get('domain') || 'all';
    const daysParam = parseInt(searchParams.get('days') || '30', 10);
    const daysCount = [7, 14, 30].includes(daysParam) ? daysParam : 30;

    const now = new Date();
    const rangeStartDate = new Date(now.getTime() - (daysCount - 1) * 24 * 60 * 60 * 1000);
    rangeStartDate.setHours(0, 0, 0, 0);

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

    // 1. Fetch pageviews & sessions for hourly and day-of-week analysis
    const [pageviews, visitors, sessions] = await Promise.all([
      (prisma as any).visitorPageView.findMany({
        where: domainWhere({ created_at: { gte: rangeStartDate } }),
        select: {
          created_at: true,
          visitor_id: true,
          path: true,
        },
      }),
      (prisma as any).visitor.findMany({
        where: domainWhere(),
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
      }),
      (prisma as any).visitorSession.findMany({
        where: domainWhere({ started_at: { gte: rangeStartDate } }),
        select: {
          started_at: true,
          duration_sec: true,
          visitor_id: true,
        },
      }),
    ]);

    // 2. Compute 24-hour distribution (00:00 - 23:00) with top pages
    const hourlyViews = Array(24).fill(0);
    const hourlyVisitorsMap: Array<Set<string>> = Array.from({ length: 24 }, () => new Set<string>());
    const hourlyPagesMap: Array<Record<string, number>> = Array.from({ length: 24 }, () => ({}));
    const matrixDayHour: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));

    pageviews.forEach((pv: any) => {
      const d = new Date(pv.created_at);
      const h = d.getHours();
      const dayIdx = d.getDay();
      
      hourlyViews[h]++;
      matrixDayHour[dayIdx][h]++;

      if (pv.visitor_id) {
        hourlyVisitorsMap[h].add(pv.visitor_id);
      }

      const path = pv.path || '/';
      hourlyPagesMap[h][path] = (hourlyPagesMap[h][path] || 0) + 1;
    });

    const totalHourlyViews = hourlyViews.reduce((a, b) => a + b, 0);
    const avgViewsPerHour = totalHourlyViews / 24;

    const hourlyDistribution = Array.from({ length: 24 }, (_, h) => {
      const hourStr = String(h).padStart(2, '0');
      const label = `${hourStr}:00`;
      const views = hourlyViews[h];
      const uniqueVisitors = hourlyVisitorsMap[h].size;

      // Status classification
      let classification: 'PEAK' | 'HIGH' | 'NORMAL' | 'QUIET' = 'NORMAL';
      if (avgViewsPerHour > 0) {
        if (views >= avgViewsPerHour * 1.5) classification = 'PEAK';
        else if (views >= avgViewsPerHour * 1.0) classification = 'HIGH';
        else if (views >= avgViewsPerHour * 0.4) classification = 'NORMAL';
        else classification = 'QUIET';
      }

      const topPages = Object.entries(hourlyPagesMap[h])
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([path, count]) => ({ path, count }));

      return {
        hour: h,
        label,
        views,
        visitors: uniqueVisitors,
        classification,
        topPages,
      };
    });

    // Determine Peak & Quiet Hours
    let maxHourViews = -1;
    let peakHourIndex = 14;
    let minHourViews = Infinity;
    let quietHourIndex = 3;

    hourlyDistribution.forEach((hd) => {
      if (hd.views > maxHourViews) {
        maxHourViews = hd.views;
        peakHourIndex = hd.hour;
      }
      if (hd.views < minHourViews) {
        minHourViews = hd.views;
        quietHourIndex = hd.hour;
      }
    });

    // Current hour in WIB (UTC+7)
    const nowWIB = new Date();
    const currentHour = nowWIB.getHours();
    const currentHourData = hourlyDistribution[currentHour] || { views: 0, visitors: 0, classification: 'NORMAL' };
    const currentHourStatus = {
      hour: currentHour,
      label: `${String(currentHour).padStart(2, '0')}:00 - ${String((currentHour + 1) % 24).padStart(2, '0')}:00 WIB`,
      views: currentHourData.views,
      visitors: currentHourData.visitors,
      classification: currentHourData.classification,
      diffVsAvgPercent: avgViewsPerHour > 0 ? Math.round(((currentHourData.views - avgViewsPerHour) / avgViewsPerHour) * 100) : 0,
      isCurrentPeak: currentHour === peakHourIndex,
    };

    // 3. Compute Day of Week distribution (Senin s/d Minggu)
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const dayViews = Array(7).fill(0);
    const dayVisitorsMap: Array<Set<string>> = Array.from({ length: 7 }, () => new Set<string>());

    pageviews.forEach((pv: any) => {
      const d = new Date(pv.created_at);
      const dayIdx = d.getDay();
      dayViews[dayIdx]++;
      if (pv.visitor_id) {
        dayVisitorsMap[dayIdx].add(pv.visitor_id);
      }
    });

    // Reorder so Monday is first: 1 (Senin) .. 6 (Sabtu), 0 (Minggu)
    const reorderedDays = [1, 2, 3, 4, 5, 6, 0];
    const dayOfWeekDistribution = reorderedDays.map((dayIdx) => ({
      dayIndex: dayIdx,
      dayName: dayNames[dayIdx],
      views: dayViews[dayIdx],
      visitors: dayVisitorsMap[dayIdx].size,
    }));

    // Determine Peak & Quiet Days
    let maxDayViews = -1;
    let peakDayName = 'Kamis';
    let minDayViews = Infinity;
    let quietDayName = 'Minggu';

    dayOfWeekDistribution.forEach((dd) => {
      if (dd.views > maxDayViews) {
        maxDayViews = dd.views;
        peakDayName = dd.dayName;
      }
      if (dd.views < minDayViews) {
        minDayViews = dd.views;
        quietDayName = dd.dayName;
      }
    });

    // 3b. Heatmap Matrix 7 Days x 24 Hours
    let maxCellViews = 1;
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        if (matrixDayHour[d][h] > maxCellViews) {
          maxCellViews = matrixDayHour[d][h];
        }
      }
    }

    const heatmapDayHour = reorderedDays.map((dayIdx) => {
      const hours = Array.from({ length: 24 }, (_, h) => {
        const v = matrixDayHour[dayIdx][h];
        const intensity = v === 0 ? 0 : v >= maxCellViews * 0.75 ? 4 : v >= maxCellViews * 0.45 ? 3 : v >= maxCellViews * 0.2 ? 2 : 1;
        return {
          hour: h,
          label: `${String(h).padStart(2, '0')}:00`,
          views: v,
          intensity,
        };
      });
      return {
        dayIndex: dayIdx,
        dayName: dayNames[dayIdx],
        hours,
        totalViews: dayViews[dayIdx],
      };
    });

    // 3c. Golden Time Windows (4 Segmen Waktu)
    const timeWindows = [
      {
        id: 'night',
        name: 'Dini Hari',
        timeRange: '00:00 - 05:59',
        hoursRange: [0, 5],
        views: hourlyViews.slice(0, 6).reduce((a, b) => a + b, 0),
        status: 'Sepi / Maintenance',
        recommendation: 'Jadwal ideal untuk pemeliharaan server, backup database, atau migrasi worker tanpa interupsi pengguna.',
      },
      {
        id: 'morning',
        name: 'Pagi Hari',
        timeRange: '06:00 - 11:59',
        hoursRange: [6, 11],
        views: hourlyViews.slice(6, 12).reduce((a, b) => a + b, 0),
        status: 'Trafik Meningkat',
        recommendation: 'Pelamar mulai aktif memantau lowongan kerja terbaru sebelum dan di awal jam kerja.',
      },
      {
        id: 'afternoon',
        name: 'Siang & Sore',
        timeRange: '12:00 - 17:59',
        hoursRange: [12, 17],
        views: hourlyViews.slice(12, 18).reduce((a, b) => a + b, 0),
        status: 'Puncak Produktif',
        recommendation: 'Aktivitas tinggi untuk pembuatan CV, apply loker, dan cek status interview di jam istirahat.',
      },
      {
        id: 'evening',
        name: 'Malam Hari',
        timeRange: '18:00 - 23:59',
        hoursRange: [18, 23],
        views: hourlyViews.slice(18, 24).reduce((a, b) => a + b, 0),
        status: 'Waktu Luang & Santai',
        recommendation: 'Waktu terbaik untuk publikasi konten artikel tips karier, misi harian, atau promo paket.',
      },
    ];

    // 4. New vs Returning Visitors Breakdown
    const totalVisitors = visitors.length;
    let newVisitorsCount = 0;
    let returningVisitorsCount = 0;
    let newDurationSum = 0;
    let returningDurationSum = 0;

    visitors.forEach((v: any) => {
      const isNew = (v.total_visits || 1) <= 1;
      if (isNew) {
        newVisitorsCount++;
        newDurationSum += v.total_duration_sec || 0;
      } else {
        returningVisitorsCount++;
        returningDurationSum += v.total_duration_sec || 0;
      }
    });

    const newPercent = totalVisitors > 0 ? Math.round((newVisitorsCount / totalVisitors) * 100) : 0;
    const returningPercent = totalVisitors > 0 ? Math.round((returningVisitorsCount / totalVisitors) * 100) : 0;
    const retentionRate = totalVisitors > 0 ? Number(((returningVisitorsCount / totalVisitors) * 100).toFixed(1)) : 0;

    const avgNewDurationSec = newVisitorsCount > 0 ? Math.round(newDurationSum / newVisitorsCount) : 0;
    const avgReturningDurationSec = returningVisitorsCount > 0 ? Math.round(returningDurationSum / returningVisitorsCount) : 0;

    // 5. Visit Frequency Distribution (Loyalty Buckets)
    const freqBuckets = {
      once: 0,       // 1x
      occasional: 0, // 2-3x
      regular: 0,    // 4-9x
      loyal: 0,      // 10x+
    };

    let totalVisitsSum = 0;

    visitors.forEach((v: any) => {
      const visits = v.total_visits || 1;
      totalVisitsSum += visits;

      if (visits === 1) freqBuckets.once++;
      else if (visits <= 3) freqBuckets.occasional++;
      else if (visits <= 9) freqBuckets.regular++;
      else freqBuckets.loyal++;
    });

    const frequencyDistribution = [
      {
        bucket: '1x Kunjungan',
        shortLabel: '1 Kali',
        count: freqBuckets.once,
        percent: totalVisitors > 0 ? Math.round((freqBuckets.once / totalVisitors) * 100) : 0,
        description: 'Pengunjung sekali datang (First-timers / Drop-off)',
        color: '#94A3B8',
      },
      {
        bucket: '2 - 3x Kunjungan',
        shortLabel: '2-3 Kali',
        count: freqBuckets.occasional,
        percent: totalVisitors > 0 ? Math.round((freqBuckets.occasional / totalVisitors) * 100) : 0,
        description: 'Kunjungan berkala (Membandingkan informasi)',
        color: '#3B82F6',
      },
      {
        bucket: '4 - 9x Kunjungan',
        shortLabel: '4-9 Kali',
        count: freqBuckets.regular,
        percent: totalVisitors > 0 ? Math.round((freqBuckets.regular / totalVisitors) * 100) : 0,
        description: 'Pengunjung sering (Aktif menyusun CV & lamaran)',
        color: '#F97316',
      },
      {
        bucket: '10x+ Kunjungan',
        shortLabel: '10+ Kali',
        count: freqBuckets.loyal,
        percent: totalVisitors > 0 ? Math.round((freqBuckets.loyal / totalVisitors) * 100) : 0,
        description: 'Super user sangat loyal (Akses harian & tracker)',
        color: '#10B981',
      },
    ];

    const averageVisitsPerVisitor = totalVisitors > 0 ? Number((totalVisitsSum / totalVisitors).toFixed(1)) : 0;

    // 6. Top 10 Most Frequent Visitors
    const topFrequentVisitors = [...visitors]
      .sort((a: any, b: any) => (b.total_visits || 1) - (a.total_visits || 1))
      .slice(0, 10)
      .map((v: any) => ({
        id: v.id,
        visitorId: v.visitor_id,
        totalVisits: v.total_visits || 1,
        totalPageviews: v.total_pageviews || 1,
        totalDurationSec: v.total_duration_sec || 0,
        deviceType: v.device_type || 'Desktop',
        browser: v.browser || 'Unknown',
        ipAddress: v.ip_address || '127.0.0.1',
        city: v.city || 'Jakarta',
        country: v.country || 'Indonesia',
        trafficSource: v.traffic_source || 'Direct',
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
      }));

    return NextResponse.json({
      success: true,
      data: {
        insights: {
          peakHour: {
            hour: peakHourIndex,
            label: `${String(peakHourIndex).padStart(2, '0')}:00 - ${String((peakHourIndex + 1) % 24).padStart(2, '0')}:00`,
            views: maxHourViews > 0 ? maxHourViews : 0,
          },
          quietHour: {
            hour: quietHourIndex,
            label: `${String(quietHourIndex).padStart(2, '0')}:00 - ${String((quietHourIndex + 3) % 24).padStart(2, '0')}:00`,
            views: minHourViews < Infinity ? minHourViews : 0,
          },
          peakDay: {
            dayName: peakDayName,
            views: maxDayViews > 0 ? maxDayViews : 0,
          },
          quietDay: {
            dayName: quietDayName,
            views: minDayViews < Infinity ? minDayViews : 0,
          },
          recommendedPostingTime: `${String(peakHourIndex).padStart(2, '0')}:00 WIB`,
        },
        hourlyDistribution,
        currentHourStatus,
        heatmapDayHour,
        timeWindows,
        dayOfWeekDistribution,
        newVsReturning: {
          totalVisitors,
          newVisitorsCount,
          newPercent,
          returningVisitorsCount,
          returningPercent,
          retentionRate,
          avgNewDurationSec,
          avgReturningDurationSec,
        },
        frequencyDistribution,
        averageVisitsPerVisitor,
        topFrequentVisitors,
      },
    });
  } catch (error: any) {
    console.error('[Traffic Patterns API] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menganalisis pola trafik: ' + error.message },
      { status: 500 }
    );
  }
}
