import type { Metadata } from 'next';
import { DesignSystemView } from '@/components/DesignSystemView';

export const metadata: Metadata = {
  title: 'Design System & Panduan Komponen',
  description:
    'Katalog standar komponen antarmuka, palet warna, tipografi, dan interaksi visual Employr.',
};

export default function DesignSystemPage() {
  return <DesignSystemView />;
}
