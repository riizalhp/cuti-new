import type { Metadata } from 'next';
import { MailerView } from '@/components/MailerView';

export const metadata: Metadata = {
  title: 'Cold Email & Mailer Lamaran',
  description:
    'Kirim lamaran kerja profesional langsung ke email HRD dengan integrasi SMTP terpercaya di Employr.',
};

export default function MailerPage() {
  return <MailerView />;
}
