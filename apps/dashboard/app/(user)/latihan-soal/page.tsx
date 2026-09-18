import type { Metadata } from 'next';
import { LatihanSoalView } from '@/components/LatihanSoalView';

export const metadata: Metadata = {
  title: 'Latihan Soal & Asesmen Kerja',
  description:
    'Asah kemampuan dengan bank soal psikotes, logika, dan tes kemampuan kerja terstandarisasi di Employr.',
};

export default function LatihanSoalPage() {
  return <LatihanSoalView />;
}
