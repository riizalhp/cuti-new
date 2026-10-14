/**
 * Helper untuk resolusi URL aplikasi Dashboard / Auth Employr
 */
const rawAppUrl =
  (typeof process !== 'undefined' && process.env?.PUBLIC_APP_URL) ||
  (import.meta.env?.PUBLIC_APP_URL as string | undefined) ||
  'http://localhost:3000';

const rawFaqUrl =
  (typeof process !== 'undefined' && process.env?.PUBLIC_FAQ_URL) ||
  (import.meta.env?.PUBLIC_FAQ_URL as string | undefined) ||
  'http://localhost:3005';

export const APP_URL = rawAppUrl.replace(/\/$/, '');
export const LOGIN_URL = `${APP_URL}/login`;
export const CV_BUILDER_URL = `${APP_URL}/cv`;
export const REGISTER_URL = `${APP_URL}/register`;
export const TRACKER_URL = `${APP_URL}/tracker`;
export const FAQ_URL = rawFaqUrl.replace(/\/$/, '');
export const PRIVACY_URL = `${APP_URL}/kebijakan-privasi`;
export const TERMS_URL = `${APP_URL}/syarat-ketentuan`;

