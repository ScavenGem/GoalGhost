"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { MotionProvider } from "@/lib/motion";
import { ogAristotle } from "@/lib/0g/chain/config";
import { WalletWarmup } from "@/components/wallet/wallet-warmup";
import { wagmiConfig } from "./config";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 10 * 60_000,
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          initialChain={ogAristotle}
          theme={darkTheme({
            accentColor: "#F4C542",
            accentColorForeground: "#0A1020",
            borderRadius: "medium",
          })}
        >
          <WalletWarmup />
          <MotionProvider>{children}</MotionProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}