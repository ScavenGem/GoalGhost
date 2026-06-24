import { OG_NETWORK } from "@/lib/0g/network";

export type StorageEnvStatus = {
  uploaderKeySet: boolean;
  indexerRpc: string;
  chainRpc: string;
  issues: string[];
};

/** Server wallet that pays 0G Storage upload gas (data stays ECIES-encrypted to user). */
export function getStorageUploaderPrivateKey(): string | null {
  const key = (
    process.env.OG_STORAGE_PRIVATE_KEY ??
    process.env.OG_STORAGE_UPLOADER_KEY ??
    process.env.OG_DEPLOYER_PRIVATE_KEY ??
    process.env.OG_COMPUTE_PRIVATE_KEY
  )?.trim();

  if (!key?.startsWith("0x")) return null;
  return key;
}

export function getStorageEnvStatus(): StorageEnvStatus {
  const indexerRpc =
    process.env.OG_STORAGE_INDEXER_RPC?.trim() ??
    OG_NETWORK.storageIndexerRpc;
  const chainRpc =
    process.env.OG_CHAIN_RPC_URL?.trim() ?? OG_NETWORK.chainRpc;
  const issues: string[] = [];

  if (!getStorageUploaderPrivateKey()) {
    issues.push(
      "OG_STORAGE_PRIVATE_KEY (or OG_STORAGE_UPLOADER_KEY) is missing — required for server-side 0G Storage seal on Vercel"
    );
  }

  if (indexerRpc.includes("localhost") || chainRpc.includes("localhost")) {
    issues.push("Storage RPC URLs must not point to localhost in production");
  }

  return {
    uploaderKeySet: !!getStorageUploaderPrivateKey(),
    indexerRpc,
    chainRpc,
    issues,
  };
}

export const STORAGE_SIGN_MESSAGE_PREFIX = "goalghost-storage:";

export function storageSignMessage(walletAddress: string): string {
  return `${STORAGE_SIGN_MESSAGE_PREFIX}${walletAddress}`;
}