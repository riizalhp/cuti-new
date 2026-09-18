import type { Metadata } from 'next';
import { BerandaView } from '@/components/BerandaView';

export const metadata: Metadata = {
  title: 'Beranda: Pusat Aktivitas Karier',
  description:
    'Pantau ringkasan progres lamaran kerja, skor CV ATS, jadwal interview mendatang, dan rekomendasi loker harian kamu di Employr.',
  openGraph: {
    title: 'Beranda: Pusat Aktivitas Karier | Employr',
    description:
      'Pantau ringkasan progres lamaran kerja, skor CV ATS, jadwal interview mendatang, dan rekomendasi loker harian kamu di Employr.',
  },
};

export default function BerandaPage() {
  return <BerandaView />;
}
