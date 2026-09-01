/**
 * Dynamic cross-app routing helper for AmbilCUTI / Employr
 * Automatically adapts when accessed from mobile/other devices in the same LAN/Wi-Fi.
 */

export const getCrossAppUrl = (port: number, prodDomain: string, path = ''): string => {
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';

  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(window.location.hostname);

    if (isLocalhost || isIp || process.env.NODE_ENV !== 'production') {
      return `${window.location.protocol}//${window.location.hostname}:${port}${cleanPath}`;
    }
  }

  if (process.env.NODE_ENV === 'production') {
    return `https://${prodDomain}${cleanPath}`;
  }

  return `http://localhost:${port}${cleanPath}`;
};

export const getLearningUrl = (path = ''): string =>
  process.env.NEXT_PUBLIC_LEARNING_URL || getCrossAppUrl(3004, 'learning.employr.id', path);

export const getFaqUrl = (path = ''): string =>
  process.env.NEXT_PUBLIC_FAQ_URL || getCrossAppUrl(3005, 'faq.employr.id', path);

export const getAdminUrl = (path = ''): string =>
  process.env.NEXT_PUBLIC_ADMIN_URL || getCrossAppUrl(3002, 'masterdata.employr.id', path);

export const getWebUrl = (path = ''): string =>
  process.env.NEXT_PUBLIC_WEB_URL || getCrossAppUrl(4321, 'employr.id', path);

export const getApiUrl = (path = ''): string =>
  process.env.NEXT_PUBLIC_API_URL || getCrossAppUrl(3001, 'api.employr.id', path);
