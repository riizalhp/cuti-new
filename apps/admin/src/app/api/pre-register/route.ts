import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@cuti/db';
import crypto from 'crypto';

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
    const { name, email, phone_number, role_status } = body;

    const cleanPhone = phone_number ? String(phone_number).trim() : '';
    const cleanName = name && String(name).trim() ? String(name).trim() : (cleanPhone || 'Friend');
    const cleanRole = role_status ? String(role_status).trim() : 'EARLY_TESTER';

    if (!cleanPhone && (!email || !String(email).trim())) {
      return NextResponse.json(
        { success: false, message: 'Harap masukkan nomor WhatsApp yang valid.' },
        { status: 400, headers }
      );
    }

    // Format phone to normalized string (e.g. 0812... or 62812...)
    const normalizedPhone = cleanPhone.replace(/[^0-9+]/g, '');

    // If email is provided, validate it. Otherwise create a virtual unique placeholder email
    let cleanEmail = email && String(email).trim() ? String(email).trim().toLowerCase() : '';
    if (cleanEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        return NextResponse.json(
          { success: false, message: 'Alamat email tidak valid.' },
          { status: 400, headers }
        );
      }
    } else {
      // Synthetic email for database uniqueness
      const safePhoneKey = normalizedPhone.replace(/\+/g, '') || crypto.randomUUID().slice(0, 8);
      cleanEmail = `wa_${safePhoneKey}@wa.employr.id`;
    }

    // Check if phone or email is already in early_testers
    let existingTester = null;
    try {
      if ((prisma as any).earlyTester) {
        if (normalizedPhone) {
          existingTester = await (prisma as any).earlyTester.findFirst({
            where: {
              OR: [
                { phone_number: normalizedPhone },
                { phone_number: cleanPhone },
                { email: cleanEmail },
              ],
            },
          });
        } else {
          existingTester = await (prisma as any).earlyTester.findUnique({
            where: { email: cleanEmail },
          });
        }
      }
    } catch (e) {
      console.warn('[Admin Pre-Register] Prisma lookup warning:', e);
    }

    if (existingTester) {
      return NextResponse.json(
        {
          success: true,
          isExisting: true,
          message: 'Nomor kamu sudah terdaftar di daftar tunggu! Kami akan segera menghubungimu.',
          data: {
            id: existingTester.id,
            name: existingTester.name,
            phone_number: existingTester.phone_number,
          },
        },
        { status: 200, headers }
      );
    }

    // Insert new early tester record
    let newTester = null;
    if ((prisma as any).earlyTester) {
      newTester = await (prisma as any).earlyTester.create({
        data: {
          id: crypto.randomUUID(),
          name: cleanName,
          email: cleanEmail,
          phone_number: cleanPhone || normalizedPhone,
          role_status: cleanRole,
          status: 'REGISTERED',
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Pendaftaran berhasil! Kamu resmi terdaftar sebagai Early Tester.',
        data: {
          id: newTester?.id,
          name: newTester?.name || cleanName,
          email: newTester?.email || cleanEmail,
          role_status: newTester?.role_status || cleanRole,
        },
      },
      { status: 201, headers }
    );
  } catch (err: any) {
    console.error('[Admin Pre-Register API Error]:', err);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.' },
      { status: 500, headers }
    );
  }
}
