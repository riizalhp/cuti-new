import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import nodemailer from 'nodemailer';
import { prisma } from './prisma';

export type InquiryType = 'EVENT_KAMPUS' | 'JOB_FAIR' | 'IKLAN_SPONSOR' | 'LAINNYA';
export type InquiryStatus = 'BARU' | 'DIHUBUNGI' | 'DISETUJUI' | 'DITOLAK' | 'SELESAI';

export interface PartnerInquiryItem {
  id: string;
  ticket_code: string;
  pic_name: string;
  institution_name: string;
  pic_email: string;
  pic_phone: string;
  inquiry_type: InquiryType;
  event_title: string;
  event_date?: string;
  proposal_url?: string;
  message: string;
  status: InquiryStatus;
  created_at: string;
  updated_at: string;
  admin_notes?: string;
}

export function getDataFilePath(): string {
  // Shared data path di apps/dashboard/.data/partner-inquiries.json
  const dashboardPath = path.resolve(process.cwd(), '../dashboard/.data/partner-inquiries.json');
  if (fs.existsSync(dashboardPath) || fs.existsSync(path.dirname(dashboardPath))) {
    return dashboardPath;
  }
  // Alternatif di apps/admin/.data
  const adminPath = path.resolve(process.cwd(), '../admin/.data/partner-inquiries.json');
  if (fs.existsSync(adminPath) || fs.existsSync(path.dirname(adminPath))) {
    return adminPath;
  }
  // Fallback lokal di apps/portal-loker/.data
  const localDir = path.join(process.cwd(), '.data');
  if (!fs.existsSync(localDir)) {
    try {
      fs.mkdirSync(localDir, { recursive: true });
    } catch {
      // ignore
    }
  }
  return path.join(localDir, 'partner-inquiries.json');
}

export async function readPartnerInquiries(): Promise<PartnerInquiryItem[]> {
  const filePath = getDataFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('[partner-inquiry] Gagal membaca data file JSON:', err);
  }

  // Fallback membaca dari system_settings database
  try {
    const setting = await prisma.system_settings.findUnique({
      where: { key: 'partner_inquiries_store' },
    });
    if (setting && setting.value) {
      const dbParsed = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
      if (Array.isArray(dbParsed)) return dbParsed;
    }
  } catch (err) {
    console.warn('[partner-inquiry] Gagal membaca dari database system_settings:', err);
  }

  return [];
}

export async function writePartnerInquiries(items: PartnerInquiryItem[]): Promise<void> {
  const filePath = getDataFilePath();
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf-8');
  } catch (err) {
    console.error('[partner-inquiry] Gagal menulis file JSON:', err);
  }

  // Backup persistensi ke database system_settings
  try {
    await prisma.system_settings.upsert({
      where: { key: 'partner_inquiries_store' },
      update: {
        value: JSON.stringify(items),
        updated_at: new Date(),
      },
      create: {
        id: crypto.randomUUID(),
        key: 'partner_inquiries_store',
        value: JSON.stringify(items),
        group: 'PARTNERSHIP',
        description: 'Persistent store pengajuan kemitraan & event kampus',
        updated_at: new Date(),
      },
    });
  } catch (err) {
    console.warn('[partner-inquiry] Gagal upsert ke system_settings:', err);
  }
}

