import { Prisma } from "@prisma/client";

export class DatabaseConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseConfigError";
  }
}

const LOCAL_DB_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function readEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

function hostnameFromDatabaseUrl(url: string): string | null {
  try {
    const normalized = url.replace(/^postgresql:/i, "postgres:");
    return new URL(normalized).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/** Resolve the runtime Prisma connection string (Vercel Postgres fallbacks included). */
export function resolveDatabaseUrl(): string | undefined {
  return readEnv(
    "DATABASE_URL",
    "POSTGRES_PRISMA_URL",
    "POSTGRES_URL",
    "NEON_DATABASE_URL"
  );
}

/** Direct/non-pooled URL for migrations when using PgBouncer. */
export function resolveDirectUrl(): string | undefined {
  return readEnv(
    "DIRECT_URL",
    "POSTGRES_URL_NON_POOLING",
    "DATABASE_URL_UNPOOLED",
    "NEON_DIRECT_URL"
  );
}

/** Populate Prisma env vars before the client is constructed. */
export function ensureDatabaseEnv(): void {
  const databaseUrl = resolveDatabaseUrl();
  if (databaseUrl) {
    process.env.DATABASE_URL = databaseUrl;
  }

  const directUrl = resolveDirectUrl();
  if (directUrl) {
    process.env.DIRECT_URL = directUrl;
  } else if (databaseUrl) {
    process.env.DIRECT_URL = databaseUrl;
  }
}

export function assertDatabaseConfigured(): void {
  ensureDatabaseEnv();

  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new DatabaseConfigError(
      "DATABASE_URL is not configured. On Vercel, connect Vercel Postgres or Neon and map POSTGRES_URL (or DATABASE_URL) in Project Settings → Environment Variables."
    );
  }

  if (process.env.VERCEL === "1") {
    const host = hostnameFromDatabaseUrl(databaseUrl);
    if (host && LOCAL_DB_HOSTS.has(host)) {
      throw new DatabaseConfigError(
        "DATABASE_URL points to localhost on Vercel. Replace it with your hosted Postgres connection string (Vercel Postgres POSTGRES_URL or Neon DATABASE_URL)."
      );
    }
  }
}

export function sanitizeDatabaseError(error: unknown): string {
  if (error instanceof DatabaseConfigError) {
    return error.message;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2021") {
      return "Match reactions table is missing in production. Redeploy after running prisma migrate deploy against your hosted database.";
    }
    if (error.code === "P1001") {
      return "Database is unreachable. Verify DATABASE_URL (or POSTGRES_URL) in Vercel environment variables.";
    }
  }

  if (error instanceof Error) {
    const message = error.message;
    if (
      message.includes("localhost:5432") ||
      message.includes("Can't reach database server") ||
      message.includes("Environment variable not found: DATABASE_URL")
    ) {
      return "Database is not configured for production. Set DATABASE_URL to your hosted Postgres connection string in Vercel.";
    }
  }

  return "Database operation failed";
}