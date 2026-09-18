import { NextRequest, NextResponse } from 'next/server';
import { prisma, logSecurityEvent, logApp, extractRequestContext } from '@employr/db';
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

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, otp } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Nama, email, dan kata sandi wajib diisi.' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!otp || typeof otp !== 'string' || otp.trim().length !== 6) {
      return NextResponse.json(
        { success: false, message: 'Kode verifikasi 6-digit wajib diisi.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanOtp = otp.trim();

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Kata sandi minimal 6 karakter.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Rate limiting: Max 5 registration attempts per minute per IP
    const ctx = extractRequestContext(req);
    const ipIdentifier = ctx.ip || 'global_register';
    const rateLimit = checkRateLimit(`register_${ipIdentifier}`, { limit: 5, windowMs: 60 * 1000 });
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, message: 'Terlalu banyak percobaan pendaftaran akun. Silakan tunggu 1 menit sebelum mencoba kembali.' },
        { status: 429, headers: corsHeaders }
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

    // Verifikasi kode OTP dari tabel verifications
    const hashedOtp = crypto.createHash('sha256').update(cleanOtp).digest('hex');
    const verificationRecord = await prisma.verifications.findFirst({
      where: { identifier: cleanEmail },
      orderBy: { created_at: 'desc' },
    });

    if (!verificationRecord) {
      return NextResponse.json(
        { success: false, message: 'Kode verifikasi tidak ditemukan atau belum diminta. Silakan minta kode verifikasi.' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (new Date() > new Date(verificationRecord.expires_at)) {
      await prisma.verifications.deleteMany({ where: { identifier: cleanEmail } }).catch(() => {});
      return NextResponse.json(
        { success: false, message: 'Kode verifikasi telah kedaluwarsa. Silakan minta kode baru.' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (verificationRecord.value !== hashedOtp) {
      return NextResponse.json(
        { success: false, message: 'Kode verifikasi salah. Periksa kembali email kamu.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Hapus verifikasi setelah berhasil (one-time use)
    await prisma.verifications.deleteMany({ where: { identifier: cleanEmail } }).catch(() => {});

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
          email_verified: true,
          name: cleanName,
          role: 'USER',
          onboarded: false,
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
      onboarded: false,
    };

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

    // Create secure database session for automatic login
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
    const expiresAt = new Date(Date.now() + thirtyDaysInSeconds * 1000);

    await prisma.sessions.create({
      data: {
        id: crypto.randomUUID(),
        token: sessionToken,
        user_id: newUser.id,
        expires_at: expiresAt,
        ip_address: ctx.ip || null,
        user_agent: ctx.userAgent || null,
        updated_at: now,
      },
    }).catch((err) => console.warn('[Register] Non-fatal session create err:', err));

    const response = NextResponse.json(
      {
        success: true,
        message: 'Akun berhasil didaftarkan dan langsung masuk.',
        data: {
          ...userData,
          token: sessionToken,
        },
      },
      { status: 201, headers: corsHeaders }
    );

    // Set secure HttpOnly session cookie (employr + legacy cuti)
    response.cookies.set({
      name: 'employr_auth_session',
      value: sessionToken,
      maxAge: thirtyDaysInSeconds,
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
    response.cookies.set({
      name: 'cuti_auth_session',
      value: sessionToken,
      maxAge: thirtyDaysInSeconds,
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    // Set UI display cookie with onboarded: false
    response.cookies.set({
      name: 'employr_user_session',
      value: encodeURIComponent(JSON.stringify(userData)),
      maxAge: thirtyDaysInSeconds,
      path: '/',
      sameSite: 'lax',
      httpOnly: false,
    });
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

