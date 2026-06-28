import type { QueryClient } from "@tanstack/react-query";
import {
  ghostQueryKey,
  type GhostApiRecord,
} from "@/hooks/use-ghost";
import { applyEvolutionToGhost } from "@/lib/ghost/evolution";
import type { InteractionEvolutionResult } from "@/lib/ghost/register-interaction-evolution";
import { notifyMemoryAdded } from "@/lib/events/memory-sync";

export function applyClientEvolution(
  queryClient: QueryClient,
  walletAddress: string,
  evolution: InteractionEvolutionResult | null | undefined
) {
  if (!evolution || !walletAddress) return;

  queryClient.setQueryData<GhostApiRecord | null>(
    ghostQueryKey(walletAddress),
    (prev) => {
      if (!prev) return prev;
      const next = applyEvolutionToGhost(prev, {
        memoryType: evolution.memoryType,
        title: evolution.title,
        content: evolution.content,
        emotionalTone: evolution.emotionalTone,
        evolutionDelta: evolution.evolutionDelta,
        confidenceDelta: evolution.confidenceDelta,
        mood: evolution.mood,
        traitDelta: evolution.traitDelta,
      });

      const memories = [
        ...(prev.memories ?? []),
        {
          eventId: evolution.eventId,
          title: evolution.title,
          content: evolution.content,
          emotionalTone: evolution.emotionalTone,
          type: evolution.memoryType,
          occurredAt: new Date().toISOString(),
          evolutionDelta: evolution.evolutionDelta,
        },
      ];

      return { ...next, memories };
    }
  );

  notifyMemoryAdded({ eventId: evolution.eventId });
}