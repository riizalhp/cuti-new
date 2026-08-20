import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Named re-exports to avoid Turbopack CJS `export *` warning
export { PrismaClient, Prisma, ApplicationStatus } from '@prisma/client';
export type { User, Prisma as PrismaNamespace } from '@prisma/client';
export * from './logger.ts';
