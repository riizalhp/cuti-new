import type { Metadata } from 'next';
import { ProfilClient } from '@/components/ProfilClient';

export const metadata: Metadata = {
  title: 'Profil Saya & Karir Impian',
  description:
    'Kelola informasi biodata, kontak pribadi, portofolio, dan preferensi karir impian kamu di Employr.',
};

export default function ProfilPage() {
  return <ProfilClient />;
}
