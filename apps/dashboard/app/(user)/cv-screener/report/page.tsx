import type { Metadata } from 'next';
import { AiCvScreenerView } from '@/components/AiCvScreenerView';

export const metadata: Metadata = {
  title: 'Laporan Evaluasi CV ATS',
  description:
    'Laporan mendalam hasil evaluasi CV ATS, skor kompatibilitas kata kunci, dan rekomendasi perbaikan di Employr.',
};

export default function CvScreenerReportPage() {
  return <AiCvScreenerView mode="report" />;
}
