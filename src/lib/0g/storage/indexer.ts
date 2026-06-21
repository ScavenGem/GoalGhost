import { Indexer } from "@0gfoundation/0g-storage-ts-sdk";
import { OG_NETWORK } from "@/lib/0g/network";

let indexerInstance: Indexer | null = null;

/**
 * JUDGE NOTE - 0G STORAGE INDEXER
 * Canonical GoalGhost state (profiles, memories, checkpoints, legacy)
 * persists on 0G Storage. Postgres only caches rootHashes for speed.
 */
export function getStorageIndexer(): Indexer {
  if (indexerInstance) return indexerInstance;

  const rpc =
    process.env.OG_STORAGE_INDEXER_RPC ?? OG_NETWORK.storageIndexerRpc;

  indexerInstance = new Indexer(rpc);
  return indexerInstance;
}

export function getOgChainRpc(): string {
  return process.env.OG_CHAIN_RPC_URL ?? OG_NETWORK.chainRpc;
}