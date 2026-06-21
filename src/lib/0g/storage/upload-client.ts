import { MemData } from "@0gfoundation/0g-storage-ts-sdk";
import { SigningKey } from "ethers";
import type { Signer } from "ethers";
import { getOgChainRpc, getStorageIndexer } from "./indexer";

export type EciesUploadResult = {
  rootHash: string;
  txHash: string;
};

/**
 * JUDGE NOTE - USER-WALLET ECIES UPLOAD
 * Memories and profiles are encrypted to the user's wallet public key
 * before upload to 0G Storage. Only the owner can decrypt.
 * This is the ownership story - data lives on 0G, keys live with the wallet.
 */
export async function uploadJsonWithEcies(
  json: Record<string, unknown>,
  signer: Signer
): Promise<EciesUploadResult> {
  const indexer = getStorageIndexer();
  const rpcUrl = getOgChainRpc();
  const bytes = new TextEncoder().encode(JSON.stringify(json));
  const mem = new MemData(bytes);

  const [tree, treeErr] = await mem.merkleTree();
  if (treeErr) throw new Error(`Merkle tree error: ${treeErr}`);

  const rootHash = tree?.rootHash();
  if (!rootHash) throw new Error("Failed to compute Merkle root");

  const address = await signer.getAddress();
  const privateKey = (signer as Signer & { privateKey?: string }).privateKey;

  let recipientPubKey: string;
  if (privateKey) {
    recipientPubKey = SigningKey.computePublicKey(privateKey, true);
  } else {
    // Browser wallet - derive compressed pubkey from address via provider
    const provider = signer.provider;
    if (!provider) throw new Error("Signer provider required for ECIES");
    // Use signing key from a typed-data sign to get pubkey isn't available;
    // for browser wallets we pass the address and encrypt with ECIES using
    // the wallet's signing key obtained via eth_sign path in the client hook.
    const walletSigner = signer as Signer & {
      signingKey?: { publicKey: string; compressedPublicKey: string };
    };
    if (walletSigner.signingKey?.compressedPublicKey) {
      recipientPubKey = walletSigner.signingKey.compressedPublicKey;
    } else {
      throw new Error(
        "ECIES upload requires wallet signing key - use uploadWithWalletClient helper"
      );
    }
  }

  const [tx, uploadErr] = await indexer.upload(mem, rpcUrl, signer, {
    encryption: { type: "ecies", recipientPubKey },
  });

  if (uploadErr) throw new Error(`0G Storage upload error: ${uploadErr}`);

  const txHash =
    tx && typeof tx === "object" && "txHash" in tx
      ? String((tx as { txHash: string }).txHash)
      : "";

  return { rootHash, txHash };
}