export function formatPhoneForWhatsApp(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (!cleaned.startsWith('62') && cleaned.length > 5) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

export function getSmtpTransporter(): nodemailer.Transporter | null {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE !== 'false' && (port === 465 || process.env.SMTP_SECURE === 'true');
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').trim();

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

export async function sendPartnerInquiryNotification(inquiry: PartnerInquiryItem): Promise<{ sent: boolean; message: string }> {
  const transporter = getSmtpTransporter();
  const adminEmail = (process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER || 'xilasae@gmail.com').trim();
  const fromEmail = process.env.SMTP_FROM || `"Employr Kemitraan" <${process.env.SMTP_USER || 'noreply@employr.id'}>`;

  const cleanPhone = formatPhoneForWhatsApp(inquiry.pic_phone);
  const waGreeting = encodeURIComponent(
    `Halo Kak ${inquiry.pic_name}, salam hangat dari tim kemitraan Employr / AmbilCUTI. Kami telah menerima pengajuan kemitraan event "${inquiry.event_title}" dari ${inquiry.institution_name} (Tiket: ${inquiry.ticket_code}). Apakah ada waktu luang untuk koordinasi jadwal publikasinya? Terima kasih!`
  );
  const waUrl = `https://wa.me/${cleanPhone}?text=${waGreeting}`;

  const mailtoSubject = encodeURIComponent(`[Employr] Tindak Lanjut Kemitraan: ${inquiry.event_title} (${inquiry.ticket_code})`);
  const mailtoBody = encodeURIComponent(
    `Halo Kak ${inquiry.pic_name},\n\nTerima kasih telah mengajukan kemitraan publikasi "${inquiry.event_title}" dari ${inquiry.institution_name} melalui portal Employr.\n\n` +
    `Pengajuan kamu saat ini sedang kami tinjau dengan nomor tiket: ${inquiry.ticket_code}.\n\nSalam,\nTim Kemitraan & Event Employr`
  );
  const mailtoUrl = `mailto:${inquiry.pic_email}?subject=${mailtoSubject}&body=${mailtoBody}`;
  const adminDashboardUrl = (process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3002') + '/kemitraan';

  const typeLabels: Record<InquiryType, string> = {
    EVENT_KAMPUS: 'Event Kampus / Mahasiswa',
    JOB_FAIR: 'Job Fair / Bursa Kerja',
    IKLAN_SPONSOR: 'Pasang Iklan / Sponsorship',
    LAINNYA: 'Kerja Sama Lainnya',
  };

  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }
    .card { max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: #1738D1; color: #ffffff; padding: 24px 28px; }
    .header h2 { margin: 0 0 6px 0; font-size: 20px; font-weight: 700; }
    .header p { margin: 0; font-size: 13px; opacity: 0.9; }
    .badge { display: inline-block; background: #C8F55B; color: #101114; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; margin-bottom: 10px; }
    .body { padding: 24px 28px; }
    .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .info-table td { padding: 8px 0; font-size: 14px; vertical-align: top; }
    .info-table td.label { width: 140px; color: #64748b; font-weight: 500; }
    .info-table td.val { color: #0f172a; font-weight: 600; }
    .message-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; font-size: 13px; line-height: 1.6; color: #334155; margin-bottom: 24px; white-space: pre-wrap; }
    .actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; }
    .btn { display: inline-block; padding: 12px 20px; font-size: 13px; font-weight: 700; text-decoration: none; border-radius: 8px; text-align: center; }
    .btn-wa { background: #25D366; color: #ffffff; }
    .btn-email { background: #1738D1; color: #ffffff; }
    .btn-admin { background: #0f172a; color: #ffffff; }
    .footer { background: #f8fafc; padding: 16px 28px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="badge">PENGAJUAN KEMITRAAN BARU</div>
      <h2>${inquiry.event_title}</h2>
      <p>${inquiry.institution_name} &bull; Tiket #${inquiry.ticket_code}</p>
    </div>
    <div class="body">
      <div class="section-title">Informasi PIC & Institusi</div>
      <table class="info-table">
        <tr>
          <td class="label">Nama PIC:</td>
          <td class="val">${inquiry.pic_name}</td>
        </tr>
        <tr>
          <td class="label">Institusi/Kampus:</td>
          <td class="val">${inquiry.institution_name}</td>
        </tr>
        <tr>
          <td class="label">Email PIC:</td>
          <td class="val"><a href="${mailtoUrl}" style="color: #1738D1; text-decoration: none;">${inquiry.pic_email}</a></td>
        </tr>
        <tr>
          <td class="label">WhatsApp PIC:</td>
          <td class="val"><a href="${waUrl}" style="color: #16a34a; text-decoration: none;">${inquiry.pic_phone}</a></td>
        </tr>
      </table>

      <div class="section-title">Detail Acara & Kemitraan</div>
      <table class="info-table">
        <tr>
          <td class="label">Kategori:</td>
          <td class="val">${typeLabels[inquiry.inquiry_type] || inquiry.inquiry_type}</td>
        </tr>
        <tr>
          <td class="label">Tanggal Acara:</td>
          <td class="val">${inquiry.event_date || 'Belum ditentukan'}</td>
        </tr>
        ${inquiry.proposal_url ? `
        <tr>
          <td class="label">Tautan Proposal:</td>
          <td class="val"><a href="${inquiry.proposal_url}" target="_blank" style="color: #1738D1; word-break: break-all;">${inquiry.proposal_url}</a></td>
        </tr>` : ''}
      </table>

      <div class="section-title">Pesan & Kebutuhan Kemitraan</div>
      <div class="message-box">${inquiry.message || '(Tidak ada pesan tambahan)'}</div>

      <div class="section-title">Tindakan Cepat Admin</div>
      <div style="padding-top: 8px;">
        <a href="${waUrl}" class="btn btn-wa" style="margin-right: 8px; margin-bottom: 8px;">🟢 Hubungi via WhatsApp</a>
        <a href="${mailtoUrl}" class="btn btn-email" style="margin-right: 8px; margin-bottom: 8px;">✉️ Balas via Email</a>
        <a href="${adminDashboardUrl}" class="btn btn-admin" style="margin-bottom: 8px;">📊 Buka Admin Panel</a>
      </div>
    </div>
    <div class="footer">
      Notifikasi otomatis sistem Employr &bull; Waktu kirim: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
[PENGAJUAN KEMITRAAN BARU - TIKET #${inquiry.ticket_code}]

Institusi: ${inquiry.institution_name}
Nama PIC: ${inquiry.pic_name}
Email: ${inquiry.pic_email}
WhatsApp: ${inquiry.pic_phone}
Kategori: ${typeLabels[inquiry.inquiry_type] || inquiry.inquiry_type}
Judul Acara: ${inquiry.event_title}
Tanggal Pelaksanaan: ${inquiry.event_date || 'Belum ditentukan'}
Proposal: ${inquiry.proposal_url || '-'}

Pesan:
${inquiry.message || '-'}

---
Aksi Cepat:
- Hubungi WhatsApp: ${waUrl}
- Balas Email: ${mailtoUrl}
- Buka di Admin: ${adminDashboardUrl}
  `.trim();

  if (!transporter) {
    console.warn('[partner-inquiry] SMTP Transporter tidak aktif (kredensial belum lengkap). Notifikasi email di-skip.');
    return { sent: false, message: 'SMTP belum terkonfigurasi, data pengajuan tersimpan aman.' };
  }

  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to: adminEmail,
      subject: `[Kemitraan Baru] ${inquiry.event_title} – ${inquiry.institution_name} (#${inquiry.ticket_code})`,
      text,
      html,
    });
    console.log('[partner-inquiry] Notifikasi email terkirim ke admin:', info.messageId);
    return { sent: true, message: `Email notifikasi terkirim ke ${adminEmail}` };
  } catch (err: any) {
    console.error('[partner-inquiry] Gagal mengirim email notifikasi:', err);
    return { sent: false, message: `Gagal mengirim email: ${err?.message || 'Error SMTP'}` };
  }
}
