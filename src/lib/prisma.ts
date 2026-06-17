import { PrismaClient } from "@prisma/client";

// Cache the client on globalThis so Next.js hot reload in dev does not open a
// new connection pool on every request.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
