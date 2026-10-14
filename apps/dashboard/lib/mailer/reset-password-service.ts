import nodemailer from 'nodemailer';

export interface SendResetPasswordOptions {
  to: string;
  name?: string;
  resetUrl: string;
}

export function getSmtpConfig() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE !== 'false' && (port === 465 || process.env.SMTP_SECURE === 'true');
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').trim();
  const from = process.env.SMTP_FROM || `"Employr" <${user || 'noreply@employr.id'}>`;

  return { host, port, secure, user, pass, from };
}

export function generateResetPasswordEmailHtml(name: string, resetUrl: string): { subject: string; html: string; text: string } {
  const recipientName = name ? name.trim() : 'Teman Karier';
  const subject = 'Atur Ulang Kata Sandi Akun Employr Kamu';

  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0F172A;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F8FAFC;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:540px;background-color:#FFFFFF;border-radius:12px;border:1px solid #E2E8F0;overflow:hidden;box-shadow:0 4px 20px rgba(15,23,42,0.06);">
          <!-- Header Banner -->
          <tr>
            <td style="padding:28px 32px;background-color:#1738D1;color:#FFFFFF;text-align:center;">
              <span style="font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#C9D0FF;">Keamanan Akun</span>
              <h1 style="margin:8px 0 0 0;font-size:24px;font-weight:800;letter-spacing:-0.5px;color:#FFFFFF;">Employr</h1>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding:32px 36px;">
              <p style="margin:0 0 16px 0;font-size:16px;font-weight:600;color:#0F172A;">
                Halo ${recipientName},
              </p>
              <p style="margin:0 0 20px 0;font-size:14px;line-height:1.6;color:#475569;">
                Kami menerima permintaan untuk mengatur ulang kata sandi akun Employr kamu. Klik tombol di bawah ini untuk membuat kata sandi baru:
              </p>
              
              <!-- Action Button -->
              <div style="text-align:center;margin:28px 0;">
                <a href="${resetUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 28px;background-color:#1738D1;color:#FFFFFF;text-decoration:none;font-size:14px;font-weight:700;border-radius:10px;box-shadow:0 4px 14px rgba(23,56,209,0.25);">
                  Atur Ulang Kata Sandi
                </a>
              </div>

              <!-- Notice Box -->
              <div style="background-color:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:14px 16px;margin-bottom:20px;">
                <p style="margin:0;font-size:12px;line-height:1.5;color:#64748B;">
                  <strong style="color:#0F172A;">Perhatian:</strong> Tautan ini hanya berlaku selama <strong>15 menit</strong> dan hanya dapat digunakan satu kali.
                </p>
              </div>

              <p style="margin:0 0 12px 0;font-size:12px;line-height:1.5;color:#64748B;">
                Jika tombol di atas tidak berfungsi, salin dan tempel tautan berikut ke browser kamu:
              </p>
              <p style="margin:0 0 20px 0;font-size:11px;line-height:1.4;word-break:break-all;color:#1738D1;">
                ${resetUrl}
              </p>

              <p style="margin:0;font-size:12px;line-height:1.5;color:#94A3B8;">
                Jika kamu tidak pernah meminta pengaturan ulang kata sandi ini, abaikan email ini. Akunmu tetap aman dan kata sandimu tidak akan berubah.
              </p>
              
              <div style="margin-top:28px;padding-top:20px;border-top:1px solid #F1F5F9;font-size:12px;color:#94A3B8;text-align:center;">
                <p style="margin:0;">&copy; ${new Date().getFullYear()} Employr &bull; Career Operating System</p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `Halo ${recipientName},\n\nKami menerima permintaan pengaturan ulang kata sandi akun Employr kamu.\n\nKlik tautan berikut untuk membuat kata sandi baru (berlaku 15 menit):\n${resetUrl}\n\nJika kamu tidak meminta reset kata sandi, abaikan email ini.\n\nSalam,\nTim Employr`;

  return { subject, html, text };
}

export async function sendResetPasswordEmail({
  to,
  name = '',
  resetUrl,
}: SendResetPasswordOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // Always log to terminal console in development for instant local testing
  console.log(`\n======================================================`);
  console.log(`[AUTH RESET PASSWORD] Destination : ${to}`);
  console.log(`[AUTH RESET PASSWORD] Reset Link  : ${resetUrl}`);
  console.log(`[AUTH RESET PASSWORD] Valid Until : 15 Minutes`);
  console.log(`======================================================\n`);

  const config = getSmtpConfig();
  const { subject, html, text } = generateResetPasswordEmailHtml(name, resetUrl);

  // If credentials are empty in dev and no SMTP host set
  if (!config.user && !process.env.SMTP_HOST) {
    console.warn('[AUTH RESET PASSWORD] SMTP credentials not set in environment. Using console output fallback.');
    return {
      success: true,
      messageId: `dev-mock-${Date.now()}`,
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.user
        ? {
            user: config.user,
            pass: config.pass,
          }
        : undefined,
      tls: {
        rejectUnauthorized: false,
      },
    });

    const info = await transporter.sendMail({
      from: config.from,
      to,
      subject,
      text,
      html,
    });

    console.log(`[AUTH RESET PASSWORD] Email successfully sent to ${to}. MessageId: ${info.messageId}`);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (err: any) {
    console.error('[AUTH RESET PASSWORD] Error sending reset password email:', err?.message || err);
    return {
      success: false,
      error: err?.message || 'Gagal mengirim email pengaturan ulang kata sandi.',
    };
  }
}
