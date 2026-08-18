import { NextResponse } from 'next/server';
import { hasStoredSession, checkLinkedInSession, toFriendlyError } from '@/lib/linkedin-scraper';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * GET /api/linkedin/auth-status
 * Cek apakah ada sesi login LinkedIn tersimpan dan masih valid.
 */
export async function GET() {
  try {
    if (!hasStoredSession()) {
      return NextResponse.json({ success: false, loggedIn: false, error: 'Belum ada sesi login.' });
    }
    const result = await checkLinkedInSession();
    return NextResponse.json({
      success: result.success,
      loggedIn: result.success,
      error: result.error,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, loggedIn: false, error: toFriendlyError(error, 'Gagal memeriksa sesi LinkedIn. Silakan coba lagi.') },
      { status: 500 }
    );
  }
}
