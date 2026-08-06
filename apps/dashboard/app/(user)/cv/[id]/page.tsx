'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { CVView } from '@/components/CVView';

export default function CVDetailPage() {
  const params = useParams();
  const id = params.id as string;
  return <CVView cvId={id} />;
}
