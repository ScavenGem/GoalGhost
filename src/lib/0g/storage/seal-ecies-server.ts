import { MemData } from "@0gfoundation/0g-storage-ts-sdk";
import { SigningKey, hashMessage, verifyMessage } from "ethers";
import { getOgChainRpc, getStorageIndexer } from "@/lib/0g/storage/indexer";
import {
  getServerStorageWallet,
  getStorageUploaderPrivateKey,
  storageSignMessage,
} from "@/lib/0g/storage/storage-env";

const UPLOAD_TIMEOUT_MS = 45_000;

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
          () => reject(new Error(`${label} timed out after ${Math.round(ms / 1000)}s`)),
          ms
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function recipientPubKeyFromSignature(
  walletAddress: string,
  storageSignature: string
): string {
  const message = storageSignMessage(walletAddress);
  const pubkey = SigningKey.recoverPublicKey(
    hashMessage(message),
    storageSignature
  );
  return SigningKey.computePublicKey(pubkey, true);
}

export async function sealEciesJsonOnServer(params: {
  json: Record<string, unknown>;
  walletAddress: string;
  storageSignature: string;
}): Promise<{ rootHash: string; txHash: string }> {
  const privateKey = getStorageUploaderPrivateKey();
  if (!privateKey) {
    throw new Error(
      "OG_STORAGE_PRIVATE_KEY is not configured on the server (Vercel → Environment Variables)"
    );
  }

  const walletAddress = params.walletAddress.trim();
  const message = storageSignMessage(walletAddress);
  let recovered: string;
  try {
    recovered = verifyMessage(message, params.storageSignature);
  } catch {
    throw new Error("Invalid storage signature — please sign again in your wallet");
  }

  if (recovered.toLowerCase() !== walletAddress.toLowerCase()) {
    throw new Error("Storage signature does not match the connected wallet");
  }

  const recipientPubKey = recipientPubKeyFromSignature(
    walletAddress,
    params.storageSignature
  );

  const bytes = new TextEncoder().encode(JSON.stringify(params.json));
  const mem = new MemData(bytes);
  const [tree, treeErr] = await mem.merkleTree();
  if (treeErr) throw new Error(`Merkle error: ${treeErr}`);

  const rootHash = tree?.rootHash();
  if (!rootHash) throw new Error("Failed to compute storage root hash");

  const signer = getServerStorageWallet();
  const indexer = getStorageIndexer();
  const rpcUrl = getOgChainRpc();

  const [tx, uploadErr] = await withTimeout(
    indexer.upload(mem, rpcUrl, signer, {
      encryption: { type: "ecies", recipientPubKey },
    }),
    UPLOAD_TIMEOUT_MS,
    "0G Storage ECIES upload"
  );

  if (uploadErr) {
    const detail =
      uploadErr instanceof Error
        ? uploadErr.message
        : typeof uploadErr === "string"
          ? uploadErr
          : JSON.stringify(uploadErr);
    throw new Error(`0G Storage upload failed: ${detail}`);
  }

  const txHash =
    tx && typeof tx === "object" && "txHash" in tx
      ? String((tx as { txHash: string }).txHash)
      : "";

  return { rootHash, txHash };
}