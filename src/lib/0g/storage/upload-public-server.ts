import { MemData } from "@0gfoundation/0g-storage-ts-sdk";
import { Wallet } from "ethers";
import { getOgChainRpc, getStorageIndexer } from "./indexer";

export type ServerPublicUploadResult = {
  rootHash: string;
  txHash: string;
  storedOnChain: boolean;
};

/**
 * Server-side public 0G Storage upload for wallet-signed comments.
 * Avoids bundling the SDK in the browser (chunk load failures).
 */
export async function uploadPublicJsonFromServer(
  json: Record<string, unknown>
): Promise<ServerPublicUploadResult> {
  const bytes = new TextEncoder().encode(JSON.stringify(json));
  const mem = new MemData(bytes);
  const [tree, treeErr] = await mem.merkleTree();
  if (treeErr) throw new Error(`Merkle error: ${treeErr}`);

  const rootHash = tree?.rootHash();
  if (!rootHash) throw new Error("No root hash");

  const privateKey =
    process.env.OG_STORAGE_UPLOADER_KEY ??
    process.env.OG_DEPLOYER_PRIVATE_KEY ??
    process.env.OG_COMPUTE_PRIVATE_KEY;

  if (!privateKey?.startsWith("0x")) {
    return { rootHash, txHash: "", storedOnChain: false };
  }

  try {
    const signer = new Wallet(privateKey);
    const indexer = getStorageIndexer();
    const [tx, uploadErr] = await indexer.upload(mem, getOgChainRpc(), signer);

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