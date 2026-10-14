import { NextRequest, NextResponse } from 'next/server';
import { prisma, logSecurityEvent, extractRequestContext } from '@employr/db';
import { getAuthUser } from '@/lib/server-auth';
import crypto from 'crypto';

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

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Sesi login telah kedaluwarsa. Silakan login kembali.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Kata sandi lama dan baru wajib diisi.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Kata sandi baru minimal 8 karakter.' },
        { status: 400 }
      );
    }

    const account = await prisma.accounts.findFirst({
      where: {
        user_id: user.id,
        provider_id: 'credential',
      },
    });

    if (!account || !account.password) {
      return NextResponse.json(
        { success: false, message: 'Akun terdaftar lewat Google atau penyedia lain tanpa kata sandi.' },
        { status: 400 }
      );
    }

    const isMatch = verifyPassword(currentPassword, account.password);
    if (!isMatch) {
      const ctx = extractRequestContext(req);
      logSecurityEvent({
        eventType: 'UNAUTHORIZED_ACCESS',
        ip: ctx.ip,
        userAgent: ctx.userAgent,
        userId: user.id,
        severity: 'WARNING',
        details: { reason: 'invalid_current_password' },
      });
      return NextResponse.json(
        { success: false, message: 'Kata sandi saat ini tidak cocok.' },
        { status: 400 }
      );
    }

    const newHashed = hashPassword(newPassword);
    await prisma.accounts.update({
      where: { id: account.id },
      data: {
        password: newHashed,
        updated_at: new Date(),
      },
    });

    const ctx = extractRequestContext(req);
    logSecurityEvent({
      eventType: 'PASSWORD_CHANGED',
      ip: ctx.ip,
      userAgent: ctx.userAgent,
      userId: user.id,
      severity: 'INFO',
    });

    return NextResponse.json({
      success: true,
      message: 'Kata sandi berhasil diperbarui.',
    });
  } catch (error: any) {
    console.error('[POST /api/auth/change-password] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem saat memperbarui kata sandi.' },
      { status: 500 }
    );
  }
}
