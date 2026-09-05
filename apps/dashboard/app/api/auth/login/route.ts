import { NextRequest, NextResponse } from 'next/server';
import { prisma, logSecurityEvent, logApp, extractRequestContext, detectBruteForce } from '@cuti/db';
import { checkRateLimit } from '@/lib/rate-limit';
import crypto from 'crypto';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const parts = storedHash.split(':');
    if (parts.length !== 2) return false;
    const [salt, originalHash] = parts;
    const testHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return testHash === originalHash;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email dan kata sandi wajib diisi.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const ctx = extractRequestContext(req);

    // Rate limiting: Max 10 attempts per minute per IP
    const ipIdentifier = ctx.ip || 'global_login';
    const rateLimit = checkRateLimit(`login_${ipIdentifier}`, { limit: 10, windowMs: 60 * 1000 });
    if (!rateLimit.success) {
      logSecurityEvent({
        eventType: 'LOGIN_FAILED',
        ip: ctx.ip,
        userAgent: ctx.userAgent,
        email: cleanEmail,
        severity: 'WARNING',
        details: { reason: 'rate_limit_exceeded' },
      });
      return NextResponse.json(
        { success: false, message: 'Terlalu banyak percobaan login. Silakan tunggu 1 menit sebelum mencoba kembali.' },
        { status: 429, headers: corsHeaders }
      );
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        accounts: {
          where: { provider_id: 'credential' },
        },
      },
    });

    if (!user) {
      logSecurityEvent({
        eventType: 'LOGIN_FAILED',
        ip: ctx.ip,
        userAgent: ctx.userAgent,
        email: cleanEmail,
        severity: 'WARNING',
        details: { reason: 'user_not_found' },
      });
      logApp({
        source: 'AUTH',
        level: 'WARNING',
        message: `Login failed: email not registered for ${cleanEmail}`,
        ip: ctx.ip,
        endpoint: '/api/auth/login',
        method: 'POST',
        statusCode: 401,
      });

      if (ctx.ip) {
        await detectBruteForce(ctx.ip, cleanEmail);
      }

      return NextResponse.json(
        { success: false, message: 'Email atau kata sandi salah.' },
        { status: 401, headers: corsHeaders }
      );
    }

    const account = user.accounts[0];
    if (!account || !account.password) {
      return NextResponse.json(
        { success: false, message: 'Akun ini terdaftar menggunakan metode lain (seperti Google).' },
        { status: 401, headers: corsHeaders }
      );
    }

    const isValid = verifyPassword(password, account.password);
    if (!isValid) {
      // Log failed login attempt
      logSecurityEvent({
        eventType: 'LOGIN_FAILED',
        ip: ctx.ip,
        userAgent: ctx.userAgent,
        email: cleanEmail,
        userId: user.id,
        severity: 'WARNING',
        details: { reason: 'invalid_password' },
      });
      logApp({
        source: 'AUTH',
        level: 'WARNING',
        message: `Login failed: invalid password for ${cleanEmail}`,
        ip: ctx.ip,
        endpoint: '/api/auth/login',
        method: 'POST',
        statusCode: 401,
      });

      // Check for brute force
      if (ctx.ip) {
        await detectBruteForce(ctx.ip, cleanEmail);
      }

      return NextResponse.json(
        { success: false, message: 'Email atau kata sandi salah.' },
        { status: 401, headers: corsHeaders }
      );
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // Log successful login
    logSecurityEvent({
      eventType: 'LOGIN_SUCCESS',
      ip: ctx.ip,
      userAgent: ctx.userAgent,
      email: cleanEmail,
      userId: user.id,
      severity: 'INFO',
    });
    logApp({
      source: 'AUTH',
      level: 'INFO',
      message: `Login success: ${cleanEmail} (${user.role})`,
      ip: ctx.ip,
      endpoint: '/api/auth/login',
      method: 'POST',
      statusCode: 200,
      userId: user.id,
    });

    // Create secure database session
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
        updated_at: new Date(),
      },
    }).catch((err) => console.warn('[Login] Non-fatal session create err:', err));

    const response = NextResponse.json(
      {
        success: true,
        message: 'Login berhasil.',
        data: {
          ...userData,
          token: sessionToken,
        },
      },
      { status: 200, headers: corsHeaders }
    );

    // Set secure HttpOnly session cookie
    response.cookies.set({
      name: 'cuti_auth_session',
      value: sessionToken,
      maxAge: thirtyDaysInSeconds,
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    // Set non-sensitive UI display cookie for fast header render
    response.cookies.set({
      name: 'cuti_user_session',
      value: encodeURIComponent(JSON.stringify(userData)),
      maxAge: thirtyDaysInSeconds,
      path: '/',
      sameSite: 'lax',
      httpOnly: false,
    });

    return response;
  } catch (error: any) {
    console.error('Error during database login:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan sistem saat memproses login.',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

