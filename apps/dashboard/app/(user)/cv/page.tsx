import type { Metadata } from 'next';
import { CVView } from '@/components/CVView';

export const metadata: Metadata = {
  title: 'CV ATS Builder',
  description:
    'Susun CV standar ATS yang lolos screening sistem recruiter dengan mudah dan profesional bersama Employr.',
};

export default function CVPage() {
  return <CVView />;
}
