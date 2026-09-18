import { PrismaClient } from '@prisma/client';

let globalPrisma: PrismaClient | undefined;

export function getPrismaClient(): PrismaClient {
  if (!globalPrisma) {
    globalPrisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }
  return globalPrisma;
}

// Lazy Proxy: instantiates PrismaClient only when database is first queried
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const val = (client as any)[prop];
    return typeof val === 'function' ? val.bind(client) : val;
  },
});
