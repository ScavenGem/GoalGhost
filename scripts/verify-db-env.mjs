/**
 * Fails Vercel builds when DATABASE_URL still points at localhost.
 * Also maps Vercel Postgres env vars into DATABASE_URL when unset.
 */

import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function readEnv(...keys) {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

function hostnameFromUrl(url) {
  try {
    return new URL(url.replace(/^postgresql:/i, "postgres:")).hostname.toLowerCase();
  } catch {
    return null;
  }
}

const resolvedDatabaseUrl = readEnv(
  "DATABASE_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL",
  "NEON_DATABASE_URL"
);

if (resolvedDatabaseUrl) {
  process.env.DATABASE_URL = resolvedDatabaseUrl;
}

const resolvedDirectUrl = readEnv(
  "DIRECT_URL",
  "POSTGRES_URL_NON_POOLING",
  "DATABASE_URL_UNPOOLED",
  "NEON_DIRECT_URL"
);

if (resolvedDirectUrl) {
  process.env.DIRECT_URL = resolvedDirectUrl;
} else if (resolvedDatabaseUrl) {
  process.env.DIRECT_URL = resolvedDatabaseUrl;
}

if (!process.env.DATABASE_URL) {
  if (process.env.VERCEL === "1") {
    console.error(
      "[verify-db-env] Missing DATABASE_URL on Vercel. Connect Vercel Postgres or Neon and expose POSTGRES_URL / DATABASE_URL."
    );
    process.exit(1);
  }
  console.warn("[verify-db-env] DATABASE_URL is not set (local builds may still work).");
  process.exit(0);
}

const host = hostnameFromUrl(process.env.DATABASE_URL);
if (process.env.VERCEL === "1" && host && LOCAL_HOSTS.has(host)) {
  console.error(
    `[verify-db-env] DATABASE_URL host "${host}" is invalid on Vercel. Use your hosted Postgres connection string instead of localhost.`
  );
  process.exit(1);
}

console.log("[verify-db-env] Database environment looks valid.");