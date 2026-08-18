import { NextRequest, NextResponse } from 'next/server';
import { loginLinkedIn, toFriendlyError } from '@/lib/linkedin-scraper';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * POST /api/linkedin/login
 * Membuka browser headful ke linkedin.com/login. User login MANUAL di browser
 * tersebut (password tidak pernah disimpan). Setelah login berhasil, cookie
 * sesi disimpan ke .data/linkedin-auth.json.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const timeoutMs = typeof body?.timeoutMs === 'number' ? body.timeoutMs : 300000;

    const result = await loginLinkedIn(timeoutMs);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, message: 'Login berhasil, sesi LinkedIn tersimpan.' });
  } catch (error: any) {
    console.error('[POST /api/linkedin/login] Error:', error);
    return NextResponse.json(
      { success: false, error: toFriendlyError(error, 'Gagal membuka browser login. Silakan coba lagi.') },
      { status: 500 }
    );
  }
}
