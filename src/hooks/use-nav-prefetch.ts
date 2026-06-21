"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { prefetchGhost } from "@/hooks/use-ghost";
import { prefetchMatchFeed } from "@/hooks/use-match-feed";
import { prefetchWorldCupNews } from "@/hooks/use-world-cup-news";
import { preloadStorageSdk } from "@/lib/0g/storage/browser-signer";

const GHOST_ROUTES = new Set(["/ghost", "/memories", "/legacy", "/matches"]);
const MATCH_ROUTES = new Set(["/matches", "/"]);
const NEWS_ROUTES = new Set(["/"]);

export function useNavPrefetch() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { address } = useAccount();

  return useCallback(
    (href: string) => {
      router.prefetch(href);

      if (MATCH_ROUTES.has(href)) {
        void prefetchMatchFeed(queryClient);
      }
      if (NEWS_ROUTES.has(href)) {
        void prefetchWorldCupNews(queryClient);
      }
      if (address && GHOST_ROUTES.has(href)) {
        void prefetchGhost(queryClient, address);
      }
      if (href === "/create") {
        void preloadStorageSdk();
        void import("@/lib/0g/storage/upload-browser");
      }
    },
    [address, queryClient, router]
  );
}