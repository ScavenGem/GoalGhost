/**
 * Checks deployer balance and deploys GoalGhostAgenticID when funded.
 * Usage: node scripts/fund-and-deploy.js
 */
require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

const { execSync } = require("child_process");
const { ethers } = require("ethers");

const DEPLOYER = process.env.OG_DEPLOYER_PRIVATE_KEY
  ? new ethers.Wallet(process.env.OG_DEPLOYER_PRIVATE_KEY).address
  : null;

async function main() {
  if (!DEPLOYER) {
    console.error("OG_DEPLOYER_PRIVATE_KEY missing in .env.local");
    process.exit(1);
  }

  const rpc = process.env.OG_CHAIN_RPC_URL ?? "https://evmrpc-testnet.0g.ai";
  const provider = new ethers.JsonRpcProvider(rpc);
  const balance = await provider.getBalance(DEPLOYER);

  console.log("Deployer:", DEPLOYER);
  console.log("Balance:", ethers.formatEther(balance), "OG");

  if (balance === 0n) {
    console.log("\n⚠ Fund required before deploy:");
    console.log("  1. https://faucet.0g.ai");
    console.log("  2. https://cloud.google.com/application/web3/faucet/0g/galileo");
    console.log("\nThen re-run: npm run contract:deploy");
    process.exit(1);
  }

  console.log("\nDeploying GoalGhostAgenticID…\n");
  execSync("npx hardhat run contracts/scripts/deploy.js --network og-galileo", {
    stdio: "inherit",
    env: process.env,
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});