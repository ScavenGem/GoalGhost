/**
 * POST smoke-test for /api/storage/seal-ghost (local or production).
 * Usage: node scripts/test-seal-api.js [baseUrl]
 * Default baseUrl: https://goalghost.vercel.app
 */
require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

const { Wallet } = require("ethers");

const STORAGE_SIGN_PREFIX = "goalghost-storage:";

function storageSignMessage(addr) {
  return `${STORAGE_SIGN_PREFIX}${addr}`;
}

async function main() {
  const base = (process.argv[2] ?? "https://goalghost.vercel.app").replace(/\/$/, "");
  const url = `${base}/api/storage/seal-ghost`;

  const user = Wallet.createRandom();
  const message = storageSignMessage(user.address);
  const storageSignature = await user.signMessage(message);
  const json = { test: "goalghost-seal-api", ts: Date.now() };

  console.log("POST", url);
  console.log("User wallet:", user.address);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ walletAddress: user.address, storageSignature, json }),
  });

  const body = await res.text();
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    parsed = { raw: body.slice(0, 500) };
  }

  console.log("Status:", res.status);
  console.log("Response:", JSON.stringify(parsed, null, 2));

  if (!res.ok) process.exit(1);
  if (!parsed.rootHash) process.exit(1);
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});