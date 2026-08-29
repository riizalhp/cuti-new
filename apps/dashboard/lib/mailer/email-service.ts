import nodemailer from 'nodemailer';

export interface SmtpConfig {
  id?: string;
  host: string;
  port: number;
  secure?: boolean;
  username: string;
  password: string;
  fromName: string;
  fromEmail?: string;
  dailyLimit?: number;
  sentToday?: number;
}

export interface EmailPayload {
  to: string;
  toName?: string;
  company: string;
  position: string;
  senderName: string;
  senderPhone?: string;
  senderEmail?: string;
  senderLinkedin?: string;
  senderGithub?: string;
  senderPortfolio?: string;
  bodyContent?: string;
  customSubject?: string;
  design?: 'klasik' | 'minimal' | 'dark' | 'serif';
  attachments?: Array<{
    filename: string;
    content?: Buffer | string;
    path?: string;
    contentType?: string;
  }>;
}

export const SUBJECT_TEMPLATES = [
  'Lamaran Kerja {position} – {company}',
  'Pengajuan Lamaran {position} di {company}',
  'Permohonan {position} – {company}',
  'Lamaran Pekerjaan: {position} – {company}',
  '{position} – Lamaran di {company}',
  'Peluang Karier – {position} ({company})',
  'Surat Lamaran {position} – {company}',
  'Pengajuan Diri – {position} ({company})',
];

export const GREETING_VARIANTS = [
  'Yang terhormat Tim HR / Bagian Kepegawaian',
  'Kepada Yth. Bapak/Ibu HRD',
  'Yth. Bagian Rekrutmen & Talenta',
  'Kepada Yth. Tim Rekrutmen Perusahaan',
];

export const OPENING_VARIANTS = [
  'Perkenalkan, saya {senderName}. Melalui surat elektronik ini saya bermaksud mengajukan lamaran untuk posisi {position} di {company}.',
  'Dengan hormat, saya {senderName} mengajukan lamaran untuk posisi {position} yang saat ini dibuka di {company}.',
  'Saya {senderName}, bermaksud mengajukan diri untuk berkontribusi pada posisi {position} di {company}.',
  'Melalui pesan ini, saya {senderName} menyampaikan minat dan antusiasme saya untuk posisi {position} di {company}.',
];

export const CLOSING_VARIANTS = [
  'Demikian permohonan ini saya sampaikan, atas perhatian dan pertimbangannya saya ucapkan terima kasih.',
  'Besar harapan saya untuk dapat bergabung dan berkontribusi secara nyata di {company}. Atas perhatian Bapak/Ibu, saya ucapkan terima kasih.',
  'Terima kasih atas waktu dan pertimbangan Bapak/Ibu. Saya sangat menantikan kesempatan untuk tahapan seleksi selanjutnya bersama {company}.',
  'Demikian surat lamaran ini saya sampaikan dengan penuh antusias. Terima kasih atas kesempatan yang diberikan.',
];

export function getRandomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function generateDynamicSubject(company: string, position: string): string {
  const template = getRandomItem(SUBJECT_TEMPLATES);
  return template.replace(/\{position\}/g, position).replace(/\{company\}/g, company);
}

