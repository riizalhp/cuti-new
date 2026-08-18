/**
 * Konfigurasi situs FAQ (faq.employr.id).
 *
 * Mendukung environment:
 * - NEXT_PUBLIC_ENV = "development" | "staging" | "production"  (badge tampil di header)
 * - NEXT_PUBLIC_SITE_URL   = base URL situs FAQ ini (untuk metadata/canonical)
 * - NEXT_PUBLIC_APP_URL    = base URL dashboard pengguna (untuk tombol "Buka Dashboard")
 */

export type EnvName = "development" | "staging" | "production";

function detectEnv(): EnvName {
  const raw = process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV;
  if (raw === "development" || raw === "staging" || raw === "production") {
    return raw;
  }
  return process.env.NODE_ENV === "production" ? "production" : "development";
}

export const FAQ_ENV: EnvName = detectEnv();

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://faq.employr.id";

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (FAQ_ENV === "production" ? "https://app.employr.id" : "http://localhost:3000");

export const SITE_NAME = "Pusat Bantuan Employr";

export const ENV_LABEL: Record<EnvName, { label: string; className: string }> = {
  development: {
    label: "DEV",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  },
  staging: {
    label: "STAGING",
    className: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  },
  production: {
    label: "PROD",
    className: "bg-cobalt-100 text-cobalt-600 border-cobalt-200 dark:bg-cobalt-950 dark:text-blue-300 dark:border-cobalt-800",
  },
};

export function isProduction(): boolean {
  return FAQ_ENV === "production";
}
