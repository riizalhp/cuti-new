import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@employr/db';
import crypto from 'crypto';
import { sendWelcomeNewsletterEmail } from '@/lib/newsletter-service';

export const dynamic = 'force-dynamic';

function getCorsHeaders(req: NextRequest) {
  const origin = req.headers.get('origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
  };
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(req),
  });
}

export async function POST(req: NextRequest) {
  const headers = getCorsHeaders(req);

  try {
    const body = await req.json();
    const { email, name, source } = body;

    const cleanEmail = email && typeof email === 'string' ? email.trim().toLowerCase() : '';
    const cleanName = name && typeof name === 'string' ? name.trim() : null;
    const cleanSource = source && typeof source === 'string' ? source.trim() : 'PORTAL_LOKER';

    if (!cleanEmail) {
      return NextResponse.json(
        { success: false, message: 'Alamat email wajib diisi.' },
        { status: 400, headers }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, message: 'Format alamat email tidak valid.' },
        { status: 400, headers }
      );
    }

    // Periksa apakah sudah terdaftar
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      if (existing.is_active) {
        return NextResponse.json(
          {
            success: true,
            alreadySubscribed: true,
            message: 'Email kamu sudah terdaftar di buletin karier kami.',
          },
          { status: 200, headers }
        );
      }

      // Jika sebelumnya sudah unsubscribe, aktifkan kembali
      const updated = await prisma.newsletterSubscriber.update({
        where: { id: existing.id },
        data: {
          is_active: true,
          unsubscribed_at: null,
          source: cleanSource,
          updated_at: new Date(),
        },
      });

      // Kirim welcome email kembali di background
      sendWelcomeNewsletterEmail(updated.email, updated.token).catch(console.error);

      return NextResponse.json(
        {
          success: true,
          message: 'Langganan buletin karier kamu telah aktif kembali!',
        },
        { status: 200, headers }
      );
    }

    // Buat subscriber baru
    const token = crypto.randomUUID();
    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        id: crypto.randomUUID(),
        email: cleanEmail,
        name: cleanName,
        source: cleanSource,
        is_active: true,
        token,
      },
    });

    // Kirim welcome email di background
    sendWelcomeNewsletterEmail(subscriber.email, subscriber.token).catch(console.error);

    return NextResponse.json(
      {
        success: true,
        message: 'Berhasil berlangganan buletin karier! Silakan periksa inbox email kamu.',
      },
      { status: 201, headers }
    );
  } catch (error: any) {
    console.error('[Newsletter Subscribe Error]:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kendala saat memproses pendaftaran buletin.' },
      { status: 500, headers }
    );
  }
}
