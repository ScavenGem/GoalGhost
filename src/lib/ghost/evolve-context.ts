import type { GhostApiRecord } from "@/hooks/use-ghost";
import { gatherIdentityContext } from "@/lib/ghost/gather-identity-context";
import type { WalletIdentityProfile } from "@/lib/ghost/identity-distinctness";

function memoryLine(
  memory: NonNullable<GhostApiRecord["memories"]>[number]
): string | null {
  const line = [memory.type, memory.title, memory.content, memory.emotionalTone]
    .filter(Boolean)
    .join(": ");
  return line.length > 0 ? line : null;
}

export type EvolveContext = {
  memoryLines: string[];
  identity: WalletIdentityProfile;
};

/** Collect memories, comments, and wallet-specific identity for evolve prompts. */
export async function gatherEvolveContext(
  walletAddress: string,
  ghost: GhostApiRecord
): Promise<EvolveContext> {
  const { identity, commentSignals } = await gatherIdentityContext(
    walletAddress,
    ghost
  );

  const lines: string[] = [];

  for (const memory of (ghost.memories ?? []).slice(-12)) {
    const line = memoryLine(memory);
    if (line) lines.push(line);
  }

  for (const comment of commentSignals.slice(-6)) {
    const scope = comment.scope === "news" ? "news banter" : "legacy banter";
    lines.push(`${scope}: ${comment.text}`);
  }

  lines.push(`Identity signature: ${identity.journeySignature}`);
  lines.push(`Banter style: ${identity.banterStyle.replace(/_/g, " ")}`);
  lines.push(`Reaction pattern: ${identity.reactionPattern.replace(/_/g, " ")}`);

  if (!lines.length) {
    lines.push("No evolution chapters yet — still becoming.");
  }

  return { memoryLines: lines, identity };
}