import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  // Tentukan Base URL secara dinamis (mendukung dev localhost & production app.employr.id)
  const host = req.headers.get('host') || '';
  const protocol = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (host ? `${protocol}://${host}` : 'https://app.employr.id');
  const redirectUri = `${baseUrl}/api/auth/callback/google`;

  if (!clientId || clientId.includes('your-google-client-id')) {
    return NextResponse.redirect(
      new URL('/login?error=google_oauth_not_configured', baseUrl)
    );
  }

  // Token anti-CSRF dan target redirect
  const randomState = crypto.randomBytes(16).toString('hex');
  const targetParam = req.nextUrl.searchParams.get('redirect') || '/beranda';
  const statePayload = `${randomState}|${encodeURIComponent(targetParam)}`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
    state: statePayload,
  });

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  const response = NextResponse.redirect(googleAuthUrl);

  // Simpan state di cookie untuk validasi saat callback
  response.cookies.set({
    name: 'oauth_state',
    value: randomState,
    maxAge: 600, // 10 menit
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return response;
}
