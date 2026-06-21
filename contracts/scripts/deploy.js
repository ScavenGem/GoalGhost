const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying GoalGhostAgenticID with:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "OG");

  if (balance === 0n) {
    throw new Error(
      `Deployer ${deployer.address} has 0 OG on this network. Fund with mainnet OG (Aristotle) or testnet faucet, then re-run npm run contract:deploy`
    );
  }

  const GoalGhost = await hre.ethers.getContractFactory("GoalGhostAgenticID");
  const contract = await GoalGhost.deploy(0);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("GoalGhostAgenticID deployed to:", address);
  console.log("");
  console.log("Add to .env.local:");
  console.log("NEXT_PUBLIC_AGENTIC_ID_CONTRACT=" + address);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});