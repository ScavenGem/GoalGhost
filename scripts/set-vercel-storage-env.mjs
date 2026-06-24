/**
 * Push OG_STORAGE_PRIVATE_KEY from .env.local to Vercel Production.
 * Usage: node scripts/set-vercel-storage-env.mjs
 */
import { execFileSync } from "node:child_process";
import { config } from "dotenv";
import { writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

config({ path: ".env.local" });

const value = process.env.OG_STORAGE_PRIVATE_KEY?.trim();
if (!value?.startsWith("0x") || value.length < 66) {
  console.error("OG_STORAGE_PRIVATE_KEY missing or invalid in .env.local");
  process.exit(1);
}

const tmp = join(tmpdir(), `gg-vercel-env-${Date.now()}.tmp`);
writeFileSync(tmp, value, { encoding: "utf8" });

try {
  execFileSync(
    "npx",
    [
      "vercel",
      "env",
      "add",
      "OG_STORAGE_PRIVATE_KEY",
      "production",
      "--yes",
      "--sensitive",
      "--force",
    ],
    {
      input: value,
      stdio: ["pipe", "inherit", "inherit"],
      shell: true,
    }
  );
  console.log("OG_STORAGE_PRIVATE_KEY set on Vercel Production.");
} finally {
  try {
    unlinkSync(tmp);
  } catch {
    /* ignore */
  }
}