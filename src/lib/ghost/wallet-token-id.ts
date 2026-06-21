/** Stable cache tokenId derived from wallet when Agentic ID mint is skipped. */
export function walletToTokenId(wallet: string): number {
  const hex = wallet.toLowerCase().replace("0x", "");
  return (parseInt(hex.slice(0, 8), 16) >>> 0) % 2_000_000_000 || 1;
}