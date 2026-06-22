require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

const { ethers } = require("ethers");

const SEND_OG = "0.45";

async function main() {
  const rpc = process.env.OG_COMPUTE_RPC_URL ?? "https://evmrpc.0g.ai";
  const provider = new ethers.JsonRpcProvider(rpc);
  const deployer = new ethers.Wallet(process.env.OG_DEPLOYER_PRIVATE_KEY, provider);
  const compute = new ethers.Wallet(process.env.OG_COMPUTE_PRIVATE_KEY, provider);

  const deployerBal = await provider.getBalance(deployer.address);
  console.log("Deployer:", deployer.address, ethers.formatEther(deployerBal), "OG");
  console.log("Compute:", compute.address);

  const send = ethers.parseEther(SEND_OG);
  if (deployerBal < send) {
    console.error("Deployer insufficient for transfer. Fund deployer or compute wallet directly.");
    process.exit(1);
  }

  const tx = await deployer.sendTransaction({ to: compute.address, value: send });
  console.log("Sending", SEND_OG, "OG… tx:", tx.hash);
  await tx.wait();
  console.log("Done. Compute balance:", ethers.formatEther(await provider.getBalance(compute.address)), "OG");
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});