"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { useGhost } from "@/hooks/use-ghost";

const SEEN_KEY = "goalghost-notifications-seen-at";

function readSeenAt(): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(SEEN_KEY);
  const parsed = raw ? Number(raw) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

export function useSidebarNotifications() {
  const { address, isConnected } = useAccount();
  const { ghost } = useGhost(address);
  const [seenAt, setSeenAt] = useState(0);

  useEffect(() => {
    setSeenAt(readSeenAt());
  }, []);

  const markAsSeen = useCallback(() => {
    const now = Date.now();
    localStorage.setItem(SEEN_KEY, String(now));
    setSeenAt(now);
  }, []);

  const count = useMemo(() => {
    if (!isConnected || !address || !ghost?.memories?.length) return 0;

    const unseen = ghost.memories.filter((memory) => {
      if (!memory.occurredAt) return true;
      const at = new Date(memory.occurredAt).getTime();
      return Number.isFinite(at) ? at > seenAt : true;
    });

    return unseen.length;
  }, [address, ghost?.memories, isConnected, seenAt]);

  return { count, markAsSeen };
}