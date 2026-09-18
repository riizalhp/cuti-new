import type { Metadata } from 'next';
import { CareerIntelligenceView } from '@/components/career-intelligence/CareerIntelligenceView';

export const metadata: Metadata = {
  title: 'Career Intelligence',
  description:
    'Decision layer karier Employr: analisis kecocokan role, prioritas kesenjangan skill, dan rekomendasi jalur karier berbasis data nyata.',
};

export default function CareerIntelligencePage() {
  return <CareerIntelligenceView />;
}
