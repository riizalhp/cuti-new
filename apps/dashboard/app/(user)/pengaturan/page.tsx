import type { Metadata } from 'next';
import { PengaturanClient } from '@/components/PengaturanClient';

export const metadata: Metadata = {
  title: 'Pengaturan Akun & Keamanan',
  description:
    'Kelola keamanan akun, sesi login aktif, preferensi notifikasi, dan pengaturan sistem di Employr.',
};

export default function PengaturanPage() {
  return <PengaturanClient />;
}
