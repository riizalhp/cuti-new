import { NextRequest, NextResponse } from 'next/server';
import { BROWSER_PORTALS, loginPortal, clearStoredSession, getPortalStatus } from '@/lib/browser-portals';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PORTAL_IDS = BROWSER_PORTALS.map((p) => p.id);

/**
 * GET /api/portal-session?portal=Indeed
 *   → { portal, name, hasSession }  (tanpa ?portal → status semua portal)
 * POST /api/portal-session  { action: 'login'|'clear', portal, timeoutMs? }
 *   → hasil login / konfirmasi hapus sesi
 */
export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('portal');
    if (id) {
      if (!PORTAL_IDS.includes(id)) {
        return NextResponse.json({ success: false, message: `Portal "${id}" tidak dikenali.` }, { status: 400 });
      }
      return NextResponse.json({ success: true, ...getPortalStatus(id) });
    }
    return NextResponse.json({
      success: true,
      portals: PORTAL_IDS.map((p) => getPortalStatus(p)),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Gagal membaca status sesi.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const action = body?.action;
    const portal = body?.portal;
    if (!PORTAL_IDS.includes(portal)) {
      return NextResponse.json({ success: false, message: 'Portal tidak dikenali.' }, { status: 400 });
    }

    if (action === 'clear') {
      clearStoredSession(portal);
      return NextResponse.json({ success: true, portal, hasSession: false, message: 'Sesi dihapus.' });
    }

    if (action === 'login') {
      const result = await loginPortal(portal, typeof body?.timeoutMs === 'number' ? body.timeoutMs : 300000);
      return NextResponse.json(result);
    }

    return NextResponse.json({ success: false, message: 'Aksi tidak dikenal. Gunakan action "login" atau "clear".' }, { status: 400 });
  } catch (error: any) {
    console.error('[POST /api/portal-session] Error:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Gagal menjalankan aksi sesi.' }, { status: 500 });
  }
}
