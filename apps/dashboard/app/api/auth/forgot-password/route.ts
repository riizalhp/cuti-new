import { NextRequest, NextResponse } from 'next/server';
import { prisma, logSecurityEvent, logApp, extractRequestContext } from '@employr/db';
import { checkRateLimit } from '@/lib/rate-limit';
import { sendResetPasswordEmail } from '@/lib/mailer/reset-password-service';
import crypto from 'crypto';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

function getBaseUrl(req: NextRequest): string {
  const origin = req.headers.get('origin');
  if (origin && (origin.includes('localhost') || origin.includes('employr.id') || origin.includes('ambilcuti.id'))) {
    return origin;
  }
  const host = req.headers.get('host');
  if (host) {
    const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    return `${proto}://${host}`;
  }
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Alamat email wajib diisi.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, message: 'Format alamat email tidak valid.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const ctx = extractRequestContext(req);
    const ipIdentifier = ctx.ip || 'global_forgot_password';

    // Rate limiting: Maksimal 5 permintaan per IP per 2 menit
    const ipRateLimit = checkRateLimit(`forgot_pw_ip_${ipIdentifier}`, { limit: 5, windowMs: 2 * 60 * 1000 });
    if (!ipRateLimit.success) {
      return NextResponse.json(
        { success: false, message: 'Terlalu banyak permintaan reset kata sandi. Silakan tunggu 2 menit.' },
        { status: 429, headers: corsHeaders }
      );
    }

    // Rate limiting per email: Maksimal 1 permintaan per 60 detik
    const emailRateLimit = checkRateLimit(`forgot_pw_email_${cleanEmail}`, { limit: 1, windowMs: 60 * 1000 });
    if (!emailRateLimit.success) {
      return NextResponse.json(
        { success: false, message: 'Tautan reset baru saja dikirim. Silakan tunggu 1 menit sebelum mengirim ulang.' },
        { status: 429, headers: corsHeaders }
      );
    }

    // Cari user di database
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true, name: true, email: true },
    });

    // Anti-harvesting protection: Jika user tidak ditemukan, tetap kembalikan pesan sukses generik
    if (!user) {
      logApp({
        source: 'AUTH',
        level: 'INFO',
        message: `Password reset requested for unregistered email: ${cleanEmail}`,
        ip: ctx.ip,
        endpoint: '/api/auth/forgot-password',
        method: 'POST',
        statusCode: 200,
      });

      return NextResponse.json(
        {
          success: true,
          message: 'Jika email terdaftar di Employr, tautan pengaturan ulang kata sandi telah dikirim ke inbox kamu.',
        },
        { status: 200, headers: corsHeaders }
      );
    }

    // Buat cryptographically secure random token (32 bytes = 64 hex characters)
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 menit sesuai OWASP standard
    const now = new Date();

    const verificationIdentifier = `reset_password:${cleanEmail}`;

    // Hapus token reset sebelumnya untuk email ini
    await prisma.verifications.deleteMany({
      where: { identifier: verificationIdentifier },
    }).catch(() => {});

    // Simpan token baru di tabel verifications
    await prisma.verifications.create({
      data: {
        id: crypto.randomUUID(),
        identifier: verificationIdentifier,
        value: hashedToken,
        expires_at: expiresAt,
        created_at: now,
        updated_at: now,
      },
    });

    // Susun URL reset password
    const baseUrl = getBaseUrl(req);
    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(cleanEmail)}`;

    // Kirim email
    const mailResult = await sendResetPasswordEmail({
      to: cleanEmail,
      name: user.name || '',
      resetUrl,
    });

    logApp({
      source: 'AUTH',
      level: 'INFO',
      message: `Password reset email sent to ${cleanEmail}`,
      ip: ctx.ip,
      endpoint: '/api/auth/forgot-password',
      method: 'POST',
      statusCode: 200,
      userId: user.id,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Jika email terdaftar di Employr, tautan pengaturan ulang kata sandi telah dikirim ke inbox kamu.',
        mailDelivered: mailResult.success,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Error in forgot-password API:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem saat memproses permintaan reset kata sandi.' },
      { status: 500, headers: corsHeaders }
    );
  }
}
