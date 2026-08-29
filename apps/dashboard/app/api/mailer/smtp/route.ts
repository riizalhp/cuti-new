import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@cuti/db';
import { getAuthUser } from '@/lib/server-auth';
import { verifySmtpConnection } from '@/lib/mailer/email-service';

// GET: Ambil daftar akun SMTP user
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const accounts = await (prisma as any).smtpAccount.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        host: true,
        port: true,
        secure: true,
        username: true,
        from_name: true,
        from_email: true,
        daily_limit: true,
        sent_today: true,
        is_active: true,
        created_at: true,
      },
    });

    return NextResponse.json({ success: true, data: accounts });
  } catch (error: any) {
    console.error('[API /mailer/smtp GET] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memuat akun SMTP' },
      { status: 500 }
    );
  }
}

// POST: Tambah akun SMTP baru atau Test Koneksi
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, host, port, secure, username, password, from_name, from_email, daily_limit } = body;

    if (!host || !port || !username || !password) {
      return NextResponse.json(
        { success: false, message: 'Host, port, username, dan password SMTP wajib diisi.' },
        { status: 400 }
      );
    }

    // Jika hanya uji koneksi
    if (action === 'test') {
      const testResult = await verifySmtpConnection({
        host,
        port: Number(port),
        secure: Boolean(secure),
        username,
        password,
        fromName: from_name || 'Pelamar',
        fromEmail: from_email || username,
      });

      return NextResponse.json(testResult, { status: testResult.success ? 200 : 400 });
    }

    // Uji koneksi sebelum disimpan
    const verifyResult = await verifySmtpConnection({
      host,
      port: Number(port),
      secure: Boolean(secure),
      username,
      password,
      fromName: from_name || user.name || 'Pelamar',
      fromEmail: from_email || username,
    });

    if (!verifyResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: `Koneksi SMTP gagal: ${verifyResult.message}`,
        },
        { status: 400 }
      );
    }

    const newAccount = await (prisma as any).smtpAccount.create({
      data: {
        user_id: user.id,
        host,
        port: Number(port),
        secure: Boolean(secure),
        username,
        password,
        from_name: from_name || user.name || 'Pelamar',
        from_email: from_email || username,
        daily_limit: Number(daily_limit) || 500,
        sent_today: 0,
        is_active: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Akun SMTP berhasil disimpan dan diverifikasi!',
      data: newAccount,
    });
  } catch (error: any) {
    console.error('[API /mailer/smtp POST] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menyimpan akun SMTP' },
      { status: 500 }
    );
  }
}

// DELETE: Hapus akun SMTP
export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID akun SMTP diperlukan' }, { status: 400 });
    }

    await (prisma as any).smtpAccount.deleteMany({
      where: {
        id,
        user_id: user.id,
      },
    });

    return NextResponse.json({ success: true, message: 'Akun SMTP berhasil dihapus' });
  } catch (error: any) {
    console.error('[API /mailer/smtp DELETE] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menghapus akun SMTP' },
      { status: 500 }
    );
  }
}
