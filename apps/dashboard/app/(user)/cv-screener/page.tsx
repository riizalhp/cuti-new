import type { Metadata } from 'next';
import { AiCvScreenerView } from '@/components/AiCvScreenerView';

export const metadata: Metadata = {
  title: 'CV Screener & Evaluasi ATS',
  description:
    'Evaluasi skor kompatibilitas CV kamu terhadap standar sistem screening ATS industri modern di Employr.',
};

export default function CvScreenerPage() {
  return <AiCvScreenerView mode="setup" />;
}
