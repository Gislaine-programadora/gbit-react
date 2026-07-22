import { PrismaClient } from "@prisma/client";

// Evita múltiplas instâncias do PrismaClient em modo dev (hot reload)
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
