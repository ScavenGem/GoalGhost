export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit & { timeoutMs?: number }
): Promise<Response> {
  const { timeoutMs = 60_000, ...fetchInit } = init ?? {};
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...fetchInit, signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`Request timed out after ${Math.round(timeoutMs / 1000)}s`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/** Extract a human-readable message from a failed fetch response or network error. */
export async function readApiErrorMessage(
  res: Response,
  fallback: string
): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string } | null;
    if (data?.error?.trim()) return data.error.trim();
  } catch {
    /* non-JSON body */
  }

  const statusText = res.statusText?.trim();
  if (statusText) return `${fallback} (${res.status} ${statusText})`;
  return `${fallback} (HTTP ${res.status})`;
}

export function formatClientFetchError(err: unknown, fallback: string): string {
  if (err instanceof Error) {
    const msg = err.message.trim();
    if (!msg) return fallback;

    const lower = msg.toLowerCase();
    if (
      lower === "network error" ||
      lower.includes("failed to fetch") ||
      lower.includes("load failed")
    ) {
      return "Request to the server failed. Check your connection and try again.";
    }
    if (
      lower.includes("user rejected") ||
      lower.includes("denied") ||
      lower.includes("cancel")
    ) {
      return "Wallet signature cancelled";
    }
    return msg;
  }
  return fallback;
}