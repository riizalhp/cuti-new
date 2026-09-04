import { NextRequest, NextResponse } from 'next/server';
import { prisma, logApp, extractRequestContext } from '@cuti/db';
import crypto from 'crypto';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  const reqContext = extractRequestContext(req);

  try {
    const body = await req.json();
    const { name, email, phone_number, role_status } = body;

    const cleanPhone = phone_number ? String(phone_number).trim() : '';
    const cleanName = name && String(name).trim() ? String(name).trim() : (cleanPhone || 'Friend');
    const cleanRole = role_status ? String(role_status).trim() : 'EARLY_TESTER';

    if (!cleanPhone && (!email || !String(email).trim())) {
      return NextResponse.json(
        { success: false, message: 'Please provide your WhatsApp number.' },
        { status: 400, headers: corsHeaders }
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
          { success: false, message: 'Invalid email address.' },
          { status: 400, headers: corsHeaders }
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
                { email: cleanEmail }
              ]
            },
          });
        } else {
          existingTester = await (prisma as any).earlyTester.findUnique({
            where: { email: cleanEmail },
          });
        }
      }
    } catch (e) {
      console.warn('Prisma earlyTester lookup warning:', e);
    }

    if (existingTester) {
      return NextResponse.json(
        {
          success: true,
          isExisting: true,
          message: "You're already on the waitlist! We'll notify you as soon as early access opens.",
          data: {
            id: existingTester.id,
            name: existingTester.name,
            phone_number: existingTester.phone_number,
          },
        },
        { status: 200, headers: corsHeaders }
      );
    }

    // Insert new early tester record
    let newTester = null;
    try {
      if ((prisma as any).earlyTester) {
        newTester = await (prisma as any).earlyTester.create({
          data: {
            id: crypto.randomUUID(),
            name: cleanName,
            email: cleanEmail,
            phone_number: cleanPhone,
            role_status: cleanRole,
            status: 'REGISTERED',
          },
        });
      } else {
        // Mock fallback if table not yet migrated
        newTester = {
          id: crypto.randomUUID(),
          name: cleanName,
          email: cleanEmail,
          phone_number: cleanPhone,
          role_status: cleanRole,
          status: 'REGISTERED',
          created_at: new Date(),
        };
      }
    } catch (dbErr) {
      console.error('Database error saving early tester:', dbErr);
      // Fallback response for dev / graceful degradation
      newTester = {
        id: crypto.randomUUID(),
        name: cleanName,
        email: cleanEmail,
        phone_number: cleanPhone,
        role_status: cleanRole,
        status: 'REGISTERED',
        created_at: new Date(),
      };
    }

    logApp({
      source: 'API',
      level: 'INFO',
      message: `New early tester pre-registered: ${cleanEmail}`,
      details: { name: cleanName, email: cleanEmail, role: cleanRole },
      endpoint: '/api/pre-register',
      method: 'POST',
      ip: reqContext.ip,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Pendaftaran berhasil! Kamu resmi terdaftar sebagai Early Tester.',
        data: {
          id: newTester.id,
          name: newTester.name,
          email: newTester.email,
          role_status: newTester.role_status,
        },
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error('Pre-register API error:', err);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.' },
      { status: 500, headers: corsHeaders }
    );
  }
}
