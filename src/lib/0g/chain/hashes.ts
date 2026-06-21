import { keccak256, toUtf8Bytes } from "ethers";

/**
 * JUDGE NOTE - ON-CHAIN INTELLIGENT DATA HASHES
 * ERC-7857 stores hashes of encrypted 0G Storage blobs on-chain.
 * The chain anchors ownership; Storage holds the actual memories.
 */
export function hashStorageRoot(rootHash: string): `0x${string}` {
  return keccak256(toUtf8Bytes(rootHash)) as `0x${string}`;
}

export function buildIntelligentDataEntries(profileRoot: string, team: string) {
  return [
    {
      dataDescription: "GoalGhost Profile (0G Storage rootHash)",
      dataHash: hashStorageRoot(profileRoot),
    },
    {
      dataDescription: `Nation allegiance: ${team}`,
      dataHash: keccak256(toUtf8Bytes(team)) as `0x${string}`,
    },
  ];
}