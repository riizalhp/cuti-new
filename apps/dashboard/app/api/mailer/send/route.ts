import { NextRequest, NextResponse } from 'next/server';
import { prisma, ApplicationStatus, ApplicationSource } from '@cuti/db';
import { getAuthUser } from '@/lib/server-auth';
import { dispatchEmail, SmtpConfig, EmailPayload } from '@/lib/mailer/email-service';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      to,
      to_name,
      company,
      position,
      body_content,
      custom_subject,
      design = 'klasik',
      smtp_id,
      attachment_cv_id,
      sender_phone,
      sender_linkedin,
      sender_github,
      sender_portfolio,
    } = body;

    if (!to || !company || !position) {
      return NextResponse.json(
        { success: false, message: 'Email tujuan, nama perusahaan, dan posisi wajib diisi.' },
        { status: 400 }
      );
    }

    // 1. Ambil akun SMTP user
    let smtpAccounts = await (prisma as any).smtpAccount.findMany({
      where: {
        user_id: user.id,
        is_active: true,
        ...(smtp_id ? { id: smtp_id } : {}),
      },
      orderBy: { sent_today: 'asc' },
    });

    if (!smtpAccounts || smtpAccounts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Belum ada akun SMTP aktif yang terkonfigurasi. Silakan tambahkan akun SMTP terlebih dahulu di tab Pengaturan SMTP.',
        },
        { status: 400 }
      );
    }

    // 2. Cari akun SMTP yang belum melebihi limit harian (Failover support)
    let selectedSmtp: any = null;
    for (const acc of smtpAccounts) {
      if (acc.sent_today < acc.daily_limit) {
        selectedSmtp = acc;
        break;
      }
    }

    if (!selectedSmtp) {
      return NextResponse.json(
        {
          success: false,
          message: 'Semua akun SMTP Anda telah mencapai batas kuota pengiriman harian (Daily Limit).',
        },
        { status: 429 }
      );
    }

    // 3. Susun Email Payload
    const emailPayload: EmailPayload = {
      to,
      toName: to_name,
      company,
      position,
      senderName: selectedSmtp.from_name || user.name || 'Pelamar',
      senderEmail: selectedSmtp.from_email || selectedSmtp.username,
      senderPhone: sender_phone,
      senderLinkedin: sender_linkedin,
      senderGithub: sender_github,
      senderPortfolio: sender_portfolio,
      bodyContent: body_content,
      customSubject: custom_subject,
      design: design as any,
    };

    // 4. Kirim Email via SMTP
    const smtpConfig: SmtpConfig = {
      id: selectedSmtp.id,
      host: selectedSmtp.host,
      port: selectedSmtp.port,
      secure: selectedSmtp.secure,
      username: selectedSmtp.username,
      password: selectedSmtp.password,
      fromName: selectedSmtp.from_name,
      fromEmail: selectedSmtp.from_email,
    };

    const dispatchResult = await dispatchEmail(smtpConfig, emailPayload);

    if (!dispatchResult.success) {
      // Coba failover ke akun SMTP berikutnya jika ada
      const backupAccounts = smtpAccounts.filter((a: any) => a.id !== selectedSmtp.id && a.sent_today < a.daily_limit);
      if (backupAccounts.length > 0) {
        const backupSmtp = backupAccounts[0];
        const backupConfig: SmtpConfig = {
          id: backupSmtp.id,
          host: backupSmtp.host,
          port: backupSmtp.port,
          secure: backupSmtp.secure,
          username: backupSmtp.username,
          password: backupSmtp.password,
          fromName: backupSmtp.from_name,
          fromEmail: backupSmtp.from_email,
        };
        const retryResult = await dispatchEmail(backupConfig, emailPayload);
        if (retryResult.success) {
          // Update hit count
          await (prisma as any).smtpAccount.update({
            where: { id: backupSmtp.id },
            data: { sent_today: { increment: 1 } },
          });

          // Auto-insert ke Kanban Tracker
          const appId = crypto.randomUUID();
          const newApp = await prisma.applications.create({
            data: {
              id: appId,
              user_id: user.id,
              company_name: company,
              position: position,
              status: ApplicationStatus.APPLIED,
              source: ApplicationSource.EMPLOYR,
              applied_at: new Date(),
              updated_at: new Date(),
            },
          });

          return NextResponse.json({
            success: true,
            message: `Email berhasil dikirim ke ${to} menggunakan akun failover (${backupSmtp.username}) dan otomatis ditambahkan ke Kanban Tracker.`,
            data: {
              applicationId: newApp.id,
              subject: retryResult.renderedSubject,
              usedSmtp: backupSmtp.username,
            },
          });
        }
      }

      return NextResponse.json(
        {
          success: false,
          message: `Gagal mengirim email: ${dispatchResult.error}`,
        },
        { status: 500 }
      );
    }

    // 5. Update kuota terkirim hari ini
    await (prisma as any).smtpAccount.update({
      where: { id: selectedSmtp.id },
      data: { sent_today: { increment: 1 } },
    });

    // 6. Auto-insert ke Kanban Tracker Cuti
    const appId = crypto.randomUUID();
    const newApp = await prisma.applications.create({
      data: {
        id: appId,
        user_id: user.id,
        company_name: company,
        position: position,
        status: ApplicationStatus.APPLIED,
        source: ApplicationSource.EMPLOYR,
        applied_at: new Date(),
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Email lamaran berhasil dikirim ke ${to} dan otomatis tercatat di Kanban Tracker!`,
      data: {
        applicationId: newApp.id,
        subject: dispatchResult.renderedSubject,
        usedSmtp: selectedSmtp.username,
      },
    });
  } catch (error: any) {
    console.error('[API /mailer/send POST] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Terjadi kesalahan sistem saat mengirim email.' },
      { status: 500 }
    );
  }
}
