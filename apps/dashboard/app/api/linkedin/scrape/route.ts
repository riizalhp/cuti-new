import { NextRequest, NextResponse } from 'next/server';
import { scrapeLinkedInProfile, hasStoredSession, toFriendlyError } from '@/lib/linkedin-scraper';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

/**
 * POST /api/linkedin/scrape
 * Body: { url: "https://www.linkedin.com/in/username/" }
 * Mengambil SELURUH data profil LinkedIn dari URL menggunakan sesi login
 * pengguna yang sudah tersimpan (tanpa menyimpan password).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const url = typeof body?.url === 'string' ? body.url.trim() : '';

    if (!url) {
      return NextResponse.json({ success: false, error: 'Link URL LinkedIn wajib diisi.' }, { status: 400 });
    }
    if (!hasStoredSession()) {
      return NextResponse.json(
        { success: false, error: 'Belum ada sesi login. Klik "Login LinkedIn" terlebih dahulu.' },
        { status: 401 }
      );
    }

    const result = await scrapeLinkedInProfile(url);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: result.data });
  } catch (error: any) {
    console.error('[POST /api/linkedin/scrape] Error:', error);
    return NextResponse.json(
      { success: false, error: toFriendlyError(error, 'Gagal mengekstrak profil LinkedIn. Silakan coba lagi.') },
      { status: 500 }
    );
  }
}
