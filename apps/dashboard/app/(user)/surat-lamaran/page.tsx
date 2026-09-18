import type { Metadata } from 'next';
import { MailerView } from '@/components/MailerView';

export const metadata: Metadata = {
  title: 'Surat Lamaran Kerja & Cover Letter',
  description:
    'Susun cover letter dan surat lamaran kerja profesional yang disesuaikan secara spesifik dengan posisi target di Employr.',
};

export default function SuratLamaranPage() {
  return <MailerView initialTab="cover-letter" />;
}
