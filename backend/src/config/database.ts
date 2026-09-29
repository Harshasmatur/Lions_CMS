import { PrismaClient } from "@prisma/client";
import { env } from "./env";

// TEMPORARY DEBUG — remove after testing
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.log("DATABASE_URL is MISSING");
} else {
  const url = new URL(dbUrl);

  console.log("DB DEBUG:", {
    host: url.hostname,
    port: url.port,
    username: decodeURIComponent(url.username),
    database: url.pathname.slice(1),
    passwordLength: decodeURIComponent(url.password).length,
  });
}

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

// Reuse a single PrismaClient instance across hot reloads in development.
export const prisma =
  global.__prisma__ ??
  new PrismaClient({
    log: env.isProduction ? ["error", "warn"] : ["error", "warn", "info"],
  });

if (!env.isProduction) {
  global.__prisma__ = prisma;
}

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
