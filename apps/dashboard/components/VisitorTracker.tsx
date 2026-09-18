'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  trackPageView,
  trackHeartbeat,
  trackLinkUser,
  trackModuleDuration,
  initClientTelemetry,
  getOrCreateVisitorId,
} from '@/lib/visitor-tracker';

interface VisitorTrackerProps {
  userId?: string | null;
}

function getModuleName(path: string): string {
  if (path.includes('cv') || path.includes('builder')) return 'CV_BUILDER';
  if (path.includes('tracker')) return 'JOB_TRACKER';
  if (path.includes('misi')) return 'MISI';
  if (path.includes('loker') || path.includes('karir')) return 'LOKER';
  if (path.includes('profil') || path.includes('akun')) return 'AKUN';
  return 'BERANDA';
}

export function VisitorTracker({ userId }: VisitorTrackerProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPathRef = useRef<string>('');

  // 0. Global Client Telemetry (Errors, Web Vitals, Print)
  useEffect(() => {
    initClientTelemetry(userId);
  }, [userId]);

  // 1. Initial & Route Change Tracking
  useEffect(() => {
    const fullPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    
    // Track user linking if userId is supplied or in cookie/localStorage
    if (userId) {
      trackLinkUser(userId);
    } else {
      try {
        const storedUser = localStorage.getItem('employr_user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed?.id) trackLinkUser(parsed.id);
        }
      } catch {}
    }

    if (fullPath !== lastPathRef.current) {
      lastPathRef.current = fullPath;
      trackPageView(document.title || pathname, userId);
    }
  }, [pathname, searchParams, userId]);

  // 2. Heartbeat Timer (every 25 seconds if document is visible)
  useEffect(() => {
    const intervalMs = 25000;

    const runHeartbeat = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        trackHeartbeat(25, userId);
        const mod = getModuleName(pathname);
        trackModuleDuration(mod, 25, userId);
      }
    };

    heartbeatIntervalRef.current = setInterval(runHeartbeat, intervalMs);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        runHeartbeat();
      }
    };

    const handleBeforeUnload = () => {
      // Final quick beacon
      trackHeartbeat(5, userId);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [userId]);

  return null;
}
