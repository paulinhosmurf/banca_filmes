// ============================================================================
// Prisma Client Singleton
// ============================================================================
// Em desenvolvimento, hot-reload pode criar múltiplas instâncias do Prisma.
// Este padrão garante uma única conexão com o banco, prevenindo:
// - Connection pool exhaustion
// - Memory leaks
// ============================================================================

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
