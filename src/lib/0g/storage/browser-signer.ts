"use client";

import {
  BrowserProvider,
  SigningKey,
  hashMessage,
  type JsonRpcSigner,
} from "ethers";
import type { Indexer, Uploader } from "@0gfoundation/0g-storage-ts-sdk";
import { OG_NETWORK } from "@/lib/0g/network";

let cachedProvider: BrowserProvider | null = null;
let cachedSigner: JsonRpcSigner | null = null;
let cachedAddress: string | null = null;
let cachedRecipientPubKey: string | null = null;
let cachedIndexer: Indexer | null = null;
let cachedUploader: Uploader | null = null;
let cachedUploaderAddress: string | null = null;
let sdkImportPromise: Promise<typeof import("@0gfoundation/0g-storage-ts-sdk")> | null =
  null;
let sealPipelineWarmPromise: Promise<void> | null = null;
let eciesCredentialsPromise: Promise<string | null> | null = null;
let indexerNodesWarmPromise: Promise<void> | null = null;
let uploaderWarmPromise: Promise<void> | null = null;

function getBrowserProvider(): BrowserProvider {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("Wallet required for 0G Storage upload");
  }
  if (!cachedProvider) {
    cachedProvider = new BrowserProvider(window.ethereum);
  }
  return cachedProvider;
}

export function preloadStorageSdk() {
  if (!sdkImportPromise) {
    sdkImportPromise = import("@0gfoundation/0g-storage-ts-sdk").then((sdk) => {
      void warmEciesSealPipeline();
      return sdk;
    });
  }
  return sdkImportPromise;
}

export async function getStorageSdk() {
  return preloadStorageSdk();
}

async function warmIndexerNodes(indexer: Indexer) {
  if (!indexerNodesWarmPromise) {
    indexerNodesWarmPromise = indexer
      .getShardedNodes()
      .then(() => undefined)
      .catch(() => undefined);
  }
  return indexerNodesWarmPromise;
}

async function warmChainRpc(signer: JsonRpcSigner) {
  const provider = signer.provider;
  if (!provider) return;
  await Promise.all([
    provider.send("eth_chainId", []).catch(() => undefined),
    provider.send("eth_blockNumber", []).catch(() => undefined),
  ]);
}

export async function getStorageUploader(
  signer: JsonRpcSigner
): Promise<Uploader> {
  const address = (await signer.getAddress()).toLowerCase();
  if (cachedUploader && cachedUploaderAddress === address) {
    return cachedUploader;
  }

  const indexer = await getStorageIndexer();
  const [uploader, err] = await indexer.newUploaderFromIndexerNodes(
    OG_NETWORK.chainRpc,
    signer,
    1
  );

  if (err || !uploader) {
    throw err ?? new Error("Failed to initialize 0G Storage uploader");
  }

  cachedUploader = uploader;
  cachedUploaderAddress = address;
  return uploader;
}

async function warmStorageUploader() {
  if (uploaderWarmPromise) return uploaderWarmPromise;

  uploaderWarmPromise = (async () => {
    try {
      const { signer } = await getBrowserStorageSigner("ecies");
      await getStorageUploader(signer);
    } catch {
      // Wallet may not be connected yet during idle preload.
    }
  })();

  return uploaderWarmPromise;
}

/**
 * Warms SDK, indexer nodes, signer, chain RPC, and uploader without signatures.
 */
export async function warmEciesSealPipeline(): Promise<void> {
  if (sealPipelineWarmPromise) return sealPipelineWarmPromise;

  sealPipelineWarmPromise = (async () => {
    try {
      const [, indexer] = await Promise.all([
        getStorageSdk(),
        getStorageIndexer(),
      ]);
      await warmIndexerNodes(indexer);

      try {
        const { signer } = await getBrowserStorageSigner("ecies");
        await Promise.all([warmChainRpc(signer), warmStorageUploader()]);
      } catch {
        // Wallet may not be connected yet during idle preload.
      }
    } catch {
      // Best-effort warmup; upload path still performs full initialization.
    }
  })();

  return sealPipelineWarmPromise;
}

/**
 * Pre-derives the ECIES recipient pubkey so the seal click only waits on upload.
 * Safe to call multiple times; resolves instantly when already cached.
 */
export async function prepareEciesSealCredentials(): Promise<string | null> {
  if (cachedRecipientPubKey) return cachedRecipientPubKey;

  if (eciesCredentialsPromise) return eciesCredentialsPromise;

  eciesCredentialsPromise = (async () => {
    try {
      const { signer, address } = await getBrowserStorageSigner("ecies");
      const pubkey = await getEciesRecipientPubKey(signer, address);
      void warmStorageUploader();
      return pubkey;
    } catch {
      return null;
    } finally {
      eciesCredentialsPromise = null;
    }
  })();

  return eciesCredentialsPromise;
}

/**
 * Full seal prep: pipeline warm + ECIES credentials + uploader cache.
 */
export async function prepareEciesSealUpload(): Promise<void> {
  await warmEciesSealPipeline();
  await prepareEciesSealCredentials();
}

export async function getBrowserStorageSigner(
  context: "ecies" | "public" = "public"
): Promise<{
  signer: JsonRpcSigner;
  address: string;
}> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error(
      context === "ecies"
        ? "Wallet required for 0G Storage ECIES upload"
        : "Wallet required for 0G Storage upload"
    );
  }

  if (cachedSigner && cachedAddress) {
    return { signer: cachedSigner, address: cachedAddress };
  }

  const provider = getBrowserProvider();
  const accounts: string[] = await provider.send("eth_accounts", []);
  if (accounts.length === 0) {
    await provider.send("eth_requestAccounts", []);
  }

  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  cachedSigner = signer;
  cachedAddress = address;

  return { signer, address };
}

export async function getEciesRecipientPubKey(
  signer: JsonRpcSigner,
  address: string
): Promise<string> {
  if (cachedRecipientPubKey) return cachedRecipientPubKey;

  const sig = await signer.signMessage(`goalghost-storage:${address}`);
  const pubkey = SigningKey.recoverPublicKey(
    hashMessage(`goalghost-storage:${address}`),
    sig
  );
  cachedRecipientPubKey = SigningKey.computePublicKey(pubkey, true);
  return cachedRecipientPubKey;
}

export async function getStorageIndexer() {
  const { Indexer } = await getStorageSdk();
  if (!cachedIndexer) {
    cachedIndexer = new Indexer(OG_NETWORK.storageIndexerRpc);
  }
  void warmIndexerNodes(cachedIndexer);
  return cachedIndexer;
}