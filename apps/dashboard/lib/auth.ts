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
        const decoded = decodeURIComponent(rawValue);
        return JSON.parse(decoded) as UserSessionData;
      }
    }
    // Fallback: check legacy cuti_user_session cookie
    for (const cookie of cookies) {
      const trimmed = cookie.trim();
      if (trimmed.startsWith(`${LEGACY_SESSION_COOKIE_NAME}=`)) {
        const rawValue = trimmed.substring(`${LEGACY_SESSION_COOKIE_NAME}=`.length);
        const decoded = decodeURIComponent(rawValue);
        return JSON.parse(decoded) as UserSessionData;
      }
    }
  } catch (err) {
    console.warn('Failed to parse session cookie:', err);
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
  document.cookie = `${SESSION_COOKIE_NAME}=; max-age=0; expires=${expiredDate}; path=/; SameSite=Lax`;
  document.cookie = `${TOKEN_COOKIE_NAME}=; max-age=0; expires=${expiredDate}; path=/; SameSite=Lax`;
  document.cookie = `${LEGACY_SESSION_COOKIE_NAME}=; max-age=0; expires=${expiredDate}; path=/; SameSite=Lax`;
  document.cookie = `${LEGACY_TOKEN_COOKIE_NAME}=; max-age=0; expires=${expiredDate}; path=/; SameSite=Lax`;
}

/**
 * Handles user logout: clears auth cookies, local storage, session storage,
 * and redirects the user back to the login page or landing page.
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
        document.cookie = `${name}=; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
      });
    } catch {}

    localStorage.removeItem(SESSION_COOKIE_NAME);
    localStorage.removeItem('employr_onboarding_completed');
    localStorage.removeItem('employr_career_diagnosis');
    localStorage.removeItem('employr_onboarding_profile');
    localStorage.removeItem('employr_imported_cv_data');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_session');
    sessionStorage.clear();

    // 3. Notify server logout endpoint with keepalive (non-blocking)
    try {
      fetch('/api/auth/logout', { method: 'POST', keepalive: true }).catch(() => {});
    } catch {}

    // 4. Immediately navigate to login page without history pollution
    window.location.replace(targetUrl);
  }
}
