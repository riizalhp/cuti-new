import { PrismaClient } from './generated/client/index.js';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  (globalForPrisma.prisma && (globalForPrisma.prisma as any).visitor)
    ? globalForPrisma.prisma
    : new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Named re-exports to avoid Turbopack CJS `export *` warning
export { PrismaClient, Prisma, ApplicationStatus, ApplicationSource } from './generated/client/index.js';
export type {
  User,
  Prisma as PrismaNamespace,
  Visitor,
  VisitorSession,
  VisitorPageView,
  VisitorActivity,
} from './generated/client/index.js';
export * from './logger';
