import type { Metadata } from 'next';
import { PengaturanClient } from '@/components/PengaturanClient';

export const metadata: Metadata = {
  title: 'Pengaturan Akun & Profil',
  description:
    'Kelola informasi profil, data karier, keamanan akun, dan preferensi notifikasi kamu di Employr.',
};

export default function PengaturanPage() {
  return <PengaturanClient />;
}
