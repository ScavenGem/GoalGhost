"use client";

import {
  fetchWithTimeout,
  readApiErrorMessage,
} from "@/lib/api/client-fetch";
import {
  getBrowserStorageSigner,
  prepareEciesSealUpload,
} from "@/lib/0g/storage/browser-signer";
import { storageSignMessage } from "@/lib/0g/storage/storage-env";
import { formatStorageError } from "@/lib/0g/storage/storage-errors";
import type { BrowserUploadResult } from "@/lib/0g/storage/upload-browser";
import { uploadJsonFromBrowser } from "@/lib/0g/storage/upload-browser";

const SEAL_API_TIMEOUT_MS = 60_000;

function isLocalDevHost(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
}

async function sealViaServerApi(
  json: Record<string, unknown>,
  walletAddress: string,
  storageSignature: string
): Promise<BrowserUploadResult> {
  const res = await fetchWithTimeout("/api/storage/seal-ghost", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ json, walletAddress, storageSignature }),
    timeoutMs: SEAL_API_TIMEOUT_MS,
  });

  if (!res.ok) {
    throw new Error(
      await readApiErrorMessage(res, "0G Storage seal failed")
    );
  }

  const data = (await res.json()) as {
    rootHash?: string;
    txHash?: string;
  };

  if (!data.rootHash?.trim()) {
    throw new Error("0G Storage seal returned no root hash");
  }

  return {
    rootHash: data.rootHash,
    txHash: data.txHash ?? "",
  };
}

/**
 * Seal JSON to 0G Storage encrypted to the user's wallet (ECIES).
 * Production: server upload via /api/storage/seal-ghost (avoids browser RPC CORS).
 * Local dev: falls back to direct browser upload when server key is not configured.
 */
export async function sealEciesJsonFromWallet(
  json: Record<string, unknown>
): Promise<BrowserUploadResult> {
  await prepareEciesSealUpload();

  let signer;
  let address: string;
  try {
    ({ signer, address } = await getBrowserStorageSigner("ecies"));
  } catch (e) {
    throw new Error(formatStorageError(e, "Wallet required for 0G Storage seal"));
  }

  let storageSignature: string;
  try {
    storageSignature = await signer.signMessage(storageSignMessage(address));
  } catch (e) {
    throw new Error(formatStorageError(e, "Wallet signature required for 0G Storage"));
  }

  try {
    return await sealViaServerApi(json, address, storageSignature);
  } catch (serverErr) {
    const serverMsg =
      serverErr instanceof Error ? serverErr.message : String(serverErr);

    const canFallback =
      isLocalDevHost() &&
      (serverMsg.includes("OG_STORAGE_PRIVATE_KEY") ||
        serverMsg.includes("not configured") ||
        serverMsg.includes("503"));

    if (!canFallback) {
      throw new Error(formatStorageError(serverErr, "0G Storage seal failed"));
    }

    try {
      return await uploadJsonFromBrowser(json);
    } catch (browserErr) {
      throw new Error(
        [
          `Server seal unavailable: ${serverMsg}`,
          formatStorageError(browserErr, "Browser 0G Storage upload also failed"),
        ].join(" — ")
      );
    }
  }
}