import type { Metadata } from 'next';
import { CVView } from '@/components/CVView';

export const metadata: Metadata = {
  title: 'Editor CV ATS',
  description: 'Edit dan sesuaikan data profil serta format CV ATS kamu di Employr.',
};

export default async function CVDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CVView cvId={id} />;
}
