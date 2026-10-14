import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Orientasi & Profil Karier | Employr',
  description:
    'Mulai orientasi kariermu, pilih metode pembuatan CV, dan tentukan target peran impian bersama Employr.',
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      id="onboarding-root"
      className="min-h-[100dvh] w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col flex-1"
    >
      {children}
    </div>
  );
}
