/**
 * Dynamic cross-app routing helper for Learning Academy
 */

export const getCrossAppUrl = (port: number, prodDomain: string, path = ''): string => {
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);

    // If on localhost or LAN IP, route to respective local port
    if (isLocalhost || isIp) {
      return `${window.location.protocol}//${hostname}:${port}${cleanPath}`;
    }

    // If already on production domain (*.employr.id), always route to production domain
    if (hostname.endsWith('employr.id')) {
      return `https://${prodDomain}${cleanPath}`;
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
