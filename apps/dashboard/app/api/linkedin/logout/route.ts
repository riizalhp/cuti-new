import { NextResponse } from 'next/server';
import { clearStoredSession } from '@/lib/linkedin-scraper';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/linkedin/logout
 * Menghapus sesi login LinkedIn yang tersimpan di .data/linkedin-auth.json.
 */
export async function POST() {
  try {
    clearStoredSession();
    return NextResponse.json({ success: true, message: 'Sesi LinkedIn dihapus.' });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus sesi. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
