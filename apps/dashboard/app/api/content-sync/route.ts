import { NextRequest, NextResponse } from 'next/server';
import { runContentSync } from '@/lib/content-scraper';
import { prisma } from '@employr/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * GET /api/content-sync → statistik konten (artikel, event, sertifikasi)
 */
export async function GET() {
  try {
    const [articles, certifications, events] = await Promise.all([
      prisma.articles.count({ where: { is_published: true } }),
      prisma.certifications.count({ where: { is_active: true } }),
      prisma.events.count({ where: { is_active: true } }),
    ]);
    return NextResponse.json({ success: true, stats: { articles, certifications, events } });
  } catch (error: any) {
    console.error('[GET /api/content-sync] Error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Gagal memuat statistik konten.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/content-sync → jalankan sinkronisasi konten manual
 * (juga dipanggil cron 01:00 WIB via instrumentation.ts)
 */
export async function POST(_req: NextRequest) {
  try {
    const result = await runContentSync();
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('[POST /api/content-sync] Error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Sinkronisasi konten gagal.' },
      { status: 500 }
    );
  }
}
