import { NextRequest, NextResponse } from 'next/server';
import { prisma, logSecurityEvent, logApp, extractRequestContext } from '@cuti/db';
import crypto from 'crypto';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Nama, email, dan kata sandi wajib diisi.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Kata sandi minimal 6 karakter.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if email already exists in real database
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email sudah terdaftar. Silakan gunakan email lain atau langsung masuk.' },
        { status: 409, headers: corsHeaders }
      );
    }

    const hashedPassword = hashPassword(password);
    const userId = crypto.randomUUID();
    const accountId = crypto.randomUUID();
    const membershipId = crypto.randomUUID();

    // Create User, Account, and Membership in PostgreSQL transaction
    const now = new Date();
    const [newUser] = await prisma.$transaction([
      prisma.user.create({
        data: {
          id: userId,
          email: cleanEmail,
          name: cleanName,
          role: 'USER',
          updated_at: now,
        },
      }),
      prisma.accounts.create({
        data: {
          id: accountId,
          user_id: userId,
          account_id: userId,
          provider_id: 'credential',
          password: hashedPassword,
          updated_at: now,
        },
      }),
      prisma.membership.create({
        data: {
          id: membershipId,
          user_id: userId,
          tier: 'FREE',
          is_lifetime: true,
          is_active: true,
        },
      }),
    ]);

    const userData = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };

    const ctx = extractRequestContext(req);
    logSecurityEvent({
      eventType: 'LOGIN_SUCCESS',
      ip: ctx.ip,
      userAgent: ctx.userAgent,
      email: cleanEmail,
      userId: newUser.id,
      severity: 'INFO',
      details: { action: 'registration' },
    });
    logApp({
      source: 'AUTH',
      level: 'INFO',
      message: `New user registered: ${cleanEmail}`,
      ip: ctx.ip,
      endpoint: '/api/auth/register',
      method: 'POST',
      statusCode: 201,
      userId: newUser.id,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: 'Akun berhasil didaftarkan di database.',
        data: userData,
      },
      { status: 201, headers: corsHeaders }
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
  } catch (error: any) {
    console.error('Error during registration process:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan sistem saat memproses pendaftaran.',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

