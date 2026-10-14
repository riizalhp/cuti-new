import { NextResponse } from 'next/server';
import { prisma } from '@employr/db';

export const dynamic = 'force-dynamic';

// GET /api/scraper-providers/stats — Agregasi statistik & tren penggunaan scraper API
export async function GET() {
  try {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    // Ambil log scraper 14 hari terakhir
    const logs = await prisma.scraper_logs.findMany({
      where: {
        created_at: {
          gte: fourteenDaysAgo,
        },
      },
      select: {
        id: true,
        provider_name: true,
        provider_label: true,
        status: true,
        latency_ms: true,
        created_at: true,
      },
      orderBy: { created_at: 'asc' },
    });

    // Inisialisasi 14 hari terakhir
    const dailyMap: Record<
      string,
      {
        date: string;
        day: string;
        fullDate: string;
        total: number;
        success: number;
        failed: number;
        totalLatency: number;
        countWithLatency: number;
      }
    > = {};

    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });
      const fullDate = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

      dailyMap[dateStr] = {
        date: dateStr,
        day: dayName,
        fullDate,
        total: 0,
        success: 0,
        failed: 0,
        totalLatency: 0,
        countWithLatency: 0,
      };
    }

    logs.forEach((log) => {
      const dateStr = log.created_at.toISOString().slice(0, 10);
      if (dailyMap[dateStr]) {
        dailyMap[dateStr].total += 1;
        if (log.status === 'SUCCESS') {
          dailyMap[dateStr].success += 1;
        } else {
          dailyMap[dateStr].failed += 1;
        }
        if (log.latency_ms && log.latency_ms > 0) {
          dailyMap[dateStr].totalLatency += log.latency_ms;
          dailyMap[dateStr].countWithLatency += 1;
        }
      }
    });

    const dailyTrend = Object.values(dailyMap).map((item) => ({
      date: item.date,
      day: item.day,
      fullDate: item.fullDate,
      total: item.total,
      success: item.success,
      failed: item.failed,
      avgLatency: item.countWithLatency > 0 ? Math.round(item.totalLatency / item.countWithLatency) : 0,
    }));

    // Hitung ringkasan akumulatif
    const totalRequests14d = dailyTrend.reduce((acc, curr) => acc + curr.total, 0);
    const totalSuccess14d = dailyTrend.reduce((acc, curr) => acc + curr.success, 0);
    const totalFailed14d = dailyTrend.reduce((acc, curr) => acc + curr.failed, 0);
    const successRate = totalRequests14d > 0 ? Math.round((totalSuccess14d / totalRequests14d) * 100) : 100;

    return NextResponse.json({
      success: true,
      data: {
        dailyTrend,
        summary: {
          totalRequests14d,
          totalSuccess14d,
          totalFailed14d,
          successRate,
        },
      },
    });
  } catch (error: any) {
    console.error('[GET /api/scraper-providers/stats] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memuat statistik scraper.' },
      { status: 500 }
    );
  }
}
