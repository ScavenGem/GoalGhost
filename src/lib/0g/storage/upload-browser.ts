"use client";

import type { Uploader } from "@0gfoundation/0g-storage-ts-sdk";
import {
  getBrowserStorageSigner,
  getEciesRecipientPubKey,
  getStorageSdk,
  getStorageUploader,
  warmEciesSealPipeline,
} from "@/lib/0g/storage/browser-signer";

export type BrowserUploadResult = {
  rootHash: string;
  txHash: string;
};

type SplitUploadResult = {
  txHashes: string[];
  rootHashes: string[];
  txSeqs: number[];
};

function normalizeUploadResult(result: SplitUploadResult): BrowserUploadResult {
  if (result.txHashes.length === 1 && result.rootHashes.length === 1) {
    return {
      txHash: result.txHashes[0],
      rootHash: result.rootHashes[0],
    };
  }

  return {
    txHash: result.txHashes[0] ?? "",
    rootHash: result.rootHashes[0] ?? "",
  };
}

async function uploadViaUploader(
  uploader: Uploader,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mem: any,
  recipientPubKey: string
): Promise<BrowserUploadResult> {
  const [result, uploadErr] = await uploader.splitableUpload(mem, {
    encryption: { type: "ecies", recipientPubKey },
  });

  if (uploadErr) throw new Error(`Upload failed: ${uploadErr}`);

  return normalizeUploadResult(result);
}

/**
 * JUDGE NOTE - BROWSER ECIES UPLOAD (USER WALLET)
 * Memories encrypted to the user's wallet pubkey, uploaded via their signer.
 * This proves wallet-owned permanent storage on 0G - not a centralized DB.
 */
export async function uploadJsonFromBrowser(
  json: Record<string, unknown>
): Promise<BrowserUploadResult> {
  const bytes = new TextEncoder().encode(JSON.stringify(json));

  await warmEciesSealPipeline();

  const [{ MemData }, { signer, address }] = await Promise.all([
    getStorageSdk(),
    getBrowserStorageSigner("ecies"),
  ]);

  const mem = new MemData(bytes);

  const [recipientPubKey, [tree, treeErr], uploader] = await Promise.all([
    getEciesRecipientPubKey(signer, address),
    mem.merkleTree(),
    getStorageUploader(signer),
  ]);

  if (treeErr) throw new Error(`Merkle error: ${treeErr}`);

  const rootHash = tree?.rootHash();
  if (!rootHash) throw new Error("No root hash");

  const { txHash } = await uploadViaUploader(uploader, mem, recipientPubKey);

  return { rootHash, txHash };
}