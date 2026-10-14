/**
 * Authentication and Session Management Utilities for Employr Dashboard
 */

export const SESSION_COOKIE_NAME = 'employr_user_session';
export const LEGACY_SESSION_COOKIE_NAME = 'cuti_user_session';
export const TOKEN_COOKIE_NAME = 'employr_auth_token';
export const LEGACY_TOKEN_COOKIE_NAME = 'cuti_auth_token';

export interface UserSessionData {
  id?: string;
  name: string;
  email: string;
  role?: string;
  provider?: string;
  phone?: string;
  onboarded?: boolean;
}

/**
 * Sets persistent session cookies (default 30 days) for automatic login.
 */
export function setSessionCookie(data: UserSessionData, days = 30): void {
  if (typeof window === 'undefined') return;

  try {
    const prevSession = getStoredSession();
    if (prevSession && prevSession.email && prevSession.email.toLowerCase() !== data.email?.toLowerCase()) {
      const keysToKeep = new Set(['theme', 'employr_dashboard_scale']);
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && !keysToKeep.has(k)) {
          localStorage.removeItem(k);
        }
      }
    }

    const maxAge = days * 24 * 60 * 60;
    const expires = new Date(Date.now() + maxAge * 1000).toUTCString();
    const serialized = encodeURIComponent(JSON.stringify(data));
    
    // Set employr_user_session cookie with 30-day longevity
    document.cookie = `${SESSION_COOKIE_NAME}=${serialized}; max-age=${maxAge}; expires=${expires}; path=/; SameSite=Lax`;
    
    // Also sync with localStorage for fast client-side read
    localStorage.setItem(SESSION_COOKIE_NAME, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to set session cookie:', err);
  }
}

function isValidUUID(str?: string | null): boolean {
  if (!str || typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function parseSafeSessionCookie(raw: string): UserSessionData | null {
  try {
    let val = raw.trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    }
    // Lakukan decode berulang jika masih ada format encoded (%257B -> %7B -> {)
    for (let i = 0; i < 3; i++) {
      if (val.includes('%')) {
        try {
          const next = decodeURIComponent(val);
          if (next === val) break;
          val = next;
        } catch {
          break;
        }
      } else {
        break;
      }
    }
    const session = JSON.parse(val) as UserSessionData;
    if (session && session.id && !isValidUUID(session.id)) {
      delete session.id;
    }
    return session;
  } catch (err) {
    console.warn('Failed to parse session cookie:', err);
    return null;
  }
}

/**
 * Reads and parses user session from document cookie.
 */
export function getSessionCookie(): UserSessionData | null {
  if (typeof window === 'undefined') return null;

  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const trimmed = cookie.trim();
      if (trimmed.startsWith(`${SESSION_COOKIE_NAME}=`)) {
        const rawValue = trimmed.substring(`${SESSION_COOKIE_NAME}=`.length);
        const parsed = parseSafeSessionCookie(rawValue);
        if (parsed) return parsed;
      }
    }
    // Fallback: check legacy cuti_user_session cookie
    for (const cookie of cookies) {
      const trimmed = cookie.trim();
      if (trimmed.startsWith(`${LEGACY_SESSION_COOKIE_NAME}=`)) {
        const rawValue = trimmed.substring(`${LEGACY_SESSION_COOKIE_NAME}=`.length);
        const parsed = parseSafeSessionCookie(rawValue);
        if (parsed) return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to read session cookies:', err);
  }
  return null;
}

/**
 * Reads stored session from either cookie or localStorage fallback.
 */
export function getStoredSession(): UserSessionData | null {
  if (typeof window === 'undefined') return null;

  // 1. Try Cookie
  const cookieSession = getSessionCookie();
  if (cookieSession && cookieSession.email) {
    // Ensure localStorage is in sync
    localStorage.setItem(SESSION_COOKIE_NAME, JSON.stringify(cookieSession));
    return cookieSession;
  }

  // 2. Try localStorage Fallback
  try {
    const localStr = localStorage.getItem(SESSION_COOKIE_NAME) || localStorage.getItem(LEGACY_SESSION_COOKIE_NAME);
    if (localStr) {
      const parsed = JSON.parse(localStr) as UserSessionData;
      if (parsed && parsed.id && !isValidUUID(parsed.id)) {
        delete parsed.id;
      }
      if (parsed && parsed.email) {
        // Sync back to cookie so middleware & auto-login persist
        setSessionCookie(parsed, 30);
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to read localStorage session:', err);
  }

  return null;
}

/**
 * Clears session cookies and local storage tokens.
 */
export function clearSessionCookie(): void {
  if (typeof window === 'undefined') return;

  const expiredDate = 'Thu, 01 Jan 1970 00:00:00 UTC';
  const cookieNames = [
    SESSION_COOKIE_NAME,
    TOKEN_COOKIE_NAME,
    LEGACY_SESSION_COOKIE_NAME,
    LEGACY_TOKEN_COOKIE_NAME,
    'employr_user_session',
    'cuti_user_session',
    'employr_auth_session',
    'cuti_auth_session',
    'employr_auth_token',
    'cuti_auth_token',
    'better-auth.session_token',
  ];

  cookieNames.forEach((name) => {
    document.cookie = `${name}=; max-age=0; expires=${expiredDate}; path=/;`;
    document.cookie = `${name}=; max-age=0; expires=${expiredDate}; path=/; SameSite=Lax`;
  });
}

/**
 * Handles user logout: clears auth cookies, local storage, session storage,
 * awaits the server logout endpoint, and redirects back to login page.
 */
export async function handleLogout(redirectTo?: string | unknown) {
  if (typeof window !== 'undefined') {
    const targetUrl = typeof redirectTo === 'string' ? redirectTo : '/login';

    // 1. Immediately inject smooth transition overlay so no default state flashes
    try {
      if (!document.getElementById('logout-transition-overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'logout-transition-overlay';
        overlay.style.position = 'fixed';
        overlay.style.inset = '0';
        overlay.style.zIndex = '999999';
        overlay.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#020617' : '#f8fafc';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.fontFamily = 'Inter, sans-serif';
        overlay.style.fontSize = '12px';
        overlay.style.fontWeight = '700';
        overlay.style.color = document.documentElement.classList.contains('dark') ? '#94a3b8' : '#64748b';
        overlay.innerHTML = `
          <div style="display:flex;flex-direction:column;align-items:center;gap:12px;">
            <div style="width:26px;height:26px;border:3px solid #cbd5e1;border-top-color:#1738D1;border-radius:50%;animation:employr-spin 0.6s linear infinite;"></div>
            <span>Mengalihkan ke halaman masuk...</span>
          </div>
          <style>@keyframes employr-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
        `;
        document.body.appendChild(overlay);
      }
    } catch {}

    // 2. Clear client cookies and local storage immediately
    clearSessionCookie();

    try {
      document.cookie.split(';').forEach((c) => {
        const name = c.split('=')[0].trim();
        document.cookie = `${name}=; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `${name}=; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
      });
    } catch {}

    try {
      const keysToKeep = new Set(['theme', 'employr_dashboard_scale']);
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && !keysToKeep.has(k)) {
          localStorage.removeItem(k);
        }
      }
      sessionStorage.clear();
    } catch {}

    // 3. Notify server logout endpoint AND AWAIT IT so Set-Cookie response is applied by browser
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (e) {
      console.warn('[handleLogout] Non-blocking logout endpoint notice:', e);
    }

    // 4. Immediately navigate to login page without history pollution
    window.location.replace(targetUrl);
  }
}
