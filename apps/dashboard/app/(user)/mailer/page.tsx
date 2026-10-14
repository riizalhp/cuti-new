import type { Metadata } from 'next';
import { MailerView } from '@/components/MailerView';

export const metadata: Metadata = {
  title: 'Email Lamaran Kerja & Pengirim Otomatis | Employr',
  description:
    'Kirim lamaran kerja profesional langsung ke email HRD dengan integrasi SMTP terpercaya di Employr.',
};

export default function MailerPage() {
  return <MailerView />;
}
