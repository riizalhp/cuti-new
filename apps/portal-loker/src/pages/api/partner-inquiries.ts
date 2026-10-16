import type { APIRoute } from 'astro';
import crypto from 'node:crypto';
import {
  readPartnerInquiries,
  writePartnerInquiries,
  sendPartnerInquiryNotification,
  type PartnerInquiryItem,
  type InquiryType,
} from '../../lib/partner-inquiry-service';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    const pic_name = typeof body?.pic_name === 'string' ? body.pic_name.trim() : '';
    const institution_name = typeof body?.institution_name === 'string' ? body.institution_name.trim() : '';
    const pic_email = typeof body?.pic_email === 'string' ? body.pic_email.trim().toLowerCase() : '';
    const pic_phone = typeof body?.pic_phone === 'string' ? body.pic_phone.trim() : '';
    const inquiry_type = (typeof body?.inquiry_type === 'string' ? body.inquiry_type.trim() : 'EVENT_KAMPUS') as InquiryType;
    const event_title = typeof body?.event_title === 'string' ? body.event_title.trim() : '';
    const event_date = typeof body?.event_date === 'string' ? body.event_date.trim() : undefined;
    const proposal_url = typeof body?.proposal_url === 'string' && body.proposal_url.trim() ? body.proposal_url.trim() : undefined;
    const message = typeof body?.message === 'string' ? body.message.trim() : '';

    if (!pic_name) {
      return new Response(
        JSON.stringify({ success: false, message: 'Nama penanggung jawab (PIC) wajib diisi.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!institution_name) {
      return new Response(
        JSON.stringify({ success: false, message: 'Nama institusi, kampus, atau organisasi wajib diisi.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pic_email || !emailRegex.test(pic_email)) {
      return new Response(
        JSON.stringify({ success: false, message: 'Format alamat email PIC tidak valid.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const cleanPhone = pic_phone.replace(/[^0-9]/g, '');
    if (!pic_phone || cleanPhone.length < 8) {
      return new Response(
        JSON.stringify({ success: false, message: 'Nomor WhatsApp PIC harus valid (minimal 8 digit).' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!event_title) {
      return new Response(
        JSON.stringify({ success: false, message: 'Judul event atau program wajib diisi.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique human-readable ticket code (e.g. MTR-2610-8K2)
    const datePrefix = new Date().toISOString().slice(2, 10).replace(/-/g, '').slice(0, 4);
    const randomSuffix = crypto.randomBytes(2).toString('hex').toUpperCase();
    const ticket_code = `MTR-${datePrefix}-${randomSuffix}`;

    const newInquiry: PartnerInquiryItem = {
      id: crypto.randomUUID(),
      ticket_code,
      pic_name,
      institution_name,
      pic_email,
      pic_phone,
      inquiry_type,
      event_title,
      event_date,
      proposal_url,
      message,
      status: 'BARU',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Baca data lama dan simpan pengajuan baru di posisi teratas
    const existingList = await readPartnerInquiries();
    const updatedList = [newInquiry, ...existingList];
    await writePartnerInquiries(updatedList);

    // Kirim notifikasi email langsung ke admin
    const emailResult = await sendPartnerInquiryNotification(newInquiry);

    return new Response(
      JSON.stringify({
        success: true,
        ticket_code,
        message: 'Pengajuan kemitraan berhasil dikirim! Tim Employr akan segera meninjau dan menghubungi kamu via WhatsApp atau email.',
        email_sent: emailResult.sent,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[API /api/partner-inquiries] Gagal memproses pengajuan:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Terjadi kesalahan sistem saat memproses pengajuan. Silakan coba beberapa saat lagi.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
