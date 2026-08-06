'use client';

import React from 'react';
import { ThemeProvider } from 'next-themes';
import { ModalProvider } from '@/context/ModalContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ModalProvider>{children}</ModalProvider>
    </ThemeProvider>
  );
}
