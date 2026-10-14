import type { Metadata } from 'next';
import { CvCreateStudio } from '@/components/cv/CvCreateStudio';

export const metadata: Metadata = {
  title: 'Alur Pembuatan CV Mandiri - CV ATS Builder',
  description:
    'Alur pembuatan CV ATS standar internasional yang adaptif dan lolos screening HR bersama Employr.',
};

export default function CVCreatePage() {
  return <CvCreateStudio />;
}
