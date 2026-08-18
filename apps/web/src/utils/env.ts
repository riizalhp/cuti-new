/**
 * Dynamic Environment Configuration for Employr Web App
 */
export const getAppBaseUrl = (): string => {
  if (import.meta.env.PUBLIC_APP_URL) {
    return import.meta.env.PUBLIC_APP_URL;
  }
  if (import.meta.env.DEV) {
    return 'http://localhost:3000';
  }
  return 'https://app.employr.id';
};

export const getGoogleAuthUrl = (): string => {
  const baseUrl = getAppBaseUrl();
  // In local development environment, directly authenticate and enter /beranda
  if (import.meta.env.DEV && !import.meta.env.PUBLIC_ENABLE_PROD_AUTH) {
    return `${baseUrl}/beranda`;
  }
  return `${baseUrl}/api/auth/google`;
};
