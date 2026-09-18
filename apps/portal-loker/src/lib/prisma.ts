// ============================================================================
// Prisma shim untuk Astro SSR
// ----------------------------------------------------------------------------
// Generated Prisma client adalah CommonJS dengan path query engine relatif ke
// __dirname. Kalau ikut di-bundle Rollup, named export & path engine rusak.
// Solusi: client di-require LANGSUNG saat runtime (Node murni) dari lokasi
// absolut yang di-inject Vite `define` (lihat astro.config.mjs).
// ============================================================================

import { createRequire } from 'node:module';

declare const __GENERATED_CLIENT_DIR__: string;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const require_ = createRequire(import.meta.url);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let PrismaClientCtor: any;

try {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client: any = require_(__GENERATED_CLIENT_DIR__);
  PrismaClientCtor = client.PrismaClient;
  if (!PrismaClientCtor) {
    throw new Error('PrismaClient tidak ditemukan di generated client');
  }
} catch (e) {
  console.error('[portal-loker] Gagal memuat Prisma client:', e);
  throw e;
}

// Singleton — aman untuk hot reload dev server
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof PrismaClientCtor> | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClientCtor({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
