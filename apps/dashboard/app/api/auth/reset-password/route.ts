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
    const { email, token, password, confirmPassword } = body;

    if (!email || !token || !password) {
      return NextResponse.json(
        { success: false, message: 'Email, token verifikasi, dan kata sandi baru wajib diisi.' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Konfirmasi kata sandi tidak cocok.' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Kata sandi baru minimal harus 8 karakter.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanToken = token.trim();
    const ctx = extractRequestContext(req);
    const ipIdentifier = ctx.ip || 'global_reset_password';

    // Rate limiting: Maksimal 5 percobaan reset per IP per 5 menit
    const rateLimit = checkRateLimit(`reset_pw_ip_${ipIdentifier}`, { limit: 5, windowMs: 5 * 60 * 1000 });
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, message: 'Terlalu banyak percobaan reset kata sandi. Silakan tunggu 5 menit.' },
        { status: 429, headers: corsHeaders }
      );
    }

    // Hash token yang diterima untuk dicocokkan dengan yang ada di database
    const hashedToken = crypto.createHash('sha256').update(cleanToken).digest('hex');
    const verificationIdentifier = `reset_password:${cleanEmail}`;

    const verification = await prisma.verifications.findFirst({
      where: {
        identifier: verificationIdentifier,
        value: hashedToken,
      },
    });

    if (!verification) {
      logSecurityEvent({
        eventType: 'UNAUTHORIZED_ACCESS',
        ip: ctx.ip,
        userAgent: ctx.userAgent,
        email: cleanEmail,
        severity: 'WARNING',
        details: { reason: 'invalid_reset_token' },
      });
      return NextResponse.json(
        { success: false, message: 'Tautan pengaturan ulang kata sandi tidak valid atau telah digunakan.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Periksa masa berlaku token
    if (new Date() > new Date(verification.expires_at)) {
      // Hapus token yang sudah kedaluwarsa
      await prisma.verifications.delete({ where: { id: verification.id } }).catch(() => {});

      logSecurityEvent({
        eventType: 'UNAUTHORIZED_ACCESS',
        ip: ctx.ip,
        userAgent: ctx.userAgent,
        email: cleanEmail,
        severity: 'WARNING',
        details: { reason: 'reset_token_expired' },
      });
      return NextResponse.json(
        { success: false, message: 'Tautan pengaturan ulang kata sandi telah kedaluwarsa (lebih dari 15 menit). Silakan ajukan tautan baru.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Cari user di database
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        accounts: {
          where: { provider_id: 'credential' },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Akun dengan email ini tidak ditemukan.' },
        { status: 404, headers: corsHeaders }
      );
    }

    const newHashedPassword = hashPassword(password);
    const now = new Date();

    // Jalankan pembaruan kata sandi, invalidasi sesi, dan hapus token
    await prisma.$transaction(async (tx) => {
      // 1. Perbarui atau buat akun credential
      if (user.accounts && user.accounts.length > 0) {
        await tx.accounts.update({
          where: { id: user.accounts[0].id },
          data: {
            password: newHashedPassword,
            updated_at: now,
          },
        });
      } else {
        await tx.accounts.create({
          data: {
            id: crypto.randomUUID(),
            user_id: user.id,
            account_id: user.id,
            provider_id: 'credential',
            password: newHashedPassword,
            updated_at: now,
          },
        });
      }

      // 2. Invalidate / hapus semua sesi aktif untuk memaksa login ulang dari semua perangkat
      await tx.sessions.deleteMany({
        where: { user_id: user.id },
      });

      // 3. Hapus token verifikasi yang telah digunakan agar tidak bisa dipakai ulang
      await tx.verifications.delete({
        where: { id: verification.id },
      });
    });

    logSecurityEvent({
      eventType: 'PASSWORD_CHANGED',
      ip: ctx.ip,
      userAgent: ctx.userAgent,
      email: cleanEmail,
      userId: user.id,
      severity: 'INFO',
    });

    logApp({
      source: 'AUTH',
      level: 'INFO',
      message: `Password reset successfully completed for ${cleanEmail}`,
      ip: ctx.ip,
      endpoint: '/api/auth/reset-password',
      method: 'POST',
      statusCode: 200,
      userId: user.id,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Kata sandi berhasil diperbarui. Silakan masuk kembali menggunakan kata sandi baru kamu.',
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Error in reset-password API:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem saat memperbarui kata sandi.' },
      { status: 500, headers: corsHeaders }
    );
  }
}
