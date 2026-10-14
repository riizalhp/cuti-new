import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@employr/db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  return handleLogoutAction(req);
}

export async function POST(req: NextRequest) {
  return handleLogoutAction(req);
}

async function handleLogoutAction(req: NextRequest) {
  try {
    // 1. Invalidate session in database if token exists
    const authToken =
      req.cookies.get('employr_auth_session')?.value ||
      req.cookies.get('employr_auth_token')?.value ||
      req.cookies.get('cuti_auth_session')?.value ||
      req.cookies.get('cuti_auth_token')?.value;

    let tokenToDelete = authToken?.trim();

    if (!tokenToDelete) {
      const authHeader = req.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        tokenToDelete = authHeader.substring(7).trim();
      }
    }

    if (tokenToDelete && tokenToDelete.length >= 16) {
      await prisma.sessions.deleteMany({
        where: { token: tokenToDelete },
      }).catch((err: unknown) => {
        console.warn('[Logout API] Non-fatal DB session deletion error:', err);
      });
    }
  } catch (err: unknown) {
    console.warn('[Logout API] Error checking DB session:', err);
  }

  const response = NextResponse.json(
    { success: true, message: 'Berhasil logout.' },
    { status: 200, headers: corsHeaders }
  );

  // 2. Clear all auth and session cookies (employr + legacy cuti)
  const cookieNames = [
    'employr_user_session',
    'employr_auth_session',
    'employr_auth_token',
    'cuti_user_session',
    'cuti_auth_session',
    'cuti_auth_token',
    'better-auth.session_token',
  ];

  cookieNames.forEach((name) => {
    response.cookies.delete(name);
    response.cookies.set({
      name,
      value: '',
      maxAge: 0,
      expires: new Date(0),
      path: '/',
      sameSite: 'lax',
    });
  });

  return response;
}
