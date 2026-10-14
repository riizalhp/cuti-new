import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@employr/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return new NextResponse(
      `<!DOCTYPE html>
      <html lang="id">
      <head><meta charset="utf-8"/><title>Tautan Tidak Valid</title></head>
      <body style="font-family:sans-serif;text-align:center;padding:50px 20px;background:#f8fafc;color:#1e293b;">
        <h2>Tautan Unsubscribe Tidak Valid</h2>
        <p>Token berhenti berlangganan tidak ditemukan.</p>
      </body>
      </html>`,
      { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  try {
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { token },
    });

    if (!subscriber) {
      return new NextResponse(
        `<!DOCTYPE html>
        <html lang="id">
        <head><meta charset="utf-8"/><title>Subscriber Tidak Ditemukan</title></head>
        <body style="font-family:sans-serif;text-align:center;padding:50px 20px;background:#f8fafc;color:#1e293b;">
          <h2>Data Berlangganan Tidak Ditemukan</h2>
          <p>Email ini mungkin sudah dihapus atau tautan telah kedaluwarsa.</p>
        </body>
        </html>`,
        { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    if (!subscriber.is_active) {
      return new NextResponse(
        `<!DOCTYPE html>
        <html lang="id">
        <head><meta charset="utf-8"/><title>Sudah Berhenti Berlangganan</title></head>
        <body style="font-family:sans-serif;text-align:center;padding:60px 20px;background:#f8fafc;color:#1e293b;">
          <div style="max-width:500px;margin:0 auto;background:white;padding:40px;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1px solid #e2e8f0;">
            <h2 style="color:#0f172a;margin-bottom:12px;">Status Sudah Non-Aktif</h2>
            <p style="color:#64748b;line-height:1.6;">Email <strong>${subscriber.email}</strong> sebelumnya sudah berhenti berlangganan dari buletin Employr.</p>
          </div>
        </body>
        </html>`,
        { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        is_active: false,
        unsubscribed_at: new Date(),
        updated_at: new Date(),
      },
    });

    return new NextResponse(
      `<!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Berhasil Berhenti Berlangganan – Employr</title>
      </head>
      <body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#F8FAFC;padding:60px 20px;color:#0F172A;">
        <div style="max-width:520px;margin:0 auto;background:#FFFFFF;border-radius:14px;border:1px solid #E2E8F0;box-shadow:0 4px 24px rgba(15,23,42,0.06);padding:40px 32px;text-align:center;">
          <div style="width:48px;height:48px;border-radius:50%;background:#F1F5F9;display:inline-flex;align-items:center;justify-content:center;margin-bottom:20px;">
            <span style="font-size:20px;">✓</span>
          </div>
          <h2 style="font-size:20px;font-weight:800;color:#0F172A;margin:0 0 12px 0;">Berhasil Berhenti Berlangganan</h2>
          <p style="font-size:14px;line-height:1.6;color:#64748B;margin:0 0 24px 0;">
            Email <strong>${subscriber.email}</strong> tidak akan lagi menerima buletin mingguan atau notifikasi artikel baru dari Employr.
          </p>
          <p style="font-size:12px;color:#94A3B8;margin:0;">
            Bila di kemudian hari kamu berubah pikiran, kamu dapat mendaftar kembali di portal karier Employr kapan saja.
          </p>
        </div>
      </body>
      </html>`,
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  } catch (err: any) {
    console.error('[Newsletter Unsubscribe Error]:', err);
    return new NextResponse(
      `<!DOCTYPE html>
      <html lang="id">
      <head><meta charset="utf-8"/><title>Terjadi Kendala</title></head>
      <body style="font-family:sans-serif;text-align:center;padding:50px 20px;background:#f8fafc;color:#1e293b;">
        <h2>Terjadi Kesalahan Sistem</h2>
        <p>Silakan coba kembali beberapa saat lagi.</p>
      </body>
      </html>`,
      { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}
