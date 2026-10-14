import type { Metadata } from 'next';
import { LokerExplorerView } from '@/components/LokerExplorerView';

export const metadata: Metadata = {
  title: 'Eksplorasi Loker | Employr',
  description:
    'Temukan loker aktif terkurasi, analisis tingkat kecocokan profil CV kamu secara otomatis, dan kelola lamaran langsung di Tracker Employr.',
  openGraph: {
    title: 'Eksplorasi Loker | Employr',
    description:
      'Temukan loker aktif terkurasi, analisis tingkat kecocokan profil CV kamu secara otomatis, dan kelola lamaran langsung di Tracker Employr.',
  },
};

export default function LokerPage() {
  return <LokerExplorerView />;
}
