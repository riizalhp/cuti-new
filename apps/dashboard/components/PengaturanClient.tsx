'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProfileView } from '@/components/ProfileView';

function PengaturanContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as
    | 'profil'
    | 'karir'
    | 'keamanan'
    | 'pengaturan'
    | null;

  return <ProfileView initialSubTab={tabParam || 'profil'} />;
}

export function PengaturanClient() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Memuat profil dan pengaturan...</div>}>
      <PengaturanContent />
    </Suspense>
  );
}
