import nodemailer from 'nodemailer';
import { prisma } from '@employr/db';
import crypto from 'crypto';

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

export function getNewsletterSmtpConfig(): SmtpConfig {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE !== 'false' && (port === 465 || process.env.SMTP_SECURE === 'true');
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').trim();
  const from = process.env.SMTP_FROM || `"Employr Karier" <${user || 'noreply@employr.id'}>`;

  return { host, port, secure, user, pass, from };
}

let cachedTransporter: nodemailer.Transporter | null = null;

export function getTransporter(): nodemailer.Transporter | null {
  const config = getNewsletterSmtpConfig();
  if (!config.user || !config.pass) {
    return null;
  }
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  }
  return cachedTransporter;
}

const PUBLIC_PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:3003';
const PUBLIC_ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3002';

/**
 * Generate HTML email notifikasi artikel baru
 */
export function generateArticleNewsletterHtml(params: {
  subscriberName?: string | null;
  articleTitle: string;
  articleSlug: string;
  articleExcerpt?: string;
  categoryName?: string;
  coverImageUrl?: string | null;
  unsubscribeToken: string;
}): { subject: string; html: string; text: string } {
  const {
    subscriberName,
    articleTitle,
    articleSlug,
    articleExcerpt,
    categoryName,
    coverImageUrl,
    unsubscribeToken,
  } = params;

  const greetingName = subscriberName ? subscriberName.trim() : 'Sobat Karier';
  const articleUrl = `${PUBLIC_PORTAL_URL}/career/${articleSlug}`;
  const unsubscribeUrl = `${PUBLIC_ADMIN_URL}/api/newsletter/unsubscribe?token=${unsubscribeToken}`;

  const subject = `[Artikel Baru] ${articleTitle} – Buletin Employr`;

  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0F172A;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F8FAFC;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#FFFFFF;border-radius:14px;border:1px solid #E2E8F0;overflow:hidden;box-shadow:0 4px 20px rgba(15,23,42,0.05);">
          <!-- Header Brand -->
          <tr>
            <td style="padding:28px 32px;background-color:#1738D1;color:#FFFFFF;text-align:left;">
              <span style="font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#C9D0FF;display:block;margin-bottom:4px;">
                Buletin &amp; Tips Karier Mingguan
              </span>
              <h1 style="margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px;color:#FFFFFF;">
                Employr
              </h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:32px 32px 24px 32px;">
              <p style="margin:0 0 16px 0;font-size:15px;font-weight:600;color:#0F172A;">
                Halo ${greetingName},
              </p>
              <p style="margin:0 0 20px 0;font-size:14px;line-height:1.6;color:#475569;">
                Ada artikel dan wawasan karier terbaru yang baru saja diterbitkan di portal Employr untuk membantumu bersiap melamar kerja:
              </p>

              <!-- Article Card Preview -->
              <div style="background-color:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:20px;margin-bottom:24px;">
                ${
                  categoryName
                    ? `<span style="display:inline-block;padding:3px 10px;font-size:11px;font-weight:700;background-color:#EEF2FF;color:#1738D1;border-radius:20px;margin-bottom:10px;">${categoryName}</span>`
                    : ''
                }
                <h2 style="margin:0 0 10px 0;font-size:18px;font-weight:800;line-height:1.4;color:#0F172A;">
                  ${articleTitle}
                </h2>
                ${
                  articleExcerpt
                    ? `<p style="margin:0 0 16px 0;font-size:13px;line-height:1.6;color:#64748B;">${articleExcerpt}</p>`
                    : ''
                }
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td>
                      <a href="${articleUrl}" style="display:inline-block;background-color:#1738D1;color:#FFFFFF;text-decoration:none;font-size:13px;font-weight:700;padding:10px 22px;border-radius:8px;box-shadow:0 2px 8px rgba(23,56,209,0.25);">
                        Baca Artikel Lengkap &rarr;
                      </a>
                    </td>
                  </tr>
                </table>
              </div>

              <p style="margin:0;font-size:13px;line-height:1.5;color:#64748B;">
                Semoga wawasan ini bermanfaat untuk persiapan berkas lamaran dan interview kerjamu pekan ini!
              </p>
            </td>
          </tr>

          <!-- Footer & Unsubscribe -->
          <tr>
            <td style="padding:20px 32px;background-color:#F1F5F9;border-top:1px solid #E2E8F0;text-align:center;font-size:11px;color:#64748B;line-height:1.6;">
              <p style="margin:0 0 6px 0;">
                Kamu menerima email ini karena mendaftar langganan buletin &amp; tips karier di Employr.
              </p>
              <p style="margin:0;">
                <a href="${unsubscribeUrl}" style="color:#64748B;text-decoration:underline;">
                  Berhenti berlangganan (Unsubscribe)
                </a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
Halo ${greetingName},

Ada artikel baru yang diterbitkan di Employr:
${articleTitle}

Baca artikel selengkapnya di: ${articleUrl}

Berhenti berlangganan: ${unsubscribeUrl}
  `.trim();

  return { subject, html, text };
}

/**
 * Generate Welcome Email saat pertama kali mendaftar newsletter
 */
export function generateWelcomeNewsletterHtml(params: {
  email: string;
  unsubscribeToken: string;
}): { subject: string; html: string; text: string } {
  const { unsubscribeToken } = params;
  const unsubscribeUrl = `${PUBLIC_ADMIN_URL}/api/newsletter/unsubscribe?token=${unsubscribeToken}`;
  const portalUrl = `${PUBLIC_PORTAL_URL}/career`;

  const subject = `Selamat Datang di Buletin Karier Employr & Template CV ATS`;

  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0F172A;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F8FAFC;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#FFFFFF;border-radius:14px;border:1px solid #E2E8F0;overflow:hidden;box-shadow:0 4px 20px rgba(15,23,42,0.05);">
          <tr>
            <td style="padding:28px 32px;background-color:#1738D1;color:#FFFFFF;text-align:left;">
              <span style="font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#C9D0FF;display:block;margin-bottom:4px;">
                Konfirmasi Berlangganan
              </span>
              <h1 style="margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px;color:#FFFFFF;">
                Employr
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px 0;font-size:16px;font-weight:700;color:#0F172A;">
                Terima kasih sudah bergabung!
              </p>
              <p style="margin:0 0 20px 0;font-size:14px;line-height:1.6;color:#475569;">
                Email kamu telah resmi terdaftar di <strong>Buletin Karier Employr</strong>. Setiap kali kami menerbitkan panduan CV ATS, bocoran pertanyaan interview, atau kurasi loker terverifikasi, kamu akan menjadi orang pertama yang mengetahuinya.
              </p>
              <div style="background-color:#EEF2FF;border-left:4px solid #1738D1;padding:16px;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-size:13px;font-weight:600;color:#1738D1;">
                  Tips Awal: Buka portal karier kami untuk membaca artikel terkini dan lowongan magang/kerja fresh graduate.
                </p>
              </div>
              <a href="${portalUrl}" style="display:inline-block;background-color:#1738D1;color:#FFFFFF;text-decoration:none;font-size:13px;font-weight:700;padding:12px 24px;border-radius:8px;">
                Eksplorasi Portal Karier &rarr;
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background-color:#F1F5F9;border-top:1px solid #E2E8F0;text-align:center;font-size:11px;color:#64748B;">
              <p style="margin:0;">
                <a href="${unsubscribeUrl}" style="color:#64748B;text-decoration:underline;">
                  Berhenti berlangganan kapan saja
                </a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
Selamat Datang di Buletin Karier Employr!
Email kamu telah aktif terdaftar.
Kunjungi portal karier: ${portalUrl}
Berhenti berlangganan: ${unsubscribeUrl}
  `.trim();

  return { subject, html, text };
}

