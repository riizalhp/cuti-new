import nodemailer from 'nodemailer';

export interface SendOtpOptions {
  to: string;
  name?: string;
  otp: string;
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

export function generateOtpEmailHtml(name: string, otp: string): { subject: string; html: string; text: string } {
  const recipientName = name ? name.trim() : 'Teman Karier';
  const subject = `${otp} adalah Kode Verifikasi Pendaftaran Employr`;

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
              <span style="font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#C9D0FF;">Verifikasi Akun</span>
              <h1 style="margin:8px 0 0 0;font-size:24px;font-weight:800;letter-spacing:-0.5px;color:#FFFFFF;">Employr</h1>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding:32px 36px;">
              <p style="margin:0 0 16px 0;font-size:16px;font-weight:600;color:#0F172A;">
                Halo ${recipientName},
              </p>
              <p style="margin:0 0 24px 0;font-size:14px;line-height:1.6;color:#475569;">
                Terima kasih telah mendaftar di <strong>Employr</strong>. Gunakan kode verifikasi di bawah ini untuk mengaktifkan akunmu:
              </p>
              
              <!-- OTP Box -->
              <div style="background-color:#EEF2FF;border:1px dashed #6366F1;border-radius:10px;padding:20px;text-align:center;margin-bottom:24px;">
                <span style="font-family:'Courier New',Courier,monospace;font-size:34px;font-weight:800;letter-spacing:8px;color:#1738D1;display:inline-block;padding-left:8px;">
                  ${otp}
                </span>
                <p style="margin:10px 0 0 0;font-size:12px;color:#6366F1;font-weight:600;">
                  Berlaku selama 5 menit
                </p>
              </div>

              <p style="margin:0 0 16px 0;font-size:13px;line-height:1.5;color:#64748B;">
                Demi keamanan akunmu, jangan beritahukan kode ini kepada siapa pun. Jika kamu tidak merasa mendaftar di Employr, abaikan email ini.
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

  const text = `Halo ${recipientName},\n\nKode verifikasi akun Employr kamu adalah: ${otp}\n\nKode ini berlaku selama 5 menit. Jangan bagikan kode ini kepada siapa pun.\n\nSalam,\nTim Employr`;

  return { subject, html, text };
}

export async function sendVerificationOtpEmail({ to, name = '', otp }: SendOtpOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // Always log to terminal console in development for convenient testing
  console.log(`\n======================================================`);
  console.log(`[AUTH OTP] Destination : ${to}`);
  console.log(`[AUTH OTP] Code        : ${otp}`);
  console.log(`[AUTH OTP] Valid Until : 5 Minutes`);
  console.log(`======================================================\n`);

  const config = getSmtpConfig();
  const { subject, html, text } = generateOtpEmailHtml(name, otp);

  // If credentials are completely empty in dev and no host is provided
  if (!config.user && !process.env.SMTP_HOST) {
    console.warn('[AUTH OTP] SMTP credentials not set in environment. Using console output fallback.');
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
      auth: config.user ? {
        user: config.user,
        pass: config.pass,
      } : undefined,
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

    console.log(`[AUTH OTP] Email successfully sent to ${to}. MessageId: ${info.messageId}`);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (err: any) {
    console.error('[AUTH OTP] Error sending verification email:', err?.message || err);
    return {
      success: false,
      error: err?.message || 'Gagal mengirim email verifikasi.',
    };
  }
}
