import { getStorageIndexer } from "./indexer";

/**
 * JUDGE NOTE - 0G STORAGE READ
 * Memories are fetched by permanent Merkle rootHash from 0G Storage.
 * Without Storage, the timeline and legacy pages have nothing to show.
 */
export async function downloadJsonFromStorage(
  rootHash: string,
  privateKey?: string
): Promise<Record<string, unknown>> {
  const indexer = getStorageIndexer();

  const [blob, err] = await indexer.downloadToBlob(rootHash, {
    proof: true,
    ...(privateKey ? { decryption: { privateKey } } : {}),
  });

  if (err) throw new Error(`0G Storage download error: ${err}`);
  if (!blob) throw new Error("Empty blob from 0G Storage");

  const text = await blob.text();
  return JSON.parse(text) as Record<string, unknown>;
}

export async function downloadBlobFromStorage(rootHash: string): Promise<Blob> {
  const indexer = getStorageIndexer();
  const [blob, err] = await indexer.downloadToBlob(rootHash, { proof: true });
  if (err) throw new Error(`0G Storage download error: ${err}`);
  if (!blob) throw new Error("Empty blob from 0G Storage");
  return blob;
}