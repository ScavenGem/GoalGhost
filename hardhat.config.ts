import { config as loadEnv } from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";

loadEnv({ path: ".env.local" });
loadEnv();

const accounts = process.env.OG_DEPLOYER_PRIVATE_KEY
  ? [process.env.OG_DEPLOYER_PRIVATE_KEY]
  : [];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  paths: {
    sources: "./contracts",
  },
  networks: {
    "og-aristotle": {
      url: process.env.OG_CHAIN_RPC_URL ?? "https://evmrpc.0g.ai",
      chainId: 16661,
      accounts,
    },
  },
};

export default config;