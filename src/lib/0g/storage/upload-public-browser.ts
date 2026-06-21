"use client";

import { OG_NETWORK } from "@/lib/0g/network";
import {
  getBrowserStorageSigner,
  getStorageIndexer,
  getStorageSdk,
} from "@/lib/0g/storage/browser-signer";

export type PublicBrowserUploadResult = {
  rootHash: string;
  txHash: string;
};

/**
 * Public 0G Storage upload with no ECIES encryption.
 * Used for wallet-signed legacy comments readable by anyone.
 */
export async function uploadPublicBytesFromBrowser(
  bytes: Uint8Array
): Promise<PublicBrowserUploadResult> {
  const [{ MemData }, { signer }, indexer] = await Promise.all([
    getStorageSdk(),
    getBrowserStorageSigner("public"),
    getStorageIndexer(),
  ]);

  const mem = new MemData(bytes);
  const [tree, treeErr] = await mem.merkleTree();
  if (treeErr) throw new Error(`Merkle error: ${treeErr}`);

  const rootHash = tree?.rootHash();
  if (!rootHash) throw new Error("No root hash");

  const [tx, uploadErr] = await indexer.upload(mem, OG_NETWORK.chainRpc, signer);

  if (uploadErr) throw new Error(`Upload failed: ${uploadErr}`);

  return {
    rootHash,
    txHash:
      tx && typeof tx === "object" && "txHash" in tx
        ? String((tx as { txHash: string }).txHash)
        : "",
  };
}

export async function uploadPublicJsonFromBrowser(
  json: Record<string, unknown>
): Promise<PublicBrowserUploadResult> {
  const bytes = new TextEncoder().encode(JSON.stringify(json));
  return uploadPublicBytesFromBrowser(bytes);
}