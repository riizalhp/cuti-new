/**
 * Authentication and Session Management Utilities for CUTI Dashboard
 */

/**
 * Handles user logout: clears auth tokens, local storage, session storage, cookies,
 * and redirects the user back to the CUTI landing page.
 */
export function handleLogout() {
  if (typeof window !== 'undefined') {
    // Clear localStorage session & tokens
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_session');

    // Clear sessionStorage
    sessionStorage.clear();

    // Clear auth cookies
    try {
      document.cookie.split(';').forEach((c) => {
        document.cookie = c
          .replace(/^ +/, '')
          .replace(/=.*/, '=;expires=' + new Date(0).toUTCString() + ';path=/');
      });
    } catch {
      // Ignore cookie clearing errors if restricted
    }

    // Determine target landing page URL
    const landingUrl =
      process.env.NEXT_PUBLIC_LANDING_URL ||
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:4321'
        : 'https://ambilcuti.id');

    window.location.href = landingUrl;
  }
}
