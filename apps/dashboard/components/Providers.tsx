'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { ThemeProvider } from 'next-themes';
import { MotionConfig } from 'framer-motion';
import { ModalProvider } from '@/context/ModalContext';
import { ToastProvider } from '@/components/ui/Toast';
import { ConfirmDialogProvider } from '@/components/ui/ConfirmDialog';
import { VisitorTracker } from '@/components/VisitorTracker';

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Purge legacy cuti_* keys and stale form/CV cache from localStorage
    try {
      const toRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (
          k &&
          (k.startsWith('cuti_') ||
            k.includes('imported_cv_data') ||
            k.includes('onboarding_profile') ||
            k.includes('saved_cover_letters') ||
            k.includes('cv_list') ||
            k.includes('cv_active_draft') ||
            k.startsWith('cuti_cv_data_'))
        ) {
          toRemove.push(k);
        }
      }
      toRemove.forEach((k) => localStorage.removeItem(k));
    } catch {}
  }, []);

  return (
    <MotionConfig reducedMotion="user">
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      forcedTheme={!mounted ? 'light' : undefined}
      disableTransitionOnChange
    >
      <ModalProvider>
        <ToastProvider>
          <ConfirmDialogProvider>
            <Suspense fallback={null}>
              <VisitorTracker />
            </Suspense>
            {children}
          </ConfirmDialogProvider>
        </ToastProvider>
      </ModalProvider>
    </ThemeProvider>
    </MotionConfig>
  );
}

