import type { Metadata } from 'next';
import { CvMatchAnalysisView } from '@/components/CvMatchAnalysisView';

export const metadata: Metadata = {
  title: 'Match CV ke Lowongan Kerja',
  description:
    'Analisis tingkat kecocokan CV kamu terhadap deskripsi kualifikasi lowongan pekerjaan target di Employr.',
};

export default function MatchCvPage() {
  return <CvMatchAnalysisView />;
}
