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
import { getStoredSession } from '@/lib/auth';

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

function isValidUUID(str?: string | null): boolean {
  if (!str || typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export function VisitorTracker({ userId }: VisitorTrackerProps) {
  const safeUserId = isValidUUID(userId) ? userId : null;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPathRef = useRef<string>('');
  const lastLinkedUserRef = useRef<string | null>(null);

  // 0. Global Client Telemetry (Errors, Web Vitals, Print)
  useEffect(() => {
    initClientTelemetry(safeUserId);
  }, [safeUserId]);

  // 1. Initial & Route Change Tracking
  useEffect(() => {
    const fullPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    
    // Always trigger page view first so Visitor and VisitorSession are initialized in DB
    if (fullPath !== lastPathRef.current) {
      lastPathRef.current = fullPath;
      trackPageView(document.title || pathname, safeUserId);
    }

    // Track user linking if userId is supplied or in session (deduplicated per user session)
    const rawUserId = safeUserId || getStoredSession()?.id;
    const effectiveUserId = isValidUUID(rawUserId) ? rawUserId : null;
    if (effectiveUserId && lastLinkedUserRef.current !== effectiveUserId) {
      lastLinkedUserRef.current = effectiveUserId;
      // Brief timeout to ensure page_view session record exists in database
      const linkTimer = setTimeout(() => {
        trackLinkUser(effectiveUserId);
      }, 300);
      return () => clearTimeout(linkTimer);
    }
  }, [pathname, searchParams, safeUserId]);

  // 2. Heartbeat Timer (every 25 seconds if document is visible)
  useEffect(() => {
    const intervalMs = 25000;

    const runHeartbeat = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        trackHeartbeat(25, safeUserId);
        const mod = getModuleName(pathname);
        trackModuleDuration(mod, 25, safeUserId);
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
