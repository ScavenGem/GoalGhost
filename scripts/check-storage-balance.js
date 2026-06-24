/**
 * Check 0G mainnet balance for the storage upload wallet.
 * Usage: node scripts/check-storage-balance.js
 */
require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

const { ethers } = require("ethers");

const TARGET = "0xd42dfa9338f171e18722459790eeca5a64f1f4c0";

async function main() {
  const rpc = process.env.OG_CHAIN_RPC_URL?.trim() ?? "https://evmrpc.0g.ai";
  const provider = new ethers.JsonRpcProvider(rpc);
  const bal = await provider.getBalance(TARGET);
  console.log("RPC:", rpc);
  console.log("Storage wallet:", TARGET);
  console.log("Balance:", ethers.formatEther(bal), "OG");
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});