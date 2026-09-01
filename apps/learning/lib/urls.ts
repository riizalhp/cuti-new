/**
 * Dynamic cross-app routing helper for Learning Academy
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

export const getAppUrl = (path = ''): string =>
  process.env.NEXT_PUBLIC_APP_URL || getCrossAppUrl(3000, 'app.employr.id', path);

export const getFaqUrl = (path = ''): string =>
  process.env.NEXT_PUBLIC_FAQ_URL || getCrossAppUrl(3005, 'faq.employr.id', path);
