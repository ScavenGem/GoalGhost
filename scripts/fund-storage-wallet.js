/**
 * One-time fund the GoalGhost server storage upload wallet on 0G mainnet.
 * Usage: node scripts/fund-storage-wallet.js
 * Requires in .env.local (never commit):
 *   OG_COMPUTE_PRIVATE_KEY (or another funded wallet) — source
 *   OG_DEPLOYER_PRIVATE_KEY — storage upload wallet (target when OG_STORAGE_PRIVATE_KEY unset)
 * Env: OG_CHAIN_RPC_URL (default https://evmrpc.0g.ai)
 */
require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

const { ethers } = require("ethers");

const TARGET_ADDRESS = "0xd42dfa9338f171e18722459790eeca5a64f1f4c0";
const SEND_OG = "0.05";

const STORAGE_KEY_VARS = [
  "OG_STORAGE_PRIVATE_KEY",
  "OG_STORAGE_UPLOADER_KEY",
  "OG_DEPLOYER_PRIVATE_KEY",
  "OG_COMPUTE_PRIVATE_KEY",
];

const FUNDER_KEY_VARS = [
  "OG_COMPUTE_PRIVATE_KEY",
  "OG_DEPLOYER_PRIVATE_KEY",
  "OG_STORAGE_PRIVATE_KEY",
  "OG_STORAGE_UPLOADER_KEY",
];

function walletFromEnv(varName) {
  const key = process.env[varName]?.trim();
  if (!key?.startsWith("0x")) return null;
  return new ethers.Wallet(key);
}

function resolveStorageWalletAddress() {
  for (const varName of STORAGE_KEY_VARS) {
    const w = walletFromEnv(varName);
    if (!w) continue;
    if (w.address.toLowerCase() === TARGET_ADDRESS.toLowerCase()) {
      return { varName, address: w.address };
    }
  }
  for (const varName of STORAGE_KEY_VARS) {
    const w = walletFromEnv(varName);
    if (w) return { varName, address: w.address };
  }
  return null;
}

function resolveFunder(provider) {
  for (const varName of FUNDER_KEY_VARS) {
    const key = process.env[varName]?.trim();
    if (!key?.startsWith("0x")) continue;
    const w = new ethers.Wallet(key, provider);
    if (w.address.toLowerCase() === TARGET_ADDRESS.toLowerCase()) continue;
    return { varName, wallet: w };
  }
  return null;
}

async function main() {
  const rpc = process.env.OG_CHAIN_RPC_URL?.trim() ?? "https://evmrpc.0g.ai";
  if (rpc.includes("localhost") || rpc.includes("127.0.0.1")) {
    console.error("Refusing to run: OG_CHAIN_RPC_URL points to localhost (mainnet only).");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(rpc);
  const storage = resolveStorageWalletAddress();
  const funder = resolveFunder(provider);

  if (!storage) {
    console.error("No storage server private key found in env.");
    process.exit(1);
  }

  if (!funder) {
    console.error(
      "No funded source wallet found — set OG_COMPUTE_PRIVATE_KEY (or another wallet != target) in .env.local"
    );
    process.exit(1);
  }

  console.log("RPC:", rpc);
  console.log("Storage wallet env:", storage.varName);
  console.log("Storage address:", storage.address);
  console.log("Target address:", TARGET_ADDRESS);
  console.log("Funder env:", funder.varName);
  console.log("Funder:", funder.wallet.address);

  if (storage.address.toLowerCase() !== TARGET_ADDRESS.toLowerCase()) {
    console.error(
      "Storage env wallet does not match expected target. Aborting — will not send funds."
    );
    process.exit(1);
  }

  const [funderBalBefore, targetBalBefore] = await Promise.all([
    provider.getBalance(funder.wallet.address),
    provider.getBalance(TARGET_ADDRESS),
  ]);

  console.log("Funder balance before:", ethers.formatEther(funderBalBefore), "OG");
  console.log("Target balance before:", ethers.formatEther(targetBalBefore), "OG");

  const send = ethers.parseEther(SEND_OG);
  const gasReserve = ethers.parseEther("0.01");
  if (funderBalBefore < send + gasReserve) {
    console.error("Funder insufficient for", SEND_OG, "OG transfer + gas reserve.");
    process.exit(1);
  }

  const tx = await funder.wallet.sendTransaction({
    to: TARGET_ADDRESS,
    value: send,
  });
  console.log("Sending", SEND_OG, "OG… tx:", tx.hash);
  await tx.wait();

  const targetBalAfter = await provider.getBalance(TARGET_ADDRESS);
  console.log("Target balance after:", ethers.formatEther(targetBalAfter), "OG");
  console.log("Funding complete.");
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});