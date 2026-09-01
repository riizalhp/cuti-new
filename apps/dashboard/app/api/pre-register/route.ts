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

    if (!name || !email || !phone_number) {
      return NextResponse.json(
        { success: false, message: 'Nama, email, dan nomor telepon wajib diisi.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPhone = String(phone_number).trim();
    const cleanRole = role_status ? String(role_status).trim() : null;

    // Simple email regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, message: 'Format alamat email tidak valid.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if email is already in early_testers or users
    let existingTester = null;
    try {
      if ((prisma as any).earlyTester) {
        existingTester = await (prisma as any).earlyTester.findUnique({
          where: { email: cleanEmail },
        });
      }
    } catch (e) {
      console.warn('Prisma earlyTester lookup warning:', e);
    }

    if (existingTester) {
      return NextResponse.json(
        {
          success: true,
          isExisting: true,
          message: 'Email kamu sudah terdaftar di daftar Early Tester! Kami akan segera mengirimkan akses saat peluncuran.',
          data: {
            id: existingTester.id,
            name: existingTester.name,
            email: existingTester.email,
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
