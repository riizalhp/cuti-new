/**
 * Dynamic Environment Configuration for Employr Web App
 */
export const getAppBaseUrl = (requestUrl?: string | URL): string => {
  if (import.meta.env.PUBLIC_APP_URL) {
    return import.meta.env.PUBLIC_APP_URL;
  }

  if (requestUrl) {
    const url = typeof requestUrl === 'string' ? new URL(requestUrl) : requestUrl;
    if (import.meta.env.DEV) {
      return `${url.protocol}//${url.hostname}:3000`;
    }
  }

  if (typeof window !== 'undefined') {
    if (import.meta.env.DEV) {
      return `${window.location.protocol}//${window.location.hostname}:3000`;
    }
  }

  if (import.meta.env.DEV) {
    return 'http://localhost:3000';
  }
  return 'https://app.employr.id';
};

export const getGoogleAuthUrl = (requestUrl?: string | URL): string => {
  const baseUrl = getAppBaseUrl(requestUrl);
  // In local development environment, directly authenticate and enter /beranda
  if (import.meta.env.DEV && !import.meta.env.PUBLIC_ENABLE_PROD_AUTH) {
    return `${baseUrl}/beranda`;
  }
  return `${baseUrl}/api/auth/google`;
};
