'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

interface DotLottiePlayerProps {
  src: string;
  autoplay?: boolean;
  loop?: boolean;
  className?: string;
  fallback?: React.ReactNode;
}

// Dynamically import DotLottieReact with SSR disabled for optimal Next.js client performance
const DotLottieReact = dynamic(
  () => import('@lottiefiles/dotlottie-react').then((mod) => mod.DotLottieReact),
  { ssr: false }
);

export function DotLottiePlayer({
  src,
  autoplay = true,
  loop = false,
  className = 'w-24 h-24 mx-auto',
  fallback = null,
}: DotLottiePlayerProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  if (!mounted || prefersReducedMotion) {
    return <div className={className}>{fallback}</div>;
  }

  return (
    <div className={className}>
      <DotLottieReact
        src={src}
        autoplay={autoplay}
        loop={loop}
        className="w-full h-full"
      />
    </div>
  );
}
