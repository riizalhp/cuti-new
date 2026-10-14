'use client';

import React, { Suspense } from 'react';
import { SettingsView } from '@/components/settings/SettingsView';
import { ProfileViewSkeleton } from '@/components/ProfileSkeleton';

export function PengaturanClient() {
  return (
    <Suspense fallback={<ProfileViewSkeleton />}>
      <SettingsView />
    </Suspense>
  );
}
