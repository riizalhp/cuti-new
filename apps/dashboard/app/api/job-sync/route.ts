import { NextRequest, NextResponse } from 'next/server';
import { runScrape } from '@/lib/job-scraper';
import { syncJobsToDb, getSyncStats } from '@/lib/job-sync';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * GET /api/job-sync → statistik DB (audit)
 */
export async function GET() {
  try {
    const stats = await getSyncStats();
    return NextResponse.json({ success: true, stats });
  } catch (error: any) {
    console.error('[GET /api/job-sync] Error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Gagal memuat statistik sinkronisasi.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/job-sync → jalankan scrape + simpan ke DB (dedupe + auto-nonaktif)
 * Body: { keyword, location?, portals? }
 * Dipakai tombol "Sinkronkan Sekarang" di /scrape-jobs dan bisa dipanggil
 * oleh cron eksternal (mis. Vercel Cron / system crontab) jam 01:00 WIB.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const keyword = typeof body?.keyword === 'string' ? body.keyword.trim() : '';

    const allowed = [
      'Jobstreet', 'Glints', 'Dealls', 'Talent', 'LinkedIn', 'Kalibrr', 'Jobindo',
      'Jora', 'Jobinaja', 'Lokernas', 'OfficialKarir', 'LogKerja',
      'Indeed', 'Loker.id', 'Jooble', 'CakeResume', 'Karir.com', 'KitaLulus',
      'LokerHeadOffice', 'SejakKemarin', 'LamarLangsung', 'InfoLokerKerja', 'SolusiKerja',
      'BursaKerjaDepnaker', 'LokerAnakMedan', 'InfoLokerJabar', 'InfoLokerBanten',
      'InfoLokerKarawang', 'LokerMuslim', 'LowkerJogja', 'Disnakerja',
    ];
    const portals = Array.isArray(body?.portals)
      ? body.portals.filter((p: string) => allowed.includes(p))
      : undefined;

    const result = await runScrape({ keyword, location: body?.location, portals });
    const sync = await syncJobsToDb(result.jobs);

    return NextResponse.json({
      success: true,
      keyword,
      scraped: result.jobs.length,
      ...sync,
      stats: await getSyncStats(),
    });
  } catch (error: any) {
    console.error('[POST /api/job-sync] Error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Sinkronisasi gagal dijalankan.' },
      { status: 500 }
    );
  }
}
