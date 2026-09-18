import type { Metadata } from 'next';
import { ReferralView } from '@/components/ReferralView';

export const metadata: Metadata = {
  title: 'Program Referral & Komisi',
  description:
    'Ajak rekan dan teman bergabung ke Employr dan dapatkan reward komisi saldo tunai setiap referral berhasil.',
};

export default function ReferralPage() {
  return <ReferralView />;
}
