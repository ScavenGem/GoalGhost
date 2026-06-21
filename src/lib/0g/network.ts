/**
 * 0G Aristotle Mainnet network constants.
 * Env vars override defaults for staging flexibility.
 */
export const OG_NETWORK = {
  name: "0G Aristotle Mainnet",
  chainId: Number(process.env.NEXT_PUBLIC_OG_CHAIN_ID ?? 16661),
  chainRpc:
    process.env.NEXT_PUBLIC_OG_CHAIN_RPC_URL ?? "https://evmrpc.0g.ai",
  storageIndexerRpc:
    process.env.NEXT_PUBLIC_OG_STORAGE_INDEXER_RPC ??
    "https://indexer-storage-turbo.0g.ai",
  chainExplorer: "https://chainscan.0g.ai",
  storageExplorer: "https://storagescan.0g.ai",
} as const;

export function storageScanUrl(rootHash: string): string {
  return `${OG_NETWORK.storageExplorer}/tx/${rootHash}`;
}

export function chainScanAddressUrl(address: string): string {
  return `${OG_NETWORK.chainExplorer}/address/${address}`;
}