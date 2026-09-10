import { PrismaClient } from '@prisma/client';

let globalPrisma: PrismaClient | undefined;

export function getPrismaClient(): PrismaClient {
  if (!globalPrisma) {
    globalPrisma = new PrismaClient();
  }
  return globalPrisma;
}

export const prisma = getPrismaClient();
