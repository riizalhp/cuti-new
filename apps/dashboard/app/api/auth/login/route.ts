import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@cuti/db';
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

    // Find user in database
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
        { success: false, message: 'Email atau kata sandi salah.' },
        { status: 401, headers: corsHeaders }
      );
    }

    const account = user.accounts[0];
    if (!account || !account.password) {
      return NextResponse.json(
        { success: false, message: 'Akun ini terdaftar menggunakan metode lain (seperti Google).' },
        { status: 401, headers: corsHeaders }
      );
    }

    const isValid = verifyPassword(password, account.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Email atau kata sandi salah.' },
        { status: 401, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Login berhasil.',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200, headers: corsHeaders }
    );
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
