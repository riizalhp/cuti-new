'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { ThemeProvider } from 'next-themes';
import { ModalProvider } from '@/context/ModalContext';
import { ToastProvider } from '@/components/ui/Toast';
import { ConfirmDialogProvider } from '@/components/ui/ConfirmDialog';
import { VisitorTracker } from '@/components/VisitorTracker';

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
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
  );
}