/**
 * Mengirim email welcome secara asynchronous aman
 */
export async function sendWelcomeNewsletterEmail(email: string, token: string) {
  try {
    const transporter = getTransporter();
    const { subject, html, text } = generateWelcomeNewsletterHtml({
      email,
      unsubscribeToken: token,
    });

    if (!transporter) {
      console.log(`[Newsletter][DEV] Simulated Welcome Email to ${email} (Subject: ${subject})`);
      return { success: true, simulated: true };
    }

    const config = getNewsletterSmtpConfig();
    await transporter.sendMail({
      from: config.from,
      to: email,
      subject,
      html,
      text,
    });
    return { success: true };
  } catch (err) {
    console.error(`[Newsletter] Gagal kirim welcome email ke ${email}:`, err);
    return { success: false, error: err };
  }
}

/**
 * Mengirim blast notifikasi artikel baru ke semua subscriber yang aktif
 */
export async function sendArticleNewsletterBlast(articleId: string) {
  try {
    const article = await prisma.articles.findUnique({
      where: { id: articleId },
      include: { article_categories: true },
    });

    if (!article || !article.is_published) {
      console.log(`[Newsletter] Artikel ${articleId} tidak ditemukan atau belum dipublikasikan.`);
      return { success: false, reason: 'not_published' };
    }

    // Ambil semua subscriber aktif
    const activeSubscribers = await prisma.newsletterSubscriber.findMany({
      where: { is_active: true },
      select: {
        id: true,
        email: true,
        name: true,
        token: true,
      },
    });

    if (activeSubscribers.length === 0) {
      console.log('[Newsletter] Tidak ada subscriber aktif.');
      return { success: true, sentCount: 0 };
    }

    // Ekstrak cuplikan ringkas konten (hilangkan markdown/HTML tag)
    const rawExcerpt = article.content
      ? article.content.replace(/<[^>]*>?/gm, '').replace(/[#*`_-]/g, '').slice(0, 180).trim() + '...'
      : undefined;

    // Catat campaign record di database
    const campaign = await prisma.newsletterCampaign.create({
      data: {
        id: crypto.randomUUID(),
        title: article.title,
        subject: `[Artikel Baru] ${article.title} – Buletin Employr`,
        content_type: 'ARTICLE',
        reference_id: article.id,
        total_recipients: activeSubscribers.length,
        status: 'SENDING',
      },
    });

    const transporter = getTransporter();
    const config = getNewsletterSmtpConfig();

    let sentCount = 0;
    let failedCount = 0;

    // Kirim email berurutan/batch kecil agar tidak membebani SMTP
    for (const sub of activeSubscribers) {
      const emailContent = generateArticleNewsletterHtml({
        subscriberName: sub.name,
        articleTitle: article.title,
        articleSlug: article.slug,
        articleExcerpt: rawExcerpt,
        categoryName: article.article_categories?.name,
        coverImageUrl: article.cover_image_url,
        unsubscribeToken: sub.token,
      });

      if (!transporter) {
        // Mode simulasi/dev jika SMTP belum diset
        console.log(`[Newsletter][DEV BLAST] Ke: ${sub.email} | Judul: ${article.title}`);
        sentCount++;
        continue;
      }

      try {
        await transporter.sendMail({
          from: config.from,
          to: sub.email,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        });
        sentCount++;
      } catch (sendErr) {
        console.error(`[Newsletter] Gagal blast ke ${sub.email}:`, sendErr);
        failedCount++;
      }
    }

    // Update campaign record
    await prisma.newsletterCampaign.update({
      where: { id: campaign.id },
      data: {
        sent_count: sentCount,
        failed_count: failedCount,
        status: 'COMPLETED',
      },
    });

    console.log(`[Newsletter] Blast selesai. Terkirim: ${sentCount}, Gagal: ${failedCount}`);
    return { success: true, sentCount, failedCount };
  } catch (err) {
    console.error('[Newsletter] Fatal error pada sendArticleNewsletterBlast:', err);
    return { success: false, error: err };
  }
}
