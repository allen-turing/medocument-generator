import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const makePrismaClient = () => {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  // Use Turso adapter in production or when variables are present
  if (url && authToken) {
    console.log('🔌 Using Turso Adapter');
    const adapter = new PrismaLibSql({
      url,
      authToken,
    });
    return new PrismaClient({ adapter });
  }

  // Fallback to local SQLite
  console.log('📂 Using Local SQLite');
  return new PrismaClient();
};

export const prisma = globalForPrisma.prisma || makePrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
