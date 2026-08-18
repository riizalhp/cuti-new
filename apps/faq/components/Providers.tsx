"use client";

import React, { useState, useEffect } from "react";
import { ThemeProvider } from "next-themes";

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
      forcedTheme={!mounted ? "light" : undefined}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
