export function formatStorageError(err: unknown, fallback: string): string {
  if (!(err instanceof Error)) return fallback;

  const msg = err.message.trim();
  if (!msg) return fallback;

  const lower = msg.toLowerCase();

  if (lower === "network error" || lower.includes("failed to fetch")) {
    return [
      "0G Storage network request failed from the browser.",
      "Production uses server-side seal — confirm OG_STORAGE_PRIVATE_KEY,",
      "OG_STORAGE_INDEXER_RPC, and OG_CHAIN_RPC_URL on Vercel.",
    ].join(" ");
  }

  if (
    lower.includes("user rejected") ||
    lower.includes("denied") ||
    lower.includes("cancel")
  ) {
    return "Wallet signature cancelled";
  }

  if (lower.includes("og_storage_private_key")) {
    return msg;
  }

  return msg;
}