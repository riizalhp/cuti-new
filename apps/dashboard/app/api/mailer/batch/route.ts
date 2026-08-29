import { NextRequest, NextResponse } from 'next/server';
import { prisma, ApplicationStatus, ApplicationSource } from '@cuti/db';
import { getAuthUser } from '@/lib/server-auth';
import { dispatchEmail, SmtpConfig, EmailPayload } from '@/lib/mailer/email-service';
import crypto from 'crypto';

// GET: Ambil daftar riwayat batch jobs
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const batchJobs = await (prisma as any).emailBatchJob.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: 'desc' },
      take: 20,
    });

    return NextResponse.json({ success: true, data: batchJobs });
  } catch (error: any) {
    console.error('[API /mailer/batch GET] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memuat riwayat batch' },
      { status: 500 }
    );
  }
}

// Helper delay
const waitMs = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// POST: Jalankan Batch Pengiriman Email
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title = 'Batch Lamaran', items, delay_sec = 2, design = 'klasik' } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Daftar penerima (items) wajib berupa array dan tidak boleh kosong.' },
        { status: 400 }
      );
    }

    // 1. Dapatkan akun-akun SMTP aktif milik user
    const smtpAccounts = await (prisma as any).smtpAccount.findMany({
      where: {
        user_id: user.id,
        is_active: true,
      },
      orderBy: { sent_today: 'asc' },
    });

    if (!smtpAccounts || smtpAccounts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Belum ada akun SMTP aktif yang terkonfigurasi. Silakan tambahkan akun SMTP terlebih dahulu.',
        },
        { status: 400 }
      );
    }

    // 2. Buat record EmailBatchJob
    const batchJob = await (prisma as any).emailBatchJob.create({
      data: {
        user_id: user.id,
        title,
        status: 'RUNNING',
        total_emails: items.length,
        sent_count: 0,
        failed_count: 0,
        payload: items,
        logs: [],
      },
    });

    // 3. Eksekusi pengiriman loop
    const logs: Array<{ email: string; company: string; position: string; status: 'success' | 'failed'; error?: string; time: string }> = [];
    let sentCount = 0;
    let failedCount = 0;

    let currentSmtpIndex = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const targetEmail = item.email || item.to;
      const targetCompany = item.company || item.perusahaan || 'Perusahaan';
      const targetPosition = item.position || item.posisi || 'Posisi';

      if (!targetEmail || !targetEmail.includes('@')) {
        failedCount++;
        logs.push({
          email: targetEmail || 'invalid',
          company: targetCompany,
          position: targetPosition,
          status: 'failed',
          error: 'Format email tidak valid',
          time: new Date().toISOString(),
        });
        continue;
      }

      // Ambil SMTP yang masih punya kuota
      let activeSmtp = smtpAccounts[currentSmtpIndex % smtpAccounts.length];
      if (activeSmtp.sent_today >= activeSmtp.daily_limit) {
        // Cari SMTP lain yang masih ada kuota
        const available = smtpAccounts.find((a: any) => a.sent_today < a.daily_limit);
        if (!available) {
          failedCount++;
          logs.push({
            email: targetEmail,
            company: targetCompany,
            position: targetPosition,
            status: 'failed',
            error: 'Semua akun SMTP telah mencapai batas kuota harian',
            time: new Date().toISOString(),
          });
          break; // Stop batch
        }
        activeSmtp = available;
      }

      const smtpConfig: SmtpConfig = {
        id: activeSmtp.id,
        host: activeSmtp.host,
        port: activeSmtp.port,
        secure: activeSmtp.secure,
        username: activeSmtp.username,
        password: activeSmtp.password,
        fromName: activeSmtp.from_name,
        fromEmail: activeSmtp.from_email,
      };

      const emailPayload: EmailPayload = {
        to: targetEmail,
        company: targetCompany,
        position: targetPosition,
        senderName: activeSmtp.from_name || user.name || 'Pelamar',
        senderEmail: activeSmtp.from_email || activeSmtp.username,
        bodyContent: item.body || item.content,
        customSubject: item.subject,
        design: design as any,
      };

      const result = await dispatchEmail(smtpConfig, emailPayload);

      if (result.success) {
        sentCount++;
        activeSmtp.sent_today++;

        // Update hit count di DB
        await (prisma as any).smtpAccount.update({
          where: { id: activeSmtp.id },
          data: { sent_today: { increment: 1 } },
        });

        // Auto-insert ke Kanban Tracker
        try {
          const appId = crypto.randomUUID();
          await prisma.applications.create({
            data: {
              id: appId,
              user_id: user.id,
              company_name: targetCompany,
              position: targetPosition,
              status: ApplicationStatus.APPLIED,
              source: ApplicationSource.EMPLOYR,
              applied_at: new Date(),
              updated_at: new Date(),
            },
          });
        } catch (dbErr) {
          console.warn('[Batch Tracker Auto-Insert Warning]:', dbErr);
        }

        logs.push({
          email: targetEmail,
          company: targetCompany,
          position: targetPosition,
          status: 'success',
          time: new Date().toISOString(),
        });
      } else {
        failedCount++;
        logs.push({
          email: targetEmail,
          company: targetCompany,
          position: targetPosition,
          status: 'failed',
          error: result.error,
          time: new Date().toISOString(),
        });
      }

      // Rotate SMTP account for next email
      currentSmtpIndex++;

      // Delay antar email (minimum 1 detik untuk kestabilan)
      if (i < items.length - 1) {
        const actualDelay = Math.max(1000, (Number(delay_sec) || 2) * 1000);
        await waitMs(actualDelay);
      }
    }

    // 4. Update status batch job ke COMPLETED
    const finalJob = await (prisma as any).emailBatchJob.update({
      where: { id: batchJob.id },
      data: {
        status: failedCount === items.length ? 'FAILED' : 'COMPLETED',
        sent_count: sentCount,
        failed_count: failedCount,
        logs: logs,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Batch pengiriman selesai. ${sentCount} berhasil dikirim dan ditambahkan ke Tracker, ${failedCount} gagal.`,
      data: finalJob,
    });
  } catch (error: any) {
    console.error('[API /mailer/batch POST] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Terjadi kesalahan saat memproses batch email.' },
      { status: 500 }
    );
  }
}
