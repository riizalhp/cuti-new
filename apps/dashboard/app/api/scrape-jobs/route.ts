import { NextRequest, NextResponse } from 'next/server';
import { runScrape } from '@/lib/job-scraper';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/scrape-jobs
 * Body: { keyword, location?, portals?: PortalId[] }
 * Menjalankan bot scraper server-side terhadap halaman publik portal lowongan,
 * lalu mengembalikan lowongan hasil scraping + log real-time.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const keyword = typeof body?.keyword === 'string' ? body.keyword.trim() : '';

    if (!keyword) {
      return NextResponse.json(
        { success: false, message: 'Kata kunci / posisi pekerjaan wajib diisi.' },
        { status: 400 }
      );
    }

    const allowed = [
      'Jobstreet', 'Glints', 'Dealls', 'Talent', 'LinkedIn', 'Kalibrr', 'Jobindo',
      'Jora', 'Jobinaja', 'Lokernas', 'OfficialKarir', 'LogKerja',
      'Indeed', 'Loker.id', 'Jooble', 'CakeResume', 'Karir.com', 'KitaLulus',
      'LokerHeadOffice', 'SejakKemarin', 'LamarLangsung', 'InfoLokerKerja', 'SolusiKerja',
      'BursaKerjaDepnaker', 'LokerAnakMedan', 'InfoLokerJabar', 'InfoLokerBanten',
      'InfoLokerKarawang', 'LokerMuslim', 'LowkerJogja',
    ];
    const portals = Array.isArray(body.portals)
      ? body.portals.filter((p: string) => allowed.includes(p))
      : [
          'Jobstreet', 'Glints', 'Dealls', 'Talent', 'Kalibrr', 'Jobindo',
          'Jora', 'Jobinaja', 'Lokernas', 'OfficialKarir', 'LogKerja',
          'LokerHeadOffice', 'SejakKemarin', 'LamarLangsung', 'InfoLokerKerja', 'SolusiKerja',
          'BursaKerjaDepnaker', 'LokerAnakMedan', 'InfoLokerJabar', 'InfoLokerBanten',
          'InfoLokerKarawang', 'LokerMuslim', 'LowkerJogja',
        ];

    const result = await runScrape({ keyword, location: body.location, portals });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('[POST /api/scrape-jobs] Error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Bot scraping gagal dijalankan.' },
      { status: 500 }
    );
  }
}
