import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@employr/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/growth/funnel
 * Menggabungkan:
 * - Awareness/Engagement: metrik manual dari growth_posts (per platform & eksperimen)
 * - Visit: visitor tracker dengan UTM (utm_source threads/linkedin)
 * - Conversion: early_testers (waiting list)
 * - Activation/Retention: user yang punya CV/lamaran + login ulang
 */
export async function GET(req: NextRequest) {
  try {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      posts,
      totalImpressionsAgg,
      utmVisitorsRaw,
      totalTesters,
      testersLast7,
      testersByUtmRaw,
      totalUsers,
      usersWithCv,
      usersWithApps,
      activeLast7Raw,
      activeLast30Raw,
    ] = await Promise.all([
      // Semua post published + metriknya
      prisma.growth_posts.findMany({
        where: { status: 'PUBLISHED' },
        select: {
          platform: true,
          account: true,
          experiment_id: true,
          impressions: true,
          likes: true,
          comments: true,
          reposts: true,
          link_clicks: true,
          campaign_utm: true,
        },
      }),

      prisma.growth_posts.aggregate({
        where: { status: 'PUBLISHED' },
        _sum: {
          impressions: true,
          likes: true,
          comments: true,
          reposts: true,
          link_clicks: true,
        },
      }),

      // Visitor dari UTM threads/linkedin
      (prisma as any).visitor.groupBy({
        by: ['utm_source', 'utm_medium', 'utm_campaign'],
        _count: { id: true },
        where: {
          OR: [
            { utm_source: { contains: 'threads', mode: 'insensitive' } },
            { utm_source: { contains: 'linkedin', mode: 'insensitive' } },
          ],
        },
      }),

      // Waiting list (early_testers)
      (prisma as any).earlyTester.count(),

      (prisma as any).earlyTester.count({
        where: { created_at: { gte: last7 } },
      }),

      // Kontribusi utm per campaign: belum ada kolom utm di early_testers,
      // jadi breakdown pakai visitor utm sebagai proksi
      (prisma as any).visitor.groupBy({
        by: ['utm_campaign'],
        _count: { id: true },
        where: { utm_campaign: { not: null } },
      }),

      prisma.user.count({ where: { role: { not: 'ADMIN' } } }),

      // Activation: user yang sudah membuat CV
      prisma.cv_projects.groupBy({
        by: ['user_id'],
        where: { is_active: true },
      }),

      // Activation: user yang sudah mencatat lamaran
      prisma.applications.groupBy({
        by: ['user_id'],
      }),

      // Retention: user aktif 7 hari terakhir (login/session)
      prisma.sessions.groupBy({
        by: ['user_id'],
        where: { created_at: { gte: last7 } },
      }),

      prisma.sessions.groupBy({
        by: ['user_id'],
        where: { created_at: { gte: last30 } },
      }),
    ]);

    // Breakdown per platform (dari metrik manual)
    const platformBreakdown: Record<string, any> = {};
    for (const p of posts) {
      const key = p.platform;
      if (!platformBreakdown[key]) {
        platformBreakdown[key] = {
          platform: key,
          posts: 0,
          impressions: 0,
          engagements: 0,
          linkClicks: 0,
        };
      }
      platformBreakdown[key].posts += 1;
      platformBreakdown[key].impressions += p.impressions;
      platformBreakdown[key].engagements += p.likes + p.comments + p.reposts;
      platformBreakdown[key].linkClicks += p.link_clicks;
    }

    // Breakdown per eksperimen
    const experimentBreakdown: Record<string, any> = {};
    for (const p of posts) {
      const key = p.experiment_id || 'ORGANIC';
      if (!experimentBreakdown[key]) {
        experimentBreakdown[key] = { experimentId: key, posts: 0, impressions: 0, engagements: 0, linkClicks: 0 };
      }
      experimentBreakdown[key].posts += 1;
      experimentBreakdown[key].impressions += p.impressions;
      experimentBreakdown[key].engagements += p.likes + p.comments + p.reposts;
      experimentBreakdown[key].linkClicks += p.link_clicks;
    }

    const sum = totalImpressionsAgg._sum;
    const activatedUserIds = new Set([
      ...usersWithCv.map((r) => r.user_id),
      ...usersWithApps.map((r) => r.user_id),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        funnel: {
          impressions: sum.impressions || 0,
          engagements: (sum.likes || 0) + (sum.comments || 0) + (sum.reposts || 0),
          linkClicks: sum.link_clicks || 0,
          utmVisitors: utmVisitorsRaw.reduce((acc: number, r: any) => acc + r._count.id, 0),
          utmVisitorsBySource: utmVisitorsRaw.map((r: any) => ({
            source: r.utm_source || '(tidak ada)',
            campaign: r.utm_campaign || '(tidak ada)',
            visitors: r._count.id,
          })),
          waitingList: totalTesters,
          waitingListLast7: testersLast7,
          target: { min: 200, max: 300 },
          users: totalUsers,
          activated: activatedUserIds.size,
          retained7d: activeLast7Raw.length,
          retained30d: activeLast30Raw.length,
        },
        platforms: Object.values(platformBreakdown),
        experiments: Object.values(experimentBreakdown),
        campaigns: testersByUtmRaw.map((r: any) => ({
          campaign: r.utm_campaign || '(tidak ada)',
          visitors: r._count.id,
        })),
      },
    });
  } catch (error: any) {
    console.error('[GET /api/growth/funnel] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat funnel growth.' },
      { status: 500 }
    );
  }
}
