export type ComputeEnvStatus = {
  ready: boolean;
  privateKeySet: boolean;
  rpcUrl: string;
  providerOverride: string | null;
  issues: string[];
};

/** Server-only check for 0G Compute configuration (Vercel / Neon production). */
export function getComputeEnvStatus(): ComputeEnvStatus {
  const privateKey = process.env.OG_COMPUTE_PRIVATE_KEY?.trim();
  const rpcUrl =
    process.env.OG_COMPUTE_RPC_URL?.trim() ?? "https://evmrpc.0g.ai";
  const providerOverride =
    process.env.OG_COMPUTE_PROVIDER_ADDRESS?.trim() ?? null;
  const issues: string[] = [];

  if (!privateKey) {
    issues.push(
      "OG_COMPUTE_PRIVATE_KEY is missing (required for live 0G Compute on Vercel)"
    );
  } else if (!privateKey.startsWith("0x")) {
    issues.push("OG_COMPUTE_PRIVATE_KEY must start with 0x");
  }

  return {
    ready: issues.length === 0,
    privateKeySet: !!privateKey,
    rpcUrl,
    providerOverride,
    issues,
  };
}

export function getCreateComputeTimeoutMs(): number {
  const raw = process.env.OG_COMPUTE_CREATE_TIMEOUT_MS;
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  // Vercel Hobby serverless limit is 10s — attempt live compute within that window.
  return 8_000;
}