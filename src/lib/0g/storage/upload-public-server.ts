import { MemData } from "@0gfoundation/0g-storage-ts-sdk";
import { Wallet } from "ethers";
import { getOgChainRpc, getStorageIndexer } from "./indexer";

export type ServerPublicUploadResult = {
  rootHash: string;
  txHash: string;
  storedOnChain: boolean;
};

const DEFAULT_UPLOAD_TIMEOUT_MS = 8_000;

async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`${label} timed out after ${ms}ms`)),
          ms
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function computePublicBytesRootHash(
  bytes: Uint8Array
): Promise<string> {
  const mem = new MemData(bytes);
  const [tree, treeErr] = await mem.merkleTree();
  if (treeErr) throw new Error(`Merkle error: ${treeErr}`);

  const rootHash = tree?.rootHash();
  if (!rootHash) throw new Error("No root hash");
  return rootHash;
}

/**
 * Server-side public 0G Storage upload for wallet-signed comments.
 * Returns the content hash immediately; on-chain upload is best-effort with timeout.
 */
export async function uploadPublicBytesFromServer(
  bytes: Uint8Array,
  options?: { timeoutMs?: number }
): Promise<ServerPublicUploadResult> {
  const rootHash = await computePublicBytesRootHash(bytes);

  const privateKey =
    process.env.OG_STORAGE_PRIVATE_KEY ??
    process.env.OG_STORAGE_UPLOADER_KEY ??
    process.env.OG_DEPLOYER_PRIVATE_KEY ??
    process.env.OG_COMPUTE_PRIVATE_KEY;

  if (!privateKey?.startsWith("0x")) {
    return { rootHash, txHash: "", storedOnChain: false };
  }

  const timeoutMs = options?.timeoutMs ?? DEFAULT_UPLOAD_TIMEOUT_MS;

  try {
    const mem = new MemData(bytes);
    const signer = new Wallet(privateKey);
    const indexer = getStorageIndexer();
    const [tx, uploadErr] = await withTimeout(
      indexer.upload(mem, getOgChainRpc(), signer),
      timeoutMs,
      "0G Storage upload"
    );

    if (uploadErr) {
      console.warn("0G public upload failed:", uploadErr);
      return { rootHash, txHash: "", storedOnChain: false };
    }

    return {
      rootHash,
      txHash:
        tx && typeof tx === "object" && "txHash" in tx
          ? String((tx as { txHash: string }).txHash)
          : "",
      storedOnChain: true,
    };
  } catch (error) {
    console.warn("0G public upload error:", error);
    return { rootHash, txHash: "", storedOnChain: false };
  }
}

export async function uploadPublicJsonFromServer(
  json: Record<string, unknown>
): Promise<ServerPublicUploadResult> {
  const bytes = new TextEncoder().encode(JSON.stringify(json));
  return uploadPublicBytesFromServer(bytes);
}