import type { Metadata } from 'next';
import { MisiCuanView } from '@/components/MisiCuanView';

export const metadata: Metadata = {
  title: 'Misi & Cuan Tambahan',
  description:
    'Selesaikan misi karier harian dan kumpulkan cuan reward yang dapat ditarik langsung ke rekening kamu di Employr.',
};

export default function MisiCuanPage() {
  return <MisiCuanView />;
}
