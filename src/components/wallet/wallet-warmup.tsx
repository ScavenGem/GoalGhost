"use client";

import { useEffect } from "react";
import { useAccount, useReconnect } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchGhost } from "@/hooks/use-ghost";
import { preloadStorageSdk } from "@/lib/0g/storage/browser-signer";

/**
 * Warms wallet-adjacent resources after connect and during idle time
 * so connect, signing, and storage uploads feel snappier.
 */
export function WalletWarmup() {
  useReconnect();
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isConnected || !address) return;
    void prefetchGhost(queryClient, address);
  }, [isConnected, address, queryClient]);

  useEffect(() => {
    const warmup = () => {
      void preloadStorageSdk();
    };

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(warmup, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }

    const timer = setTimeout(warmup, 1200);
    return () => clearTimeout(timer);
  }, []);

  return null;
}