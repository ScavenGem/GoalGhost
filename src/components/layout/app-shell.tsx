"use client";

import { usePathname } from "next/navigation";
import { SidebarNav } from "./sidebar-nav";
import { MobileNav } from "./mobile-nav";
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button";
import { OgLayerBadges } from "@/components/0g/og-layer-badges";
import { GoalGhostLogo } from "@/components/ui/goalghost-logo";
import { PitchBackground } from "@/components/ui/pitch-background";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  return (
    <div className="relative flex min-h-screen bg-[#0A1020] text-foreground">
      <PitchBackground />
      <div className="relative z-10 hidden md:flex md:shrink-0 md:self-stretch">
        <SidebarNav />
      </div>
      <div className="relative z-10 flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/8 px-4 py-3 sm:px-6 md:justify-end md:px-8 md:py-4">
          <div className="flex items-center gap-2 overflow-visible md:hidden">
            <GoalGhostLogo size={40} className="shrink-0" />
            <p className="font-display text-lg text-[#F4C542]">GoalGhost</p>
          </div>
          <WalletConnectButton variant="header" />
        </header>
        <main
          className={
            isHome
              ? "flex-1 px-4 pb-24 sm:px-6 md:px-8 md:pb-8"
              : "flex-1 px-4 py-6 pb-24 sm:px-6 md:px-8 md:py-8 md:pb-8"
          }
        >
          {children}
        </main>
        <footer className="pb-24 md:pb-0">
          <OgLayerBadges variant="footer" />
        </footer>
      </div>
      <MobileNav />
    </div>
  );
}