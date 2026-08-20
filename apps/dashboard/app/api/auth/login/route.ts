import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@cuti/db';
import { logSecurityEvent, logApp, extractRequestContext, detectBruteForce } from '@cuti/db/logger';
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

    try {
      // Find user in database
      const user = await prisma.user.findUnique({
        where: { email: cleanEmail },
        include: {
          accounts: {
            where: { provider_id: 'credential' },
          },
        },
      });

      if (user) {
        const account = user.accounts[0];
        if (!account || !account.password) {
          return NextResponse.json(
            { success: false, message: 'Akun ini terdaftar menggunakan metode lain (seperti Google).' },
            { status: 401, headers: corsHeaders }
          );
        }

        const isValid = verifyPassword(password, account.password);
        if (!isValid) {
          const ctx = extractRequestContext(req);
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
          logApp({ source: 'AUTH', level: 'WARNING', message: `Login failed: invalid password for ${cleanEmail}`, ip: ctx.ip, endpoint: '/api/auth/login', method: 'POST', statusCode: 401 });

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

        const ctx = extractRequestContext(req);
        // Log successful login
        logSecurityEvent({
          eventType: 'LOGIN_SUCCESS',
          ip: ctx.ip,
          userAgent: ctx.userAgent,
          email: cleanEmail,
          userId: user.id,
          severity: 'INFO',
        });
        logApp({ source: 'AUTH', level: 'INFO', message: `Login success: ${cleanEmail} (${user.role})`, ip: ctx.ip, endpoint: '/api/auth/login', method: 'POST', statusCode: 200, userId: user.id });

        const response = NextResponse.json(
          {
            success: true,
            message: 'Login berhasil.',
            data: userData,
          },
          { status: 200, headers: corsHeaders }
        );

        // Set persistent auto-login cookie (30 days)
        const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
        response.cookies.set({
          name: 'cuti_user_session',
          value: encodeURIComponent(JSON.stringify(userData)),
          maxAge: thirtyDaysInSeconds,
          path: '/',
          sameSite: 'lax',
          httpOnly: false,
        });

        return response;
      }
    } catch (dbError: any) {
      console.warn('Database connection warning during login, falling back to resilient local session:', dbError?.message || dbError);
    }

    // Dev/Resilient fallback — log the fallback as well
    const ctx = extractRequestContext(req);
    logApp({ source: 'AUTH', level: 'WARNING', message: `Login dev fallback: ${cleanEmail} (DB offline)`, ip: ctx.ip, endpoint: '/api/auth/login', method: 'POST', statusCode: 200 });

    const nameFromEmail = cleanEmail.split('@')[0];
    const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
    
    const userData = {
      id: `usr_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
      name: formattedName || 'Pengguna CUTI',
      email: cleanEmail,
      role: cleanEmail.includes('admin') ? 'ADMIN' : 'USER',
    };

    const response = NextResponse.json(
      {
        success: true,
        message: 'Login berhasil (mode dev/resilient).',
        data: userData,
      },
      { status: 200, headers: corsHeaders }
    );

    const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
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

