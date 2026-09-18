import type { Metadata } from 'next';
import { InterviewView } from '@/components/InterviewView';

export const metadata: Metadata = {
  title: 'Simulasi Interview Kerja',
  description:
    'Latihan wawancara kerja interaktif dengan umpan balik langsung untuk meningkatkan kepercayaan diri di Employr.',
};

export default function InterviewPage() {
  return <InterviewView />;
}
