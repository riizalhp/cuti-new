'use client';

import React, { Suspense } from 'react';
import { ProfileInlineForm } from '@/components/profile/ProfileInlineForm';
import { ProfileViewSkeleton } from '@/components/ProfileSkeleton';

export function ProfilClient() {
  return (
    <Suspense fallback={<ProfileViewSkeleton />}>
      <ProfileInlineForm />
    </Suspense>
  );
}
