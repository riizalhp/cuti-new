import { NextRequest, NextResponse } from 'next/server';
import { prisma, logSecurityEvent, logApp, extractRequestContext } from '@employr/db';
import { checkRateLimit } from '@/lib/rate-limit';
import { sendVerificationOtpEmail } from '@/lib/mailer/otp-service';
import crypto from 'crypto';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name } = body;

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
    const ipIdentifier = ctx.ip || 'global_send_otp';

    // Rate limiting: Maksimal 3 permintaan per IP per 2 menit
    const ipRateLimit = checkRateLimit(`send_otp_ip_${ipIdentifier}`, { limit: 5, windowMs: 2 * 60 * 1000 });
    if (!ipRateLimit.success) {
      return NextResponse.json(
        { success: false, message: 'Terlalu banyak permintaan verifikasi. Silakan tunggu 2 menit.' },
        { status: 429, headers: corsHeaders }
      );
    }

    // Rate limiting per email: Maksimal 1 permintaan per 60 detik
    const emailRateLimit = checkRateLimit(`send_otp_email_${cleanEmail}`, { limit: 1, windowMs: 60 * 1000 });
    if (!emailRateLimit.success) {
      return NextResponse.json(
        { success: false, message: 'Kode verifikasi sudah dikirim. Silakan tunggu 1 menit sebelum mengirim ulang.' },
        { status: 429, headers: corsHeaders }
      );
    }

    // Periksa apakah email sudah terdaftar di database
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email sudah terdaftar. Silakan langsung masuk ke akunmu.' },
        { status: 409, headers: corsHeaders }
      );
    }

    // Generate 6-digit OTP aman
    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const hashedOtp = hashOtp(rawOtp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Berlaku 5 menit
    const now = new Date();

    // Hapus record verifikasi lama untuk email ini agar token lama tidak bisa dipakai
    await prisma.verifications.deleteMany({
      where: { identifier: cleanEmail },
    }).catch(() => {});

    // Simpan token verifikasi baru
    await prisma.verifications.create({
      data: {
        id: crypto.randomUUID(),
        identifier: cleanEmail,
        value: hashedOtp,
        expires_at: expiresAt,
        created_at: now,
        updated_at: now,
      },
    });

    // Kirim email OTP
    const mailResult = await sendVerificationOtpEmail({
      to: cleanEmail,
      name: name || '',
      otp: rawOtp,
    });

    logApp({
      source: 'AUTH',
      level: 'INFO',
      message: `OTP sent to ${cleanEmail}`,
      ip: ctx.ip,
      endpoint: '/api/auth/send-otp',
      method: 'POST',
      statusCode: 200,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Kode verifikasi telah dikirim ke email kamu.',
        expiresInSeconds: 300,
        mailDelivered: mailResult.success,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Error in send-otp API:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem saat mengirim kode verifikasi.' },
      { status: 500, headers: corsHeaders }
    );
  }
}
