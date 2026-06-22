import { defineChain } from "viem";
import { OG_NETWORK } from "@/lib/0g/network";

export const ogAristotle = defineChain({
  id: OG_NETWORK.chainId,
  name: OG_NETWORK.name,
  nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
  rpcUrls: {
    default: { http: [OG_NETWORK.chainRpc] },
  },
  blockExplorers: {
    default: {
      name: "0G Chainscan",
      url: OG_NETWORK.chainExplorer,
    },
  },
});

export const AGENTIC_ID_ABI = [
  {
    type: "function",
    name: "iMint",
    inputs: [
      { name: "to", type: "address" },
      {
        name: "datas",
        type: "tuple[]",
        components: [
          { name: "dataDescription", type: "string" },
          { name: "dataHash", type: "bytes32" },
        ],
      },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "mintFee",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tokenOfOwnerByIndex",
    inputs: [
      { name: "owner", type: "address" },
      { name: "index", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getIntelligentDatas",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "dataDescription", type: "string" },
          { name: "dataHash", type: "bytes32" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "authorizeUsage",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "user", type: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "logMilestone",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "milestoneType", type: "string" },
      { name: "storageRootHash", type: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getMilestones",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "milestoneType", type: "string" },
          { name: "storageRootHash", type: "string" },
          { name: "timestamp", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "MilestoneAchieved",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "milestoneType", type: "string", indexed: false },
      { name: "storageRootHash", type: "string", indexed: false },
    ],
  },
  {
    type: "event",
    name: "IntelligentDataSet",
    inputs: [{ name: "tokenId", type: "uint256", indexed: true }],
  },
] as const;

export function getAgenticIdAddress(): `0x${string}` {
  const addr = process.env.NEXT_PUBLIC_AGENTIC_ID_CONTRACT;
  if (!addr || addr === "0x0000000000000000000000000000000000000000") {
    throw new Error(
      "NEXT_PUBLIC_AGENTIC_ID_CONTRACT not configured - deploy GoalGhostAgenticID on Aristotle mainnet"
    );
  }
  return addr as `0x${string}`;
}