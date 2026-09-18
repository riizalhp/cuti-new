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
    // Non-destructive migration of legacy cuti_* localStorage keys to employr_*
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('cuti_')) {
          const newKey = 'employr_' + k.slice(5);
          if (localStorage.getItem(newKey) === null) {
            const val = localStorage.getItem(k);
            if (val !== null) localStorage.setItem(newKey, val);
          }
        }
      }
    } catch {}
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

