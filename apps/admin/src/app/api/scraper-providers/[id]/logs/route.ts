import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@employr/db';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/scraper-providers/[id]/logs — Ambil riwayat detail penggunaan API & log error
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const provider = await prisma.scraper_providers.findUnique({
      where: { id },
    });

    if (!provider) {
      return NextResponse.json(
        { success: false, error: 'Provider tidak ditemukan.' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 200);
    const statusFilter = searchParams.get('status');

    const whereClause: any = { provider_id: id };
    if (statusFilter && statusFilter !== 'ALL') {
      if (statusFilter === 'FAILED') {
        whereClause.status = { in: ['FAILED', 'EXHAUSTED', 'RATE_LIMITED'] };
      } else {
        whereClause.status = statusFilter;
      }
    }

    const logs = await prisma.scraper_logs.findMany({
      where: whereClause,
      orderBy: { created_at: 'desc' },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      provider: {
        id: provider.id,
        label: provider.label,
        provider: provider.provider,
        status: provider.status,
        requests_total: provider.requests_total,
        requests_month: provider.requests_month,
        success_count: provider.success_count,
        fail_count: provider.fail_count,
        last_used_at: provider.last_used_at,
        last_error: provider.last_error,
      },
      data: logs,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Gagal mengambil log scraper.' },
      { status: 500 }
    );
  }
}
