import { NextRequest, NextResponse } from 'next/server';
import { prisma, logSecurityEvent, logApp, extractRequestContext } from '@employr/db';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  const host = req.headers.get('host') || '';
  const protocol = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (host ? `${protocol}://${host}` : 'https://app.employr.id');
  const redirectUri = `${baseUrl}/api/auth/callback/google`;

  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  const errorParam = req.nextUrl.searchParams.get('error');
  const savedState = req.cookies.get('oauth_state')?.value;

  if (errorParam) {
    console.warn('[Google OAuth] Error from Google consent:', errorParam);
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(errorParam)}`, baseUrl));
  }

  const [stateSecret, targetDest] = (state || '').split('|');
  const destination = targetDest ? decodeURIComponent(targetDest) : '/beranda';

  // Validasi proteksi CSRF state
  if (!code || !stateSecret || !savedState || stateSecret !== savedState) {
    console.error('[Google OAuth] State mismatch or missing code.');
    return NextResponse.redirect(new URL('/login?error=invalid_oauth_state', baseUrl));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/login?error=missing_oauth_keys', baseUrl));
  }

  const ctx = extractRequestContext(req);

  try {
    // 1. Tukar authorization code dengan Access Token Google
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('[Google OAuth] Token exchange failed:', tokenData);
      return NextResponse.redirect(new URL('/login?error=oauth_token_exchange_failed', baseUrl));
    }

    // 2. Ambil data profil pengguna dari Google
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const profile = await profileResponse.json();

    if (!profileResponse.ok || !profile.email) {
      console.error('[Google OAuth] Failed to fetch Google profile:', profile);
      return NextResponse.redirect(new URL('/login?error=oauth_profile_fetch_failed', baseUrl));
    }

    const cleanEmail = profile.email.toLowerCase().trim();
    const googleId = String(profile.id);
    const displayName = profile.name || cleanEmail.split('@')[0];
    const avatarUrl = profile.picture || null;
    const now = new Date();

    // 3. Sinkronkan dengan Database Prisma
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        accounts: true,
      },
    });

    if (!user) {
      // User belum pernah mendaftar: buat user baru + akun provider google + membership free
      const userId = crypto.randomUUID();
      user = await prisma.user.create({
        data: {
          id: userId,
          email: cleanEmail,
          email_verified: Boolean(profile.verified_email),
          name: displayName,
          avatar_url: avatarUrl,
          role: 'USER',
          updated_at: now,
          accounts: {
            create: {
              id: crypto.randomUUID(),
              account_id: googleId,
              provider_id: 'google',
              access_token: tokenData.access_token,
              refresh_token: tokenData.refresh_token || null,
              id_token: tokenData.id_token || null,
              updated_at: now,
            },
          },
          memberships: {
            create: {
              id: crypto.randomUUID(),
              tier: 'FREE',
              is_lifetime: true,
              is_active: true,
            },
          },
        },
        include: {
          accounts: true,
        },
      });

      logSecurityEvent({
        eventType: 'LOGIN_SUCCESS',
        ip: ctx.ip,
        userAgent: ctx.userAgent,
        email: cleanEmail,
        userId: user.id,
        severity: 'INFO',
        details: { method: 'google_oauth_register' },
      });
    } else {
      // Hubungkan provider Google ke akun user jika belum tersambung
      const hasGoogleAccount = user.accounts.some(
        (acc) => acc.provider_id === 'google' && acc.account_id === googleId
      );

      if (!hasGoogleAccount) {
        await prisma.accounts.create({
          data: {
            id: crypto.randomUUID(),
            user_id: user.id,
            account_id: googleId,
            provider_id: 'google',
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token || null,
            id_token: tokenData.id_token || null,
            updated_at: now,
          },
        });
      }

      // Update avatar jika belum ada
      if (!user.avatar_url && avatarUrl) {
        await prisma.user.update({
          where: { id: user.id },
          data: { avatar_url: avatarUrl },
        }).catch(() => {});
      }
    }

    // 4. Deteksi status onboarding pengguna
    let isOnboarded = Boolean(user.onboarded);
    if (!isOnboarded) {
      const hasExistingCv = await prisma.cv_projects.findFirst({
        where: { user_id: user.id },
        select: { id: true },
      });
      if (hasExistingCv || user.education || user.target_job) {
        isOnboarded = true;
        await prisma.user.update({
          where: { id: user.id },
          data: { onboarded: true },
        }).catch(() => {});
      }
    }

    // 5. Buat sesi aman di tabel sessions
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
    const expiresAt = new Date(Date.now() + thirtyDaysInSeconds * 1000);

    await prisma.sessions.create({
      data: {
        id: crypto.randomUUID(),
        token: sessionToken,
        user_id: user.id,
        expires_at: expiresAt,
        ip_address: ctx.ip || null,
        user_agent: ctx.userAgent || null,
        updated_at: now,
      },
    }).catch((err) => console.warn('[Google OAuth] Non-fatal session create err:', err));

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar_url || avatarUrl,
      onboarded: isOnboarded,
    };

    logSecurityEvent({
      eventType: 'LOGIN_SUCCESS',
      ip: ctx.ip,
      userAgent: ctx.userAgent,
      email: cleanEmail,
      userId: user.id,
      severity: 'INFO',
      details: { method: 'google_oauth' },
    });

    logApp({
      source: 'AUTH',
      level: 'INFO',
      message: `Google OAuth login success: ${cleanEmail}`,
      ip: ctx.ip,
      endpoint: '/api/auth/callback/google',
      method: 'GET',
      statusCode: 200,
      userId: user.id,
    });

    // 6. Siapkan respon redirect
    const targetUrl = isOnboarded ? destination : '/onboarding';
    const redirectResponse = NextResponse.redirect(new URL(targetUrl, baseUrl));

    // Pasang session cookies (employr + legacy cuti)
    redirectResponse.cookies.set({
      name: 'employr_auth_session',
      value: sessionToken,
      maxAge: thirtyDaysInSeconds,
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
    redirectResponse.cookies.set({
      name: 'cuti_auth_session',
      value: sessionToken,
      maxAge: thirtyDaysInSeconds,
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    // Pasang display session cookies untuk UI client-side
    redirectResponse.cookies.set({
      name: 'employr_user_session',
      value: JSON.stringify(userData),
      maxAge: thirtyDaysInSeconds,
      path: '/',
      sameSite: 'lax',
      httpOnly: false,
    });
    redirectResponse.cookies.set({
      name: 'cuti_user_session',
      value: JSON.stringify(userData),
      maxAge: thirtyDaysInSeconds,
      path: '/',
      sameSite: 'lax',
      httpOnly: false,
    });

    // Hapus state cookie setelah selesai
    redirectResponse.cookies.delete('oauth_state');

    return redirectResponse;
  } catch (error) {
    console.error('[Google OAuth Callback] Unexpected error:', error);
    return NextResponse.redirect(new URL('/login?error=oauth_internal_error', baseUrl));
  }
}
