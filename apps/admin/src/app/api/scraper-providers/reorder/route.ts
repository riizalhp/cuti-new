import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@employr/db';

export const dynamic = 'force-dynamic';

// POST /api/scraper-providers/reorder — Atur ulang urutan prioritas fallback secara massal
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items } = body; // Array of { id: string, priority: number }

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: 'Format data items tidak valid.' },
        { status: 400 }
      );
    }

    await prisma.$transaction(
      items.map((item) =>
        prisma.scraper_providers.update({
          where: { id: item.id },
          data: { priority: item.priority },
        })
      )
    );

    const updated = await prisma.scraper_providers.findMany({
      orderBy: [{ priority: 'asc' }, { created_at: 'asc' }],
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    console.error('[POST /api/scraper-providers/reorder] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal mengubah urutan prioritas.' },
      { status: 500 }
    );
  }
}
