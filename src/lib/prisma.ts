import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// In Vercel serverless environment, copy SQLite database to writable /tmp
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
}

if (process.env.VERCEL) {
  try {
    const tmpDbPath = path.join("/tmp", "dev.db");
    const candidates = [
      path.join(process.cwd(), "prisma", "dev.db"),
      path.join(process.cwd(), "dev.db"),
    ];

    for (const src of candidates) {
      if (fs.existsSync(src)) {
        if (!fs.existsSync(tmpDbPath)) {
          fs.copyFileSync(src, tmpDbPath);
        }
        break;
      }
    }

    if (fs.existsSync(tmpDbPath)) {
      process.env.DATABASE_URL = `file:${tmpDbPath}`;
    }
  } catch (e) {
    console.warn("Vercel sqlite /tmp setup warning:", e);
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

