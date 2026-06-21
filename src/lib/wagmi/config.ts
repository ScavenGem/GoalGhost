"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { ogAristotle } from "@/lib/0g/chain/config";
import { OG_NETWORK } from "@/lib/0g/network";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim() ?? "";

if (!walletConnectProjectId || walletConnectProjectId === "demo-project-id") {
  console.warn(
    "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not configured. Set a real WalletConnect project ID."
  );
}

export const wagmiConfig = getDefaultConfig({
  appName: "GoalGhost",
  projectId: walletConnectProjectId,
  chains: [ogAristotle],
  ssr: true,
  transports: {
    [ogAristotle.id]: http(OG_NETWORK.chainRpc, { batch: true }),
  },
});