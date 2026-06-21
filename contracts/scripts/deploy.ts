import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying GoalGhostAgenticID with:", deployer.address);

  const GoalGhost = await ethers.getContractFactory("GoalGhostAgenticID");
  const contract = await GoalGhost.deploy(0); // free mint for demo
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("GoalGhostAgenticID deployed to:", address);
  console.log("Set NEXT_PUBLIC_AGENTIC_ID_CONTRACT=" + address);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});