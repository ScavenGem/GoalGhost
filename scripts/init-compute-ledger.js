/**
 * Initialize 0G Compute ledger on Aristotle mainnet.
 * Usage: npm run compute:init
 */
require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

const { ethers } = require("ethers");
const { createZGComputeNetworkBroker } = require("@0gfoundation/0g-compute-ts-sdk");

const MIN_DEPOSIT_OG = 3;
const TRANSFER_OG = 2;
const MAINNET_RPC = process.env.OG_COMPUTE_RPC_URL ?? "https://evmrpc.0g.ai";

async function main() {
  const privateKey = process.env.OG_COMPUTE_PRIVATE_KEY;
  if (!privateKey) {
    console.error("OG_COMPUTE_PRIVATE_KEY missing in .env.local");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(MAINNET_RPC);
  const wallet = new ethers.Wallet(privateKey, provider);
  const chainBalance = await provider.getBalance(wallet.address);
  const balanceOg = Number(ethers.formatEther(chainBalance));
  const network = await provider.getNetwork();

  console.log("Network: 0G Aristotle Mainnet (chain", network.chainId.toString() + ")");
  console.log("Compute wallet:", wallet.address);
  console.log("Chain balance:", balanceOg.toFixed(4), "OG");
  console.log("Required:", MIN_DEPOSIT_OG, "OG minimum ledger deposit + gas");

  if (balanceOg < MIN_DEPOSIT_OG + 0.2) {
    console.error("\nInsufficient mainnet OG. Fund compute wallet, then re-run.");
    console.error("After init, set OG_COMPUTE_MODE=live in .env.local");
    process.exit(1);
  }

  const broker = await createZGComputeNetworkBroker(wallet);

  console.log(`\nDepositing ${MIN_DEPOSIT_OG} OG to compute ledger…`);
  await broker.ledger.depositFund(MIN_DEPOSIT_OG);
  console.log("Deposit OK");

  const services = await broker.inference.listService();
  const chatbot = services.find((s) => s.serviceType === "chatbot");
  if (!chatbot) {
    console.error("No chatbot provider on mainnet 0G Compute");
    process.exit(1);
  }

  console.log("Chatbot provider:", chatbot.provider);
  console.log(`Transferring ${TRANSFER_OG} OG to provider…`);
  await broker.ledger.transferFund(chatbot.provider, "inference", BigInt(TRANSFER_OG));
  console.log("Transfer OK");

  await broker.inference.acknowledgeProviderSigner(chatbot.provider);
  console.log("\n✓ Mainnet compute ledger ready.");
  console.log("Set OG_COMPUTE_MODE=live in .env.local and restart dev server.");
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});