export function renderEmailHtml(
  payload: EmailPayload,
  design: 'klasik' | 'minimal' | 'dark' | 'serif' = 'klasik'
): { subject: string; html: string; text: string } {
  const company = payload.company || 'Perusahaan';
  const position = payload.position || 'Posisi';
  const senderName = payload.senderName || 'Pelamar';

  const subject =
    payload.customSubject || generateDynamicSubject(company, position);

  const greeting = getRandomItem(GREETING_VARIANTS);
  const opening = getRandomItem(OPENING_VARIANTS)
    .replace(/\{senderName\}/g, senderName)
    .replace(/\{position\}/g, position)
    .replace(/\{company\}/g, company);
  const closing = getRandomItem(CLOSING_VARIANTS).replace(/\{company\}/g, company);

  const mainBody = payload.bodyContent
    ? payload.bodyContent.replace(/\n/g, '<br/>')
    : `Bersama email ini saya menyampaikan ketertarikan untuk bergabung dan memberikan kontribusi terbaik di <strong>${company}</strong> untuk posisi <strong>${position}</strong>. Terlampir saya sertakan CV dan berkas pendukung sebagai bahan pertimbangan Bapak/Ibu.`;

  const contactList = [
    payload.senderPhone ? `📞 ${payload.senderPhone}` : null,
    payload.senderEmail ? `✉️ ${payload.senderEmail}` : null,
    payload.senderLinkedin ? `🔗 ${payload.senderLinkedin}` : null,
    payload.senderGithub ? `💻 ${payload.senderGithub}` : null,
    payload.senderPortfolio ? `🌐 ${payload.senderPortfolio}` : null,
  ]
    .filter(Boolean)
    .join(' &nbsp;|&nbsp; ');

  let htmlBody = '';

  if (design === 'dark') {
    htmlBody = `
<!DOCTYPE html>
<html lang="id">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0f172a;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#1e293b;border-radius:12px;border:1px solid #334155;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.3);">
          <tr>
            <td style="padding:28px 32px 20px 32px;background:linear-gradient(135deg, #1e3a8a 0%, #172554 100%);border-bottom:1px solid #3b82f6;">
              <span style="font-size:11px;font-weight:700;color:#93c5fd;text-transform:uppercase;letter-spacing:1.5px;">Surat Lamaran Kerja</span>
              <h1 style="margin:8px 0 0 0;font-size:20px;font-weight:700;color:#ffffff;line-height:1.3;">${position}</h1>
              <p style="margin:4px 0 0 0;font-size:13px;color:#cbd5e1;">${company}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;font-size:14px;line-height:1.7;color:#e2e8f0;">
              <p style="margin:0 0 16px 0;font-weight:600;color:#ffffff;">${greeting} ${company},</p>
              <p style="margin:0 0 16px 0;">${opening}</p>
              <div style="margin:0 0 20px 0;color:#cbd5e1;">${mainBody}</div>
              <p style="margin:0 0 24px 0;">${closing}</p>
              <div style="padding-top:16px;border-top:1px solid #334155;">
                <p style="margin:0;font-weight:700;color:#ffffff;font-size:15px;">${senderName}</p>
                <p style="margin:6px 0 0 0;font-size:12px;color:#94a3b8;">${contactList}</p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  } else if (design === 'serif') {
    htmlBody = `
<!DOCTYPE html>
<html lang="id">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#fcfbf9;font-family:Georgia,Cambria,'Times New Roman',Times,serif;color:#1c1917;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fcfbf9;padding:36px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;background-color:#ffffff;border:1px solid #e7e5e4;box-shadow:0 4px 16px rgba(0,0,0,0.04);padding:40px 44px;">
          <tr>
            <td style="border-bottom:2px solid #1c1917;padding-bottom:16px;margin-bottom:24px;">
              <h1 style="margin:0;font-size:22px;font-weight:normal;color:#1c1917;letter-spacing:-0.5px;">${position}</h1>
              <p style="margin:4px 0 0 0;font-size:14px;color:#78716c;font-style:italic;">Diajukan untuk ${company}</p>
            </td>
          </tr>
          <tr>
            <td style="padding-top:24px;font-size:15px;line-height:1.8;color:#292524;">
              <p style="margin:0 0 16px 0;">${greeting} ${company},</p>
              <p style="margin:0 0 16px 0;">${opening}</p>
              <div style="margin:0 0 20px 0;">${mainBody}</div>
              <p style="margin:0 0 28px 0;">${closing}</p>
              <div style="margin-top:24px;padding-top:16px;border-top:1px dashed #d6d3d1;">
                <p style="margin:0;font-size:16px;font-weight:bold;color:#1c1917;">${senderName}</p>
                <p style="margin:4px 0 0 0;font-size:12px;color:#78716c;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">${contactList}</p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  } else if (design === 'minimal') {
    htmlBody = `
<!DOCTYPE html>
<html lang="id">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:24px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;">
          <tr>
            <td style="padding:12px 0 20px 0;border-bottom:1px solid #f1f5f9;">
              <span style="font-size:11px;font-weight:bold;color:#64748b;text-transform:uppercase;">Lamaran Pekerjaan</span>
              <h2 style="margin:4px 0 0 0;font-size:18px;font-weight:700;color:#0f172a;">${position} &bull; ${company}</h2>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 0;font-size:14px;line-height:1.7;color:#334155;">
              <p style="margin:0 0 16px 0;font-weight:600;color:#0f172a;">${greeting} ${company},</p>
              <p style="margin:0 0 16px 0;">${opening}</p>
              <div style="margin:0 0 20px 0;">${mainBody}</div>
              <p style="margin:0 0 24px 0;">${closing}</p>
              <div style="padding-top:16px;border-top:1px solid #f1f5f9;">
                <p style="margin:0;font-weight:700;color:#0f172a;">${senderName}</p>
                <p style="margin:4px 0 0 0;font-size:12px;color:#64748b;">${contactList}</p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  } else {
    // Klasik (Default)
    htmlBody = `
<!DOCTYPE html>
<html lang="id">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#ffffff;border-radius:10px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.05);">
          <tr>
            <td style="padding:24px 32px;background-color:#1738D1;color:#ffffff;">
              <span style="font-size:11px;font-weight:700;color:#c9d0ff;text-transform:uppercase;letter-spacing:1px;">Pengajuan Lamaran</span>
              <h1 style="margin:6px 0 0 0;font-size:19px;font-weight:700;color:#ffffff;">${position}</h1>
              <p style="margin:2px 0 0 0;font-size:13px;color:#e2e8f0;">${company}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;font-size:14px;line-height:1.75;color:#334155;">
              <p style="margin:0 0 16px 0;font-weight:600;color:#0f172a;">${greeting} ${company},</p>
              <p style="margin:0 0 16px 0;">${opening}</p>
              <div style="margin:0 0 20px 0;">${mainBody}</div>
              <p style="margin:0 0 24px 0;">${closing}</p>
              <div style="padding-top:18px;border-top:1px solid #f1f5f9;">
                <p style="margin:0;font-weight:700;color:#0f172a;font-size:15px;">${senderName}</p>
                <p style="margin:6px 0 0 0;font-size:12px;color:#64748b;">${contactList}</p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  const textBody = `${greeting} ${company},

${opening.replace(/<[^>]+>/g, '')}

${payload.bodyContent || 'Bersama email ini saya menyampaikan ketertarikan untuk bergabung di ' + company + ' untuk posisi ' + position + '.'}

${closing.replace(/<[^>]+>/g, '')}

Hormat saya,
${senderName}
${[payload.senderPhone, payload.senderEmail, payload.senderLinkedin].filter(Boolean).join(' | ')}
`;

  return { subject, html: htmlBody, text: textBody };
}

export async function createSmtpTransporter(smtp: SmtpConfig) {
  const isSecure = smtp.port === 465 || smtp.secure === true;
  return nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: isSecure,
    auth: {
      user: smtp.username,
      pass: smtp.password,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

export async function verifySmtpConnection(smtp: SmtpConfig): Promise<{ success: boolean; message: string }> {
  try {
    const transporter = await createSmtpTransporter(smtp);
    await transporter.verify();
    return { success: true, message: 'Koneksi SMTP berhasil diverifikasi!' };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Gagal terhubung ke server SMTP. Periksa host, port, atau app password Anda.',
    };
  }
}

export async function dispatchEmail(
  smtp: SmtpConfig,
  payload: EmailPayload
): Promise<{ success: boolean; messageId?: string; error?: string; renderedSubject: string }> {
  const { subject, html, text } = renderEmailHtml(payload, payload.design || 'klasik');

  try {
    const transporter = await createSmtpTransporter(smtp);
    const fromAddress = `"${smtp.fromName || payload.senderName}" <${smtp.fromEmail || smtp.username}>`;

    const info = await transporter.sendMail({
      from: fromAddress,
      to: payload.to,
      subject: subject,
      text: text,
      html: html,
      attachments: payload.attachments,
    });

    return {
      success: true,
      messageId: info.messageId,
      renderedSubject: subject,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Gagal mengirim email.',
      renderedSubject: subject,
    };
  }
}
